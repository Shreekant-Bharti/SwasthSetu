import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  getAllPendingRegistrations, 
  getRegistrations, 
  approveRegistration, 
  declineRegistration,
  Registration,
  PatientRegistration,
  DoctorRegistration,
  HospitalRegistration,
  PharmacyRegistration,
  InsuranceRegistration,
  AdminRegistration
} from "@/lib/registrations";
import { toast } from "sonner";
import { playSuccessSound, playCancelSound, playChimeSound } from "@/lib/sounds";
import { CheckCircle, XCircle, User, Stethoscope, Building, Pill, Shield, UserCog, Clock, Eye } from "lucide-react";

const PendingRegistrations = () => {
  const [pendingRegs, setPendingRegs] = useState<Registration[]>([]);
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [approvedCredentials, setApprovedCredentials] = useState<{ username: string; password: string } | null>(null);

  const loadPendingRegistrations = () => {
    setPendingRegs(getAllPendingRegistrations());
  };

  useEffect(() => {
    loadPendingRegistrations();
    const interval = setInterval(loadPendingRegistrations, 3000);
    return () => clearInterval(interval);
  }, []);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'patient': return <User className="h-4 w-4" />;
      case 'doctor': return <Stethoscope className="h-4 w-4" />;
      case 'hospital': return <Building className="h-4 w-4" />;
      case 'pharmacy': return <Pill className="h-4 w-4" />;
      case 'insurance': return <Shield className="h-4 w-4" />;
      case 'admin': return <UserCog className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'patient': return 'bg-blue-500';
      case 'doctor': return 'bg-green-500';
      case 'hospital': return 'bg-purple-500';
      case 'pharmacy': return 'bg-orange-500';
      case 'insurance': return 'bg-teal-500';
      case 'admin': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getDisplayName = (reg: Registration): string => {
    if ('fullName' in reg) return reg.fullName;
    if ('hospitalName' in reg) return reg.hospitalName;
    if ('pharmacyName' in reg) return reg.pharmacyName;
    if ('companyName' in reg) return reg.companyName;
    if ('adminName' in reg) return reg.adminName;
    return 'Unknown';
  };

  const handleApprove = (reg: Registration) => {
    const credentials = approveRegistration(reg.id, reg.role as any);
    if (credentials) {
      playChimeSound();
      setApprovedCredentials(credentials);
      setSelectedReg(reg);
      setShowCredentialsModal(true);
      loadPendingRegistrations();
      toast.success("Registration approved!");
    } else {
      toast.error("Failed to approve registration");
    }
  };

  const handleDecline = () => {
    if (!selectedReg) return;
    if (!declineReason.trim()) {
      toast.error("Please provide a reason for declining");
      return;
    }
    
    declineRegistration(selectedReg.id, selectedReg.role as any, declineReason);
    playCancelSound();
    toast.error("Registration declined");
    setShowDeclineModal(false);
    setDeclineReason("");
    setSelectedReg(null);
    loadPendingRegistrations();
  };

  const openDeclineModal = (reg: Registration) => {
    setSelectedReg(reg);
    setDeclineReason("");
    setShowDeclineModal(true);
  };

  const openDetailsModal = (reg: Registration) => {
    setSelectedReg(reg);
    setShowDetailsModal(true);
  };

  const renderRegDetails = (reg: Registration) => {
    switch (reg.role) {
      case 'patient': {
        const p = reg as PatientRegistration;
        return (
          <div className="space-y-2 text-sm">
            <p><strong>Age:</strong> {p.age} | <strong>Gender:</strong> {p.gender}</p>
            <p><strong>Village:</strong> {p.village}</p>
            <p><strong>Mobile:</strong> {p.mobile}</p>
            {p.email && <p><strong>Email:</strong> {p.email}</p>}
            <p><strong>Emergency Contact:</strong> {p.emergencyContactName} ({p.emergencyContactNumber})</p>
            <p><strong>Family Insurance:</strong> {p.hasFamilyInsurance ? 'Yes' : 'No'}</p>
            {p.medicalHistory && <p><strong>Medical History:</strong> {p.medicalHistory}</p>}
          </div>
        );
      }
      case 'doctor': {
        const d = reg as DoctorRegistration;
        return (
          <div className="space-y-2 text-sm">
            <p><strong>License:</strong> {d.licenseNumber}</p>
            <p><strong>Specialization:</strong> {d.specialization}</p>
            <p><strong>Experience:</strong> {d.yearsOfExperience} years</p>
            <p><strong>Hospital:</strong> {d.hospitalAffiliation}</p>
            <p><strong>Mobile:</strong> {d.mobile} | <strong>Email:</strong> {d.email}</p>
            {d.bio && <p><strong>Bio:</strong> {d.bio}</p>}
          </div>
        );
      }
      case 'hospital': {
        const h = reg as HospitalRegistration;
        return (
          <div className="space-y-2 text-sm">
            <p><strong>Registration ID:</strong> {h.registrationId}</p>
            <p><strong>Type:</strong> {h.type}</p>
            <p><strong>Address:</strong> {h.address}</p>
            <p><strong>Beds:</strong> {h.numberOfBeds}</p>
            <p><strong>Contact:</strong> {h.contactPersonName} ({h.contactPersonMobile})</p>
            <p><strong>Email:</strong> {h.email}</p>
            {h.opdHours && <p><strong>OPD Hours:</strong> {h.opdHours}</p>}
          </div>
        );
      }
      case 'pharmacy': {
        const ph = reg as PharmacyRegistration;
        return (
          <div className="space-y-2 text-sm">
            <p><strong>Owner:</strong> {ph.ownerName}</p>
            <p><strong>Registration:</strong> {ph.registrationNumber}</p>
            <p><strong>Address:</strong> {ph.address}</p>
            <p><strong>Mobile:</strong> {ph.mobile}</p>
            {ph.timings && <p><strong>Timings:</strong> {ph.timings}</p>}
            <p><strong>Categories:</strong> {ph.medicineCategories.join(', ')}</p>
          </div>
        );
      }
      case 'insurance': {
        const i = reg as InsuranceRegistration;
        return (
          <div className="space-y-2 text-sm">
            <p><strong>Type:</strong> {i.type}</p>
            <p><strong>License/ID:</strong> {i.licenseId}</p>
            <p><strong>Contact:</strong> {i.contactPersonName} ({i.contactPersonMobile})</p>
            <p><strong>Email:</strong> {i.email}</p>
            {i.coveragePlans && <p><strong>Plans:</strong> {i.coveragePlans}</p>}
          </div>
        );
      }
      case 'admin': {
        const a = reg as AdminRegistration;
        return (
          <div className="space-y-2 text-sm">
            <p><strong>Organization:</strong> {a.organizationName}</p>
            <p><strong>Email:</strong> {a.email}</p>
            <p><strong>Mobile:</strong> {a.mobile}</p>
            {a.roleDescription && <p><strong>Role:</strong> {a.roleDescription}</p>}
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <>
      <Card className="shadow-xl border-2 border-primary/20">
        <CardHeader className="bg-gradient-to-r from-orange-100 to-red-100">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Clock className="h-6 w-6 text-orange-600" />
            Pending Registrations ({pendingRegs.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {pendingRegs.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No pending registrations</p>
          ) : (
            <div className="space-y-4">
              {pendingRegs.map((reg) => (
                <Card key={reg.id} className="border-2 border-orange-200 hover:border-orange-400 transition-all animate-fade-in">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`${getRoleBadgeColor(reg.role)} text-white`}>
                            {getRoleIcon(reg.role)}
                            <span className="ml-1 capitalize">{reg.role}</span>
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(reg.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <h3 className="font-bold text-lg">{getDisplayName(reg)}</h3>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDetailsModal(reg)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApprove(reg)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => openDeclineModal(reg)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedReg && getRoleIcon(selectedReg.role)}
              Registration Details
            </DialogTitle>
            <DialogDescription>
              {selectedReg && `${selectedReg.role.charAt(0).toUpperCase() + selectedReg.role.slice(1)} registration submitted on ${new Date(selectedReg.createdAt).toLocaleString()}`}
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-3">{selectedReg && getDisplayName(selectedReg)}</h3>
            {selectedReg && renderRegDetails(selectedReg)}
          </div>
          <div className="flex gap-3">
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => {
                if (selectedReg) {
                  setShowDetailsModal(false);
                  handleApprove(selectedReg);
                }
              }}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button
              className="flex-1"
              variant="destructive"
              onClick={() => {
                setShowDetailsModal(false);
                if (selectedReg) openDeclineModal(selectedReg);
              }}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Decline
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Decline Modal */}
      <Dialog open={showDeclineModal} onOpenChange={setShowDeclineModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Decline Registration
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for declining this registration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reason for Declining *</Label>
              <Textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="e.g., Incomplete documentation, Invalid license number..."
                className="mt-2"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleDecline}
                variant="destructive"
                className="flex-1"
              >
                Confirm Decline
              </Button>
              <Button
                onClick={() => setShowDeclineModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Credentials Modal */}
      <Dialog open={showCredentialsModal} onOpenChange={setShowCredentialsModal}>
        <DialogContent className="sm:max-w-md animate-scale-in">
          <div className="text-center py-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-2xl font-bold text-green-700 mb-2">
              Registration Approved!
            </DialogTitle>
            <DialogDescription className="text-base mb-4">
              Login credentials generated for {selectedReg && getDisplayName(selectedReg)}
            </DialogDescription>
            
            {approvedCredentials && (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-left">
                <p className="text-sm font-semibold text-green-800 mb-2">Login Credentials:</p>
                <p className="font-mono text-sm"><strong>Email:</strong> {approvedCredentials.username}</p>
                <p className="font-mono text-sm"><strong>Password:</strong> {approvedCredentials.password}</p>
              </div>
            )}
            
            <Button onClick={() => setShowCredentialsModal(false)} className="w-full mt-4 bg-green-600 hover:bg-green-700">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PendingRegistrations;
