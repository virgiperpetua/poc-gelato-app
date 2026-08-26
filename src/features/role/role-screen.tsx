'use client';

import { useGelato } from '@/components/gelato-provider';
import { Btn, Card } from '@/components/ui';
import type { Role } from '@/domain/types';

const ROLES: Array<{ id: Role; title: string; blurb: string }> = [
  {
    id: 'manager',
    title: 'Manager',
    blurb: 'Approve plans, watch stock, generate the next churn runs.',
  },
  {
    id: 'churner',
    title: 'Churner',
    blurb: 'Follow today’s wash-safe sequence and tick flavours as you go.',
  },
  {
    id: 'staff',
    title: 'Staff',
    blurb: 'Prep baking, count freezers, and log bladder deliveries.',
  },
];

export function RoleScreen() {
  const { setRole } = useGelato();
  return (
    <div className="mx-auto flex min-h-screen max-w-[560px] flex-col justify-center px-4 py-10">
      <div className="mb-8">
        <div className="mono mb-2 text-[12px] tracking-wide text-accent-strong">CHURN SHEET</div>
        <h1 className="m-0 text-[28px] text-accent-strong">Who’s on shift?</h1>
        <p className="mt-2 text-[14px] text-fg-muted">
          Pick a role. You can switch later from the top bar. Data stays on this device until the API
          lands.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {ROLES.map((r) => (
          <Card key={r.id} className="!mb-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-heading text-[16px] font-semibold">{r.title}</div>
                <p className="mt-1 text-[13px] text-fg-muted">{r.blurb}</p>
              </div>
              <Btn onClick={() => setRole(r.id)}>Enter</Btn>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
