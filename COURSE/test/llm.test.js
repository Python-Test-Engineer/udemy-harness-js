import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { chat, sanitizeAssistant } from '../src/llm.js';

describe('llm', () => {
  it('chat throws when apiKey is missing', async () => {
    await assert.rejects(
      async () => chat({ apiKey: '', model: 'x', messages: [] }),
      /OPENROUTER_API_KEY is not set/
    );
  });

  it('chat throws when apiKey is empty string', async () => {
    await assert.rejects(
      async () => chat({ apiKey: '', model: 'x', messages: [] }),
      /OPENROUTER_API_KEY is not set/
    );
  });
});

describe('sanitizeAssistant', () => {
  it('keeps role, content, and tool_calls', () => {
    const raw = {
      role: 'assistant',
      content: 'Hello',
      tool_calls: [
        {
          id: 'call_1',
          type: 'function',
          function: { name: 'list_files', arguments: '{}' },
        },
      ],
      reasoning: 'I should list files',
      reasoning_content: '...',
    };
    const out = sanitizeAssistant(raw);
    assert.strictEqual(out.role, 'assistant');
    assert.strictEqual(out.content, 'Hello');
    assert.strictEqual(out.tool_calls.length, 1);
    assert.strictEqual(out.tool_calls[0].function.name, 'list_files');
    assert.strictEqual(out.reasoning, undefined);
    assert.strictEqual(out.reasoning_content, undefined);
  });

  it('deletes content when null and tool_calls exist', () => {
    const raw = {
      role: 'assistant',
      content: null,
      tool_calls: [
        { id: 'call_1', type: 'function', function: { name: 'x', arguments: '{}' } },
      ],
    };
    const out = sanitizeAssistant(raw);
    assert.strictEqual(out.role, 'assistant');
    assert.strictEqual(out.content, undefined);
    assert.ok(Array.isArray(out.tool_calls));
  });

  it('sets empty content when no tool_calls and content is null', () => {
    const raw = {
      role: 'assistant',
      content: null,
    };
    const out = sanitizeAssistant(raw);
    assert.strictEqual(out.role, 'assistant');
    assert.strictEqual(out.content, '');
    assert.strictEqual(out.tool_calls, undefined);
  });

  it('handles missing/invalid input', () => {
    const out = sanitizeAssistant(null);
    assert.strictEqual(out.role, 'assistant');
    assert.strictEqual(out.content, '');
  });

  it('preserves tool call structure', () => {
    const raw = {
      role: 'assistant',
      content: '',
      tool_calls: [
        {
          id: 'call_abc',
          type: 'function',
          function: { name: 'read_file', arguments: '{"path":"x"}' },
        },
      ],
    };
    const out = sanitizeAssistant(raw);
    assert.strictEqual(out.tool_calls[0].id, 'call_abc');
    assert.strictEqual(out.tool_calls[0].type, 'function');
    assert.strictEqual(out.tool_calls[0].function.name, 'read_file');
    assert.strictEqual(out.tool_calls[0].function.arguments, '{"path":"x"}');
  });
});

describe('chat mock', () => {
  // We can't easily mock global fetch in node:test without a helper,
  // but we can test the error surface through the signature.
  it('accepts tools array', () => {
    // Just verify it doesn't throw on parameter shape (key will fail)
    assert.rejects(
      chat({ apiKey: '', model: 'x', messages: [], tools: [{ type: 'function' }] }),
      /OPENROUTER_API_KEY/
    );
  });

  it('accepts custom timeoutMs', () => {
    assert.rejects(
      chat({ apiKey: '', model: 'x', messages: [], timeoutMs: 5000 }),
      /OPENROUTER_API_KEY/
    );
  });

  it('accepts abort signal', () => {
    const controller = new AbortController();
    assert.rejects(
      chat({ apiKey: '', model: 'x', messages: [], signal: controller.signal }),
      /OPENROUTER_API_KEY/
    );
  });
});
