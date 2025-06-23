
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

  const generateEmail = async (participantName: string, summary: string | null, actionItems: string[], followUpSuggestions: string[], participantInfo?: string) => {
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

      const content = await emailService.generateEmail(participantName, summary, actionItems, followUpSuggestions, participantInfo);
      
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

  const createMeetingInvite = (emailContent: EmailContent, participantEmail: string) => {
    // Create Google Calendar meeting invite URL
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 7); // Next week
    startDate.setHours(17, 0, 0, 0); // 5 PM
    
    const endDate = new Date(startDate);
    endDate.setMinutes(15); // 15 minute meeting
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(emailContent.subject)}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=${encodeURIComponent(emailContent.body)}&add=${encodeURIComponent(participantEmail)}`;
    
    // Open Google Calendar
    window.open(googleCalendarUrl, '_blank');
    
    toast({
      title: "Meeting Invite Created",
      description: "Google Calendar should open with the pre-filled meeting invite",
    });
  };

  return {
    ...emailState,
    generateEmail,
    clearEmail,
    createMeetingInvite,
  };
};
