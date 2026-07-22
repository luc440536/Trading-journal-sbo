import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Chrome, TrendingUp, Shield, Lock } from 'lucide-react';

export function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <div className="w-full max-w-[380px]">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <svg width="64" height="64" viewBox="0 0 100 100">
              <rect width="100" height="100" rx="20" fill="#111820" stroke="#253044" strokeWidth="2"/>
              <path d="M25 70 L40 45 L55 55 L75 25" stroke="#3ED9C4" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="75" cy="25" r="4" fill="#3ED9C4"/>
            </svg>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-accent-teal rounded-full flex items-center justify-center">
              <TrendingUp size={12} className="text-bg-primary" />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="font-heading text-2xl font-bold text-text-primary mb-2">
            Journal <span className="text-accent-teal">SBO</span>
          </h1>
          <p className="text-text-secondary text-sm">
            Structure Break of Asia — Journal de trading manuel
          </p>
        </div>

        {/* Card */}
        <div className="bg-bg-card border border-bg-border rounded-xl p-6">
          <h2 className="text-text-primary font-semibold text-center mb-4">
            Connexion
          </h2>

          <p className="text-text-muted text-xs text-center mb-6 leading-relaxed">
            Vos données de trading sont rattachées à votre compte Google et restent
            strictement privées. Aucun autre utilisateur n'y a accès.
          </p>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-bg-elevated hover:bg-bg-hover border border-bg-border hover:border-text-muted rounded-lg py-3 px-4 text-text-primary font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="animate-pulse">Connexion…</span>
            ) : (
              <>
                <Chrome size={20} className="text-[#4285F4]" />
                <span>Continuer avec Google</span>
              </>
            )}
          </button>

          {error && (
            <div className="mt-4 p-3 bg-loss-glow border border-loss/25 rounded-lg">
              <p className="text-loss text-sm text-center">{error}</p>
            </div>
          )}
        </div>

        {/* Security note */}
        <div className="mt-6 flex items-center justify-center gap-4 text-text-muted text-xs">
          <span className="flex items-center gap-1">
            <Lock size={12} />
            Connexion sécurisée
          </span>
          <span className="flex items-center gap-1">
            <Shield size={12} />
            Données chiffrées
          </span>
        </div>
      </div>
    </div>
  );
}
