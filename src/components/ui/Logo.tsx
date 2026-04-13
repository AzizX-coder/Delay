import logoUrl from "@/assets/logo.png";

interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 40, className = "" }: LogoProps) {
  return (
    <img
      src={logoUrl}
      alt="Delay"
      width={size}
      height={size}
      className={`rounded-xl object-contain ${className}`}
      draggable={false}
    />
  );
}
