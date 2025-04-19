
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Hotel, PlusCircle } from 'lucide-react';

const DashboardEmpty = () => {
  return (
    <div className="text-center py-16 px-4 bg-muted/50 rounded-lg border-2 border-dashed border-muted">
      <div className="mx-auto w-16 h-16 bg-primary/10 flex items-center justify-center rounded-full mb-4">
        <Hotel className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-xl font-medium mb-2">Välkommen till din hotellportal</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Börja genom att lägga till ditt första hotell. Här kan du hantera alla dina hotell, bokningar och gästinformation på ett enkelt sätt.
      </p>
      <Button asChild size="lg" className="gap-2">
        <Link to="/dashboard/hotels/new">
          <PlusCircle className="h-5 w-5" />
          <span>Lägg till ditt första hotell</span>
        </Link>
      </Button>
    </div>
  );
};

export default DashboardEmpty;
