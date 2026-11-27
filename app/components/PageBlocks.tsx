import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ContentCard, PageIntro, PolicySection } from "../data/content";
import ContentIcon from "./ContentIcon";

export function BackLink({ label, href = "/" }: { label: string; href?: string }) {
  return (
    <Link href={href} className="mb-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-cream-muted transition-colors hover:text-brand-gold md:mb-10">
      <ArrowLeft size={14} />{label}
    </Link>
  );
}

export function PageIntroHeader({ content, className = "" }: { content: PageIntro; className?: string }) {
  return (
    <div className={`text-center ${className}`}>
      <span className="mb-3 block text-[10px] font-bold uppercase tracking-[0.4em] text-brand-gold">{content.eyebrow}</span>
      <h1 className="mb-6 font-serif text-4xl leading-tight text-brand-cream md:text-5xl">
        {content.titleLead}{content.titleAccent ? <> <span className="font-light italic text-brand-gold">{content.titleAccent}</span></> : null}
      </h1>
      <p className="mx-auto max-w-2xl text-sm font-light leading-relaxed text-brand-cream-muted md:text-base">{content.description}</p>
    </div>
  );
}

export function ContentCards({ items, className = "", cardClassName = "" }: { items: ContentCard[]; className?: string; cardClassName?: string }) {
  return (
    <div className={className}>
      {items.map((item) => (
        <div key={item.id} className={`rounded-2xl border border-brand-gold/10 bg-brand-green-mid/30 text-center transition hover:border-brand-gold/30 ${cardClassName || "p-6"}`}>
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-brand-gold/20 text-brand-gold"><ContentIcon name={item.icon} /></span>
          <h3 className="mb-2 font-serif text-sm uppercase tracking-wider text-brand-gold">{item.title}</h3>
          <p className="text-xs font-light leading-relaxed text-brand-cream-muted">{item.description}</p>
        </div>
      ))}
    </div>
  );
}

export function PolicySections({ sections, cardClassName = "p-6 md:p-8" }: { sections: PolicySection[]; cardClassName?: string }) {
  return (
    <div className="space-y-5">
      {sections.map((section) => (
        <section key={section.id} className={`rounded-2xl border border-brand-gold/10 bg-brand-green-mid/20 ${cardClassName}`}>
          <h2 className="mb-4 font-serif text-xl text-brand-gold">{section.title}</h2>
          <div className="space-y-3 text-sm font-light leading-7 text-brand-cream-muted">
            {section.paragraphs.map((paragraph, index) => <p key={`p-${index}`}>{paragraph}</p>)}
            {section.bullets.length > 0 && <ul className="list-disc space-y-2 pl-5">{section.bullets.map((item, index) => <li key={`b-${index}`}>{item}</li>)}</ul>}
            {section.numbered.length > 0 && <ol className="list-decimal space-y-2 pl-5">{section.numbered.map((item, index) => <li key={`n-${index}`}>{item}</li>)}</ol>}
          </div>
        </section>
      ))}
    </div>
  );
}
