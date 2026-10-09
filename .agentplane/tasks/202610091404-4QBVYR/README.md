---
id: "202610091404-4QBVYR"
title: "Port Calc range-list reference updates"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-09T14:04:54.941Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-09T14:15:23.198Z"
  updated_by: "CODER"
  note: "Command: node scripts/calc-rangelist-update-native-probe.mjs --write; node scripts/calc-rangelist-update-native-probe.mjs --check Result: pass. Evidence:14938 defined initialized cases; unchanged full ScRangeList class, numeric helpers/Join/edits/UpdateReference, ordinary ScRefUpdate helpers/body and address/range inlines. Seven pinned Git blobs, exact HEAD and extracted SHA256 verified; ASan/UBSan clean. Driver reads displacement inputs as signed64 before original typed argument conversion and checks stream validity; fixture canonical formatted. Scope:deletion-first ordering, same-tab guard, empty/complete deletion, all modes, signed16/signed32 conversion, ordered raw outputs, native changed overwrite and backward joins with index repair, counts and cache-sensitive follow-up joins. Undefined arithmetic or borrowed where references invalidated by deletion remain uncertified. Command: npm run test:coverage:calc Result: pass. Evidence:67 tests/15 files; actual Istanbul statements1222/1222,branches1110/1110,functions228/228,lines1075/1075 all100. Every native pipeline output compared; literal original testUpdateReference_DeleteRow/DeleteLastRow/DeleteCol cell/count assertions retained. Stable existing range/endpoints and independent native quirks verified. Scope:all Calc runtime owners; no coverage exclusions or threshold/provider/settings changes. Existing range-list geometry tests/fixtures/native probe and ScRefUpdate source unchanged, confirmed by git diff --exit-code 00508595e78e for those four paths. Command: npm run typecheck; npm run test:tooling; affected ESLint/Prettier Result: pass. Evidence:TS7 tools/application checks,13 tooling tests/3 files, three authored source/probe/test files lint clean; source/test/probe/native JSON formatted. Scope:existing ScRefUpdateDocument getter contract reused, native scalar output tuple consumed through original module boundary, no new document wrapper or shared/Writer source duplication. Command: npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance Result: pass. Evidence:333 runtime sources/1586 imports/29 permitted edges;1108 documented authored files;1111 size checks;114 required paths/33 retired roots;334 provenance entries(243mapped,74browser adaptations,17local infrastructure). Scope:original numerical class and anonymous helpers retained in coherent606line range-list owner; reviewed decomposition candidate below1000line hard limit. Existing owners consumed, no shared/Writer changes. Command: npm run inventory:parity:calc Result: pass. Evidence:13 capabilities/125 modules; zero semantic violations. New pipeline capability, source/header runtime/provenance and prior range-list/ordinary-update gaps reconciled. Initial normalized header marker was rejected and corrected to exact pinned spelling; subsequent validation passed. Scope:Calc/shared registry scope, finite numerical evidence with semantic parity intentionally unverified; full document/compiler/consumer/native lifetime integration remains pending. Command: node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check; git status --short --untracked-files=all Result: pass. Evidence:routing OK,doctor zero errors/two inherited warnings(managed readiness shim and old DONE task202610090715-PJV0JK without implementation hash);diff clean, active task files only. Scope:calc branch/current checkout, fourth resumed task of ten. Full Writer/full E2E deferred to task10 under user cadence; no Writer coverage repairs, merges, network/global file changes or unrelated task edits."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-09T14:15:23.827Z"
  updated_by: "EVALUATOR"
  note: "Original range-list reference updates delegate existing numerical owners with scoped actual100 coverage and native pipeline comparison."
  evaluated_sha: "505cb3156e0dea433b8cfa6f53c94bdd84894c0d"
  blueprint_digest: "793bd5f1cca4f49ca8f9924fd20e2209a89c88a64917f63c3bbe88475517ec92"
  evidence_refs:
    - ".agentplane/tasks/202610091404-4QBVYR/README.md"
    - ".agentplane/tasks/202610091404-4QBVYR/quality/20261009-141523827-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610091404-4QBVYR/quality/20261009-141523827-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610091404-4QBVYR/quality/20261009-141523827-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610091404-4QBVYR/blueprint/resolved-snapshot.json"
    - "505cb3156e0dea433b8cfa6f53c94bdd84894c0d"
    - "apps/office/src/sc/source/core/tool/rangelist-update.test.ts"
    - "scripts/calc-rangelist-update-native-probe.mjs"
    - "output/playwright/rangelist-update-verification.md"
  findings:
    - "Reviewed original deletion-first ordering, dual-negative change overwrite, native typed arguments, stable endpoints, monotone cache and backward borrowed-entry joins; source grouping remains aligned."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Implement approved native range-list update pipeline in calc checkout."
