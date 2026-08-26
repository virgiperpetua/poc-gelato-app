import {
  DEFAULT_GROUPS,
  DEFAULT_SHIFT_SETTINGS,
  SPECIAL_WASH_RULE,
  STORAGE_KEYS,
} from '@/domain/constants';
import { seedFlavours, seedStock } from '@/domain/seed';
import type { GelatoDb, StorageKey } from '@/domain/types';
import type { GelatoRepository } from './gelato-repository';

const PREFIX = 'poc-gelato:';

function readKey<K extends StorageKey>(key: K): GelatoDb[K] | null {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw) as GelatoDb[K];
  } catch {
    return null;
  }
}

function writeKey<K extends StorageKey>(key: K, value: GelatoDb[K]): void {
  window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

function emptyDbSkeleton(): Partial<GelatoDb> {
  const db: Partial<GelatoDb> = {};
  for (const key of STORAGE_KEYS) {
    const value = readKey(key);
    if (value != null) {
      (db as Record<string, unknown>)[key] = value;
    }
  }
  return db;
}

function ensureSeeded(partial: Partial<GelatoDb>): { db: GelatoDb; needsPersist: boolean } {
  let needsPersist = false;
  let flavours = partial.flavours;
  if (!flavours) {
    flavours = seedFlavours();
    needsPersist = true;
  }
  const stock = partial.stock ?? seedStock(flavours);
  const specials =
    partial.specials ??
    ({
      current: flavours.filter((f) => f.isSpecial).map((f) => f.id),
      archive: [],
    } as GelatoDb['specials']);
  const expiry = partial['expiry-alerts'] ?? [];
  let wash = partial['wash-config'];
  if (!wash) {
    wash = { specialRule: SPECIAL_WASH_RULE, groups: structuredClone(DEFAULT_GROUPS) };
  } else if (!wash.groups) {
    wash = { ...wash, groups: structuredClone(DEFAULT_GROUPS) };
  }
  const shifts = partial['shift-settings'] ?? DEFAULT_SHIFT_SETTINGS;
  const plans = partial['production-plans'] ?? {};
  const history = partial['stock-history'] ?? [];

  return {
    needsPersist,
    db: {
      flavours,
      specials,
      stock,
      'expiry-alerts': expiry,
      'wash-config': wash,
      'shift-settings': shifts,
      'production-plans': plans,
      'stock-history': history,
    },
  };
}

export function createLocalStorageRepository(): GelatoRepository {
  return {
    async load() {
      const { db, needsPersist } = ensureSeeded(emptyDbSkeleton());
      if (needsPersist) {
        for (const key of STORAGE_KEYS) writeKey(key, db[key]);
      }
      return db;
    },
    async save(key, value) {
      writeKey(key, value);
    },
    async saveAll(db) {
      for (const key of STORAGE_KEYS) writeKey(key, db[key]);
    },
  };
}
