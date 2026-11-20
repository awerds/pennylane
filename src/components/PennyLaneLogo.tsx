import { useId } from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  showWordmark?: boolean;
  className?: string;
}

const SIZE_MAP = {
  sm: { box: 'h-7 w-7', text: 'text-[15.5px]' },
  md: { box: 'h-9 w-9', text: 'text-[19px]' },
  lg: { box: 'h-12 w-12', text: 'text-[24px]' },
};

/**
 * CurbSteals Signature Architectural CS Monogram
 * Pairs a precision alabaster-white architectural "C" arch with a cantilevered
 * metallic coral-to-gold "S" separated by a clean Swiss reveal gap.
 */
export function PennyLaneLogo({
  size = 'md',
  variant = 'light',
  showWordmark = true,
  className = '',
}: BrandLogoProps) {
  const uid = useId().replace(/:/g, '');
  const dims = SIZE_MAP[size];

  return (
    <span className={`pl-logo group/logo inline-flex items-center gap-2.5 ${className}`}>
      <svg
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden="true"
        className={`${dims.box} shrink-0 drop-shadow-[0_4px_14px_rgba(9,13,30,0.35)]`}
      >
        <defs>
          <linearGradient id={`${uid}-bg`} x1="4" y1="2" x2="44" y2="46" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#16234D" />
            <stop offset="100%" stopColor="#090F24" />
          </linearGradient>
          <linearGradient id={`${uid}-rim`} x1="24" y1="1" x2="24" y2="47" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#7DD3FC" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.45" />
          </linearGradient>
          <linearGradient id={`${uid}-s`} x1="26" y1="11" x2="39" y2="37" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FB7185" />
            <stop offset="50%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#FBBF24" />
          </linearGradient>
          <radialGradient
            id={`${uid}-glow`}
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(36 12) rotate(135) scale(34)"
          >
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.34" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect x="1" y="1" width="46" height="46" rx="12" fill={`url(#${uid}-bg)`} />
        <rect x="1" y="1" width="46" height="46" rx="12" fill={`url(#${uid}-glow)`} />
        <rect
          x="1.5"
          y="1.5"
          width="45"
          height="45"
          rx="11.5"
          stroke={`url(#${uid}-rim)`}
          strokeWidth="1"
        />

        {/* Precision architectural C */}
        <path
          d="M24.5 11H19.5C13.2 11 9.5 15.5 9.5 24C9.5 32.5 13.2 37 19.5 37H24.5V31.2H20C16.8 31.2 15.2 28.5 15.2 24C15.2 19.5 16.8 16.8 20 16.8H24.5V11Z"
          fill="#FFFFFF"
        />

        {/* Cantilevered metallic coral-gold S */}
        <path
          className="pl-logo-arch"
          d="M38 11H31C27.8 11 26 13.1 26 16.2V18.5C26 21.4 27.8 23.3 31 23.8L33.8 24.3C34.8 24.5 35.3 25 35.3 26.1V28.6C35.3 30.4 34.2 31.4 32.2 31.4H26.5V37H33.2C36.8 37 38.8 34.7 38.8 31.2V28.3C38.8 25.1 37.1 23.1 33.6 22.5L30.8 22C29.7 21.8 29.2 21.2 29.2 20.1V18.2C29.2 16.9 30.1 16.2 31.7 16.2H38V11Z"
          fill={`url(#${uid}-s)`}
        />
      </svg>

      {showWordmark && (
        <span
          className={`font-brand ${dims.text} inline-flex items-baseline leading-none select-none`}
        >
          <span
            className={`font-bold tracking-[-0.045em] ${
              variant === 'dark' ? 'text-white' : 'text-slate-950'
            }`}
          >
            curb
          </span>
          <span
            className={
              variant === 'dark'
                ? 'bg-gradient-to-r from-emerald-200 via-amber-200 to-teal-100 bg-clip-text font-semibold tracking-[-0.04em] text-transparent'
                : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-500 bg-clip-text font-semibold tracking-[-0.04em] text-transparent'
            }
          >
            steals
          </span>
        </span>
      )}
    </span>
  );
}
