import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Mic, MicOff, Volume2, VolumeX, BrainCircuit, 
  Clock, CheckCircle, XCircle, Send, Loader2, AlertCircle, Eye, User, Video
} from 'lucide-react';
import api from '../services/api';
import { PostureAnalyzer, PostureAnalysis } from '../utils/postureAnalysis';
import VirtualInterviewer from '../components/VirtualInterviewer';

interface Question {
  id: string;
  questionText: string;
  order: number;
}

interface Response {
  questionId: string;
  responseText: string;
  responseTime: number;
  evaluation?: any;
}

export default function AIInterviewRoomPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [interview, setInterview] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Response[]>([]);
  const [currentResponse, setCurrentResponse] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [interviewerAvatar, setInterviewerAvatar] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [finalFeedback, setFinalFeedback] = useState<any>(null);
  const [postureAnalysis, setPostureAnalysis] = useState<PostureAnalysis | null>(null);
  const [showPosturePanel, setShowPosturePanel] = useState(true);
  const [interviewerGender, setInterviewerGender] = useState<'male' | 'female'>('female');
  const [candidateVideoStream, setCandidateVideoStream] = useState<MediaStream | null>(null);
  const candidateVideoRef = useRef<HTMLVideoElement>(null);
  
  // Speech Recognition
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const postureAnalyzerRef = useRef<PostureAnalyzer | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetchInterview();
    initializeSpeech();
    initializePostureAnalysis();
    
    return () => {
      cleanup();
    };
  }, [id]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const fetchInterview = async () => {
    try {
      const response = await api.get(`/ai-interviews/${id}`);
      const interviewData = response.data.interview;
      setInterview(interviewData);
      
      if (interviewData.status === 'COMPLETED') {
        setInterviewComplete(true);
        setFinalFeedback(interviewData.feedback);
      } else if (interviewData.questions && interviewData.questions.length > 0) {
        // Welcome message and first question
        const welcomeMsg = `Hello! I'm your AI interviewer. Today we'll be discussing ${interviewData.topic}. Let's begin with the first question.`;
        setTimeout(() => {
          speakText(welcomeMsg);
          setTimeout(() => speakText(interviewData.questions[0].questionText), 4000);
        }, 1000);
      }
      
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load interview');
      setLoading(false);
    }
  };

  const initializeSpeech = () => {
    // Initialize Speech Synthesis
    synthRef.current = window.speechSynthesis;

    // Initialize Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setCurrentResponse(prev => prev + finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          setError('No speech detected. Please try again.');
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      console.warn('Speech Recognition not supported');
    }
  };

  const speakText = (text: string, callback?: () => void) => {
    if (!synthRef.current || !autoSpeak) {
      callback?.();
      return;
    }

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Enhanced voice selection based on gender
    const voices = synthRef.current.getVoices();
    const genderPreferences = interviewerGender === 'female' 
      ? ['Google US English Female', 'Microsoft Zira', 'Samantha', 'Victoria', 'Karen', 'female']
      : ['Google US English Male', 'Microsoft David', 'Alex', 'Daniel', 'Fred', 'male'];
    
    let selectedVoice = null;
    for (const pref of genderPreferences) {
      selectedVoice = voices.find(v => 
        v.name.toLowerCase().includes(pref.toLowerCase()) && 
        v.lang.startsWith('en')
      );
      if (selectedVoice) break;
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    // Natural speaking rate and pitch
    utterance.rate = interviewerGender === 'female' ? 0.95 : 0.92;
    utterance.pitch = interviewerGender === 'female' ? 1.1 : 0.9;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      callback?.();
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      callback?.();
    };

    synthRef.current.speak(utterance);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setError('');
      } catch (err) {
        console.error('Failed to start recognition:', err);
      }
    }
  };

  const toggleSpeaking = () => {
    if (!synthRef.current) return;

    if (isSpeaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    } else {
      const currentQuestion = interview?.questions[currentQuestionIndex];
      if (currentQuestion) {
        speakText(currentQuestion.questionText);
      }
    }
  };

  const submitResponse = async () => {
    if (!currentResponse.trim()) {
      setError('Please provide a response before submitting.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const currentQuestion = interview.questions[currentQuestionIndex];
      const responseTime = Math.floor((Date.now() - questionStartTime) / 1000);

      const response = await api.post(`/ai-interviews/${id}/responses`, {
        questionId: currentQuestion.id,
        responseText: currentResponse,
        responseTime
      });

      const evaluation = response.data.evaluation;
      
      setResponses(prev => [...prev, {
        questionId: currentQuestion.id,
        responseText: currentResponse,
        responseTime,
        evaluation
      }]);

      // Speak feedback and move to next
      if (evaluation?.feedback) {
        speakText(evaluation.feedback, () => {
          // After feedback, move to next question
          if (currentQuestionIndex < interview.questions.length - 1) {
            setTimeout(() => {
              setCurrentQuestionIndex(prev => prev + 1);
              setCurrentResponse('');
              setQuestionStartTime(Date.now());
              
              const nextQuestion = interview.questions[currentQuestionIndex + 1];
              const transitionMsg = `Let's move to the next question.`;
              speakText(transitionMsg, () => {
                setTimeout(() => speakText(nextQuestion.questionText), 500);
              });
            }, 1000);
          } else {
            // Complete interview
            setTimeout(() => completeInterview(), 2000);
          }
        });
      } else {
        // No feedback, just move on
        if (currentQuestionIndex < interview.questions.length - 1) {
          setTimeout(() => {
            setCurrentQuestionIndex(prev => prev + 1);
            setCurrentResponse('');
            setQuestionStartTime(Date.now());
            
            const nextQuestion = interview.questions[currentQuestionIndex + 1];
            setTimeout(() => speakText(nextQuestion.questionText), 1000);
          }, 1500);
        } else {
          setTimeout(() => completeInterview(), 1500);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit response');
    } finally {
      setIsProcessing(false);
    }
  };

  const completeInterview = async () => {
    try {
      const avgPosture = postureAnalyzerRef.current?.getAverageAnalysis();
      
      const response = await api.post(`/ai-interviews/${id}/complete`);
      const feedback = response.data.interview.feedback;
      
      if (avgPosture) {
        feedback.bodyLanguage = avgPosture;
      }
      
      setFinalFeedback(feedback);
      setInterviewComplete(true);
      
      const completionMsg = `Excellent work! We've completed the interview. Your overall score is ${feedback.overallScore} percent. Your body language score is ${avgPosture?.score || 75} percent. Let me show you the detailed feedback.`;
      speakText(completionMsg);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to complete interview');
    }
  };

  const initializePostureAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 }, 
        audio: true 
      });
      setCandidateVideoStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        await localVideoRef.current.play();
      }
      
      if (candidateVideoRef.current) {
        candidateVideoRef.current.srcObject = stream;
        await candidateVideoRef.current.play();
      }
      
      postureAnalyzerRef.current = new PostureAnalyzer();
      
      setTimeout(() => {
        if (localVideoRef.current && postureAnalyzerRef.current) {
          postureAnalyzerRef.current.startAnalysis(localVideoRef.current, (analysis) => {
            setPostureAnalysis(analysis);
          });
        }
      }, 2000);
    } catch (err) {
      console.error('Failed to initialize posture analysis:', err);
      setError('Camera access denied. Please allow camera permissions.');
    }
  };

  const cleanup = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (postureAnalyzerRef.current) {
      postureAnalyzerRef.current.stopAnalysis();
    }
    if (localVideoRef.current?.srcObject) {
      const tracks = (localVideoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-700 text-lg">Loading interview...</p>
        </div>
      </div>
    );
  }

  if (error && !interview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={() => navigate('/ai-interview')} className="btn btn-primary">
            Back to AI Interview
          </button>
        </div>
      </div>
    );
  }

  if (interviewComplete && finalFeedback) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="card">
            {/* AI Interviewer Completion Message */}
            <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg border-2 border-primary-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                  <BrainCircuit className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">AI Interviewer</h3>
                  <p className="text-sm text-gray-600">Interview completed</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "Excellent work! You've completed the interview. Here's your detailed performance analysis."
              </p>
            </div>

            <div className="text-center mb-8">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Completed!</h1>
              <p className="text-gray-600">Great job! Here's your performance summary</p>
            </div>

            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="text-center p-6 bg-primary-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Overall Score</p>
                <p className="text-4xl font-bold text-primary-600">{finalFeedback.overallScore}%</p>
              </div>
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Technical</p>
                <p className="text-4xl font-bold text-green-600">{finalFeedback.technicalAverage}%</p>
              </div>
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Communication</p>
                <p className="text-4xl font-bold text-blue-600">{finalFeedback.communicationAverage}%</p>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Body Language</p>
                <p className="text-4xl font-bold text-purple-600">{finalFeedback.bodyLanguage?.score || 75}%</p>
              </div>
            </div>

            {finalFeedback.bodyLanguage && (
              <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-purple-600" />
                  Body Language Analysis
                </h3>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Posture</p>
                    <p className="text-lg font-semibold text-gray-900 capitalize">{finalFeedback.bodyLanguage.posture}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Eye Contact</p>
                    <p className="text-lg font-semibold text-gray-900 capitalize">{finalFeedback.bodyLanguage.eyeContact}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Expression</p>
                    <p className="text-lg font-semibold text-gray-900 capitalize">{finalFeedback.bodyLanguage.facialExpression}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Observations:</p>
                  <ul className="space-y-1">
                    {finalFeedback.bodyLanguage.bodyLanguage?.map((item: string, idx: number) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-purple-500 mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Strengths
                </h3>
                <ul className="space-y-2">
                  {finalFeedback.strengths?.map((strength: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  Areas to Improve
                </h3>
                <ul className="space-y-2">
                  {finalFeedback.improvements?.map((improvement: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <span className="text-orange-500 mt-1">•</span>
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button onClick={() => navigate('/ai-interview')} className="btn btn-primary">
                Start New Interview
              </button>
              <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = interview?.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / interview?.questions.length) * 100;

  return (
    <div className="fixed inset-0 bg-gray-900 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BrainCircuit className="w-6 h-6 text-primary-400" />
              <div>
                <h1 className="text-lg font-bold text-white">{interview?.topic}</h1>
                <p className="text-sm text-gray-400">{interview?.interviewType} Interview</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs text-gray-400">Question</p>
                <p className="text-lg font-bold text-white">
                  {currentQuestionIndex + 1} / {interview?.questions.length}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Time</p>
                <p className="text-lg font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {formatTime(elapsedTime)}
                </p>
              </div>
              <div className="w-48">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Interview Screen */}
        <div className="flex-1 grid grid-cols-2 gap-3 p-3 min-h-0">
          {/* Virtual Interviewer */}
          <div className="bg-gray-800 rounded-lg overflow-hidden relative min-h-0">
            <div className="w-full h-full flex items-center justify-center">
              <VirtualInterviewer isSpeaking={isSpeaking} gender={interviewerGender} />
            </div>
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg z-10">
              <p className="text-white font-semibold text-sm">AI Interviewer</p>
              <p className="text-gray-300 text-xs capitalize">{interviewerGender}</p>
            </div>
            <button
              onClick={() => setInterviewerGender(interviewerGender === 'male' ? 'female' : 'male')}
              className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs hover:bg-black/80 transition z-10"
            >
              Switch Gender
            </button>
          </div>

          {/* Candidate Video */}
          <div className="bg-gray-800 rounded-lg overflow-hidden relative min-h-0">
            <video
              ref={candidateVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg z-10">
              <p className="text-white font-semibold text-sm flex items-center gap-2">
                <Video className="w-4 h-4" />
                You (Candidate)
              </p>
            </div>
            {postureAnalysis && (
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg z-10">
                <p className="text-xs text-gray-300">Posture: <span className={`font-semibold ${
                  postureAnalysis.posture === 'excellent' ? 'text-green-400' :
                  postureAnalysis.posture === 'good' ? 'text-blue-400' :
                  postureAnalysis.posture === 'fair' ? 'text-yellow-400' : 'text-red-400'
                }`}>{postureAnalysis.posture}</span></p>
              </div>
            )}
          </div>
        </div>

        {/* Hidden video for posture analysis */}
        <video ref={localVideoRef} autoPlay muted playsInline className="hidden" />

        {/* Question and Response Section */}
        <div className="bg-gray-800 border-t border-gray-700 p-4 flex-shrink-0" style={{ height: '240px', overflowY: 'auto' }}>
          <div className="max-w-7xl mx-auto space-y-3">
            {/* Current Question */}
            <div className="bg-gray-900 rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-white font-semibold text-sm">Current Question:</h3>
                <button
                  onClick={toggleSpeaking}
                  className="p-1.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition"
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-gray-300 text-base">{currentQuestion?.questionText}</p>
            </div>

            {/* Response Input */}
            <div className="bg-gray-900 rounded-lg p-3">
              <h3 className="text-white font-semibold mb-2 text-sm">Your Response:</h3>
              <textarea
                value={currentResponse}
                onChange={(e) => setCurrentResponse(e.target.value)}
                placeholder="Type your answer or use voice input..."
                className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 min-h-[60px] text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={isProcessing}
              />
              
              {error && (
                <div className="mt-2 bg-red-900/50 text-red-300 p-2 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="w-3 h-3" />
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between mt-3 gap-2">
                <button
                  onClick={toggleListening}
                  disabled={isProcessing}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition ${
                    isListening
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-primary-600 hover:bg-primary-700 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-4 h-4" />
                      <span>Stop</span>
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" />
                      <span>Voice Input</span>
                    </>
                  )}
                </button>

                <button
                  onClick={submitResponse}
                  disabled={isProcessing || !currentResponse.trim()}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Answer</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Old sections removed - keeping only essential hidden elements */}
        {interviewerAvatar && false && (
          <div className="card mb-6 bg-gradient-to-r from-primary-50 to-secondary-50">
            <div className="flex items-center gap-4">
              <div className={`relative ${
                isSpeaking ? 'animate-pulse' : ''
              }`}>
                <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center">
                  <BrainCircuit className="w-8 h-8 text-white" />
                </div>
                {isSpeaking && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                    <Volume2 className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  AI Interviewer
                  {isSpeaking && (
                    <span className="text-sm font-normal text-primary-600 animate-pulse">Speaking...</span>
                  )}
                </h3>
                <p className="text-sm text-gray-600">
                  {isSpeaking ? 'Asking question...' : 'Waiting for your response'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setAutoSpeak(!autoSpeak)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                    autoSpeak ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'
                  }`}
                  title="Toggle auto-speak"
                >
                  {autoSpeak ? '🔊 Voice ON' : '🔇 Voice OFF'}
                </button>
                <button
                  onClick={toggleSpeaking}
                  className="p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition"
                  title={isSpeaking ? 'Stop speaking' : 'Replay question'}
                >
                  {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Question Card */}
        <div className="card mb-6">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Current Question</h2>
            <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
              Question {currentQuestionIndex + 1}
            </span>
          </div>
          <div className={`p-4 rounded-lg ${
            isSpeaking ? 'bg-primary-50 border-2 border-primary-300' : 'bg-gray-50'
          } transition-all`}>
            <p className="text-lg text-gray-800 leading-relaxed">{currentQuestion?.questionText}</p>
          </div>
        </div>

        {/* Response Card */}
        <div className="card mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Response</h3>
          
          <textarea
            value={currentResponse}
            onChange={(e) => setCurrentResponse(e.target.value)}
            placeholder="Type your answer here or use voice input..."
            className="input min-h-[200px] mb-4"
            disabled={isProcessing}
          />

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <button
              onClick={toggleListening}
              disabled={isProcessing}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
                isListening
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-primary-600 hover:bg-primary-700 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-5 h-5" />
                  <span>Stop Recording</span>
                  <span className="ml-2 w-2 h-2 bg-white rounded-full animate-pulse" />
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  <span>Start Voice Input</span>
                </>
              )}
            </button>

            <button
              onClick={submitResponse}
              disabled={isProcessing || !currentResponse.trim()}
              className="flex items-center gap-2 btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Submit Answer</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800 font-medium mb-1">
              💡 How it works:
            </p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• AI interviewer speaks questions automatically</li>
              <li>• Click microphone 🎤 to answer with your voice</li>
              <li>• Or type your response manually</li>
              <li>• Get instant AI feedback after each answer</li>
            </ul>
          </div>
        </div>



        {/* Body Language Panel */}
        {showPosturePanel && postureAnalysis && (
          <div className="card mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Body Language Analysis</h3>
                  <p className="text-sm text-gray-600">Real-time posture monitoring</p>
                </div>
              </div>
              <button
                onClick={() => setShowPosturePanel(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-white rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Posture</p>
                <p className={`text-lg font-bold capitalize ${
                  postureAnalysis.posture === 'excellent' ? 'text-green-600' :
                  postureAnalysis.posture === 'good' ? 'text-blue-600' :
                  postureAnalysis.posture === 'fair' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {postureAnalysis.posture}
                </p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Eye Contact</p>
                <p className={`text-lg font-bold capitalize ${
                  postureAnalysis.eyeContact === 'strong' ? 'text-green-600' :
                  postureAnalysis.eyeContact === 'moderate' ? 'text-blue-600' : 'text-yellow-600'
                }`}>
                  {postureAnalysis.eyeContact}
                </p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Expression</p>
                <p className={`text-lg font-bold capitalize ${
                  postureAnalysis.facialExpression === 'confident' ? 'text-green-600' :
                  postureAnalysis.facialExpression === 'neutral' ? 'text-blue-600' : 'text-yellow-600'
                }`}>
                  {postureAnalysis.facialExpression}
                </p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Score</p>
                <p className="text-lg font-bold text-purple-600">{postureAnalysis.score}%</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Current Observations:</p>
                <div className="space-y-1">
                  {postureAnalysis.bodyLanguage.map((item, idx) => (
                    <p key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </p>
                  ))}
                </div>
              </div>
              {postureAnalysis.suggestions.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Suggestions:</p>
                  <div className="space-y-1">
                    {postureAnalysis.suggestions.map((item, idx) => (
                      <p key={idx} className="text-sm text-purple-700 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Previous Responses */}
        {responses.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Previous Responses</h3>
            <div className="space-y-4">
              {responses.map((resp, idx) => (
                <div key={idx} className="border-l-4 border-primary-500 pl-4 py-2">
                  <p className="text-sm text-gray-600 mb-1">Question {idx + 1}</p>
                  <p className="text-gray-800 mb-2">{resp.responseText.substring(0, 100)}...</p>
                  {resp.evaluation && (
                    <div className="flex gap-4 text-sm">
                      <span className="text-green-600">
                        Technical: {resp.evaluation.technicalScore}%
                      </span>
                      <span className="text-blue-600">
                        Communication: {resp.evaluation.communicationScore}%
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
