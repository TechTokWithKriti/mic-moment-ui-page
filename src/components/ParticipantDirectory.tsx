
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import ParticipantTable from './ParticipantTable';
import { useParticipants } from '@/hooks/useParticipants';

interface Participant {
  name: string;
  linkedinUrl: string;
  email: string;
  info: string;
}

const ParticipantDirectory = () => {
  const [whoIAm, setWhoIAm] = useState(() => localStorage.getItem('whoIAm') || '');
  const [whoIWantToMeet, setWhoIWantToMeet] = useState(() => localStorage.getItem('whoIWantToMeet') || '');
  const { participants, isGenerating, generateParticipants } = useParticipants();

  const handleSubmit = () => {
    // Save both inputs to localStorage
    localStorage.setItem('whoIAm', whoIAm);
    localStorage.setItem('whoIWantToMeet', whoIWantToMeet);
    
    console.log('Who I Am saved:', whoIAm);
    console.log('Who I Want to Meet saved:', whoIWantToMeet);
    
    // Generate participants when user submits their criteria
    if (whoIAm.trim() && whoIWantToMeet.trim()) {
      generateParticipants(whoIAm, whoIWantToMeet);
    }
  };

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
              <div className="flex-1">
                <Textarea
                  placeholder="Describe yourself, your role, interests..."
                  value={whoIAm}
                  onChange={(e) => setWhoIAm(e.target.value)}
                  className="flex-1 min-h-[80px] resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Who I Want to Meet Section */}
            <div className="flex items-start gap-4">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="text-gray-600 text-lg font-medium whitespace-nowrap">
                  👥 Who I Want to Meet
                </div>
              </div>
              <div className="flex-1">
                <Textarea
                  placeholder="Describe who you're looking to connect with..."
                  value={whoIWantToMeet}
                  onChange={(e) => setWhoIWantToMeet(e.target.value)}
                  className="flex-1 min-h-[80px] resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Single Submit Button */}
            <div className="text-center">
              <Button 
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                disabled={isGenerating || !whoIAm.trim() || !whoIWantToMeet.trim()}
              >
                {isGenerating ? 'Generating Participants...' : 'Generate Participant Matches'}
              </Button>
            </div>
          </div>
        </div>

        {/* Data Source Info */}
        {participants.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> These participants are AI-generated based on your criteria. 
              LinkedIn URLs and email addresses are fictional for demonstration purposes.
            </p>
          </div>
        )}

        {/* Participants Table */}
        {participants.length > 0 && <ParticipantTable participants={participants} />}
        
        {participants.length > 0 && (
          <div className="text-center mt-8">
            <p className="text-gray-600">
              {participants.length} AI-generated participants matching your criteria
            </p>
          </div>
        )}

        {participants.length === 0 && !isGenerating && (
          <div className="text-center mt-8">
            <p className="text-gray-600">
              Fill in both fields above and submit to generate personalized participant matches
            </p>
          </div>
        )}

        <div className="text-center mt-12 text-sm text-gray-500">
          Made with Claude
        </div>
      </div>
    </div>
  );
};

export default ParticipantDirectory;
