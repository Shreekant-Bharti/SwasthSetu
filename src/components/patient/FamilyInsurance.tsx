import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Shield, Plus, Trash2, CreditCard, Download } from "lucide-react";
import { addInsuranceRequest, getInsurancesByUserId } from "@/lib/localStorage";
import { toast } from "sonner";
import { z } from "zod";

const memberSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name too long"),
  age: z.number().min(1, "Age must be at least 1").max(120, "Invalid age"),
  relation: z.string().min(1, "Relation is required"),
});

interface FamilyMember {
  name: string;
  age: number;
  relation: string;
}

interface FamilyInsuranceProps {
  userId: string;
}

const plans = [
  { id: 'basic', name: 'Basic Plan', price: 500, coverage: 'Up to ₹50,000' },
  { id: 'standard', name: 'Standard Plan', price: 1200, coverage: 'Up to ₹2,00,000' },
  { id: 'premium', name: 'Premium Plan', price: 2500, coverage: 'Up to ₹5,00,000' },
];

const successSound = "data:audio/wav;base64,UklGRhwAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQA=";

const FamilyInsurance = ({ userId }: FamilyInsuranceProps) => {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [newMember, setNewMember] = useState({ name: '', age: '', relation: '' });
  const [selectedPlan, setSelectedPlan] = useState('');
  const [activeInsurances, setActiveInsurances] = useState<any[]>([]);
  
  // Payment flow states
  const [showPaymentStep, setShowPaymentStep] = useState(false);
  const [showBankPayment, setShowBankPayment] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  
  // Load active insurances
  useState(() => {
    const insurances = getInsurancesByUserId(userId);
    setActiveInsurances(insurances.filter(ins => ins.status === 'active'));
  });

  const addMember = () => {
    try {
      const validated: FamilyMember = {
        name: newMember.name,
        age: parseInt(newMember.age),
        relation: newMember.relation
      };
      
      memberSchema.parse(validated);
      
      setMembers([...members, validated]);
      setNewMember({ name: '', age: '', relation: '' });
      toast.success("Family member added");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
    }
  };

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (members.length === 0) {
      toast.error("Please add at least one family member");
      return;
    }
    if (!selectedPlan) {
      toast.error("Please select a plan");
      return;
    }
    setShowPaymentStep(true);
  };

  const handlePayOnline = () => {
    setShowPaymentStep(false);
    setShowBankPayment(true);
  };

  const handleBankPayment = () => {
    if (!cardNumber || !expiryDate || !cvv) {
      toast.error("Please fill all payment details");
      return;
    }

    // Simulate payment processing
    toast.loading("Processing payment...");
    
    setTimeout(() => {
      toast.dismiss();
      const newOrderId = `INS${Date.now()}`;
      setOrderId(newOrderId);
      
      const plan = plans.find(p => p.id === selectedPlan);
      
      // Save insurance request
      addInsuranceRequest({
        userId,
        familyMembers: members,
        plan: plan?.name || selectedPlan,
        planPrice: plan?.price || 0,
        coverage: plan?.coverage || '',
        orderId: newOrderId,
        status: 'pending',
        paymentMethod: 'online'
      });

      // Play success sound
      const audio = new Audio(successSound);
      audio.play().catch(() => {});

      setShowBankPayment(false);
      setShowSuccess(true);
      
      // Reset form
      setMembers([]);
      setSelectedPlan('');
      setCardNumber('');
      setExpiryDate('');
      setCvv('');
    }, 2000);
  };

  const downloadReceipt = () => {
    const plan = plans.find(p => p.id === selectedPlan);
    const receipt = `
INSURANCE ORDER RECEIPT
━━━━━━━━━━━━━━━━━━━━━━
Order ID: ${orderId}
Date: ${new Date().toLocaleString()}

Plan: ${plan?.name}
Coverage: ${plan?.coverage}
Premium: ₹${plan?.price}/year

Family Members: ${members.length}
${members.map((m, i) => `${i + 1}. ${m.name} (${m.age}y, ${m.relation})`).join('\n')}

Payment: Online
Amount Paid: ₹${plan?.price}

Status: Pending Approval
━━━━━━━━━━━━━━━━━━━━━━
SwasthSetu Insurance
    `;
    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `insurance-receipt-${orderId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Receipt downloaded");
  };

  const closeSuccess = () => {
    setShowSuccess(false);
    setOrderId('');
    // Reload active insurances
    const insurances = getInsurancesByUserId(userId);
    setActiveInsurances(insurances.filter(ins => ins.status === 'active'));
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Family Insurance
          </CardTitle>
          <CardDescription>Insure your family with affordable health plans</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Active Insurances */}
          {activeInsurances.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-primary">Active Insurance Plans</h4>
              {activeInsurances.map((insurance, idx) => (
                <div key={idx} className="p-4 border-2 border-primary/50 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-primary">{insurance.plan}</p>
                      <p className="text-sm text-muted-foreground">Coverage: {insurance.coverage}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {insurance.familyMembers.length} family members covered
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-3 py-1 bg-green-500/20 text-green-700 rounded-full text-xs font-semibold">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        <div className="space-y-4">
          <h4 className="font-semibold">Add Family Members</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="member-name">Name</Label>
              <Input
                id="member-name"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                placeholder="Full name"
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-age">Age</Label>
              <Input
                id="member-age"
                type="number"
                value={newMember.age}
                onChange={(e) => setNewMember({ ...newMember, age: e.target.value })}
                placeholder="Age"
                min="1"
                max="120"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-relation">Relation</Label>
              <Select value={newMember.relation} onValueChange={(value) => setNewMember({ ...newMember, relation: value })}>
                <SelectTrigger id="member-relation">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spouse">Spouse</SelectItem>
                  <SelectItem value="child">Child</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="sibling">Sibling</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={addMember} variant="outline" className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Member
          </Button>

          {members.length > 0 && (
            <div className="space-y-2">
              {members.map((member, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {member.age} years, {member.relation}
                    </p>
                  </div>
                  <Button onClick={() => removeMember(index)} variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Label>Select Plan</Label>
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                selectedPlan === plan.id ? 'border-primary bg-primary/5 shadow-lg' : 'hover:bg-accent/50'
              }`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{plan.name}</h4>
                  <p className="text-sm text-muted-foreground">Coverage: {plan.coverage}</p>
                </div>
                <p className="font-bold text-primary">₹{plan.price}/year</p>
              </div>
            </div>
          ))}
        </div>

        <Button onClick={handleSubmit} className="w-full" disabled={members.length === 0 || !selectedPlan}>
          Proceed to Payment
        </Button>
      </CardContent>
    </Card>

    {/* Payment Options Dialog */}
    <Dialog open={showPaymentStep} onOpenChange={setShowPaymentStep}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Payment Method</DialogTitle>
          <DialogDescription>Choose your preferred payment method</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          <Button 
            onClick={handlePayOnline} 
            className="w-full h-16 text-lg"
            variant="default"
          >
            <CreditCard className="mr-2 h-5 w-5" />
            Pay Online - ₹{plans.find(p => p.id === selectedPlan)?.price}
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    {/* Dummy Bank Payment Dialog */}
    <Dialog open={showBankPayment} onOpenChange={setShowBankPayment}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bank Payment</DialogTitle>
          <DialogDescription>Enter your card details</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Card Number</Label>
            <Input
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              maxLength={16}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
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
          <div className="pt-2 space-y-2">
            <Button onClick={handleBankPayment} className="w-full">
              Pay ₹{plans.find(p => p.id === selectedPlan)?.price}
            </Button>
            <Button onClick={() => setShowBankPayment(false)} variant="outline" className="w-full">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Success Dialog */}
    <Dialog open={showSuccess} onOpenChange={closeSuccess}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-green-600 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Payment Successful!
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Order ID</p>
            <p className="text-lg font-mono font-bold">{orderId}</p>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-sm font-semibold text-yellow-800">
              ⏳ Wait for Insurance Approval
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              Your application is under review. You'll be notified once approved.
            </p>
          </div>

          <Button onClick={downloadReceipt} variant="outline" className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Download Receipt
          </Button>

          <Button onClick={closeSuccess} className="w-full">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default FamilyInsurance;
