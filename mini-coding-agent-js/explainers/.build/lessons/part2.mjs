import {
  panel, consoleBlock, callout, statement, card, grid, stepNode, arrow, box, flow,
  kvList, pills, checklist, stats, rules, twoCol,
} from '../helpers.mjs';

const sceneBody = (content) => `<div class="scene-body">${content}</div>`;

const demo = {
  file: 'demo.js',
  name: 'The demo',
  lessonLabel: 'Lesson 04',
  sideSub: 'the same loop, the same guards, no network.',
  footerFacts: '14 scripted steps · 7 sandbox checks',
  h1: 'The talk must work without wifi',
  lede: 'A live agent needs a key, a model and a network. A talk needs none of those. demo.js is a fake model with the same shape as the real one, so --demo exercises every real seam without a single HTTP request.',
  meta: ['8 scenes', '14 scripted steps', '7 sandbox checks', 'no network'],
  scenes: [
    {
      kicker: 'Why this file exists', navTitle: 'Offline loop', duration: 13000,
      title: 'No wifi.<br><em>Same loop.</em>',
      body: sceneBody(twoCol(
        panel('src/demo.js', `export function demoChat() {
  let i = 0;
  return async () => {
    const message = DEMO_SCRIPT[Math.min(i, DEMO_SCRIPT.length - 1)];
    i += 1;
    return {
      choices: [{ finish_reason: message.tool_calls ? 'tool_calls' : 'stop', message }],
    };
  };
}`, { at: 0 }),
        grid([
          card({ at: 1, icon: '🧠', title: 'Same shape', body: 'Returns choices[0].message.' }),
          card({ at: 1, icon: '🔁', title: 'Same loop', body: 'runTask cannot tell the difference.' }),
          card({ at: 1, icon: '🛡️', title: 'Same guards', body: 'The sandbox is still real.' }),
        ], { cols: 1 }),
      ) + statement('A demo is credible when it runs the real program and only replaces the network.', { at: 2 })),
      beats: [
        { at: 0, text: 'demo.js replaces the model, not the loop. The fake chat function has the same return shape.' },
        { at: 4400, text: 'It walks a fixed script, then repeats the final answer so the loop can take its normal exit.' },
        { at: 9600, text: 'Every tool, every hook, every sandbox refusal is still the real implementation.' },
      ],
    },
    {
      kicker: 'The shape of a call', navTitle: 'Tool call', duration: 12500,
      title: 'A tool call is just <em>JSON</em>.',
      body: sceneBody(panel('src/demo.js', `function call(id, name, args) {
  return {
    id,
    type: 'function',
    function: {
      name,
      arguments: JSON.stringify(args),
    },
  };
}`, { at: 0 }) + kvList([
        ['id', 'the matching key for the tool result.'],
        ['type', 'always <code>function</code> in this demo.'],
        ['name', 'the handler to dispatch.'],
        ['arguments', 'a JSON string, exactly as a provider returns it.'],
      ], { at: 1 })),
      beats: [
        { at: 0, text: 'The fake model still has to produce the exact shape the dispatcher expects.' },
        { at: 4500, text: 'A call has an id, a type, a function name, and JSON-encoded arguments.' },
        { at: 9000, text: 'Keeping that shape means the demo never needs a special path through the loop.' },
      ],
    },
    {
      kicker: 'Three acts', navTitle: 'The script', duration: 13500,
      title: 'The script has <em>three acts</em>.',
      body: sceneBody(grid([
        card({ at: 0, icon: '🛠️', title: 'Steps 1–5', tag: 'work', body: 'List, create, run, edit, run again.', accent: '#4f8a5b' }),
        card({ at: 1, icon: '⛔', title: 'Steps 6–12', tag: 'the fence', body: 'Path escape, home write, shell copy, force push, key echo, failing command.', accent: '#c9633f' }),
        card({ at: 2, icon: '🧠', title: 'Steps 13–14', tag: 'survives', body: 'remember and recall - the only effects that outlive the process.', accent: '#b05aa8' }),
      ], { cols: 3 }) + callout('The refusals are shown rather than described. The audience sees the guard hold.', { at: 2 })),
      beats: [
        { at: 0, text: 'The first act is ordinary work: create a file, run it, edit it, run it again.' },
        { at: 4600, text: 'The second act attacks the fence: writes outside the workspace, a shell copy, a force push, a key echo.' },
        { at: 10200, text: 'The third act saves one durable memory and reads it back. That is the only effect that survives.' },
      ],
    },
    {
      kicker: 'Ordinary work', navTitle: 'Steps 1–5', duration: 14000,
      title: 'Look. Create. Run. <em>Edit. Run again.</em>',
      body: sceneBody(consoleBlock('node src/cli.js --demo', `think: Looking first: what is in the workspace...
tool → list_files {"path":"."}
result ← ... 1 folder(s), 2 file(s)

tool → create_file {"path":"demo/hello.js","content":"..."}
result ← created demo/hello.js (72 bytes)

tool → run_command {"command":"node demo/hello.js"}
result ← exit code 0
         ↳ stdout: Hello from a tiny agent

tool → edit_file {"path":"demo/hello.js", ...}
result ← edited demo/hello.js: 1 replacement(s), first at line 1

tool → run_command {"command":"node demo/hello.js"}
result ← exit code 0`, { at: 0 }) + callout('This is the loop an audience already understands: look, act, observe, repeat.', { at: 1 })),
      beats: [
        { at: 0, text: 'The first five steps are the familiar agent story: list, create, run, edit, run again.' },
        { at: 4800, text: 'Each tool call is real. create_file writes a real file; run_command runs a real shell.' },
        { at: 10000, text: 'The demo is not a slideshow. It is the same loop with a scripted model.' },
      ],
    },
    {
      kicker: 'The fence', navTitle: 'The attacks', duration: 15000,
      title: 'Seven attempts.<br><em>Every guard visible.</em>',
      body: sceneBody(checklist([
        { icon: '⛔', title: 'Write ../escape.txt', text: 'refused before touching disk.' },
        { icon: '✅', title: 'Read ../package.json', text: 'allowed: reads are open.' },
        { icon: '⛔', title: 'Write ~/Desktop/pwned.txt', text: 'refused as a home-folder write.' },
        { icon: '⛔', title: 'Shell copy to the Desktop', text: 'refused: a command is not a way round the fence.' },
        { icon: '⛔', title: 'git push --force', text: 'denied by policy, whatever CMD_POLICY says.' },
        { icon: '🔒', title: 'Echo the API key', text: 'the child process sees a short env allow-list.' },
        { icon: '💥', title: 'A failing command', text: 'returns the real exit code and an explanation.' },
      ], { at: 0 }) + statement('The demo proves the guards with the run&#39;s own tool results.', { at: 1, label: 'the point' })),
      beats: [
        { at: 0, text: 'The second act is a list of attacks, and each one produces an observation.' },
        { at: 5600, text: 'Reads are open. Writes, deletes, shell copies, force pushes and key echoes are not.' },
        { at: 11000, text: 'Nobody has to trust a slide: the refusals are in the transcript.' },
      ],
    },
    {
      kicker: 'The scorecard', navTitle: 'Scorecard', duration: 14000,
      title: 'Read the results <em>back</em>.',
      body: sceneBody(panel('src/demo.js', `const DEMO_CHECKS = [
  { id: 's6', label: 'a write that escapes the workspace is refused',
    expect: /^FORBIDDEN: SAVE \\.\\.\\/escape\\.txt/ },
  { id: 's7', label: 'reads are open - one folder up works',
    expect: /^\\.\\.\\/package\\.json \\(\\d+ lines\\)/ },
  { id: 's9', label: 'a shell copy out of the sandbox is refused',
    expect: /^FORBIDDEN: COMMAND COPY / },
  { id: 's11', label: 'the child process cannot see the API key',
    expect: /OPENROUTER_API_KEY=absent/ },
];`, { at: 0 }) + consoleBlock('sandbox checks', `✓ a write that escapes the workspace is refused - FORBIDDEN: SAVE ../escape.txt
✓ reads are open - one folder up works - ../package.json (24 lines)
✓ a shell copy out of the sandbox is refused - FORBIDDEN: COMMAND COPY
✓ the child process cannot see the API key - OPENROUTER_API_KEY=absent
✓ 7/7 sandbox checks held`, { at: 1 })),
      beats: [
        { at: 0, text: 'The scorecard is not a separate claim. It reads the run&#39;s own tool messages.' },
        { at: 4800, text: 'Each check has an id, a label and a regular expression that must match the result.' },
        { at: 10200, text: 'The demo passes only when the guards really held. Otherwise the process exits non-zero.' },
      ],
    },
    {
      kicker: 'The final answer', navTitle: 'The exit', duration: 12500,
      title: 'Repeat the tail, <em>take the exit</em>.',
      body: sceneBody(panel('src/demo.js', `const message = DEMO_SCRIPT[Math.min(i, DEMO_SCRIPT.length - 1)];
i += 1;
return {
  choices: [{ finish_reason: message.tool_calls ? 'tool_calls' : 'stop', message }],
};`, { at: 0 }) + callout('Once the script is exhausted, the fake model keeps returning the final assistant message. The loop sees no tool calls and exits normally.', { at: 1 }) + statement('The demo does not need a special stop condition. It uses the same one as a real run.', { at: 2 })),
      beats: [
        { at: 0, text: 'After the last scripted step, the fake model does not throw or invent a new reply.' },
        { at: 4500, text: 'It repeats the final message. That message has no tool calls, so the loop returns an answer.' },
        { at: 9200, text: 'The demo exits through the same path as a real model. Nothing special is required.' },
      ],
    },
    {
      kicker: 'Recap', navTitle: 'Recap', duration: 11000,
      title: 'Fake the model.<br><em>Keep the program.</em>',
      body: sceneBody(
        stats([['14', 'scripted steps'], ['7', 'guards checked'], ['0', 'network calls']], { at: 0 })
        + rules([
          ['Same shape.', 'The fake model returns the provider envelope.'],
          ['Same guards.', 'Tools and sandbox are untouched.'],
          ['Same exit.', 'No tool calls means an answer.'],
          ['Check the proof.', 'The scorecard reads the run back.'],
        ], { at: 1 })
        + statement('An offline demo is honest when it exercises the real seams.', { at: 2 })
      ),
      beats: [
        { at: 0, text: 'Fourteen scripted steps, seven guard checks, zero network calls.' },
        { at: 4200, text: 'The fake model has the real shape, so the real loop runs unchanged.' },
        { at: 8300, text: 'That is how the demo stays honest when the conference wifi fails.' },
      ],
    },
  ],
};

