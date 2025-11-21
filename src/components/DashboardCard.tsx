import { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const DashboardCard = ({ icon: Icon, title, description }: DashboardCardProps) => {
  return (
    <div className="group relative bg-gradient-to-br from-card via-card to-secondary/30 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:scale-105 cursor-pointer border-2 border-primary/20 hover:border-primary/60 animate-scale-in overflow-hidden">
      {/* Gradient Overlay on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal/5 via-transparent to-coral/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-gradient-to-br from-teal/20 to-coral/20 p-4 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-md">
            <Icon className="w-8 h-8 text-primary group-hover:text-teal transition-colors" />
          </div>
          <h3 className="text-xl font-bold text-card-foreground group-hover:text-primary transition-colors">{title}</h3>
        </div>
        <p className="text-muted-foreground group-hover:text-foreground/80 transition-colors">{description}</p>
      </div>
      
      {/* Decorative Corner Element */}
      <div className="absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-br from-teal/10 to-coral/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    </div>
  );
};

export default DashboardCard;
