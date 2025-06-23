
import { useState } from 'react';
import { emailService } from '@/services/emailService';
import { toast } from '@/hooks/use-toast';

interface EmailContent {
  subject: string;
  body: string;
}

interface EmailState {
  isGenerating: boolean;
  content: EmailContent | null;
  error: string | null;
}

export const useEmail = () => {
  const [emailState, setEmailState] = useState<EmailState>({
    isGenerating: false,
    content: null,
    error: null,
  });

  const generateEmail = async (participantName: string, summary: string, actionItems: string[], followUpSuggestions: string[]) => {
    setEmailState(prev => ({ 
      ...prev, 
      isGenerating: true, 
      error: null 
    }));

    try {
      toast({
        title: "Generating Email",
        description: "Creating personalized follow-up email...",
      });

      const content = await emailService.generateEmail(participantName, summary, actionItems, followUpSuggestions);
      
      setEmailState(prev => ({ 
        ...prev, 
        isGenerating: false, 
        content,
        error: null
      }));

      toast({
        title: "Email Generated",
        description: "Follow-up email is ready to send",
      });

      return content;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate email';
      setEmailState(prev => ({ 
        ...prev, 
        isGenerating: false, 
        error: errorMessage
      }));

      toast({
        title: "Email Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const clearEmail = () => {
    setEmailState({
      isGenerating: false,
      content: null,
      error: null,
    });
  };

  const scheduleEmail = (emailContent: EmailContent) => {
    // Create mailto link with pre-filled content
    const subject = encodeURIComponent(emailContent.subject);
    const body = encodeURIComponent(emailContent.body);
    const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
    
    // Open the default email client
    window.open(mailtoLink, '_blank');
    
    toast({
      title: "Email Opened",
      description: "Your default email client should open with the pre-filled email",
    });
  };

  return {
    ...emailState,
    generateEmail,
    clearEmail,
    scheduleEmail,
  };
};
