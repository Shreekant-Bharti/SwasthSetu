import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout, User } from "@/lib/localStorage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogOut, Users, CheckCircle, BarChart, Trash2 } from "lucide-react";
import { toast } from "sonner";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser());
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/');
    } else {
      setUser(currentUser);
      loadUsers();
    }
  }, [navigate]);

  const loadUsers = () => {
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    setAllUsers(users);
  };

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
      localStorage.removeItem('appointments');
      localStorage.removeItem('chats');
      localStorage.removeItem('insurances');
      
      // Reset medicines to initial state
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
        <div className="grid md:grid-cols-3 gap-6">
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
              <p className="text-3xl font-bold text-success">{stats.activeUsers}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5 text-warning" />
                Pending Approvals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-warning">{stats.pendingApprovals}</p>
            </CardContent>
          </Card>
        </div>

        {/* User Management */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>User Management</CardTitle>
              <Button variant="destructive" size="sm" onClick={resetLocalStorage}>
                <Trash2 className="mr-2 h-4 w-4" />
                Reset Data
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allUsers.map((u) => (
                <div key={u.id} className="border rounded-lg p-4">
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
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
