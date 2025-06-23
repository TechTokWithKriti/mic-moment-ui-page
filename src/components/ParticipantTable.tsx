
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Linkedin, Mail, Calendar } from 'lucide-react';
import RecordingButton from './RecordingButton';
import { useEmail } from '@/hooks/useEmail';

interface Participant {
  name: string;
  linkedinUrl: string;
  email: string;
  info: string;
}

interface ParticipantTableProps {
  participants: Participant[];
}

const ParticipantTable = ({ participants }: ParticipantTableProps) => {
  const [summaries, setSummaries] = useState<Record<string, any>>({});
  const { isGenerating, content: emailContent, generateEmail, clearEmail, createMeetingInvite } = useEmail();
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
    const participant = participants.find(p => p.name === participantName);
    
    if (!participantSummary) {
      // If no summary available, create a generic email
      await generateEmail(
        participantName,
        null,
        [],
        [],
        participant?.info
      );
    } else {
      await generateEmail(
        participantName,
        participantSummary.summary,
        participantSummary.actionItems,
        participantSummary.followUpSuggestions,
        participant?.info
      );
    }
    
    setSelectedParticipant(participantName);
  };

  const handleCreateMeeting = () => {
    if (emailContent && selectedParticipant) {
      const participant = participants.find(p => p.name === selectedParticipant);
      if (participant) {
        createMeetingInvite(emailContent, participant.email);
        clearEmail();
        setSelectedParticipant('');
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-4 px-6 font-semibold text-gray-900">Name</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-900">Contact</th>
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
                  <div className="flex items-center gap-3">
                    <a
                      href={participant.linkedinUrl}
                      className="text-blue-600 hover:text-blue-800 flex items-center"
                      title="LinkedIn Profile"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                    <a
                      href={`mailto:${participant.email}`}
                      className="text-gray-600 hover:text-gray-800 flex items-center"
                      title={participant.email}
                    >
                      <Mail className="w-5 h-5" />
                    </a>
                  </div>
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
                        <Calendar className="w-4 h-4 mr-2" />
                        {isGenerating && selectedParticipant === participant.name ? 'Generating...' : 'Book Call'}
                      </Button>
                    </DialogTrigger>
                    
                    {emailContent && selectedParticipant === participant.name && (
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Meeting Invite for {participant.name}</DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Subject:</label>
                            <p className="mt-1 p-2 bg-gray-50 rounded border text-sm">{emailContent.subject}</p>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-gray-700">Meeting Description:</label>
                            <div className="mt-1 p-3 bg-gray-50 rounded border text-sm whitespace-pre-wrap max-h-64 overflow-y-auto">
                              {emailContent.body}
                            </div>
                          </div>
                          
                          <div className="bg-blue-50 p-3 rounded border border-blue-200">
                            <p className="text-sm text-blue-800">
                              <strong>Meeting Details:</strong><br />
                              Invitee: {participant.email}<br />
                              Duration: 15 minutes<br />
                              Suggested Time: Next week at 5:00 PM EST
                            </p>
                          </div>
                          
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={() => { clearEmail(); setSelectedParticipant(''); }}>
                              Cancel
                            </Button>
                            <Button onClick={handleCreateMeeting} className="bg-blue-600 hover:bg-blue-700">
                              <Calendar className="w-4 h-4 mr-2" />
                              Create Meeting Invite
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
