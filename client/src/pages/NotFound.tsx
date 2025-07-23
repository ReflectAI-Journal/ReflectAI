import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-900 dark:text-slate-100 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-4">Page Not Found</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          The page you're looking for doesn't exist.
        </p>
        <Button onClick={() => navigate("/")} className="bg-primary hover:bg-primary/90">
          Go Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;