---
id: "202610091638-6W99E8"
title: "Port Calc multi-selection owner and iterator"
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
  updated_at: "2026-10-09T16:40:02.364Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-09T17:20:13.600Z"
  updated_by: "CODER"
  note: "Passed550 unchanged native sequences and original debug assertion with genuine dependencies/sanitizers;88 Calc tests actual100 in all four Istanbul metrics;5 shared,14 tooling,3 provenance,30 inventory and upstream-absent88+5+30 portable tests; TS7/lint/format/docs/ownership/provenance/size/tree/Calc-shared registry zero violations. CALC-010..013 preserved. Task9/10; Writer coverage untouched."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-10-09T16:40:12.928Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-10-09T17:20:13.600Z"
    author: "CODER"
    state: "ok"
    note: "Passed550 unchanged native sequences and original debug assertion with genuine dependencies/sanitizers;88 Calc tests actual100 in all four Istanbul metrics;5 shared,14 tooling,3 provenance,30 inventory and upstream-absent88+5+30 portable tests; TS7/lint/format/docs/ownership/provenance/size/tree/Calc-shared registry zero violations. CALC-010..013 preserved. Task9/10; Writer coverage untouched."
doc_version: 3
doc_updated_at: "2026-10-09T17:20:13.653Z"
doc_updated_by: "CODER"
description: "Task9 of resumed cycle: original ScMultiSel and ScMultiSelIter over existing ScMarkArray, ScFlatBoolRowSegments and ScRangeList; preserve raw Set, row migration, borrowed versus snapshot iteration and shifts with unchanged native evidence."
sections:
  Summary: "Port original ScMultiSel and ScMultiSelIter using existing actual Calc row-mark, bool segment, range-list and sheet-limit owners."
  Scope: "Only calc checkout/branch. Task9 of resumed10; user goal/resume authorizes safe local changes. Add sc/inc/markmulti.ts and sc/source/core/data/markmulti.ts, complete public owner/iterator methods including copy/move/assignment adapters, raw range-list Set, row-to-column migration, borrowed storage access and original shifts. Add native fixture/probe and portable tests, Calc runtime/provenance/capability records, calc-core and suspicious-case documentation. Reuse actual shared mdds and Calc dependencies without duplicate implementations. Native comparison compiles unchanged original ScMultiSel/ScMultiSelIter bodies and needed original dependency mechanisms with genuine mdds/Boost, source blob/group hashes and ASan/UBSan. No replacement native interval/range-list/string/document engine. Scalar output references use tuples/aggregates; debug assertions use explicit fail-fast diagnostics. JS sort preserves the row comparator; native std::sort equal-key permutation and cross-standard-library move/vector lifetime are implementation-dependent and explicitly uncertified. Negative/out-of-bounds vector indices, dangling/reallocated borrowed pointers, uninitialized/malformed arithmetic remain excluded from defined native comparison. No ScMarkData/document/UI stand-ins, Writer coverage repairs, network writes or merges."
  Plan: "Port complete original multi-selection owner/iterator on actual dependencies with unchanged native evidence and Calc actual100; task9 of10, no behavior normalization."
  Verify Steps: "Read exact pinned originals. Run native markmulti probe --write/--check with unchanged original owner/iterator groups and real dependency mechanisms under ASan/UBSan; compare every public query, raw selection count, row/per-column arrays, HasOneMark output preservation, union IsAllMarked, equal-row/start-column logic, navigation, Set raw entries, all-column row migration, copy/assignment limits, moves in defined live storage and original row/column shifts. Compare borrowed one-source versus snapshot two-source iterator behavior, failed/terminal output preservation and GetRangeData precondition with explicit tests/native diagnosis. Retain literal upstream mark_test coordinates/expectations. Ordinary tests must work without upstream/compiler/network. Run all Calc tests with all four actual Istanbul metrics100 and affected markarr/segmenttree/shared mdds tests, related30 inventory and3 provenance/14 tooling tests, TS7 tools/application, focused lint/format, dependencies/docs/size/source-tree/provenance, Calc/shared registry zero semantic violations, routing/doctor/diff/final clean status. No coverage exclusions or fabricated native outcomes. Full suite remains task10, not task9. Keep finite bounded evidence and native/JS runtime limits explicit."
  Verification: |-
    Command: node scripts/calc-markmulti-native-probe.mjs --write (fixture generation), --check and --debug-assertion. Result: pass. Evidence:550 initialized sequences/319 complete interned observations using unchanged original selection classes/methods, actual ScMarkArray/ScRangeList/SvRefBase mechanisms and genuine verified mdds/Boost; ASan/UBSan pass. Dependency verifier also passes3020 mdds and436 bool sequences. Debug-enabled original GetRangeData assertion diagnosed with standard bounds; custom-bounds comparison uses unchanged NDEBUG semantics. Scope: selected public queries/raw arrays/retained bounds, output preservation, row migration, borrowing versus snapshots, vector capacity/slot transfers, defined copy/move/assignment and shifts.

    Command: npm run test:coverage:calc. Result: pass. Evidence:88 tests/19files; actual100 Istanbul statements1988/1988,branches1546/1546,functions346/346,lines1733/1733. No exclusions. Scope: all Calc tests, including affected markarr/segmenttree/address/range dependencies.

    Command: npm run test:shared -- src/external/mdds/include/mdds/flat_segment_tree.test.ts; npm run test:tooling; npm run test:source-provenance; npx vitest run --config scripts/libreoffice-inventory/vitest.config.ts scripts/libreoffice-inventory/registry-validation.test.ts scripts/libreoffice-inventory/runtime-inventory.test.ts scripts/libreoffice-inventory/registry-storage.test.ts scripts/libreoffice-inventory/parity-mappings.test.ts scripts/libreoffice-inventory/parity-mapping-cli.test.ts. Result: pass. Evidence:5 shared,14 tooling/3files,3 provenance,30 inventory/5files. Scope: affected shared dependency and registry/tool contracts.

    Command: npm run test:calc; targeted shared5 and inventory30 tests with both upstream symlinks temporarily detached and restored by EXIT trap. Result: pass. Evidence:88+5+30 portable tests; no compiler/network/upstream needed; both original links restored.

    Command: npm run typecheck; focused npx eslint --max-warnings 0 and npx prettier --check on all changed paths; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:calc; npm run inventory:parity:shared; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check. Result: pass. Evidence: TS7 tools/application;344 runtime sources/1609 imports/30 allowed cross-module edges;1129 documented source files;345 provenance modules (254 mapped,74 browser,17 local);114 required paths/33 retired roots; Calc18 capabilities/136modules and shared1/116 with zero semantic violations; routing pass; doctor zero errors/two inherited warnings unchanged. Scope: ownership/provenance/types/lint/docs and repository gates. Reviewed coherent492-line owner and517 physical-line probe; no new owner boundary is required by the source-shaped single extraction/comparison script. Logs: output/playwright/task9-*.log.

    Limits: finite selected evidence does not prove whole-module parity; inventory remains unverified. Native libc++220106 capacity policy, std::sort equal-key permutation, moved-from states, dangling borrowed pointers, native ABI/refcount/diagnostic/lifetime services and undefined inputs remain explicit gaps. Four original suspicious outputs recorded as CALC-010..013 and preserved. Full suite remains due at resumed task10; Writer coverage untouched. Final intentional paths will be committed and clean status recorded before closure.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-09T17:20:13.600Z — VERIFY — ok

    By: CODER

    Note: Passed550 unchanged native sequences and original debug assertion with genuine dependencies/sanitizers;88 Calc tests actual100 in all four Istanbul metrics;5 shared,14 tooling,3 provenance,30 inventory and upstream-absent88+5+30 portable tests; TS7/lint/format/docs/ownership/provenance/size/tree/Calc-shared registry zero violations. CALC-010..013 preserved. Task9/10; Writer coverage untouched.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-09T17:20:12.769Z, excerpt_hash=sha256:e46dc62dc7f81f9d70402dd0682e1d8e67042c623a4b3fc333c86c489229bfe8

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610091638-6W99E8/blueprint/resolved-snapshot.json
    - old_digest: 576a3d7d9498b3480d9ce0ff8b888e60d50e29898eed8052672962d2102b78e4
    - current_digest: 576a3d7d9498b3480d9ce0ff8b888e60d50e29898eed8052672962d2102b78e4
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610091638-6W99E8

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610091638-6W99E8
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task implementation/registry/docs; preserve all existing shared mdds and Calc dependencies."
  Findings: |-
    Original source distinguishes borrowed single-array iteration from two-array bool-segment snapshots. Bulk Set retains raw mark entries without an unmarked terminal. HasOneMark, missing-column equality and ShiftCols trailing-entry behavior require native evidence and preservation, not repairs. std::sort equal-key order is unspecified; this is recorded as a runtime limitation rather than adding a platform-specific sorting substitute.

    - Observation: First native composition run finds no enum ScPasteFunc marker; the pinned UpdateRefMode declaration is followed by enum FillDir. TS7 passes for the complete owner/iterator implementation.
      Impact: Probe extraction must use the exact original enum boundary; this is authoring evidence, with no behavior or scope drift.
      Resolution: Use original enum FillDir end marker, preserving the complete unchanged UpdateRefMode group, then rerun native compilation.

    - Observation: Native composition needs the original inline ScRange::PutInOrder used by its address-pair constructor, and ref.cxx also contains an unrelated WeakBase destructor beyond SvRefBase. Original ValidRow has a temporary debug assertion restricting maxima to standard/jumbo values.
      Impact: Use complete needed unchanged declarations and narrow only the unrelated dependency extraction. Custom explicit-bounds fixtures compare original release semantics under NDEBUG with ASan/UBSan; GetRangeData assertion is diagnosed separately with debug assertions enabled and standard bounds.
      Resolution: Add original inline range ordering, end SvRefBase destructor extraction before WeakBase, retain actual ValidRow body, and document the release/debug distinction. Add cross-bounds copy/assignment/move cases with real constructors, without native owner substitutes or behavior repairs.

    - Observation: Initial native comparison fails on retained per-column row maximum9 versus native7 after cross-limit vector copy assignment. All other87 Calc tests pass, TS7/lint and isolated native GetRangeData assertion pass. std::vector reallocates copy-assigned storage when source size exceeds capacity, constructing new ScMarkArray values with source bounds; retained slots otherwise keep receiver bounds.
      Impact: Native vector capacity is observable through immutable ScMarkArray limit references, not merely pointer allocation. Insert/erase move assignment must likewise retain destination-slot limits when storage is reused. This is a real TS transfer bug, not a suspicious upstream defect.
      Resolution: Model the needed native value-vector capacity/reallocation and copy/move slot semantics privately in the same owner, reusing actual ScMarkArray operations. Preserve clear capacity and original shifts; add cross-limit reserved-capacity insertion/erase sequences and rerun unchanged native comparisons. Cross-library allocation policy and dangling pointer lifetimes remain explicitly uncertified.

    - Observation: Capacity-profile C++ output literals were under-escaped in the JavaScript template, causing a compiler error before fixture generation; the previous524-case fixture remains unchanged. TS7 passes after value-vector transfer changes.
      Impact: Only research-driver JSON quoting requires correction; no native body or runtime behavior change.
      Resolution: Use C++ raw string literals for profile metadata and rerun the same original classes with544 scenarios. Keep the source-shaped 492-line owner together; review the506-line probe as one coherent extraction/comparison script with shared dependency verification reused.

    - Observation: After capacity/reallocation and slot copy/move corrections, all544 native sequences compare successfully in88 passing Calc tests. Native libc++220106 public capacity trace matches2,4,8 growth, exact copy-assignment reallocation, clear retention and zero-capacity self move. Coverage still misses four real branches in row migration and adjacency paths:1983/1988 statements,1542/1546 branches,346/346 functions,1730/1733 lines.
      Impact: Runtime transfer error is corrected without modifying native bodies. Required actual100 gate remains pending; no exclusions or fake unreachable inputs are introduced.
      Resolution: Add defined native operation sequences for the missing interval/cursor paths and adjacent Set/retained-capacity cases, then repeat Calc coverage. Whole-platform allocator/pointer parity remains uncertified; production adapter implements the recorded native value-container profile.

    - Observation: Pinned source line verification locates HasOneMark72, GetStartOfEqualColumns157, Set264 and ShiftCols354; composite documentation patch ordering did not match, making no changes.
      Impact: Only journal source citations need exact line correction; implementation and evidence unchanged.
      Resolution: Apply ordered line-only citation updates, then resume remaining checks.

    - Observation: check:docs detected that the native case builder documents only three of its four parameters.
      Impact: The required JSDoc check fails; implementation and native comparisons pass.
      Resolution: Document the existing otherLimits parameter without changing behavior or verification criteria.
