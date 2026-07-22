import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { Journal, Trade, CustomField, ErrorType } from '@/types';

interface JournalContextType {
  currentJournal: Journal | null;
  trades: Trade[];
  customFields: CustomField[];
  errorTypes: ErrorType[];
  loading: boolean;
  loadJournal: (journalId: string) => Promise<void>;
  refreshTrades: () => Promise<void>;
  refreshCustomFields: () => Promise<void>;
  refreshErrorTypes: () => Promise<void>;
  clearJournal: () => void;
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

export function JournalProvider({ children }: { children: ReactNode }) {
  const [currentJournal, setCurrentJournal] = useState<Journal | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [errorTypes, setErrorTypes] = useState<ErrorType[]>([]);
  const [loading, setLoading] = useState(false);

  const loadJournal = useCallback(async (journalId: string) => {
    setLoading(true);
    try {
      // Charger le journal
      const { data: journalData, error: journalError } = await supabase
        .from('journals')
        .select('*')
        .eq('id', journalId)
        .single();

      if (journalError) throw journalError;
      setCurrentJournal(journalData as Journal);

      // Charger les trades
      const { data: tradesData, error: tradesError } = await supabase
        .from('trades')
        .select('*')
        .eq('journal_id', journalId)
        .order('opened_at', { ascending: false });

      if (tradesError) throw tradesError;
      setTrades((tradesData as Trade[]) ?? []);

      // Charger les champs personnalisés
      const { data: cfData, error: cfError } = await supabase
        .from('custom_fields')
        .select('*')
        .eq('journal_id', journalId);

      if (cfError) throw cfError;
      setCustomFields((cfData as CustomField[]) ?? []);

      // Charger les types d'erreur
      const { data: etData, error: etError } = await supabase
        .from('error_types')
        .select('*')
        .eq('journal_id', journalId);

      if (etError) throw etError;
      setErrorTypes((etData as ErrorType[]) ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshTrades = useCallback(async () => {
    if (!currentJournal) return;
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('journal_id', currentJournal.id)
      .order('opened_at', { ascending: false });
    if (!error) setTrades((data as Trade[]) ?? []);
  }, [currentJournal]);

  const refreshCustomFields = useCallback(async () => {
    if (!currentJournal) return;
    const { data, error } = await supabase
      .from('custom_fields')
      .select('*')
      .eq('journal_id', currentJournal.id);
    if (!error) setCustomFields((data as CustomField[]) ?? []);
  }, [currentJournal]);

  const refreshErrorTypes = useCallback(async () => {
    if (!currentJournal) return;
    const { data, error } = await supabase
      .from('error_types')
      .select('*')
      .eq('journal_id', currentJournal.id);
    if (!error) setErrorTypes((data as ErrorType[]) ?? []);
  }, [currentJournal]);

  const clearJournal = useCallback(() => {
    setCurrentJournal(null);
    setTrades([]);
    setCustomFields([]);
    setErrorTypes([]);
  }, []);

  return (
    <JournalContext.Provider
      value={{
        currentJournal,
        trades,
        customFields,
        errorTypes,
        loading,
        loadJournal,
        refreshTrades,
        refreshCustomFields,
        refreshErrorTypes,
        clearJournal,
      }}
    >
      {children}
    </JournalContext.Provider>
  );
}

export function useJournal() {
  const context = useContext(JournalContext);
  if (!context) throw new Error('useJournal doit être utilisé dans un JournalProvider');
  return context;
}
