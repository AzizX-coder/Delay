import { useId } from "react";

interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 40, className = "" }: LogoProps) {
  const uid = useId();
  const g1 = `${uid}-g1`;
  const g2 = `${uid}-g2`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      className={className}
      aria-label="Delay"
    >
      <defs>
        <linearGradient id={g1} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#007AFF" />
          <stop offset="100%" stopColor="#5856D6" />
        </linearGradient>
        <linearGradient id={g2} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5856D6" />
          <stop offset="100%" stopColor="#AF52DE" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="112" fill={`url(#${g1})`} />
      <g transform="translate(100, 96)">
        <rect x="0" y="0" width="140" height="320" rx="36" fill="white" opacity="0.95" />
        <rect x="172" y="0" width="140" height="200" rx="36" fill="white" opacity="0.75" />
        <rect x="172" y="220" width="140" height="100" rx="36" fill={`url(#${g2})`} opacity="0.9" />
      </g>
    </svg>
  );
}