id_source: "generated"
---
## Summary

Port original ScMultiSel and ScMultiSelIter using existing actual Calc row-mark, bool segment, range-list and sheet-limit owners.

## Scope

Only calc checkout/branch. Task9 of resumed10; user goal/resume authorizes safe local changes. Add sc/inc/markmulti.ts and sc/source/core/data/markmulti.ts, complete public owner/iterator methods including copy/move/assignment adapters, raw range-list Set, row-to-column migration, borrowed storage access and original shifts. Add native fixture/probe and portable tests, Calc runtime/provenance/capability records, calc-core and suspicious-case documentation. Reuse actual shared mdds and Calc dependencies without duplicate implementations. Native comparison compiles unchanged original ScMultiSel/ScMultiSelIter bodies and needed original dependency mechanisms with genuine mdds/Boost, source blob/group hashes and ASan/UBSan. No replacement native interval/range-list/string/document engine. Scalar output references use tuples/aggregates; debug assertions use explicit fail-fast diagnostics. JS sort preserves the row comparator; native std::sort equal-key permutation and cross-standard-library move/vector lifetime are implementation-dependent and explicitly uncertified. Negative/out-of-bounds vector indices, dangling/reallocated borrowed pointers, uninitialized/malformed arithmetic remain excluded from defined native comparison. No ScMarkData/document/UI stand-ins, Writer coverage repairs, network writes or merges.

