
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic, MicOff, Key } from 'lucide-react';
import { useRecording } from '@/hooks/useRecording';

interface RecordingButtonProps {
  participantName: string;
  onTranscriptComplete?: (transcript: string) => void;
}

const RecordingButton = ({ participantName, onTranscriptComplete }: RecordingButtonProps) => {
  const { isRecording, transcript, error, startRecording, stopRecording } = useRecording();
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('elevenlabs_api_key') || '');
  const [showApiKeyInput, setShowApiKeyInput] = useState(!localStorage.getItem('elevenlabs_api_key'));

  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      localStorage.setItem('elevenlabs_api_key', apiKey.trim());
      setShowApiKeyInput(false);
    }
  };

  const handleRecordClick = async () => {
    if (!isRecording) {
      await startRecording();
    } else {
      await stopRecording();
      if (transcript && onTranscriptComplete) {
        onTranscriptComplete(transcript);
      }
    }
  };

  if (showApiKeyInput) {
    return (
      <div className="flex flex-col items-center gap-2 p-4 border rounded-lg bg-gray-50">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Key className="w-4 h-4" />
          <span>ElevenLabs API Key Required</span>
        </div>
        <div className="flex gap-2 w-full max-w-xs">
          <Input
            type="password"
            placeholder="Enter your ElevenLabs API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="flex-1"
          />
          <Button 
            size="sm" 
            onClick={handleApiKeySubmit}
            disabled={!apiKey.trim()}
          >
            Save
          </Button>
        </div>
        <div className="text-xs text-gray-500 text-center">
          Get your API key from{' '}
          <a 
            href="https://elevenlabs.io/app/speech-synthesis/text-to-speech" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            ElevenLabs
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleRecordClick}
        className={`flex items-center gap-2 border-gray-300 hover:bg-gray-50 ${
          isRecording ? 'bg-red-50 border-red-300 text-red-700' : ''
        }`}
      >
        {isRecording ? (
          <MicOff className="w-4 h-4" />
        ) : (
          <Mic className="w-4 h-4" />
        )}
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowApiKeyInput(true)}
        className="text-xs text-gray-500 hover:text-gray-700"
      >
        <Key className="w-3 h-3 mr-1" />
        Change API Key
      </Button>
      
      {transcript && (
        <div className="text-xs text-gray-600 max-w-xs text-center">
          Transcript: {transcript.substring(0, 100)}...
        </div>
      )}
      
      {error && (
        <div className="text-xs text-red-600 max-w-xs text-center">
          {error}
        </div>
      )}
    </div>
  );
};

export default RecordingButton;
