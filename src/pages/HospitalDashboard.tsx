import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout, getAppointments, Appointment } from "@/lib/localStorage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogOut, Calendar, Bed, Users, AlertCircle } from "lucide-react";

const HospitalDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser());
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'hospital') {
      navigate('/');
    } else {
      setUser(currentUser);
      setAppointments(getAppointments());
    }
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  const bedAvailability = {
    total: 50,
    occupied: 32,
    available: 18
  };

  const opdLoad = {
    current: 45,
    capacity: 60
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">SwasthSetu - Hospital Admin</h1>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {/* Bed Availability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bed className="h-5 w-5 text-primary" />
                Bed Availability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Beds</span>
                  <span className="font-bold">{bedAvailability.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Occupied</span>
                  <span className="font-bold text-destructive">{bedAvailability.occupied}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Available</span>
                  <span className="font-bold text-success">{bedAvailability.available}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* OPD Load */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                OPD Load
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Patients</span>
                  <span className="font-bold">{opdLoad.current}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Capacity</span>
                  <span className="font-bold">{opdLoad.capacity}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${(opdLoad.current / opdLoad.capacity) * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-warning" />
                Emergency Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="w-full justify-center py-2">
                No Active Alerts
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* All Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              All Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {appointments.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No appointments</p>
              ) : (
                appointments.map((apt) => (
                  <div key={apt.id} className="border rounded-lg p-4 flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{apt.patientName}</p>
                      <p className="text-sm text-muted-foreground">Dr. {apt.doctor}</p>
                      <p className="text-sm text-muted-foreground">{apt.hospital}</p>
                      <p className="text-sm text-muted-foreground">{apt.date} at {apt.time}</p>
                    </div>
                    <Badge variant={apt.status === 'checked' ? 'default' : apt.status === 'referred' ? 'secondary' : 'outline'}>
                      {apt.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default HospitalDashboard;
