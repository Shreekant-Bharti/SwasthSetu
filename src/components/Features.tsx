import { useState, useEffect } from "react";
import FeatureCard from "./FeatureCard";
import { Calendar, Smartphone, Activity, MessageSquare, Pill, DollarSign, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

const features = [
  { 
    title: "Fast Appointments", 
    icon: Calendar,
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
    description: "Book appointments with local doctors instantly"
  },
  { 
    title: "Village-Friendly UI", 
    icon: Smartphone,
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80",
    description: "Simple interface designed for rural communities"
  },
  { 
    title: "Smart Symptom Checker", 
    icon: Activity,
    image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80",
    description: "Quick health assessment based on symptoms"
  },
  { 
    title: "One-Click Consultation", 
    icon: MessageSquare,
    image: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&q=80",
    description: "Connect with doctors via chat or video call"
  },
  { 
    title: "Real-Time Medicine Info", 
    icon: Pill,
    image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&q=80",
    description: "Check medicine availability at nearby pharmacies"
  },
  { 
    title: "Affordable Insurance Plans", 
    icon: DollarSign,
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
    description: "Family health insurance for rural India"
  },
];

const Features = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % features.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + features.length) % features.length);
  };

  return (
    <section id="features" className="py-20 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-foreground mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Features That Matter
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
            Healthcare services designed for rural India
          </p>
        </div>

        {/* Image Carousel */}
        <div className="relative mb-16 max-w-5xl mx-auto">
          <div className="overflow-hidden rounded-2xl shadow-2xl">
            <div className="relative h-96 bg-muted">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-700 ${
                    index === currentSlide ? 'opacity-100 translate-x-0' : 
                    index < currentSlide ? 'opacity-0 -translate-x-full' : 
                    'opacity-0 translate-x-full'
                  }`}
                >
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-hero-overlay via-hero-overlay/70 to-transparent flex items-end">
                    <div className="p-8 text-white w-full">
                      <div className="flex items-center gap-3 mb-3">
                        <feature.icon className="w-8 h-8" />
                        <h3 className="text-3xl font-bold">{feature.title}</h3>
                      </div>
                      <p className="text-lg text-white/90">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <Button
            onClick={prevSlide}
            variant="secondary"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full shadow-lg hover:scale-110 transition-transform"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button
            onClick={nextSlide}
            variant="secondary"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full shadow-lg hover:scale-110 transition-transform"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide ? 'bg-primary w-8' : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        </div>
        
        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <FeatureCard key={feature.title} title={feature.title} icon={feature.icon} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
