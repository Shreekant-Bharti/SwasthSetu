import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout, getAppointments, updateAppointment, addNotification, getHospitalReferrals, updateHospitalReferral, Appointment, HospitalReferral } from "@/lib/localStorage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogOut, Calendar, Bed, Users, AlertCircle, ArrowRight, RefreshCw, X, UserCheck, DollarSign, FileText } from "lucide-react";
import { toast } from "sonner";

const HospitalDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [referrals, setReferrals] = useState<HospitalReferral[]>([]);
  
  // Modal states
  const [showReschedule, setShowReschedule] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  
  // Referral modal states
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState<HospitalReferral | null>(null);
  const [bedNumber, setBedNumber] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [referralNotes, setReferralNotes] = useState("");

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'hospital') {
      navigate('/');
    } else {
      setUser(currentUser);
      loadData();
    }
  }, [navigate]);

  const loadData = () => {
    setAppointments(getAppointments());
    setReferrals(getHospitalReferrals());
  };

  useEffect(() => {
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleTransferToDoctor = (appointment: Appointment) => {
    updateAppointment(appointment.id, { 
      status: 'transferred',
      transferredToDoctor: true 
    });
    
    addNotification({
      userId: appointment.userId,
      type: 'transfer',
      message: `Your appointment has been transferred to Dr. Snehh Kumar. Date: ${appointment.date} at ${appointment.time}`,
      appointmentId: appointment.id
    });
    
    toast.success("Appointment transferred to Doctor");
    loadData();
  };

  const openRescheduleModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setRescheduleReason("");
    setShowReschedule(true);
  };

  const handleReschedule = () => {
    if (!rescheduleReason.trim()) {
      toast.error("Please provide a reason for rescheduling");
      return;
    }
    
    if (selectedAppointment) {
      updateAppointment(selectedAppointment.id, { 
        status: 'rescheduled',
        rescheduleReason: rescheduleReason 
      });
      
      addNotification({
        userId: selectedAppointment.userId,
        type: 'reschedule',
        message: `Your appointment on ${selectedAppointment.date} has been rescheduled. Reason: ${rescheduleReason}. Please book a new appointment.`,
        appointmentId: selectedAppointment.id
      });
      
      toast.success("Appointment rescheduled and patient notified");
      setShowReschedule(false);
      loadData();
    }
  };

  const openCancelModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setCancelReason("");
    setShowCancel(true);
  };

  const handleCancel = () => {
    if (!cancelReason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }
    
    if (selectedAppointment) {
      updateAppointment(selectedAppointment.id, { 
        status: 'cancelled',
        cancelReason: cancelReason 
      });
      
      addNotification({
        userId: selectedAppointment.userId,
        type: 'cancel',
        message: `Your appointment on ${selectedAppointment.date} at ${selectedAppointment.time} has been cancelled. Reason: ${cancelReason}`,
        appointmentId: selectedAppointment.id
      });
      
      toast.success("Appointment cancelled and patient notified");
      setShowCancel(false);
      loadData();
    }
  };

  const openReferralProcessing = (referral: HospitalReferral) => {
    setSelectedReferral(referral);
    setBedNumber("");
    setPaymentAmount("");
    setReferralNotes("");
    setShowReferralModal(true);
  };

  const handleProcessReferral = () => {
    if (selectedReferral) {
      updateHospitalReferral(selectedReferral.id, {
        status: 'bed_assigned',
        bedNumber: bedNumber || undefined,
        notes: referralNotes || undefined,
        paymentCollected: paymentAmount ? parseFloat(paymentAmount) : undefined
      });
      
      toast.success("Referral processed successfully!");
      setShowReferralModal(false);
      loadData();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'transferred':
        return <Badge variant="default" className="bg-blue-600">Transferred</Badge>;
      case 'checked':
        return <Badge variant="default" className="bg-green-600">Checked</Badge>;
      case 'referred':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-700">Referred</Badge>;
      case 'rescheduled':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Rescheduled</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!user) return null;

  const bedAvailability = {
    total: 50,
    occupied: 32,
    available: 18
  };

  const opdLoad = {
    current: 45,
    capacity: 60
  };

  const pendingAppointments = appointments.filter(apt => apt.status === 'pending');
  const pendingReferrals = referrals.filter(r => r.status === 'pending');

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">SwasthSetu - Hospital Admin</h1>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {/* Bed Availability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bed className="h-5 w-5 text-primary" />
                Bed Availability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Beds</span>
                  <span className="font-bold">{bedAvailability.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Occupied</span>
                  <span className="font-bold text-destructive">{bedAvailability.occupied}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Available</span>
                  <span className="font-bold text-green-600">{bedAvailability.available}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* OPD Load */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                OPD Load
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Patients</span>
                  <span className="font-bold">{opdLoad.current}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Capacity</span>
                  <span className="font-bold">{opdLoad.capacity}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${(opdLoad.current / opdLoad.capacity) * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Emergency Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="w-full justify-center py-2">
                No Active Alerts
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Referred Patients Section */}
        {pendingReferrals.length > 0 && (
          <Card className="mb-6 border-purple-200">
            <CardHeader className="bg-purple-50">
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <UserCheck className="h-5 w-5" />
                Referred Patients ({pendingReferrals.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {pendingReferrals.map((referral) => (
                  <div key={referral.id} className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50/50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-lg">{referral.patientName}</p>
                        <p className="text-sm text-muted-foreground">Referred by: {referral.doctorName}</p>
                        <p className="text-sm text-muted-foreground">Reason: {referral.reason}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(referral.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <Badge className="bg-purple-600">Needs Processing</Badge>
                    </div>
                    <Button 
                      onClick={() => openReferralProcessing(referral)}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Process Referral
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              All Appointments ({appointments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No appointments</p>
              ) : (
                appointments.map((apt) => (
                  <div key={apt.id} className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-lg">{apt.patientName}</p>
                        <p className="text-sm text-muted-foreground">Doctor: {apt.doctor}</p>
                        <p className="text-sm text-muted-foreground">Hospital: {apt.hospital}</p>
                        <p className="text-sm text-muted-foreground">Department: {apt.department || 'General'}</p>
                        <p className="text-sm text-muted-foreground">{apt.date} at {apt.time}</p>
                        {apt.paymentStatus === 'paid' && (
                          <Badge variant="outline" className="mt-1 bg-green-50 text-green-700 border-green-200">
                            ₹{apt.amount} Paid
                          </Badge>
                        )}
                      </div>
                      {getStatusBadge(apt.status)}
                    </div>
                    
                    {apt.status === 'pending' && (
                      <div className="flex flex-wrap gap-2 pt-2 border-t">
                        <Button 
                          size="sm" 
                          onClick={() => handleTransferToDoctor(apt)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <ArrowRight className="mr-1 h-3 w-3" />
                          Transfer to Doctor
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => openRescheduleModal(apt)}
                          className="border-orange-300 text-orange-700 hover:bg-orange-50"
                        >
                          <RefreshCw className="mr-1 h-3 w-3" />
                          Reschedule
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => openCancelModal(apt)}
                        >
                          <X className="mr-1 h-3 w-3" />
                          Cancel
                        </Button>
                      </div>
                    )}
                    
                    {apt.rescheduleReason && (
                      <p className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
                        Reschedule reason: {apt.rescheduleReason}
                      </p>
                    )}
                    {apt.cancelReason && (
                      <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        Cancellation reason: {apt.cancelReason}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Reschedule Modal */}
      <Dialog open={showReschedule} onOpenChange={setShowReschedule}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>
              Patient: {selectedAppointment?.patientName} | {selectedAppointment?.date} at {selectedAppointment?.time}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reason for Rescheduling *</Label>
              <Textarea
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                placeholder="Enter reason for rescheduling..."
                className="mt-2"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleReschedule} className="flex-1">
                Confirm Reschedule
              </Button>
              <Button onClick={() => setShowReschedule(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Modal */}
      <Dialog open={showCancel} onOpenChange={setShowCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Patient: {selectedAppointment?.patientName} | {selectedAppointment?.date} at {selectedAppointment?.time}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reason for Cancellation *</Label>
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter reason for cancellation..."
                className="mt-2"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCancel} variant="destructive" className="flex-1">
                Confirm Cancellation
              </Button>
              <Button onClick={() => setShowCancel(false)} variant="outline" className="flex-1">
                Go Back
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Referral Processing Modal */}
      <Dialog open={showReferralModal} onOpenChange={setShowReferralModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Referral</DialogTitle>
            <DialogDescription>
              Patient: {selectedReferral?.patientName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Assign Bed Number</Label>
              <Input
                value={bedNumber}
                onChange={(e) => setBedNumber(e.target.value)}
                placeholder="e.g., A-101"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Payment to Collect (₹)</Label>
              <Input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter amount"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={referralNotes}
                onChange={(e) => setReferralNotes(e.target.value)}
                placeholder="Additional notes..."
                className="mt-2"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleProcessReferral} className="flex-1 bg-purple-600 hover:bg-purple-700">
                <DollarSign className="mr-2 h-4 w-4" />
                Complete Processing
              </Button>
              <Button onClick={() => setShowReferralModal(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HospitalDashboard;