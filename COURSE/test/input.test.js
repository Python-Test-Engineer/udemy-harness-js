import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Readable, PassThrough } from 'node:stream';
import { askTask } from '../src/cli.js';

describe('input', () => {
  it('returns trimmed task from readable stream', async () => {
    const input = Readable.from(['  hello world  \n']);
    input.isTTY = true; // mock
    const output = new PassThrough();
    const result = await askTask({ input, output });
    assert.strictEqual(result, 'hello world');
  });

  it('returns null when input is not a TTY', async () => {
    const input = new PassThrough();
    input.isTTY = false;
    const output = new PassThrough();
    const result = await askTask({ input, output });
    assert.strictEqual(result, null);
  });

  it('handles empty string', async () => {
    const input = Readable.from(['\n']);
    input.isTTY = true;
    const output = new PassThrough();
    const result = await askTask({ input, output });
    assert.strictEqual(result, '');
  });
});
