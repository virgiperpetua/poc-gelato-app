import type { GelatoDb, StorageKey } from '@/domain/types';

/**
 * Persistence boundary for gelato data.
 *
 * Today: `LocalStorageGelatoRepository`.
 * Later: swap to `HttpGelatoRepository` that talks to the Nest/OpenAPI client
 * without changing feature code — features only depend on this interface.
 */
export interface GelatoRepository {
  load(): Promise<GelatoDb>;
  save(key: StorageKey, value: GelatoDb[StorageKey]): Promise<void>;
  saveAll(db: GelatoDb): Promise<void>;
  /** Drop everything so the next `load()` re-seeds. Maps to a reset endpoint later. */
  clear(): Promise<void>;
}
