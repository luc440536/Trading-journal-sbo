import { useEffect } from 'react';
import { useParams } from 'react-router';
import { useJournal } from '@/contexts/JournalContext';
import { Navbar } from '@/components/ui/Navbar';
import { SessionTimeline } from '@/components/ui/SessionTimeline';
import { StatCard } from '@/components/ui/StatCard';
import { RiskBar } from '@/components/ui/RiskBar';
import {
  calculateStats, calculateEquityCurve, calculateMonthlyResults,
  calculateRiskUsage, formatCurrency, formatPercent, formatRR
} from '@/utils/calculations';
import { Link } from 'react-router';
import {
  Plus, TrendingUp, Target, BarChart3, Activity, AlertTriangle, Zap
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';

export function DashboardPage() {
  const { id } = useParams<{ id: string }>();
  const { currentJournal, trades, loadJournal, loading } = useJournal();

  useEffect(() => {
    if (id && (!currentJournal || currentJournal.id !== id)) {
      loadJournal(id);
    }
  }, [id, currentJournal, loadJournal]);

  if (loading || !currentJournal) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-teal border-t-transparent" />
      </div>
    );
  }

  const stats = calculateStats(trades);
  const equityCurve = calculateEquityCurve(trades);
  const monthlyResults = calculateMonthlyResults(trades);
  const riskUsage = calculateRiskUsage(
    trades,
    currentJournal.risk_limit_day,
    currentJournal.risk_limit_week,
    currentJournal.risk_limit_month
  );

  const barData = monthlyResults.map((m) => ({
    name: `${String(m.month + 1).padStart(2, '0')}/${m.year}`,
    pnl: m.pnl,
    trades: m.trades,
  }));

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Session Timeline */}
        <SessionTimeline />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-xl font-bold text-text-primary">
              {currentJournal.name}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                currentJournal.account_type === 'demo' ? 'badge-demo' : 'badge-live'
              }`}>
                {currentJournal.account_type === 'demo' ? 'DÉMO' : 'RÉEL'}
              </span>
              <span className="font-mono text-text-secondary text-sm">
                {currentJournal.starting_capital.toLocaleString('fr-FR')} {currentJournal.currency}
              </span>
            </div>
          </div>
          <Link
            to={`/journals/${id}/trades`}
            className="flex items-center gap-2 bg-accent-teal hover:bg-accent-teal-dim text-bg-primary font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Nouveau trade</span>
          </Link>
        </div>

        {/* Primary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard
            label="Trades"
            value={stats.totalTrades}
            subtext={`${stats.wins} G / ${stats.losses} P`}
            icon={<BarChart3 size={16} />}
          />
          <StatCard
            label="Win Rate"
            value={formatPercent(stats.winRate)}
            color={stats.winRate >= 50 ? 'positive' : 'negative'}
            icon={<Target size={16} />}
          />
          <StatCard
            label="R:R Moyen"
            value={formatRR(stats.avgRR)}
            color={stats.avgRR >= 1 ? 'positive' : 'negative'}
            icon={<TrendingUp size={16} />}
          />
          <StatCard
            label="P&L Total"
            value={formatCurrency(stats.totalPnL, currentJournal.currency)}
            color={stats.totalPnL >= 0 ? 'positive' : 'negative'}
            icon={<Activity size={16} />}
          />
          <StatCard
            label="Drawdown Max"
            value={formatCurrency(stats.maxDrawdown, currentJournal.currency)}
            color="alert"
            icon={<AlertTriangle size={16} />}
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Profit Factor"
            value={stats.profitFactor === Infinity ? '∞' : stats.profitFactor.toFixed(2)}
            color={stats.profitFactor >= 1.5 ? 'positive' : stats.profitFactor >= 1 ? 'default' : 'negative'}
            subtext="Objectif > 1.5"
          />
          <StatCard
            label="Espérance / Trade"
            value={formatCurrency(stats.expectancy, currentJournal.currency)}
            color={stats.expectancy >= 0 ? 'positive' : 'negative'}
          />
          <StatCard
            label="Pertes consécutives"
            value={stats.maxConsecutiveLosses}
            color={stats.maxConsecutiveLosses >= 3 ? 'alert' : 'default'}
          />
          <StatCard
            label="Drawdown courant"
            value={formatCurrency(stats.currentDrawdown, currentJournal.currency)}
            color={stats.currentDrawdown > 0 ? 'alert' : 'positive'}
          />
        </div>

        {/* Risk Limits */}
        {(currentJournal.risk_limit_day || currentJournal.risk_limit_week || currentJournal.risk_limit_month) && (
          <div className="bg-bg-card border border-bg-border rounded-xl p-5">
            <h3 className="font-heading font-semibold text-text-primary text-sm mb-4 flex items-center gap-2">
              <Zap size={14} className="text-alert" />
              Limites de risque
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {currentJournal.risk_limit_day && (
                <RiskBar
                  label="Journalier"
                  used={riskUsage.day.used}
                  limit={riskUsage.day.limit}
                  percentage={riskUsage.day.percentage}
                  currency={currentJournal.currency}
                />
              )}
              {currentJournal.risk_limit_week && (
                <RiskBar
                  label="Hebdomadaire"
                  used={riskUsage.week.used}
                  limit={riskUsage.week.limit}
                  percentage={riskUsage.week.percentage}
                  currency={currentJournal.currency}
                />
              )}
              {currentJournal.risk_limit_month && (
                <RiskBar
                  label="Mensuel"
                  used={riskUsage.month.used}
                  limit={riskUsage.month.limit}
                  percentage={riskUsage.month.percentage}
                  currency={currentJournal.currency}
                />
              )}
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Equity Curve */}
          <div className="bg-bg-card border border-bg-border rounded-xl p-5">
            <h3 className="font-heading font-semibold text-text-primary text-sm mb-4">
              Courbe d'équité
            </h3>
            {equityCurve.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={equityCurve}>
                  <defs>
                    <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3ED9C4" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#3ED9C4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A2230" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ background: '#111820', border: '1px solid #253044', borderRadius: '8px' }}
                    itemStyle={{ color: '#F0F2F5', fontFamily: 'IBM Plex Mono' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="equity"
                    stroke="#3ED9C4"
                    strokeWidth={2}
                    fill="url(#equityGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-text-muted text-sm">
                Aucune donnée
              </div>
            )}
          </div>

          {/* Monthly Results */}
          <div className="bg-bg-card border border-bg-border rounded-xl p-5">
            <h3 className="font-heading font-semibold text-text-primary text-sm mb-4">
              Résultats mensuels
            </h3>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A2230" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ background: '#111820', border: '1px solid #253044', borderRadius: '8px' }}
                    itemStyle={{ color: '#F0F2F5', fontFamily: 'IBM Plex Mono' }}
                  />
                  <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={index} fill={entry.pnl >= 0 ? '#3ED9C4' : '#E75D6E'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-text-muted text-sm">
                Aucune donnée
              </div>
            )}
          </div>
        </div>

        {/* Monthly Table */}
        {monthlyResults.length > 0 && (
          <div className="bg-bg-card border border-bg-border rounded-xl p-5 overflow-x-auto">
            <h3 className="font-heading font-semibold text-text-primary text-sm mb-4">
              Table mensuelle
            </h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-bg-border">
                  <th className="text-left text-text-muted font-medium py-2 px-3">Année</th>
                  {['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'].map((m) => (
                    <th key={m} className="text-right text-text-muted font-medium py-2 px-2 text-xs">{m}</th>
                  ))}
                  <th className="text-right text-text-primary font-medium py-2 px-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {Array.from(new Set(monthlyResults.map((r) => r.year))).map((year) => {
                  const yearData = monthlyResults.filter((r) => r.year === year);
                  const yearTotal = yearData.reduce((sum, r) => sum + r.pnl, 0);
                  return (
                    <tr key={year} className="border-b border-bg-border/50 hover:bg-bg-hover transition-colors">
                      <td className="py-2 px-3 font-mono text-text-primary">{year}</td>
                      {Array.from({ length: 12 }, (_, i) => {
                        const monthData = yearData.find((r) => r.month === i);
                        return (
                          <td key={i} className={`py-2 px-2 text-right font-mono text-xs ${
                            monthData ? (monthData.pnl >= 0 ? 'text-accent-teal' : 'text-loss') : 'text-text-muted'
                          }`}>
                            {monthData ? formatCurrency(monthData.pnl, currentJournal.currency) : '—'}
                          </td>
                        );
                      })}
                      <td className={`py-2 px-3 text-right font-mono font-medium ${
                        yearTotal >= 0 ? 'text-accent-teal' : 'text-loss'
                      }`}>
                        {formatCurrency(yearTotal, currentJournal.currency)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
