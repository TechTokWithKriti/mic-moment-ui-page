
import OpenAI from 'openai';

interface SummaryResult {
  summary: string;
  actionItems: string[];
  followUpSuggestions: string[];
}

export class SummaryService {
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

  async summarizeTranscript(transcript: string): Promise<SummaryResult> {
    if (!this.openai) {
      this.initializeOpenAI();
    }

    if (!transcript || transcript.trim().length === 0) {
      throw new Error('No transcript provided for summarization');
    }

    const prompt = `Please analyze the following conversation transcript and provide:

1. A key summary in exactly 2 sentences maximum
2. Action items for the user (if any). But always show the 'Action Item' section in summary
3. Suggested follow-up meeting dates/times based on what was discussed in the conversation. If specific times or dates were mentioned, include those. If general timeframes were discussed (like "next week", "in a few days"), suggest specific options within that range. If no timing was discussed, suggest "Schedule a 15-minute follow-up call within the next week"

Context: This conversation is either between two people (user and attendee) or the user's notes about a verbal conversation with an attendee.

Format your response as JSON with this structure:
{
  "summary": "Two sentence summary here.",
  "actionItems": ["Action item 1", "Action item 2"],
  "followUpSuggestions": ["Specific suggestion based on conversation timing", "Alternative suggestion if applicable"]
}

Transcript:
${transcript}`;

    try {
      const response = await this.openai!.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that summarizes meeting transcripts and provides intelligent follow-up suggestions based on the conversation context. Pay special attention to any dates, times, or scheduling preferences mentioned. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const result = JSON.parse(content) as SummaryResult;
      return result;
    } catch (error) {
      console.error('OpenAI summarization failed:', error);
      throw new Error(`Failed to summarize transcript: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const summaryService = new SummaryService();
