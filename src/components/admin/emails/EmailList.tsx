'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Star,
  Archive,
  Trash2,
  RotateCcw,
  Mail,
  MailOpen,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { Email, EmailFolder } from '@/types/email';
import { EmailStatusBadge } from './EmailStatusBadge';

interface EmailListProps {
  emails: Email[];
  loading: boolean;
  folder: EmailFolder;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEmailClick: (email: Email) => void;
  onToggleStar: (email: Email) => void;
  onArchive: (email: Email) => void;
  onDelete: (email: Email) => void;
  onRestore?: (email: Email) => void;
}

export function EmailList({
  emails,
  loading,
  folder,
  page,
  totalPages,
  onPageChange,
  onEmailClick,
  onToggleStar,
  onArchive,
  onDelete,
  onRestore,
}: EmailListProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-slate-700 border-t-cyan-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Cargando emails...</p>
        </div>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <Mail className="w-8 h-8 text-slate-600" />
        </div>
        <h3 className="text-lg font-medium text-slate-300 mb-1">No hay emails</h3>
        <p className="text-sm text-slate-500">
          {folder === 'drafts' && 'No tienes borradores guardados'}
          {folder === 'sent' && 'No has enviado ningún email aún'}
          {folder === 'archived' && 'No hay emails archivados'}
          {folder === 'trash' && 'La papelera está vacía'}
        </p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return formatDistanceToNow(date, { addSuffix: true, locale: es });
    } else if (diffDays < 7) {
      return formatDistanceToNow(date, { addSuffix: true, locale: es });
    } else {
      return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Email List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800">
        {emails.map((email) => (
          <div
            key={email.id}
            className={`
              flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors
              ${hoveredId === email.id ? 'bg-slate-800/50' : 'hover:bg-slate-800/30'}
            `}
            onMouseEnter={() => setHoveredId(email.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => onEmailClick(email)}
          >
            {/* Star */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar(email);
              }}
              className={`
                p-1 rounded transition-colors
                ${email.is_starred
                  ? 'text-amber-400 hover:text-amber-300'
                  : 'text-slate-600 hover:text-slate-400'
                }
              `}
            >
              <Star className={`w-4 h-4 ${email.is_starred ? 'fill-current' : ''}`} />
            </button>

            {/* Status Icon */}
            <div className="flex-shrink-0">
              {email.status === 'opened' || email.status === 'clicked' ? (
                <MailOpen className="w-4 h-4 text-cyan-400" />
              ) : (
                <Mail className="w-4 h-4 text-slate-500" />
              )}
            </div>

            {/* Recipient & Subject */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-medium text-slate-200 truncate">
                  {email.to_name || email.to_email}
                </span>
                {email.lead && (
                  <span className="text-xs text-slate-500 truncate hidden sm:inline">
                    ({email.lead.localidad || 'Sin localidad'})
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400 truncate">{email.subject}</p>
            </div>

            {/* Status Badge */}
            <div className="hidden md:block">
              <EmailStatusBadge status={email.status} />
            </div>

            {/* Actions on Hover */}
            {hoveredId === email.id ? (
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                {folder === 'trash' && onRestore ? (
                  <button
                    onClick={() => onRestore(email)}
                    className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors"
                    title="Restaurar"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => onArchive(email)}
                    className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded transition-colors"
                    title="Archivar"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => onDelete(email)}
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                  title={folder === 'trash' ? 'Eliminar permanentemente' : 'Mover a papelera'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Date */
              <span className="text-xs text-slate-500 whitespace-nowrap">
                {formatDate(email.sent_at || email.created_at)}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
          <span className="text-xs text-slate-500">
            Página {page} de {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
