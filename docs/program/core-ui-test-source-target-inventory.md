# Core UITest Python Source-Target Inventory

[`inventory/core-ui-test-source-targets.json`](inventory/core-ui-test-source-targets.json)
links 649 deterministic Python source records to their existing pinned UITest
constructor IDs at core commit `9bc445578031fecf56086729d8e4940c77e14d65`.
The records come from 79 `gb_UITest_add_modules` module-root declarations; every
derived `.py` path is Git-tracked in the pinned core tree.

Each record retains only constructor linkage, declaring makefile, raw normalized
module root, source directory, module-root path, physical Python path, pinned
commit, stable ID, and `mappingStatus: "unmapped"`. An expression or literal
root without a tracked Python descendant would remain explicit in later
baselines; neither occurs here.

Regenerate it only after the [inventory contract](inventory-contract.md) passes:

```bash
npm run --silent inventory:ui-test-source-targets -- \
  --baseline docs/program/libreoffice-baseline.json \
  --reference-root vendor/libreoffice-reference \
  --constructors docs/program/inventory/core-tests.json \
  --output docs/program/inventory/core-ui-test-source-targets.json
```

The command validates the baseline, parses `gb_UITest_add_modules` without
evaluating Make, accepts only exact source-root-relative module directories,
links declarations to inventoried UITest constructor IDs, and expands only
Git-tracked descendant `.py` files. It rejects unknown constructors, duplicate
evidence, or any count other than 649 `tracked`, 0 `missing`, and 0
`expression`. Output is canonical UTF-8 JSON with deterministic ordering.

`schemaVersion` is `1` and `generatedBy` is
`inventory:ui-test-source-targets`. It is provenance for later assertion,
fixture, and parity-ID mapping—not copied source, executable local coverage, or
a test-parity claim.
