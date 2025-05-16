
import { Badge, BadgeProps } from "@/components/ui/badge";
import { cva } from "class-variance-authority";

type BookingStatus = 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled';

type BookingStatusBadgeProps = {
  status: string;
  size?: 'sm' | 'default';
};

const statusVariants = cva("", {
  variants: {
    status: {
      pending: "bg-amber-100 text-amber-800 hover:bg-amber-200",
      confirmed: "bg-green-100 text-green-800 hover:bg-green-200",
      rejected: "bg-red-100 text-red-800 hover:bg-red-200",
      completed: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      cancelled: "bg-gray-100 text-gray-800 hover:bg-gray-200"
    },
    size: {
      sm: "px-1.5 py-0.5 text-xs",
      default: ""
    }
  },
  defaultVariants: {
    size: "default"
  }
});

export const BookingStatusBadge = ({ status, size }: BookingStatusBadgeProps) => {
  const normalizedStatus = status.toLowerCase() as BookingStatus;
  
  // Map variant based on status
  const variant: BadgeProps['variant'] = 
    normalizedStatus === 'pending' ? 'outline' :
    normalizedStatus === 'confirmed' ? 'default' :
    normalizedStatus === 'rejected' ? 'destructive' :
    normalizedStatus === 'completed' ? 'secondary' :
    'outline';
  
  // Get appropriate class based on status
  const className = statusVariants({ 
    status: normalizedStatus, 
    size 
  });
  
  return (
    <Badge 
      variant={variant}
      className={className}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};
