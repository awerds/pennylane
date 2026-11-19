import { useId } from 'react';

interface PennyLaneLogoProps {
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
 * PennyLane Signature Architectural Monogram
 * Interlocks a crisp architectural "L" spine/floorplate with a cantilevered
 * coral-amber "P" arch separated by a precision Swiss reveal gap.
 */
export function PennyLaneLogo({
  size = 'md',
  variant = 'light',
  showWordmark = true,
  className = '',
}: PennyLaneLogoProps) {
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
          <linearGradient id={`${uid}-arch`} x1="21" y1="10" x2="38" y2="30" gradientUnits="userSpaceOnUse">
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

        <path d="M12 11H19V31.5H36V37H12V11Z" fill="#FFFFFF" />

        <path
          className="pl-logo-arch"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M21.5 11H28C33.8 11 37.5 14.5 37.5 19.75C37.5 25 33.8 28.5 28 28.5H21.5V11ZM26.2 16V23.5H27.7C30.4 23.5 32 22 32 19.75C32 17.5 30.4 16 27.7 16H26.2Z"
          fill={`url(#${uid}-arch)`}
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
            penny
          </span>
          <span
            className={
              variant === 'dark'
                ? 'bg-gradient-to-r from-sky-200 via-amber-200 to-rose-300 bg-clip-text font-semibold tracking-[-0.04em] text-transparent'
                : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-rose-500 bg-clip-text font-semibold tracking-[-0.04em] text-transparent'
            }
          >
            lane
          </span>
        </span>
      )}
    </span>
  );
}
