
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mic } from 'lucide-react';
import ParticipantTable from './ParticipantTable';

const ParticipantDirectory = () => {
  const [whoIAm, setWhoIAm] = useState('');
  const [whoIWantToMeet, setWhoIWantToMeet] = useState('');

  const participants = [
    {
      name: 'Sarah Chen',
      linkedinUrl: '#',
      info: 'Product Manager at TechCorp, AI enthusiast, looking to connect with founders',
    },
    {
      name: 'Marcus Rodriguez',
      linkedinUrl: '#',
      info: 'Full-stack developer, startup advisor, interested in fintech opportunities',
    },
    {
      name: 'Emily Watson',
      linkedinUrl: '#',
      info: 'Marketing Director, B2B SaaS expert, seeking partnerships and collaborations',
    },
    {
      name: 'David Kim',
      linkedinUrl: '#',
      info: 'Data Scientist, ML researcher, looking for technical co-founders',
    },
    {
      name: 'Lisa Thompson',
      linkedinUrl: '#',
      info: 'Sales Leader, enterprise solutions, interested in networking with executives',
    },
  ];

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
