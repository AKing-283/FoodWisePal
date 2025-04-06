import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';
import { Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

const signupSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string().min(6, { message: 'Password must be at least 6 characters' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });
  
  const onLogin = async (values: z.infer<typeof loginSchema>) => {
    try {
      setLoading(true);
      setAuthError(null);
      
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email.trim(),
        password: values.password,
      });
      
      if (error) {
        if (error.message === "Email not confirmed") {
          setAuthError('Your email has not been verified. Please check your inbox and verify your email before logging in.');
        } else if (error.message.includes("Invalid login credentials")) {
          setAuthError('Invalid email or password. Please try again.');
        } else {
          setAuthError(`Login failed: ${error.message}`);
        }
        return;
      }
      
      toast({
        title: 'Login successful',
        description: 'Welcome back to FoodWisePal!',
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error logging in:', error);
      setAuthError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const onSignup = async (values: z.infer<typeof signupSchema>) => {
    try {
      setLoading(true);
      setAuthError(null);
      
      const { error, data } = await supabase.auth.signUp({
        email: values.email.trim(),
        password: values.password,
      });
      
      if (error) {
        setAuthError(`Sign up failed: ${error.message}`);
        return;
      }
      
      if (data?.user && !data.user.email_confirmed_at) {
        toast({
          title: 'Account created',
          description: 'Please check your email to verify your account before logging in.',
        });
        setActiveTab("login");
      } else {
        toast({
          title: 'Sign up successful',
          description: 'Welcome to FoodWisePal!',
        });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error signing up:', error);
      setAuthError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl">F</div>
          <h1 className="ml-2 text-3xl font-bold text-gray-900">FoodWisePal</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Welcome to FoodWisePal</CardTitle>
            <CardDescription className="text-center">
              Track your food, reduce waste, and save money
            </CardDescription>
          </CardHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <CardContent className="pt-6">
                {authError && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{authError}</AlertDescription>
                  </Alert>
                )}
                
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="your@email.com" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Logging in...
                        </>
                      ) : 'Login'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex justify-center">
                <p className="text-sm text-gray-500">
                  Don't have an account? <Button 
                    variant="link" 
                    className="p-0 h-auto font-normal" 
                    onClick={() => setActiveTab("signup")}
                    type="button"
                  >
                    Sign up
                  </Button>
                </p>
              </CardFooter>
            </TabsContent>
            
            <TabsContent value="signup">
              <CardContent className="pt-6">
                {authError && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{authError}</AlertDescription>
                  </Alert>
                )}
                
                <Form {...signupForm}>
                  <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4">
                    <FormField
                      control={signupForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="your@email.com" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={signupForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={signupForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Signing up...
                        </>
                      ) : 'Sign Up'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex justify-center">
                <p className="text-sm text-gray-500">
                  Already have an account? <Button 
                    variant="link" 
                    className="p-0 h-auto font-normal" 
                    onClick={() => setActiveTab("login")}
                    type="button"
                  >
                    Login
                  </Button>
                </p>
              </CardFooter>
            </TabsContent>
          </Tabs>
        </Card>
        
        <p className="mt-8 text-center text-sm text-gray-500">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
        
        <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 font-medium mb-2">Team NoobDevs:</p>
          <p className="text-xs text-gray-500">Don't waste your Food guys</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
