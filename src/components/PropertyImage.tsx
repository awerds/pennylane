import { useState } from 'react';
import { Home } from 'lucide-react';

interface PropertyImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: 'lcp' | 'lazy' | 'low';
  width?: number;
  height?: number;
}

export function PropertyImage({
  src,
  alt,
  className = '',
  priority = 'lazy',
  width = 1200,
  height = 800,
}: PropertyImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[var(--paper-inset)] text-[var(--ink-soft)] ${className}`}
        aria-label={alt}
      >
        <Home className="h-7 w-7 opacity-45" strokeWidth={1.25} />
        <span className="mt-2 font-mono-tech text-[11px] uppercase tracking-widest opacity-60">
          Architectural Plate
        </span>
      </div>
    );
  }

  // Strictly follow modern-web-guidance `optimize-image-priority`:
  // - LCP hero: fetchPriority="high", NO loading="lazy"
  // - Below-the-fold grid cards: loading="lazy" ALONE (omit fetchPriority)
  // - Initially hidden / modal gallery thumbnails: fetchPriority="low"
  const imgPriorityProps: Record<string, string> =
    priority === 'lcp'
      ? { fetchPriority: 'high', decoding: 'async' }
      : priority === 'low'
      ? { fetchPriority: 'low', loading: 'lazy', decoding: 'async' }
      : { loading: 'lazy', decoding: 'async' };

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      onError={() => setFailed(true)}
      className={className}
      {...imgPriorityProps}
    />
  );
}

