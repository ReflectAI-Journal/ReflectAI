import { forwardRef, ForwardedRef } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { BarChart, Archive, Clock } from 'lucide-react';

const Sidebar = forwardRef((props, ref: ForwardedRef<HTMLDivElement>) => {
  return (
    <aside ref={ref} className="w-full md:w-1/4 lg:w-1/5 bg-background border-r border-border p-6 overflow-y-auto h-[calc(100vh-136px)]">
      {/* User Info */}
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
          <span className="font-semibold">JA</span>
        </div>
        <div className="ml-3">
          <p className="font-medium">Journal AI</p>
          <p className="text-sm text-muted-foreground">Your reflection companion</p>
        </div>
      </div>
      
      {/* Quick Links */}
      <div className="mb-8">
        <h2 className="font-header text-lg font-semibold mb-4">Quick Links</h2>
        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link href="/app/archives">
              <Archive className="mr-2 h-4 w-4" />
              Journal Archives
            </Link>
          </Button>
          
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link href="/app/memory-lane">
              <Clock className="mr-2 h-4 w-4" />
              Memory Lane
            </Link>
          </Button>
          
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link href="/app/stats">
              <BarChart className="mr-2 h-4 w-4" />
              Stats
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Tips Section */}
      <div className="mt-auto pt-6">
        <h2 className="font-header text-lg font-semibold mb-4">Journaling Tips</h2>
        <div className="bg-card/50 p-4 rounded-lg border border-border/40">
          <p className="text-sm text-muted-foreground">Write consistently to build a journaling habit. Even a few sentences each day can make a difference to your wellbeing.</p>
        </div>
      </div>
    </aside>
  );
});

export default Sidebar;