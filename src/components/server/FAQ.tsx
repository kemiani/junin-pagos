import { FAQS } from "@/lib/constants";
import { FAQAccordion } from "@/components/client/FAQAccordion";

export function FAQ() {
  return (
    <section id="faq" className="py-16 bg-white" aria-labelledby="faq-heading">
      <div className="max-w-2xl mx-auto px-4">
        <h2 id="faq-heading" className="text-2xl md:text-3xl font-bold text-slate-900 mb-8 text-center">
          Preguntas frecuentes
        </h2>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <FAQAccordion faqs={FAQS} />
        </div>
      </div>
    </section>
  );
}