const heartbeat = {
  file: 'heartbeat.js',
  name: 'The heartbeat',
  lessonLabel: 'Lesson 05',
  sideSub: 'a slow model call must not look like a frozen program.',
  footerFacts: 'one timer · two paths · unref',
  h1: 'Sixty seconds of silence is not a crash',
  lede: 'A model request can legitimately take a minute. On a projector, a minute of silence is indistinguishable from a dead program. heartbeat.js prints one line while the request is in flight, then stops.',
  meta: ['6 scenes', '5s default interval', 'one timer', 'stops on both paths'],
  scenes: [
    {
      kicker: 'Why this file exists', navTitle: 'Liveness', duration: 12500,
      title: 'Silence looks like <em>a crash</em>.',
      body: sceneBody(twoCol(
        panel('src/heartbeat.js', `export function heartbeat(log, everyMs = 5000) {
  const started = Date.now();
  const timer = setInterval(() => {
    const seconds = Math.round((Date.now() - started) / 1000);
    log(ui.waiting('  … still waiting for the model (' + seconds + 's)'));
  }, everyMs);
  timer.unref?.();
  return { stop: () => clearInterval(timer) };
}`, { at: 0 }),
        grid([
          card({ at: 1, icon: '⏱️', title: 'Arm it', body: 'Before the request starts.' }),
          card({ at: 1, icon: '⏳', title: 'Wait', body: 'One line every five seconds.' }),
          card({ at: 1, icon: '🛑', title: 'Stop it', body: 'On success and on failure.' }),
        ], { cols: 1 }),
      ) + statement('Liveness is a separate concern with its own lifecycle. That is why it is not inside the loop.', { at: 2 })),
      beats: [
        { at: 0, text: 'A request can take 60 seconds. Silence on stage looks like a crash.' },
        { at: 4300, text: 'heartbeat starts a timer that prints one readable line every few seconds.' },
        { at: 9400, text: 'It lives outside the loop so runTask still reads as the loop, not the loop plus a stopwatch.' },
      ],
    },
    {
      kicker: 'The timer', navTitle: 'One timer', duration: 13500,
      title: 'One timer.<br><em>One honest line.</em>',
      body: sceneBody(panel('src/heartbeat.js', `const started = Date.now();

const timer = setInterval(() => {
  const seconds = Math.round((Date.now() - started) / 1000);
  log(ui.waiting('  … still waiting for the model (' + seconds + 's)'));
}, everyMs);

return { stop: () => clearInterval(timer) };`, { at: 0 }) + consoleBlock('what the room sees', `── step 1/12 ────────────────────────────
  … still waiting for the model (5s)
  … still waiting for the model (10s)
think: Looking first: what is in the workspace...`, { at: 1 })),
      beats: [
        { at: 0, text: 'The timer captures a start time and prints the elapsed seconds.' },
        { at: 4700, text: 'It returns a tiny handle with one method: stop.' },
        { at: 9800, text: 'The line is deliberately quiet. It says the program is alive without pretending the model is fast.' },
      ],
    },
    {
      kicker: 'The lifecycle', navTitle: 'Arm and stop', duration: 13500,
      title: 'Arm it.<br><em>Stop it on every path.</em>',
      body: sceneBody(
        flow([
          stepNode({ num: 1, icon: '📣', name: 'Announce', note: 'step', accent: '#b05aa8' }),
          arrow(),
          stepNode({ num: 2, icon: '⏱️', name: 'heartbeat()', note: 'arm', accent: '#b9862f' }),
          arrow(),
          stepNode({ num: 3, icon: '🧠', name: 'chatFn', note: 'await', accent: '#b05aa8' }),
          arrow(),
          stepNode({ num: 4, icon: '🛑', name: 'beat.stop()', note: 'finally path', accent: '#4f8a5b' }),
        ], { at: 0 })
        + panel('src/agent.js', `const beat = heartbeat(log, heartbeatMs);
try {
  reply = await chatFn({ messages, tools: TOOL_SCHEMAS });
} catch (err) {
  beat.stop();
  // ...request_failed...
  return { ok: false, reason: 'request_failed', messages };
}
beat.stop();`, { at: 1 })
        + callout('The stop call is repeated on the catch path. A timer that outlives the request would print into the next scene.', { at: 2 })
      ),
      beats: [
        { at: 0, text: 'The loop arms the heartbeat immediately before the model call.' },
        { at: 4700, text: 'On success it stops the timer. On failure it stops the timer first, then returns.' },
        { at: 10300, text: 'Both paths matter. A leaked timer would keep narrating after the run has moved on.' },
      ],
    },
    {
      kicker: 'The unref detail', navTitle: 'unref', duration: 13000,
      title: 'Do not hold the event loop <em>open</em>.',
      body: sceneBody(panel('src/heartbeat.js', `// A timer that holds the event loop open would turn a clean exit into
// a program that hangs for another five seconds.
timer.unref?.();`, { at: 0 }) + checklist([
        { icon: '🧵', title: 'Normal timer', text: 'keeps Node alive until it is cleared.' },
        { icon: '✂️', title: 'unref()', text: 'tells Node this timer does not need to keep the process alive.' },
        { icon: '🏁', title: 'Clean exit', text: 'the process can end immediately when the work is done.' },
      ], { at: 1 }) + callout('Optional chaining keeps the helper usable in environments where the timer handle does not implement unref.', { at: 2 })),
      beats: [
        { at: 0, text: 'This one line is easy to miss and important: unref.' },
        { at: 4400, text: 'A normal interval keeps the Node process alive. A clean exit should not wait for it.' },
        { at: 9300, text: 'unref makes the timer invisible to the event-loop count. The program exits when the work is done.' },
      ],
    },
    {
      kicker: 'The output', navTitle: 'What you see', duration: 12000,
      title: 'A quiet sign of <em>life</em>.',
      body: sceneBody(consoleBlock('a slow request', `── step 3/12 ────────────────────────────
  … still waiting for the model (5s)
  … still waiting for the model (10s)
  … still waiting for the model (15s)
think: Now run it - a real shell, a real exit code.`, { at: 0 }) + statement('The heartbeat is not progress. It is proof that the program has not frozen.', { at: 1, label: 'the point' })),
      beats: [
        { at: 0, text: 'On a slow request the console gains one line every five seconds.' },
        { at: 4500, text: 'When the reply arrives, the lines stop and the normal narration continues.' },
        { at: 9000, text: 'The heartbeat does not claim progress. It only proves the process is alive.' },
      ],
    },
    {
      kicker: 'Recap', navTitle: 'Recap', duration: 10500,
      title: 'A tiny file with a <em>clean lifecycle</em>.',
      body: sceneBody(
        stats([['5s', 'default interval'], ['1', 'timer'], ['2', 'paths stopped']], { at: 0 })
        + rules([
          ['Arm before the wait.', 'Start the timer immediately before the request.'],
          ['Stop on success and failure.', 'Both paths clear the interval.'],
          ['unref the handle.', 'Do not keep a finished program alive.'],
          ['Keep it out of the loop.', 'Liveness is its own concern.'],
        ], { at: 1 })
        + statement('A slow model is not a crash. Say so, quietly, once every few seconds.', { at: 2 })
      ),
      beats: [
        { at: 0, text: 'Five seconds, one timer, two paths stopped.' },
        { at: 4200, text: 'Arm it, wait, stop it on success and failure, and unref the handle.' },
        { at: 8200, text: 'That tiny lifecycle makes a slow model feel like a working program.' },
      ],
    },
  ],
};

