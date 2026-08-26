import type { ShiftSettings, SpecialWashRule, StorageKey, WashGroup } from './types';

export const STORAGE_KEYS: StorageKey[] = [
  'flavours',
  'specials',
  'stock',
  'expiry-alerts',
  'wash-config',
  'shift-settings',
  'production-plans',
  'stock-history',
];

export const DEFAULT_GROUPS: WashGroup[] = [
  { id: 'A', name: 'Group A', color: '#7FB0A3' },
  { id: 'B', name: 'Group B', color: '#8FA871' },
  { id: 'C', name: 'Group C', color: '#C9BFA0' },
  { id: 'D', name: 'Group D', color: '#8A6142' },
  { id: 'E', name: 'Group E', color: '#A9C6C0' },
  { id: 'F', name: 'Group F', color: '#8B5E7A' },
  { id: 'G', name: 'Group G', color: '#C25B6B' },
  { id: 'H', name: 'Group H', color: '#D9A63E' },
  { id: 'I', name: 'Group I', color: '#5B4636' },
  { id: 'J', name: 'Group J', color: '#C7A567' },
  { id: 'K', name: 'Group K', color: '#D6A9C9' },
  { id: 'L', name: 'Group L', color: '#A0B5D9' },
  { id: 'M', name: 'Group M', color: '#A8BFA0' },
  { id: 'N', name: 'Group N', color: '#D9C36A' },
  { id: 'O', name: 'Group O', color: '#C97D5A' },
  { id: 'P', name: 'Group P', color: '#7C9CA6' },
];

export const GROUP_COLOR_PALETTE = [
  '#C9BFA0',
  '#8A6142',
  '#7E9A63',
  '#C79A56',
  '#7FB0A3',
  '#A9C6C0',
  '#CE7C61',
  '#B58AC0',
  '#8FB0D6',
  '#D6A9C9',
  '#A0B5D9',
  '#D9C36A',
];

export const SHIFT_DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export const DEFAULT_SHIFTS: ShiftSettings['shifts'] = {
  Tuesday: { start: '10:00', end: '18:00' },
  Wednesday: { start: '13:00', end: '19:00' },
  Friday: { start: '11:00', end: '19:00' },
  Saturday: { start: '12:00', end: '20:00' },
};

export const DELIVERY_DAYS = ['Tuesday', 'Friday'] as const;

export const DEFAULT_SHIFT_SETTINGS: ShiftSettings = {
  shifts: DEFAULT_SHIFTS,
  setupMin: 40,
  cleanMin: 40,
  washMin: 20,
  defaultProdMinPerBladder: 15,
  bladdersPerHourPace: 3.5,
};

/** Wash before Group D only if Coffee (group C) was churned. */
export const SPECIAL_WASH_RULE: SpecialWashRule = {
  fromGroup: 'C',
  toGroup: 'D',
  flavourId: 'coffee',
  label: 'Coffee → Group D',
};

export function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}
