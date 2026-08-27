import { z } from 'zod';
import type { GelatoDb } from './types';

/**
 * Portable snapshot of the whole dataset.
 *
 * A snapshot exported from the localStorage PoC is the same shape the API will
 * receive as its seed payload: `data` is keyed by storage key, and each key maps
 * to one future resource collection. Bump `SNAPSHOT_SCHEMA_VERSION` whenever a
 * stored shape changes so old files can be migrated rather than silently
 * half-imported.
 */
export const SNAPSHOT_SCHEMA_VERSION = 1;

const flavourComponentSchema = z.object({
  id: z.string(),
  name: z.string(),
  needsBaking: z.boolean(),
});

const flavourSchema = z.object({
  id: z.string(),
  name: z.string(),
  group: z.string(),
  groupOrder: z.number(),
  active: z.boolean(),
  isSpecial: z.boolean(),
  popular: z.boolean(),
  par: z.number(),
  yieldPotsPerBladder: z.number(),
  prodTimeMinPerBladder: z.number(),
  allergenNotes: z.string(),
  washAlwaysAfter: z.boolean(),
  notes: z.string(),
  photoRef: z.string(),
  groupUnconfirmed: z.boolean(),
  components: z.array(flavourComponentSchema),
});

const stockEntrySchema = z.object({
  neg20: z.number(),
  neg14: z.number(),
  bladders: z.number(),
  updatedAt: z.string(),
});

const expiryAlertSchema = z.object({
  id: z.string(),
  flavourId: z.string(),
  urgency: z.enum(['today', 'next']),
  bladderCount: z.number(),
  note: z.string(),
  createdAt: z.string(),
  resolved: z.boolean().optional(),
  resolvedAt: z.string().optional(),
});

const washConfigSchema = z.object({
  specialRule: z
    .object({
      fromGroup: z.string(),
      toGroup: z.string(),
      flavourId: z.string(),
      label: z.string(),
    })
    .nullable(),
  groups: z.array(z.object({ id: z.string(), name: z.string(), color: z.string() })),
});

const shiftSettingsSchema = z.object({
  shifts: z.record(z.object({ start: z.string(), end: z.string() })),
  setupMin: z.number(),
  cleanMin: z.number(),
  washMin: z.number(),
  defaultProdMinPerBladder: z.number(),
  bladdersPerHourPace: z.number(),
});

const planLineSchema = z.object({
  flavourId: z.string(),
  bladders: z.number(),
  reason: z.string().optional(),
  tier: z.number().optional(),
  note: z.string().optional(),
});

const productionPlanSchema = z.object({
  date: z.string(),
  recommended: z.array(planLineSchema),
  approved: z.array(planLineSchema),
  completed: z.record(z.boolean()),
  bakingCompleted: z.record(z.boolean()),
  blocked: z.array(z.object({ flavourId: z.string(), reason: z.string(), tier: z.number() })),
  summary: z.object({
    shiftMin: z.number(),
    setupMin: z.number(),
    cleanMin: z.number(),
    available: z.number(),
    prodMinutes: z.number(),
    washMinutes: z.number(),
    planned: z.number(),
    spare: z.number(),
    overbooked: z.boolean(),
  }),
  generatedAt: z.string(),
});

const gelatoDbSchema: z.ZodType<GelatoDb> = z.object({
  flavours: z.array(flavourSchema),
  specials: z.object({
    current: z.array(z.string()),
    archive: z.array(
      z.object({ id: z.string(), archivedAt: z.string(), name: z.string().optional() }),
    ),
  }),
  stock: z.record(stockEntrySchema),
  'expiry-alerts': z.array(expiryAlertSchema),
  'wash-config': washConfigSchema,
  'shift-settings': shiftSettingsSchema,
  'production-plans': z.record(productionPlanSchema),
  'stock-history': z.array(
    z.object({
      at: z.string(),
      kind: z.enum(['count', 'delivery']),
      flavourId: z.string(),
      delta: stockEntrySchema.partial().optional(),
      after: stockEntrySchema,
    }),
  ),
});

const snapshotSchema = z.object({
  schemaVersion: z.number().int().positive(),
  exportedAt: z.string(),
  appVersion: z.string().optional(),
  data: gelatoDbSchema,
});

export type GelatoSnapshot = z.infer<typeof snapshotSchema>;

export function createSnapshot(db: GelatoDb, now: Date = new Date()): GelatoSnapshot {
  return {
    schemaVersion: SNAPSHOT_SCHEMA_VERSION,
    exportedAt: now.toISOString(),
    appVersion: process.env.NEXT_PUBLIC_APP_VERSION ?? 'unknown',
    data: db,
  };
}

export function serializeSnapshot(db: GelatoDb, now?: Date): string {
  return `${JSON.stringify(createSnapshot(db, now), null, 2)}\n`;
}

export type ParseResult =
  | { ok: true; snapshot: GelatoSnapshot }
  | { ok: false; error: string };

export function parseSnapshot(text: string): ParseResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: 'That file is not valid JSON.' };
  }

  const parsed = snapshotSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const where = first?.path.join('.') || 'file';
    return { ok: false, error: `Snapshot does not match the expected shape (${where}).` };
  }
  if (parsed.data.schemaVersion > SNAPSHOT_SCHEMA_VERSION) {
    return {
      ok: false,
      error: `Snapshot was written by a newer version (v${parsed.data.schemaVersion}). Update the app first.`,
    };
  }
  return { ok: true, snapshot: parsed.data };
}

export function snapshotFilename(now: Date = new Date()): string {
  const stamp = now.toISOString().slice(0, 19).replace(/[:T]/g, '-');
  return `churn-sheet-snapshot-${stamp}.json`;
}

/** Row counts shown before export and after import. */
export function summariseDb(db: GelatoDb): Array<{ label: string; count: number }> {
  return [
    { label: 'Flavours', count: db.flavours.length },
    { label: 'Stock entries', count: Object.keys(db.stock).length },
    { label: 'Open alerts', count: db['expiry-alerts'].filter((a) => !a.resolved).length },
    { label: 'Wash groups', count: db['wash-config'].groups.length },
    { label: 'Production plans', count: Object.keys(db['production-plans']).length },
    { label: 'Stock events', count: db['stock-history'].length },
  ];
}
