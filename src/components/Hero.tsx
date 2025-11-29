import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Hero = () => {
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [email, setEmail] = useState("");

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      // Play success sound
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSBQNY6zn77BZGw1No+HyvmsgBTGG0fPTgjMGHm7A7+OZSBQNY6zn77BZGw1No+HyvmsgBTGG0fPTgjMGHm7A7+OZSBQNY6zn77BZGw1No+HyvmsgBTGG0fPTgjMGHm7A7+OZSBQNYazn77BZGw1No+HyvmsgBTGG0fPTgjMGHm7A7+OZSBQNYazn77BZGw=');
      audio.play().catch(() => {});
      
      toast.success("Thank you! We will get back to you soon.", {
        duration: 4000,
      });
      setEmailModalOpen(false);
      setEmail("");
    } else {
      toast.error("Please enter a valid email address");
    }
  };

  return (
    <>
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        
        {/* Dark Teal Gradient Overlay for Better Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#003a42]/95 via-[#004d57]/85 to-[#003a42]/75 z-[1]" />
        
        {/* Subtle Animated Particles */}
        <div className="absolute inset-0 z-[2]">
          <div className="absolute top-20 left-20 w-2 h-2 bg-teal/40 rounded-full animate-float"></div>
          <div className="absolute top-40 right-32 w-3 h-3 bg-coral/30 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-32 left-40 w-2 h-2 bg-white/20 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-20 right-20 w-3 h-3 bg-teal/30 rounded-full animate-float" style={{ animationDelay: '3s' }}></div>
        </div>
      
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Premium Glassmorphism Title Card */}
          <div 
            className="inline-block px-8 sm:px-14 md:px-16 py-8 sm:py-10 md:py-12 rounded-[28px] sm:rounded-[36px] mb-8 animate-scale-in"
            style={{ 
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.12) 100%)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5), 0 0 60px rgba(0, 111, 122, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
              border: '1.5px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            <h1 
              className="font-black tracking-wide mb-0 leading-[1.05] title-gradient"
              style={{ 
                fontFamily: "'Poppins', sans-serif",
                fontSize: 'clamp(32px, 10vw, 96px)',
                fontWeight: '900',
                letterSpacing: '3px',
                textShadow: '0 4px 30px rgba(0, 168, 181, 0.6), 0 0 60px rgba(255, 107, 91, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3)',
              }}
            >
              <span className="text-[#00B8C5]">Swasth</span>
              <span className="text-[#FF7A6E]">Setu</span>
            </h1>
          </div>

          {/* Bilingual Tagline */}
          <p 
            className="text-base sm:text-lg md:text-xl lg:text-[22px] font-medium mb-8 animate-fade-in-delay text-white/95 max-w-4xl mx-auto leading-relaxed"
            style={{ 
              animationDelay: '0.3s',
              letterSpacing: '0.5px',
              fontFamily: "'Poppins', sans-serif",
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)'
            }}
          >
            Healthcare services designed for rural India — <span className="italic font-normal">सेवाएँ गाँव के लिए</span>
          </p>
          
          <p className="text-lg sm:text-xl md:text-2xl text-white/85 mb-4 font-semibold animate-fade-in drop-shadow-lg" style={{ animationDelay: '0.4s' }}>
            Bridging Healthcare for Rural India
          </p>
          <p className="text-sm sm:text-base md:text-lg text-white/75 max-w-3xl mx-auto mb-12 animate-fade-in drop-shadow-md leading-relaxed" style={{ animationDelay: '0.5s' }}>
            Connecting villages with quality healthcare through smart appointments,
            online consultations, and integrated insurance solutions
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-[#006F7A] to-[#008B9A] hover:from-[#005561] hover:to-[#007280] text-white font-bold shadow-[0_10px_30px_rgba(0,111,122,0.4)] hover:shadow-[0_15px_40px_rgba(0,111,122,0.6)] transition-all duration-300 hover:scale-105 text-base sm:text-lg px-8 py-6"
              onClick={() => setEmailModalOpen(true)}
            >
              Get Started
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-white border-2 border-white/40 hover:bg-white/20 font-bold shadow-lg backdrop-blur-sm text-base sm:text-lg px-8 py-6 transition-all duration-300 hover:scale-105"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)'
              }}
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Get Started with SwasthSetu</DialogTitle>
            <DialogDescription>
              Enter your email and we'll get back to you soon
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Submit
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Hero;
