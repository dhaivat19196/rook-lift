import Dexie, { type Table } from 'dexie';
import type { Game, Meta } from './types';

export interface KV {
  key: string;
  value: unknown;
  updatedAt: number; // ms
  dirty: 0 | 1;
}

class ClimbDB extends Dexie {
  games!: Table<Game, string>;
  kv!: Table<KV, string>;
  meta!: Table<Meta, string>;

  constructor() {
    super('chess-climb');
    this.version(1).stores({
      games: 'id, endTime, timeClass',
      kv: 'key, dirty',
      meta: 'key',
    });
  }
}

export const db = new ClimbDB();

export async function metaGet<T>(key: string): Promise<T | undefined> {
  const r = await db.meta.get(key);
  return r?.value as T | undefined;
}

export async function metaSet(key: string, value: unknown): Promise<void> {
  await db.meta.put({ key, value });
}
