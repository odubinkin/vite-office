---
id: "202610090758-MBH4QY"
title: "Port Calc single formula reference data with native differential proof"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 14
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
  state: "ok"
  updated_at: "2026-10-09T08:12:10.183Z"
  updated_by: "CODER"
  note: "Commands: native reference probe --write/--check, npm run test:coverage:calc, typecheck, check:dependencies, check:docs, check:file-size, check:source-tree, affected ESLint/Prettier, Calc registry, routing, doctor, diff check. Result: all pass after recorded local extraction/documentation/header-metadata corrections. Evidence:28 tests in7 files; actual100 lines404/404 statements457/457 functions126/126 branches395/395. Native30 unchanged non-debug definitions, exact pinned Git blobs and ASan/UBSan clean; all2048 flag/domain states1024 updates2048 orderings40 initializers12 mutations5 equality outputs match TS. Registry5 capabilities118 scoped modules0 semantic violations. Scope: initialized single references, portable native fixture, Calc metadata/docs. Existing tests, shared/Writer sources and prior statuses unchanged. Doctor0 errors1 pre-existing hook warning. Full suite due at Calc10."
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
  -
    type: "verify"
    at: "2026-10-09T08:12:10.183Z"
    author: "CODER"
    state: "ok"
    note: "Commands: native reference probe --write/--check, npm run test:coverage:calc, typecheck, check:dependencies, check:docs, check:file-size, check:source-tree, affected ESLint/Prettier, Calc registry, routing, doctor, diff check. Result: all pass after recorded local extraction/documentation/header-metadata corrections. Evidence:28 tests in7 files; actual100 lines404/404 statements457/457 functions126/126 branches395/395. Native30 unchanged non-debug definitions, exact pinned Git blobs and ASan/UBSan clean; all2048 flag/domain states1024 updates2048 orderings40 initializers12 mutations5 equality outputs match TS. Registry5 capabilities118 scoped modules0 semantic violations. Scope: initialized single references, portable native fixture, Calc metadata/docs. Existing tests, shared/Writer sources and prior statuses unchanged. Doctor0 errors1 pre-existing hook warning. Full suite due at Calc10."
