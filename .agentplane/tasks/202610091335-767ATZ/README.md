---
id: "202610091335-767ATZ"
title: "Port Calc numerical insertion movement and sheet reorder updates"
result_summary: "Implemented original Calc ordinary reference insertion deletion movement and sheet reorder with native result precedence and scoped actual100 coverage"
status: "DONE"
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
  updated_at: "2026-10-09T13:36:25.096Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-09T13:45:47.552Z"
  updated_by: "CODER"
  note: "Command: node scripts/calc-refupdate-native-probe.mjs --write; node scripts/calc-refupdate-native-probe.mjs --check Result: pass. Evidence:32704 initialized native outcomes; exact pinned HEAD/four Git blobs and full/extracted SHA256 hashes; complete original numerical helper, expansion and ordinary Update intervals compile unchanged under ASan/UBSan. Canonical JSON fixture matches parsed outputs exactly. Scope: both expansion policies; insertion/deletion/clipping, whole-axis/end sticky restoration, native status precedence, mixed axis sequencing, source containment, positive/negative sheet reorder, reversed raw ranges and signed16 boundaries. Native aliased scalar pointer storage, debug assertion checks, undefined arithmetic, big-coordinate overload and full document/compiler/range-list consumers remain unverified. Command: npm run test:coverage:calc Result: pass. Evidence:57 tests/13 files; actual Istanbul statements1124/1124, branches1012/1012, functions224/224, lines989/989 all100. No coverage exclusions, threshold changes or previous tests/fixtures altered. Scope: all Calc owners with new ordinary Update, original enum values and independent literal insertion/deletion, copy, movement and reorder examples. Command: npm run typecheck; npm run test:tooling; affected ESLint/Prettier Result: pass. Evidence:TS7 tools/application checks;13 tooling tests/3 files; five affected authored code files lint clean and all six code/fixture paths formatted. Scope: merged TS7 and Istanbul infrastructure, actual disjoint unit ownership, original mode/Update API. Command: npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance Result: pass. Evidence:333 runtime sources/1582 relative imports/29 permitted edges;1104 documented files;1107 size checks, new352-line coherent refupdat owner below review threshold;114 required paths/33 retired roots;334 provenance entries (243 mapped,74 browser adaptations,17 local infrastructure). Scope: original global/core header/tool boundaries, retained existing owners, no shared/Writer production duplication. Command: npm run inventory:parity:calc Result: pass. Evidence:11 capabilities/125 modules, zero semantic violations. New ordinary-update capability and global runtime/provenance; existing header/tool records and previous capability gaps reconciled. All semantic parity remains unverified. Command: node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check; git status --short --untracked-files=all Result: pass. Evidence:routing OK;doctor zero errors and two inherited warnings (readiness shim, old DONE task202610090715-PJV0JK missing implementation hash);diff clean, only active task verification artifacts remain for closure. Scope:only calc checkout/branch;implementation9c04319797caca0acdc4263a817a1d95a5feec2a. No merges, network, global files, shared/Writer edits or unrelated task corrections. Task2 of resumed ten-task cadence; next full validation at task10, no full Writer/full E2E run now."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-09T13:45:48.679Z"
  updated_by: "EVALUATOR"
  note: "Original ordinary Update modes/helpers preserve sequential axis and sticky/invalid precedence with32704 unchanged native outcomes, independent literals and actual100 Istanbul; existing references/shared owners reused."
  evaluated_sha: "9c04319797caca0acdc4263a817a1d95a5feec2a"
  blueprint_digest: "ad78ba2f7f2ba8a53cb0cada0c1366e432131170c94148060db918c5a7ff2b54"
  evidence_refs:
    - ".agentplane/tasks/202610091335-767ATZ/README.md"
    - ".agentplane/tasks/202610091335-767ATZ/quality/20261009-134548679-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610091335-767ATZ/quality/20261009-134548679-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610091335-767ATZ/quality/20261009-134548679-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610091335-767ATZ/blueprint/resolved-snapshot.json"
    - "9c04319797caca0acdc4263a817a1d95a5feec2a"
    - "output/playwright/calc-resumed-task2-verification.md"
  findings:
    - "Two native reorder guard paths are logically excluded by preceding moved-range return; direct remaining outcomes include proof comments and unchanged native differential comparison. No branch exclusions or fake document defaults."