const llm = {
  file: 'llm.js',
  name: 'The model call',
  lessonLabel: 'Lesson 06',
  sideSub: 'one plain fetch, a timeout, and readable errors.',
  footerFacts: 'one endpoint · 90s timeout · no SDK',
  h1: 'An agent is one HTTP request in a loop',
  lede: 'No SDK, no framework, no hidden retry policy. llm.js sends one OpenAI-compatible request with fetch, turns failures into sentences, and returns the provider response unchanged.',
  meta: ['7 scenes', 'one POST', '90s default timeout', 'no SDK'],
  scenes: [
    {
      kicker: 'Why this file exists', navTitle: 'One request', duration: 12500,
      title: 'One request.<br><em>That is the model layer.</em>',
      body: sceneBody(twoCol(
        panel('src/llm.js', `const ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_TIMEOUT_MS = 90_000;

export async function chat({ apiKey, model, messages, tools, signal, timeoutMs }) {
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set');
  // ...one fetch...
}`, { at: 0 }),
        grid([
          card({ at: 1, icon: '🧾', title: 'Messages', body: 'The whole conversation.' }),
          card({ at: 1, icon: '🛠️', title: 'Tools', body: 'The schemas the model may call.' }),
          card({ at: 1, icon: '🎛️', title: 'Timeout', body: 'A stalled socket fails.' }),
        ], { cols: 1 }),
      ) + statement('The point of the demo is that an agent is just this HTTP request in a loop.', { at: 2 })),
      beats: [
        { at: 0, text: 'This file is the model layer: one endpoint and one exported function.' },
        { at: 4200, text: 'It receives a key, a model, messages, tools, and a timeout.' },
        { at: 9200, text: 'No SDK. A single fetch is enough to make the whole agent work.' },
      ],
    },
    {
      kicker: 'The request', navTitle: 'POST', duration: 14000,
      title: 'What goes <em>over the wire</em>.',
      body: sceneBody(panel('src/llm.js', `res = await fetch(ENDPOINT, {
  method: 'POST',
  signal: abort,
  headers: {
    Authorization: 'Bearer ' + apiKey,
    'Content-Type': 'application/json',
    'X-Title': 'min-coding-js',
  },
  body: JSON.stringify({ model, messages, tools, max_tokens: 2048 }),
});`, { at: 0 }) + kvList([
        ['method', 'POST'],
        ['auth', 'Bearer key, never logged'],
        ['body', 'model, messages, tools, max_tokens'],
        ['title', 'a small attribution header'],
      ], { at: 1 })),
      beats: [
        { at: 0, text: 'The request is a normal JSON POST. The key travels in an Authorization header.' },
        { at: 4700, text: 'The body carries the model slug, the message array, the tool schemas, and a token cap.' },
        { at: 10000, text: 'There is no hidden prompting and no SDK magic. What you see is what the provider receives.' },
      ],
    },
    {
      kicker: 'Timeouts', navTitle: 'AbortSignal', duration: 14000,
      title: 'A stalled socket must <em>fail</em>.',
      body: sceneBody(panel('src/llm.js', `const timeout = AbortSignal.timeout(timeoutMs);
const abort = signal ? AbortSignal.any([signal, timeout]) : timeout;

try {
  res = await fetch(ENDPOINT, { /* ... */ signal: abort });
  text = await res.text();
} catch (err) {
  if (timeout.aborted) {
    throw new Error('request timed out after ' + Math.round(timeoutMs / 1000) + 's');
  }
  throw err;
}`, { at: 0 }) + callout('AbortSignal.timeout creates the deadline. AbortSignal.any combines it with an optional caller signal.', { at: 1 }) + statement('A hung request is worse than a failed request: it has no error to show and no exit code to explain.', { at: 2 })),
      beats: [
        { at: 0, text: 'The default timeout is 90 seconds. A stalled provider must not hang the session.' },
        { at: 4700, text: 'AbortSignal.timeout creates the deadline, and AbortSignal.any lets the caller add another abort signal.' },
        { at: 10100, text: 'If the timeout fired, the error says so. If something else happened, the original error is rethrown.' },
      ],
    },
    {
      kicker: 'Errors', navTitle: 'Readable failures', duration: 13500,
      title: 'HTTP status becomes a <em>sentence</em>.',
      body: sceneBody(checklist([
        { icon: '401', title: 'Bad key', text: '“OpenRouter 401 (bad or revoked key): ...”' },
        { icon: '402', title: 'No credits', text: '“OpenRouter 402 (out of credits): ...”' },
        { icon: '🧾', title: 'Non-JSON', text: '“OpenRouter returned non-JSON: ...”' },
        { icon: '⚠️', title: 'Provider error', text: '“OpenRouter error: ...”' },
      ], { at: 0 }) + panel('src/llm.js', `if (!res.ok) {
  const hint = res.status === 401 ? ' (bad or revoked key)'
    : res.status === 402 ? ' (out of credits)' : '';
  throw new Error('OpenRouter ' + res.status + hint + ': ' + text.slice(0, 400));
}`, { at: 1 })),
      beats: [
        { at: 0, text: 'The caller should never have to read a raw HTTP body to understand a failure.' },
        { at: 4600, text: '401 says bad key. 402 says out of credits. Other statuses carry the response text.' },
        { at: 9300, text: 'Parsing errors and provider errors get their own messages too.' },
      ],
    },
    {
      kicker: 'Parsing', navTitle: 'JSON', duration: 12000,
      title: 'Trust nothing until it <em>parses</em>.',
      body: sceneBody(panel('src/llm.js', `let json;
try {
  json = JSON.parse(text);
} catch {
  throw new Error('OpenRouter returned non-JSON: ' + text.slice(0, 200));
}
if (json.error) {
  throw new Error('OpenRouter error: ' + JSON.stringify(json.error).slice(0, 400));
}
return json;`, { at: 0 }) + callout('The response is a provider envelope. The loop, not this file, decides what choices[0].message means.', { at: 1 })),
      beats: [
        { at: 0, text: 'The body is parsed explicitly. A proxy or an error page should not become a mysterious downstream crash.' },
        { at: 4400, text: 'A JSON error field is surfaced as a provider error.' },
        { at: 9000, text: 'Otherwise the parsed response is returned unchanged. This layer stays a transport.' },
      ],
    },
    {
      kicker: 'Sanitising', navTitle: 'sanitizeAssistant', duration: 14500,
      title: 'Do not echo the <em>reasoning trace</em>.',
      body: sceneBody(panel('src/llm.js', `export function sanitizeAssistant(message) {
  const out = { role: 'assistant', content: message.content ?? '' };
  if (Array.isArray(message.tool_calls) && message.tool_calls.length > 0) {
    out.tool_calls = message.tool_calls;
    if (message.content == null) delete out.content;
  }
  return out;
}`, { at: 0 }) + checklist([
        { icon: '🧠', title: 'Keep', text: 'role, content, and tool_calls.' },
        { icon: '✂️', title: 'Drop', text: 'reasoning and reasoning_content.' },
        { icon: '🔁', title: 'Why', text: 'otherwise the whole trace is re-sent on every later step.' },
      ], { at: 1 })),
      beats: [
        { at: 0, text: 'Providers may return extra fields, including reasoning traces.' },
        { at: 4700, text: 'sanitizeAssistant rebuilds the assistant message with only the fields an agent needs.' },
        { at: 10400, text: 'Echoing the trace back would re-send it on every later step. The sanitizer prevents that context leak.' },
      ],
    },
    {
      kicker: 'What crosses', navTitle: 'The boundary', duration: 12000,
      title: 'One clean <em>boundary</em>.',
      body: sceneBody(
        flow([
          box('messages + tools'),
          arrow(),
          stepNode({ icon: '🌐', name: 'fetch', note: 'POST', accent: '#b05aa8' }),
          arrow(),
          box('provider JSON'),
          arrow(),
          stepNode({ icon: '🧼', name: 'sanitize', note: 'assistant message', accent: '#4f8a5b' }),
        ], { at: 0 })
        + callout('Everything above this file is provider-shaped. Everything below is plain JavaScript objects.', { at: 1 })
        + statement('The model layer is small on purpose. The agent is the loop around it.', { at: 2 })
      ),
      beats: [
        { at: 0, text: 'The boundary is simple: messages and tools go out, a provider envelope comes back.' },
        { at: 4400, text: 'The loop turns that envelope into an assistant message and sanitises it.' },
        { at: 9000, text: 'Keeping this boundary small is what makes the rest of the agent readable.' },
      ],
    },
    {
      kicker: 'Recap', navTitle: 'Recap', duration: 10500,
      title: 'One fetch. <em>No hidden layers.</em>',
      body: sceneBody(
        stats([['1', 'endpoint'], ['90s', 'default timeout'], ['0', 'SDKs']], { at: 0 })
        + rules([
          ['One request.', 'No hidden retries or model framework.'],
          ['Fail loudly.', 'Timeout, status, non-JSON and provider errors all say what happened.'],
          ['Return the envelope.', 'The loop owns the meaning of choices[0].'],
          ['Sanitise the assistant.', 'Do not re-send reasoning traces.'],
        ], { at: 1 })
        + statement('The model is not a service you integrate. It is a POST request you make.', { at: 2 })
      ),
      beats: [
        { at: 0, text: 'One endpoint, a 90-second default timeout, and no SDK.' },
        { at: 4200, text: 'Fail with readable errors, return the envelope, and sanitise the assistant message.' },
        { at: 8300, text: 'That is the whole model layer.' },
      ],
    },
  ],
};

