# From an AI Agent in HTML to Our Own Mini Coder in JavaScript

Course materials for a hands-on look at how AI agents actually work — starting with one HTML page and one `fetch` call, and ending with a working coding agent in your terminal that reads, writes and edits real files.

No frameworks. No SDKs. No magic. Just an API call in a loop, with every layer built on top of it in plain JavaScript.

> **The one thing to take away:** an agent is a loop around a model call with a handful of functions the model is allowed to ask for, and a harness that decides what those functions may touch.

---

## What's in this repo

| Folder / file | What it is |
|---|---|
| `HTML-PAGES/` | Six standalone demo pages: basic chat, RAG, tool calling, animated tool-call round trip, animated memory explainer, and chat with `localStorage` memory |
| `HTML-EXPLAINERS/` | Supporting notes, diagrams and explainer pages for the concepts in the HTML section |
| `mini-coding-agent-js/` | The working mini coder: a ReAct loop, eight tools, sandbox, memory, hooks, CLI and offline tests |
| `images/` | Diagrams and screenshots used throughout the course |
| `UDEMY.txt` | Full course description and outline |
| `UDEMY-LIST.txt` | The ten key learning outcomes |
| `OPENROUTER-EXAMPLE.txt` | Example format for the browser demos' key file |
| `.env.example` | Template configuration for the Node agent |
| `the-loop.png` | The core think → model call → tool calls diagram |

---

## The idea in one diagram

```
        ┌─────────────┐
   ┌───▶│  model call │  system + messages + tools schema
   │    └──────┬──────┘
   │           │ tool_calls?
   │    ┌──────▼──────┐
   │    │  dispatcher │  validate args → run tool → string result
   │    └──────┬──────┘
   └───────────┘        result appended as { role: "tool", tool_call_id }
                │
                └── no tool_calls → final answer, stop
```

Think, then model call, then tool calls. If there are none, print the answer and stop. If there are some, run the tools, append the results and loop back. Every agent you meet afterwards is a variation on this.

---

## Part 1 — The HTML demos

Open any page in `HTML-PAGES/` over HTTP. The pages read the API key at runtime from `OPENROUTER.txt`, and a browser cannot fetch a local file from a `file://` page.

### Setup

1. Copy `OPENROUTER-EXAMPLE.txt` to `OPENROUTER.txt` in the repo root and add your key:

   ```ini
   OPENROUTER_API_KEY=sk-or-v1-...
   MODEL=deepseek/deepseek-v4.1-flash-1017
   ```

2. Serve the repo over HTTP. For example, with VS Code's **Live Server** extension, right-click an HTML page and choose **Open with Live Server**. Or use Python:

   ```bash
   python -m http.server 8000
   ```

3. Open <http://localhost:8000/HTML-PAGES/01-basic.html>.

`OPENROUTER.txt` is git-ignored — never commit a real key. Loading a key in the browser is fine for learning on your own machine, but it is not how you would ship it.

### The pages

| Page | Demonstrates |
|---|---|
| `01-basic.html` | The simplest possible one-shot chat completion |
| `02-rag.html` | RAG without a vector database — context injected into the system prompt |
| `03.1-tool-call-anthropic-animation.html` | Animated walkthrough of a tool-calling round trip |
| `03.2-tool-calling.html` | A real tools schema with a working dispatch loop |
| `04.1-chat-with-memory-animation.html` | Animated explainer of multi-turn memory |
| `04.2-chat-with-memory.html` | Multi-turn chat persisted to `localStorage` |

`config.js` is the shared, secret-free loader used by the pages.

---

## Part 2 — The mini coder (Node)

The same loop, moved out of the browser and wrapped in everything a real tool needs. See [`mini-coding-agent-js/README.md`](mini-coding-agent-js/README.md) for the full module-by-module reference.

### Requirements

- Node.js 20 or newer
- An OpenRouter account and API key
- Any model that supports tool calling

### Quickstart

```bash
cd mini-coding-agent-js
npm install                 # one dependency: chalk (coloured output)

# Reuse the .env at the repo root, or create one:
cp ../.env.example ../.env  # then add your key

npm start                   # interactive session
```

Run a single task non-interactively:

```bash
node src/cli.js "create hello.js that prints the date and run it"
```

### Useful commands

| Command | What it does |
|---|---|
| `npm start` | Interactive session: one task after another |
| `node src/cli.js "task"` | Run one task and exit |
| `node src/cli.js --demo` | Scripted run with no network — the loop and sandbox guards |
| `node src/cli.js --hooks` | Print the nine lifecycle hooks |
| `node src/cli.js --memory` | Show `src/memory.md` and what gets injected |
| `npm test` | Offline tests using a fake model — no key or network needed |

Inside a session: `/new` clears the conversation (not the workspace), `/quit` exits.

### Project layout

