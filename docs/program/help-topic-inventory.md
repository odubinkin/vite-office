# Help Topic Inventory

## Scope

[`inventory/help-topics.json`](inventory/help-topics.json) is the generated
inventory of every LibreOffice help XHP path beneath `source/text/<area>/` in
the pinned `helpcontent2` corpus at commit
`70c3f30b73ae2cc3e1d2abe0e8c7cf643a56715b`. It contains 2,746
provenance-only records: 433 `sbasic`, 513 `scalc`, 58 `schart`, 88
`sdatabase`, 42 `sdraw`, 931 `shared`, 182 `simpress`, 76 `smath`, and 423
`swriter` topics.

Each record has an exact help-repository-relative `referencePath`, its path
area, the pinned help commit, stable ID
`LO-HELP-TOPIC:<referencePath>`, `corpusId: "helpcontent2"`, and
`mappingStatus: "unmapped"`. No XHP body, media, translated text, fixture, or
license header is copied into this repository.

## Regeneration

Run the [inventory contract](inventory-contract.md) through the command below;
it validates all four pinned repositories before reading the tracked help paths:

```bash
npm run --silent inventory:help-topics -- \
  --baseline docs/program/libreoffice-baseline.json \
  --reference-root vendor/libreoffice-reference \
  --output docs/program/inventory/help-topics.json
```

The command selects only paths matching `source/text/<area>/**/*.xhp`, rejects
duplicates or a count other than 2,746, orders paths by code unit, and writes
canonical UTF-8 JSON with one trailing newline. Unchanged pinned input produces
byte-identical output.

## Schema and handoff

`schemaVersion` is `1` and `generatedBy` is `inventory:help-topics`. The
generated inventory directory is explicitly excluded from authored-module size
policy; that exclusion does not cover authored TypeScript or documentation.

These records are documentation provenance, not local documentation, a license
review, or a documentation-parity claim. Follow-up tasks must inspect each
topic's content and licensing, assign atomic parity IDs, and map it to local
user/developer/API documentation and executable behavior evidence before any
parity-matrix row can advance.
