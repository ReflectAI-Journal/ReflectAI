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
  // Detailed personalization questions
  anxietyFrequency: string;
  overthinkingPatterns: string[];
  physicalSymptoms: string[];
  triggerSituations: string[];
  currentStrategies: string;
  effectiveness: string;
  preferredApproaches: string[];
  timeAvailable: string;
  socialSupport: string;
  pastExperiences: string;
  specificGoals: string;
  learningStyle: string;
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
    severity: 'moderate',
    // Detailed personalization
    anxietyFrequency: '',
    overthinkingPatterns: [],
    physicalSymptoms: [],
    triggerSituations: [],
    currentStrategies: '',
    effectiveness: '',
    preferredApproaches: [],
    timeAvailable: '',
    socialSupport: '',
    pastExperiences: '',
    specificGoals: '',
    learningStyle: ''
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

  const handleArrayFieldChange = (field: keyof BlueprintFormData, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked
        ? [...(prev[field] as string[]), value]
        : (prev[field] as string[]).filter(item => item !== value)
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

            {/* Anxiety Frequency */}
            <div className="space-y-2">
              <Label>How often do you experience anxiety or overthinking?</Label>
              <Select
                value={formData.anxietyFrequency}
                onValueChange={(value) => setFormData(prev => ({ ...prev, anxietyFrequency: value }))}
                disabled={!isPro}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="occasionally">Occasionally (few times a month)</SelectItem>
                  <SelectItem value="weekly">Weekly (few times a week)</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="constantly">Almost constantly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Overthinking Patterns */}
            <div className="space-y-3">
              <Label>What overthinking patterns do you experience most? (Select all that apply)</Label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  'Replaying past conversations or events',
                  'Worrying about future scenarios',
                  'Analyzing every decision multiple times',
                  'Creating worst-case scenarios in my mind',
                  'Questioning my choices and abilities',
                  'Getting stuck in "what if" loops',
                  'Overthinking other people\'s words or actions',
                  'Planning and re-planning the same things'
                ].map((pattern) => (
                  <div key={pattern} className="flex items-center space-x-2">
                    <Checkbox
                      id={pattern}
                      checked={formData.overthinkingPatterns.includes(pattern)}
                      onCheckedChange={(checked) => handleArrayFieldChange('overthinkingPatterns', pattern, checked as boolean)}
                      disabled={!isPro}
                    />
                    <Label htmlFor={pattern} className="text-sm">{pattern}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Physical Symptoms */}
            <div className="space-y-3">
              <Label>What physical symptoms do you notice when anxious? (Select all that apply)</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Racing heart',
                  'Muscle tension',
                  'Difficulty breathing',
                  'Sweating',
                  'Stomach discomfort',
                  'Headaches',
                  'Restlessness',
                  'Fatigue',
                  'Difficulty sleeping',
                  'Loss of appetite'
                ].map((symptom) => (
                  <div key={symptom} className="flex items-center space-x-2">
                    <Checkbox
                      id={symptom}
                      checked={formData.physicalSymptoms.includes(symptom)}
                      onCheckedChange={(checked) => handleArrayFieldChange('physicalSymptoms', symptom, checked as boolean)}
                      disabled={!isPro}
                    />
                    <Label htmlFor={symptom} className="text-sm">{symptom}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Trigger Situations */}
            <div className="space-y-3">
              <Label>In what situations do you feel most anxious? (Select all that apply)</Label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  'Before important meetings or presentations',
                  'When making big decisions',
                  'In social gatherings or parties',
                  'When facing deadlines',
                  'During conflicts or confrontations',
                  'When things don\'t go as planned',
                  'Before sleep (nighttime anxiety)',
                  'When receiving feedback or criticism',
                  'In crowded or noisy places',
                  'When thinking about the future'
                ].map((situation) => (
                  <div key={situation} className="flex items-center space-x-2">
                    <Checkbox
                      id={situation}
                      checked={formData.triggerSituations.includes(situation)}
                      onCheckedChange={(checked) => handleArrayFieldChange('triggerSituations', situation, checked as boolean)}
                      disabled={!isPro}
                    />
                    <Label htmlFor={situation} className="text-sm">{situation}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Strategies */}
            <div className="space-y-2">
              <Label htmlFor="currentStrategies">What do you currently do when you feel anxious or start overthinking?</Label>
              <Textarea
                id="currentStrategies"
                placeholder="Describe your current coping strategies in detail..."
                value={formData.currentStrategies}
                onChange={(e) => setFormData(prev => ({ ...prev, currentStrategies: e.target.value }))}
                disabled={!isPro}
                rows={3}
              />
            </div>

            {/* Effectiveness */}
            <div className="space-y-2">
              <Label>How effective are your current strategies?</Label>
              <Select
                value={formData.effectiveness}
                onValueChange={(value) => setFormData(prev => ({ ...prev, effectiveness: value }))}
                disabled={!isPro}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select effectiveness" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not-effective">Not effective at all</SelectItem>
                  <SelectItem value="somewhat-effective">Somewhat effective</SelectItem>
                  <SelectItem value="moderately-effective">Moderately effective</SelectItem>
                  <SelectItem value="very-effective">Very effective</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Preferred Approaches */}
            <div className="space-y-3">
              <Label>What type of approaches would you prefer to learn? (Select all that apply)</Label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  'Quick breathing techniques (2-5 minutes)',
                  'Mindfulness and meditation practices',
                  'Physical movement and exercise',
                  'Cognitive reframing techniques',
                  'Journaling and writing exercises',
                  'Progressive muscle relaxation',
                  'Grounding techniques using senses',
                  'Structured problem-solving methods'
                ].map((approach) => (
                  <div key={approach} className="flex items-center space-x-2">
                    <Checkbox
                      id={approach}
                      checked={formData.preferredApproaches.includes(approach)}
                      onCheckedChange={(checked) => handleArrayFieldChange('preferredApproaches', approach, checked as boolean)}
                      disabled={!isPro}
                    />
                    <Label htmlFor={approach} className="text-sm">{approach}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Time Available */}
            <div className="space-y-2">
              <Label>How much time can you typically dedicate to anxiety management techniques?</Label>
              <Select
                value={formData.timeAvailable}
                onValueChange={(value) => setFormData(prev => ({ ...prev, timeAvailable: value }))}
                disabled={!isPro}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-2-minutes">1-2 minutes (emergency techniques)</SelectItem>
                  <SelectItem value="5-10-minutes">5-10 minutes daily</SelectItem>
                  <SelectItem value="15-30-minutes">15-30 minutes daily</SelectItem>
                  <SelectItem value="30-plus-minutes">30+ minutes daily</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Social Support */}
            <div className="space-y-2">
              <Label>How would you describe your social support system?</Label>
              <Select
                value={formData.socialSupport}
                onValueChange={(value) => setFormData(prev => ({ ...prev, socialSupport: value }))}
                disabled={!isPro}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select support level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strong">Strong - I have people I can talk to</SelectItem>
                  <SelectItem value="moderate">Moderate - Some supportive relationships</SelectItem>
                  <SelectItem value="limited">Limited - Few people to talk to</SelectItem>
                  <SelectItem value="minimal">Minimal - I mostly handle things alone</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Past Experiences */}
            <div className="space-y-2">
              <Label htmlFor="pastExperiences">Have you tried therapy, counseling, or mental health apps before? What worked or didn't work?</Label>
              <Textarea
                id="pastExperiences"
                placeholder="Share your past experiences with mental health support..."
                value={formData.pastExperiences}
                onChange={(e) => setFormData(prev => ({ ...prev, pastExperiences: e.target.value }))}
                disabled={!isPro}
                rows={3}
              />
            </div>

            {/* Specific Goals */}
            <div className="space-y-2">
              <Label htmlFor="specificGoals">What specific goals do you have for managing your anxiety and overthinking?</Label>
              <Textarea
                id="specificGoals"
                placeholder="Describe what you hope to achieve..."
                value={formData.specificGoals}
                onChange={(e) => setFormData(prev => ({ ...prev, specificGoals: e.target.value }))}
                disabled={!isPro}
                rows={3}
              />
            </div>

            {/* Learning Style */}
            <div className="space-y-2">
              <Label>What learning style works best for you?</Label>
              <Select
                value={formData.learningStyle}
                onValueChange={(value) => setFormData(prev => ({ ...prev, learningStyle: value }))}
                disabled={!isPro}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select learning style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visual">Visual - I learn best with diagrams and images</SelectItem>
                  <SelectItem value="auditory">Auditory - I prefer listening and verbal instructions</SelectItem>
                  <SelectItem value="kinesthetic">Kinesthetic - I learn by doing and practicing</SelectItem>
                  <SelectItem value="reading">Reading/Writing - I prefer written instructions and lists</SelectItem>
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