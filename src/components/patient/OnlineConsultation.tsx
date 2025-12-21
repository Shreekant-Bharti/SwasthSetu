import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, MessageSquare, Loader2, Mic, MicOff, PhoneOff, Camera, CameraOff, X } from "lucide-react";
import ChatWindow from "./ChatWindow";
import { toast } from "sonner";
import { playChimeSound } from "@/lib/sounds";

interface OnlineConsultationProps {
  userId: string;
  userName: string;
}

type VideoPhase = 'searching' | 'no-doctor' | 'scheduling' | 'connected-video1' | 'connected-video2' | 'connected-video3' | 'done';

const OnlineConsultation = ({ userId, userName }: OnlineConsultationProps) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [videoCallOpen, setVideoCallOpen] = useState(false);
  const [phase, setPhase] = useState<VideoPhase>('searching');
  const [countdown, setCountdown] = useState(7);
  const [scheduleCountdown, setScheduleCountdown] = useState(15);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const [videoPaused, setVideoPaused] = useState(false);

  const doctorVideoRef = useRef<HTMLVideoElement>(null);
  const patientVideoRef = useRef<HTMLVideoElement>(null);
  const fallbackVideoRef = useRef<HTMLVideoElement>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const phaseRef = useRef<VideoPhase>('searching');

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const generatePrescription = useCallback(() => {
    const prescription = {
      id: `presc-video-${Date.now()}`,
      patientId: userId,
      patientName: userName,
      doctorName: "Dr. Sneha Kumari",
      date: new Date().toISOString().split('T')[0],
      diagnosis: "Video Consultation - General Checkup",
      medicines: "Paracetamol 500mg - 1 tablet twice daily after meals\nVitamin C 500mg - 1 tablet daily\nAzithromycin 250mg - 1 tablet daily for 3 days",
      notes: "Stay hydrated, take adequate rest. Follow up after 5 days if symptoms persist.",
      tests: ["Blood Sugar Test", "Complete Blood Count (CBC)"],
      createdAt: new Date().toISOString()
    };

    const existingPrescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
    existingPrescriptions.push(prescription);
    localStorage.setItem('prescriptions', JSON.stringify(existingPrescriptions));

    playChimeSound();
    toast.success("Prescription generated — check My Prescriptions.", {
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
      setScheduleCountdown(15);
      setIsClosing(false);
      setMicEnabled(true);
      setCameraEnabled(true);
      setVideoPaused(false);

      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
        micStreamRef.current = null;
      }
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach(track => track.stop());
        cameraStreamRef.current = null;
      }
    }, 300);
  }, []);

  const proceedToNextVideo = useCallback(() => {
    const currentPhase = phaseRef.current;
    
    if (currentPhase === 'connected-video1') {
      setPhase('connected-video2');
      setVideoPaused(false);
    } else if (currentPhase === 'connected-video2') {
      setPhase('connected-video3');
      setVideoPaused(false);
    } else if (currentPhase === 'connected-video3') {
      generatePrescription();
      closeVideoCall();
    }
  }, [generatePrescription, closeVideoCall]);

  const handleVideoEnded = useCallback(() => {
    const currentPhase = phaseRef.current;
    
    if (currentPhase === 'no-doctor') {
      return;
    }
    
    // After Video 3 ends, close and generate prescription
    if (currentPhase === 'connected-video3') {
      generatePrescription();
      closeVideoCall();
    }
  }, [generatePrescription, closeVideoCall]);

  const setupCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      cameraStreamRef.current = stream;
      if (patientVideoRef.current) {
        patientVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.log('Camera permission denied');
      setCameraEnabled(false);
    }
  }, []);

  const setupMic = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
    } catch (error) {
      console.log('Mic permission denied');
      setMicEnabled(false);
    }
  }, []);


  const handleVideoCall = () => {
    setVideoCallOpen(true);
    setPhase('searching');
    setCountdown(7);

    // Preload videos
    const preload1 = document.createElement('video');
    preload1.src = '/doctor-video-1.mp4';
    preload1.preload = 'auto';

    const preload2 = document.createElement('video');
    preload2.src = '/doctor-video-2.mp4';
    preload2.preload = 'auto';

    const preload3 = document.createElement('video');
    preload3.src = '/doctor-video-3.mp4';
    preload3.preload = 'auto';
  };

  // Searching countdown
  useEffect(() => {
    if (!videoCallOpen || phase !== 'searching') return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setPhase('no-doctor');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [videoCallOpen, phase]);

  // Play fallback video
  useEffect(() => {
    if (phase === 'no-doctor' && fallbackVideoRef.current) {
      fallbackVideoRef.current.play().catch(console.error);
    }
  }, [phase]);

  // Schedule countdown - now shows callback request instead of video call
  useEffect(() => {
    if (phase !== 'scheduling') return;

    const timer = setInterval(() => {
      setScheduleCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Show callback request popup instead of connecting to video
          playChimeSound();
          toast.success("Callback request generated! Soon you will receive a call from Dr. Sneha Kumari.", {
            duration: 6000,
            icon: "📞"
          });
          closeVideoCall();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, closeVideoCall]);

  // Play doctor videos
  useEffect(() => {
    if (doctorVideoRef.current && phase.startsWith('connected-video')) {
      doctorVideoRef.current.load();
      doctorVideoRef.current.play().catch(console.error);
    }
  }, [phase]);

  const getVideoSrc = () => {
    switch (phase) {
      case 'connected-video1': return '/doctor-video-1.mp4';
      case 'connected-video2': return '/doctor-video-2.mp4';
      case 'connected-video3': return '/doctor-video-3.mp4';
      default: return '';
    }
  };

  const toggleMic = () => {
    const newMicState = !micEnabled;
    if (micStreamRef.current) {
      micStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = newMicState;
      });
    }
    setMicEnabled(newMicState);
    
    // When mic is turned OFF, immediately play next video
    if (!newMicState) {
      const currentPhase = phaseRef.current;
      if (currentPhase === 'connected-video1' || currentPhase === 'connected-video2') {
        proceedToNextVideo();
      }
    }
  };

  const toggleCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !cameraEnabled;
      });
    }
    setCameraEnabled(!cameraEnabled);
  };

  const handleScheduleCall = () => {
    setPhase('scheduling');
    setScheduleCountdown(15);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

      {videoCallOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div 
            className={`
              relative bg-card rounded-2xl shadow-2xl border border-border/50 overflow-hidden
              w-[95vw] h-[85vh] max-w-[1200px]
              transition-all duration-300 ease-out
              ${isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100 animate-scale-in'}
            `}
          >
            <Button
              onClick={closeVideoCall}
              size="icon"
              variant="ghost"
              className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-black/70 text-white rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>

            {/* Searching Phase */}
            {phase === 'searching' && (
              <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <div className="relative mb-8">
                  <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  </div>
                  <div className="absolute inset-0 w-24 h-24 rounded-full animate-ping bg-primary/10" />
                </div>
                <p className="text-white text-2xl font-medium mb-3">Searching for doctor</p>
                <div className="flex items-center gap-2 text-white/70 text-lg">
                  <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                </div>
                <p className="text-primary text-4xl font-bold mt-6">{countdown}s</p>
              </div>
            )}

            {/* No Doctor Found Phase */}
            {phase === 'no-doctor' && (
              <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <div className="w-full max-w-lg aspect-video mb-8 rounded-xl overflow-hidden">
                  <video
                    ref={fallbackVideoRef}
                    src="/no-doctor-fallback.mp4"
                    className="w-full h-full object-cover"
                    playsInline
                  />
                </div>
                <p className="text-white/80 text-xl mb-6">No doctors available right now</p>
                <Button 
                  onClick={handleScheduleCall}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg"
                >
                  <Video className="mr-2 h-5 w-5" />
                  Schedule a Call
                </Button>
              </div>
            )}

            {/* Scheduling Countdown Phase */}
            {phase === 'scheduling' && (
              <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <p className="text-white/70 text-xl mb-4">Connecting you in</p>
                <div className="relative">
                  <div className="text-8xl font-bold text-primary animate-pulse">
                    {formatTime(scheduleCountdown)}
                  </div>
                </div>
                <p className="text-white/50 text-lg mt-6 mb-8">Connecting you to Dr. Sneha Kumari…</p>
                <Button 
                  onClick={closeVideoCall}
                  variant="outline"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                >
                  Cancel
                </Button>
              </div>
            )}

            {/* Connected Video Call Phase - COMMENTED OUT FOR NOW */}
            {/* {phase.startsWith('connected-') && (
              <div className="relative w-full h-full bg-slate-900">
                <div className="absolute inset-0">
                  <video
                    ref={doctorVideoRef}
                    src={getVideoSrc()}
                    className={`w-full h-full object-contain bg-black transition-opacity duration-300 ${videoPaused ? 'opacity-50' : 'opacity-100'}`}
                    playsInline
                    onEnded={handleVideoEnded}
                  />
                  
                  <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full">
                    <p className="text-white text-sm flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${videoPaused ? 'bg-yellow-500' : 'bg-green-500 animate-pulse'}`} />
                      {videoPaused ? 'Dr. Sneha Kumari is listening...' : 'Dr. Sneha Kumari is speaking...'}
                    </p>
                  </div>

                  <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
                    <p className="text-white/80 text-xs">
                      {phase === 'connected-video1' && 'Part 1/3'}
                      {phase === 'connected-video2' && 'Part 2/3'}
                      {phase === 'connected-video3' && 'Part 3/3'}
                    </p>
                  </div>
                </div>

                <div className="absolute bottom-24 right-6 w-48 h-36 rounded-xl overflow-hidden border-2 border-primary/50 shadow-lg bg-slate-800">
                  {cameraEnabled ? (
                    <video
                      ref={patientVideoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                      style={{ transform: 'scaleX(-1)' }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <CameraOff className="h-8 w-8 text-white/50" />
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white">
                    You
                  </div>
                </div>

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
                  <Button
                    onClick={toggleMic}
                    size="icon"
                    variant={micEnabled ? "secondary" : "destructive"}
                    className="rounded-full w-14 h-14"
                  >
                    {micEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
                  </Button>
                  
                  <Button
                    onClick={closeVideoCall}
                    size="icon"
                    variant="destructive"
                    className="rounded-full w-16 h-16"
                  >
                    <PhoneOff className="h-7 w-7" />
                  </Button>

                  <Button
                    onClick={toggleCamera}
                    size="icon"
                    variant={cameraEnabled ? "secondary" : "destructive"}
                    className="rounded-full w-14 h-14"
                  >
                    {cameraEnabled ? <Camera className="h-6 w-6" /> : <CameraOff className="h-6 w-6" />}
                  </Button>
                </div>
              </div>
            )} */}
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
