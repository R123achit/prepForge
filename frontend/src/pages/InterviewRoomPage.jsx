import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { 
  Video, VideoOff, Mic, MicOff, Monitor, MonitorOff, 
  PhoneOff, MessageSquare, Users, Clock, AlertCircle,
  Send, X
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

export default function InterviewRoomPage() {
  const { id: roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // Media refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const dataChannelRef = useRef(null);
  const socketRef = useRef(null);
  const remoteSocketIdRef = useRef(null);
  const isNegotiatingRef = useRef(false); // Prevent duplicate negotiations
  const makingOfferRef = useRef(false); // Track if currently making offer
  const queuedCandidatesRef = useRef([]); // Queue ICE candidates until remote description is set
  
  // State
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [remoteParticipant, setRemoteParticipant] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  
  // ICE servers configuration for WebRTC with TURN servers for better connectivity
  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
      // Free TURN servers for NAT traversal
      {
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      },
      {
        urls: 'turn:openrelay.metered.ca:443',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      },
      {
        urls: 'turn:openrelay.metered.ca:443?transport=tcp',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      }
    ]
  };

  useEffect(() => {
    if (!roomId) {
      setError('Invalid room ID');
      setLoading(false);
      return;
    }
    
    fetchInterviewDetails();
    
    return () => {
      cleanup();
    };
  }, [roomId]);

  useEffect(() => {
    let interval;
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
        if (roomResponse.data?.interview) {
          interviewData = roomResponse.data.interview;
          console.log('Interview found by room endpoint:', interviewData);
        }
      } catch (roomError) {
        console.log('Room endpoint failed, trying other methods...', roomError.response?.status);
      }
      
      // If not found by room endpoint, try by roomId query parameter
      if (!interviewData) {
        try {
          const queryResponse = await api.get(`/live-interviews?roomId=${roomId}`);
          if (queryResponse.data?.interviews?.length > 0) {
            interviewData = queryResponse.data.interviews[0];
            console.log('Interview found by query:', interviewData);
          }
        } catch (queryError) {
          console.log('Query method failed:', queryError);
        }
      }
      
      // Last resort: try treating roomId as actual MongoDB ID
      if (!interviewData) {
        try {
          const idResponse = await api.get(`/live-interviews/${roomId}`);
          if (idResponse.data?.interview) {
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
        if (user && interviewData.candidate && interviewData.interviewer) {
          const isCandidate = user.id === interviewData.candidate.id;
          if (isCandidate && interviewData.interviewer) {
            setRemoteParticipant({
              id: interviewData.interviewer.id,
              name: `${interviewData.interviewer.firstName || ''} ${interviewData.interviewer.lastName || ''}`.trim(),
              role: 'Interviewer'
            });
          } else if (!isCandidate && interviewData.candidate) {
            setRemoteParticipant({
              id: interviewData.candidate.id,
              name: `${interviewData.candidate.firstName || ''} ${interviewData.candidate.lastName || ''}`.trim(),
              role: 'Candidate'
            });
          }
        }
        
        // Initialize media after getting interview details
        await initializeMedia();
        initializeSocket();
      } else {
        console.error('Interview not found after all attempts');
        setError('Interview not found. Please check the interview link or schedule a new interview.');
      }
    } catch (err) {
      console.error('Failed to fetch interview:', err);
      setError(err.response?.data?.error || 'Failed to load interview details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const initializeSocket = () => {
    if (!user || !roomId) return;
    
    // Connect to Socket.IO server with production-safe URL
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const socket = io(backendUrl, {
      transports: ['websocket', 'polling'], // Fallback to polling if websocket fails
      secure: backendUrl.startsWith('https'), // Use secure connection for HTTPS
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      
      // Join the interview room
      socket.emit('join-room', {
        roomId,
        userId: user.id,
        userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'
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

    // Receive existing room users - SECOND USER TO JOIN
    socket.on('room-users', async (participants) => {
      console.log('📊 Room participants:', participants);
      if (participants.length > 0) {
        const existingPeerSocketId = participants[0];
        remoteSocketIdRef.current = existingPeerSocketId;
        console.log('🔄 I am second to join, creating offer to existing peer:', existingPeerSocketId);
        // Second user creates offer to first user
        await createOffer(existingPeerSocketId);
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
      // Reset peer connection for clean reconnection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      isNegotiatingRef.current = false;
      makingOfferRef.current = false;
      queuedCandidatesRef.current = [];
    });

    // Chat messages - only from other participants
    socket.on('chat-message', ({ message, userName, timestamp, senderId }) => {
      // Only add message if it's from someone else (compare socket IDs)
      if (senderId !== socket.id) {
        setMessages(prev => [...prev, {
          sender: userName,
          text: message,
          time: new Date(timestamp).toLocaleTimeString()
        }]);
      }
    });
  };

  const createOffer = async (targetSocketId) => {
    try {
      // Prevent creating multiple offers simultaneously
      if (makingOfferRef.current) {
        console.log('⚠️ Already making offer, skipping');
        return;
      }
      
      if (!peerConnectionRef.current) {
        setupPeerConnection();
      }
      
      const pc = peerConnectionRef.current;
      
      // Only create offer if in stable state or have-remote-offer
      if (pc.signalingState !== 'stable' && pc.signalingState !== 'have-remote-offer') {
        console.log('⚠️ Cannot create offer in state:', pc.signalingState);
        return;
      }
      
      makingOfferRef.current = true;
      const offer = await pc.createOffer();
      
      // Check state again before setting local description
      if (pc.signalingState !== 'stable' && pc.signalingState !== 'have-remote-offer') {
        console.log('⚠️ State changed, aborting offer');
        makingOfferRef.current = false;
        return;
      }
      
      await pc.setLocalDescription(offer);
      
      socketRef.current?.emit('offer', {
        roomId,
        offer,
        targetSocketId
      });
      
      makingOfferRef.current = false;
    } catch (err) {
      console.error('Failed to create offer:', err);
      makingOfferRef.current = false;
    }
  };

  const handleOffer = async (offer, socketId) => {
    try {
      // Prevent handling duplicate offers during negotiation
      if (isNegotiatingRef.current) {
        console.log('⚠️ Already negotiating, queuing offer');
        setTimeout(() => handleOffer(offer, socketId), 100);
        return;
      }
      
      if (!peerConnectionRef.current) {
        setupPeerConnection();
      }
      
      const pc = peerConnectionRef.current;
      
      // Only handle offer if in stable or have-local-offer state
      if (pc.signalingState !== 'stable' && pc.signalingState !== 'have-local-offer') {
        console.log('⚠️ Cannot handle offer in state:', pc.signalingState);
        return;
      }
      
      isNegotiatingRef.current = true;
      
      // If we have a local offer pending, rollback (polite peer pattern)
      if (pc.signalingState === 'have-local-offer') {
        console.log('🔄 Rolling back local offer to handle remote offer');
        await pc.setLocalDescription({ type: 'rollback' });
      }
      
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      
      // Process any queued ICE candidates now that remote description is set
      await processQueuedCandidates();
      
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      socketRef.current?.emit('answer', {
        roomId,
        answer,
        targetSocketId: socketId
      });
      
      isNegotiatingRef.current = false;
    } catch (err) {
      console.error('Failed to handle offer:', err);
      isNegotiatingRef.current = false;
    }
  };

  const handleAnswer = async (answer) => {
    try {
      const pc = peerConnectionRef.current;
      if (!pc) {
        console.log('⚠️ No peer connection for answer');
        return;
      }
      
      // Only accept answer if we're in have-local-offer state
      if (pc.signalingState === 'have-local-offer') {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        console.log('✅ Answer applied, state:', pc.signalingState);
        
        // Process any queued ICE candidates now that remote description is set
        await processQueuedCandidates();
      } else {
        console.log('⚠️ Ignoring answer in state:', pc.signalingState);
      }
    } catch (err) {
      console.error('Failed to handle answer:', err);
    }
  };

  const handleIceCandidate = async (candidate) => {
    try {
      const pc = peerConnectionRef.current;
      if (!pc || !candidate) return;
      
      // Guard: Only add ICE candidates after remote description is set
      if (!pc.remoteDescription) {
        console.log('⚠️ Queuing ICE candidate until remote description is set');
        queuedCandidatesRef.current.push(candidate);
        return;
      }
      
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
      console.log('✅ ICE candidate added');
    } catch (err) {
      console.error('Failed to add ICE candidate:', err);
    }
  };
  
  // Process queued ICE candidates after setRemoteDescription
  const processQueuedCandidates = async () => {
    const pc = peerConnectionRef.current;
    if (!pc || !pc.remoteDescription) return;
    
    const queued = queuedCandidatesRef.current;
    if (queued.length === 0) return;
    
    console.log(`📦 Processing ${queued.length} queued ICE candidates`);
    
    for (const candidate of queued) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error('Failed to add queued ICE candidate:', err);
      }
    }
    
    queuedCandidatesRef.current = [];
    console.log('✅ All queued ICE candidates processed');
  };

  const initializeMedia = async () => {
    try {
      console.log('🎥 Requesting camera and microphone access...');
      
      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support camera/microphone access. Please use Chrome, Firefox, or Safari.');
      }
      
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
      
      console.log('✅ Media stream obtained:', stream.getTracks().map(t => `${t.kind}: ${t.label}`));
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        // Ensure video plays
        localVideoRef.current.play().catch(e => console.error('Video play error:', e));
      }
      setIsInterviewStarted(true);
      console.log('✅ Local video initialized');
    } catch (err) {
      console.error('❌ Failed to get media:', err);
      let errorMessage = 'Failed to access camera/microphone. ';
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage += 'Please allow camera and microphone permissions in your browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage += 'No camera or microphone found. Please connect a device.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage += 'Camera is already in use by another application.';
      } else if (err.name === 'OverconstrainedError') {
        errorMessage += 'Camera does not meet the required specifications.';
      } else if (err.name === 'SecurityError') {
        errorMessage += 'Camera access is blocked. Please use HTTPS.';
      } else {
        errorMessage += err.message || 'Unknown error occurred.';
      }
      
      setError(errorMessage);
      setConnectionStatus('disconnected');
      alert(errorMessage);
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
    
    // Monitor signaling state changes for debugging
    pc.onsignalingstatechange = () => {
      console.log('📡 Signaling state:', pc.signalingState);
      // Reset negotiation flags when stable
      if (pc.signalingState === 'stable') {
        isNegotiatingRef.current = false;
        makingOfferRef.current = false;
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
    if (!isScreenSharing) {
      try {
        // Robust error handling for getDisplayMedia
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: 'always',
            displaySurface: 'monitor'
          },
          audio: false
        });
        
        const screenTrack = screenStream.getVideoTracks()[0];
        
        if (!screenTrack) {
          throw new Error('No screen track available');
        }
        
        // Replace video track in peer connection
        if (peerConnectionRef.current && localStreamRef.current) {
          const sender = peerConnectionRef.current.getSenders().find(s => s.track?.kind === 'video');
          if (sender) {
            await sender.replaceTrack(screenTrack);
          }
        }
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        
        // Auto-stop when user stops sharing via browser UI
        screenTrack.onended = () => {
          stopScreenShare();
        };
        
        setIsScreenSharing(true);
      } catch (err) {
        console.error('Screen share error:', err);
        
        // User-friendly error messages
        if (err.name === 'NotAllowedError') {
          alert('Screen sharing permission denied. Please allow screen sharing to continue.');
        } else if (err.name === 'NotFoundError') {
          alert('No screen available to share.');
        } else if (err.name === 'NotSupportedError') {
          alert('Screen sharing is not supported in this browser.');
        } else {
          alert('Failed to start screen sharing. Please try again.');
        }
      }
    } else {
      stopScreenShare();
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
    if (chatInput.trim() && socketRef.current && user) {
      const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
      const messageText = chatInput.trim();
      
      // Add message locally immediately for instant feedback
      setMessages(prev => [...prev, {
        sender: 'You',
        text: messageText,
        time: new Date().toLocaleTimeString()
      }]);
      
      // Send to other participants via socket with sender ID
      socketRef.current.emit('chat-message', {
        roomId,
        message: messageText,
        userName,
        senderId: socketRef.current.id
      });
      
      setChatInput('');
    }
  };

  const endInterview = async () => {
    try {
      if (interview?.id) {
        await api.put(`/live-interviews/${interview.id}/complete`);
      }
    } catch (err) {
      console.error('Failed to end interview:', err);
    } finally {
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
      peerConnectionRef.current = null;
    }
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    // Reset negotiation flags and queues
    isNegotiatingRef.current = false;
    makingOfferRef.current = false;
    queuedCandidatesRef.current = [];
  };

  const formatTime = (seconds) => {
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
                {interview?.interviewType || 'Interview'}
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
      <div className="flex-1 flex overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 relative bg-black">
          {/* Remote Video (Large) */}
          <div className="absolute inset-0">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-contain bg-black"
            />
            {!remoteParticipant && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="text-center">
                  <Users className="w-20 h-20 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-300 text-xl font-medium">Waiting for other participant...</p>
                  <p className="text-gray-500 text-sm mt-2">They will join shortly</p>
                </div>
              </div>
            )}
            {remoteParticipant && (
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-gray-700">
                <p className="text-white font-semibold">{remoteParticipant.name}</p>
                <p className="text-gray-300 text-xs">{remoteParticipant.role}</p>
              </div>
            )}
          </div>

          {/* Local Video (Small - Picture in Picture) */}
          <div className="absolute bottom-6 right-6 w-72 h-52 bg-gray-900 rounded-xl overflow-hidden shadow-2xl border-2 border-gray-600 z-10">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover mirror"
            />
            <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-md">
              <p className="text-white text-xs font-medium">You ({user?.firstName || 'User'})</p>
            </div>
            {!isVideoOn && (
              <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                  <VideoOff className="w-16 h-16 text-gray-600 mb-2" />
                  <p className="text-gray-400 text-sm">Camera Off</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="w-96 bg-gray-900 border-l border-gray-800 flex flex-col shadow-2xl">
            <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between bg-gray-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-600 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-white font-semibold text-lg">Chat</h3>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="text-gray-400 hover:text-white transition p-2 hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-700 mb-4" />
                  <p className="text-gray-500 text-sm">No messages yet</p>
                  <p className="text-gray-600 text-xs mt-1">Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[75%]">
                      <div className={`rounded-2xl px-4 py-2 ${
                        msg.sender === 'You' 
                          ? 'bg-green-600 text-white rounded-br-sm' 
                          : 'bg-gray-800 text-white rounded-bl-sm'
                      }`}>
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                      </div>
                      <p className="text-gray-600 text-xs mt-1 px-2">
                        {msg.sender} • {msg.time}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-4 border-t border-gray-800 bg-gray-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-900 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-700"
                />
                <button
                  onClick={sendMessage}
                  disabled={!chatInput.trim()}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all duration-200"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="bg-gray-900 border-t border-gray-800 px-6 py-5 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full transition-all duration-200 ${
              isAudioOn 
                ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
            title={isAudioOn ? 'Mute' : 'Unmute'}
          >
            {isAudioOn ? (
              <Mic className="w-6 h-6" />
            ) : (
              <MicOff className="w-6 h-6" />
            )}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-all duration-200 ${
              isVideoOn 
                ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
            title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
          >
            {isVideoOn ? (
              <Video className="w-6 h-6" />
            ) : (
              <VideoOff className="w-6 h-6" />
            )}
          </button>

          <button
            onClick={toggleScreenShare}
            className={`p-4 rounded-full transition-all duration-200 ${
              isScreenSharing 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-800 hover:bg-gray-700 text-white'
            }`}
            title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
          >
            {isScreenSharing ? (
              <MonitorOff className="w-6 h-6" />
            ) : (
              <Monitor className="w-6 h-6" />
            )}
          </button>

          <button
            onClick={() => setShowChat(!showChat)}
            className={`p-4 rounded-full transition-all duration-200 relative ${
              showChat 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-800 hover:bg-gray-700 text-white'
            }`}
            title="Toggle chat"
          >
            <MessageSquare className="w-6 h-6" />
            {messages.length > 0 && !showChat && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {messages.length}
              </span>
            )}
          </button>

          <div className="w-px h-10 bg-gray-700 mx-3" />

          <button
            onClick={endInterview}
            className="bg-red-600 hover:bg-red-700 px-8 py-4 rounded-full flex items-center gap-3 transition-all duration-200 shadow-lg hover:shadow-red-600/50"
            title="End interview"
          >
            <PhoneOff className="w-6 h-6 text-white" />
            <span className="text-white font-semibold">End Call</span>
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
