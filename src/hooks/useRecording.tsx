
import { useState, useRef } from 'react';
import { toast } from '@/hooks/use-toast';

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
  const recognitionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      console.log('Starting recording...');
      
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
      
      // Set up MediaRecorder for audio recording
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Set up Speech Recognition with better error handling
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.maxAlternatives = 1;
        
        recognitionRef.current.onstart = () => {
          console.log('Speech recognition started');
        };
        
        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }
          
          setRecordingState(prev => ({
            ...prev,
            transcript: prev.transcript + finalTranscript + interimTranscript,
            error: null
          }));
        };
        
        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          
          // Don't treat these as fatal errors, just log them
          if (event.error === 'audio-capture' || event.error === 'aborted') {
            console.log('Speech recognition had audio issues, but continuing with audio recording');
            // Clear the error and continue with just audio recording
            setRecordingState(prev => ({
              ...prev,
              error: null
            }));
          } else {
            setRecordingState(prev => ({
              ...prev,
              error: `Speech recognition error: ${event.error}`
            }));
          }
        };
        
        recognitionRef.current.onend = () => {
          console.log('Speech recognition ended');
          // Restart recognition if still recording
          if (recordingState.isRecording && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              console.log('Could not restart speech recognition:', e);
            }
          }
        };
        
        // Start speech recognition with error handling
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.warn('Could not start speech recognition:', e);
          toast({
            title: "Speech Recognition Unavailable",
            description: "Continuing with audio recording only. Transcription may not be available.",
          });
        }
      } else {
        console.warn('Speech recognition not supported');
        toast({
          title: "Speech Recognition Not Supported",
          description: "Your browser doesn't support speech recognition. Audio will be recorded without live transcription.",
        });
      }
      
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
      // Stop speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      
      // Stop media recorder
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      
      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      setRecordingState(prev => ({ ...prev, isRecording: false }));
      
      toast({
        title: "Recording Stopped",
        description: "Your meeting has been recorded" + (recordingState.transcript ? " and transcribed" : ""),
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
  };
};
