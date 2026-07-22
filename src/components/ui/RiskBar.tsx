import { cn } from '@/lib/utils';

interface RiskBarProps {
  label: string;
  used: number;
  limit: number | null;
  percentage: number;
  currency?: string;
}

export function RiskBar({ label, used, limit, percentage, currency = '' }: RiskBarProps) {
  const getBarColor = () => {
    if (percentage < 60) return 'risk-bar-green';
    if (percentage < 90) return 'risk-bar-orange';
    return 'risk-bar-red';
  };

  const getTextColor = () => {
    if (percentage < 60) return 'text-accent-teal';
    if (percentage < 90) return 'text-alert';
    return 'text-loss';
  };

  const formatAmount = (val: number) => {
    return currency
      ? `${val.toFixed(2)} ${currency}`
      : val.toFixed(2);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-text-secondary text-sm">{label}</span>
        <span className={cn('font-mono text-sm font-medium', getTextColor())}>
          {formatAmount(used)} / {limit ? formatAmount(limit) : '—'}
        </span>
      </div>
      <div className="risk-bar-track">
        <div
          className={cn('risk-bar-fill', getBarColor())}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <div className="text-right">
        <span className={cn('font-mono text-xs', getTextColor())}>
          {percentage.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}
