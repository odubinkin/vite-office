# Browser document storage adapter contract

## Purpose

The storage contract defines shell-neutral ports around one versioned,
JSON-compatible document snapshot. Generic record validation lives in
`apps/office/src/svl/source/misc/storage.ts`; Sfx-facing primary-save and
stored-document-open aliases live at the document-shell boundary. External-open
and export ports remain neutral contracts in `svl/source/misc/storage.ts`.
These contracts make no choice of
IndexedDB, Origin Private File System (OPFS), File System Access, download,
Service Worker, cloud service, or backend.

## Snapshot boundary

`DocumentSnapshot<State>` contains a non-blank exact identifier, a
non-negative integer version, and JSON-compatible state. `SerializableValue`
excludes browser handles, functions, symbols, cyclic values, and class
instances. A future format or platform adapter must convert such values before
they cross this boundary.

`StoredDocumentOpenPort<State>` and `PrimarySavePort<State>` are injected
independently. The former exposes only `load(id)`; the latter exposes only
`save(snapshot)`. `RecoverySavePort<State>` is a separate recovery-history and
lease contract. Adapter errors propagate unchanged so later recovery and UI
layers can decide how to present them. No operation may mutate its input or
returned snapshot.

External file selection/reading and downloads cross `DocumentOpenPort` and
`DocumentExportPort`. Their browser implementations remain in `vcl/browser`,
so Writer sessions never receive `File`, DOM input, Blob URL, IndexedDB
transaction, quota, or browser-event mechanics.

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

This contract does not persist data by itself. Snapshot serialization is
explicitly versioned and is not a document file filter. Migrations, encryption,
File System Access UI, and broader conflict policy remain separate
vertically-scoped features.

## Verification

Unit tests cover found and missing loads, exact identifier forwarding, valid
saves, a frozen non-caller save container, all current validation branches, and
unchanged propagation of load/save adapter errors. They are included in the
application coverage gate and the repository-wide `npm run verify` command.
