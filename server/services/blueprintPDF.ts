import jsPDF from 'jspdf';

interface UserPersonalizationData {
  name?: string;
  mainTriggers?: string[];
  currentCopingMethods?: string[];
  preferredTimeframe?: string;
  severity?: string;
}

export class BlueprintPDFService {
  static generateAnxietyOverthinkingBlueprint(personalizationData: UserPersonalizationData = {}): Buffer {
    const doc = new jsPDF();
    
    // Set up document
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let currentY = 30;
    
    // Header
    doc.setFontSize(24);
    doc.setTextColor(41, 98, 255); // Blue color
    doc.text('Your Personal Anxiety & Overthinking Blueprint', margin, currentY);
    
    currentY += 20;
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text('A step-by-step guide customized for your mental wellness journey', margin, currentY);
    
    currentY += 30;
    
    // Personalized Introduction
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    if (personalizationData.name) {
      doc.text(`Hello ${personalizationData.name},`, margin, currentY);
      currentY += 15;
    }
    
    doc.setFontSize(12);
    const introText = `This blueprint has been specifically designed to help you manage anxiety and overthinking. 
Each step is proven by mental health research and can be implemented immediately when you feel overwhelmed.`;
    
    const splitIntro = doc.splitTextToSize(introText, pageWidth - 2 * margin);
    doc.text(splitIntro, margin, currentY);
    currentY += splitIntro.length * 7 + 20;
    
    // Emergency Quick Action (Red Box)
    doc.setFillColor(255, 245, 245);
    doc.rect(margin, currentY - 5, pageWidth - 2 * margin, 40, 'F');
    doc.setTextColor(220, 38, 38);
    doc.setFontSize(14);
    doc.text('🚨 IMMEDIATE ACTION (Use This Right Now)', margin + 5, currentY + 10);
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text('• Take 3 deep breaths: In for 4 counts, hold for 4, out for 6', margin + 5, currentY + 20);
    doc.text('• Name 5 things you can see, 4 you can touch, 3 you can hear', margin + 5, currentY + 30);
    currentY += 50;
    
    // Step 1: Recognize & Stop
    this.addSection(doc, 'Step 1: Recognize & Stop the Spiral', [
      'Notice when your thoughts are racing or you feel anxious',
      'Say "STOP" out loud or in your mind',
      'Place your hand on your chest and feel your heartbeat',
      'Remind yourself: "This feeling will pass, I am safe right now"'
    ], currentY, pageWidth, margin);
    currentY += 60;
    
    // Step 2: Ground Yourself
    this.addSection(doc, 'Step 2: Ground Yourself in the Present', [
      'Use the 5-4-3-2-1 technique: 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste',
      'Press your feet firmly into the ground',
      'Hold an ice cube or splash cold water on your face',
      'Focus on your immediate environment, not your thoughts'
    ], currentY, pageWidth, margin);
    currentY += 70;
    
    // Check if we need a new page
    if (currentY > 250) {
      doc.addPage();
      currentY = 30;
    }
    
    // Step 3: Breathing Exercise
    this.addSection(doc, 'Step 3: Reset with Box Breathing', [
      'Inhale slowly through your nose for 4 counts',
      'Hold your breath for 4 counts',
      'Exhale slowly through your mouth for 4 counts',
      'Hold empty for 4 counts',
      'Repeat this cycle 4-6 times'
    ], currentY, pageWidth, margin);
    currentY += 70;
    
    // Step 4: Challenge Thoughts
    this.addSection(doc, 'Step 4: Challenge Your Anxious Thoughts', [
      'Ask: "Is this thought helpful or harmful?"',
      'Ask: "What would I tell a friend in this situation?"',
      'Write down 3 alternative perspectives on the situation',
      'Focus on what you CAN control, not what you can\'t'
    ], currentY, pageWidth, margin);
    currentY += 70;
    
    // Step 5: Take Action
    this.addSection(doc, 'Step 5: Take One Small Action', [
      'Choose ONE small thing you can do right now',
      'This could be: texting a friend, going for a 5-minute walk, organizing one small area',
      'Complete this action fully before moving to the next thing',
      'Celebrate this accomplishment - you took positive action!'
    ], currentY, pageWidth, margin);
    currentY += 70;
    
    // Add new page for additional resources
    doc.addPage();
    currentY = 30;
    
    // Long-term Strategies
    doc.setFontSize(18);
    doc.setTextColor(41, 98, 255);
    doc.text('Long-term Anxiety Management Strategies', margin, currentY);
    currentY += 25;
    
    this.addSection(doc, 'Daily Prevention Practices', [
      'Morning: 5-minute meditation or breathing exercise',
      'Set 3 realistic priorities for the day (not a long to-do list)',
      'Limit news and social media to 30 minutes per day',
      'Exercise for at least 20 minutes (walking counts!)',
      'Evening: Write down 3 things that went well today'
    ], currentY, pageWidth, margin);
    currentY += 80;
    
    this.addSection(doc, 'When to Seek Additional Help', [
      'If anxiety interferes with daily activities for more than 2 weeks',
      'If you have persistent sleep problems or panic attacks',
      'If you avoid activities you used to enjoy',
      'If you have thoughts of self-harm',
      'Remember: Seeking help is a sign of strength, not weakness'
    ], currentY, pageWidth, margin);
    currentY += 80;
    
    // Personalized section if data provided
    if (personalizationData.mainTriggers && personalizationData.mainTriggers.length > 0) {
      this.addSection(doc, 'Your Personal Trigger Management', 
        personalizationData.mainTriggers.map(trigger => 
          `When you encounter "${trigger}": Use Steps 1-3 immediately, then remind yourself of past times you've handled similar situations successfully`
        ), 
        currentY, pageWidth, margin);
      currentY += 60;
    }
    
    // Footer
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Generated by ReflectAI Pro - Your Personal Mental Wellness Companion', margin, 280);
    doc.text(`Created: ${new Date().toLocaleDateString()}`, margin, 290);
    
    return Buffer.from(doc.output('arraybuffer'));
  }
  
  private static addSection(doc: jsPDF, title: string, steps: string[], startY: number, pageWidth: number, margin: number) {
    // Section title
    doc.setFontSize(14);
    doc.setTextColor(41, 98, 255);
    doc.text(title, margin, startY);
    
    // Section content
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    let currentY = startY + 15;
    
    steps.forEach((step, index) => {
      const bulletPoint = `${index + 1}. ${step}`;
      const splitText = doc.splitTextToSize(bulletPoint, pageWidth - 2 * margin - 10);
      doc.text(splitText, margin + 5, currentY);
      currentY += splitText.length * 6 + 3;
    });
  }
}