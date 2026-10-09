---
id: "202610090858-QP6EMJ"
title: "Port Calc full signed64 big address and range owners"
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
  updated_at: "2026-10-09T08:59:38.892Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-09T09:12:57.896Z"
  updated_by: "CODER"
  note: "Command: node scripts/calc-bigrange-native-probe.mjs --write; node scripts/calc-bigrange-native-probe.mjs --check Result: pass. Evidence: exact pinned HEAD and four Git blobs; unchanged complete native big classes/IsValid and ordinary inline constructors/order; ASan/UBSan clean;6552 address states,3468 range relation states,8 address and5 range mutation snapshots, ordinary conversion and8 equality outputs. Fixture recheck exact. Scope: complete defined signed64 numerical ScBigAddress/ScBigRange operations; original raw and converted values, per-axis extrema, exclusive document sheet validity/global sheet clipping and copy ownership. Command: npm run test:coverage:calc Result: pass. Evidence:45 tests in10 files; real V8 statements922/922, branches779/779, functions209/209 and lines818/818; all100%, no exclusions/settings changes. Scope: all current Calc owners and previous native fixtures, including new five acceptance tests comparing every big-coordinate fixture result and literal contracts. Command: npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree Result: pass. Evidence: application/tools typecheck passes;330 runtime sources/1565 relative imports/29 dependency edges;1082 authored sources documented;1085 files size checked with prior reviewed owner candidates unchanged;114 required paths and33 retired roots. Scope: new core/data owner and pure header boundary reuse existing ordinary coordinate/getter contracts; no shared/Writer implementations changed. Command: node_modules/.bin/eslint apps/office/src/sc/inc/bigrange.ts apps/office/src/sc/source/core/data/bigrange.ts apps/office/src/sc/source/core/data/bigrange.test.ts scripts/calc-bigrange-native-probe.mjs Result: pass. Evidence: affected source/test/probe lint clean. Scope: all four new authored code files. Command: node_modules/.bin/prettier --check apps/office/src/sc/inc/bigrange.ts apps/office/src/sc/source/core/data/bigrange.ts apps/office/src/sc/source/core/data/bigrange.test.ts scripts/calc-bigrange-native-probe.mjs Result: pass. Evidence: all matched files formatted. Scope: all four new authored code files; native fixture intentionally compact decimal JSON. Command: npm run inventory:parity:calc Result: pass. Evidence:8 capabilities,122 modules (10 Calc/112 shared), zero semantic violations; original header and source evidence mapped in new capability/two runtime/two provenance records. Existing semantic flags unchanged; new parity flags unverified. Scope: complete Calc inventory; numerical cases do not establish full ScDocument/change-tracking/reference-update integration or native lifetime/undefined arithmetic parity. Command: node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check; git rev-parse --abbrev-ref HEAD Result: pass. Evidence: routing OK; doctor zero errors/one pre-existing managed-shim readiness warning; diff clean; branch calc. No merge or outside-checkout mutation. Scope: scoped implementation and task traceability; old hook warning remains outside scope. Full suites follow the user-approved once-per-ten completed Calc tasks cadence. This is milestone8; full run remains required after10, with targeted checks on intervening tasks. Final clean tracked/untracked state is recorded after finish. Signed64 overflow is native UB and outside the defined fixture domain; no wrapping semantics are fabricated. Full document and consumer integration remain subsequent work, so the overall user goal remains active."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-09T09:13:34.654Z"
  updated_by: "EVALUATOR"
  note: "Complete defined signed64 big-coordinate owners preserve original numeric contracts and existing ordinary owner boundaries."
  evaluated_sha: "490f0af9d064f58adb4e7476170d555086f414e8"
  blueprint_digest: "9a7725a00cf241eb984bdc0035ad6d3b6b6666b834cacba8dd3fcf162f913a02"
  evidence_refs:
    - ".agentplane/tasks/202610090858-QP6EMJ/README.md"
    - ".agentplane/tasks/202610090858-QP6EMJ/quality/20261009-091334654-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610090858-QP6EMJ/quality/20261009-091334654-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610090858-QP6EMJ/quality/20261009-091334654-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610090858-QP6EMJ/blueprint/resolved-snapshot.json"
    - "apps/office/src/sc/source/core/data/bigrange.test.ts"
    - "apps/office/coverage/calc/coverage-summary.json"
    - "output/playwright/calc-registry8.json"
    - "490f0af9d064"
  findings:
    - "All unchanged compiled original big class/source outcomes compare through TS; exact bigint values retain sentinels, raw order, clipped ordinary conversion and independent copies. Existing tests, fixtures, shared code and parity flags remain unchanged."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: port original signed64 big coordinates and ranges with exact sentinel/validity/conversion contracts, reusing ordinary owners."
