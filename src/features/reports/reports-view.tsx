'use client';

import { useMemo } from 'react';
import { useGelato } from '@/components/gelato-provider';
import { Badge, Card, CardTitle, Empty, PageHead } from '@/components/ui';
import { buildCandidates } from '@/domain/engine';
import { fmtPots } from '@/domain/format';
import { stockTotal } from '@/domain/stock';

export function ReportsView() {
  const { db } = useGelato();
  if (!db) return null;

  const candidates = useMemo(() => buildCandidates(db), [db]);
  const history = db['stock-history'].slice(-20).reverse();
  const lowFrequent = useMemo(() => {
    return db.flavours
      .filter((f) => f.active)
      .map((f) => ({ f, total: stockTotal(db, f.id), gap: f.par - stockTotal(db, f.id) }))
      .filter((x) => x.gap > 0)
      .sort((a, b) => b.gap - a.gap)
      .slice(0, 10);
  }, [db]);

  return (
    <div>
      <PageHead title="Reports" sub="Local snapshot — API reporting later" />

      <Card>
        <CardTitle>Priority pressure</CardTitle>
        {candidates.length === 0 ? (
          <Empty title="Quiet floor" body="Nothing currently below thresholds." />
        ) : (
          <ul className="space-y-1.5 text-[13px]">
            {candidates.slice(0, 10).map((c) => {
              const f = db.flavours.find((x) => x.id === c.flavourId);
              return (
                <li key={c.flavourId} className="flex justify-between gap-2">
                  <span>{f?.name}</span>
                  <Badge tone={c.tier <= 2 ? 'red' : 'amber'}>T{c.tier}</Badge>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card>
        <CardTitle>Below PAR</CardTitle>
        {lowFrequent.length === 0 ? (
          <Empty title="On target" body="All active flavours meet PAR." />
        ) : (
          <ul className="space-y-1.5 text-[13px]">
            {lowFrequent.map(({ f, total, gap }) => (
              <li key={f.id} className="flex justify-between">
                <span>{f.name}</span>
                <span className="mono text-fg-muted">
                  {fmtPots(total)} / {f.par} (−{gap})
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <CardTitle>Recent stock events</CardTitle>
        {history.length === 0 ? (
          <Empty title="No history yet" body="Counts and deliveries will appear here." />
        ) : (
          <ul className="space-y-1.5 text-[12px]">
            {history.map((h, i) => {
              const f = db.flavours.find((x) => x.id === h.flavourId);
              return (
                <li key={`${h.at}-${i}`} className="flex justify-between border-b border-line py-1">
                  <span>
                    <Badge tone="neutral">{h.kind}</Badge> {f?.name}
                  </span>
                  <span className="mono text-fg-muted">{new Date(h.at).toLocaleString('en-AU')}</span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
