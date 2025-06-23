
import { useState } from 'react';
import { useConversation } from '@11labs/react';
import { toast } from '@/components/ui/use-toast';

interface RecordingState {
  isRecording: boolean;
  transcript: string;
  error: string | null;
}

export const useRecording = () => {
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    transcript: '',
    error: null,
  });

  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to ElevenLabs');
      setRecordingState(prev => ({ ...prev, isRecording: true, error: null }));
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs');
      setRecordingState(prev => ({ ...prev, isRecording: false }));
    },
    onMessage: (message) => {
      console.log('Message received:', message);
      if (message.type === 'user_transcript') {
        setRecordingState(prev => ({ 
          ...prev, 
          transcript: prev.transcript + ' ' + message.message 
        }));
      }
    },
    onError: (error) => {
      console.error('ElevenLabs error:', error);
      setRecordingState(prev => ({ 
        ...prev, 
        error: error.message || 'Recording error occurred',
        isRecording: false 
      }));
      toast({
        title: "Recording Error",
        description: error.message || 'An error occurred during recording',
        variant: "destructive",
      });
    },
  });

  const startRecording = async (agentId: string) => {
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Start the conversation with ElevenLabs
      await conversation.startSession({ agentId });
      
      setRecordingState(prev => ({ ...prev, transcript: '', error: null }));
      
      toast({
        title: "Recording Started",
        description: "Speak now to record your meeting recap",
      });
    } catch (error) {
      console.error('Failed to start recording:', error);
      setRecordingState(prev => ({ 
        ...prev, 
        error: 'Failed to start recording. Please check microphone permissions.',
        isRecording: false 
      }));
      toast({
        title: "Recording Failed",
        description: "Please check your microphone permissions and try again",
        variant: "destructive",
      });
    }
  };

  const stopRecording = async () => {
    try {
      await conversation.endSession();
      toast({
        title: "Recording Stopped",
        description: "Your meeting recap has been recorded",
      });
    } catch (error) {
      console.error('Failed to stop recording:', error);
      toast({
        title: "Error",
        description: "Failed to stop recording properly",
        variant: "destructive",
      });
    }
  };

  return {
    ...recordingState,
    startRecording,
    stopRecording,
    conversationStatus: conversation.status,
  };
};