commit:
  hash: "9c04319797caca0acdc4263a817a1d95a5feec2a"
  message: "✨ 767ATZ calc: port ordinary reference insertion movement and reorder"
comments:
  -
    author: "CODER"
    body: "Start: port original ordinary-coordinate Update with exact helper responsibilities, expansion and sticky precedence; native differential and actual100 scoped evidence."
  -
    author: "CODER"
    body: "Verified: original ordinary reference updates match32704 unchanged native outcomes;57 Calc tests, actual100 Istanbul, TS7 and zero inventory violations pass."
events:
  -
    type: "status"
    at: "2026-10-09T13:36:26.869Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port original ordinary-coordinate Update with exact helper responsibilities, expansion and sticky precedence; native differential and actual100 scoped evidence."
  -
    type: "verify"
    at: "2026-10-09T13:45:47.552Z"
    author: "CODER"
    state: "ok"
    note: "Command: node scripts/calc-refupdate-native-probe.mjs --write; node scripts/calc-refupdate-native-probe.mjs --check Result: pass. Evidence:32704 initialized native outcomes; exact pinned HEAD/four Git blobs and full/extracted SHA256 hashes; complete original numerical helper, expansion and ordinary Update intervals compile unchanged under ASan/UBSan. Canonical JSON fixture matches parsed outputs exactly. Scope: both expansion policies; insertion/deletion/clipping, whole-axis/end sticky restoration, native status precedence, mixed axis sequencing, source containment, positive/negative sheet reorder, reversed raw ranges and signed16 boundaries. Native aliased scalar pointer storage, debug assertion checks, undefined arithmetic, big-coordinate overload and full document/compiler/range-list consumers remain unverified. Command: npm run test:coverage:calc Result: pass. Evidence:57 tests/13 files; actual Istanbul statements1124/1124, branches1012/1012, functions224/224, lines989/989 all100. No coverage exclusions, threshold changes or previous tests/fixtures altered. Scope: all Calc owners with new ordinary Update, original enum values and independent literal insertion/deletion, copy, movement and reorder examples. Command: npm run typecheck; npm run test:tooling; affected ESLint/Prettier Result: pass. Evidence:TS7 tools/application checks;13 tooling tests/3 files; five affected authored code files lint clean and all six code/fixture paths formatted. Scope: merged TS7 and Istanbul infrastructure, actual disjoint unit ownership, original mode/Update API. Command: npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance Result: pass. Evidence:333 runtime sources/1582 relative imports/29 permitted edges;1104 documented files;1107 size checks, new352-line coherent refupdat owner below review threshold;114 required paths/33 retired roots;334 provenance entries (243 mapped,74 browser adaptations,17 local infrastructure). Scope: original global/core header/tool boundaries, retained existing owners, no shared/Writer production duplication. Command: npm run inventory:parity:calc Result: pass. Evidence:11 capabilities/125 modules, zero semantic violations. New ordinary-update capability and global runtime/provenance; existing header/tool records and previous capability gaps reconciled. All semantic parity remains unverified. Command: node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check; git status --short --untracked-files=all Result: pass. Evidence:routing OK;doctor zero errors and two inherited warnings (readiness shim, old DONE task202610090715-PJV0JK missing implementation hash);diff clean, only active task verification artifacts remain for closure. Scope:only calc checkout/branch;implementation9c04319797caca0acdc4263a817a1d95a5feec2a. No merges, network, global files, shared/Writer edits or unrelated task corrections. Task2 of resumed ten-task cadence; next full validation at task10, no full Writer/full E2E run now."
  -
    type: "status"
    at: "2026-10-09T13:45:52.738Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: original ordinary reference updates match32704 unchanged native outcomes;57 Calc tests, actual100 Istanbul, TS7 and zero inventory violations pass."
