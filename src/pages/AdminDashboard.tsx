import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout, User } from "@/lib/localStorage";
import { getAllPendingRegistrations } from "@/lib/registrations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Users, CheckCircle, BarChart, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";
import PendingRegistrations from "@/components/admin/PendingRegistrations";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser());
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [pendingRegCount, setPendingRegCount] = useState(0);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/');
    } else {
      setUser(currentUser);
      loadUsers();
      loadPendingCount();
    }
  }, [navigate]);

  const loadUsers = () => {
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    setAllUsers(users);
  };

  const loadPendingCount = () => {
    setPendingRegCount(getAllPendingRegistrations().length);
  };

  useEffect(() => {
    const interval = setInterval(loadPendingCount, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const approveUser = (userId: string) => {
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    const updated = users.map(u => 
      u.id === userId ? { ...u, status: 'active' as const } : u
    );
    localStorage.setItem('users', JSON.stringify(updated));
    loadUsers();
    toast.success("User approved successfully");
  };

  const resetLocalStorage = () => {
    if (confirm("Are you sure you want to reset all data? This cannot be undone.")) {
      // Clear registration data
      localStorage.removeItem('registrations_patients');
      localStorage.removeItem('registrations_doctors');
      localStorage.removeItem('registrations_hospitals');
      localStorage.removeItem('registrations_pharmacies');
      localStorage.removeItem('registrations_insurance');
      localStorage.removeItem('registrations_admins');
      localStorage.removeItem('approved_credentials');
      localStorage.removeItem('registration_notifications');
      
      localStorage.removeItem('appointments');
      localStorage.removeItem('chats');
      localStorage.removeItem('insurances');
      
      const sampleMedicines = [
        { id: '1', name: 'Paracetamol 500mg', shop: 'Dhanpur Medical Store', stock: 100, price: 10 },
        { id: '2', name: 'Cough Syrup', shop: 'Dhanpur Medical Store', stock: 50, price: 85 },
        { id: '3', name: 'Antibiotic (Amoxicillin)', shop: 'Rampur Pharmacy', stock: 30, price: 120 },
        { id: '4', name: 'Antacid Tablets', shop: 'Rampur Pharmacy', stock: 75, price: 25 },
        { id: '5', name: 'Pain Relief Gel', shop: 'Dhanpur Medical Store', stock: 40, price: 150 },
      ];
      localStorage.setItem('medicines', JSON.stringify(sampleMedicines));
      
      toast.success("All data has been reset");
      loadUsers();
      loadPendingCount();
    }
  };

  if (!user) return null;

  const stats = {
    totalUsers: allUsers.length,
    pendingApprovals: allUsers.filter(u => u.status === 'pending').length,
    activeUsers: allUsers.filter(u => u.status === 'active').length,
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">SwasthSetu - Admin Portal</h1>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalUsers}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success" />
                Active Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{stats.activeUsers}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5 text-warning" />
                Pending User Approvals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-500">{stats.pendingApprovals}</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-300 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                New Registrations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-600">{pendingRegCount}</p>
              {pendingRegCount > 0 && (
                <p className="text-sm text-orange-600 animate-pulse">Requires attention</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="registrations" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="registrations" className="text-lg">
              Pending Registrations
              {pendingRegCount > 0 && (
                <Badge className="ml-2 bg-orange-500 text-white">{pendingRegCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users" className="text-lg">User Management</TabsTrigger>
          </TabsList>

          <TabsContent value="registrations">
            <PendingRegistrations />
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>User Management</CardTitle>
                  <Button variant="destructive" size="sm" onClick={resetLocalStorage}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Reset All Data
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allUsers.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No users found</p>
                  ) : (
                    allUsers.map((u) => (
                      <div key={u.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{u.name}</p>
                            <p className="text-sm text-muted-foreground">{u.email}</p>
                            <p className="text-sm text-muted-foreground">
                              {u.role.charAt(0).toUpperCase() + u.role.slice(1)} • {u.village}
                            </p>
                            <p className="text-sm text-muted-foreground">{u.phone}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant={u.status === 'active' ? 'default' : 'outline'}>
                              {u.status}
                            </Badge>
                            {u.status === 'pending' && (
                              <Button size="sm" onClick={() => approveUser(u.id)}>
                                Approve
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
