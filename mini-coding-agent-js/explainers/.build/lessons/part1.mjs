import {
  esc, panel, consoleBlock, callout, statement, card, grid, navNode, stepNode,
  arrow, box, flow, kvList, pills, checklist, stats, rules, twoCol,
} from '../helpers.mjs';

const sceneBody = (content) => `<div class="scene-body">${content}</div>`;

const agent = {
  file: 'agent.js',
  name: 'The agent loop',
  lessonLabel: 'Lesson 01',
  sideSub: 'the model, the tools, the loop, and the seven beats of one step.',
  footerFacts: 'one function · seven beats · nine hook sites',
  h1: 'The loop is the whole agent',
  lede: 'Everything else in src exists to serve this one function. It assembles a request, asks the model, dispatches the tools it asks for, and feeds every result back. This is the file that turns text into action.',
  meta: ['9 scenes', '7 beats per step', '9 hook call sites', 'one exported function'],
  scenes: [
    {
      kicker: 'The whole idea', navTitle: 'One function', duration: 13000,
      title: 'One function.<br><em>Seven beats.</em>',
      body: sceneBody(twoCol(
        panel('src/agent.js', `export async function runTask({
  task, workspace, sandbox = null, commandPolicy, maxSteps, chatFn,
  hooks = null, memory = null, history = [], log = console.log,
}) {
  const messages = [
    { role: 'system', content: buildSystemPrompt({ memory, log }) },
    ...history.filter((m) => m.role !== 'system'),
    { role: 'user', content: task },
  ];
  // ...seven beats, once per step...
}`, { at: 0 }),
        grid([
          card({ at: 1, icon: '🧠', title: 'The model', body: 'One text-in, text-out request.', accent: '#b05aa8' }),
          card({ at: 1, icon: '🛠️', title: 'The tools', body: 'The model asks; the dispatcher acts.', accent: '#b9862f' }),
          card({ at: 1, icon: '🔁', title: 'The loop', body: 'Every observation goes back in.', accent: '#4f8a5b' }),
        ], { cols: 1 }),
      ), statement('An agent is not a special kind of program. It is a loop with a model call and a tool dispatcher.', { at: 2 })),
      beats: [
        { at: 0, text: 'This is the whole agent: one exported function, no flags, no colours, no process concerns.' },
        { at: 4100, text: 'Three things matter: a model that produces text, tools that do work, and a loop that feeds results back.' },
        { at: 8700, text: 'Everything else in src/ serves this function. That is the shape of the whole program.' },
      ],
    },
    {
      kicker: 'The contract', navTitle: 'What goes in', duration: 14500,
      title: 'What goes <em>in</em>.',
      body: sceneBody(kvList([
        ['task', 'The user request.'],
        ['workspace', 'Where relative reads start, and what writes may not leave.'],
        ['sandbox', 'The write fence. Created if not supplied.'],
        ['commandPolicy', '<code>allow</code> · <code>ask</code> · <code>deny</code>'],
        ['maxSteps', 'How many model calls this run may make.'],
        ['chatFn', 'The one model request. Injected, so tests can run offline.'],
        ['hooks', 'The nine lifecycle moments. Optional.'],
        ['memory', 'What survives this process. Optional.'],
        ['history', 'Messages carried from the previous task in a session.'],
      ], { at: 0 }) + callout('Every dependency is injected. That is why the tests can run the real loop with a fake model and no network.', { at: 1 })),
      beats: [
        { at: 0, text: 'Every dependency arrives as an option. The loop never reaches for a global.' },
        { at: 5000, text: 'chatFn is the seam that makes the loop testable: a fake model can return a fixed tool call.' },
        { at: 10300, text: 'The result is a small object: ok, a reason when it failed, the answer, messages, and the step count.' },
      ],
    },
    {
      kicker: 'The seven beats', navTitle: 'One step', duration: 15500,
      title: 'One step, <em>seven beats</em>.',
      body: sceneBody(
        flow([
          stepNode({ num: 1, icon: '📣', name: 'Announce', note: 'arm heartbeat', accent: '#b05aa8' }),
          arrow(),
          stepNode({ num: 2, icon: '🧠', name: 'Model call', note: 'messages + tools', accent: '#b05aa8' }),
          arrow(),
          stepNode({ num: 3, icon: '✂️', name: 'Check truncation', note: 'finish_reason', accent: '#b9862f' }),
        ], { at: 0 })
        + flow([
          stepNode({ num: 4, icon: '💬', name: 'Push assistant', note: 'history', accent: '#2f9eaa' }),
          arrow(),
          stepNode({ num: 5, icon: '🏁', name: 'No calls?', note: 'answer + return', accent: '#4f8a5b' }),
          arrow(),
          stepNode({ num: 6, icon: '🛠️', name: 'Dispatch', note: 'each tool', accent: '#b9862f' }),
          arrow(),
          stepNode({ num: 7, icon: '🔁', name: 'Loop', note: 'with observations', accent: '#4f8a5b' }),
        ], { at: 1 })
        + callout('A truncated reply is half a tool call, so it is never dispatched. The model is asked to continue smaller.', { at: 2 })
      ),
      beats: [
        { at: 0, text: 'The first three beats: announce the step, arm the heartbeat, and make one model call.' },
        { at: 5400, text: 'Then push the assistant reply into history, check for tool calls, dispatch each one, and loop.' },
        { at: 10400, text: 'No tool calls means the model is finished. Print the answer and return. That is the exit.' },
      ],
    },
    {
      kicker: 'Messages are memory', navTitle: 'History', duration: 13500,
      title: 'The conversation is the <em>state</em>.',
      body: sceneBody(
        panel('src/agent.js', `const messages = [
  { role: 'system', content: buildSystemPrompt({ memory, log }) },
  ...history.filter((m) => m.role !== 'system'),
  { role: 'user', content: task },
];
const taskIndex = messages.length - 1;`, { at: 0 })
        + checklist([
          { icon: '🧱', title: 'System prompt', text: 'rebuilt for every task, so new memory is in front of the model.' },
          { icon: '🧵', title: 'History', text: 'the previous conversation, without its old system message.' },
          { icon: '✍️', title: 'New task', text: 'the last message, and the one a hook may rewrite.' },
        ], { at: 1 })
        + callout('There is no separate memory object inside the run. The message array <em>is</em> the short-term memory.', { at: 2 })
      ),
      beats: [
        { at: 0, text: 'The loop keeps no secret state. It keeps messages.' },
        { at: 4400, text: 'The system prompt is rebuilt here, not carried in history, so memory written by the last task is already visible.' },
        { at: 9200, text: 'A hook can rewrite the task at taskIndex before the model ever sees it.' },
      ],
    },
    {
      kicker: 'The loop in code', navTitle: 'The for loop', duration: 15000,
      title: 'One <em>for</em> loop.',
      body: sceneBody(
        panel('src/agent.js', `for (let step = 1; step <= maxSteps; step += 1) {
  const opening = await hook.run('PreModel', { step, maxSteps, messages, tools: TOOL_SCHEMAS });

  const beat = heartbeat(log, heartbeatMs);
  reply = await chatFn({ messages, tools: TOOL_SCHEMAS });
  beat.stop();

  const choice = reply?.choices?.[0] ?? {};
  const message = choice.message ?? {};
  // ...dispatch or answer...
}`, { at: 0 })
        + callout('The heartbeat is armed before the request and stopped on every path. A slow model must not look like a frozen program.', { at: 1 })
        + statement('The loop is deliberately boring: one counter, one request, one dispatcher.', { at: 2, label: 'the design' })
      ),
      beats: [
        { at: 0, text: 'The loop is one for statement. The step budget is the first bound.' },
        { at: 4600, text: 'Before the request, PreModel fires. Then the heartbeat starts, the model is asked, and the heartbeat stops.' },
        { at: 10300, text: 'Nothing is hidden in a framework. You can read the whole control flow on one screen.' },
      ],
    },
    {
      kicker: 'Lifecycle', navTitle: 'Hook sites', duration: 15000,
      title: 'Nine places to <em>get a turn</em>.',
      body: sceneBody(
        pills(['SessionStart', 'UserPromptSubmit', 'PreModel', 'PostModel', 'PreToolUse', 'PostToolUse', 'Stop', 'StepLimit', 'SessionEnd'], { at: 0 })
        + grid([
          card({ at: 1, icon: '🚀', title: 'Before the first request', body: 'SessionStart and UserPromptSubmit can refuse or rewrite.', accent: '#2f9eaa' }),
          card({ at: 1, icon: '🔁', title: 'Every step', body: 'PreModel, PostModel, PreToolUse, PostToolUse.', accent: '#b05aa8' }),
          card({ at: 2, icon: '🏁', title: 'At the end', body: 'Stop or StepLimit, then SessionEnd always.', accent: '#c9633f' }),
        ], { cols: 3 })
        + callout('The hook calls cost nothing when no handlers are attached. That is why the loop can carry all nine.', { at: 2 })
      ),
      beats: [
        { at: 0, text: 'The nine hook names are the lifecycle. Each one is a call site in this file.' },
        { at: 4800, text: 'Two fire before the first request, four inside every step, and three at the end.' },
        { at: 10000, text: 'With no hooks attached, each call returns an empty decision and the loop carries on.' },
      ],
    },
    {
      kicker: 'Dispatch', navTitle: 'Tool results', duration: 14500,
      title: 'Every call gets a <em>result</em>.',
      body: sceneBody(
        panel('src/agent.js', `const pre = await hook.run('PreToolUse', { name, args: rawArgs, step });
const result = pre.blocked
  ? 'DENIED: a PreToolUse hook blocked this call. Try another approach.'
  : await runTool(name, rawArgs, ctx);

const post = await hook.run('PostToolUse', { name, result, step, ok });
messages.push({
  role: 'tool',
  tool_call_id: call.id,
  content: String(post.replace ?? result),
});`, { at: 0 })
        + callout('A refusal is still an observation. The model gets a matching tool message and a chance to choose another route.', { at: 1 })
        + statement('A <code>tool_call_id</code> without a tool result makes the next request invalid. The loop never leaves one behind.', { at: 2, label: 'the invariant' })
      ),
      beats: [
        { at: 0, text: 'Dispatch is three decisions: may it run, what did it return, and what does the model read back?' },
        { at: 4800, text: 'A PreToolUse block becomes a DENIED string, not an exception. PostToolUse may replace the observation.' },
        { at: 10200, text: 'Whatever happens, every tool call gets exactly one tool message. That invariant keeps the next request valid.' },
      ],
    },
    {
      kicker: 'How it ends', navTitle: 'Endings', duration: 13000,
      title: 'Three ways a run <em>stops</em>.',
      body: sceneBody(grid([
        card({ at: 0, icon: '🏁', title: 'Answer', tag: 'ok', body: 'No tool calls. Stop fires, then SessionEnd. The result is <code>ok: true</code>.', accent: '#4f8a5b' }),
        card({ at: 0, icon: '⏳', title: 'Step limit', tag: 'max_steps', body: 'The budget runs out. StepLimit fires, then SessionEnd.', accent: '#b9862f' }),
        card({ at: 0, icon: '💥', title: 'Request failed', tag: 'request_failed', body: 'The model call threw. SessionEnd still fires.', accent: '#c9633f' }),
      ], { cols: 3 }) + callout('Failures get the same lifecycle as successes. SessionEnd is the finally block of the run.', { at: 1 })),
      beats: [
        { at: 0, text: 'A run ends with an answer, with the step limit, or with a failed request.' },
        { at: 5000, text: 'Stop is the happy path. StepLimit and request_failed are the failure paths.' },
        { at: 9300, text: 'SessionEnd runs in every case. Cleanup, timing and audit logs have one reliable home.' },
      ],
    },
    {
      kicker: 'Recap', navTitle: 'Recap', duration: 12000,
      title: 'The loop is the <em>program</em>.',
      body: sceneBody(
        stats([['1', 'exported function'], ['7', 'beats per step'], ['9', 'hook moments']], { at: 0 })
        + rules([
          ['Injected dependencies.', 'The loop never reaches for a global.'],
          ['Messages are the state.', 'System prompt, history, task, observations.'],
          ['Every call gets a result.', 'A tool_call_id never goes unanswered.'],
          ['Endings have a lifecycle.', 'Stop, StepLimit, request_failed, then SessionEnd.'],
        ], { at: 1 })
        + statement('Read agent.js first. Every other file exists to make one of its beats possible.', { at: 2, label: 'next' })
      ),
      beats: [
        { at: 0, text: 'One function, seven beats, nine hook moments.' },
        { at: 4300, text: 'The loop injects its dependencies, keeps state in messages, and never leaves a tool call unanswered.' },
        { at: 8300, text: 'Read agent.js first. The rest of src is the detail behind its beats.' },
      ],
    },
  ],
};

