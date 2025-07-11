/**
 * Notification sound utility for AI message notifications
 * Creates a subtle, modern digital sound using Web Audio API
 */

class NotificationSound {
  private audioContext: AudioContext | null = null;

  constructor() {
    // Initialize AudioContext only when needed to avoid autoplay issues
    this.initializeAudioContext();
  }

  private initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  /**
   * Play a subtle notification sound for AI messages
   * Creates a modern, digital-sounding tone sequence
   */
  async playAIMessageSound() {
    if (!this.audioContext) {
      this.initializeAudioContext();
      if (!this.audioContext) return;
    }

    try {
      // Resume audio context if it's suspended (required by browsers)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const currentTime = this.audioContext.currentTime;
      
      // Create a gentle two-tone notification
      this.createTone(440, currentTime, 0.15, 0.02); // A4 note
      this.createTone(554.37, currentTime + 0.1, 0.15, 0.02); // C#5 note
      
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
    }
  }

  /**
   * Create a single tone with gentle attack and decay
   */
  private createTone(frequency: number, startTime: number, duration: number, volume: number) {
    if (!this.audioContext) return;

    // Create oscillator for the tone
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    // Use a gentle sine wave for a soft, digital sound
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, startTime);
    
    // Create a gentle envelope (attack, sustain, release)
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.02); // Quick attack
    gainNode.gain.setValueAtTime(volume, startTime + 0.05); // Brief sustain
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration); // Gentle decay
    
    // Connect the audio graph
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Schedule the sound
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }

  /**
   * Play an alternative subtle notification for philosopher mode
   */
  async playPhilosopherSound() {
    if (!this.audioContext) {
      this.initializeAudioContext();
      if (!this.audioContext) return;
    }

    try {
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const currentTime = this.audioContext.currentTime;
      
      // Create a more contemplative three-tone sequence
      this.createTone(369.99, currentTime, 0.12, 0.015); // F#4
      this.createTone(440, currentTime + 0.08, 0.12, 0.015); // A4
      this.createTone(523.25, currentTime + 0.16, 0.12, 0.015); // C5
      
    } catch (error) {
      console.warn('Failed to play philosopher notification sound:', error);
    }
  }
}

// Create a singleton instance
export const notificationSound = new NotificationSound();

// Convenience functions
export const playAIMessageNotification = () => notificationSound.playAIMessageSound();
export const playPhilosopherNotification = () => notificationSound.playPhilosopherSound();