import React from 'react';

interface AppLogoProps {
  variant?: 'icon' | 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animate?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  className = '',
  animate = false,
}) => {
  const iconSizeMap = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9 sm:w-10 sm:h-10',
    lg: 'w-14 h-14 sm:w-16 sm:h-16',
    xl: 'w-24 h-24 sm:w-28 sm:h-28',
  };

  const titleSizeMap = {
    sm: 'text-sm font-extrabold',
    md: 'text-base sm:text-lg font-extrabold',
    lg: 'text-xl sm:text-2xl font-extrabold',
    xl: 'text-2xl sm:text-3xl font-extrabold',
  };

  const subSizeMap = {
    sm: 'text-[9px] tracking-wider',
    md: 'text-[10px] sm:text-[11px] tracking-widest',
    lg: 'text-xs tracking-widest',
    xl: 'text-xs sm:text-sm tracking-widest',
  };

  const IconSVG = (
    <div className={`relative shrink-0 ${iconSizeMap[size]} ${animate ? 'hover:scale-105 transition-transform' : ''}`}>
      <svg
        viewBox="0 0 500 500"
        className="w-full h-full drop-shadow-xs select-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id={`soft-glow-${size}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id={`ring-glow-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id={`ecg-line-${size}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00b4d8" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
        </defs>

        {/* Outer Soft Ring */}
        <circle cx="250" cy="250" r="236" fill="#f0f9ff" stroke="#bae6fd" strokeWidth="6" opacity="0.6" />

        {/* Main Blue Circular Border */}
        <circle cx="250" cy="250" r="220" fill="#ffffff" stroke={`url(#ring-glow-${size})`} strokeWidth="14" />

        {/* Dark Navy Medical Cross */}
        <g fill="#0f172a">
          <rect x="130" y="210" width="240" height="80" rx="32" ry="32" />
          <rect x="210" y="130" width="80" height="240" rx="32" ry="32" />
        </g>

        {/* Electric Cyan Heartbeat / ECG Waveform */}
        <path
          d="M 115 250 L 195 250 L 225 175 L 255 330 L 285 160 L 315 250 L 385 250"
          fill="none"
          stroke={`url(#ecg-line-${size})`}
          strokeWidth="18"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#soft-glow-${size})`}
          className={animate ? 'animate-pulse' : ''}
        />
      </svg>
    </div>
  );

  if (variant === 'icon') {
    return <div className={`inline-flex items-center justify-center ${className}`}>{IconSVG}</div>;
  }

  if (variant === 'vertical') {
    return (
      <div className={`flex flex-col items-center text-center gap-3 ${className}`}>
        {IconSVG}
        <div className="space-y-0.5">
          <h2 className={`${titleSizeMap[size]} text-slate-900 tracking-tight font-heading`}>
            SMART OPD
          </h2>
          <p className={`${subSizeMap[size]} font-bold text-slate-500 uppercase`}>
            AI Clinical Intake &amp; Triage
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {IconSVG}
      <div className="flex flex-col">
        <span className={`${titleSizeMap[size]} text-slate-900 leading-tight tracking-tight font-heading`}>
          SMART OPD
        </span>
        <span className={`${subSizeMap[size]} font-bold text-teal-700 uppercase leading-none`}>
          AI Clinical Intake &amp; Triage
        </span>
      </div>
    </div>
  );
};
