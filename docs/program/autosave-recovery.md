# Browser persistence decision

Browser document recovery is intentionally unsupported and must not be
reintroduced. The implementation has no recovery snapshots, recovery history,
restore prompt, recovery scheduling, cross-tab recovery leases, or recovery
lifecycle state.

No recovery generation is stored or acknowledged.

The existing IndexedDB adapter remains the primary document save/load mechanism.
Its snapshot store is not a recovery store and must not acquire recovery
semantics. Future loss protection will use frequent full autosave through that
primary persistence path; designing or implementing that autosave policy is a
separate task.
