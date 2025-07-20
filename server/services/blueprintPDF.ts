import jsPDF from 'jspdf';

interface UserPersonalizationData {
  name?: string;
  mainTriggers?: string[];
  currentCopingMethods?: string[];
  preferredTimeframe?: string;
  severity?: string;
  // Detailed personalization
  anxietyFrequency?: string;
  overthinkingPatterns?: string[];
  physicalSymptoms?: string[];
  triggerSituations?: string[];
  currentStrategies?: string;
  effectiveness?: string;
  preferredApproaches?: string[];
  timeAvailable?: string;
  socialSupport?: string;
  pastExperiences?: string;
  specificGoals?: string;
  learningStyle?: string;
}

export class BlueprintPDFService {
  static generateAnxietyOverthinkingBlueprint(personalizationData: UserPersonalizationData = {}): Buffer {
    const doc = new jsPDF();
    
    // Set up document
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let currentY = 30;
    
    // Helper function to add new page if needed
    const checkPageBreak = (spaceNeeded: number) => {
      if (currentY + spaceNeeded > doc.internal.pageSize.getHeight() - 30) {
        doc.addPage();
        currentY = 30;
      }
    };
    
    // Helper function to add text with word wrapping
    const addTextBlock = (text: string, fontSize: number = 12, color: [number, number, number] = [0, 0, 0]) => {
      doc.setFontSize(fontSize);
      doc.setTextColor(color[0], color[1], color[2]);
      const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
      checkPageBreak(lines.length * 7 + 10);
      doc.text(lines, margin, currentY);
      currentY += lines.length * 7 + 10;
    };
    
    // Header
    doc.setFontSize(24);
    doc.setTextColor(41, 98, 255);
    doc.text('Your Personal Anxiety & Overthinking Blueprint', margin, currentY);
    
    currentY += 20;
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text('A step-by-step guide customized specifically for you', margin, currentY);
    
    currentY += 30;
    
    // Personalized Introduction
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    if (personalizationData.name) {
      doc.text(`Hello ${personalizationData.name},`, margin, currentY);
      currentY += 15;
    }
    
    // Create personalized introduction based on user's responses
    let personalizedIntro = 'This blueprint has been specifically designed based on your responses to help you manage anxiety and overthinking. ';
    
    if (personalizationData.anxietyFrequency) {
      const frequencyMap: { [key: string]: string } = {
        'occasionally': 'Since you experience anxiety occasionally, this blueprint focuses on prevention and early intervention strategies.',
        'weekly': 'Since you experience anxiety weekly, this blueprint emphasizes both immediate relief techniques and ongoing management strategies.',
        'daily': 'Since you experience anxiety daily, this blueprint prioritizes quick relief techniques and sustainable daily practices.',
        'constantly': 'Since you experience anxiety almost constantly, this blueprint focuses on immediate relief and building a comprehensive daily management system.'
      };
      personalizedIntro += frequencyMap[personalizationData.anxietyFrequency] || '';
    }
    
    addTextBlock(personalizedIntro);
    
    // Your Specific Profile Section
    checkPageBreak(60);
    doc.setFontSize(18);
    doc.setTextColor(41, 98, 255);
    doc.text('Your Anxiety & Overthinking Profile', margin, currentY);
    currentY += 20;
    
    if (personalizationData.overthinkingPatterns && personalizationData.overthinkingPatterns.length > 0) {
      addTextBlock('Your Main Overthinking Patterns:', 14, [51, 51, 51]);
      personalizationData.overthinkingPatterns.forEach(pattern => {
        addTextBlock(`• ${pattern}`, 11);
      });
    }
    
    if (personalizationData.physicalSymptoms && personalizationData.physicalSymptoms.length > 0) {
      addTextBlock('Physical Symptoms You Experience:', 14, [51, 51, 51]);
      personalizationData.physicalSymptoms.forEach(symptom => {
        addTextBlock(`• ${symptom}`, 11);
      });
    }
    
    if (personalizationData.triggerSituations && personalizationData.triggerSituations.length > 0) {
      addTextBlock('Your Most Challenging Situations:', 14, [51, 51, 51]);
      personalizationData.triggerSituations.forEach(situation => {
        addTextBlock(`• ${situation}`, 11);
      });
    }
    
    // Emergency Quick Action (Personalized based on time available and symptoms)
    checkPageBreak(50);
    doc.setFillColor(255, 245, 245);
    doc.rect(margin, currentY - 5, pageWidth - 2 * margin, 45, 'F');
    doc.setTextColor(220, 38, 38);
    doc.setFontSize(14);
    doc.text('🚨 IMMEDIATE ACTION (Use This Right Now)', margin + 5, currentY + 10);
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    
    // Customize emergency technique based on time available
    let emergencyTechnique = '';
    if (personalizationData.timeAvailable === '1-2-minutes') {
      emergencyTechnique = '1. Box Breathing: Breathe in for 4, hold for 4, out for 4, hold for 4. Repeat 3 times.\n2. Name 3 things you can see, 2 you can hear, 1 you can touch.';
    } else if (personalizationData.preferredApproaches?.includes('Physical movement and exercise')) {
      emergencyTechnique = '1. Do 10 jumping jacks or shake your hands vigorously for 30 seconds\n2. Take 5 deep breaths while rolling your shoulders\n3. Ground yourself by feeling your feet on the floor';
    } else {
      emergencyTechnique = '1. Pause and take 3 deep breaths\n2. Notice: "I am having anxious thoughts, and that\'s okay"\n3. Use the 5-4-3-2-1 technique: Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste';
    }
    
    const emergencyLines = doc.splitTextToSize(emergencyTechnique, pageWidth - 2 * margin - 10);
    doc.text(emergencyLines, margin + 5, currentY + 25);
    currentY += 50;
    
    // Generate personalized strategies based on user preferences
    this.generatePersonalizedStrategies(doc, personalizationData, currentY, pageWidth, margin);
    
    return Buffer.from(doc.output('arraybuffer'));
  }
  
