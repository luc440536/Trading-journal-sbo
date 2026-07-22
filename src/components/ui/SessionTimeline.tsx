import { useEffect, useState } from 'react';
import { TIME_SEGMENTS } from '@/types';

export function SessionTimeline() {
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  const [currentMinute, setCurrentMinute] = useState(new Date().getMinutes());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentHour(now.getHours());
      setCurrentMinute(now.getMinutes());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const currentTimePercent = ((currentHour + currentMinute / 60) / 24) * 100;

  const getSegmentClass = (type: string) => {
    switch (type) {
      case 'asia': return 'timeline-asia';
      case 'window': return 'timeline-window';
      case 'management': return 'timeline-management';
      case 'close': return 'timeline-close';
      default: return 'timeline-asia';
    }
  };

  return (
    <div className="bg-bg-card border border-bg-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-text-primary font-heading font-semibold text-sm">
          Frise de session
        </h3>
        <span className="font-mono text-accent-teal text-sm">
          {String(currentHour).padStart(2, '0')}:{String(currentMinute).padStart(2, '0')}
        </span>
      </div>

      {/* Timeline bar */}
      <div className="relative flex rounded-lg overflow-hidden" style={{ height: '8px' }}>
        {TIME_SEGMENTS.map((segment) => {
          const width = ((segment.endHour - segment.startHour) / 24) * 100;
          return (
            <div
              key={segment.type}
              className={getSegmentClass(segment.type)}
              style={{ width: `${width}%` }}
              title={`${segment.label}: ${segment.startHour}h–${segment.endHour}h — ${segment.description}`}
            />
          );
        })}
        {/* Current time marker */}
        <div
          className="timeline-current"
          style={{ left: `${currentTimePercent}%` }}
        />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3">
        {TIME_SEGMENTS.map((segment) => (
          <div key={segment.type} className="flex items-center gap-1.5">
            <div
              className={`w-2.5 h-2.5 rounded-sm ${getSegmentClass(segment.type)}`}
            />
            <span className="text-text-muted text-xs">
              {segment.label} ({segment.startHour}h–{segment.endHour}h)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
