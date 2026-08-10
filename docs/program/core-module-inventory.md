# Core Build Module Inventory

## Scope

[`inventory/core-modules.json`](inventory/core-modules.json) is the generated
inventory of every pinned LibreOffice core path matching `Module_*.mk`. It has
237 records at core commit `9bc445578031fecf56086729d8e4940c77e14d65`.

Each record contains only path-derived metadata: corpus ID, pinned commit,
declaration path, derived module name, stable ID, and `mappingStatus: "unmapped"`.
It does not copy upstream source, target lists, tests, fixtures, licenses, or
help content.

## Regeneration

Validate the complete baseline with the [inventory contract](inventory-contract.md),
then run:

```bash
npm run --silent inventory:modules -- \
  --baseline docs/program/libreoffice-baseline.json \
  --reference-root vendor/libreoffice-reference \
  --output docs/program/inventory/core-modules.json
```

The command validates all four pinned repositories, selects paths matching
`(^|/)Module_[^/]+\.mk$`, rejects duplicate matches, applies code-unit lexical
ordering, and writes canonical UTF-8 JSON with one trailing newline. Unchanged
input produces byte-identical output.

## Schema and handoff

`schemaVersion` is `1`; `generatedBy` is `inventory:modules`; `corpusId` is
always `core`; and `coreCommit` scopes every record. Each record has stable ID
`LO-CORE-MODULE:<referencePath>`, an exact `referencePath`, filename-derived
`moduleName`, and `mappingStatus` of `unmapped`. The generated inventory
directory is explicitly excluded from authored-module size policy; this does
not exempt TypeScript code or authored program documentation.

This is a build-structure inventory, not an atomic capability inventory. One
module can contain unrelated behaviors, tests, and help topics. Later tasks
will use its stable IDs as provenance anchors while extracting source symbols,
tests and fixtures, help topics, translations, and dictionaries into atomic
records. This inventory makes no functional, test, or documentation parity
claim and does not move a parity-matrix row beyond `inventory-pending`.
