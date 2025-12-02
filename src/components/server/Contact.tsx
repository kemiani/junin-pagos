import { BUSINESS } from "@/lib/constants";
import { PhoneIcon, LocationIcon, BuildingIcon } from "./Icons";
import { ContactForm } from "@/components/client/ContactForm";

export function Contact() {
  return (
    <section id="contacto" className="py-16" aria-labelledby="contact-heading">
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h2 id="contact-heading" className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              Contactanos
            </h2>
            <p className="text-slate-600 mb-6">Dejanos tus datos y te contactamos.</p>

            <address className="space-y-4 not-italic">
              <a
                href={`tel:${BUSINESS.phone}`}
                className="flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-cyan-600/10">
                  <PhoneIcon className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Telefono / WhatsApp</p>
                  <p className="font-medium text-slate-800 group-hover:text-cyan-600 transition-colors">
                    {BUSINESS.phone}
                  </p>
                </div>
              </a>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-cyan-600/10">
                  <LocationIcon className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Direccion</p>
                  <p className="font-medium text-slate-800">{BUSINESS.address}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-cyan-600/10">
                  <BuildingIcon className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">CUIT</p>
                  <p className="font-medium text-slate-800">{BUSINESS.cuit}</p>
                </div>
              </div>
            </address>
          </div>

          {/* Formulario - Client Component */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
