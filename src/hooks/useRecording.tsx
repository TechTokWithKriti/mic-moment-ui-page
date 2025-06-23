
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
      
      // Request microphone permission with detailed constraints
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
          channelCount: 1
        } 
      });
      console.log('Microphone access granted');
      console.log('Audio stream tracks:', stream.getAudioTracks().length);
      console.log('Audio track settings:', stream.getAudioTracks()[0]?.getSettings());
      streamRef.current = stream;
      
      // Get supported MIME type
      const supportedMimeType = getSupportedMimeType();
      mimeTypeRef.current = supportedMimeType;
      
      // Set up MediaRecorder for audio recording
      const mediaRecorderOptions: MediaRecorderOptions = {};
      if (supportedMimeType) {
        mediaRecorderOptions.mimeType = supportedMimeType;
      }
      
      mediaRecorderRef.current = new MediaRecorder(stream, mediaRecorderOptions);
      console.log('MediaRecorder created with state:', mediaRecorderRef.current.state);
      console.log('MediaRecorder MIME type:', mediaRecorderRef.current.mimeType);
      
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        console.log('Data available event fired:');
        console.log('- Event data size:', event.data.size, 'bytes');
        console.log('- Event data type:', event.data.type);
        console.log('- Current chunks count before:', audioChunksRef.current.length);
        
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log('- Chunk added! New total chunks:', audioChunksRef.current.length);
        } else {
          console.log('- No data in event, chunk not added');
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        console.log('MediaRecorder stop event fired');
        console.log('Final chunks count:', audioChunksRef.current.length);
        audioChunksRef.current.forEach((chunk, index) => {
          console.log(`Chunk ${index}: ${chunk.size} bytes, type: ${chunk.type}`);
        });
      };
      
      mediaRecorderRef.current.onstart = () => {
        console.log('MediaRecorder start event fired');
      };
      
      mediaRecorderRef.current.onerror = (event) => {
        console.error('MediaRecorder error:', event);
      };
      
      // Start recording with very frequent data collection
      console.log('Starting MediaRecorder...');
      mediaRecorderRef.current.start(250); // Collect data every 250ms
      console.log('MediaRecorder start() called, state:', mediaRecorderRef.current.state);
      
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
      console.log('Current MediaRecorder state:', mediaRecorderRef.current?.state);
      console.log('Chunks before stopping:', audioChunksRef.current.length);
      
      // Stop media recorder
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        console.log('Calling MediaRecorder.stop()...');
        mediaRecorderRef.current.stop();
        
        // Wait for the final data to be available with timeout
        await new Promise<void>((resolve, reject) => {
          if (mediaRecorderRef.current) {
            const timeout = setTimeout(() => {
              console.log('Timeout waiting for onstop event');
              resolve();
            }, 5000);
            
            mediaRecorderRef.current.onstop = () => {
              clearTimeout(timeout);
              console.log('Recording stopped, chunks collected:', audioChunksRef.current.length);
              resolve();
            };
          } else {
            resolve();
          }
        });
      }
      
      // Stop all tracks
      if (streamRef.current) {
        console.log('Stopping stream tracks...');
        streamRef.current.getTracks().forEach(track => {
          console.log('Stopping track:', track.kind, track.enabled, track.readyState);
          track.stop();
        });
        streamRef.current = null;
      }
      
      setRecordingState(prev => ({ ...prev, isRecording: false }));
      
      console.log('Final audio chunks analysis:');
      console.log('Total chunks:', audioChunksRef.current.length);
      let totalSize = 0;
      audioChunksRef.current.forEach((chunk, index) => {
        console.log(`Chunk ${index}: ${chunk.size} bytes, type: ${chunk.type}`);
        totalSize += chunk.size;
      });
      console.log('Total audio data size:', totalSize, 'bytes');
      
      // Process the recorded audio with ElevenLabs
      if (audioChunksRef.current.length > 0 && elevenLabsClient.current) {
        console.log('Processing audio chunks:', audioChunksRef.current.length);
        
        toast({
          title: "Processing Recording",
          description: "Transcribing your meeting with ElevenLabs...",
        });
        
        try {
          // Create audio blob from chunks with the MIME type that was used
          const audioBlob = new Blob(audioChunksRef.current, { 
            type: mimeTypeRef.current || 'audio/webm' 
          });
          
          console.log('Audio blob created:');
          console.log('- Size:', audioBlob.size, 'bytes');
          console.log('- Type:', audioBlob.type);
          
          if (audioBlob.size === 0) {
            throw new Error('No audio data recorded - blob size is 0');
          }
          
          if (audioBlob.size < 1000) {
            console.warn('Very small audio file, might not contain speech');
          }
          
          // Convert to the format ElevenLabs expects
          const fileExtension = mimeTypeRef.current.includes('webm') ? 'webm' : 
                               mimeTypeRef.current.includes('mp4') ? 'mp4' :
                               mimeTypeRef.current.includes('wav') ? 'wav' :
                               mimeTypeRef.current.includes('ogg') ? 'ogg' : 'webm';
          
          const audioFile = new File([audioBlob], `recording.${fileExtension}`, { 
            type: mimeTypeRef.current || 'audio/webm' 
          });
          
          console.log('Sending to ElevenLabs:');
          console.log('- File name:', audioFile.name);
          console.log('- File size:', audioFile.size);
          console.log('- File type:', audioFile.type);
          
          // Transcribe with ElevenLabs using the correct API format and valid model
          const transcription = await elevenLabsClient.current.speechToText.convert({
            file: audioFile,
            model_id: 'scribe_v1'
          });
          
          console.log('ElevenLabs response:', transcription);
          
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
        console.log('No audio chunks available for transcription');
        console.log('Chunks length:', audioChunksRef.current.length);
        console.log('ElevenLabs client available:', !!elevenLabsClient.current);
        
        toast({
          title: "No Audio Recorded",
          description: "No audio data was captured. Please try speaking closer to the microphone and ensure microphone permissions are granted.",
          variant: "destructive",
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
