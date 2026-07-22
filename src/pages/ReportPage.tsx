import { useState, useMemo } from 'react';
import { useJournal } from '@/contexts/JournalContext';
import { Navbar } from '@/components/ui/Navbar';
import { getNetPnL, isTradeCompliant } from '@/utils/calculations';
import { formatCurrency, formatPercent } from '@/utils/calculations';
import { ShieldCheck, TrendingUp, AlertTriangle, Target } from 'lucide-react';

const PERIODS = [
  { label: '7 jours', days: 7 },
  { label: '30 jours', days: 30 },
  { label: '3 mois', days: 90 },
  { label: 'Tout', days: Infinity },
];

export function ReportPage() {
  const { currentJournal, trades } = useJournal();
  const [selectedPeriod, setSelectedPeriod] = useState(30);

  if (!currentJournal) return null;

  const cutoffDate = selectedPeriod === Infinity
    ? new Date(0)
    : new Date(Date.now() - selectedPeriod * 24 * 60 * 60 * 1000);

  const periodTrades = trades.filter((t) => new Date(t.opened_at) >= cutoffDate);

  const compliantTrades = periodTrades.filter(isTradeCompliant);
  const nonCompliantTrades = periodTrades.filter((t) => !isTradeCompliant(t));

  const compliantPnL = compliantTrades.reduce((sum, t) => sum + getNetPnL(t), 0);
  const nonCompliantPnL = nonCompliantTrades.reduce((sum, t) => sum + getNetPnL(t), 0);

  const avgPnLCompliant = compliantTrades.length > 0 ? compliantPnL / compliantTrades.length : 0;
  const avgPnLNonCompliant = nonCompliantTrades.length > 0 ? nonCompliantPnL / nonCompliantTrades.length : 0;

  const winRateCompliant = compliantTrades.length > 0
    ? (compliantTrades.filter((t) => getNetPnL(t) > 0).length / compliantTrades.length) * 100
    : 0;

  const winRateNonCompliant = nonCompliantTrades.length > 0
    ? (nonCompliantTrades.filter((t) => getNetPnL(t) > 0).length / nonCompliantTrades.length) * 100
    : 0;

  const pnlDifference = avgPnLCompliant - avgPnLNonCompliant;

  // By emotion
  const emotionStats = useMemo(() => {
    const map = new Map<string, { trades: number; wins: number; pnl: number }>();
    periodTrades.forEach((t) => {
      if (!t.emotion) return;
      const existing = map.get(t.emotion) || { trades: 0, wins: 0, pnl: 0 };
      const pnl = getNetPnL(t);
      map.set(t.emotion, {
        trades: existing.trades + 1,
        wins: existing.wins + (pnl > 0 ? 1 : 0),
        pnl: existing.pnl + pnl,
      });
    });
    return Array.from(map.entries()).map(([emotion, data]) => ({
      emotion,
      winRate: data.trades > 0 ? (data.wins / data.trades) * 100 : 0,
      ...data,
    }));
  }, [periodTrades]);

  // By symbol
  const symbolStats = useMemo(() => {
    const map = new Map<string, { trades: number; pnl: number }>();
    periodTrades.forEach((t) => {
      const existing = map.get(t.symbol) || { trades: 0, pnl: 0 };
      map.set(t.symbol, {
        trades: existing.trades + 1,
        pnl: existing.pnl + getNetPnL(t),
      });
    });
    return Array.from(map.entries()).sort((a, b) => b[1].pnl - a[1].pnl);
  }, [periodTrades]);

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="font-heading text-xl font-bold text-text-primary">Rapport de conformité</h1>
          <div className="flex gap-2">
            {PERIODS.map((p) => (
              <button
                key={p.label}
                onClick={() => setSelectedPeriod(p.days)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedPeriod === p.days
                    ? 'bg-accent-teal-glow text-accent-teal border border-accent-teal/30'
                    : 'bg-bg-card text-text-secondary border border-bg-border hover:border-text-muted'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-bg-card border border-bg-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Target size={14} className="text-accent-teal" />
              <span className="text-text-secondary text-xs font-medium uppercase">Trades</span>
            </div>
            <div className="font-mono text-2xl font-semibold text-text-primary">{periodTrades.length}</div>
          </div>
          <div className="bg-bg-card border border-bg-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={14} className="text-accent-teal" />
              <span className="text-text-secondary text-xs font-medium uppercase">Conformité</span>
            </div>
            <div className="font-mono text-2xl font-semibold text-accent-teal">
              {periodTrades.length > 0 ? formatPercent((compliantTrades.length / periodTrades.length) * 100) : '0%'}
            </div>
          </div>
          <div className="bg-bg-card border border-bg-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={14} className="text-accent-teal" />
              <span className="text-text-secondary text-xs font-medium uppercase">Perf. cumulée</span>
            </div>
            <div className={`font-mono text-2xl font-semibold ${compliantPnL + nonCompliantPnL >= 0 ? 'text-accent-teal' : 'text-loss'}`}>
              {formatCurrency(compliantPnL + nonCompliantPnL, currentJournal.currency)}
            </div>
          </div>
          <div className="bg-bg-card border border-bg-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={14} className="text-loss" />
              <span className="text-text-secondary text-xs font-medium uppercase">Hors règles</span>
            </div>
            <div className="font-mono text-2xl font-semibold text-loss">
              {nonCompliantTrades.length} ({periodTrades.length > 0 ? formatPercent((nonCompliantTrades.length / periodTrades.length) * 100) : '0%'})
            </div>
          </div>
        </div>

        {/* Key Comparison */}
        <div className="bg-bg-card border border-bg-border rounded-xl p-6 mb-6">
          <h2 className="font-heading font-semibold text-text-primary text-lg mb-4">
            Impact de la discipline sur la performance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-lg bg-accent-teal-glow border border-accent-teal/20">
              <h3 className="text-accent-teal font-medium text-sm mb-3">Trades conformes</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-text-secondary text-sm">Nombre</span>
                  <span className="font-mono text-text-primary">{compliantTrades.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary text-sm">Win rate</span>
                  <span className="font-mono text-accent-teal">{formatPercent(winRateCompliant)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary text-sm">P&L moyen / trade</span>
                  <span className={`font-mono ${avgPnLCompliant >= 0 ? 'text-accent-teal' : 'text-loss'}`}>
                    {formatCurrency(avgPnLCompliant, currentJournal.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary text-sm">P&L total</span>
                  <span className={`font-mono font-semibold ${compliantPnL >= 0 ? 'text-accent-teal' : 'text-loss'}`}>
                    {formatCurrency(compliantPnL, currentJournal.currency)}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-loss-glow border border-loss/20">
              <h3 className="text-loss font-medium text-sm mb-3">Trades avec écarts</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-text-secondary text-sm">Nombre</span>
                  <span className="font-mono text-text-primary">{nonCompliantTrades.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary text-sm">Win rate</span>
                  <span className="font-mono text-loss">{formatPercent(winRateNonCompliant)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary text-sm">P&L moyen / trade</span>
                  <span className={`font-mono ${avgPnLNonCompliant >= 0 ? 'text-accent-teal' : 'text-loss'}`}>
                    {formatCurrency(avgPnLNonCompliant, currentJournal.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary text-sm">P&L total</span>
                  <span className={`font-mono font-semibold ${nonCompliantPnL >= 0 ? 'text-accent-teal' : 'text-loss'}`}>
                    {formatCurrency(nonCompliantPnL, currentJournal.currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Difference highlight */}
          <div className={`mt-4 p-4 rounded-lg text-center ${
            pnlDifference > 0 ? 'bg-accent-teal-glow border border-accent-teal/20' : 'bg-loss-glow border border-loss/20'
          }`}>
            <p className="text-text-secondary text-sm mb-1">
              Différence moyenne par trade (conforme vs écart)
            </p>
            <p className={`font-mono text-2xl font-bold ${pnlDifference > 0 ? 'text-accent-teal' : 'text-loss'}`}>
              {pnlDifference > 0 ? '+' : ''}{formatCurrency(pnlDifference, currentJournal.currency)}
            </p>
            <p className="text-text-muted text-xs mt-1">
              {pnlDifference > 0
                ? 'La discipline paie — les trades conformes performent mieux en moyenne'
                : 'Attention — les écarts ne pénalisent pas encore visiblement'}
            </p>
          </div>
        </div>

        {/* Emotion Impact */}
        {emotionStats.length > 0 && (
          <div className="bg-bg-card border border-bg-border rounded-xl p-5 mb-6">
            <h2 className="font-heading font-semibold text-text-primary text-sm mb-4">
              Impact de l'état émotionnel
            </h2>
            <div className="space-y-3">
              {emotionStats.map((stat) => (
                <div key={stat.emotion}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-text-primary text-sm capitalize">{stat.emotion}</span>
                    <span className="font-mono text-xs">
                      <span className={stat.winRate >= 50 ? 'text-accent-teal' : 'text-loss'}>
                        {formatPercent(stat.winRate)}
                      </span>
                      {' '}win rate • {formatCurrency(stat.pnl, currentJournal.currency)}
                    </span>
                  </div>
                  <div className="h-2 bg-bg-elevated rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${stat.winRate >= 50 ? 'bg-accent-teal' : 'bg-loss'}`}
                      style={{ width: `${Math.min(stat.winRate, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Best/Worst Symbol */}
        {symbolStats.length > 0 && (
          <div className="bg-bg-card border border-bg-border rounded-xl p-5">
            <h2 className="font-heading font-semibold text-text-primary text-sm mb-4">
              Performance par actif
            </h2>
            <div className="space-y-3">
              {symbolStats.map(([symbol, data]) => (
                <div key={symbol}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-text-primary text-sm">{symbol}</span>
                    <span className={`font-mono text-xs ${data.pnl >= 0 ? 'text-accent-teal' : 'text-loss'}`}>
                      {formatCurrency(data.pnl, currentJournal.currency)} ({data.trades} trades)
                    </span>
                  </div>
                  <div className="h-2 bg-bg-elevated rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${data.pnl >= 0 ? 'bg-accent-teal' : 'bg-loss'}`}
                      style={{ width: `${(Math.abs(data.pnl) / Math.max(...symbolStats.map(([, d]) => Math.abs(d.pnl)))) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