```
mini-coding-agent-js/
├── src/
│   ├── agent.js       the loop — about 120 lines of code
│   ├── prompt.js      system prompt and memory block
│   ├── tools.js       eight tools, their schemas and the dispatcher
│   ├── llm.js         one HTTP request with a timeout
│   ├── workspace.js   path policy: resolve / resolveRead
│   ├── sandbox.js     the write fence and shell write scan
│   ├── memory.js      long-term memory in a markdown file
│   ├── hooks.js       nine named lifecycle moments
│   ├── config.js      dot-env discovery and precedence
│   ├── cli.js         flags, banner, session loop, exit codes
│   ├── ui.js          the console palette
│   ├── heartbeat.js   liveness during slow calls
│   ├── demo.js        scripted demo and sandbox scorecard
│   └── memory.md      the human-readable long-term memory store
├── test/              offline test suite
└── workspace/         the only folder file tools may write to
```

### The eight tools

| Tool | Purpose |
|---|---|
| `list_files` | List files in the workspace |
| `read_file` | Read a file (reads are deliberately open) |
| `create_file` | Create a file; refuses to overwrite |
| `write_file` | Overwrite a file |
| `edit_file` | Exact-snippet replacement |
| `run_command` | Run a shell command with timeout and capped output |
| `remember` | Save a note to long-term memory |
| `recall` | Retrieve memories |

### Safety and boundaries

- **Write fence** — writes outside the workspace are refused, including absolute paths, `..`, `~`, environment variables and UNC paths.
- **Shell write scan** — the shell is not a way around the fence; write targets are scanned.
- **Environment allow list** — only thirteen environment names reach child processes, so a command cannot echo your API key into the transcript.
- **Command policy** — `CMD_POLICY=allow|ask|deny`, with hard-denied destructive patterns.
- **Bounded autonomy** — a step budget, request timeout and handling for truncated replies keep the loop finite.
- **Human in the loop** — commands can require a `y/N` confirmation; a non-interactive prompt degrades to deny.
- **Errors as observations** — a failed tool returns a result the model can read and correct, rather than crashing the loop.

### Configuration precedence

A CLI flag beats `.env`, and `.env` beats the shell environment.

| Variable | Default | Purpose |
|---|---|---|
| `OPENROUTER_API_KEY` (alias `OPENROUTER_KEY`) | required | API key; never logged |
| `OPENROUTER_MODEL` (alias `MODEL`) | `deepseek/deepseek-v4.1-flash-1017` | Model slug; bare names are expanded to `vendor/model` |
| `CMD_POLICY` | `ask` | `allow`, `ask` or `deny` shell commands |
| `MAX_STEPS` | `12` | ReAct iterations per task |
| `REQUEST_TIMEOUT_MS` | `90000` | Timeout per model call |
| `WORKSPACE_DIR` | `workspace` | The only folder file tools may write to |
| `MEMORY_FILE` | `src/memory.md` | Long-term memory store |
| `MEMORY_MAX_ENTRIES` | `60` | Cap on stored memories |

Copy `.env.example` to `.env` and fill it in. `.env` files and `node_modules/` are git-ignored.

---

## What you'll learn

**The four building blocks of every agent**

1. **Memory** — the model is stateless; every request must carry the whole conversation.
2. **Context** — what you put in front of the model decides whether it is useful.
3. **Looping** — repeat the call until the model stops asking for tools. Remove the loop and you have a chatbot.
4. **Tool calling** — the model cannot touch a file; it emits JSON naming a tool, and your code decides whether and how to run it.

**The engineering that makes it usable**

A sandbox, an environment allow list, a step budget, errors returned as observations, exit codes, human confirmation, lifecycle hooks and a plain-markdown memory file.

**The mindset**

Prompt engineering becomes context engineering becomes harness engineering. A better harness with a weaker model often beats a weak harness with a stronger model. Look at the patterns and structure, not the syntax.

---

## Testing

The test suite runs the real loop against a fake model, so it needs no API key and no network:

```bash
cd mini-coding-agent-js
npm test
```

---

## Course outline

The full outline, section by section, is in [`UDEMY.txt`](UDEMY.txt); the key outcomes are in [`UDEMY-LIST.txt`](UDEMY-LIST.txt).

| Section | Topic |
|---|---|
| 1 | The idea: what an agent actually is |
| 2 | Your first agent in HTML |
| 3 | Tools and loops |
| 4 | Memory |
| 5 | From page to program |
| 6 | The eight tools |
| 7 | Safety and boundaries |
| 8 | Memory that survives |
| 9 | Extending the loop with hooks |
| 10 | The program around the loop |
| 11 | Proving it works |
| 12 | Where next: streaming, sub-agents, retries, containers |

---

## Requirements

- A modern browser
- Node.js 20+ for the Node section
- An OpenRouter account and API key
- Python is optional, only to serve the HTML pages over HTTP

No machine learning, maths background or prior agent experience required — just comfort reading JavaScript and using a terminal.

---

## A note on secrets

- `OPENROUTER.txt` is used by the browser demos and is git-ignored.
- `.env` is used by the Node agent and is git-ignored.
- `.env.example` and `OPENROUTER-EXAMPLE.txt` contain placeholders only and are safe to commit.
- The Node agent never prints the key and never passes it to a child process.
