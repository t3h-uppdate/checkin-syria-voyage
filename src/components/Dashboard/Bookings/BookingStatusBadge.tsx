
import { Badge } from "@/components/ui/badge";

type BookingStatusBadgeProps = {
  status: string;
};

export const BookingStatusBadge = ({ status }: BookingStatusBadgeProps) => {
  return (
    <Badge 
      variant={
        status === 'pending' 
          ? 'secondary' 
          : status === 'confirmed' 
            ? 'default' 
            : 'destructive'
      }
    >
      {status}
    </Badge>
  );
};
