import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMedicineReservations, getMedicineOrders, MedicineReservation, MedicineOrder } from "@/lib/localStorage";
import { Package, Download, Clock, CheckCircle, XCircle, Truck } from "lucide-react";
import { toast } from "sonner";

interface OrderHistoryProps {
  userId: string;
}

const OrderHistory = ({ userId }: OrderHistoryProps) => {
  const [reservations, setReservations] = useState<MedicineReservation[]>([]);
  const [prescriptionOrders, setPrescriptionOrders] = useState<MedicineOrder[]>([]);

  useEffect(() => {
    const loadOrders = () => {
      const allReservations = getMedicineReservations();
      const userReservations = allReservations.filter(r => r.patientId === userId);
      setReservations(userReservations);

      const allOrders = getMedicineOrders();
      const userOrders = allOrders.filter(o => o.patientId === userId);
      setPrescriptionOrders(userOrders);
    };

    loadOrders();
    const interval = setInterval(loadOrders, 2000);
    return () => clearInterval(interval);
  }, [userId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-orange-500 text-white animate-pulse"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'confirmed':
      case 'processing':
        return <Badge className="bg-blue-500 text-white"><Truck className="h-3 w-3 mr-1" />Processing</Badge>;
      case 'delivered':
        return <Badge className="bg-green-600 text-white animate-fade-in"><CheckCircle className="h-3 w-3 mr-1" />Delivered</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-600 text-white"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const downloadReceipt = (order: MedicineReservation | MedicineOrder, type: 'reservation' | 'prescription') => {
    let receiptContent = '';
    
    if (type === 'reservation') {
      const res = order as MedicineReservation;
      receiptContent = `
╔════════════════════════════════════════╗
║      SWASTHSETU ORDER RECEIPT          ║
╚════════════════════════════════════════╝

Order ID: #${res.id}
Order Date: ${res.orderDate}
Status: ${res.status.toUpperCase()}
${res.deliveredAt ? `Delivered On: ${res.deliveredAt}` : ''}
${res.cancelledAt ? `Cancelled On: ${res.cancelledAt}` : ''}
${res.cancellationReason ? `Cancellation Reason: ${res.cancellationReason}` : ''}

CUSTOMER DETAILS:
Name: ${res.customerName}
Phone: ${res.phone}
Address: ${res.address}, PIN: ${res.pincode}

ORDER DETAILS:
Medicine: ${res.medicineName}
Quantity: ${res.quantity}
Shop: ${res.shopName}
Payment: ${res.paymentMethod}

TOTAL: ₹${res.totalPrice}

Thank you for ordering with SwasthSetu!
Contact: +91 98765-43211
`;
    } else {
      const ord = order as MedicineOrder;
      receiptContent = `
╔════════════════════════════════════════╗
║      SWASTHSETU ORDER RECEIPT          ║
╚════════════════════════════════════════╝

Order ID: #${ord.id}
Order Date: ${ord.orderDate}
Status: ${ord.status.toUpperCase()}
${ord.deliveredAt ? `Delivered On: ${ord.deliveredAt}` : ''}
${ord.cancelledAt ? `Cancelled On: ${ord.cancelledAt}` : ''}
${ord.cancellationReason ? `Cancellation Reason: ${ord.cancellationReason}` : ''}

CUSTOMER DETAILS:
Name: ${ord.patientName}
Phone: ${ord.phone}
Address: ${ord.address}

ORDER DETAILS:
Medicines: ${ord.medicines}
Prescription ID: ${ord.prescriptionId}

Thank you for ordering with SwasthSetu!
Contact: +91 98765-43211
`;
    }
    
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `order-receipt-${order.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success("Receipt downloaded!");
  };

  const allOrders = [
    ...reservations.map(r => ({ ...r, type: 'reservation' as const })),
    ...prescriptionOrders.map(o => ({ ...o, type: 'prescription' as const }))
  ].sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

  if (allOrders.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-xl border-2 border-orange-200 animate-fade-in">
      <CardHeader className="bg-gradient-to-r from-orange-100 to-yellow-100">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Package className="h-6 w-6 text-orange-600" />
          My Orders
        </CardTitle>
        <CardDescription className="text-base">Track your medicine orders</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {allOrders.map((order) => (
            <Card 
              key={`${order.type}-${order.id}`} 
              className={`border-2 transition-all duration-300 ${
                order.status === 'delivered' ? 'border-green-300 bg-green-50/50' :
                order.status === 'cancelled' ? 'border-red-300 bg-red-50/50' :
                'border-orange-200 hover:border-orange-400'
              }`}
            >
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Order #{order.id}</p>
                    <p className="text-xs text-muted-foreground">{order.orderDate}</p>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                {order.type === 'reservation' ? (
                  <div className="space-y-2">
                    <p className="font-bold text-lg text-foreground">{(order as MedicineReservation).medicineName}</p>
                    <p className="text-sm text-muted-foreground">Qty: {(order as MedicineReservation).quantity} | Shop: {(order as MedicineReservation).shopName}</p>
                    <p className="font-bold text-green-700">₹{(order as MedicineReservation).totalPrice}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="font-bold text-lg text-foreground">{(order as MedicineOrder).medicines}</p>
                    <p className="text-sm text-muted-foreground">From Prescription #{(order as MedicineOrder).prescriptionId}</p>
                  </div>
                )}

                {order.status === 'delivered' && order.deliveredAt && (
                  <div className="mt-3 p-2 bg-green-100 rounded-lg text-sm text-green-800 animate-fade-in">
                    <CheckCircle className="h-4 w-4 inline mr-1" />
                    Delivered on {order.deliveredAt}
                  </div>
                )}

                {order.status === 'cancelled' && (
                  <div className="mt-3 p-2 bg-red-100 rounded-lg text-sm text-red-800 animate-fade-in">
                    <XCircle className="h-4 w-4 inline mr-1" />
                    Cancelled{order.cancelledAt ? ` on ${order.cancelledAt}` : ''}
                    {order.cancellationReason && (
                      <p className="mt-1 font-medium">Reason: {order.cancellationReason}</p>
                    )}
                  </div>
                )}

                {(order.status === 'pending' || order.status === 'delivered') && (
                  <Button 
                    onClick={() => downloadReceipt(order, order.type)}
                    variant="outline"
                    size="sm"
                    className="mt-3"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Receipt
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderHistory;
