# mini-coding-agent-js — Code Reference

A student-friendly map of every class, function and method in `src/`.

- **Scope:** `src/` only. Tests in `test/` are deliberately excluded.
- **How to use it:** jump to a file below, or use the **alphabetical index** to go straight to a symbol.
- **Reading order:** `agent.js` first (the loop), then `tools.js`, `sandbox.js`, `workspace.js`, and finally the surrounding files (`cli.js`, `config.js`, `ui.js`, `hooks.js`, `memory.js`, `prompt.js`, `llm.js`, `heartbeat.js`, `demo.js`).

---

## Contents by file

| File | What it is for |
| --- | --- |
| [`agent.js`](#file-agentjs) | The agent loop — one task, one model call per step, tool dispatch. |
| [`cli.js`](#file-clijs) | The program around the loop: flags, banner, prompts, sessions, exit codes. |
| [`config.js`](#file-configjs) | Resolves credentials, model, workspace, policies and budgets. |
| [`demo.js`](#file-demojs) | Scripted fake model + sandbox scorecard for offline demos. |
| [`heartbeat.js`](#file-heartbeatjs) | Prints "still waiting" while a slow model call runs. |
| [`hooks.js`](#file-hooksjs) | Lifecycle hooks: nine named moments where outside code can observe/block/rewrite. |
| [`llm.js`](#file-llmjs) | One OpenRouter chat request over plain `fetch`. |
| [`memory.js`](#file-memoryjs) | Long-term memory stored as a human-readable markdown file. |
| [`prompt.js`](#file-promptjs) | Builds the system prompt (rules + memory digest). |
| [`sandbox.js`](#file-sandboxjs) | The write fence: save/edit/delete inside the workspace only. |
| [`tools.js`](#file-toolsjs) | Tool schemas, handlers, validation and dispatch. |
| [`ui.js`](#file-uijs) | Colours and line shapes — every helper returns a string. |
| [`workspace.js`](#file-workspacejs) | Path policy: where reads and writes resolve to. |

---

## Alphabetical index

Jump straight to any class, function or method.

**[A](#idx-a)** · **[B](#idx-b)** · **[C](#idx-c)** · **[D](#idx-d)** · **[E](#idx-e)** · **[F](#idx-f)** · **[G](#idx-g)** · **[H](#idx-h)** · **[I](#idx-i)** · **[J](#idx-j)** · **[K](#idx-k)** · **[L](#idx-l)** · **[M](#idx-m)** · **[N](#idx-n)** · **[O](#idx-o)** · **[P](#idx-p)** · **[Q](#idx-q)** · **[R](#idx-r)** · **[S](#idx-s)** · **[T](#idx-t)** · **[U](#idx-u)** · **[V](#idx-v)** · **[W](#idx-w)**

<a id="idx-a"></a>
### A

- [`announce`](#fn-announce) — `cli.js`
- [`askTask`](#fn-askTask) — `cli.js`

<a id="idx-b"></a>
### B

- [`banner`](#fn-banner) — `cli.js`
- [`buildSystemPrompt`](#fn-buildSystemPrompt) — `prompt.js`

<a id="idx-c"></a>
### C

- [`call`](#fn-call) — `demo.js`
- [`chat`](#fn-chat) — `llm.js`
- [`clip`](#fn-clip) — `tools.js`
- [`commandName`](#fn-commandName) — `sandbox.js`

<a id="idx-d"></a>
### D

- [`demoChat`](#fn-demoChat) — `demo.js`

<a id="idx-e"></a>
### E

- [`explainExit`](#fn-explainExit) — `ui.js`
- [`expandVars`](#fn-expandVars) — `workspace.js`

<a id="idx-f"></a>
### F

- [`failedExitCode`](#fn-failedExitCode) — `ui.js`
- [`findEnvFile`](#fn-findEnvFile) — `config.js`
- [`fingerprint`](#fn-fingerprint) — `config.js`
- [`firstLine`](#fn-firstLine) — `ui.js`
- [`firstStdout`](#fn-firstStdout) — `ui.js`
- [`ForbiddenError`](#class-ForbiddenError) — `sandbox.js`
- [`ForbiddenError.constructor`](#method-ForbiddenError-constructor) — `sandbox.js`
- [`formatEntry`](#fn-formatEntry) — `memory.js`

<a id="idx-g"></a>
### G

_No entries._

<a id="idx-h"></a>
### H

- [`HANDLERS`](#fn-HANDLERS) — `tools.js`
- [`HANDLERS.create_file`](#method-HANDLERS-create_file) — `tools.js`
- [`HANDLERS.edit_file`](#method-HANDLERS-edit_file) — `tools.js`
- [`HANDLERS.list_files`](#method-HANDLERS-list_files) — `tools.js`
- [`HANDLERS.read_file`](#method-HANDLERS-read_file) — `tools.js`
- [`HANDLERS.recall`](#method-HANDLERS-recall) — `tools.js`
- [`HANDLERS.remember`](#method-HANDLERS-remember) — `tools.js`
- [`HANDLERS.run_command`](#method-HANDLERS-run_command) — `tools.js`
- [`HANDLERS.write_file`](#method-HANDLERS-write_file) — `tools.js`
- [`heartbeat`](#fn-heartbeat) — `heartbeat.js`
- [`hookDetail`](#fn-hookDetail) — `hooks.js`
- [`hookMeta`](#fn-hookMeta) — `hooks.js`
- [`Hooks`](#class-Hooks) — `hooks.js`
- [`Hooks.attached`](#method-Hooks-attached) — `hooks.js`
- [`Hooks.constructor`](#method-Hooks-constructor) — `hooks.js`
- [`Hooks.count`](#method-Hooks-count) — `hooks.js`
- [`Hooks.has`](#method-Hooks-has) — `hooks.js`
- [`Hooks.off`](#method-Hooks-off) — `hooks.js`
- [`Hooks.on`](#method-Hooks-on) — `hooks.js`
- [`Hooks.run`](#method-Hooks-run) — `hooks.js`

<a id="idx-i"></a>
### I

- [`interpretCommand`](#fn-interpretCommand) — `cli.js`
- [`isFailure`](#fn-isFailure) — `ui.js`
- [`isFlag`](#fn-isFlag) — `sandbox.js`
- [`isInside`](#fn-isInside) — `workspace.js`

<a id="idx-j"></a>
### J

_No entries._

<a id="idx-k"></a>
### K

_No entries._

<a id="idx-l"></a>
### L

- [`loadConfig`](#fn-loadConfig) — `config.js`
- [`loadDotEnv`](#fn-loadDotEnv) — `config.js`

<a id="idx-m"></a>
### M

- [`main`](#fn-main) — `cli.js`
- [`makeConfirm`](#fn-makeConfirm) — `cli.js`
- [`Memory`](#class-Memory) — `memory.js`
- [`Memory.constructor`](#method-Memory-constructor) — `memory.js`
- [`Memory.digest`](#method-Memory-digest) — `memory.js`
- [`Memory.entries`](#method-Memory-entries) — `memory.js`
- [`Memory.exists`](#method-Memory-exists) — `memory.js`
- [`Memory.forget`](#method-Memory-forget) — `memory.js`
- [`Memory.label`](#method-Memory-label) — `memory.js`
- [`Memory.remember`](#method-Memory-remember) — `memory.js`
- [`Memory.save`](#method-Memory-save) — `memory.js`
- [`Memory.search`](#method-Memory-search) — `memory.js`
- [`Memory.size`](#method-Memory-size) — `memory.js`
- [`Memory.summary`](#method-Memory-summary) — `memory.js`

<a id="idx-n"></a>
### N

- [`normalizeModel`](#fn-normalizeModel) — `config.js`

<a id="idx-o"></a>
### O

_No entries._

<a id="idx-p"></a>
### P

- [`parseArgs`](#fn-parseArgs) — `cli.js`
- [`parseMemory`](#fn-parseMemory) — `memory.js`
- [`PathError`](#class-PathError) — `workspace.js`
- [`printHookCatalogue`](#fn-printHookCatalogue) — `hooks.js`

<a id="idx-q"></a>
### Q

_No entries._

<a id="idx-r"></a>
### R

- [`realResolve`](#fn-realResolve) — `workspace.js`
- [`reportSandbox`](#fn-reportSandbox) — `cli.js`
- [`runCli`](#fn-runCli) — `cli.js`
- [`runSession`](#fn-runSession) — `cli.js`
- [`runShell`](#fn-runShell) — `tools.js`
- [`runTask`](#fn-runTask) — `agent.js`
- [`runTool`](#fn-runTool) — `tools.js`

<a id="idx-s"></a>
### S

- [`safeEnv`](#fn-safeEnv) — `tools.js`
- [`Sandbox`](#class-Sandbox) — `sandbox.js`
- [`Sandbox.allowsAction`](#method-Sandbox-allowsAction) — `sandbox.js`
- [`Sandbox.check`](#method-Sandbox-check) — `sandbox.js`
- [`Sandbox.checkCommand`](#method-Sandbox-checkCommand) — `sandbox.js`
- [`Sandbox.constructor`](#method-Sandbox-constructor) — `sandbox.js`
- [`Sandbox.forbid`](#method-Sandbox-forbid) — `sandbox.js`
- [`Sandbox.remove`](#method-Sandbox-remove) — `sandbox.js`
- [`Sandbox.save`](#method-Sandbox-save) — `sandbox.js`
- [`Sandbox.summary`](#method-Sandbox-summary) — `sandbox.js`
- [`Sandbox.write`](#method-Sandbox-write) — `sandbox.js`
- [`sandboxFor`](#fn-sandboxFor) — `sandbox.js`
- [`sandboxScorecard`](#fn-sandboxScorecard) — `demo.js`
- [`scanSegment`](#fn-scanSegment) — `sandbox.js`
- [`shellWriteTargets`](#fn-shellWriteTargets) — `sandbox.js`
- [`systemRules`](#fn-systemRules) — `prompt.js`

<a id="idx-t"></a>
### T

- [`taskExitCode`](#fn-taskExitCode) — `cli.js`
- [`today`](#fn-today) — `memory.js`
- [`tokenizeCommand`](#fn-tokenizeCommand) — `sandbox.js`
- [`traceHooks`](#fn-traceHooks) — `hooks.js`
- [`trimHistory`](#fn-trimHistory) — `cli.js`

<a id="idx-u"></a>
### U

- [`ui`](#obj-ui) — `ui.js`
- [`ui.answer`](#method-ui-answer) — `ui.js`
- [`ui.answerRule`](#method-ui-answerRule) — `ui.js`
- [`ui.dim`](#method-ui-dim) — `ui.js`
- [`ui.error`](#method-ui-error) — `ui.js`
- [`ui.exitNote`](#method-ui-exitNote) — `ui.js`
- [`ui.field`](#method-ui-field) — `ui.js`
- [`ui.fail`](#method-ui-fail) — `ui.js`
- [`ui.forbidden`](#method-ui-forbidden) — `ui.js`
- [`ui.hookField`](#method-ui-hookField) — `ui.js`
- [`ui.hookFlow`](#method-ui-hookFlow) — `ui.js`
- [`ui.hookLine`](#method-ui-hookLine) — `ui.js`
- [`ui.hookLive`](#method-ui-hookLive) — `ui.js`
- [`ui.hookNote`](#method-ui-hookNote) — `ui.js`
- [`ui.hookTitle`](#method-ui-hookTitle) — `ui.js`
- [`ui.hookTrace`](#method-ui-hookTrace) — `ui.js`
- [`ui.kv`](#method-ui-kv) — `ui.js`
- [`ui.memory`](#method-ui-memory) — `ui.js`
- [`ui.note`](#method-ui-note) — `ui.js`
- [`ui.pass`](#method-ui-pass) — `ui.js`
- [`ui.prompt`](#method-ui-prompt) — `ui.js`
- [`ui.result`](#method-ui-result) — `ui.js`
- [`ui.rule`](#method-ui-rule) — `ui.js`
- [`ui.step`](#method-ui-step) — `ui.js`
- [`ui.think`](#method-ui-think) — `ui.js`
- [`ui.title`](#method-ui-title) — `ui.js`
- [`ui.tool`](#method-ui-tool) — `ui.js`
- [`ui.waiting`](#method-ui-waiting) — `ui.js`
- [`ui.warn`](#method-ui-warn) — `ui.js`
- [`usage`](#fn-usage) — `cli.js`

<a id="idx-v"></a>
### V

- [`validate`](#fn-validate) — `tools.js`

<a id="idx-w"></a>
### W

- [`Workspace`](#class-Workspace) — `workspace.js`
- [`Workspace.constructor`](#method-Workspace-constructor) — `workspace.js`
- [`Workspace.resolve`](#method-Workspace-resolve) — `workspace.js`
- [`Workspace.resolveRead`](#method-Workspace-resolveRead) — `workspace.js`
- [`wrap`](#fn-wrap) — `hooks.js`

---

<a id="file-agentjs"></a>
## `agent.js` — the loop

The whole agent: one exported async function. It has no flags, colours, banner or exit codes — those live in `cli.js`. Each step announces itself, asks the model once, then either prints the answer (no tool calls) or dispatches every tool call and appends the results.

<a id="fn-runTask"></a>
#### `runTask(options)` — exported, async

Runs one task to completion and returns a result object instead of throwing.

- `task` — the user's request.
- `workspace` — a `Workspace`; reads start here and writes are fenced here.
- `sandbox` — optional `Sandbox`; one is created if omitted.
- `commandPolicy` — `'allow' | 'ask' | 'deny'` for shell commands.
- `maxSteps` — maximum model calls before giving up.
- `chatFn` — injected model function (`{ messages, tools } => Promise<reply>`).
- `confirm` — optional callback used by the `ask` policy.
- `hooks` — optional `Hooks` registry (nine lifecycle moments are fired).
- `memory` — optional `Memory` store injected into the system prompt.
- `history` — previous task's messages, so follow-up tasks keep the conversation.
- `log` — where the run narrates itself (default `console.log`).
- `heartbeatMs` — how often to print "still waiting" (default 5000 ms).

**Returns** `{ ok, reason?, answer?, messages, steps? }`. `ok:false` with `reason: 'blocked_by_hook' | 'request_failed' | 'max_steps'` on the failure paths.

**Hook calls:** `SessionStart`, `UserPromptSubmit`, `PreModel`, `PostModel`, `PreToolUse`, `PostToolUse`, `Stop`, `StepLimit`, `SessionEnd`.

---

<a id="file-clijs"></a>
## `cli.js` — the program around the loop

Everything a person needs to run the agent: flag parsing, `--help`, the banner, the interactive task prompt, the y/N approval prompt, the three side doors (`--hooks`, `--memory`, `--demo`), sessions and exit codes.

<a id="fn-makeConfirm"></a>
#### `makeConfirm()` — local

Builds the approval callback used by `CMD_POLICY=ask`.

- **Returns** `async (command) => 'allow' | 'deny'`.
- If stdin is not a TTY it always returns `'deny'` — an unanswerable prompt must never become approval.

<a id="fn-askTask"></a>
#### `askTask({ input, output })` — exported, async

Prompts for one task line using `readline`'s async iterator (so queued lines are not dropped).

- **Returns** the trimmed task, or `null` on Ctrl-C / end of input.
- Blank input re-prompts with a warning.

<a id="fn-parseArgs"></a>
#### `parseArgs(argv)` — local

Turns CLI flags into an options object.

- Flags: `--demo`, `--yes`/`-y`, `--model`, `--max-steps`, `--allow-commands`, `--hooks`, `--memory`, `--no-memory`, `--trace-hooks`, `--no-hooks`, `--help`/`-h`.
- Any non-flag word is joined into `opts.task`.

<a id="fn-usage"></a>
#### `usage()` — local

Prints the full `--help` text: every flag, environment variables and the meaning of exit codes 0–3.

<a id="fn-showHooks"></a>
#### `showHooks()` — local

Implements `--hooks`: prints the lifecycle catalogue and a one-line hint about attaching a handler. Needs no config or API key.

<a id="fn-showMemory"></a>
#### `showMemory(memory, config)` — local

Implements `--memory`: prints the memory file, how many entries exist, and exactly what the system prompt injects (count and characters).

<a id="fn-banner"></a>
#### `banner({ config, workspace, sandbox, memory, commandPolicy, opts })` — local

Prints the reproducible startup header — workspace, sandbox, model, key fingerprint, `.env` path, command policy, timeout, tools, memory and hook status — plus warnings for a non-OpenRouter model slug.

<a id="fn-interpretCommand"></a>
#### `interpretCommand(line)` — exported

Classifies a session input line.

- **Returns** `'quit'` for `/quit` or `/exit`, `'new'` for `/new`, otherwise `'task'`.

<a id="fn-trimHistory"></a>
#### `trimHistory(messages, max)` — exported

Keeps the tail of a conversation for the next task, capped at `max` messages (default `MAX_HISTORY = 24`).

- Drops `system` messages and moves the cut forward to a `user` message, because a provider rejects history that starts with a `tool` result or ends with unanswered `tool_calls`.
- **Returns** the messages to carry over (possibly `[]`).

<a id="fn-taskExitCode"></a>
#### `taskExitCode(result)` — local

Maps a `runTask` result to a process exit code: `0` success, `1` `request_failed`, `3` `max_steps`.

<a id="fn-announce"></a>
#### `announce(result, carriedMessages)` — local

Prints the one-line "task finished" summary after each session task, including what to type next and how many messages carry over.

<a id="fn-runSession"></a>
#### `runSession({ base, opts })` — exported, async

The interactive loop: ask for a task → `runTask` → keep trimmed history → announce → repeat.

- `base` is everything `runTask` needs except `task`; `opts` is the parsed command line.
- `/new` clears history (workspace and memory are untouched); `/quit`, Ctrl-C or end of input ends the session.

<a id="fn-runCli"></a>
#### `runCli()` — local, async

The real entry point after `main()`: parse flags, handle the side doors, load config, build `Workspace`/`Sandbox`/`Memory`, wire `chatFn` and hooks, then run one task or a session. Sets `process.exitCode` on failure.

<a id="fn-reportSandbox"></a>
#### `reportSandbox(messages)` — local

Implements the demo scorecard: calls `sandboxScorecard` and prints each guard as pass/fail with evidence, then the limits that are enforced but not demoed. Sets exit code 1 if any guard failed.

<a id="fn-main"></a>
#### `main()` — exported, async

Top-level wrapper: runs `runCli()`, catches fatal errors (printing the stack), and prints a plain-English note explaining a non-zero exit code.

---

<a id="file-configjs"></a>
## `config.js` — configuration

The single place that reads the environment. It finds the nearest `.env`, merges it over the shell environment, normalises the model name, and reports where every value came from so the banner can show what actually won.

<a id="fn-findEnvFile"></a>
#### `findEnvFile(startDir)` — exported

Walks up from `startDir` (default: the package root) looking for the nearest `.env` file.

- **Returns** the absolute path, or `null` if none exists.

<a id="fn-loadDotEnv"></a>
#### `loadDotEnv(file)` — exported

Minimal `.env` parser: `KEY=VALUE`, `export` prefixes, `#` comments, quoted values.

- Values from `.env` **win over** inherited shell variables (deliberate: a stale exported key should not silently outrank the project file).
- Writes parsed keys into `process.env` and **returns** them as an object.

<a id="fn-fingerprint"></a>
#### `fingerprint(secret)` — exported

Makes a secret safe to log.

- **Returns** `'not set'`, a masked string for short secrets, or `first5...last4 (N chars)`.

<a id="fn-normalizeModel"></a>
#### `normalizeModel(model)` — exported

Expands a bare model name to the `vendor/model` slug OpenRouter requires.

- Passes through names that already contain `/`.
- Uses `OPENROUTER_PROVIDER_PREFIX` when set, otherwise the `VENDOR_BY_PREFIX` table.
- **Returns** `{ model, normalised }` where `normalised` says whether it was rewritten.

<a id="fn-loadConfig"></a>
#### `loadConfig(overrides, options)` — exported

Resolves everything the agent needs and records the source of each value.

- Precedence: `overrides` > nearest `.env` > shell environment > defaults.
- Reads `OPENROUTER_API_KEY`/`OPENROUTER_KEY`, `OPENROUTER_MODEL`/`MODEL`, `OPENROUTER_PROVIDER_PREFIX`, `CMD_POLICY`, `MAX_STEPS`, `REQUEST_TIMEOUT_MS`, `WORKSPACE_DIR`, `MEMORY_FILE`, `MEMORY_MAX_ENTRIES`, `MEMORY_PROMPT_CHARS`.
- **Returns** `{ apiKey, apiKeySource, apiKeyOverrodeShell, model, modelSource, modelOverrodeShell, modelNormalised, workspaceRoot, commandPolicy, maxSteps, requestTimeoutMs, memoryFile, projectRoot, memoryMaxEntries, memoryPromptChars, envFile }`.

---

<a id="file-demojs"></a>
## `demo.js` — scripted fallback

A fake model so `--demo` can exercise the real loop, hooks, dispatcher, sandbox refusals and memory tools with **no network**. The script has ordinary work, then deliberate sandbox attacks, then the two memory calls.

<a id="fn-call"></a>
#### `call(id, name, args)` — local

Builds one OpenAI-shaped tool call: `{ id, type: 'function', function: { name, arguments } }`.

<a id="fn-sandboxScorecard"></a>
#### `sandboxScorecard(messages)` — exported

Reads the run's own `tool` messages back and checks each guard in `DEMO_CHECKS`.

- **Returns** `{ rows: [{ ok, label, seen }], passed, total }`.

<a id="fn-demoChat"></a>
#### `demoChat()` — exported

Returns an async `chatFn` with the same shape as the real one (`{ choices: [{ message }] }`). It walks `DEMO_SCRIPT` once, then repeats the final answer so the loop can exit with "no tool calls".

---

<a id="file-heartbeatjs"></a>
## `heartbeat.js` — liveness

A slow model call must not look like a frozen program.

<a id="fn-heartbeat"></a>
#### `heartbeat(log, everyMs)` — exported

Starts a timer that prints "… still waiting for the model (Ns)" every `everyMs` (default 5000 ms).

- The timer is `unref()`ed so it cannot keep the process alive.
- **Returns** `{ stop }`; call `stop()` when the request settles (success **and** failure paths).

---

<a id="file-hooksjs"></a>
## `hooks.js` — lifecycle hooks

Named moments in the loop where outside code gets a turn. A hook is a function that may observe, rewrite what the model reads, or block a call. `HOOK_EVENTS` is the single source of truth for names, icons, colours and explanations.

### Data

- `HOOK_EVENTS` — the nine moments, in firing order, with `name`, `icon`, `color`, `when`, `gets`, `may`, `why`.
- `HOOK_NAMES` — just the names, in order.
- `DECIDING` — the map of the four events whose return value can change the run.
- `HOOK_SUMMARY` — `{ total, deciding, names }` used by tests/docs.

<a id="class-Hooks"></a>
### `class Hooks`

A small registry: attach handlers to event names, then `await hooks.run(name, payload)` at each moment. It **collects decisions** and returns one answer (blocked? rewritten with what?), unlike a fire-and-forget EventEmitter.

<a id="method-Hooks-constructor"></a>
#### `new Hooks({ log, catalog })`

Creates the registry with an empty handler list per event.

- `log` — where warnings about broken hooks are printed.
- `catalog` — when `true`, print the lifecycle catalogue once on construction.

<a id="method-Hooks-on"></a>
#### `hooks.on(name, fn, { id, once })`

Attaches a handler and returns its id.

- Throws on an unknown event name (a typo is an error, not a silent no-op) or a non-function handler.
- `once: true` removes the handler after its first call.

<a id="method-Hooks-off"></a>
#### `hooks.off(name, id)`

Detaches the handler with that id. **Returns** `true` if one was removed, else `false`.

<a id="method-Hooks-count"></a>
#### `hooks.count(name)`

**Returns** how many handlers are registered for an event (0 when none).

<a id="method-Hooks-has"></a>
#### `hooks.has(name)`

**Returns** `true` when at least one handler is attached.

<a id="method-Hooks-attached"></a>
#### `hooks.attached()`

**Returns** the event names that currently have a handler, in lifecycle order.

<a id="method-Hooks-run"></a>
#### `hooks.run(name, payload)` — async

Fires an event. Handlers run in registration order; the first `block` wins and the remaining handlers are skipped.

- A throwing handler is reported (via `log`) and ignored — extension code must never break the loop.
- **Returns** `{ event, ran, blocked, reason, task, replace, notes, errors }`.

<a id="fn-hookMeta"></a>
#### `hookMeta(name)` — exported

Looks up one event's metadata object in `HOOK_EVENTS`.

<a id="fn-hookDetail"></a>
#### `hookDetail(event, payload)` — exported

Produces the one-line payload summary used by the live trace (tool name + args, result first line, stop reason, duration, etc.).

<a id="fn-traceHooks"></a>
#### `traceHooks({ log, detail, explain })` — exported

Returns a `Hooks` with a tracer attached to every event, so a normal run prints `[HOOK:Name]` lines as they fire.

- `explain: false` prints only the tag and payload, without the event description.

<a id="fn-printHookCatalogue"></a>
#### `printHookCatalogue({ log, hooks })` — exported

Prints the whole lifecycle from `HOOK_EVENTS`: icon, name, when it fires, what it receives, what it may do, why it exists, and the firing order.

- Pass `hooks` to mark events that currently have a handler as "attached".

<a id="fn-wrap"></a>
#### `wrap(text, width, indent)` — local

Folds a long line on word boundaries for the catalogue. **Returns** a wrapped, indented string.

---

<a id="file-llmjs"></a>
## `llm.js` — one model call

A single OpenAI-compatible chat request over plain `fetch` — no SDK, because the point is that an agent is just this HTTP request in a loop.

<a id="fn-chat"></a>
#### `chat({ apiKey, model, messages, tools, signal, timeoutMs })` — exported, async

POSTs to OpenRouter and returns the parsed JSON.

- Throws descriptive errors for a missing key, a timeout, a non-2xx status (with hints for 401/402) and an error payload.
- `timeoutMs` defaults to 90 s; a caller `signal` is combined with the timeout.

<a id="fn-sanitizeAssistant"></a>
#### `sanitizeAssistant(message)` — exported

Rebuilds an assistant message with only the fields the agent needs. Drops `reasoning`/`reasoning_content` so the trace is not re-sent every step.

- **Returns** `{ role: 'assistant', content?, tool_calls? }`.

---

<a id="file-memoryjs"></a>
## `memory.js` — long-term memory

`memory.md` **is** the store: plain markdown, one bullet per memory, no database or cache. Every read goes to disk, so hand edits are picked up immediately.

### Data

- `MEMORY_FILE` — default path (`src/memory.md`).
- `MEMORY_TAGS` — `['fact', 'pref', 'fix', 'gotcha']`.
- `DEFAULTS` / `HEADER` — bounds and the file header written by `save()`.

<a id="fn-today"></a>
#### `today(now)` — local

Formats a date as `YYYY-MM-DD` in local time. `now` is injectable so tests are not clock-dependent.

<a id="fn-formatEntry"></a>
#### `formatEntry(entry)` — exported

Renders one entry as its stored line: `- [tag] text _(YYYY-MM-DD)_`.

<a id="fn-parseMemory"></a>
#### `parseMemory(source)` — exported

Parses the file into entries. Anything that is not a bullet is ignored, which makes prose, headings and comments safe.

- **Returns** `{ tag, text, date }[]` oldest first; a missing date becomes `'undated'`.

<a id="class-Memory"></a>
### `class Memory`

A long-term store backed by a markdown file, with a bounded eager digest and a lazy search.

<a id="method-Memory-constructor"></a>
#### `new Memory({ root, file, ...options })`

- `root` — base for a relative `file`.
- `file` — the store path (default `MEMORY_FILE`).
- `now` — clock injection.
- Other options override the `DEFAULTS` caps (`maxEntries`, `maxEntryChars`, `rememberChars`, `promptChars`, `promptEntries`).

<a id="method-Memory-label"></a>
#### `memory.label` (getter)

The path shown in tool output: workspace/package-relative when possible, otherwise absolute.

<a id="method-Memory-exists"></a>
#### `memory.exists` (getter)

`true` when the memory file exists on disk right now.

<a id="method-Memory-entries"></a>
#### `memory.entries()`

Reads the file and **returns** all entries in file order. Always hits disk on purpose — a cached memory module would drift from the file.

<a id="method-Memory-size"></a>
#### `memory.size` (getter)

The number of stored memories (calls `entries()`).

<a id="method-Memory-save"></a>
#### `memory.save(entries)`

Rewrites the whole file: header plus one bullet per entry. Creates parent folders. **Returns** the file path.

<a id="method-Memory-remember"></a>
#### `memory.remember(rawText, { tag })`

Adds a memory, with dedupe and caps.

- Duplicate text (case/whitespace-insensitive) refreshes the date instead of appending.
- Unknown tags fall back to `fact`; each entry is trimmed to `maxEntryChars`; the oldest entries are dropped beyond `maxEntries`.
- **Returns** `{ ok, duplicate?, dropped?, entry, total, reason? }`.

<a id="method-Memory-forget"></a>
#### `memory.forget(match)`

Deletes every entry whose text contains `match` (case-insensitive). **Returns** `{ removed, total }`.

<a id="method-Memory-search"></a>
#### `memory.search(query, { limit })`

The lazy access path behind the `recall` tool. Every word in the query must appear; newest first.

- An empty query lists the newest memories.
- **Returns** up to `limit` (default 20) entries.

<a id="method-Memory-digest"></a>
#### `memory.digest({ entries, chars })`

The block appended to the system prompt. Bounded by entry count **and** characters, and it says how many older memories were left out (so the model knows `recall` exists).

- **Returns** `''` when there is nothing to inject (or `promptChars` is 0).

<a id="method-Memory-summary"></a>
#### `memory.summary()`

One line for the startup banner: file label, count, and the newest date.

---

<a id="file-promptjs"></a>
## `prompt.js` — the system prompt

The agent's behaviour is set by the system prompt, the tool descriptions and the error strings. This file owns the first one.

<a id="fn-systemRules"></a>
#### `systemRules(tools)` — exported

**Returns** the standing rules as text: look before writing, prefer the right edit tool, copy `old_string` exactly, run and check what you wrote, stop when done, and only `remember` durable facts.

- `tools` is the list of tool names interpolated into the prompt.

<a id="fn-buildSystemPrompt"></a>
#### `buildSystemPrompt({ memory, log })` — exported

The whole system message for one run: `systemRules()` plus `memory.digest()` when the store has something.

- When `log` is given, it prints the "memory ← … N memories added" line.
- **Returns** the content of the `system` message.

---

<a id="file-sandboxjs"></a>
## `sandbox.js` — the write fence

`workspace.js` answers "is this path inside the root?". This file answers the louder question: **may the agent change this file at all?** Only save/edit/delete are governed, and every refusal prints one bold `⛔ FORBIDDEN` line before throwing.

### Data

- `SANDBOX_DIR` — default sandbox (`mini-coding-agent-js/workspace`).
- `ACTIONS` — frozen `{ SAVE, EDIT, DELETE }`.
- `SEPARATORS`, `DEST_LAST`, `ALL_POSITIONAL`, `OUTPUT_FLAG`, `PS_CMDLETS`, `PS_TARGET_FLAGS` — tables used to read write targets out of a command line.

<a id="class-ForbiddenError"></a>
### `class ForbiddenError extends Error`

A refusal, thrown *after* the FORBIDDEN line has been printed. Carries `code: 'FORBIDDEN'`, plus `action`, `requested` and `reason`.

<a id="method-ForbiddenError-constructor"></a>
#### `new ForbiddenError(action, requested, reason)`

Builds the error message in the same shape as the console line: `SAVE ../x - path escapes the workspace: ../x`.

<a id="class-Sandbox"></a>
### `class Sandbox`

One per run, handed to tools through `ctx.sandbox`. It reuses the run's `Workspace`, so reads and writes can never disagree about the root. Tracks a `refusals` count.

<a id="method-Sandbox-constructor"></a>
#### `new Sandbox({ workspace, root, log })`

- Reuses `workspace` when given, otherwise creates one at `root` (or `SANDBOX_DIR`).
- `log` receives the FORBIDDEN lines.

<a id="method-Sandbox-allowsAction"></a>
#### `Sandbox.allowsAction(action)` — static

`true` when the action is one of `save`/`edit`/`delete`.

<a id="method-Sandbox-forbid"></a>
#### `sandbox.forbid(action, requested, reason)`

The single place a FORBIDDEN line comes from: increments `refusals`, logs the line, then throws `ForbiddenError`.

<a id="method-Sandbox-check"></a>
#### `sandbox.check(action, requested)`

Resolves a path for save/edit/delete through `Workspace.resolve`.

- **Returns** `{ abs, rel }`.
- **Throws** `ForbiddenError` for anything outside the sandbox, and refuses deleting the root itself.

<a id="method-Sandbox-write"></a>
#### `sandbox.write(target, content)`

Writes a file that `check()` already allowed, creating parent folders.

- **Returns** `{ ...target, existed, bytes }`.

<a id="method-Sandbox-save"></a>
#### `sandbox.save(requested, content)`

Convenience for `write(check(SAVE, requested), content)`.

<a id="method-Sandbox-remove"></a>
#### `sandbox.remove(requested)`

Deletes a file, or an **empty** folder, inside the sandbox.

- **Returns** `{ ...target, missing, dir }`.

<a id="method-Sandbox-checkCommand"></a>
#### `sandbox.checkCommand(command)`

Checks the write targets a shell command visibly names, refusing the ones outside.

- Best effort: it reads the command line, not the code inside a script.
- **Returns** `{ ok, targets }`; **throws** `ForbiddenError` when a target escapes.

<a id="method-Sandbox-summary"></a>
#### `sandbox.summary()`

One banner line: `save, edit, delete - only inside <root>`.

<a id="fn-sandboxFor"></a>
#### `sandboxFor(ctx)` — exported

**Returns** `ctx.sandbox`, or a fresh `Sandbox` built from `ctx.workspace` and `ctx.log`.

<a id="fn-tokenizeCommand"></a>
#### `tokenizeCommand(text)` — exported

Splits a command line into words and operators, honouring quotes. Quotes are removed; `>>`, `&&`, `||` are kept as single tokens.

<a id="fn-commandName"></a>
#### `commandName(token)` — local

The bare command name: no folders, no `.exe`/`.cmd`, lower case.

<a id="fn-isFlag"></a>
#### `isFlag(arg)` — local

`true` for a switch like `-s`, `--name` or `/q`; a POSIX path like `/home` is not a switch.

<a id="fn-scanSegment"></a>
#### `scanSegment(tokens, targets)` — local

Reads one command segment (between separators) and pushes the write targets it implies into `targets`, based on the verb tables.

<a id="fn-shellWriteTargets"></a>
#### `shellWriteTargets(command)` — exported

Walks the tokenised command, handling redirections and separators.

- **Returns** `{ verb, target }[]` — every path the command line visibly writes to or deletes.

---

<a id="file-toolsjs"></a>
## `tools.js` — tools and dispatch

What the model can do. `TOOL_SCHEMAS` is exactly what the model sees; `HANDLERS` is what actually runs. Every handler returns a **string**, which is the observation the model reads back — errors are returned, never thrown out of the loop.

### Data

- `TOOL_SCHEMAS` — the tool catalogue sent to the provider (names, descriptions, JSON schemas).
- `PARAMS` — each tool's parameter names and types, derived from the schemas.
- `HARD_DENY` — command patterns refused regardless of policy (rm -rf root, format, force push, fork bomb, …).
- `MAX_OUTPUT` (6000), `TIMEOUT_MS` (30 s), `ENV_ALLOW` — command bounds and the child-process environment allow-list.
- `TOOL_NAMES` — every tool name, in definition order.
- `SANDBOX_LIMITS` — the configured bounds reported in the demo footer.

<a id="fn-safeEnv"></a>
#### `safeEnv(source)` — exported

Builds a child-process environment from a short allow-list.

- The harness's own variables — above all `OPENROUTER_API_KEY` — are never passed down.
- **Returns** only the allow-listed variables that are defined.

<a id="fn-clip"></a>
#### `clip(text, limit)` — local

Truncates a value to `limit` characters and appends `... [N chars truncated]` when anything was dropped.

<a id="fn-runShell"></a>
#### `runShell(command, cwd)` — local, async

Runs a command with the sandboxed environment, 30 s timeout and 1 MB output buffer.

- Never rejects: failures come back in the result.
- **Returns** `{ code, stdout, stderr }`; a timeout is noted in `stderr`.

<a id="fn-HANDLERS"></a>
#### `HANDLERS` — local constant

The map of tool name → async handler. Each handler takes `(workspace, args, ctx)`.

<a id="method-HANDLERS-list_files"></a>
#### `HANDLERS.list_files(ws, args, ctx)`

Recursively lists a folder (default `.`), skipping `.git`, `node_modules`, `.venv`, `__pycache__`.

- `depth` defaults to 3, capped 1–6; output capped at 200 lines.
- **Returns** the listing plus `N folder(s), M file(s) under <path>`.

<a id="method-HANDLERS-read_file"></a>
#### `HANDLERS.read_file(ws, args, ctx)`

Reads a text file with line numbers and paging (`offset`, `limit`).

- Reads use `resolveRead`, so absolute paths outside the workspace are allowed.
- **Returns** numbered lines, a `... [N more lines]` note, or an `ERROR:` string.

<a id="method-HANDLERS-create_file"></a>
#### `HANDLERS.create_file(ws, args, ctx)`

Creates a new file through the sandbox. Refuses when the file already exists (use `edit_file`/`write_file`).

<a id="method-HANDLERS-write_file"></a>
#### `HANDLERS.write_file(ws, args, ctx)`

Creates or completely overwrites a file through the sandbox, creating parents. Reports whether it created or overwrote.

<a id="method-HANDLERS-edit_file"></a>
#### `HANDLERS.edit_file(ws, args, ctx)`

Replaces one exact snippet through the sandbox.

- Refuses an empty `old_string`, a missing match, or a non-unique match unless `replace_all: true`.
- **Returns** `edited <file>: N replacement(s), first at line L`.

<a id="method-HANDLERS-run_command"></a>
#### `HANDLERS.run_command(ws, args, ctx)` — async

Runs a shell command after three checks: the hard-deny list, the sandbox write-target scan, and the command policy (`allow`/`ask`/`deny`).

- Uses `safeEnv()` and a 30 s timeout.
- **Returns** `exit code N` plus clipped stdout/stderr (or `(no output)`), or `DENIED:`/`FORBIDDEN:` text.

<a id="method-HANDLERS-remember"></a>
#### `HANDLERS.remember(ws, args, ctx)`

Saves a note through `ctx.memory.remember()`. Reports totals, duplicates and how many old entries were dropped. Returns an error when the run has no memory store.

<a id="method-HANDLERS-recall"></a>
#### `HANDLERS.recall(ws, args, ctx)`

Searches `ctx.memory` with `args.query` (all words must match). Returns the hits, one per line, or a message saying none matched.

<a id="fn-validate"></a>
#### `validate(name, raw)` — local

Parses raw arguments (string or object) and checks them against the tool's declared parameter types.

- **Returns** `{ args }` on success or `{ error }` with a model-readable message.

<a id="fn-runTool"></a>
#### `runTool(name, rawArgs, ctx)` — exported, async

The dispatcher: rejects unknown tools, validates arguments, runs the handler, and converts failures into strings.

- `ForbiddenError` → `FORBIDDEN: …`; `PathError` → `ERROR: …`; anything else → `ERROR: <code>: …`.

---

<a id="file-uijs"></a>
## `ui.js` — console styling

Every helper returns a **string** and nothing writes to stdout, so the loop can still take an injected `log`. Colour level is chalk's call (`TTY`, `NO_COLOR`, `FORCE_COLOR`).

### Helpers and data

<a id="fn-isFailure"></a>
#### `isFailure(text)` — local

`true` when a result line starts with `ERROR`/`DENIED`/`FORBIDDEN`, or reports a non-zero exit code.

<a id="fn-firstLine"></a>
#### `firstLine(text, limit)` — local

The first line of a value, clipped (default 300 chars).

<a id="fn-explainExit"></a>
#### `explainExit(code)` — exported

Plain-English meaning of a process exit code (0–255, shell signals, Windows 9009), with a generic fallback.

<a id="fn-failedExitCode"></a>
#### `failedExitCode(line)` — local

Extracts a non-zero number from an `exit code N` line, or `null`.

<a id="fn-firstStdout"></a>
#### `firstStdout(text)` — local

The first non-empty stdout line from a successful (`exit code 0`) result, clipped to 160 chars.

<a id="obj-ui"></a>
### `ui` — exported object

The agent's visual language: one function per kind of line, so `agent.js` never contains a colour.

<a id="method-ui-title"></a>
#### `ui.title(text)`

Bold cyan banner heading.

<a id="method-ui-field"></a>
#### `ui.field(label)`

Input-field prompt: green label + `›`.

<a id="method-ui-kv"></a>
#### `ui.kv(label, value)`

Banner secondary line: padded blue label + value.

<a id="method-ui-step"></a>
#### `ui.step(step, max, width)`

Step divider: `── step 2/12 ──────`.

<a id="method-ui-think"></a>
#### `ui.think(text)`

The model's reasoning text, prefixed with `think:`.

<a id="method-ui-tool"></a>
#### `ui.tool(name, args)`

A tool-call line: `tool → <name> <args>`.

<a id="method-ui-result"></a>
#### `ui.result(text)`

A tool result. Failures are red and add the exit-code meaning; successes are green and add the first stdout line.

<a id="method-ui-forbidden"></a>
#### `ui.forbidden(action, requested, reason)`

A sandbox refusal: `⛔ FORBIDDEN <ACTION> <path> - <reason>`, bold red capitals so it is findable in a long transcript.

<a id="method-ui-pass"></a>
#### `ui.pass(text)`

A passed check (`✓`).

<a id="method-ui-fail"></a>
#### `ui.fail(text)`

A failed check (`✗`).

<a id="method-ui-rule"></a>
#### `ui.rule(label, width)`

A titled divider, e.g. `── sandbox checks ──────`.

<a id="method-ui-hookTitle"></a>
#### `ui.hookTitle(label)`

A section heading in the hook catalogue.

<a id="method-ui-hookLine"></a>
#### `ui.hookLine(icon, name, colour, when, live)`

One hook: icon, name in its own colour, when it fires, and an "attached" tag when live.

<a id="method-ui-hookField"></a>
#### `ui.hookField(label, value, colour)`

A labelled field under a hook (e.g. `receives  name, args, step`).

<a id="method-ui-hookLive"></a>
#### `ui.hookLive()`

Marks a hook that currently has a handler attached.

<a id="method-ui-hookNote"></a>
#### `ui.hookNote(name, text)`

A hook saying something without changing the run.

<a id="method-ui-hookTrace"></a>
#### `ui.hookTrace(icon, name, colour, explanation, detail)`

One lifecycle event firing as `[HOOK:Name] <what it is for> - <payload>`.

<a id="method-ui-hookFlow"></a>
#### `ui.hookFlow(steps)`

The ordered lifecycle, one numbered step per line.

<a id="method-ui-memory"></a>
#### `ui.memory(text)`

What long-term memory carried into this run.

<a id="method-ui-exitNote"></a>
#### `ui.exitNote(code, meaning)`

The last line of a failed run: exit code plus its meaning.

<a id="method-ui-answerRule"></a>
#### `ui.answerRule()`

The divider printed before the final answer.

<a id="method-ui-answer"></a>
#### `ui.answer(text)`

The final answer text.

<a id="method-ui-warn"></a>
#### `ui.warn(text)`

A warning line.

<a id="method-ui-waiting"></a>
#### `ui.waiting(text)`

The heartbeat line while a model call is in flight.

<a id="method-ui-error"></a>
#### `ui.error(text)`

An error line.

<a id="method-ui-note"></a>
#### `ui.note(text)`

A neutral note line.

<a id="method-ui-prompt"></a>
#### `ui.prompt(text)`

A prompt label, e.g. `run?`.

<a id="method-ui-dim"></a>
#### `ui.dim(text)`

De-emphasised secondary text.

---

<a id="file-workspacejs"></a>
## `workspace.js` — path policy

Resolves every file path before the filesystem is touched. `resolve()` fences **writes** to the workspace; `resolveRead()` lets **reads** go anywhere. The fence is around mutations, not curiosity.

### Data

- `HOME_AND_SYSTEM` — folder names (Desktop, Windows, Users, …) that must never be treated as workspace-relative writes.

<a id="class-PathError"></a>
### `class PathError extends Error`

Thrown when a path is refused by the workspace policy. `sandbox.js` turns it into a `FORBIDDEN` line, and `tools.js` turns it into an `ERROR` observation.

<a id="fn-expandVars"></a>
#### `expandVars(p)` — local

Expands `~`, `%VAR%` and `$VAR`/`${VAR}` in a path using the current environment. Unresolved variables are left as written.

<a id="fn-realResolve"></a>
#### `realResolve(abs)` — local

Resolves symlinks/junctions on the deepest existing ancestor, then re-appends the not-yet-created remainder — so a linked folder cannot smuggle a write outside the root.

<a id="fn-isInside"></a>
#### `isInside(root, target)` — local

`true` when `target` is the same as, or nested under, `root`.

<a id="class-Workspace"></a>
### `class Workspace`

A resolved root plus the two resolve methods.

<a id="method-Workspace-constructor"></a>
#### `new Workspace(root)`

Creates the directory if needed, then stores its **real** path (symlinks resolved).

<a id="method-Workspace-resolve"></a>
#### `workspace.resolve(requested)`

Resolves a path for a write and refuses anything that escapes the root.

- Rejects drive-absolute, UNC, absolute, home/env and home/system-looking paths.
- **Returns** `{ abs, rel }` with forward-slash `rel`.
- **Throws** `PathError`.

<a id="method-Workspace-resolveRead"></a>
#### `workspace.resolveRead(requested)`

Resolves a path for a **read**. Not fenced: an absolute path outside the workspace is allowed; a relative path resolves against the root.

- **Returns** `{ abs, rel }`; `rel` starts with `..` for an outside path.

---

## Quick revision checklist

1. **Loop:** `runTask` → `chatFn` → no tool calls? answer : `runTool` each call and append results.
2. **Safety layers:** `Workspace.resolve` (path policy) → `Sandbox.check` (write fence) → `HARD_DENY`/`checkCommand` (shell) → `safeEnv` (child environment).
3. **Lifecycle:** nine hook events, four of which can change the run (`SessionStart`, `UserPromptSubmit`, `PreToolUse`, `PostToolUse`).
4. **Memory:** one markdown file, two access paths — `digest()` (eager, bounded) and `search()` (lazy, via `recall`).
5. **Presentation:** every console line comes from `ui.js`, so the agent code never contains a colour.
