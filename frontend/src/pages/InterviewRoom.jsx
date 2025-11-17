import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Video, VideoOff, Mic, MicOff, MessageCircle, Phone, Users, Monitor, MonitorOff, CheckCircle, User } from 'lucide-react'
import { io } from 'socket.io-client'
import { liveInterviewAPI, authAPI } from '../services/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export default function InterviewRoom() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [socket, setSocket] = useState(null)
  const [localStream, setLocalStream] = useState(null)
  const [remoteStream, setRemoteStream] = useState(null)
  const [peerConnection, setPeerConnection] = useState(null)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isAudioOn, setIsAudioOn] = useState(true)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [participants, setParticipants] = useState([])
  const [interview, setInterview] = useState(null)
  const [otherParticipant, setOtherParticipant] = useState(null)
  const [showChat, setShowChat] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [screenStream, setScreenStream] = useState(null)
  const [isCallEnded, setIsCallEnded] = useState(false)
  const [connectionState, setConnectionState] = useState('new')
  const [iceConnectionState, setIceConnectionState] = useState('new')
  const [showDebug, setShowDebug] = useState(false)

  const localVideoRef = useRef()
  const remoteVideoRef = useRef()

  useEffect(() => {
    initializeRoom()
    return () => cleanup()
  }, [roomId])

  const initializeRoom = async () => {
    try {
      // Get interview details
      const { data } = await liveInterviewAPI.getByRoomId(roomId)
      setInterview(data)

      // Initialize socket
      const newSocket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000')
      setSocket(newSocket)

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      setLocalStream(stream)
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      // Join room
      newSocket.emit('join-room', {
        roomId,
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`
      })

      // Socket event listeners
      newSocket.on('user-joined', ({ userId, userName, socketId }) => {
        console.log('User joined event:', { userId, userName, socketId })
        if (userId !== user.id) {
          toast.success(`${userName} joined the room`)
          setParticipants(prev => {
            // Avoid duplicates
            const exists = prev.find(p => p.userId === userId)
            if (!exists) {
              return [...prev, { userId, userName, socketId }]
            }
            return prev
          })
          // Set other participant for profile display
          setOtherParticipant({ userId, userName })
        }
      })

      newSocket.on('user-left', ({ socketId }) => {
        setParticipants(prev => prev.filter(p => p.socketId !== socketId))
      })

      newSocket.on('chat-message', ({ message, userName, timestamp, senderId }) => {
        if (senderId !== user.id) {
          setMessages(prev => [...prev, { message, userName, timestamp, senderId }])
        }
      })

      // WebRTC setup
      setupWebRTC(newSocket, stream)

    } catch (error) {
      toast.error('Failed to join room')
      navigate('/live-interview')
    }
  }

  const setupWebRTC = (socket, stream) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    })

    // Add local stream tracks
    stream.getTracks().forEach(track => {
      console.log('Adding track:', track.kind, track.enabled)
      pc.addTrack(track, stream)
    })

    pc.ontrack = (event) => {
      console.log('Received remote stream:', event.streams[0])
      const remoteStream = event.streams[0]
      setRemoteStream(remoteStream)
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream
        remoteVideoRef.current.play().catch(console.error)
      }
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Sending ICE candidate')
        socket.emit('ice-candidate', {
          roomId,
          candidate: event.candidate,
          targetSocketId: null // broadcast to room
        })
      }
    }

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState)
      setConnectionState(pc.connectionState)
      if (pc.connectionState === 'connected') {
        console.log('WebRTC connection established successfully')
      } else if (pc.connectionState === 'failed') {
        console.error('WebRTC connection failed')
        // Attempt to restart ICE
        pc.restartIce()
      }
    }

    pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', pc.iceConnectionState)
      setIceConnectionState(pc.iceConnectionState)
    }

    // Handle when another user joins - create offer
    socket.on('user-joined', async ({ socketId, userId }) => {
      console.log('User joined, creating offer for:', socketId, userId)
      // Only create offer if this is not the same user
      if (userId !== user.id) {
        try {
          const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
          })
          await pc.setLocalDescription(offer)
          socket.emit('offer', { roomId, offer, targetSocketId: socketId })
        } catch (error) {
          console.error('Error creating offer:', error)
        }
      }
    })

    socket.on('offer', async ({ offer, socketId }) => {
      console.log('Received offer from:', socketId)
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer))
        const answer = await pc.createAnswer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        })
        await pc.setLocalDescription(answer)
        console.log('Sending answer to:', socketId)
        socket.emit('answer', { roomId, answer, targetSocketId: socketId })
      } catch (error) {
        console.error('Error handling offer:', error)
      }
    })

    socket.on('answer', async ({ answer }) => {
      console.log('Received answer')
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer))
      } catch (error) {
        console.error('Error handling answer:', error)
      }
    })

    socket.on('ice-candidate', async ({ candidate }) => {
      console.log('Received ICE candidate')
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate))
      } catch (error) {
        console.error('Error adding ICE candidate:', error)
      }
    })

    setPeerConnection(pc)
  }

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      videoTrack.enabled = !videoTrack.enabled
      setIsVideoOn(videoTrack.enabled)
    }
  }

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      audioTrack.enabled = !audioTrack.enabled
      setIsAudioOn(audioTrack.enabled)
    }
  }

  const sendMessage = () => {
    if (newMessage.trim() && socket) {
      const messageData = {
        roomId,
        message: newMessage,
        userName: `${user.firstName} ${user.lastName}`,
        senderId: user.id
      }
      socket.emit('chat-message', messageData)
      setMessages(prev => [...prev, { ...messageData, timestamp: Date.now() }])
      setNewMessage('')
    }
  }

  const leaveRoom = async () => {
    try {
      // Mark interview as completed
      if (interview?.id) {
        await liveInterviewAPI.complete(interview.id, {
          feedback: { callEndedBy: user.id, endTime: new Date().toISOString() }
        })
      }
      setIsCallEnded(true)
      
      // Show completion screen for 3 seconds then navigate
      setTimeout(() => {
        cleanup()
        navigate('/live-interview')
      }, 3000)
    } catch (error) {
      console.error('Error ending interview:', error)
      cleanup()
      navigate('/live-interview')
    }
  }

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
        setScreenStream(stream)
        setIsScreenSharing(true)
        
        // Replace video track in peer connection
        if (peerConnection && localStream) {
          const videoTrack = stream.getVideoTracks()[0]
          const sender = peerConnection.getSenders().find(s => s.track?.kind === 'video')
          if (sender) {
            await sender.replaceTrack(videoTrack)
          }
        }
        
        // Handle screen share end
        stream.getVideoTracks()[0].onended = () => {
          stopScreenShare()
        }
      } else {
        stopScreenShare()
      }
    } catch (error) {
      console.error('Screen share error:', error)
      toast.error('Failed to start screen share')
    }
  }

  const stopScreenShare = async () => {
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop())
      setScreenStream(null)
    }
    setIsScreenSharing(false)
    
    // Switch back to camera
    if (peerConnection && localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      const sender = peerConnection.getSenders().find(s => s.track?.kind === 'video')
      if (sender && videoTrack) {
        await sender.replaceTrack(videoTrack)
      }
    }
  }

  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
    }
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop())
    }
    if (peerConnection) {
      peerConnection.close()
    }
    if (socket) {
      socket.disconnect()
    }
  }

  if (isCallEnded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.2),rgba(255,255,255,0))]" />
          <motion.div
            className="absolute top-20 left-20 w-72 h-72 bg-green-500/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center text-white relative z-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-500/30"
          >
            <CheckCircle className="w-12 h-12 text-white" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-5xl font-bold mb-4 gradient-text"
          >
            Interview Completed
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-xl text-gray-300 mb-2"
          >
            Thank you for participating!
          </motion.p>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-gray-400"
          >
            Redirecting to dashboard...
          </motion.p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
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

      <div className="relative w-full z-10">
        {/* Premium Video Interface */}
        <div className="relative h-screen overflow-hidden">
          {/* Main Video (Remote) */}
          <div className="absolute inset-4">
            <div className="glass-card h-full overflow-hidden">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover rounded-2xl"
              />
              {!remoteStream && (
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-blue-900/50 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="w-32 h-32 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm border border-white/20 overflow-hidden"
                  >
                    {otherParticipant ? (
                      <img 
                        src={authAPI.getProfilePhoto(otherParticipant.userId)} 
                        alt={otherParticipant.userName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <User className="w-16 h-16 text-white/60" style={{ display: otherParticipant ? 'none' : 'block' }} />
                  </motion.div>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-white text-xl font-medium mb-2"
                  >
                    {otherParticipant ? `Connecting to ${otherParticipant.userName}...` : 'Waiting for participant...'}
                  </motion.p>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-gray-400"
                  >
                    {otherParticipant ? 'Setting up video connection...' : 'Connecting to interview room...'}
                  </motion.p>
                </div>
              )}
              
              {/* Remote participant info overlay */}
              {remoteStream && otherParticipant && (
                <div className="absolute top-4 left-4 glass-card px-3 py-2 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                    <img 
                      src={authAPI.getProfilePhoto(otherParticipant.userId)} 
                      alt={otherParticipant.userName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                    <User className="w-4 h-4 text-white" style={{ display: 'none' }} />
                  </div>
                  <span className="text-white text-sm font-medium">{otherParticipant.userName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Local Video (Picture-in-Picture) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute top-4 lg:top-8 right-4 lg:right-8 w-24 lg:w-40 h-32 lg:h-52 glass-card overflow-hidden shadow-2xl z-20"
          >
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover rounded-2xl"
            />
            {!isVideoOn && (
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-blue-900/50 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                <VideoOff className="w-10 h-10 text-white/60" />
              </div>
            )}
            <div className="absolute bottom-2 left-2 glass-card px-2 py-1 flex items-center gap-1">
              <div className="w-4 h-4 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                {user?.profileImage ? (
                  <img 
                    src={authAPI.getProfilePhoto(user.id)} 
                    alt="You"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-2 h-2 text-white" />
                )}
              </div>
              <span className="text-white text-xs font-medium">You</span>
            </div>
          </motion.div>



          {/* Main Controls - Centered */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="absolute bottom-4 lg:bottom-6 left-0 right-0 flex justify-center z-30"
          >
            <div className="flex justify-center items-center gap-2 lg:gap-4 bg-black/40 backdrop-blur-md rounded-full px-3 lg:px-6 py-2 lg:py-4">
              <motion.button
                onClick={toggleAudio}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`w-10 lg:w-14 h-10 lg:h-14 rounded-full flex items-center justify-center transition-all ${
                  isAudioOn ? 'bg-white/20 hover:bg-white/30' : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {isAudioOn ? <Mic className="w-4 lg:w-6 h-4 lg:h-6 text-white" /> : <MicOff className="w-4 lg:w-6 h-4 lg:h-6 text-white" />}
              </motion.button>
              
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
              
              <motion.button
                onClick={toggleScreenShare}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`w-10 lg:w-14 h-10 lg:h-14 rounded-full flex items-center justify-center transition-all ${
                  isScreenSharing ? 'bg-blue-500 hover:bg-blue-600' : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                {isScreenSharing ? <MonitorOff className="w-4 lg:w-6 h-4 lg:h-6 text-white" /> : <Monitor className="w-4 lg:w-6 h-4 lg:h-6 text-white" />}
              </motion.button>
              
              <motion.button
                onClick={leaveRoom}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-12 lg:w-16 h-12 lg:h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all"
              >
                <Phone className="w-5 lg:w-7 h-5 lg:h-7 text-white rotate-[135deg]" />
              </motion.button>
            </div>
          </motion.div>

          {/* Chat Toggle Button - Top Left */}
          <motion.button
            onClick={() => setShowChat(!showChat)}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`absolute top-4 lg:top-6 left-4 lg:left-6 w-12 lg:w-14 h-12 lg:h-14 rounded-full flex items-center justify-center transition-all z-30 shadow-xl ${
              showChat ? 'bg-purple-500 hover:bg-purple-600' : 'bg-black/40 backdrop-blur-md hover:bg-black/60'
            }`}
          >
            <MessageCircle className="w-7 h-7 text-white" />
          </motion.button>

          {/* Debug Toggle Button - Top Left */}
          <motion.button
            onClick={() => setShowDebug(!showDebug)}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-20 lg:top-24 left-4 lg:left-6 w-12 lg:w-14 h-12 lg:h-14 rounded-full flex items-center justify-center transition-all z-30 shadow-xl bg-black/40 backdrop-blur-md hover:bg-black/60"
          >
            <span className="text-white text-xs font-bold">DEBUG</span>
          </motion.button>

          {/* Debug Panel */}
          {showDebug && (
            <motion.div
              initial={{ x: -400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -400, opacity: 0 }}
              className="absolute top-4 lg:top-6 left-4 lg:left-6 w-72 lg:w-80 bg-slate-900/95 backdrop-blur-2xl border border-slate-600/50 rounded-2xl p-4 z-40 shadow-2xl"
            >
              <div className="text-white space-y-2">
                <h3 className="font-bold text-lg mb-3">Connection Debug</h3>
                <div className="text-sm space-y-1">
                  <p>Connection State: <span className={`font-mono ${
                    connectionState === 'connected' ? 'text-green-400' :
                    connectionState === 'connecting' ? 'text-yellow-400' :
                    connectionState === 'failed' ? 'text-red-400' : 'text-gray-400'
                  }`}>{connectionState}</span></p>
                  <p>ICE State: <span className={`font-mono ${
                    iceConnectionState === 'connected' ? 'text-green-400' :
                    iceConnectionState === 'connecting' ? 'text-yellow-400' :
                    iceConnectionState === 'failed' ? 'text-red-400' : 'text-gray-400'
                  }`}>{iceConnectionState}</span></p>
                  <p>Local Stream: <span className={`font-mono ${
                    localStream ? 'text-green-400' : 'text-red-400'
                  }`}>{localStream ? 'Active' : 'None'}</span></p>
                  <p>Remote Stream: <span className={`font-mono ${
                    remoteStream ? 'text-green-400' : 'text-red-400'
                  }`}>{remoteStream ? 'Active' : 'None'}</span></p>
                  <p>Participants: <span className="font-mono text-blue-400">{participants.length}</span></p>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => {
                      // Restart WebRTC connection
                      if (peerConnection) {
                        peerConnection.restartIce()
                      }
                    }}
                    className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-xs"
                  >
                    Restart ICE
                  </button>
                  <button
                    onClick={() => setShowDebug(false)}
                    className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-xs"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Chat Panel */}
          {showChat && (
            <motion.div
              initial={{ x: -400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -400, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute top-4 lg:top-6 left-4 lg:left-6 bottom-4 lg:bottom-6 w-80 lg:w-96 bg-slate-900/95 backdrop-blur-2xl border border-slate-600/50 rounded-2xl flex flex-col z-40 overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/10 bg-gradient-to-r from-purple-500/20 to-blue-500/20">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold text-lg">Interview Chat</h3>
                  <button
                    onClick={() => setShowChat(false)}
                    className="text-white/60 hover:text-white transition-colors text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-slate-800/95 backdrop-blur-xl border border-slate-600/50 rounded-xl p-4 shadow-lg"
                  >
                    <p className="text-sm text-purple-300 font-semibold mb-1">{msg.userName}</p>
                    <p className="text-white text-sm leading-relaxed font-medium">{msg.message}</p>
                    <p className="text-xs text-gray-300 mt-2">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className="p-4 border-t border-white/10 bg-black/20">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 input text-sm"
                  />
                  <motion.button
                    onClick={sendMessage}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 px-4 py-2 rounded-xl transition-all text-white font-medium shadow-lg"
                  >
                    Send
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}