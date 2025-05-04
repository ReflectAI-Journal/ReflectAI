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
      // Fetch entries for the specified date
      const res = await fetch(`/api/entries/date/${year}/${month}/${day}`);
      const entries = await res.json();
      
      if (entries.length > 0) {
        // Entry exists for this date
        setCurrentEntry(entries[0]);
        setIsNewEntry(false);
      } else {
        // No entry exists for this date, create a new one
        setCurrentEntry({
          content: '',
          moods: [],
          date: new Date(year, month - 1, day).toISOString(), // Month is 0-indexed in Date constructor
        });
        setIsNewEntry(true);
      }
    } catch (error) {
      console.error('Error loading entry:', error);
      toast({
        title: 'Error loading journal entry',
        description: 'There was a problem fetching your journal entry.',
        variant: 'destructive',
      });
    }
  }, [toast]);
  
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
  
  return {
    currentEntry,
    setCurrentEntry,
    isNewEntry,
    entries,
    loadEntry,
    saveEntry,
  };
};
