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
export function IconGitHub(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M9 19c-4.5 1.4-4.5-2.5-6.3-3m12.6 6v-3.5a3 3 0 0 0-.9-2.3c3-.3 6.2-1.5 6.2-6.9a5.3 5.3 0 0 0-1.4-3.7 4.9 4.9 0 0 0-.1-3.7s-1.2-.4-3.9 1.4a13.5 13.5 0 0 0-7 0C5.5 1.2 4.3 1.6 4.3 1.6a4.9 4.9 0 0 0-.1 3.7 5.3 5.3 0 0 0-1.4 3.7c0 5.4 3.2 6.6 6.2 6.9a3 3 0 0 0-.9 2.3V22" />
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
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 128 128"
      fill="none"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="brand-logo-badge" x1="16" x2="112" y1="16" y2="112" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9b6ff3" />
          <stop offset="1" stopColor="#6935c4" />
        </linearGradient>
      </defs>
      <rect width="128" height="128" rx="32" fill="url(#brand-logo-badge)" />
      <circle cx="64" cy="64" r="46" fill="none" stroke="#f3f2f2" strokeOpacity=".22" strokeWidth="4" />
      <path
        fill="#f3f2f2"
        d="M84.877 42.637c-4.122-3.694-10.074-5.541-17.856-5.541-6.235 0-11.068 1.278-14.5 3.833-3.432 2.557-5.148 6.185-5.148 10.885 0 3.432 1.11 6.211 3.331 8.338 2.221 2.126 5.612 3.812 10.174 5.056l8.889 2.423c2.453.658 4.242 1.444 5.365 2.356 1.123.913 1.685 2.148 1.685 3.708 0 2.048-.874 3.612-2.622 4.694-1.749 1.081-4.465 1.622-8.151 1.622-5.857 0-11.72-1.95-17.591-5.85l-5.575 10.501c3.103 2.427 6.726 4.312 10.868 5.651 4.141 1.341 8.516 2.011 13.121 2.011 7.629 0 13.775-1.583 18.437-4.744 4.661-3.16 6.992-7.643 6.992-13.45 0-7.476-4.925-12.551-14.775-15.225l-8.891-2.425c-2.301-.607-3.919-1.339-4.854-2.196-.936-.858-1.404-1.957-1.404-3.296 0-1.77.734-3.1 2.203-3.994 1.47-.894 3.635-1.341 6.496-1.341 4.998 0 10.087 1.502 15.271 4.505L84.877 42.637z"
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
