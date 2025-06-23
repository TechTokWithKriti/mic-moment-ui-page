
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

  const parseTimeFromSuggestions = (followUpSuggestions: string[]) => {
    const now = new Date();
    let suggestedDate = new Date();
    let suggestedHour = 17; // Default to 5 PM
    let suggestedMinute = 0;

    // Look for specific time patterns in follow-up suggestions
    const timePatterns = [
      /(\d{1,2}):(\d{2})\s*(AM|PM)/i,
      /(\d{1,2})\s*(AM|PM)/i,
      /(morning)/i,
      /(afternoon)/i,
      /(evening)/i,
      /(tomorrow)/i,
      /(next week)/i,
      /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i
    ];

    const allSuggestions = followUpSuggestions.join(' ');

    // Check for specific times
    const timeMatch = allSuggestions.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (timeMatch) {
      suggestedHour = parseInt(timeMatch[1]);
      suggestedMinute = parseInt(timeMatch[2]);
      if (timeMatch[3].toUpperCase() === 'PM' && suggestedHour !== 12) {
        suggestedHour += 12;
      } else if (timeMatch[3].toUpperCase() === 'AM' && suggestedHour === 12) {
        suggestedHour = 0;
      }
    } else {
      // Check for general time patterns
      if (/morning/i.test(allSuggestions)) {
        suggestedHour = 10;
      } else if (/afternoon/i.test(allSuggestions)) {
        suggestedHour = 14;
      } else if (/evening/i.test(allSuggestions)) {
        suggestedHour = 18;
      }
    }

    // Check for date patterns
    if (/tomorrow/i.test(allSuggestions)) {
      suggestedDate.setDate(now.getDate() + 1);
    } else if (/next week/i.test(allSuggestions)) {
      suggestedDate.setDate(now.getDate() + 7);
    } else {
      // Check for specific days of the week
      const dayMatch = allSuggestions.match(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
      if (dayMatch) {
        const targetDay = dayMatch[1].toLowerCase();
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const targetDayIndex = days.indexOf(targetDay);
        const currentDayIndex = now.getDay();
        
        let daysToAdd = targetDayIndex - currentDayIndex;
        if (daysToAdd <= 0) {
          daysToAdd += 7; // Next occurrence of that day
        }
        
        suggestedDate.setDate(now.getDate() + daysToAdd);
      } else {
        // Default to next week
        suggestedDate.setDate(now.getDate() + 7);
      }
    }

    suggestedDate.setHours(suggestedHour, suggestedMinute, 0, 0);
    return suggestedDate;
  };

  const createMeetingInvite = (emailContent: EmailContent, participantEmail: string, followUpSuggestions: string[] = []) => {
    // Parse the suggested time from follow-up suggestions
    const startDate = parseTimeFromSuggestions(followUpSuggestions);
    
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + 15); // 15 minute meeting
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(emailContent.subject)}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=${encodeURIComponent(emailContent.body)}&add=${encodeURIComponent(participantEmail)}`;
    
    // Open Google Calendar
    window.open(googleCalendarUrl, '_blank');
    
    const dateStr = startDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const timeStr = startDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    
    toast({
      title: "Meeting Invite Created",
      description: `Google Calendar opened with meeting scheduled for ${dateStr} at ${timeStr}`,
    });
  };

  return {
    ...emailState,
    generateEmail,
    clearEmail,
    createMeetingInvite,
  };
};
