'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Star,
  Archive,
  Trash2,
  Mail,
  MailOpen,
  ChevronUp,
  Loader2,
  MessageSquare,
  Users,
} from 'lucide-react';
import type { Email, EmailThread } from '@/types/email';

interface ProcessedThread extends EmailThread {
  lastEmail: Email;
  unreadCount: number;
  hasStarred: boolean;
  totalEmails: number;
  hasInbound: boolean;
  hasOutbound: boolean;
}

interface ThreadListProps {
  threads: ProcessedThread[];
  loading: boolean;
  page: number;
  totalPages: number;
  total: number;
  loadingMore: boolean;
  onLoadMore: () => void;
  onThreadClick: (thread: ProcessedThread) => void;
  onToggleStar: (thread: ProcessedThread) => void;
  onArchive: (thread: ProcessedThread) => void;
  onDelete: (thread: ProcessedThread) => void;
}

export function ThreadList({
  threads,
  loading,
  page,
  totalPages,
  total,
  loadingMore,
  onLoadMore,
  onThreadClick,
  onToggleStar,
  onArchive,
  onDelete,
}: ThreadListProps) {
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
          <p className="text-sm text-slate-400">Cargando conversaciones...</p>
        </div>
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <MessageSquare className="w-8 h-8 text-slate-600" />
        </div>
        <h3 className="text-lg font-medium text-slate-300 mb-1">No hay conversaciones</h3>
        <p className="text-sm text-slate-500">
          Las conversaciones aparecerán aquí cuando recibas o envíes emails
        </p>
      </div>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
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

  // Obtener el nombre/email del participante principal (el otro lado de la conversación)
  const getParticipant = (thread: ProcessedThread) => {
    const lastEmail = thread.lastEmail;
    if (!lastEmail) return thread.subject;

    // Si el último email es inbound, mostrar el remitente
    if (lastEmail.direction === 'inbound') {
      return lastEmail.from_name || lastEmail.from_email;
    }
    // Si es outbound, mostrar el destinatario
    return lastEmail.to_name || lastEmail.to_email;
  };

  // Obtener un preview del contenido
  const getPreview = (thread: ProcessedThread) => {
    const lastEmail = thread.lastEmail;
    if (!lastEmail?.body_text) return '';
    return lastEmail.body_text.slice(0, 100).replace(/\n/g, ' ');
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Progress indicator */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/50">
        <span className="text-xs text-slate-500">
          Mostrando {threads.length} de {total} conversaciones
        </span>
        {page < totalPages && (
          <span className="text-xs text-slate-400">
            Scroll para cargar más
          </span>
        )}
      </div>

      {/* Thread List with scroll */}
      <div
        ref={listRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto divide-y divide-slate-800"
      >
        {threads.map((thread) => {
          const isUnread = thread.unreadCount > 0;
          return (
            <div
              key={thread.id}
              className={`
                flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors
                ${isUnread ? 'bg-cyan-500/5 border-l-2 border-l-cyan-500' : 'border-l-2 border-l-transparent'}
                ${hoveredId === thread.id ? 'bg-slate-800/50' : 'hover:bg-slate-800/30'}
              `}
              onMouseEnter={() => setHoveredId(thread.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onThreadClick(thread)}
            >
              {/* Star */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStar(thread);
                }}
                className={`
                  p-1 rounded transition-colors
                  ${thread.hasStarred
                    ? 'text-amber-400 hover:text-amber-300'
                    : 'text-slate-600 hover:text-slate-400'
                  }
                `}
              >
                <Star className={`w-4 h-4 ${thread.hasStarred ? 'fill-current' : ''}`} />
              </button>

              {/* Read Status Icon */}
              <div className="flex-shrink-0">
                {isUnread ? (
                  <Mail className="w-4 h-4 text-cyan-400" />
                ) : (
                  <MailOpen className="w-4 h-4 text-slate-500" />
                )}
              </div>

              {/* Thread Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-sm truncate ${
                    isUnread
                      ? 'font-semibold text-white'
                      : 'font-medium text-slate-200'
                  }`}>
                    {getParticipant(thread)}
                  </span>
                  {thread.lead && (
                    <span className="text-xs text-slate-500 truncate hidden sm:inline">
                      ({thread.lead.localidad || 'Sin localidad'})
                    </span>
                  )}
                  {/* Message count badge */}
                  {thread.totalEmails > 1 && (
                    <span className="flex items-center gap-0.5 text-xs text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                      <MessageSquare className="w-3 h-3" />
                      {thread.totalEmails}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <p className={`text-sm truncate ${
                    isUnread
                      ? 'text-slate-300 font-medium'
                      : 'text-slate-400'
                  }`}>
                    {thread.subject}
                  </p>
                  <span className="text-xs text-slate-500 hidden lg:inline">
                    — {getPreview(thread)}
                  </span>
                </div>
              </div>

              {/* Unread Badge */}
              {isUnread && (
                <span className="flex-shrink-0 text-xs px-1.5 py-0.5 rounded-full bg-cyan-500 text-white font-medium">
                  {thread.unreadCount}
                </span>
              )}

              {/* Participants indicator */}
              {thread.hasInbound && thread.hasOutbound && (
                <div className="flex-shrink-0 hidden md:block" title="Conversación bidireccional">
                  <Users className="w-4 h-4 text-emerald-400" />
                </div>
              )}

              {/* Actions on Hover / Date */}
              {hoveredId === thread.id ? (
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onArchive(thread)}
                    className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded transition-colors"
                    title="Archivar"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(thread)}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <span className="text-xs text-slate-500 whitespace-nowrap">
                  {formatDate(thread.last_email_at)}
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
          {page >= totalPages && threads.length > 0 && (
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
