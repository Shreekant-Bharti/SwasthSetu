import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveRegistration, InsuranceRegistration } from "@/lib/registrations";
import { toast } from "sonner";
import { playChimeSound } from "@/lib/sounds";

interface Props {
  onSuccess: () => void;
}

const InsuranceRegistrationForm = ({ onSuccess }: Props) => {
  const [formData, setFormData] = useState({
    companyName: '',
    type: '',
    licenseId: '',
    contactPersonName: '',
    contactPersonMobile: '',
    coveragePlans: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validatePhone = (phone: string) => /^[6-9]\d{9}$/.test(phone);
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.companyName.trim()) {
      toast.error("Company/Agent name is required");
      return;
    }
    if (!formData.type) {
      toast.error("Please select type");
      return;
    }
    if (!formData.licenseId.trim()) {
      toast.error("License/Agent ID is required");
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

    const registration: Omit<InsuranceRegistration, 'id' | 'status' | 'createdAt'> = {
      role: 'insurance',
      companyName: formData.companyName.trim(),
      type: formData.type as 'Company' | 'Agent',
      licenseId: formData.licenseId.trim(),
      contactPersonName: formData.contactPersonName.trim(),
      contactPersonMobile: formData.contactPersonMobile,
      coveragePlans: formData.coveragePlans.trim(),
      email: formData.email.trim()
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
        <Label>Company / Agent Name *</Label>
        <Input
          value={formData.companyName}
          onChange={(e) => setFormData({...formData, companyName: e.target.value})}
          placeholder="Enter company or agent name"
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Type *</Label>
          <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Company">Company</SelectItem>
              <SelectItem value="Agent">Agent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>License / Agent ID *</Label>
          <Input
            value={formData.licenseId}
            onChange={(e) => setFormData({...formData, licenseId: e.target.value})}
            placeholder="e.g., INS-12345"
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Contact Person Name *</Label>
          <Input
            value={formData.contactPersonName}
            onChange={(e) => setFormData({...formData, contactPersonName: e.target.value})}
            placeholder="Contact name"
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
          placeholder="insurance@email.com"
          className="mt-1"
        />
      </div>

      <div>
        <Label>Coverage Plans Offered</Label>
        <Textarea
          value={formData.coveragePlans}
          onChange={(e) => setFormData({...formData, coveragePlans: e.target.value})}
          placeholder="Brief list of insurance plans offered..."
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

export default InsuranceRegistrationForm;
