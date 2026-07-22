import { useState, useRef, useCallback } from 'react';
import { useJournal } from '@/contexts/JournalContext';
import { useTrades } from '@/hooks/useTrades';
import { useAuth } from '@/contexts/AuthContext';
import { uploadScreenshot, deleteScreenshot } from '@/lib/supabase';
import type { Trade, TradeInput, Direction, Emotion } from '@/types';
import { DIRECTION_LABELS, EMOTION_LABELS, VIOLATION_GUARDS } from '@/types';
import {
  X, Upload, Image, Trash2, ChevronDown, ChevronUp, AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TradeFormProps {
  trade?: Trade | null;
  onClose: () => void;
  onSuccess: () => void;
}

type ScreenshotSlot = 'entry' | 'management' | 'close';

const SCREENSHOT_LABELS: Record<ScreenshotSlot, string> = {
  entry: 'Entrée',
  management: 'Management',
  close: 'Clôture',
};

export function TradeForm({ trade, onClose, onSuccess }: TradeFormProps) {
  const { user } = useAuth();
  const { currentJournal, customFields, errorTypes } = useJournal();
  const { createTrade, updateTrade, deleteTrade, loading } = useTrades();
  const fileInputRefs = useRef<Record<ScreenshotSlot, HTMLInputElement | null>>({
    entry: null, management: null, close: null,
  });

  const isEdit = !!trade;

  const [formData, setFormData] = useState<TradeInput>({
    symbol: trade?.symbol ?? '',
    direction: trade?.direction ?? 'achat',
    opened_at: trade?.opened_at
      ? new Date(trade.opened_at).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
    closed_at: trade?.closed_at
      ? new Date(trade.closed_at).toISOString().slice(0, 16)
      : '',
    timeframe: trade?.timeframe ?? '',
    risk_percent: trade?.risk_percent ?? undefined,
    rr_planned: trade?.rr_planned ?? undefined,
    rr_realized: trade?.rr_realized ?? undefined,
    pnl_amount: trade?.pnl_amount ?? undefined,
    commissions: trade?.commissions ?? 0,
    swaps: trade?.swaps ?? 0,
    emotion: trade?.emotion ?? null,
    notes: trade?.notes ?? '',
    custom_values: trade?.custom_values ?? {},
    error_type_ids: trade?.error_type_ids ?? [],
    screenshot_entry_url: trade?.screenshot_entry_url ?? null,
    screenshot_management_url: trade?.screenshot_management_url ?? null,
    screenshot_close_url: trade?.screenshot_close_url ?? null,
    breakeven_on_close: trade?.breakeven_on_close ?? false,
    closed_by_20h: trade?.closed_by_20h ?? true,
    violation_flags: trade?.violation_flags ?? [],
  });

  const [uploading, setUploading] = useState<Record<ScreenshotSlot, boolean>>({
    entry: false, management: false, close: false,
  });
  const [dragOver, setDragOver] = useState<Record<ScreenshotSlot, boolean>>({
    entry: false, management: false, close: false,
  });

  const handleChange = <K extends keyof TradeInput>(
    field: K,
    value: TradeInput[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCustomValueChange = (fieldId: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      custom_values: { ...prev.custom_values, [fieldId]: value },
    }));
  };

  const toggleErrorType = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      error_type_ids: prev.error_type_ids?.includes(id)
        ? prev.error_type_ids.filter((eid) => eid !== id)
        : [...(prev.error_type_ids ?? []), id],
    }));
  };

  const toggleViolation = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      violation_flags: prev.violation_flags?.includes(index)
        ? prev.violation_flags.filter((i) => i !== index)
        : [...(prev.violation_flags ?? []), index],
    }));
  };

  const handleFileUpload = async (slot: ScreenshotSlot, file: File) => {
    if (!user || !currentJournal) return;
    setUploading((prev) => ({ ...prev, [slot]: true }));

    const url = await uploadScreenshot(file, user.id, formData.symbol || 'unknown', slot);
    if (url) {
      // Supprimer l'ancienne image si elle existe
      const oldUrl = formData[`screenshot_${slot}_url` as keyof TradeInput] as string | null;
      if (oldUrl) await deleteScreenshot(oldUrl);

      setFormData((prev) => ({ ...prev, [`screenshot_${slot}_url`]: url }));
    }
    setUploading((prev) => ({ ...prev, [slot]: false }));
  };

  const handleRemoveScreenshot = async (slot: ScreenshotSlot) => {
    const url = formData[`screenshot_${slot}_url` as keyof TradeInput] as string | null;
    if (url) {
      await deleteScreenshot(url);
      setFormData((prev) => ({ ...prev, [`screenshot_${slot}_url`]: null }));
    }
  };

  const handleDrop = useCallback((slot: ScreenshotSlot, e: React.DragEvent) => {
    e.preventDefault();
    setDragOver((prev) => ({ ...prev, [slot]: false }));
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(slot, file);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.symbol.trim() || !formData.opened_at) return;

    const data: TradeInput = {
      ...formData,
      closed_at: formData.closed_at || null,
      timeframe: formData.timeframe || null,
      risk_percent: formData.risk_percent ?? null,
      rr_planned: formData.rr_planned ?? null,
      rr_realized: formData.rr_realized ?? null,
      pnl_amount: formData.pnl_amount ?? null,
      emotion: formData.emotion || null,
      notes: formData.notes || null,
    };

    let success = false;
    if (isEdit && trade) {
      success = await updateTrade(trade.id, data);
    } else {
      const result = await createTrade(data);
      success = !!result;
    }

    if (success) {
      onSuccess();
      onClose();
    }
  };

  const handleDelete = async () => {
    if (!trade) return;
    const success = await deleteTrade(trade.id);
    if (success) {
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="modal-overlay fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4">
      <div className="bg-bg-card border border-bg-border rounded-xl w-full max-w-4xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-bg-border">
          <h2 className="font-heading font-semibold text-text-primary text-lg">
            {isEdit ? 'Modifier le trade' : 'Nouveau trade'}
          </h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-1 rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          {/* Main fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-text-secondary text-xs font-medium mb-1.5">
                Symbole *
              </label>
              <input
                type="text"
                value={formData.symbol}
                onChange={(e) => handleChange('symbol', e.target.value.toUpperCase())}
                placeholder="EURUSD"
                className="w-full rounded-lg px-3 py-2 text-sm font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-text-secondary text-xs font-medium mb-1.5">
                Sens *
              </label>
              <div className="flex gap-2">
                {(['achat', 'vente'] as Direction[]).map((dir) => (
                  <button
                    key={dir}
                    type="button"
                    onClick={() => handleChange('direction', dir)}
                    className={cn(
                      'flex-1 py-2 rounded-lg text-sm font-medium transition-all',
                      formData.direction === dir
                        ? dir === 'achat'
                          ? 'bg-accent-teal-glow text-accent-teal border border-accent-teal/30'
                          : 'bg-loss-glow text-loss border border-loss/30'
                        : 'bg-bg-elevated text-text-secondary border border-bg-border hover:border-text-muted'
                    )}
                  >
                    {DIRECTION_LABELS[dir].label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-text-secondary text-xs font-medium mb-1.5">
                Timeframe
              </label>
              <input
                type="text"
                value={formData.timeframe ?? ''}
                onChange={(e) => handleChange('timeframe', e.target.value)}
                placeholder="15 min"
                className="w-full rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-text-secondary text-xs font-medium mb-1.5">
                Date & heure d'ouverture *
              </label>
              <input
                type="datetime-local"
                value={formData.opened_at}
                onChange={(e) => handleChange('opened_at', e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-text-secondary text-xs font-medium mb-1.5">
                Date & heure de clôture
              </label>
              <input
                type="datetime-local"
                value={formData.closed_at ?? ''}
                onChange={(e) => handleChange('closed_at', e.target.value || undefined)}
                className="w-full rounded-lg px-3 py-2 text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-text-secondary text-xs font-medium mb-1.5">
                Risque engagé (%)
              </label>
              <input
                type="number"
                value={formData.risk_percent ?? ''}
                onChange={(e) => handleChange('risk_percent', e.target.value ? Number(e.target.value) : undefined)}
                min={0}
                max={100}
                step={0.01}
                placeholder="1.00"
                className="w-full rounded-lg px-3 py-2 text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-text-secondary text-xs font-medium mb-1.5">
                R:R prévu
              </label>
              <input
                type="number"
                value={formData.rr_planned ?? ''}
                onChange={(e) => handleChange('rr_planned', e.target.value ? Number(e.target.value) : undefined)}
                min={0}
                step={0.1}
                placeholder="3.0"
                className="w-full rounded-lg px-3 py-2 text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-text-secondary text-xs font-medium mb-1.5">
                R:R réalisé
              </label>
              <input
                type="number"
                value={formData.rr_realized ?? ''}
                onChange={(e) => handleChange('rr_realized', e.target.value ? Number(e.target.value) : undefined)}
                step={0.01}
                placeholder="-1.5"
                className="w-full rounded-lg px-3 py-2 text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-text-secondary text-xs font-medium mb-1.5">
                P&L (montant)
              </label>
              <input
                type="number"
                value={formData.pnl_amount ?? ''}
                onChange={(e) => handleChange('pnl_amount', e.target.value ? Number(e.target.value) : undefined)}
                step={0.01}
                placeholder="-150.50"
                className="w-full rounded-lg px-3 py-2 text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-text-secondary text-xs font-medium mb-1.5">
                Commissions
              </label>
              <input
                type="number"
                value={formData.commissions}
                onChange={(e) => handleChange('commissions', Number(e.target.value))}
                min={0}
                step={0.01}
                className="w-full rounded-lg px-3 py-2 text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-text-secondary text-xs font-medium mb-1.5">
                Swaps
              </label>
              <input
                type="number"
                value={formData.swaps}
                onChange={(e) => handleChange('swaps', Number(e.target.value))}
                step={0.01}
                className="w-full rounded-lg px-3 py-2 text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-text-secondary text-xs font-medium mb-1.5">
                État émotionnel
              </label>
              <select
                value={formData.emotion ?? ''}
                onChange={(e) => handleChange('emotion', (e.target.value as Emotion) || null)}
                className="w-full rounded-lg px-3 py-2 text-sm"
              >
                <option value="">—</option>
                {(Object.keys(EMOTION_LABELS) as Emotion[]).map((emo) => (
                  <option key={emo} value={emo}>
                    {EMOTION_LABELS[emo].emoji} {EMOTION_LABELS[emo].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom fields */}
          {customFields.length > 0 && (
            <div className="mb-6">
              <h3 className="font-heading font-semibold text-text-primary text-sm mb-3">
                Champs personnalisés
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {customFields.map((field) => (
                  <div key={field.id}>
                    <label className="block text-text-secondary text-xs font-medium mb-1.5">
                      {field.name}
                    </label>
                    <select
                      value={formData.custom_values?.[field.id] ?? ''}
                      onChange={(e) => handleCustomValueChange(field.id, e.target.value)}
                      className="w-full rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="">—</option>
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error types */}
          {errorTypes.length > 0 && (
            <div className="mb-6">
              <h3 className="font-heading font-semibold text-text-primary text-sm mb-3">
                Erreurs commises
              </h3>
              <div className="flex flex-wrap gap-2">
                {errorTypes.map((et) => (
                  <button
                    key={et.id}
                    type="button"
                    onClick={() => toggleErrorType(et.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                      formData.error_type_ids?.includes(et.id)
                        ? 'bg-loss-glow text-loss border border-loss/30'
                        : 'bg-bg-elevated text-text-secondary border border-bg-border hover:border-text-muted'
                    )}
                  >
                    {et.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Violation guards */}
          <div className="mb-6">
            <h3 className="font-heading font-semibold text-text-primary text-sm mb-3 flex items-center gap-2">
              <AlertTriangle size={14} className="text-alert" />
              Garde-fous enfreints
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {VIOLATION_GUARDS.map((guard) => (
                <label
                  key={guard.index}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer',
                    formData.violation_flags?.includes(guard.index)
                      ? 'bg-loss-glow border-loss/30'
                      : 'bg-bg-elevated border-bg-border hover:border-text-muted'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={formData.violation_flags?.includes(guard.index) ?? false}
                    onChange={() => toggleViolation(guard.index)}
                    className="mt-0.5 shrink-0"
                  />
                  <div>
                    <span className="text-text-primary text-sm font-medium">{guard.label}</span>
                    <p className="text-text-muted text-xs mt-0.5">{guard.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Checkboxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <label className="flex items-start gap-3 p-3 rounded-lg border border-bg-border bg-bg-elevated cursor-pointer hover:border-text-muted transition-all">
              <input
                type="checkbox"
                checked={formData.breakeven_on_close ?? false}
                onChange={(e) => handleChange('breakeven_on_close', e.target.checked)}
                className="mt-0.5 shrink-0"
              />
              <div>
                <span className="text-text-primary text-sm">Break-even à la clôture d'une bougie</span>
                <p className="text-text-muted text-xs mt-0.5">Pas sur une mèche</p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-lg border border-bg-border bg-bg-elevated cursor-pointer hover:border-text-muted transition-all">
              <input
                type="checkbox"
                checked={formData.closed_by_20h ?? true}
                onChange={(e) => handleChange('closed_by_20h', e.target.checked)}
                className="mt-0.5 shrink-0"
              />
              <div>
                <span className="text-text-primary text-sm">Clôturé au plus tard à 20h</span>
                <p className="text-text-muted text-xs mt-0.5">Conforme à la règle de clôture forcée</p>
              </div>
            </label>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-text-secondary text-xs font-medium mb-1.5">
              Notes / analyse
            </label>
            <textarea
              value={formData.notes ?? ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              placeholder="Analyse du trade, leçons apprises..."
              className="w-full rounded-lg px-3 py-2 text-sm resize-none"
            />
          </div>

          {/* Screenshots */}
          <div className="mb-6">
            <h3 className="font-heading font-semibold text-text-primary text-sm mb-3">
              Captures d'écran
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(['entry', 'management', 'close'] as ScreenshotSlot[]).map((slot) => {
                const url = formData[`screenshot_${slot}_url` as keyof TradeInput] as string | null;
                const isUploading = uploading[slot];
                const isDragOver = dragOver[slot];

                return (
                  <div
                    key={slot}
                    className={cn(
                      'border-2 border-dashed rounded-xl p-4 transition-all',
                      isDragOver ? 'drag-active' : 'border-bg-border',
                      url ? 'bg-bg-elevated' : 'bg-bg-primary'
                    )}
                    onDragOver={(e) => { e.preventDefault(); setDragOver((p) => ({ ...p, [slot]: true })); }}
                    onDragLeave={() => setDragOver((p) => ({ ...p, [slot]: false }))}
                    onDrop={(e) => handleDrop(slot, e)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-text-secondary text-xs font-medium">
                        {SCREENSHOT_LABELS[slot]}
                      </span>
                      {url && (
                        <button
                          type="button"
                          onClick={() => handleRemoveScreenshot(slot)}
                          className="text-text-muted hover:text-loss p-0.5 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    {url ? (
                      <img
                        src={url}
                        alt={SCREENSHOT_LABELS[slot]}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ) : (
                      <div
                        className="flex flex-col items-center justify-center h-32 cursor-pointer"
                        onClick={() => fileInputRefs.current[slot]?.click()}
                      >
                        {isUploading ? (
                          <span className="text-accent-teal text-xs animate-pulse">Upload…</span>
                        ) : (
                          <>
                            <Upload size={24} className="text-text-muted mb-2" />
                            <span className="text-text-muted text-xs text-center">
                              Glisser-déposer ou cliquer
                            </span>
                          </>
                        )}
                      </div>
                    )}

                    <input
                      ref={(el) => { fileInputRefs.current[slot] = el; }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(slot, file);
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-bg-border">
            <div>
              {isEdit && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center gap-2 text-loss hover:text-loss-dim text-sm font-medium transition-colors"
                >
                  <Trash2 size={16} />
                  Supprimer
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="text-text-secondary hover:text-text-primary px-4 py-2.5 text-sm font-medium transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-accent-teal hover:bg-accent-teal-dim text-bg-primary font-medium px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Enregistrement…' : isEdit ? 'Enregistrer' : 'Créer le trade'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
