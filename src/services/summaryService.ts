
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

    const prompt = `Please analyze the following meeting transcript and provide:

1. A key summary in exactly 2 sentences maximum
2. Action items for the user (if any)
3. Suggested follow-up meeting dates/times (if applicable)

Format your response as JSON with this structure:
{
  "summary": "Two sentence summary here.",
  "actionItems": ["Action item 1", "Action item 2"],
  "followUpSuggestions": ["Suggestion 1", "Suggestion 2"]
}

Transcript:
${transcript}`;

    try {
      const response = await this.openai!.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that summarizes meeting transcripts. Always respond with valid JSON only.'
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
