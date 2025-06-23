
import OpenAI from 'openai';

interface Participant {
  name: string;
  linkedinUrl: string;
  email: string;
  info: string;
}

export class ParticipantService {
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

  async generateParticipants(whoIAm: string, whoIWantToMeet: string): Promise<Participant[]> {
    if (!this.openai) {
      this.initializeOpenAI();
    }

    if (!whoIAm.trim() || !whoIWantToMeet.trim()) {
      throw new Error('Both "Who I Am" and "Who I Want to Meet" fields are required');
    }

    const prompt = `Based on this profile and networking goals, generate 5-7 realistic participants for a professional networking event:

Who I Am: ${whoIAm}
Who I Want to Meet: ${whoIWantToMeet}

Generate participants who would be highly relevant for this person to meet. Each participant should:
1. Be someone who matches or complements their networking goals
2. Have realistic professional backgrounds
3. Have diverse roles/industries but all relevant to the user's goals
4. Include realistic LinkedIn URLs and email addresses (use realistic but fictional domains)

Format your response as JSON with this structure:
{
  "participants": [
    {
      "name": "Full Name",
      "linkedinUrl": "https://linkedin.com/in/realistic-handle",
      "email": "name@company.com",
      "info": "Job Title at Company\\nWants to meet: [What they're looking for that might align with the user]"
    }
  ]
}

Make sure all participants are highly relevant to what the user wants to meet.`;

    try {
      const response = await this.openai!.chat.completions.create({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'You are a professional networking assistant that generates realistic participant profiles for networking events. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const result = JSON.parse(content);
      return result.participants || [];
    } catch (error) {
      console.error('OpenAI participant generation failed:', error);
      throw new Error(`Failed to generate participants: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const participantService = new ParticipantService();
