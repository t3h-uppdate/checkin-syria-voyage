
import { Hotel } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const DashboardEmpty = () => {
  const { t } = useTranslation();
  
  return (
    <div className="text-center py-12 px-4 bg-muted/30 rounded-lg border border-dashed border-muted">
      <div className="mx-auto w-16 h-16 bg-primary/10 flex items-center justify-center rounded-full mb-4">
        <Hotel className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-xl font-medium mb-2">{t('dashboard.emptyState.title')}</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        {t('dashboard.emptyState.description')}
      </p>
    </div>
  );
};

export default DashboardEmpty;
