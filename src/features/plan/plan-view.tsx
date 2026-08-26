'use client';

import { useEffect } from 'react';
import { useGelato } from '@/components/gelato-provider';
import { Badge, Btn, Card, CardTitle, Empty, PageHead, Stepper } from '@/components/ui';
import { getOrInitPlan, groupInfo } from '@/domain/engine';
import { fmtDate, nextChurnDates } from '@/domain/format';
import type { ProductionPlan } from '@/domain/types';

export function PlanView() {
  const { db, ui, setPlanDate, patchDb, runGeneratePlans, showToast } = useGelato();
  const dates = db ? nextChurnDates(db['shift-settings'], 2) : [];
  const planDate = ui.planDate && dates.includes(ui.planDate) ? ui.planDate : dates[0] ?? null;
  const plan = db && planDate ? getOrInitPlan(db, planDate) : null;

  useEffect(() => {
    if (planDate && ui.planDate !== planDate) setPlanDate(planDate);
  }, [planDate, ui.planDate, setPlanDate]);

  async function updateApproved(next: ProductionPlan) {
    if (!db || !planDate) return;
    const plans = { ...db['production-plans'], [next.date]: next };
    await patchDb('production-plans', plans);
  }

  if (!db) return null;

  return (
    <div>
      <PageHead title="Production plan" sub="Approve what the churner will run" />
      <div className="mb-3 flex gap-2">
        {dates.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setPlanDate(d)}
            className={`border px-3 py-1.5 text-[12px] font-semibold ${
              d === planDate ? 'border-accent bg-accent text-accent-on' : 'border-line bg-bg-surface'
            }`}
          >
            {fmtDate(d)}
          </button>
        ))}
        <Btn variant="secondary" className="ml-auto" onClick={() => void runGeneratePlans()}>
          Regenerate
        </Btn>
      </div>

      {!plan ? (
        <Empty title="No plan" body="Generate plans from Today or Regenerate." />
      ) : (
        <>
          <Card>
            <CardTitle>Shift capacity</CardTitle>
            <div className="grid grid-cols-2 gap-2 text-[12px]">
              <div>
                Available <span className="mono font-semibold">{plan.summary.available}m</span>
              </div>
              <div>
                Planned <span className="mono font-semibold">{plan.summary.planned}m</span>
              </div>
              <div>
                Wash <span className="mono font-semibold">{plan.summary.washMinutes}m</span>
              </div>
              <div>
                Spare{' '}
                <Badge tone={plan.summary.overbooked ? 'red' : 'green'}>
                  {plan.summary.spare}m
                </Badge>
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle>Approved list</CardTitle>
            {plan.approved.length === 0 ? (
              <Empty title="Empty" body="Nothing allocated for this shift." />
            ) : (
              <ul className="space-y-2">
                {plan.approved.map((line, idx) => {
                  const f = db.flavours.find((x) => x.id === line.flavourId);
                  const g = f ? groupInfo(db, f.group) : null;
                  const rec = plan.recommended.find((r) => r.flavourId === line.flavourId);
                  return (
                    <li key={line.flavourId} className="border border-line bg-bg px-3 py-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 font-semibold">
                            {g ? <span className="h-2.5 w-2.5" style={{ background: g.color }} /> : null}
                            {f?.name}
                          </div>
                          {rec?.reason ? (
                            <div className="mt-1 text-[12px] text-fg-muted">{rec.reason}</div>
                          ) : null}
                        </div>
                        <Stepper
                          value={line.bladders}
                          min={0}
                          onChange={(n) => {
                            const approved = plan.approved.map((a, i) =>
                              i === idx ? { ...a, bladders: n } : a,
                            );
                            void updateApproved({ ...plan, approved }).then(() =>
                              showToast('Plan updated'),
                            );
                          }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          {plan.blocked.length > 0 ? (
            <Card>
              <CardTitle>Blocked (no bladders)</CardTitle>
              <ul className="space-y-1 text-[13px]">
                {plan.blocked.map((b) => {
                  const f = db.flavours.find((x) => x.id === b.flavourId);
                  return (
                    <li key={b.flavourId} className="flex justify-between">
                      <span>{f?.name}</span>
                      <Badge tone="red">T{b.tier}</Badge>
                    </li>
                  );
                })}
              </ul>
            </Card>
          ) : null}
        </>
      )}
    </div>
  );
}