events:
  -
    type: "status"
    at: "2026-10-09T08:59:39.720Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port original signed64 big coordinates and ranges with exact sentinel/validity/conversion contracts, reusing ordinary owners."
  -
    type: "verify"
    at: "2026-10-09T09:12:57.896Z"
    author: "CODER"
    state: "ok"
    note: "Command: node scripts/calc-bigrange-native-probe.mjs --write; node scripts/calc-bigrange-native-probe.mjs --check Result: pass. Evidence: exact pinned HEAD and four Git blobs; unchanged complete native big classes/IsValid and ordinary inline constructors/order; ASan/UBSan clean;6552 address states,3468 range relation states,8 address and5 range mutation snapshots, ordinary conversion and8 equality outputs. Fixture recheck exact. Scope: complete defined signed64 numerical ScBigAddress/ScBigRange operations; original raw and converted values, per-axis extrema, exclusive document sheet validity/global sheet clipping and copy ownership. Command: npm run test:coverage:calc Result: pass. Evidence:45 tests in10 files; real V8 statements922/922, branches779/779, functions209/209 and lines818/818; all100%, no exclusions/settings changes. Scope: all current Calc owners and previous native fixtures, including new five acceptance tests comparing every big-coordinate fixture result and literal contracts. Command: npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree Result: pass. Evidence: application/tools typecheck passes;330 runtime sources/1565 relative imports/29 dependency edges;1082 authored sources documented;1085 files size checked with prior reviewed owner candidates unchanged;114 required paths and33 retired roots. Scope: new core/data owner and pure header boundary reuse existing ordinary coordinate/getter contracts; no shared/Writer implementations changed. Command: node_modules/.bin/eslint apps/office/src/sc/inc/bigrange.ts apps/office/src/sc/source/core/data/bigrange.ts apps/office/src/sc/source/core/data/bigrange.test.ts scripts/calc-bigrange-native-probe.mjs Result: pass. Evidence: affected source/test/probe lint clean. Scope: all four new authored code files. Command: node_modules/.bin/prettier --check apps/office/src/sc/inc/bigrange.ts apps/office/src/sc/source/core/data/bigrange.ts apps/office/src/sc/source/core/data/bigrange.test.ts scripts/calc-bigrange-native-probe.mjs Result: pass. Evidence: all matched files formatted. Scope: all four new authored code files; native fixture intentionally compact decimal JSON. Command: npm run inventory:parity:calc Result: pass. Evidence:8 capabilities,122 modules (10 Calc/112 shared), zero semantic violations; original header and source evidence mapped in new capability/two runtime/two provenance records. Existing semantic flags unchanged; new parity flags unverified. Scope: complete Calc inventory; numerical cases do not establish full ScDocument/change-tracking/reference-update integration or native lifetime/undefined arithmetic parity. Command: node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check; git rev-parse --abbrev-ref HEAD Result: pass. Evidence: routing OK; doctor zero errors/one pre-existing managed-shim readiness warning; diff clean; branch calc. No merge or outside-checkout mutation. Scope: scoped implementation and task traceability; old hook warning remains outside scope. Full suites follow the user-approved once-per-ten completed Calc tasks cadence. This is milestone8; full run remains required after10, with targeted checks on intervening tasks. Final clean tracked/untracked state is recorded after finish. Signed64 overflow is native UB and outside the defined fixture domain; no wrapping semantics are fabricated. Full document and consumer integration remain subsequent work, so the overall user goal remains active."
