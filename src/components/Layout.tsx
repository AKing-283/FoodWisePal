
import { ReactNode } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { UserRound, LogOut, Home, Calendar, Receipt, UtensilsCrossed, HeartHandshake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast({
        title: "Signed out successfully",
        description: "Hope to see you again soon!",
      });
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Sign out failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  // If user is not authenticated and not on auth pages, redirect to login
  if (!user && !location.pathname.includes('/login')) {
    navigate('/login');
    return null;
  }

  // Don't show navigation on auth pages
  if (location.pathname.includes('/login')) {
    return <main className="min-h-screen">{children}</main>;
  }

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <Home className="mr-2 h-4 w-4" /> },
    { path: '/calendar', label: 'Calendar', icon: <Calendar className="mr-2 h-4 w-4" /> },
    { path: '/receipts', label: 'Receipts', icon: <Receipt className="mr-2 h-4 w-4" /> },
    { path: '/recipes', label: 'Recipes', icon: <UtensilsCrossed className="mr-2 h-4 w-4" /> },
    { path: '/donate', label: 'Donate', icon: <HeartHandshake className="mr-2 h-4 w-4" /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 p-4">
        <div className="flex items-center mb-8">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">F</div>
          <h1 className="ml-2 text-xl font-bold text-primary-800">FoodWisePal</h1>
        </div>
        
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant={location.pathname === item.path ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                location.pathname === item.path && "bg-primary-100 text-primary-800"
              )}
              asChild
            >
              <Link to={item.path}>
                {item.icon}
                {item.label}
              </Link>
            </Button>
          ))}
        </nav>
        
        <div className="pt-4 border-t border-gray-200 mt-auto">
          <div className="flex items-center mb-4">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
              <UserRound className="h-4 w-4" />
            </div>
            <div className="ml-2">
              <p className="text-sm font-medium text-gray-700">{user?.email}</p>
              <p className="text-xs text-gray-500">User</p>
            </div>
          </div>
          <Button variant="outline" className="w-full justify-start" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex flex-col flex-1">
        <header className="md:hidden sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center z-10">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">F</div>
            <h1 className="ml-2 text-xl font-bold text-primary-800">FoodWisePal</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={signOut}>
            <LogOut className="h-5 w-5" />
          </Button>
        </header>

        {/* Main content */}
        <main className="flex-1 p-4">{children}</main>

        {/* Mobile navigation */}
        <nav className="md:hidden flex border-t border-gray-200 bg-white">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              className={cn(
                "flex-1 py-2 flex flex-col items-center rounded-none",
                location.pathname === item.path ? "text-primary-600" : "text-gray-500"
              )}
              asChild
            >
              <Link to={item.path}>
                {(() => {
                  const Icon = item.icon.type;
                  return <Icon className="h-5 w-5" />;
                })()}
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            </Button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Layout;
