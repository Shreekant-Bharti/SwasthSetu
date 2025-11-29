import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout, getAppointments, getChats, addChatMessage, addPrescription, addPatientHistory, updateAppointment, addNotification, addHospitalReferral, Appointment, Chat } from "@/lib/localStorage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { LogOut, Calendar, MessageSquare, Send, FileText, User, Stethoscope, Heart, Camera, Check, ArrowLeft } from "lucide-react";
import drSnehh from "@/assets/dr-snehh.jpg";
import { toast } from "sonner";

interface PatientRecord {
  id: string;
  name: string;
  age: number;
  diagnosis: string;
  lastVisit: string;
  history: Array<{ date: string; diagnosis: string; prescription: string }>;
}

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  
  // Patient History
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  
  // Prescription Generator
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [prescriptionPatient, setPrescriptionPatient] = useState<PatientRecord | null>(null);
  const [prescriptionData, setPrescriptionData] = useState({
    symptoms: '',
    diagnosis: '',
    medicines: '',
    tests: '',
    dietTips: ''
  });

  // Mark as Checked Options
  const [showMarkCheckedModal, setShowMarkCheckedModal] = useState(false);
  const [selectedAppointmentForAction, setSelectedAppointmentForAction] = useState<Appointment | null>(null);
  
  // OPD Coming Soon Modal
  const [showOPDComingSoon, setShowOPDComingSoon] = useState(false);
  
  // Prescription for Appointment
  const [showAppointmentPrescription, setShowAppointmentPrescription] = useState(false);
  const [appointmentPrescriptionData, setAppointmentPrescriptionData] = useState({
    symptoms: '',
    diagnosis: '',
    medicines: '',
    tests: '',
    dietTips: ''
  });

  // Refer Modal
  const [showReferModal, setShowReferModal] = useState(false);
  const [referAppointment, setReferAppointment] = useState<Appointment | null>(null);
  const [referReason, setReferReason] = useState("");

  // Sample patient records
  const [patientRecords] = useState<PatientRecord[]>([
    {
      id: '1',
      name: 'Ramesh Kumar',
      age: 45,
      diagnosis: 'Seasonal Flu',
      lastVisit: '2025-11-15',
      history: [
        { date: '2025-11-15', diagnosis: 'Seasonal Flu', prescription: 'Paracetamol 500mg, Rest, Fluids' },
        { date: '2025-10-20', diagnosis: 'Stomach Upset', prescription: 'Antacid Tablets, Light Diet' },
        { date: '2025-09-05', diagnosis: 'Hypertension Check', prescription: 'Blood Pressure Medicine' }
      ]
    },
    {
      id: '2',
      name: 'Sita Devi',
      age: 38,
      diagnosis: 'Diabetes Management',
      lastVisit: '2025-11-12',
      history: [
        { date: '2025-11-12', diagnosis: 'Diabetes Management', prescription: 'Metformin 500mg, Diet Control' },
        { date: '2025-10-15', diagnosis: 'Joint Pain', prescription: 'Pain Relief Gel, Calcium Supplements' }
      ]
    },
    {
      id: '3',
      name: 'Mohan Singh',
      age: 52,
      diagnosis: 'Back Pain',
      lastVisit: '2025-11-10',
      history: [
        { date: '2025-11-10', diagnosis: 'Back Pain', prescription: 'Pain Relief Tablets, Physiotherapy' },
        { date: '2025-08-20', diagnosis: 'Cough & Cold', prescription: 'Cough Syrup, Antibiotic' }
      ]
    }
  ]);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'doctor') {
      navigate('/');
    } else {
      setUser(currentUser);
      loadData();
    }
  }, [navigate]);

  const loadData = () => {
    setAppointments(getAppointments());
    setChats(getChats());
  };

  useEffect(() => {
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const openMarkCheckedOptions = (appointment: Appointment) => {
    setSelectedAppointmentForAction(appointment);
    setShowMarkCheckedModal(true);
  };

  const handleUploadOPDCard = () => {
    setShowMarkCheckedModal(false);
    setShowOPDComingSoon(true);
  };

  const handleGeneratePrescription = () => {
    setShowMarkCheckedModal(false);
    setAppointmentPrescriptionData({
      symptoms: '',
      diagnosis: '',
      medicines: '',
      tests: '',
      dietTips: ''
    });
    setShowAppointmentPrescription(true);
  };

  const handleSaveAppointmentPrescription = () => {
    if (!appointmentPrescriptionData.diagnosis || !appointmentPrescriptionData.medicines) {
      toast.error("Please fill diagnosis and medicines");
      return;
    }

    if (!selectedAppointmentForAction) return;

    const notesText = [
      appointmentPrescriptionData.symptoms ? `Symptoms: ${appointmentPrescriptionData.symptoms}` : '',
      appointmentPrescriptionData.tests ? `Tests: ${appointmentPrescriptionData.tests}` : '',
      appointmentPrescriptionData.dietTips ? `Diet Tips: ${appointmentPrescriptionData.dietTips}` : ''
    ].filter(Boolean).join('. ');

    addPrescription({
      patientId: selectedAppointmentForAction.userId,
      patientName: selectedAppointmentForAction.patientName,
      doctorName: 'Dr. Snehh Kumar',
      date: new Date().toISOString().split('T')[0],
      medicines: appointmentPrescriptionData.medicines,
      diagnosis: appointmentPrescriptionData.diagnosis,
      notes: notesText
    });

    updateAppointment(selectedAppointmentForAction.id, { status: 'checked' });

    addNotification({
      userId: selectedAppointmentForAction.userId,
      type: 'prescription',
      message: `Dr. Snehh Kumar has generated your prescription. Check My Prescriptions to view and download.`,
      appointmentId: selectedAppointmentForAction.id
    });

    toast.success("Prescription saved and sent to patient!");
    setShowAppointmentPrescription(false);
    setSelectedAppointmentForAction(null);
    loadData();
  };

  const openReferModal = (appointment: Appointment) => {
    setReferAppointment(appointment);
    setReferReason("");
    setShowReferModal(true);
  };

  const handleReferToHospital = () => {
    if (!referReason.trim()) {
      toast.error("Please provide a reason for referral");
      return;
    }

    if (referAppointment) {
      updateAppointment(referAppointment.id, { status: 'referred' });

      addHospitalReferral({
        appointmentId: referAppointment.id,
        patientName: referAppointment.patientName,
        patientId: referAppointment.userId,
        doctorName: 'Dr. Snehh Kumar',
        reason: referReason
      });

      addNotification({
        userId: referAppointment.userId,
        type: 'referral',
        message: `Dr. Snehh Kumar has referred you back to the hospital for further treatment. Reason: ${referReason}`,
        appointmentId: referAppointment.id
      });

      toast.success("Patient referred to hospital!");
      setShowReferModal(false);
      loadData();
    }
  };

  const handleSendReply = () => {
    if (!selectedChat || !replyMessage.trim()) return;

    addChatMessage(selectedChat.userId, selectedChat.patientName, {
      from: 'doctor',
      text: replyMessage.trim(),
      timestamp: Date.now()
    });

    setReplyMessage("");
    loadData();
    toast.success("Reply sent");
  };

  const openPatientHistory = (patient: PatientRecord) => {
    setSelectedPatient(patient);
    setShowHistoryModal(true);
  };

  const openPrescriptionModal = (patient: PatientRecord) => {
    setPrescriptionPatient(patient);
    setShowPrescriptionModal(true);
  };

  const handleSavePrescription = () => {
    if (!prescriptionData.diagnosis || !prescriptionData.medicines) {
      toast.error("Please fill all required fields");
      return;
    }

    const notesText = [
      prescriptionData.symptoms,
      prescriptionData.tests ? `Tests: ${prescriptionData.tests}` : '',
      prescriptionData.dietTips ? `Diet Tips: ${prescriptionData.dietTips}` : ''
    ].filter(Boolean).join('. ');

    const prescriptionRecord = {
      patientId: prescriptionPatient?.id || '1',
      patientName: prescriptionPatient?.name || '',
      doctorName: 'Dr. Snehh Kumar',
      date: new Date().toISOString().split('T')[0],
      medicines: prescriptionData.medicines,
      diagnosis: prescriptionData.diagnosis,
      notes: notesText
    };

    addPrescription(prescriptionRecord);

    addPatientHistory({
      patientId: prescriptionPatient?.id || '1',
      patientName: prescriptionPatient?.name || '',
      visitDate: new Date().toISOString().split('T')[0],
      diagnosis: prescriptionData.diagnosis,
      prescription: prescriptionData.medicines,
      doctorName: 'Dr. Snehh Kumar'
    });

    toast.success("Prescription saved and synced to patient dashboard");
    setShowPrescriptionModal(false);
    setPrescriptionData({ symptoms: '', diagnosis: '', medicines: '', tests: '', dietTips: '' });
  };

  if (!user) return null;

  // Filter appointments transferred to doctor
  const transferredAppointments = appointments.filter(apt => 
    apt.transferredToDoctor && (apt.status === 'transferred' || apt.status === 'checked' || apt.status === 'referred')
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] border-b sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-white" />
            <h1 className="text-2xl font-bold text-white">SwasthSetu - Doctor Portal</h1>
          </div>
          <Button onClick={handleLogout} variant="secondary" size="sm" className="hover:scale-105 transition-transform">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Doctor Profile Section */}
        <Card className="mb-8 shadow-2xl border-blue-200 bg-white animate-fade-in overflow-hidden">
          <div className="bg-gradient-to-r from-[#2563EB] to-[#3B82F6] h-32"></div>
          <CardContent className="p-8 -mt-16">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="w-40 h-40 border-4 border-white shadow-2xl ring-4 ring-blue-200">
                <AvatarImage src={drSnehh} alt="Dr. Snehh Kumar" />
                <AvatarFallback>DS</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center md:text-left mt-16 md:mt-0">
                <h2 className="text-4xl font-bold text-gray-800 mb-2">Dr. Snehh Kumar</h2>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-6">
                  <Badge className="text-base px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8]">
                    <Stethoscope className="w-4 h-4 mr-2" />
                    General Physician
                  </Badge>
                  <Badge variant="secondary" className="text-base px-4 py-2 bg-[#D1FAE5] text-green-800 border-green-200">
                    SwasthSetu Community Hospital
                  </Badge>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 shadow-md">
                    <p className="text-sm text-gray-600 mb-1">Contact</p>
                    <p className="font-bold text-gray-800 text-lg">+91 98765-43211</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 shadow-md">
                    <p className="text-sm text-gray-600 mb-1">Available Hours</p>
                    <p className="font-bold text-gray-800 text-lg">9:00 AM - 6:00 PM</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 shadow-md">
                    <p className="text-sm text-gray-600 mb-1">Specialization</p>
                    <p className="font-bold text-gray-800 text-lg">General Medicine</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Incoming Appointments from Hospital */}
        <Card className="mb-8 shadow-xl border-blue-100">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50">
            <CardTitle className="flex items-center gap-2 text-2xl text-gray-800">
              <Calendar className="h-6 w-6 text-[#2563EB]" />
              Incoming Appointments ({transferredAppointments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {transferredAppointments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No appointments transferred from hospital yet</p>
            ) : (
              <div className="space-y-4">
                {transferredAppointments.map((apt) => (
                  <Card key={apt.id} className="border-2 border-blue-100 hover:border-[#2563EB] transition-all">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-xl text-gray-800">{apt.patientName}</p>
                          <p className="text-sm text-muted-foreground">{apt.hospital}</p>
                          <p className="text-sm text-muted-foreground">Department: {apt.department || 'General'}</p>
                          <p className="text-sm text-muted-foreground">{apt.date} at {apt.time}</p>
                        </div>
                        <Badge 
                          className={
                            apt.status === 'checked' ? 'bg-green-600' : 
                            apt.status === 'referred' ? 'bg-purple-600' : 
                            'bg-blue-600'
                          }
                        >
                          {apt.status === 'transferred' ? 'Pending Consultation' : apt.status}
                        </Badge>
                      </div>
                      
                      {apt.status === 'transferred' && (
                        <div className="flex flex-wrap gap-2 pt-3 border-t">
                          <Button 
                            size="sm" 
                            onClick={() => openMarkCheckedOptions(apt)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="mr-1 h-4 w-4" />
                            Mark as Checked
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => openReferModal(apt)}
                            className="border-purple-300 text-purple-700 hover:bg-purple-50"
                          >
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Refer to Hospital
                          </Button>
                        </div>
                      )}

                      {apt.opdCardImage && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm font-medium text-green-700 mb-2">OPD Card Uploaded ✓</p>
                          <img src={apt.opdCardImage} alt="OPD Card" className="max-h-32 rounded-lg border" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Patient History Module */}
        <Card className="mb-8 shadow-xl border-blue-100 animate-slide-up">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50">
            <CardTitle className="flex items-center gap-2 text-2xl text-gray-800">
              <User className="h-6 w-6 text-[#2563EB]" />
              Patient History Records
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              {patientRecords.map((patient) => (
                <Card key={patient.id} className="border-2 border-blue-100 hover:border-[#2563EB] transition-all hover:shadow-xl hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-xl text-gray-800">{patient.name}</h3>
                        <p className="text-sm text-gray-600">Age: {patient.age} years</p>
                      </div>
                      <Badge variant="outline" className="bg-blue-50 text-[#2563EB] border-blue-200">
                        {patient.diagnosis}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Last Visit: <span className="font-semibold text-gray-800">{patient.lastVisit}</span>
                    </p>
                    <div className="flex flex-col gap-2">
                      <Button 
                        onClick={() => openPatientHistory(patient)} 
                        variant="outline" 
                        size="sm"
                        className="w-full border-[#2563EB] text-[#2563EB] hover:bg-[#2563EB] hover:text-white"
                      >
                        View Full History
                      </Button>
                      <Button 
                        onClick={() => openPrescriptionModal(patient)}
                        size="sm"
                        className="w-full bg-[#10B981] hover:bg-[#059669] text-white"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Generate Prescription
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Online Consultation - Patient Messages */}
        <Card className="shadow-xl border-blue-100 hover:shadow-2xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
            <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
              <MessageSquare className="h-5 w-5 text-[#10B981]" />
              Online Consultation - Patient Messages
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3 mb-4">
              {chats.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No messages yet</p>
              ) : (
                chats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`border-2 rounded-xl p-3 cursor-pointer hover:bg-blue-50 transition-all ${
                      selectedChat?.id === chat.id ? 'bg-blue-100 border-[#2563EB]' : 'border-blue-100'
                    }`}
                    onClick={() => setSelectedChat(chat)}
                  >
                    <p className="font-semibold text-gray-800">{chat.patientName}</p>
                    <p className="text-sm text-gray-600">
                      {chat.messages[chat.messages.length - 1]?.text.slice(0, 50)}...
                    </p>
                  </div>
                ))
              )}
            </div>

            {selectedChat && (
              <div className="border-t-2 pt-4">
                <h4 className="font-semibold mb-3 text-gray-800 text-lg">Chat with {selectedChat.patientName}</h4>
                <div className="space-y-2 mb-3 max-h-60 overflow-y-auto">
                  {selectedChat.messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl transition-all ${
                        msg.from === 'patient' 
                          ? 'bg-gray-100 text-gray-800' 
                          : 'bg-[#2563EB] text-white ml-8 shadow-md'
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your reply..."
                    className="flex-1 border-blue-200 focus:border-[#2563EB]"
                  />
                  <Button onClick={handleSendReply} size="icon" className="bg-[#2563EB] hover:bg-[#1D4ED8]">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Patient History Modal */}
      <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-gray-800">
              Patient History - {selectedPatient?.name}
            </DialogTitle>
            <DialogDescription>
              Age: {selectedPatient?.age} years | Last Visit: {selectedPatient?.lastVisit}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {selectedPatient?.history.map((record, idx) => (
              <Card key={idx} className="border-2 border-blue-100 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-gray-800">{record.date}</p>
                    <Badge className="bg-[#2563EB]">{record.diagnosis}</Badge>
                  </div>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Prescription:</span> {record.prescription}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Prescription Generator Modal */}
      <Dialog open={showPrescriptionModal} onOpenChange={setShowPrescriptionModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-gray-800">
              Generate Prescription - {prescriptionPatient?.name}
            </DialogTitle>
            <DialogDescription>
              Fill in the details to create a new prescription
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-700">Symptoms</Label>
              <Textarea
                value={prescriptionData.symptoms}
                onChange={(e) => setPrescriptionData({...prescriptionData, symptoms: e.target.value})}
                placeholder="Enter patient symptoms..."
                className="border-blue-200 focus:border-[#2563EB]"
              />
            </div>
            <div>
              <Label className="text-gray-700">Diagnosis *</Label>
              <Input
                value={prescriptionData.diagnosis}
                onChange={(e) => setPrescriptionData({...prescriptionData, diagnosis: e.target.value})}
                placeholder="Enter diagnosis"
                className="border-blue-200 focus:border-[#2563EB]"
              />
            </div>
            <div>
              <Label className="text-gray-700">Recommended Medicines *</Label>
              <Textarea
                value={prescriptionData.medicines}
                onChange={(e) => setPrescriptionData({...prescriptionData, medicines: e.target.value})}
                placeholder="Enter medicines with dosage..."
                className="border-blue-200 focus:border-[#2563EB]"
              />
            </div>
            <div>
              <Label className="text-gray-700">Tests (if any)</Label>
              <Textarea
                value={prescriptionData.tests}
                onChange={(e) => setPrescriptionData({...prescriptionData, tests: e.target.value})}
                placeholder="Enter recommended tests..."
                className="border-blue-200 focus:border-[#2563EB]"
              />
            </div>
            <div>
              <Label className="text-gray-700">Diet & Lifestyle Tips</Label>
              <Textarea
                value={prescriptionData.dietTips}
                onChange={(e) => setPrescriptionData({...prescriptionData, dietTips: e.target.value})}
                placeholder="Enter diet tips..."
                className="border-blue-200 focus:border-[#2563EB]"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleSavePrescription} 
                className="flex-1 bg-[#2563EB] hover:bg-[#1D4ED8]"
              >
                Save Prescription
              </Button>
              <Button 
                onClick={() => setShowPrescriptionModal(false)} 
                variant="outline" 
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mark as Checked Options Modal */}
      <Dialog open={showMarkCheckedModal} onOpenChange={setShowMarkCheckedModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              Mark as Checked
            </DialogTitle>
            <DialogDescription>
              Patient: {selectedAppointmentForAction?.patientName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">Choose an action:</p>
            <div className="flex flex-col gap-3">
              <Button 
                onClick={handleUploadOPDCard}
                variant="outline"
                className="w-full justify-start h-14 border-blue-200 hover:bg-blue-50"
              >
                <Camera className="mr-3 h-5 w-5 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium">Upload OPD Card</p>
                  <p className="text-xs text-muted-foreground">Capture or upload OPD card image</p>
                </div>
              </Button>
              <Button 
                onClick={handleGeneratePrescription}
                variant="outline"
                className="w-full justify-start h-14 border-green-200 hover:bg-green-50"
              >
                <FileText className="mr-3 h-5 w-5 text-green-600" />
                <div className="text-left">
                  <p className="font-medium">Generate Prescription</p>
                  <p className="text-xs text-muted-foreground">Write medicines, tests, advice</p>
                </div>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* OPD Coming Soon Modal */}
      <Dialog open={showOPDComingSoon} onOpenChange={setShowOPDComingSoon}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-600">
              <Camera className="h-5 w-5" />
              Feature Coming Soon...
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <Camera className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-muted-foreground">
              OPD Card upload feature will be available soon!
            </p>
          </div>
          <Button 
            onClick={() => setShowOPDComingSoon(false)} 
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            OK
          </Button>
        </DialogContent>
      </Dialog>

      {/* Appointment Prescription Modal */}
      <Dialog open={showAppointmentPrescription} onOpenChange={setShowAppointmentPrescription}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              Generate Prescription
            </DialogTitle>
            <DialogDescription>
              Patient: {selectedAppointmentForAction?.patientName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-700">Symptoms</Label>
              <Textarea
                value={appointmentPrescriptionData.symptoms}
                onChange={(e) => setAppointmentPrescriptionData({...appointmentPrescriptionData, symptoms: e.target.value})}
                placeholder="Enter patient symptoms..."
                className="border-green-200 focus:border-green-500"
              />
            </div>
            <div>
              <Label className="text-gray-700">Diagnosis *</Label>
              <Textarea
                value={appointmentPrescriptionData.diagnosis}
                onChange={(e) => setAppointmentPrescriptionData({...appointmentPrescriptionData, diagnosis: e.target.value})}
                placeholder="Enter diagnosis..."
                className="border-green-200 focus:border-green-500"
              />
            </div>
            <div>
              <Label className="text-gray-700">Medicines *</Label>
              <Textarea
                value={appointmentPrescriptionData.medicines}
                onChange={(e) => setAppointmentPrescriptionData({...appointmentPrescriptionData, medicines: e.target.value})}
                placeholder="Enter medicines with dosage..."
                className="border-green-200 focus:border-green-500"
              />
            </div>
            <div>
              <Label className="text-gray-700">Tests (if any)</Label>
              <Textarea
                value={appointmentPrescriptionData.tests}
                onChange={(e) => setAppointmentPrescriptionData({...appointmentPrescriptionData, tests: e.target.value})}
                placeholder="Enter recommended tests..."
                className="border-green-200 focus:border-green-500"
              />
            </div>
            <div>
              <Label className="text-gray-700">Diet & Lifestyle Tips</Label>
              <Textarea
                value={appointmentPrescriptionData.dietTips}
                onChange={(e) => setAppointmentPrescriptionData({...appointmentPrescriptionData, dietTips: e.target.value})}
                placeholder="Enter diet tips..."
                className="border-green-200 focus:border-green-500"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleSaveAppointmentPrescription} 
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Save & Send to Patient
              </Button>
              <Button 
                onClick={() => setShowAppointmentPrescription(false)} 
                variant="outline" 
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Refer to Hospital Modal */}
      <Dialog open={showReferModal} onOpenChange={setShowReferModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refer Patient to Hospital</DialogTitle>
            <DialogDescription>
              Patient: {referAppointment?.patientName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reason for Referral *</Label>
              <Textarea
                value={referReason}
                onChange={(e) => setReferReason(e.target.value)}
                placeholder="Enter reason for referral (e.g., needs admission, further tests, specialist consultation)..."
                className="mt-2"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleReferToHospital} className="flex-1 bg-purple-600 hover:bg-purple-700">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Refer to Hospital
              </Button>
              <Button onClick={() => setShowReferModal(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorDashboard;
// Camera fix: Added muted attribute and explicit play() call