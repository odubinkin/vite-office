# Dictionary File Inventory

[`inventory/dictionary-files.json`](inventory/dictionary-files.json) records
every pinned LibreOffice dictionaries `.aff` and `.dic` path at commit
`3324dee0a221a5cb67525c533216d33b0aed08e9`: 245 records, comprising 98 AFF
files and 147 DIC files.

Each record contains only the exact repository-relative path, path-derived
package, extension-derived kind, pinned commit, stable
`LO-DICTIONARY-FILE:<referencePath>` ID, and `mappingStatus: "unmapped"`. It
does not copy word lists, affix rules, hyphenation data, or license headers.

Regenerate it only after the [inventory contract](inventory-contract.md) passes:

```bash
npm run --silent inventory:dictionaries -- \
  --baseline docs/program/libreoffice-baseline.json \
  --reference-root vendor/libreoffice-reference \
  --output docs/program/inventory/dictionary-files.json
```

The command selects AFF and DIC paths beneath package directories, rejects
duplicates or counts other than 98 AFF and 147 DIC files, sorts by code unit,
and writes canonical UTF-8 JSON with one trailing newline. `schemaVersion` is
`1` and `generatedBy` is `inventory:dictionaries`.

This is lexical-data provenance, not a language-tool, license, or parity claim.
Later tasks must review each file's content and licensing and map it to local
spelling, hyphenation, thesaurus, or locale behavior evidence.