## Plan

Port complete original multi-selection owner/iterator on actual dependencies with unchanged native evidence and Calc actual100; task9 of10, no behavior normalization.

## Verify Steps

Read exact pinned originals. Run native markmulti probe --write/--check with unchanged original owner/iterator groups and real dependency mechanisms under ASan/UBSan; compare every public query, raw selection count, row/per-column arrays, HasOneMark output preservation, union IsAllMarked, equal-row/start-column logic, navigation, Set raw entries, all-column row migration, copy/assignment limits, moves in defined live storage and original row/column shifts. Compare borrowed one-source versus snapshot two-source iterator behavior, failed/terminal output preservation and GetRangeData precondition with explicit tests/native diagnosis. Retain literal upstream mark_test coordinates/expectations. Ordinary tests must work without upstream/compiler/network. Run all Calc tests with all four actual Istanbul metrics100 and affected markarr/segmenttree/shared mdds tests, related30 inventory and3 provenance/14 tooling tests, TS7 tools/application, focused lint/format, dependencies/docs/size/source-tree/provenance, Calc/shared registry zero semantic violations, routing/doctor/diff/final clean status. No coverage exclusions or fabricated native outcomes. Full suite remains task10, not task9. Keep finite bounded evidence and native/JS runtime limits explicit.

