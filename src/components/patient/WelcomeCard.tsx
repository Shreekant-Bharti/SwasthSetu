import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User as UserType } from "@/lib/localStorage";
import { User, MapPin } from "lucide-react";

interface WelcomeCardProps {
  user: UserType;
}

const WelcomeCard = ({ user }: WelcomeCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-6 w-6 text-primary" />
          Welcome, {user.name}!
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2 text-muted-foreground">
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {user.village}
          </p>
          <p className="text-sm">Access your health services from anywhere</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WelcomeCard;
