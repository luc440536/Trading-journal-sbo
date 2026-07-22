import { useState, useMemo } from 'react';
import { useJournal } from '@/contexts/JournalContext';
import { Navbar } from '@/components/ui/Navbar';
import { getNetPnL, formatCurrency } from '@/utils/calculations';
import { BarChart3, TrendingUp, AlertCircle } from 'lucide-react';

export function AnalysisPage() {
  const { currentJournal, trades, customFields, errorTypes } = useJournal();
  const [symbolFilter, setSymbolFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');

  if (!currentJournal) return null;

  const symbols = useMemo(() => Array.from(new Set(trades.map((t) => t.symbol))), [trades]);
  const months = useMemo(() => {
    const ms = new Map<string, string>();
    trades.forEach((t) => {
      const d = new Date(t.opened_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      ms.set(key, `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`);
    });
    return Array.from(ms.entries()).sort();
  }, [trades]);

  const filteredTrades = trades.filter((t) => {
    const matchesSymbol = symbolFilter === 'all' || t.symbol === symbolFilter;
    const d = new Date(t.opened_at);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const matchesMonth = monthFilter === 'all' || monthKey === monthFilter;
    return matchesSymbol && matchesMonth;
  });

  const bySymbol = useMemo(() => {
    const map = new Map<string, { pnl: number; trades: number; wins: number }>();
    filteredTrades.forEach((t) => {
      const pnl = getNetPnL(t);
      const existing = map.get(t.symbol) || { pnl: 0, trades: 0, wins: 0 };
      map.set(t.symbol, {
        pnl: existing.pnl + pnl,
        trades: existing.trades + 1,
        wins: existing.wins + (pnl > 0 ? 1 : 0),
      });
    });
    return Array.from(map.entries()).sort((a, b) => b[1].pnl - a[1].pnl);
  }, [filteredTrades]);

  const byDayOfWeek = useMemo(() => {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const map = new Map<number, { pnl: number; trades: number }>();
    filteredTrades.forEach((t) => {
      const day = new Date(t.opened_at).getDay();
      const pnl = getNetPnL(t);
      const existing = map.get(day) || { pnl: 0, trades: 0 };
      map.set(day, { pnl: existing.pnl + pnl, trades: existing.trades + 1 });
    });
    return Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([day, data]) => ({ day: days[day], ...data }));
  }, [filteredTrades]);

  const errorFrequency = useMemo(() => {
    const map = new Map<string, number>();
    filteredTrades.forEach((t) => {
      t.error_type_ids.forEach((eid) => {
        const label = errorTypes.find((et) => et.id === eid)?.label || eid;
        map.set(label, (map.get(label) || 0) + 1);
      });
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [filteredTrades, errorTypes]);

  const customFieldStats = useMemo(() => {
    return customFields.map((field) => {
      const valueCounts = new Map<string, { count: number; pnl: number }>();
      filteredTrades.forEach((t) => {
        const val = t.custom_values?.[field.id];
        if (val) {
          const existing = valueCounts.get(val) || { count: 0, pnl: 0 };
          valueCounts.set(val, {
            count: existing.count + 1,
            pnl: existing.pnl + getNetPnL(t),
          });
        }
      });
      return {
        field,
        values: Array.from(valueCounts.entries()).sort((a, b) => b[1].count - a[1].count),
      };
    });
  }, [filteredTrades, customFields]);

  const maxBarValue = Math.max(...bySymbol.map(([, d]) => Math.abs(d.pnl)), 1);

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <h1 className="font-heading text-xl font-bold text-text-primary mb-6">Analyse</h1>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <select
            value={symbolFilter}
            onChange={(e) => setSymbolFilter(e.target.value)}
            className="rounded-lg px-3 py-2.5 text-sm"
          >
            <option value="all">Tous les symboles</option>
            {symbols.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="rounded-lg px-3 py-2.5 text-sm"
          >
            <option value="all">Tous les mois</option>
            {months.map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* By Symbol */}
          <div className="bg-bg-card border border-bg-border rounded-xl p-5">
            <h3 className="font-heading font-semibold text-text-primary text-sm mb-4 flex items-center gap-2">
              <BarChart3 size={14} className="text-accent-teal" />
              Résultat par symbole
            </h3>
            {bySymbol.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-8">Aucune donnée</p>
            ) : (
              <div className="space-y-3">
                {bySymbol.map(([symbol, data]) => (
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
                        style={{ width: `${(Math.abs(data.pnl) / maxBarValue) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* By Day of Week */}
          <div className="bg-bg-card border border-bg-border rounded-xl p-5">
            <h3 className="font-heading font-semibold text-text-primary text-sm mb-4 flex items-center gap-2">
              <TrendingUp size={14} className="text-accent-teal" />
              Résultat par jour de semaine
            </h3>
            {byDayOfWeek.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-8">Aucune donnée</p>
            ) : (
              <div className="space-y-3">
                {byDayOfWeek.map((day) => (
                  <div key={day.day}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-text-primary text-sm">{day.day}</span>
                      <span className={`font-mono text-xs ${day.pnl >= 0 ? 'text-accent-teal' : 'text-loss'}`}>
                        {formatCurrency(day.pnl, currentJournal.currency)} ({day.trades})
                      </span>
                    </div>
                    <div className="h-2 bg-bg-elevated rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${day.pnl >= 0 ? 'bg-accent-teal' : 'bg-loss'}`}
                        style={{ width: `${(Math.abs(day.pnl) / maxBarValue) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error Frequency */}
          <div className="bg-bg-card border border-bg-border rounded-xl p-5">
            <h3 className="font-heading font-semibold text-text-primary text-sm mb-4 flex items-center gap-2">
              <AlertCircle size={14} className="text-loss" />
              Fréquence des erreurs
            </h3>
            {errorFrequency.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-8">Aucune erreur enregistrée</p>
            ) : (
              <div className="space-y-3">
                {errorFrequency.map(([label, count]) => (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-text-primary text-sm">{label}</span>
                      <span className="font-mono text-loss text-xs">{count} fois</span>
                    </div>
                    <div className="h-2 bg-bg-elevated rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-loss"
                        style={{ width: `${(count / Math.max(...errorFrequency.map(([, c]) => c))) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Custom Fields */}
          {customFieldStats.map(({ field, values }) => (
            values.length > 0 && (
              <div key={field.id} className="bg-bg-card border border-bg-border rounded-xl p-5">
                <h3 className="font-heading font-semibold text-text-primary text-sm mb-4">
                  {field.name}
                </h3>
                <div className="space-y-3">
                  {values.map(([val, data]) => (
                    <div key={val}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-text-primary text-sm">{val}</span>
                        <span className={`font-mono text-xs ${data.pnl >= 0 ? 'text-accent-teal' : 'text-loss'}`}>
                          {formatCurrency(data.pnl, currentJournal.currency)} ({data.count})
                        </span>
                      </div>
                      <div className="h-2 bg-bg-elevated rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${data.pnl >= 0 ? 'bg-accent-teal' : 'bg-loss'}`}
                          style={{ width: `${(data.count / Math.max(...values.map(([, d]) => d.count))) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      </main>
    </div>
  );
}
