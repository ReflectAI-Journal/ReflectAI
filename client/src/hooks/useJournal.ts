import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { JournalEntry } from '@/types/journal';

export const useJournal = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
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
      const res = await apiRequest({
        method: 'POST', 
        url: '/api/entries', 
        body: JSON.stringify(entry)
      });
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
      const res = await apiRequest({
        method: 'PUT',
        url: `/api/entries/${id}`,
        body: JSON.stringify(data)
      });
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
  }, [toast, queryClient]);
  
  // Save current entry
  const saveEntry = useCallback(async () => {
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
  }, [isNewEntry, currentEntry, createEntryMutation, updateEntryMutation]);
  
  // Function to regenerate AI response for an entry
  const regenerateAIResponse = useCallback(async () => {
    if (!currentEntry.id) return;
    
    try {
      await regenerateAIMutation.mutateAsync(currentEntry.id);
    } catch (error) {
      console.error('Error regenerating AI response:', error);
    }
  }, [currentEntry.id, regenerateAIMutation]);
  
  // Function to completely clear an entry
  const clearEntry = useCallback(async () => {
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
  }, [isNewEntry, currentEntry, queryClient, toast]);

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
