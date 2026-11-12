export const QQ_STYLE_ID = 'xmanrui-dsh-im-qq-settings';

const CSS = String.raw`
.dqq-page { --ddt-accent: #1677ff; --ddt-accent-deep: #0958d9; --ddt-accent-wash: #eaf3ff; }
.dqq-avatar, .dqq-brand { color: #fff; background: #1677ff; }
.dqq-avatar svg, .dqq-brand svg { display: block; }
.dqq-voicePanel { display: grid; gap: 12px; padding: 16px; border: 1px solid var(--dsw-alias-border-l2, #dfe1e5); border-radius: 12px; background: var(--dsw-alias-bg-layer-3, #fff); }
.dqq-voiceHeader { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.dqq-voiceHeader h3, .dqq-voiceHeader p, .dqq-voiceHint, .dqq-voiceError { margin: 0; }
.dqq-voiceHeader h3 { color: var(--dsw-alias-label-primary, #1f2329); font-size: 14px; line-height: 21px; font-weight: 650; }
.dqq-voiceHeader p, .dqq-voiceHint { color: var(--dsw-alias-label-secondary, #646a73); font-size: 12px; line-height: 18px; }
.dqq-voiceHeader > span { flex: none; color: var(--dsw-alias-label-tertiary, #8f959e); font-size: 11px; line-height: 17px; }
.dqq-voiceField { display: grid; gap: 5px; color: var(--dsw-alias-label-secondary, #646a73); font-size: 12px; line-height: 18px; }
.dqq-voiceField select, .dqq-voiceField input { width: 100%; min-width: 0; height: 36px; padding: 0 11px; border: 1px solid var(--dsw-alias-border-l2, #dfe1e5); border-radius: 8px; color: var(--dsw-alias-label-primary, #1f2329); background: var(--dsw-alias-bg-layer-1, #fff); font: inherit; font-size: 13px; }
.dqq-voiceField select:focus-visible, .dqq-voiceField input:focus-visible { outline: 2px solid color-mix(in srgb, var(--ddt-accent) 22%, transparent); outline-offset: 1px; border-color: var(--ddt-accent); }
.dqq-voiceActions { display: flex; justify-content: flex-start; }
.dqq-voiceError { color: var(--dsw-alias-state-error-primary, #d54941); font-size: 12px; line-height: 18px; }
`;

export function installQqStyles() {
  if (typeof document === 'undefined') return () => {};
  const existing = document.querySelector(`style[data-plugin-css="${QQ_STYLE_ID}"]`);
  if (existing) return () => {};
  const style = document.createElement('style');
  style.dataset.plugin = '@xmanrui/dsh-im';
  style.dataset.pluginCss = QQ_STYLE_ID;
  style.textContent = CSS;
  document.head.appendChild(style);
  return () => style.remove();
}