doc_version: 3
doc_updated_at: "2026-10-09T13:45:52.739Z"
doc_updated_by: "CODER"
description: "Port original ordinary-coordinate ScRefUpdate Update overload and native private helpers, original UpdateRefMode header, structural IsExpandRefs getter contract, native differential outcomes and inventory. Second resumed Calc task; preserve exact sticky/invalid result precedence and axis ordering without document stubs."
sections:
  Summary: "Port original ordinary-coordinate insertion/deletion, movement and sheet-reorder reference updates."
  Scope: "Calc checkout/branch only. New sc/inc/global.ts original UpdateRefMode; existing core/inc and core/tool refupdat owners, focused update test/native fixture, scripts/calc-refupdate-native-probe.mjs. New capability, global runtime/provenance and existing reference-update inventory records/gap reconciliation; calc-core docs. Reuse coordinate owners, no shared/Writer/runtime toolchain edits. Task 2 of next ten-task interval."
  Plan: "Port ordinary numeric Update and original modes/helpers with exact native differential evidence, inventory and actual100 Istanbul scoped checks; task2 of10."
  Verify Steps: "Run native --write and --check with unchanged pinned source bodies under ASan/UBSan; canonical-format fixture. Compare every native result/raw coordinate, both expansion policy values, zero/crossing/negative displacements, clipping, full-axis/end sticky references, tab count adjustment without shrink, move source containment, positive/negative sheet reorder and original result precedence. Run npm run test:coverage:calc actual100 Istanbul four metrics; npm run typecheck; affected ESLint/Prettier; check:dependencies, check:docs, check:file-size, check:source-tree, check:source-provenance, inventory:parity:calc zero semantic violations; test:tooling; routing, doctor, diff/final clean state. No full Writer or full E2E at task2; full validation at task10."
  Verification: |-
    Pending implementation. Previous resumed task MoveRelWrap passed 52 tests/12 files and actual100 Istanbul; clean branch calc at 2e6523b7384e.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-09T13:45:47.552Z — VERIFY — ok

    By: CODER

    Note: Command: node scripts/calc-refupdate-native-probe.mjs --write; node scripts/calc-refupdate-native-probe.mjs --check Result: pass. Evidence:32704 initialized native outcomes; exact pinned HEAD/four Git blobs and full/extracted SHA256 hashes; complete original numerical helper, expansion and ordinary Update intervals compile unchanged under ASan/UBSan. Canonical JSON fixture matches parsed outputs exactly. Scope: both expansion policies; insertion/deletion/clipping, whole-axis/end sticky restoration, native status precedence, mixed axis sequencing, source containment, positive/negative sheet reorder, reversed raw ranges and signed16 boundaries. Native aliased scalar pointer storage, debug assertion checks, undefined arithmetic, big-coordinate overload and full document/compiler/range-list consumers remain unverified. Command: npm run test:coverage:calc Result: pass. Evidence:57 tests/13 files; actual Istanbul statements1124/1124, branches1012/1012, functions224/224, lines989/989 all100. No coverage exclusions, threshold changes or previous tests/fixtures altered. Scope: all Calc owners with new ordinary Update, original enum values and independent literal insertion/deletion, copy, movement and reorder examples. Command: npm run typecheck; npm run test:tooling; affected ESLint/Prettier Result: pass. Evidence:TS7 tools/application checks;13 tooling tests/3 files; five affected authored code files lint clean and all six code/fixture paths formatted. Scope: merged TS7 and Istanbul infrastructure, actual disjoint unit ownership, original mode/Update API. Command: npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance Result: pass. Evidence:333 runtime sources/1582 relative imports/29 permitted edges;1104 documented files;1107 size checks, new352-line coherent refupdat owner below review threshold;114 required paths/33 retired roots;334 provenance entries (243 mapped,74 browser adaptations,17 local infrastructure). Scope: original global/core header/tool boundaries, retained existing owners, no shared/Writer production duplication. Command: npm run inventory:parity:calc Result: pass. Evidence:11 capabilities/125 modules, zero semantic violations. New ordinary-update capability and global runtime/provenance; existing header/tool records and previous capability gaps reconciled. All semantic parity remains unverified. Command: node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check; git status --short --untracked-files=all Result: pass. Evidence:routing OK;doctor zero errors and two inherited warnings (readiness shim, old DONE task202610090715-PJV0JK missing implementation hash);diff clean, only active task verification artifacts remain for closure. Scope:only calc checkout/branch;implementation9c04319797caca0acdc4263a817a1d95a5feec2a. No merges, network, global files, shared/Writer edits or unrelated task corrections. Task2 of resumed ten-task cadence; next full validation at task10, no full Writer/full E2E run now.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-09T13:36:26.869Z, excerpt_hash=sha256:8cfbfd125c66fa9e724350de56b07184d4634e5189216a27c19855f60b9ed902

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610091335-767ATZ/blueprint/resolved-snapshot.json
    - old_digest: ad78ba2f7f2ba8a53cb0cada0c1366e432131170c94148060db918c5a7ff2b54
    - current_digest: ad78ba2f7f2ba8a53cb0cada0c1366e432131170c94148060db918c5a7ff2b54
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610091335-767ATZ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610091335-767ATZ
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task implementation commit; prior coordinate/reference/transpose/wrapping owners remain independent."
  Findings: "Native Update operates sequentially over columns, rows then sheets, preserving raw coordinate ordering and status replacement. GetTableCount minus one plus sheet displacement uses signed16; sheets disable shrink for deletion. Native reorder secondary inside-moved-range guards are unreachable after initial inside-range return; direct equivalent branches require proofs. Defined arithmetic only; C++ aliased output pointer storage/debug enforcement and full document/compiler integration remain unverified."
