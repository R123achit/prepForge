import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Video, VideoOff, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function InterviewVideo() {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [aiResponse, setAiResponse] = useState('');
  
  const userVideoRef = useRef();
  const avatarVideoRef = useRef();
  const wsRef = useRef();
  const mediaRecorderRef = useRef();
  const streamRef = useRef();
  const audioChunksRef = useRef([]);

  useEffect(() => {
    initializeInterview();
    return () => cleanup();
  }, []);

  const initializeInterview = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      streamRef.current = stream;
      if (userVideoRef.current) {
        userVideoRef.current.srcObject = stream;
      }

      // Setup WebSocket connection
      setupWebSocket();
      
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Failed to initialize interview:', error);
      setConnectionStatus('error');
    }
  };

  const setupWebSocket = () => {
    import('socket.io-client').then(({ io }) => {
      wsRef.current = io('http://localhost:8000/interview');

      wsRef.current.on('connect', () => {
        console.log('Socket.IO connected');
        setConnectionStatus('connected');
        
        // Start interview
        wsRef.current.emit('interview_message', {
          type: 'start_interview',
          data: { interviewType: 'general' }
        });
      });

      wsRef.current.on('avatar_response', handleAvatarResponse);
      wsRef.current.on('text_response', handleTextResponse);
      wsRef.current.on('interview_error', handleError);

      wsRef.current.on('disconnect', () => {
        console.log('Socket.IO disconnected');
        setConnectionStatus('disconnected');
      });

      wsRef.current.on('connect_error', (error) => {
        console.error('Socket.IO error:', error);
        setConnectionStatus('error');
      });
    });
  };

  const handleAvatarResponse = (data) => {
    setAiResponse(data.text);
    playAvatarVideo(data.videoUrl);
  };

  const handleTextResponse = (data) => {
    setAiResponse(data.text);
  };

  const handleError = (data) => {
    console.error('Server error:', data.message);
  };

  const playAvatarVideo = (videoUrl) => {
    if (avatarVideoRef.current && videoUrl) {
      avatarVideoRef.current.src = videoUrl;
      avatarVideoRef.current.play().catch(console.error);
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    const audioStream = new MediaStream([
      streamRef.current.getAudioTracks()[0]
    ]);

    mediaRecorderRef.current = new MediaRecorder(audioStream, {
      mimeType: 'audio/webm;codecs=opus'
    });

    audioChunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      sendAudioToServer(audioBlob);
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendAudioToServer = async (audioBlob) => {
    if (!wsRef.current || !wsRef.current.connected) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64Audio = reader.result.split(',')[1];
      wsRef.current.emit('interview_message', {
        type: 'audio_chunk',
        data: base64Audio
      });
    };
    reader.readAsDataURL(audioBlob);
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOn(videoTrack.enabled);
    }
  };

  const endInterview = () => {
    cleanup();
    navigate('/dashboard');
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (wsRef.current) {
      wsRef.current.disconnect();
    }
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.6, 0.3, 0.6],
          }}
          transition={{ duration: 4, repeat: Infinity, delay: 2 }}
        />
      </div>

      {/* User Video - Left Side */}
      <div className="flex-1 relative z-10">
        <div className="glass-card m-4 h-[calc(100vh-2rem)] overflow-hidden">
          <video
            ref={userVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover rounded-2xl"
          />
          {!isVideoOn && (
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-blue-900/50 backdrop-blur-sm flex items-center justify-center rounded-2xl">
              <div className="text-center">
                <VideoOff className="w-20 h-20 text-white/60 mx-auto mb-4" />
                <p className="text-white/80 text-lg">Camera Off</p>
              </div>
            </div>
          )}
          
          {/* User Video Overlay */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-6 left-6 glass-card px-4 py-2"
          >
            <span className="text-white font-medium">You</span>
          </motion.div>
        </div>
      </div>

      {/* AI Avatar - Right Side */}
      <div className="flex-1 relative z-10">
        <div className="glass-card m-4 h-[calc(100vh-2rem)] overflow-hidden bg-gradient-to-br from-purple-500/10 to-blue-500/10">
          <video
            ref={avatarVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover rounded-2xl"
          />
          
          {/* Avatar Overlay */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-6 right-6 glass-card px-4 py-2"
          >
            <span className="text-white font-medium">AI Interviewer</span>
          </motion.div>

          {/* AI Response Text */}
          {aiResponse && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.9 }}
              className="absolute bottom-24 left-6 right-6 bg-slate-900/95 backdrop-blur-2xl border border-slate-600/50 rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">AI</span>
                </div>
                <p className="text-white leading-relaxed font-medium">{aiResponse}</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Controls Overlay - Floating */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-4 lg:bottom-8 left-0 right-0 flex justify-center z-20"
      >
        <div className="flex justify-center items-center gap-3 lg:gap-6 bg-black/40 backdrop-blur-md rounded-full px-4 lg:px-8 py-2 lg:py-4">
          {/* Record Button */}
          <motion.button
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`w-12 lg:w-18 h-12 lg:h-18 rounded-full flex items-center justify-center transition-all ${
              isRecording 
                ? 'bg-red-500 animate-pulse' 
                : 'bg-white/20 hover:bg-white/30'
            }`}
          >
            {isRecording ? <MicOff className="w-5 lg:w-8 h-5 lg:h-8 text-white" /> : <Mic className="w-5 lg:w-8 h-5 lg:h-8 text-white" />}
          </motion.button>

          {/* Video Toggle */}
          <motion.button
            onClick={toggleVideo}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`w-10 lg:w-14 h-10 lg:h-14 rounded-full flex items-center justify-center transition-all ${
              isVideoOn ? 'bg-white/20 hover:bg-white/30' : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            {isVideoOn ? <Video className="w-4 lg:w-6 h-4 lg:h-6 text-white" /> : <VideoOff className="w-4 lg:w-6 h-4 lg:h-6 text-white" />}
          </motion.button>

          {/* End Interview */}
          <motion.button
            onClick={endInterview}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-10 lg:w-14 h-10 lg:h-14 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all"
          >
            <Phone className="w-4 lg:w-6 h-4 lg:h-6 text-white rotate-[135deg]" />
          </motion.button>
        </div>
      </motion.div>


    </div>
  );
}