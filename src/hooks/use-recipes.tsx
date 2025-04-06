import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';
import { FoodItem } from './use-food-items';

export interface Recipe {
  id: string;
  created_at: string;
  user_id: string;
  recipe_name: string;
  ingredients: any[]; // Using any[] for flexibility
  instructions: string[]; 
  food_items_used: string[];
  image_url: string | null;
}

// Enhanced sample data for demo purposes
const SAMPLE_RECIPES: Recipe[] = [
  {
    id: '1',
    created_at: new Date().toISOString(),
    user_id: 'demo-user',
    recipe_name: 'Apple Cinnamon Breakfast Bowl',
    ingredients: [
      { name: 'Apples', quantity: 2, unit: 'medium' },
      { name: 'Oats', quantity: 1, unit: 'cup' },
      { name: 'Cinnamon', quantity: 1, unit: 'tsp' },
      { name: 'Honey', quantity: 2, unit: 'tbsp' }
    ],
    instructions: [
      'Dice apples into small cubes.',
      'Cook oats according to package instructions.',
      'Mix apples, cooked oats, cinnamon, and honey together.',
      'Serve warm and enjoy your nutritious breakfast!'
    ],
    food_items_used: ['1'],
    image_url: 'https://source.unsplash.com/random/800x600/?apple,breakfast'
  },
  {
    id: '2',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    user_id: 'demo-user',
    recipe_name: 'Milk and Bread Pudding',
    ingredients: [
      { name: 'Bread', quantity: 4, unit: 'slices' },
      { name: 'Milk', quantity: 2, unit: 'cups' },
      { name: 'Sugar', quantity: 3, unit: 'tbsp' },
      { name: 'Vanilla extract', quantity: 1, unit: 'tsp' },
      { name: 'Eggs', quantity: 2, unit: 'large' }
    ],
    instructions: [
      'Cut bread into cubes and place in baking dish.',
      'Mix milk, sugar, vanilla, and beaten eggs.',
      'Pour mixture over bread and let sit for 15 minutes.',
      'Bake at 350°F for 35-40 minutes until set and golden.',
      'Serve warm or cold with a dusting of powdered sugar.'
    ],
    food_items_used: ['2', '3'],
    image_url: 'https://source.unsplash.com/random/800x600/?bread,pudding'
  },
  {
    id: '3',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    user_id: 'demo-user',
    recipe_name: 'Chicken and Spinach Stir Fry',
    ingredients: [
      { name: 'Chicken Breast', quantity: 1, unit: 'pound' },
      { name: 'Spinach', quantity: 1, unit: 'bunch' },
      { name: 'Garlic', quantity: 2, unit: 'cloves' },
      { name: 'Soy Sauce', quantity: 2, unit: 'tbsp' },
      { name: 'Olive Oil', quantity: 1, unit: 'tbsp' }
    ],
    instructions: [
      'Slice chicken breast into thin strips.',
      'Heat olive oil in a large skillet over medium-high heat.',
      'Add garlic and cook until fragrant, about 30 seconds.',
      'Add chicken and cook until no longer pink, about 5-6 minutes.',
      'Add spinach and cook until wilted, about 2 minutes.',
      'Stir in soy sauce and serve hot.'
    ],
    food_items_used: ['4', '5'],
    image_url: 'https://source.unsplash.com/random/800x600/?chicken,spinach'
  },
  {
    id: '4',
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    user_id: 'demo-user',
    recipe_name: 'Fruit and Yogurt Parfait',
    ingredients: [
      { name: 'Yogurt', quantity: 2, unit: 'cups' },
      { name: 'Granola', quantity: 1, unit: 'cup' },
      { name: 'Mixed Berries', quantity: 1, unit: 'cup' },
      { name: 'Honey', quantity: 1, unit: 'tbsp' }
    ],
    instructions: [
      'In a glass or bowl, layer yogurt, granola, and berries.',
      'Repeat layers until all ingredients are used.',
      'Drizzle honey on top.',
      'Serve immediately or refrigerate for later.'
    ],
    food_items_used: ['6'],
    image_url: 'https://source.unsplash.com/random/800x600/?yogurt,parfait'
  }
];

