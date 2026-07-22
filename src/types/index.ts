// ============================================
// TYPES - Journal de Trading SBO
// ============================================

export type AccountType = 'demo' | 'live';
export type ThemePref = 'dark' | 'light';
export type Direction = 'achat' | 'vente';
export type Emotion = 'calme' | 'concentre' | 'frustre' | 'anxieux' | 'euphorique' | 'fatigue';
export type Currency = 'EUR' | 'USD' | 'GBP' | 'CHF' | 'XOF';

// --- Journal ---
export interface Journal {
  id: string;
  user_id: string;
  name: string;
  broker: string | null;
  starting_capital: number;
  currency: Currency;
  account_type: AccountType;
  risk_limit_day: number | null;
  risk_limit_week: number | null;
  risk_limit_month: number | null;
  theme_pref: ThemePref;
  created_at: string;
}

export interface JournalInput {
  name: string;
  broker?: string;
  starting_capital: number;
  currency: Currency;
  account_type: AccountType;
  risk_limit_day?: number;
  risk_limit_week?: number;
  risk_limit_month?: number;
}

// --- Custom Field ---
export interface CustomField {
  id: string;
  journal_id: string;
  name: string;
  options: string[];
  created_at: string;
}

export interface CustomFieldInput {
  name: string;
  options: string[];
}

// --- Error Type ---
export interface ErrorType {
  id: string;
  journal_id: string;
  label: string;
  created_at: string;
}

export interface ErrorTypeInput {
  label: string;
}

// --- Trade ---
export interface Trade {
  id: string;
  journal_id: string;
  symbol: string;
  direction: Direction;
  opened_at: string;
  closed_at: string | null;
  timeframe: string | null;
  risk_percent: number | null;
  rr_planned: number | null;
  rr_realized: number | null;
  pnl_amount: number | null;
  commissions: number;
  swaps: number;
  emotion: Emotion | null;
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
}

export interface TradeInput {
  symbol: string;
  direction: Direction;
  opened_at: string;
  closed_at?: string | null;
  timeframe?: string | null;
  risk_percent?: number | null;
  rr_planned?: number | null;
  rr_realized?: number | null;
  pnl_amount?: number | null;
  commissions?: number;
  swaps?: number;
  emotion?: Emotion | null;
  notes?: string | null;
  custom_values?: Record<string, string>;
  error_type_ids?: string[];
  screenshot_entry_url?: string | null;
  screenshot_management_url?: string | null;
  screenshot_close_url?: string | null;
  breakeven_on_close?: boolean;
  closed_by_20h?: boolean;
  violation_flags?: number[];
}

// --- Stats calculées ---
export interface TradeStats {
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  avgRR: number;
  totalPnL: number;
  profitFactor: number;
  expectancy: number;
  maxDrawdown: number;
  currentDrawdown: number;
  grossWin: number;
  grossLoss: number;
  avgWin: number;
  avgLoss: number;
  consecutiveLosses: number;
  maxConsecutiveLosses: number;
}

export interface MonthlyResult {
  year: number;
  month: number;
  pnl: number;
  trades: number;
}

export interface RiskUsage {
  day: { used: number; limit: number | null; percentage: number };
  week: { used: number; limit: number | null; percentage: number };
  month: { used: number; limit: number | null; percentage: number };
}

export interface ComplianceReport {
  period: string;
  totalTrades: number;
  compliantTrades: number;
  nonCompliantTrades: number;
  complianceRate: number;
  avgPnLCompliant: number;
  avgPnLNonCompliant: number;
  pnlDifference: number;
}

// --- Garde-fous (9 items) ---
export interface ViolationGuard {
  index: number;
  label: string;
  description: string;
}

export const VIOLATION_GUARDS: ViolationGuard[] = [
  { index: 0, label: 'Jour non actif', description: 'Actif tradé un jour non listé comme « jour actif » pour cet actif' },
  { index: 1, label: 'Mois inactif', description: "Actif tradé pendant un mois listé comme « inactif »" },
  { index: 2, label: 'Ratio TP modifié', description: "Ratio de take profit changé « parce que ça semblait mieux »" },
  { index: 3, label: 'SL hors EMA50', description: "Stop loss placé ailleurs que sur l'EMA50" },
  { index: 4, label: 'BE sur mèche', description: "Break-even appliqué sur une mèche au lieu d'une clôture" },
  { index: 5, label: 'Confluence perso', description: "Confluence technique personnelle ajoutée (support/résistance, RSI, news…)" },
  { index: 6, label: 'Position ouverte après 20h', description: "Position laissée ouverte après 20h" },
  { index: 7, label: 'Entrée hors fenêtre', description: "Entrée avant 8h ou après 12h" },
  { index: 8, label: 'Démo sautée', description: "Étape « compte démo » sautée par impatience avant de passer en réel" },
];

// --- Emotion mapping ---
export const EMOTION_LABELS: Record<Emotion, { label: string; emoji: string }> = {
  calme: { label: 'Calme', emoji: '😌' },
  concentre: { label: 'Concentré', emoji: '🎯' },
  frustre: { label: 'Frustré', emoji: '😤' },
  anxieux: { label: 'Anxieux', emoji: '😰' },
  euphorique: { label: 'Euphorique', emoji: '🤩' },
  fatigue: { label: 'Fatigué', emoji: '😴' },
};

// --- Direction mapping ---
export const DIRECTION_LABELS: Record<Direction, { label: string; color: string; bg: string }> = {
  achat: { label: 'Achat', color: '#3ED9C4', bg: 'rgba(62, 217, 196, 0.12)' },
  vente: { label: 'Vente', color: '#E75D6E', bg: 'rgba(231, 93, 110, 0.12)' },
};

// --- Currencies ---
export const CURRENCIES: Currency[] = ['EUR', 'USD', 'GBP', 'CHF', 'XOF'];

// --- Time segments for session timeline ---
export interface TimeSegment {
  label: string;
  startHour: number;
  endHour: number;
  type: 'asia' | 'window' | 'management' | 'close';
  description: string;
}

export const TIME_SEGMENTS: TimeSegment[] = [
  { label: 'Asie', startHour: 0, endHour: 9, type: 'asia', description: "Session asiatique — consolidation (~20% du volume)" },
  { label: 'Exécution', startHour: 9, endHour: 13, type: 'window', description: "Fenêtre d'exécution autorisée — impulsion Londres (~50% du volume)" },
  { label: 'Gestion', startHour: 13, endHour: 20, type: 'management', description: 'Gestion des positions ouvertes' },
  { label: 'Clôture', startHour: 20, endHour: 24, type: 'close', description: 'Clôture forcée — toute position doit être fermée' },
];
