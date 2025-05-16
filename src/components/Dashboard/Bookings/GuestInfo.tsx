
import { Link } from 'react-router-dom';
import { Phone, Flag, Mail } from 'lucide-react'; 
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type GuestInfoProps = {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  nationality: string | null;
  email?: string | null;
  compact?: boolean;
};

export const GuestInfo = ({ 
  userId, 
  firstName, 
  lastName, 
  phone, 
  nationality,
  email,
  compact = false
}: GuestInfoProps) => {
  const displayName = `${firstName ?? ''} ${lastName ?? ''}`.trim() || userId.slice(0, 8);
  
  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link to={`/dashboard/guests/${userId}`} className="text-primary hover:underline">
              {displayName}
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              {phone && <div className="flex items-center"><Phone className="h-3 w-3 mr-1" /> {phone}</div>}
              {nationality && <div className="flex items-center"><Flag className="h-3 w-3 mr-1" /> {nationality.toUpperCase()}</div>}
              {email && <div className="flex items-center"><Mail className="h-3 w-3 mr-1" /> {email}</div>}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return (
    <div className="flex flex-col">
      <Link to={`/dashboard/guests/${userId}`} className="text-primary hover:underline">
        {displayName}
      </Link>
      {phone && (
        <span className="text-xs text-gray-500 flex items-center mt-1">
          <Phone className="h-3 w-3 mr-1" />
          {phone}
        </span>
      )}
      {nationality && (
        <span className="text-xs text-gray-500 flex items-center mt-1">
          <Flag className="h-3 w-3 mr-1" />
          <Badge variant="outline" className="text-xs">{nationality.toUpperCase()}</Badge>
        </span>
      )}
    </div>
  );
};
