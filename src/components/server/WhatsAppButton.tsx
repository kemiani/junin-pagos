import { BUSINESS } from "@/lib/constants";
import { WhatsAppIcon } from "./Icons";

export function WhatsAppButton() {
  const message = encodeURIComponent(BUSINESS.whatsappMessage);
  const whatsappUrl = `https://wa.me/${BUSINESS.phoneClean}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg hover:bg-emerald-600 hover:scale-105 transition-all z-40"
      aria-label="Contactar por WhatsApp"
    >
      <WhatsAppIcon className="w-7 h-7 text-white" />
    </a>
  );
}
