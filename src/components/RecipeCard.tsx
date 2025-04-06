
import { format, parseISO } from 'date-fns';
import { Recipe } from '@/hooks/use-recipes';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard = ({ recipe }: RecipeCardProps) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <Card className="mb-6 overflow-hidden">
      <div className="relative h-48">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 z-10" />
        <img 
          src={recipe.image_url || '/placeholder.svg'} 
          alt={recipe.recipe_name} 
          className="object-cover w-full h-full"
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
          <h3 className="text-white text-xl font-bold">{recipe.recipe_name}</h3>
          <p className="text-white/80 text-sm">
            {format(parseISO(recipe.created_at), 'MMM d, yyyy')}
          </p>
        </div>
      </div>
      
      <CardContent className={cn(
        "transition-all duration-300 overflow-hidden",
        expanded ? "max-h-[1000px]" : "max-h-48"
      )}>
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Ingredients:</h4>
          <ul className="list-disc pl-5 mb-4 space-y-1">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="text-sm">
                {ingredient.quantity} {ingredient.unit} {ingredient.name}
              </li>
            ))}
          </ul>
          
          <h4 className="font-semibold mb-2">Instructions:</h4>
          <ol className="list-decimal pl-5 space-y-2">
            {recipe.instructions.map((step, index) => (
              <li key={index} className="text-sm">{step}</li>
            ))}
          </ol>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-0">
        <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              Show More
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RecipeCard;
