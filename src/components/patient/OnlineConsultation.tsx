import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, MessageSquare, Loader2, Mic, MicOff, Phone, PhoneOff, Volume2 } from "lucide-react";
import ChatWindow from "./ChatWindow";
import { toast } from "sonner";
import { playChimeSound } from "@/lib/sounds";

interface OnlineConsultationProps {
  userId: string;
  userName: string;
}

type VideoPhase = 'searching' | 'video1' | 'video2' | 'video3' | 'done';

const OnlineConsultation = ({ userId, userName }: OnlineConsultationProps) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [videoCallOpen, setVideoCallOpen] = useState(false);
  const [phase, setPhase] = useState<VideoPhase>('searching');
  const [countdown, setCountdown] = useState(7);
  const [micEnabled, setMicEnabled] = useState(false);
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [audioOnly, setAudioOnly] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasSpokenRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const phaseRef = useRef<VideoPhase>('searching');

  // Keep phaseRef in sync
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const generatePrescription = useCallback(() => {
    const prescription = {
      id: `presc-video-${Date.now()}`,
      patientId: userId,
      patientName: userName,
      doctorName: "Dr. Snehh Kumar",
      date: new Date().toISOString().split('T')[0],
      diagnosis: "Video Consultation - General Checkup",
      medicines: "Paracetamol 500mg - 1 tablet twice daily after meals\nVitamin C 500mg - 1 tablet daily\nAzithromycin 250mg - 1 tablet daily for 3 days",
      notes: "Stay hydrated, take adequate rest. Follow up after 5 days if symptoms persist. Avoid cold drinks and fried food.",
      tests: ["Blood Sugar Test", "Complete Blood Count (CBC)"],
      createdAt: new Date().toISOString()
    };

    const existingPrescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
    existingPrescriptions.push(prescription);
    localStorage.setItem('prescriptions', JSON.stringify(existingPrescriptions));

    // Play chime and show toast
    playChimeSound();
    toast.success("Prescription received — available in My Prescriptions.", {
      duration: 5000,
      icon: "💊"
    });
  }, [userId, userName]);

  const closeVideoCall = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setVideoCallOpen(false);
      setPhase('searching');
      setCountdown(7);
      setIsClosing(false);
      setMicEnabled(false);
      hasSpokenRef.current = false;
      isSpeakingRef.current = false;
      
      // Cleanup mic
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
        micStreamRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
    }, 300);
  }, []);

  const handleVideoEnded = useCallback(() => {
    const currentPhase = phaseRef.current;
    console.log('Video ended, current phase:', currentPhase);
    
    if (currentPhase === 'video3') {
      // Final video ended - generate prescription and close
      generatePrescription();
      closeVideoCall();
    }
  }, [generatePrescription, closeVideoCall]);

  const proceedToNextVideo = useCallback(() => {
    const currentPhase = phaseRef.current;
    console.log('Proceeding from phase:', currentPhase);
    
    if (currentPhase === 'video1') {
      setPhase('video2');
      hasSpokenRef.current = false;
    } else if (currentPhase === 'video2') {
      setPhase('video3');
      hasSpokenRef.current = false;
    }
  }, []);

  // Mic detection setup
  const setupMicDetection = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);
      
      setMicEnabled(true);
      startMicMonitoring();
    } catch (error) {
      console.log('Mic permission denied, using auto-progression');
      setMicPermissionDenied(true);
      setMicEnabled(false);
      // Start auto-silence simulation
      startAutoSilenceSimulation();
    }
  }, []);

  const startAutoSilenceSimulation = useCallback(() => {
    // Simulate silence events for mic-denied scenario
    silenceTimeoutRef.current = setTimeout(() => {
      const currentPhase = phaseRef.current;
      if (currentPhase === 'video1' || currentPhase === 'video2') {
        proceedToNextVideo();
        // Schedule next auto-progression
        if (currentPhase === 'video1') {
          silenceTimeoutRef.current = setTimeout(() => {
            if (phaseRef.current === 'video2') {
              proceedToNextVideo();
            }
          }, 8000);
        }
      }
    }, 5000);
  }, [proceedToNextVideo]);

  const startMicMonitoring = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    const SILENCE_THRESHOLD = 30;
    const SILENCE_DURATION = 1500; // 1.5 seconds

    const checkAudio = () => {
      if (!analyserRef.current || !videoCallOpen) return;

      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

      const currentPhase = phaseRef.current;
      
      if (average > SILENCE_THRESHOLD) {
        // User is speaking
        isSpeakingRef.current = true;
        hasSpokenRef.current = true;
        
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
          silenceTimeoutRef.current = null;
        }
      } else if (hasSpokenRef.current && isSpeakingRef.current) {
        // User stopped speaking, start silence timer
        isSpeakingRef.current = false;
        
        if (!silenceTimeoutRef.current && (currentPhase === 'video1' || currentPhase === 'video2')) {
          silenceTimeoutRef.current = setTimeout(() => {
            console.log('Silence detected after speech, proceeding...');
            proceedToNextVideo();
            silenceTimeoutRef.current = null;
            hasSpokenRef.current = false;
          }, SILENCE_DURATION);
        }
      } else if (!hasSpokenRef.current && (currentPhase === 'video1' || currentPhase === 'video2')) {
        // User never spoke - auto-proceed after initial wait
        if (!silenceTimeoutRef.current) {
          silenceTimeoutRef.current = setTimeout(() => {
            console.log('No speech detected, auto-proceeding...');
            proceedToNextVideo();
            silenceTimeoutRef.current = null;
          }, 5000);
        }
      }

      requestAnimationFrame(checkAudio);
    };

    requestAnimationFrame(checkAudio);
  }, [videoCallOpen, proceedToNextVideo]);

  // Start video call
  const handleVideoCall = () => {
    setVideoCallOpen(true);
    setPhase('searching');
    setCountdown(7);
    setMicPermissionDenied(false);
    setAudioOnly(false);
  };

  // Countdown for searching phase
  useEffect(() => {
    if (!videoCallOpen || phase !== 'searching') return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setPhase('video1');
          setupMicDetection();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [videoCallOpen, phase, setupMicDetection]);

  // Play video when phase changes
  useEffect(() => {
    if (videoRef.current && (phase === 'video1' || phase === 'video2' || phase === 'video3')) {
      videoRef.current.load();
      videoRef.current.play().catch(console.error);
    }
  }, [phase]);

  const getVideoSrc = () => {
    switch (phase) {
      case 'video1': return '/doctor-video-1.mp4';
      case 'video2': return '/doctor-video-2.mp4';
      case 'video3': return '/doctor-video-3.mp4';
      default: return '';
    }
  };

  const handleEndCall = () => {
    closeVideoCall();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            Online Consultation
          </CardTitle>
          <CardDescription>Connect with doctors instantly</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={handleVideoCall} className="w-full" variant="default">
            <Video className="mr-2 h-4 w-4" />
            Start Video Call
          </Button>
          <Button onClick={() => setChatOpen(true)} className="w-full" variant="secondary">
            <MessageSquare className="mr-2 h-4 w-4" />
            Start Chat
          </Button>
        </CardContent>
      </Card>

      {/* Video Call Card */}
      {videoCallOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div 
            className={`
              relative bg-card rounded-2xl shadow-2xl border border-border/50 overflow-hidden
              w-[92vw] md:w-[60vw] max-w-[800px]
              transition-all duration-300 ease-out
              ${isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100 animate-scale-in'}
            `}
            style={{ maxHeight: '50vh' }}
          >
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Video className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">
                      {phase === 'searching' ? 'Searching...' : 'Dr. Snehh Kumar'}
                    </p>
                    <p className="text-white/70 text-xs">
                      {phase === 'searching' ? 'Finding available doctor' : 'Video Consultation'}
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={handleEndCall} 
                  size="sm" 
                  variant="destructive"
                  className="rounded-full"
                >
                  <PhoneOff className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="w-full h-full min-h-[280px] md:min-h-[350px] bg-gradient-to-br from-slate-900 to-slate-800">
              {phase === 'searching' ? (
                <div className="flex flex-col items-center justify-center h-full py-16 animate-fade-in">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                      <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                    <div className="absolute inset-0 w-20 h-20 rounded-full animate-ping bg-primary/10" />
                  </div>
                  <p className="text-white text-lg font-medium mb-2">Searching for doctor</p>
                  <div className="flex items-center gap-1 text-white/70">
                    <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                  </div>
                  <p className="text-primary text-2xl font-bold mt-4">{countdown}s</p>
                </div>
              ) : (
                <div className="relative w-full h-full">
                  {!audioOnly ? (
                    <video
                      ref={videoRef}
                      src={getVideoSrc()}
                      className="w-full h-full object-cover transition-opacity duration-300"
                      style={{ maxHeight: '50vh' }}
                      autoPlay
                      playsInline
                      onEnded={handleVideoEnded}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full py-16">
                      <Volume2 className="h-16 w-16 text-primary mb-4 animate-pulse" />
                      <p className="text-white text-lg">Audio Only Mode</p>
                      <p className="text-white/60 text-sm">Listening to Dr. Snehh Kumar...</p>
                      <audio
                        ref={videoRef as any}
                        src={getVideoSrc()}
                        autoPlay
                        onEnded={handleVideoEnded}
                      />
                    </div>
                  )}

                  {/* Mic indicator */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
                    <div className={`
                      flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md
                      ${micEnabled ? 'bg-green-500/20 border border-green-500/50' : 'bg-red-500/20 border border-red-500/50'}
                    `}>
                      {micEnabled ? (
                        <>
                          <Mic className="h-4 w-4 text-green-400" />
                          <span className="text-green-400 text-sm">Mic Active</span>
                        </>
                      ) : (
                        <>
                          <MicOff className="h-4 w-4 text-red-400" />
                          <span className="text-red-400 text-sm">
                            {micPermissionDenied ? 'Mic Denied' : 'Mic Off'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Video phase indicator */}
                  <div className="absolute top-16 right-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
                    <p className="text-white/80 text-xs">
                      {phase === 'video1' && 'Part 1/3'}
                      {phase === 'video2' && 'Part 2/3'}
                      {phase === 'video3' && 'Part 3/3'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Audio-only fallback button */}
            {phase !== 'searching' && !audioOnly && (
              <div className="absolute bottom-4 right-4">
                <Button 
                  onClick={() => setAudioOnly(true)} 
                  size="sm" 
                  variant="outline"
                  className="bg-black/30 border-white/20 text-white hover:bg-black/50 text-xs"
                >
                  <Volume2 className="h-3 w-3 mr-1" />
                  Audio only
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      <ChatWindow
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        userId={userId}
        userName={userName}
      />
    </>
  );
};

export default OnlineConsultation;
