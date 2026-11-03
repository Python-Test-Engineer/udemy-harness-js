# Orientation & System Overview

## Why is the tool set deliberately small, and what does that buy the architecture?

A small tool set keeps the action surface auditable, the schemas manageable for the model, and the safety policy centralised in one dispatcher. More tools widen the attack surface and make the loop harder to test and explain.

## Where does the model's authority end and the harness's authority begin?

The model only proposes actions as structured tool calls. The harness validates the request, applies policy, executes the tool, and returns a string observation. The model never receives direct file, process, or network authority; the dispatcher is the gate.

## How does the model create a file if it has no hands?

It emits an assistant message containing a `write_file` tool call. The dispatcher validates the request, the workspace resolves the path, the tool writes the file, and the result is appended as a tool message.

## Why is the messages array called the state?

It is the only conversation content the next model call receives. If an action, result, or instruction is not in the array, the model does not know it. Hidden state outside the array breaks that guarantee.

## What would break if `agent.js` knew about CLI flags and terminal colours?

The loop would become coupled to process and presentation concerns. It would be harder to test, harder to reuse, and a CLI or UI change could force a change in agent logic.

## What is the smallest mental model of mini-coding-js?

One loop plus boundaries. The model proposes tool calls, the dispatcher executes them, results return as messages, and the loop repeats. Workspace, sandbox, hooks, memory, config, and UI exist to make that loop safe and observable.

## What does "ReAct" mean in this codebase?

The model reasons in text, acts by emitting tool calls, observes the returned tool results, and repeats. The loop does not parse private thoughts; it only consumes the assistant message and its structured tool calls.

## What are the eight tools?

`list_files`, `read_file`, `create_file`, `write_file`, `edit_file`, `run_command`, `remember`, and `recall`. They are the model's entire action surface.

## What is the role of `src/memory.md`?

It is the durable, human-readable long-term memory store. It lives outside the sandbox, is read from disk on every memory operation, and is injected into the system prompt as a bounded digest.

## What is the role of `src/prompt.js`?

It builds the system rules and appends the current memory digest. The prompt is rebuilt for each task so memory changes appear without restarting the process.

# CLI, Sessions & Process Boundary

## Where should `/new` and `/quit` live, and why not inside `agent.js`?

`/new` and `/quit` belong in `cli.js` because they control the session: clearing conversation history, preserving workspace and memory, and ending the process. `agent.js` should run one task and remain unaware of interactive commands.

## Why distinguish a one-shot task from an interactive session?

They have different lifecycles. A one-shot run accepts a task, executes it, and exits. A session keeps history, reads commands such as `/new` and `/quit`, and preserves workspace and memory across tasks. Mixing them makes exit codes and tests confusing.

## Why does no TTY mean deny for confirmation?

There is no human to answer. Defaulting to allow would be unsafe for an unattended process. Deny is conservative, predictable, and works in CI.

## What should Ctrl+C do in an interactive session?

Cancel the current task or command gracefully, preserve the session where sensible, and print a clear status. It should not corrupt memory or the workspace or exit silently.

## Why is `cli.js` responsible for exit codes?

Exit codes are part of the process contract. The agent returns a result object; the CLI maps success, failure, usage, and signals to codes and owns streams and terminal behaviour.

## What is the difference between `--demo` and a live run?

`--demo` uses a scripted model and needs no API key or network. A live run calls the real model provider and requires `OPENROUTER_API_KEY` plus a valid model configuration.

## What do exit codes 0, 1, 2, and 3 mean?

0 means the run finished successfully; 1 means a model request or fatal error stopped the run; 2 means no task was given; 3 means the step limit was reached.

## What does `--no-memory` do?

It disables the memory store for the run. The `remember` and `recall` tools return an error explaining that no memory store is available.

## What does `--no-hooks` do?

It silences the default `[HOOK:Name]` trace. The nine hooks are still available; the flag only controls whether their firing is printed.

## Why does the CLI own session history?

A session persists conversation history across tasks. The CLI decides when to carry it forward, when `/new` clears it, and when `/quit` ends the process. The agent loop only runs one task.

# Configuration & Environment

## Why is a config object easier to test than a module that reads `process.env` whenever it is called?

A config object can be injected, asserted, and varied in tests. A module that reads `process.env` at call time is global hidden state: two tests share it, production can differ silently, and changing one value can affect unrelated code paths.

