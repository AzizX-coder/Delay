interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 40, className = "" }: LogoProps) {
  return (
    <img
      src="logo.png"
      alt="Delay"
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={`rounded-xl object-contain ${className}`}
      draggable={false}
      onError={(e) => {
        // Fallback if logo fails to load for any reason in production
        e.currentTarget.style.display = 'none';
      }}
    />
  );
}
