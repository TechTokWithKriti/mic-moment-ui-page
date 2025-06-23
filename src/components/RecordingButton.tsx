
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
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('elevenlabs_api_key') || '');
  const [agentId, setAgentId] = useState('');
  const [showSetupForm, setShowSetupForm] = useState(false);
  const { isRecording, transcript, error, startRecording, stopRecording, conversationStatus } = useRecording();

  const handleRecordClick = async () => {
    if (!isRecording) {
      const storedApiKey = localStorage.getItem('elevenlabs_api_key');
      if (!storedApiKey || !agentId) {
        setShowSetupForm(true);
        return;
      }
      await startRecording(agentId);
    } else {
      await stopRecording();
      if (transcript && onTranscriptComplete) {
        onTranscriptComplete(transcript);
      }
    }
  };

  const handleSetupSubmit = async () => {
    if (apiKey.trim() && agentId.trim()) {
      localStorage.setItem('elevenlabs_api_key', apiKey);
      setShowSetupForm(false);
      await startRecording(agentId);
    }
  };

  if (showSetupForm) {
    return (
      <div className="flex flex-col gap-3 p-4 border rounded-lg bg-gray-50 min-w-[300px]">
        <div className="text-sm font-medium text-gray-900">ElevenLabs Setup</div>
        
        <div className="space-y-2">
          <Label htmlFor="api-key" className="text-xs">API Key</Label>
          <Input
            id="api-key"
            type="password"
            placeholder="Enter your ElevenLabs API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="text-xs"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="agent-id" className="text-xs">Agent ID</Label>
          <Input
            id="agent-id"
            type="text"
            placeholder="Enter your ElevenLabs agent ID"
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            className="text-xs"
          />
        </div>
        
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSetupSubmit} className="text-xs flex-1">
            Start Recording
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowSetupForm(false)} className="text-xs">
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
