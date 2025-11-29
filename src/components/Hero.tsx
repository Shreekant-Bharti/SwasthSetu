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
            className="inline-block px-6 sm:px-10 md:px-12 py-6 sm:py-8 md:py-10 rounded-[24px] sm:rounded-[30px] mb-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/20 animate-scale-in backdrop-blur-[25px]"
            style={{ 
              background: 'rgba(255, 255, 255, 0.18)',
              backdropFilter: 'blur(25px)',
              WebkitBackdropFilter: 'blur(25px)'
            }}
          >
            <div className="relative">
              <h1 
                className="font-black tracking-wider mb-0 leading-[1.1] relative"
                style={{ 
                  fontFamily: "'Poppins', 'Inter', sans-serif",
                  fontSize: 'clamp(28px, 8vw, 96px)',
                  fontWeight: '900',
                  letterSpacing: '1px',
                  background: 'linear-gradient(135deg, #006F7A 0%, #FF7A6E 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 4px 20px rgba(0, 0, 0, 0.4)) drop-shadow(0 0 40px rgba(255, 255, 255, 0.3))',
                  textShadow: '0 0 60px rgba(0, 111, 122, 0.5), 0 0 80px rgba(255, 122, 110, 0.4)',
                }}
              >
                <span className="relative inline-block">
                  SwasthSetu
                  {/* Shimmer Effect */}
                  <span 
                    className="absolute inset-0 opacity-40"
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.6) 50%, transparent 100%)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 6s linear infinite',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                    }}
                  />
                </span>
              </h1>
            </div>
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
