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
        className={`flex flex-col items-center justify-center bg-zinc-100 text-zinc-400 ${className}`}
        aria-label={alt}
      >
        <Home className="h-7 w-7 opacity-50" strokeWidth={1.5} />
        <span className="mt-1.5 text-[11px] font-medium">Photo Unavailable</span>
      </div>
    );
  }

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
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
      {...imgPriorityProps}
    />
  );
}