## Why normalise the model name during configuration?

Providers accept different names and slugs for the same model. Normalising once in config produces one canonical value, so tools and logs do not disagree and a bare name is not silently treated as a different model.

## Why search upward for `.env` instead of only checking the current directory?

Project commands often run from subdirectories. The nearest `.env` matches the project context. Search stops at the filesystem root, and an explicit path can override it.

## Why should tools not read `process.env` directly?

That bypasses resolved configuration and creates hidden global state. Pass the needed values through the config or tool context so tests and production see the same source of truth.

## What is the configuration fingerprint used for?

It is a safe summary of effective settings, with no secrets, for logs and the startup banner. It helps reproduce and debug an environment without exposing keys.

## What is the configuration precedence?

Explicit CLI overrides beat `.env`, which beats the shell environment, which beats built-in defaults. The resolved values are passed inward as one config object.

## What does `findEnvFile` do?

It searches upward from the starting directory for the nearest `.env` file, stopping at the filesystem root. An explicit env-file path can override the search.

## What does `normalizeModel` do?

It converts a bare model name into the canonical provider slug expected by the API, so a short name and a full slug do not silently become different models.

## What is `fingerprint` used for?

It produces a safe summary of the effective configuration for logs and the startup banner. It must not expose secrets such as API keys.

## What does `loadConfig` return?

A resolved configuration object containing the model, workspace root, memory file, command policy, step limit, and other runtime settings. Tools and the loop receive values from that object rather than reading the environment directly.

# Workspace & Path Policy

## Why is rejecting `../` not enough on its own? What can a symlink do that a plain path cannot?

Rejecting `../` only catches one spelling of escape. Paths can be absolute, drive-relative, UNC, expanded from environment variables, or hidden behind a symlink or junction inside the workspace. The resolver must normalise first, resolve the deepest existing ancestor with `realpath`, then test containment.

## Why must `~`, `%VAR%`, and `$VAR` be expanded before the containment check?

A path that looks harmless before expansion can become a home or system path afterwards. Expansion first means every later check sees the real path being requested. Checking before expansion would allow an environment variable or tilde to bypass the policy.

## Why are `resolve()` and `resolveRead()` separate methods?

They express different policies: writes are fenced, reads are deliberately open. Separate methods make the asymmetry explicit and prevent a caller from accidentally applying the wrong rule.

## Why resolve the deepest existing ancestor instead of the final path?

The final path may not exist yet. The deepest existing ancestor is the part that can be resolved with `realpath` to reveal symlinks or junctions; the not-yet-created remainder is appended afterwards.

## What race remains even after careful path checks?

Time-of-check/time-of-use: the filesystem can change between the check and the write. Path policy is best-effort against mistakes; adversarial concurrency needs OS or container isolation.

## What is `PathError`?

The error thrown when a requested path is invalid, malformed, or escapes the workspace under the strict write policy. It carries a clear reason for the refusal.

## What is `rel`?

The normalised path relative to the workspace root, using `/` separators. The root itself is represented as `.`.

## Why does `resolveRead` allow absolute paths?

Reads are deliberately open so the agent can inspect docs, logs, and libraries outside the workspace. Only mutation is fenced. Relative reads still start at the workspace root.

## What is the containment test?

After normalisation and realpath resolution, the relative path must be empty or must not start with `..` and must not be absolute. If it fails, the write is refused.

## Which Windows path forms are rejected?

Drive-absolute paths such as `C:\...`, drive-relative paths such as `C:foo`, and UNC paths such as `\\server\share` or `//server/share`.

# Sandbox & Command Safety

## What is the difference between "we checked the command" and "the command cannot affect the host"?

A command scan is a permission check: it looks at what the command appears to do and allows or denies it. A container or kernel boundary changes what the command is capable of doing. The workspace fence and deny-list are useful, but they are not the same guarantee as isolation.

## Why strip API keys and tokens from the child environment even when the command itself is allowed?

Least privilege: an allowed command still does not need the agent's secrets. Stripping keys and tokens prevents accidental printing, logging, or exfiltration through a command that was permitted for another reason. Policy and secret isolation are separate controls.

## What is the difference between `ask`, `allow`, and `deny` command policies?

`ask` requires confirmation and denies when there is no TTY; `allow` runs without a prompt; `deny` refuses. Hard-denied commands remain refused even under `--yes`.

