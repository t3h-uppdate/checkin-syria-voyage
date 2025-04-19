
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Hotel, PlusCircle } from 'lucide-react';

const DashboardEmpty = () => {
  return (
    <div className="text-center py-16 px-4 bg-muted rounded-lg">
      <div className="mx-auto w-16 h-16 bg-primary/10 flex items-center justify-center rounded-full mb-4">
        <Hotel className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-xl font-medium mb-2">Inga hotell ännu</h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        Du har inte lagt till några hotell ännu. Börja genom att lägga till ditt första hotell för att hantera det på dashboarden.
      </p>
      <Button asChild>
        <Link to="/dashboard/hotels/new" className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          <span>Lägg till ditt första hotell</span>
        </Link>
      </Button>
    </div>
  );
};

export default DashboardEmpty;
