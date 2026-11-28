import React from 'react';

interface ArcaneFrameProps {
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  scrollable?: boolean;
  style?: React.CSSProperties;
}

const CornerBracket: React.FC<{ posClass: string }> = ({ posClass }) => (
  <svg
    className={`frame-corner ${posClass}`}
    viewBox="0 0 40 40"
    aria-hidden="true"
  >
    <path d="M.75 40V.75H40" strokeWidth="1.5" />
    <path d="M6 40V16Q6 6 16 6h24" opacity=".55" />
    <path d="M14 10l4 4-4 4-4-4z" className="fill-current" stroke="none" />
  </svg>
);

export const ArcaneFrame: React.FC<ArcaneFrameProps> = ({
  children,
  className = '',
  bodyClassName = '',
  scrollable = false,
  style,
}) => {
  return (
    <div
      className={`frame ${scrollable ? 'frame-scrollable flex flex-col' : ''} ${className}`.trim()}
      style={style}
    >
      <CornerBracket posClass="frame-corner-tl" />
      <CornerBracket posClass="frame-corner-tr" />
      <CornerBracket posClass="frame-corner-bl" />
      <CornerBracket posClass="frame-corner-br" />
      {scrollable ? (
        <div
          className={`relative flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar ${bodyClassName}`.trim()}
        >
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  );
};

export const ArcaneDivider: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    className={`divider ${className}`}
    viewBox="0 0 240 14"
    aria-hidden="true"
  >
    <path d="M100 7H0M140 7h100" />
    <path
      className="fill-current"
      d="M104 7l4-4 4 4-4 4zM128 7l4-4 4 4-4 4z"
      opacity=".6"
    />
    <path d="M120 1l6 6-6 6-6-6z" />
  </svg>
);

/**
 * Emblema vetorial oficial ACCIO Roleplay extraído da IDV (accio-roleplay-identidade.svg)
 */
export const AccioEmblem: React.FC<{ className?: string }> = ({ className = 'size-9' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1000 1000"
    className={className}
    role="img"
    aria-label="Emblema ACCIO Roleplay"
  >
    <defs>
      <radialGradient id="accio-bg-grad" cx="50%" cy="50%" r="55%">
        <stop offset="0%" stopColor="#401008" />
        <stop offset="65%" stopColor="#210604" />
        <stop offset="100%" stopColor="#100303" />
      </radialGradient>
      <linearGradient id="accio-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFF0B2" />
        <stop offset="30%" stopColor="#FFC34F" />
        <stop offset="65%" stopColor="#F47A16" />
        <stop offset="100%" stopColor="#FFE28A" />
      </linearGradient>
    </defs>
    <circle cx="500" cy="500" r="465" fill="url(#accio-bg-grad)" stroke="#F06A13" strokeWidth="10" />
    <circle cx="500" cy="500" r="440" fill="none" stroke="#FFC44F" strokeWidth="5" opacity="0.9" />
    <circle cx="500" cy="500" r="355" fill="none" stroke="#F4A52B" strokeWidth="3.5" opacity="0.75" />
    <g transform="translate(500 505)" fill="none" strokeLinecap="round">
      <path
        d="M-240 290 L-48 -105 Q0 -205 46 -105 L244 290 Q255 315 280 320 L188 320 Q168 315 156 294 L8 6 Q0 -8 -8 6 L-154 292 Q-166 315 -190 320 L-285 320 Q-255 312 -240 290Z"
        fill="url(#accio-gold-grad)"
        stroke="#FFF0B2"
        strokeWidth="5"
      />
      <path
        d="M-320 235 C-185 262 -95 115 15 128 C135 140 182 250 322 232"
        stroke="url(#accio-gold-grad)"
        strokeWidth="16"
      />
      <path
        d="M-320 235 C-185 262 -95 115 15 128 C135 140 182 250 322 232"
        stroke="#FFF1BD"
        strokeWidth="3.5"
      />
      <path
        d="M0 -340 L13 -24 115 -118 22 -15 335 0 22 15 115 118 13 24 0 340 -13 24 -115 118 -22 15 -335 0 -22 -15 -115 -118 -13 -24Z"
        fill="url(#accio-gold-grad)"
        stroke="#FFF4C9"
        strokeWidth="4"
      />
      <circle r="10" fill="#FFF9DA" />
    </g>
  </svg>
);

