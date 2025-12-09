'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Search, X, MessageSquare, Mail, LayoutList } from 'lucide-react';
import type { Email, EmailFolder, EmailThread } from '@/types/email';
import { EmailSidebar } from '@/components/admin/emails/EmailSidebar';
import { EmailList } from '@/components/admin/emails/EmailList';
import { EmailDetail } from '@/components/admin/emails/EmailDetail';
import { ThreadList } from '@/components/admin/emails/ThreadList';
import { ThreadDetail } from '@/components/admin/emails/ThreadDetail';

interface EmailsResponse {
  success: boolean;
  data: Email[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ProcessedThread extends EmailThread {
  lastEmail: Email;
  unreadCount: number;
  hasStarred: boolean;
  totalEmails: number;
  hasInbound: boolean;
  hasOutbound: boolean;
}

interface ThreadsResponse {
  success: boolean;
  data: ProcessedThread[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ThreadDetailResponse {
  success: boolean;
  data: EmailThread & { emails: Email[] };
}

type ViewMode = 'emails' | 'threads';

export default function EmailsPage() {
  const router = useRouter();

  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>('threads');

  // Email state
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  // Thread state
  const [threads, setThreads] = useState<ProcessedThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<(EmailThread & { emails: Email[] }) | null>(null);

  // Common state
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentFolder, setCurrentFolder] = useState<EmailFolder | 'starred'>('inbox');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [counts, setCounts] = useState({
    inbox: 0,
    sent: 0,
    drafts: 0,
    archived: 0,
    trash: 0,
    starred: 0,
    unread: 0,
  });

  // Fetch threads (initial load or filter change)
  const fetchThreads = useCallback(async (resetPage = true) => {
    if (resetPage) {
      setLoading(true);
      setPage(1);
    }

    try {
      const params = new URLSearchParams({
        page: resetPage ? '1' : page.toString(),
        limit: '25',
        folder: currentFolder === 'starred' ? 'inbox' : currentFolder,
      });

      if (search) {
        params.set('search', search);
      }

      const response = await fetch(`/api/admin/emails/threads?${params}`, {
        credentials: 'include',
      });

      const data: ThreadsResponse = await response.json();

      if (data.success) {
        if (resetPage) {
          setThreads(data.data);
        } else {
          // Append for infinite scroll
          setThreads(prev => [...prev, ...data.data]);
        }
        setTotalPages(data.meta.totalPages);
        setTotal(data.meta.total);
      }
    } catch (error) {
      console.error('Error fetching threads:', error);
    } finally {
      setLoading(false);
    }
  }, [currentFolder, page, search]);

  // Load more threads for infinite scroll
  const loadMoreThreads = useCallback(async () => {
    if (loadingMore || page >= totalPages) return;

    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      const params = new URLSearchParams({
        page: nextPage.toString(),
        limit: '25',
        folder: currentFolder === 'starred' ? 'inbox' : currentFolder,
      });

      if (search) {
        params.set('search', search);
      }

      const response = await fetch(`/api/admin/emails/threads?${params}`, {
        credentials: 'include',
      });

      const data: ThreadsResponse = await response.json();

      if (data.success) {
        setThreads(prev => [...prev, ...data.data]);
        setPage(nextPage);
        setTotalPages(data.meta.totalPages);
        setTotal(data.meta.total);
      }
    } catch (error) {
      console.error('Error loading more threads:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [currentFolder, page, totalPages, search, loadingMore]);

  // Fetch emails (initial load or filter change)
  const fetchEmails = useCallback(async (resetPage = true) => {
    if (resetPage) {
      setLoading(true);
      setPage(1);
    }

    try {
      const params = new URLSearchParams({
        page: resetPage ? '1' : page.toString(),
        limit: '25',
      });

      if (currentFolder === 'starred') {
        params.set('is_starred', 'true');
      } else {
        params.set('folder', currentFolder);
      }

      if (search) {
        params.set('search', search);
      }

      const response = await fetch(`/api/admin/emails/list?${params}`, {
        credentials: 'include',
      });

      const data: EmailsResponse = await response.json();

      if (data.success) {
        if (resetPage) {
          setEmails(data.data);
        } else {
          setEmails(prev => [...prev, ...data.data]);
        }
        setTotalPages(data.meta.totalPages);
        setTotal(data.meta.total);
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setLoading(false);
    }
  }, [currentFolder, page, search]);

  // Load more emails for infinite scroll
  const loadMoreEmails = useCallback(async () => {
    if (loadingMore || page >= totalPages) return;

    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      const params = new URLSearchParams({
        page: nextPage.toString(),
        limit: '25',
      });

      if (currentFolder === 'starred') {
        params.set('is_starred', 'true');
      } else {
        params.set('folder', currentFolder);
      }

      if (search) {
        params.set('search', search);
      }

      const response = await fetch(`/api/admin/emails/list?${params}`, {
        credentials: 'include',
      });

      const data: EmailsResponse = await response.json();

      if (data.success) {
        setEmails(prev => [...prev, ...data.data]);
        setPage(nextPage);
        setTotalPages(data.meta.totalPages);
        setTotal(data.meta.total);
      }
    } catch (error) {
      console.error('Error loading more emails:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [currentFolder, page, totalPages, search, loadingMore]);

  // Fetch counts for all folders (single API call to avoid rate limits)
  const fetchCounts = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/emails/counts', {
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        setCounts(data.data);
      }
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  }, []);

  // Fetch data based on view mode
  useEffect(() => {
    if (viewMode === 'threads') {
      fetchThreads(true);
    } else {
      fetchEmails(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, currentFolder, search]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  // Handle folder change
  const handleFolderChange = (folder: EmailFolder | 'starred') => {
    setCurrentFolder(folder);
    setPage(1);
    setThreads([]); // Reset threads for new folder
    setEmails([]); // Reset emails for new folder
    setSearch('');
    setSearchInput('');
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  // Clear search
  const clearSearch = () => {
    setSearch('');
    setSearchInput('');
    setPage(1);
  };

  // Handle compose
  const handleCompose = () => {
    router.push('/admin/emails/compose');
  };

  // Handle email click - marcar como leído si es inbound y no leído
  const handleEmailClick = async (email: Email) => {
    setSelectedEmail(email);

    // Si es inbound y no está leído, marcarlo como leído
    if (email.direction === 'inbound' && !email.is_read) {
      try {
        const response = await fetch('/api/admin/emails/list', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            id: email.id,
            is_read: true,
          }),
        });

        if (response.ok) {
          // Actualizar la lista local
          setEmails((prev) =>
            prev.map((e) =>
              e.id === email.id ? { ...e, is_read: true } : e
            )
          );
          // Actualizar el email seleccionado
          setSelectedEmail({ ...email, is_read: true });
          // Actualizar contadores
          fetchCounts();
        }
      } catch (error) {
        console.error('Error marking email as read:', error);
      }
    }
  };

  // Handle thread click - abrir conversación y marcar como leídos
  const handleThreadClick = async (thread: ProcessedThread) => {
    try {
      const response = await fetch('/api/admin/emails/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          thread_id: thread.id,
          mark_as_read: true,
        }),
      });

      const data: ThreadDetailResponse = await response.json();

      if (data.success) {
        setSelectedThread(data.data);

        // Actualizar el thread en la lista si tenía no leídos
        if (thread.unreadCount > 0) {
          setThreads((prev) =>
            prev.map((t) =>
              t.id === thread.id ? { ...t, unreadCount: 0 } : t
            )
          );
          fetchCounts();
        }
      }
    } catch (error) {
      console.error('Error fetching thread:', error);
    }
  };

  // Handle close detail
  const handleCloseDetail = () => {
    setSelectedEmail(null);
  };

  // Handle close thread
  const handleCloseThread = () => {
    setSelectedThread(null);
  };

  // Handle reply
  const handleReply = (email: Email) => {
    // Determinar el thread_id si existe
    const threadId = email.thread_id || selectedThread?.id;

    // Construir parámetros de respuesta
    const params = new URLSearchParams();
    params.set('to', email.from_email);
    params.set('subject', email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`);

    // Si es inbound, usar la cuenta que recibió el email (to_email)
    // para responder desde la misma cuenta
    if (email.direction === 'inbound' && email.to_email) {
      params.set('reply_from', email.to_email);
    }

    if (threadId) {
      params.set('thread_id', threadId);
    }

    // Indicar que es una respuesta (no usar template por defecto)
    params.set('is_reply', 'true');

    router.push(`/admin/emails/compose?${params.toString()}`);
  };

  // Handle toggle star (email)
  const handleToggleStar = async (email: Email) => {
    try {
      const response = await fetch('/api/admin/emails/list', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: email.id,
          is_starred: !email.is_starred,
        }),
      });

      if (response.ok) {
        setEmails((prev) =>
          prev.map((e) =>
            e.id === email.id ? { ...e, is_starred: !e.is_starred } : e
          )
        );

        // También actualizar en el thread seleccionado si existe
        if (selectedThread) {
          setSelectedThread({
            ...selectedThread,
            emails: selectedThread.emails.map((e) =>
              e.id === email.id ? { ...e, is_starred: !e.is_starred } : e
            ),
          });
        }

        fetchCounts();
      }
    } catch (error) {
      console.error('Error toggling star:', error);
    }
  };

  // Handle toggle star thread (marca el primer email del thread)
  const handleToggleStarThread = async (thread: ProcessedThread) => {
    if (!thread.lastEmail) return;
    await handleToggleStar(thread.lastEmail);

    // Refrescar threads
    fetchThreads();
  };

  // Handle archive (email)
  const handleArchive = async (email: Email) => {
    try {
      const response = await fetch('/api/admin/emails/list', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: email.id,
          folder: 'archived',
        }),
      });

      if (response.ok) {
        setEmails((prev) => prev.filter((e) => e.id !== email.id));
        fetchCounts();
      }
    } catch (error) {
      console.error('Error archiving email:', error);
    }
  };

  // Handle archive thread
  const handleArchiveThread = async (thread: ProcessedThread) => {
    try {
      const emailsToArchive = thread.emails || [];

      if (emailsToArchive.length === 0) {
        console.warn('No emails to archive in thread:', thread.id);
        return;
      }

      // Archivar todos los emails del thread
      const archivePromises = emailsToArchive.map((email) =>
        fetch('/api/admin/emails/list', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            id: email.id,
            folder: 'archived',
          }),
        })
      );

      await Promise.all(archivePromises);

      // Actualizar ambas vistas
      setThreads((prev) => prev.filter((t) => t.id !== thread.id));
      setEmails((prev) => prev.filter((e) => !emailsToArchive.some((te) => te.id === e.id)));
      setSelectedThread(null);
      fetchCounts();
    } catch (error) {
      console.error('Error archiving thread:', error);
    }
  };

  // Handle delete (email)
  const handleDelete = async (email: Email) => {
    const permanent = currentFolder === 'trash';

    try {
      const response = await fetch('/api/admin/emails/list', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: email.id,
          permanent,
        }),
      });

      if (response.ok) {
        setEmails((prev) => prev.filter((e) => e.id !== email.id));
        fetchCounts();
      }
    } catch (error) {
      console.error('Error deleting email:', error);
    }
  };

  // Handle delete thread
  const handleDeleteThread = async (thread: ProcessedThread) => {
    try {
      const emailsToDelete = thread.emails || [];

      if (emailsToDelete.length === 0) {
        console.warn('No emails to delete in thread:', thread.id);
        return;
      }

      // Eliminar todos los emails del thread
      const deletePromises = emailsToDelete.map((email) =>
        fetch('/api/admin/emails/list', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            id: email.id,
            permanent: false,
          }),
        })
      );

      await Promise.all(deletePromises);

      // Actualizar ambas vistas
      setThreads((prev) => prev.filter((t) => t.id !== thread.id));
      setEmails((prev) => prev.filter((e) => !emailsToDelete.some((te) => te.id === e.id)));
      setSelectedThread(null);
      fetchCounts();
    } catch (error) {
      console.error('Error deleting thread:', error);
    }
  };

  // Handle restore
  const handleRestore = async (email: Email) => {
    try {
      const response = await fetch('/api/admin/emails/list', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: email.id,
          folder: 'sent',
        }),
      });

      if (response.ok) {
        setEmails((prev) => prev.filter((e) => e.id !== email.id));
        fetchCounts();
      }
    } catch (error) {
      console.error('Error restoring email:', error);
    }
  };

  // Get folder title
  const getFolderTitle = () => {
    switch (currentFolder) {
      case 'inbox':
        return 'Bandeja de entrada';
      case 'sent':
        return 'Enviados';
      case 'drafts':
        return 'Borradores';
      case 'archived':
        return 'Archivados';
      case 'trash':
        return 'Papelera';
      case 'starred':
        return 'Destacados';
      default:
        return 'Emails';
    }
  };

  // Refresh current view
  const handleRefresh = () => {
    if (viewMode === 'threads') {
      fetchThreads();
    } else {
      fetchEmails();
    }
  };

  return (
    <div className="h-[calc(100vh-180px)] flex bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
      {/* Sidebar */}
      <div className="w-52 flex-shrink-0 hidden md:block">
        <EmailSidebar
          currentFolder={currentFolder}
          onFolderChange={handleFolderChange}
          onCompose={handleCompose}
          counts={counts}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-white">{getFolderTitle()}</h2>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors disabled:opacity-50"
              title="Actualizar"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('threads')}
              className={`
                flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors
                ${viewMode === 'threads'
                  ? 'bg-cyan-500 text-white'
                  : 'text-slate-400 hover:text-white'
                }
              `}
              title="Vista de conversaciones"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Conversaciones</span>
            </button>
            <button
              onClick={() => setViewMode('emails')}
              className={`
                flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors
                ${viewMode === 'emails'
                  ? 'bg-cyan-500 text-white'
                  : 'text-slate-400 hover:text-white'
                }
              `}
              title="Vista individual"
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Individual</span>
            </button>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={viewMode === 'threads' ? 'Buscar conversaciones...' : 'Buscar emails...'}
                className="w-full pl-9 pr-8 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
              {(search || searchInput) && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>

          {/* Mobile Compose */}
          <button
            onClick={handleCompose}
            className="md:hidden px-3 py-2 bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Redactar
          </button>
        </div>

        {/* Mobile Folder Tabs */}
        <div className="md:hidden flex items-center gap-1 px-2 py-2 border-b border-slate-800 overflow-x-auto">
          {(['inbox', 'sent', 'drafts', 'starred', 'archived', 'trash'] as const).map((folder) => (
            <button
              key={folder}
              onClick={() => handleFolderChange(folder)}
              className={`
                px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors
                ${currentFolder === folder
                  ? 'bg-cyan-500/10 text-cyan-400'
                  : 'text-slate-400 hover:bg-slate-800'
                }
              `}
            >
              {folder === 'inbox' && 'Entrada'}
              {folder === 'sent' && 'Enviados'}
              {folder === 'drafts' && 'Borradores'}
              {folder === 'starred' && 'Destacados'}
              {folder === 'archived' && 'Archivados'}
              {folder === 'trash' && 'Papelera'}
            </button>
          ))}
        </div>

        {/* Content - Thread or Email List */}
        <div className="flex-1 min-h-0">
          {viewMode === 'threads' ? (
            <ThreadList
              threads={threads}
              loading={loading}
              page={page}
              totalPages={totalPages}
              total={total}
              loadingMore={loadingMore}
              onLoadMore={loadMoreThreads}
              onThreadClick={handleThreadClick}
              onToggleStar={handleToggleStarThread}
              onArchive={handleArchiveThread}
              onDelete={handleDeleteThread}
            />
          ) : (
            <EmailList
              emails={emails}
              loading={loading}
              folder={currentFolder === 'starred' ? 'sent' : currentFolder}
              page={page}
              totalPages={totalPages}
              total={total}
              loadingMore={loadingMore}
              onLoadMore={loadMoreEmails}
              onEmailClick={handleEmailClick}
              onToggleStar={handleToggleStar}
              onArchive={handleArchive}
              onDelete={handleDelete}
              onRestore={currentFolder === 'trash' ? handleRestore : undefined}
            />
          )}
        </div>
      </div>

      {/* Email Detail Modal (individual view) */}
      {selectedEmail && (
        <EmailDetail
          email={selectedEmail}
          onClose={handleCloseDetail}
          onReply={handleReply}
          onToggleStar={(email) => {
            handleToggleStar(email);
            setSelectedEmail({ ...email, is_starred: !email.is_starred });
          }}
          onArchive={(email) => {
            handleArchive(email);
            setSelectedEmail(null);
          }}
          onDelete={(email) => {
            handleDelete(email);
            setSelectedEmail(null);
          }}
        />
      )}

      {/* Thread Detail Modal (conversation view) */}
      {selectedThread && (
        <ThreadDetail
          thread={selectedThread}
          onClose={handleCloseThread}
          onReply={handleReply}
          onToggleStar={handleToggleStar}
          onArchive={() => {
            // Archive all emails in thread
            if (selectedThread.emails && selectedThread.emails.length > 0) {
              const emailIds = selectedThread.emails.map((e) => e.id);
              Promise.all(
                selectedThread.emails.map((email) =>
                  fetch('/api/admin/emails/list', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ id: email.id, folder: 'archived' }),
                  })
                )
              ).then(() => {
                setSelectedThread(null);
                setThreads((prev) => prev.filter((t) => t.id !== selectedThread.id));
                setEmails((prev) => prev.filter((e) => !emailIds.includes(e.id)));
                fetchCounts();
              });
            }
          }}
          onDelete={() => {
            // Delete all emails in thread
            if (selectedThread.emails && selectedThread.emails.length > 0) {
              const emailIds = selectedThread.emails.map((e) => e.id);
              Promise.all(
                selectedThread.emails.map((email) =>
                  fetch('/api/admin/emails/list', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ id: email.id, permanent: false }),
                  })
                )
              ).then(() => {
                setSelectedThread(null);
                setThreads((prev) => prev.filter((t) => t.id !== selectedThread.id));
                setEmails((prev) => prev.filter((e) => !emailIds.includes(e.id)));
                fetchCounts();
              });
            }
          }}
        />
      )}
    </div>
  );
}
