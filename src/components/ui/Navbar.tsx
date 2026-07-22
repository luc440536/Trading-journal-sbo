import { Link, useLocation, useParams } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useJournal } from '@/contexts/JournalContext';
import { Sun, Moon, LogOut, BarChart3, BookOpen, CalendarDays, Settings, FileText, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const journalTabs = [
  { path: '', label: 'Tableau de bord', icon: BarChart3 },
  { path: 'trades', label: 'Trades', icon: BookOpen },
  { path: 'calendar', label: 'Calendrier', icon: CalendarDays },
  { path: 'analysis', label: 'Analyse', icon: FileText },
  { path: 'report', label: 'Rapport', icon: ShieldCheck },
  { path: 'settings', label: 'Paramètres', icon: Settings },
];

export function Navbar() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { currentJournal } = useJournal();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();

  const isJournalPage = location.pathname.startsWith('/journals/') && id;
  const basePath = `/journals/${id}`;

  return (
    <>
      {/* Top bar */}
      <nav className="bg-bg-card border-b border-bg-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link to="/journals" className="flex items-center gap-2.5">
              <svg width="28" height="28" viewBox="0 0 100 100" className="shrink-0">
                <rect width="100" height="100" rx="16" fill="#0A0D12"/>
                <path d="M25 70 L40 45 L55 55 L75 25" stroke="#3ED9C4" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="75" cy="25" r="4" fill="#3ED9C4"/>
              </svg>
              <span className="font-heading font-bold text-text-primary text-lg hidden sm:block">
                Journal <span className="text-accent-teal">SBO</span>
              </span>
            </Link>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {user && (
                <span className="text-text-muted text-xs hidden md:block mr-2">
                  {user.email}
                </span>
              )}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
                title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button
                onClick={signOut}
                className="p-2 rounded-lg text-text-secondary hover:text-loss hover:bg-loss-glow transition-colors"
                title="Déconnexion"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Journal tabs */}
      {isJournalPage && currentJournal && (
        <div className="bg-bg-primary border-b border-bg-border sticky top-14 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-1">
              {journalTabs.map((tab) => {
                const fullPath = `${basePath}/${tab.path}`;
                const isActive = tab.path === ''
                  ? location.pathname === basePath
                  : location.pathname.startsWith(fullPath);
                const Icon = tab.icon;

                return (
                  <Link
                    key={tab.path}
                    to={fullPath}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                      isActive
                        ? 'text-accent-teal bg-accent-teal-glow'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
                    )}
                  >
                    <Icon size={15} />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
