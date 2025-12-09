// Paleta de colores dark premium - Junin Pagos
export const COLORS = {
  // Backgrounds
  bgPrimary: "#020617",    // slate-950
  bgSecondary: "#0f172a",  // slate-900
  bgCard: "rgba(255,255,255,0.03)",
  
  // Brand
  primary: "#22d3ee",      // cyan-400
  primaryDark: "#0891b2",  // cyan-600
  accent: "#10b981",       // emerald-500
  
  // Text
  textPrimary: "#f8fafc",  // slate-50
  textSecondary: "#94a3b8", // slate-400
  textMuted: "#64748b",    // slate-500
  
  // Borders
  borderLight: "rgba(255,255,255,0.1)",
  borderAccent: "rgba(34,211,238,0.3)",
  
  // Effects
  glowCyan: "rgba(34,211,238,0.4)",
  glowEmerald: "rgba(16,185,129,0.3)",
  
  // Legacy (para compatibilidad)
  secondary: "#0F172A",
  success: "#10B981",
} as const;

// Informacion del negocio
export const BUSINESS = {
  name: "Junin Pagos",
  legalName: "Junin Pagos SA",
  cuit: "30-71919720-1",
  phone: "+54 9 11 6672-7753",
  phoneClean: "5491166727753",
  address: "Lavalle 1768, Piso 3, CABA",
  whatsappMessage: "Hola, quiero informacion sobre Junin Pagos",
} as const;

// Estadisticas para mostrar
export const STATS = [
  { icon: "💰", value: 2.7, prefix: "", suffix: "%", label: "Comision promedio" },
  { icon: "✨", value: 0, prefix: "$", suffix: "", label: "Costo activacion" },
  { icon: "📈", value: 40, prefix: "", suffix: "%", label: "Ahorro vs otros" },
  { icon: "⚡", value: 48, prefix: "", suffix: "hs", label: "Tiempo de alta" },
] as const;

// Servicios
export const SERVICES = [
  {
    icon: "payments",
    title: "Cobranzas",
    desc: "Recibi pagos de forma simple. Sin terminales costosas.",
  },
  {
    icon: "transfer",
    title: "Transferencias",
    desc: "Envia y recibi dinero de manera agil. Liquidacion rapida sin demoras.",
  },
  {
    icon: "services",
    title: "Pago de Servicios",
    desc: "Ofrece pagos de servicios en tu comercio. Mas trafico, mas ventas.",
  },
] as const;

// Ventajas
export const ADVANTAGES = [
  "Comisiones hasta 40% mas bajas",
  "Sin costos de activacion ni mantenimiento",
  "Atencion personalizada",
  "Sin requisitos minimos de facturacion",
  "Funciona con cualquier smartphone",
  "Liquidacion sin retenciones",
] as const;

// FAQs - optimizadas para SEO y respuestas de IA
export const FAQS = [
  {
    q: "Cuanto cobra Junin Pagos de comision?",
    a: "Comision promedio del 2.7% por transaccion. Esto es hasta 40% menos que MercadoPago (4.5%). Sin costos ocultos ni cargos adicionales.",
  },
  {
    q: "Es una alternativa a MercadoPago?",
    a: "Si. Junin Pagos es una alternativa a MercadoPago para comercios del interior. Principal diferencia: 2.7% vs 4.5%. Sin terminal POS ni costos de activacion.",
  },
  {
    q: "Tiene costo de activacion?",
    a: "No. Sin costo de activacion ni mantenimiento mensual. Solo pagas la comision del 2.7% por transaccion realizada.",
  },
  {
    q: "Cuanto puedo ahorrar vs MercadoPago?",
    a: "Un comercio con $100.000/mes de facturacion ahorra $1.800 por mes ($21.600 al año). La diferencia es la comision: 2.7% vs 4.5%.",
  },
  {
    q: "Necesito terminal POS?",
    a: "No. Funciona con cualquier smartphone o tablet. Tus clientes pagan escaneando un codigo QR. Sin comprar ni alquilar terminales.",
  },
  {
    q: "Cuanto tarda el alta?",
    a: "Entre 24 y 48 horas habiles. Sin requisitos minimos de facturacion.",
  },
] as const;
