
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChefHat, Search, Loader2 } from 'lucide-react';
import { useRecipes } from '@/hooks/use-recipes';
import { useFoodItems } from '@/hooks/use-food-items';
import RecipeCard from '@/components/RecipeCard';
import Layout from '@/components/Layout';

const Recipes = () => {
  const { recipes, loading, generateRecipe } = useRecipes();
  const { foodItems } = useFoodItems();
  const [searchTerm, setSearchTerm] = useState('');
  const [generatingRecipe, setGeneratingRecipe] = useState(false);
  
  const filteredRecipes = recipes.filter(recipe => 
    recipe.recipe_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.ingredients.some(ingredient => 
      (ingredient as { name: string }).name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  
  const handleGenerateRecipe = async () => {
    setGeneratingRecipe(true);
    try {
      // Use the first 5 food items to generate a recipe
      const itemsToUse = foodItems.slice(0, 5);
      await generateRecipe(itemsToUse);
    } catch (error) {
      console.error('Error generating recipe:', error);
    } finally {
      setGeneratingRecipe(false);
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Recipe Suggestions</h1>
            <p className="text-gray-500 mt-1">Get recipe ideas based on your food items</p>
          </div>
          
          <Button 
            className="mt-4 md:mt-0" 
            onClick={handleGenerateRecipe}
            disabled={generatingRecipe || foodItems.length === 0}
          >
            {generatingRecipe ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <ChefHat className="h-4 w-4 mr-2" />
            )}
            Generate New Recipe
          </Button>
        </div>
        
        <div className="relative mb-6">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search recipes by name or ingredients..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          </div>
        ) : recipes.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900">No recipe suggestions yet</h3>
            <p className="text-gray-500 mt-2">
              {foodItems.length === 0 
                ? "Add some food items first to get recipe suggestions" 
                : "Generate your first recipe to get started"}
            </p>
            
            <Button 
              className="mt-4" 
              onClick={handleGenerateRecipe}
              disabled={generatingRecipe || foodItems.length === 0}
            >
              <ChefHat className="h-4 w-4 mr-2" />
              Generate Recipe
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRecipes.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Recipes;
