
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { useRecording } from '@/hooks/useRecording';

interface RecordingButtonProps {
  participantName: string;
  onTranscriptComplete?: (transcript: string) => void;
}

const RecordingButton = ({ participantName, onTranscriptComplete }: RecordingButtonProps) => {
  const { isRecording, transcript, error, startRecording, stopRecording } = useRecording();

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
