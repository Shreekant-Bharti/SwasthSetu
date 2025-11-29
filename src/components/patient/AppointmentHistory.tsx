import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { getAppointments, Appointment } from "@/lib/localStorage";

interface AppointmentHistoryProps {
  userId: string;
}

const AppointmentHistory = ({ userId }: AppointmentHistoryProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const allAppointments = getAppointments();
    const userAppointments = allAppointments.filter(apt => apt.userId === userId);
    setAppointments(userAppointments);
  }, [userId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'checked':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'referred':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-6 w-6 text-primary" />
          Appointment History
        </CardTitle>
        <CardDescription>View your past and upcoming appointments</CardDescription>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No appointments yet</p>
        ) : (
          <div className="space-y-3">
            {appointments.map((apt) => (
              <div key={apt.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold">{apt.hospital}</h4>
                    <p className="text-sm text-muted-foreground">Dr. {apt.doctor}</p>
                  </div>
                  <Badge variant={getStatusColor(apt.status)}>
                    {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>📅 {apt.date}</span>
                  <span>🕐 {apt.time}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AppointmentHistory;
