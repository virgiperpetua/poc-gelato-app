'use client';

import { useMemo, useState } from 'react';
import { useGelato } from '@/components/gelato-provider';
import { Badge, Card, CardTitle, Empty, PageHead } from '@/components/ui';
import { getGroups, groupInfo } from '@/domain/engine';
import { alpha } from '@/domain/format';
import type { Flavour, GelatoDb } from '@/domain/types';
import { FlavourEditPanel } from './flavour-edit-panel';

function FlavourRow({
  db,
  f,
  editing,
  onToggle,
  onSave,
  onCancel,
}: {
  db: GelatoDb;
  f: Flavour;
  editing: boolean;
  onToggle: () => void;
  onSave: (flavour: Flavour) => Promise<void>;
  onCancel: () => void;
}) {
  const g = groupInfo(db, f.group);
  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        className={`w-full border px-3 py-2 text-left transition-colors ${
          editing ? 'border-accent bg-accent/10' : 'border-line bg-bg hover:bg-bg-surface'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-semibold">
            <span className="h-2.5 w-2.5" style={{ background: g.color }} />
            {f.name}
          </div>
          <div className="flex gap-1">
            {f.popular ? <Badge tone="accent">Popular</Badge> : null}
            {f.isSpecial ? <Badge tone="amber">Special</Badge> : null}
            {!f.active ? <Badge tone="neutral">Inactive</Badge> : null}
          </div>
        </div>
        <div className="mono mt-1 text-[11px] text-fg-muted">
          {g.name} · PAR {f.par} · yield {f.yieldPotsPerBladder}/bladder
        </div>
        {f.allergenNotes ? (
          <div className="mt-1 text-[12px] text-fg-muted">{f.allergenNotes}</div>
        ) : null}
      </button>
      {editing ? (
        <FlavourEditPanel db={db} flavourId={f.id} onCancel={onCancel} onSave={onSave} />
      ) : null}
    </li>
  );
}

export function FlavoursView() {
  const { db, ui, setFlavourSub, patchDb, showToast } = useGelato();
  const [editingId, setEditingId] = useState<string | null>(null);
  const list = useMemo(() => alpha(db?.flavours ?? []), [db?.flavours]);
  if (!db) return null;

  const data = db;
  const specials = list.filter((f) => f.isSpecial && f.active);
  const groups = getGroups(data);

  const subs = [
    { id: 'list' as const, label: 'All' },
    { id: 'specials' as const, label: 'Specials' },
    { id: 'groups' as const, label: 'Groups' },
  ];

  async function saveFlavour(updated: Flavour) {
    const flavours = data.flavours.map((f) => (f.id === updated.id ? updated : f));
    await patchDb('flavours', flavours);
    setEditingId(null);
    showToast('Flavour saved');
  }

  return (
    <div>
      <PageHead title="Flavours" sub="Catalogue, specials, and wash groups" />
      <div className="mb-3 flex gap-2">
        {subs.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              setFlavourSub(s.id);
              setEditingId(null);
            }}
            className={`border px-3 py-1.5 text-[12px] font-semibold ${
              ui.flavourSub === s.id ? 'border-accent bg-accent text-accent-on' : 'border-line bg-bg-surface'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {ui.flavourSub === 'list' ? (
        <Card>
          <CardTitle>{list.length} flavours</CardTitle>
          <p className="mb-2 text-[12px] text-fg-muted">Tap a flavour to edit.</p>
          <ul className="max-h-[60vh] space-y-2 overflow-auto">
            {list.map((f) => (
              <FlavourRow
                key={f.id}
                db={data}
                f={f}
                editing={editingId === f.id}
                onToggle={() => setEditingId(editingId === f.id ? null : f.id)}
                onSave={saveFlavour}
                onCancel={() => setEditingId(null)}
              />
            ))}
          </ul>
        </Card>
      ) : null}

      {ui.flavourSub === 'specials' ? (
        <Card>
          <CardTitle>This month</CardTitle>
          {specials.length === 0 ? (
            <Empty title="No specials" body="Mark flavours as specials when the month changes." />
          ) : (
            <ul className="space-y-2">
              {specials.map((f) => (
                <FlavourRow
                  key={f.id}
                  db={data}
                  f={f}
                  editing={editingId === f.id}
                  onToggle={() => setEditingId(editingId === f.id ? null : f.id)}
                  onSave={saveFlavour}
                  onCancel={() => setEditingId(null)}
                />
              ))}
            </ul>
          )}
        </Card>
      ) : null}

      {ui.flavourSub === 'groups' ? (
        <Card>
          <CardTitle>Wash groups</CardTitle>
          <ul className="space-y-2">
            {groups.map((g) => {
              const count = data.flavours.filter((f) => f.group === g.id && f.active).length;
              return (
                <li key={g.id} className="flex items-center justify-between border border-line bg-bg px-3 py-2">
                  <div className="flex items-center gap-2 font-semibold">
                    <span className="h-3 w-3" style={{ background: g.color }} />
                    {g.name}
                  </div>
                  <span className="mono text-[12px] text-fg-muted">{count}</span>
                </li>
              );
            })}
          </ul>
          {data['wash-config'].specialRule ? (
            <p className="mt-3 text-[12px] text-fg-muted">
              Special rule: {data['wash-config'].specialRule.label}
            </p>
          ) : null}
        </Card>
      ) : null}
    </div>
  );
}
