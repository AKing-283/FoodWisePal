
import { useState } from 'react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { Check, Trash2, Clock, AlertTriangle, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FoodItem } from '@/hooks/use-food-items';
import { cn } from '@/lib/utils';

interface FoodItemCardProps {
  item: FoodItem;
  onConsume: (id: string) => Promise<any>;
  onDelete: (id: string) => Promise<boolean>;
}

const FoodItemCard = ({ item, onConsume, onDelete }: FoodItemCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const daysUntilExpiry = differenceInDays(parseISO(item.expiry_date), new Date());
  
  const getExpiryStatus = () => {
    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry < 3) return 'expiring-soon';
    if (daysUntilExpiry < 7) return 'use-soon';
    return 'fresh';
  };
  
  const status = getExpiryStatus();
  
  const handleConsume = async () => {
    setIsLoading(true);
    await onConsume(item.id);
    setIsLoading(false);
  };
  
  const handleDelete = async () => {
    setIsLoading(true);
    await onDelete(item.id);
    setIsLoading(false);
  };
  
  return (
    <div className={cn(
      'food-item-card',
      status === 'expired' && 'food-item-expiring',
      status === 'expiring-soon' && 'food-item-expiring',
      status === 'use-soon' && 'food-item-warning',
      status === 'fresh' && 'food-item-fresh',
    )}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold">{item.name}</h3>
        <div className="flex space-x-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleConsume} disabled={isLoading}>
            <Check className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={handleDelete} disabled={isLoading}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="text-sm mb-2">
        <span className="font-medium">Quantity:</span> {item.quantity} {item.unit}
      </div>
      
      {item.category && (
        <div className="text-sm mb-2">
          <span className="font-medium">Category:</span> {item.category}
        </div>
      )}
      
      <div className="flex items-center mt-3">
        <CalendarClock className="h-4 w-4 mr-1" />
        <div className="text-sm">
          {status === 'expired' ? (
            <span className="text-destructive font-medium">
              Expired {Math.abs(daysUntilExpiry)} days ago
            </span>
          ) : (
            <span className={cn(
              status === 'expiring-soon' && 'text-destructive font-medium',
              status === 'use-soon' && 'text-secondary-500 font-medium',
            )}>
              Expires {format(parseISO(item.expiry_date), 'MMM d, yyyy')}
              {status === 'expiring-soon' && (
                <span className="inline-flex items-center ml-2">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {daysUntilExpiry === 0 ? 'Today' : `In ${daysUntilExpiry} days`}
                </span>
              )}
              {status === 'use-soon' && (
                <span className="inline-flex items-center ml-2">
                  <Clock className="h-3 w-3 mr-1" />
                  In {daysUntilExpiry} days
                </span>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodItemCard;
