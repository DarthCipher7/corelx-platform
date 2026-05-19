'use client';

import { motion } from 'framer-motion';

interface Link {
  label: string;
  url: string;
}

export function StudioLinks({ links }: { links: Link[] }) {
  if (!links || links.length === 0) return null;

  return (
    <div className="flex flex-wrap justify-center gap-3 mb-12" data-editable="true">
      {links.map((link, i) => (
        <a 
          key={i} 
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-sm font-medium"
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}
