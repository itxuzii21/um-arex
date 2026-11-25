"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { BackLink, PageIntroHeader } from "../components/PageBlocks";
import { useStore } from "../data/StoreProvider";
import { useCurrency } from "../data/CurrencyProvider";
import { resolveContentText } from "../data/content";

export default function FAQPage() {
  const { settings } = useStore();
  const { formatPkr } = useCurrency();
  const content = settings.pages.faq;
  const [openId, setOpenId] = useState<string | null>(null);
  const supportUrl = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(content.supportMessage)}`;

  const toggleFAQ = (id: string) => {
    setOpenId((current) => (current === id ? null : id));
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-brand-green-dark text-brand-cream">
      <div className="pointer-events-none absolute left-1/4 top-[20%] z-0 h-[500px] w-[500px] rounded-full bg-brand-green-glow/10 blur-[150px]" />
      <div className="pointer-events-none absolute bottom-[20%] right-1/4 z-0 h-[400px] w-[400px] rounded-full bg-brand-gold/5 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-4xl px-6 py-8 md:py-20">
        <BackLink label={content.backLabel} />

        <PageIntroHeader content={content} className="mb-16" />

        <div className="mb-16 space-y-4">
          {content.items.map((item, index) => {
            const isOpen = openId === item.id;
            const questionId = `faq-question-${index}`;
            const answerId = `faq-answer-${index}`;

            return (
              <div
                key={item.id}
                className="overflow-hidden rounded-2xl border border-brand-gold/10 bg-brand-green-mid/30 transition-all duration-500 hover:border-brand-gold/30"
              >
                <button
                  type="button"
                  id={questionId}
                  onClick={() => toggleFAQ(item.id)}
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  className="group flex w-full cursor-pointer items-center justify-between p-6 text-left"
                >
                  <span className="pr-4 text-sm font-medium text-brand-cream transition-colors duration-300 group-hover:text-brand-gold md:text-base">
                    {item.question}
                  </span>
                  <ChevronDown
                    size={18}
                    aria-hidden="true"
                    className={`shrink-0 text-brand-gold transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <div
                  id={answerId}
                  role="region"
                  aria-labelledby={questionId}
                  aria-hidden={!isOpen}
                  className={`grid transition-[grid-template-rows,opacity] duration-500 ease-in-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="border-t border-brand-gold/10 px-6 pb-6 pt-4 text-sm font-light leading-relaxed text-brand-cream-muted">
                      {resolveContentText(item.answer, { deliveryCharge: formatPkr(settings.commerce.domesticDeliveryChargePkr) })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-brand-gold/15 bg-gradient-to-br from-brand-green-mid/50 to-brand-green-dark p-8 text-center shadow-2xl md:p-12">
          <div className="pointer-events-none absolute -bottom-20 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-brand-gold/5 blur-[80px]" />
          <div className="relative z-10">
            <span className="mb-3 block text-[10px] font-bold uppercase tracking-[0.4em] text-brand-gold">{content.supportTag}</span>
            <h2 className="mb-4 font-serif text-2xl leading-tight text-brand-cream md:text-3xl">{content.supportTitle}</h2>
            <p className="mx-auto mb-8 max-w-md text-xs font-light leading-relaxed text-brand-cream-muted md:text-sm">{content.supportDescription}</p>
            <a
              href={supportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-brand-gold px-10 py-4 text-xs font-bold uppercase tracking-[0.25em] text-brand-green-dark shadow-xl transition-all duration-500 hover:bg-brand-gold-dark hover:shadow-brand-gold/10 active:scale-[0.97]"
            >
              {content.supportCta}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
