
import { useState } from 'react';
import { participantService } from '@/services/participantService';
import { toast } from '@/hooks/use-toast';

interface Participant {
  name: string;
  linkedinUrl: string;
  email: string;
  info: string;
}

interface ParticipantState {
  isGenerating: boolean;
  participants: Participant[];
  error: string | null;
}

export const useParticipants = () => {
  const [participantState, setParticipantState] = useState<ParticipantState>({
    isGenerating: false,
    participants: [],
    error: null,
  });

  const generateParticipants = async (whoIAm: string, whoIWantToMeet: string) => {
    if (!whoIAm.trim() || !whoIWantToMeet.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both 'Who I Am' and 'Who I Want to Meet' fields",
        variant: "destructive",
      });
      return;
    }

    setParticipantState(prev => ({ 
      ...prev, 
      isGenerating: true, 
      error: null 
    }));

    try {
      toast({
        title: "Generating Participants",
        description: "Creating personalized participant list with OpenAI...",
      });

      const participants = await participantService.generateParticipants(whoIAm, whoIWantToMeet);
      
      setParticipantState(prev => ({ 
        ...prev, 
        isGenerating: false, 
        participants,
        error: null
      }));

      toast({
        title: "Participants Generated",
        description: `Generated ${participants.length} participants matching your criteria`,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate participants';
      setParticipantState(prev => ({ 
        ...prev, 
        isGenerating: false, 
        error: errorMessage
      }));

      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const clearParticipants = () => {
    setParticipantState({
      isGenerating: false,
      participants: [],
      error: null,
    });
  };

  return {
    ...participantState,
    generateParticipants,
    clearParticipants,
  };
};
