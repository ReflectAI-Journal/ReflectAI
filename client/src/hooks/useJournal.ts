import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { JournalEntry } from '@/types/journal';
import { useAuth } from '@/hooks/use-auth';

export const useJournal = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // State for the current entry being edited
  const [currentEntry, setCurrentEntry] = useState<Partial<JournalEntry>>({
    content: '',
    moods: [],
  });
  
  // Flag to track if we're creating a new entry or editing existing
  const [isNewEntry, setIsNewEntry] = useState(true);
  
  // Query to get all entries
  const { data: entries = [] } = useQuery<JournalEntry[]>({
    queryKey: ['/api/entries'],
    queryFn: async () => {
      // For guest users, return mock entries
      if (user?.isGuest) {
        // Create some sample entries for the past week
        const mockEntries: JournalEntry[] = [];
        const today = new Date();
        
        // Generate entries for the past 7 days
        for (let i = 0; i < 7; i++) {
          const entryDate = new Date(today);
          entryDate.setDate(today.getDate() - i);
          
          // Skip creating an entry for today since it will be handled separately
          if (i === 0) continue;
          
          const dayOfWeek = entryDate.toLocaleDateString('en-US', { weekday: 'long' });
          const dateString = entryDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
          
          // Create sample moods and content based on the day
          let moods: string[] = [];
          let content = '';
          
          switch (i % 5) {
            case 0:
              moods = ['Productive', 'Focused'];
              content = `Had a productive day working on my projects. Made progress on the main tasks I set out to accomplish. Hoping to maintain this momentum tomorrow.`;
              break;
            case 1:
              moods = ['Relaxed', 'Grateful'];
              content = `Took some time to relax today. I'm grateful for the small moments of peace in a busy week. Practiced mindfulness for 10 minutes.`;
              break;
            case 2:
              moods = ['Tired', 'Reflective'];
              content = `Feeling a bit tired today, but taking time to reflect on recent accomplishments. Need to focus on getting better sleep tonight.`;
              break;
            case 3:
              moods = ['Excited', 'Creative'];
              content = `Had some creative insights today! Excited about new ideas and possibilities. Looking forward to exploring them further.`;
              break;
            case 4:
              moods = ['Calm', 'Balanced'];
              content = `Found a good balance today between work and personal time. Feeling calm and centered. Made time for a short walk outside.`;
              break;
          }
          
          mockEntries.push({
            id: 9990 - i,
            userId: 0,
            date: entryDate.toISOString(),
            title: `${dayOfWeek}, ${dateString}`,
            content,
            moods,
            aiResponse: `I notice you felt ${moods.join(' and ')} on ${dayOfWeek}. Your journal shows good self-awareness. Continue to track these patterns to gain insights into what affects your wellbeing.`,
            isFavorite: false
          });
        }
        
        return mockEntries;
      }
      
      // For regular users, proceed with the API request
      const res = await apiRequest("GET", "/api/entries");
      return res.json();
    },
  });
  
  // Regenerate AI response mutation
  const regenerateAIMutation = useMutation({
    mutationFn: async (entryId: number) => {
      const res = await apiRequest('POST', `/api/entries/${entryId}/regenerate-ai`, {});
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/entries'] });
      setCurrentEntry(data);
      toast({
        title: 'AI Response Generated',
        description: 'Your journal entry has been analyzed with new insights.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error generating AI response',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Create entry mutation
  const createEntryMutation = useMutation({
    mutationFn: async (entry: Partial<JournalEntry>) => {
      const res = await apiRequest('POST', '/api/entries', entry);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/entries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    },
    onError: (error) => {
      toast({
        title: 'Error creating entry',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Update entry mutation
  const updateEntryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<JournalEntry> }) => {
      const res = await apiRequest('PUT', `/api/entries/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/entries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    },
    onError: (error) => {
      toast({
        title: 'Error updating entry',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Load entry for a specific date
  const loadEntry = useCallback(async (year: number, month: number, day: number) => {
    try {
      // Immediately set a loading state
      setCurrentEntry(prev => ({
        ...prev,
        content: '',
        moods: [],
        id: undefined, // Clear the ID to ensure we're not trying to update an existing entry
      }));
      
      console.log("Loading entry for date:", year, month, day);

      // Check if user is a guest and provide mock data instead of API calls
      if (user?.isGuest) {
        console.log("Guest user detected - providing mock journal entry");
        
        // Check if we're loading today's date
        const today = new Date();
        const isToday = (
          year === today.getFullYear() && 
          month === today.getMonth() + 1 && 
          day === today.getDate()
        );
        
        if (isToday) {
          // For today, provide an empty journal entry that can be filled out
          const guestEntry: Partial<JournalEntry> = {
            id: 9999, // Use a fake ID
            content: '',
            moods: [],
            date: new Date(year, month - 1, day).toISOString(),
            aiResponse: "This is a demo mode. Your journal entries won't be saved. Try writing something and see how ReflectAI responds!",
          };
          
          setCurrentEntry(guestEntry);
          setIsNewEntry(true);
          return;
        } else {
          // For past dates, provide a sample entry
          const pastDate = new Date(year, month - 1, day);
          const dayOfWeek = pastDate.toLocaleDateString('en-US', { weekday: 'long' });
          
          const guestEntry: Partial<JournalEntry> = {
            id: 9998, // Use a fake ID
            content: `This is a sample journal entry for ${dayOfWeek}, ${month}/${day}/${year}. In guest mode, you can see how journal entries would appear, but they won't be saved.`,
            moods: ['Curious', 'Relaxed'],
            date: pastDate.toISOString(),
            aiResponse: "I notice you're exploring the journal feature in guest mode. Journaling regularly can help improve self-awareness and emotional well-being. Each entry would normally receive a personalized AI response based on what you write.",
          };
          
          setCurrentEntry(guestEntry);
          setIsNewEntry(false);
          return;
        }
      }
      
      // TEMPORARY: Check for a test flag to force behavior
      const forceDelete = localStorage.getItem('forceDeleteJournal') === 'true';
      if (forceDelete) {
        console.log("TEST MODE: Force delete journal entry requested");
        localStorage.removeItem('forceDeleteJournal');
      }
      
      // Check if we're loading today's date
      const today = new Date();
      const isToday = (
        year === today.getFullYear() && 
        month === today.getMonth() + 1 && 
        day === today.getDate()
      );
      
      // Get the date from localStorage if exists
      const storedDateStr = localStorage.getItem('lastJournalDate');
      let isNewDay = forceDelete; // Start with forced value
      
      if (storedDateStr && isToday && !forceDelete) {
        // Parse stored date
        const storedDate = new Date(storedDateStr);
        const storedDay = storedDate.getDate();
        const storedMonth = storedDate.getMonth() + 1;
        const storedYear = storedDate.getFullYear();
        
        // Check if this is a new day
        isNewDay = (
          day !== storedDay || 
          month !== storedMonth || 
          year !== storedYear
        );
        
        if (isNewDay) {
          console.log("New day detected since last visit");
          // Update localStorage with today's date
          localStorage.setItem('lastJournalDate', today.toISOString());
        }
      } else if (isToday) {
        // First visit, set initial date
        localStorage.setItem('lastJournalDate', today.toISOString());
      }
      
      // Fetch entries for the specified date
      const res = await fetch(`/api/entries/date/${year}/${month}/${day}`);
      const entries = await res.json();
      
      console.log("Entries received:", entries);
      
      if (entries.length > 0 && (!isToday || !isNewDay)) {
        // Entry exists for this date and it's either not today or not a new day
        console.log("Setting existing entry:", entries[0]);
        setCurrentEntry(entries[0]);
        setIsNewEntry(false);
      } else {
        // No entry exists, or it's a new day - create a new one
        const newEntry = {
          content: '',
          moods: [],
          date: new Date(year, month - 1, day).toISOString(), // Month is 0-indexed in Date constructor
        };
        console.log("Creating new entry:", newEntry);
        setCurrentEntry(newEntry);
        setIsNewEntry(true);
        
        // If there was an existing entry for today but it's a new day, clear it
        if (entries.length > 0 && isToday && isNewDay) {
          try {
            console.log("Deleting old entry for new day:", entries[0].id);
            await fetch(`/api/entries/${entries[0].id}`, {
              method: 'DELETE'
            });
            queryClient.invalidateQueries({ queryKey: ['/api/entries'] });
          } catch (deleteErr) {
            console.error("Error cleaning up old entry:", deleteErr);
          }
        }
      }
    } catch (error) {
      console.error('Error loading entry:', error);
      toast({
        title: 'Error loading journal entry',
        description: 'There was a problem fetching your journal entry.',
        variant: 'destructive',
      });
    }
  }, [toast, queryClient, user]);
  
  // Save current entry
  const saveEntry = useCallback(async () => {
    // For guest users, simulate a successful save without making API calls
    if (user?.isGuest) {
      // Generate a simple AI response for guest users
      const guestAIResponse = "Thank you for trying the journaling feature! In the full version, you would receive personalized AI insights based on your entry. Your journal entries would also be saved securely.";
      
      // Update the current entry with the AI response
      setCurrentEntry(prev => ({
        ...prev,
        aiResponse: guestAIResponse,
        updatedAt: new Date().toISOString()
      }));
      
      // Set isNewEntry to false to simulate that it's been saved
      setIsNewEntry(false);
      return;
    }
    
    if (isNewEntry) {
      await createEntryMutation.mutateAsync(currentEntry);
      setIsNewEntry(false);
    } else {
      if (!currentEntry.id) return;
      await updateEntryMutation.mutateAsync({
        id: currentEntry.id,
        data: {
          content: currentEntry.content,
          moods: currentEntry.moods,
          title: currentEntry.title,
        },
      });
    }
    
    // Refetch the entry to get the AI response
    if (currentEntry.id) {
      const res = await fetch(`/api/entries/${currentEntry.id}`);
      const updatedEntry = await res.json();
      setCurrentEntry(updatedEntry);
    }
  }, [isNewEntry, currentEntry, createEntryMutation, updateEntryMutation, user]);
  
  // Function to regenerate AI response for an entry
  const regenerateAIResponse = useCallback(async () => {
    // For guest users, provide a new random AI response
    if (user?.isGuest) {
      const guestAIResponses = [
        "This is a simulated AI response for guest users. In the full version, you would receive unique insights tailored to your journal content.",
        "Journaling regularly can help reduce stress and improve mental clarity. This is a sample AI response for guest mode.",
        "Thank you for trying the journal feature! With a full account, the AI would analyze the emotions and themes in your writing to provide personalized feedback.",
        "In guest mode, you're experiencing a preview of ReflectAI. With a registered account, your entries would be saved and analyzed more deeply."
      ];
      
      const randomResponse = guestAIResponses[Math.floor(Math.random() * guestAIResponses.length)];
      
      setCurrentEntry(prev => ({
        ...prev,
        aiResponse: randomResponse,
        updatedAt: new Date().toISOString()
      }));
      
      return;
    }
    
    if (!currentEntry.id) return;
    
    try {
      await regenerateAIMutation.mutateAsync(currentEntry.id);
    } catch (error) {
      console.error('Error regenerating AI response:', error);
    }
  }, [currentEntry.id, regenerateAIMutation, user]);
  
  // Function to completely clear an entry
  const clearEntry = useCallback(async () => {
    // For guest users, just reset the entry state without API calls
    if (user?.isGuest) {
      setCurrentEntry({
        content: '',
        moods: [],
        id: 9999, // Keep the fake ID
        date: new Date().toISOString(),
        aiResponse: "This is a demo mode. Your journal entries won't be saved. Try writing something and see how ReflectAI responds!"
      });
      setIsNewEntry(true);
      return;
    }
    
    // If it's a new entry, just clear the state
    if (isNewEntry) {
      setCurrentEntry({
        content: '',
        moods: [],
      });
      return;
    }
    
    // If entry exists, completely delete the entry
    if (currentEntry.id) {
      try {
        console.log("Deleting entry with ID:", currentEntry.id);
        
        // Forcefully delete the entry with fetch to make sure we're not having issues with apiRequest
        const response = await fetch(`/api/entries/${currentEntry.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log("Delete response status:", response.status);
        
        if (response.status !== 204) {
          console.error("Failed to delete entry, status:", response.status);
          throw new Error("Failed to delete entry");
        }
        
        // Create a completely fresh entry state
        const today = new Date();
        const newEntry = {
          content: '',
          moods: [],
          date: today.toISOString(),
        };
        
        // Update state to reflect deletion
        setCurrentEntry(newEntry);
        setIsNewEntry(true);
        
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['/api/entries'] });
        queryClient.invalidateQueries({ queryKey: ['/api/entries/date'] });
        queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
        
        // Show a more prominent success message
        toast({
          title: 'Journal Completely Deleted',
          description: 'Your journal entry has been permanently deleted.',
          variant: 'default',
        });
      } catch (error) {
        console.error('Error deleting entry:', error);
        toast({
          title: 'Error Clearing Entry',
          description: 'There was a problem clearing your journal entry.',
          variant: 'destructive',
        });
      }
    }
  }, [isNewEntry, currentEntry, queryClient, toast, user]);

  return {
    currentEntry,
    setCurrentEntry,
    isNewEntry,
    entries,
    loadEntry,
    saveEntry,
    regenerateAIResponse,
    clearEntry
  };
};