doc_version: 3
doc_updated_at: "2026-10-09T09:12:57.972Z"
doc_updated_by: "CODER"
description: "Implement complete ScBigAddress and ScBigRange numerical header/source contracts for change-tracking/reference-update consumers with exact bigint coordinates, native sentinels, validity and clipped ordinary conversion."
sections:
  Summary: "Port complete defined numerical ScBigAddress/ScBigRange ownership as the signed64 dependency for original reference updates and change-tracking geometry."
  Scope: "New sc/inc/bigrange.ts and sc/source/core/data/bigrange.ts, focused acceptance test and native fixture, scripts/calc-bigrange-native-probe.mjs, new Calc capability and two runtime/provenance records, calc-core docs. Reuse ScAddress, ScRange and existing document getter view. Preserve all prior tests/fixtures/status flags and shared/Writer sources. Only calc checkout/branch; no merges. Calc milestone8; full suite at10."
  Plan: "Implement complete original initialized address/range constructors, copy/assignment, raw setters/increments/GetVars/equality, independent stable range endpoint owners, signed64 min/max whole-axis sentinels, exact doc validity and native clipped MakeAddress/MakeRange with pair-constructor sorting. Use bigint for native64 values without floating-point rounding or fabricated signed-overflow behavior; preserve raw reversed and outside-document values. Consolidate inline numerical classes with original source validity body under same header/data file boundaries as prior coordinate owners. Compile original full big header/class and unchanged IsValid body using original ordinary address/range inline owners in bounded three-getter doc shell; compare every raw/converted output, relation and mutation under ASan/UBSan, including values beyond2^53. Inventory leaves full document/change-tracking integration and undefined arithmetic/lifetime unverified. Run actual100 Calc coverage and scoped guards, record quality/commit/clean state. Next native owner is ScRefUpdate, followed by range-list reference-update integration and full suite atCalc10. User goal authorizes this core progression."
  Verify Steps: "Run node scripts/calc-bigrange-native-probe.mjs --write then --check; require exact pinned Git blobs, full/source interval hashes and ASan/UBSan-clean defined64 states. Compare every native address/range/relation/mutation outcome through actual TS owners, preserve raw reversed endpoints, clipping/sentinel/table-count distinction and copy ownership. Run npm run test:coverage:calc actual100 all4 metrics, npm run typecheck, check:dependencies, check:docs, check:file-size, check:source-tree and affected ESLint/Prettier. Scoped Calc registry0 semantic violations; preserve previous tests/fixtures/status flags/shared code. Routing, ap doctor, diff check and final clean tracked/untracked calc state. Full suite remains scheduled after Calc10."
  Verification: |-
    Pending complete owner port and bounded native acceptance.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-09T09:12:57.896Z — VERIFY — ok

    By: CODER

    Note: Command: node scripts/calc-bigrange-native-probe.mjs --write; node scripts/calc-bigrange-native-probe.mjs --check Result: pass. Evidence: exact pinned HEAD and four Git blobs; unchanged complete native big classes/IsValid and ordinary inline constructors/order; ASan/UBSan clean;6552 address states,3468 range relation states,8 address and5 range mutation snapshots, ordinary conversion and8 equality outputs. Fixture recheck exact. Scope: complete defined signed64 numerical ScBigAddress/ScBigRange operations; original raw and converted values, per-axis extrema, exclusive document sheet validity/global sheet clipping and copy ownership. Command: npm run test:coverage:calc Result: pass. Evidence:45 tests in10 files; real V8 statements922/922, branches779/779, functions209/209 and lines818/818; all100%, no exclusions/settings changes. Scope: all current Calc owners and previous native fixtures, including new five acceptance tests comparing every big-coordinate fixture result and literal contracts. Command: npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree Result: pass. Evidence: application/tools typecheck passes;330 runtime sources/1565 relative imports/29 dependency edges;1082 authored sources documented;1085 files size checked with prior reviewed owner candidates unchanged;114 required paths and33 retired roots. Scope: new core/data owner and pure header boundary reuse existing ordinary coordinate/getter contracts; no shared/Writer implementations changed. Command: node_modules/.bin/eslint apps/office/src/sc/inc/bigrange.ts apps/office/src/sc/source/core/data/bigrange.ts apps/office/src/sc/source/core/data/bigrange.test.ts scripts/calc-bigrange-native-probe.mjs Result: pass. Evidence: affected source/test/probe lint clean. Scope: all four new authored code files. Command: node_modules/.bin/prettier --check apps/office/src/sc/inc/bigrange.ts apps/office/src/sc/source/core/data/bigrange.ts apps/office/src/sc/source/core/data/bigrange.test.ts scripts/calc-bigrange-native-probe.mjs Result: pass. Evidence: all matched files formatted. Scope: all four new authored code files; native fixture intentionally compact decimal JSON. Command: npm run inventory:parity:calc Result: pass. Evidence:8 capabilities,122 modules (10 Calc/112 shared), zero semantic violations; original header and source evidence mapped in new capability/two runtime/two provenance records. Existing semantic flags unchanged; new parity flags unverified. Scope: complete Calc inventory; numerical cases do not establish full ScDocument/change-tracking/reference-update integration or native lifetime/undefined arithmetic parity. Command: node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check; git rev-parse --abbrev-ref HEAD Result: pass. Evidence: routing OK; doctor zero errors/one pre-existing managed-shim readiness warning; diff clean; branch calc. No merge or outside-checkout mutation. Scope: scoped implementation and task traceability; old hook warning remains outside scope. Full suites follow the user-approved once-per-ten completed Calc tasks cadence. This is milestone8; full run remains required after10, with targeted checks on intervening tasks. Final clean tracked/untracked state is recorded after finish. Signed64 overflow is native UB and outside the defined fixture domain; no wrapping semantics are fabricated. Full document and consumer integration remain subsequent work, so the overall user goal remains active.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-09T09:12:29.126Z, excerpt_hash=sha256:683154b9cb18dbd8edc0559d03ddcbf354e9ed55a1e3a8636cc9a9bd9e1d12f7

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610090858-QP6EMJ/blueprint/resolved-snapshot.json
    - old_digest: 9a7725a00cf241eb984bdc0035ad6d3b6b6666b834cacba8dd3fcf162f913a02
    - current_digest: 9a7725a00cf241eb984bdc0035ad6d3b6b6666b834cacba8dd3fcf162f913a02
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610090858-QP6EMJ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610090858-QP6EMJ
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this implementation commit, preserving ordinary address/range/reference/list owners and existing native evidence."
  Findings: |-
    Native64 min/max sentinels count as valid on each axis independently. Ordinary sheet validity is exclusive GetTableCount; MakeAddress clips sheets to global MAXTAB instead. MakeRange invokes the sorting address-pair ScRange constructor. Numeric big range initialization never sorts. No existing shared64 geometry owner exists in the inspected runtime tree; use exact bigint values without duplicating ordinary range contracts. Native signed-overflow and pointer/move lifetime domains are not certified.

    - Observation: Original big class inline contracts and out-of-line IsValid are centralized at core/data with a pure inc re-export, following existing Calc owner boundaries. Defined signed64 extrema remain exact and validity differs from clipped global-sheet conversion.
      Impact: Bounded native comparisons and actual100 local coverage establish defined numerical cases only. Full document, change tracking, reference updates and native pointer/move or undefined overflow domains remain uncertified; all new semantic flags remain unverified.
      Resolution: Mapped both original header and source in eight-capability/122-module Calc inventory with zero semantic violations. Existing ordinary owners, shared/Writer code, previous tests/fixtures/status flags are unchanged; task8 full-suite cadence still requires the full run after task10.

    - Observation: An inspection shell glob scripts/program* had no matches; a later optional coverage lookup included an absent root-level coverage directory. Neither changed repository state or affected verification.
      Impact: Inspection paths needed correction; all declared implementation checks passed. Doctor retains its pre-existing managed-shim readiness warning with zero errors.
      Resolution: Recomputed next-action after failed lookup and used the actual inventory command and apps/office/coverage/calc/coverage-summary.json. Preserve hook configuration outside approved scope.
