"use client";

import { useState } from "react";
import { MessageCircle, Package } from "lucide-react";
import { useStore } from "../data/StoreProvider";
import ContentIcon from "../components/ContentIcon";
import { BackLink, PageIntroHeader } from "../components/PageBlocks";
import { resolveContentText } from "../data/content";

export default function TrackOrderPage() {
  const { settings } = useStore();
  const content = settings.pages.trackOrder;
  const [trackingNumber, setTrackingNumber] = useState("");
  const [requested, setRequested] = useState(false);

  const trimmed = trackingNumber.trim();
  const waMessage = encodeURIComponent(
    resolveContentText(content.trackingMessage, {
      fieldLabel: content.fieldLabel,
      trackingId: trimmed || content.missingTrackingId,
    })
  );
  const waUrl = `https://wa.me/${settings.whatsappNumber}?text=${waMessage}`;
  const supportUrl = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(content.supportMessage)}`;

  const handleTrack = (event: React.FormEvent) => {
    event.preventDefault();
    if (!trimmed) return;
    setRequested(true);
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-brand-green-dark text-brand-cream">
      <div className="pointer-events-none absolute left-1/4 top-[15%] h-[500px] w-[500px] rounded-full bg-brand-green-glow/10 blur-[150px]" />
      <div className="pointer-events-none absolute bottom-[10%] right-1/4 h-[400px] w-[400px] rounded-full bg-brand-gold/5 blur-[120px]" />
      <div className="relative z-10 mx-auto max-w-4xl px-5 py-8 md:px-8 md:py-20">
        <BackLink label={content.backLabel} href="/#collection" />
        <PageIntroHeader content={content} className="mb-12 md:mb-16" />

        <div className="mx-auto mb-12 max-w-2xl">
          <form onSubmit={handleTrack} className="relative overflow-hidden rounded-[2rem] border border-brand-gold/15 bg-gradient-to-br from-brand-green-mid/50 to-brand-green-dark p-7 shadow-2xl md:p-10">
            <div className="pointer-events-none absolute -bottom-20 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-brand-gold/5 blur-[80px]" />
            <div className="relative z-10">
              <label htmlFor="tracking" className="mb-3 block text-[10px] font-bold uppercase tracking-[0.3em] text-brand-gold">{content.fieldLabel}</label>
              <div className="relative mb-6">
                <input
                  id="tracking"
                  type="text"
                  value={trackingNumber}
                  onChange={(event) => { setTrackingNumber(event.target.value); setRequested(false); }}
                  placeholder={content.placeholder}
                  className="w-full rounded-full border border-brand-gold/20 bg-brand-green-dark/50 px-6 py-4 pr-14 text-sm text-brand-cream placeholder:text-brand-cream-muted/50 outline-none transition focus:border-brand-gold/50"
                />
                <Package className="absolute right-6 top-1/2 -translate-y-1/2 text-brand-gold/50" size={18} />
              </div>
              <button type="submit" disabled={!trimmed} className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-brand-success px-10 py-4 text-xs font-bold uppercase tracking-[0.25em] text-brand-green-dark shadow-xl transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40">
                <MessageCircle size={16} /> {content.buttonText}
              </button>
              {requested && <p className="mt-4 text-center text-xs leading-relaxed text-brand-cream-muted">{content.requestedMessage} <a href={waUrl} target="_blank" rel="noopener noreferrer" className="text-brand-gold underline hover:text-brand-gold-light">{content.fallbackLabel}</a>.</p>}
              <p className="mt-5 text-center text-[11px] font-light leading-relaxed text-brand-cream-muted/80">{content.trackingNote}</p>
            </div>
          </form>
        </div>

        <div className="mx-auto mb-12 max-w-2xl">
          <div className="mb-8 text-center">
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.4em] text-brand-gold">{content.journeyTag}</span>
            <h2 className="font-serif text-2xl text-brand-cream">{content.journeyTitle}</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {content.steps.map((step, index) => (
              <div key={step.id} className="flex items-start gap-4 rounded-2xl border border-brand-gold/10 bg-brand-green-mid/30 p-5 transition hover:border-brand-gold/25">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-gold/25 bg-brand-green-dark text-brand-gold"><ContentIcon name={step.icon} size={17} /></span>
                <div>
                  <div className="mb-1 flex items-center gap-2"><span className="text-[9px] font-bold text-brand-gold/60">0{index + 1}</span><h3 className="text-sm font-medium text-brand-cream">{step.title}</h3></div>
                  <p className="text-xs font-light leading-relaxed text-brand-cream-muted">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-[11px] text-brand-cream-muted">{content.summary}</p>
        </div>

        <div className="mx-auto max-w-2xl text-center">
          <div className="relative overflow-hidden rounded-[2rem] border border-brand-gold/15 bg-gradient-to-br from-brand-green-mid/50 to-brand-green-dark p-8 shadow-2xl">
            <div className="pointer-events-none absolute -bottom-20 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-brand-gold/5 blur-[80px]" />
            <div className="relative z-10">
              <span className="mb-3 block text-[10px] font-bold uppercase tracking-[0.4em] text-brand-gold">{content.supportTag}</span>
              <h2 className="mb-4 font-serif text-2xl leading-tight text-brand-cream">{content.supportTitle}</h2>
              <p className="mx-auto mb-8 max-w-md text-xs font-light leading-relaxed text-brand-cream-muted">{content.supportDescription}</p>
              <a href={supportUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-gold px-10 py-4 text-xs font-bold uppercase tracking-[0.25em] text-brand-green-dark shadow-xl transition hover:bg-brand-gold-dark active:scale-[0.98]">
                <MessageCircle size={15} /> {content.supportCta}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
