import { useState } from 'react';
import { useJournal } from '@/contexts/JournalContext';
import { useJournals } from '@/hooks/useJournals';
import { useCustomFields } from '@/hooks/useCustomFields';
import { useErrorTypes } from '@/hooks/useErrorTypes';
import { Navbar } from '@/components/ui/Navbar';
import { useNavigate } from 'react-router';
import { Trash2, Plus, AlertTriangle, Save } from 'lucide-react';

export function SettingsPage() {
  const navigate = useNavigate();
  const { currentJournal, customFields, errorTypes, loadJournal } = useJournal();
  const { updateJournal, deleteJournal } = useJournals();
  const { createCustomField, deleteCustomField } = useCustomFields();
  const { createErrorType, deleteErrorType } = useErrorTypes();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldOptions, setNewFieldOptions] = useState('');
  const [newErrorLabel, setNewErrorLabel] = useState('');
  const [saving, setSaving] = useState(false);

  if (!currentJournal) return null;

  const handleUpdateJournal = async (updates: Partial<typeof currentJournal>) => {
    setSaving(true);
    await updateJournal(currentJournal.id, updates);
    await loadJournal(currentJournal.id);
    setSaving(false);
  };

  const handleDeleteJournal = async () => {
    const success = await deleteJournal(currentJournal.id);
    if (success) navigate('/journals');
  };

  const handleAddCustomField = async () => {
    if (!newFieldName.trim() || !newFieldOptions.trim()) return;
    await createCustomField({
      name: newFieldName.trim(),
      options: newFieldOptions.split(',').map((o) => o.trim()).filter(Boolean),
    });
    setNewFieldName('');
    setNewFieldOptions('');
    await loadJournal(currentJournal.id);
  };

  const handleAddErrorType = async () => {
    if (!newErrorLabel.trim()) return;
    await createErrorType({ label: newErrorLabel.trim() });
    setNewErrorLabel('');
    await loadJournal(currentJournal.id);
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <h1 className="font-heading text-xl font-bold text-text-primary mb-6">Paramètres</h1>

        {/* Journal Info */}
        <div className="bg-bg-card border border-bg-border rounded-xl p-5 mb-6">
          <h2 className="font-heading font-semibold text-text-primary text-sm mb-4">Informations du journal</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-text-secondary text-xs font-medium mb-1.5">Nom</label>
              <input
                type="text"
                value={currentJournal.name}
                onChange={(e) => handleUpdateJournal({ name: e.target.value })}
                className="w-full rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-text-secondary text-xs font-medium mb-1.5">Broker</label>
              <input
                type="text"
                value={currentJournal.broker || ''}
                onChange={(e) => handleUpdateJournal({ broker: e.target.value || null })}
                className="w-full rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-text-secondary text-xs font-medium mb-1.5">Capital de départ</label>
              <input
                type="number"
                value={currentJournal.starting_capital}
                onChange={(e) => handleUpdateJournal({ starting_capital: Number(e.target.value) })}
                className="w-full rounded-lg px-3 py-2 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-text-secondary text-xs font-medium mb-1.5">Type de compte</label>
              <select
                value={currentJournal.account_type}
                onChange={(e) => handleUpdateJournal({ account_type: e.target.value as 'demo' | 'live' })}
                className="w-full rounded-lg px-3 py-2 text-sm"
              >
                <option value="demo">Démo</option>
                <option value="live">Réel</option>
              </select>
            </div>
            <div>
              <label className="block text-text-secondary text-xs font-medium mb-1.5">Limite risque jour (%)</label>
              <input
                type="number"
                value={currentJournal.risk_limit_day || ''}
                onChange={(e) => handleUpdateJournal({ risk_limit_day: e.target.value ? Number(e.target.value) : null })}
                className="w-full rounded-lg px-3 py-2 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-text-secondary text-xs font-medium mb-1.5">Limite risque semaine (%)</label>
              <input
                type="number"
                value={currentJournal.risk_limit_week || ''}
                onChange={(e) => handleUpdateJournal({ risk_limit_week: e.target.value ? Number(e.target.value) : null })}
                className="w-full rounded-lg px-3 py-2 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-text-secondary text-xs font-medium mb-1.5">Limite risque mois (%)</label>
              <input
                type="number"
                value={currentJournal.risk_limit_month || ''}
                onChange={(e) => handleUpdateJournal({ risk_limit_month: e.target.value ? Number(e.target.value) : null })}
                className="w-full rounded-lg px-3 py-2 text-sm font-mono"
              />
            </div>
          </div>
          {saving && (
            <p className="text-accent-teal text-xs mt-3 flex items-center gap-1">
              <Save size={12} /> Enregistré
            </p>
          )}
        </div>

        {/* Custom Fields */}
        <div className="bg-bg-card border border-bg-border rounded-xl p-5 mb-6">
          <h2 className="font-heading font-semibold text-text-primary text-sm mb-4">Champs personnalisés</h2>
          <div className="space-y-2 mb-4">
            {customFields.map((field) => (
              <div key={field.id} className="flex items-center justify-between p-2 bg-bg-elevated rounded-lg">
                <div>
                  <span className="text-text-primary text-sm">{field.name}</span>
                  <span className="text-text-muted text-xs ml-2">({field.options.join(', ')})</span>
                </div>
                <button
                  onClick={() => deleteCustomField(field.id).then(() => loadJournal(currentJournal.id))}
                  className="text-text-muted hover:text-loss p-1 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {customFields.length === 0 && <p className="text-text-muted text-sm">Aucun champ personnalisé</p>}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newFieldName}
              onChange={(e) => setNewFieldName(e.target.value)}
              placeholder="Nom du champ"
              className="flex-1 rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={newFieldOptions}
              onChange={(e) => setNewFieldOptions(e.target.value)}
              placeholder="Options (séparées par virgule)"
              className="flex-1 rounded-lg px-3 py-2 text-sm"
            />
            <button
              onClick={handleAddCustomField}
              className="bg-accent-teal hover:bg-accent-teal-dim text-bg-primary p-2.5 rounded-lg transition-colors"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* Error Types */}
        <div className="bg-bg-card border border-bg-border rounded-xl p-5 mb-6">
          <h2 className="font-heading font-semibold text-text-primary text-sm mb-4">Types d'erreur</h2>
          <div className="space-y-2 mb-4">
            {errorTypes.map((et) => (
              <div key={et.id} className="flex items-center justify-between p-2 bg-bg-elevated rounded-lg">
                <span className="text-text-primary text-sm">{et.label}</span>
                <button
                  onClick={() => deleteErrorType(et.id).then(() => loadJournal(currentJournal.id))}
                  className="text-text-muted hover:text-loss p-1 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {errorTypes.length === 0 && <p className="text-text-muted text-sm">Aucun type d'erreur</p>}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newErrorLabel}
              onChange={(e) => setNewErrorLabel(e.target.value)}
              placeholder="Libellé de l'erreur"
              className="flex-1 rounded-lg px-3 py-2 text-sm"
            />
            <button
              onClick={handleAddErrorType}
              className="bg-accent-teal hover:bg-accent-teal-dim text-bg-primary p-2.5 rounded-lg transition-colors"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-loss-glow border border-loss/25 rounded-xl p-5">
          <h2 className="font-heading font-semibold text-loss text-sm mb-4 flex items-center gap-2">
            <AlertTriangle size={14} />
            Zone de danger
          </h2>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 bg-loss hover:bg-loss-dim text-white font-medium px-4 py-2.5 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
              Supprimer ce journal
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-loss text-sm">
                Tous les trades associés seront définitivement supprimés. Cette action est irréversible.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteJournal}
                  className="bg-loss hover:bg-loss-dim text-white font-medium px-4 py-2.5 rounded-lg transition-colors"
                >
                  Confirmer la suppression
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="bg-bg-elevated hover:bg-bg-hover text-text-secondary font-medium px-4 py-2.5 rounded-lg transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
