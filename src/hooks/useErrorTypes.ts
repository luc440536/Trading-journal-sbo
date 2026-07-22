import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useJournal } from '@/contexts/JournalContext';
import type { ErrorType, ErrorTypeInput } from '@/types';

export function useErrorTypes() {
  const { currentJournal, refreshErrorTypes } = useJournal();
  const [loading, setLoading] = useState(false);

  const createErrorType = useCallback(async (input: ErrorTypeInput): Promise<ErrorType | null> => {
    if (!currentJournal) return null;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('error_types')
        .insert({ ...input, journal_id: currentJournal.id })
        .select()
        .single();

      if (error) throw error;
      await refreshErrorTypes();
      return data as ErrorType;
    } catch (err) {
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentJournal, refreshErrorTypes]);

  const deleteErrorType = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { error } = await supabase.from('error_types').delete().eq('id', id);
      if (error) throw error;
      await refreshErrorTypes();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshErrorTypes]);

  return { createErrorType, deleteErrorType, loading };
}
