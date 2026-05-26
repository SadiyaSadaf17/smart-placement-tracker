import test from 'node:test';
import assert from 'node:assert/strict';
import { validateStrongPassword } from '../utils/passwordPolicy.js';

test('password policy rejects common weak passwords', () => {
  const result = validateStrongPassword('student123');
  assert.equal(result.valid, false);
  assert.match(result.message, /default password/);
});

test('password policy accepts strong passwords', () => {
  const result = validateStrongPassword('Campus@2026');
  assert.equal(result.valid, true);
});
