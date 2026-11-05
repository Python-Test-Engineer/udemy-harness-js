/** @type {string} OpenRouter chat-completions endpoint used for every request. */
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Send a chat-completions request to OpenRouter and return the parsed JSON reply.
 *
 * Handles missing keys, timeouts (combined with an optional caller signal),
 * non-2xx responses and error payloads by throwing descriptive `Error`s.
 *
 * @param {object} params
 * @param {string} params.apiKey - OpenRouter API key (bearer token).
 * @param {string} params.model - Model id, e.g. `anthropic/claude-sonnet-4.5`.
 * @param {Array<object>} params.messages - OpenAI-style chat messages.
 * @param {Array<object>} [params.tools] - Optional tool/function definitions.
 * @param {AbortSignal} [params.signal] - Optional caller abort signal.
 * @param {number} [params.timeoutMs=90000] - Request timeout in milliseconds.
 * @returns {Promise<object>} The raw OpenRouter response body.
 * @throws {Error} If the key is missing, the request times out, the HTTP status is not 2xx, or the body reports an error.
 */

export async function chat({ apiKey, model, messages, tools, signal, timeoutMs = 90000 }) {
  if (!apiKey || apiKey === '') {
    throw new Error('OPENROUTER_API_KEY is not set (put it in .env or the environment)');
  }

  const abortSignal = signal
    ? AbortSignal.any([signal, AbortSignal.timeout(timeoutMs)])
    : AbortSignal.timeout(timeoutMs);

  const body = { model, messages, max_tokens: 2048 };
  if (tools && tools.length > 0) {
    body.tools = tools;
  }

  let response;
  try {
    response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Title': 'min-coding-js',
      },
      body: JSON.stringify(body),
      signal: abortSignal,
    });
  } catch (err) {
    if (err.name === 'AbortError' || err.name === 'TimeoutError') {
      const seconds = Math.round(timeoutMs / 1000);
      throw new Error(`request timed out after ${seconds}s - OpenRouter did not answer`);
    }
    throw err;
  }

  if (!response.ok) {
    const status = response.status;
    let hint = '';
    if (status === 401) hint = ' (bad or revoked key)';
    if (status === 402) hint = ' (out of credits)';

    const bodyText = await response.text();
    throw new Error(
      `OpenRouter ${status}${hint}: ${bodyText.slice(0, 400)}`
    );
  }

  let data;
  try {
    data = await response.json();
  } catch (err) {
    const bodyPreview = (await response.clone().text()).slice(0, 200);
    throw new Error(`OpenRouter returned non-JSON: ${bodyPreview}`);
  }

  if (data.error) {
    const errText = typeof data.error === 'string'
      ? data.error
      : JSON.stringify(data.error);
    throw new Error(`OpenRouter error: ${errText.slice(0, 400)}`);
  }

  return data;
}

/**
 * Normalise an assistant message so it can be safely stored and re-sent.
 *
 * Keeps only `content` and well-formed `tool_calls`, drops reasoning fields,
 * and guarantees a `content` string when no tool calls are present.
 *
 * @param {object|null|undefined} message - Assistant message from the API.
 * @returns {{role: 'assistant', content?: string, tool_calls?: Array<object>}} A clean assistant message.
 */
export function sanitizeAssistant(message) {
  if (!message || typeof message !== 'object') {
    return { role: 'assistant', content: '' };
  }

  const out = { role: 'assistant' };

  if (message.content !== undefined && message.content !== null) {
    out.content = String(message.content);
  }

  const calls = message.tool_calls;
  if (Array.isArray(calls) && calls.length > 0) {
    out.tool_calls = calls.map((c) => ({
      id: c.id,
      type: c.type || 'function',
      function: {
        name: c.function?.name ?? '',
        arguments: c.function?.arguments ?? '{}',
      },
    }));
  }

  // If content is null/undefined and we have tool calls, delete content so providers don't complain
  if (out.content === undefined && out.tool_calls) {
    // nothing
  } else if (out.content === undefined) {
    out.content = '';
  }

  // Drop reasoning fields so they are not re-sent in every later turn
  // (done by only copying explicit fields above)

  return out;
}
