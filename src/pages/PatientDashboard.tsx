import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "@/lib/localStorage";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, LogOut } from "lucide-react";
import WelcomeCard from "@/components/patient/WelcomeCard";
import SymptomChecker from "@/components/patient/SymptomChecker";
import BookAppointment from "@/components/patient/BookAppointment";
import OnlineConsultation from "@/components/patient/OnlineConsultation";
import MedicineReservation from "@/components/patient/MedicineReservation";
import FamilyInsurance from "@/components/patient/FamilyInsurance";
import AppointmentHistory from "@/components/patient/AppointmentHistory";
import EmergencyContacts from "@/components/patient/EmergencyContacts";
import PrescriptionView from "@/components/patient/PrescriptionView";
import NotificationsPanel from "@/components/patient/NotificationsPanel";

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser());

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'patient') {
      navigate('/');
    } else {
      setUser(currentUser);
    }
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">SwasthSetu</h1>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {user.status === 'pending' && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your account is pending approval. Some features may be limited until an admin approves your registration.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-8">
          <WelcomeCard user={user} />
          <NotificationsPanel userId={user.id} />
          <PrescriptionView userId={user.id} />
          <SymptomChecker />
          <div className="grid md:grid-cols-2 gap-6">
            <BookAppointment userId={user.id} userName={user.name} />
            <OnlineConsultation userId={user.id} userName={user.name} />
          </div>
          <MedicineReservation />
          <div className="grid md:grid-cols-2 gap-6">
            <FamilyInsurance userId={user.id} />
            <EmergencyContacts />
          </div>
          <AppointmentHistory userId={user.id} />
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;