// Function to convert from Supabase format to our app format
function convertToAppRecipe(dbRecipe: any): Recipe {
  // Parse the suggested_recipe which should contain the recipe details
  let recipeDetails;
  try {
    recipeDetails = typeof dbRecipe.suggested_recipe === 'string' 
      ? JSON.parse(dbRecipe.suggested_recipe) 
      : dbRecipe.suggested_recipe;
  } catch (e) {
    recipeDetails = { name: "Unnamed Recipe", ingredients: [], instructions: [] };
  }
  
  // Parse food_items to get the IDs of food items used
  let foodItemsUsed;
  try {
    foodItemsUsed = typeof dbRecipe.food_items === 'string' 
      ? JSON.parse(dbRecipe.food_items) 
      : dbRecipe.food_items;
  } catch (e) {
    foodItemsUsed = [];
  }
  
  return {
    id: dbRecipe.id,
    created_at: dbRecipe.created_at || new Date().toISOString(),
    user_id: dbRecipe.user_id || '',
    recipe_name: recipeDetails.name || "Unnamed Recipe",
    ingredients: recipeDetails.ingredients || [],
    instructions: recipeDetails.instructions || [],
    food_items_used: Array.isArray(foodItemsUsed) ? foodItemsUsed : [],
    image_url: recipeDetails.image_url || null
  };
}

export const useRecipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        // For demo purposes, use sample data if no user is authenticated
        setRecipes(SAMPLE_RECIPES);
        return;
      }
      
      const { data, error } = await supabase
        .from('ai_recipes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Convert database records to our app format
      const appRecipes = (data || []).map(item => convertToAppRecipe(item));
      setRecipes(appRecipes);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      // Fall back to sample data on error
      setRecipes(SAMPLE_RECIPES);
      
      toast({
        title: 'Connected to sample data',
        description: 'Showing demo data for preview purposes',
      });
    } finally {
      setLoading(false);
    }
  };

  // This function would normally call the Gemini API to generate recipes
  // For now, we'll simulate it with a mocked implementation
  const generateRecipe = async (foodItems: FoodItem[]) => {
    if (!user || foodItems.length === 0) return null;
    
    try {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Extract food item information
      const itemNames = foodItems.map(item => item.name.toLowerCase());
      const itemIds = foodItems.map(item => item.id);
      
      // Create a recipe name based on available items
      let recipeName = '';
      if (itemNames.some(item => ['chicken', 'beef', 'pork', 'fish', 'tofu'].includes(item))) {
        const protein = itemNames.find(item => ['chicken', 'beef', 'pork', 'fish', 'tofu'].includes(item));
        recipeName = `${protein?.charAt(0).toUpperCase() + protein?.slice(1)} `;
      }
      
      if (itemNames.some(item => ['pasta', 'rice', 'noodles'].includes(item))) {
        const carb = itemNames.find(item => ['pasta', 'rice', 'noodles'].includes(item));
        recipeName += `${carb} `;
      }
      
      if (recipeName) {
        recipeName += 'Bowl';
      } else {
        recipeName = 'Mixed Ingredients Salad';
      }
      
      // Format ingredients
      const ingredients = foodItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit || 'piece(s)'
      }));
      
      // Generate basic instructions
      const instructions = [
        "Prepare all ingredients and set aside.",
        "Combine main ingredients in a large bowl.",
        "Mix well and season to taste.",
        "Cook on medium heat for 15-20 minutes if needed.",
        "Serve hot and enjoy your meal!"
      ];
      
      // Generate a random image URL (would be replaced with Gemini-generated image in production)
      const imageTypes = ['bowl', 'plate', 'salad', 'meal'];
      const randomType = imageTypes[Math.floor(Math.random() * imageTypes.length)];
      const imageUrl = `https://source.unsplash.com/featured/?food,${randomType}`;
      
      // Create recipe object
      const recipeDetails = {
        name: recipeName,
        ingredients: ingredients,
        instructions: instructions,
        image_url: imageUrl,
      };
      
      // Save to Supabase
      const { data, error } = await supabase
        .from('ai_recipes')
        .insert([{
          user_id: user.id,
          food_items: JSON.stringify(itemIds),
          suggested_recipe: JSON.stringify(recipeDetails)
        }])
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      // Convert the new database record to our app format
      const newRecipe = convertToAppRecipe(data);
      setRecipes(prev => [newRecipe, ...prev]);
      
      toast({
        title: 'Recipe generated',
        description: `${recipeName} is ready to try!`,
      });
      
      return newRecipe;
    } catch (error) {
      console.error('Error generating recipe:', error);
      toast({
        title: 'Failed to generate recipe',
        description: 'Please try again later',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [user]);

  return {
    recipes,
    loading,
    fetchRecipes,
    generateRecipe
  };
};
