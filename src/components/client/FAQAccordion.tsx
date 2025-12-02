"use client";

import { useState, useCallback } from "react";

interface FAQ {
  q: string;
  a: string;
}

interface FAQAccordionProps {
  faqs: readonly FAQ[];
}

function FAQItem({
  faq,
  isOpen,
  onToggle,
  index,
}: {
  faq: FAQ;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={onToggle}
        className="w-full py-4 flex items-center justify-between text-left group"
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${index}`}
        id={`faq-question-${index}`}
      >
        <span className="font-medium text-slate-800 group-hover:text-cyan-600 transition-colors pr-4 text-sm">
          {faq.q}
        </span>
        <svg
          className={`w-5 h-5 text-slate-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        id={`faq-answer-${index}`}
        role="region"
        aria-labelledby={`faq-question-${index}`}
        className={`overflow-hidden transition-all duration-200 ${isOpen ? "max-h-40 pb-4" : "max-h-0"}`}
      >
        <p className="text-slate-600 text-sm leading-relaxed">{faq.a}</p>
      </div>
    </div>
  );
}

export function FAQAccordion({ faqs }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState(0);

  const handleToggle = useCallback((index: number) => {
    setOpenIndex((prev) => (prev === index ? -1 : index));
  }, []);

  return (
    <div role="list" aria-label="Preguntas frecuentes">
      {faqs.map((faq, index) => (
        <FAQItem
          key={index}
          faq={faq}
          isOpen={openIndex === index}
          onToggle={() => handleToggle(index)}
          index={index}
        />
      ))}
    </div>
  );
}