# Browser document storage adapter contract

## Purpose

The storage adapter contract defines the browser-office domain boundary for
loading and saving one versioned, JSON-compatible document snapshot. It is
implemented in `apps/office/src/domain/storage.ts`. The contract makes no
choice of IndexedDB, Origin Private File System (OPFS), File System Access,
download, Service Worker, cloud service, or backend.

## Snapshot boundary

`DocumentSnapshot<State>` contains a non-blank exact identifier, a
non-negative integer version, and JSON-compatible state. `SerializableValue`
excludes browser handles, functions, symbols, cyclic values, and class
instances. A future format or platform adapter must convert such values before
they cross this boundary.

`DocumentStorageAdapter<State>` is injected. Its `load(id)` operation returns a
snapshot or `undefined`; its `save(snapshot)` operation resolves only after its
write completes. Adapter errors propagate unchanged so later recovery and UI
layers can decide how to present them. Neither operation may mutate its input
or returned snapshot.

## Deterministic operations

`loadSnapshot` calls `adapter.load` exactly once and returns one exhaustive
result:

- `{ status: "found", snapshot }` when the adapter supplies a snapshot;
- `{ status: "missing", id }` when it returns `undefined`.

It never trims or otherwise normalizes the lookup identifier.

`saveSnapshot` rejects a blank identifier, a fractional version, or a negative
version before calling the adapter. On success it returns
`{ status: "saved", snapshot }`. The supplied snapshot is a fresh frozen
top-level container, so an adapter cannot change the caller's outer snapshot
object. The generic state value remains shared by reference; deep-clone or
codec policy is intentionally deferred to the platform/format task.

## Current limitations and follow-up

This contract does not persist data by itself and it does not yet expose open,
save-as, autosave, recovery, migrations, quotas, conflict resolution, deletion,
encryption, or File System Access UI. Those are separate vertically-scoped
features that must map their relevant pinned LibreOffice tests and documentation
topics in the parity matrix before they can claim parity.

## Verification

Unit tests cover found and missing loads, exact identifier forwarding, valid
saves, a frozen non-caller save container, all current validation branches, and
unchanged propagation of load/save adapter errors. They are included in the
application coverage gate and the repository-wide `npm run verify` command.
