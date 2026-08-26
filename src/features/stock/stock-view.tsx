'use client';

import { useMemo, useState } from 'react';
import { useGelato } from '@/components/gelato-provider';
import { Badge, Btn, Card, CardTitle, Empty, PageHead, Stepper } from '@/components/ui';
import { uid } from '@/domain/constants';
import { alpha, todayISO } from '@/domain/format';
import { stockStatusColor, stockTotal } from '@/domain/stock';
import type { ExpiryAlert, StockEntry } from '@/domain/types';

export function StockView() {
  const { db, ui, setStockSub, setCountPhase, patchDb, showToast } = useGelato();
  const [draft, setDraft] = useState<Record<string, number>>({});
  const flavours = useMemo(
    () => (db ? alpha(db.flavours.filter((f) => f.active)) : []),
    [db],
  );

  async function commitCount() {
    if (!db) return;
    const stock = { ...db.stock };
    const history = [...db['stock-history']];
    for (const f of flavours) {
      const key = `${f.id}:${ui.countPhase}`;
      if (draft[key] == null) continue;
      const prev = stock[f.id] || { neg20: 0, neg14: 0, bladders: 0, updatedAt: '' };
      const after: StockEntry = {
        ...prev,
        [ui.countPhase]: draft[key]!,
        updatedAt: new Date().toISOString(),
      };
      stock[f.id] = after;
      history.push({ at: new Date().toISOString(), kind: 'count', flavourId: f.id, after });
    }
    await patchDb('stock', stock);
    await patchDb('stock-history', history);
    setDraft({});
    showToast('Count saved');
  }

  async function commitDelivery() {
    if (!db) return;
    const stock = { ...db.stock };
    const history = [...db['stock-history']];
    for (const f of flavours) {
      const key = `${f.id}:bladders`;
      if (draft[key] == null) continue;
      const prev = stock[f.id] || { neg20: 0, neg14: 0, bladders: 0, updatedAt: '' };
      const after: StockEntry = {
        ...prev,
        bladders: draft[key]!,
        updatedAt: new Date().toISOString(),
      };
      stock[f.id] = after;
      history.push({ at: new Date().toISOString(), kind: 'delivery', flavourId: f.id, after });
    }
    await patchDb('stock', stock);
    await patchDb('stock-history', history);
    setDraft({});
    showToast('Delivery saved');
  }

  async function addAlert(flavourId: string) {
    if (!db) return;
    const alert: ExpiryAlert = {
      id: uid('al'),
      flavourId,
      urgency: 'today',
      bladderCount: 1,
      note: '',
      createdAt: new Date().toISOString(),
    };
    await patchDb('expiry-alerts', [...db['expiry-alerts'], alert]);
    showToast('Alert added');
  }

  async function resolveAlert(id: string) {
    if (!db) return;
    const next = db['expiry-alerts'].map((a) =>
      a.id === id ? { ...a, resolved: true, resolvedAt: new Date().toISOString() } : a,
    );
    await patchDb('expiry-alerts', next);
    showToast('Alert resolved');
  }

  if (!db) return null;

  const subs = [
    { id: 'count' as const, label: 'Count' },
    { id: 'delivery' as const, label: 'Delivery' },
    { id: 'alerts' as const, label: 'Alerts' },
  ];

  return (
    <div>
      <PageHead title="Stock" sub={`Updated locally · ${todayISO()}`} />
      <div className="mb-3 flex gap-2">
        {subs.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStockSub(s.id)}
            className={`border px-3 py-1.5 text-[12px] font-semibold ${
              ui.stockSub === s.id ? 'border-accent bg-accent text-accent-on' : 'border-line bg-bg-surface'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {ui.stockSub === 'count' ? (
        <Card>
          <CardTitle
            action={
              <div className="flex gap-1">
                {(['neg20', 'neg14'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setCountPhase(p)}
                    className={`border px-2 py-1 text-[11px] font-semibold ${
                      ui.countPhase === p ? 'border-accent bg-accent/15' : 'border-line'
                    }`}
                  >
                    {p === 'neg20' ? '−20' : '−14'}
                  </button>
                ))}
              </div>
            }
          >
            Freezer count
          </CardTitle>
          <ul className="max-h-[55vh] space-y-2 overflow-auto">
            {flavours.map((f) => {
              const entry = db.stock[f.id];
              const current = entry?.[ui.countPhase] ?? 0;
              const key = `${f.id}:${ui.countPhase}`;
              const value = draft[key] ?? current;
              const tone = stockStatusColor(db, f);
              return (
                <li key={f.id} className="flex items-center justify-between gap-2 border border-line bg-bg px-2 py-2">
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-semibold">{f.name}</div>
                    <div className="text-[11px] text-fg-muted">
                      total {stockTotal(db, f.id)} · <Badge tone={tone}>{tone}</Badge>
                    </div>
                  </div>
                  <Stepper
                    value={value}
                    step={0.25}
                    onChange={(n) => setDraft((d) => ({ ...d, [key]: n }))}
                  />
                </li>
              );
            })}
          </ul>
          <Btn className="mt-3 w-full" onClick={() => void commitCount()}>
            Save count
          </Btn>
        </Card>
      ) : null}

      {ui.stockSub === 'delivery' ? (
        <Card>
          <CardTitle>Bladder delivery</CardTitle>
          <ul className="max-h-[55vh] space-y-2 overflow-auto">
            {flavours.map((f) => {
              const current = db.stock[f.id]?.bladders ?? 0;
              const key = `${f.id}:bladders`;
              const value = draft[key] ?? current;
              return (
                <li key={f.id} className="flex items-center justify-between gap-2 border border-line bg-bg px-2 py-2">
                  <div className="truncate text-[13px] font-semibold">{f.name}</div>
                  <Stepper value={value} onChange={(n) => setDraft((d) => ({ ...d, [key]: n }))} />
                </li>
              );
            })}
          </ul>
          <Btn className="mt-3 w-full" onClick={() => void commitDelivery()}>
            Save delivery
          </Btn>
        </Card>
      ) : null}

      {ui.stockSub === 'alerts' ? (
        <Card>
          <CardTitle>Expiry / use-today</CardTitle>
          {db['expiry-alerts'].filter((a) => !a.resolved).length === 0 ? (
            <Empty title="No open alerts" body="Flag flavours that must be used soon." />
          ) : (
            <ul className="mb-3 space-y-2">
              {db['expiry-alerts']
                .filter((a) => !a.resolved)
                .map((a) => {
                  const f = db.flavours.find((x) => x.id === a.flavourId);
                  return (
                    <li key={a.id} className="flex items-center justify-between border border-line bg-bg px-3 py-2">
                      <div>
                        <div className="font-semibold">{f?.name}</div>
                        <div className="text-[12px] text-fg-muted">
                          {a.urgency} · {a.bladderCount} bladder(s)
                        </div>
                      </div>
                      <Btn variant="secondary" onClick={() => void resolveAlert(a.id)}>
                        Resolve
                      </Btn>
                    </li>
                  );
                })}
            </ul>
          )}
          <div className="space-y-2">
            <div className="text-[12px] font-semibold text-fg-muted">Quick add</div>
            <div className="flex flex-wrap gap-2">
              {flavours.slice(0, 12).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => void addAlert(f.id)}
                  className="border border-line px-2 py-1 text-[12px]"
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
