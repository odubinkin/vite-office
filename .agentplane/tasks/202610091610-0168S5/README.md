---
id: "202610091610-0168S5"
title: "Port Calc boolean row and column segment owners"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 15
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-09T16:11:46.948Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-09T16:33:08.388Z"
  updated_by: "CODER"
  note: "Passed436 unchanged native bool sequences and isolated debug assertion with genuine mdds/sanitizers;82 Calc tests actual100 in all four Istanbul metrics;5 shared,14 tooling,3 provenance,30 inventory tests; upstream-absent82+5+30 portable tests; TS7/lint/format/docs/ownership/size/tree/provenance and Calc/shared registry zero violations. Task8/10; Writer coverage untouched."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Implement approved original boolean segment owners and shared cache/iterator contracts on actual mdds, preserving pinned native evidence and Calc scoped100 gates."
events:
  -
    type: "status"
    at: "2026-10-09T16:11:47.773Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement approved original boolean segment owners and shared cache/iterator contracts on actual mdds, preserving pinned native evidence and Calc scoped100 gates."
  -
    type: "verify"
    at: "2026-10-09T16:33:08.388Z"
    author: "CODER"
    state: "ok"
    note: "Passed436 unchanged native bool sequences and isolated debug assertion with genuine mdds/sanitizers;82 Calc tests actual100 in all four Istanbul metrics;5 shared,14 tooling,3 provenance,30 inventory tests; upstream-absent82+5+30 portable tests; TS7/lint/format/docs/ownership/size/tree/provenance and Calc/shared registry zero violations. Task8/10; Writer coverage untouched."
