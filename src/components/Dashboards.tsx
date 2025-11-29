import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Stethoscope, Building2, Pill, Shield, Settings } from "lucide-react";
import DashboardCard from "./DashboardCard";
import AuthModal from "./AuthModal";
import { User } from "@/lib/localStorage";

const Dashboards = () => {
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'patient' | 'doctor' | 'hospital' | 'pharmacy' | 'insurance' | 'admin'>('patient');

  const handleDashboardClick = (role: 'patient' | 'doctor' | 'hospital' | 'pharmacy' | 'insurance' | 'admin') => {
    setSelectedRole(role);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (user: User) => {
    navigate(`/${user.role}`);
  };

  const dashboards = [
    { icon: Users, title: "Patient Dashboard", description: "Book appointments, consult online, track health", role: 'patient' as const },
    { icon: Stethoscope, title: "Doctor Dashboard", description: "Manage appointments, patient consultations", role: 'doctor' as const },
    { icon: Building2, title: "Hospital Dashboard", description: "Monitor beds, manage staff, track patients", role: 'hospital' as const },
    { icon: Pill, title: "Pharmacy Dashboard", description: "Manage inventory, track prescriptions", role: 'pharmacy' as const },
    { icon: Shield, title: "Insurance Dashboard", description: "Check eligibility, manage claims", role: 'insurance' as const },
    { icon: Settings, title: "Admin Dashboard", description: "User management, approvals, analytics", role: 'admin' as const },
  ];

  return (
    <>
      <section id="dashboards" className="relative py-20 bg-gradient-to-br from-background via-secondary/10 to-background overflow-hidden">
        {/* Decorative Blobs */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-br from-teal/20 to-transparent rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-br from-coral/20 to-transparent rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl sm:text-5xl font-extrabold mb-4 bg-gradient-to-r from-teal via-indigo to-coral bg-clip-text text-transparent">
              Choose Your Dashboard
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Select your role to access your personalized healthcare dashboard
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {dashboards.map((dashboard, index) => (
              <div 
                key={index} 
                onClick={() => handleDashboardClick(dashboard.role)} 
                className="cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <DashboardCard icon={dashboard.icon} title={dashboard.title} description={dashboard.description} />
              </div>
            ))}
          </div>
        </div>
      </section>
      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} onSuccess={handleAuthSuccess} role={selectedRole} />
    </>
  );
};

export default Dashboards;
