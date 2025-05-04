import React, { useState } from 'react';
import { ArrowLeft, Moon, Sun, Bell, Lock, Database, HelpCircle, RefreshCw } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [dataExport, setDataExport] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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