events:
  -
    type: "status"
    at: "2026-10-09T14:05:04.440Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement approved native range-list update pipeline in calc checkout."
  -
    type: "verify"
    at: "2026-10-09T14:15:23.198Z"
    author: "CODER"
    state: "ok"
    note: "Command: node scripts/calc-rangelist-update-native-probe.mjs --write; node scripts/calc-rangelist-update-native-probe.mjs --check Result: pass. Evidence:14938 defined initialized cases; unchanged full ScRangeList class, numeric helpers/Join/edits/UpdateReference, ordinary ScRefUpdate helpers/body and address/range inlines. Seven pinned Git blobs, exact HEAD and extracted SHA256 verified; ASan/UBSan clean. Driver reads displacement inputs as signed64 before original typed argument conversion and checks stream validity; fixture canonical formatted. Scope:deletion-first ordering, same-tab guard, empty/complete deletion, all modes, signed16/signed32 conversion, ordered raw outputs, native changed overwrite and backward joins with index repair, counts and cache-sensitive follow-up joins. Undefined arithmetic or borrowed where references invalidated by deletion remain uncertified. Command: npm run test:coverage:calc Result: pass. Evidence:67 tests/15 files; actual Istanbul statements1222/1222,branches1110/1110,functions228/228,lines1075/1075 all100. Every native pipeline output compared; literal original testUpdateReference_DeleteRow/DeleteLastRow/DeleteCol cell/count assertions retained. Stable existing range/endpoints and independent native quirks verified. Scope:all Calc runtime owners; no coverage exclusions or threshold/provider/settings changes. Existing range-list geometry tests/fixtures/native probe and ScRefUpdate source unchanged, confirmed by git diff --exit-code 00508595e78e for those four paths. Command: npm run typecheck; npm run test:tooling; affected ESLint/Prettier Result: pass. Evidence:TS7 tools/application checks,13 tooling tests/3 files, three authored source/probe/test files lint clean; source/test/probe/native JSON formatted. Scope:existing ScRefUpdateDocument getter contract reused, native scalar output tuple consumed through original module boundary, no new document wrapper or shared/Writer source duplication. Command: npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance Result: pass. Evidence:333 runtime sources/1586 imports/29 permitted edges;1108 documented authored files;1111 size checks;114 required paths/33 retired roots;334 provenance entries(243mapped,74browser adaptations,17local infrastructure). Scope:original numerical class and anonymous helpers retained in coherent606line range-list owner; reviewed decomposition candidate below1000line hard limit. Existing owners consumed, no shared/Writer changes. Command: npm run inventory:parity:calc Result: pass. Evidence:13 capabilities/125 modules; zero semantic violations. New pipeline capability, source/header runtime/provenance and prior range-list/ordinary-update gaps reconciled. Initial normalized header marker was rejected and corrected to exact pinned spelling; subsequent validation passed. Scope:Calc/shared registry scope, finite numerical evidence with semantic parity intentionally unverified; full document/compiler/consumer/native lifetime integration remains pending. Command: node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check; git status --short --untracked-files=all Result: pass. Evidence:routing OK,doctor zero errors/two inherited warnings(managed readiness shim and old DONE task202610090715-PJV0JK without implementation hash);diff clean, active task files only. Scope:calc branch/current checkout, fourth resumed task of ten. Full Writer/full E2E deferred to task10 under user cadence; no Writer coverage repairs, merges, network/global file changes or unrelated task edits."
