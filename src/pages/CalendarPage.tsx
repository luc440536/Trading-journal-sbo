import { useState } from 'react';
import { useJournal } from '@/contexts/JournalContext';
import { Navbar } from '@/components/ui/Navbar';
import { getNetPnL } from '@/utils/calculations';
import { isTradeCompliant } from '@/utils/calculations';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';

export function CalendarPage() {
  const { currentJournal, trades } = useJournal();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  if (!currentJournal) return null;

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getTradesForDay = (day: Date) => {
    return trades.filter((t) => isSameDay(new Date(t.opened_at), day));
  };

  const selectedTrades = selectedDate ? getTradesForDay(selectedDate) : [];
  const startDayOfWeek = (getDay(monthStart) + 6) % 7;
  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-heading text-xl font-bold text-text-primary">Calendrier</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-2 rounded-lg bg-bg-card border border-bg-border hover:border-text-muted text-text-secondary transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="font-heading font-semibold text-text-primary min-w-[140px] text-center">
              {format(currentDate, 'MMMM yyyy', { locale: fr })}
            </span>
            <button
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-2 rounded-lg bg-bg-card border border-bg-border hover:border-text-muted text-text-secondary transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2 bg-bg-card border border-bg-border rounded-xl p-5">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-text-muted text-xs font-medium py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startDayOfWeek }, (_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {days.map((day) => {
                const dayTrades = getTradesForDay(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isTodayDate = isToday(day);

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      aspect-square rounded-lg p-1 flex flex-col items-center justify-start
                      transition-all relative
                      ${isSelected ? 'ring-2 ring-accent-teal bg-bg-elevated' : 'hover:bg-bg-hover'}
                      ${isTodayDate && !isSelected ? 'ring-1 ring-alert' : ''}
                    `}
                  >
                    <span className={`text-sm font-mono ${isTodayDate ? 'text-alert font-bold' : 'text-text-primary'}`}>
                      {format(day, 'd')}
                    </span>
                    {dayTrades.length > 0 && (
                      <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                        {dayTrades.map((trade, i) => {
                          const pnl = getNetPnL(trade);
                          return (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full ${
                                pnl > 0 ? 'bg-accent-teal' : pnl < 0 ? 'bg-loss' : 'bg-alert'
                              }`}
                              title={`${trade.symbol} — ${pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} ${currentJournal.currency}`}
                            />
                          );
                        })}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Day Detail Panel */}
          <div className="bg-bg-card border border-bg-border rounded-xl p-5">
            <h3 className="font-heading font-semibold text-text-primary text-sm mb-4">
              {selectedDate
                ? format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })
                : 'Sélectionnez un jour'}
            </h3>
            {selectedTrades.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-8">
                {selectedDate ? 'Aucun trade ce jour' : 'Cliquez sur un jour pour voir les détails'}
              </p>
            ) : (
              <div className="space-y-3">
                {selectedTrades.map((trade) => {
                  const pnl = getNetPnL(trade);
                  const compliant = isTradeCompliant(trade);
                  return (
                    <div
                      key={trade.id}
                      className="p-3 rounded-lg bg-bg-elevated border border-bg-border"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-medium text-text-primary">{trade.symbol}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          compliant ? 'badge-compliant' : 'badge-violation'
                        }`}>
                          {compliant ? 'Conforme' : `${trade.violation_flags.length} écart`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-secondary">
                          {trade.direction === 'achat' ? 'Achat' : 'Vente'} • {trade.timeframe || '—'}
                        </span>
                        <span className={`font-mono font-medium ${pnl >= 0 ? 'text-accent-teal' : 'text-loss'}`}>
                          {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} {currentJournal.currency}
                        </span>
                      </div>
                      {trade.screenshot_entry_url && (
                        <img
                          src={trade.screenshot_entry_url}
                          alt="Entrée"
                          className="w-full h-20 object-cover rounded mt-2"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
