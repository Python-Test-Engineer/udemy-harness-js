import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import {
  findEnvFile,
  loadDotEnv,
  fingerprint,
  normalizeModel,
  loadConfig,
  PROJECT_ROOT,
} from '../src/config.js';

describe('config', () => {
  let tmpDir;

  before(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'config-test-'));
  });

  after(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('findEnvFile finds .env in startDir', () => {
    const envPath = path.join(tmpDir, '.env');
    fs.writeFileSync(envPath, 'X=1\n');
    const found = findEnvFile(tmpDir);
    assert.strictEqual(found, envPath);
  });

  it('findEnvFile walks up to parent directories', () => {
    const subDir = path.join(tmpDir, 'a', 'b', 'c');
    fs.mkdirSync(subDir, { recursive: true });
    const envPath = path.join(tmpDir, '.env');
    fs.writeFileSync(envPath, 'X=1\n');
    const found = findEnvFile(subDir);
    assert.strictEqual(found, envPath);
  });

  it('findEnvFile returns null when no .env exists', () => {
    // Use a directory not under tmpDir, since tmpDir itself may have a .env
    const emptyDir = fs.mkdtempSync(path.join(os.tmpdir(), 'config-empty-'));
    try {
      const found = findEnvFile(emptyDir);
      assert.strictEqual(found, null);
    } finally {
      fs.rmdirSync(emptyDir);
    }
  });

  it('loadDotEnv parses KEY=VALUE', () => {
    const envPath = path.join(tmpDir, 'kv.env');
    fs.writeFileSync(envPath, 'FOO=bar\nBAZ=qux\n');
    const env = loadDotEnv(envPath);
    assert.strictEqual(env.FOO, 'bar');
    assert.strictEqual(env.BAZ, 'qux');
  });

  it('loadDotEnv supports export prefix', () => {
    const envPath = path.join(tmpDir, 'export.env');
    fs.writeFileSync(envPath, 'export HELLO=world\n');
    const env = loadDotEnv(envPath);
    assert.strictEqual(env.HELLO, 'world');
  });

  it('loadDotEnv skips comments and blank lines', () => {
    const envPath = path.join(tmpDir, 'comments.env');
    fs.writeFileSync(envPath, '\n# comment\nKEY=value\n\n# another\n');
    const env = loadDotEnv(envPath);
    assert.strictEqual(env.KEY, 'value');
    assert.strictEqual(Object.keys(env).length, 1);
  });

  it('loadDotEnv strips surrounding quotes', () => {
    const envPath = path.join(tmpDir, 'quotes.env');
    fs.writeFileSync(envPath, 'DQ="hello"\nSQ=\'world\'\n');
    const env = loadDotEnv(envPath);
    assert.strictEqual(env.DQ, 'hello');
    assert.strictEqual(env.SQ, 'world');
  });

  it('loadDotEnv ignores blank values', () => {
    const envPath = path.join(tmpDir, 'blank.env');
    fs.writeFileSync(envPath, 'EMPTY=\nKEY=value\n');
    const env = loadDotEnv(envPath);
    assert.strictEqual(env.KEY, 'value');
    assert.strictEqual(Object.keys(env).length, 1);
  });

  it('loadDotEnv returns empty object for missing file', () => {
    const env = loadDotEnv(path.join(tmpDir, 'nonexistent.env'));
    assert.deepStrictEqual(env, {});
  });

  it('fingerprint returns not set for empty', () => {
    assert.strictEqual(fingerprint(''), 'not set');
    assert.strictEqual(fingerprint(undefined), 'not set');
    assert.strictEqual(fingerprint(null), 'not set');
  });

  it('fingerprint masks short keys', () => {
    assert.strictEqual(fingerprint('ab'), '** (2 chars)');
    assert.strictEqual(fingerprint('short'), '***** (5 chars)');
  });

  it('fingerprint masks long keys', () => {
    const key = 'sk-abcdefghijklmnop';
    assert.strictEqual(fingerprint(key), 'sk-ab...mnop (19 chars)');
  });

  it('fingerprint never exposes whole key', () => {
    const key = 'verysecretkeythatmustnotbeleaked';
    const fp = fingerprint(key);
    assert.ok(!fp.includes('verysecretkeythatmustnotbeleaked'));
    assert.ok(fp.includes('...'));
  });

  it('normalizeModel leaves vendor/model alone', () => {
    assert.deepStrictEqual(normalizeModel('anthropic/claude-3'), {
      model: 'anthropic/claude-3',
      normalised: 'anthropic/claude-3',
    });
  });

  it('normalizeModel maps bare-name prefixes', () => {
    assert.strictEqual(normalizeModel('deepseek-chat').normalised, 'deepseek/deepseek-chat');
    assert.strictEqual(normalizeModel('claude-sonnet').normalised, 'anthropic/claude-sonnet');
    assert.strictEqual(normalizeModel('gpt-4').normalised, 'openai/gpt-4');
    assert.strictEqual(normalizeModel('o3-mini').normalised, 'openai/o3-mini');
    assert.strictEqual(normalizeModel('gemini-pro').normalised, 'google/gemini-pro');
    assert.strictEqual(normalizeModel('grok-1').normalised, 'x-ai/grok-1');
    assert.strictEqual(normalizeModel('llama-7b').normalised, 'meta-llama/llama-7b');
    assert.strictEqual(normalizeModel('qwen-7b').normalised, 'qwen/qwen-7b');
    assert.strictEqual(normalizeModel('mistral-7b').normalised, 'mistralai/mistral-7b');
    assert.strictEqual(normalizeModel('mixtral-8x7b').normalised, 'mistralai/mixtral-8x7b');
  });

  it('normalizeModel uses OPENROUTER_PROVIDER_PREFIX when set', () => {
    process.env.OPENROUTER_PROVIDER_PREFIX = 'custom';
    try {
      assert.strictEqual(normalizeModel('my-model').normalised, 'custom/my-model');
    } finally {
      delete process.env.OPENROUTER_PROVIDER_PREFIX;
    }
  });

  it('normalizeModel returns empty for empty input', () => {
    assert.deepStrictEqual(normalizeModel(''), { model: '', normalised: '' });
  });

  it('loadConfig uses defaults when nothing provided', () => {
    const dir = path.join(tmpDir, 'noenv');
    fs.mkdirSync(dir, { recursive: true });
    const config = loadConfig({}, { envFile: path.join(dir, '.env') });
    assert.strictEqual(config.apiKey, '');
    assert.strictEqual(config.apiKeySource, 'not set');
    assert.strictEqual(config.model, 'deepseek/deepseek-v4.1-flash-1017');
    assert.strictEqual(config.commandPolicy, 'ask');
    assert.strictEqual(config.maxSteps, 12);
    assert.strictEqual(config.requestTimeoutMs, 90000);
    assert.strictEqual(config.memoryMaxEntries, 60);
    assert.strictEqual(config.memoryPromptChars, 1200);
  });

  it('loadConfig applies overrides', () => {
    const dir = path.join(tmpDir, 'override-test');
    fs.mkdirSync(dir, { recursive: true });
    const config = loadConfig(
      { apiKey: 'sk-test', model: 'gpt-4' },
      { envFile: path.join(dir, '.env') }
    );
    assert.strictEqual(config.apiKey, 'sk-test');
    assert.strictEqual(config.apiKeySource, 'override');
    assert.strictEqual(config.model, 'gpt-4');
    assert.strictEqual(config.modelSource, 'flag');
  });

  it('loadConfig reads from .env file', () => {
    const dir = path.join(tmpDir, 'dotenv-test');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, '.env'), 'OPENROUTER_API_KEY=sk-from-env\nOPENROUTER_MODEL=claude-3\n');
    const config = loadConfig({}, { envFile: path.join(dir, '.env') });
    assert.strictEqual(config.apiKey, 'sk-from-env');
    assert.strictEqual(config.apiKeySource, '.env');
    assert.strictEqual(config.model, 'claude-3');
    assert.strictEqual(config.modelSource, '.env');
  });

  it('.env beats stale shell key', () => {
    const prevKey = process.env.OPENROUTER_API_KEY;
    process.env.OPENROUTER_API_KEY = 'shell-key';
    try {
      const dir = path.join(tmpDir, 'precedence-test');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, '.env'), 'OPENROUTER_API_KEY=env-key\n');
      const config = loadConfig({}, { envFile: path.join(dir, '.env') });
      assert.strictEqual(config.apiKey, 'env-key');
      assert.strictEqual(config.apiKeySource, '.env');
      assert.strictEqual(config.apiKeyOverrodeShell, true);
    } finally {
      if (prevKey === undefined) delete process.env.OPENROUTER_API_KEY;
      else process.env.OPENROUTER_API_KEY = prevKey;
    }
  });

  it('shell used for names .env does not define', () => {
    const prevKey = process.env.OPENROUTER_API_KEY;
    process.env.OPENROUTER_API_KEY = 'shell-key';
    try {
      const dir = path.join(tmpDir, 'shell-only');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, '.env'), 'OTHER=1\n');
      const config = loadConfig({}, { envFile: path.join(dir, '.env') });
      assert.strictEqual(config.apiKey, 'shell-key');
      assert.strictEqual(config.apiKeySource, 'environment');
    } finally {
      if (prevKey === undefined) delete process.env.OPENROUTER_API_KEY;
      else process.env.OPENROUTER_API_KEY = prevKey;
    }
  });

  it('identical values not reported as override', () => {
    const prevKey = process.env.OPENROUTER_API_KEY;
    process.env.OPENROUTER_API_KEY = 'same-key';
    try {
      const dir = path.join(tmpDir, 'sameval');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, '.env'), 'OPENROUTER_API_KEY=same-key\n');
      const config = loadConfig({}, { envFile: path.join(dir, '.env') });
      assert.strictEqual(config.apiKeyOverrodeShell, false);
    } finally {
      if (prevKey === undefined) delete process.env.OPENROUTER_API_KEY;
      else process.env.OPENROUTER_API_KEY = prevKey;
    }
  });
});