## Verification

Command: node scripts/calc-markmulti-native-probe.mjs --write (fixture generation), --check and --debug-assertion. Result: pass. Evidence:550 initialized sequences/319 complete interned observations using unchanged original selection classes/methods, actual ScMarkArray/ScRangeList/SvRefBase mechanisms and genuine verified mdds/Boost; ASan/UBSan pass. Dependency verifier also passes3020 mdds and436 bool sequences. Debug-enabled original GetRangeData assertion diagnosed with standard bounds; custom-bounds comparison uses unchanged NDEBUG semantics. Scope: selected public queries/raw arrays/retained bounds, output preservation, row migration, borrowing versus snapshots, vector capacity/slot transfers, defined copy/move/assignment and shifts.

Command: npm run test:coverage:calc. Result: pass. Evidence:88 tests/19files; actual100 Istanbul statements1988/1988,branches1546/1546,functions346/346,lines1733/1733. No exclusions. Scope: all Calc tests, including affected markarr/segmenttree/address/range dependencies.

Command: npm run test:shared -- src/external/mdds/include/mdds/flat_segment_tree.test.ts; npm run test:tooling; npm run test:source-provenance; npx vitest run --config scripts/libreoffice-inventory/vitest.config.ts scripts/libreoffice-inventory/registry-validation.test.ts scripts/libreoffice-inventory/runtime-inventory.test.ts scripts/libreoffice-inventory/registry-storage.test.ts scripts/libreoffice-inventory/parity-mappings.test.ts scripts/libreoffice-inventory/parity-mapping-cli.test.ts. Result: pass. Evidence:5 shared,14 tooling/3files,3 provenance,30 inventory/5files. Scope: affected shared dependency and registry/tool contracts.

