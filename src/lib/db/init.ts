import { db } from './store';
import { generateSeedDataset } from '../seed/seed';

export function ensureDatabaseInitialized() {
  if (!db.isInitialized) {
    const seed = generateSeedDataset();
    db.initialize(seed);
  }
}
