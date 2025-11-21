import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Video, MessageSquare, Loader2 } from "lucide-react";
import ChatWindow from "./ChatWindow";
import { toast } from "sonner";

interface OnlineConsultationProps {
  userId: string;
  userName: string;
}

const OnlineConsultation = ({ userId, userName }: OnlineConsultationProps) => {
  const [videoLoading, setVideoLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  const handleVideoCall = () => {
    setVideoLoading(true);
    setVideoModalOpen(true);
    
    // Simulate searching for doctor
    setTimeout(() => {
      setVideoLoading(false);
      toast.error("Dr. Snehh Kumar will be available later — please choose Chat or try again.");
    }, 10000);
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

      <Dialog open={videoModalOpen} onOpenChange={setVideoModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Video Consultation</DialogTitle>
            <DialogDescription>
              {videoLoading ? 'Connecting you with Dr. Snehh Kumar...' : 'Connection Status'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-8">
            {videoLoading ? (
              <>
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-sm text-muted-foreground">Searching for available doctor...</p>
              </>
            ) : (
              <p className="text-center">Doctor is currently unavailable. Please try chat or book an appointment.</p>
            )}
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
