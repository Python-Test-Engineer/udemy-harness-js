import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

export const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function findEnvFile(startDir = PROJECT_ROOT) {
  let dir = path.resolve(startDir);
  while (true) {
    const candidate = path.join(dir, '.env');
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

export function loadDotEnv(file) {
  const env = {};
  if (!file || !fs.existsSync(file)) return env;

  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;

    const body = line.startsWith('export ') ? line.slice(7) : line;
    const eq = body.indexOf('=');
    if (eq === -1) continue;

    const key = body.slice(0, eq).trim();
    let value = body.slice(eq + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (value === '') continue;
    env[key] = value;
  }
  return env;
}

export function fingerprint(secret) {
  if (!secret || secret === '') return 'not set';
  const n = secret.length;
  if (n <= 12) return '*'.repeat(n) + ` (${n} chars)`;
  return secret.slice(0, 5) + '...' + secret.slice(-4) + ` (${n} chars)`;
}

const MODEL_PREFIX_MAP = [
  { prefixes: ['deepseek'], vendor: 'deepseek' },
  { prefixes: ['claude'], vendor: 'anthropic' },
  { prefixes: ['gpt', 'o1', 'o3', 'o4', 'o5', 'o8', 'chatgpt'], vendor: 'openai' },
  { prefixes: ['gemini'], vendor: 'google' },
  { prefixes: ['grok'], vendor: 'x-ai' },
  { prefixes: ['llama'], vendor: 'meta-llama' },
  { prefixes: ['qwen'], vendor: 'qwen' },
  { prefixes: ['mistral', 'mixtral'], vendor: 'mistralai' },
];

export function normalizeModel(value) {
  if (!value || value === '') return { model: '', normalised: '' };
  if (value.includes('/')) return { model: value, normalised: value };

  const prefix = process.env.OPENROUTER_PROVIDER_PREFIX;
  if (prefix) {
    return { model: value, normalised: `${prefix}/${value}` };
  }

  const lower = value.toLowerCase();
  for (const { prefixes, vendor } of MODEL_PREFIX_MAP) {
    for (const p of prefixes) {
      if (lower.startsWith(p)) {
        return { model: value, normalised: `${vendor}/${value}` };
      }
    }
  }

  return { model: value, normalised: value };
}

export function loadConfig(overrides = {}, { envFile, startDir } = {}) {
  const file = envFile ?? findEnvFile(startDir ?? PROJECT_ROOT);
  const shellEnv = { ...process.env };
  const dotEnv = loadDotEnv(file);

  // Precedence: .env overrides inherited shell variables for keys it defines.
  // For keys .env does NOT define, fall back to the shell value.
  const merged = { ...shellEnv };
  for (const [key, value] of Object.entries(dotEnv)) {
    merged[key] = value;
  }

  const get = (keys, fallback) => {
    for (const k of keys) {
      if (merged[k] !== undefined && merged[k] !== '') return merged[k];
    }
    return fallback;
  };

  const hasInDotEnv = (keys) => keys.some((k) => k in dotEnv);
  const hasInShell = (keys) => keys.some((k) => k in shellEnv && shellEnv[k] !== undefined && shellEnv[k] !== '');

  // API Key
  const keyKeys = ['OPENROUTER_API_KEY', 'OPENROUTER_KEY'];
  const apiKeyRaw = overrides.apiKey ?? get(keyKeys, '');
  const apiKeyFromOverride = overrides.apiKey !== undefined && overrides.apiKey !== '';
  const apiKeyFromEnvFile = hasInDotEnv(keyKeys);
  const apiKeyFromShell = !apiKeyFromEnvFile && hasInShell(keyKeys);
  const apiKeySource = apiKeyFromOverride ? 'override' :
    apiKeyFromEnvFile ? '.env' :
    apiKeyFromShell ? 'environment' : 'not set';

  const apiKeyOverrodeShell = apiKeyFromEnvFile && hasInShell(keyKeys) &&
    keyKeys.some((k) => shellEnv[k] !== undefined && shellEnv[k] !== '' && dotEnv[k] !== shellEnv[k]);

  // Model
  const modelKeys = ['OPENROUTER_MODEL', 'MODEL'];
  const modelRaw = overrides.model ?? get(modelKeys, 'deepseek/deepseek-v4.1-flash-1017');
  const modelFromFlag = overrides.model !== undefined && overrides.model !== '';
  const modelFromEnvFile = hasInDotEnv(modelKeys);
  const modelFromShell = !modelFromEnvFile && hasInShell(modelKeys);
  const modelSource = modelFromFlag ? 'flag' :
    modelFromEnvFile ? '.env' :
    modelFromShell ? 'environment' : 'not set';

  const modelOverrodeShell = modelFromEnvFile && hasInShell(modelKeys) &&
    modelKeys.some((k) => shellEnv[k] !== undefined && shellEnv[k] !== '' && dotEnv[k] !== shellEnv[k]);

  const { model, normalised } = normalizeModel(modelRaw);

  const workspaceRoot = path.resolve(PROJECT_ROOT, get(['WORKSPACE_DIR'], 'workspace'));
  const commandPolicy = get(['CMD_POLICY'], 'ask');
  const maxSteps = parseInt(get(['MAX_STEPS'], '12'), 10);
  const requestTimeoutMs = parseInt(get(['REQUEST_TIMEOUT_MS'], '90000'), 10);

  const rawMemoryFile = get(['MEMORY_FILE'], 'src/memory.md');
  const memoryFile = path.isAbsolute(rawMemoryFile)
    ? rawMemoryFile
    : path.resolve(PROJECT_ROOT, rawMemoryFile);

  const memoryMaxEntries = parseInt(get(['MEMORY_MAX_ENTRIES'], '60'), 10);
  const memoryPromptChars = parseInt(get(['MEMORY_PROMPT_CHARS'], '1200'), 10);

  return {
    apiKey: apiKeyRaw,
    apiKeySource,
    apiKeyOverrodeShell,
    model,
    modelSource,
    modelOverrodeShell,
    modelNormalised: normalised,
    workspaceRoot,
    commandPolicy,
    maxSteps,
    requestTimeoutMs,
    memoryFile,
    projectRoot: PROJECT_ROOT,
    memoryMaxEntries,
    memoryPromptChars,
    envFile: file,
  };
}
