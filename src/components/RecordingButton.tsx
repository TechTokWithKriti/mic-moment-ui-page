
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Mic, MicOff, Key, FileText, Brain } from 'lucide-react';
import { useRecording } from '@/hooks/useRecording';
import { useSummary } from '@/hooks/useSummary';

interface RecordingButtonProps {
  participantName: string;
  onTranscriptComplete?: (transcript: string) => void;
}

const RecordingButton = ({ participantName, onTranscriptComplete }: RecordingButtonProps) => {
  const { isRecording, transcript, error, startRecording, stopRecording } = useRecording();
  const { isLoading: isSummarizing, result: summary, error: summaryError, summarizeTranscript, clearSummary } = useSummary();
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('elevenlabs_api_key') || '');
  const [openaiApiKey, setOpenaiApiKey] = useState(() => localStorage.getItem('openai_api_key') || '');
  const [showApiKeyInput, setShowApiKeyInput] = useState(!localStorage.getItem('elevenlabs_api_key'));
  const [showOpenAIKeyInput, setShowOpenAIKeyInput] = useState(false);

  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      localStorage.setItem('elevenlabs_api_key', apiKey.trim());
      setShowApiKeyInput(false);
    }
  };

  const handleOpenAIKeySubmit = () => {
    if (openaiApiKey.trim()) {
      localStorage.setItem('openai_api_key', openaiApiKey.trim());
      setShowOpenAIKeyInput(false);
    }
  };

  const handleRecordClick = async () => {
    if (!isRecording) {
      clearSummary(); // Clear previous summary when starting new recording
      await startRecording();
    } else {
      await stopRecording();
      if (transcript && onTranscriptComplete) {
        onTranscriptComplete(transcript);
      }
    }
  };

  const handleSummarize = async () => {
    if (transcript) {
      await summarizeTranscript(transcript);
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

  if (showOpenAIKeyInput) {
    return (
      <div className="flex flex-col items-center gap-2 p-4 border rounded-lg bg-gray-50">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Brain className="w-4 h-4" />
          <span>OpenAI API Key Required</span>
        </div>
        <div className="flex gap-2 w-full max-w-xs">
          <Input
            type="password"
            placeholder="Enter your OpenAI API key"
            value={openaiApiKey}
            onChange={(e) => setOpenaiApiKey(e.target.value)}
            className="flex-1"
          />
          <Button 
            size="sm" 
            onClick={handleOpenAIKeySubmit}
            disabled={!openaiApiKey.trim()}
          >
            Save
          </Button>
        </div>
        <div className="text-xs text-gray-500 text-center">
          Get your API key from{' '}
          <a 
            href="https://platform.openai.com/api-keys" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            OpenAI
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
      
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowApiKeyInput(true)}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          <Key className="w-3 h-3 mr-1" />
          ElevenLabs Key
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowOpenAIKeyInput(true)}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          <Brain className="w-3 h-3 mr-1" />
          OpenAI Key
        </Button>
      </div>

      {transcript && !isRecording && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleSummarize}
          disabled={isSummarizing}
          className="flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          {isSummarizing ? 'Summarizing...' : 'Summarize'}
        </Button>
      )}
      
      {transcript && (
        <div className="max-w-xs text-xs">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="transcript" className="border-0">
              <AccordionTrigger className="text-xs text-gray-600 py-1 hover:no-underline">
                <span className="text-left">
                  <strong>Transcript:</strong> {transcript.split('\n')[0].substring(0, 50)}...
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 text-xs pt-1">
                {transcript}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}

      {summary && (
        <div className="max-w-xs text-xs space-y-2 p-3 bg-blue-50 border border-blue-200 rounded">
          <div>
            <strong className="text-blue-800">Summary:</strong>
            <p className="text-gray-700 mt-1">{summary.summary}</p>
          </div>
          
          {summary.actionItems.length > 0 && (
            <div>
              <strong className="text-blue-800">Action Items:</strong>
              <ul className="text-gray-700 mt-1 list-disc list-inside">
                {summary.actionItems.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          
          {summary.followUpSuggestions.length > 0 && (
            <div>
              <strong className="text-blue-800">Follow-up:</strong>
              <ul className="text-gray-700 mt-1 list-disc list-inside">
                {summary.followUpSuggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {(error || summaryError) && (
        <div className="text-xs text-red-600 max-w-xs text-center">
          {error || summaryError}
        </div>
      )}
    </div>
  );
};

export default RecordingButton;
