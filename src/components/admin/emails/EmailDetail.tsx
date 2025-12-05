'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  X,
  Reply,
  Star,
  Archive,
  Trash2,
  ExternalLink,
  Clock,
  User,
  Mail,
  Eye,
  MousePointer,
} from 'lucide-react';
import type { Email } from '@/types/email';
import { EmailStatusBadge } from './EmailStatusBadge';

interface EmailDetailProps {
  email: Email;
  onClose: () => void;
  onReply?: (email: Email) => void;
  onToggleStar: (email: Email) => void;
  onArchive: (email: Email) => void;
  onDelete: (email: Email) => void;
}

export function EmailDetail({
  email,
  onClose,
  onReply,
  onToggleStar,
  onArchive,
  onDelete,
}: EmailDetailProps) {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-3xl max-h-[90vh] bg-slate-900 rounded-xl border border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <EmailStatusBadge status={email.status} />
            {email.direction === 'inbound' && (
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
                Recibido
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggleStar(email)}
              className={`p-2 rounded-lg transition-colors ${
                email.is_starred
                  ? 'text-amber-400 hover:bg-amber-500/10'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
              title={email.is_starred ? 'Quitar destacado' : 'Destacar'}
            >
              <Star className={`w-4 h-4 ${email.is_starred ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={() => onArchive(email)}
              className="p-2 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
              title="Archivar"
            >
              <Archive className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(email)}
              className="p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors"
              title="Eliminar"
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

        {/* Subject */}
        <div className="px-6 py-4 border-b border-slate-800">
          <h2 className="text-xl font-semibold text-white mb-3">{email.subject}</h2>

          <div className="flex flex-wrap gap-4 text-sm">
            {/* From */}
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-500" />
              <span className="text-slate-400">De:</span>
              <span className="text-white">
                {email.from_name ? `${email.from_name} <${email.from_email}>` : email.from_email}
              </span>
            </div>

            {/* To */}
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-500" />
              <span className="text-slate-400">Para:</span>
              <span className="text-white">
                {email.to_name ? `${email.to_name} <${email.to_email}>` : email.to_email}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-2 text-sm">
            {/* Date */}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <span className="text-slate-400">
                {formatDate(email.sent_at || email.created_at)}
              </span>
            </div>

            {/* Lead */}
            {email.lead && (
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Lead:</span>
                <span className="text-cyan-400">{email.lead.nombre}</span>
                {email.lead.localidad && (
                  <span className="text-slate-500">({email.lead.localidad})</span>
                )}
              </div>
            )}
          </div>

          {/* Tracking info */}
          {email.direction === 'outbound' && (email.opened_count > 0 || email.clicked_count > 0) && (
            <div className="flex gap-4 mt-3 pt-3 border-t border-slate-800">
              {email.opened_count > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Abierto {email.opened_count}x</span>
                  {email.opened_at && (
                    <span className="text-slate-500">
                      ({format(new Date(email.opened_at), 'dd/MM HH:mm')})
                    </span>
                  )}
                </div>
              )}
              {email.clicked_count > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-purple-400">
                  <MousePointer className="w-3.5 h-3.5" />
                  <span>Clicks: {email.clicked_count}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div
            className="prose prose-invert prose-sm max-w-none
              prose-p:text-slate-300 prose-p:leading-relaxed
              prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-white
              prose-headings:text-white"
            dangerouslySetInnerHTML={{ __html: email.body_html }}
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2">
            {onReply && (
              <button
                onClick={() => onReply(email)}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Reply className="w-4 h-4" />
                Responder
              </button>
            )}
          </div>

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
    </div>
  );
}
