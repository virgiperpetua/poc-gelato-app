import { SHIFT_DAYS } from './constants';
import type { ShiftSettings } from './types';

export function todayISO(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function fmtDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function alpha<T extends { name: string }>(list: T[]): T[] {
  return [...list].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
}

export function snapQuarter(n: number): number {
  return Math.max(0, Math.round(n * 4) / 4);
}

export function fmtNum(n: number): string {
  return (Math.round(n * 100) / 100).toString();
}

export function fmtPots(n: number): string {
  const v = snapQuarter(n);
  return `${fmtNum(v)} pot${v === 1 ? '' : 's'}`;
}

export function nextChurnDates(settings: ShiftSettings, count: number, from: Date = new Date()): string[] {
  const out: string[] = [];
  const d = new Date(from);
  let guard = 0;
  while (out.length < count && guard < 30) {
    const wd = SHIFT_DAYS[d.getDay()]!;
    if (settings.shifts[wd]) out.push(todayISO(d));
    d.setDate(d.getDate() + 1);
    guard++;
  }
  return out;
}

export function shiftMinutesFor(settings: ShiftSettings, dateISO: string): number {
  const wd = SHIFT_DAYS[new Date(`${dateISO}T00:00:00`).getDay()]!;
  const sh = settings.shifts[wd];
  if (!sh) return 0;
  const [sh1, sm1] = sh.start.split(':').map(Number) as [number, number];
  const [sh2, sm2] = sh.end.split(':').map(Number) as [number, number];
  return sh2 * 60 + sm2 - (sh1 * 60 + sm1);
}
