
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Participant {
  name: string;
  linkedinUrl: string;
  email: string;
  info: string;
}

interface CsvUploadProps {
  onParticipantsLoaded: (participants: Participant[]) => void;
}

const CsvUpload = ({ onParticipantsLoaded }: CsvUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const parseCSV = (csvText: string): Participant[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const participants: Participant[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      
      if (values.length !== headers.length) {
        console.warn(`Row ${i + 1} has ${values.length} columns, expected ${headers.length}`);
        continue;
      }

      const nameIndex = headers.findIndex(h => h.toLowerCase().includes('name'));
      const emailIndex = headers.findIndex(h => h.toLowerCase().includes('email'));
      const linkedinIndex = headers.findIndex(h => h.toLowerCase().includes('linkedin'));
      const companyIndex = headers.findIndex(h => h.toLowerCase().includes('company'));
      const jobTitleIndex = headers.findIndex(h => h.toLowerCase().includes('job title') || h.toLowerCase().includes('title'));
      const whoToMeetIndex = headers.findIndex(h => h.toLowerCase().includes('who do you want to meet') || h.toLowerCase().includes('want to meet'));

      if (nameIndex === -1 || emailIndex === -1) {
        throw new Error('CSV must contain Name and Email columns');
      }

      const name = values[nameIndex] || '';
      const email = values[emailIndex] || '';
      const linkedinUrl = values[linkedinIndex] || '';
      const company = values[companyIndex] || '';
      const jobTitle = values[jobTitleIndex] || '';
      const whoToMeet = values[whoToMeetIndex] || '';

      // Combine job title, company, and who to meet into info field
      const infoParts = [];
      if (jobTitle && company) {
        infoParts.push(`${jobTitle} at ${company}`);
      } else if (jobTitle) {
        infoParts.push(jobTitle);
      } else if (company) {
        infoParts.push(company);
      }
      
      if (whoToMeet) {
        infoParts.push(`Wants to meet: ${whoToMeet}`);
      }

      const info = infoParts.join('\n');

      if (name && email) {
        participants.push({
          name,
          email,
          linkedinUrl,
          info: info || 'No additional information provided'
        });
      }
    }

    return participants;
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const participants = parseCSV(csvText);
        
        if (participants.length === 0) {
          throw new Error('No valid participant data found in CSV');
        }

        onParticipantsLoaded(participants);
        toast({
          title: "CSV Uploaded Successfully",
          description: `Loaded ${participants.length} participants`,
        });
      } catch (error) {
        toast({
          title: "CSV Upload Failed",
          description: error instanceof Error ? error.message : 'Failed to parse CSV file',
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => file.type === 'text/csv' || file.name.endsWith('.csv'));
    
    if (csvFile) {
      handleFileUpload(csvFile);
    } else {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Participants</h2>
      
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          Drop your CSV file here, or click to browse
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Expected columns: Name, Email, LinkedIn Profile, Company, Job Title, Who do you want to meet
        </p>
        
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileInput}
          className="hidden"
          id="csv-upload"
        />
        <label htmlFor="csv-upload">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Upload className="w-4 h-4 mr-2" />
            Choose CSV File
          </Button>
        </label>
      </div>
    </div>
  );
};

export default CsvUpload;
