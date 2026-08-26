import type { GelatoRepository } from './gelato-repository';
import { createLocalStorageRepository } from './local-storage-repository';

export type GelatoDataMode = 'local' | 'api';

/**
 * Factory for the active data client.
 * Set `NEXT_PUBLIC_GELATO_DATA_MODE=api` once the backend exists and implement
 * `createHttpGelatoRepository` against the generated OpenAPI client.
 */
export function createGelatoDataClient(
  mode: GelatoDataMode = (process.env.NEXT_PUBLIC_GELATO_DATA_MODE as GelatoDataMode) || 'local',
): GelatoRepository {
  if (mode === 'api') {
    throw new Error(
      'HttpGelatoRepository is not implemented yet. Keep NEXT_PUBLIC_GELATO_DATA_MODE=local until the API ships.',
    );
  }
  return createLocalStorageRepository();
}

export type { GelatoRepository } from './gelato-repository';
