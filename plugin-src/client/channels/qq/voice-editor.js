import * as React from 'react';

import { h } from '../../i18n.js';
import { normalizeQqVoice } from './api.js';

export function QqVoiceEditor({ value, disabled = false, onSave }) {
  const normalized = normalizeQqVoice(value);
  const [mode, setMode] = React.useState(normalized.mode);
  const [maxCharacters, setMaxCharacters] = React.useState(normalized.maxCharacters);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const next = normalizeQqVoice(value);
    setMode(next.mode);
    setMaxCharacters(next.maxCharacters);
  }, [value?.mode, value?.maxCharacters]);

  const save = async () => {
    if (saving || disabled) return;
    setSaving(true);
    setError(null);
    try {
      await onSave?.({ mode, maxCharacters });
    } catch (cause) {
      setError(cause?.message ?? 'QQ 语音回复设置保存失败，请重试。');
    } finally {
      setSaving(false);
    }
  };

  return h('section', { className: 'dqq-voicePanel', 'aria-label': 'QQ 语音回复' },
    h('div', { className: 'dqq-voiceHeader' },
      h('div', null,
        h('h3', null, '语音回复'),
        h('p', null, '使用“语音朗读”插件当前保存的服务商、模型和音色；文字回复始终保留。')),
      saving ? h('span', { role: 'status' }, '保存中…') : null),
    h('label', { className: 'dqq-voiceField' },
      h('span', null, '发送规则'),
      h('select', {
        value: mode,
        disabled: disabled || saving,
        onChange: (event) => setMode(event.target.value),
      },
      h('option', { value: 'off' }, '关闭'),
      h('option', { value: 'voice-input' }, '收到 QQ 语音时附带语音回复'),
      h('option', { value: 'always' }, '每次正常回复都附带语音'))),
    h('label', { className: 'dqq-voiceField' },
      h('span', null, '单段最多字符数'),
      h('input', {
        type: 'number', min: 1, max: 12000, step: 1,
        value: maxCharacters,
        disabled: disabled || saving,
        onChange: (event) => setMaxCharacters(Math.min(12_000, Math.max(1, Number(event.target.value) || 1))),
      })),
    h('p', { className: 'dqq-voiceHint' },
      '需要安装并配置 dsh-xiaomi-tts。服务不可用、合成失败或 QQ 拒绝语音时，只发送原文字，不中断会话。'),
    h('div', { className: 'dqq-voiceActions' },
      h('button', {
        type: 'button', className: 'ddt-button', 'data-kind': 'secondary',
        disabled: disabled || saving,
        onClick: () => void save(),
      }, saving ? '正在保存…' : '保存语音回复设置')),
    error ? h('p', { className: 'dqq-voiceError', role: 'alert' }, error) : null);
}
