import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";

import { Matrix } from '@papit/game-matrix';

describe('@papit/game-matrix unit tests', () => {
  // beforeEach(() => console.log('about to run a test'));

  it('determination', () => {
    const m = new Matrix([
      2, 3, 1,
      0, -1, 2,
      1, 2, 3,
    ], 3, 3);

    const d = m.determinant;

    assert.strictEqual(d, -7);
    // temp.doSomething();
    // assert.strictEqual(1, 1);
  });
});