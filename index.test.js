import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isPrerelease } from './index.js';

test('isPrerelease: only a version with a pre-release part', () => {
  assert.equal(isPrerelease('0.1.9'), false);
  assert.equal(isPrerelease('0.2.0-rc.1'), true);
  assert.equal(isPrerelease('v0.2.0-rc.1'), false);
});