doc_version: 3
doc_updated_at: "2026-10-09T14:15:23.282Z"
doc_updated_by: "CODER"
description: "Connect original ScRangeList UpdateReference deletion, update and join ordering to the existing ScRefUpdate owner, with native comparisons, 100 percent Calc coverage and inventory."
sections:
  Summary: "Port original ScRangeList UpdateReference using the existing ScRefUpdate numerical owner."
  Scope: "Calc branch and checkout only. Existing range-list source/header registries, new range-list update test/native fixture and native probe, one new capability, reconciliation of previous capability gaps and calc-core documentation. Existing geometry, shared and Writer owners remain reused without source duplication. Fourth task of the resumed ten-task full-validation interval."
  Plan: "Port original ScRangeList UpdateReference, compare unchanged native deletion/update/join pipeline, actual100 Calc coverage and inventory; task4 of10."
  Verify Steps: "Run node scripts/calc-rangelist-update-native-probe.mjs --write and --check; retain exact pinned Git bodies/hashes and sanitizer checks. Compare ordered values, changed results and cache-sensitive follow-up joins over all modes, axes, clipping, empty/deleted lists, same/multiple tabs, expansion and native dual-negative-delta overwrite. Retain original ucalc_rangelst deletion test assertions. Run npm run test:coverage:calc with actual100 statements/branches/functions/lines, npm run typecheck, npm run test:tooling, affected ESLint/Prettier, check:dependencies, check:docs, check:file-size, check:source-tree, check:source-provenance, inventory:parity:calc, routing, doctor and final clean status. Full suites run at task10, no Writer coverage fixes."
  Verification: |-
    Pending implementation. Clean calc HEAD00508595e78e; previous three resumed tasks passed actual100 Calc coverage and native differential checks.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-09T14:15:23.198Z — VERIFY — ok

    By: CODER

    Note: Command: node scripts/calc-rangelist-update-native-probe.mjs --write; node scripts/calc-rangelist-update-native-probe.mjs --check Result: pass. Evidence:14938 defined initialized cases; unchanged full ScRangeList class, numeric helpers/Join/edits/UpdateReference, ordinary ScRefUpdate helpers/body and address/range inlines. Seven pinned Git blobs, exact HEAD and extracted SHA256 verified; ASan/UBSan clean. Driver reads displacement inputs as signed64 before original typed argument conversion and checks stream validity; fixture canonical formatted. Scope:deletion-first ordering, same-tab guard, empty/complete deletion, all modes, signed16/signed32 conversion, ordered raw outputs, native changed overwrite and backward joins with index repair, counts and cache-sensitive follow-up joins. Undefined arithmetic or borrowed where references invalidated by deletion remain uncertified. Command: npm run test:coverage:calc Result: pass. Evidence:67 tests/15 files; actual Istanbul statements1222/1222,branches1110/1110,functions228/228,lines1075/1075 all100. Every native pipeline output compared; literal original testUpdateReference_DeleteRow/DeleteLastRow/DeleteCol cell/count assertions retained. Stable existing range/endpoints and independent native quirks verified. Scope:all Calc runtime owners; no coverage exclusions or threshold/provider/settings changes. Existing range-list geometry tests/fixtures/native probe and ScRefUpdate source unchanged, confirmed by git diff --exit-code 00508595e78e for those four paths. Command: npm run typecheck; npm run test:tooling; affected ESLint/Prettier Result: pass. Evidence:TS7 tools/application checks,13 tooling tests/3 files, three authored source/probe/test files lint clean; source/test/probe/native JSON formatted. Scope:existing ScRefUpdateDocument getter contract reused, native scalar output tuple consumed through original module boundary, no new document wrapper or shared/Writer source duplication. Command: npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance Result: pass. Evidence:333 runtime sources/1586 imports/29 permitted edges;1108 documented authored files;1111 size checks;114 required paths/33 retired roots;334 provenance entries(243mapped,74browser adaptations,17local infrastructure). Scope:original numerical class and anonymous helpers retained in coherent606line range-list owner; reviewed decomposition candidate below1000line hard limit. Existing owners consumed, no shared/Writer changes. Command: npm run inventory:parity:calc Result: pass. Evidence:13 capabilities/125 modules; zero semantic violations. New pipeline capability, source/header runtime/provenance and prior range-list/ordinary-update gaps reconciled. Initial normalized header marker was rejected and corrected to exact pinned spelling; subsequent validation passed. Scope:Calc/shared registry scope, finite numerical evidence with semantic parity intentionally unverified; full document/compiler/consumer/native lifetime integration remains pending. Command: node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check; git status --short --untracked-files=all Result: pass. Evidence:routing OK,doctor zero errors/two inherited warnings(managed readiness shim and old DONE task202610090715-PJV0JK without implementation hash);diff clean, active task files only. Scope:calc branch/current checkout, fourth resumed task of ten. Full Writer/full E2E deferred to task10 under user cadence; no Writer coverage repairs, merges, network/global file changes or unrelated task edits.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-09T14:13:01.072Z, excerpt_hash=sha256:31b1ab66e1d2295fb7994d3234c86996834908defdae396c53325e59c35ea5d2

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610091404-4QBVYR/blueprint/resolved-snapshot.json
    - old_digest: 793bd5f1cca4f49ca8f9924fd20e2209a89c88a64917f63c3bbe88475517ec92
    - current_digest: 793bd5f1cca4f49ca8f9924fd20e2209a89c88a64917f63c3bbe88475517ec92
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610091404-4QBVYR

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610091404-4QBVYR
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this implementation commit, leaving existing range-list geometry and ScRefUpdate owners intact."
  Findings: |-
    Native dual-negative delta overwrites changed with the second DeleteArea result. Input ranges borrowed from a list may be invalidated by native vector deletion, so differential inputs use independent where values. The document surface remains the existing structural getter contract; full ScDocument/compiler/I/O owners are subsequent work. No network, merge or global file access required.

    - Observation: Initial read used the old source-root shorthand; Calc sources reside under apps/office/src/sc. The native driver must parse displacement inputs wider than their receiving native parameter types to test boundary conversion.
      Impact: No production change or verification criteria changed.
      Resolution: Use verified application paths and signed64 driver input before native parameter conversion.

    - Observation: inventory:parity:calc rejected an upstream header marker with normalized spacing: bool UpdateReference( is absent.
      Impact: Evidence marker only; native execution and runtime tests passed. No scope or verification criterion change.
      Resolution: Use the exact pinned declaration spelling and rerun scoped registry validation.
id_source: "generated"
---
## Summary

Port original ScRangeList UpdateReference using the existing ScRefUpdate numerical owner.

## Scope

Calc branch and checkout only. Existing range-list source/header registries, new range-list update test/native fixture and native probe, one new capability, reconciliation of previous capability gaps and calc-core documentation. Existing geometry, shared and Writer owners remain reused without source duplication. Fourth task of the resumed ten-task full-validation interval.

## Plan

Port original ScRangeList UpdateReference, compare unchanged native deletion/update/join pipeline, actual100 Calc coverage and inventory; task4 of10.

## Verify Steps

Run node scripts/calc-rangelist-update-native-probe.mjs --write and --check; retain exact pinned Git bodies/hashes and sanitizer checks. Compare ordered values, changed results and cache-sensitive follow-up joins over all modes, axes, clipping, empty/deleted lists, same/multiple tabs, expansion and native dual-negative-delta overwrite. Retain original ucalc_rangelst deletion test assertions. Run npm run test:coverage:calc with actual100 statements/branches/functions/lines, npm run typecheck, npm run test:tooling, affected ESLint/Prettier, check:dependencies, check:docs, check:file-size, check:source-tree, check:source-provenance, inventory:parity:calc, routing, doctor and final clean status. Full suites run at task10, no Writer coverage fixes.

## Verification

Pending implementation. Clean calc HEAD00508595e78e; previous three resumed tasks passed actual100 Calc coverage and native differential checks.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-09T14:15:23.198Z — VERIFY — ok

By: CODER

Note: Command: node scripts/calc-rangelist-update-native-probe.mjs --write; node scripts/calc-rangelist-update-native-probe.mjs --check Result: pass. Evidence:14938 defined initialized cases; unchanged full ScRangeList class, numeric helpers/Join/edits/UpdateReference, ordinary ScRefUpdate helpers/body and address/range inlines. Seven pinned Git blobs, exact HEAD and extracted SHA256 verified; ASan/UBSan clean. Driver reads displacement inputs as signed64 before original typed argument conversion and checks stream validity; fixture canonical formatted. Scope:deletion-first ordering, same-tab guard, empty/complete deletion, all modes, signed16/signed32 conversion, ordered raw outputs, native changed overwrite and backward joins with index repair, counts and cache-sensitive follow-up joins. Undefined arithmetic or borrowed where references invalidated by deletion remain uncertified. Command: npm run test:coverage:calc Result: pass. Evidence:67 tests/15 files; actual Istanbul statements1222/1222,branches1110/1110,functions228/228,lines1075/1075 all100. Every native pipeline output compared; literal original testUpdateReference_DeleteRow/DeleteLastRow/DeleteCol cell/count assertions retained. Stable existing range/endpoints and independent native quirks verified. Scope:all Calc runtime owners; no coverage exclusions or threshold/provider/settings changes. Existing range-list geometry tests/fixtures/native probe and ScRefUpdate source unchanged, confirmed by git diff --exit-code 00508595e78e for those four paths. Command: npm run typecheck; npm run test:tooling; affected ESLint/Prettier Result: pass. Evidence:TS7 tools/application checks,13 tooling tests/3 files, three authored source/probe/test files lint clean; source/test/probe/native JSON formatted. Scope:existing ScRefUpdateDocument getter contract reused, native scalar output tuple consumed through original module boundary, no new document wrapper or shared/Writer source duplication. Command: npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance Result: pass. Evidence:333 runtime sources/1586 imports/29 permitted edges;1108 documented authored files;1111 size checks;114 required paths/33 retired roots;334 provenance entries(243mapped,74browser adaptations,17local infrastructure). Scope:original numerical class and anonymous helpers retained in coherent606line range-list owner; reviewed decomposition candidate below1000line hard limit. Existing owners consumed, no shared/Writer changes. Command: npm run inventory:parity:calc Result: pass. Evidence:13 capabilities/125 modules; zero semantic violations. New pipeline capability, source/header runtime/provenance and prior range-list/ordinary-update gaps reconciled. Initial normalized header marker was rejected and corrected to exact pinned spelling; subsequent validation passed. Scope:Calc/shared registry scope, finite numerical evidence with semantic parity intentionally unverified; full document/compiler/consumer/native lifetime integration remains pending. Command: node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check; git status --short --untracked-files=all Result: pass. Evidence:routing OK,doctor zero errors/two inherited warnings(managed readiness shim and old DONE task202610090715-PJV0JK without implementation hash);diff clean, active task files only. Scope:calc branch/current checkout, fourth resumed task of ten. Full Writer/full E2E deferred to task10 under user cadence; no Writer coverage repairs, merges, network/global file changes or unrelated task edits.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-09T14:13:01.072Z, excerpt_hash=sha256:31b1ab66e1d2295fb7994d3234c86996834908defdae396c53325e59c35ea5d2

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610091404-4QBVYR/blueprint/resolved-snapshot.json
- old_digest: 793bd5f1cca4f49ca8f9924fd20e2209a89c88a64917f63c3bbe88475517ec92
- current_digest: 793bd5f1cca4f49ca8f9924fd20e2209a89c88a64917f63c3bbe88475517ec92
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610091404-4QBVYR

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610091404-4QBVYR
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this implementation commit, leaving existing range-list geometry and ScRefUpdate owners intact.

## Findings

Native dual-negative delta overwrites changed with the second DeleteArea result. Input ranges borrowed from a list may be invalidated by native vector deletion, so differential inputs use independent where values. The document surface remains the existing structural getter contract; full ScDocument/compiler/I/O owners are subsequent work. No network, merge or global file access required.

- Observation: Initial read used the old source-root shorthand; Calc sources reside under apps/office/src/sc. The native driver must parse displacement inputs wider than their receiving native parameter types to test boundary conversion.
  Impact: No production change or verification criteria changed.
  Resolution: Use verified application paths and signed64 driver input before native parameter conversion.

- Observation: inventory:parity:calc rejected an upstream header marker with normalized spacing: bool UpdateReference( is absent.
  Impact: Evidence marker only; native execution and runtime tests passed. No scope or verification criterion change.
  Resolution: Use the exact pinned declaration spelling and rerun scoped registry validation.
