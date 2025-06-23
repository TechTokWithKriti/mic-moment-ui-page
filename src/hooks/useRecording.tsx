
import { useState, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import { ElevenLabsClient } from 'elevenlabs';

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

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const elevenLabsClient = useRef<ElevenLabsClient | null>(null);
  const mimeTypeRef = useRef<string>('');

  // Initialize ElevenLabs client
  const initializeElevenLabs = () => {
    const apiKey = localStorage.getItem('elevenlabs_api_key');
    if (!apiKey) {
      throw new Error('ElevenLabs API key not found. Please add your API key to localStorage with key "elevenlabs_api_key"');
    }
    elevenLabsClient.current = new ElevenLabsClient({ apiKey });
  };

  // Get supported MIME type for MediaRecorder
  const getSupportedMimeType = () => {
    const mimeTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/mpeg',
      'audio/wav',
      'audio/ogg;codecs=opus',
      'audio/ogg'
    ];

    for (const mimeType of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        console.log('Using supported MIME type:', mimeType);
        return mimeType;
      }
    }
    
    console.log('No supported MIME type found, using default');
    return '';
  };

  const startRecording = async () => {
    try {
      console.log('Starting recording...');
      
      // Initialize ElevenLabs client
      try {
        initializeElevenLabs();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to initialize ElevenLabs';
        setRecordingState(prev => ({ 
          ...prev, 
          error: errorMessage,
          isRecording: false 
        }));
        toast({
          title: "Setup Required",
          description: "Please add your ElevenLabs API key to localStorage first",
          variant: "destructive",
        });
        return;
      }
      
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      console.log('Microphone access granted');
      streamRef.current = stream;
      
      // Get supported MIME type
      const supportedMimeType = getSupportedMimeType();
      mimeTypeRef.current = supportedMimeType;
      
      // Set up MediaRecorder for audio recording
      if (supportedMimeType) {
        mediaRecorderRef.current = new MediaRecorder(stream, {
          mimeType: supportedMimeType
        });
      } else {
        mediaRecorderRef.current = new MediaRecorder(stream);
      }
      
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      // Start recording
      mediaRecorderRef.current.start(1000); // Collect data every second
      setRecordingState(prev => ({ 
        ...prev, 
        isRecording: true, 
        error: null,
        transcript: ''
      }));
      
      toast({
        title: "Recording Started",
        description: "Speak now to record your meeting",
      });
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start recording. Please check microphone permissions.';
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
      console.log('Stopping recording...');
      
      // Stop media recorder
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        
        // Wait for the final data to be available
        await new Promise<void>((resolve) => {
          if (mediaRecorderRef.current) {
            mediaRecorderRef.current.onstop = () => {
              resolve();
            };
          }
        });
      }
      
      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      setRecordingState(prev => ({ ...prev, isRecording: false }));
      
      // Process the recorded audio with ElevenLabs
      if (audioChunksRef.current.length > 0 && elevenLabsClient.current) {
        toast({
          title: "Processing Recording",
          description: "Transcribing your meeting with ElevenLabs...",
        });
        
        try {
          // Create audio blob from chunks with the MIME type that was used
          const audioBlob = new Blob(audioChunksRef.current, { 
            type: mimeTypeRef.current || 'audio/webm' 
          });
          
          // Convert to the format ElevenLabs expects
          const fileExtension = mimeTypeRef.current.includes('webm') ? 'webm' : 
                               mimeTypeRef.current.includes('mp4') ? 'mp4' :
                               mimeTypeRef.current.includes('wav') ? 'wav' :
                               mimeTypeRef.current.includes('ogg') ? 'ogg' : 'webm';
          
          const audioFile = new File([audioBlob], `recording.${fileExtension}`, { 
            type: mimeTypeRef.current || 'audio/webm' 
          });
          
          // Transcribe with ElevenLabs using the correct API format
          const transcription = await elevenLabsClient.current.speechToText.convert({
            file: audioFile,
            model_id: 'eleven_multilingual_v2'
          });
          
          setRecordingState(prev => ({ 
            ...prev, 
            transcript: transcription.text || '',
            error: null
          }));
          
          toast({
            title: "Recording Complete",
            description: "Your meeting has been recorded and transcribed successfully",
          });
          
        } catch (transcriptionError) {
          console.error('Transcription failed:', transcriptionError);
          const errorMessage = transcriptionError instanceof Error ? transcriptionError.message : 'Failed to transcribe audio';
          setRecordingState(prev => ({ 
            ...prev, 
            error: `Transcription failed: ${errorMessage}`
          }));
          
          toast({
            title: "Transcription Failed",
            description: "Recording saved but transcription failed. Check your API key and try again.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Recording Stopped",
          description: "Your meeting has been recorded (no audio data to transcribe)",
        });
      }
      
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
  };
};
