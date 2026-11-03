import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ui, explainExit } from '../src/ui.js';

describe('ui', () => {
  it('every helper returns a string', () => {
    assert.strictEqual(typeof ui.title('hi'), 'string');
    assert.strictEqual(typeof ui.field('hi'), 'string');
    assert.strictEqual(typeof ui.kv('k', 'v'), 'string');
    assert.strictEqual(typeof ui.step(1, 12), 'string');
    assert.strictEqual(typeof ui.think('hi'), 'string');
    assert.strictEqual(typeof ui.tool('x', 'y'), 'string');
    assert.strictEqual(typeof ui.result('ok'), 'string');
    assert.strictEqual(typeof ui.forbidden('SAVE', '../x', 'reason'), 'string');
    assert.strictEqual(typeof ui.pass('ok'), 'string');
    assert.strictEqual(typeof ui.fail('bad'), 'string');
    assert.strictEqual(typeof ui.rule('x'), 'string');
    assert.strictEqual(typeof ui.hookTitle('x'), 'string');
    assert.strictEqual(typeof ui.hookLine('🚀', 'SessionStart', 'cyan', 'once', true), 'string');
    assert.strictEqual(typeof ui.hookField('k', 'v'), 'string');
    assert.strictEqual(typeof ui.hookLive(), 'string');
    assert.strictEqual(typeof ui.hookNote('n', 't'), 'string');
    assert.strictEqual(typeof ui.hookTrace('🚀', 'SessionStart', 'cyan', 'before', 'detail'), 'string');
    assert.strictEqual(typeof ui.hookFlow('x -> y'), 'string');
    assert.strictEqual(typeof ui.memory('x'), 'string');
    assert.strictEqual(typeof ui.exitNote(1, 'x'), 'string');
    assert.strictEqual(typeof ui.answerRule(), 'string');
    assert.strictEqual(typeof ui.answer('x'), 'string');
    assert.strictEqual(typeof ui.warn('x'), 'string');
    assert.strictEqual(typeof ui.waiting('x'), 'string');
    assert.strictEqual(typeof ui.error('x'), 'string');
    assert.strictEqual(typeof ui.note('x'), 'string');
    assert.strictEqual(typeof ui.prompt('x'), 'string');
    assert.strictEqual(typeof ui.dim('x'), 'string');
  });

  it('result classifies success with exit code 0', () => {
    const r = ui.result('exit code 0\nstdout:\nhello world\n\nstderr:\n');
    assert.ok(r.includes('result ←'));
    assert.ok(r.includes('hello world'));
    // Should also include the stdout annotation
    assert.ok(r.includes('stdout:'));
  });

  it('result classifies failure with non-zero exit code', () => {
    const r = ui.result('exit code 1\nstdout:\n\nstderr:\noh no');
    assert.ok(r.includes('result ←'));
    assert.ok(r.includes('exit 1:'));
    assert.ok(r.includes('general failure'));
  });

  it('result classifies ERROR as failure', () => {
    const r = ui.result('ERROR: no such file: hello.js');
    assert.ok(r.includes('result ←'));
    assert.ok(r.includes('ERROR:'));
  });

  it('result classifies DENIED as failure', () => {
    const r = ui.result('DENIED: blocked by policy');
    assert.ok(r.includes('result ←'));
    assert.ok(r.includes('DENIED:'));
  });

  it('result classifies FORBIDDEN as failure', () => {
    const r = ui.result('FORBIDDEN: SAVE ../x - path escapes');
    assert.ok(r.includes('result ←'));
    assert.ok(r.includes('FORBIDDEN:'));
  });

  it('result truncates first line to 300 chars', () => {
    const long = 'a'.repeat(500);
    const r = ui.result(long);
    const arrowIndex = r.indexOf('←');
    const firstLineContent = r.slice(arrowIndex + 2).split('\n')[0];
    assert.strictEqual(firstLineContent.length, 304); // 300 + ' ...'
  });

  it('forbidden contains FORBIDDEN and action in caps', () => {
    const r = ui.forbidden('SAVE', '../escape.txt', 'path escapes the workspace');
    assert.ok(r.includes('FORBIDDEN'));
    assert.ok(r.includes('SAVE'));
    assert.ok(r.includes('../escape.txt'));
    assert.ok(r.includes('path escapes'));
  });

  it('text with backslashes prints verbatim', () => {
    const r = ui.tool('run_command', 'copy demo\\hello.js %USERPROFILE%\\Desktop');
    assert.ok(r.includes('\\'));
    // Should NOT have stripped or interpreted backslashes
    assert.ok(r.includes('demo\\hello.js'));
  });

  it('text that looks like a colour tag prints verbatim', () => {
    const r = ui.answer('foo [red] bar');
    assert.ok(r.includes('[red]'));
  });

  it('step pads to requested width', () => {
    const r = ui.step(3, 12, 50);
    assert.strictEqual(r.length, 50);
    assert.ok(r.includes('step 3/12'));
  });

  it('rule pads to requested width', () => {
    const r = ui.rule('test', 60);
    assert.strictEqual(r.length, 60);
    assert.ok(r.includes(' test '));
  });

  it('answerRule is a banner line', () => {
    const r = ui.answerRule();
    assert.ok(r.includes('final answer'));
    assert.ok(r.length >= 44);
  });

  it('hookLine shows attached tag when live', () => {
    const r = ui.hookLine('🚀', 'SessionStart', 'cyan', 'once', true);
    assert.ok(r.includes('SessionStart'));
    assert.ok(r.includes('attached'));
  });

  it('hookLine omits attached tag when not live', () => {
    const r = ui.hookLine('🚀', 'SessionStart', 'cyan', 'once', false);
    assert.ok(r.includes('SessionStart'));
    assert.ok(!r.includes('attached'));
  });
});

describe('explainExit', () => {
  it('maps known codes', () => {
    assert.ok(explainExit(1).includes('general failure'));
    assert.ok(explainExit(2).includes('usage error'));
    assert.ok(explainExit(126).includes('not executable'));
    assert.ok(explainExit(127).includes('command not found'));
    assert.ok(explainExit(130).includes('SIGINT'));
    assert.ok(explainExit(137).includes('SIGKILL'));
    assert.ok(explainExit(143).includes('SIGTERM'));
    assert.ok(explainExit(9009).includes('not recognized'));
  });

  it('maps signal range 129-164 for unmapped codes', () => {
    // 129 and 130 are specifically mapped; test a code in the range that is not
    assert.ok(explainExit(139).includes('signal 11'));
    assert.ok(explainExit(140).includes('signal 12'));
    assert.ok(explainExit(141).includes('signal 13'));
    assert.ok(explainExit(142).includes('signal 14'));
  });

  it('defaults for unknown non-zero', () => {
    assert.ok(explainExit(255).includes('non-zero exit'));
    assert.ok(explainExit(99).includes('non-zero exit'));
  });
});
