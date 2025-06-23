
import { Button } from '@/components/ui/button';
import { Mic, Linkedin } from 'lucide-react';

interface Participant {
  name: string;
  linkedinUrl: string;
  info: string;
}

interface ParticipantTableProps {
  participants: Participant[];
}

const ParticipantTable = ({ participants }: ParticipantTableProps) => {
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
              <th className="text-left py-4 px-6 font-semibold text-gray-900">Calendly</th>
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 border-gray-300 hover:bg-gray-50"
                  >
                    <Mic className="w-4 h-4" />
                  </Button>
                </td>
                <td className="py-4 px-6 text-gray-700 max-w-md">
                  {participant.info}
                </td>
                <td className="py-4 px-6">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    📞 Book Call
                  </Button>
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