  private static generatePersonalizedStrategies(
    doc: jsPDF, 
    data: UserPersonalizationData, 
    startY: number, 
    pageWidth: number, 
    margin: number
  ) {
    let currentY = startY;
    
    // Helper function to add sections
    const addSection = (title: string, items: string[], withBackground = false) => {
      // Check page break
      if (currentY + (items.length * 15) > doc.internal.pageSize.getHeight() - 30) {
        doc.addPage();
        currentY = 30;
      }
      
      if (withBackground) {
        doc.setFillColor(245, 250, 255);
        doc.rect(margin, currentY - 5, pageWidth - 2 * margin, (items.length * 15) + 25, 'F');
      }
      
      doc.setFontSize(14);
      doc.setTextColor(41, 98, 255);
      doc.text(title, margin, currentY + 15);
      currentY += 25;
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      items.forEach(item => {
        const lines = doc.splitTextToSize(`• ${item}`, pageWidth - 2 * margin - 10);
        doc.text(lines, margin + 5, currentY);
        currentY += lines.length * 6 + 5;
      });
      currentY += 15;
    };
    
    // Step 1: Immediate Relief (Based on time available and preferences)
    let immediateSteps: string[] = [];
    if (data.timeAvailable === '1-2-minutes') {
      immediateSteps = [
        'STOP technique: Say "STOP" and take one deep breath',
        'Quick grounding: Name 3 things you can see right now',
        'Physical reset: Clench and release your fists 3 times'
      ];
    } else if (data.preferredApproaches?.includes('Physical movement and exercise')) {
      immediateSteps = [
        'Stand up and do 5 jumping jacks or march in place for 30 seconds',
        'Shoulder rolls: Roll your shoulders back 5 times, forward 5 times',
        'Deep breathing while walking: Take 10 steps while breathing deeply'
      ];
    } else if (data.preferredApproaches?.includes('Mindfulness and meditation practices')) {
      immediateSteps = [
        'Mindful breathing: Focus only on your breath for 2 minutes',
        'Body scan: Notice tension and consciously relax each muscle group',
        'Present moment awareness: Notice 5 things in your environment without judgment'
      ];
    } else {
      immediateSteps = [
        'Pause and acknowledge: "I notice I\'m feeling anxious, and that\'s okay"',
        'Box breathing: In for 4, hold for 4, out for 4, hold for 4',
        '5-4-3-2-1 grounding: 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste'
      ];
    }
    
    addSection('Step 1: Immediate Relief (Your Preferred Methods)', immediateSteps, true);
    
    // Step 2: Address Your Specific Overthinking Patterns
    if (data.overthinkingPatterns && data.overthinkingPatterns.length > 0) {
      let patternSteps: string[] = [];
      
      if (data.overthinkingPatterns.includes('Replaying past conversations or events')) {
        patternSteps.push('For past replaying: Write down 3 different ways the situation could be interpreted');
        patternSteps.push('Ask yourself: "What would I tell my best friend about this situation?"');
      }
      
      if (data.overthinkingPatterns.includes('Worrying about future scenarios')) {
        patternSteps.push('For future worries: Write down your worst fear, then 3 more realistic outcomes');
        patternSteps.push('Focus on ONE thing you can actually control about the situation');
      }
      
      if (data.overthinkingPatterns.includes('Creating worst-case scenarios in my mind')) {
        patternSteps.push('Challenge worst-case thinking: Rate the actual likelihood (1-10)');
        patternSteps.push('Create a "best-case scenario" and "most likely scenario" as alternatives');
      }
      
      if (data.overthinkingPatterns.includes('Getting stuck in "what if" loops')) {
        patternSteps.push('Set a "worry timer" - allow yourself 5 minutes to worry, then STOP');
        patternSteps.push('For each "what if," create a concrete action plan or accept it\'s beyond your control');
      }
      
      if (patternSteps.length === 0) {
        patternSteps = [
          'Recognize the pattern: "I notice I\'m overthinking again"',
          'Use thought stopping: Visualize a big red STOP sign',
          'Redirect to action: Choose one small task to focus on instead'
        ];
      }
      
      addSection('Step 2: Address Your Specific Thinking Patterns', patternSteps);
    }
    
    // Step 3: Physical Symptom Management
    if (data.physicalSymptoms && data.physicalSymptoms.length > 0) {
      let physicalSteps: string[] = [];
      
      if (data.physicalSymptoms.includes('Racing heart')) {
        physicalSteps.push('For racing heart: Place hand on chest, breathe slowly and deeply');
      }
      if (data.physicalSymptoms.includes('Muscle tension')) {
        physicalSteps.push('For muscle tension: Progressive muscle relaxation - tense and release each muscle group');
      }
      if (data.physicalSymptoms.includes('Difficulty breathing')) {
        physicalSteps.push('For breathing difficulty: Breathe into a paper bag or cup your hands over your mouth');
      }
      if (data.physicalSymptoms.includes('Restlessness')) {
        physicalSteps.push('For restlessness: Do gentle stretches or go for a short walk');
      }
      if (data.physicalSymptoms.includes('Difficulty sleeping')) {
        physicalSteps.push('For sleep issues: Practice 4-7-8 breathing before bed (in 4, hold 7, out 8)');
      }
      
      addSection('Step 3: Manage Your Physical Symptoms', physicalSteps);
    }
    
    // Step 4: Situation-Specific Strategies
    if (data.triggerSituations && data.triggerSituations.length > 0) {
      let situationSteps: string[] = [];
      
      if (data.triggerSituations.includes('Before important meetings or presentations')) {
        situationSteps.push('Meeting prep: Arrive 10 minutes early and do breathing exercises');
        situationSteps.push('Visualize success: Spend 2 minutes imagining the meeting going well');
      }
      
      if (data.triggerSituations.includes('When making big decisions')) {
        situationSteps.push('Decision anxiety: List pros and cons, then trust your gut instinct');
        situationSteps.push('Remember: Most decisions can be adjusted later if needed');
      }
      
      if (data.triggerSituations.includes('In social gatherings or parties')) {
        situationSteps.push('Social anxiety: Plan 2-3 conversation starters before attending');
        situationSteps.push('Give yourself permission to leave early if you need to');
      }
      
      if (data.triggerSituations.includes('Before sleep (nighttime anxiety)')) {
        situationSteps.push('Bedtime routine: No screens 1 hour before bed, write down tomorrow\'s priorities');
        situationSteps.push('If thoughts race: Keep a notepad by your bed to "park" worries for tomorrow');
      }
      
      addSection('Step 4: Your Trigger Situation Strategies', situationSteps);
    }
    
    // Step 5: Daily Prevention Plan (Based on time available)
    let dailySteps: string[] = [];
    if (data.timeAvailable === '1-2-minutes') {
      dailySteps = [
        'Morning: 2-minute breathing exercise when you wake up',
        'Midday: Quick body scan - notice and release any tension',
        'Evening: Write down one good thing that happened today'
      ];
    } else if (data.timeAvailable === '5-10-minutes') {
      dailySteps = [
        'Morning: 5-minute meditation or breathing practice',
        'Set 3 main priorities for the day (avoid overwhelming to-do lists)',
        'Evening: 5-minute gratitude practice - write 3 specific things you\'re grateful for'
      ];
    } else {
      dailySteps = [
        'Morning: 10-15 minute mindfulness practice or light exercise',
        'Midday: 5-minute check-in with yourself about stress levels',
        'Evening: 15-minute journaling or reflection time',
        'Weekly: Review what triggered anxiety and what helped most'
      ];
    }
    
    addSection('Step 5: Your Daily Prevention Plan', dailySteps, true);
    
    // Personalized Goals Section
    if (data.specificGoals) {
      doc.addPage();
      currentY = 30;
      
      doc.setFontSize(16);
      doc.setTextColor(41, 98, 255);
      doc.text('Your Personal Goals & Action Plan', margin, currentY);
      currentY += 25;
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      addSection('Your Goals:', [data.specificGoals]);
      
      // Suggest action steps based on their goals
      addSection('Recommended Weekly Actions:', [
        'Practice your preferred techniques daily for at least a week',
        'Track your anxiety levels (1-10) and what techniques help most',
        'Identify one trigger situation to practice your new strategies',
        'Schedule check-ins with yourself every few days'
      ]);
    }
    
    // Support Resources
    let supportSteps: string[] = [];
    if (data.socialSupport === 'strong') {
      supportSteps.push('Reach out to your support network when you feel overwhelmed');
      supportSteps.push('Share this blueprint with trusted friends or family who can help remind you to use these techniques');
    } else if (data.socialSupport === 'minimal') {
      supportSteps.push('Consider joining online support communities or anxiety support groups');
      supportSteps.push('Look into counseling or therapy - even a few sessions can be very helpful');
    }
    supportSteps.push('Crisis support: If thoughts of self-harm occur, call 988 (Suicide & Crisis Lifeline) immediately');
    supportSteps.push('Remember: Using these techniques regularly will make them more effective over time');
    
    addSection('Support & Additional Resources', supportSteps);
    
    // Footer
    doc.addPage();
    currentY = doc.internal.pageSize.getHeight() - 40;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Generated by ReflectAI Pro - Your Personal Mental Wellness Companion', margin, currentY);
    doc.text(`Created: ${new Date().toLocaleDateString()}`, margin, currentY + 10);
    
    if (data.name) {
      doc.text(`Personalized for: ${data.name}`, margin, currentY + 20);
    }
  }
}