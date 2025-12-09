'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Star,
  Archive,
  Trash2,
  RotateCcw,
  Mail,
  MailOpen,
  ChevronUp,
  Loader2,
} from 'lucide-react';
import type { Email, EmailFolder } from '@/types/email';
import { EmailStatusBadge } from './EmailStatusBadge';

interface EmailListProps {
  emails: Email[];
  loading: boolean;
  folder: EmailFolder;
  page: number;
  totalPages: number;
  total: number;
  loadingMore: boolean;
  onLoadMore: () => void;
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
  total,
  loadingMore,
  onLoadMore,
  onEmailClick,
  onToggleStar,
  onArchive,
  onDelete,
  onRestore,
}: EmailListProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Scroll to top
  const scrollToTop = () => {
    listRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle scroll to show/hide "go to top" button
  const handleScroll = useCallback(() => {
    if (listRef.current) {
      setShowScrollTop(listRef.current.scrollTop > 300);
    }
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && page < totalPages) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [loadingMore, page, totalPages, onLoadMore]);

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
      // Hoy: mostrar hora
      return format(date, 'HH:mm', { locale: es });
    } else if (diffDays === 1) {
      // Ayer
      return 'Ayer ' + format(date, 'HH:mm', { locale: es });
    } else if (diffDays < 7) {
      // Esta semana: día + hora
      return format(date, "EEE d 'a las' HH:mm", { locale: es });
    } else {
      // Más antiguo: fecha completa
      return format(date, 'd MMM yyyy', { locale: es });
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Progress indicator */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/50">
        <span className="text-xs text-slate-500">
          Mostrando {emails.length} de {total} emails
        </span>
        {page < totalPages && (
          <span className="text-xs text-slate-400">
            Scroll para cargar más
          </span>
        )}
      </div>

      {/* Email List with scroll */}
      <div
        ref={listRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto divide-y divide-slate-800"
      >
        {emails.map((email) => {
          const isUnread = !email.is_read && email.direction === 'inbound';
          return (
          <div
            key={email.id}
            className={`
              flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors
              ${isUnread ? 'bg-cyan-500/5 border-l-2 border-l-cyan-500' : 'border-l-2 border-l-transparent'}
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

            {/* Read Status Icon */}
            <div className="flex-shrink-0">
              {email.direction === 'inbound' ? (
                // Para inbound: mostrar si el admin ya lo leyó
                email.is_read ? (
                  <MailOpen className="w-4 h-4 text-slate-500" />
                ) : (
                  <Mail className="w-4 h-4 text-cyan-400" />
                )
              ) : (
                // Para outbound: mostrar tracking del destinatario
                email.status === 'opened' || email.status === 'clicked' ? (
                  <MailOpen className="w-4 h-4 text-cyan-400" />
                ) : (
                  <Mail className="w-4 h-4 text-slate-500" />
                )
              )}
            </div>

            {/* Sender/Recipient & Subject */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`text-sm truncate ${
                  !email.is_read && email.direction === 'inbound'
                    ? 'font-semibold text-white'
                    : 'font-medium text-slate-200'
                }`}>
                  {/* Para inbound: mostrar remitente (from), para outbound: mostrar destinatario (to) */}
                  {email.direction === 'inbound'
                    ? (email.from_name || email.from_email)
                    : (email.to_name || email.to_email)
                  }
                </span>
                {email.lead && (
                  <span className="text-xs text-slate-500 truncate hidden sm:inline">
                    ({email.lead.localidad || 'Sin localidad'})
                  </span>
                )}
              </div>
              <p className={`text-sm truncate ${
                !email.is_read && email.direction === 'inbound'
                  ? 'text-slate-300 font-medium'
                  : 'text-slate-400'
              }`}>{email.subject}</p>
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
        );
        })}
        {/* Infinite scroll trigger */}
        <div ref={loadMoreRef} className="py-4">
          {loadingMore && (
            <div className="flex items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Cargando más...</span>
            </div>
          )}
          {page >= totalPages && emails.length > 0 && (
            <p className="text-center text-xs text-slate-500 py-2">
              Has llegado al final
            </p>
          )}
        </div>
      </div>

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="absolute bottom-4 right-4 p-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full shadow-lg transition-all"
          title="Ir al inicio"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
