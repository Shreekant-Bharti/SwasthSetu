import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Ambulance, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const EmergencyContacts = () => {
  const emergencyNumbers = [
    { name: "Ambulance", number: "108", icon: Ambulance },
    { name: "Emergency Helpline", number: "102", icon: AlertCircle },
    { name: "Snehh Memorial Clinic", number: "+91 98765-43211", icon: Phone },
    { name: "Dhanpur Health Centre", number: "+91 98765-43212", icon: Phone },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-destructive" />
          Emergency Contacts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {emergencyNumbers.map((contact, index) => (
          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <contact.icon className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-semibold">{contact.name}</p>
                <p className="text-sm text-muted-foreground">{contact.number}</p>
              </div>
            </div>
            <Button size="sm" variant="destructive">
              <Phone className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default EmergencyContacts;
