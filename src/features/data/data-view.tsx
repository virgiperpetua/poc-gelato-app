'use client';

import { useRef, useState } from 'react';
import { useGelato } from '@/components/gelato-provider';
import { IconDownload, IconUpload } from '@/components/icons';
import { Badge, Btn, Card, CardTitle, PageHead } from '@/components/ui';
import {
  SNAPSHOT_SCHEMA_VERSION,
  serializeSnapshot,
  snapshotFilename,
  summariseDb,
} from '@/domain/snapshot';
import { copyToClipboard, downloadTextFile, readTextFile } from '@/lib/file-transfer';

export function DataView() {
  const { db, importSnapshotText, resetToSeed, showToast } = useGelato();
  const fileInput = useRef<HTMLInputElement>(null);
  const [pasted, setPasted] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!db) return null;
  const rows = summariseDb(db);

  function handleExport() {
    downloadTextFile(snapshotFilename(), serializeSnapshot(db!));
    showToast('Snapshot downloaded');
  }

  async function handleCopy() {
    const ok = await copyToClipboard(serializeSnapshot(db!));
    showToast(ok ? 'Snapshot copied' : 'Clipboard blocked — use download');
  }

  async function applyImport(text: string) {
    setError(null);
    const result = await importSnapshotText(text);
    if (!result.ok) {
      setError(result.error ?? 'Import failed.');
      return;
    }
    setPasted('');
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    try {
      await applyImport(await readTextFile(file));
    } catch {
      setError('Could not read that file.');
    }
  }

  return (
    <div>
      <PageHead title="Data" sub="Export this device, import elsewhere, seed production later" />

      <Card>
        <CardTitle action={<Badge tone="neutral">v{SNAPSHOT_SCHEMA_VERSION}</Badge>}>
          Current dataset
        </CardTitle>
        <ul className="space-y-1.5 text-[13px]">
          {rows.map((row) => (
            <li key={row.label} className="flex justify-between">
              <span>{row.label}</span>
              <span className="mono text-fg-muted">{row.count}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex flex-wrap gap-2">
          <Btn onClick={handleExport}>
            <IconDownload size={14} /> Download JSON
          </Btn>
          <Btn variant="secondary" onClick={() => void handleCopy()}>
            Copy to clipboard
          </Btn>
        </div>
        <p className="mt-3 text-[12px] text-fg-muted">
          The file holds every flavour, stock count, alert, wash group, and plan on this device. Keep
          it as the seed payload for the API — `data` is keyed by storage key, one key per future
          resource.
        </p>
      </Card>

      <Card>
        <CardTitle>Import a snapshot</CardTitle>
        <p className="mb-3 text-[12px] text-fg-muted">
          Replaces everything currently stored on this device. Export first if you want a way back.
        </p>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            void handleFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
        <div className="flex flex-wrap gap-2">
          <Btn onClick={() => fileInput.current?.click()}>
            <IconUpload size={14} /> Choose file
          </Btn>
        </div>
        <label className="mt-3 block text-[12px] font-semibold text-fg-muted" htmlFor="paste-json">
          …or paste JSON
        </label>
        <textarea
          id="paste-json"
          value={pasted}
          onChange={(e) => setPasted(e.target.value)}
          rows={4}
          spellCheck={false}
          placeholder='{ "schemaVersion": 1, … }'
          className="mono mt-1 w-full border border-line bg-bg p-2 text-[12px]"
        />
        <Btn
          className="mt-2"
          variant="secondary"
          disabled={pasted.trim().length === 0}
          onClick={() => void applyImport(pasted)}
        >
          Import pasted JSON
        </Btn>
        {error ? (
          <p className="mt-2 border border-[var(--gelato-red)] bg-[var(--gelato-red-soft)] px-2 py-1.5 text-[12px] text-[var(--gelato-red)]">
            {error}
          </p>
        ) : null}
      </Card>

      <Card>
        <CardTitle>Reset</CardTitle>
        <p className="mb-3 text-[12px] text-fg-muted">
          Clears this device and rebuilds the demo catalogue from seed.
        </p>
        {confirmReset ? (
          <div className="flex flex-wrap gap-2">
            <Btn
              variant="danger"
              onClick={() => {
                void resetToSeed();
                setConfirmReset(false);
              }}
            >
              Yes, wipe and reseed
            </Btn>
            <Btn variant="ghost" onClick={() => setConfirmReset(false)}>
              Cancel
            </Btn>
          </div>
        ) : (
          <Btn variant="secondary" onClick={() => setConfirmReset(true)}>
            Reset to seed data
          </Btn>
        )}
      </Card>
    </div>
  );
}
