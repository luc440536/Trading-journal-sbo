import { useState } from 'react';
import { Link } from 'react-router';
import { useJournals } from '@/hooks/useJournals';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/ui/Navbar';
import type { JournalInput, Currency } from '@/types';
import {
  Plus, Trash2, ExternalLink, Briefcase, TrendingUp, AlertTriangle,
  X, ChevronDown, ChevronUp
} from 'lucide-react';
import { CURRENCIES } from '@/types';

export function JournalsPage() {
  const { user } = useAuth();
  const { journals, loading, error, createJournal, deleteJournal } = useJournals();
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState<JournalInput>({
    name: '',
    broker: '',
    starting_capital: 10000,
    currency: 'EUR',
    account_type: 'demo',
    risk_limit_day: undefined,
    risk_limit_week: undefined,
    risk_limit_month: undefined,
  });
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!formData.name.trim()) {
      setFormError('Le nom du journal est obligatoire');
      return;
    }
    const result = await createJournal(formData);
    if (result) {
      setShowForm(false);
      setFormData({
        name: '', broker: '', starting_capital: 10000, currency: 'EUR',
        account_type: 'demo',
      });
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteJournal(id);
    if (success) setDeleteConfirm(null);
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-2xl font-bold text-text-primary">
              Mes journaux
            </h1>
            <p className="text-text-secondary text-sm mt-1">
              {journals.length} journal{journals.length !== 1 ? 'x' : ''}
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-accent-teal hover:bg-accent-teal-dim text-bg-primary font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            {showForm ? <X size={18} /> : <Plus size={18} />}
            <span className="hidden sm:inline">{showForm ? 'Annuler' : 'Nouveau journal'}</span>
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-bg-card border border-bg-border rounded-xl p-6 mb-8 animate-fade-in">
            <h2 className="font-heading font-semibold text-text-primary mb-4">
              Créer un nouveau journal
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-text-secondary text-xs font-medium mb-1.5">Nom *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ex: FTMO 100k — SBO"
                  className="w-full rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-text-secondary text-xs font-medium mb-1.5">Broker</label>
                <input
                  type="text"
                  value={formData.broker}
                  onChange={(e) => setFormData({ ...formData, broker: e.target.value })}
                  placeholder="ex: FTMO, Darwinex"
                  className="w-full rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-text-secondary text-xs font-medium mb-1.5">Capital de départ *</label>
                <input
                  type="number"
                  value={formData.starting_capital}
                  onChange={(e) => setFormData({ ...formData, starting_capital: Number(e.target.value) })}
                  min={0}
                  step={0.01}
                  className="w-full rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-text-secondary text-xs font-medium mb-1.5">Devise</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value as Currency })}
                  className="w-full rounded-lg px-3 py-2 text-sm"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-text-secondary text-xs font-medium mb-1.5">Type de compte</label>
                <select
                  value={formData.account_type}
                  onChange={(e) => setFormData({ ...formData, account_type: e.target.value as 'demo' | 'live' })}
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
                  value={formData.risk_limit_day ?? ''}
                  onChange={(e) => setFormData({ ...formData, risk_limit_day: e.target.value ? Number(e.target.value) : undefined })}
                  min={0}
                  max={100}
                  step={0.01}
                  placeholder="Optionnel"
                  className="w-full rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-text-secondary text-xs font-medium mb-1.5">Limite risque semaine (%)</label>
                <input
                  type="number"
                  value={formData.risk_limit_week ?? ''}
                  onChange={(e) => setFormData({ ...formData, risk_limit_week: e.target.value ? Number(e.target.value) : undefined })}
                  min={0}
                  max={100}
                  step={0.01}
                  placeholder="Optionnel"
                  className="w-full rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-text-secondary text-xs font-medium mb-1.5">Limite risque mois (%)</label>
                <input
                  type="number"
                  value={formData.risk_limit_month ?? ''}
                  onChange={(e) => setFormData({ ...formData, risk_limit_month: e.target.value ? Number(e.target.value) : undefined })}
                  min={0}
                  max={100}
                  step={0.01}
                  placeholder="Optionnel"
                  className="w-full rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-3 flex items-center gap-3 mt-2">
                <button
                  type="submit"
                  className="bg-accent-teal hover:bg-accent-teal-dim text-bg-primary font-medium px-6 py-2.5 rounded-lg transition-colors"
                >
                  Créer le journal
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-text-secondary hover:text-text-primary px-4 py-2.5 transition-colors"
                >
                  Annuler
                </button>
              </div>
              {formError && (
                <div className="sm:col-span-2 lg:col-span-3 text-loss text-sm">{formError}</div>
              )}
            </form>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-loss-glow border border-loss/25 rounded-xl p-4 mb-6">
            <p className="text-loss text-sm">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-bg-card border border-bg-border rounded-xl p-6 h-40 skeleton" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && journals.length === 0 && (
          <div className="bg-bg-card border border-bg-border border-dashed rounded-xl p-12 text-center">
            <Briefcase size={48} className="text-text-muted mx-auto mb-4" />
            <h3 className="font-heading font-semibold text-text-primary mb-2">
              Aucun journal
            </h3>
            <p className="text-text-secondary text-sm mb-4">
              Créez votre premier journal de trading pour commencer à suivre vos performances SBO.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-accent-teal hover:bg-accent-teal-dim text-bg-primary font-medium px-6 py-2.5 rounded-lg transition-colors"
            >
              Créer un journal
            </button>
          </div>
        )}

        {/* Journals grid */}
        {!loading && journals.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {journals.map((journal) => (
              <div
                key={journal.id}
                className="bg-bg-card border border-bg-border rounded-xl p-5 hover:border-bg-hover transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      journal.account_type === 'demo' ? 'badge-demo' : 'badge-live'
                    }`}>
                      {journal.account_type === 'demo' ? 'DÉMO' : 'RÉEL'}
                    </span>
                    {journal.broker && (
                      <span className="text-text-muted text-xs">{journal.broker}</span>
                    )}
                  </div>
                  <button
                    onClick={() => setDeleteConfirm(deleteConfirm === journal.id ? null : journal.id)}
                    className="text-text-muted hover:text-loss p-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <h3 className="font-heading font-semibold text-text-primary text-lg mb-1">
                  {journal.name}
                </h3>

                <div className="flex items-center gap-2 text-text-secondary text-sm mb-4">
                  <TrendingUp size={14} />
                  <span className="font-mono">
                    {journal.starting_capital.toLocaleString('fr-FR')} {journal.currency}
                  </span>
                </div>

                {/* Risk limits preview */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {journal.risk_limit_day && (
                    <span className="text-xs bg-bg-elevated text-text-secondary px-2 py-1 rounded">
                      Jour: {journal.risk_limit_day}%
                    </span>
                  )}
                  {journal.risk_limit_week && (
                    <span className="text-xs bg-bg-elevated text-text-secondary px-2 py-1 rounded">
                      Sem: {journal.risk_limit_week}%
                    </span>
                  )}
                  {journal.risk_limit_month && (
                    <span className="text-xs bg-bg-elevated text-text-secondary px-2 py-1 rounded">
                      Mois: {journal.risk_limit_month}%
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/journals/${journal.id}`}
                    className="flex-1 flex items-center justify-center gap-2 bg-bg-elevated hover:bg-bg-hover text-text-primary text-sm font-medium py-2.5 rounded-lg transition-colors"
                  >
                    <ExternalLink size={15} />
                    Ouvrir
                  </Link>
                </div>

                {/* Delete confirmation */}
                {deleteConfirm === journal.id && (
                  <div className="mt-3 p-3 bg-loss-glow border border-loss/25 rounded-lg animate-fade-in">
                    <div className="flex items-start gap-2 mb-2">
                      <AlertTriangle size={16} className="text-loss shrink-0 mt-0.5" />
                      <p className="text-loss text-xs">
                        Tous les trades associés seront définitivement supprimés. Confirmer ?
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(journal.id)}
                        className="flex-1 bg-loss hover:bg-loss-dim text-white text-xs font-medium py-2 rounded transition-colors"
                      >
                        Supprimer
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="flex-1 bg-bg-elevated hover:bg-bg-hover text-text-secondary text-xs font-medium py-2 rounded transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
