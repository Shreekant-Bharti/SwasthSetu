import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar, CreditCard, Check, Download, Loader2, Building2 } from "lucide-react";
import { addAppointment } from "@/lib/localStorage";
import { toast } from "sonner";
import { z } from "zod";
import html2canvas from "html2canvas";

const hospitals = [
  'Dhanpur Health Centre',
  'Rampur Community Hospital',
  'Snehh Memorial Clinic'
];

const departments = [
  'General Medicine',
  'Cardiology',
  'Neurology',
  'Orthopedics',
  'ENT',
  'Dermatology',
  'Pediatrics',
  'Oncology',
  'Gynecology',
  'Ophthalmology'
];

const timeSlots = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
];

const appointmentSchema = z.object({
  hospital: z.string().min(1, "Please select a hospital"),
  department: z.string().min(1, "Please select a department"),
  date: z.string().min(1, "Please select a date"),
  time: z.string().min(1, "Please select a time"),
});

interface BookAppointmentProps {
  userId: string;
  userName: string;
}

const BookAppointment = ({ userId, userName }: BookAppointmentProps) => {
  const [formData, setFormData] = useState({
    hospital: '',
    department: '',
    date: '',
    time: ''
  });
  
  const [showPayment, setShowPayment] = useState(false);
  const [showBankPage, setShowBankPage] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [appointmentId, setAppointmentId] = useState("");
  const receiptRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      appointmentSchema.parse(formData);
      setShowPayment(true);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
    }
  };

  const handlePayOnline = () => {
    setShowPayment(false);
    setShowBankPage(true);
  };

  const handleBankPayment = () => {
    if (!cardNumber || !cvv || !expiryDate) {
      toast.error("Please fill all payment details");
      return;
    }
    
    setIsProcessing(true);
    
    setTimeout(() => {
      // Generate appointment ID
      const newAppointmentId = `APT${Date.now().toString().slice(-8)}`;
      setAppointmentId(newAppointmentId);
      
      // Save appointment to localStorage
      addAppointment({
        userId,
        patientName: userName,
        doctor: 'Dr. Sneha Kumari',
        hospital: formData.hospital,
        department: formData.department,
        date: formData.date,
        time: formData.time,
        status: 'pending',
        paymentStatus: 'paid',
        amount: 10
      });

      // Play success chime
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBT2U4PbLcyYFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBT2U4PbLcyYFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBT2U4PbLcyYFLIHO8tiJNw==');
      audio.play().catch(() => {});
      
      setIsProcessing(false);
      setShowBankPage(false);
      setShowSuccess(true);
    }, 2000);
  };

  const downloadReceipt = async () => {
    if (receiptRef.current) {
      try {
        const canvas = await html2canvas(receiptRef.current, {
          backgroundColor: '#ffffff',
          scale: 2
        });
        const link = document.createElement('a');
        link.download = `appointment-receipt-${appointmentId}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        toast.success("Receipt downloaded!");
      } catch (error) {
        // Fallback to text download
        const receiptText = `
╔════════════════════════════════════════╗
║     SWASTHSETU APPOINTMENT RECEIPT     ║
╚════════════════════════════════════════╝

Appointment ID: ${appointmentId}
Date: ${new Date().toLocaleDateString()}

Patient: ${userName}
Hospital: ${formData.hospital}
Department: ${formData.department}
Appointment Date: ${formData.date}
Time: ${formData.time}
Doctor: Dr. Sneha Kumari

Payment: ₹10.00 (PAID)
Payment Method: Online

Thank you for booking with SwasthSetu!
`;
        const blob = new Blob([receiptText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `appointment-receipt-${appointmentId}.txt`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("Receipt downloaded!");
      }
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    setFormData({ hospital: '', department: '', date: '', time: '' });
    setCardNumber("");
    setCvv("");
    setExpiryDate("");
    toast.success("Appointment booked successfully! Check your appointment history.");
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Book Hospital Appointment
          </CardTitle>
          <CardDescription>Schedule your visit to a nearby health center</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hospital">Select Hospital</Label>
              <Select value={formData.hospital} onValueChange={(value) => setFormData({ ...formData, hospital: value })}>
                <SelectTrigger id="hospital">
                  <SelectValue placeholder="Choose a hospital" />
                </SelectTrigger>
                <SelectContent>
                  {hospitals.map((hospital) => (
                    <SelectItem key={hospital} value={hospital}>{hospital}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Select Department</Label>
              <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                <SelectTrigger id="department">
                  <SelectValue placeholder="Choose a department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Select Date</Label>
              <Input
                id="date"
                type="date"
                min={minDate}
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Select Time</Label>
              <Select value={formData.time} onValueChange={(value) => setFormData({ ...formData, time: value })}>
                <SelectTrigger id="time">
                  <SelectValue placeholder="Choose a time slot" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full">Proceed to Payment</Button>
          </form>
        </CardContent>
      </Card>

      {/* Payment Selection Modal */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Payment Required
            </DialogTitle>
            <DialogDescription>
              Booking fee: ₹10.00 (Online Payment Only)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hospital:</span>
                <span className="font-medium">{formData.hospital}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Department:</span>
                <span className="font-medium">{formData.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date & Time:</span>
                <span className="font-medium">{formData.date} at {formData.time}</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between">
                <span className="font-bold">Total:</span>
                <span className="font-bold text-primary">₹10.00</span>
              </div>
            </div>
            
            <Button onClick={handlePayOnline} className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
              <CreditCard className="mr-2 h-4 w-4" />
              Pay Online - ₹10.00
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              Cash on Delivery is not available for appointment booking
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bank Payment Modal */}
      <Dialog open={showBankPage} onOpenChange={setShowBankPage}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Secure Bank Payment
            </DialogTitle>
            <DialogDescription>
              Enter your card details (Demo - Any values work)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-4 text-white">
              <p className="text-xs opacity-80">Amount to Pay</p>
              <p className="text-3xl font-bold">₹10.00</p>
            </div>
            
            <div className="space-y-2">
              <Label>Card Number</Label>
              <Input
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                maxLength={19}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Expiry Date</Label>
                <Input
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  maxLength={5}
                />
              </div>
              <div className="space-y-2">
                <Label>CVV</Label>
                <Input
                  placeholder="123"
                  type="password"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  maxLength={3}
                />
              </div>
            </div>
            
            <Button 
              onClick={handleBankPayment} 
              className="w-full bg-gradient-to-r from-green-600 to-green-700"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay ₹10.00
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Modal with Receipt */}
      <Dialog open={showSuccess} onOpenChange={handleSuccessClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <Check className="h-6 w-6" />
              Payment Successful!
            </DialogTitle>
          </DialogHeader>
          
          <div ref={receiptRef} className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-primary">SwasthSetu</h3>
              <p className="text-xs text-muted-foreground">Appointment Receipt</p>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Receipt ID:</span>
                <span className="font-mono font-bold">{appointmentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
              <div className="border-t my-2"></div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Patient:</span>
                <span className="font-medium">{userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hospital:</span>
                <span className="font-medium">{formData.hospital}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Department:</span>
                <span className="font-medium">{formData.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium">{formData.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time:</span>
                <span className="font-medium">{formData.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Doctor:</span>
                <span className="font-medium">Dr. Sneha Kumari</span>
              </div>
              <div className="border-t my-2"></div>
              <div className="flex justify-between text-lg font-bold">
                <span>Amount Paid:</span>
                <span className="text-green-600">₹10.00</span>
              </div>
              <div className="text-center mt-4">
                <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                  PAYMENT CONFIRMED
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={downloadReceipt} className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Download Receipt
            </Button>
            <Button onClick={handleSuccessClose} variant="outline" className="flex-1">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BookAppointment;