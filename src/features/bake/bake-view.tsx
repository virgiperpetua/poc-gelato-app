'use client';

import { useEffect } from 'react';
import { useGelato } from '@/components/gelato-provider';
import { Badge, Card, CardTitle, Empty, PageHead } from '@/components/ui';
import { IconCheck } from '@/components/icons';
import { getBakingItems, getOrInitPlan } from '@/domain/engine';
import { fmtDate, nextChurnDates } from '@/domain/format';

export function BakeView() {
  const { db, ui, setBakeDate, patchDb, showToast } = useGelato();
  const dates = db ? nextChurnDates(db['shift-settings'], 2) : [];
  const bakeDate = ui.bakeDate && dates.includes(ui.bakeDate) ? ui.bakeDate : dates[0] ?? null;
  const plan = db && bakeDate ? getOrInitPlan(db, bakeDate) : null;
  const items = db ? getBakingItems(db, plan) : [];

  useEffect(() => {
    if (bakeDate && ui.bakeDate !== bakeDate) setBakeDate(bakeDate);
  }, [bakeDate, ui.bakeDate, setBakeDate]);

  async function toggle(key: string, done: boolean) {
    if (!db || !plan || !bakeDate) return;
    const bakingCompleted = { ...plan.bakingCompleted, [key]: done };
    await patchDb('production-plans', {
      ...db['production-plans'],
      [bakeDate]: { ...plan, bakingCompleted },
    });
    showToast(done ? 'Baked' : 'Reopened');
  }

  if (!db) return null;

  return (
    <div>
      <PageHead title="Baking" sub="Prep components before churn starts" />
      <div className="mb-3 flex gap-2">
        {dates.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setBakeDate(d)}
            className={`border px-3 py-1.5 text-[12px] font-semibold ${
              d === bakeDate ? 'border-accent bg-accent text-accent-on' : 'border-line bg-bg-surface'
            }`}
          >
            {fmtDate(d)}
          </button>
        ))}
      </div>
      {!plan ? (
        <Empty title="No plan" body="Generate a production plan first." />
      ) : items.length === 0 ? (
        <Empty title="Nothing to bake" body="Approved flavours have no bake-ahead components." />
      ) : (
        <Card>
          <CardTitle>Bake list</CardTitle>
          <ul className="space-y-2">
            {items.map((item) => {
              const done = Boolean(plan.bakingCompleted[item.key]);
              return (
                <li key={item.key} className="flex items-start gap-3 border border-line bg-bg px-3 py-2">
                  <button
                    type="button"
                    onClick={() => void toggle(item.key, !done)}
                    className={`mt-0.5 flex h-6 w-6 items-center justify-center border ${
                      done ? 'border-accent bg-accent text-accent-on' : 'border-line'
                    }`}
                  >
                    {done ? <IconCheck size={14} /> : null}
                  </button>
                  <div>
                    <div className={`font-semibold ${done ? 'line-through opacity-60' : ''}`}>
                      {item.name}
                    </div>
                    <div className="mt-0.5 flex gap-2 text-[12px] text-fg-muted">
                      <span>{item.flavourName}</span>
                      <Badge tone="neutral">Group {item.group}</Badge>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
