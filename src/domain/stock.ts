import type { ExpiryAlert, Flavour, GelatoDb, StockStatus } from './types';

export function stockTotal(db: GelatoDb, flavourId: string): number {
  const s = db.stock[flavourId] || { neg20: 0, neg14: 0, bladders: 0, updatedAt: '' };
  return (s.neg20 || 0) + (s.neg14 || 0);
}

export function activeAlertsFor(db: GelatoDb, flavourId: string): ExpiryAlert[] {
  return db['expiry-alerts'].filter((a) => a.flavourId === flavourId && !a.resolved);
}

export function stockStatusColor(db: GelatoDb, flavour: Flavour): StockStatus {
  const total = stockTotal(db, flavour.id);
  const urgent = activeAlertsFor(db, flavour.id).some((a) => a.urgency === 'today');
  if (urgent || total <= 0) return 'red';
  if (total <= 1 || total < flavour.par) return 'amber';
  return 'green';
}