const cli = {
  file: 'cli.js',
  name: 'The CLI',
  lessonLabel: 'Lesson 02',
  sideSub: 'flags, sessions, confirmations, side doors and exit codes.',
  footerFacts: 'one program · three exit paths · four commands',
  h1: 'The program around the loop',
  lede: 'agent.js is a library. Everything a person needs in order to run it lives here: argument parsing, the banner, the task prompt, the y/N confirmation, the demo and hook side doors, and the exit codes.',
  meta: ['9 scenes', '4 exit codes', '3 side doors', 'MAX_HISTORY 24'],
  scenes: [
    {
      kicker: 'Why this file exists', navTitle: 'The wrapper', duration: 13000,
      title: 'The loop is a library.<br><em>This is the program.</em>',
      body: sceneBody(twoCol(
        panel('src/cli.js', `import { runTask } from './agent.js';

const result = await runTask({ ...base, task });
process.exitCode = taskExitCode(result);`, { at: 0 }),
        grid([
          card({ at: 1, icon: '⌨️', title: 'What can I type?', body: 'Flags, --help, the task field.' }),
          card({ at: 1, icon: '🏷️', title: 'What won?', body: 'The banner shows key, model and policy.' }),
          card({ at: 1, icon: '🚪', title: 'Side doors', body: '--demo, --hooks, --memory.' }),
        ], { cols: 1 }),
      ) + statement('Nothing in agent.js knows a flag name, a colour, or an exit code. That separation is the design.', { at: 2 })),
      beats: [
        { at: 0, text: 'agent.js answers: what is the loop? cli.js answers: what does a person type?' },
        { at: 4300, text: 'It parses flags, loads config, builds the workspace, sandbox and memory, then calls runTask.' },
        { at: 9400, text: 'The loop stays a library. The CLI owns every process concern around it.' },
      ],
    },
    {
      kicker: 'The surface area', navTitle: 'Flags', duration: 14000,
      title: 'The whole <em>command surface</em>.',
      body: sceneBody(
        pills(['--demo', '--yes / -y', '--model', '--max-steps', '--allow-commands', '--hooks', '--memory', '--no-memory', '--trace-hooks', '--no-hooks', '--help / -h'], { at: 0 })
        + grid([
          card({ at: 1, icon: '▶️', title: 'Run', body: 'A task argument runs once. No task means a session.' }),
          card({ at: 1, icon: '🛡️', title: 'Bounds', body: '--max-steps, --allow-commands, --yes.' }),
          card({ at: 2, icon: '🔎', title: 'Explain', body: '--hooks prints the lifecycle; --memory prints the store.' }),
          card({ at: 2, icon: '🧪', title: 'Offline', body: '--demo runs the whole loop with a scripted model.' }),
        ], { cols: 2 })
      ),
      beats: [
        { at: 0, text: 'Every flag is parsed by hand. There is no command framework hiding the surface.' },
        { at: 4400, text: 'The first group runs tasks and bounds them. The second group explains the program itself.' },
        { at: 9200, text: 'Anything that is not a flag becomes the task, so quoting is optional.' },
      ],
    },
    {
      kicker: 'Argument parsing', navTitle: 'parseArgs', duration: 13500,
      title: 'Flags in. Task out.',
      body: sceneBody(panel('src/cli.js', `for (let i = 0; i < argv.length; i += 1) {
  const a = argv[i];
  if (a === '--demo') opts.demo = true;
  else if (a === '--model') opts.model = argv[++i];
  else if (a === '--max-steps') opts.maxSteps = Number(argv[++i]);
  else if (a === '--hooks') opts.showHooks = true;
  else if (a === '--memory') opts.showMemory = true;
  else if (a === '--help' || a === '-h') opts.help = true;
  else words.push(a);
}
opts.task = words.join(' ').trim();`, { at: 0 })
        + callout('No option library, no hidden defaults. The same loop also feeds the banner and the usage text.', { at: 1 })),
      beats: [
        { at: 0, text: 'parseArgs walks argv once. A flag sets an option; anything else is collected as the task.' },
        { at: 4700, text: 'Flags that take a value consume the next argument. Everything else joins into the task words.' },
        { at: 9200, text: 'The result is one plain object. That object is the whole command line surface.' },
      ],
    },
    {
      kicker: 'Two shapes of run', navTitle: 'One shot or session', duration: 14000,
      title: 'One shot, or <em>stay in the room</em>.',
      body: sceneBody(
        flow([
          stepNode({ num: 1, icon: '📝', name: 'Task?', note: 'argument or --demo', accent: '#b05aa0' }),
          arrow(),
          box('one runTask'),
          arrow(),
          stepNode({ num: 2, icon: '🏁', name: 'Exit', note: 'taskExitCode', accent: '#4f8a5b' }),
        ], { at: 0 })
        + flow([
          stepNode({ num: 1, icon: '⌨️', name: 'No task', note: 'stdin is a TTY', accent: '#2f9eaa' }),
          arrow(),
          stepNode({ num: 2, icon: '🔁', name: 'runSession', note: 'task after task', accent: '#b05aa8' }),
          arrow(),
          stepNode({ num: 3, icon: '🧵', name: 'Carry history', note: 'trimHistory', accent: '#b9862f' }),
        ], { at: 1 })
        + callout('No task and no TTY is not a crash: it is exit code 2, with a sentence explaining what to do instead.', { at: 2 })
      ),
      beats: [
        { at: 0, text: 'A task argument means one shot: run it, map the result to an exit code, leave.' },
        { at: 4700, text: 'No task and a terminal means a session: read a task, run it, keep the conversation, ask again.' },
        { at: 10000, text: 'No task and no terminal is exit code 2. The program says what to type instead of hanging.' },
      ],
    },
    {
      kicker: 'Session memory', navTitle: 'trimHistory', duration: 14500,
      title: 'Carry the conversation, <em>not the system prompt</em>.',
      body: sceneBody(panel('src/cli.js', `export function trimHistory(messages, max = MAX_HISTORY) {
  const kept = (messages ?? []).filter((m) => m.role !== 'system');
  let start = Math.max(0, kept.length - Math.max(0, max));
  while (start < kept.length && kept[start].role !== 'user') start += 1;
  return start >= kept.length ? [] : kept.slice(start);
}`, { at: 0 })
        + checklist([
          { icon: '🚫', title: 'Drop system', text: 'it is rebuilt inside runTask.' },
          { icon: '✂️', title: 'Keep the tail', text: 'at most MAX_HISTORY messages.' },
          { icon: '👤', title: 'Cut on user', text: 'never start on a tool result or unanswered tool call.' },
        ], { at: 1 })),
      beats: [
        { at: 0, text: 'The next task needs the conversation, but not the old system prompt.' },
        { at: 4800, text: 'trimHistory keeps the tail and starts on a user message. Providers reject any other boundary.' },
        { at: 10000, text: 'That is why a follow-up like "now add tests" still knows what was just built.' },
      ],
    },
    {
      kicker: 'Exit codes', navTitle: 'Exit codes', duration: 12000,
      title: 'Failure gets a <em>sentence</em>.',
      body: sceneBody(kvList([
        ['0', 'Finished. The model gave a final answer, or the session ended.'],
        ['1', 'The run did not finish: request failed, timeout, bad key, fatal error.'],
        ['2', 'No task, and stdin is not a terminal. Nothing ran.'],
        ['3', 'The step limit was reached before an answer.'],
      ], { at: 0 }) + callout('A non-zero exit is the last thing anyone reads, so it gets a plain-English note instead of a number.', { at: 1 })),
      beats: [
        { at: 0, text: 'The CLI has four outcomes. Each one has a number and a reason.' },
        { at: 4500, text: 'Exit 1 is a failed request, 2 is no way to ask, 3 is the step budget.' },
        { at: 9200, text: 'main() prints the meaning of the code after the run, so the last line is actionable.' },
      ],
    },
    {
      kicker: 'Human in the loop', navTitle: 'Confirmation', duration: 13000,
      title: 'An unanswerable prompt is <em>not approval</em>.',
      body: sceneBody(panel('src/cli.js', `function makeConfirm() {
  return async (command) => {
    if (!process.stdin.isTTY) return 'deny';

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = await new Promise((resolve) =>
      rl.question('run? ' + command + ' [y/N] ', resolve));
    rl.close();
    return /^y(es)?$/i.test(answer.trim()) ? 'allow' : 'deny';
  };
}`, { at: 0 })
        + callout('Piped input degrades to deny. The ask policy asks a person, not a stream of bytes.', { at: 1 })),
      beats: [
        { at: 0, text: 'When CMD_POLICY is ask, every command stops at a y/N prompt.' },
        { at: 4600, text: 'No TTY means nobody can answer, so the answer is deny, never allow.' },
        { at: 9300, text: 'Only an explicit yes runs the command. Everything else refuses.' },
      ],
    },
    {
      kicker: 'Side doors', navTitle: 'Side doors', duration: 14000,
      title: 'Three doors that need <em>no key</em>.',
      body: sceneBody(grid([
        card({ at: 0, icon: '🧪', title: '--demo', tag: 'offline', body: 'A scripted model runs the real loop, tools and sandbox guards.', accent: '#4f8a5b' }),
        card({ at: 0, icon: '🪝', title: '--hooks', tag: 'catalogue', body: 'Prints every lifecycle moment, icon, colour and reason.', accent: '#b9862f' }),
        card({ at: 0, icon: '🧠', title: '--memory', tag: 'store', body: 'Prints the file and exactly what the prompt injects.', accent: '#b05aa8' }),
      ], { cols: 3 })
        + consoleBlock('node src/cli.js --demo', `task      : Show the loop, then try to break the sandbox...
🚀 [HOOK:SessionStart] once, before the first model call
🧠 [HOOK:PreModel] before every model call - step 1/13
...`, { at: 1 })
        + callout('The side doors describe the program without requiring a model, a key, or a network.', { at: 2 })),
      beats: [
        { at: 0, text: 'Three flags exist only to explain the program: demo, hooks, and memory.' },
        { at: 4600, text: '--demo runs the real loop with a fake model. --hooks and --memory print their own lessons.' },
        { at: 10000, text: 'None of them needs a key or a network, which makes them safe on stage.' },
      ],
    },
    {
      kicker: 'Recap', navTitle: 'Recap', duration: 11500,
      title: 'The CLI owns the <em>edges</em>.',
      body: sceneBody(
        stats([['4', 'exit codes'], ['3', 'side doors'], ['24', 'history max']], { at: 0 })
        + rules([
          ['Parse by hand.', 'One pass over argv, no hidden command framework.'],
          ['Map results to codes.', '0, 1, 2 and 3 each have a sentence.'],
          ['Ask a person.', 'No TTY means deny, never allow.'],
          ['Keep the conversation.', 'trimHistory cuts only on a user message.'],
        ], { at: 1 })
        + statement('The loop stays readable because this file owns everything around it.', { at: 2 })
      ),
      beats: [
        { at: 0, text: 'Four exit codes, three side doors, and one conversation carried between tasks.' },
        { at: 4200, text: 'The CLI parses, explains, asks, bounds, and maps results to process codes.' },
        { at: 8300, text: 'That is the whole program around the loop.' },
      ],
    },
  ],
};

