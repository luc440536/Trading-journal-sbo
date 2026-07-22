import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  color?: 'default' | 'positive' | 'negative' | 'alert';
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ label, value, subtext, color = 'default', icon, className }: StatCardProps) {
  const colorClasses = {
    default: 'text-text-primary',
    positive: 'text-accent-teal',
    negative: 'text-loss',
    alert: 'text-alert',
  };

  return (
    <div className={cn(
      'bg-bg-card border border-bg-border rounded-xl p-4 transition-all hover:border-bg-hover',
      className
    )}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-text-secondary text-xs font-medium uppercase tracking-wider">
          {label}
        </span>
        {icon && <span className="text-text-muted">{icon}</span>}
      </div>
      <div className={cn('font-mono text-2xl font-semibold', colorClasses[color])}>
        {value}
      </div>
      {subtext && (
        <div className="text-text-muted text-xs mt-1">{subtext}</div>
      )}
    </div>
  );
}