## Why can hard-denied commands not be overridden by `--yes`?

They are the non-negotiable safety floor. If a convenience flag could bypass them, the policy would provide no real guarantee for demos or unattended runs.

## If command scanning can be bypassed, why keep it?

It is defence in depth. It catches obvious mistakes, adds friction to dangerous actions, and centralises policy. It is not the sole boundary; untrusted code still needs real isolation.

## What is `ForbiddenError`?

The error type used when the sandbox refuses an action. It has code `FORBIDDEN` and a reason that can be returned to the model as an observation.

## What is `shellWriteTargets`?

A scanner that inspects a shell command for paths it appears to write to, so the sandbox can apply the workspace write policy before running the command.

## What is `tokenizeCommand`?

A helper that splits a command into tokens so the sandbox can inspect the command name, arguments, and apparent write targets without executing it.

## What is `sandboxFor`?

A factory that binds a sandbox to a workspace and its policy, producing the object used by the tool dispatcher for write and command checks.

## What does `Sandbox.check()` do?

It resolves the requested action and path, applies the workspace and command policy, and throws `ForbiddenError` when the action is not allowed.

# Tools & Dispatcher

## Why return a tool error as text instead of throwing an exception that ends the run?

Throwing ends the run and loses the model's chance to adapt. Returning the error as a string keeps the protocol intact: every tool call gets a result, the observation becomes part of the message history, and the model can try a different approach on the next step.

## What makes a tool schema good enough for a model to use reliably?

A clear name, a narrow argument set, obvious required fields, descriptions that explain when to use it, validation before execution, and a predictable result format. Small, boring schemas are easier for the model to call correctly and easier for the harness to check.

## What belongs in a tool result string?

A truthful, bounded, model-readable outcome: success data, paths, errors, or refusals. It should contain enough context for the next step and must never be invented by the harness.

## How should the dispatcher handle an unknown tool or invalid JSON arguments?

Return an error observation instead of crashing. Name the tool or parse problem clearly, and still produce a tool result so the loop can continue and the model can adapt.

## Why should tools not be invoked directly by the model?

The model cannot execute code; it can only ask. Harness mediation provides validation, policy, logging, sandboxing, and a consistent result contract. Direct authority would remove those controls.

## What is `TOOL_NAMES`?

The canonical ordered list of the eight tool names. It is used for schemas, prompt rules, error messages, and tests.

## What is `TOOL_SCHEMAS`?

The OpenAI function-calling schemas sent with each model request. Each schema names the tool, describes it, and defines its parameters with `additionalProperties: false`.

## What is `runTool`?

The dispatcher entry point. It validates the tool name and arguments, applies policy, calls the handler, and returns a string observation. Errors are returned as strings, not thrown out of the loop.

## What is the difference between `create_file`, `write_file`, and `edit_file`?

`create_file` fails if the file already exists; `write_file` replaces a whole file; `edit_file` replaces an exact `old_string` with a new string.

## What is the `run_command` timeout?

Commands time out after 30 seconds. A timed-out command appends a timeout message to stderr and returns a non-zero result.

# Model Call & Provider Boundary

## What should the loop do when the response is cut off by the token limit?

Do not treat a truncated response as a complete one. Inspect the finish reason or length signal, discard or repair incomplete tool arguments, and either retry with a clear instruction or stop with an honest message. Never invent the missing arguments.

## Why inject the chat function instead of importing a provider client directly?

The loop should depend on an interface, not a vendor. Injecting the function makes it easy to swap providers, run offline with a fake model, and assert exactly which messages were sent without making a network request.

## What are `llm.js` responsibilities, and what are they not?

It builds the request, calls the provider, handles timeouts and HTTP failures, and normalises the response shape. It does not orchestrate the loop, execute tools, or format terminal output.

## Why normalise provider responses?

Providers differ in field names and tool-call representation. The loop should consume one stable shape, which reduces provider-specific branching and keeps the agent contract clear.

## On a timeout, should `llm.js` retry silently?

No. Retry policy should be explicit and bounded at the caller. Silent retries can duplicate cost or side effects and hide latency; return a clear failure instead.

## What is the `chat` signature?

`chat({ apiKey, model, messages, tools, signal, timeoutMs = 90_000 })`. It returns a normalised assistant message with content, tool calls, and finish reason.

## What is the request body?