extensions:
  implementation_commit:
    hash: "9c04319797caca0acdc4263a817a1d95a5feec2a"
    message: "✨ 767ATZ calc: port ordinary reference insertion movement and reorder"
id_source: "generated"
---
## Summary

Port original ordinary-coordinate insertion/deletion, movement and sheet-reorder reference updates.

## Scope

Calc checkout/branch only. New sc/inc/global.ts original UpdateRefMode; existing core/inc and core/tool refupdat owners, focused update test/native fixture, scripts/calc-refupdate-native-probe.mjs. New capability, global runtime/provenance and existing reference-update inventory records/gap reconciliation; calc-core docs. Reuse coordinate owners, no shared/Writer/runtime toolchain edits. Task 2 of next ten-task interval.

## Plan

Port ordinary numeric Update and original modes/helpers with exact native differential evidence, inventory and actual100 Istanbul scoped checks; task2 of10.

## Verify Steps

Run native --write and --check with unchanged pinned source bodies under ASan/UBSan; canonical-format fixture. Compare every native result/raw coordinate, both expansion policy values, zero/crossing/negative displacements, clipping, full-axis/end sticky references, tab count adjustment without shrink, move source containment, positive/negative sheet reorder and original result precedence. Run npm run test:coverage:calc actual100 Istanbul four metrics; npm run typecheck; affected ESLint/Prettier; check:dependencies, check:docs, check:file-size, check:source-tree, check:source-provenance, inventory:parity:calc zero semantic violations; test:tooling; routing, doctor, diff/final clean state. No full Writer or full E2E at task2; full validation at task10.

## Verification

