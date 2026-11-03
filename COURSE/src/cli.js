import path from 'node:path';
import { pathToFileURL } from 'node:url';
import readline from 'node:readline';
import { ui } from './ui.js';
import { chat } from './llm.js';
import { loadConfig, fingerprint } from './config.js';

function parseArgs(argv) {
  const opts = {};
  const rest = [];
  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') {
      opts.help = true;
    } else if (arg === '--model') {
      i++;
      opts.model = argv[i] ?? '';
    } else if (arg === '--max-steps') {
      i++;
      opts.maxSteps = Number(argv[i]);
    } else if (arg === '--yes' || arg === '-y') {
      opts.yes = true;
    } else if (arg === '--allow-commands') {
      opts.allowCommands = true;
    } else {
      rest.push(arg);
    }
    i++;
  }
  return { opts, task: rest.join(' ') || undefined };
}

function printUsage(log = console.log) {
  log('Usage:');
  log('  node src/cli.js                          interactive session');
  log('  node src/cli.js "task"                   one shot');
  log('  node src/cli.js "..." --model anthropic/claude-sonnet-4.5');
  log('  node src/cli.js "..." --max-steps 6');
  log('');
  log('Environment:');
  log('  OPENROUTER_API_KEY, OPENROUTER_MODEL, OPENROUTER_KEY, MODEL');
  log('');
  log('Examples:');
  log('  node src/cli.js "say hello"');
  log('  node src/cli.js --help');
}

export async function askTask({ input = process.stdin, output = process.stdout } = {}) {
  if (!input.isTTY) return null;

  const rl = readline.createInterface({ input, output, terminal: true });
  rl.on('SIGINT', () => rl.close());

  return new Promise((resolve) => {
    rl.question(ui.prompt('task') + ' ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  const { opts, task: argTask } = parseArgs(process.argv.slice(2));

  if (opts.help) {
    printUsage();
    return 0;
  }

  const config = loadConfig({ model: opts.model });
  const model = config.modelNormalised;

  if (!config.apiKey) {
    console.log(ui.error('OPENROUTER_API_KEY is not set. Copy .env.example to .env, or set it in your environment.'));
    return 1;
  }

  const systemMessage = {
    role: 'system',
    content: 'You are a helpful coding assistant. Be concise.',
  };

  // One-shot mode
  if (argTask) {
    const messages = [systemMessage, { role: 'user', content: argTask }];
    let reply;
    try {
      reply = await chat({
        apiKey: config.apiKey,
        model,
        messages,
        timeoutMs: config.requestTimeoutMs,
      });
    } catch (err) {
      console.log(ui.error(err.message));
      return 1;
    }
    const content = reply?.choices?.[0]?.message?.content ?? '(no answer)';
    console.log(ui.answerRule());
    console.log(ui.answer(content));
    return 0;
  }

  // Interactive session
  if (!process.stdin.isTTY) {
    console.log(ui.error('stopped: cannot ask for a task because stdin is not a terminal.'));
    console.log(ui.dim('  Hint: pass a task as an argument, e.g. node src/cli.js "say hello"'));
    return 2;
  }

  console.log(ui.title('mini-coding-js'));
  console.log(ui.kv('model', `${model} (${config.modelSource})`));
  console.log(ui.kv('key', `${fingerprint(config.apiKey)} (${config.apiKeySource})`));
  console.log();
  console.log('Interactive session. Type a task, or /quit to exit.');
  console.log();

  const messages = [systemMessage];

  while (true) {
    const line = await askTask();
    if (line === null || line === '/quit' || line === '/exit') break;
    if (line === '/new') {
      messages.splice(0, messages.length);
      messages.push(systemMessage);
      console.log(ui.note('conversation cleared'));
      continue;
    }
    if (line === '') {
      console.log(ui.warn('nothing entered - type a task, or press Ctrl-C to quit'));
      continue;
    }

    messages.push({ role: 'user', content: line });

    let reply;
    try {
      reply = await chat({
        apiKey: config.apiKey,
        model,
        messages,
        timeoutMs: config.requestTimeoutMs,
      });
    } catch (err) {
      console.log(ui.error(err.message));
      return 1;
    }

    const message = reply?.choices?.[0]?.message ?? {};
    const content = message.content ?? '(no answer)';

    console.log(ui.answerRule());
    console.log(ui.answer(content));
    console.log();

    messages.push({ role: 'assistant', content });
  }

  console.log(ui.dim('session over'));
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().then((code) => {
    process.exitCode = code ?? 0;
  }).catch((err) => {
    console.error(ui.error(`fatal: ${err.message}`));
    console.error(err.stack);
    process.exitCode = 1;
  });
}