`{ model, messages, tools, max_tokens: 2048 }`. The tools are the eight function schemas; the messages are the current conversation state.

## What is response normalisation?

Converting the provider response into a stable shape: assistant content, an array of tool calls, and a finish reason. The loop should not depend on provider-specific fields.

## What is the truncation guard?

If `finish_reason` is `length` and there are no tool calls, the loop appends a user message asking the model to continue with smaller tool calls. A truncated tool call is never dispatched.

## What happens on a model timeout?

The request is aborted through the signal and returns a clear failure. Retry policy is not hidden inside `llm.js`; the caller decides whether and how to retry.

# Prompt, Context & Memory Injection

## What belongs in the prompt, and what belongs in code that the model cannot edit?

The prompt carries instructions, rules, the memory digest, and the tool contract. Code carries enforcement: path containment, command policy, step limits, output caps. Anything that must be guaranteed belongs in code, not in a request the model can ignore.

## What happens when memory changes in the middle of a session?

The system prompt is rebuilt for each request, so a memory change can appear on the next model call without restarting the session. Conversation history remains, but the fresh prompt carries the current memory digest and rules.

## Why is the system prompt not a security boundary?

It is text the model may ignore or be manipulated into overriding. Guarantees belong in code: path policy, command policy, limits, and validation. The prompt guides behaviour; it does not enforce it.

## What is prompt injection in this agent?

Untrusted content such as file text or tool output contains instructions that try to override the system rules. Treat that content as data, keep least privilege, and enforce decisions outside the prompt.

## Why keep tool schemas separate from the prompt text?

The schemas are a structured API contract sent with the request; the prompt describes behaviour. Mixing them duplicates information and lets the two definitions drift apart.

## What is `systemRules`?

The prose rules that tell the model which tools exist, that reads are open, that writes are fenced, and how to work safely. The tool names are interpolated into the rules.

## What is `buildSystemPrompt`?

A function that returns the system rules and appends the current memory digest when a memory store and digest exist.

## What is the memory digest?

The bounded set of memory lines, each starting with `- [`, that is injected into the system prompt. It is not the whole memory file.

## Why rebuild the system prompt for every task?

Memory can change between tasks. Rebuilding the prompt means the next model call sees the latest durable notes without restarting the process or carrying a stale prompt in history.

# Agent Loop & Message Protocol

## Why must every `tool_call_id` get a matching tool result before the next model call?

The provider protocol expects each assistant `tool_call` to be followed by a tool message carrying the same `tool_call_id`. Without that pairing the next request is malformed, and the model sees an incomplete record of what it asked for and what happened.

## Why does the loop need a step limit?

Without a limit, a confused model can loop forever, spend money, or flood the transcript. A step limit turns that into a bounded, observable failure with a clear reason, and it makes loop tests deterministic.

## Why append the assistant reply before executing its tools?

The history must show what the model requested. Tool results then attach to that assistant turn through their ids. Without the assistant message, the tool messages have no preceding call.

## What if the model returns text and tool calls together?

Preserve the text in the assistant message and process the tool calls. The text may be commentary; the reply is not final until a model response contains no tool calls.

## Why not automatically retry a failed tool?

The failure is an observation for the model to reason about. Blind retries can repeat side effects. Any retry policy should be explicit, bounded, and owned by the caller.

## What does `runTask` return?

An object such as `{ ok, reason, messages }`. The CLI uses the result to choose an exit code and to decide whether to carry history into the next task.

## What is `maxSteps`?

The maximum number of model/tool iterations for one task. It bounds cost and runaway loops and turns an endless run into an observable step-limit failure.

## What is `history`?

The message array carried from previous tasks in a session. The loop prepends a fresh system prompt, then the history, then the new user task.

## What is `StepLimit`?

The hook fired when the loop exhausts `maxSteps`. It receives the step count and messages and is followed by `SessionEnd` with a failure reason.

## What is `SessionEnd`?

The hook fired on every exit path, including success, step limit, hook block, and request failure. It is the final lifecycle observation for the run.

# Hooks & Lifecycle

## Which hook would you use to log every model request, and which would you use to block a dangerous tool?

Log every request with `PreModel` or `PostModel`; both observe the model boundary. Block a dangerous action with `PreToolUse`, because that fires after the model has chosen a tool but before the dispatcher executes it.

## What does "first block wins" mean for hook handlers?

