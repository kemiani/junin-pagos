import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Junin Pagos - Cobranzas Digitales con Comisiones Justas";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)",
          position: "relative",
        }}
      >
        {/* Glow effect */}
        <div
          style={{
            position: "absolute",
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, rgba(34,211,238,0.15) 0%, transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* Logo text */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <span
            style={{
              fontSize: "72px",
              fontWeight: "bold",
              color: "#22d3ee",
            }}
          >
            Junin
          </span>
          <span
            style={{
              fontSize: "72px",
              fontWeight: "bold",
              color: "#ffffff",
            }}
          >
            Pagos
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "32px",
            color: "#94a3b8",
            marginBottom: "48px",
          }}
        >
          Cobranzas digitales simples y justas
        </div>

        {/* Features */}
        <div
          style={{
            display: "flex",
            gap: "48px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#22d3ee",
              fontSize: "24px",
            }}
          >
            <span style={{ color: "#10b981" }}>✓</span>
            <span style={{ color: "#e2e8f0" }}>Comisiones desde 2.7%</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "24px",
            }}
          >
            <span style={{ color: "#10b981" }}>✓</span>
            <span style={{ color: "#e2e8f0" }}>Sin costos de activacion</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "24px",
            }}
          >
            <span style={{ color: "#10b981" }}>✓</span>
            <span style={{ color: "#e2e8f0" }}>Alta en 48hs</span>
          </div>
        </div>

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            fontSize: "20px",
            color: "#64748b",
          }}
        >
          juninpagos.com.ar
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
