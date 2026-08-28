'use client';

import { useEffect, useState } from 'react';
import { Btn, Card, CardTitle } from '@/components/ui';
import { uid } from '@/domain/constants';
import { getGroups } from '@/domain/engine';
import type { Flavour, FlavourComponent, GelatoDb } from '@/domain/types';

const fieldClass = 'w-full border border-line bg-bg px-2 py-1.5 text-[13px]';
const labelClass = 'block text-[12px] font-semibold text-fg-muted';

function cloneFlavour(flavour: Flavour): Flavour {
  return {
    ...flavour,
    components: flavour.components.map((c) => ({ ...c })),
  };
}

export function FlavourEditPanel({
  db,
  flavourId,
  onCancel,
  onSave,
}: {
  db: GelatoDb;
  flavourId: string;
  onCancel: () => void;
  onSave: (flavour: Flavour) => Promise<void>;
}) {
  const source = db.flavours.find((f) => f.id === flavourId);
  const [draft, setDraft] = useState<Flavour | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!source) {
      setDraft(null);
      return;
    }
    setDraft(cloneFlavour(source));
  }, [source]);

  if (!source || !draft) return null;

  const groups = getGroups(db);

  function patch(partial: Partial<Flavour>) {
    setDraft((prev) => (prev ? { ...prev, ...partial } : prev));
  }

  function patchComponent(index: number, partial: Partial<FlavourComponent>) {
    setDraft((prev) => {
      if (!prev) return prev;
      const components = prev.components.map((c, i) => (i === index ? { ...c, ...partial } : c));
      return { ...prev, components };
    });
  }

  function addComponent() {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        components: [...prev.components, { id: uid('cmp'), name: '', needsBaking: false }],
      };
    });
  }

  function removeComponent(index: number) {
    setDraft((prev) => {
      if (!prev) return prev;
      return { ...prev, components: prev.components.filter((_, i) => i !== index) };
    });
  }

  async function handleSave() {
    if (!draft) return;
    const name = draft.name.trim();
    if (!name) return;
    setSaving(true);
    try {
      await onSave({ ...draft, name });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="mb-3">
      <CardTitle
        action={
          <button type="button" className="text-[12px] font-semibold text-fg-muted" onClick={onCancel}>
            Close
          </button>
        }
      >
        Edit flavour
      </CardTitle>

      <div className="space-y-3">
        <label className="block">
          <span className={labelClass}>Name</span>
          <input
            className={fieldClass}
            value={draft.name}
            onChange={(e) => patch({ name: e.target.value })}
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className={labelClass}>Wash group</span>
            <select
              className={fieldClass}
              value={draft.group}
              onChange={(e) => patch({ group: e.target.value })}
            >
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={labelClass}>Order in group</span>
            <input
              type="number"
              min={1}
              className={fieldClass}
              value={draft.groupOrder}
              onChange={(e) => patch({ groupOrder: Number(e.target.value) || 1 })}
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className={labelClass}>PAR (pots)</span>
            <input
              type="number"
              min={0}
              step={1}
              className={fieldClass}
              value={draft.par}
              onChange={(e) => patch({ par: Number(e.target.value) || 0 })}
            />
          </label>
          <label className="block">
            <span className={labelClass}>Yield (pots / bladder)</span>
            <input
              type="number"
              min={0}
              step={0.1}
              className={fieldClass}
              value={draft.yieldPotsPerBladder}
              onChange={(e) => patch({ yieldPotsPerBladder: Number(e.target.value) || 0 })}
            />
          </label>
        </div>

        <label className="block">
          <span className={labelClass}>Production time (min / bladder)</span>
          <input
            type="number"
            min={0}
            step={1}
            className={fieldClass}
            value={draft.prodTimeMinPerBladder}
            onChange={(e) => patch({ prodTimeMinPerBladder: Number(e.target.value) || 0 })}
          />
        </label>

        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {(
            [
              ['active', 'Active'],
              ['popular', 'Popular'],
              ['isSpecial', 'Special'],
              ['groupUnconfirmed', 'Group unconfirmed'],
              ['washAlwaysAfter', 'Always wash after'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-[13px]">
              <input
                type="checkbox"
                checked={draft[key]}
                onChange={(e) => patch({ [key]: e.target.checked })}
              />
              {label}
            </label>
          ))}
        </div>

        <label className="block">
          <span className={labelClass}>Allergen notes</span>
          <textarea
            rows={2}
            className={fieldClass}
            value={draft.allergenNotes}
            onChange={(e) => patch({ allergenNotes: e.target.value })}
          />
        </label>

        <label className="block">
          <span className={labelClass}>Notes</span>
          <textarea
            rows={3}
            className={fieldClass}
            value={draft.notes}
            onChange={(e) => patch({ notes: e.target.value })}
          />
        </label>

        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className={labelClass}>Components</span>
            <Btn variant="secondary" onClick={addComponent}>
              Add component
            </Btn>
          </div>
          {draft.components.length === 0 ? (
            <p className="text-[12px] text-fg-muted">No components — add bake-ahead items if needed.</p>
          ) : (
            <ul className="space-y-2">
              {draft.components.map((c, index) => (
                <li key={c.id} className="flex flex-wrap items-center gap-2 border border-line bg-bg px-2 py-2">
                  <input
                    className={`${fieldClass} min-w-[10rem] flex-1`}
                    placeholder="Component name"
                    value={c.name}
                    onChange={(e) => patchComponent(index, { name: e.target.value })}
                  />
                  <label className="flex items-center gap-2 text-[12px]">
                    <input
                      type="checkbox"
                      checked={c.needsBaking}
                      onChange={(e) => patchComponent(index, { needsBaking: e.target.checked })}
                    />
                    Needs baking
                  </label>
                  <Btn variant="ghost" onClick={() => removeComponent(index)}>
                    Remove
                  </Btn>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex gap-2 pt-1">
          <Btn onClick={() => void handleSave()} disabled={saving || !draft.name.trim()}>
            {saving ? 'Saving…' : 'Save flavour'}
          </Btn>
          <Btn variant="secondary" onClick={onCancel}>
            Cancel
          </Btn>
        </div>
      </div>
    </Card>
  );
}