The first handler that returns a block stops the action. Later handlers for that moment are skipped, and the tool or run does not proceed. The first refusal is the decision, which keeps policy order predictable.

## What can `PostToolUse` change that `PreToolUse` cannot?

`PostToolUse` sees the result and may replace the observation text. `PreToolUse` sees the proposed call and may block it before execution. They run at different times for different purposes.

## Why inject hooks instead of importing a global hook registry?

Injected hooks are scoped to a run, easy to test, and free of cross-test global state. A global registry makes behaviour depend on registration order and hidden setup.

## What is the danger of putting policy only in hooks?

Hooks are optional and can be missing or misconfigured. Safety must hold by default in the core. Hooks are for observation and extension, not the only enforcement layer.

## What are the nine hook events?

`SessionStart`, `UserPromptSubmit`, `PreModel`, `PostModel`, `PreToolUse`, `PostToolUse`, `Stop`, `StepLimit`, and `SessionEnd`.

## What is a hook payload?

An event-specific object. For example, `PreToolUse` receives the tool name, arguments, and step; `PostToolUse` receives the result and success flag.

## What is `traceHooks`?

The default trace that prints `[HOOK:Name]` lines as hooks fire. It makes lifecycle behaviour visible without attaching custom handlers.

## What is `hookMeta`?

The catalogue metadata for each hook: name, icon, colour, timing, payload, capabilities, and teaching note. It powers `--hooks` and the trace.

## What is `printHookCatalogue`?

The function behind `--hooks`. It prints the nine-hook catalogue and a hint for attaching handlers with `hooks.on(...)`.

# Memory & Persistence

## What deserves a durable memory entry, and what should the agent rediscover each run?

Store durable facts: project decisions, stable preferences, constraints that should survive a restart. Rediscover transient things such as directory listings, file contents, test output, and today's task details. Memory is for what is expensive to lose, not for everything the agent has seen.

## Why not simply store everything the agent sees in memory?

Memory is for durable, reusable facts, not a transcript copy. Storing everything makes the file stale and expensive to inject, hides the current truth among old observations, and turns memory into an unbounded second context window.

## How does memory avoid duplicate entries?

Use a stable key, slug, or normalised comparison and refresh the existing entry instead of appending another. Deduplicate on write and keep the file bounded.

## What happens when memory exceeds the prompt budget?

Select the most relevant or recent entries within the configured character or token budget, and state what was omitted. The file may hold more than the prompt injects.

## Why search or query memory instead of injecting everything?

Large memory bloats the context, distracts the model, and may exceed the window. Retrieval keeps the prompt focused on what the current task needs.

## What is the memory file format?

One bullet per memory: `- [tag] text _(date)_`. The tag classifies the note, and the date records when it was last written.

## What is `remember`?

The tool that adds or refreshes a durable memory entry. It normalises whitespace and avoids duplicate entries.

## What is `recall`?

The tool that searches memory for relevant entries and returns a bounded result. It is the lazy retrieval path, complementing the eager prompt digest.

## What is `digest`?

The bounded set of memory entries injected into the system prompt. It is selected from the file and capped by the prompt budget.

## What are `maxEntries` and `promptChars`?

Bounds on the memory store and the prompt digest. They prevent memory from growing without limit or swallowing the context window.

# UI, Output & TTY Behaviour

## What breaks when formatting code is scattered through the agent loop?

Formatting and logic become entangled. Tests must match colour codes and spacing, logs contain ANSI escapes when redirected, and the loop cannot run without the presentation layer. Keeping output in `ui.js` makes both layers easier to change.

## How does keeping presentation in one file make testing easier?

The UI layer can be tested or disabled independently, colour can be stripped for logs, and the loop can be tested without matching ANSI codes. It also prevents presentation changes from forcing changes in agent logic.

## Why should UI helpers own formatting rather than embed decisions?

Formatting should be deterministic and testable, separate from logic. Central helpers make output consistent, allow colour stripping, and keep decisions in the agent rather than the printer.

## What should happen when stdout is not a TTY?

Disable colour and interactive prompts, emit plain text, and deny confirmation rather than hang. Redirected logs must remain readable and machine-friendly.

## Why format tool results in the UI instead of inside `tools.js`?

Tools produce data and result strings; the UI decides presentation. Mixing them makes tools depend on a terminal and harder to reuse or test.

## What is `ui`?

