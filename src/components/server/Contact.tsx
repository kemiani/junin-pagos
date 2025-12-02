import { BUSINESS } from "@/lib/constants";
import { PhoneIcon, LocationIcon, BuildingIcon } from "./Icons";
import { ContactForm } from "@/components/client/ContactForm";

export function Contact() {
  return (
    <section id="contacto" className="py-24" aria-labelledby="contact-heading">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h2 id="contact-heading" className="text-3xl md:text-4xl font-bold text-white mb-4">
              Contactanos
            </h2>
            <p className="text-slate-400 mb-8 text-lg">Dejanos tus datos y te contactamos.</p>

            <address className="space-y-6 not-italic">
              <a
                href={`tel:${BUSINESS.phone}`}
                className="flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                  <PhoneIcon className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Telefono / WhatsApp</p>
                  <p className="font-medium text-white group-hover:text-cyan-400 transition-colors">
                    {BUSINESS.phone}
                  </p>
                </div>
              </a>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <LocationIcon className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Direccion</p>
                  <p className="font-medium text-white">{BUSINESS.address}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <BuildingIcon className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">CUIT</p>
                  <p className="font-medium text-white">{BUSINESS.cuit}</p>
                </div>
              </div>
            </address>
          </div>

          {/* Formulario */}
          <div className="glass-card rounded-2xl p-8">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
