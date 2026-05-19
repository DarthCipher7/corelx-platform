'use client';

export function CurrentlyBuilding({ text }: { text: string }) {
  if (!text) return null;
  
  return (
    <div className="w-full max-w-2xl mx-auto py-4 px-6 rounded-2xl bg-white/5 border border-white/10 mb-12 text-center" data-editable="true">
      <p className="text-sm text-white/50 mb-1 uppercase tracking-wider font-semibold">Currently Building</p>
      <p className="text-white/90 font-medium">{text}</p>
    </div>
  );
}
