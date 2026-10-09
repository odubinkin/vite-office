# Application inventory registry

This directory is the canonical authored inventory. Writer, Calc, and shared
components each own an `application.json` and independently keyed record files.
No capability counter, shared append-only array, or central record index is edited
when adding a capability. The pinned upstream catalogs in `../inventory/` and
baseline in `../libreoffice-baseline.json` retain their existing contracts.

## Identity and record ownership

Run `npm run inventory:id` to allocate a new `CAP-<UUID v4>` identity locally.
The identity is independent of its application and remains stable when ownership
changes. UUID generation is collision-resistant; the global validator still rejects
actual duplicate identities. Preserve existing `CAP-####` IDs and `LO-*` aliases.
For new capabilities, use the generated capability ID for both `capabilityId` and
`id`; no new numbered alias is necessary.

Store one JSON envelope per record:

```json
{
  "baselineCommit": "9bc445578031fecf56086729d8e4940c77e14d65",
  "baselineTag": "libreoffice-26.8.0.2",
  "record": {
    "capabilityId": "CAP-12345678-1234-4234-8234-123456789abc"
  }
}
```

The example shows the envelope only. Capability bodies must satisfy the full
existing parity schema: owner, atomic operation, assertions, statuses, closure,
local/upstream evidence, divergences, and approved exceptions.

| Collection | Filename below its owner | Record identity |
| --- | --- | --- |
| `capabilities` | `<capabilityId>.json` | Immutable capability ID; `suite` equals the folder owner |
| `runtime` | `<source-relative-path>.json` | Exact `apps/office/src/` path |
| `provenance` | `<source-relative-path>.json` | Same module's `localPath` |
| `operations` | `<id>.json` | Stable internal-operation identity and qualified exported symbol |
| `ui` | `<id>.json` | Stable UI behavior identity |
| `invariants` | `<id>.json` | Stable invariant identity with exact local/upstream markers |

Physical source ownership assigns `sw/**` to Writer, `sc/**` to Calc, and the
remaining runtime components to shared. The existing `test/wrtsh-test-helpers.ts`
record belongs to Writer. Historical runtime `suite` fields remain unchanged even
when a record describes a shared source used by the Writer delivery slice.

A provenance record carries its filename explanation in `record.filenameDivergence`
when needed. Optional envelope `legacyOrder` and `filenameOrder` preserve the
published order of migrated provenance entries and explanations. New records omit
both: their immutable keys determine the order, without allocating a sequence.
These compatibility fields do not allocate IDs and are not edited for new work.

## Parallel development and shared contracts

Writer and Calc work can add records in their own directories independently.
Activate Calc through `calc/application.json` before adding its first records;
set its app-owned command module and exported registry when commands exist.
This automatically removes Calc from the generated placeholder list. Calc is
active with numerical address, range, reference-address and sheet-limit records.
Its command registry remains unset until browser commands exist;
semantic parity remains unverified.

Shared components have one canonical record per module or contract under `shared/`.
Applications reference a shared capability's existing ID rather than copying the
same shared contract into separate application inventories. Shared records may be changed in the current Writer or Calc tasks. Resolve ordinary
Git conflicts at integration, then run shared tests, both app checks, and the global
registry gate. Coordinate a separate shared task when a common API change needs a
single agreed contract across both applications; this is optional, not a prerequisite
for every shared edit. Physical ownership avoids duplicate module records; UUIDs
avoid a shared allocation race, but do not merge competing contract changes.
The pinned upstream architecture and API are the common contract for both apps.
Any incompatibility is an incomplete or incorrect port to fix against upstream;
merge resolution and contract tests verify that the combined port preserves it.

The global gate rejects duplicate capability IDs, aliases, module/provenance paths,
invariant and UI IDs, qualified mutation symbols, and normalized atomic-operation
keys `(suite, subsystem, aspect, atomicOperation)`. Command URLs use `(suite, URL)`:
the same `.uno:Save` can exist in Writer and Calc. It also rejects unknown
capability references, stale/missing runtime or provenance entries, wrong storage
owners, and mixed baselines. Differently worded overlapping operations still need
review; the key check cannot establish arbitrary semantic equivalence.

## Checks and generated views

```sh
npm run inventory:parity:writer
npm run inventory:parity:calc
npm run inventory:parity:shared
npm run inventory:registry:check
npm run check:source-provenance
npm run test:inventory:coverage
```

Scoped checks validate the selected app and shared evidence. Every scope first
checks identities and references globally and proves exact coverage of the current
production source tree. Shared records may retain references to legacy Writer IDs;
reference lookup always uses the complete capability registry. Calc checks validate
its numerical core records and shared dependencies; successful validation does not
establish semantic parity or complete application implementation.

`npm run inventory:parity` and `npm run inventory:invariants` run the full registry
gate against the pinned checkout. Full checks remain part of `npm run verify`.
Application test commands described in [test strategy](../test-strategy.md) are
independent of these inventory checks.

`npm run inventory:registry:build` regenerates four ignored compatibility views:
`../parity/writer-command-slice.json`, `../parity/runtime-inventory.json`,
`../source-provenance.json`, and `../parity/upstream-invariants.json`.
`npm run inventory:invariants:write` is the same explicit generation operation.
These files are projections for legacy consumers, not authored inputs; checks read
canonical records directly and work without generated files. Regeneration never
writes registry records. The migration reproduced all four original manifests
byte-for-byte, including every existing ID, semantic status, and evidence field.