The single module for terminal presentation: step headers, tool calls, results, errors, refusals, memory notes, and exit notes. The agent loop does not format output itself.

## What are `ui.tool`, `ui.result`, `ui.error`, and `ui.forbidden`?

Output helpers for the corresponding events. They keep formatting consistent and make the terminal transcript readable.

## How does colour behave without a TTY?

Colour and interactive formatting should be disabled or reduced so redirected logs remain plain and machine-readable.

## What is `ui.exitNote`?

A helper that prints a plain-English explanation for a non-zero exit code, such as a missing task, a failed request, or a step-limit stop.

## What is `ui.memory`?

The helper that prints how many memory entries were added to the system prompt, making memory injection visible.

# Heartbeat & Liveness

## What can a heartbeat prove, and what can it never prove?

A heartbeat proves the process is alive and still scheduling work. It cannot prove progress, correctness, or that a remote call is healthy. A heartbeat during a hung model request still tells you the process has not died, which is useful for locating the stall.

## What should an external watchdog do if the heartbeat stops?

A watchdog can treat the process as stalled or dead and restart or report it. The process itself may be unable to announce failure if its event loop is blocked, which is exactly why the heartbeat is external evidence, not a self-certification.

## Why update a timestamp instead of printing a heartbeat line every interval?

A timestamp is cheap, machine-readable, and does not flood the transcript. An external watchdog can poll it while the real output stays readable.

## Can a heartbeat keep a hung operation alive?

No. It reports liveness; it cannot unblock a hung call. Timeouts, cancellation, or an external watchdog must handle the actual stall.

## Where should heartbeat logic live?

At the process or CLI boundary, or injected into a long-running loop as a dependency. The core agent should not depend on a specific heartbeat transport.

## What is `heartbeat(log, ms)`?

A helper that periodically updates a liveness timestamp through the injected logger. It shows the process is still alive during long operations.

## What is `heartbeatMs`?

The configured heartbeat interval passed into the run. It controls how often the liveness timestamp is refreshed.

## What is `log`?

The injected logging interface. The heartbeat uses it instead of writing directly to the terminal, which keeps the helper testable.

## How is the heartbeat cleaned up?

The interval is cleared in a `finally` path so it stops when the model call or run ends, including on failure.

## Where is the heartbeat started?

Around the model call, before `chatFn` is invoked. That is the long external operation where liveness matters most.

# Demo & Scorecard

## What is the difference between a demo that runs successfully and a demo that proves a guard held?

A successful run only shows that a path executed. A proof checks the expected observation: the forbidden write returns `FORBIDDEN`, the file is absent on disk, the denied command does not run, and the scorecard records that result. Evidence beats a green checkmark.

## Why is a scripted model preferable to mocking the HTTP layer in the demo?

A scripted model returns the exact assistant messages and tool calls the demo needs, so the loop and dispatcher are exercised directly. Mocking HTTP still forces the learner to reason through transport details that are irrelevant to the demo’s purpose.

## What should the scripted model return first in the demo?

A tool call that exercises a teaching point, such as listing, writing, or running. Later calls react to those results and end with a final answer. The demo should show the loop, not just print text.

## Why should the demo deliberately attempt a forbidden write or denied command?

It produces a real observation from the guard: a `FORBIDDEN` or `DENIED` result, no file or command side effect, and a scorecard entry. The demo proves the refusal path works instead of only showing successful actions.

## What should the scorecard not claim?

It should not claim full security, container isolation, or live-model correctness. It reports only what the scripted run observed, and its limits should be stated honestly.

## What is `DEMO_SCRIPT`?

The scripted sequence of assistant messages and tool calls used by the offline demo. It exercises the loop, tools, guards, and final answer without a network.

## What is `demo.js`?

The offline demo module that supplies the scripted model and runs the scorecard. It is the no-key path for teaching and verification.

## What is the scorecard?

A summary that reads the demo's own tool results and reports what happened, including whether refusals and guards behaved as expected.

## What is `--demo`?

The CLI flag that runs the scripted demo instead of a live model. It needs no API key and no network.

## Why is `DEMO_SCRIPT.length + 1` used for `maxSteps`?

It gives the scripted model enough steps to emit every scripted response and still reach a final answer, while keeping the run bounded.

# Testing & Determinism

## Which dependency would you inject first to test the loop without a real model?

