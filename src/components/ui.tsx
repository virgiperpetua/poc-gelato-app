'use client';

import type { ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mb-3 border border-line bg-bg-surface p-4 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-2.5 flex items-center justify-between gap-2 font-heading text-[15px] font-semibold">
      <span>{children}</span>
      {action}
    </div>
  );
}

export function Badge({
  tone = 'neutral',
  children,
}: {
  tone?: 'neutral' | 'accent' | 'red' | 'amber' | 'green';
  children: ReactNode;
}) {
  const tones: Record<string, string> = {
    neutral: 'bg-bg text-fg-muted border-line',
    accent: 'bg-accent/15 text-accent-strong border-accent/30',
    red: 'border-transparent text-[var(--gelato-red)] bg-[var(--gelato-red-soft)]',
    amber: 'border-transparent text-[var(--gelato-amber)] bg-[var(--gelato-amber-soft)]',
    green: 'border-transparent text-[var(--gelato-green)] bg-[var(--gelato-green-soft)]',
  };
  return (
    <span className={`inline-flex items-center border px-2 py-0.5 text-[11px] font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Btn({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  disabled,
  className = '',
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
}) {
  const variants = {
    primary: 'bg-accent text-accent-on border-accent',
    secondary: 'bg-bg-surface text-fg border-line',
    ghost: 'bg-transparent text-fg-muted border-transparent',
    danger: 'bg-[var(--gelato-red)] text-white border-[var(--gelato-red)]',
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 border px-3 py-2 text-[13px] font-semibold disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function PageHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-4 mt-1.5">
      <h1 className="m-0 text-[23px] font-bold text-accent-strong">{title}</h1>
      {sub ? <p className="m-0 text-[13.5px] text-fg-muted">{sub}</p> : null}
    </div>
  );
}

export function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="border border-dashed border-line bg-bg-surface px-4 py-8 text-center">
      <div className="font-heading text-[15px] font-semibold">{title}</div>
      <p className="mt-1 text-[13px] text-fg-muted">{body}</p>
    </div>
  );
}

export function Stepper({
  value,
  onChange,
  step = 1,
  min = 0,
}: {
  value: number;
  onChange: (n: number) => void;
  step?: number;
  min?: number;
}) {
  return (
    <div className="inline-flex items-center border border-line">
      <button
        type="button"
        className="px-2.5 py-1.5 text-fg-muted"
        onClick={() => onChange(Math.max(min, value - step))}
      >
        −
      </button>
      <span className="mono min-w-[2.5rem] px-1 text-center text-[13px] font-semibold">{value}</span>
      <button type="button" className="px-2.5 py-1.5 text-fg-muted" onClick={() => onChange(value + step)}>
        +
      </button>
    </div>
  );
}
