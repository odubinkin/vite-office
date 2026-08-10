# Core PythonTest Module Inventory

[`inventory/core-python-test-modules.json`](inventory/core-python-test-modules.json)
links 59 deterministic Python module declarations to their existing pinned
PythonTest constructor IDs at core commit
`9bc445578031fecf56086729d8e4940c77e14d65`. Every declared module derives to
a Git-tracked physical `.py` path; there are no missing paths and no unevaluated
Make expressions in this scoped baseline extraction.

Each record retains only constructor-ID linkage, makefile declaration path, raw
module token, exact source directory, derived module path where syntactically
derivable, pinned commit, stable ID, and `mappingStatus: "unmapped"`.
`targetStatus: "missing"` and `targetStatus: "expression"` are supported by the
schema and generator so a later pinned baseline drift remains explicit rather
than being silently discarded. Neither status is present in this baseline.

Regenerate it only after the [inventory contract](inventory-contract.md) passes:

```bash
npm run --silent inventory:python-test-modules -- \
  --baseline docs/program/libreoffice-baseline.json \
  --reference-root vendor/libreoffice-reference \
  --constructors docs/program/inventory/core-tests.json \
  --output docs/program/inventory/core-python-test-modules.json
```

The command verifies the complete baseline, reads tracked `PythonTest*.mk`
makefiles, parses `gb_PythonTest_add_modules` without evaluating Make, and
links every module declaration to its existing PythonTest constructor ID. It
accepts only exact `$(SRCDIR)/` source-directory arguments, classifies each
derived `.py` path against the pinned Git path set, and rejects an unknown
constructor, duplicate evidence, or a count other than 59 `tracked`, 0
`missing`, and 0 `expression` records. Output is sorted deterministically and
written as canonical UTF-8 JSON with one trailing newline.

`schemaVersion` is `1` and `generatedBy` is
`inventory:python-test-modules`. This is provenance for later assertion,
fixture, and parity-ID mapping, not copied test content, executable local test
coverage, or a test-parity claim.