Inject the model first. A fake model can return a scripted tool call followed by a final answer, which drives the loop deterministically without a network key. The clock, logger, confirmation function, hooks, memory, and workspace can then be added as needed.

## What is a fake model, and what should it record?

A fake model is a function with the same interface as the real chat call, returning canned responses. It should record the messages it received and the order of calls so tests can assert what the loop sent and when.

## What should be tested with a fake model versus a real temporary filesystem?

Use a fake model for loop protocol, ordering, and termination. Use real temporary directories for workspace resolution, sandbox writes, and memory persistence. Integration tests combine both at the boundaries.

## Why must the write fence and command policy have negative tests?

Refusals are the safety contract. Tests must prove that an outside write returns `FORBIDDEN` without touching disk, that a hard-denied command never runs, and that a denied confirmation has no side effect.

## Which dependencies must be injected to make the agent loop deterministic?

At minimum the model, clock, logger, confirmation function, hooks, memory, and workspace. Temporary directories and fixed inputs remove filesystem and timing variation; no test should depend on network access or shared global state.

## What is a fake model?

A function with the same interface as the real chat call that returns canned assistant messages. It records the requests it receives so tests can assert the loop's behaviour.

## What is `node:test`?

The built-in Node.js test runner used by the project. It avoids adding a test framework dependency.

## What is `assert`?

The built-in Node.js assertion module used to check expected values and thrown errors in tests.

## What is a test seam?

An injected dependency such as the model, clock, logger, confirmation function, hooks, memory, or workspace. Seams let tests replace real I/O with deterministic fakes.

## What is an offline test?

A test that needs no network, API key, or external service. The real loop runs with a fake model and temporary filesystem state.

# Acceptance Criteria & Failure Modes

## Which acceptance criterion would catch a regression in the write fence?

The clearest criterion is the write-fence test: attempt a write outside `workspace/`, confirm one `FORBIDDEN` line and a returned observation, and verify that no file was created. That catches regressions in path resolution, policy, and tool behaviour together.

## Why should acceptance criteria be observable at the CLI level?

The CLI is the user-facing contract. Observable criteria catch integration failures that unit tests can miss, and they can be checked without knowing internal function names. If the behaviour cannot be observed from outside, it is hard to call it done.

## What exit code should a run return when it hits the step limit, and why?

The specified step-limit exit code should be distinct from success, usage errors, and missing-key failures. It lets scripts and tests distinguish "the agent stopped because it ran out of budget" from other failure modes.

## What observable evidence should the acceptance suite require for a blocked command?

A refusal line, a returned `DENIED` observation, no command side effect, and the expected hook trace or exit behaviour. The test should fail if any of those are missing.

## Which sandbox failure paths must acceptance cover?

An outside write, a hard-denied command under `--yes`, an `ask` policy with no TTY, a blocked `PreToolUse` hook, and a child environment without secrets. These are the behaviours that define the safety contract.

## What are acceptance criteria?

Observable behaviours the finished app must demonstrate, such as a refused outside write, a denied command, a persisted memory, or a step-limit exit code.

## What is the write fence test?

Attempt a write outside `workspace/`, confirm a `FORBIDDEN` observation and one refusal line, and verify that no file was created.

## What is the command policy test?

Check that `deny` refuses all commands, `ask` denies without a TTY, `allow` runs permitted commands, and hard-denied commands cannot be overridden by `--yes`.

## What is the memory persistence test?

Write a memory, restart the process, and confirm the entry is still present and available to `recall` or the prompt digest.

## What is the hook trace test?

Run a normal task and confirm the expected `[HOOK:Name]` lines appear in order, and that `--no-hooks` silences them.

# Design Philosophy & Extension

## What goes wrong if you build the agent loop before the workspace and sandbox contracts?

You get a loop that can act before the world around it is trustworthy. Writes, reads, command policy, and tool results are all undefined or unsafe, and tests become coupled to whatever behaviour happens to emerge. Contracts first make the loop small and predictable.

## Why build the UI early if it is not core agent logic?

The UI establishes the project's output language early: step headers, tool results, errors, and refusals. Building it first gives later code a stable presentation seam, makes demos readable, and keeps formatting tests separate from agent logic.

## Which contracts must be stable before `agent.js` can be tested with a fake model?

The chat-function interface, the tool dispatcher and result format, the hook API, the memory query/update contract, and the workspace write policy. Once those seams are fixed, the loop can be driven deterministically.

