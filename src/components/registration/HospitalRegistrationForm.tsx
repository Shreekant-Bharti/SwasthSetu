import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveRegistration, HospitalRegistration } from "@/lib/registrations";
import { toast } from "sonner";
import { playChimeSound } from "@/lib/sounds";

interface Props {
  onSuccess: () => void;
}

const HospitalRegistrationForm = ({ onSuccess }: Props) => {
  const [formData, setFormData] = useState({
    hospitalName: '',
    registrationId: '',
    type: '',
    address: '',
    numberOfBeds: '',
    contactPersonName: '',
    contactPersonMobile: '',
    email: '',
    opdHours: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validatePhone = (phone: string) => /^[6-9]\d{9}$/.test(phone);
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.hospitalName.trim()) {
      toast.error("Hospital name is required");
      return;
    }
    if (!formData.registrationId.trim()) {
      toast.error("Registration/Institution ID is required");
      return;
    }
    if (!formData.type) {
      toast.error("Please select hospital type");
      return;
    }
    if (!formData.address.trim()) {
      toast.error("Address is required");
      return;
    }
    if (!formData.numberOfBeds || parseInt(formData.numberOfBeds) < 1) {
      toast.error("Please enter valid number of beds");
      return;
    }
    if (!formData.contactPersonName.trim()) {
      toast.error("Contact person name is required");
      return;
    }
    if (!validatePhone(formData.contactPersonMobile)) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    if (!validateEmail(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    const registration: Omit<HospitalRegistration, 'id' | 'status' | 'createdAt'> = {
      role: 'hospital',
      hospitalName: formData.hospitalName.trim(),
      registrationId: formData.registrationId.trim(),
      type: formData.type as 'Government' | 'Private',
      address: formData.address.trim(),
      numberOfBeds: parseInt(formData.numberOfBeds),
      contactPersonName: formData.contactPersonName.trim(),
      contactPersonMobile: formData.contactPersonMobile,
      email: formData.email.trim(),
      opdHours: formData.opdHours.trim()
    };

    saveRegistration(registration);
    playChimeSound();
    
    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess();
    }, 500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      <div>
        <Label>Hospital Name *</Label>
        <Input
          value={formData.hospitalName}
          onChange={(e) => setFormData({...formData, hospitalName: e.target.value})}
          placeholder="Enter hospital name"
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Registration / Institution ID *</Label>
          <Input
            value={formData.registrationId}
            onChange={(e) => setFormData({...formData, registrationId: e.target.value})}
            placeholder="e.g., HOSP-12345"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Type *</Label>
          <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Government">Government</SelectItem>
              <SelectItem value="Private">Private</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Full Address *</Label>
        <Textarea
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
          placeholder="Complete address with PIN code"
          className="mt-1"
          rows={2}
        />
      </div>

      <div>
        <Label>Number of Beds (approx) *</Label>
        <Input
          type="number"
          value={formData.numberOfBeds}
          onChange={(e) => setFormData({...formData, numberOfBeds: e.target.value})}
          placeholder="e.g., 50"
          min="1"
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Contact Person Name *</Label>
          <Input
            value={formData.contactPersonName}
            onChange={(e) => setFormData({...formData, contactPersonName: e.target.value})}
            placeholder="Admin name"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Contact Person Mobile *</Label>
          <Input
            value={formData.contactPersonMobile}
            onChange={(e) => setFormData({...formData, contactPersonMobile: e.target.value})}
            placeholder="10-digit mobile"
            maxLength={10}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label>Email *</Label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          placeholder="hospital@email.com"
          className="mt-1"
        />
      </div>

      <div>
        <Label>OPD Hours</Label>
        <Input
          value={formData.opdHours}
          onChange={(e) => setFormData({...formData, opdHours: e.target.value})}
          placeholder="e.g., Mon-Sat 9AM-5PM"
          className="mt-1"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Registration'}
      </Button>
    </form>
  );
};

export default HospitalRegistrationForm;
