# Browser autosave recovery orchestration

`recoverDocument` and `autosaveDocument` provide deterministic domain logic over
the browser storage adapter. They do not create timers, debounce input, schedule
background work, display recovery UI, or invoke browser APIs directly.

`recoverDocument` reads one exact identity and returns a recovery state with its
last snapshot or `undefined`. Its `recoveryGeneration` is the content generation
of the last successfully persisted recovery snapshot. `autosaveDocument`
reports `unchanged` only when the same identity and generation were already
saved; otherwise it delegates one validated save and advances the recovery
generation after that write resolves. Consecutive mutations therefore produce
consecutive recovery saves. Storage errors propagate unchanged and leave the
last acknowledged recovery generation intact for later retry policy.

The caller owns scheduling, autosave interval, visibility and lifecycle events,
retry/backoff, quota handling, recovery UX, migrations, cross-tab coordination,
and File System Access behavior. Those remain separate tasks. This separation
matches `SfxBaseModel::storeToRecoveryFile`, where recovery completion is
acknowledged independently from the document's primary modified state. The
bounded contract is part of `CAP-0114` / `LO-WRITER-0114` and remains
`implemented`, not `verified`, until scheduling and recovery-session UI exist.