## What is a good checkpoint after the sandbox is complete?

Prove that an allowed write succeeds, an outside write is refused with no side effect, a denied command is blocked, and secrets are absent from the child environment. Then build on that trusted base.

## Why defer the CLI until the loop works?

The CLI adds flags, sessions, streams, signals, and process exits. The core loop and its fakes should be proven first; the CLI then wires a tested library into a program.

## Which additions would violate the project’s bounded-autonomy constraint?

Arbitrary shell execution without policy, unbounded loops or output, automatic dependency installation, a hidden memory index, or multi-agent orchestration without explicit limits. Each adds authority or state the harness cannot reliably bound.

## What constraints must any new feature satisfy without breaking the architecture?

It must have one obvious place, remain testable offline, respect existing path and command policy, avoid hidden global state, stay within bounded limits, and not make the core loop harder to explain or observe.

## Why is hidden global state a problem for the agent’s behaviour and tests?

It makes behaviour depend on prior runs or module load order, so the same messages can produce different results. Explicit state passed through `runTask` keeps behaviour reproducible and lets tests control every input.

## What does bounded autonomy mean in practice?

Limits on steps, time, output, memory, command policy, and permissions. The agent can act, but it cannot run forever, spend without bound, or escape its defined scope.

## What safety claims must the project avoid making about its sandbox?

It must not claim container-level isolation, complete command safety, or that the deny-list cannot be bypassed. It should state that the workspace fence and command scanner are best-effort and that untrusted code needs a real external boundary.

## What does "one obvious place for each decision" mean?

Config in `config.js`, path policy in `workspace.js`, mutation policy in `sandbox.js`, prompt in `prompt.js`, presentation in `ui.js`, and process concerns in `cli.js`.

## What is bounded autonomy?

The agent can act, but only within explicit limits: step count, command policy, output caps, memory bounds, timeouts, and workspace containment.

## What is honest safety?

Stating that the workspace fence and command scanner are best-effort, not a container, and that untrusted code needs a real external isolation boundary.

## What is "no hidden state"?

Memory is a file, history is a message array, and configuration is a resolved object. Behaviour should not depend on invisible globals or module load order.

## What does "small enough to explain" mean?

The project resists features that make the core loop harder to read, test, or observe. One loop, eight tools, nine hooks, and a small set of files.

# Operations, Troubleshooting & Limits

## What must the repository contain for the offline demo to run without external services?

Source files, a working package script, the scripted model and demo data, and a command that needs no API key or network. The demo must create its own workspace state and clean up or isolate it safely.

## What operational information must the README provide to reproduce the demo and a live run?

The install and run commands, the offline demo command, the environment variables required for live mode, where output and workspace files appear, and the known limitations of the sandbox.

## How should the build prompt relate to the implementation so the two stay accurate?

The prompt should specify the same file boundaries, exported contracts, and observable behaviours as the code. When the implementation changes, the prompt must change with it; otherwise it becomes an inaccurate second specification.

## Which boundaries must an architecture diagram make explicit?

The loop and dispatcher, the workspace write fence, the sandbox boundary, hook call sites, the memory file, and the separation between CLI, UI, and agent. The diagram should show direction of control and where policy is enforced.

## What limitations must the README state about the workspace fence and sandbox?

That the fence is a path policy, not a container; that command scanning is best-effort and bypassable; that reads are deliberately open; and that strong isolation requires an external boundary such as Docker or a kernel sandbox.

## What are the most common failure modes?

A missing API key, no TTY for confirmation, a step-limit stop, a forbidden path, a denied command, or a model request failure. Each has a distinct message or exit code.

## What does `--help` show?

Usage, flags, and examples. It works without a key or configuration.

## What does `--hooks` show?

The full nine-hook catalogue with timing, payload, capabilities, and a hint for attaching handlers. It needs no key.

## What does `--memory` show?

The memory store, its label, and the exact digest that would be injected into the system prompt. It needs configuration but no model call.

## What are the known limitations?

The workspace fence is a path policy, not a container; reads are open; command scanning is best-effort and bypassable; and strong isolation requires Docker or a kernel sandbox.

## How should a student troubleshoot a failed run?

Read the red error line, check the exit code meaning, inspect the hook trace, and verify the workspace path, command policy, API key, and step limit.
