
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import ParticipantTable from './ParticipantTable';
import UserHeader from './UserHeader';
import { useParticipants } from '@/hooks/useParticipants';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

const ParticipantDirectory = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  const [whoIAm, setWhoIAm] = useState('');
  const [whoIWantToMeet, setWhoIWantToMeet] = useState('');
  const { participants, isGenerating, generateParticipants } = useParticipants();
  const navigate = useNavigate();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Load profile data when available
  useEffect(() => {
    if (profile) {
      setWhoIAm(profile.who_i_am || '');
      setWhoIWantToMeet(profile.who_i_want_to_meet || '');
    }
  }, [profile]);

  const handleSubmit = async () => {
    // Update profile in database
    await updateProfile({
      who_i_am: whoIAm,
      who_i_want_to_meet: whoIWantToMeet,
    });
    
    // Generate participants when user submits their criteria
    if (whoIAm.trim() && whoIWantToMeet.trim()) {
      generateParticipants(whoIAm, whoIWantToMeet);
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />
      
      <div className="py-8 px-4">
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

              {/* Submit Button */}
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
    </div>
  );
};

export default ParticipantDirectory;