id_source: "generated"
---
## Summary

Port complete defined numerical ScBigAddress/ScBigRange ownership as the signed64 dependency for original reference updates and change-tracking geometry.

## Scope

New sc/inc/bigrange.ts and sc/source/core/data/bigrange.ts, focused acceptance test and native fixture, scripts/calc-bigrange-native-probe.mjs, new Calc capability and two runtime/provenance records, calc-core docs. Reuse ScAddress, ScRange and existing document getter view. Preserve all prior tests/fixtures/status flags and shared/Writer sources. Only calc checkout/branch; no merges. Calc milestone8; full suite at10.

## Plan

Implement complete original initialized address/range constructors, copy/assignment, raw setters/increments/GetVars/equality, independent stable range endpoint owners, signed64 min/max whole-axis sentinels, exact doc validity and native clipped MakeAddress/MakeRange with pair-constructor sorting. Use bigint for native64 values without floating-point rounding or fabricated signed-overflow behavior; preserve raw reversed and outside-document values. Consolidate inline numerical classes with original source validity body under same header/data file boundaries as prior coordinate owners. Compile original full big header/class and unchanged IsValid body using original ordinary address/range inline owners in bounded three-getter doc shell; compare every raw/converted output, relation and mutation under ASan/UBSan, including values beyond2^53. Inventory leaves full document/change-tracking integration and undefined arithmetic/lifetime unverified. Run actual100 Calc coverage and scoped guards, record quality/commit/clean state. Next native owner is ScRefUpdate, followed by range-list reference-update integration and full suite atCalc10. User goal authorizes this core progression.

