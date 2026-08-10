# Core JunitTest Source-Target Inventory

[`inventory/core-junit-source-targets.json`](inventory/core-junit-source-targets.json)
links 160 deterministic Java source-target declarations to their existing pinned
JunitTest constructor IDs at core commit
`9bc445578031fecf56086729d8e4940c77e14d65`. It records 156 Git-tracked
physical `.java` paths, 4 literal Java paths absent from the pinned Git tree,
and no unevaluated Make expressions.

Each record retains only constructor-ID linkage, makefile declaration path, raw
extensionless target, source path where syntactically derivable, pinned commit,
stable ID, and `mappingStatus: "unmapped"`. `targetStatus: "missing"` means
that LibreOffice's makefile declared the literal `.java` target but that exact
path is not Git-tracked at the selected commit; it does not assert that the file
was resolved, copied, or implemented locally.

Regenerate it only after the [inventory contract](inventory-contract.md) passes:

```bash
npm run --silent inventory:junit-source-targets -- \
  --baseline docs/program/libreoffice-baseline.json \
  --reference-root vendor/libreoffice-reference \
  --constructors docs/program/inventory/core-tests.json \
  --output docs/program/inventory/core-junit-source-targets.json
```

The command verifies the complete baseline, reads tracked `JunitTest*.mk`
makefiles, parses `gb_JunitTest_add_sourcefiles` without evaluating Make, and
links every declaration to its existing JunitTest constructor ID. It classifies
each exact derived `.java` path against the pinned Git path set, rejects an
unknown constructor, duplicate evidence, or a count other than 156 `tracked`, 4
`missing`, and 0 `expression` records. Output is sorted deterministically and
written as canonical UTF-8 JSON with one trailing newline.

`schemaVersion` is `1` and `generatedBy` is
`inventory:junit-source-targets`. This is provenance for later assertion,
fixture, and parity-ID mapping, not copied test content, executable local test
coverage, or a test-parity claim.
