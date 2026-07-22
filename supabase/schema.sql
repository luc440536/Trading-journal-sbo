-- ============================================
-- JOURNAL DE TRADING SBO - Schéma Supabase
-- ============================================

-- Activer l'extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE : journals
-- ============================================
CREATE TABLE journals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    broker TEXT,
    starting_capital NUMERIC NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'EUR' CHECK (currency IN ('EUR','USD','GBP','CHF','XOF')),
    account_type TEXT NOT NULL DEFAULT 'demo' CHECK (account_type IN ('demo','live')),
    risk_limit_day NUMERIC,
    risk_limit_week NUMERIC,
    risk_limit_month NUMERIC,
    theme_pref TEXT DEFAULT 'dark' CHECK (theme_pref IN ('dark','light')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE : custom_fields
-- ============================================
CREATE TABLE custom_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_id UUID NOT NULL REFERENCES journals(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    options TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE : error_types
-- ============================================
CREATE TABLE error_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_id UUID NOT NULL REFERENCES journals(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE : trades
-- ============================================
CREATE TABLE trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_id UUID NOT NULL REFERENCES journals(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    direction TEXT NOT NULL CHECK (direction IN ('achat','vente')),
    opened_at TIMESTAMPTZ NOT NULL,
    closed_at TIMESTAMPTZ,
    timeframe TEXT,
    risk_percent NUMERIC,
    rr_planned NUMERIC,
    rr_realized NUMERIC,
    pnl_amount NUMERIC,
    commissions NUMERIC DEFAULT 0,
    swaps NUMERIC DEFAULT 0,
    emotion TEXT CHECK (emotion IN ('calme','concentre','frustre','anxieux','euphorique','fatigue')),
    notes TEXT,
    custom_values JSONB DEFAULT '{}',
    error_type_ids UUID[] DEFAULT '{}',
    screenshot_entry_url TEXT,
    screenshot_management_url TEXT,
    screenshot_close_url TEXT,
    breakeven_on_close BOOLEAN DEFAULT FALSE,
    closed_by_20h BOOLEAN DEFAULT TRUE,
    violation_flags INT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trades_journal ON trades(journal_id);
CREATE INDEX idx_trades_opened_at ON trades(opened_at);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

-- Journals
CREATE POLICY "Users can only access their own journals"
    ON journals FOR ALL
    USING (auth.uid() = user_id);

-- Custom fields (via journal ownership)
CREATE POLICY "Users can access custom fields of their journals"
    ON custom_fields FOR ALL
    USING (EXISTS (
        SELECT 1 FROM journals WHERE journals.id = custom_fields.journal_id AND journals.user_id = auth.uid()
    ));

-- Error types (via journal ownership)
CREATE POLICY "Users can access error types of their journals"
    ON error_types FOR ALL
    USING (EXISTS (
        SELECT 1 FROM journals WHERE journals.id = error_types.journal_id AND journals.user_id = auth.uid()
    ));

-- Trades (via journal ownership)
CREATE POLICY "Users can access trades of their journals"
    ON trades FOR ALL
    USING (EXISTS (
        SELECT 1 FROM journals WHERE journals.id = trades.journal_id AND journals.user_id = auth.uid()
    ));

-- ============================================
-- STORAGE BUCKET
-- ============================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('trade-screenshots', 'trade-screenshots', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload screenshots"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'trade-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own screenshots"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'trade-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Screenshots are publicly readable"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'trade-screenshots');
