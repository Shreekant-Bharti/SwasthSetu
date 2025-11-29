import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Pill, Search, CheckCircle, CreditCard, Truck } from "lucide-react";
import { getMedicines, updateMedicineStock, Medicine, addMedicineReservation, getCurrentUser, getNewMedicineIds, clearNewMedicineId } from "@/lib/localStorage";
import { toast } from "sonner";

const MedicineReservation = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [highlightedIds, setHighlightedIds] = useState<string[]>([]);
  
  // Step 1: Quantity
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  
  // Step 2: Address
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [phone, setPhone] = useState("");
  
  // Step 3: Payment
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Online' | null>(null);
  
  // Step 4: Bank Payment
  const [showBankModal, setShowBankModal] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  
  // Step 5: Success
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  
  const user = getCurrentUser();

  useEffect(() => {
    const loadMedicinesAndHighlights = () => {
      setMedicines(getMedicines());
      
      // Check for newly added medicines to highlight
      const newIds = getNewMedicineIds();
      if (newIds.length > 0) {
        setHighlightedIds(prev => [...new Set([...prev, ...newIds])]);
        
        // Clear highlight after 4 seconds
        newIds.forEach(id => {
          setTimeout(() => {
            clearNewMedicineId(id);
            setHighlightedIds(prev => prev.filter(i => i !== id));
          }, 4000);
        });
      }
    };
    
    loadMedicinesAndHighlights();
    
    // Poll for new medicines every 2 seconds
    const interval = setInterval(loadMedicinesAndHighlights, 2000);
    return () => clearInterval(interval);
  }, []);

  const filteredMedicines = medicines.filter(med => 
    med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    med.shop.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleReserveClick = (medicine: Medicine) => {
    if (medicine.stock === 0) {
      toast.error("Out of stock");
      return;
    }
    setSelectedMedicine(medicine);
    setQuantity(1);
    setShowQuantityModal(true);
  };

  const handleQuantityNext = () => {
    if (!selectedMedicine || quantity < 1) {
      toast.error("Please enter valid quantity");
      return;
    }
    if (quantity > selectedMedicine.stock) {
      toast.error(`Only ${selectedMedicine.stock} units available`);
      return;
    }
    setShowQuantityModal(false);
    setShowAddressModal(true);
  };

  const handleAddressNext = () => {
    if (!customerName || !address || !pincode || !phone) {
      toast.error("Please fill all fields");
      return;
    }
    setShowAddressModal(false);
    setShowPaymentModal(true);
  };

  const handlePaymentSelect = (method: 'COD' | 'Online') => {
    setPaymentMethod(method);
    if (method === 'Online') {
      setShowPaymentModal(false);
      setShowBankModal(true);
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
    setShowBankModal(false);
    completeOrder('Online');
  };

  const completeOrder = (method: 'COD' | 'Online') => {
    if (!selectedMedicine) return;

    // Update medicine stock
    updateMedicineStock(selectedMedicine.id, selectedMedicine.stock - quantity);

    // Create order
    const order = addMedicineReservation({
      patientId: user?.id || '1',
      patientName: user?.name || 'Patient',
      medicineName: selectedMedicine.name,
      quantity: quantity,
      totalPrice: selectedMedicine.price * quantity,
      shopName: selectedMedicine.shop,
      customerName: customerName,
      address: address,
      pincode: pincode,
      phone: phone,
      paymentMethod: method
    });

    setCurrentOrder(order);
    
    // Play success sound
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBT2U4PbLcyYFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBT2U4PbLcyYFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBT2U4PbLcyYFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBT2U4PbLcyYFLIHO8tiJNw==');
    audio.play().catch(() => {});

    // Refresh medicines list
    setMedicines(getMedicines());
    
    // Reset form
    setCustomerName("");
    setAddress("");
    setPincode("");
    setPhone("");
    setCardNumber("");
    setCvv("");
    setExpiryDate("");
    
    setShowSuccessModal(true);
    toast.success("Order placed successfully!");
  };

  const downloadReceipt = () => {
    toast.info("Receipt download feature coming soon!");
  };

  const closeAllModals = () => {
    setShowQuantityModal(false);
    setShowAddressModal(false);
    setShowPaymentModal(false);
    setShowBankModal(false);
    setShowSuccessModal(false);
    setSelectedMedicine(null);
  };

  return (
    <>
      <Card className="shadow-xl border-2 border-blue-200 animate-fade-in">
        <CardHeader className="bg-gradient-to-r from-blue-100 to-purple-100">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Pill className="h-6 w-6 text-primary" />
            Medicine Availability & Reservation
          </CardTitle>
          <CardDescription className="text-base">Reserve medicines from nearby pharmacies</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search medicines by name or pharmacy..."
                className="pl-10 h-12 text-lg border-2 border-blue-200 focus:border-blue-400"
              />
            </div>
          </div>

          {/* Medicine List */}
          <div className="space-y-4">
            {filteredMedicines.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No medicines found</p>
            ) : (
              filteredMedicines.map((medicine) => (
                <div
                  key={medicine.id}
                  className={`flex items-center justify-between p-5 border-2 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all bg-gradient-to-r from-white to-blue-50 ${
                    highlightedIds.includes(medicine.id) 
                      ? 'border-green-400 ring-2 ring-green-300 animate-new-medicine-highlight bg-gradient-to-r from-green-50 to-green-100' 
                      : 'border-blue-100'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xl text-gray-800">{medicine.name}</h4>
                      {highlightedIds.includes(medicine.id) && (
                        <Badge className="bg-green-500 text-white text-xs animate-pulse">NEW</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{medicine.shop}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <Badge 
                        variant={medicine.stock > 10 ? "default" : medicine.stock > 0 ? "secondary" : "destructive"}
                        className="text-base px-3 py-1"
                      >
                        Stock: {medicine.stock}
                      </Badge>
                      <span className="text-lg font-bold text-green-700">₹{medicine.price}</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleReserveClick(medicine)}
                    disabled={medicine.stock === 0}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
                  >
                    Reserve
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Quantity Modal */}
      <Dialog open={showQuantityModal} onOpenChange={setShowQuantityModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Select Quantity</DialogTitle>
            <DialogDescription>How many units do you want to order?</DialogDescription>
          </DialogHeader>
          {selectedMedicine && (
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="font-bold text-lg">{selectedMedicine.name}</p>
                <p className="text-sm text-muted-foreground">{selectedMedicine.shop}</p>
                <p className="text-lg font-bold text-green-700 mt-2">₹{selectedMedicine.price} per unit</p>
              </div>
              
              <div>
                <Label className="text-base">Quantity (Max: {selectedMedicine.stock})</Label>
                <Input
                  type="number"
                  min="1"
                  max={selectedMedicine.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="mt-2 h-12 text-lg"
                />
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-lg font-bold text-gray-800">Total: ₹{selectedMedicine.price * quantity}</p>
              </div>

              <Button onClick={handleQuantityNext} className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700">
                Next
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Step 2: Address Modal */}
      <Dialog open={showAddressModal} onOpenChange={setShowAddressModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Delivery Address</DialogTitle>
            <DialogDescription>Enter your delivery details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Full Name *</Label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your name"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Full Address *</Label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House no, Street, Area"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>PIN Code *</Label>
                <Input
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="123456"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Mobile Number *</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 XXXXX-XXXXX"
                  className="mt-1"
                />
              </div>
            </div>
            <Button onClick={handleAddressNext} className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700">
              Next
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Step 3: Payment Options Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Payment Method</DialogTitle>
            <DialogDescription>Choose your payment option</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button
              onClick={() => handlePaymentSelect('COD')}
              className="w-full h-16 text-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 flex items-center justify-center gap-3"
            >
              <Truck className="h-6 w-6" />
              Cash on Delivery (COD)
            </Button>
            <Button
              onClick={() => handlePaymentSelect('Online')}
              className="w-full h-16 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center justify-center gap-3"
            >
              <CreditCard className="h-6 w-6" />
              Pay Online
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Step 4: Bank Payment Modal */}
      <Dialog open={showBankModal} onOpenChange={setShowBankModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Card Payment</DialogTitle>
            <DialogDescription>Enter your card details (Demo)</DialogDescription>
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
              Pay ₹{selectedMedicine && selectedMedicine.price * quantity}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Step 5: Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-scale-in">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <DialogTitle className="text-3xl text-green-700">Order Successful!</DialogTitle>
              <DialogDescription className="text-center text-lg">
                Your order has been placed successfully
              </DialogDescription>
            </div>
          </DialogHeader>
          
          {currentOrder && (
            <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-center mb-4">
                <h3 className="text-2xl font-bold">Order Receipt</h3>
                <p className="text-sm text-muted-foreground">Order ID: #{currentOrder.id}</p>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-semibold">Medicine:</span>
                  <span>{currentOrder.medicineName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Quantity:</span>
                  <span>{currentOrder.quantity} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Shop:</span>
                  <span>{currentOrder.shopName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Customer:</span>
                  <span>{currentOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Address:</span>
                  <span className="text-right">{currentOrder.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Phone:</span>
                  <span>{currentOrder.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Payment:</span>
                  <span>{currentOrder.paymentMethod}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-green-700">₹{currentOrder.totalPrice}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <Button onClick={downloadReceipt} variant="outline" className="flex-1">
              Download Receipt
            </Button>
            <Button onClick={closeAllModals} className="flex-1 bg-blue-600 hover:bg-blue-700">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MedicineReservation;
