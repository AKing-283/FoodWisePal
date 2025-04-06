import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';
import { Database } from '@/lib/database.types';

export type Receipt = Database['public']['Tables']['receipts']['Row'];

// Enhanced sample data for demo purposes
const SAMPLE_RECEIPTS: Receipt[] = [
  {
    id: '1',
    user_id: 'demo-user',
    receipt_url: 'https://source.unsplash.com/random/800x600/?receipt',
    uploaded_at: new Date().toISOString(),
    store_name: 'Whole Foods',
    purchase_date: new Date().toISOString(),
    total_amount: 54.99
  },
  {
    id: '2',
    user_id: 'demo-user',
    receipt_url: 'https://source.unsplash.com/random/800x600/?grocery',
    uploaded_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    store_name: 'Trader Joe\'s',
    purchase_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    total_amount: 32.50
  },
  {
    id: '3',
    user_id: 'demo-user',
    receipt_url: 'https://source.unsplash.com/random/800x600/?supermarket',
    uploaded_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    store_name: 'Kroger',
    purchase_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    total_amount: 78.25
  },
  {
    id: '4',
    user_id: 'demo-user',
    receipt_url: 'https://source.unsplash.com/random/800x600/?market',
    uploaded_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    store_name: 'Safeway',
    purchase_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    total_amount: 43.99
  }
];

export const useReceipts = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        // For demo purposes, use sample data if no user is authenticated
        setReceipts(SAMPLE_RECEIPTS);
        return;
      }
      
      const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false });

      if (error) {
        throw error;
      }
      
      // Transform the data to ensure it matches our expected Receipt type
      const transformedData = data.map(item => ({
        ...item,
        store_name: item.store_name || null,
        purchase_date: item.purchase_date || item.uploaded_at,
        total_amount: item.total_amount || null
      })) as Receipt[];
      
      setReceipts(transformedData);
    } catch (error) {
      console.error('Error fetching receipts:', error);
      // Fall back to sample data on error
      setReceipts(SAMPLE_RECEIPTS);
      
      toast({
        title: 'Connected to sample data',
        description: 'Showing demo data for preview purposes',
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadReceipt = async (file: File, metadata: { 
    store_name?: string;
    purchase_date?: string;
    total_amount?: number;
  }) => {
    if (!user) return null;
    
    try {
      setLoading(true);
      
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = `receipts/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(filePath, file);
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('receipts')
        .getPublicUrl(filePath);
        
      // Create receipt record
      const { data, error } = await supabase
        .from('receipts')
        .insert([{
          user_id: user.id,
          receipt_url: urlData.publicUrl,
          store_name: metadata.store_name || null,
          purchase_date: metadata.purchase_date || new Date().toISOString(),
          total_amount: metadata.total_amount || null,
          uploaded_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }
      
      setReceipts(prev => [data as Receipt, ...prev]);
      
      toast({
        title: 'Receipt uploaded',
        description: 'Your receipt has been saved',
      });
      
      return data;
    } catch (error) {
      console.error('Error uploading receipt:', error);
      toast({
        title: 'Failed to upload receipt',
        description: 'Please try again',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const addReceiptByUrl = async (url: string, metadata: { 
    store_name?: string;
    purchase_date?: string;
    total_amount?: number;
  }) => {
    if (!user) return null;
    
    try {
      // Create receipt record directly with URL
      const { data, error } = await supabase
        .from('receipts')
        .insert([{
          user_id: user.id,
          receipt_url: url,
          store_name: metadata.store_name || null,
          purchase_date: metadata.purchase_date || new Date().toISOString(),
          total_amount: metadata.total_amount || null,
          uploaded_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }
      
      setReceipts(prev => [data as Receipt, ...prev]);
      
      toast({
        title: 'Receipt added',
        description: 'Receipt URL has been saved',
      });
      
      return data;
    } catch (error) {
      console.error('Error adding receipt by URL:', error);
      toast({
        title: 'Failed to add receipt',
        description: 'Please try again',
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteReceipt = async (id: string) => {
    try {
      // Get the receipt to find its file path
      const { data: receipt } = await supabase
        .from('receipts')
        .select('receipt_url')
        .eq('id', id)
        .single();
      
      // Delete from the database
      const { error } = await supabase
        .from('receipts')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
      
      // If it's a stored file (not external URL), try to delete from storage
      if (receipt?.receipt_url?.includes('supabase.co')) {
        try {
          const path = receipt.receipt_url.split('/').slice(-2).join('/');
          await supabase.storage.from('receipts').remove([path]);
        } catch (storageError) {
          console.error('Error deleting file:', storageError);
          // Continue even if storage deletion fails
        }
      }

      setReceipts(prev => prev.filter(item => item.id !== id));
      
      toast({
        title: 'Receipt deleted',
        description: 'The receipt has been removed',
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting receipt:', error);
      toast({
        title: 'Failed to delete receipt',
        description: 'Please try again',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, [user]);

  return {
    receipts,
    loading,
    fetchReceipts,
    uploadReceipt,
    addReceiptByUrl,
    deleteReceipt
  };
};