doc_version: 3
doc_updated_at: "2026-10-09T16:33:08.504Z"
doc_updated_by: "CODER"
description: "Task8 of resumed interval: port actual segmenttree boolean owners/iterators on shared mdds, preserve original cache/shared-cursor and bounds contracts with pinned native evidence; introduce actual ScGlobal threaded-calculation flag where used."
sections:
  Summary: "Port original Calc boolean row/column flat segment owners and both row iterators over the already shared pinned mdds implementation. Preserve real implementation sharing, inclusive outer bounds, cached hint and owner-shared iteration state."
  Scope: "Calc checkout/branch only, task8 of resumed10. Add sc/inc/segmenttree.ts and sc/source/core/data/segmenttree.ts with complete boolean row/column public methods and needed original internal template specialization. Add the actual ScGlobal threaded-group-calculation flag at its core-data owner and re-export through existing inc/global.ts, preserving original false initialization and assertion preconditions. Native debug assertion uses explicit JS fail-fast diagnostic adaptation; native process-abort/release diagnostic policy remains uncertified. dumpAsString preserves original scalar ASCII text via JS immutable strings; RTL allocation/refcount/buffer capacity is not represented. Numeric UInt16 owners, conditional setters/sums and other ScGlobal services remain follow-up work, not replaced by stubs. Add portable native fixture/tests/probe, Calc runtime/provenance/capability records and update existing global provenance if needed, calc-core/suspected-case docs. Original native classes/method bodies are compiled unchanged for implemented boolean mechanisms with genuine mdds/Boost headers; diagnostic string methods not native-certified until actual RTL linkage exists. No native tree/engine/RTL stand-ins, Writer coverage repair, external writes or merges."
  Plan: "Port original boolean row/column segment owners and iterators over shared mdds, preserve owner cursor/cache/defaults/global preconditions with native evidence; task8 of10."
  Verify Steps: "Run pinned native bool-segment probe --write/--check under ASan/UBSan with unchanged original declarations/needed boolean methods, original global flag definition and genuine source-verified mdds/Boost. Compare inclusive ranges, failure output preservation, insertion changed flags, remove half-open boundaries, insert skip-start behavior, copy/cache state, reverse findLastTrue sentinel, ForwardIterator monotonic cursor/stale cached value and RangeIterator shared owner cursor, query interactions and repeated ends. Native uninitialized RangeIterator-before-first, dangling iterator/malformed mutation and arithmetic overflow remain excluded; preserve source expressions. Verify original diagnostic text with literal independent tests, JS assertion adaptation with explicit tests and isolated native debug assertion evidence. Ordinary tests require no upstream/native compiler/network. Run all Calc actual100 Istanbul four metrics, targeted shared mdds tests, TS7/tools, affected lint/format/docs/ownership/file-size/source-tree/provenance, Calc/shared registry zero semantic violations, related provenance/inventory/tooling tests where changes require them, routing/doctor/diff and final clean status. Full suite only task10; do not repair Writer coverage or promote whole-module parity from finite snapshots."
  Verification: |-
    Command: node scripts/calc-bool-segments-native-probe.mjs --write (initial fixture), --check and --thread-assertion. Result: pass. Evidence:436 initialized sequences using unchanged original bool declarations/complete needed groups, actual global flag declaration/definition and genuine verified mdds/Boost; ASan/UBSan pass. Shared dependency verifier also passes3020 native sequences. Isolated original debug assertion diagnosed; actual RTL diagnostic methods remain unlinked. Scope: bounded boolean interval/cache/cursor/query/copy/shift/readiness mechanisms.

    Command: npm run test:coverage:calc. Result: pass. Evidence:82 tests/18files; actual100 Istanbul statements1643/1643,branches1359/1359,functions310/310,lines1450/1450. No exclusions.

    Command: npm run test:shared -- src/external/mdds/include/mdds/flat_segment_tree.test.ts; npm run test:tooling; npm run test:source-provenance; npx vitest run --config scripts/libreoffice-inventory/vitest.config.ts scripts/libreoffice-inventory/registry-validation.test.ts scripts/libreoffice-inventory/runtime-inventory.test.ts scripts/libreoffice-inventory/registry-storage.test.ts scripts/libreoffice-inventory/parity-mappings.test.ts scripts/libreoffice-inventory/parity-mapping-cli.test.ts. Result: pass. Evidence:5 shared tests,14 tooling/3files,3 provenance tests,30 inventory/5files. Scope: affected shared dependency and registry/tool contracts.

    Command: npm run test:calc; targeted shared5 and inventory30 tests with both upstream symlinks temporarily detached and restored by EXIT trap. Result: pass. Evidence:82+5+30 portable tests; no compiler/network/upstream needed; both original links restored.

    Command: npm run typecheck; focused npx eslint --max-warnings0 and Prettier --check on all changed paths; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:calc; npm run inventory:parity:shared; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check. Result: pass. Evidence: TS7 tools/application;343 runtime modules with252 mapped,74 browser,17 local;1125 documented source files;114 required paths/33 retired roots; Calc17 capabilities/134modules and shared1/116 with zero semantic violations; routing pass; doctor zero errors and two inherited warnings (old managed shim, old task missing implementation hash), unchanged. Scope: ownership/provenance/lint/types and repository gates.

    Full suite follows the user cadence at resumed task10, not this task8. Writer coverage remains untouched. Final tracked/untracked status must be clean after close; all intended paths are limited to approved task scope.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-09T16:33:08.388Z — VERIFY — ok

    By: CODER

    Note: Passed436 unchanged native bool sequences and isolated debug assertion with genuine mdds/sanitizers;82 Calc tests actual100 in all four Istanbul metrics;5 shared,14 tooling,3 provenance,30 inventory tests; upstream-absent82+5+30 portable tests; TS7/lint/format/docs/ownership/size/tree/provenance and Calc/shared registry zero violations. Task8/10; Writer coverage untouched.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-09T16:33:06.441Z, excerpt_hash=sha256:2e5b5809da897798d792220ac4a48de61a2b88b368273da17e33734471a69cbf

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610091610-0168S5/blueprint/resolved-snapshot.json
    - old_digest: ccb85850e5b0e3c01b18982c8d5e4391b40654b550d763ad031850eea8482c65
    - current_digest: ccb85850e5b0e3c01b18982c8d5e4391b40654b550d763ad031850eea8482c65
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610091610-0168S5

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610091610-0168S5
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only task8 implementation commits; retain shared mdds prerequisite and all earlier Calc owners. Remove only newly introduced segment/global owner registrations if reverting."
  Findings: "Native436 initialized sequences and isolated debug assertion pass. All82 Calc tests pass with actual100 Istanbul:1643/1643 statements,1359/1359 branches,310/310 functions,1450/1450 lines. Initial missing branches were resolved by repeated readiness tests and an initialized two-border-node proof for getFirst, preserving native bodies and no coverage exclusions. ScGlobal static owner retains a narrowly justified no-extraneous-class exception. TS7 and focused lint pass. First docs/provenance gate found four throw-assertion callbacks missing JSDoc and an overly qualified header symbol: global.hxx declares bThreadedGroupCalcInProgress inside ScGlobal, not the literal qualified definition. Correct callback documentation and header evidence spellings without implementation or scope changes, then repeat affected gates. Related14 tooling,3 provenance and30 inventory tests pass."
