
import { FoodBank } from '@/hooks/use-food-banks';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, MapPin, Phone, AlertTriangle } from 'lucide-react';

interface FoodBankCardProps {
  foodBank: FoodBank;
}

const FoodBankCard = ({ foodBank }: FoodBankCardProps) => {
  const openMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${foodBank.name} ${foodBank.address} ${foodBank.city} ${foodBank.state} ${foodBank.zipCode}`
    )}`;
    window.open(url, '_blank');
  };
  
  return (
    <Card className="h-full food-item-card">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg">{foodBank.name}</h3>
          <div className="flex items-center text-sm text-primary-700 font-medium">
            <MapPin className="h-3 w-3 mr-1" />
            {foodBank.distance} mi
          </div>
        </div>
        
        <div className="mt-3 space-y-2">
          <p className="text-sm">
            {foodBank.address}<br />
            {foodBank.city}, {foodBank.state} {foodBank.zipCode}
          </p>
          
          <div className="flex items-center text-sm">
            <Phone className="h-3 w-3 mr-1 text-gray-500" />
            <a href={`tel:${foodBank.phone}`} className="hover:underline">
              {foodBank.phone}
            </a>
          </div>
          
          {!foodBank.acceptsPerishable && (
            <div className="flex items-center text-sm text-amber-600">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Does not accept perishable items
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button variant="outline" className="w-full" onClick={openMaps}>
          <MapPin className="h-4 w-4 mr-2" />
          Directions
        </Button>
        
        {foodBank.website && (
          <Button variant="outline" className="w-full" onClick={() => window.open(foodBank.website!, '_blank')}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Website
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default FoodBankCard;
