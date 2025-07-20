import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Lock, Brain, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import UpgradeModal from '@/components/subscription/UpgradeModal';

interface BlueprintFormData {
  name: string;
  mainTriggers: string[];
  currentCopingMethods: string[];
  preferredTimeframe: string;
  severity: string;
}

export default function Blueprint() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const [formData, setFormData] = useState<BlueprintFormData>({
    name: '',
    mainTriggers: [],
    currentCopingMethods: [],
    preferredTimeframe: 'immediate',
    severity: 'moderate'
  });

  // Fetch user's previous downloads
  const { data: downloads = [] } = useQuery({
    queryKey: ['/api/blueprints/downloads'],
    enabled: !!user && (user.subscriptionPlan === 'pro' || user.subscriptionPlan === 'elite')
  });

  const isPro = user?.subscriptionPlan === 'pro' || user?.subscriptionPlan === 'elite';

  const handleDownload = async () => {
    if (!isPro) {
      setShowUpgradeModal(true);
      return;
    }

    setIsDownloading(true);
    try {
      const response = await fetch('/api/blueprints/download/anxiety-overthinking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.requiresPro) {
          setShowUpgradeModal(true);
          return;
        }
        throw new Error(errorData.message || 'Download failed');
      }

      // Get the PDF blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `anxiety-overthinking-blueprint-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Blueprint Downloaded",
        description: "Your personalized anxiety & overthinking blueprint has been downloaded successfully.",
      });

      // Refresh downloads list
      queryClient.invalidateQueries({ queryKey: ['/api/blueprints/downloads'] });

    } catch (error: any) {
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download blueprint. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleTriggerChange = (trigger: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      mainTriggers: checked 
        ? [...prev.mainTriggers, trigger]
        : prev.mainTriggers.filter(t => t !== trigger)
    }));
  };

  const handleCopingMethodChange = (method: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      currentCopingMethods: checked
        ? [...prev.currentCopingMethods, method]
        : prev.currentCopingMethods.filter(m => m !== method)
    }));
  };

  if (authLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Brain className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">1-on-1 Mental Health Blueprint</h1>
          {isPro && <Badge variant="secondary" className="bg-primary/10 text-primary">Pro Feature</Badge>}
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Get your personalized step-by-step plan for managing anxiety and overthinking. 
          This blueprint is customized based on your specific triggers and current situation.
        </p>
      </div>

      {!isPro && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="flex items-start gap-4 p-6">
            <Lock className="w-6 h-6 text-amber-600 mt-1 flex-shrink-0" />
            <div className="space-y-2">
              <h3 className="font-semibold text-amber-800 dark:text-amber-200">Pro Feature Required</h3>
              <p className="text-amber-700 dark:text-amber-300">
                Personalized mental health blueprints are available for Pro and Elite subscribers only. 
                Upgrade your plan to access this exclusive feature.
              </p>
              <Button 
                variant="outline" 
                className="border-amber-300 text-amber-700 hover:bg-amber-100"
                onClick={() => setShowUpgradeModal(true)}
              >
                Upgrade to Pro
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Blueprint Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Customize Your Blueprint
            </CardTitle>
            <CardDescription>
              Answer a few questions to personalize your anxiety and overthinking management plan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Your Name (Optional)</Label>
              <Input
                id="name"
                placeholder="Enter your name for personalization"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                disabled={!isPro}
              />
            </div>

            {/* Main Triggers */}
            <div className="space-y-3">
              <Label>What are your main anxiety triggers? (Select all that apply)</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Work/School stress',
                  'Social situations',
                  'Health concerns',
                  'Financial worries',
                  'Relationship issues',
                  'Future uncertainty',
                  'Past mistakes',
                  'Change/transitions'
                ].map((trigger) => (
                  <div key={trigger} className="flex items-center space-x-2">
                    <Checkbox
                      id={trigger}
                      checked={formData.mainTriggers.includes(trigger)}
                      onCheckedChange={(checked) => handleTriggerChange(trigger, checked as boolean)}
                      disabled={!isPro}
                    />
                    <Label htmlFor={trigger} className="text-sm">{trigger}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Coping Methods */}
            <div className="space-y-3">
              <Label>What coping methods do you currently use? (Select all that apply)</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Deep breathing',
                  'Meditation',
                  'Exercise',
                  'Journaling',
                  'Talking to friends',
                  'Music/Entertainment',
                  'Avoiding situations',
                  'None currently'
                ].map((method) => (
                  <div key={method} className="flex items-center space-x-2">
                    <Checkbox
                      id={method}
                      checked={formData.currentCopingMethods.includes(method)}
                      onCheckedChange={(checked) => handleCopingMethodChange(method, checked as boolean)}
                      disabled={!isPro}
                    />
                    <Label htmlFor={method} className="text-sm">{method}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Severity Level */}
            <div className="space-y-2">
              <Label htmlFor="severity">How would you rate your anxiety/overthinking level?</Label>
              <Select
                value={formData.severity}
                onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value }))}
                disabled={!isPro}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select severity level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mild">Mild - Occasional worry</SelectItem>
                  <SelectItem value="moderate">Moderate - Daily concern</SelectItem>
                  <SelectItem value="severe">Severe - Significantly impacts daily life</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Download Button */}
            <Button
              onClick={handleDownload}
              disabled={!isPro || isDownloading}
              className="w-full"
              size="lg"
            >
              {isDownloading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Generating Blueprint...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download Personalized Blueprint
                </div>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Blueprint Preview & Downloads */}
        <div className="space-y-6">
          {/* What's Included */}
          <Card>
            <CardHeader>
              <CardTitle>What's Included in Your Blueprint</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">Emergency Quick Actions</h4>
                    <p className="text-sm text-muted-foreground">Immediate steps to take when anxiety hits</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">5-Step Management Process</h4>
                    <p className="text-sm text-muted-foreground">Structured approach to handle overwhelming thoughts</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">Breathing & Grounding Techniques</h4>
                    <p className="text-sm text-muted-foreground">Proven methods to calm your nervous system</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">Long-term Prevention Strategies</h4>
                    <p className="text-sm text-muted-foreground">Daily practices to reduce anxiety over time</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">Personalized Trigger Management</h4>
                    <p className="text-sm text-muted-foreground">Custom strategies based on your specific triggers</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Previous Downloads */}
          {isPro && downloads.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Your Downloaded Blueprints</CardTitle>
                <CardDescription>
                  Previously generated blueprints for your reference
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {downloads.map((download: any) => (
                    <div key={download.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Anxiety & Overthinking Blueprint</p>
                          <p className="text-sm text-muted-foreground">
                            Downloaded {new Date(download.downloadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">PDF</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureName="Personal Mental Health Blueprints"
        description="Get customized, downloadable PDF guides with step-by-step strategies for managing anxiety, overthinking, and other mental health challenges."
        requiredPlan="Pro"
      />
    </div>
  );
}