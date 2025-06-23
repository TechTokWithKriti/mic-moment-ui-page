
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

  async generateEmail(participantName: string, summary: string, actionItems: string[], followUpSuggestions: string[]): Promise<EmailContent> {
    if (!this.openai) {
      this.initializeOpenAI();
    }

    const prompt = `Generate a professional follow-up email based on this meeting information:

Participant: ${participantName}
Meeting Summary: ${summary}
Action Items: ${actionItems.join(', ')}
Follow-up Suggestions: ${followUpSuggestions.join(', ')}

Create a warm, professional email that:
1. References the meeting we just had
2. Summarizes key points discussed
3. Mentions any action items or next steps
4. Suggests a follow-up meeting if appropriate
5. Keep it concise and friendly

Format your response as JSON with this structure:
{
  "subject": "Follow-up from our meeting - [Brief topic]",
  "body": "Email body content here"
}`;

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
