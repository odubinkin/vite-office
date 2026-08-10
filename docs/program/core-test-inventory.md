# Core Test Constructor Inventory

[`inventory/core-tests.json`](inventory/core-tests.json) is generated from the
pinned LibreOffice core gbuild test constructors at commit
`9bc445578031fecf56086729d8e4940c77e14d65`. It has 565 provenance-only
records: 415 CppunitTest, 58 JunitTest, 13 PythonTest, and 79 UITest.

Regenerate it only after the [inventory contract](inventory-contract.md) passes:

```bash
npm run --silent inventory:tests -- \
  --baseline docs/program/libreoffice-baseline.json \
  --reference-root vendor/libreoffice-reference \
  --output docs/program/inventory/core-tests.json
```

The extractor reads the exact `gb_<kind>_<kind>(<name>)` constructor invocation
lines through Git. It excludes `solenv/gbuild` macro definitions, which contain
the same macro names but declare no upstream test. Each record contains only the
constructor family, test name, makefile path, line, pinned core commit, stable
path-and-line ID, and `mappingStatus: "unmapped"`; no upstream test source or
fixture content is copied.

`schemaVersion` is `1` and `generatedBy` is `inventory:tests`. The generated
inventory directory is explicitly excluded from authored-module size policy; it
does not exempt authored TypeScript or documentation. The records are structural
test evidence, not local tests or a test-parity claim. Later tasks must map each
record's assertions, fixtures, and documentation to atomic parity IDs and local
executable tests.