id_source: "generated"
---
## Summary

Port original Calc boolean row/column flat segment owners and both row iterators over the already shared pinned mdds implementation. Preserve real implementation sharing, inclusive outer bounds, cached hint and owner-shared iteration state.

## Scope

Calc checkout/branch only, task8 of resumed10. Add sc/inc/segmenttree.ts and sc/source/core/data/segmenttree.ts with complete boolean row/column public methods and needed original internal template specialization. Add the actual ScGlobal threaded-group-calculation flag at its core-data owner and re-export through existing inc/global.ts, preserving original false initialization and assertion preconditions. Native debug assertion uses explicit JS fail-fast diagnostic adaptation; native process-abort/release diagnostic policy remains uncertified. dumpAsString preserves original scalar ASCII text via JS immutable strings; RTL allocation/refcount/buffer capacity is not represented. Numeric UInt16 owners, conditional setters/sums and other ScGlobal services remain follow-up work, not replaced by stubs. Add portable native fixture/tests/probe, Calc runtime/provenance/capability records and update existing global provenance if needed, calc-core/suspected-case docs. Original native classes/method bodies are compiled unchanged for implemented boolean mechanisms with genuine mdds/Boost headers; diagnostic string methods not native-certified until actual RTL linkage exists. No native tree/engine/RTL stand-ins, Writer coverage repair, external writes or merges.

## Plan

Port original boolean row/column segment owners and iterators over shared mdds, preserve owner cursor/cache/defaults/global preconditions with native evidence; task8 of10.

## Verify Steps

Run pinned native bool-segment probe --write/--check under ASan/UBSan with unchanged original declarations/needed boolean methods, original global flag definition and genuine source-verified mdds/Boost. Compare inclusive ranges, failure output preservation, insertion changed flags, remove half-open boundaries, insert skip-start behavior, copy/cache state, reverse findLastTrue sentinel, ForwardIterator monotonic cursor/stale cached value and RangeIterator shared owner cursor, query interactions and repeated ends. Native uninitialized RangeIterator-before-first, dangling iterator/malformed mutation and arithmetic overflow remain excluded; preserve source expressions. Verify original diagnostic text with literal independent tests, JS assertion adaptation with explicit tests and isolated native debug assertion evidence. Ordinary tests require no upstream/native compiler/network. Run all Calc actual100 Istanbul four metrics, targeted shared mdds tests, TS7/tools, affected lint/format/docs/ownership/file-size/source-tree/provenance, Calc/shared registry zero semantic violations, related provenance/inventory/tooling tests where changes require them, routing/doctor/diff and final clean status. Full suite only task10; do not repair Writer coverage or promote whole-module parity from finite snapshots.

## Verification

Command: node scripts/calc-bool-segments-native-probe.mjs --write (initial fixture), --check and --thread-assertion. Result: pass. Evidence:436 initialized sequences using unchanged original bool declarations/complete needed groups, actual global flag declaration/definition and genuine verified mdds/Boost; ASan/UBSan pass. Shared dependency verifier also passes3020 native sequences. Isolated original debug assertion diagnosed; actual RTL diagnostic methods remain unlinked. Scope: bounded boolean interval/cache/cursor/query/copy/shift/readiness mechanisms.

