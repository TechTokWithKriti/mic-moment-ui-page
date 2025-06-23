
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Linkedin, Mail } from 'lucide-react';
import RecordingButton from './RecordingButton';
import { useEmail } from '@/hooks/useEmail';

interface Participant {
  name: string;
  linkedinUrl: string;
  info: string;
}

interface ParticipantTableProps {
  participants: Participant[];
}

const ParticipantTable = ({ participants }: ParticipantTableProps) => {
  const [summaries, setSummaries] = useState<Record<string, any>>({});
  const { isGenerating, content: emailContent, generateEmail, clearEmail, scheduleEmail } = useEmail();
  const [selectedParticipant, setSelectedParticipant] = useState<string>('');

  const handleTranscriptComplete = (participantName: string, transcript: string) => {
    console.log(`Transcript for ${participantName}:`, transcript);
  };

  const handleSummaryComplete = (participantName: string, summary: any) => {
    setSummaries(prev => ({
      ...prev,
      [participantName]: summary
    }));
  };

  const handleBookCall = async (participantName: string) => {
    const participantSummary = summaries[participantName];
    
    if (!participantSummary) {
      // If no summary available, create a basic email
      await generateEmail(
        participantName,
        "We had a great conversation and I'd love to continue our discussion.",
        ["Schedule a follow-up meeting"],
        ["Let's connect next week"]
      );
    } else {
      await generateEmail(
        participantName,
        participantSummary.summary,
        participantSummary.actionItems,
        participantSummary.followUpSuggestions
      );
    }
    
    setSelectedParticipant(participantName);
  };

  const handleSendEmail = () => {
    if (emailContent) {
      scheduleEmail(emailContent);
      clearEmail();
      setSelectedParticipant('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-4 px-6 font-semibold text-gray-900">Name</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-900">LinkedIn</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-900">Meeting Recording</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-900">Info Found</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-900">Follow-up</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {participants.map((participant, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6 font-medium text-gray-900">
                  {participant.name}
                </td>
                <td className="py-4 px-6">
                  <a
                    href={participant.linkedinUrl}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                </td>
                <td className="py-4 px-6">
                  <RecordingButton
                    participantName={participant.name}
                    onTranscriptComplete={(transcript) => 
                      handleTranscriptComplete(participant.name, transcript)
                    }
                    onSummaryComplete={(summary) =>
                      handleSummaryComplete(participant.name, summary)
                    }
                  />
                </td>
                <td className="py-4 px-6 text-gray-700 max-w-md">
                  {participant.info}
                </td>
                <td className="py-4 px-6">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleBookCall(participant.name)}
                        disabled={isGenerating}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        {isGenerating && selectedParticipant === participant.name ? 'Generating...' : 'Book Call'}
                      </Button>
                    </DialogTrigger>
                    
                    {emailContent && selectedParticipant === participant.name && (
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Follow-up Email for {participant.name}</DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Subject:</label>
                            <p className="mt-1 p-2 bg-gray-50 rounded border text-sm">{emailContent.subject}</p>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-gray-700">Email Body:</label>
                            <div className="mt-1 p-3 bg-gray-50 rounded border text-sm whitespace-pre-wrap max-h-64 overflow-y-auto">
                              {emailContent.body}
                            </div>
                          </div>
                          
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={() => { clearEmail(); setSelectedParticipant(''); }}>
                              Cancel
                            </Button>
                            <Button onClick={handleSendEmail} className="bg-blue-600 hover:bg-blue-700">
                              Open in Email Client
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    )}
                  </Dialog>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ParticipantTable;