Command: npm run test:calc; targeted shared5 and inventory30 tests with both upstream symlinks temporarily detached and restored by EXIT trap. Result: pass. Evidence:88+5+30 portable tests; no compiler/network/upstream needed; both original links restored.

Command: npm run typecheck; focused npx eslint --max-warnings 0 and npx prettier --check on all changed paths; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:calc; npm run inventory:parity:shared; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check. Result: pass. Evidence: TS7 tools/application;344 runtime sources/1609 imports/30 allowed cross-module edges;1129 documented source files;345 provenance modules (254 mapped,74 browser,17 local);114 required paths/33 retired roots; Calc18 capabilities/136modules and shared1/116 with zero semantic violations; routing pass; doctor zero errors/two inherited warnings unchanged. Scope: ownership/provenance/types/lint/docs and repository gates. Reviewed coherent492-line owner and517 physical-line probe; no new owner boundary is required by the source-shaped single extraction/comparison script. Logs: output/playwright/task9-*.log.

Limits: finite selected evidence does not prove whole-module parity; inventory remains unverified. Native libc++220106 capacity policy, std::sort equal-key permutation, moved-from states, dangling borrowed pointers, native ABI/refcount/diagnostic/lifetime services and undefined inputs remain explicit gaps. Four original suspicious outputs recorded as CALC-010..013 and preserved. Full suite remains due at resumed task10; Writer coverage untouched. Final intentional paths will be committed and clean status recorded before closure.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-09T17:20:13.600Z — VERIFY — ok

By: CODER

Note: Passed550 unchanged native sequences and original debug assertion with genuine dependencies/sanitizers;88 Calc tests actual100 in all four Istanbul metrics;5 shared,14 tooling,3 provenance,30 inventory and upstream-absent88+5+30 portable tests; TS7/lint/format/docs/ownership/provenance/size/tree/Calc-shared registry zero violations. CALC-010..013 preserved. Task9/10; Writer coverage untouched.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-09T17:20:12.769Z, excerpt_hash=sha256:e46dc62dc7f81f9d70402dd0682e1d8e67042c623a4b3fc333c86c489229bfe8

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610091638-6W99E8/blueprint/resolved-snapshot.json
- old_digest: 576a3d7d9498b3480d9ce0ff8b888e60d50e29898eed8052672962d2102b78e4
- current_digest: 576a3d7d9498b3480d9ce0ff8b888e60d50e29898eed8052672962d2102b78e4
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610091638-6W99E8

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610091638-6W99E8
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task implementation/registry/docs; preserve all existing shared mdds and Calc dependencies.

## Findings

Original source distinguishes borrowed single-array iteration from two-array bool-segment snapshots. Bulk Set retains raw mark entries without an unmarked terminal. HasOneMark, missing-column equality and ShiftCols trailing-entry behavior require native evidence and preservation, not repairs. std::sort equal-key order is unspecified; this is recorded as a runtime limitation rather than adding a platform-specific sorting substitute.

