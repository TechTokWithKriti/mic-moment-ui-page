
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
      // Handle the message based on its actual structure
      if (message && typeof message === 'object' && 'message' in message) {
        setRecordingState(prev => ({ 
          ...prev, 
          transcript: prev.transcript + ' ' + message.message 
        }));
      }
    },
    onError: (error) => {
      console.error('ElevenLabs error:', error);
      const errorMessage = typeof error === 'string' ? error : 'Recording error occurred';
      setRecordingState(prev => ({ 
        ...prev, 
        error: errorMessage,
        isRecording: false 
      }));
      toast({
        title: "Recording Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const startRecording = async (agentId: string) => {
    try {
      console.log('Starting recording with agent ID:', agentId);
      
      // Request microphone permission first
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Microphone access granted');
      
      // Stop the stream since ElevenLabs will handle it
      stream.getTracks().forEach(track => track.stop());
      
      // Get API key from localStorage
      const apiKey = localStorage.getItem('elevenlabs_api_key');
      if (!apiKey) {
        throw new Error('ElevenLabs API key not found. Please enter your API key.');
      }
      
      // Generate signed URL using the API key
      const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`, {
        method: 'GET',
        headers: {
          'xi-api-key': apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get signed URL: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Got signed URL:', data.signed_url);
      
      // Start the conversation with the signed URL
      await conversation.startSession({ url: data.signed_url });
      
      setRecordingState(prev => ({ ...prev, transcript: '', error: null }));
      
      toast({
        title: "Recording Started",
        description: "Speak now to record your meeting recap",
      });
    } catch (error) {
      console.error('Failed to start recording:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start recording. Please check microphone permissions and API key.';
      setRecordingState(prev => ({ 
        ...prev, 
        error: errorMessage,
        isRecording: false 
      }));
      toast({
        title: "Recording Failed",
        description: errorMessage,
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
