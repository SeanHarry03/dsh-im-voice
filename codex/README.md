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
