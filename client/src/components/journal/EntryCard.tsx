import { format } from 'date-fns';
import { JournalEntry } from '@/types/journal';

interface EntryCardProps {
  entry: JournalEntry;
  onClick?: () => void;
}

const EntryCard = ({ entry, onClick }: EntryCardProps) => {
  // Get a title from the content (first line or first few words)
  const getTitle = (content: string) => {
    // If there's a line break, use first line
    if (content.includes('\n')) {
      const firstLine = content.split('\n')[0].trim();
      return firstLine.length > 30 ? firstLine.substring(0, 30) + '...' : firstLine;
    }
    
    // Otherwise use first few words
    const words = content.split(' ');
    if (words.length <= 5) return content;
    return words.slice(0, 5).join(' ') + '...';
  };
  
  // Format the date
  const formattedDate = format(new Date(entry.date), 'MMMM d');
  
  // Get mood colors
  const getMoodColor = (mood: string) => {
    const moodColors: Record<string, string> = {
      'Happy': 'bg-green-100 text-green-800',
      'Sad': 'bg-blue-100 text-blue-800',
      'Anxious': 'bg-yellow-100 text-yellow-800',
      'Excited': 'bg-purple-100 text-purple-800',
      'Calm': 'bg-blue-100 text-blue-800',
      'Frustrated': 'bg-red-100 text-red-800',
      'Grateful': 'bg-green-100 text-green-800',
      'Tired': 'bg-gray-100 text-gray-800'
    };
    
    return moodColors[mood] || 'bg-gray-100 text-gray-800';
  };
  
  return (
    <div 
      className="entry-card p-3 bg-white rounded-md shadow-journal cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <p className="font-medium">{entry.title || getTitle(entry.content)}</p>
        <span className="text-xs text-muted-foreground">{formattedDate}</span>
      </div>
      
      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
        {entry.content}
      </p>
      
      {entry.moods && entry.moods.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {entry.moods.slice(0, 3).map((mood, index) => (
            <span 
              key={index} 
              className={`mood-tag inline-block text-xs px-2 py-0.5 rounded-full ${getMoodColor(mood)}`}
            >
              {mood}
            </span>
          ))}
          
          {entry.moods.length > 3 && (
            <span className="mood-tag inline-block bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-full">
              +{entry.moods.length - 3} more
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default EntryCard;
