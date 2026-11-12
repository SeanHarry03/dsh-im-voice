import { normalizeQqVoiceConfig } from './voice-config.mjs';

function unicodeLength(value) {
  return [...value].length;
}

function takeUnicode(value, count) {
  return [...value].slice(0, count).join('');
}

export function qqSpeechText(value) {
  return String(value ?? '')
    .replace(/```[\s\S]*?```/gu, ' ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/gu, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/gu, '$1')
    .replace(/`([^`]+)`/gu, '$1')
    .replace(/https?:\/\/\S+/giu, ' ')
    .replace(/<[^>]+>/gu, ' ')
    .replace(/^[\t ]{0,3}(?:#{1,6}|>|[-+*]|\d+[.)])[\t ]+/gmu, '')
    .replace(/[*_~|]+/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim();
}

export function splitQqSpeechText(value, maxCharacters) {
  const text = qqSpeechText(value);
  if (!text) return [];
  const limit = Math.max(1, Number.isInteger(maxCharacters) ? maxCharacters : 1200);
  const chunks = [];
  let remaining = text;
  while (unicodeLength(remaining) > limit) {
    const candidate = takeUnicode(remaining, limit);
    const boundaries = [...candidate.matchAll(/[。！？!?；;，,、\s]/gu)];
    const preferred = boundaries.filter((match) => match.index >= candidate.length / 2).at(-1);
    const chunk = preferred ? candidate.slice(0, preferred.index + preferred[0].length) : candidate;
    chunks.push(chunk.trim());
    remaining = remaining.slice(chunk.length).trim();
  }
  if (remaining) chunks.push(remaining);
  return chunks.filter(Boolean);
}

export function shouldSendQqVoice(value, { voiceInput = false } = {}) {
  const config = normalizeQqVoiceConfig(value);
  return config.mode === 'always' || (config.mode === 'voice-input' && voiceInput);
}

function providerLimit(service) {
  try {
    const capabilities = service.capabilities?.();
    const selected = capabilities?.providers?.find((provider) => provider.id === capabilities.provider);
    return Number.isInteger(selected?.maxTextLength) && selected.maxTextLength > 0
      ? selected.maxTextLength
      : null;
  } catch {
    return null;
  }
}

export async function sendQqVoiceReply({
  bot,
  target,
  text,
  config,
  speechSynthesis,
  signal,
}) {
  if (typeof bot?.sendVoice !== 'function') throw new Error('QQ voice delivery is unavailable');
  const service = typeof speechSynthesis === 'function' ? speechSynthesis() : speechSynthesis;
  if (!service || typeof service.synthesize !== 'function') {
    throw new Error('DSH speech synthesis service is unavailable');
  }
  const normalized = normalizeQqVoiceConfig(config);
  const upstreamLimit = providerLimit(service);
  const limit = upstreamLimit
    ? Math.min(normalized.maxCharacters, upstreamLimit)
    : normalized.maxCharacters;
  const chunks = splitQqSpeechText(text, limit);
  if (chunks.length === 0) return [];
  const deliveries = [];
  for (const chunk of chunks) {
    signal?.throwIfAborted();
    const audio = await service.synthesize({ text: chunk, format: 'wav', signal });
    signal?.throwIfAborted();
    if (!Buffer.isBuffer(audio?.data) || audio.data.length === 0) {
      throw new Error('DSH speech synthesis returned no audio');
    }
    deliveries.push(await bot.sendVoice(target, { buffer: audio.data }));
  }
  return deliveries;
}
