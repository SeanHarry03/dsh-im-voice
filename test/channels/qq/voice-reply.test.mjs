import assert from 'node:assert/strict';
import test from 'node:test';

import {
  qqSpeechText,
  sendQqVoiceReply,
  shouldSendQqVoice,
  splitQqSpeechText,
} from '../../../src/channels/qq/voice-reply.mjs';

test('QQ speech text removes Markdown-only content and splits on readable boundaries', () => {
  assert.equal(
    qqSpeechText('## 标题\n[说明](https://example.com) `参数`\n```js\nsecret()\n```'),
    '标题 说明 参数',
  );
  assert.deepEqual(splitQqSpeechText('第一句很短。第二句也很短。', 8), [
    '第一句很短。', '第二句也很短。',
  ]);
  assert.equal(shouldSendQqVoice({ mode: 'voice-input', maxCharacters: 10 }, { voiceInput: true }), true);
  assert.equal(shouldSendQqVoice({ mode: 'voice-input', maxCharacters: 10 }), false);
});

test('QQ voice reply uses the configured DSH speech provider and QQ native voice send', async () => {
  const synthesized = [];
  const sent = [];
  const signal = new AbortController().signal;
  const deliveries = await sendQqVoiceReply({
    bot: { sendVoice: async (target, source) => {
      sent.push({ target, source });
      return { message: { id: `voice-${sent.length}` } };
    } },
    target: { scope: 'c2c', targetId: 'owner', msgId: 'incoming' },
    text: '第一句。第二句。',
    config: { mode: 'always', maxCharacters: 4 },
    speechSynthesis: () => ({
      capabilities: () => ({ provider: 'doubao', providers: [{ id: 'doubao', maxTextLength: 100 }] }),
      synthesize: async (request) => {
        synthesized.push(request);
        return { data: Buffer.from('wav') };
      },
    }),
    signal,
  });
  assert.deepEqual(synthesized.map(({ text, format }) => ({ text, format })), [
    { text: '第一句。', format: 'wav' },
    { text: '第二句。', format: 'wav' },
  ]);
  assert.equal(sent.length, 2);
  assert.equal(sent[0].source.buffer.toString(), 'wav');
  assert.equal(deliveries[1].message.id, 'voice-2');
});
