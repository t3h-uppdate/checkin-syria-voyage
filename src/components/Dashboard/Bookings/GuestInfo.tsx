
import { Link } from 'react-router-dom';
import { Phone, Flag } from 'lucide-react'; 
import { Badge } from "@/components/ui/badge";

type GuestInfoProps = {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  nationality: string | null;
};

export const GuestInfo = ({ userId, firstName, lastName, phone, nationality }: GuestInfoProps) => {
  return (
    <div className="flex flex-col">
      <Link to={`/guest/${userId}`} className="text-primary hover:underline">
        {`${firstName ?? ''} ${lastName ?? ''}`.trim() || userId}
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
          <Badge variant="country" className="text-xs">{nationality.toUpperCase()}</Badge>
        </span>
      )}
    </div>
  );
};
