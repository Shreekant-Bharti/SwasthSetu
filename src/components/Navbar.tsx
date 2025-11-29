import { Heart } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-primary fill-primary" />
            <span className="text-xl font-bold text-foreground">SwasthSetu <span className="emoji-float">🩺</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <a href="#home" className="text-foreground hover:text-primary transition-colors">Home</a>
            <a href="#dashboards" className="text-foreground hover:text-primary transition-colors">Dashboards</a>
            <a href="#features" className="text-foreground hover:text-primary transition-colors">Features</a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
