import { useEffect, useState } from "react";
import { getPrescriptions, addMedicineOrder, addLabBooking, getCurrentUser } from "@/lib/localStorage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Calendar, User, Download, Sparkles, ShoppingCart, Microscope, Pill, TestTube, Heart } from "lucide-react";
import { toast } from "sonner";
import drSnehh from "@/assets/dr-snehh.jpg";

interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  date: string;
  diagnosis: string;
  medicines: string;
  notes?: string;
}

interface PrescriptionViewProps {
  userId: string;
}

const PrescriptionView = ({ userId }: PrescriptionViewProps) => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showOrderMedicine, setShowOrderMedicine] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState("");
  const [medicinePrice, setMedicinePrice] = useState(0);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [showAddressStep, setShowAddressStep] = useState(false);
  const [showPaymentStep, setShowPaymentStep] = useState(false);
  const [showBankPayment, setShowBankPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Online' | null>(null);
  const [orderAddress, setOrderAddress] = useState("");
  const [orderPhone, setOrderPhone] = useState("");
  const [orderPincode, setOrderPincode] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [showBookTest, setShowBookTest] = useState(false);
  const [selectedTest, setSelectedTest] = useState("");
  const [testAddress, setTestAddress] = useState("");
  const [testPhone, setTestPhone] = useState("");
  const [testDate, setTestDate] = useState("");
  
  const user = getCurrentUser();

  useEffect(() => {
    const loadPrescriptions = () => {
      const allPrescriptions = getPrescriptions();
      const userPrescriptions = allPrescriptions.filter(p => p.patientId === userId);
      setPrescriptions(userPrescriptions);
    };

    loadPrescriptions();
    const interval = setInterval(loadPrescriptions, 2000);
    return () => clearInterval(interval);
  }, [userId]);

  const parseMedicines = (text: string): Array<{name: string, price: number}> => {
    const lines = text.split(/[,\n]/).map(l => l.trim()).filter(l => l.length > 0);
    // Assign random prices between ₹50-500
    return lines.map(name => ({
      name,
      price: Math.floor(Math.random() * 450) + 50
    }));
  };

  const parseTests = (text: string): string[] => {
    const testKeywords = ['blood test', 'x-ray', 'mri', 'ct scan', 'ultrasound', 'ecg', 'urine test', 'sugar test', 'bp check', 'test'];
    const lowerText = text.toLowerCase();
    const found: string[] = [];
    testKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        found.push(keyword);
      }
    });
    return found.length > 0 ? found : [];
  };

  const parseTips = (text: string): string[] => {
    const tipKeywords = ['drink water', 'rest', 'light diet', 'avoid spicy', 'exercise', 'sleep', 'fluids', 'diet'];
    const lowerText = text.toLowerCase();
    const found: string[] = [];
    tipKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        found.push(keyword);
      }
    });
    return found.length > 0 ? found : [];
  };

  const downloadPrescription = (prescription: Prescription) => {
    // Create a simple text-based receipt
    const receiptContent = `
╔════════════════════════════════════════╗
║      SWASTHSETU PRESCRIPTION          ║
╚════════════════════════════════════════╝

Doctor: ${prescription.doctorName}
Hospital: SwasthSetu Community Hospital
Date: ${prescription.date}

Patient: ${prescription.patientName}
Diagnosis: ${prescription.diagnosis}

MEDICINES:
${prescription.medicines}

${prescription.notes ? `NOTES:\n${prescription.notes}` : ''}

Contact: +91 98765-43211
`;
    
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `prescription-${prescription.date}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success("Prescription downloaded!");
  };

  const handleAnalyse = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setShowAnalysis(true);
  };

  const handleOrderMedicineClick = (medicineName: string, price: number) => {
    if (!selectedPrescription) return;
    setSelectedMedicine(medicineName);
    setMedicinePrice(price);
    setOrderQuantity(1);
    setShowOrderMedicine(true);
    setShowAddressStep(false);
    setShowPaymentStep(false);
  };

  const handleQuantityNext = () => {
    if (orderQuantity < 1) {
      toast.error("Please enter valid quantity");
      return;
    }
    setShowOrderMedicine(false);
    setShowAddressStep(true);
  };

  const handleAddressNext = () => {
    if (!orderAddress || !orderPhone || !orderPincode) {
      toast.error("Please fill all fields");
      return;
    }
    setShowAddressStep(false);
    setShowPaymentStep(true);
  };

  const handlePaymentSelect = (method: 'COD' | 'Online') => {
    setPaymentMethod(method);
    if (method === 'Online') {
      setShowPaymentStep(false);
      setShowBankPayment(true);
    } else {
      // COD - complete order
      completeOrder(method);
    }
  };

  const handleBankPayment = () => {
    if (!cardNumber || !cvv || !expiryDate) {
      toast.error("Please fill all payment details");
      return;
    }
    setShowBankPayment(false);
    completeOrder('Online');
  };

  const completeOrder = (method: 'COD' | 'Online') => {
    if (!selectedPrescription) return;

    addMedicineOrder({
      patientId: userId,
      patientName: user?.name || selectedPrescription.patientName,
      prescriptionId: selectedPrescription.id,
      medicines: `${selectedMedicine} (Qty: ${orderQuantity}) - ₹${medicinePrice * orderQuantity}`,
      address: `${orderAddress}, PIN: ${orderPincode}`,
      phone: orderPhone
    });

    // Play success sound
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBT2U4PbLcyYFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBT2U4PbLcyYFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBT2U4PbLcyYFLIHO8tiJNw==');
    audio.play().catch(() => {});

    toast.success(`Order placed! Payment: ${method}`);
    
    // Reset all states
    setShowAnalysis(false);
    setShowOrderMedicine(false);
    setShowAddressStep(false);
    setShowPaymentStep(false);
    setShowBankPayment(false);
    setOrderAddress("");
    setOrderPhone("");
    setOrderPincode("");
    setCardNumber("");
    setCvv("");
    setExpiryDate("");
  };

  const handleBookTestClick = (test: string) => {
    if (!selectedPrescription) return;
    setSelectedTest(test);
    setShowBookTest(true);
  };

  const submitLabBooking = () => {
    if (!selectedPrescription || !testAddress || !testPhone || !testDate || !selectedTest) {
      toast.error("Please fill all fields");
      return;
    }

    addLabBooking({
      patientId: userId,
      patientName: user?.name || selectedPrescription.patientName,
      prescriptionId: selectedPrescription.id,
      tests: selectedTest,
      phone: testPhone,
      address: testAddress,
      preferredDate: testDate
    });

    // Play success sound
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBT2U4PbLcyYFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBT2U4PbLcyYFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBT2U4PbLcyYFLIHO8tiJNw==');
    audio.play().catch(() => {});

    toast.success("Lab test booked! Lab will contact you soon.");
    setShowBookTest(false);
    setShowAnalysis(false);
    setTestAddress("");
    setTestPhone("");
    setTestDate("");
  };

  return (
    <>
      <Card className="shadow-xl border-2 border-primary/20 animate-fade-in">
        <CardHeader className="bg-gradient-to-r from-blue-100 via-purple-100 to-green-100">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <FileText className="h-6 w-6 text-primary" />
            My Prescriptions
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {prescriptions.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg">No prescriptions yet</p>
              <p className="text-sm text-muted-foreground mt-2">Your prescriptions from doctors will appear here</p>
            </div>
          ) : (
            <div className="space-y-6">
              {prescriptions.map((prescription) => (
                <Card 
                  key={prescription.id} 
                  id={`prescription-${prescription.id}`}
                  className="border-2 border-primary/30 hover:border-primary/60 transition-all shadow-lg hover:shadow-2xl animate-scale-in"
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-4">
                        <img src={drSnehh} alt="Dr. Sneha Kumari" className="w-16 h-16 rounded-full border-2 border-blue-200" />
                        <div>
                          <h3 className="font-bold text-2xl text-gray-800 mb-1">{prescription.diagnosis}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <User className="h-4 w-4 text-primary" />
                            <span className="font-semibold">{prescription.doctorName}</span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">SwasthSetu Community Hospital</p>
                        </div>
                      </div>
                      <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 text-base">
                        <Calendar className="h-4 w-4 mr-2" />
                        {prescription.date}
                      </Badge>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-5 shadow-inner">
                      <p className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Pill className="h-5 w-5 text-blue-600" />
                        Medicines:
                      </p>
                      <p className="text-base text-gray-900 leading-relaxed whitespace-pre-line">{prescription.medicines}</p>
                    </div>
                    
                    {prescription.notes && (
                      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-5 shadow-inner">
                        <p className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                          📝 Notes & Instructions:
                        </p>
                        <p className="text-base text-gray-900 leading-relaxed">{prescription.notes}</p>
                      </div>
                    )}

                    {(prescription as any).opdImage && (
                      <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-5 shadow-inner">
                        <p className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                          📋 OPD Card:
                        </p>
                        <img 
                          src={(prescription as any).opdImage} 
                          alt="OPD Card" 
                          className="max-w-full rounded-lg border-2 border-purple-200 shadow-md"
                        />
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3 pt-4">
                      <Button 
                        onClick={() => downloadPrescription(prescription)}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button 
                        onClick={() => handleAnalyse(prescription)}
                        className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Analyse
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Modal */}
      <Dialog open={showAnalysis} onOpenChange={setShowAnalysis}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-purple-600" />
              Prescription Analysis
            </DialogTitle>
            <DialogDescription>
              Detailed breakdown of your prescription
            </DialogDescription>
          </DialogHeader>
          {selectedPrescription && (
            <div className="space-y-6">
              {/* Prescription Image/Details */}
              <Card className="border-2 border-purple-200 shadow-md bg-gradient-to-br from-white to-purple-50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <img src={drSnehh} alt="Dr. Sneha Kumari" className="w-20 h-20 rounded-full border-2 border-purple-300" />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800">{selectedPrescription.doctorName}</h3>
                      <p className="text-sm text-muted-foreground">General Physician</p>
                      <p className="text-sm text-muted-foreground">SwasthSetu Community Hospital</p>
                      <p className="text-sm font-semibold mt-2">Date: {selectedPrescription.date}</p>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground mb-1">Patient: {selectedPrescription.patientName}</p>
                    <p className="text-lg font-bold text-gray-800 mb-2">Diagnosis: {selectedPrescription.diagnosis}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Medicines Section */}
              {parseMedicines(selectedPrescription.medicines).length > 0 && (
                <Card className="border-2 border-blue-200 shadow-md">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Pill className="h-5 w-5 text-blue-600" />
                      Prescribed Medicines
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      {parseMedicines(selectedPrescription.medicines).map((med, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">{med.name}</p>
                            <p className="text-lg font-bold text-green-700 mt-1">₹{med.price}</p>
                          </div>
                          <Button 
                            onClick={() => handleOrderMedicineClick(med.name, med.price)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Order
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tests Section */}
              {parseTests((selectedPrescription.notes || '') + ' ' + selectedPrescription.medicines).length > 0 && (
                <Card className="border-2 border-orange-200 shadow-md">
                  <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TestTube className="h-5 w-5 text-orange-600" />
                      Recommended Tests
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      {parseTests((selectedPrescription.notes || '') + ' ' + selectedPrescription.medicines).map((test, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800 capitalize">{test}</p>
                          </div>
                          <Button 
                            onClick={() => handleBookTestClick(test)}
                            size="sm"
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                          >
                            <Microscope className="h-4 w-4 mr-2" />
                            Book Test
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tips Section */}
              {selectedPrescription.notes && parseTips(selectedPrescription.notes).length > 0 && (
                <Card className="border-2 border-green-200 shadow-md">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
                    <CardTitle className="text-lg flex items-center gap-2">
                      🥗 Doctor Notes & Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="list-disc list-inside space-y-2">
                      {parseTips(selectedPrescription.notes).map((tip, idx) => (
                        <li key={idx} className="text-gray-800 capitalize">{tip}</li>
                      ))}
                    </ul>
                    <div className="mt-4 p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-700">{selectedPrescription.notes}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Step 1: Quantity Modal */}
      <Dialog open={showOrderMedicine} onOpenChange={setShowOrderMedicine}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <ShoppingCart className="h-6 w-6 text-green-600" />
              Select Quantity
            </DialogTitle>
            <DialogDescription>
              How many units do you want to order?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Medicine:</p>
              <p className="text-base text-gray-800 font-bold">{selectedMedicine}</p>
              <p className="text-lg font-bold text-green-700 mt-2">₹{medicinePrice} per unit</p>
            </div>
            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                min="1"
                value={orderQuantity}
                onChange={(e) => setOrderQuantity(parseInt(e.target.value) || 1)}
                className="mt-1 h-12 text-lg"
              />
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-lg font-bold text-gray-800">Total: ₹{medicinePrice * orderQuantity}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleQuantityNext} className="flex-1 h-12 bg-blue-600 hover:bg-blue-700">
                Next
              </Button>
              <Button onClick={() => setShowOrderMedicine(false)} variant="outline" className="flex-1 h-12">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Step 2: Address Modal */}
      <Dialog open={showAddressStep} onOpenChange={setShowAddressStep}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Delivery Address</DialogTitle>
            <DialogDescription>
              Enter your delivery details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <span className="font-bold">{selectedMedicine}</span> × {orderQuantity}
              </p>
              <p className="text-lg font-bold text-green-700">Total: ₹{medicinePrice * orderQuantity}</p>
            </div>
            <div>
              <Label>Full Address *</Label>
              <Input
                value={orderAddress}
                onChange={(e) => setOrderAddress(e.target.value)}
                placeholder="House no, Street, Area, City"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>PIN Code *</Label>
                <Input
                  value={orderPincode}
                  onChange={(e) => setOrderPincode(e.target.value)}
                  placeholder="123456"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Mobile Number *</Label>
                <Input
                  value={orderPhone}
                  onChange={(e) => setOrderPhone(e.target.value)}
                  placeholder="+91 XXXXX-XXXXX"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddressNext} className="flex-1 h-12 bg-blue-600 hover:bg-blue-700">
                Next
              </Button>
              <Button onClick={() => {
                setShowAddressStep(false);
                setShowOrderMedicine(true);
              }} variant="outline" className="flex-1 h-12">
                Back
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Step 3: Payment Options Modal */}
      <Dialog open={showPaymentStep} onOpenChange={setShowPaymentStep}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Payment Method</DialogTitle>
            <DialogDescription>
              Choose your payment option
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-green-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-700 mb-1">Order Summary</p>
              <p className="font-bold text-gray-800">{selectedMedicine} × {orderQuantity}</p>
              <p className="text-2xl font-bold text-green-700 mt-2">₹{medicinePrice * orderQuantity}</p>
            </div>
            <Button
              onClick={() => handlePaymentSelect('COD')}
              className="w-full h-16 text-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 flex items-center justify-center gap-3"
            >
              💰 Cash on Delivery (COD)
            </Button>
            <Button
              onClick={() => handlePaymentSelect('Online')}
              className="w-full h-16 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center justify-center gap-3"
            >
              💳 Pay Online
            </Button>
            <Button onClick={() => {
              setShowPaymentStep(false);
              setShowAddressStep(true);
            }} variant="outline" className="w-full">
              Back
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Step 4: Bank Payment Modal */}
      <Dialog open={showBankPayment} onOpenChange={setShowBankPayment}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Card Payment (Demo)</DialogTitle>
            <DialogDescription>
              Enter your card details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white shadow-xl">
              <p className="text-sm opacity-80">Card Number</p>
              <p className="text-xl font-mono tracking-wider mt-2">
                {cardNumber || "**** **** **** ****"}
              </p>
              <div className="flex justify-between mt-4">
                <div>
                  <p className="text-xs opacity-80">Valid Thru</p>
                  <p className="font-mono">{expiryDate || "MM/YY"}</p>
                </div>
                <div>
                  <p className="text-xs opacity-80">CVV</p>
                  <p className="font-mono">{cvv || "***"}</p>
                </div>
              </div>
            </div>

            <div>
              <Label>Card Number</Label>
              <Input
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="1234 5678 9012 3456"
                maxLength={16}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Expiry Date</Label>
                <Input
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  placeholder="MM/YY"
                  maxLength={5}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>CVV</Label>
                <Input
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  placeholder="123"
                  maxLength={3}
                  type="password"
                  className="mt-1"
                />
              </div>
            </div>
            <Button onClick={handleBankPayment} className="w-full h-12 text-lg bg-green-600 hover:bg-green-700">
              Pay ₹{medicinePrice * orderQuantity}
            </Button>
            <Button onClick={() => {
              setShowBankPayment(false);
              setShowPaymentStep(true);
            }} variant="outline" className="w-full">
              Back
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Book Test Modal */}
      <Dialog open={showBookTest} onOpenChange={setShowBookTest}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Microscope className="h-6 w-6 text-orange-600" />
              Book Lab Test
            </DialogTitle>
            <DialogDescription>
              Schedule your lab test
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Test:</p>
              <p className="text-base text-gray-800 font-bold capitalize">{selectedTest}</p>
            </div>
            <div>
              <Label>Address for Sample Collection *</Label>
              <Textarea
                value={testAddress}
                onChange={(e) => setTestAddress(e.target.value)}
                placeholder="Enter address for home sample collection..."
                className="mt-1"
              />
            </div>
            <div>
              <Label>Phone Number *</Label>
              <Input
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="+91 XXXXX-XXXXX"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Preferred Date *</Label>
              <Input
                type="date"
                value={testDate}
                onChange={(e) => setTestDate(e.target.value)}
                className="mt-1"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={submitLabBooking}
                className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800"
              >
                Book Test
              </Button>
              <Button 
                onClick={() => setShowBookTest(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PrescriptionView;
