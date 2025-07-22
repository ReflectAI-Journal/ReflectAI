import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, VolumeX, Square, Play } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';

interface VoiceControlsProps {
  onVoiceMessage: (text: string) => void;
  onVoiceToggle: (enabled: boolean) => void;
  isVoiceEnabled: boolean;
  isLoading?: boolean;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  onVoiceMessage,
  onVoiceToggle,
  isVoiceEnabled,
  isLoading = false
}) => {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check if user has Pro or Elite plan for voice features
  const hasVoiceAccess = user?.subscriptionPlan === 'pro' || user?.subscriptionPlan === 'elite' || user?.isVipUser;

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (speechSynthesisRef.current) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processAudioBlob(audioBlob);
        
        // Stop all tracks to free up the microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const processAudioBlob = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');

      const response = await fetch('/api/speech/transcribe', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to transcribe audio');
      }

      const { text } = await response.json();
      if (text && text.trim()) {
        onVoiceMessage(text);
      }
    } catch (error) {
      console.error('Error processing audio:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const speakText = (text: string) => {
    if (!isVoiceEnabled) return;

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    
    // Try to use a more natural voice if available
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Natural') || 
      voice.name.includes('Enhanced') ||
      voice.name.includes('Premium') ||
      (voice.lang.startsWith('en') && voice.localService)
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    speechSynthesisRef.current = utterance;
    speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    speechSynthesis.cancel();
  };

  // Auto-speak AI responses when voice is enabled
  useEffect(() => {
    if (isVoiceEnabled && hasVoiceAccess) {
      // This would be called from the parent component when new AI messages arrive
      // We'll implement this in the ChatContainer
    }
  }, [isVoiceEnabled, hasVoiceAccess]);

  if (!hasVoiceAccess) {
    return (
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <VolumeX className="h-4 w-4" />
        <span>Voice features available on Pro & Elite plans</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Voice Toggle */}
      <Button
        variant={isVoiceEnabled ? "default" : "outline"}
        size="sm"
        onClick={() => onVoiceToggle(!isVoiceEnabled)}
        disabled={isLoading}
        className="flex items-center space-x-1"
        title={isVoiceEnabled ? "Disable voice responses" : "Enable voice responses"}
      >
        {isVoiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        <span className="hidden sm:inline">
          {isVoiceEnabled ? "Voice On" : "Voice Off"}
        </span>
      </Button>

      {/* Recording Button */}
      <Button
        variant={isRecording ? "destructive" : "outline"}
        size="sm"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isLoading || isProcessing}
        className="flex items-center space-x-1"
        title={isRecording ? "Stop recording" : "Start voice recording"}
      >
        {isProcessing ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : isRecording ? (
          <Square className="h-4 w-4 fill-current" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">
          {isProcessing ? "Processing..." : isRecording ? "Stop" : "Record"}
        </span>
      </Button>

      {/* Stop Speaking Button */}
      {speechSynthesis.speaking && (
        <Button
          variant="ghost"
          size="sm"
          onClick={stopSpeaking}
          className="flex items-center space-x-1"
          title="Stop speaking"
        >
          <Square className="h-4 w-4" />
          <span className="hidden sm:inline">Stop</span>
        </Button>
      )}
    </div>
  );
};

// Hook to provide text-to-speech functionality to parent components
export const useTextToSpeech = () => {
  const speakText = (text: string) => {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Natural') || 
      voice.name.includes('Enhanced') ||
      (voice.lang.startsWith('en') && voice.localService)
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    speechSynthesis.cancel();
  };

  return { speakText, stopSpeaking, isSpeaking: speechSynthesis.speaking };
};