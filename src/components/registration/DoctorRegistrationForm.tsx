import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveRegistration, DoctorRegistration, SPECIALIZATIONS, HOSPITALS } from "@/lib/registrations";
import { toast } from "sonner";
import { playChimeSound } from "@/lib/sounds";

interface Props {
  onSuccess: () => void;
}

const DoctorRegistrationForm = ({ onSuccess }: Props) => {
  const [formData, setFormData] = useState({
    fullName: '',
    licenseNumber: '',
    specialization: '',
    yearsOfExperience: '',
    hospitalAffiliation: '',
    mobile: '',
    email: '',
    bio: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validatePhone = (phone: string) => /^[6-9]\d{9}$/.test(phone);
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName.trim()) {
      toast.error("Full name is required");
      return;
    }
    if (!formData.licenseNumber.trim()) {
      toast.error("Medical registration/license number is required");
      return;
    }
    if (!formData.specialization) {
      toast.error("Please select specialization");
      return;
    }
    if (!formData.yearsOfExperience || parseInt(formData.yearsOfExperience) < 0) {
      toast.error("Please enter valid years of experience");
      return;
    }
    if (!formData.hospitalAffiliation) {
      toast.error("Please select hospital affiliation");
      return;
    }
    if (!validatePhone(formData.mobile)) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    if (!validateEmail(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    const registration: Omit<DoctorRegistration, 'id' | 'status' | 'createdAt'> = {
      role: 'doctor',
      fullName: formData.fullName.trim(),
      licenseNumber: formData.licenseNumber.trim(),
      specialization: formData.specialization,
      yearsOfExperience: parseInt(formData.yearsOfExperience),
      hospitalAffiliation: formData.hospitalAffiliation,
      mobile: formData.mobile,
      email: formData.email.trim(),
      bio: formData.bio.trim()
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
        <Label>Full Name (Dr.) *</Label>
        <Input
          value={formData.fullName}
          onChange={(e) => setFormData({...formData, fullName: e.target.value})}
          placeholder="Dr. Full Name"
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Medical Registration / License No. *</Label>
          <Input
            value={formData.licenseNumber}
            onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
            placeholder="e.g., MCI-123456"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Years of Experience *</Label>
          <Input
            type="number"
            value={formData.yearsOfExperience}
            onChange={(e) => setFormData({...formData, yearsOfExperience: e.target.value})}
            placeholder="Years"
            min="0"
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Specialization *</Label>
          <Select value={formData.specialization} onValueChange={(v) => setFormData({...formData, specialization: v})}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {SPECIALIZATIONS.map(spec => (
                <SelectItem key={spec} value={spec}>{spec}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Hospital Affiliated With *</Label>
          <Select value={formData.hospitalAffiliation} onValueChange={(v) => setFormData({...formData, hospitalAffiliation: v})}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {HOSPITALS.map(hosp => (
                <SelectItem key={hosp} value={hosp}>{hosp}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
          <Label>Email *</Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="your@email.com"
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label>Short Bio / Languages Spoken</Label>
        <Textarea
          value={formData.bio}
          onChange={(e) => setFormData({...formData, bio: e.target.value})}
          placeholder="Brief introduction, languages you speak, areas of expertise..."
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

export default DoctorRegistrationForm;
