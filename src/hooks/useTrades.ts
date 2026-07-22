import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useJournal } from '@/contexts/JournalContext';
import type { Trade, TradeInput } from '@/types';

export function useTrades() {
  const { currentJournal, refreshTrades } = useJournal();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTrade = useCallback(async (input: TradeInput): Promise<Trade | null> => {
    if (!currentJournal) return null;
    setLoading(true);
    setError(null);
    try {
      const { data, error: supaError } = await supabase
        .from('trades')
        .insert({ ...input, journal_id: currentJournal.id })
        .select()
        .single();

      if (supaError) throw supaError;
      await refreshTrades();
      return data as Trade;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de création du trade');
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentJournal, refreshTrades]);

  const updateTrade = useCallback(async (id: string, updates: Partial<TradeInput>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { error: supaError } = await supabase
        .from('trades')
        .update(updates)
        .eq('id', id);

      if (supaError) throw supaError;
      await refreshTrades();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de mise à jour');
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshTrades]);

  const deleteTrade = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { error: supaError } = await supabase
        .from('trades')
        .delete()
        .eq('id', id);

      if (supaError) throw supaError;
      await refreshTrades();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de suppression');
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshTrades]);

  return { createTrade, updateTrade, deleteTrade, loading, error };
}
