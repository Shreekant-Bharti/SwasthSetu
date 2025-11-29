import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Video, MessageSquare, Loader2 } from "lucide-react";
import ChatWindow from "./ChatWindow";

interface OnlineConsultationProps {
  userId: string;
  userName: string;
}

const OnlineConsultation = ({ userId, userName }: OnlineConsultationProps) => {
  const [videoLoading, setVideoLoading] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoCall = () => {
    setVideoLoading(true);
    setShowVideo(false);
    setVideoModalOpen(true);
    
    // After 7 seconds, show and auto-play the video
    setTimeout(() => {
      setVideoLoading(false);
      setShowVideo(true);
    }, 7000);
  };

  const handleModalClose = (open: boolean) => {
    if (!open) {
      setVideoModalOpen(false);
      setVideoLoading(false);
      setShowVideo(false);
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  };

  const handleVideoEnded = () => {
    // Auto-close when video finishes
    setVideoModalOpen(false);
    setVideoLoading(false);
    setShowVideo(false);
  };

  useEffect(() => {
    if (showVideo && videoRef.current) {
      videoRef.current.play().catch(console.error);
    }
  }, [showVideo]);

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

      <Dialog open={videoModalOpen} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden border-0 bg-transparent shadow-none">
          <div 
            className="bg-card rounded-2xl shadow-2xl border border-border/50 overflow-hidden animate-scale-in"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 12px 24px -8px rgba(0, 0, 0, 0.15)',
              maxHeight: '70vh',
            }}
          >
            <DialogHeader className="p-4 pb-3 border-b border-border/30">
              <DialogTitle className="text-lg">Video Consultation</DialogTitle>
              <DialogDescription className="text-sm">
                {videoLoading ? 'Searching for available doctor...' : 'Connected with Dr. Snehh Kumar'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="p-4">
              {videoLoading ? (
                <div className="flex flex-col items-center gap-3 py-8 animate-fade-in">
                  <div className="relative">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full bg-primary/20" />
                  </div>
                  <p className="text-base font-medium text-foreground">Searching for Doctor...</p>
                  <p className="text-sm text-muted-foreground">Please wait while we connect you</p>
                </div>
              ) : showVideo ? (
                <div className="animate-fade-in">
                  <video
                    ref={videoRef}
                    src="/doctor-video.mp4"
                    className="w-full rounded-xl shadow-lg"
                    style={{ maxHeight: '50vh', objectFit: 'contain' }}
                    autoPlay
                    playsInline
                    onEnded={handleVideoEnded}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
