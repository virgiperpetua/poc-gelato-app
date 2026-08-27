'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { createGelatoDataClient, type GelatoRepository } from '@/data';
import { generatePlans } from '@/domain/engine';
import { parseSnapshot } from '@/domain/snapshot';
import type {
  CountPhase,
  FlavourSub,
  GelatoDb,
  Role,
  StockSub,
  StorageKey,
  TabId,
} from '@/domain/types';

export interface UiState {
  role: Role | null;
  tab: TabId;
  stockSub: StockSub;
  flavourSub: FlavourSub;
  countPhase: CountPhase;
  planDate: string | null;
  bakeDate: string | null;
  toast: string | null;
}

interface GelatoContextValue {
  loaded: boolean;
  db: GelatoDb | null;
  ui: UiState;
  setRole: (role: Role) => void;
  clearRole: () => void;
  setTab: (tab: TabId) => void;
  setStockSub: (sub: StockSub) => void;
  setFlavourSub: (sub: FlavourSub) => void;
  setCountPhase: (phase: CountPhase) => void;
  setPlanDate: (date: string | null) => void;
  setBakeDate: (date: string | null) => void;
  showToast: (msg: string) => void;
  patchDb: <K extends StorageKey>(key: K, value: GelatoDb[K]) => Promise<void>;
  replaceDb: (next: GelatoDb, persist?: boolean) => Promise<void>;
  runGeneratePlans: () => Promise<string[]>;
  importSnapshotText: (text: string) => Promise<{ ok: boolean; error?: string }>;
  resetToSeed: () => Promise<void>;
}

const GelatoContext = createContext<GelatoContextValue | null>(null);

const defaultUi: UiState = {
  role: null,
  tab: 'today',
  stockSub: 'count',
  flavourSub: 'list',
  countPhase: 'neg20',
  planDate: null,
  bakeDate: null,
  toast: null,
};

export function GelatoProvider({ children }: { children: ReactNode }) {
  const [repo] = useState<GelatoRepository>(() => createGelatoDataClient());
  const [loaded, setLoaded] = useState(false);
  const [db, setDb] = useState<GelatoDb | null>(null);
  const [ui, setUi] = useState<UiState>(defaultUi);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await repo.load();
      if (cancelled) return;
      setDb(data);
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [repo]);

  useEffect(() => {
    if (!ui.toast) return;
    const t = setTimeout(() => setUi((u) => ({ ...u, toast: null })), 2200);
    return () => clearTimeout(t);
  }, [ui.toast]);

  const showToast = useCallback((msg: string) => {
    setUi((u) => ({ ...u, toast: msg }));
  }, []);

  const patchDb = useCallback(
    async <K extends StorageKey>(key: K, value: GelatoDb[K]) => {
      setDb((prev) => {
        if (!prev) return prev;
        return { ...prev, [key]: value };
      });
      await repo.save(key, value);
    },
    [repo],
  );

  const replaceDb = useCallback(
    async (next: GelatoDb, persist = true) => {
      setDb(next);
      if (persist) await repo.saveAll(next);
    },
    [repo],
  );

  const runGeneratePlans = useCallback(async () => {
    if (!db) return [];
    const { db: next, dates } = generatePlans(db);
    await replaceDb(next);
    setUi((u) => ({ ...u, planDate: dates[0], bakeDate: dates[0] }));
    showToast('Plans generated');
    return dates;
  }, [db, replaceDb, showToast]);

  const importSnapshotText = useCallback(
    async (text: string) => {
      const result = parseSnapshot(text);
      if (!result.ok) return { ok: false, error: result.error };
      await replaceDb(result.snapshot.data);
      setUi((u) => ({ ...u, planDate: null, bakeDate: null }));
      showToast('Snapshot imported');
      return { ok: true };
    },
    [replaceDb, showToast],
  );

  const resetToSeed = useCallback(async () => {
    await repo.clear();
    const fresh = await repo.load();
    setDb(fresh);
    setUi((u) => ({ ...u, planDate: null, bakeDate: null }));
    showToast('Reset to seed data');
  }, [repo, showToast]);

  const value = useMemo<GelatoContextValue>(
    () => ({
      loaded,
      db,
      ui,
      setRole: (role) => setUi((u) => ({ ...u, role, tab: 'today' })),
      clearRole: () => setUi((u) => ({ ...u, role: null })),
      setTab: (tab) => setUi((u) => ({ ...u, tab })),
      setStockSub: (stockSub) => setUi((u) => ({ ...u, stockSub })),
      setFlavourSub: (flavourSub) => setUi((u) => ({ ...u, flavourSub })),
      setCountPhase: (countPhase) => setUi((u) => ({ ...u, countPhase })),
      setPlanDate: (planDate) => setUi((u) => ({ ...u, planDate })),
      setBakeDate: (bakeDate) => setUi((u) => ({ ...u, bakeDate })),
      showToast,
      patchDb,
      replaceDb,
      runGeneratePlans,
      importSnapshotText,
      resetToSeed,
    }),
    [
      loaded,
      db,
      ui,
      showToast,
      patchDb,
      replaceDb,
      runGeneratePlans,
      importSnapshotText,
      resetToSeed,
    ],
  );

  return <GelatoContext.Provider value={value}>{children}</GelatoContext.Provider>;
}

export function useGelato(): GelatoContextValue {
  const ctx = useContext(GelatoContext);
  if (!ctx) throw new Error('useGelato must be used within GelatoProvider');
  return ctx;
}
