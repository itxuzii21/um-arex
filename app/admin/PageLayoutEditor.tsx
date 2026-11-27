"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, RotateCcw } from "lucide-react";
import {
  PAGE_CARD_SIZE_OPTIONS,
  PAGE_LAYOUT_DEFINITIONS,
  PAGE_LAYOUT_KEYS,
  getDefaultPageLayout,
  normalizePageLayout,
  normalizePageLayouts,
  type PageCardSize,
  type PageLayout,
  type PageLayoutKey,
  type PageLayouts,
} from "../data/pageLayout";

interface PageLayoutEditorProps {
  value: PageLayouts;
  onChange: (value: PageLayouts) => void;
}

export default function PageLayoutEditor({ value, onChange }: PageLayoutEditorProps) {
  const [selectedPage, setSelectedPage] = useState<PageLayoutKey>("home");
  const pageKeys = PAGE_LAYOUT_KEYS.filter((page) => page !== "product");
  const layouts = normalizePageLayouts(value);
  const layout = normalizePageLayout(selectedPage, layouts[selectedPage]);
  const definition = PAGE_LAYOUT_DEFINITIONS[selectedPage];
  const defaults = getDefaultPageLayout(selectedPage);

  const updatePage = (nextLayout: PageLayout) => {
    onChange({ ...layouts, [selectedPage]: nextLayout });
  };

  const moveSection = (id: string, direction: -1 | 1) => {
    const currentIndex = layout.sectionOrder.indexOf(id);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= layout.sectionOrder.length) return;
    const sectionOrder = [...layout.sectionOrder];
    [sectionOrder[currentIndex], sectionOrder[nextIndex]] = [sectionOrder[nextIndex], sectionOrder[currentIndex]];
    updatePage({ ...layout, sectionOrder });
  };

  const setCardSize = (group: string, size: PageCardSize) => {
    updatePage({ ...layout, cardSizes: { ...layout.cardSizes, [group]: size } });
  };

  return (
    <section data-admin-field="settings.pageLayouts" className="scroll-mt-32 space-y-5">
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-brand-gold/15 bg-brand-gold/5 p-5 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-sm font-semibold text-brand-cream">Arrange every public page</h2>
          <p className="mt-1 max-w-2xl text-[11px] leading-6 text-brand-cream-muted">Choose a page, move its sections up or down, and set comfortable box sizes. Select Save all when you are happy with the layouts.</p>
        </div>
        <span className="w-fit rounded-full border border-brand-gold/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-brand-gold">{pageKeys.length} page layouts</span>
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-brand-green-mid p-5 sm:p-6">
        <label htmlFor="layout-page" className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-brand-gold">Choose a page</label>
        <select
          id="layout-page"
          value={selectedPage}
          onChange={(event) => setSelectedPage(event.target.value as PageLayoutKey)}
          className="w-full cursor-pointer rounded-xl border border-white/10 bg-brand-green-dark/60 px-4 py-3 text-sm text-brand-cream outline-none transition focus:border-brand-gold/50"
        >
          {pageKeys.map((page) => (
            <option key={page} value={page}>{PAGE_LAYOUT_DEFINITIONS[page].label}</option>
          ))}
        </select>
        <p className="mt-2 text-[11px] text-brand-cream-muted">Editing: <span className="text-brand-cream">{definition.label}</span> <span className="text-brand-gold/70">({definition.path})</span></p>
      </div>

      <div data-admin-field={`settings.pageLayouts.${selectedPage}.sectionOrder`} className="space-y-4 rounded-2xl border border-white/[0.07] bg-brand-green-mid p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-gold">Section order</h3>
            <p className="mt-2 text-[11px] leading-5 text-brand-cream-muted">The first item is the first main content area. Back links and shared navigation stay in place.</p>
          </div>
          <button type="button" onClick={() => updatePage({ ...layout, sectionOrder: [...defaults.sectionOrder] })} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-[11px] font-medium text-brand-cream-muted transition hover:border-brand-gold/30 hover:text-brand-gold">
            <RotateCcw size={13} /> Reset order
          </button>
        </div>
        <div className="space-y-2">
          {layout.sectionOrder.map((id, index) => {
            const section = definition.sections.find((item) => item.id === id) ?? { label: id, description: "" };
            return (
              <div key={id} className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-black/10 p-3 sm:p-4">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-brand-gold/15 bg-brand-gold/5 font-mono text-[10px] font-semibold text-brand-gold">{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-brand-cream">{section.label}</p>
                  <p className="mt-1 text-[10px] leading-5 text-brand-cream-muted">{section.description}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1 rounded-lg border border-white/[0.07] bg-brand-green-dark/40 p-1">
                  <button type="button" onClick={() => moveSection(id, -1)} disabled={index === 0} aria-label={`Move ${section.label} up`} className="rounded-md p-2 text-brand-gold transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-25"><ArrowUp size={14} /></button>
                  <button type="button" onClick={() => moveSection(id, 1)} disabled={index === layout.sectionOrder.length - 1} aria-label={`Move ${section.label} down`} className="rounded-md p-2 text-brand-gold transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-25"><ArrowDown size={14} /></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-white/[0.07] bg-brand-green-mid p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-gold">Box sizes</h3>
            <p className="mt-2 max-w-2xl text-[11px] leading-5 text-brand-cream-muted">Compact makes boxes tighter, Default keeps the current spacing, and Large gives them more room. Product sizes change columns while keeping labels readable on mobile.</p>
          </div>
          <button type="button" onClick={() => updatePage({ ...layout, cardSizes: { ...defaults.cardSizes } })} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-[11px] font-medium text-brand-cream-muted transition hover:border-brand-gold/30 hover:text-brand-gold">
            <RotateCcw size={13} /> Reset sizes
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {definition.cardGroups.map((group) => (
            <div key={group.id} data-admin-field={`settings.pageLayouts.${selectedPage}.cardSizes.${group.id}`} className="rounded-xl border border-white/[0.07] bg-black/10 p-4">
              <p className="mb-3 text-xs font-medium text-brand-cream">{group.label}</p>
              <div className="grid grid-cols-3 gap-1 rounded-lg border border-white/[0.07] bg-brand-green-dark/50 p-1">
                {PAGE_CARD_SIZE_OPTIONS.map((option) => {
                  const selected = layout.cardSizes[group.id] === option.value;
                  return (
                    <button key={option.value} type="button" onClick={() => setCardSize(group.id, option.value)} aria-label={`${group.label}: ${option.label}`} aria-pressed={selected} className={`rounded-md px-2 py-2 text-[10px] font-semibold transition ${selected ? "bg-brand-gold text-brand-green-dark" : "text-brand-cream-muted hover:bg-white/5 hover:text-brand-gold"}`}>
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
