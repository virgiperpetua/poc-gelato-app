'use client';

import {
  IconBake,
  IconBox,
  IconCalendar,
  IconChart,
  IconDownload,
  IconFlavour,
  IconList,
  IconWorkflow,
} from '@/components/icons';
import { useGelato } from '@/components/gelato-provider';
import type { Role, TabId } from '@/domain/types';
import type { ReactNode } from 'react';

const ALL_TABS: Array<{ id: TabId; label: string; icon: ReactNode; roles: Role[] }> = [
  { id: 'today', label: 'Today', icon: <IconCalendar />, roles: ['manager', 'churner', 'staff'] },
  { id: 'plan', label: 'Plan', icon: <IconList />, roles: ['manager'] },
  { id: 'workflow', label: 'Churn', icon: <IconWorkflow />, roles: ['churner', 'manager'] },
  { id: 'bake', label: 'Bake', icon: <IconBake />, roles: ['staff', 'manager'] },
  { id: 'stock', label: 'Stock', icon: <IconBox />, roles: ['staff', 'manager'] },
  { id: 'flavours', label: 'Flavours', icon: <IconFlavour />, roles: ['manager'] },
  { id: 'reports', label: 'Reports', icon: <IconChart />, roles: ['manager'] },
];

export function BottomNav() {
  const { ui, setTab } = useGelato();
  if (!ui.role) return null;
  const tabs = ALL_TABS.filter((t) => t.roles.includes(ui.role!));
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-line bg-bg-surface">
      <div className="mx-auto flex max-w-[560px] justify-around px-1 pb-[env(safe-area-inset-bottom)] pt-1">
        {tabs.map((t) => {
          const active = ui.tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-semibold ${
                active ? 'text-accent-strong' : 'text-fg-muted'
              }`}
            >
              <span className={active ? 'text-accent' : ''}>{t.icon}</span>
              {t.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function TopBar() {
  const { ui, clearRole, setTab } = useGelato();
  if (!ui.role) return null;
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between bg-bg px-4 pb-2.5 pt-3.5">
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center bg-accent text-accent-on">
          <IconFlavour size={16} />
        </div>
        <div className="font-heading text-[16.5px] font-bold text-accent-strong">Churn Sheet</div>
      </div>
      <div className="flex items-center gap-2">
        {ui.role === 'manager' ? (
          <button
            type="button"
            onClick={() => setTab('data')}
            aria-label="Export or import data"
            className={`flex items-center border px-2 py-1.5 ${
              ui.tab === 'data'
                ? 'border-accent bg-accent text-accent-on'
                : 'border-line bg-bg-surface text-fg-muted'
            }`}
          >
            <IconDownload size={15} />
          </button>
        ) : null}
        <button
          type="button"
          onClick={clearRole}
          className="flex items-center gap-1.5 border border-line bg-bg-surface px-2.5 py-1.5 text-[12.5px] font-semibold capitalize text-fg-muted"
        >
          <span className="h-1.5 w-1.5 bg-accent" />
          {ui.role}
        </button>
      </div>
    </header>
  );
}
