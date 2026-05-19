'use client';

import { motion } from 'framer-motion';
import { AvailabilityBadge } from './AvailabilityBadge';
import { useState } from 'react';

interface StudioHeroProps {
  handle: string;
  name: string;
  tagline: string;
  availability: 'open-to-collab' | 'open-to-freelance' | 'heads-down';
  avatar: string;
}

export function StudioHero({ handle, name, tagline, availability, avatar }: StudioHeroProps) {
  const [showToast, setShowToast] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(`nova.app/@${handle}`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <div className="flex flex-col items-center text-center pt-12 pb-8" data-editable="true">
      <div className="relative mb-6">
        <img 
          src={avatar} 
          alt={name} 
          className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-2 border-white/10"
        />
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
          <AvailabilityBadge status={availability} />
        </div>
      </div>
      
      <h1 className="text-3xl md:text-5xl font-bold mt-4 mb-2 tracking-tight text-white">{name}</h1>
      <p className="text-lg md:text-xl text-white/60 max-w-lg mb-6">
        {tagline}
      </p>
      
      <button 
        onClick={handleShare}
        className="px-6 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center gap-2"
      >
        <span>Share Profile</span>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6.632l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      </button>

      {/* Toast Notification */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: showToast ? 1 : 0, y: showToast ? 0 : 50 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-white text-black rounded-full text-sm font-medium shadow-lg"
      >
        Link copied to clipboard
      </motion.div>
    </div>
  );
}
