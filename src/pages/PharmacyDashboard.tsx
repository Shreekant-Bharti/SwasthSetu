import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout, getMedicines, updateMedicineStock, Medicine, getMedicineOrders, MedicineOrder, getMedicineReservations, MedicineReservation, updateMedicineReservation, updateMedicineOrder, addMedicine } from "@/lib/localStorage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LogOut, Pill, Package, ShoppingBag, Search, CheckCircle, XCircle, Truck, Clock, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { playSuccessSound, playCancelSound, playVerificationSound, playChimeSound } from "@/lib/sounds";
import { Progress } from "@/components/ui/progress";

const PharmacyDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser());
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [orders, setOrders] = useState<MedicineOrder[]>([]);
  const [reservations, setReservations] = useState<MedicineReservation[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Cancel modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancellingOrder, setCancellingOrder] = useState<{ id: string; type: 'reservation' | 'prescription' } | null>(null);

  // Add Medicine modal state
  const [showAddMedicineModal, setShowAddMedicineModal] = useState(false);
  const [showVerificationOverlay, setShowVerificationOverlay] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const verificationAudioRef = useRef<HTMLAudioElement | null>(null);
  
  const [newMedicine, setNewMedicine] = useState({
    name: '',
    brand: '',
    strength: '',
    price: '',
    quantity: '',
    shop: '',
    description: ''
  });

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'pharmacy') {
      navigate('/');
    } else {
      setUser(currentUser);
      loadMedicines();
    }
  }, [navigate]);

  const loadMedicines = () => {
    setMedicines(getMedicines());
    setOrders(getMedicineOrders());
    setReservations(getMedicineReservations());
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(getMedicineOrders());
      setReservations(getMedicineReservations());
      setMedicines(getMedicines());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const filteredMedicines = medicines.filter(med =>
    med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    med.shop.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleUpdateStock = (medicineId: string) => {
    updateMedicineStock(medicineId, editStock);
    loadMedicines();
    setEditingId(null);
    toast.success("Stock updated successfully");
  };

  const handleMarkDelivered = (id: string, type: 'reservation' | 'prescription') => {
    const timestamp = new Date().toLocaleString();
    if (type === 'reservation') {
      updateMedicineReservation(id, { status: 'delivered', deliveredAt: timestamp });
    } else {
      updateMedicineOrder(id, { status: 'delivered', deliveredAt: timestamp });
    }
    playSuccessSound();
    toast.success("Order marked as delivered!");
    loadMedicines();
  };

  const openCancelModal = (id: string, type: 'reservation' | 'prescription') => {
    setCancellingOrder({ id, type });
    setCancelReason("");
    setShowCancelModal(true);
  };

  const handleCancelOrder = () => {
    if (!cancellingOrder) return;
    if (!cancelReason.trim()) {
      toast.error("Please provide a cancellation reason");
      return;
    }

    const timestamp = new Date().toLocaleString();
    if (cancellingOrder.type === 'reservation') {
      updateMedicineReservation(cancellingOrder.id, { 
        status: 'cancelled', 
        cancelledAt: timestamp,
        cancellationReason: cancelReason
      });
    } else {
      updateMedicineOrder(cancellingOrder.id, { 
        status: 'cancelled', 
        cancelledAt: timestamp,
        cancellationReason: cancelReason
      });
    }
    
    playCancelSound();
    toast.error("Order cancelled");
    setShowCancelModal(false);
    setCancellingOrder(null);
    loadMedicines();
  };

  const resetAddMedicineForm = () => {
    setNewMedicine({
      name: '',
      brand: '',
      strength: '',
      price: '',
      quantity: '',
      shop: '',
      description: ''
    });
  };

  const handleAddMedicineSubmit = () => {
    // Validate required fields
    if (!newMedicine.name.trim()) {
      toast.error("Medicine name is required");
      return;
    }
    if (!newMedicine.price || parseFloat(newMedicine.price) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }
    if (!newMedicine.quantity || parseInt(newMedicine.quantity) <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }
    if (!newMedicine.shop.trim()) {
      toast.error("Shop name is required");
      return;
    }

    // Start verification process
    setShowAddMedicineModal(false);
    setShowVerificationOverlay(true);
    setVerificationProgress(0);

    // Play verification sound
    const audio = playVerificationSound();
    verificationAudioRef.current = audio;
    audio.play().catch(() => {});

    // Progress animation over 8 seconds
    const startTime = Date.now();
    const duration = 8000;
    
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);
      setVerificationProgress(progress);
      
      if (elapsed >= duration) {
        clearInterval(progressInterval);
        
        // Stop verification sound
        if (verificationAudioRef.current) {
          verificationAudioRef.current.pause();
          verificationAudioRef.current = null;
        }

        // Build medicine name with brand and strength
        let fullName = newMedicine.name.trim();
        if (newMedicine.brand) fullName = `${newMedicine.brand} ${fullName}`;
        if (newMedicine.strength) fullName = `${fullName} ${newMedicine.strength}`;

        // Try to add medicine
        const result = addMedicine({
          name: fullName,
          shop: newMedicine.shop.trim(),
          stock: parseInt(newMedicine.quantity),
          price: parseFloat(newMedicine.price)
        });

        setShowVerificationOverlay(false);

        if (result.success) {
          playChimeSound();
          toast.success("Medicine added — now visible to patients", {
            duration: 4000
          });
          loadMedicines();
          resetAddMedicineForm();
        } else {
          toast.warning(result.error || "Failed to add medicine - duplicate detected");
        }
      }
    }, 50);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-orange-500 text-white animate-pulse"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'processing':
      case 'confirmed':
        return <Badge className="bg-blue-500 text-white"><Truck className="h-3 w-3 mr-1" />Processing</Badge>;
      case 'delivered':
        return <Badge className="bg-green-600 text-white"><CheckCircle className="h-3 w-3 mr-1" />Delivered</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-600 text-white"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (!user) return null;

  // Combine all orders for display
  const allOrders = [
    ...reservations.map(r => ({ ...r, orderType: 'reservation' as const })),
    ...orders.map(o => ({ ...o, orderType: 'prescription' as const }))
  ].sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">SwasthSetu - Pharmacy Portal</h1>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <Tabs defaultValue="all-orders" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="all-orders" className="text-lg">All Orders</TabsTrigger>
            <TabsTrigger value="orders" className="text-lg">Prescription Orders</TabsTrigger>
            <TabsTrigger value="reservations" className="text-lg">Reservations</TabsTrigger>
            <TabsTrigger value="inventory" className="text-lg">Inventory</TabsTrigger>
          </TabsList>

          {/* All Orders Combined */}
          <TabsContent value="all-orders">
            <Card className="shadow-xl border-2 border-primary/20 animate-fade-in">
              <CardHeader className="bg-gradient-to-r from-blue-100 to-purple-100">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <ShoppingBag className="h-6 w-6 text-primary" />
                  All Medicine Orders ({allOrders.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {allOrders.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No orders yet</p>
                ) : (
                  <div className="space-y-4">
                    {allOrders.map((order) => (
                      <Card 
                        key={`${order.orderType}-${order.id}`} 
                        className={`border-2 transition-all duration-300 ${
                          order.status === 'delivered' ? 'border-green-300 bg-green-50/50' :
                          order.status === 'cancelled' ? 'border-red-300 bg-red-50/50' :
                          'border-blue-200 hover:border-blue-400'
                        } shadow-lg`}
                      >
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs">
                                  {order.orderType === 'reservation' ? 'Reservation' : 'Prescription Order'}
                                </Badge>
                                <span className="text-sm text-muted-foreground">#{order.id}</span>
                              </div>
                              <h3 className="font-bold text-xl text-foreground">
                                {order.orderType === 'reservation' 
                                  ? (order as MedicineReservation).customerName 
                                  : (order as MedicineOrder).patientName}
                              </h3>
                              <p className="text-sm text-muted-foreground">Order Date: {order.orderDate}</p>
                            </div>
                            {getStatusBadge(order.status)}
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div className="bg-blue-50 rounded-lg p-4">
                              <p className="text-sm font-semibold text-foreground mb-2">Order Details:</p>
                              {order.orderType === 'reservation' ? (
                                <>
                                  <p className="font-bold text-foreground">{(order as MedicineReservation).medicineName}</p>
                                  <p className="text-sm text-muted-foreground">Qty: {(order as MedicineReservation).quantity}</p>
                                  <p className="text-sm text-muted-foreground">Shop: {(order as MedicineReservation).shopName}</p>
                                  <p className="text-lg font-bold text-green-700 mt-2">₹{(order as MedicineReservation).totalPrice}</p>
                                </>
                              ) : (
                                <>
                                  <p className="font-bold text-foreground">{(order as MedicineOrder).medicines}</p>
                                  <p className="text-sm text-muted-foreground">Prescription: #{(order as MedicineOrder).prescriptionId}</p>
                                </>
                              )}
                            </div>
                            
                            <div className="bg-green-50 rounded-lg p-4">
                              <p className="text-sm font-semibold text-foreground mb-2">Delivery Details:</p>
                              <p className="text-sm text-foreground">
                                {order.orderType === 'reservation' 
                                  ? `${(order as MedicineReservation).address}, PIN: ${(order as MedicineReservation).pincode}`
                                  : (order as MedicineOrder).address}
                              </p>
                              <p className="text-sm font-semibold mt-2 text-foreground">
                                Phone: {order.orderType === 'reservation' 
                                  ? (order as MedicineReservation).phone 
                                  : (order as MedicineOrder).phone}
                              </p>
                            </div>
                          </div>

                          {order.status === 'delivered' && order.deliveredAt && (
                            <div className="p-3 bg-green-100 rounded-lg text-green-800 text-sm mb-4 animate-fade-in">
                              <CheckCircle className="h-4 w-4 inline mr-2" />
                              Delivered on {order.deliveredAt}
                            </div>
                          )}

                          {order.status === 'cancelled' && (
                            <div className="p-3 bg-red-100 rounded-lg text-red-800 text-sm mb-4 animate-fade-in">
                              <XCircle className="h-4 w-4 inline mr-2" />
                              Cancelled{order.cancelledAt ? ` on ${order.cancelledAt}` : ''}
                              {order.cancellationReason && (
                                <p className="mt-1 font-medium">Reason: {order.cancellationReason}</p>
                              )}
                            </div>
                          )}

                          {order.status !== 'delivered' && order.status !== 'cancelled' && (
                            <div className="flex gap-3">
                              <Button 
                                onClick={() => handleMarkDelivered(order.id, order.orderType)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark as Delivered
                              </Button>
                              <Button 
                                onClick={() => openCancelModal(order.id, order.orderType)}
                                variant="destructive"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancel Order
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prescription Medicine Orders */}
          <TabsContent value="orders">
            <Card className="shadow-xl border-2 border-green-200 animate-fade-in">
              <CardHeader className="bg-gradient-to-r from-green-100 to-blue-100">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <ShoppingBag className="h-6 w-6 text-green-600" />
                  Prescription Medicine Orders
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {orders.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No prescription orders yet</p>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <Card key={order.id} className={`border-2 transition-all shadow-lg ${
                        order.status === 'delivered' ? 'border-green-300 bg-green-50/50' :
                        order.status === 'cancelled' ? 'border-red-300 bg-red-50/50' :
                        'border-green-200 hover:border-green-400'
                      }`}>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-bold text-xl text-foreground">{order.patientName}</h3>
                              <p className="text-sm text-muted-foreground">Order Date: {order.orderDate}</p>
                              <p className="text-sm text-muted-foreground">Phone: {order.phone}</p>
                            </div>
                            {getStatusBadge(order.status)}
                          </div>
                          <div className="bg-blue-50 rounded-lg p-4 mb-3">
                            <p className="text-sm font-semibold text-foreground mb-2">Medicines:</p>
                            <p className="text-sm text-foreground">{order.medicines}</p>
                          </div>
                          <div className="bg-green-50 rounded-lg p-4 mb-4">
                            <p className="text-sm font-semibold text-foreground mb-2">Delivery Address:</p>
                            <p className="text-sm text-foreground">{order.address}</p>
                          </div>
                          
                          {order.status === 'delivered' && order.deliveredAt && (
                            <div className="p-3 bg-green-100 rounded-lg text-green-800 text-sm mb-4">
                              <CheckCircle className="h-4 w-4 inline mr-2" />
                              Delivered on {order.deliveredAt}
                            </div>
                          )}

                          {order.status === 'cancelled' && (
                            <div className="p-3 bg-red-100 rounded-lg text-red-800 text-sm mb-4">
                              <XCircle className="h-4 w-4 inline mr-2" />
                              Cancelled{order.cancelledAt ? ` on ${order.cancelledAt}` : ''}
                              {order.cancellationReason && (
                                <p className="mt-1 font-medium">Reason: {order.cancellationReason}</p>
                              )}
                            </div>
                          )}

                          {order.status !== 'delivered' && order.status !== 'cancelled' && (
                            <div className="flex gap-3">
                              <Button 
                                onClick={() => handleMarkDelivered(order.id, 'prescription')}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark as Delivered
                              </Button>
                              <Button 
                                onClick={() => openCancelModal(order.id, 'prescription')}
                                variant="destructive"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancel Order
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medicine Reservations */}
          <TabsContent value="reservations">
            <Card className="shadow-xl border-2 border-purple-200 animate-fade-in">
              <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Pill className="h-6 w-6 text-purple-600" />
                  Medicine Reservations
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {reservations.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No reservations yet</p>
                ) : (
                  <div className="space-y-4">
                    {reservations.map((reservation) => (
                      <Card key={reservation.id} className={`border-2 transition-all shadow-lg ${
                        reservation.status === 'delivered' ? 'border-green-300 bg-green-50/50' :
                        reservation.status === 'cancelled' ? 'border-red-300 bg-red-50/50' :
                        'border-purple-200 hover:border-purple-400'
                      }`}>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-bold text-xl text-foreground">{reservation.customerName}</h3>
                              <p className="text-sm text-muted-foreground">Order ID: #{reservation.id}</p>
                              <p className="text-sm text-muted-foreground">Date: {reservation.orderDate}</p>
                            </div>
                            <div className="flex flex-col gap-2 items-end">
                              {getStatusBadge(reservation.status)}
                              <Badge variant={reservation.paymentMethod === 'Online' ? 'default' : 'secondary'}>
                                {reservation.paymentMethod}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div className="bg-purple-50 rounded-lg p-4">
                              <p className="text-sm font-semibold text-foreground mb-2">Medicine Details:</p>
                              <p className="text-base font-bold text-foreground">{reservation.medicineName}</p>
                              <p className="text-sm text-muted-foreground mt-1">Quantity: {reservation.quantity}</p>
                              <p className="text-sm text-muted-foreground">Shop: {reservation.shopName}</p>
                            </div>
                            
                            <div className="bg-green-50 rounded-lg p-4">
                              <p className="text-sm font-semibold text-foreground mb-2">Payment:</p>
                              <p className="text-xl font-bold text-green-700">₹{reservation.totalPrice}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Status: {reservation.paymentStatus === 'completed' ? '✓ Paid' : 'COD'}
                              </p>
                            </div>
                          </div>

                          <div className="bg-blue-50 rounded-lg p-4 mb-3">
                            <p className="text-sm font-semibold text-foreground mb-2">Delivery Address:</p>
                            <p className="text-sm text-foreground">{reservation.address}</p>
                            <p className="text-sm text-foreground">PIN: {reservation.pincode}</p>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-3 mb-4">
                            <p className="text-sm font-semibold text-foreground">Contact: {reservation.phone}</p>
                          </div>

                          {reservation.status === 'delivered' && reservation.deliveredAt && (
                            <div className="p-3 bg-green-100 rounded-lg text-green-800 text-sm mb-4">
                              <CheckCircle className="h-4 w-4 inline mr-2" />
                              Delivered on {reservation.deliveredAt}
                            </div>
                          )}

                          {reservation.status === 'cancelled' && (
                            <div className="p-3 bg-red-100 rounded-lg text-red-800 text-sm mb-4">
                              <XCircle className="h-4 w-4 inline mr-2" />
                              Cancelled{reservation.cancelledAt ? ` on ${reservation.cancelledAt}` : ''}
                              {reservation.cancellationReason && (
                                <p className="mt-1 font-medium">Reason: {reservation.cancellationReason}</p>
                              )}
                            </div>
                          )}

                          {reservation.status !== 'delivered' && reservation.status !== 'cancelled' && (
                            <div className="flex gap-3">
                              <Button 
                                onClick={() => handleMarkDelivered(reservation.id, 'reservation')}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark as Delivered
                              </Button>
                              <Button 
                                onClick={() => openCancelModal(reservation.id, 'reservation')}
                                variant="destructive"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancel Order
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medicine Inventory */}
          <TabsContent value="inventory">
            <Card className="shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-100 to-purple-100">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Package className="h-6 w-6 text-primary" />
                    Medicine Inventory
                  </CardTitle>
                  <Button 
                    onClick={() => setShowAddMedicineModal(true)}
                    className="bg-green-600 hover:bg-green-700 text-white gap-2 animate-scale-in"
                  >
                    <Plus className="h-5 w-5" />
                    Add Medicine
                  </Button>
                </div>
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
                      className="pl-10 h-12 text-lg border-2"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredMedicines.map((med) => (
                    <div key={med.id} className="border-2 border-blue-100 rounded-lg p-4 hover:border-blue-300 transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{med.name}</h3>
                          <p className="text-sm text-muted-foreground">{med.shop}</p>
                          <p className="text-sm font-medium text-primary">₹{med.price}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Package className={`h-5 w-5 ${med.stock < 20 ? 'text-destructive' : 'text-green-600'}`} />
                          <span className={`font-bold ${med.stock < 20 ? 'text-destructive' : 'text-green-600'}`}>
                            {med.stock} units
                          </span>
                        </div>
                      </div>

                      {editingId === med.id ? (
                        <div className="flex gap-2 mt-3">
                          <Input
                            type="number"
                            value={editStock}
                            onChange={(e) => setEditStock(parseInt(e.target.value) || 0)}
                            placeholder="New stock"
                            className="w-32"
                          />
                          <Button size="sm" onClick={() => handleUpdateStock(med.id)}>
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setEditingId(med.id);
                            setEditStock(med.stock);
                          }}
                          className="mt-2"
                        >
                          Update Stock
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Cancel Order Modal */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Cancel Order
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for cancellation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Cancellation Reason *</Label>
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g., Out of stock, Unable to deliver to this area..."
                className="mt-2"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={handleCancelOrder}
                variant="destructive"
                className="flex-1"
              >
                Confirm Cancellation
              </Button>
              <Button 
                onClick={() => setShowCancelModal(false)}
                variant="outline"
                className="flex-1"
              >
                Go Back
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Medicine Modal */}
      <Dialog open={showAddMedicineModal} onOpenChange={setShowAddMedicineModal}>
        <DialogContent className="sm:max-w-lg animate-scale-in">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Pill className="h-5 w-5 text-green-600" />
              Add New Medicine
            </DialogTitle>
            <DialogDescription>
              Fill in the details to add a new medicine to inventory
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <div>
              <Label>Medicine Name *</Label>
              <Input
                value={newMedicine.name}
                onChange={(e) => setNewMedicine({...newMedicine, name: e.target.value})}
                placeholder="e.g., Paracetamol"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Brand</Label>
                <Input
                  value={newMedicine.brand}
                  onChange={(e) => setNewMedicine({...newMedicine, brand: e.target.value})}
                  placeholder="e.g., Crocin"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Strength</Label>
                <Input
                  value={newMedicine.strength}
                  onChange={(e) => setNewMedicine({...newMedicine, strength: e.target.value})}
                  placeholder="e.g., 500mg"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price (₹) *</Label>
                <Input
                  type="number"
                  value={newMedicine.price}
                  onChange={(e) => setNewMedicine({...newMedicine, price: e.target.value})}
                  placeholder="e.g., 25"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Quantity *</Label>
                <Input
                  type="number"
                  value={newMedicine.quantity}
                  onChange={(e) => setNewMedicine({...newMedicine, quantity: e.target.value})}
                  placeholder="e.g., 100"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Shop Name *</Label>
              <Input
                value={newMedicine.shop}
                onChange={(e) => setNewMedicine({...newMedicine, shop: e.target.value})}
                placeholder="e.g., Dhanpur Medical Store"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Short Description</Label>
              <Textarea
                value={newMedicine.description}
                onChange={(e) => setNewMedicine({...newMedicine, description: e.target.value})}
                placeholder="Optional description..."
                className="mt-1"
                rows={2}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleAddMedicineSubmit}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Submit
            </Button>
            <Button 
              onClick={() => {
                setShowAddMedicineModal(false);
                resetAddMedicineForm();
              }}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Verification Overlay */}
      {showVerificationOverlay && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center animate-fade-in">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl animate-scale-in">
            <div className="text-center">
              <Loader2 className="h-16 w-16 mx-auto text-primary animate-spin mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">Verifying details…</h3>
              <p className="text-muted-foreground mb-6">Please wait while we verify and add your medicine</p>
              <Progress value={verificationProgress} className="h-2 mb-2" />
              <p className="text-sm text-muted-foreground">{Math.round(verificationProgress)}% complete</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyDashboard;
