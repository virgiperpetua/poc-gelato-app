'use client';

import { useMemo, useState } from 'react';
import { useGelato } from '@/components/gelato-provider';
import { Badge, Card, CardTitle, Empty, PageHead } from '@/components/ui';
import { IconCheck } from '@/components/icons';
import { buildSequence, getOrInitPlan, groupInfo } from '@/domain/engine';
import { fmtDate, nextChurnDates } from '@/domain/format';

export function WorkflowView() {
  const { db, patchDb, showToast } = useGelato();
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const date = db ? (nextChurnDates(db['shift-settings'], 1)[0] ?? null) : null;
  const plan = db && date ? getOrInitPlan(db, date) : null;
  const seq = useMemo(() => (db && plan ? buildSequence(db, plan.approved) : []), [db, plan]);

  async function toggleStep(key: string, done: boolean) {
    if (!db || !plan || !date) return;
    const completed = { ...plan.completed, [key]: done };
    await patchDb('production-plans', {
      ...db['production-plans'],
      [date]: { ...plan, completed },
    });
    setChecks((c) => ({ ...c, [key]: done }));
    showToast(done ? 'Step done' : 'Step reopened');
  }

  if (!db) return null;

  return (
    <div>
      <PageHead title="Churn" sub={date ? fmtDate(date) : 'No shift'} />
      {!plan ? (
        <Empty title="No plan" body="Ask a manager to generate today’s plan." />
      ) : seq.length === 0 ? (
        <Empty title="Nothing to churn" body="Approved list is empty." />
      ) : (
        <Card>
          <CardTitle>Wash-safe sequence</CardTitle>
          <ol className="space-y-2">
            {seq.map((step, i) => {
              if (step.type === 'wash') {
                return (
                  <li key={`wash-${i}`} className="border border-line bg-[var(--gelato-amber-soft)] px-3 py-3">
                    <div className="text-[11px] font-bold uppercase tracking-wide text-[var(--gelato-amber)]">
                      Wash
                    </div>
                    <div className="mt-1 text-[13px] font-semibold">{step.reason}</div>
                  </li>
                );
              }
              const f = db.flavours.find((x) => x.id === step.flavourId);
              const g = f ? groupInfo(db, f.group) : null;
              const key = `flavour:${step.flavourId}`;
              const done = Boolean(plan.completed[key] ?? checks[key]);
              return (
                <li key={key} className="flex items-start gap-3 border border-line bg-bg px-3 py-3">
                  <button
                    type="button"
                    onClick={() => void toggleStep(key, !done)}
                    className={`mt-0.5 flex h-6 w-6 items-center justify-center border ${
                      done ? 'border-accent bg-accent text-accent-on' : 'border-line bg-bg-surface'
                    }`}
                    aria-pressed={done}
                  >
                    {done ? <IconCheck size={14} /> : null}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {g ? <span className="h-2.5 w-2.5" style={{ background: g.color }} /> : null}
                      <span className={`font-semibold ${done ? 'line-through opacity-60' : ''}`}>
                        {f?.name}
                      </span>
                      <Badge tone="neutral">{step.bladders} bladder(s)</Badge>
                    </div>
                    {f?.allergenNotes ? (
                      <div className="mt-1 text-[12px] text-fg-muted">{f.allergenNotes}</div>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </Card>
      )}
    </div>
  );
}
