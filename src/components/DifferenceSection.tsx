import { Heart, Users, Clock, Shield } from "lucide-react";

const DifferenceSection = () => {
  const differences = [
    {
      icon: Heart,
      title: "Village-Centric Care",
      description: "Healthcare designed specifically for rural communities with local language support and culturally sensitive services"
    },
    {
      icon: Users,
      title: "Community Network",
      description: "Connected network of local doctors, hospitals, pharmacies, and insurance providers working together"
    },
    {
      icon: Clock,
      title: "24/7 Accessibility",
      description: "Round-the-clock access to medical consultations, appointment booking, and emergency services"
    },
    {
      icon: Shield,
      title: "Family Insurance",
      description: "Affordable family health insurance plans tailored for rural households with easy claim processes"
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            How We Are Different
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transforming rural healthcare with technology and compassion
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {differences.map((item, index) => (
            <div
              key={index}
              className="bg-card p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <item.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-3">
                {item.title}
              </h3>
              <p className="text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DifferenceSection;
