import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { Redirect, Route, useLocation } from 'wouter';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  path: string;
  children: React.ReactNode;
}

export function ProtectedRoute({ path, children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [location, navigate] = useLocation();
  
  // This effect will run when the component mounts
  useEffect(() => {
    // If the user isn't logged in and we're done loading, redirect to auth
    if (!isLoading && !user && location.startsWith(path)) {
      navigate('/auth');
    }
  }, [user, isLoading, location, navigate, path]);

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  // Allow the route to render normally
  // The useEffect above will handle the redirection if needed
  return <Route path={path}>{children}</Route>;
}