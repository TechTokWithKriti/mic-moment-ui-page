
import OpenAI from 'openai';

interface EmailContent {
  subject: string;
  body: string;
}

export class EmailService {
  private openai: OpenAI | null = null;

  private initializeOpenAI() {
    const apiKey = localStorage.getItem('openai_api_key');
    if (!apiKey) {
      throw new Error('OpenAI API key not found. Please add your API key to localStorage with key "openai_api_key"');
    }
    this.openai = new OpenAI({ 
      apiKey,
      dangerouslyAllowBrowser: true
    });
  }

  async generateEmail(participantName: string, summary: string | null, actionItems: string[], followUpSuggestions: string[], participantInfo?: string): Promise<EmailContent> {
    if (!this.openai) {
      this.initializeOpenAI();
    }

    let prompt: string;

    if (summary && actionItems.length > 0) {
      // Case 1: We have meeting summary data
      prompt = `Generate a professional follow-up email based on this meeting information:

Participant: ${participantName}
Meeting Summary: ${summary}
Action Items: ${actionItems.join(', ')}
Follow-up Suggestions: ${followUpSuggestions.join(', ')}

Create a warm, professional email that:
1. References the meeting we just had
2. Summarizes key points discussed
3. Mentions any action items or next steps
4. Proposes scheduling a 15-minute follow-up call
5. Keep it concise and friendly

Format your response as JSON with this structure:
{
  "subject": "Follow-up from our meeting - [Brief topic]",
  "body": "Email body content here"
}`;
    } else {
      // Case 2: Generic message based on event and participant info
      prompt = `Generate a professional follow-up email for someone I met at an event:

Participant: ${participantName}
Background Info: ${participantInfo || 'Met at a networking event'}

Create a warm, professional email that:
1. Mentions we met at the event and hope they enjoyed it
2. References their background/expertise based on the info provided
3. Explains why I'd like to connect for a 15-minute call
4. Suggests scheduling a brief follow-up conversation
5. Keep it concise and friendly

Format your response as JSON with this structure:
{
  "subject": "Great meeting you at the event - Let's connect!",
  "body": "Email body content here"
}`;
    }

    try {
      const response = await this.openai!.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a professional assistant that writes follow-up emails. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 400,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const result = JSON.parse(content) as EmailContent;
      return result;
    } catch (error) {
      console.error('OpenAI email generation failed:', error);
      throw new Error(`Failed to generate email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const emailService = new EmailService();
