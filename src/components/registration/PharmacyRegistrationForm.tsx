import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { saveRegistration, PharmacyRegistration, MEDICINE_CATEGORIES } from "@/lib/registrations";
import { toast } from "sonner";
import { playChimeSound } from "@/lib/sounds";

interface Props {
  onSuccess: () => void;
}

const PharmacyRegistrationForm = ({ onSuccess }: Props) => {
  const [formData, setFormData] = useState({
    pharmacyName: '',
    ownerName: '',
    registrationNumber: '',
    address: '',
    mobile: '',
    timings: '',
    medicineCategories: [] as string[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validatePhone = (phone: string) => /^[6-9]\d{9}$/.test(phone);

  const toggleCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      medicineCategories: prev.medicineCategories.includes(category)
        ? prev.medicineCategories.filter(c => c !== category)
        : [...prev.medicineCategories, category]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.pharmacyName.trim()) {
      toast.error("Pharmacy name is required");
      return;
    }
    if (!formData.ownerName.trim()) {
      toast.error("Owner name is required");
      return;
    }
    if (!formData.registrationNumber.trim()) {
      toast.error("Pharmacy registration number is required");
      return;
    }
    if (!formData.address.trim()) {
      toast.error("Shop address is required");
      return;
    }
    if (!validatePhone(formData.mobile)) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    if (formData.medicineCategories.length === 0) {
      toast.error("Please select at least one medicine category");
      return;
    }

    setIsSubmitting(true);

    const registration: Omit<PharmacyRegistration, 'id' | 'status' | 'createdAt'> = {
      role: 'pharmacy',
      pharmacyName: formData.pharmacyName.trim(),
      ownerName: formData.ownerName.trim(),
      registrationNumber: formData.registrationNumber.trim(),
      address: formData.address.trim(),
      mobile: formData.mobile,
      timings: formData.timings.trim(),
      medicineCategories: formData.medicineCategories
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
        <Label>Pharmacy Name *</Label>
        <Input
          value={formData.pharmacyName}
          onChange={(e) => setFormData({...formData, pharmacyName: e.target.value})}
          placeholder="Enter pharmacy name"
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Owner Name *</Label>
          <Input
            value={formData.ownerName}
            onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
            placeholder="Owner full name"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Pharmacy Registration No. *</Label>
          <Input
            value={formData.registrationNumber}
            onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})}
            placeholder="e.g., PH-12345"
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label>Shop Address *</Label>
        <Input
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
          placeholder="Complete shop address"
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
          <Label>Timings</Label>
          <Input
            value={formData.timings}
            onChange={(e) => setFormData({...formData, timings: e.target.value})}
            placeholder="e.g., 8AM-10PM"
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label>Medicines Categories Stocked *</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {MEDICINE_CATEGORIES.map(cat => (
            <div key={cat} className="flex items-center space-x-2">
              <Checkbox
                id={cat}
                checked={formData.medicineCategories.includes(cat)}
                onCheckedChange={() => toggleCategory(cat)}
              />
              <Label htmlFor={cat} className="text-sm font-normal cursor-pointer">{cat}</Label>
            </div>
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Registration'}
      </Button>
    </form>
  );
};

export default PharmacyRegistrationForm;
