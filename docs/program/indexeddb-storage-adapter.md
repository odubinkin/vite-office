# Browser IndexedDB document storage adapter

## Purpose

`IndexedDbDocumentStorageAdapter` is the first concrete browser persistence
adapter for the document storage contract. It uses the browser's native
IndexedDB API and stores complete `DocumentSnapshot` values locally. It has no
network or backend dependency and therefore remains compatible with static Vite
deployment and offline browser storage.

## Schema and semantics

Each adapter instance receives a database name. It opens version `1` and creates
one `document-snapshots` object store with `id` as its key path during the
initial upgrade. A successful `save(snapshot)` uses IndexedDB `put`, so a later
save with the same identifier replaces the earlier complete snapshot. `load(id)`
returns `undefined` when no matching key exists.

IndexedDB structured-clones stored snapshots. The adapter neither mutates the
caller snapshot nor maintains an in-memory cache; it closes its connection after
each transaction. Browser factory, request, and transaction errors propagate
without translation to the higher-level storage contract.

## Compatibility and limits

The module is browser-platform code, not a document-domain dependency. Tests
inject `fake-indexeddb` only as a development dependency; production code refers
solely to native browser API types and `globalThis.indexedDB`.

Version `1` is a deliberately narrow schema baseline. Migration, corruption
recovery, quota handling, delete/clear, encryption, autosave, crash recovery,
cross-tab conflicts, File System Access UI, download fallback, and format
import/export remain separate tasks. The adapter itself does not claim
LibreOffice storage parity until those upstream behaviors are atomically mapped
in the parity matrix.

## Verification

Integration tests exercise first-open schema creation, missing reads,
structured-clone round trips, deterministic same-ID replacement, and unchanged
open failures. The tests run under the application 100% coverage gate and the
repository-wide static, E2E, documentation, and policy checks.