- Observation: First native composition run finds no enum ScPasteFunc marker; the pinned UpdateRefMode declaration is followed by enum FillDir. TS7 passes for the complete owner/iterator implementation.
  Impact: Probe extraction must use the exact original enum boundary; this is authoring evidence, with no behavior or scope drift.
  Resolution: Use original enum FillDir end marker, preserving the complete unchanged UpdateRefMode group, then rerun native compilation.

- Observation: Native composition needs the original inline ScRange::PutInOrder used by its address-pair constructor, and ref.cxx also contains an unrelated WeakBase destructor beyond SvRefBase. Original ValidRow has a temporary debug assertion restricting maxima to standard/jumbo values.
  Impact: Use complete needed unchanged declarations and narrow only the unrelated dependency extraction. Custom explicit-bounds fixtures compare original release semantics under NDEBUG with ASan/UBSan; GetRangeData assertion is diagnosed separately with debug assertions enabled and standard bounds.
  Resolution: Add original inline range ordering, end SvRefBase destructor extraction before WeakBase, retain actual ValidRow body, and document the release/debug distinction. Add cross-bounds copy/assignment/move cases with real constructors, without native owner substitutes or behavior repairs.

- Observation: Initial native comparison fails on retained per-column row maximum9 versus native7 after cross-limit vector copy assignment. All other87 Calc tests pass, TS7/lint and isolated native GetRangeData assertion pass. std::vector reallocates copy-assigned storage when source size exceeds capacity, constructing new ScMarkArray values with source bounds; retained slots otherwise keep receiver bounds.
  Impact: Native vector capacity is observable through immutable ScMarkArray limit references, not merely pointer allocation. Insert/erase move assignment must likewise retain destination-slot limits when storage is reused. This is a real TS transfer bug, not a suspicious upstream defect.
  Resolution: Model the needed native value-vector capacity/reallocation and copy/move slot semantics privately in the same owner, reusing actual ScMarkArray operations. Preserve clear capacity and original shifts; add cross-limit reserved-capacity insertion/erase sequences and rerun unchanged native comparisons. Cross-library allocation policy and dangling pointer lifetimes remain explicitly uncertified.

- Observation: Capacity-profile C++ output literals were under-escaped in the JavaScript template, causing a compiler error before fixture generation; the previous524-case fixture remains unchanged. TS7 passes after value-vector transfer changes.
  Impact: Only research-driver JSON quoting requires correction; no native body or runtime behavior change.
  Resolution: Use C++ raw string literals for profile metadata and rerun the same original classes with544 scenarios. Keep the source-shaped 492-line owner together; review the506-line probe as one coherent extraction/comparison script with shared dependency verification reused.

- Observation: After capacity/reallocation and slot copy/move corrections, all544 native sequences compare successfully in88 passing Calc tests. Native libc++220106 public capacity trace matches2,4,8 growth, exact copy-assignment reallocation, clear retention and zero-capacity self move. Coverage still misses four real branches in row migration and adjacency paths:1983/1988 statements,1542/1546 branches,346/346 functions,1730/1733 lines.
  Impact: Runtime transfer error is corrected without modifying native bodies. Required actual100 gate remains pending; no exclusions or fake unreachable inputs are introduced.
  Resolution: Add defined native operation sequences for the missing interval/cursor paths and adjacent Set/retained-capacity cases, then repeat Calc coverage. Whole-platform allocator/pointer parity remains uncertified; production adapter implements the recorded native value-container profile.

- Observation: Pinned source line verification locates HasOneMark72, GetStartOfEqualColumns157, Set264 and ShiftCols354; composite documentation patch ordering did not match, making no changes.
  Impact: Only journal source citations need exact line correction; implementation and evidence unchanged.
  Resolution: Apply ordered line-only citation updates, then resume remaining checks.

- Observation: check:docs detected that the native case builder documents only three of its four parameters.
  Impact: The required JSDoc check fails; implementation and native comparisons pass.
  Resolution: Document the existing otherLimits parameter without changing behavior or verification criteria.
