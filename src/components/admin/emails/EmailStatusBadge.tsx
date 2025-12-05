'use client';

import type { EmailStatus } from '@/types/email';

interface EmailStatusBadgeProps {
  status: EmailStatus;
  className?: string;
}

const statusConfig: Record<EmailStatus, { label: string; color: string; bgColor: string }> = {
  draft: {
    label: 'Borrador',
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/10',
  },
  queued: {
    label: 'En cola',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
  },
  sent: {
    label: 'Enviado',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  delivered: {
    label: 'Entregado',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
  },
  opened: {
    label: 'Abierto',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
  },
  clicked: {
    label: 'Click',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
  },
  bounced: {
    label: 'Rebotado',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
  },
  complained: {
    label: 'Spam',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
  },
  failed: {
    label: 'Fallido',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
  },
};

export function EmailStatusBadge({ status, className = '' }: EmailStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.draft;

  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
        ${config.color} ${config.bgColor}
        ${className}
      `}
    >
      {config.label}
    </span>
  );
}
