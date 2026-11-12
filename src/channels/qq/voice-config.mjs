export const QQ_VOICE_REPLY_MODES = Object.freeze(['off', 'voice-input', 'always']);

export const DEFAULT_QQ_VOICE_CONFIG = Object.freeze({
  mode: 'off',
  maxCharacters: 1200,
});

export function normalizeQqVoiceConfig(value) {
  const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const mode = QQ_VOICE_REPLY_MODES.includes(source.mode)
    ? source.mode
    : DEFAULT_QQ_VOICE_CONFIG.mode;
  const requestedLimit = Number(source.maxCharacters);
  const maxCharacters = Number.isInteger(requestedLimit)
    ? Math.min(12_000, Math.max(1, requestedLimit))
    : DEFAULT_QQ_VOICE_CONFIG.maxCharacters;
  return Object.freeze({ mode, maxCharacters });
}

export function storedQqVoiceConfig(value) {
  const normalized = normalizeQqVoiceConfig(value);
  return normalized.mode === 'off' ? null : normalized;
}

export function validQqVoiceConfig(value) {
  return value && typeof value === 'object' && !Array.isArray(value)
    && Object.keys(value).every((key) => ['mode', 'maxCharacters'].includes(key))
    && QQ_VOICE_REPLY_MODES.includes(value.mode)
    && Number.isInteger(value.maxCharacters)
    && value.maxCharacters >= 1
    && value.maxCharacters <= 12_000;
}
