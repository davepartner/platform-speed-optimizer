import test from 'node:test';
import assert from 'node:assert/strict';
import { assertShape, keepsShape, shapeOf } from './contract.mjs';

test('same shape with different values passes', () => {
  assert.equal(keepsShape({ id: 2, name: 'B' }, { id: 1, name: 'A' }), true);
});

test('a removed key fails the contract', () => {
  assert.throws(() => assertShape({ id: 1 }, { id: 1, name: 'A' }), /contract mismatch/);
});

test('a changed type fails the contract', () => {
  assert.throws(() => assertShape({ id: '1' }, { id: 1 }), /contract mismatch/);
});

test('array element shape is checked, length is ignored', () => {
  assert.equal(keepsShape([{ id: 3 }], [{ id: 1 }, { id: 2 }]), true);
  assert.throws(() => assertShape([{ name: 'x' }], [{ id: 1 }]), /contract mismatch/);
});

test('shapeOf normalises nested objects and nulls', () => {
  assert.deepEqual(shapeOf({ a: 1, b: { c: null } }), { a: 'number', b: { c: 'null' } });
});
