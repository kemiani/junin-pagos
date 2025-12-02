import { FAQS } from "@/lib/constants";
import { FAQAccordion } from "@/components/client/FAQAccordion";

export function FAQ() {
  return (
    <section id="faq" className="py-24">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
          Preguntas frecuentes
        </h2>
        <div className="glass-card rounded-2xl p-6">
          <FAQAccordion faqs={FAQS} />
        </div>
      </div>
    </section>
  );
}
