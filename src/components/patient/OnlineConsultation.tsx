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
    
    // After 10 seconds, show and auto-play the video
    setTimeout(() => {
      setVideoLoading(false);
      setShowVideo(true);
    }, 10000);
  };

  const handleModalClose = (open: boolean) => {
    if (!open) {
      setVideoModalOpen(false);
      setVideoLoading(false);
      setShowVideo(false);
      // Stop video if playing
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  };

  useEffect(() => {
    // Auto-play video when showVideo becomes true
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
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Video Consultation</DialogTitle>
            <DialogDescription>
              {videoLoading ? 'Searching for available doctor...' : 'Connected'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-4">
            {videoLoading ? (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="relative">
                  <Loader2 className="h-16 w-16 animate-spin text-primary" />
                  <div className="absolute inset-0 h-16 w-16 animate-ping rounded-full bg-primary/20" />
                </div>
                <p className="text-lg font-medium text-foreground">Searching for Doctor...</p>
                <p className="text-sm text-muted-foreground">Please wait while we connect you</p>
              </div>
            ) : showVideo ? (
              <video
                ref={videoRef}
                src="/doctor-video.mp4"
                className="w-full rounded-lg"
                autoPlay
                playsInline
                muted={false}
              />
            ) : null}
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
