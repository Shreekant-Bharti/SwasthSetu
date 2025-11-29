import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { saveRegistration, PatientRegistration } from "@/lib/registrations";
import { toast } from "sonner";
import { playChimeSound } from "@/lib/sounds";

interface Props {
  onSuccess: () => void;
}

const PatientRegistrationForm = ({ onSuccess }: Props) => {
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    gender: '',
    village: '',
    mobile: '',
    email: '',
    emergencyContactName: '',
    emergencyContactNumber: '',
    hasFamilyInsurance: 'no',
    medicalHistory: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validatePhone = (phone: string) => /^[6-9]\d{9}$/.test(phone);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName.trim()) {
      toast.error("Full name is required");
      return;
    }
    if (!formData.age || parseInt(formData.age) < 1 || parseInt(formData.age) > 120) {
      toast.error("Please enter a valid age");
      return;
    }
    if (!formData.gender) {
      toast.error("Please select gender");
      return;
    }
    if (!formData.village.trim()) {
      toast.error("Village/Town is required");
      return;
    }
    if (!validatePhone(formData.mobile)) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    if (!formData.emergencyContactName.trim()) {
      toast.error("Emergency contact name is required");
      return;
    }
    if (!validatePhone(formData.emergencyContactNumber)) {
      toast.error("Please enter a valid emergency contact number");
      return;
    }

    setIsSubmitting(true);

    const registration: Omit<PatientRegistration, 'id' | 'status' | 'createdAt'> = {
      role: 'patient',
      fullName: formData.fullName.trim(),
      age: parseInt(formData.age),
      gender: formData.gender,
      village: formData.village.trim(),
      mobile: formData.mobile,
      email: formData.email.trim() || undefined,
      emergencyContactName: formData.emergencyContactName.trim(),
      emergencyContactNumber: formData.emergencyContactNumber,
      hasFamilyInsurance: formData.hasFamilyInsurance === 'yes',
      medicalHistory: formData.medicalHistory.trim()
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
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label>Full Name *</Label>
          <Input
            value={formData.fullName}
            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            placeholder="Enter your full name"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label>Age *</Label>
          <Input
            type="number"
            value={formData.age}
            onChange={(e) => setFormData({...formData, age: e.target.value})}
            placeholder="Age"
            min="1"
            max="120"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label>Gender *</Label>
          <Select value={formData.gender} onValueChange={(v) => setFormData({...formData, gender: v})}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Village / Town *</Label>
        <Input
          value={formData.village}
          onChange={(e) => setFormData({...formData, village: e.target.value})}
          placeholder="Enter village or town name"
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Mobile Number *</Label>
          <Input
            value={formData.mobile}
            onChange={(e) => setFormData({...formData, mobile: e.target.value})}
            placeholder="10-digit mobile"
            maxLength={10}
            className="mt-1"
          />
        </div>
        <div>
          <Label>Email (optional)</Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="your@email.com"
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Emergency Contact Name *</Label>
          <Input
            value={formData.emergencyContactName}
            onChange={(e) => setFormData({...formData, emergencyContactName: e.target.value})}
            placeholder="Contact person"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Emergency Contact Number *</Label>
          <Input
            value={formData.emergencyContactNumber}
            onChange={(e) => setFormData({...formData, emergencyContactNumber: e.target.value})}
            placeholder="10-digit mobile"
            maxLength={10}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label>Do you have Family Insurance? *</Label>
        <RadioGroup 
          value={formData.hasFamilyInsurance} 
          onValueChange={(v) => setFormData({...formData, hasFamilyInsurance: v})}
          className="flex gap-4 mt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="ins-yes" />
            <Label htmlFor="ins-yes">Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="ins-no" />
            <Label htmlFor="ins-no">No</Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label>Brief Medical History</Label>
        <Textarea
          value={formData.medicalHistory}
          onChange={(e) => setFormData({...formData, medicalHistory: e.target.value})}
          placeholder="Any allergies, chronic conditions, previous surgeries..."
          className="mt-1"
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Registration'}
      </Button>
    </form>
  );
};

export default PatientRegistrationForm;
