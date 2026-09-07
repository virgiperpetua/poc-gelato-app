import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 18, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    ...props,
  };
}

export function IconCalendar(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="3" y="5" width="18" height="16" rx="0" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}
export function IconList(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01" />
    </svg>
  );
}
export function IconWorkflow(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="18" cy="12" r="2.5" />
      <circle cx="6" cy="18" r="2.5" />
      <path d="M8.5 7.5 15.5 11M8.5 16.5 15.5 13" />
    </svg>
  );
}
export function IconBake(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M4 14h16v5H4zM6 14V9a6 6 0 0 1 12 0v5" />
    </svg>
  );
}
export function IconBox(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M3 8l9-4 9 4-9 4-9-4zM3 8v8l9 4 9-4V8" />
    </svg>
  );
}
export function IconFlavour(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 3c-2 4-6 6-6 10a6 6 0 0 0 12 0c0-4-4-6-6-10z" />
    </svg>
  );
}
export function IconChart(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M4 19h16M7 16V9M12 16V5M17 16v-6" />
    </svg>
  );
}
export function IconCheck(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M5 12l4 4L19 6" />
    </svg>
  );
}
export function IconPlus(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
export function IconMinus(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M5 12h14" />
    </svg>
  );
}
export function IconDownload(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 3v12M7 11l5 5 5-5M4 21h16" />
    </svg>
  );
}
export function BrandLogo({
  size = 28,
  className,
  ...props
}: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <rect x="4" y="4" width="56" height="56" rx="18" fill="currentColor" />
      <path
        d="M32 14c-8 10-15 16-15 25.2C17 48 23.7 54 32 54s15-6 15-14.8C47 30 40 24 32 14Z"
        fill="white"
        fillOpacity="0.96"
      />
      <path
        d="M31.8 19.7c-3.2 4.2-9.5 8.6-9.5 17 0 5.9 4.4 10.7 9.8 10.7 1.9 0 3.8-.6 5.2-1.6-6.1-.2-11-5.4-11-11.8 0-4.8 2.6-8.6 5.5-12.1Z"
        fill="#F5D2B4"
        fillOpacity="0.92"
      />
    </svg>
  );
}
export function IconUpload(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 16V4M7 8l5-5 5 5M4 21h16" />
    </svg>
  );
}
export function IconAlert(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 9v4M12 17h.01M10.3 4.3 2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0z" />
    </svg>
  );
}
