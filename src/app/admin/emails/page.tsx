'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Search, X } from 'lucide-react';
import type { Email, EmailFolder } from '@/types/email';
import { EmailSidebar } from '@/components/admin/emails/EmailSidebar';
import { EmailList } from '@/components/admin/emails/EmailList';
import { EmailDetail } from '@/components/admin/emails/EmailDetail';

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

export default function EmailsPage() {
  const router = useRouter();
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFolder, setCurrentFolder] = useState<EmailFolder | 'starred'>('inbox');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [counts, setCounts] = useState({
    inbox: 0,
    sent: 0,
    drafts: 0,
    archived: 0,
    trash: 0,
    starred: 0,
  });
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  // Fetch emails
  const fetchEmails = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
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
        setEmails(data.data);
        setTotalPages(data.meta.totalPages);
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setLoading(false);
    }
  }, [currentFolder, page, search]);

  // Fetch counts for all folders
  const fetchCounts = useCallback(async () => {
    try {
      const folders: EmailFolder[] = ['inbox', 'sent', 'drafts', 'archived', 'trash'];
      const countsPromises = folders.map(async (folder) => {
        const response = await fetch(`/api/admin/emails/list?folder=${folder}&limit=1`, {
          credentials: 'include',
        });
        const data: EmailsResponse = await response.json();
        return { folder, count: data.meta?.total || 0 };
      });

      // Starred count
      const starredResponse = await fetch(`/api/admin/emails/list?is_starred=true&limit=1`, {
        credentials: 'include',
      });
      const starredData: EmailsResponse = await starredResponse.json();

      const results = await Promise.all(countsPromises);
      const newCounts = {
        inbox: 0,
        sent: 0,
        drafts: 0,
        archived: 0,
        trash: 0,
        starred: starredData.meta?.total || 0,
      };

      results.forEach(({ folder, count }) => {
        newCounts[folder as EmailFolder] = count;
      });

      setCounts(newCounts);
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  }, []);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  // Handle folder change
  const handleFolderChange = (folder: EmailFolder | 'starred') => {
    setCurrentFolder(folder);
    setPage(1);
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

  // Handle email click
  const handleEmailClick = (email: Email) => {
    setSelectedEmail(email);
  };

  // Handle close detail
  const handleCloseDetail = () => {
    setSelectedEmail(null);
  };

  // Handle reply
  const handleReply = (email: Email) => {
    router.push(`/admin/emails/compose?to=${email.from_email}&subject=Re: ${encodeURIComponent(email.subject)}`);
  };

  // Handle toggle star
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
        fetchCounts();
      }
    } catch (error) {
      console.error('Error toggling star:', error);
    }
  };

  // Handle archive
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

  // Handle delete
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
              onClick={() => fetchEmails()}
              disabled={loading}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors disabled:opacity-50"
              title="Actualizar"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
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
                placeholder="Buscar emails..."
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

        {/* Email List */}
        <EmailList
          emails={emails}
          loading={loading}
          folder={currentFolder === 'starred' ? 'sent' : currentFolder}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          onEmailClick={handleEmailClick}
          onToggleStar={handleToggleStar}
          onArchive={handleArchive}
          onDelete={handleDelete}
          onRestore={currentFolder === 'trash' ? handleRestore : undefined}
        />
      </div>

      {/* Email Detail Modal */}
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
    </div>
  );
}
