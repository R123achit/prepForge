import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { 
  Video, VideoOff, Mic, MicOff, Monitor, MonitorOff, 
  PhoneOff, MessageSquare, Users, Clock, AlertCircle,
  Send, X
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

interface Participant {
  id: string;
  name: string;
  role: string;
  stream?: MediaStream;
}

export default function InterviewRoomPage() {
  const { id: roomId } = useParams(); // Route param is 'id' but we use it as roomId
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // Media refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const remoteSocketIdRef = useRef<string | null>(null);
  
  // State
  const [interview, setInterview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Array<{sender: string, text: string, time: string}>>([]);
  const [chatInput, setChatInput] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [remoteParticipant, setRemoteParticipant] = useState<Participant | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  
  // ICE servers configuration for WebRTC
  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
    ]
  };

  useEffect(() => {
    fetchInterviewDetails();
    return () => {
      cleanup();
    };
  }, [roomId]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isInterviewStarted) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isInterviewStarted]);

  const fetchInterviewDetails = async () => {
    try {
      console.log('Fetching interview with roomId:', roomId);
      
      let interviewData = null;
      
      // Try to fetch using the dedicated room endpoint first
      try {
        const roomResponse = await api.get(`/live-interviews/room/${roomId}`);
        if (roomResponse.data.interview) {
          interviewData = roomResponse.data.interview;
          console.log('Interview found by room endpoint:', interviewData);
        }
      } catch (roomError: any) {
        console.log('Room endpoint failed, trying other methods...', roomError.response?.status);
      }
      
      // If not found by room endpoint, try by roomId query parameter
      if (!interviewData) {
        try {
          const queryResponse = await api.get(`/live-interviews?roomId=${roomId}`);
          if (queryResponse.data.interviews && queryResponse.data.interviews.length > 0) {
            interviewData = queryResponse.data.interviews[0];
            console.log('Interview found by query:', interviewData);
          }
        } catch (queryError) {
          console.log('Query method failed:', queryError);
        }
      }
      
      // Last resort: try treating roomId as an actual MongoDB ID
      if (!interviewData) {
        try {
          const idResponse = await api.get(`/live-interviews/${roomId}`);
          if (idResponse.data.interview) {
            interviewData = idResponse.data.interview;
            console.log('Interview found by ID:', interviewData);
          }
        } catch (idError) {
          console.log('ID lookup also failed:', idError);
        }
      }
      
      if (interviewData) {
        setInterview(interviewData);
        
        // Determine remote participant
        const isCandidate = user?.id === interviewData.candidate?.id;
        if (isCandidate && interviewData.interviewer) {
          setRemoteParticipant({
            id: interviewData.interviewer.id,
            name: `${interviewData.interviewer.firstName} ${interviewData.interviewer.lastName}`,
            role: 'Interviewer'
          });
        } else if (!isCandidate && interviewData.candidate) {
          setRemoteParticipant({
            id: interviewData.candidate.id,
            name: `${interviewData.candidate.firstName} ${interviewData.candidate.lastName}`,
            role: 'Candidate'
          });
        }
        
        // Initialize media after getting interview details
        await initializeMedia();
        initializeSocket();
      } else {
        console.error('Interview not found after all attempts');
        setError('Interview not found. Please check the interview link or schedule a new interview.');
      }
    } catch (err: any) {
      console.error('Failed to fetch interview:', err);
      setError(err.response?.data?.error || 'Failed to load interview details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const initializeSocket = () => {
    // Connect to Socket.IO server
    const socket = io('http://localhost:8000');
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      
      // Join the interview room
      socket.emit('join-room', {
        roomId,
        userId: user?.id,
        userName: `${user?.firstName} ${user?.lastName}`
      });
    });

    // When another user joins
    socket.on('user-joined', async ({ userId, userName, socketId }) => {
      console.log(`👤 ${userName} joined the room`);
      remoteSocketIdRef.current = socketId;
      setRemoteParticipant({
        id: userId,
        name: userName,
        role: userId === interview?.interviewer?.id ? 'Interviewer' : 'Candidate'
      });
      
      // Create and send offer to the new user
      await createOffer(socketId);
    });

    // Receive existing room users
    socket.on('room-users', async (participants: string[]) => {
      console.log('📊 Room participants:', participants);
      if (participants.length > 0) {
        remoteSocketIdRef.current = participants[0];
        // Wait for offer from the existing user
      }
    });

    // Receive WebRTC offer
    socket.on('offer', async ({ offer, socketId }) => {
      console.log('📥 Received offer from:', socketId);
      remoteSocketIdRef.current = socketId;
      await handleOffer(offer, socketId);
    });

    // Receive WebRTC answer
    socket.on('answer', async ({ answer }) => {
      console.log('📥 Received answer');
      await handleAnswer(answer);
    });

    // Receive ICE candidate
    socket.on('ice-candidate', async ({ candidate }) => {
      console.log('🧊 Received ICE candidate');
      await handleIceCandidate(candidate);
    });

    // User left
    socket.on('user-left', ({ socketId }) => {
      console.log('❌ User left:', socketId);
      setRemoteParticipant(null);
      setConnectionStatus('connecting');
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    });

    // Chat messages
    socket.on('chat-message', ({ message, userName, timestamp }) => {
      setMessages(prev => [...prev, {
        sender: userName,
        text: message,
        time: new Date(timestamp).toLocaleTimeString()
      }]);
    });
  };

  const createOffer = async (targetSocketId: string) => {
    if (!peerConnectionRef.current) {
      setupPeerConnection();
    }
    
    const pc = peerConnectionRef.current!;
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    
    socketRef.current?.emit('offer', {
      roomId,
      offer,
      targetSocketId
    });
  };

  const handleOffer = async (offer: RTCSessionDescriptionInit, socketId: string) => {
    if (!peerConnectionRef.current) {
      setupPeerConnection();
    }
    
    const pc = peerConnectionRef.current!;
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    
    socketRef.current?.emit('answer', {
      roomId,
      answer,
      targetSocketId: socketId
    });
  };

  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    const pc = peerConnectionRef.current;
    if (pc && pc.signalingState !== 'stable') {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    }
  };

  const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
    const pc = peerConnectionRef.current;
    if (pc) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
  };

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      // Don't set to 'connected' yet - wait for peer connection
      setIsInterviewStarted(true);
    } catch (err) {
      console.error('Failed to get media:', err);
      setError('Failed to access camera/microphone. Please check permissions.');
      setConnectionStatus('disconnected');
    }
  };

  const setupPeerConnection = () => {
    const pc = new RTCPeerConnection(iceServers);
    peerConnectionRef.current = pc;

    // Add local stream tracks to peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        if (localStreamRef.current) {
          pc.addTrack(track, localStreamRef.current);
        }
      });
    }

    // Handle incoming remote stream
    pc.ontrack = (event) => {
      console.log('📹 Received remote track');
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setConnectionStatus('connected');
      }
    };

    // Setup data channel for chat
    const dataChannel = pc.createDataChannel('chat');
    dataChannelRef.current = dataChannel;
    
    dataChannel.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        setMessages(prev => [...prev, message]);
      } catch (e) {
        console.error('Failed to parse message:', e);
      }
    };

    pc.ondatachannel = (event) => {
      const channel = event.channel;
      dataChannelRef.current = channel;
      channel.onmessage = (e) => {
        try {
          const message = JSON.parse(e.data);
          setMessages(prev => [...prev, message]);
        } catch (err) {
          console.error('Failed to parse message:', err);
        }
      };
    };

    // Handle ICE candidates - send via Socket.IO
    pc.onicecandidate = (event) => {
      if (event.candidate && remoteSocketIdRef.current) {
        console.log('🧊 Sending ICE candidate');
        socketRef.current?.emit('ice-candidate', {
          roomId,
          candidate: event.candidate,
          targetSocketId: remoteSocketIdRef.current
        });
      }
    };

    // Connection state monitoring
    pc.onconnectionstatechange = () => {
      console.log('🔗 Connection state:', pc.connectionState);
      if (pc.connectionState === 'connected') {
        setConnectionStatus('connected');
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setConnectionStatus('disconnected');
      } else if (pc.connectionState === 'connecting') {
        setConnectionStatus('connecting');
      }
    };
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false
        } as any);
        
        const screenTrack = screenStream.getVideoTracks()[0];
        
        if (peerConnectionRef.current && localStreamRef.current) {
          const sender = peerConnectionRef.current.getSenders().find(s => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(screenTrack);
          }
        }
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        
        screenTrack.onended = () => {
          stopScreenShare();
        };
        
        setIsScreenSharing(true);
      } else {
        stopScreenShare();
      }
    } catch (err) {
      console.error('Failed to share screen:', err);
      alert('Failed to start screen sharing. Please check permissions.');
    }
  };

  const stopScreenShare = () => {
    if (localStreamRef.current && peerConnectionRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      const sender = peerConnectionRef.current.getSenders().find(s => s.track?.kind === 'video');
      if (sender && videoTrack) {
        sender.replaceTrack(videoTrack);
      }
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
    }
    setIsScreenSharing(false);
  };

  const sendMessage = () => {
    if (chatInput.trim() && socketRef.current) {
      const userName = `${user?.firstName} ${user?.lastName}` || 'You';
      
      socketRef.current.emit('chat-message', {
        roomId,
        message: chatInput,
        userName
      });
      
      setChatInput('');
    }
  };

  const endInterview = async () => {
    try {
      if (interview) {
        await api.put(`/live-interviews/${interview.id}/complete`);
      }
      cleanup();
      navigate('/live-interview');
    } catch (err) {
      console.error('Failed to end interview:', err);
      cleanup();
      navigate('/live-interview');
    }
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Connecting to interview room...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Connection Error</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/live-interview')}
            className="btn btn-primary"
          >
            Back to Interviews
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Video className="w-6 h-6 text-green-500" />
            <div>
              <h1 className="text-white font-semibold text-lg">
                {interview?.topic || 'Interview Session'}
              </h1>
              <p className="text-gray-400 text-sm">
                {interview?.interviewType} Interview
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-gray-300">
              <Clock className="w-5 h-5" />
              <span className="font-mono text-lg">{formatTime(elapsedTime)}</span>
            </div>
            
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500/20 text-green-400' :
              connectionStatus === 'connecting' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' :
                connectionStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' :
                'bg-red-400'
              }`} />
              <span className="text-sm font-medium capitalize">{connectionStatus}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 p-4 flex flex-col gap-4">
          {/* Remote Video (Large) */}
          <div className="flex-1 bg-gray-800 rounded-lg overflow-hidden relative">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {!remoteParticipant && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <div className="text-center">
                  <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">Waiting for other participant...</p>
                  <p className="text-gray-500 text-sm mt-2">They will join shortly</p>
                </div>
              </div>
            )}
            {remoteParticipant && (
              <div className="absolute bottom-4 left-4 bg-gray-900/80 backdrop-blur-sm px-4 py-2 rounded-lg">
                <p className="text-white font-medium">{remoteParticipant.name}</p>
                <p className="text-gray-400 text-sm">{remoteParticipant.role}</p>
              </div>
            )}
          </div>

          {/* Local Video (Small - Picture in Picture) */}
          <div className="absolute bottom-24 right-8 w-64 h-48 bg-gray-800 rounded-lg overflow-hidden shadow-2xl border-2 border-gray-700">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover mirror"
            />
            <div className="absolute bottom-2 left-2 bg-gray-900/80 backdrop-blur-sm px-3 py-1 rounded text-sm text-white">
              You ({user?.firstName})
            </div>
            {!isVideoOn && (
              <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                <VideoOff className="w-12 h-12 text-gray-500" />
              </div>
            )}
          </div>
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
            <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-500" />
                <h3 className="text-white font-semibold">Chat</h3>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">
                  No messages yet. Start the conversation!
                </p>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} className={`${msg.sender === 'You' ? 'text-right' : ''}`}>
                    <div className={`inline-block max-w-[80%] ${
                      msg.sender === 'You' ? 'bg-green-600' : 'bg-gray-700'
                    } rounded-lg px-3 py-2`}>
                      <p className="text-white text-sm">{msg.text}</p>
                    </div>
                    <p className="text-gray-500 text-xs mt-1">
                      {msg.sender} • {msg.time}
                    </p>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-4 border-t border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!chatInput.trim()}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white p-2 rounded-lg transition"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="bg-gray-800 border-t border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full transition ${
              isAudioOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
            }`}
            title={isAudioOn ? 'Mute' : 'Unmute'}
          >
            {isAudioOn ? (
              <Mic className="w-6 h-6 text-white" />
            ) : (
              <MicOff className="w-6 h-6 text-white" />
            )}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition ${
              isVideoOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
            }`}
            title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
          >
            {isVideoOn ? (
              <Video className="w-6 h-6 text-white" />
            ) : (
              <VideoOff className="w-6 h-6 text-white" />
            )}
          </button>

          <button
            onClick={toggleScreenShare}
            className={`p-4 rounded-full transition ${
              isScreenSharing ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
          >
            {isScreenSharing ? (
              <MonitorOff className="w-6 h-6 text-white" />
            ) : (
              <Monitor className="w-6 h-6 text-white" />
            )}
          </button>

          <button
            onClick={() => setShowChat(!showChat)}
            className={`p-4 rounded-full transition ${
              showChat ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title="Toggle chat"
          >
            <MessageSquare className="w-6 h-6 text-white" />
          </button>

          <div className="w-px h-12 bg-gray-700 mx-2" />

          <button
            onClick={endInterview}
            className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-full flex items-center gap-2 transition"
            title="End interview"
          >
            <PhoneOff className="w-6 h-6 text-white" />
            <span className="text-white font-medium">End Interview</span>
          </button>
        </div>
      </div>

      <style>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
}
