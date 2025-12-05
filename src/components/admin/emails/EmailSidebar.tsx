'use client';

import {
  Inbox,
  Send,
  FileText,
  Archive,
  Trash2,
  Star,
  PenSquare,
} from 'lucide-react';
import type { EmailFolder } from '@/types/email';

interface EmailSidebarProps {
  currentFolder: EmailFolder | 'starred';
  onFolderChange: (folder: EmailFolder | 'starred') => void;
  onCompose: () => void;
  counts: {
    inbox: number;
    sent: number;
    drafts: number;
    archived: number;
    trash: number;
    starred: number;
    unread: number;
  };
}

interface FolderItem {
  id: EmailFolder | 'starred';
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  countKey: keyof EmailSidebarProps['counts'];
}

const folders: FolderItem[] = [
  { id: 'inbox', name: 'Bandeja de entrada', icon: Inbox, countKey: 'inbox' },
  { id: 'sent', name: 'Enviados', icon: Send, countKey: 'sent' },
  { id: 'drafts', name: 'Borradores', icon: FileText, countKey: 'drafts' },
  { id: 'starred', name: 'Destacados', icon: Star, countKey: 'starred' },
  { id: 'archived', name: 'Archivados', icon: Archive, countKey: 'archived' },
  { id: 'trash', name: 'Papelera', icon: Trash2, countKey: 'trash' },
];

export function EmailSidebar({
  currentFolder,
  onFolderChange,
  onCompose,
  counts,
}: EmailSidebarProps) {
  return (
    <div className="w-full h-full flex flex-col bg-slate-900/50 border-r border-slate-800">
      {/* Compose Button */}
      <div className="p-3">
        <button
          onClick={onCompose}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <PenSquare className="w-4 h-4" />
          <span>Redactar</span>
        </button>
      </div>

      {/* Folders */}
      <nav className="flex-1 px-2 py-1 space-y-0.5 overflow-y-auto">
        {folders.map((folder) => {
          const Icon = folder.icon;
          const isActive = currentFolder === folder.id;
          const count = counts[folder.countKey];
          // Para inbox, mostrar no leídos en lugar del total
          const isInbox = folder.id === 'inbox';
          const unreadCount = counts.unread;

          return (
            <button
              key={folder.id}
              onClick={() => onFolderChange(folder.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                transition-colors relative
                ${isActive
                  ? 'bg-cyan-500/10 text-cyan-400'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }
              `}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-cyan-500 rounded-r" />
              )}
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span className="flex-1 text-left">{folder.name}</span>
              {/* Badge de no leídos para inbox */}
              {isInbox && unreadCount > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-cyan-500 text-white font-medium">
                  {unreadCount}
                </span>
              )}
              {/* Badge de conteo para otros folders */}
              {!isInbox && count > 0 && (
                <span className={`
                  text-xs px-1.5 py-0.5 rounded
                  ${isActive ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-500'}
                `}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Stats */}
      <div className="p-3 border-t border-slate-800">
        <div className="text-xs text-slate-500 text-center">
          {counts.sent + counts.drafts} emails en total
        </div>
      </div>
    </div>
  );
}
