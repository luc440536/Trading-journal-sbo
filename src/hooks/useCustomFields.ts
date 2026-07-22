import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useJournal } from '@/contexts/JournalContext';
import type { CustomField, CustomFieldInput } from '@/types';

export function useCustomFields() {
  const { currentJournal, refreshCustomFields } = useJournal();
  const [loading, setLoading] = useState(false);

  const createCustomField = useCallback(async (input: CustomFieldInput): Promise<CustomField | null> => {
    if (!currentJournal) return null;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('custom_fields')
        .insert({ ...input, journal_id: currentJournal.id })
        .select()
        .single();

      if (error) throw error;
      await refreshCustomFields();
      return data as CustomField;
    } catch (err) {
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentJournal, refreshCustomFields]);

  const deleteCustomField = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { error } = await supabase.from('custom_fields').delete().eq('id', id);
      if (error) throw error;
      await refreshCustomFields();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshCustomFields]);

  return { createCustomField, deleteCustomField, loading };
}
