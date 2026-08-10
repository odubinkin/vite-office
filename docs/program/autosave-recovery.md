# Browser autosave recovery orchestration

`recoverDocument` and `autosaveDocument` provide deterministic domain logic over
the browser storage adapter. They do not create timers, debounce input, schedule
background work, display recovery UI, or invoke browser APIs directly.

`recoverDocument` reads one exact identity and returns a recovery state with its
last snapshot or `undefined`. `autosaveDocument` reports `unchanged` when the
same recovery identity and version were already saved; otherwise it delegates
one validated save and returns `saved` with the new recovery state. Storage
errors propagate unchanged for later retry and presentation policies.

The caller owns scheduling, autosave interval, visibility and lifecycle events,
retry/backoff, quota handling, recovery UX, migrations, cross-tab coordination,
and File System Access behavior. Those remain separate tasks. This domain
contract has no LibreOffice parity claim until atomic upstream storage and
recovery behavior is mapped in the parity matrix.
