
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { useFoodBanks } from '@/hooks/use-food-banks';
import FoodBankCard from '@/components/FoodBankCard';
import Layout from '@/components/Layout';

const searchSchema = z.object({
  zipCode: z.string().min(5, { message: 'Zip code must be at least 5 characters' }),
});

const Donate = () => {
  const { foodBanks, loading, findNearbyFoodBanks } = useFoodBanks();
  const [searched, setSearched] = useState(false);
  
  const form = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      zipCode: '',
    },
  });
  
  const onSubmit = async (values: z.infer<typeof searchSchema>) => {
    await findNearbyFoodBanks(values.zipCode);
    setSearched(true);
  };
  
  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Donate Food</h1>
          <p className="text-gray-500 mt-1">Find nearby food banks to donate your extra food</p>
        </div>
        
        <Card className="p-6 mb-8 bg-gradient-to-br from-primary-100 to-white">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold mb-3">Why Donate?</h2>
            <p className="mb-4">
              When you donate your extra food items to local food banks, you're not only reducing waste but also helping those in need in your community.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <h3 className="font-medium mb-2">Reduce Food Waste</h3>
                <p className="text-sm text-gray-600">Help the environment by keeping food out of landfills</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <h3 className="font-medium mb-2">Fight Hunger</h3>
                <p className="text-sm text-gray-600">Provide essential nourishment to those facing food insecurity</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <h3 className="font-medium mb-2">Build Community</h3>
                <p className="text-sm text-gray-600">Connect with and strengthen your local community</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 italic">
              Note: Many food banks accept non-perishable items only. Always check with the food bank before donating perishable items.
            </p>
          </div>
        </Card>
        
        <div className="max-w-xl mx-auto mb-8">
          <h2 className="text-xl font-semibold mb-4">Find Food Banks Near You</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input className="pl-8" placeholder="Enter your zip code" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Search
              </Button>
            </form>
          </Form>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          </div>
        ) : searched ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">Food Banks ({foodBanks.length})</h2>
            
            <Tabs defaultValue="all">
              <TabsList className="mb-6">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="perishable">Accepts Perishable</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {foodBanks.map(foodBank => (
                    <FoodBankCard key={foodBank.id} foodBank={foodBank} />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="perishable">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {foodBanks
                    .filter(foodBank => foodBank.acceptsPerishable)
                    .map(foodBank => (
                      <FoodBankCard key={foodBank.id} foodBank={foodBank} />
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Enter your zip code to find nearby food banks.
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Donate;