Pending implementation. Previous resumed task MoveRelWrap passed 52 tests/12 files and actual100 Istanbul; clean branch calc at 2e6523b7384e.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-09T13:45:47.552Z — VERIFY — ok

By: CODER

Note: Command: node scripts/calc-refupdate-native-probe.mjs --write; node scripts/calc-refupdate-native-probe.mjs --check Result: pass. Evidence:32704 initialized native outcomes; exact pinned HEAD/four Git blobs and full/extracted SHA256 hashes; complete original numerical helper, expansion and ordinary Update intervals compile unchanged under ASan/UBSan. Canonical JSON fixture matches parsed outputs exactly. Scope: both expansion policies; insertion/deletion/clipping, whole-axis/end sticky restoration, native status precedence, mixed axis sequencing, source containment, positive/negative sheet reorder, reversed raw ranges and signed16 boundaries. Native aliased scalar pointer storage, debug assertion checks, undefined arithmetic, big-coordinate overload and full document/compiler/range-list consumers remain unverified. Command: npm run test:coverage:calc Result: pass. Evidence:57 tests/13 files; actual Istanbul statements1124/1124, branches1012/1012, functions224/224, lines989/989 all100. No coverage exclusions, threshold changes or previous tests/fixtures altered. Scope: all Calc owners with new ordinary Update, original enum values and independent literal insertion/deletion, copy, movement and reorder examples. Command: npm run typecheck; npm run test:tooling; affected ESLint/Prettier Result: pass. Evidence:TS7 tools/application checks;13 tooling tests/3 files; five affected authored code files lint clean and all six code/fixture paths formatted. Scope: merged TS7 and Istanbul infrastructure, actual disjoint unit ownership, original mode/Update API. Command: npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance Result: pass. Evidence:333 runtime sources/1582 relative imports/29 permitted edges;1104 documented files;1107 size checks, new352-line coherent refupdat owner below review threshold;114 required paths/33 retired roots;334 provenance entries (243 mapped,74 browser adaptations,17 local infrastructure). Scope: original global/core header/tool boundaries, retained existing owners, no shared/Writer production duplication. Command: npm run inventory:parity:calc Result: pass. Evidence:11 capabilities/125 modules, zero semantic violations. New ordinary-update capability and global runtime/provenance; existing header/tool records and previous capability gaps reconciled. All semantic parity remains unverified. Command: node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check; git status --short --untracked-files=all Result: pass. Evidence:routing OK;doctor zero errors and two inherited warnings (readiness shim, old DONE task202610090715-PJV0JK missing implementation hash);diff clean, only active task verification artifacts remain for closure. Scope:only calc checkout/branch;implementation9c04319797caca0acdc4263a817a1d95a5feec2a. No merges, network, global files, shared/Writer edits or unrelated task corrections. Task2 of resumed ten-task cadence; next full validation at task10, no full Writer/full E2E run now.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-09T13:36:26.869Z, excerpt_hash=sha256:8cfbfd125c66fa9e724350de56b07184d4634e5189216a27c19855f60b9ed902

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610091335-767ATZ/blueprint/resolved-snapshot.json
- old_digest: ad78ba2f7f2ba8a53cb0cada0c1366e432131170c94148060db918c5a7ff2b54
- current_digest: ad78ba2f7f2ba8a53cb0cada0c1366e432131170c94148060db918c5a7ff2b54
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610091335-767ATZ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610091335-767ATZ
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task implementation commit; prior coordinate/reference/transpose/wrapping owners remain independent.

## Findings

Native Update operates sequentially over columns, rows then sheets, preserving raw coordinate ordering and status replacement. GetTableCount minus one plus sheet displacement uses signed16; sheets disable shrink for deletion. Native reorder secondary inside-moved-range guards are unreachable after initial inside-range return; direct equivalent branches require proofs. Defined arithmetic only; C++ aliased output pointer storage/debug enforcement and full document/compiler integration remain unverified.
