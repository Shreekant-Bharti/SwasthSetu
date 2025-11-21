import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";
import { addAppointment } from "@/lib/localStorage";
import { toast } from "sonner";
import { z } from "zod";

const hospitals = [
  'Dhanpur Health Centre',
  'Rampur Community Hospital',
  'Snehh Memorial Clinic'
];

const timeSlots = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
];

const appointmentSchema = z.object({
  hospital: z.string().min(1, "Please select a hospital"),
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
    date: '',
    time: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      appointmentSchema.parse(formData);
      
      addAppointment({
        userId,
        patientName: userName,
        doctor: 'Dr. Snehh Kumar',
        hospital: formData.hospital,
        date: formData.date,
        time: formData.time,
        status: 'pending'
      });

      toast.success("Appointment booked successfully! Check your appointment history.");
      setFormData({ hospital: '', date: '', time: '' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
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

          <Button type="submit" className="w-full">Book Appointment</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BookAppointment;
