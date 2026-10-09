---
id: "202610090758-MBH4QY"
title: "Port Calc single formula reference data with native differential proof"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-09T07:58:58.759Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: port original single-reference numerical/flag contracts and compare bounded states against unchanged pinned native definitions."
events:
  -
    type: "status"
    at: "2026-10-09T07:59:04.552Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port original single-reference numerical/flag contracts and compare bounded states against unchanged pinned native definitions."
doc_version: 3
doc_updated_at: "2026-10-09T07:59:04.552Z"
doc_updated_by: "CODER"
description: "Implement all initialized ScSingleRefData contracts from pinned refdata.hxx/refdata.cxx: eight-bit flags, raw value copying, address initialization and conversion, validity/deletion semantics and per-axis ordering with relative-name provenance. Reuse native address/sheet limit owners; add bounded compiled native comparison and Calc-owned inventory."
sections:
  Summary: "Port initialized ScSingleRefData numerical/flag contracts with source-derived and executable native evidence, as a prerequisite for Calc formula token ownership."
  Scope: "New sc/inc/refdata.ts header export and sc/source/core/tool/refdata.ts owner; source-derived reference-data/ordering tests; native fixture and acceptance test; scripts/calc-refdata-native-probe.mjs; new Calc capability and runtime/provenance for both modules; calc-core docs. Preserve existing tests and shared/Writer owners. Calc checkout/branch only; no merges. Milestone5; full suite at milestone10."
  Plan: "Implement original initialized eight-bit flags and signed raw coordinates without invented zero defaults. Support implicit native value copy/assignment, all initializers/setters/increments, raw equality, deleted coordinate masking, distinct local/external validity, independent toAbs axis checks and SetAddress monotone deletion flags. Translate original PutInOrder axis operations and relative-name masks without a generic axis replacement. Reuse ScAddress, ScRefAddress, ScSheetLimits and existing document-bound interface; add only a structural GetSheetLimits view, not a replacement ScDocument. Compile unchanged native header/class bodies and all non-debug single-reference definitions with bounded original numerical owners and four document getters; exercise all256 flag states and relative/name/order combinations under ASan/UBSan, store exact source/body hashes and portable fixture. Prove actual100 Calc coverage and scoped static/inventory gates. Whole document/token/compiler integration and native undefined domains remain unverified. User goal authorizes core progression and local upstream research."
  Verify Steps: "1. Compile/regenerate native probe with --write then reproduce with --check; require exact pinned Git blobs and ASan/UBSan-clean defined input domains. Compare every native fixture row using actual TS owner. 2. Run npm run test:coverage:calc, require100 actual lines/statements/functions/branches and preserve existing cases. 3. Run npm run typecheck, check:dependencies, check:docs, check:file-size, check:source-tree, affected ESLint and Prettier. 4. Scoped Calc registry must have0 semantic violations; preserve all prior records/statuses and shared/Writer files. 5. Routing, ap doctor, git diff --check; final clean tracked/untracked state on calc. Full suite scheduled for Calc10."
  Verification: "Pending port and bounded native/source-derived acceptance."
  Rollback Plan: "Revert only this implementation commit, retaining earlier numerical and sheet-limit owners."
  Findings: "Native ScRawToken storage requires explicit initialization, so this owner does not fabricate initialized default coordinates or flags. JavaScript named value-copy/assignment methods represent implicit C++ copies. Deleted getters mask coordinates, while equality, toAbs and ValidExternal use raw values. PutInOrder transfers axis-specific relative/deleted flags and relative-name provenance while retaining endpoint 3D flags. Debug-only Dump and undefined/uninitialized native states are not certified. Native probe uses a bounded document boundary, not the unported complete document."
id_source: "generated"
---
## Summary

Port initialized ScSingleRefData numerical/flag contracts with source-derived and executable native evidence, as a prerequisite for Calc formula token ownership.

## Scope

New sc/inc/refdata.ts header export and sc/source/core/tool/refdata.ts owner; source-derived reference-data/ordering tests; native fixture and acceptance test; scripts/calc-refdata-native-probe.mjs; new Calc capability and runtime/provenance for both modules; calc-core docs. Preserve existing tests and shared/Writer owners. Calc checkout/branch only; no merges. Milestone5; full suite at milestone10.

## Plan

Implement original initialized eight-bit flags and signed raw coordinates without invented zero defaults. Support implicit native value copy/assignment, all initializers/setters/increments, raw equality, deleted coordinate masking, distinct local/external validity, independent toAbs axis checks and SetAddress monotone deletion flags. Translate original PutInOrder axis operations and relative-name masks without a generic axis replacement. Reuse ScAddress, ScRefAddress, ScSheetLimits and existing document-bound interface; add only a structural GetSheetLimits view, not a replacement ScDocument. Compile unchanged native header/class bodies and all non-debug single-reference definitions with bounded original numerical owners and four document getters; exercise all256 flag states and relative/name/order combinations under ASan/UBSan, store exact source/body hashes and portable fixture. Prove actual100 Calc coverage and scoped static/inventory gates. Whole document/token/compiler integration and native undefined domains remain unverified. User goal authorizes core progression and local upstream research.

## Verify Steps

1. Compile/regenerate native probe with --write then reproduce with --check; require exact pinned Git blobs and ASan/UBSan-clean defined input domains. Compare every native fixture row using actual TS owner. 2. Run npm run test:coverage:calc, require100 actual lines/statements/functions/branches and preserve existing cases. 3. Run npm run typecheck, check:dependencies, check:docs, check:file-size, check:source-tree, affected ESLint and Prettier. 4. Scoped Calc registry must have0 semantic violations; preserve all prior records/statuses and shared/Writer files. 5. Routing, ap doctor, git diff --check; final clean tracked/untracked state on calc. Full suite scheduled for Calc10.

## Verification

Pending port and bounded native/source-derived acceptance.

## Rollback Plan

Revert only this implementation commit, retaining earlier numerical and sheet-limit owners.

## Findings

Native ScRawToken storage requires explicit initialization, so this owner does not fabricate initialized default coordinates or flags. JavaScript named value-copy/assignment methods represent implicit C++ copies. Deleted getters mask coordinates, while equality, toAbs and ValidExternal use raw values. PutInOrder transfers axis-specific relative/deleted flags and relative-name provenance while retaining endpoint 3D flags. Debug-only Dump and undefined/uninitialized native states are not certified. Native probe uses a bounded document boundary, not the unported complete document.
