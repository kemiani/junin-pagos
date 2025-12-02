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
              "X-Requested-With": "XMLHttpRequest", // CSRF protection
            },
            body: JSON.stringify(formData),
          });

          const result = await response.json();

          if (response.ok) {
            setStatus("success");
            setFormData({ nombre: "", telefono: "", localidad: "" });
            // Reset status after 5 seconds
            setTimeout(() => setStatus("idle"), 5000);
          } else if (response.status === 429) {
            setStatus("error");
            setErrorMessage("Demasiadas solicitudes. Espera un momento e intenta de nuevo.");
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
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-slate-700 mb-1.5">
          Nombre o razon social *
        </label>
        <input
          type="text"
          id="nombre"
          name="nombre"
          required
          autoComplete="organization"
          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all text-sm"
          placeholder="Tu nombre o comercio"
          value={formData.nombre}
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="telefono" className="block text-sm font-medium text-slate-700 mb-1.5">
          Telefono / WhatsApp *
        </label>
        <input
          type="tel"
          id="telefono"
          name="telefono"
          required
          autoComplete="tel"
          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all text-sm"
          placeholder="+54 9 11 1234-5678"
          value={formData.telefono}
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="localidad" className="block text-sm font-medium text-slate-700 mb-1.5">
          Localidad
        </label>
        <input
          type="text"
          id="localidad"
          name="localidad"
          autoComplete="address-level2"
          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all text-sm"
          placeholder="De donde sos?"
          value={formData.localidad}
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>

      {status === "error" && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm" role="alert">
          {errorMessage}
        </div>
      )}

      {status === "success" && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm" role="alert">
          Gracias! Te contactaremos pronto.
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full text-white py-3 rounded-lg font-medium transition-all hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed bg-cyan-600"
      >
        {isLoading ? "Enviando..." : status === "success" ? "Enviado!" : "Enviar consulta"}
      </button>
    </form>
  );
}
