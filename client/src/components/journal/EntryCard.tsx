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
      className="entry-card p-6 rounded-xl cursor-pointer relative bg-card/80 backdrop-blur-sm border-2 border-primary/10 hover:border-primary/30 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-gradient-to-br hover:from-white hover:to-primary/10"
      onClick={onClick}
      style={{
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
      }}
    >
      {entry.isFavorite && (
        <div className="absolute -right-3 -top-3 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center z-10 shadow-md">
          <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
        </div>
      )}
      
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-header font-semibold text-lg leading-tight text-gray-800">{entry.title || getTitle(entry.content)}</h3>
        <div className="flex items-center text-sm text-muted-foreground ml-2 bg-primary/10 px-3 py-1.5 rounded-full">
          <Calendar className="h-4 w-4 mr-1.5 text-primary" />
          {formattedDate}
        </div>
      </div>
      
      <div className="bg-white/60 p-4 mb-4 rounded-xl border border-primary/20 shadow-sm">
        <p className="text-base line-clamp-2 font-medium font-handwritten text-gray-700">
          {entry.content}
        </p>
      </div>
      
      {entry.moods && entry.moods.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {entry.moods.slice(0, 3).map((mood, index) => {
            const { bg, text, border } = getMoodColor(mood);
            return (
              <span 
                key={index} 
                className={`inline-block text-sm px-3 py-1 rounded-full border-2 ${bg} ${text} ${border} transform transition-transform hover:scale-110`}
              >
                {mood}
              </span>
            );
          })}
          
          {entry.moods.length > 3 && (
            <span className="inline-block bg-muted/60 text-muted-foreground text-sm px-3 py-1 rounded-full border-2 border-border/50 hover:bg-muted/80 transition-colors">
              +{entry.moods.length - 3}
            </span>
          )}
        </div>
      )}
      
      {/* Curved corners for bubble-like effect */}
      <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-card/80 rounded-full border-2 border-primary/10"></div>
      <div className="absolute -bottom-3 -left-3 w-4 h-4 bg-card/80 rounded-full border-2 border-primary/10"></div>
    </div>
  );
};

export default EntryCard;
