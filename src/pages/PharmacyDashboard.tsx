import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout, getMedicines, updateMedicineStock, Medicine, getMedicineOrders, MedicineOrder, getMedicineReservations, MedicineReservation } from "@/lib/localStorage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Pill, Package, ShoppingBag, Search } from "lucide-react";
import { toast } from "sonner";

const PharmacyDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser());
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [orders, setOrders] = useState<MedicineOrder[]>([]);
  const [reservations, setReservations] = useState<MedicineReservation[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");

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

  if (!user) return null;

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
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="orders" className="text-lg">Prescription Orders</TabsTrigger>
            <TabsTrigger value="reservations" className="text-lg">Medicine Reservations</TabsTrigger>
            <TabsTrigger value="inventory" className="text-lg">Inventory</TabsTrigger>
          </TabsList>

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
                      <Card key={order.id} className="border-2 border-green-200 hover:border-green-400 transition-all shadow-lg">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-bold text-xl text-gray-800">{order.patientName}</h3>
                              <p className="text-sm text-muted-foreground">Order Date: {order.orderDate}</p>
                              <p className="text-sm text-muted-foreground">Phone: {order.phone}</p>
                            </div>
                            <Badge className={
                              order.status === 'delivered' ? 'bg-green-600' :
                              order.status === 'processing' ? 'bg-blue-600' : 'bg-orange-600'
                            }>
                              {order.status}
                            </Badge>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-4 mb-3">
                            <p className="text-sm font-semibold text-gray-700 mb-2">Medicines:</p>
                            <p className="text-sm text-gray-800">{order.medicines}</p>
                          </div>
                          <div className="bg-green-50 rounded-lg p-4">
                            <p className="text-sm font-semibold text-gray-700 mb-2">Delivery Address:</p>
                            <p className="text-sm text-gray-800">{order.address}</p>
                          </div>
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
                      <Card key={reservation.id} className="border-2 border-purple-200 hover:border-purple-400 transition-all shadow-lg">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-bold text-xl text-gray-800">{reservation.customerName}</h3>
                              <p className="text-sm text-muted-foreground">Order ID: #{reservation.id}</p>
                              <p className="text-sm text-muted-foreground">Date: {reservation.orderDate}</p>
                            </div>
                            <div className="flex flex-col gap-2 items-end">
                              <Badge className={
                                reservation.status === 'delivered' ? 'bg-green-600' :
                                reservation.status === 'confirmed' ? 'bg-blue-600' : 'bg-orange-600'
                              }>
                                {reservation.status}
                              </Badge>
                              <Badge variant={reservation.paymentMethod === 'Online' ? 'default' : 'secondary'}>
                                {reservation.paymentMethod}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div className="bg-purple-50 rounded-lg p-4">
                              <p className="text-sm font-semibold text-gray-700 mb-2">Medicine Details:</p>
                              <p className="text-base font-bold text-gray-800">{reservation.medicineName}</p>
                              <p className="text-sm text-gray-600 mt-1">Quantity: {reservation.quantity}</p>
                              <p className="text-sm text-gray-600">Shop: {reservation.shopName}</p>
                            </div>
                            
                            <div className="bg-green-50 rounded-lg p-4">
                              <p className="text-sm font-semibold text-gray-700 mb-2">Payment:</p>
                              <p className="text-xl font-bold text-green-700">₹{reservation.totalPrice}</p>
                              <p className="text-sm text-gray-600 mt-1">
                                Status: {reservation.paymentStatus === 'completed' ? '✓ Paid' : 'COD'}
                              </p>
                            </div>
                          </div>

                          <div className="bg-blue-50 rounded-lg p-4 mb-3">
                            <p className="text-sm font-semibold text-gray-700 mb-2">Delivery Address:</p>
                            <p className="text-sm text-gray-800">{reservation.address}</p>
                            <p className="text-sm text-gray-800">PIN: {reservation.pincode}</p>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm font-semibold text-gray-700">Contact: {reservation.phone}</p>
                          </div>
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
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Package className="h-6 w-6 text-primary" />
                  Medicine Inventory
                </CardTitle>
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
                          <Package className={`h-5 w-5 ${med.stock < 20 ? 'text-destructive' : 'text-success'}`} />
                          <span className={`font-bold ${med.stock < 20 ? 'text-destructive' : 'text-success'}`}>
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
    </div>
  );
};

export default PharmacyDashboard;
