'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useBannerStore } from '@/lib/store';

export default function AnnouncementBanner() {
  const [dismissed, setDismissed] = useState(false);
  const banner = useBannerStore((s) => s.banner);

  if (!banner?.active || !banner.text || dismissed) return null;

  return (
    <div className="relative bg-[#1A1A1A] text-[#C9A96E] text-center text-xs sm:text-sm py-2 px-10">
      <p className="font-medium tracking-wide">{banner.text}</p>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C9A96E]/70 hover:text-[#C9A96E] transition-colors"
        aria-label="Dismiss banner"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
