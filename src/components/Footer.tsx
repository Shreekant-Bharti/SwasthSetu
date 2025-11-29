import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-br from-hero-overlay via-hero-overlay-light to-hero-overlay border-t-4 border-primary/30 overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal via-indigo to-coral"></div>
      <div className="absolute top-10 right-20 w-40 h-40 bg-teal/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-20 w-60 h-60 bg-coral/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 group">
              <Heart className="w-8 h-8 text-coral animate-pulse" />
              <span className="text-2xl font-bold bg-gradient-to-r from-teal to-coral bg-clip-text text-transparent">SwasthSetu <span className="emoji-float">🩺</span></span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              Bridging healthcare for rural India with compassion and technology
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-2 rounded-full bg-white/10 hover:bg-teal/30 text-white hover:text-teal transition-all duration-300 hover:scale-110">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-white/10 hover:bg-indigo/30 text-white hover:text-indigo transition-all duration-300 hover:scale-110">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-white/10 hover:bg-coral/30 text-white hover:text-coral transition-all duration-300 hover:scale-110">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-white/10 hover:bg-soft-green/30 text-white hover:text-soft-green transition-all duration-300 hover:scale-110">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-white mb-4 text-lg">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#home" className="text-white/70 hover:text-teal transition-all duration-300 hover:translate-x-1 inline-block">Home</a></li>
              <li><a href="#dashboards" className="text-white/70 hover:text-teal transition-all duration-300 hover:translate-x-1 inline-block">Dashboards</a></li>
              <li><a href="#features" className="text-white/70 hover:text-teal transition-all duration-300 hover:translate-x-1 inline-block">Features</a></li>
              <li><a href="#about" className="text-white/70 hover:text-teal transition-all duration-300 hover:translate-x-1 inline-block">About Us</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold text-white mb-4 text-lg">Services</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-white/70 hover:text-coral transition-all duration-300 hover:translate-x-1 inline-block">Online Consultation</a></li>
              <li><a href="#" className="text-white/70 hover:text-coral transition-all duration-300 hover:translate-x-1 inline-block">Appointment Booking</a></li>
              <li><a href="#" className="text-white/70 hover:text-coral transition-all duration-300 hover:translate-x-1 inline-block">Medicine Reservation</a></li>
              <li><a href="#" className="text-white/70 hover:text-coral transition-all duration-300 hover:translate-x-1 inline-block">Family Insurance</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-white mb-4 text-lg">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-white/70 hover:text-white transition-colors">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0 text-teal" />
                <span className="text-sm">Rural Health Initiative, New Delhi, India</span>
              </li>
              <li className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                <Phone className="w-5 h-5 flex-shrink-0 text-indigo" />
                <span className="text-sm">+91 1800-XXX-XXXX</span>
              </li>
              <li className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                <Mail className="w-5 h-5 flex-shrink-0 text-coral" />
                <span className="text-sm">support@swasthsetu.in</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/60">
            © 2025 SwasthSetu. All rights reserved. <span className="text-coral">❤️</span> Made for Rural India
          </p>
          <div className="flex gap-6 text-sm text-white/60">
            <a href="#" className="hover:text-teal transition-colors duration-300">Privacy Policy</a>
            <a href="#" className="hover:text-coral transition-colors duration-300">Terms of Service</a>
            <a href="#" className="hover:text-indigo transition-colors duration-300">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
