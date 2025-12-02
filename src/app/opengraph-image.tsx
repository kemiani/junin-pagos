import { ImageResponse } from "next/og";

export const alt = "Junin Pagos - Cobranzas Digitales con Comisiones Justas";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  const logoUrl = "https://junin-pagos.vercel.app/logo-jp.png";

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
            width: "500px",
            height: "500px",
            background: "radial-gradient(circle, rgba(34,211,238,0.2) 0%, transparent 70%)",
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* Logo image */}
        <img
          src={logoUrl}
          width={200}
          height={200}
          style={{
            marginBottom: "24px",
          }}
        />

        {/* Logo text */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "16px",
          }}
        >
          <span
            style={{
              fontSize: "64px",
              fontWeight: "bold",
              color: "#22d3ee",
            }}
          >
            Junin
          </span>
          <span
            style={{
              fontSize: "64px",
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
            fontSize: "28px",
            color: "#94a3b8",
            marginBottom: "32px",
          }}
        >
          Cobranzas digitales simples y justas
        </div>

        {/* Features */}
        <div
          style={{
            display: "flex",
            gap: "40px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "22px",
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
              fontSize: "22px",
            }}
          >
            <span style={{ color: "#10b981" }}>✓</span>
            <span style={{ color: "#e2e8f0" }}>Sin costo de activacion</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "22px",
            }}
          >
            <span style={{ color: "#10b981" }}>✓</span>
            <span style={{ color: "#e2e8f0" }}>Alta en 48hs</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
