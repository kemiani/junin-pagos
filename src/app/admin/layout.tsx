'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  LogOut,
  Users,
  Menu,
  X,
  ChevronLeft,
  ChevronDown,
  Mail
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Leads', href: '/admin/leads', icon: Users },
  { name: 'Emails', href: '/admin/emails', icon: Mail },
];

const SIDEBAR_WIDTH = 256;
const SIDEBAR_COLLAPSED_WIDTH = 72;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const publicRoutes = ['/admin/login'];
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = () => setUserMenuOpen(false);
    if (userMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [userMenuOpen]);

  const checkAuth = async () => {
    if (isPublicRoute) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/check', {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.authenticated && data.user) {
        setUser(data.user);
        setLoading(false);
      } else {
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/admin/login');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/admin/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading && !isPublicRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-slate-700 border-t-cyan-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Verificando sesion...</p>
        </div>
      </div>
    );
  }

  if (isPublicRoute) {
    return <>{children}</>;
  }

  const currentPage = navigation.find((item) => item.href === pathname)?.name || 'Dashboard';

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 bottom-0 z-50
          flex flex-col
          bg-slate-900 text-slate-400 border-r border-slate-800
          transition-all duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
        style={{ width: sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH }}
      >
        {/* Logo */}
        <div className={`flex items-center h-16 px-4 border-b border-slate-800 ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!sidebarCollapsed && (
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">JP</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white leading-tight">JuninPagos</span>
                <span className="text-[10px] text-slate-500 leading-tight">Admin Panel</span>
              </div>
            </Link>
          )}

          {sidebarCollapsed && (
            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">J</span>
            </div>
          )}

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors rounded"
          >
            <X className="w-5 h-5" />
          </button>

          {!sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors rounded"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="hidden lg:flex mx-auto mt-4 p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors rounded"
          >
            <ChevronLeft className="w-4 h-4 rotate-180" />
          </button>
        )}

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                title={sidebarCollapsed ? item.name : undefined}
                className={`
                  group flex items-center gap-3 px-3 py-2.5 rounded-lg
                  transition-colors relative
                  ${isActive
                    ? 'bg-cyan-500/10 text-cyan-400'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }
                  ${sidebarCollapsed ? 'justify-center' : ''}
                `}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-cyan-500 rounded-r" />
                )}
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                {!sidebarCollapsed && (
                  <span className="flex-1 text-sm font-medium truncate">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-slate-800">
          {!sidebarCollapsed ? (
            <>
              <div className="flex items-center gap-3 p-2 bg-slate-800/50 rounded-lg mb-2">
                <div className="w-9 h-9 bg-slate-700 rounded-lg flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user?.name || 'Usuario'}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors rounded-lg"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Cerrar sesion</span>
              </button>
            </>
          ) : (
            <button
              onClick={handleLogout}
              title="Cerrar sesion"
              className="w-full flex justify-center p-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors rounded-lg"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div
        className="min-h-screen flex flex-col transition-all duration-200"
        style={{ marginLeft: 0 }}
      >
        <style jsx global>{`
          @media (min-width: 1024px) {
            .admin-main-content {
              margin-left: ${sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH}px !important;
            }
          }
        `}</style>

        <div className="admin-main-content flex-1 flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800">
            <div className="flex items-center justify-between h-14 px-4 lg:px-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 -ml-2 hover:bg-slate-800 text-slate-400 transition-colors rounded"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <h1 className="text-base font-semibold text-white">{currentPage}</h1>
              </div>

              <div className="flex items-center gap-2">
                {/* Status */}
                <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  <span className="hidden sm:inline">Online</span>
                </div>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setUserMenuOpen(!userMenuOpen);
                    }}
                    className="flex items-center gap-2 p-1.5 hover:bg-slate-800 transition-colors rounded"
                  >
                    <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center text-slate-300 font-semibold text-sm">
                      {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 hidden sm:block ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <div
                      className="absolute right-0 top-full mt-1 w-56 bg-slate-900 shadow-lg border border-slate-800 rounded-lg z-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="px-4 py-3 border-b border-slate-800">
                        <p className="text-sm font-medium text-white">{user?.name || 'Usuario'}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      </div>
                      <div className="border-t border-slate-800">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Cerrar sesion
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-4 lg:p-6">
            <div className="w-full max-w-7xl mx-auto">
              {children}
            </div>
          </main>

          {/* Footer */}
          <footer className="border-t border-slate-800 bg-slate-900 px-4 lg:px-6 py-3">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-500">
              <p>2024 JuninPagos</p>
              <Link href="/" className="hover:text-slate-400 transition-colors">Volver al sitio</Link>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
