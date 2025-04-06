
import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Receipt, ExternalLink, Trash2, Plus, Loader2 } from 'lucide-react';
import AddFoodItemForm, { AddFoodItemValues } from '@/components/AddFoodItemForm';
import UploadReceiptForm from '@/components/UploadReceiptForm';
import { useReceipts, Receipt as ReceiptType } from '@/hooks/use-receipts';
import { useFoodItems } from '@/hooks/use-food-items';
import Layout from '@/components/Layout';

const Receipts = () => {
  const { receipts, loading, uploadReceipt, addReceiptByUrl, deleteReceipt } = useReceipts();
  const { addFoodItem } = useFoodItems();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const filteredReceipts = receipts.filter(receipt => 
    receipt.store_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.total_amount?.toString().includes(searchTerm)
  );
  
  // Wrapper function to handle adding food items with receipt_id
  const handleAddFoodItemFromReceipt = (receipt_id: string) => {
    return async (values: AddFoodItemValues) => {
      return await addFoodItem({
        ...values,
        receipt_id,
        expiry_date: values.expiry_date.toISOString()
      });
    };
  };
  
  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Receipts</h1>
            <p className="text-gray-500 mt-1">View and manage your grocery receipts</p>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
            <UploadReceiptForm 
              onUploadFile={uploadReceipt}
              onAddByUrl={addReceiptByUrl}
            />
          </div>
        </div>
        
        <div className="relative mb-6">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search receipts by store or amount..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          </div>
        ) : receipts.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900">No receipts yet</h3>
            <p className="text-gray-500 mt-2">Upload your first receipt to get started</p>
            <UploadReceiptForm
              onUploadFile={uploadReceipt}
              onAddByUrl={addReceiptByUrl}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReceipts.map(receipt => (
              <Card key={receipt.id} className="food-item-card">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{receipt.store_name || 'Unknown Store'}</h3>
                      <p className="text-sm text-gray-500">
                        {receipt.purchase_date ? format(parseISO(receipt.purchase_date), 'MMM d, yyyy') : 'Unknown date'}
                      </p>
                    </div>
                    {receipt.total_amount && (
                      <p className="text-lg font-medium">${receipt.total_amount.toFixed(2)}</p>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => {
                        setSelectedReceipt(receipt);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Receipt className="h-4 w-4 mr-2" />
                      View Receipt
                    </Button>
                  </div>
                </CardContent>
                
                <CardFooter className="p-4 pt-0 flex justify-between">
                  <AddFoodItemForm 
                    onAddItem={handleAddFoodItemFromReceipt(receipt.id)}
                    receipt_id={receipt.id}
                  />
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive" 
                    onClick={() => deleteReceipt(receipt.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>
              {selectedReceipt?.store_name || 'Receipt'} - {selectedReceipt?.purchase_date ? format(parseISO(selectedReceipt.purchase_date), 'MMM d, yyyy') : ''}
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            {selectedReceipt?.receipt_url ? (
              <div className="flex flex-col items-center">
                <img 
                  src={selectedReceipt.receipt_url} 
                  alt="Receipt" 
                  className="max-h-[500px] object-contain rounded-md"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
                <Button className="mt-4" onClick={() => window.open(selectedReceipt.receipt_url, '_blank')}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Original
                </Button>
              </div>
            ) : (
              <div className="text-center p-8 bg-gray-50 rounded-md">
                <p>No receipt image available</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Receipts;
