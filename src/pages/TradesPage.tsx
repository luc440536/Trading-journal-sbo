import { useState } from 'react';
import { useJournal } from '@/contexts/JournalContext';
import { Navbar } from '@/components/ui/Navbar';
import { TradeForm } from '@/components/trades/TradeForm';
import { getNetPnL, formatCurrency, formatRR } from '@/utils/calculations';
import { isTradeCompliant } from '@/utils/calculations';
import { DIRECTION_LABELS, EMOTION_LABELS } from '@/types';
import { Plus, Search, Edit3, Image, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TradesPage() {
  const { currentJournal, trades, refreshTrades } = useJournal();
  const [showForm, setShowForm] = useState(false);
  const [editingTrade, setEditingTrade] = useState<typeof trades[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [directionFilter, setDirectionFilter] = useState<'all' | 'achat' | 'vente'>('all');

  const filteredTrades = trades.filter((trade) => {
    const matchesSearch = !searchQuery ||
      trade.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (trade.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesDirection = directionFilter === 'all' || trade.direction === directionFilter;
    return matchesSearch && matchesDirection;
  });

  const handleEdit = (trade: typeof trades[0]) => {
    setEditingTrade(trade);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTrade(null);
  };

  if (!currentJournal) return null;

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-heading text-xl font-bold text-text-primary">
              Trades
            </h1>
            <p className="text-text-secondary text-sm mt-1">
              {filteredTrades.length} trade{filteredTrades.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => { setEditingTrade(null); setShowForm(true); }}
            className="flex items-center justify-center gap-2 bg-accent-teal hover:bg-accent-teal-dim text-bg-primary font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            <Plus size={18} />
            Nouveau trade
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par symbole ou notes..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'achat', 'vente'] as const).map((dir) => (
              <button
                key={dir}
                onClick={() => setDirectionFilter(dir)}
                className={cn(
                  'px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
                  directionFilter === dir
                    ? 'bg-bg-elevated text-text-primary border border-text-muted'
                    : 'bg-bg-card text-text-muted border border-bg-border hover:border-text-muted'
                )}
              >
                {dir === 'all' ? 'Tous' : dir === 'achat' ? 'Achat' : 'Vente'}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {filteredTrades.length === 0 ? (
          <div className="bg-bg-card border border-bg-border border-dashed rounded-xl p-12 text-center">
            <p className="text-text-muted text-sm">Aucun trade ne correspond aux filtres</p>
          </div>
        ) : (
          <div className="bg-bg-card border border-bg-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-bg-border bg-bg-elevated">
                    <th className="text-left text-text-muted font-medium py-3 px-4">Date</th>
                    <th className="text-left text-text-muted font-medium py-3 px-4">Symbole</th>
                    <th className="text-left text-text-muted font-medium py-3 px-4">Sens</th>
                    <th className="text-left text-text-muted font-medium py-3 px-4">TF</th>
                    <th className="text-right text-text-muted font-medium py-3 px-4">Risque</th>
                    <th className="text-right text-text-muted font-medium py-3 px-4">R:R</th>
                    <th className="text-right text-text-muted font-medium py-3 px-4">P&L</th>
                    <th className="text-left text-text-muted font-medium py-3 px-4">Émotion</th>
                    <th className="text-left text-text-muted font-medium py-3 px-4">Conformité</th>
                    <th className="text-center text-text-muted font-medium py-3 px-4">📷</th>
                    <th className="text-right text-text-muted font-medium py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrades.map((trade) => {
                    const netPnL = getNetPnL(trade);
                    const compliant = isTradeCompliant(trade);
                    const dir = DIRECTION_LABELS[trade.direction];
                    const hasScreenshots = trade.screenshot_entry_url || trade.screenshot_management_url || trade.screenshot_close_url;

                    return (
                      <tr
                        key={trade.id}
                        className="border-b border-bg-border/50 table-row-hover cursor-pointer"
                        onClick={() => handleEdit(trade)}
                      >
                        <td className="py-3 px-4 font-mono text-text-secondary text-xs">
                          {new Date(trade.opened_at).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-text-primary">
                          {trade.symbol}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                            style={{ background: dir.bg, color: dir.color }}
                          >
                            {dir.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-text-secondary text-xs">
                          {trade.timeframe || '—'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-text-secondary text-xs">
                          {trade.risk_percent ? `${trade.risk_percent}%` : '—'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-xs">
                          <span className={trade.rr_realized && trade.rr_realized >= 0 ? 'text-accent-teal' : 'text-loss'}>
                            {trade.rr_realized ? formatRR(trade.rr_realized) : '—'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-medium">
                          <span className={netPnL >= 0 ? 'text-accent-teal' : 'text-loss'}>
                            {formatCurrency(netPnL, currentJournal.currency)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-text-secondary text-xs">
                          {trade.emotion ? `${EMOTION_LABELS[trade.emotion].emoji} ${EMOTION_LABELS[trade.emotion].label}` : '—'}
                        </td>
                        <td className="py-3 px-4">
                          {compliant ? (
                            <span className="inline-flex items-center gap-1 badge-compliant px-2 py-0.5 rounded text-xs font-medium">
                              <CheckCircle2 size={12} />
                              Conforme
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 badge-violation px-2 py-0.5 rounded text-xs font-medium">
                              <XCircle size={12} />
                              {trade.violation_flags.length} écart{trade.violation_flags.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {hasScreenshots && <Image size={14} className="text-accent-teal mx-auto" />}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleEdit(trade)}
                              className="p-1.5 text-text-muted hover:text-text-primary rounded transition-colors"
                            >
                              <Edit3 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Trade Form Modal */}
        {showForm && (
          <TradeForm
            trade={editingTrade}
            onClose={handleCloseForm}
            onSuccess={refreshTrades}
          />
        )}
      </main>
    </div>
  );
}