doc_version: 3
doc_updated_at: "2026-10-09T08:12:10.238Z"
doc_updated_by: "CODER"
description: "Implement all initialized ScSingleRefData contracts from pinned refdata.hxx/refdata.cxx: eight-bit flags, raw value copying, address initialization and conversion, validity/deletion semantics and per-axis ordering with relative-name provenance. Reuse native address/sheet limit owners; add bounded compiled native comparison and Calc-owned inventory."
sections:
  Summary: "Port initialized ScSingleRefData numerical/flag contracts with source-derived and executable native evidence, as a prerequisite for Calc formula token ownership."
  Scope: "New sc/inc/refdata.ts header export and sc/source/core/tool/refdata.ts owner; source-derived reference-data/ordering tests; native fixture and acceptance test; scripts/calc-refdata-native-probe.mjs; new Calc capability and runtime/provenance for both modules; calc-core docs. Preserve existing tests and shared/Writer owners. Calc checkout/branch only; no merges. Milestone5; full suite at milestone10."
  Plan: "Implement original initialized eight-bit flags and signed raw coordinates without invented zero defaults. Support implicit native value copy/assignment, all initializers/setters/increments, raw equality, deleted coordinate masking, distinct local/external validity, independent toAbs axis checks and SetAddress monotone deletion flags. Translate original PutInOrder axis operations and relative-name masks without a generic axis replacement. Reuse ScAddress, ScRefAddress, ScSheetLimits and existing document-bound interface; add only a structural GetSheetLimits view, not a replacement ScDocument. Compile unchanged native header/class bodies and all non-debug single-reference definitions with bounded original numerical owners and four document getters; exercise all256 flag states and relative/name/order combinations under ASan/UBSan, store exact source/body hashes and portable fixture. Prove actual100 Calc coverage and scoped static/inventory gates. Whole document/token/compiler integration and native undefined domains remain unverified. User goal authorizes core progression and local upstream research."
  Verify Steps: "1. Compile/regenerate native probe with --write then reproduce with --check; require exact pinned Git blobs and ASan/UBSan-clean defined input domains. Compare every native fixture row using actual TS owner. 2. Run npm run test:coverage:calc, require100 actual lines/statements/functions/branches and preserve existing cases. 3. Run npm run typecheck, check:dependencies, check:docs, check:file-size, check:source-tree, affected ESLint and Prettier. 4. Scoped Calc registry must have0 semantic violations; preserve all prior records/statuses and shared/Writer files. 5. Routing, ap doctor, git diff --check; final clean tracked/untracked state on calc. Full suite scheduled for Calc10."
  Verification: |-
    Pending port and bounded native/source-derived acceptance.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-09T08:12:10.183Z — VERIFY — ok

    By: CODER

    Note: Commands: native reference probe --write/--check, npm run test:coverage:calc, typecheck, check:dependencies, check:docs, check:file-size, check:source-tree, affected ESLint/Prettier, Calc registry, routing, doctor, diff check. Result: all pass after recorded local extraction/documentation/header-metadata corrections. Evidence:28 tests in7 files; actual100 lines404/404 statements457/457 functions126/126 branches395/395. Native30 unchanged non-debug definitions, exact pinned Git blobs and ASan/UBSan clean; all2048 flag/domain states1024 updates2048 orderings40 initializers12 mutations5 equality outputs match TS. Registry5 capabilities118 scoped modules0 semantic violations. Scope: initialized single references, portable native fixture, Calc metadata/docs. Existing tests, shared/Writer sources and prior statuses unchanged. Doctor0 errors1 pre-existing hook warning. Full suite due at Calc10.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-09T08:11:02.712Z, excerpt_hash=sha256:8d0ea39250b596ba58045b6dab287c1794f0b030792cc7d2e1e5f3569d4a8099

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610090758-MBH4QY/blueprint/resolved-snapshot.json
    - old_digest: cf0cc148ac7bcbaca2874389c790dba86d978455b30b25c780f73c91f5ed8312
    - current_digest: cf0cc148ac7bcbaca2874389c790dba86d978455b30b25c780f73c91f5ed8312
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610090758-MBH4QY

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610090758-MBH4QY
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this implementation commit, retaining earlier numerical and sheet-limit owners."
  Findings: |-
    Native ScRawToken storage requires explicit initialization, so this owner does not fabricate initialized default coordinates or flags. JavaScript named value-copy/assignment methods represent implicit C++ copies. Deleted getters mask coordinates, while equality, toAbs and ValidExternal use raw values. PutInOrder transfers axis-specific relative/deleted flags and relative-name provenance while retaining endpoint 3D flags. Debug-only Dump and undefined/uninitialized native states are not certified. Native probe uses a bounded document boundary, not the unported complete document.

    - Observation: Native probe initially used a nonexistent comparison end marker; bounded extraction was corrected to the actual spaceship operator marker. Initial acceptance passed all28 tests and100 coverage, then lint reported missing test tuple documentation and redundant JS template quote escapes.
      Impact: Only probe marker selection and source documentation/escaping required correction; original native bodies and production contracts remain unchanged.
      Resolution: Document the raw test tuple, remove only redundant template escaping, rerun native --check and affected lint/JSDoc gates. Scope and acceptance criteria unchanged.

    - Observation: Scoped registry requires an actual local symbol binding for the refdata header record; a direct re-export is not included in its declaration inventory.
      Impact: Header must bind and export the existing owner, matching standard import/export ownership; no duplicate class or shared changes are required.
      Resolution: Use an explicit local import/export of the same ScSingleRefData owner and rerun registry, type, dependency and Calc gates without weakening semantic checks.

    - Observation: The explicit import/export still does not count as a local declaration: the registry inventories class/function/type declarations, not imported or re-exported bindings. Previous proposed binding resolution was insufficient.
      Impact: The header runtime record incorrectly claimed a locally declared class; its exported owner is implemented and mapped separately in core/tool.
      Resolution: Restore the direct header re-export and accurately leave header localSymbols empty, as used by existing pure boundary records. Keep precise exported-symbol provenance, core/tool class symbols and all parity checks unchanged.
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

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-09T08:12:10.183Z — VERIFY — ok

