import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Journal, JournalInput } from '@/types';

export function useJournals() {
  const { user } = useAuth();
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJournals = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: supaError } = await supabase
        .from('journals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (supaError) throw supaError;
      setJournals((data as Journal[]) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchJournals();
  }, [fetchJournals]);

  const createJournal = useCallback(async (input: JournalInput): Promise<Journal | null> => {
    if (!user) return null;
    try {
      const { data, error: supaError } = await supabase
        .from('journals')
        .insert({ ...input, user_id: user.id })
        .select()
        .single();

      if (supaError) throw supaError;
      const newJournal = data as Journal;
      setJournals((prev) => [newJournal, ...prev]);
      return newJournal;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de création');
      return null;
    }
  }, [user]);

  const updateJournal = useCallback(async (id: string, updates: Partial<JournalInput>): Promise<boolean> => {
    try {
      const { error: supaError } = await supabase
        .from('journals')
        .update(updates)
        .eq('id', id);

      if (supaError) throw supaError;
      setJournals((prev) =>
        prev.map((j) => (j.id === id ? { ...j, ...updates } as Journal : j))
      );
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de mise à jour');
      return false;
    }
  }, []);

  const deleteJournal = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: supaError } = await supabase
        .from('journals')
        .delete()
        .eq('id', id);

      if (supaError) throw supaError;
      setJournals((prev) => prev.filter((j) => j.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de suppression');
      return false;
    }
  }, []);

  return { journals, loading, error, fetchJournals, createJournal, updateJournal, deleteJournal };
}