Command: npm run test:coverage:calc. Result: pass. Evidence:82 tests/18files; actual100 Istanbul statements1643/1643,branches1359/1359,functions310/310,lines1450/1450. No exclusions.

Command: npm run test:shared -- src/external/mdds/include/mdds/flat_segment_tree.test.ts; npm run test:tooling; npm run test:source-provenance; npx vitest run --config scripts/libreoffice-inventory/vitest.config.ts scripts/libreoffice-inventory/registry-validation.test.ts scripts/libreoffice-inventory/runtime-inventory.test.ts scripts/libreoffice-inventory/registry-storage.test.ts scripts/libreoffice-inventory/parity-mappings.test.ts scripts/libreoffice-inventory/parity-mapping-cli.test.ts. Result: pass. Evidence:5 shared tests,14 tooling/3files,3 provenance tests,30 inventory/5files. Scope: affected shared dependency and registry/tool contracts.

Command: npm run test:calc; targeted shared5 and inventory30 tests with both upstream symlinks temporarily detached and restored by EXIT trap. Result: pass. Evidence:82+5+30 portable tests; no compiler/network/upstream needed; both original links restored.

Command: npm run typecheck; focused npx eslint --max-warnings0 and Prettier --check on all changed paths; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:calc; npm run inventory:parity:shared; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check. Result: pass. Evidence: TS7 tools/application;343 runtime modules with252 mapped,74 browser,17 local;1125 documented source files;114 required paths/33 retired roots; Calc17 capabilities/134modules and shared1/116 with zero semantic violations; routing pass; doctor zero errors and two inherited warnings (old managed shim, old task missing implementation hash), unchanged. Scope: ownership/provenance/lint/types and repository gates.

Full suite follows the user cadence at resumed task10, not this task8. Writer coverage remains untouched. Final tracked/untracked status must be clean after close; all intended paths are limited to approved task scope.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-09T16:33:08.388Z — VERIFY — ok

By: CODER

Note: Passed436 unchanged native bool sequences and isolated debug assertion with genuine mdds/sanitizers;82 Calc tests actual100 in all four Istanbul metrics;5 shared,14 tooling,3 provenance,30 inventory tests; upstream-absent82+5+30 portable tests; TS7/lint/format/docs/ownership/size/tree/provenance and Calc/shared registry zero violations. Task8/10; Writer coverage untouched.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-09T16:33:06.441Z, excerpt_hash=sha256:2e5b5809da897798d792220ac4a48de61a2b88b368273da17e33734471a69cbf

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610091610-0168S5/blueprint/resolved-snapshot.json
- old_digest: ccb85850e5b0e3c01b18982c8d5e4391b40654b550d763ad031850eea8482c65
- current_digest: ccb85850e5b0e3c01b18982c8d5e4391b40654b550d763ad031850eea8482c65
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610091610-0168S5

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610091610-0168S5
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only task8 implementation commits; retain shared mdds prerequisite and all earlier Calc owners. Remove only newly introduced segment/global owner registrations if reverting.

## Findings

Native436 initialized sequences and isolated debug assertion pass. All82 Calc tests pass with actual100 Istanbul:1643/1643 statements,1359/1359 branches,310/310 functions,1450/1450 lines. Initial missing branches were resolved by repeated readiness tests and an initialized two-border-node proof for getFirst, preserving native bodies and no coverage exclusions. ScGlobal static owner retains a narrowly justified no-extraneous-class exception. TS7 and focused lint pass. First docs/provenance gate found four throw-assertion callbacks missing JSDoc and an overly qualified header symbol: global.hxx declares bThreadedGroupCalcInProgress inside ScGlobal, not the literal qualified definition. Correct callback documentation and header evidence spellings without implementation or scope changes, then repeat affected gates. Related14 tooling,3 provenance and30 inventory tests pass.