const config = {
  file: 'config.js',
  name: 'Configuration',
  lessonLabel: 'Lesson 03',
  sideSub: 'one place reads the environment and reports what won.',
  footerFacts: 'five sources · one config object',
  h1: 'One place reads the environment',
  lede: 'The rest of the program should never wonder where a key, a model or a limit came from. config.js resolves every setting once, records its source, and hands the loop a plain object.',
  meta: ['9 scenes', '5 config sources', '.env wins', 'key never logged'],
  scenes: [
    {
      kicker: 'Why this file exists', navTitle: 'One reader', duration: 12500,
      title: 'One reader.<br><em>Every setting.</em>',
      body: sceneBody(twoCol(
        panel('src/config.js', `const config = loadConfig({ model: opts.model });
const workspace = new Workspace(config.workspaceRoot);
const sandbox = new Sandbox({ workspace, log: console.log });
const memory = new Memory({ root: config.projectRoot, file: config.memoryFile });`, { at: 0 }),
        grid([
          card({ at: 1, icon: '🔑', title: 'Credentials', body: 'Key and model, with their source.' }),
          card({ at: 1, icon: '📁', title: 'Paths', body: 'Workspace and memory file.' }),
          card({ at: 1, icon: '📏', title: 'Bounds', body: 'Steps, timeout, policy, memory caps.' }),
        ], { cols: 1 }),
      ) + statement('Every environment read happens here. The rest of the program receives values and provenance.', { at: 2 })),
      beats: [
        { at: 0, text: 'config.js is the only file that reads process.env and the only file that parses .env.' },
        { at: 4200, text: 'It resolves credentials, paths, policies and budgets into one plain object.' },
        { at: 9100, text: 'The loop receives the result. It never asks where a value came from.' },
      ],
    },
    {
      kicker: 'Precedence', navTitle: 'Precedence', duration: 13500,
      title: 'What wins, <em>in order</em>.',
      body: sceneBody(
        flow([
          stepNode({ num: 1, icon: '🚩', name: 'Overrides', note: 'CLI flags', accent: '#d97757' }),
          arrow(),
          stepNode({ num: 2, icon: '📄', name: '.env', note: 'nearest file', accent: '#b9862f' }),
          arrow(),
          stepNode({ num: 3, icon: '🐚', name: 'Shell', note: 'inherited', accent: '#2f9eaa' }),
          arrow(),
          stepNode({ num: 4, icon: '🧱', name: 'Defaults', note: 'built in', accent: '#8c877c' }),
        ], { at: 0 })
        + callout('<code>.env</code> deliberately wins over the shell. A stale exported key must not silently outrank the project file.', { at: 1 })
        + statement('The banner can say not just what won, but which source won.', { at: 2 })
      ),
      beats: [
        { at: 0, text: 'Precedence is explicit overrides, then the nearest .env, then the shell, then defaults.' },
        { at: 4500, text: 'The .env choice is deliberate: a stale shell variable should not shadow the project file.' },
        { at: 9800, text: 'The returned object includes source fields, so the banner can explain the decision.' },
      ],
    },
    {
      kicker: 'Finding the file', navTitle: 'findEnvFile', duration: 14000,
      title: 'Walk up until a <em>.env</em> appears.',
      body: sceneBody(panel('src/config.js', `export function findEnvFile(startDir = PROJECT_ROOT) {
  let dir = path.resolve(startDir);
  for (; ;) {
    const candidate = path.join(dir, '.env');
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}`, { at: 0 })
        + checklist([
          { icon: '📍', title: 'Start here', text: 'the package root.' },
          { icon: '⬆️', title: 'Walk up', text: 'so a repo-level .env is found.' },
          { icon: '🛑', title: 'Stop at root', text: 'return null when the filesystem ends.' },
        ], { at: 1 })),
      beats: [
        { at: 0, text: 'A meetup repo may keep its .env beside the package or at the repository root.' },
        { at: 4700, text: 'findEnvFile starts at the package, checks each parent, and stops at the filesystem root.' },
        { at: 9800, text: 'The nearest .env wins. That single rule removes a lot of afternoon debugging.' },
      ],
    },
    {
      kicker: 'Parsing .env', navTitle: 'loadDotEnv', duration: 14000,
      title: 'Small parser.<br><em>Clear rules.</em>',
      body: sceneBody(panel('src/config.js', `const m = line.match(/^\\s*(?:export\\s+)?([A-Za-z_][A-Za-z0-9_]*)\\s*=\\s*(.*)$/);
if (!m) continue;

const name = m[1];
const value = m[2].trim().replace(/^["'](.*)["']$/, '$1').trim();
if (!value) continue;

process.env[name] = value; // .env overrides the shell
fromFile[name] = value;`, { at: 0 })
        + grid([
          card({ at: 1, icon: '💬', title: 'Comments', body: 'Lines starting with # are skipped.' }),
          card({ at: 1, icon: '✂️', title: 'Quotes', body: 'Matched surrounding quotes are stripped.' }),
          card({ at: 1, icon: '🚫', title: 'Empty', body: 'Empty values are ignored, not stored.' }),
        ], { cols: 3 })
        + callout('The parser returns only the keys that came from the file, so provenance stays honest.', { at: 2 })),
      beats: [
        { at: 0, text: 'The .env parser is intentionally tiny: KEY=VALUE, optional export, comments and quotes.' },
        { at: 4700, text: 'It writes each value into process.env, and records that the value came from the file.' },
        { at: 10000, text: 'Empty values are skipped. The returned map is what makes the source reporting possible.' },
      ],
    },
    {
      kicker: 'Secrets', navTitle: 'fingerprint', duration: 12000,
      title: 'Never log the <em>key</em>.',
      body: sceneBody(panel('src/config.js', `export function fingerprint(secret) {
  if (!secret) return 'not set';
  if (secret.length <= 12) return '*'.repeat(secret.length) + ' (' + secret.length + ' chars)';
  return secret.slice(0, 5) + '...' + secret.slice(-4) + ' (' + secret.length + ' chars)';
}`, { at: 0 })
        + consoleBlock('the banner', `key      : sk-or...a1b2 (73 chars) from .env
key      : not set`, { at: 1 })
        + callout('A prefix, a suffix and a length are enough to tell keys apart without putting the secret in a transcript.', { at: 2 })),
      beats: [
        { at: 0, text: 'The banner needs to show which key is in use, but a key must never be logged.' },
        { at: 4300, text: 'fingerprint keeps five characters, the last four, and the length.' },
        { at: 8700, text: 'That is enough to debug a bad key without leaking it into a screenshot.' },
      ],
    },
    {
      kicker: 'Model names', navTitle: 'normalizeModel', duration: 14500,
      title: 'A bare model name is <em>not a slug</em>.',
      body: sceneBody(panel('src/config.js', `const VENDOR_BY_PREFIX = [
  [/^deepseek/i, 'deepseek'],
  [/^claude/i, 'anthropic'],
  [/^(gpt|o[13458]|chatgpt)/i, 'openai'],
  [/^gemini/i, 'google'],
  [/^grok/i, 'x-ai'],
  [/^llama/i, 'meta-llama'],
  [/^qwen/i, 'qwen'],
  [/^mistral|^mixtral/i, 'mistralai'],
];`, { at: 0 })
        + callout('OpenRouter requires vendor/model. A .env carried from another project often holds a bare name, so the obvious prefixes are expanded instead of failing with a 400.', { at: 1 })
        + consoleBlock('example', `claude-sonnet-4.5  ->  anthropic/claude-sonnet-4.5
gpt-4o-mini         ->  openai/gpt-4o-mini
already/a-slug      ->  unchanged`, { at: 2 })),
      beats: [
        { at: 0, text: 'OpenRouter wants vendor/model, but old .env files often carry a bare name.' },
        { at: 4900, text: 'The prefix table maps the obvious families. An explicit provider prefix overrides it.' },
        { at: 10300, text: 'A name that already contains a slash is left alone, and the config records that it normalised.' },
      ],
    },
    {
      kicker: 'Provenance', navTitle: 'What won', duration: 13500,
      title: 'The config remembers <em>where it came from</em>.',
      body: sceneBody(panel('src/config.js', `return {
  apiKey,
  apiKeySource: overrides.apiKey ? 'override' : sourceOf('OPENROUTER_API_KEY', keyFromFile),
  apiKeyOverrodeShell: replaced(keyFromFile, inherited.apiKey),
  model,
  modelSource: overrides.model ? 'flag' : sourceOf('OPENROUTER_MODEL', modelFromFile),
  modelOverrodeShell: replaced(modelFromFile, inherited.model),
  modelNormalised: normalised,
  // ...paths, policy, budgets, memory...
};`, { at: 0 })
        + checklist([
          { icon: '🏷️', title: 'Source', text: '.env, environment, flag, override, or not set.' },
          { icon: '⚠️', title: 'Shadowing', text: 'whether .env replaced a different shell value.' },
          { icon: '🔤', title: 'Normalised', text: 'whether a bare model name was expanded.' },
        ], { at: 1 })),
      beats: [
        { at: 0, text: 'The config does not just return values. It returns where each important value came from.' },
        { at: 4600, text: 'The banner can say "from .env" or "overrode the shell value" instead of guessing.' },
        { at: 9600, text: 'That provenance is the difference between a config file and a debugging mystery.' },
      ],
    },
    {
      kicker: 'The object', navTitle: 'The config', duration: 13000,
      title: 'One object, <em>every knob</em>.',
      body: sceneBody(kvList([
        ['apiKey / model', 'the live request identity.'],
        ['workspaceRoot', 'resolved against the package root.'],
        ['commandPolicy', 'allow, ask, or deny.'],
        ['maxSteps', 'default 12.'],
        ['requestTimeoutMs', 'default 90,000.'],
        ['memoryFile', 'package-relative or absolute.'],
        ['memoryMaxEntries', 'default 60.'],
        ['memoryPromptChars', 'default 1,200; 0 disables injection.'],
      ], { at: 0 }) + callout('Everything downstream is pure: given this object, the rest of the program does not need to know about the environment.', { at: 1 })),
      beats: [
        { at: 0, text: 'The returned object is the complete runtime configuration.' },
        { at: 4800, text: 'Paths resolve now, policies are normalised, and memory caps are numbers.' },
        { at: 9300, text: 'Downstream code stays pure because every environment decision already happened here.' },
      ],
    },
    {
      kicker: 'Recap', navTitle: 'Recap', duration: 11000,
      title: 'Resolve once. <em>Report everything.</em>',
      body: sceneBody(
        stats([['5', 'sources'], ['1', 'config object'], ['0', 'keys logged']], { at: 0 })
        + rules([
          ['Load once.', 'No module reads process.env directly.'],
          ['.env wins.', 'The nearest file outranks a stale shell value.'],
          ['Provenance matters.', 'Return the source, not only the value.'],
          ['Never log secrets.', 'Fingerprint the key; never print it.'],
        ], { at: 1 })
        + statement('Configuration is not a pile of environment variables. It is one resolved, explainable object.', { at: 2 })
      ),
      beats: [
        { at: 0, text: 'Five kinds of source, one config object, and no secret in the logs.' },
        { at: 4200, text: 'Load once, let .env win, keep the provenance, and fingerprint the key.' },
        { at: 8200, text: 'That is how a small program stays reproducible when the environment is not.' },
      ],
    },
  ],
};

export default [agent, cli, config];
