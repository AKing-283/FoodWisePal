
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, Plus, RefreshCw, Utensils } from 'lucide-react';
import FoodItemCard from '@/components/FoodItemCard';
import AddFoodItemForm, { AddFoodItemValues } from '@/components/AddFoodItemForm';
import { useFoodItems } from '@/hooks/use-food-items';
import { useRecipes } from '@/hooks/use-recipes';
import Layout from '@/components/Layout';

const Dashboard = () => {
  const navigate = useNavigate();
  const { foodItems, loading, fetchFoodItems, addFoodItem, markAsConsumed, deleteFoodItem } = useFoodItems();
  const { generateRecipe } = useRecipes();
  const [refreshing, setRefreshing] = useState(false);
  const [generatingRecipe, setGeneratingRecipe] = useState(false);
  
  // Group food items by expiry status
  const expiredItems = foodItems.filter(item => new Date(item.expiry_date) < new Date());
  const expiringSoonItems = foodItems.filter(item => {
    const expiryDate = new Date(item.expiry_date);
    const today = new Date();
    const daysDiff = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff >= 0 && daysDiff <= 3 && expiryDate >= today;
  });
  const otherItems = foodItems.filter(item => {
    const expiryDate = new Date(item.expiry_date);
    const today = new Date();
    const daysDiff = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff > 3;
  });
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchFoodItems();
    setRefreshing(false);
  };
  
  const handleGenerateRecipe = async () => {
    setGeneratingRecipe(true);
    try {
      // Generate a recipe using the expiring soon items
      const itemsToUse = [...expiredItems, ...expiringSoonItems].slice(0, 5);
      if (itemsToUse.length === 0) {
        // If no expiring items, use some other items
        itemsToUse.push(...otherItems.slice(0, 3));
      }
      
      await generateRecipe(itemsToUse);
      navigate('/recipes');
    } catch (error) {
      console.error('Error generating recipe:', error);
    } finally {
      setGeneratingRecipe(false);
    }
  };
  
  // Wrapper function to convert Date to ISO string
  const handleAddFoodItem = async (values: AddFoodItemValues) => {
    return await addFoodItem({
      ...values,
      expiry_date: values.expiry_date.toISOString()
    });
  };
  
  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Food Inventory</h1>
            <p className="text-gray-500 mt-1">Track your food items and expiry dates</p>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
            <AddFoodItemForm onAddItem={handleAddFoodItem} />
            <Button variant="outline" onClick={handleRefresh} disabled={loading || refreshing}>
              {refreshing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Refresh
            </Button>
            <Button variant="default" onClick={handleGenerateRecipe} disabled={generatingRecipe}>
              {generatingRecipe ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Utensils className="h-4 w-4 mr-2" />}
              Generate Recipe
            </Button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          </div>
        ) : foodItems.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900">No food items yet</h3>
            <p className="text-gray-500 mt-2">Add food items to track their expiry dates</p>
            <Button className="mt-4" onClick={() => navigate('/receipts')}>
              <Plus className="h-4 w-4 mr-2" />
              Upload Receipt
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Items ({foodItems.length})</TabsTrigger>
              <TabsTrigger value="expiring" className="relative">
                Expiring Soon
                {(expiredItems.length + expiringSoonItems.length) > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {expiredItems.length + expiringSoonItems.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              {expiredItems.length > 0 && (
                <>
                  <Alert className="mb-6 border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <AlertTitle className="text-red-500">Expired Items</AlertTitle>
                    <AlertDescription>
                      These items have passed their expiry date. Consider using them immediately if still safe or disposing properly.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {expiredItems.map(item => (
                      <FoodItemCard 
                        key={item.id} 
                        item={item} 
                        onConsume={markAsConsumed} 
                        onDelete={deleteFoodItem} 
                      />
                    ))}
                  </div>
                </>
              )}
              
              {expiringSoonItems.length > 0 && (
                <>
                  <h2 className="text-xl font-semibold mb-4">Expiring Soon</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {expiringSoonItems.map(item => (
                      <FoodItemCard 
                        key={item.id} 
                        item={item} 
                        onConsume={markAsConsumed} 
                        onDelete={deleteFoodItem} 
                      />
                    ))}
                  </div>
                  
                  <Separator className="my-8" />
                </>
              )}
              
              {otherItems.length > 0 && (
                <>
                  <h2 className="text-xl font-semibold mb-4">Other Items</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {otherItems.map(item => (
                      <FoodItemCard 
                        key={item.id} 
                        item={item} 
                        onConsume={markAsConsumed} 
                        onDelete={deleteFoodItem} 
                      />
                    ))}
                  </div>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="expiring">
              {(expiredItems.length === 0 && expiringSoonItems.length === 0) ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <h3 className="text-lg font-medium text-gray-900">No items expiring soon</h3>
                  <p className="text-gray-500 mt-2">All your items have plenty of time before they expire</p>
                </div>
              ) : (
                <>
                  {expiredItems.length > 0 && (
                    <>
                      <h2 className="text-xl font-semibold mb-4 text-red-500">Expired</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                        {expiredItems.map(item => (
                          <FoodItemCard 
                            key={item.id} 
                            item={item} 
                            onConsume={markAsConsumed} 
                            onDelete={deleteFoodItem} 
                          />
                        ))}
                      </div>
                      
                      <Separator className="my-8" />
                    </>
                  )}
                  
                  {expiringSoonItems.length > 0 && (
                    <>
                      <h2 className="text-xl font-semibold mb-4">Expiring Within 3 Days</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {expiringSoonItems.map(item => (
                          <FoodItemCard 
                            key={item.id} 
                            item={item} 
                            onConsume={markAsConsumed} 
                            onDelete={deleteFoodItem} 
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
