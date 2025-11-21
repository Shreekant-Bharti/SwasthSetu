import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  title: string;
  icon: LucideIcon;
}

const FeatureCard = ({ title, icon: Icon }: FeatureCardProps) => {
  return (
    <div className="group relative bg-gradient-to-br from-card to-card/80 border-2 border-primary/20 rounded-2xl p-8 hover:shadow-2xl hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 hover:scale-105">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="p-5 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl group-hover:from-primary/30 group-hover:to-accent/30 transition-all duration-300 shadow-lg group-hover:shadow-xl">
          <Icon className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{title}</h3>
      </div>
    </div>
  );
};

export default FeatureCard;
