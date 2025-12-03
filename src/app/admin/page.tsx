"use client";

import { useState } from "react";
import type { Lead } from "@/lib/supabase";

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/leads", {
        headers: {
          Authorization: `Bearer ${key}`,
        },
      });

      if (!res.ok) {
        setError("Clave incorrecta");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setLeads(data.leads);
      setAuthenticated(true);
    } catch {
      setError("Error de conexion");
    } finally {
      setLoading(false);
    }
  }

  async function refreshLeads() {
    setLoading(true);
    try {
      const res = await fetch("/api/leads", {
        headers: {
          Authorization: `Bearer ${key}`,
        },
      });
      const data = await res.json();
      setLeads(data.leads);
    } catch {
      setError("Error actualizando");
    } finally {
      setLoading(false);
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-slate-900 p-8 rounded-2xl w-full max-w-sm">
          <h1 className="text-2xl font-bold text-white mb-6">Admin Panel</h1>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Clave de acceso"
            className="w-full px-4 py-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-cyan-500 focus:outline-none mb-4"
          />
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? "Verificando..." : "Ingresar"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Leads</h1>
          <div className="flex gap-4">
            <button
              onClick={refreshLeads}
              disabled={loading}
              className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "..." : "Actualizar"}
            </button>
            <button
              onClick={() => setAuthenticated(false)}
              className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Salir
            </button>
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <p className="text-slate-400">
              Total: <span className="text-white font-semibold">{leads.length}</span> leads
            </p>
          </div>

          {leads.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              No hay leads registrados
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="text-left px-6 py-4 text-slate-400 font-medium">Nombre</th>
                    <th className="text-left px-6 py-4 text-slate-400 font-medium">Telefono</th>
                    <th className="text-left px-6 py-4 text-slate-400 font-medium">Localidad</th>
                    <th className="text-left px-6 py-4 text-slate-400 font-medium">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-t border-slate-800 hover:bg-slate-800/30">
                      <td className="px-6 py-4 text-white">{lead.nombre}</td>
                      <td className="px-6 py-4">
                        <a
                          href={`https://wa.me/${lead.telefono.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 hover:text-emerald-300"
                        >
                          {lead.telefono}
                        </a>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{lead.localidad || "-"}</td>
                      <td className="px-6 py-4 text-slate-500 text-sm">
                        {lead.created_at
                          ? new Date(lead.created_at).toLocaleString("es-AR")
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
