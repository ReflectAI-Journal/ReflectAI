import React, { useState } from 'react';
import { ArrowLeft, Moon, Sun, Bell, Lock, Database, HelpCircle, RefreshCw, CreditCard } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from '@/hooks/use-auth';

const Settings = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, subscriptionStatus, isSubscriptionLoading, cancelSubscription } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [dataExport, setDataExport] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  const handleReset = () => {
    toast({
      title: "Account reset",
      description: "Your account preferences have been reset to default settings.",
    });
  };

  const handleSave = () => {
    setIsSaving(true);
    
    // Simulate saving settings
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
    }, 800);
  };
  
  const handleCancelSubscription = async () => {
    setIsCanceling(true);
    try {
      await cancelSubscription();
      // The toast is already displayed in the cancelSubscription function
    } catch (error) {
      // Error is already handled in the cancelSubscription function
    } finally {
      setIsCanceling(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-6 md:p-8 lg:p-10">
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
          className="mr-4"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold text-primary">Settings</h1>
      </div>

      <div className="grid gap-8">
        {/* Appearance Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Appearance</h2>
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border/40">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                {isDarkMode ? 
                  <Moon className="h-5 w-5 text-indigo-400" /> : 
                  <Sun className="h-5 w-5 text-amber-400" />
                }
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">Toggle between light and dark themes</p>
                </div>
              </div>
              <Switch
                checked={isDarkMode}
                onCheckedChange={setIsDarkMode}
                aria-label="Toggle dark mode"
              />
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Notifications</h2>
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border/40">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="font-medium">Journal Reminders</p>
                  <p className="text-sm text-muted-foreground">Receive daily reminders to write in your journal</p>
                </div>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
                aria-label="Toggle notifications"
              />
            </div>
          </div>
        </div>

        {/* Subscription Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Subscription</h2>
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border/40 space-y-4">
            {isSubscriptionLoading ? (
              <div className="flex justify-center items-center py-6">
                <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : subscriptionStatus?.status === 'active' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">Active Subscription</p>
                      <p className="text-sm text-muted-foreground">
                        {subscriptionStatus.plan === 'pro' ? 'Pro Plan' : 
                        subscriptionStatus.plan === 'unlimited' ? 'Unlimited Plan' : 
                        'Active Plan'}
                      </p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-green-500/20 text-green-600 text-xs font-medium rounded-full">
                    Active
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="text-red-500 border-red-300/50 hover:bg-red-500/10"
                        disabled={isCanceling}
                      >
                        {isCanceling ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full mr-2"></div>
                            Canceling...
                          </>
                        ) : (
                          "Cancel Subscription"
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          You are about to cancel your subscription. You will still have access to premium features until the end of your current billing period.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                        <AlertDialogAction 
                          className="bg-red-500 hover:bg-red-600"
                          onClick={handleCancelSubscription}
                        >
                          Yes, Cancel Subscription
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  
                  <p className="text-xs mt-2 text-muted-foreground">
                    You will have access to premium features until the end of your current billing period.
                  </p>
                </div>
              </div>
            ) : subscriptionStatus?.trialActive ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">Free Trial</p>
                      <p className="text-sm text-muted-foreground">
                        {subscriptionStatus.daysLeft} days remaining
                      </p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-blue-500/20 text-blue-600 text-xs font-medium rounded-full">
                    Trial
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <Button 
                    variant="default"
                    onClick={() => navigate('/subscription')}
                  >
                    Upgrade to Premium
                  </Button>
                  <p className="text-xs mt-2 text-muted-foreground">
                    Upgrade to continue using premium features after your trial ends.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">No Active Subscription</p>
                      <p className="text-sm text-muted-foreground">
                        Limited access to features
                      </p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300 text-xs font-medium rounded-full">
                    Expired
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <Button 
                    variant="default"
                    onClick={() => navigate('/subscription')}
                  >
                    Subscribe Now
                  </Button>
                  <p className="text-xs mt-2 text-muted-foreground">
                    Subscribe to access all premium features.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Data & Privacy */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Data & Privacy</h2>
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border/40 space-y-4">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-green-400" />
                <div>
                  <p className="font-medium">Export Data</p>
                  <p className="text-sm text-muted-foreground">Automatically export your journal data weekly</p>
                </div>
              </div>
              <Switch
                checked={dataExport}
                onCheckedChange={setDataExport}
                aria-label="Toggle data export"
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <RefreshCw className="h-5 w-5 text-amber-400" />
                <div>
                  <p className="font-medium">Auto-Save</p>
                  <p className="text-sm text-muted-foreground">Automatically save journal entries as you type</p>
                </div>
              </div>
              <Switch
                checked={autoSave}
                onCheckedChange={setAutoSave}
                aria-label="Toggle auto-save"
              />
            </div>
            
            <Separator />
            
            <div className="pt-2">
              <Button 
                variant="outline" 
                className="text-red-500 border-red-300/50 hover:bg-red-500/10"
                onClick={handleReset}
              >
                Reset App Data
              </Button>
              <p className="text-xs mt-2 text-muted-foreground">
                This will reset all your preferences to the default settings.
              </p>
            </div>
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="mt-4 flex justify-end">
          <Button 
            className="px-8 bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary text-white"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;