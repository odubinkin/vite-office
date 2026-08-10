# Translation Catalog Inventory

## Scope

[`inventory/translation-catalogs.json`](inventory/translation-catalogs.json) is
the generated inventory of every LibreOffice PO path beneath
`source/<locale>/` in the pinned `translations` corpus at commit
`362fd2cb41c5404e3712db9fad55b2357001e1f3`. It contains 25,699
provenance-only records across 131 locale directories.

Each record contains the exact translations-repository-relative `referencePath`,
the path-derived `locale`, the pinned translations commit, stable ID
`LO-TRANSLATION-CATALOG:<referencePath>`, `corpusId: "translations"`, and
`mappingStatus: "unmapped"`. No PO message, plural form, locale rule, source
reference, translator data, or license header is copied into this repository.

## Regeneration

Run the [inventory contract](inventory-contract.md) through the command below;
it validates all four pinned repositories before reading tracked translation
paths:

```bash
npm run --silent inventory:translations -- \
  --baseline docs/program/libreoffice-baseline.json \
  --reference-root vendor/libreoffice-reference \
  --output docs/program/inventory/translation-catalogs.json
```

The command selects only paths matching `source/<locale>/**/*.po`, rejects
duplicates, catalog counts other than 25,699, or locale counts other than 131,
orders paths by code unit, and writes canonical UTF-8 JSON with one trailing
newline. Unchanged pinned input produces byte-identical output.

## Schema and handoff

`schemaVersion` is `1` and `generatedBy` is `inventory:translations`. The
generated inventory directory is explicitly excluded from authored-module size
policy; that exclusion does not cover authored TypeScript or documentation.

These records are localization provenance, not local translations, a license
review, or a localization-parity claim. Follow-up tasks must inspect each
catalog's content and licensing, split messages into atomic parity IDs, and map
them to local messages, locale behavior, accessibility names, and executable
tests before a parity-matrix row can advance.
