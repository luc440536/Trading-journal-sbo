import type { Trade, TradeStats, MonthlyResult, RiskUsage } from '@/types';

/**
 * P&L net = pnl_amount - commissions - swaps
 */
export function getNetPnL(trade: Trade): number {
  const pnl = trade.pnl_amount ?? 0;
  return pnl - trade.commissions - trade.swaps;
}

/**
 * Vérifie si un trade est conforme (aucun garde-fou enfreint)
 */
export function isTradeCompliant(trade: Trade): boolean {
  return trade.violation_flags.length === 0;
}

/**
 * Calcule toutes les statistiques à partir d'une liste de trades
 */
export function calculateStats(trades: Trade[]): TradeStats {
  const totalTrades = trades.length;
  if (totalTrades === 0) {
    return {
      totalTrades: 0, wins: 0, losses: 0, winRate: 0, avgRR: 0,
      totalPnL: 0, profitFactor: 0, expectancy: 0, maxDrawdown: 0,
      currentDrawdown: 0, grossWin: 0, grossLoss: 0, avgWin: 0, avgLoss: 0,
      consecutiveLosses: 0, maxConsecutiveLosses: 0,
    };
  }

  const netPnLs = trades.map(getNetPnL);
  const wins = netPnLs.filter((pnl) => pnl > 0).length;
  const losses = totalTrades - wins;
  const winRate = (wins / totalTrades) * 100;

  // R:R moyen (sur les trades où rr_realized est renseigné)
  const rrValues = trades
    .map((t) => t.rr_realized)
    .filter((rr): rr is number => rr !== null && rr !== undefined);
  const avgRR = rrValues.length > 0
    ? rrValues.reduce((a, b) => a + b, 0) / rrValues.length
    : 0;

  // P&L total
  const totalPnL = netPnLs.reduce((a, b) => a + b, 0);

  // Gross win / loss
  const grossWin = netPnLs.filter((pnl) => pnl > 0).reduce((a, b) => a + b, 0);
  const grossLoss = Math.abs(netPnLs.filter((pnl) => pnl < 0).reduce((a, b) => a + b, 0));

  // Profit factor
  let profitFactor: number;
  if (grossLoss === 0 && grossWin > 0) profitFactor = Infinity;
  else if (grossWin === 0 && grossLoss === 0) profitFactor = 0;
  else profitFactor = grossWin / grossLoss;

  // Avg win / loss
  const avgWin = wins > 0 ? grossWin / wins : 0;
  const avgLoss = losses > 0 ? grossLoss / losses : 0;

  // Expectancy
  const wr = wins / totalTrades;
  const expectancy = (wr * avgWin) - ((1 - wr) * avgLoss);

  // Drawdown (max et courant)
  let equity = 0;
  let peak = 0;
  let maxDrawdown = 0;
  let currentDrawdown = 0;
  let consecutiveLosses = 0;
  let maxConsecutiveLosses = 0;

  for (const pnl of netPnLs) {
    equity += pnl;
    if (equity > peak) peak = equity;
    const dd = peak - equity;
    if (dd > maxDrawdown) maxDrawdown = dd;
    currentDrawdown = dd;

    if (pnl < 0) {
      consecutiveLosses++;
      if (consecutiveLosses > maxConsecutiveLosses) {
        maxConsecutiveLosses = consecutiveLosses;
      }
    } else {
      consecutiveLosses = 0;
    }
  }

  return {
    totalTrades, wins, losses, winRate, avgRR, totalPnL,
    profitFactor, expectancy, maxDrawdown, currentDrawdown,
    grossWin, grossLoss, avgWin, avgLoss, consecutiveLosses, maxConsecutiveLosses,
  };
}

/**
 * Résultats mensuels
 */
export function calculateMonthlyResults(trades: Trade[]): MonthlyResult[] {
  const grouped = new Map<string, MonthlyResult>();

  for (const trade of trades) {
    const date = new Date(trade.opened_at);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const existing = grouped.get(key);
    const pnl = getNetPnL(trade);

    if (existing) {
      existing.pnl += pnl;
      existing.trades += 1;
    } else {
      grouped.set(key, {
        year: date.getFullYear(),
        month: date.getMonth(),
        pnl,
        trades: 1,
      });
    }
  }

  return Array.from(grouped.values()).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });
}

/**
 * Courbe d'équité (cumulée)
 */
export function calculateEquityCurve(trades: Trade[]): { date: string; equity: number }[] {
  const sorted = [...trades].sort(
    (a, b) => new Date(a.opened_at).getTime() - new Date(b.opened_at).getTime()
  );

  let equity = 0;
  return sorted.map((trade) => {
    equity += getNetPnL(trade);
    return {
      date: trade.opened_at.split('T')[0],
      equity,
    };
  });
}

/**
 * Usage du risque (jour / semaine / mois)
 */
export function calculateRiskUsage(
  trades: Trade[],
  riskLimitDay: number | null,
  riskLimitWeek: number | null,
  riskLimitMonth: number | null
): RiskUsage {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  // Début de la semaine (lundi)
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  const weekStart = monday.toISOString().split('T')[0];

  // Début du mois
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

  const dayLosses = sumLosses(trades, today);
  const weekLosses = sumLosses(trades, weekStart);
  const monthLosses = sumLosses(trades, monthStart);

  return {
    day: {
      used: dayLosses,
      limit: riskLimitDay,
      percentage: riskLimitDay ? (dayLosses / riskLimitDay) * 100 : 0,
    },
    week: {
      used: weekLosses,
      limit: riskLimitWeek,
      percentage: riskLimitWeek ? (weekLosses / riskLimitWeek) * 100 : 0,
    },
    month: {
      used: monthLosses,
      limit: riskLimitMonth,
      percentage: riskLimitMonth ? (monthLosses / riskLimitMonth) * 100 : 0,
    },
  };
}

function sumLosses(trades: Trade[], fromDate: string): number {
  return trades
    .filter((t) => t.opened_at >= fromDate)
    .reduce((sum, t) => {
      const pnl = getNetPnL(t);
      return pnl < 0 ? sum + Math.abs(pnl) : sum;
    }, 0);
}

/**
 * Calibration du risque par actif (money management)
 */
export function calculateRiskCalibration(
  accountDrawdownLimit: number,
  securityMargin: number,
  assetHistoricalDrawdown: number
): number {
  // risque_conseillé (%) = (limite_drawdown_compte / marge_sécurité) / drawdown_historique_actif
  return (accountDrawdownLimit / securityMargin) / assetHistoricalDrawdown;
}

/**
 * Formatage monétaire
 */
export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formatage pourcentage
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Formatage R:R
 */
export function formatRR(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}R`;
}
