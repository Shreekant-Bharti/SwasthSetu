import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveRegistration, AdminRegistration } from "@/lib/registrations";
import { toast } from "sonner";
import { playChimeSound } from "@/lib/sounds";

interface Props {
  onSuccess: () => void;
}

const AdminRegistrationForm = ({ onSuccess }: Props) => {
  const [formData, setFormData] = useState({
    adminName: '',
    organizationName: '',
    email: '',
    mobile: '',
    roleDescription: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validatePhone = (phone: string) => /^[6-9]\d{9}$/.test(phone);
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.adminName.trim()) {
      toast.error("Admin name is required");
      return;
    }
    if (!formData.organizationName.trim()) {
      toast.error("Organization name is required");
      return;
    }
    if (!validateEmail(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!validatePhone(formData.mobile)) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    setIsSubmitting(true);

    const registration: Omit<AdminRegistration, 'id' | 'status' | 'createdAt'> = {
      role: 'admin',
      adminName: formData.adminName.trim(),
      organizationName: formData.organizationName.trim(),
      email: formData.email.trim(),
      mobile: formData.mobile,
      roleDescription: formData.roleDescription.trim()
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
        <Label>Admin Name *</Label>
        <Input
          value={formData.adminName}
          onChange={(e) => setFormData({...formData, adminName: e.target.value})}
          placeholder="Enter your full name"
          className="mt-1"
        />
      </div>

      <div>
        <Label>Organization Name *</Label>
        <Input
          value={formData.organizationName}
          onChange={(e) => setFormData({...formData, organizationName: e.target.value})}
          placeholder="Enter organization name"
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Email *</Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="admin@email.com"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Mobile *</Label>
          <Input
            value={formData.mobile}
            onChange={(e) => setFormData({...formData, mobile: e.target.value})}
            placeholder="10-digit mobile"
            maxLength={10}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label>Role Description</Label>
        <Textarea
          value={formData.roleDescription}
          onChange={(e) => setFormData({...formData, roleDescription: e.target.value})}
          placeholder="Describe your admin role and responsibilities..."
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

export default AdminRegistrationForm;
