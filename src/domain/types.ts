/** Domain types for the gelato production planner. */

export type Role = 'manager' | 'churner' | 'staff';

export type TabId =
  | 'today'
  | 'plan'
  | 'workflow'
  | 'bake'
  | 'stock'
  | 'flavours'
  | 'reports'
  | 'data';

export type StockSub = 'count' | 'delivery' | 'alerts';
export type FlavourSub = 'list' | 'specials' | 'groups';
export type CountPhase = 'neg20' | 'neg14';
export type StockStatus = 'red' | 'amber' | 'green';
export type AlertUrgency = 'today' | 'next';

export interface FlavourComponent {
  id: string;
  name: string;
  needsBaking: boolean;
}

export interface Flavour {
  id: string;
  name: string;
  group: string;
  groupOrder: number;
  active: boolean;
  isSpecial: boolean;
  popular: boolean;
  par: number;
  yieldPotsPerBladder: number;
  prodTimeMinPerBladder: number;
  allergenNotes: string;
  washAlwaysAfter: boolean;
  notes: string;
  photoRef: string;
  groupUnconfirmed: boolean;
  components: FlavourComponent[];
}

export interface StockEntry {
  neg20: number;
  neg14: number;
  bladders: number;
  updatedAt: string;
}

export type StockMap = Record<string, StockEntry>;

export interface ExpiryAlert {
  id: string;
  flavourId: string;
  urgency: AlertUrgency;
  bladderCount: number;
  note: string;
  createdAt: string;
  resolved?: boolean;
  resolvedAt?: string;
}

export interface WashGroup {
  id: string;
  name: string;
  color: string;
}

export interface SpecialWashRule {
  fromGroup: string;
  toGroup: string;
  flavourId: string;
  label: string;
}

export interface WashConfig {
  specialRule: SpecialWashRule | null;
  groups: WashGroup[];
}

export interface ShiftWindow {
  start: string;
  end: string;
}

export interface ShiftSettings {
  shifts: Record<string, ShiftWindow>;
  setupMin: number;
  cleanMin: number;
  washMin: number;
  defaultProdMinPerBladder: number;
  bladdersPerHourPace: number;
}

export interface PlanLine {
  flavourId: string;
  bladders: number;
  reason?: string;
  tier?: number;
  note?: string;
}

export interface BlockedLine {
  flavourId: string;
  reason: string;
  tier: number;
}

export interface PlanSummary {
  shiftMin: number;
  setupMin: number;
  cleanMin: number;
  available: number;
  prodMinutes: number;
  washMinutes: number;
  planned: number;
  spare: number;
  overbooked: boolean;
}

export interface ProductionPlan {
  date: string;
  recommended: PlanLine[];
  approved: PlanLine[];
  completed: Record<string, boolean>;
  bakingCompleted: Record<string, boolean>;
  blocked: BlockedLine[];
  summary: PlanSummary;
  generatedAt: string;
}

export type ProductionPlans = Record<string, ProductionPlan>;

export interface SpecialsState {
  current: string[];
  archive: Array<{ id: string; archivedAt: string; name?: string }>;
}

export interface StockHistoryEntry {
  at: string;
  kind: 'count' | 'delivery';
  flavourId: string;
  delta?: Partial<StockEntry>;
  after: StockEntry;
}

export interface GelatoDb {
  flavours: Flavour[];
  specials: SpecialsState;
  stock: StockMap;
  'expiry-alerts': ExpiryAlert[];
  'wash-config': WashConfig;
  'shift-settings': ShiftSettings;
  'production-plans': ProductionPlans;
  'stock-history': StockHistoryEntry[];
}

export type StorageKey = keyof GelatoDb;

export interface Candidate {
  flavourId: string;
  tier: number;
  reason: string;
  severity: number;
  bladdersNeeded: number;
  bladdersAvailable: number;
  blocked: boolean;
  currentPots: number;
  watchAlert?: ExpiryAlert;
}

export interface BakingItem {
  flavourId: string;
  flavourName: string;
  group: string;
  componentId: string;
  name: string;
  key: string;
}

export type SequenceStep =
  | { type: 'flavour'; flavourId: string; bladders: number; group: string }
  | { type: 'wash'; reason: string; group: string };

export interface AllocateResult {
  date: string;
  chosen: Candidate[];
  leftover: Candidate[];
  summary: PlanSummary;
}
