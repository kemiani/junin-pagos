"use client";

import { useState, useCallback, useTransition } from "react";

type FormStatus = "idle" | "sending" | "success" | "error";

interface FormData {
  nombre: string;
  telefono: string;
  localidad: string;
}

export function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    telefono: "",
    localidad: "",
  });
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setStatus("sending");
      setErrorMessage("");

      startTransition(async () => {
        try {
          const response = await fetch("/api/contact", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "X-Requested-With": "XMLHttpRequest",
            },
            body: JSON.stringify(formData),
          });

          const result = await response.json();

          if (response.ok) {
            setStatus("success");
            setFormData({ nombre: "", telefono: "", localidad: "" });
            setTimeout(() => setStatus("idle"), 5000);
          } else if (response.status === 429) {
            setStatus("error");
            setErrorMessage("Demasiadas solicitudes. Espera un momento.");
          } else {
            setStatus("error");
            setErrorMessage(result.error || "Error al enviar. Intenta de nuevo.");
          }
        } catch {
          setStatus("error");
          setErrorMessage("Error de conexion. Intenta de nuevo.");
        }
      });
    },
    [formData]
  );

  const isLoading = status === "sending" || isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-slate-300 mb-2">
          Nombre o razon social *
        </label>
        <input
          type="text"
          id="nombre"
          name="nombre"
          required
          autoComplete="organization"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all text-white placeholder:text-slate-500"
          placeholder="Tu nombre o comercio"
          value={formData.nombre}
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="telefono" className="block text-sm font-medium text-slate-300 mb-2">
          Telefono / WhatsApp *
        </label>
        <input
          type="tel"
          id="telefono"
          name="telefono"
          required
          autoComplete="tel"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all text-white placeholder:text-slate-500"
          placeholder="+54 9 11 1234-5678"
          value={formData.telefono}
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="localidad" className="block text-sm font-medium text-slate-300 mb-2">
          Localidad
        </label>
        <input
          type="text"
          id="localidad"
          name="localidad"
          autoComplete="address-level2"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all text-white placeholder:text-slate-500"
          placeholder="De donde sos?"
          value={formData.localidad}
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>

      {status === "error" && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm" role="alert">
          {errorMessage}
        </div>
      )}

      {status === "success" && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm" role="alert">
          Gracias! Te contactaremos pronto.
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 text-white py-4 rounded-xl font-semibold transition-all hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Enviando..." : status === "success" ? "Enviado!" : "Enviar consulta"}
      </button>
    </form>
  );
}
