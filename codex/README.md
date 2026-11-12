# Fork maintenance

This checkout uses two long-lived branches:

- `main` mirrors `upstream/main` from `xmanrui/dsh-im`.
- `custom` contains local customization and is the branch installed by DSH.

Keep custom behavior in new, narrowly scoped modules where possible. Touch an
upstream file only at a small integration seam, and add focused tests for every
custom behavior. Do not rename `@xmanrui/dsh-im` or replace the built-in update
service: source installs intentionally keep the original npm update check, while
the actual source merge is handled by `sync-upstream.ps1`.

## Sync upstream

From a clean `custom` worktree:

```powershell
.\codex\sync-upstream.ps1
```

The script fetches `upstream`, fast-forwards the local mirror branch, merges the
new upstream commit into `custom`, installs the locked dependencies, and runs
the complete project check. It never resolves conflicts automatically and never
pushes. Review the result, then push both branches and reinstall the `custom`
Git source in DSH.

The DSH source spec is:

```text
github:SeanHarry03/dsh-im-voice#custom
```

The plugin UI can still query the original `@xmanrui/dsh-im` npm release. It
must not install that npm release over this source checkout; upstream code is
merged through this guarded workflow instead.

## QQ voice replies

The QQ channel consumes the optional Host service named `speechSynthesis`.
Install and configure `dsh-xiaomi-tts`, then select the QQ bot's voice-reply
rule in the IM settings. The TTS provider, model, voice, and API credential stay
owned by the speech plugin; this fork stores only the QQ delivery rule and the
per-segment character limit.

Text delivery remains authoritative. Voice synthesis and QQ voice upload are
best-effort additions after the text reply, so a missing provider, invalid
credential, quota failure, or rejected voice upload does not interrupt the
conversation. The integration requests WAV from the shared service and uses the
QQ SDK's native `sendVoice` transport.
