'use client';

import { BottomNav, TopBar } from '@/components/shell';
import { GelatoProvider, useGelato } from '@/components/gelato-provider';
import { RoleScreen } from '@/features/role/role-screen';
import { TodayView } from '@/features/today/today-view';
import { PlanView } from '@/features/plan/plan-view';
import { WorkflowView } from '@/features/workflow/workflow-view';
import { BakeView } from '@/features/bake/bake-view';
import { StockView } from '@/features/stock/stock-view';
import { FlavoursView } from '@/features/flavours/flavours-view';
import { ReportsView } from '@/features/reports/reports-view';
import { DataView } from '@/features/data/data-view';

function AppInner() {
  const { loaded, ui } = useGelato();

  if (!loaded) {
    return (
      <div className="mx-auto flex min-h-screen max-w-[560px] items-center justify-center text-fg-muted">
        Loading Churn Sheet…
      </div>
    );
  }

  if (!ui.role) return <RoleScreen />;

  return (
    <div className="mx-auto min-h-screen max-w-[560px] bg-bg pb-[78px]">
      <TopBar />
      <main className="px-4 pb-7 pt-1">
        {ui.tab === 'today' ? <TodayView /> : null}
        {ui.tab === 'plan' ? <PlanView /> : null}
        {ui.tab === 'workflow' ? <WorkflowView /> : null}
        {ui.tab === 'bake' ? <BakeView /> : null}
        {ui.tab === 'stock' ? <StockView /> : null}
        {ui.tab === 'flavours' ? <FlavoursView /> : null}
        {ui.tab === 'reports' ? <ReportsView /> : null}
        {ui.tab === 'data' ? <DataView /> : null}
      </main>
      <BottomNav />
      {ui.toast ? (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 border border-line bg-accent-strong px-3 py-2 text-[13px] font-semibold text-accent-on shadow-md">
          {ui.toast}
        </div>
      ) : null}
    </div>
  );
}

export function GelatoApp() {
  return (
    <GelatoProvider>
      <AppInner />
    </GelatoProvider>
  );
}
