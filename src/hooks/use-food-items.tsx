import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';
import { Database } from '@/lib/database.types';

export interface AddFoodItemValues {
  name: string;
  expiry_date: Date;
  quantity: number;
  unit?: string;
  category?: string;
  receipt_id?: string;
  consumed?: boolean;
}

export type FoodItem = Database['public']['Tables']['food_items']['Row'];

// Enhanced sample data for demo purposes
const SAMPLE_FOOD_ITEMS: FoodItem[] = [
  {
    id: '1',
    created_at: new Date().toISOString(),
    user_id: 'demo-user',
    name: 'Apples',
    expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    quantity: 5,
    unit: 'pieces',
    category: 'Fruits',
    receipt_id: null,
    consumed: false
  },
  {
    id: '2',
    created_at: new Date().toISOString(),
    user_id: 'demo-user',
    name: 'Milk',
    expiry_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    quantity: 1,
    unit: 'liter',
    category: 'Dairy',
    receipt_id: null,
    consumed: false
  },
  {
    id: '3',
    created_at: new Date().toISOString(),
    user_id: 'demo-user',
    name: 'Bread',
    expiry_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago (expired)
    quantity: 1,
    unit: 'loaf',
    category: 'Bakery',
    receipt_id: null,
    consumed: false
  },
  {
    id: '4',
    created_at: new Date().toISOString(),
    user_id: 'demo-user',
    name: 'Spinach',
    expiry_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    quantity: 1,
    unit: 'bunch',
    category: 'Vegetables',
    receipt_id: null,
    consumed: false
  },
  {
    id: '5',
    created_at: new Date().toISOString(),
    user_id: 'demo-user',
    name: 'Chicken Breast',
    expiry_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    quantity: 2,
    unit: 'pounds',
    category: 'Meat',
    receipt_id: null,
    consumed: false
  },
  {
    id: '6',
    created_at: new Date().toISOString(),
    user_id: 'demo-user',
    name: 'Yogurt',
    expiry_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    quantity: 6,
    unit: 'cups',
    category: 'Dairy',
    receipt_id: null,
    consumed: false
  }
];

export const useFoodItems = () => {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchFoodItems = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        // For demo purposes, use sample data if no user is authenticated
        setFoodItems(SAMPLE_FOOD_ITEMS);
        return;
      }
      
      const { data, error } = await supabase
        .from('food_items')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      // Transform the data to ensure it matches our expected FoodItem type
      const transformedData = data.map(item => ({
        ...item,
        unit: item.unit || null,
        category: item.category || null,
        receipt_id: item.receipt_id || null,
        consumed: item.consumed === true
      })) as FoodItem[];

      // Apply client-side filtering for consumed items
      const nonConsumedItems = transformedData.filter(item => !item.consumed);
      setFoodItems(nonConsumedItems);
    } catch (error) {
      console.error('Error fetching food items:', error);
      // Fall back to sample data on error
      setFoodItems(SAMPLE_FOOD_ITEMS);
      
      toast({
        title: 'Connected to sample data',
        description: 'Showing demo data for preview purposes',
      });
    } finally {
      setLoading(false);
    }
  };

  const addFoodItem = async (newItem: Partial<Omit<FoodItem, 'id' | 'created_at' | 'user_id'>>) => {
    if (!user) return null;
    
    try {
      if (!newItem.name) {
        throw new Error('Food item name is required');
      }
      
      if (!newItem.expiry_date) {
        throw new Error('Expiry date is required');
      }
      
      const itemToAdd = {
        name: newItem.name,
        expiry_date: newItem.expiry_date,
        quantity: newItem.quantity || 1,
        unit: newItem.unit || null,
        category: newItem.category || null,
        receipt_id: newItem.receipt_id || null,
        consumed: newItem.consumed ?? false,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('food_items')
        .insert([itemToAdd])
        .select()
        .single();

      if (error) {
        throw error;
      }
      
      setFoodItems(prev => [...prev, data as FoodItem]);
      
      toast({
        title: 'Food item added',
        description: `${newItem.name} has been added to your inventory`,
      });
      
      return data;
    } catch (error) {
      console.error('Error adding food item:', error);
      toast({
        title: 'Failed to add food item',
        description: 'Please try again',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateFoodItem = async (id: string, updates: Partial<FoodItem>) => {
    try {
      const { data, error } = await supabase
        .from('food_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setFoodItems(prev => 
        prev.map(item => item.id === id ? (data as FoodItem) : item)
      );
      
      toast({
        title: 'Food item updated',
        description: `${data.name} has been updated`,
      });
      
      return data;
    } catch (error) {
      console.error('Error updating food item:', error);
      toast({
        title: 'Failed to update food item',
        description: 'Please try again',
        variant: 'destructive',
      });
      return null;
    }
  };

  const markAsConsumed = async (id: string) => {
    return updateFoodItem(id, { consumed: true });
  };

  const deleteFoodItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('food_items')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setFoodItems(prev => prev.filter(item => item.id !== id));
      
      toast({
        title: 'Food item deleted',
        description: 'The item has been removed from your inventory',
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting food item:', error);
      toast({
        title: 'Failed to delete food item',
        description: 'Please try again',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchFoodItems();
  }, [user]);

  return {
    foodItems,
    loading,
    fetchFoodItems,
    addFoodItem,
    updateFoodItem,
    markAsConsumed,
    deleteFoodItem
  };
};
