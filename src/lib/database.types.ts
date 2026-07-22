// Types générés pour Supabase — version simplifiée
// En production, utiliser: npx supabase gen types typescript --project-id xxx

export interface Database {
  public: {
    Tables: {
      journals: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          broker: string | null;
          starting_capital: number;
          currency: string;
          account_type: string;
          risk_limit_day: number | null;
          risk_limit_week: number | null;
          risk_limit_month: number | null;
          theme_pref: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['journals']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['journals']['Insert']>;
      };
      custom_fields: {
        Row: {
          id: string;
          journal_id: string;
          name: string;
          options: string[];
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['custom_fields']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['custom_fields']['Insert']>;
      };
      error_types: {
        Row: {
          id: string;
          journal_id: string;
          label: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['error_types']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['error_types']['Insert']>;
      };
      trades: {
        Row: {
          id: string;
          journal_id: string;
          symbol: string;
          direction: string;
          opened_at: string;
          closed_at: string | null;
          timeframe: string | null;
          risk_percent: number | null;
          rr_planned: number | null;
          rr_realized: number | null;
          pnl_amount: number | null;
          commissions: number;
          swaps: number;
          emotion: string | null;
          notes: string | null;
          custom_values: Record<string, string>;
          error_type_ids: string[];
          screenshot_entry_url: string | null;
          screenshot_management_url: string | null;
          screenshot_close_url: string | null;
          breakeven_on_close: boolean;
          closed_by_20h: boolean;
          violation_flags: number[];
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['trades']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['trades']['Insert']>;
      };
    };
  };
}
