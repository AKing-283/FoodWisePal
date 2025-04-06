import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading) {
      // If user is authenticated, redirect to dashboard
      if (user) {
        navigate('/dashboard');
      } else {
        // Otherwise redirect to login page
        navigate('/login');
      }
    }
  }, [user, loading, navigate]);
  
  // Use a div with loading state instead of null to avoid any rendering issues
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2">Loading...</span>
    </div>
  );
};

export default Index;