const prompt = {
  file: 'prompt.js',
  name: 'The system prompt',
  lessonLabel: 'Lesson 07',
  sideSub: 'the rules, the memory block, and prompt engineering you can diff.',
  footerFacts: 'six rules · one memory digest',
  h1: 'Behaviour is text you can read',
  lede: 'A coding agent behaves the way it does because of three pieces of text. prompt.js owns the first: the standing rules, assembled at run time with a bounded memory digest. No prompt engine, no hidden CMS.',
  meta: ['7 scenes', '6 standing rules', '1 memory digest', 'rebuilt every task'],
  scenes: [
    {
      kicker: 'Why this file exists', navTitle: 'Three texts', duration: 12500,
      title: 'Behaviour is <em>three pieces of text</em>.',
      body: sceneBody(grid([
        card({ at: 0, icon: '📜', title: 'System prompt', tag: 'here', body: 'How to work, and what the tools are for.', accent: '#d97757' }),
        card({ at: 0, icon: '🛠️', title: 'Tool descriptions', tag: 'tools.js', body: 'When to reach for each tool.', accent: '#b9862f' }),
        card({ at: 0, icon: '⚠️', title: 'Error strings', tag: 'tools.js', body: 'How to recover from a wrong move.', accent: '#2f9eaa' }),
      ], { cols: 3 }) + statement('This file owns the first piece. Keeping it out of the loop is the point.', { at: 1 })),
      beats: [
        { at: 0, text: 'A coding agent behaves the way it does because of three pieces of text.' },
        { at: 4400, text: 'The system prompt is how to work. Tool descriptions say when. Error strings say how to recover.' },
        { at: 9300, text: 'prompt.js owns the first piece, so agent.js can read as the loop rather than three screens of prose.' },
      ],
    },
    {
      kicker: 'The standing rules', navTitle: 'systemRules', duration: 13500,
      title: 'Six rules, in the order a run <em>needs</em> them.',
      body: sceneBody(checklist([
        { icon: '1', title: 'Look before you write.', text: 'list_files / read_file before editing.' },
        { icon: '2', title: 'Prefer the right write.', text: 'create_file, edit_file, write_file.' },
        { icon: '3', title: 'Copy old_string exactly.', text: 'Every edit must match read_file output.' },
        { icon: '4', title: 'Run what you wrote.', text: 'Read the error, fix it, run again.' },
        { icon: '5', title: 'Do not invent results.', text: 'Stop when done and summarise.' },
        { icon: '6', title: 'Save durable lessons.', text: 'remember facts, not task progress.' },
      ], { at: 0 }) + callout('Written in the second person, in the order a run needs them: look, edit, run, stop, remember.', { at: 1 })),
      beats: [
        { at: 0, text: 'The rules are numbered for a reason. They follow the order a run actually works.' },
        { at: 4600, text: 'Look first, choose the right write tool, copy old_string exactly, then run the result.' },
        { at: 9900, text: 'Stop when done, and save only what will still be true next week.' },
      ],
    },
    {
      kicker: 'Rule 6', navTitle: 'Memory', duration: 13500,
      title: 'Memory is a <em>tool call</em>, not task progress.',
      body: sceneBody(panel('src/prompt.js', `// If you learn something that will still be true next week -
// a command this repo needs, a preference the user stated,
// a trap you fell into - save it with remember.
// Never save task progress: "step 3 of 5" is not a memory,
// and it is worthless to the next run.`, { at: 0 }) + grid([
        card({ at: 1, icon: '✅', title: 'Worth keeping', body: '“npm test needs Node 20.” “Never touch .env.”', accent: '#4f8a5b' }),
        card({ at: 1, icon: '🚫', title: 'Not a memory', body: '“Step 3 of 5.” “File contents.” “A one-off command.”', accent: '#c9633f' }),
      ], { cols: 2 }) + callout('The note appears in the transcript like any other action, so saving is visible and reviewable.', { at: 2 })),
      beats: [
        { at: 0, text: 'Rule six is the interesting one: memory is a tool call, not an internal side effect.' },
        { at: 4500, text: 'Save facts that will still be true next week. Never save task progress.' },
        { at: 9500, text: 'Because it is a tool call, everyone can see what was saved and why.' },
      ],
    },
    {
      kicker: 'Assembly', navTitle: 'buildSystemPrompt', duration: 14000,
      title: 'Rules first.<br><em>Memory second.</em>',
      body: sceneBody(panel('src/prompt.js', `export function buildSystemPrompt({ memory = null, log = null } = {}) {
  const rules = systemRules();
  if (!memory) return rules;

  const digest = memory.digest();
  if (!digest) return rules;

  const injected = digest.split('\\n').filter((line) => line.startsWith('- [')).length;
  log?.(ui.memory(memory.label + ' - ' + injected + ' memories added to the system prompt'));

  return rules + '\\n\\n' + digest;
}`, { at: 0 }) + consoleBlock('before step 1', `memory ← src/memory.md - 2 memories added to the system prompt`, { at: 1 })),
      beats: [
        { at: 0, text: 'buildSystemPrompt starts with the standing rules.' },
        { at: 4400, text: 'If there is no memory, that is the whole system message.' },
        { at: 9000, text: 'If there is a digest, it is appended, and the log says how many memories were carried.' },
      ],
    },
    {
      kicker: 'The digest', navTitle: 'What memory injects', duration: 14000,
      title: 'Bounded twice.<br><em>Honest about what is hidden.</em>',
      body: sceneBody(consoleBlock('the memory block', `## What you remember from earlier runs
These notes live in src/memory.md and were learned before this task started.
Treat them as strong hints, not facts to trust blindly: the code may have moved on since.
- [fact] npm test needs Node 20. _(2026-10-20)_
- [gotcha] .env must never be edited by the agent. _(2026-10-22)_
(3 older memories not shown - search src/memory.md with the recall tool)`, { at: 0 }) + callout('The digest is bounded by entry count and characters, and it names the lazy path: recall.', { at: 1 }) + statement('A bounded prompt is what stops memory from quietly eating the context window.', { at: 2 })),
      beats: [
        { at: 0, text: 'The digest is a small markdown block, not the whole memory file.' },
        { at: 4600, text: 'It is capped by both entry count and characters, so it cannot grow without bound.' },
        { at: 10000, text: 'If older memories were left out, the block says so and points at recall.' },
      ],
    },
    {
      kicker: 'Why this is nice', navTitle: 'Diffable prompts', duration: 12500,
      title: 'Prompt engineering you can <em>diff</em>.',
      body: sceneBody(checklist([
        { icon: '📝', title: 'No template engine', text: 'the prompt is a function of memory and tool names.' },
        { icon: '🧾', title: 'No runtime file', text: 'the rules are in this module, not a CMS.' },
        { icon: '🔍', title: 'No hidden variables', text: 'everything that changes the prompt is an argument.' },
      ], { at: 0 }) + statement('A prompt you can read in the repository is a prompt you can review, test and change deliberately.', { at: 1 })),
      beats: [
        { at: 0, text: 'The prompt is not loaded from a database or assembled by a template engine.' },
        { at: 4300, text: 'It is a function of two things: the tool names and the memory digest.' },
        { at: 8900, text: 'That makes it reviewable. A prompt change is a normal code change.' },
      ],
    },
    {
      kicker: 'Recap', navTitle: 'Recap', duration: 10500,
      title: 'The rules are <em>part of the program</em>.',
      body: sceneBody(
        stats([['6', 'standing rules'], ['1', 'memory digest'], ['0', 'prompt engines']], { at: 0 })
        + rules([
          ['Rules first.', 'The model learns how to work before it learns what is remembered.'],
          ['Memory second.', 'Append only when there is something useful and bounded.'],
          ['Save durable facts.', 'Never task progress.'],
          ['Keep it diffable.', 'A prompt is code you can review.'],
        ], { at: 1 })
        + statement('The system prompt is not magic. It is prose with a clear owner.', { at: 2 })
      ),
      beats: [
        { at: 0, text: 'Six rules, one memory digest, and no prompt engine.' },
        { at: 4200, text: 'Rules first, memory second, durable facts only, and keep it diffable.' },
        { at: 8300, text: 'That is how the agent knows how to work.' },
      ],
    },
  ],
};

export default [demo, heartbeat, llm, prompt];
