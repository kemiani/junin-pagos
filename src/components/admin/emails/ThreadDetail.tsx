'use client';

import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  X,
  Reply,
  Star,
  Archive,
  Trash2,
  ChevronDown,
  ChevronUp,
  User,
  Mail,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  ExternalLink,
} from 'lucide-react';
import type { Email, EmailThread } from '@/types/email';

interface ThreadDetailProps {
  thread: EmailThread & { emails: Email[] };
  onClose: () => void;
  onReply: (email: Email) => void;
  onToggleStar: (email: Email) => void;
  onArchive: () => void;
  onDelete: () => void;
}

export function ThreadDetail({
  thread,
  onClose,
  onReply,
  onToggleStar,
  onArchive,
  onDelete,
}: ThreadDetailProps) {
  const [expandedEmails, setExpandedEmails] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Por defecto, expandir el último email
  useEffect(() => {
    if (thread.emails && thread.emails.length > 0) {
      const lastEmail = thread.emails[thread.emails.length - 1];
      setExpandedEmails(new Set([lastEmail.id]));
    }
  }, [thread.emails]);

  // Scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread.emails]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es });
  };

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return format(date, 'HH:mm', { locale: es });
    } else if (diffDays < 7) {
      return format(date, "EEE d, HH:mm", { locale: es });
    } else {
      return format(date, "d MMM", { locale: es });
    }
  };

  const toggleEmail = (emailId: string) => {
    const newExpanded = new Set(expandedEmails);
    if (newExpanded.has(emailId)) {
      newExpanded.delete(emailId);
    } else {
      newExpanded.add(emailId);
    }
    setExpandedEmails(newExpanded);
  };

  const expandAll = () => {
    setExpandedEmails(new Set(thread.emails.map(e => e.id)));
  };

  const collapseAll = () => {
    // Mantener solo el último expandido
    const lastEmail = thread.emails[thread.emails.length - 1];
    setExpandedEmails(new Set([lastEmail.id]));
  };

  const emails = thread.emails || [];
  const lastEmail = emails[emails.length - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-4xl max-h-[90vh] bg-slate-900 rounded-xl border border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-white truncate max-w-md">
              {thread.subject}
            </h2>
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
              {emails.length} {emails.length === 1 ? 'mensaje' : 'mensajes'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {emails.length > 1 && (
              <>
                <button
                  onClick={expandAll}
                  className="px-2 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-white rounded transition-colors"
                  title="Expandir todos"
                >
                  Expandir
                </button>
                <button
                  onClick={collapseAll}
                  className="px-2 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-white rounded transition-colors"
                  title="Colapsar"
                >
                  Colapsar
                </button>
                <div className="w-px h-4 bg-slate-700 mx-1" />
              </>
            )}
            <button
              onClick={onArchive}
              className="p-2 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
              title="Archivar conversación"
            >
              <Archive className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors"
              title="Eliminar conversación"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Lead Info */}
        {thread.lead && (
          <div className="px-4 py-2 bg-slate-800/30 border-b border-slate-800 flex-shrink-0">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-400">Lead:</span>
              <span className="text-cyan-400 font-medium">{thread.lead.nombre}</span>
              {thread.lead.localidad && (
                <span className="text-slate-500">({thread.lead.localidad})</span>
              )}
              {thread.lead.telefono && (
                <span className="text-slate-500">{thread.lead.telefono}</span>
              )}
            </div>
          </div>
        )}

        {/* Email Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {emails.map((email, index) => {
            const isExpanded = expandedEmails.has(email.id);
            const isLast = index === emails.length - 1;
            const isInbound = email.direction === 'inbound';

            return (
              <div
                key={email.id}
                className={`
                  rounded-lg border transition-colors
                  ${isInbound
                    ? 'border-slate-700 bg-slate-800/30'
                    : 'border-cyan-900/30 bg-cyan-900/10'
                  }
                `}
              >
                {/* Email Header (always visible) */}
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                  onClick={() => toggleEmail(email.id)}
                >
                  {/* Direction Icon */}
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                    ${isInbound ? 'bg-emerald-500/20' : 'bg-cyan-500/20'}
                  `}>
                    {isInbound ? (
                      <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 text-cyan-400" />
                    )}
                  </div>

                  {/* Sender Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white truncate">
                        {isInbound
                          ? (email.from_name || email.from_email)
                          : `Para: ${email.to_name || email.to_email}`
                        }
                      </span>
                      <span className={`
                        text-xs px-1.5 py-0.5 rounded
                        ${isInbound
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-cyan-500/20 text-cyan-400'
                        }
                      `}>
                        {isInbound ? 'Recibido' : 'Enviado'}
                      </span>
                    </div>
                    {!isExpanded && (
                      <p className="text-sm text-slate-500 truncate mt-0.5">
                        {email.body_text?.slice(0, 100).replace(/\n/g, ' ') || 'Sin contenido'}
                      </p>
                    )}
                  </div>

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

                  {/* Date */}
                  <span className="text-xs text-slate-500 whitespace-nowrap">
                    {formatShortDate(email.sent_at || email.created_at)}
                  </span>

                  {/* Expand/Collapse */}
                  <div className="text-slate-500">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>

                {/* Email Body (expanded) */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-slate-700/50">
                    {/* Full metadata */}
                    <div className="py-3 space-y-1.5 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-400">De:</span>
                        <span className="text-white">
                          {email.from_name ? `${email.from_name} <${email.from_email}>` : email.from_email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-400">Para:</span>
                        <span className="text-white">
                          {email.to_name ? `${email.to_name} <${email.to_email}>` : email.to_email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-400">
                          {formatDate(email.sent_at || email.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Email content */}
                    <div
                      className="prose prose-invert prose-sm max-w-none mt-3 pt-3 border-t border-slate-700/50
                        prose-p:text-slate-300 prose-p:leading-relaxed
                        prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline
                        prose-strong:text-white
                        prose-headings:text-white"
                      dangerouslySetInnerHTML={{ __html: email.body_html }}
                    />

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-700/50">
                      <button
                        onClick={() => onReply(email)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm text-cyan-400 hover:bg-cyan-500/10 rounded transition-colors"
                      >
                        <Reply className="w-4 h-4" />
                        Responder
                      </button>
                      {email.resend_id && (
                        <a
                          href={`https://resend.com/emails/${email.resend_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Ver en Resend
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Footer - Quick Reply */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800 bg-slate-900/50 flex-shrink-0">
          <button
            onClick={() => lastEmail && onReply(lastEmail)}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Reply className="w-4 h-4" />
            Responder
          </button>
          <span className="text-xs text-slate-500">
            Última actividad: {formatDate(thread.last_email_at || thread.created_at)}
          </span>
        </div>
      </div>
    </div>
  );
}
