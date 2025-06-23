
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useRecording } from '@/hooks/useRecording';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RecordingButtonProps {
  participantName: string;
  onTranscriptComplete?: (transcript: string) => void;
}

const RecordingButton = ({ participantName, onTranscriptComplete }: RecordingButtonProps) => {
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const { isRecording, transcript, error, startRecording, stopRecording, conversationStatus } = useRecording();

  const handleRecordClick = async () => {
    if (!isRecording) {
      if (!apiKey) {
        setShowApiKeyInput(true);
        return;
      }
      // For now, we'll use a placeholder agent ID
      // In production, you'd have your actual ElevenLabs agent ID
      await startRecording('your-agent-id-here');
    } else {
      await stopRecording();
      if (transcript && onTranscriptComplete) {
        onTranscriptComplete(transcript);
      }
    }
  };

  const handleApiKeySubmit = async () => {
    if (apiKey.trim()) {
      setShowApiKeyInput(false);
      // Store API key temporarily (in production, this should be in Supabase secrets)
      localStorage.setItem('elevenlabs_api_key', apiKey);
      await startRecording('your-agent-id-here');
    }
  };

  if (showApiKeyInput) {
    return (
      <div className="flex flex-col gap-2 p-3 border rounded-lg bg-gray-50">
        <Label htmlFor="api-key" className="text-xs">ElevenLabs API Key</Label>
        <Input
          id="api-key"
          type="password"
          placeholder="Enter your ElevenLabs API key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="text-xs"
        />
        <div className="flex gap-1">
          <Button size="sm" onClick={handleApiKeySubmit} className="text-xs">
            Start Recording
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowApiKeyInput(false)} className="text-xs">
            Cancel
          </Button>
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
        disabled={conversationStatus === 'connecting'}
        className={`flex items-center gap-2 border-gray-300 hover:bg-gray-50 ${
          isRecording ? 'bg-red-50 border-red-300 text-red-700' : ''
        }`}
      >
        {conversationStatus === 'connecting' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isRecording ? (
          <MicOff className="w-4 h-4" />
        ) : (
          <Mic className="w-4 h-4" />
        )}
        {isRecording ? 'Stop' : 'Record'}
      </Button>
      
      {transcript && (
        <div className="text-xs text-gray-600 max-w-xs text-center">
          Recording: {transcript.substring(0, 50)}...
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
