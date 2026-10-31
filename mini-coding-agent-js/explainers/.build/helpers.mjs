/** Small HTML helpers shared by every generated lesson. */

export const esc = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

export const panel = (label, source, { at = 0, tag = 'source', cls = '' } = {}) => `
<div class="panel ${cls}" data-at="${at}">
  <div class="panel-head"><span>${esc(label)}</span><span class="panel-lang">${esc(tag)}</span></div>
  <pre>${esc(source)}</pre>
</div>`;

export const consoleBlock = (label, source, { at = 0, cls = '' } = {}) => `
<div class="console ${cls}" data-at="${at}">
  <div class="console-bar">${esc(label)}</div>
  <pre>${esc(source)}</pre>
</div>`;

export const callout = (text, { at = 0, cls = '' } = {}) => `
<div class="callout-mini ${cls}" data-at="${at}">${text}</div>`;

export const statement = (text, { at = 0, label = 'remember' } = {}) => `
<div class="big-statement" data-at="${at}">
  <span class="statement-label">${esc(label)}</span>${text}
</div>`;

export const card = ({
  at = 0, icon = '', title = '', tag = '', body = '', codeText = '', accent = '', cls = '',
}) => `
<article class="info-card ${cls}" data-at="${at}"${accent ? ` style="--accent:${accent}"` : ''}>
  <div class="info-head">
    ${icon ? `<span class="info-ico">${icon}</span>` : ''}
    <strong>${title}</strong>
    ${tag ? `<span class="info-tag">${esc(tag)}</span>` : ''}
  </div>
  ${body ? `<p>${body}</p>` : ''}
  ${codeText ? `<code>${esc(codeText)}</code>` : ''}
</article>`;

export const grid = (items, { cols = 2, at = 0, cls = '' } = {}) => `
<div class="info-grid cols-${cols} ${cls}" data-at="${at}">
  ${items.join('\n')}
</div>`;

export const navNode = ({ num = '', icon = '', name = '', accent = '#d97757' }) => `
<div class="node" style="--accent:${accent}">
  ${num ? `<span class="node-num">${num}</span>` : ''}
  ${icon ? `<span class="node-ico">${icon}</span>` : ''}
  <span class="node-name">${esc(name)}</span>
</div>`;

export const stepNode = ({ num = '', icon = '', name = '', note = '', accent = '#d97757' }) => `
<div class="step-node" style="--accent:${accent}">
  ${num ? `<span>${num}</span>` : ''}
  ${icon ? `<span class="step-ico">${icon}</span>` : ''}
  <strong>${esc(name)}</strong>
  ${note ? `<small>${esc(note)}</small>` : ''}
</div>`;

export const arrow = (label = '→') => `<span class="node-arrow">${label}</span>`;
export const box = (label) => `<span class="small-box">${esc(label)}</span>`;

export const flow = (items, { at = 0, cls = '' } = {}) => `
<div class="flow-strip ${cls}" data-at="${at}">
  ${items.join('\n  ')}
</div>`;

export const kvList = (rows, { at = 0, cls = '' } = {}) => `
<div class="kv-list ${cls}" data-at="${at}">
  ${rows.map(([k, v]) => `<div class="kv-row"><span>${esc(k)}</span><strong>${v}</strong></div>`).join('\n  ')}
</div>`;

export const pills = (items, { at = 0, cls = '' } = {}) => `
<div class="pill-row ${cls}" data-at="${at}">
  ${items.map((x) => `<span class="pill">${esc(x)}</span>`).join('\n  ')}
</div>`;

export const checklist = (items, { at = 0, cls = '' } = {}) => `
<div class="check-list ${cls}" data-at="${at}">
  ${items.map(({ icon = '→', title = '', text = '' }) => `
    <div class="check-item"><span class="check-ico">${icon}</span><div>${title ? `<strong>${title}</strong> ` : ''}${text}</div></div>`).join('\n  ')}
</div>`;

export const stats = (items, { at = 0 } = {}) => `
<div class="recap-stats" data-at="${at}">
  ${items.map(([n, label]) => `<div class="recap-stat"><b>${esc(n)}</b><span>${esc(label)}</span></div>`).join('\n  ')}
</div>`;

export const rules = (items, { at = 0 } = {}) => `
<div class="recap-rules" data-at="${at}">
  ${items.map(([title, text]) => `<div class="rule"><span>→</span><div><strong>${title}</strong> ${text}</div></div>`).join('\n  ')}
</div>`;

export const twoCol = (left, right, { cls = '' } = {}) => `
<div class="two-col ${cls}">
  ${left}
  ${right}
</div>`;

export const sceneBody = (content, { cls = '' } = {}) => `<div class="scene-body ${cls}">${content}</div>`;