By: CODER

Note: Commands: native reference probe --write/--check, npm run test:coverage:calc, typecheck, check:dependencies, check:docs, check:file-size, check:source-tree, affected ESLint/Prettier, Calc registry, routing, doctor, diff check. Result: all pass after recorded local extraction/documentation/header-metadata corrections. Evidence:28 tests in7 files; actual100 lines404/404 statements457/457 functions126/126 branches395/395. Native30 unchanged non-debug definitions, exact pinned Git blobs and ASan/UBSan clean; all2048 flag/domain states1024 updates2048 orderings40 initializers12 mutations5 equality outputs match TS. Registry5 capabilities118 scoped modules0 semantic violations. Scope: initialized single references, portable native fixture, Calc metadata/docs. Existing tests, shared/Writer sources and prior statuses unchanged. Doctor0 errors1 pre-existing hook warning. Full suite due at Calc10.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-09T08:11:02.712Z, excerpt_hash=sha256:8d0ea39250b596ba58045b6dab287c1794f0b030792cc7d2e1e5f3569d4a8099

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610090758-MBH4QY/blueprint/resolved-snapshot.json
- old_digest: cf0cc148ac7bcbaca2874389c790dba86d978455b30b25c780f73c91f5ed8312
- current_digest: cf0cc148ac7bcbaca2874389c790dba86d978455b30b25c780f73c91f5ed8312
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610090758-MBH4QY

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610090758-MBH4QY
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this implementation commit, retaining earlier numerical and sheet-limit owners.

## Findings

Native ScRawToken storage requires explicit initialization, so this owner does not fabricate initialized default coordinates or flags. JavaScript named value-copy/assignment methods represent implicit C++ copies. Deleted getters mask coordinates, while equality, toAbs and ValidExternal use raw values. PutInOrder transfers axis-specific relative/deleted flags and relative-name provenance while retaining endpoint 3D flags. Debug-only Dump and undefined/uninitialized native states are not certified. Native probe uses a bounded document boundary, not the unported complete document.

- Observation: Native probe initially used a nonexistent comparison end marker; bounded extraction was corrected to the actual spaceship operator marker. Initial acceptance passed all28 tests and100 coverage, then lint reported missing test tuple documentation and redundant JS template quote escapes.
  Impact: Only probe marker selection and source documentation/escaping required correction; original native bodies and production contracts remain unchanged.
  Resolution: Document the raw test tuple, remove only redundant template escaping, rerun native --check and affected lint/JSDoc gates. Scope and acceptance criteria unchanged.

- Observation: Scoped registry requires an actual local symbol binding for the refdata header record; a direct re-export is not included in its declaration inventory.
  Impact: Header must bind and export the existing owner, matching standard import/export ownership; no duplicate class or shared changes are required.
  Resolution: Use an explicit local import/export of the same ScSingleRefData owner and rerun registry, type, dependency and Calc gates without weakening semantic checks.

- Observation: The explicit import/export still does not count as a local declaration: the registry inventories class/function/type declarations, not imported or re-exported bindings. Previous proposed binding resolution was insufficient.
  Impact: The header runtime record incorrectly claimed a locally declared class; its exported owner is implemented and mapped separately in core/tool.
  Resolution: Restore the direct header re-export and accurately leave header localSymbols empty, as used by existing pure boundary records. Keep precise exported-symbol provenance, core/tool class symbols and all parity checks unchanged.