## Verify Steps

Run node scripts/calc-bigrange-native-probe.mjs --write then --check; require exact pinned Git blobs, full/source interval hashes and ASan/UBSan-clean defined64 states. Compare every native address/range/relation/mutation outcome through actual TS owners, preserve raw reversed endpoints, clipping/sentinel/table-count distinction and copy ownership. Run npm run test:coverage:calc actual100 all4 metrics, npm run typecheck, check:dependencies, check:docs, check:file-size, check:source-tree and affected ESLint/Prettier. Scoped Calc registry0 semantic violations; preserve previous tests/fixtures/status flags/shared code. Routing, ap doctor, diff check and final clean tracked/untracked calc state. Full suite remains scheduled after Calc10.

## Verification

Pending complete owner port and bounded native acceptance.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-09T09:12:57.896Z — VERIFY — ok

By: CODER

Note: Command: node scripts/calc-bigrange-native-probe.mjs --write; node scripts/calc-bigrange-native-probe.mjs --check Result: pass. Evidence: exact pinned HEAD and four Git blobs; unchanged complete native big classes/IsValid and ordinary inline constructors/order; ASan/UBSan clean;6552 address states,3468 range relation states,8 address and5 range mutation snapshots, ordinary conversion and8 equality outputs. Fixture recheck exact. Scope: complete defined signed64 numerical ScBigAddress/ScBigRange operations; original raw and converted values, per-axis extrema, exclusive document sheet validity/global sheet clipping and copy ownership. Command: npm run test:coverage:calc Result: pass. Evidence:45 tests in10 files; real V8 statements922/922, branches779/779, functions209/209 and lines818/818; all100%, no exclusions/settings changes. Scope: all current Calc owners and previous native fixtures, including new five acceptance tests comparing every big-coordinate fixture result and literal contracts. Command: npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree Result: pass. Evidence: application/tools typecheck passes;330 runtime sources/1565 relative imports/29 dependency edges;1082 authored sources documented;1085 files size checked with prior reviewed owner candidates unchanged;114 required paths and33 retired roots. Scope: new core/data owner and pure header boundary reuse existing ordinary coordinate/getter contracts; no shared/Writer implementations changed. Command: node_modules/.bin/eslint apps/office/src/sc/inc/bigrange.ts apps/office/src/sc/source/core/data/bigrange.ts apps/office/src/sc/source/core/data/bigrange.test.ts scripts/calc-bigrange-native-probe.mjs Result: pass. Evidence: affected source/test/probe lint clean. Scope: all four new authored code files. Command: node_modules/.bin/prettier --check apps/office/src/sc/inc/bigrange.ts apps/office/src/sc/source/core/data/bigrange.ts apps/office/src/sc/source/core/data/bigrange.test.ts scripts/calc-bigrange-native-probe.mjs Result: pass. Evidence: all matched files formatted. Scope: all four new authored code files; native fixture intentionally compact decimal JSON. Command: npm run inventory:parity:calc Result: pass. Evidence:8 capabilities,122 modules (10 Calc/112 shared), zero semantic violations; original header and source evidence mapped in new capability/two runtime/two provenance records. Existing semantic flags unchanged; new parity flags unverified. Scope: complete Calc inventory; numerical cases do not establish full ScDocument/change-tracking/reference-update integration or native lifetime/undefined arithmetic parity. Command: node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check; git rev-parse --abbrev-ref HEAD Result: pass. Evidence: routing OK; doctor zero errors/one pre-existing managed-shim readiness warning; diff clean; branch calc. No merge or outside-checkout mutation. Scope: scoped implementation and task traceability; old hook warning remains outside scope. Full suites follow the user-approved once-per-ten completed Calc tasks cadence. This is milestone8; full run remains required after10, with targeted checks on intervening tasks. Final clean tracked/untracked state is recorded after finish. Signed64 overflow is native UB and outside the defined fixture domain; no wrapping semantics are fabricated. Full document and consumer integration remain subsequent work, so the overall user goal remains active.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-09T09:12:29.126Z, excerpt_hash=sha256:683154b9cb18dbd8edc0559d03ddcbf354e9ed55a1e3a8636cc9a9bd9e1d12f7

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610090858-QP6EMJ/blueprint/resolved-snapshot.json
- old_digest: 9a7725a00cf241eb984bdc0035ad6d3b6b6666b834cacba8dd3fcf162f913a02
- current_digest: 9a7725a00cf241eb984bdc0035ad6d3b6b6666b834cacba8dd3fcf162f913a02
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610090858-QP6EMJ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610090858-QP6EMJ
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this implementation commit, preserving ordinary address/range/reference/list owners and existing native evidence.

