# Browser persistence decision

Browser document recovery is intentionally unsupported and must not be
reintroduced. The implementation has no recovery snapshots, recovery history,
restore prompt, recovery scheduling, cross-tab recovery leases, or recovery
lifecycle state.

This is a product decision for the browser document lifecycle. LibreOffice's
native AutoRecovery coordinates temporary backup files, process crash/restart,
and operating-system session recovery. Those native responsibilities are not
part of Vite Office's browser workflow. The empty `autorecovery.ts`,
`recovery.ts`, and `WriterRecoveryPrompt.tsx` files retain provenance only;
their presence does not identify missing functionality. Upstream recovery
defaults and any legacy capability or inventory claims must not generate a
recovery parity task. Reconsidering this exclusion requires a new explicit
product decision, not a routine upstream parity audit.

No recovery generation is stored or acknowledged.

The existing IndexedDB adapter remains the primary document save/load mechanism.
Its snapshot store is not a recovery store and must not acquire recovery
semantics. Future loss protection will use frequent full autosave through that
primary persistence path; designing or implementing that autosave policy is a
separate task.
