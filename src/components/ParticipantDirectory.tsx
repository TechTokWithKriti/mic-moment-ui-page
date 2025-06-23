
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mic } from 'lucide-react';
import ParticipantTable from './ParticipantTable';

interface Participant {
  name: string;
  linkedinUrl: string;
  email: string;
  info: string;
}

const ParticipantDirectory = () => {
  const [whoIAm, setWhoIAm] = useState('');
  const [whoIWantToMeet, setWhoIWantToMeet] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([
    {
      name: "Sarah Chen",
      linkedinUrl: "https://linkedin.com/in/sarahchen",
      email: "sarah.chen@techcorp.com",
      info: "Senior Product Manager at TechCorp\nWants to meet: Investors and potential partners"
    },
    {
      name: "Michael Rodriguez",
      linkedinUrl: "https://linkedin.com/in/michaelrodriguez",
      email: "m.rodriguez@startup.io",
      info: "Founder & CEO at StartupIO\nWants to meet: Angel investors and mentors"
    },
    {
      name: "Emily Johnson",
      linkedinUrl: "https://linkedin.com/in/emilyjohnson",
      email: "emily.johnson@consulting.com",
      info: "Management Consultant at McKinsey & Company\nWants to meet: Healthcare executives and tech founders"
    },
    {
      name: "David Kim",
      linkedinUrl: "https://linkedin.com/in/davidkim",
      email: "david.kim@airesearch.org",
      info: "Senior Data Scientist at Google AI Research\nWants to meet: AI researchers and startup founders"
    },
    {
      name: "Lisa Wang",
      linkedinUrl: "https://linkedin.com/in/lisawang",
      email: "lisa.wang@ecommerce.com",
      info: "VP of Marketing at major e-commerce platform\nWants to meet: Growth hackers and marketing professionals"
    }
  ]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-12">
          Event Participant Directory
        </h1>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="space-y-8">
            {/* Who I Am Section */}
            <div className="flex items-start gap-4">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="text-gray-600 text-lg font-medium whitespace-nowrap">
                  👤 Who I Am
                </div>
              </div>
              <div className="flex gap-4 flex-1">
                <Textarea
                  placeholder="Describe yourself, your role, interests..."
                  value={whoIAm}
                  onChange={(e) => setWhoIAm(e.target.value)}
                  className="flex-1 min-h-[80px] resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 h-auto">
                  <Mic className="w-4 h-4 mr-2" />
                  Record
                </Button>
              </div>
            </div>

            {/* Who I Want to Meet Section */}
            <div className="flex items-start gap-4">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="text-gray-600 text-lg font-medium whitespace-nowrap">
                  👤 Who I Want to Meet
                </div>
              </div>
              <div className="flex gap-4 flex-1">
                <Textarea
                  placeholder="Describe who you're looking to connect with..."
                  value={whoIWantToMeet}
                  onChange={(e) => setWhoIWantToMeet(e.target.value)}
                  className="flex-1 min-h-[80px] resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 h-auto">
                  <Mic className="w-4 h-4 mr-2" />
                  Record
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Participants Table */}
        <ParticipantTable participants={participants} />
        
        <div className="text-center mt-8">
          <p className="text-gray-600">Total Participants: {participants.length}</p>
        </div>

        <div className="text-center mt-12 text-sm text-gray-500">
          Made with Claude
        </div>
      </div>
    </div>
  );
};

export default ParticipantDirectory;
