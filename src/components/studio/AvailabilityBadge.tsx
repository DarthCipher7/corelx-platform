'use client';

import { motion } from 'framer-motion';

type Availability = 'open-to-collab' | 'open-to-freelance' | 'heads-down';

interface AvailabilityBadgeProps {
  status: Availability;
}

export function AvailabilityBadge({ status }: AvailabilityBadgeProps) {
  let color = '';
  let label = '';
  let dotColor = '';

  switch (status) {
    case 'open-to-collab':
      color = 'text-green-400 bg-green-500/10 border-green-500/20';
      dotColor = 'bg-green-400';
      label = 'Open to Collab';
      break;
    case 'open-to-freelance':
      color = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      dotColor = 'bg-amber-400';
      label = 'Open to Freelance';
      break;
    case 'heads-down':
      color = 'text-gray-400 bg-gray-500/10 border-gray-500/20';
      dotColor = 'bg-gray-400';
      label = 'Heads Down';
      break;
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${color}`}>
      <motion.div
        className={`w-2 h-2 rounded-full ${dotColor}`}
        animate={status === 'open-to-collab' ? { opacity: [1, 0.5, 1], scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      {label}
    </div>
  );
}
