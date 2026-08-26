import { DEFAULT_GROUPS } from './constants';
import { fmtNum, fmtPots, nextChurnDates, shiftMinutesFor } from './format';
import { activeAlertsFor, stockTotal } from './stock';
import type {
  AllocateResult,
  BakingItem,
  Candidate,
  GelatoDb,
  PlanLine,
  ProductionPlan,
  SequenceStep,
  WashGroup,
} from './types';

export function getGroups(db: GelatoDb): WashGroup[] {
  return db['wash-config']?.groups?.length ? db['wash-config'].groups : DEFAULT_GROUPS;
}

export function groupOrderIds(db: GelatoDb): string[] {
  return getGroups(db).map((g) => g.id);
}

export function groupInfo(db: GelatoDb, id: string): WashGroup {
  return getGroups(db).find((g) => g.id === id) || getGroups(db)[0] || { id: '?', name: 'Unknown', color: '#ccc' };
}

export function buildCandidates(db: GelatoDb): Candidate[] {
  const candidates: Candidate[] = [];
  db.flavours
    .filter((f) => f.active)
    .forEach((f) => {
      const total = stockTotal(db, f.id);
      const bladders = db.stock[f.id]?.bladders || 0;
      const alerts = activeAlertsFor(db, f.id);
      const useToday = alerts.find((a) => a.urgency === 'today');
      let tier: number | null = null;
      let reason = '';
      let targetPots: number | null = null;
      let forcedBladders: number | null = null;

      if (useToday) {
        tier = 1;
        reason = `Urgent: manually flagged to use today (${useToday.bladderCount} bladder${useToday.bladderCount === 1 ? '' : 's'})`;
        forcedBladders = useToday.bladderCount;
      } else if (total <= 0) {
        tier = 2;
        reason = 'Critical: 0 pots in stock';
        targetPots = Math.max(f.par, 1);
      } else if (total <= 1) {
        tier = 3;
        reason = `Low stock: ${fmtPots(total)} remaining`;
        targetPots = f.par;
      } else if (f.popular && total < 2) {
        tier = 4;
        reason = `Popular flavour: ${fmtNum(total)} of 2 target pots available`;
        targetPots = Math.max(2, f.par);
      } else if (total < f.par) {
        tier = 5;
        reason = `Below PAR: ${fmtNum(total)} pots, target is ${fmtNum(f.par)}`;
        targetPots = f.par;
      }
      if (tier === null) return;

      let bladdersNeeded: number;
      if (forcedBladders != null) {
        bladdersNeeded = Math.min(forcedBladders, bladders);
      } else {
        const potsNeeded = Math.max(0, (targetPots ?? 0) - total);
        bladdersNeeded = Math.ceil(potsNeeded / f.yieldPotsPerBladder);
        bladdersNeeded = Math.min(bladdersNeeded, bladders);
      }
      const blocked = bladdersNeeded <= 0 && bladders <= 0;
      const severity = tier === 5 ? f.par - total : tier === 1 ? 99 : 0;
      candidates.push({
        flavourId: f.id,
        tier,
        reason,
        severity,
        bladdersNeeded,
        bladdersAvailable: bladders,
        blocked,
        currentPots: total,
        watchAlert: alerts.find((a) => a.urgency === 'next'),
      });
    });
  candidates.sort((a, b) => a.tier - b.tier || b.severity - a.severity);
  return candidates;
}

export function estimateWashMinutes(
  db: GelatoDb,
  selection: Array<{ flavourId: string; bladdersNeeded: number }>,
): number {
  if (selection.length === 0) return 0;
  const byFlavour = (id: string) => db.flavours.find((f) => f.id === id);
  let washes = 0;
  let lastGroup: string | null = null;
  selection.forEach((s) => {
    const f = byFlavour(s.flavourId);
    if (!f) return;
    if (lastGroup && lastGroup !== f.group) {
      const rule = db['wash-config'].specialRule;
      if (rule && lastGroup === rule.fromGroup && f.group === rule.toGroup) {
        const coffeeInSelection = selection.some((x) => x.flavourId === rule.flavourId);
        if (coffeeInSelection) washes++;
      } else {
        washes++;
      }
    }
    if (f.washAlwaysAfter) washes++;
    lastGroup = f.group;
  });
  return washes * db['shift-settings'].washMin;
}

export function allocateForDate(
  db: GelatoDb,
  dateISO: string,
  candidates: Candidate[],
  excludeIds: Set<string>,
): AllocateResult {
  const settings = db['shift-settings'];
  const shiftMin = shiftMinutesFor(settings, dateISO);
  const available = Math.max(0, shiftMin - settings.setupMin - settings.cleanMin);
  const byFlavour = (id: string) => db.flavours.find((f) => f.id === id);
  const chosen: Candidate[] = [];
  const leftover: Candidate[] = [];
  let prodMinutes = 0;

  candidates.forEach((c) => {
    if (excludeIds.has(c.flavourId)) return;
    if (c.blocked || c.bladdersNeeded <= 0) {
      leftover.push(c);
      return;
    }
    const f = byFlavour(c.flavourId);
    if (!f) {
      leftover.push(c);
      return;
    }
    const thisTime = c.bladdersNeeded * (f.prodTimeMinPerBladder || settings.defaultProdMinPerBladder);
    const trialWash = estimateWashMinutes(db, [...chosen, c]);
    const projected = prodMinutes + thisTime + trialWash;
    if (projected <= available || chosen.length === 0) {
      chosen.push(c);
      prodMinutes += thisTime;
      excludeIds.add(c.flavourId);
    } else {
      leftover.push(c);
    }
  });

  const washMinutes = estimateWashMinutes(db, chosen);
  const planned = prodMinutes + washMinutes;
  return {
    date: dateISO,
    chosen,
    leftover,
    summary: {
      shiftMin,
      setupMin: settings.setupMin,
      cleanMin: settings.cleanMin,
      available,
      prodMinutes,
      washMinutes,
      planned,
      spare: available - planned,
      overbooked: planned > available,
    },
  };
}

