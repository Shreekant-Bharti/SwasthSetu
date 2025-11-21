import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout, getAppointments, getChats, addChatMessage, getPatientHistory, addPrescription, addPatientHistory, Appointment, Chat } from "@/lib/localStorage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { LogOut, Calendar, MessageSquare, Send, FileText, User, Stethoscope, Heart } from "lucide-react";
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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const updateAppointmentStatus = (id: string, status: 'pending' | 'checked' | 'referred') => {
    const allAppointments = getAppointments();
    const updated = allAppointments.map(apt => 
      apt.id === id ? { ...apt, status } : apt
    );
    localStorage.setItem('appointments', JSON.stringify(updated));
    setAppointments(updated);
    toast.success("Appointment status updated");
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

    // Save prescription to both prescriptions and patient history
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

    // Add to patient history
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
        {/* Doctor Profile Section - Full Width at Top */}
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
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">
                    <p className="text-sm text-gray-600 mb-1">Contact</p>
                    <p className="font-bold text-gray-800 text-lg">+91 98765-43211</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">
                    <p className="text-sm text-gray-600 mb-1">Available Hours</p>
                    <p className="font-bold text-gray-800 text-lg">9:00 AM - 6:00 PM</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">
                    <p className="text-sm text-gray-600 mb-1">Specialization</p>
                    <p className="font-bold text-gray-800 text-lg">General Medicine</p>
                  </div>
                </div>
              </div>
            </div>
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

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Appointments */}
          <Card className="shadow-xl border-blue-100 hover:shadow-2xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
              <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
                <Calendar className="h-5 w-5 text-[#2563EB]" />
                Today's Appointments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {appointments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No appointments today</p>
              ) : (
                appointments.map((apt) => (
                  <div key={apt.id} className="border-2 border-blue-100 rounded-xl p-4 space-y-2 hover:border-[#2563EB] transition-all bg-white shadow-sm hover:shadow-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-gray-800 text-lg">{apt.patientName}</p>
                        <p className="text-sm text-gray-600">{apt.hospital}</p>
                        <p className="text-sm text-gray-600">{apt.date} at {apt.time}</p>
                      </div>
                      <Badge 
                        variant={apt.status === 'checked' ? 'default' : apt.status === 'referred' ? 'secondary' : 'outline'}
                        className={apt.status === 'checked' ? 'bg-[#10B981]' : ''}
                      >
                        {apt.status}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => updateAppointmentStatus(apt.id, 'checked')} className="bg-[#2563EB] hover:bg-[#1D4ED8]">
                        Mark Checked
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => updateAppointmentStatus(apt.id, 'referred')} className="bg-[#D1FAE5] text-green-800 hover:bg-green-200">
                        Refer
                      </Button>
                    </div>
                  </div>
                ))
              )}
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
                    <Button onClick={handleSendReply} size="icon" className="bg-[#2563EB] hover:bg-[#1D4ED8] hover:scale-105 transition-transform">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
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
              Fill in the details to create a new prescription (sample data)
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
                placeholder="Enter recommended tests (e.g., Blood Test, X-Ray)..."
                className="border-blue-200 focus:border-[#2563EB]"
              />
            </div>
            <div>
              <Label className="text-gray-700">Diet & Lifestyle Tips</Label>
              <Textarea
                value={prescriptionData.dietTips}
                onChange={(e) => setPrescriptionData({...prescriptionData, dietTips: e.target.value})}
                placeholder="Enter diet tips (e.g., Drink water, Light diet, Rest)..."
                className="border-blue-200 focus:border-[#2563EB]"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleSavePrescription} 
                className="flex-1 bg-[#2563EB] hover:bg-[#1D4ED8] hover:scale-105 transition-transform"
              >
                Save Prescription
              </Button>
              <Button 
                onClick={() => setShowPrescriptionModal(false)} 
                variant="outline" 
                className="flex-1 border-blue-200"
              >
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
