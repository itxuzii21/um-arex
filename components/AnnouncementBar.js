'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const DEFAULT_LINES = [
  'Rs 250/- Delivery Charges in Advance • Dispatch Within 24 Hours Nationwide',
  'Premium Handcrafted Leather • Quality You Can Trust',
];

export default function AnnouncementBar() {
  const [lines, setLines] = useState(DEFAULT_LINES);

  useEffect(() => {
    let mounted = true;

    async function fetchContent() {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('content')
          .eq('id', 'home')
          .maybeSingle();

        if (error || !mounted) {
          return;
        }

        const raw = data?.content?.announcementLines;

        if (typeof raw === 'string' && raw.trim()) {
          setLines(
            raw
              .split('|')
              .map((line) => line.trim().replace(/^⚡\s*/, ''))
              .filter(Boolean)
          );
        }
      } catch {
        /* keep defaults */
      }
    }

    fetchContent();

    return () => {
      mounted = false;
    };
  }, []);

  const block = (
    <span className="marquee-content">
      {lines.map((line, i) => (
        <span key={i}>
          {line}
          {'\u00A0\u00A0\u00A0\u00A0'}
          {'⚡'}
          {'\u00A0\u00A0\u00A0\u00A0\u00A0'}
        </span>
      ))}
    </span>
  );

  return (
    <div className="announcement-bar">
      <div className="marquee-track">
        {block}
        {block}
      </div>
    </div>
  );
}
