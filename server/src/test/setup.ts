import { beforeEach } from 'vitest';

import { resetStore } from '@/data/store.js';

// Every test starts from the seeded store, isolated from prior mutations.
beforeEach(() => {
  resetStore();
});
