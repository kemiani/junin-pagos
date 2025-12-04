'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  TrendingUp,
  Calendar,
  ArrowRight,
  Phone,
  MapPin,
  RefreshCw,
  AlertCircle,
  MessageCircle
} from 'lucide-react';

const API_ENDPOINT = '/api/admin/leads/list';

interface Lead {
  id: number;
  nombre: string;
  telefono: string;
  localidad: string;
  ip?: string;
  created_at: string;
}

function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  subtitle
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: { value: number; label: string };
  subtitle?: string;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</span>
        <div className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center">
          <Icon className="w-4 h-4 text-cyan-400" />
        </div>
      </div>

      <p className="text-2xl font-semibold text-white tabular-nums">{value}</p>

      {subtitle && (
        <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
      )}

      {trend && (
        <div className="flex items-center gap-1.5 mt-2">
          <span className={`text-xs font-medium ${trend.value >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend.value >= 0 ? '+' : ''}{trend.value}%
          </span>
          <span className="text-xs text-slate-500">{trend.label}</span>
        </div>
      )}
    </div>
  );
}

function QuickAction({
  href,
  title,
  description,
  icon: Icon,
  primary = false
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`
        group flex items-center gap-4 p-4 rounded-xl border transition-colors
        ${primary
          ? 'bg-cyan-600 border-cyan-500 hover:bg-cyan-500 text-white'
          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
        }
      `}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${primary ? 'bg-cyan-500' : 'bg-slate-800'}`}>
        <Icon className={`w-5 h-5 ${primary ? 'text-white' : 'text-cyan-400'}`} />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className={`text-sm font-medium ${primary ? 'text-white' : 'text-white'}`}>{title}</h3>
        <p className={`text-xs mt-0.5 ${primary ? 'text-cyan-100' : 'text-slate-500'}`}>{description}</p>
      </div>

      <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${primary ? 'text-cyan-200' : 'text-slate-500'}`} />
    </Link>
  );
}

function LeadRow({ lead, isLast }: { lead: Lead; isLast: boolean }) {
  const formatDate = (dateString?: string) => {
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

  const getWhatsAppUrl = () => {
    let phone = lead.telefono.replace(/[^\d]/g, '');
    if (phone.startsWith('0')) phone = phone.substring(1);
    if (!phone.startsWith('54')) phone = '54' + phone;
    if (phone.startsWith('54') && !phone.startsWith('549') && phone.length === 12) {
      phone = '549' + phone.substring(2);
    }
    return `https://wa.me/${phone}`;
  };

  return (
    <div className={`flex items-center gap-3 py-3 ${!isLast ? 'border-b border-slate-800' : ''}`}>
      <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-cyan-400 font-medium text-xs flex-shrink-0">
        {lead.nombre?.[0]?.toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white truncate">
            {lead.nombre}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
          <Phone className="w-3 h-3 text-slate-600" />
          <span className="truncate">{lead.telefono}</span>
          {lead.localidad && (
            <>
              <span className="text-slate-700">•</span>
              <MapPin className="w-3 h-3 text-slate-600" />
              <span>{lead.localidad}</span>
            </>
          )}
        </div>
      </div>

      <a
        href={getWhatsAppUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="p-1.5 text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors"
        title="WhatsApp"
      >
        <MessageCircle className="w-4 h-4" />
      </a>

      <span className="text-xs text-slate-500 flex-shrink-0">{formatDate(lead.created_at)}</span>
    </div>
  );
}

export default function AdminDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLeads = useCallback(async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_ENDPOINT}?limit=1000&sortBy=created_at&sortOrder=desc`, {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Error al cargar leads');

      const result = await response.json();
      setLeads(result.data || []);
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

  const stats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    const todayLeads = leads.filter(lead => lead.created_at && new Date(lead.created_at) >= today);
    const weekLeads = leads.filter(lead => lead.created_at && new Date(lead.created_at) >= thisWeekStart);
    const lastWeekLeads = leads.filter(lead => {
      if (!lead.created_at) return false;
      const d = new Date(lead.created_at);
      return d >= lastWeekStart && d < thisWeekStart;
    });

    const weekTrend = lastWeekLeads.length > 0
      ? Math.round(((weekLeads.length - lastWeekLeads.length) / lastWeekLeads.length) * 100)
      : weekLeads.length > 0 ? 100 : 0;

    return {
      total: leads.length,
      today: todayLeads.length,
      week: weekLeads.length,
      weekTrend,
      recentLeads: leads.slice(0, 5)
    };
  }, [leads]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Resumen de actividad</p>
        </div>
        <button
          onClick={() => fetchLeads(true)}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5 animate-pulse">
              <div className="h-4 bg-slate-800 rounded w-16 mb-3" />
              <div className="h-7 bg-slate-800 rounded w-12" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatsCard
            title="Total Leads"
            value={stats.total.toLocaleString()}
            icon={Users}
            subtitle="Todos los contactos"
          />
          <StatsCard
            title="Esta Semana"
            value={stats.week}
            icon={TrendingUp}
            trend={{ value: stats.weekTrend, label: 'vs anterior' }}
          />
          <StatsCard
            title="Hoy"
            value={stats.today}
            icon={Calendar}
          />
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <QuickAction
          href="/admin/leads"
          title="Gestionar Leads"
          description="Ver, filtrar y exportar"
          icon={Users}
          primary
        />
        <QuickAction
          href="/"
          title="Ver Sitio"
          description="Volver a la pagina principal"
          icon={ArrowRight}
        />
      </div>

      {/* Recent Leads */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-white">Leads Recientes</h2>
            <p className="text-xs text-slate-500">Ultimos registros</p>
          </div>
          <Link
            href="/admin/leads"
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg"
          >
            Ver todos
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="px-4 py-2">
          {isLoading ? (
            <div className="py-8 text-center">
              <div className="w-6 h-6 border-2 border-slate-700 border-t-cyan-500 rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500">Cargando...</p>
            </div>
          ) : stats.recentLeads.length === 0 ? (
            <div className="py-10 text-center">
              <Phone className="w-8 h-8 text-slate-700 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No hay leads registrados</p>
            </div>
          ) : (
            stats.recentLeads.map((lead, index) => (
              <LeadRow key={lead.id} lead={lead} isLast={index === stats.recentLeads.length - 1} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
