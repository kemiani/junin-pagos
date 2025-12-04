'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  RefreshCw, Download, Trash2, Search, Users, TrendingUp,
  X, ChevronUp, ChevronDown, ChevronsUpDown,
  MessageCircle, Check, ChevronLeft, ChevronRight,
  CheckSquare, Square, AlertCircle, MapPin, Calendar, Phone,
  Eye, Target
} from 'lucide-react';

type LeadEstado = 'nuevo' | 'contactado' | 'interesado' | 'convertido' | 'perdido';

interface Lead {
  id: number;
  nombre: string;
  telefono: string;
  localidad: string;
  ip?: string;
  estado?: LeadEstado;
  notas?: string;
  created_at: string;
}

type SortField = 'id' | 'nombre' | 'telefono' | 'localidad' | 'estado' | 'created_at';
type SortDirection = 'asc' | 'desc';

const API_ENDPOINT = '/api/admin/leads/list';

const LEAD_ESTADOS: { value: LeadEstado; label: string; color: string; bg: string }[] = [
  { value: 'nuevo', label: 'Nuevo', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { value: 'contactado', label: 'Contactado', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { value: 'interesado', label: 'Interesado', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { value: 'convertido', label: 'Convertido', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { value: 'perdido', label: 'Perdido', color: 'text-red-400', bg: 'bg-red-500/10' },
];

const getEstadoConfig = (estado?: LeadEstado) => {
  return LEAD_ESTADOS.find(e => e.value === estado) || LEAD_ESTADOS[0];
};

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${type === 'success' ? 'bg-emerald-600' : 'bg-red-600'} text-white`}>
      {type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-80"><X className="w-4 h-4" /></button>
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, subtitle, color }: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  subtitle?: string;
  color?: string;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</span>
        <div className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center">
          <Icon className={`w-4 h-4 ${color || 'text-cyan-400'}`} />
        </div>
      </div>
      <p className="text-2xl font-semibold text-white tabular-nums">{value}</p>
      {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
    </div>
  );
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modal de detalle
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadNotas, setLeadNotas] = useState('');
  const [isSavingNotas, setIsSavingNotas] = useState(false);

  const showToast = (message: string, type: 'success' | 'error') => setToast({ message, type });

  const fetchLeads = useCallback(async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_ENDPOINT}?limit=1000&sortBy=created_at&sortOrder=desc`, {
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al cargar los leads');
      }

      const leadsData = (result.data || []).map((lead: Lead) => ({
        ...lead,
        estado: lead.estado || 'nuevo',
      }));

      setLeads(leadsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los leads');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const filteredAndSortedLeads = useMemo(() => {
    let filtered = [...leads];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (lead) =>
          lead.nombre.toLowerCase().includes(term) ||
          lead.telefono.includes(term) ||
          lead.localidad.toLowerCase().includes(term)
      );
    }

    filtered.sort((a, b) => {
      let aVal: string | number = a[sortField] as string | number;
      let bVal: string | number = b[sortField] as string | number;

      if (aVal === undefined || aVal === null) aVal = '';
      if (bVal === undefined || bVal === null) bVal = '';

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal as string).toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [leads, searchTerm, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedLeads.length / itemsPerPage);
  const paginatedLeads = filteredAndSortedLeads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ChevronsUpDown className="w-3.5 h-3.5 text-slate-600" />;
    return sortDirection === 'asc'
      ? <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
      : <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />;
  };

  const updateLeadEstado = async (leadId: number, newEstado: LeadEstado) => {
    setUpdatingId(leadId);

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: leadId, estado: newEstado }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al actualizar');
      }

      setLeads(prev => prev.map(lead =>
        lead.id === leadId ? { ...lead, estado: newEstado } : lead
      ));
      showToast('Estado actualizado', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al actualizar', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Eliminar este lead?')) return;

    setDeletingId(id);

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al eliminar');
      }

      setLeads(prev => prev.filter(lead => lead.id !== id));
      showToast('Lead eliminado', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al eliminar', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const bulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Eliminar ${selectedIds.size} leads?`)) return;

    try {
      const deletePromises = Array.from(selectedIds).map(id =>
        fetch(API_ENDPOINT, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ id }),
        })
      );

      await Promise.all(deletePromises);
      setLeads(prev => prev.filter(lead => !selectedIds.has(lead.id)));
      showToast(`${selectedIds.size} leads eliminados`, 'success');
      setSelectedIds(new Set());
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al eliminar', 'error');
    }
  };

  const bulkUpdateEstado = async (newEstado: LeadEstado) => {
    if (selectedIds.size === 0) return;

    try {
      const updatePromises = Array.from(selectedIds).map(id =>
        fetch(API_ENDPOINT, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ id, estado: newEstado }),
        })
      );

      await Promise.all(updatePromises);
      setLeads(prev => prev.map(lead =>
        selectedIds.has(lead.id) ? { ...lead, estado: newEstado } : lead
      ));
      showToast(`${selectedIds.size} leads actualizados`, 'success');
      setSelectedIds(new Set());
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al actualizar', 'error');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedLeads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedLeads.map(l => l.id)));
    }
  };

  const toggleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const handleExportCSV = () => {
    const dataToExport = selectedIds.size > 0
      ? filteredAndSortedLeads.filter(l => selectedIds.has(l.id))
      : filteredAndSortedLeads;

    if (dataToExport.length === 0) {
      showToast('No hay leads para exportar', 'error');
      return;
    }

    const headers = ['ID', 'Nombre', 'Telefono', 'Localidad', 'Estado', 'Notas', 'IP', 'Fecha'];
    const csvContent = [
      headers.join(','),
      ...dataToExport.map((lead) =>
        [
          lead.id,
          `"${lead.nombre}"`,
          `"${lead.telefono}"`,
          `"${lead.localidad}"`,
          `"${lead.estado || 'nuevo'}"`,
          `"${(lead.notas || '').replace(/"/g, '""')}"`,
          `"${lead.ip || ''}"`,
          `"${lead.created_at || ''}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leads_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    showToast(`${dataToExport.length} leads exportados`, 'success');
  };

  const getWhatsAppUrl = (telefono: string): string => {
    let phone = telefono.replace(/[^\d]/g, '');
    if (phone.startsWith('0')) phone = phone.substring(1);
    if (!phone.startsWith('54')) phone = '54' + phone;
    if (phone.startsWith('54') && !phone.startsWith('549') && phone.length === 12) {
      phone = '549' + phone.substring(2);
    }
    return `https://wa.me/${phone}`;
  };

  const formatShortDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Ahora';
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const openLeadDetail = (lead: Lead) => {
    setSelectedLead(lead);
    setLeadNotas(lead.notas || '');
  };

  const saveLeadNotas = async () => {
    if (!selectedLead?.id) return;

    setIsSavingNotas(true);

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: selectedLead.id, notas: leadNotas }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al guardar');
      }

      setLeads(prev => prev.map(lead =>
        lead.id === selectedLead.id ? { ...lead, notas: leadNotas } : lead
      ));
      showToast('Notas guardadas', 'success');
      setSelectedLead({ ...selectedLead, notas: leadNotas });
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al guardar', 'error');
    } finally {
      setIsSavingNotas(false);
    }
  };

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return {
      total: leads.length,
      today: leads.filter(l => l.created_at && new Date(l.created_at) >= today).length,
      filtered: filteredAndSortedLeads.length,
      convertidos: leads.filter(l => l.estado === 'convertido').length,
    };
  }, [leads, filteredAndSortedLeads.length]);

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Leads</h1>
          <p className="text-sm text-slate-500 mt-0.5">Gestiona y exporta contactos</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchLeads(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
          <button
            onClick={handleExportCSV}
            disabled={filteredAndSortedLeads.length === 0}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">CSV</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Leads" value={stats.total.toLocaleString()} icon={Users} />
        <StatsCard title="Hoy" value={stats.today} icon={TrendingUp} />
        <StatsCard title="Convertidos" value={stats.convertidos} icon={Target} color="text-emerald-400" subtitle={stats.total > 0 ? `${Math.round((stats.convertidos / stats.total) * 100)}% del total` : undefined} />
        <StatsCard title="Filtrados" value={stats.filtered} icon={Search} subtitle={searchTerm ? 'Busqueda activa' : undefined} />
      </div>

      {/* Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por nombre, telefono, localidad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
          />
        </div>

        {selectedIds.size > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-slate-300">{selectedIds.size} seleccionado{selectedIds.size > 1 ? 's' : ''}</span>
            <div className="flex items-center gap-2 ml-auto">
              <select
                onChange={(e) => { if (e.target.value) { bulkUpdateEstado(e.target.value as LeadEstado); e.target.value = ''; } }}
                className="h-8 px-3 text-sm bg-slate-800 border border-slate-700 rounded text-white"
              >
                <option value="">Cambiar estado...</option>
                {LEAD_ESTADOS.map(estado => <option key={estado.value} value={estado.value}>{estado.label}</option>)}
              </select>
              <button onClick={bulkDelete} className="h-8 px-3 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-lg">Eliminar</button>
              <button onClick={() => setSelectedIds(new Set())} className="h-8 px-3 text-sm text-slate-400 hover:text-white">Cancelar</button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center">
            <div className="w-6 h-6 border-2 border-slate-700 border-t-cyan-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500">Cargando leads...</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-800/50 border-b border-slate-800">
                    <th className="w-12 px-4 py-3">
                      <button onClick={toggleSelectAll} className="hover:opacity-70">
                        {selectedIds.size === paginatedLeads.length && paginatedLeads.length > 0
                          ? <CheckSquare className="w-4 h-4 text-cyan-400" />
                          : <Square className="w-4 h-4 text-slate-600" />}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <button onClick={() => handleSort('nombre')} className="flex items-center gap-1.5 text-xs font-medium text-slate-500 uppercase">
                        Nombre {getSortIcon('nombre')}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <button onClick={() => handleSort('telefono')} className="flex items-center gap-1.5 text-xs font-medium text-slate-500 uppercase">
                        Telefono {getSortIcon('telefono')}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <button onClick={() => handleSort('localidad')} className="flex items-center gap-1.5 text-xs font-medium text-slate-500 uppercase">
                        Localidad {getSortIcon('localidad')}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <button onClick={() => handleSort('estado')} className="flex items-center gap-1.5 text-xs font-medium text-slate-500 uppercase">
                        Estado {getSortIcon('estado')}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <button onClick={() => handleSort('created_at')} className="flex items-center gap-1.5 text-xs font-medium text-slate-500 uppercase">
                        Fecha {getSortIcon('created_at')}
                      </button>
                    </th>
                    <th className="w-28 px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {paginatedLeads.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center">
                        <Users className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">
                          {searchTerm ? 'No se encontraron resultados' : 'No hay leads registrados'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginatedLeads.map((lead) => {
                      const estadoConfig = getEstadoConfig(lead.estado);
                      const isUpdating = updatingId === lead.id;
                      return (
                        <tr key={lead.id} className="hover:bg-slate-800/30">
                          <td className="px-4 py-3">
                            <button onClick={() => toggleSelect(lead.id)} className="hover:opacity-70">
                              {selectedIds.has(lead.id)
                                ? <CheckSquare className="w-4 h-4 text-cyan-400" />
                                : <Square className="w-4 h-4 text-slate-600" />}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={() => openLeadDetail(lead)} className="text-sm font-medium text-white hover:text-cyan-400">
                              {lead.nombre}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <a href={getWhatsAppUrl(lead.telefono)} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-400 hover:text-emerald-300">
                              {lead.telefono}
                            </a>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-slate-400">{lead.localidad || '-'}</span>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={lead.estado || 'nuevo'}
                              onChange={(e) => updateLeadEstado(lead.id, e.target.value as LeadEstado)}
                              disabled={isUpdating}
                              className={`text-xs font-medium px-2 py-1 rounded border-0 cursor-pointer disabled:opacity-50 ${estadoConfig.bg} ${estadoConfig.color}`}
                            >
                              {LEAD_ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-slate-500">{formatShortDate(lead.created_at)}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => openLeadDetail(lead)} className="p-1.5 text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 rounded" title="Ver detalle">
                                <Eye className="w-4 h-4" />
                              </button>
                              <a href={getWhatsAppUrl(lead.telefono)} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded" title="WhatsApp">
                                <MessageCircle className="w-4 h-4" />
                              </a>
                              <button
                                onClick={() => handleDelete(lead.id)}
                                disabled={deletingId === lead.id}
                                className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded disabled:opacity-50"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-slate-800">
              {paginatedLeads.length === 0 ? (
                <div className="py-16 text-center">
                  <Users className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">
                    {searchTerm ? 'No se encontraron resultados' : 'No hay leads registrados'}
                  </p>
                </div>
              ) : (
                paginatedLeads.map((lead) => {
                  const estadoConfig = getEstadoConfig(lead.estado);
                  return (
                    <div key={lead.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <button onClick={() => toggleSelect(lead.id)} className="mt-0.5">
                          {selectedIds.has(lead.id)
                            ? <CheckSquare className="w-4 h-4 text-cyan-400" />
                            : <Square className="w-4 h-4 text-slate-600" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <button onClick={() => openLeadDetail(lead)} className="text-sm font-medium text-white hover:text-cyan-400">
                              {lead.nombre}
                            </button>
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded flex-shrink-0 ${estadoConfig.bg} ${estadoConfig.color}`}>
                              {estadoConfig.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                            <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{lead.telefono}</span>
                            {lead.localidad && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{lead.localidad}</span>}
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatShortDate(lead.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            <button onClick={() => openLeadDetail(lead)} className="flex-1 h-8 flex items-center justify-center text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg">
                              Ver detalle
                            </button>
                            <a href={getWhatsAppUrl(lead.telefono)} target="_blank" rel="noopener noreferrer" className="h-8 w-8 flex items-center justify-center text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg">
                              <MessageCircle className="w-4 h-4" />
                            </a>
                            <button onClick={() => handleDelete(lead.id)} className="h-8 w-8 flex items-center justify-center text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination */}
            {filteredAndSortedLeads.length > 0 && (
              <div className="border-t border-slate-800 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <span>Mostrar:</span>
                  <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))} className="h-8 px-2 bg-slate-800 border border-slate-700 rounded text-sm text-white">
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="hidden sm:inline">
                    {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredAndSortedLeads.length)} de {filteredAndSortedLeads.length}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="h-8 w-8 flex items-center justify-center border border-slate-700 rounded hover:bg-slate-800 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-400" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`h-8 w-8 flex items-center justify-center text-sm rounded ${currentPage === pageNum ? 'bg-cyan-600 text-white' : 'border border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 flex items-center justify-center border border-slate-700 rounded hover:bg-slate-800 disabled:opacity-50"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSelectedLead(null)} />
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h2 className="text-lg font-semibold text-white">{selectedLead.nombre}</h2>
                <span className={`inline-flex mt-1 text-xs font-medium px-2 py-0.5 rounded ${getEstadoConfig(selectedLead.estado).bg} ${getEstadoConfig(selectedLead.estado).color}`}>
                  {getEstadoConfig(selectedLead.estado).label}
                </span>
              </div>
              <button onClick={() => setSelectedLead(null)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase">Telefono</label>
                  <a href={getWhatsAppUrl(selectedLead.telefono)} target="_blank" rel="noopener noreferrer" className="block text-sm text-emerald-400 hover:underline mt-1">
                    {selectedLead.telefono}
                  </a>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase">Localidad</label>
                  <p className="text-sm text-white mt-1">{selectedLead.localidad || '-'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase">Estado</label>
                  <select
                    value={selectedLead.estado || 'nuevo'}
                    onChange={(e) => {
                      updateLeadEstado(selectedLead.id, e.target.value as LeadEstado);
                      setSelectedLead({ ...selectedLead, estado: e.target.value as LeadEstado });
                    }}
                    className="w-full mt-1 h-9 px-3 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    {LEAD_ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase">Fecha</label>
                  <p className="text-sm text-white mt-1">{formatDate(selectedLead.created_at)}</p>
                </div>
                {selectedLead.ip && (
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-slate-500 uppercase">IP</label>
                    <p className="text-sm text-slate-400 mt-1">{selectedLead.ip}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <a
                  href={getWhatsAppUrl(selectedLead.telefono)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 h-10 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
                <a
                  href={`tel:${selectedLead.telefono}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 h-10 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg"
                >
                  <Phone className="w-4 h-4" />
                  Llamar
                </a>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">Notas</label>
                <textarea
                  value={leadNotas}
                  onChange={(e) => setLeadNotas(e.target.value)}
                  placeholder="Agregar notas..."
                  rows={4}
                  className="w-full mt-2 px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 resize-none focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <button
                  onClick={saveLeadNotas}
                  disabled={isSavingNotas || leadNotas === (selectedLead.notas || '')}
                  className="mt-2 w-full h-10 text-sm font-medium text-white bg-slate-700 hover:bg-slate-600 rounded-lg disabled:opacity-50"
                >
                  {isSavingNotas ? 'Guardando...' : 'Guardar notas'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
