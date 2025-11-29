import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { login, User } from "@/lib/localStorage";
import { getApprovedCredential } from "@/lib/registrations";
import { toast } from "sonner";
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { playChimeSound } from "@/lib/sounds";

// Import role-specific registration forms
import PatientRegistrationForm from "@/components/registration/PatientRegistrationForm";
import DoctorRegistrationForm from "@/components/registration/DoctorRegistrationForm";
import HospitalRegistrationForm from "@/components/registration/HospitalRegistrationForm";
import PharmacyRegistrationForm from "@/components/registration/PharmacyRegistrationForm";
import InsuranceRegistrationForm from "@/components/registration/InsuranceRegistrationForm";
import AdminRegistrationForm from "@/components/registration/AdminRegistrationForm";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  role: 'patient' | 'doctor' | 'hospital' | 'pharmacy' | 'insurance' | 'admin';
}

const AuthModal = ({ open, onClose, onSuccess, role }: AuthModalProps) => {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      // First check default credentials
      let user = login(loginEmail.trim(), loginPassword);
      
      // If not found, check approved registrations
      if (!user) {
        const approvedCred = getApprovedCredential(loginEmail.trim());
        if (approvedCred && approvedCred.password === loginPassword && approvedCred.role === role) {
          // Create a user object for approved registration
          user = {
            id: Date.now().toString(),
            role: approvedCred.role as User['role'],
            name: approvedCred.name,
            phone: '9876543210',
            village: 'Registered',
            email: approvedCred.email,
            status: 'active'
          };
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
      }
      
      if (user && user.role === role) {
        toast.success("Login successful!", {
          description: `Welcome back, ${user.name}!`,
          icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
        });
        setIsLoading(false);
        onSuccess(user);
        onClose();
        setLoginEmail('');
        setLoginPassword('');
      } else if (user && user.role !== role) {
        toast.error(`Wrong Portal`, {
          description: `Please use the ${user.role} dashboard to login`,
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
        });
        setIsLoading(false);
      } else {
        toast.error("Invalid Credentials", {
          description: "Please check your email and password",
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
        });
        setIsLoading(false);
      }
    }, 500);
  };

  const handleRegistrationSuccess = () => {
    playChimeSound();
    setShowSuccessPopup(true);
  };

  const closeSuccessPopup = () => {
    setShowSuccessPopup(false);
    onClose();
  };

  const demoCredentials = {
    patient: { email: 'patient1@test', password: 'patient123' },
    doctor: { email: 'drsneha@test', password: 'doctor123' },
    hospital: { email: 'hospital@swasthsetu.com', password: 'hospital123' },
    pharmacy: { email: 'pharmacy@swasthsetu.com', password: 'pharmacy123' },
    insurance: { email: 'insurance@swasthsetu.com', password: 'insurance123' },
    admin: { email: 'admin@swasthsetu.com', password: 'admin123' }
  };

  const fillDemoCredentials = () => {
    const creds = demoCredentials[role];
    setLoginEmail(creds.email);
    setLoginPassword(creds.password);
    toast.info("Demo credentials filled", {
      description: "Click Login to continue",
    });
  };

  const roleLabels = {
    patient: 'Patient',
    doctor: 'Doctor',
    hospital: 'Hospital',
    pharmacy: 'Pharmacy',
    insurance: 'Insurance',
    admin: 'Admin'
  };

  // Render role-specific registration form
  const renderRegistrationForm = () => {
    switch (role) {
      case 'patient':
        return <PatientRegistrationForm onSuccess={handleRegistrationSuccess} />;
      case 'doctor':
        return <DoctorRegistrationForm onSuccess={handleRegistrationSuccess} />;
      case 'hospital':
        return <HospitalRegistrationForm onSuccess={handleRegistrationSuccess} />;
      case 'pharmacy':
        return <PharmacyRegistrationForm onSuccess={handleRegistrationSuccess} />;
      case 'insurance':
        return <InsuranceRegistrationForm onSuccess={handleRegistrationSuccess} />;
      case 'admin':
        return <AdminRegistrationForm onSuccess={handleRegistrationSuccess} />;
      default:
        return null;
    }
  };

  return (
    <>
      <Dialog open={open && !showSuccessPopup} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{roleLabels[role]} Portal</DialogTitle>
            <DialogDescription>Login or register to access your {role} dashboard</DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input 
                    id="login-email"
                    type="email"
                    value={loginEmail} 
                    onChange={(e) => setLoginEmail(e.target.value)} 
                    placeholder="Enter your email"
                    required 
                    className="transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input 
                    id="login-password"
                    type="password" 
                    value={loginPassword} 
                    onChange={(e) => setLoginPassword(e.target.value)} 
                    placeholder="Enter your password"
                    required 
                    className="transition-all"
                  />
                </div>
                
                <div className="bg-muted/50 p-3 rounded-lg border border-border">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Demo Credentials:</p>
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-mono">
                      <p>{demoCredentials[role].email}</p>
                      <p className="text-muted-foreground">{demoCredentials[role].password}</p>
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={fillDemoCredentials}
                      className="text-xs"
                    >
                      Auto-fill
                    </Button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full transition-all hover:scale-105" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Logging in...
                    </span>
                  ) : (
                    'Login'
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register" className="mt-4">
              {renderRegistrationForm()}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Success Popup Modal */}
      <Dialog open={showSuccessPopup} onOpenChange={closeSuccessPopup}>
        <DialogContent className="sm:max-w-md animate-scale-in">
          <div className="text-center py-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
              <Clock className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-2xl font-bold text-green-700 mb-2">
              Thank you for registering!
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground mb-6">
              Your registration has been submitted successfully. Please wait for approval. 
              You will receive your login credentials once approved.
            </DialogDescription>
            <Button onClick={closeSuccessPopup} className="w-full bg-green-600 hover:bg-green-700">
              Got it!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AuthModal;
