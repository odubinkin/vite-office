# Core Test Source-Target Inventory

[`inventory/core-test-source-targets.json`](inventory/core-test-source-targets.json)
links 686 deterministic source-target declarations to their existing pinned
CppunitTest constructor IDs at core commit
`9bc445578031fecf56086729d8e4940c77e14d65`. It records 684 tracked physical
`.cxx` paths and 2 unevaluated conditional Make expressions.

Each record retains only constructor-ID linkage, makefile declaration path, raw
extensionless target, source path when it is a Git-tracked physical `.cxx`
file, pinned commit, stable ID, and `mappingStatus: "unmapped"`. For an
unevaluated expression, `targetStatus` is `"expression"` and `sourcePath` is
`null`; the extractor never invents a physical file path from an expression.

Regenerate it only after the [inventory contract](inventory-contract.md) passes:

```bash
npm run --silent inventory:test-source-targets -- \
  --baseline docs/program/libreoffice-baseline.json \
  --reference-root vendor/libreoffice-reference \
  --constructors docs/program/inventory/core-tests.json \
  --output docs/program/inventory/core-test-source-targets.json
```

The command verifies the complete baseline, reads tracked `CppunitTest*.mk`
makefiles, parses `gb_CppunitTest_add_exception_objects` declarations without
evaluating Make, and accepts a literal target only when its derived `.cxx` path
is Git-tracked. It joins declarations only to the 415 constructor IDs already
present in `core-tests.json`; 24 legacy source declarations without a matching
constructor-inventory record are intentionally outside this linked inventory.
The output rejects any count other than 684 tracked targets and 2 expressions,
sorts records deterministically, and writes canonical UTF-8 JSON with one
trailing newline.

`schemaVersion` is `1` and `generatedBy` is
`inventory:test-source-targets`. This is provenance for later assertion,
fixture, and parity-ID mapping, not copied test content, executable local test
coverage, or a test-parity claim.
