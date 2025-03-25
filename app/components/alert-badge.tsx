'use client';

import { cn } from '@/lib/utils';
import { AlertSeverity } from '../types';

interface AlertBadgeProps {
  severity: AlertSeverity;
  className?: string;
}

const severityConfig = {
  red: {
    bg: 'bg-red-500',
    text: 'text-white',
    label: 'Extreme Danger',
  },
  orange: {
    bg: 'bg-orange-500',
    text: 'text-white',
    label: 'High Risk',
  },
  yellow: {
    bg: 'bg-yellow-500',
    text: 'text-black',
    label: 'Moderate Risk',
  },
  green: {
    bg: 'bg-green-500',
    text: 'text-white',
    label: 'Safe',
  },
};

export function AlertBadge({ severity, className }: AlertBadgeProps) {
  const config = severityConfig[severity];
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        config.bg,
        config.text,
        className
      )}
    >
      {config.label}
    </span>
  );
}