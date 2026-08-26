'use client';

import { useGelato } from '@/components/gelato-provider';
import { Badge, Btn, Card, CardTitle, Empty, PageHead } from '@/components/ui';
import { buildCandidates, getGroups, getOrInitPlan, groupInfo } from '@/domain/engine';
import { fmtDate, fmtPots, nextChurnDates, todayISO } from '@/domain/format';
import { activeAlertsFor, stockStatusColor, stockTotal } from '@/domain/stock';

export function TodayView() {
  const { db, ui, setTab, runGeneratePlans } = useGelato();
  if (!db) return null;

  const dates = nextChurnDates(db['shift-settings'], 2);
  const plan = dates[0] ? getOrInitPlan(db, dates[0]) : null;
  const candidates = buildCandidates(db).slice(0, 6);
  const urgent = db['expiry-alerts'].filter((a) => !a.resolved && a.urgency === 'today');
  const low = db.flavours.filter((f) => f.active && stockStatusColor(db, f) !== 'green').slice(0, 8);

  return (
    <div>
      <PageHead title="Today" sub={fmtDate(todayISO())} />

      <Card>
        <CardTitle>Next churn</CardTitle>
        {dates.length === 0 ? (
          <Empty title="No shifts" body="Configure shift days before planning." />
        ) : (
          <div className="space-y-2">
            {dates.map((d) => {
              const p = getOrInitPlan(db, d);
              return (
                <div key={d} className="flex items-center justify-between border border-line bg-bg px-3 py-2">
                  <div>
                    <div className="font-semibold">{fmtDate(d)}</div>
                    <div className="text-[12px] text-fg-muted">
                      {p
                        ? `${p.approved.length} flavours · ${p.summary.planned} min planned`
                        : 'No plan yet'}
                    </div>
                  </div>
                  <Badge tone={p ? 'green' : 'amber'}>{p ? 'Ready' : 'Needed'}</Badge>
                </div>
              );
            })}
            {ui.role === 'manager' ? (
              <Btn className="mt-2 w-full" onClick={() => void runGeneratePlans()}>
                Generate / refresh plans
              </Btn>
            ) : null}
          </div>
        )}
      </Card>

      {urgent.length > 0 ? (
        <Card>
          <CardTitle>Use today</CardTitle>
          <ul className="space-y-2">
            {urgent.map((a) => {
              const f = db.flavours.find((x) => x.id === a.flavourId);
              return (
                <li key={a.id} className="flex justify-between text-[13px]">
                  <span>{f?.name ?? a.flavourId}</span>
                  <Badge tone="red">{a.bladderCount} bladder(s)</Badge>
                </li>
              );
            })}
          </ul>
        </Card>
      ) : null}

      <Card>
        <CardTitle
          action={
            ui.role === 'manager' ? (
              <button type="button" className="text-[12px] text-accent-strong" onClick={() => setTab('plan')}>
                Open plan
              </button>
            ) : null
          }
        >
          Priority queue
        </CardTitle>
        {candidates.length === 0 ? (
          <Empty title="All clear" body="Nothing below PAR or flagged right now." />
        ) : (
          <ul className="space-y-2">
            {candidates.map((c) => {
              const f = db.flavours.find((x) => x.id === c.flavourId);
              const g = f ? groupInfo(db, f.group) : null;
              return (
                <li key={c.flavourId} className="border border-line bg-bg px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {g ? (
                        <span className="h-2.5 w-2.5" style={{ background: g.color }} title={g.name} />
                      ) : null}
                      <span className="font-semibold">{f?.name}</span>
                    </div>
                    <Badge tone={c.blocked ? 'red' : c.tier <= 2 ? 'red' : 'amber'}>T{c.tier}</Badge>
                  </div>
                  <div className="mt-1 text-[12px] text-fg-muted">{c.reason}</div>
                  <div className="mono mt-1 text-[11px] text-fg-muted">
                    need {c.bladdersNeeded} · have {c.bladdersAvailable} · {fmtPots(c.currentPots)}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card>
        <CardTitle>Stock attention</CardTitle>
        {low.length === 0 ? (
          <Empty title="Healthy" body="Active flavours are at or above PAR." />
        ) : (
          <ul className="space-y-1.5">
            {low.map((f) => {
              const tone = stockStatusColor(db, f);
              const alerts = activeAlertsFor(db, f.id);
              return (
                <li key={f.id} className="flex items-center justify-between text-[13px]">
                  <span>{f.name}</span>
                  <div className="flex items-center gap-2">
                    {alerts.length ? <Badge tone="red">alert</Badge> : null}
                    <Badge tone={tone}>{fmtPots(stockTotal(db, f.id))}</Badge>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {plan ? (
        <Card>
          <CardTitle>Groups on deck</CardTitle>
          <div className="flex flex-wrap gap-2">
            {getGroups(db)
              .filter((g) => plan.approved.some((a) => db.flavours.find((f) => f.id === a.flavourId)?.group === g.id))
              .map((g) => (
                <span
                  key={g.id}
                  className="inline-flex items-center gap-1.5 border border-line px-2 py-1 text-[12px] font-semibold"
                >
                  <span className="h-2 w-2" style={{ background: g.color }} />
                  {g.name}
                </span>
              ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
