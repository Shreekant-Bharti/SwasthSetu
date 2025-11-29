import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { login, register, User } from "@/lib/localStorage";
import { toast } from "sonner";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  role: 'patient' | 'doctor' | 'hospital' | 'pharmacy' | 'insurance' | 'admin';
}

const AuthModal = ({ open, onClose, onSuccess, role }: AuthModalProps) => {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regVillage, setRegVillage] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate loading for better UX
    setTimeout(() => {
      const user = login(loginEmail.trim(), loginPassword);
      
      if (user && user.role === role) {
        toast.success("Login successful!", {
          description: `Welcome back, ${user.name}!`,
          icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
        });
        setIsLoading(false);
        onSuccess(user);
        onClose();
        // Reset form
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

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSBQNY6zn77BZGw1No+HyvmsgBTGG0fPTgjMGHm7A7+OZSBQNY6zn77BZGw1No+HyvmsgBTGG0fPTgjMGHm7A7+OZSBQNY6zn77BZGw1No+HyvmsgBTGG0fPTgjMGHm7A7+OZSBQNYazn77BZGw1No+HyvmsgBTGG0fPTgjMGHm7A7+OZSBQNYazn77BZGw=');
    audio.play().catch(() => {});
    register({ role, name: regName, phone: regPhone, village: regVillage, email: regEmail });
    toast.success("Registration submitted! Wait for approval.", { duration: 4000 });
    onClose();
  };

  const demoCredentials = {
    patient: { email: 'patient1@test', password: 'patient123' },
    doctor: { email: 'drsnehh@test', password: 'doctor123' },
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{role.charAt(0).toUpperCase() + role.slice(1)} Portal</DialogTitle>
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
          
          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reg-name">Name</Label>
                <Input id="reg-name" value={regName} onChange={(e) => setRegName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-phone">Phone</Label>
                <Input id="reg-phone" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-village">Village</Label>
                <Input id="reg-village" value={regVillage} onChange={(e) => setRegVillage(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-email">Email</Label>
                <Input id="reg-email" type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full transition-all hover:scale-105">Register</Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
