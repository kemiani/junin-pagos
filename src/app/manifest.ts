import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Junin Pagos - Cobranzas Digitales",
    short_name: "Junin Pagos",
    description: "Red de cobranzas para comercios del interior. Comisiones desde 2.7%.",
    start_url: "/",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#020617",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/logo-jp.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/logo-jp.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
