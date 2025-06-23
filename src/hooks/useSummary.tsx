
import { useState } from 'react';
import { summaryService } from '@/services/summaryService';
import { toast } from '@/hooks/use-toast';

interface SummaryResult {
  summary: string;
  actionItems: string[];
  followUpSuggestions: string[];
}

interface SummaryState {
  isLoading: boolean;
  result: SummaryResult | null;
  error: string | null;
}

export const useSummary = () => {
  const [summaryState, setSummaryState] = useState<SummaryState>({
    isLoading: false,
    result: null,
    error: null,
  });

  const summarizeTranscript = async (transcript: string) => {
    if (!transcript?.trim()) {
      toast({
        title: "No Transcript",
        description: "No transcript available to summarize",
        variant: "destructive",
      });
      return;
    }

    setSummaryState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null 
    }));

    try {
      toast({
        title: "Generating Summary",
        description: "Analyzing transcript with OpenAI...",
      });

      const result = await summaryService.summarizeTranscript(transcript);
      
      setSummaryState(prev => ({ 
        ...prev, 
        isLoading: false, 
        result,
        error: null
      }));

      toast({
        title: "Summary Complete",
        description: "Meeting summary generated successfully",
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate summary';
      setSummaryState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage
      }));

      toast({
        title: "Summary Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const clearSummary = () => {
    setSummaryState({
      isLoading: false,
      result: null,
      error: null,
    });
  };

  return {
    ...summaryState,
    summarizeTranscript,
    clearSummary,
  };
};
