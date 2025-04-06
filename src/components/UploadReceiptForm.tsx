
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Receipt, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

const urlFormSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL' }),
  store_name: z.string().min(1, { message: 'Store name is required' }),
  purchase_date: z.date({
    required_error: 'Please select a date',
  }),
  total_amount: z.coerce.number().min(0).optional(),
});

const fileFormSchema = z.object({
  file: z.instanceof(File, { message: 'Please select a file' }),
  store_name: z.string().min(1, { message: 'Store name is required' }),
  purchase_date: z.date({
    required_error: 'Please select a date',
  }),
  total_amount: z.coerce.number().min(0).optional(),
});

type UrlFormValues = z.infer<typeof urlFormSchema>;
type FileFormValues = z.infer<typeof fileFormSchema>;

interface UploadReceiptFormProps {
  onUploadFile: (file: File, metadata: any) => Promise<any>;
  onAddByUrl: (url: string, metadata: any) => Promise<any>;
}

const UploadReceiptForm = ({ onUploadFile, onAddByUrl }: UploadReceiptFormProps) => {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const urlForm = useForm<UrlFormValues>({
    resolver: zodResolver(urlFormSchema),
    defaultValues: {
      url: '',
      store_name: '',
      purchase_date: new Date(),
      total_amount: undefined,
    },
  });
  
  const fileForm = useForm<FileFormValues>({
    resolver: zodResolver(fileFormSchema),
    defaultValues: {
      store_name: '',
      purchase_date: new Date(),
      total_amount: undefined,
    },
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      fileForm.setValue('file', file);
    }
  };
  
  const onSubmitUrl = async (values: UrlFormValues) => {
    await onAddByUrl(values.url, {
      store_name: values.store_name,
      purchase_date: values.purchase_date.toISOString(),
      total_amount: values.total_amount
    });
    urlForm.reset();
    setOpen(false);
  };
  
  const onSubmitFile = async (values: FileFormValues) => {
    if (!selectedFile) return;
    
    await onUploadFile(selectedFile, {
      store_name: values.store_name,
      purchase_date: values.purchase_date.toISOString(),
      total_amount: values.total_amount
    });
    
    fileForm.reset();
    setSelectedFile(null);
    setOpen(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="flex items-center gap-2">
          <Receipt className="w-4 h-4" />
          Upload Receipt
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Receipt</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="file" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file">Upload File</TabsTrigger>
            <TabsTrigger value="url">Enter URL</TabsTrigger>
          </TabsList>
          
          <TabsContent value="file" className="mt-4">
            <Form {...fileForm}>
              <form onSubmit={fileForm.handleSubmit(onSubmitFile)} className="space-y-4">
                <FormField
                  control={fileForm.control}
                  name="file"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Receipt Image</FormLabel>
                      <FormControl>
                        <div className="flex flex-col items-center justify-center w-full">
                          <label
                            htmlFor="dropzone-file"
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 border-gray-300 hover:bg-gray-100"
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-8 h-8 mb-2 text-gray-500" />
                              <p className="mb-2 text-sm text-gray-500">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                              </p>
                              <p className="text-xs text-gray-500">
                                Image files only (MAX. 10MB)
                              </p>
                            </div>
                            <input
                              id="dropzone-file"
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={handleFileChange}
                              {...field}
                            />
                          </label>
                          {selectedFile && (
                            <p className="mt-2 text-sm text-gray-500">
                              {selectedFile.name}
                            </p>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={fileForm.control}
                  name="store_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Whole Foods" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex gap-4">
                  <FormField
                    control={fileForm.control}
                    name="purchase_date"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Purchase Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={fileForm.control}
                    name="total_amount"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Total Amount ($)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="pt-4 flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Upload Receipt</Button>
                </div>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="url" className="mt-4">
            <Form {...urlForm}>
              <form onSubmit={urlForm.handleSubmit(onSubmitUrl)} className="space-y-4">
                <FormField
                  control={urlForm.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Receipt URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/receipt.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={urlForm.control}
                  name="store_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Whole Foods" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex gap-4">
                  <FormField
                    control={urlForm.control}
                    name="purchase_date"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Purchase Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={urlForm.control}
                    name="total_amount"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Total Amount ($)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="pt-4 flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Receipt</Button>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default UploadReceiptForm;
