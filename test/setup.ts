import { rm } from 'node:fs/promises';
import path from 'node:path';

globalThis.beforeEach(async () => {
  try {
    await rm(path.join(__dirname, '..', 'test.sqlite'));
  } catch (err) {
    console.warn('Could not delete test DB:', err);
  }
});
