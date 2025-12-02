// Paleta de colores del logo Junin Pagos
export const COLORS = {
  primary: "#0891B2",      // Cyan del logo
  primaryDark: "#0E7490",  // Cyan oscuro
  secondary: "#0F172A",    // Azul oscuro "Pagos"
  accent: "#06B6D4",       // Cyan claro
  success: "#10B981",      // Verde
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
    desc: "Recibi pagos de forma simple. Sin terminales costosas ni contratos complicados.",
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

// FAQs
export const FAQS = [
  {
    q: "Cuanto cobra Junin Pagos de comision?",
    a: "Comision promedio del 2.7%, hasta 40% menos que MercadoPago (4.5%). Sin costos ocultos.",
  },
  {
    q: "Tiene costo de activacion?",
    a: "No. Sin costo de activacion ni mantenimiento. Solo pagas por transaccion realizada.",
  },
  {
    q: "Que servicios ofrecen?",
    a: "Cobranzas digitales, transferencias y pago de servicios. Red de cobranzas extra-bancaria.",
  },
  {
    q: "Cuanto tarda el alta?",
    a: "Proceso simple, operando en 24-48 horas habiles.",
  },
] as const;