## Findings

Native64 min/max sentinels count as valid on each axis independently. Ordinary sheet validity is exclusive GetTableCount; MakeAddress clips sheets to global MAXTAB instead. MakeRange invokes the sorting address-pair ScRange constructor. Numeric big range initialization never sorts. No existing shared64 geometry owner exists in the inspected runtime tree; use exact bigint values without duplicating ordinary range contracts. Native signed-overflow and pointer/move lifetime domains are not certified.

- Observation: Original big class inline contracts and out-of-line IsValid are centralized at core/data with a pure inc re-export, following existing Calc owner boundaries. Defined signed64 extrema remain exact and validity differs from clipped global-sheet conversion.
  Impact: Bounded native comparisons and actual100 local coverage establish defined numerical cases only. Full document, change tracking, reference updates and native pointer/move or undefined overflow domains remain uncertified; all new semantic flags remain unverified.
  Resolution: Mapped both original header and source in eight-capability/122-module Calc inventory with zero semantic violations. Existing ordinary owners, shared/Writer code, previous tests/fixtures/status flags are unchanged; task8 full-suite cadence still requires the full run after task10.

- Observation: An inspection shell glob scripts/program* had no matches; a later optional coverage lookup included an absent root-level coverage directory. Neither changed repository state or affected verification.
  Impact: Inspection paths needed correction; all declared implementation checks passed. Doctor retains its pre-existing managed-shim readiness warning with zero errors.
  Resolution: Recomputed next-action after failed lookup and used the actual inventory command and apps/office/coverage/calc/coverage-summary.json. Preserve hook configuration outside approved scope.
