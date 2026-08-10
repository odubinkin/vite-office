# Core Cppunit Registration Inventory

[`inventory/core-cppunit-registrations.json`](inventory/core-cppunit-registrations.json)
links 8,072 deterministic Cppunit registration macro records to their existing
physical C++ source-target and CppunitTest constructor IDs at core commit
`9bc445578031fecf56086729d8e4940c77e14d65`: 3,508 `CPPUNIT_TEST` and 4,564
`CPPUNIT_TEST_FIXTURE` invocations.

Each record retains only physical source path, source-target ID, constructor ID,
registration macro family, optional fixture name, registered test method, source
line, pinned commit, stable ID, and `mappingStatus: "unmapped"`. The parser
accepts whitespace and line breaks inside supported macro calls but does not
retain or parse C++ test bodies, assertions, or fixtures.

Regenerate it only after the [inventory contract](inventory-contract.md) passes:

```bash
npm run --silent inventory:cppunit-registrations -- \
  --baseline docs/program/libreoffice-baseline.json \
  --reference-root vendor/libreoffice-reference \
  --source-targets docs/program/inventory/core-test-source-targets.json \
  --output docs/program/inventory/core-cppunit-registrations.json
```

The command validates the baseline, reads only tracked physical Cppunit `.cxx`
paths already present in the source-target inventory, parses the two supported
registration macros, and rejects unknown source-target provenance, duplicate
records, or counts other than the pinned 3,508 / 4,564 macro totals. Output is
canonical UTF-8 JSON with deterministic ordering.

`schemaVersion` is `1` and `generatedBy` is
`inventory:cppunit-registrations`. This is provenance for later assertion,
fixture, and parity-ID mapping—not copied test content, executable local test
coverage, or a test-parity claim.
