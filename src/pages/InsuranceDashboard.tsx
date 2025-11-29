import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout, getPendingInsuranceRequests, updateInsuranceStatus, Insurance, getUsers, getPatientHistory, getPrescriptions } from "@/lib/localStorage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Shield, Users, IndianRupee, Phone, CheckCircle, XCircle, FileText, History } from "lucide-react";
import { toast } from "sonner";

const InsuranceDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser());
  const [pendingRequests, setPendingRequests] = useState<Insurance[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Insurance | null>(null);
  const [showPatientProfile, setShowPatientProfile] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'insurance') {
      navigate('/');
    } else {
      setUser(currentUser);
      loadPendingRequests();
    }

    // Auto-refresh every 3 seconds
    const interval = setInterval(loadPendingRequests, 3000);
    return () => clearInterval(interval);
  }, [navigate]);

  const loadPendingRequests = () => {
    setPendingRequests(getPendingInsuranceRequests());
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleViewProfile = (insurance: Insurance) => {
    setSelectedPatient(insurance);
    setShowPatientProfile(true);
  };

  const handleCallCustomer = (insurance: Insurance) => {
    const users = getUsers();
    const patient = users.find(u => u.id === insurance.userId);
    if (patient) {
      toast.info(`Calling ${patient.name || patient.email}...`);
      // Simulate call
      setTimeout(() => {
        toast.success("Call connected!");
      }, 1000);
    }
  };

  const handleApprove = (insurance: Insurance) => {
    updateInsuranceStatus(insurance.id, 'active');
    toast.success("Insurance approved! Patient will be notified.");
    loadPendingRequests();
    setShowPatientProfile(false);
  };

  const handleDecline = (insurance: Insurance) => {
    updateInsuranceStatus(insurance.id, 'declined');
    toast.info("Insurance declined. Refund will be processed.");
    loadPendingRequests();
    setShowPatientProfile(false);
  };

  if (!user) return null;

  const plans = [
    {
      name: "Basic Family Plan",
      coverage: "₹2,00,000",
      premium: "₹500/month",
      features: ["4 family members", "OPD coverage", "Medicine coverage"]
    },
    {
      name: "Premium Family Plan",
      coverage: "₹5,00,000",
      premium: "₹1,000/month",
      features: ["6 family members", "OPD + IPD coverage", "Medicine + Surgery coverage", "Annual health checkup"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">SwasthSetu - Insurance Portal</h1>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Pending Insurance Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Pending Insurance Requests ({pendingRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingRequests.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No pending requests</p>
              ) : (
                pendingRequests.map((insurance) => (
                  <div 
                    key={insurance.id} 
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleViewProfile(insurance)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-lg">{insurance.patientName}</p>
                        <p className="text-sm text-muted-foreground">{insurance.patientEmail}</p>
                        <p className="text-xs text-muted-foreground mt-1">Order ID: {insurance.orderId}</p>
                      </div>
                      <Badge variant="outline" className="bg-yellow-50">
                        Pending
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Plan</p>
                        <p className="font-semibold">{insurance.plan}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Coverage</p>
                        <p className="font-semibold">{insurance.coverage}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Premium</p>
                        <p className="font-semibold text-primary">₹{insurance.planPrice}/year</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Family Members</p>
                        <p className="font-semibold">{insurance.familyMembers.length}</p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-muted-foreground mb-2">Members:</p>
                      <div className="space-y-1">
                        {insurance.familyMembers.map((member, idx) => (
                          <p key={idx} className="text-xs">
                            • {member.name} ({member.age}y, {member.relation})
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCallCustomer(insurance);
                        }} 
                        variant="outline" 
                        size="sm"
                        className="flex-1"
                      >
                        <Phone className="mr-2 h-4 w-4" />
                        Call
                      </Button>
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewProfile(insurance);
                        }} 
                        size="sm"
                        className="flex-1"
                      >
                        View Profile
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Available Plans */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Available Insurance Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {plans.map((plan, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">{plan.name}</h4>
                  <p className="text-2xl font-bold text-primary mb-2">₹{plan.coverage}</p>
                  <p className="text-sm text-muted-foreground mb-3">{plan.premium}</p>
                  <ul className="space-y-1 text-xs">
                    {plan.features.map((feature, idx) => (
                      <li key={idx}>✓ {feature}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Patient Profile Dialog */}
      <Dialog open={showPatientProfile} onOpenChange={setShowPatientProfile}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Patient Profile</DialogTitle>
          </DialogHeader>
          
          {selectedPatient && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="medical">Medical History</TabsTrigger>
                <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
                <TabsTrigger value="insurance">Insurance History</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-semibold">{selectedPatient.patientName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-semibold">{selectedPatient.patientEmail}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Order ID</p>
                        <p className="font-mono text-sm">{selectedPatient.orderId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Payment Method</p>
                        <p className="font-semibold capitalize">{selectedPatient.paymentMethod}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t">
                      <p className="text-sm text-muted-foreground mb-2">Selected Plan</p>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="font-semibold">{selectedPatient.plan}</p>
                        <p className="text-sm text-muted-foreground">Coverage: {selectedPatient.coverage}</p>
                        <p className="text-lg font-bold text-primary mt-1">₹{selectedPatient.planPrice}/year</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t">
                      <p className="text-sm text-muted-foreground mb-2">Family Members ({selectedPatient.familyMembers.length})</p>
                      <div className="space-y-2">
                        {selectedPatient.familyMembers.map((member, idx) => (
                          <div key={idx} className="bg-muted p-3 rounded-lg">
                            <p className="font-semibold">{member.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {member.age} years old • {member.relation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="medical" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <History className="h-5 w-5" />
                      Medical History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Sample medical history data</p>
                    <div className="mt-3 space-y-2">
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="font-semibold text-sm">Previous Consultation</p>
                        <p className="text-xs text-muted-foreground">2024-01-15 - General checkup</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="prescriptions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Previous Prescriptions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Sample prescription history</p>
                    <div className="mt-3 space-y-2">
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="font-semibold text-sm">Prescription #123</p>
                        <p className="text-xs text-muted-foreground">2024-01-10 - Dr. Snehh Kumar</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="insurance" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Insurance Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">No previous insurance records</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          <div className="flex gap-3 pt-4 border-t">
            <Button 
              onClick={() => selectedPatient && handleCallCustomer(selectedPatient)} 
              variant="outline" 
              className="flex-1"
            >
              <Phone className="mr-2 h-4 w-4" />
              Call Customer
            </Button>
            <Button 
              onClick={() => selectedPatient && handleApprove(selectedPatient)} 
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Insure
            </Button>
            <Button 
              onClick={() => selectedPatient && handleDecline(selectedPatient)} 
              variant="destructive" 
              className="flex-1"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Decline
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InsuranceDashboard;
