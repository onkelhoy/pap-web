import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";

import { Vector } from '@papit/game-vector';

describe('@papit/game-vector unit tests', () => {
  // beforeEach(() => console.log('about to run a test'));

  it('construction test (zero based)', () => {
    const a = new Vector(0, 0);
    const zeroVectors = [
      Vector.Zero,
      Vector.toVector(0, 0, 0),
      new Vector({ x: 0, y: 0 }),
    ];

    for (let v of zeroVectors) {
      assert.strictEqual(a.x, v.x);
      assert.strictEqual(a.y, v.y);
      assert.strictEqual(a.z, v.z);
    }
  });


  it('should add successfully', () => {
    const a = new Vector(1, 2);
    a.add(2);

    assert.strictEqual(a.x, 3);
    assert.strictEqual(a.y, 4);

    a.add(1, 0);

    assert.strictEqual(a.x, 4);
    assert.strictEqual(a.y, 4);
  });

  it('should subtract successfully', () => {
    const a = new Vector(1, 2);
    a.sub(2);

    assert.strictEqual(a.x, -1);
    assert.strictEqual(a.y, 0);

    a.sub(1, 0);

    assert.strictEqual(a.x, -2);
    assert.strictEqual(a.y, 0);
  });


  it('should multiply successfully', () => {
    const a = new Vector(1, 2);
    a.mul(2);

    assert.strictEqual(a.x, 2);
    assert.strictEqual(a.y, 4);

    a.mul(2, 0);

    assert.strictEqual(a.x, 4);
    assert.strictEqual(a.y, 0);
  });
});