export function generatePlans(db: GelatoDb): { db: GelatoDb; dates: [string, string] } {
  const [d0, d1] = nextChurnDates(db['shift-settings'], 2);
  if (!d0 || !d1) throw new Error('No churn shifts configured');
  const candidates = buildCandidates(db);
  const excludeIds = new Set<string>();
  const plan0 = allocateForDate(db, d0, candidates, excludeIds);
  const plan1 = allocateForDate(db, d1, plan0.leftover, excludeIds);
  const existing0 = db['production-plans'][d0];
  const existing1 = db['production-plans'][d1];

  const mk = (alloc: AllocateResult, existing: ProductionPlan | undefined): ProductionPlan => ({
    date: alloc.date,
    recommended: alloc.chosen.map(
      (c): PlanLine => ({
        flavourId: c.flavourId,
        bladders: c.bladdersNeeded,
        reason: c.reason,
        tier: c.tier,
      }),
    ),
    approved: alloc.chosen.map(
      (c): PlanLine => ({
        flavourId: c.flavourId,
        bladders: c.bladdersNeeded,
        note: '',
      }),
    ),
    completed: (existing && existing.completed) || {},
    bakingCompleted: (existing && existing.bakingCompleted) || {},
    blocked: alloc.leftover
      .filter((c) => c.blocked)
      .map((c) => ({ flavourId: c.flavourId, reason: c.reason, tier: c.tier })),
    summary: alloc.summary,
    generatedAt: new Date().toISOString(),
  });

  const next: GelatoDb = {
    ...db,
    'production-plans': {
      ...db['production-plans'],
      [d0]: mk(plan0, existing0),
      [d1]: mk(plan1, existing1),
    },
  };
  return { db: next, dates: [d0, d1] };
}

export function getOrInitPlan(db: GelatoDb, dateISO: string): ProductionPlan | null {
  return db['production-plans'][dateISO] || null;
}

export function getBakingItems(db: GelatoDb, plan: ProductionPlan | null): BakingItem[] {
  if (!plan) return [];
  const items: BakingItem[] = [];
  plan.approved.forEach((a) => {
    const f = db.flavours.find((x) => x.id === a.flavourId);
    if (!f || !f.components) return;
    f.components
      .filter((c) => c.needsBaking)
      .forEach((c) => {
        items.push({
          flavourId: f.id,
          flavourName: f.name,
          group: f.group,
          componentId: c.id,
          name: c.name,
          key: `${f.id}_${c.id}`,
        });
      });
  });
  return items;
}

export function bakingKey(flavourId: string, componentId: string): string {
  return `${flavourId}_${componentId}`;
}

export function buildSequence(db: GelatoDb, approvedList: PlanLine[]): SequenceStep[] {
  const byFlavour = (id: string) => db.flavours.find((f) => f.id === id);
  const items = approvedList
    .map((a) => ({ ...a, f: byFlavour(a.flavourId) }))
    .filter((x): x is typeof x & { f: NonNullable<typeof x.f> } => Boolean(x.f));
  const byGroup: Record<string, typeof items> = {};
  items.forEach((it) => {
    (byGroup[it.f.group] = byGroup[it.f.group] || []).push(it);
  });
  Object.values(byGroup).forEach((arr) => arr.sort((a, b) => a.f.groupOrder - b.f.groupOrder));
  const groupsPresent = groupOrderIds(db).filter((g) => byGroup[g]?.length);
  const seq: SequenceStep[] = [];
  groupsPresent.forEach((g, gi) => {
    byGroup[g]!.forEach((it) => {
      seq.push({ type: 'flavour', flavourId: it.flavourId, bladders: it.bladders, group: g });
      if (it.f.washAlwaysAfter) {
        seq.push({ type: 'wash', reason: `${it.f.name} always requires a wash after`, group: g });
      }
    });
    const nextGroup = groupsPresent[gi + 1];
    if (nextGroup) {
      const rule = db['wash-config'].specialRule;
      let needWash = true;
      if (rule && g === rule.fromGroup && nextGroup === rule.toGroup) {
        needWash = byGroup[g]!.some((it) => it.flavourId === rule.flavourId);
      }
      if (needWash) {
        seq.push({ type: 'wash', reason: `Moving from Group ${g} to Group ${nextGroup}`, group: g });
      }
    }
  });
  return seq;
}
