import chalk from 'chalk';

/**
 * Terminal language: every helper returns a string.
 *
 * The caller decides whether to print it (usually console.log).
 * Chalk handles TTY / NO_COLOR / FORCE_COLOR automatically.
 */

function firstLine(text, max = 300) {
  const line = (text ?? '').split(/\r?\n/)[0] ?? '';
  return line.length > max ? line.slice(0, max) + ' ...' : line;
}

function extractExitCode(text) {
  const m = text.match(/exit code (\d+)/i);
  return m ? parseInt(m[1], 10) : null;
}

function extractStdout(text) {
  const m = text.match(/stdout:\r?\n([\s\S]*?)(?:\r?\n\r?\nstderr:|\r?\nstderr:|$)/);
  if (!m) return null;
  const lines = m[1].split(/\r?\n/).filter((l) => l.trim() !== '');
  return lines[0] ?? null;
}

export function explainExit(code) {
  const map = {
    1: 'general failure; cause in stderr, fix it.',
    2: 'usage error / bad arguments or missing file.',
    3: 'Python argparse invalid arguments; bash bad builtin.',
    126: 'not executable / permission denied.',
    127: 'command not found / not on PATH.',
    128: 'invalid exit status outside 0–255.',
    129: 'SIGHUP.',
    130: 'SIGINT / Ctrl-C.',
    137: 'SIGKILL / OOM / timeout.',
    143: 'SIGTERM / killed politely.',
    9009: 'Windows cmd "not recognized as a program or batch file".',
  };
  if (map[code]) return map[code];
  if (code >= 129 && code <= 164) {
    return `killed by signal ${code - 128}.`;
  }
  return 'non-zero exit; stdout/stderr say why.';
}

export const ui = {
  title(text) {
    return chalk.bold.cyan(text);
  },

  field(label) {
    return chalk.green(label) + chalk.white(' ›');
  },

  kv(label, value) {
    const padded = String(label).padStart(12, ' ');
    return chalk.blue(padded) + ' ' + chalk.white(String(value));
  },

  step(step, max, width = 40) {
    const label = ` step ${step}/${max} `;
    const pad = Math.max(4, width - label.length);
    const left = Math.floor(pad / 2);
    const right = pad - left;
    return chalk.blue('─'.repeat(left) + label + '─'.repeat(right));
  },

  think(text) {
    return chalk.cyan('think:') + ' ' + chalk.white(text ?? '');
  },

  tool(name, args) {
    const argsStr = typeof args === 'string' ? args : JSON.stringify(args ?? {});
    return (
      chalk.white('tool →') + ' ' +
      chalk.yellow(String(name)) + ' ' +
      chalk.white(argsStr)
    );
  },

  result(text) {
    const first = firstLine(text, 300);
    const isFailure =
      /^ERROR\b/i.test(text) ||
      /^DENIED\b/i.test(text) ||
      /^FORBIDDEN\b/i.test(text);

    const exitCode = extractExitCode(text);
    const hasNonZeroExit = exitCode !== null && exitCode !== 0;

    if (isFailure || hasNonZeroExit) {
      let out = chalk.red('result ← ') + chalk.red(first);
      if (hasNonZeroExit) {
        out += '\n' + chalk.dim(`↳ exit ${exitCode}: ${explainExit(exitCode)}`);
      }
      return out;
    }

    // Success
    let out = chalk.green('result ← ') + chalk.green(first);
    if (exitCode === 0) {
      const stdoutLine = extractStdout(text);
      if (stdoutLine) {
        out +=
          '\n' +
          chalk.dim(`↳ stdout: ${stdoutLine.length > 160 ? stdoutLine.slice(0, 160) + ' ...' : stdoutLine}`);
      }
    }
    return out;
  },

  forbidden(action, requested, reason) {
    return (
      '  ' + chalk.red('⛔ ') +
      chalk.bold.red('FORBIDDEN') + ' ' +
      chalk.bold.white(String(action).toUpperCase()) + ' ' +
      chalk.red(String(requested)) +
      chalk.dim(' - ' + String(reason))
    );
  },

  pass(text) {
    return chalk.green('✔ ' + (text ?? ''));
  },

  fail(text) {
    return chalk.red('✖ ' + (text ?? ''));
  },

  rule(label, width = 44) {
    const pad = Math.max(4, width - label.length - 2);
    const left = Math.floor(pad / 2);
    const right = pad - left;
    return chalk.bold.magenta('─'.repeat(left) + ' ' + label + ' ' + '─'.repeat(right));
  },

  hookTitle(label) {
    return chalk.bold.magenta(label);
  },

  hookLine(icon, name, colour, when, live) {
    const colorFn = chalk[colour] ?? chalk.white;
    const liveTag = live ? ' ' + chalk.green('← attached') : '';
    return `  ${icon}  ${colorFn(name.padEnd(14, ' '))} ${chalk.dim(when)}${liveTag}`;
  },

  hookField(label, value, colour = 'white') {
    const colorFn = chalk[colour] ?? chalk.white;
    return '    ' + chalk.bold(label) + ' ' + colorFn(value);
  },

  hookLive() {
    return '    ' + chalk.green('← attached');
  },

  hookNote(name, text) {
    return chalk.dim(`  [hook note: ${name}] ${text}`);
  },

  hookTrace(icon, name, colour, explanation, detail) {
    const colorFn = chalk[colour] ?? chalk.white;
    return (
      `  ${icon}  ` +
      colorFn(`[HOOK:${name}]`) +
      chalk.white(` ${explanation} - ${detail}`)
    );
  },

  hookFlow(steps) {
    return chalk.dim('  ' + steps);
  },

  memory(text) {
    return chalk.cyan.dim('memory: ' + text);
  },

  exitNote(code, meaning) {
    return chalk.yellow(`exit ${code}: ${meaning}`);
  },

  answerRule() {
    return chalk.bold.green('── final answer ────'.padEnd(44, '─'));
  },

  answer(text) {
    return chalk.green(text ?? '');
  },

  warn(text) {
    return chalk.yellow('warning: ' + (text ?? ''));
  },

  waiting(text) {
    return chalk.dim(text ?? '');
  },

  error(text) {
    return chalk.red('error: ' + (text ?? ''));
  },

  note(text) {
    return chalk.cyan.dim('note: ' + (text ?? ''));
  },

  prompt(label) {
    return chalk.green(label) + ' ' + chalk.white('›');
  },

  dim(text) {
    return chalk.dim(text ?? '');
  },
};
