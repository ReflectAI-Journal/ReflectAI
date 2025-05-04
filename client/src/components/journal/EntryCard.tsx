import { format } from 'date-fns';
import { JournalEntry } from '@/types/journal';
import { Calendar, Star } from 'lucide-react';

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
  
  // Get mood colors - using the same system as in MoodSelector
  const getMoodColor = (mood: string) => {
    const moodColors: Record<string, { bg: string, text: string, border: string }> = {
      Happy: { bg: 'bg-gradient-to-r from-amber-100 to-yellow-100', text: 'text-amber-700', border: 'border-amber-200' },
      Sad: { bg: 'bg-gradient-to-r from-blue-100 to-indigo-100', text: 'text-blue-700', border: 'border-blue-200' },
      Anxious: { bg: 'bg-gradient-to-r from-yellow-100 to-orange-100', text: 'text-yellow-700', border: 'border-yellow-200' },
      Excited: { bg: 'bg-gradient-to-r from-fuchsia-100 to-purple-100', text: 'text-fuchsia-700', border: 'border-fuchsia-200' },
      Calm: { bg: 'bg-gradient-to-r from-teal-100 to-cyan-100', text: 'text-teal-700', border: 'border-teal-200' },
      Frustrated: { bg: 'bg-gradient-to-r from-red-100 to-rose-100', text: 'text-red-700', border: 'border-red-200' },
      Grateful: { bg: 'bg-gradient-to-r from-emerald-100 to-green-100', text: 'text-emerald-700', border: 'border-emerald-200' },
      Tired: { bg: 'bg-gradient-to-r from-slate-100 to-gray-100', text: 'text-slate-700', border: 'border-slate-200' },
    };
    
    return moodColors[mood] || { bg: 'bg-gradient-to-r from-gray-100 to-slate-100', text: 'text-gray-700', border: 'border-gray-200' };
  };
  
  return (
    <div 
      className="entry-card p-4 rounded-lg shadow-journal cursor-pointer relative bg-card/80 backdrop-blur-sm"
      onClick={onClick}
    >
      {entry.isFavorite && (
        <div className="absolute -right-1 -top-1 w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center z-10 shadow-sm">
          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
        </div>
      )}
      
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-header font-medium text-base leading-tight">{entry.title || getTitle(entry.content)}</h3>
        <div className="flex items-center text-xs text-muted-foreground ml-2">
          <Calendar className="h-3 w-3 mr-1" />
          {formattedDate}
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
        {entry.content}
      </p>
      
      {entry.moods && entry.moods.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {entry.moods.slice(0, 3).map((mood, index) => {
            const { bg, text, border } = getMoodColor(mood);
            return (
              <span 
                key={index} 
                className={`inline-block text-xs px-2 py-0.5 rounded-full border ${bg} ${text} ${border}`}
              >
                {mood}
              </span>
            );
          })}
          
          {entry.moods.length > 3 && (
            <span className="inline-block bg-muted/50 text-muted-foreground text-xs px-2 py-0.5 rounded-full border border-border/50">
              +{entry.moods.length - 3}
            </span>
          )}
        </div>
      )}
      
      {/* Gradient border at the bottom for aesthetic */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/30 to-secondary/30 opacity-70"></div>
    </div>
  );
};

export default EntryCard;
