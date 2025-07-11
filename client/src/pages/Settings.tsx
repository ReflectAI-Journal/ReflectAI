import React, { useState, useEffect } from 'react';
import { ArrowLeft, Moon, Sun, Bell, Lock, Database, HelpCircle, RefreshCw, CreditCard, User, Crown, Star, Calendar } from 'lucide-react';
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
import { useTutorial } from '@/hooks/use-tutorial';
import { useTheme } from '@/components/ui/theme-provider';

const Settings = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, subscriptionStatus, isSubscriptionLoading, cancelSubscription } = useAuth();
  const { theme, setTheme } = useTheme();
  const { startTutorial } = useTutorial();
  
  // Current saved settings
  const currentIsDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  // Pending settings (what user has changed but not saved yet)
  const [pendingIsDarkMode, setPendingIsDarkMode] = useState(currentIsDarkMode);
  const [pendingNotifications, setPendingNotifications] = useState(true);
  const [pendingDataExport, setPendingDataExport] = useState(false);
  const [pendingAutoSave, setPendingAutoSave] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  
  // Track if there are unsaved changes
  const hasUnsavedChanges = pendingIsDarkMode !== currentIsDarkMode;
  
  // Sync pending state with current theme when component mounts
  useEffect(() => {
    setPendingIsDarkMode(currentIsDarkMode);
  }, [currentIsDarkMode]);



  const handleSave = () => {
    setIsSaving(true);
    
    // Apply the pending theme change
    if (pendingIsDarkMode !== currentIsDarkMode) {
      setTheme(pendingIsDarkMode ? 'dark' : 'light');
    }
    
    // Simulate saving other settings
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
    }, 800);
  };
  
  const handleReset = () => {
    // Reset pending changes to current saved values
    setPendingIsDarkMode(currentIsDarkMode);
    setPendingNotifications(true);
    setPendingDataExport(false);
    setPendingAutoSave(true);
    
    toast({
      title: "Changes discarded",
      description: "Your unsaved changes have been reset to current settings.",
    });
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
        {/* User Profile Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
          <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 rounded-xl p-6 shadow-sm border border-blue-200/50 dark:border-blue-800/50">
            <div className="flex items-start gap-6">
              {/* Avatar with gradient background */}
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                  <User className="h-10 w-10 text-white" />
                </div>
                {/* Status indicator */}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-3 border-white dark:border-gray-900 flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                </div>
              </div>
              
              {/* User info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {user?.username || 'User'}
                  </h3>
                  {subscriptionStatus?.plan === 'unlimited' && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full text-xs font-medium text-white shadow-md">
                      <Crown className="h-3 w-3" />
                      <span>Unlimited</span>
                    </div>
                  )}
                  {subscriptionStatus?.plan === 'pro' && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full text-xs font-medium text-white shadow-md">
                      <Star className="h-3 w-3" />
                      <span>Pro</span>
                    </div>
                  )}
                  {subscriptionStatus?.plan === 'trial' && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full text-xs font-medium text-white shadow-md">
                      <Calendar className="h-3 w-3" />
                      <span>Trial</span>
                    </div>
                  )}
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {user?.email || 'No email provided'}
                </p>
                
                {/* Stats cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {subscriptionStatus?.status === 'active' ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  
                  <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Plan</div>
                    <div className="font-semibold text-gray-900 dark:text-white capitalize">
                      {subscriptionStatus?.plan || 'Free'}
                    </div>
                  </div>
                  
                  <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Member Since</div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {user?.trialStartedAt ? new Date(user.trialStartedAt).toLocaleDateString() : 'Recent'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Appearance Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Appearance</h2>
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border/40">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                {pendingIsDarkMode ? 
                  <Moon className="h-5 w-5 text-indigo-400" /> : 
                  <Sun className="h-5 w-5 text-amber-400" />
                }
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">Toggle between light and dark themes</p>
                </div>
              </div>
              <Switch
                checked={pendingIsDarkMode}
                onCheckedChange={setPendingIsDarkMode}
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
                checked={pendingNotifications}
                onCheckedChange={setPendingNotifications}
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
        
        {/* Counselor Settings */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Counselor Settings</h2>
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border/40 space-y-4">
            {(() => {
              const personalizedCounselor = localStorage.getItem('personalizedCounselor');
              if (personalizedCounselor) {
                const counselor = JSON.parse(personalizedCounselor);
                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Your Counselor</p>
                          <p className="text-sm text-muted-foreground">{counselor.name}</p>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-primary/20 text-primary text-xs font-medium rounded-full">
                        Matched
                      </div>
                    </div>
                    
                    <div className="bg-muted/30 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-2">Specialist in {counselor.specialty}</p>
                      <p className="text-sm">{counselor.description}</p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          localStorage.removeItem('personalizedCounselor');
                          localStorage.removeItem('questionnaireAnswers');
                          navigate('/');
                          toast({
                            title: "Counselor reset",
                            description: "Visit the home page to find a new personalized counselor match.",
                          });
                        }}
                        className="text-primary border-primary/50 hover:bg-primary/10"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Find New Counselor
                      </Button>
                      <p className="text-xs mt-2 text-muted-foreground">
                        This will reset your counselor match and you can retake the questionnaire.
                      </p>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div className="text-center py-6">
                    <User className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="font-medium mb-2">No Personalized Counselor</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Take our questionnaire to get matched with a counselor that fits your needs.
                    </p>
                    <Button 
                      onClick={() => navigate('/')}
                      className="bg-gradient-to-r from-primary to-violet-600 hover:from-primary-dark hover:to-violet-700 text-white"
                    >
                      Find My Counselor
                    </Button>
                  </div>
                );
              }
            })()}
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
                checked={pendingDataExport}
                onCheckedChange={setPendingDataExport}
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
                checked={pendingAutoSave}
                onCheckedChange={setPendingAutoSave}
                aria-label="Toggle auto-save"
              />
            </div>
            
            <Separator />
            
            <div className="pt-2">
              <Button 
                variant="outline" 
                className="text-red-500 border-red-300/50 hover:bg-red-500/10"
                onClick={handleReset}
                disabled={!hasUnsavedChanges}
              >
                {hasUnsavedChanges ? 'Discard Changes' : 'No Changes'}
              </Button>
              <p className="text-xs mt-2 text-muted-foreground">
                {hasUnsavedChanges ? 'Discard your unsaved changes and revert to current settings.' : 'Make changes above to enable reset option.'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Help & Support */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Help & Support</h2>
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border/40 space-y-4">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <HelpCircle className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="font-medium">App Tutorial</p>
                  <p className="text-sm text-muted-foreground">Learn how to use all features of ReflectAI</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  startTutorial();
                  toast({
                    title: "Tutorial Started",
                    description: "Welcome to the ReflectAI tutorial!",
                  });
                }}
                className="text-blue-600 border-blue-300/50 hover:bg-blue-500/10"
              >
                Start Tutorial
              </Button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-4 flex justify-end gap-3">
          {hasUnsavedChanges && (
            <Button 
              variant="outline"
              onClick={handleReset}
              disabled={isSaving}
            >
              Cancel
            </Button>
          )}
          <Button 
            className={`px-8 ${hasUnsavedChanges 
              ? 'bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary text-white' 
              : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
            onClick={handleSave}
            disabled={isSaving || !hasUnsavedChanges}
          >
            {isSaving ? "Saving..." : hasUnsavedChanges ? "Save Settings" : "No Changes to Save"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;