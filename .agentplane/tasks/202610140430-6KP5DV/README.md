---
id: "202610140430-6KP5DV"
title: "Restore native table frame sibling root constructor contracts"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 16
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-14T04:32:05.437Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-14T04:51:38.262Z"
  updated_by: "CODER"
  note: "14,304 unique accepted; three entire current production modules 100% four metrics and 1,806 positive raw counters. Thirteen caller fixtures preserve all original tokens; 950 other tests unchanged, six canonical prefixes/137 build files retained. All static and nine metadata gates pass. Evidence apps/office/node_modules/.cache/parity-coverage/6KP5DV/proof.json and accepted-results.json. Cycle 4/10; upcoming full continues, following full pauses."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-14T04:52:17.260Z"
  updated_by: "EVALUATOR"
  note: "Same-agent non-independent review: semantic 59b735f9106d restores represented native sibling-root table/row/cell contracts and removes geometry constructor adapter; declared gates pass."
  evaluated_sha: "59b735f9106d14416e239e86a558daf1bd966001"
  blueprint_digest: "507291a8ae3393f1b092622e200355fe02246ccfbdadd1c6616f06412274edb0"
  evidence_refs:
    - ".agentplane/tasks/202610140430-6KP5DV/README.md"
    - ".agentplane/tasks/202610140430-6KP5DV/quality/20261014-045217260-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610140430-6KP5DV/quality/20261014-045217260-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610140430-6KP5DV/quality/20261014-045217260-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610140430-6KP5DV/blueprint/resolved-snapshot.json"
    - "apps/office/node_modules/.cache/parity-coverage/6KP5DV/proof.json"
    - "apps/office/node_modules/.cache/parity-coverage/6KP5DV/accepted-results.json"
    - "apps/office/node_modules/.cache/parity-coverage/6KP5DV/audit-results.json"
  findings:
    - "Pinned native constructor propagation matches original superclass and lower roots. Actual browser mouse allocation and paginator borrow their existing native owners; device geometry uses ordinary field assignment. Thirteen fixture migrations/23 expressions preserve all original tokens after only argument-placement reversal, 950 other old tests byte-identical, six canonical prefixes retained."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: restore native table/row/cell sibling-root contract and core/browser callers; remove geometry constructor adapter with token-preserving caller migrations. One ownership correction 4/10, three whole source modules 100% coverage."
events:
  -
    type: "status"
    at: "2026-10-14T04:32:12.515Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore native table/row/cell sibling-root contract and core/browser callers; remove geometry constructor adapter with token-preserving caller migrations. One ownership correction 4/10, three whole source modules 100% coverage."
  -
    type: "verify"
    at: "2026-10-14T04:51:38.262Z"
    author: "CODER"
    state: "ok"
    note: "14,304 unique accepted; three entire current production modules 100% four metrics and 1,806 positive raw counters. Thirteen caller fixtures preserve all original tokens; 950 other tests unchanged, six canonical prefixes/137 build files retained. All static and nine metadata gates pass. Evidence apps/office/node_modules/.cache/parity-coverage/6KP5DV/proof.json and accepted-results.json. Cycle 4/10; upcoming full continues, following full pauses."
doc_version: 3
doc_updated_at: "2026-10-14T04:51:38.324Z"
doc_updated_by: "CODER"
description: "Correction 4/10: remove browser geometry from SwTabFrame constructor, restore native sibling root propagation through table/row/cell constructors and actual core pagination and browser mouse callers. Ordinary JS property assignment for device geometry. Source-backed caller-only old test migrations preserve all assertions/data. No persistent-layout parity claim or new adapter/manager."
sections:
  Summary: "Restore original sibling-root constructor contracts across native table, row and cell frames."
  Scope: "Production three modules: apps/office/src/sw/source/core/layout/tabfrm.ts, apps/office/src/sw/source/core/layout/newfrm.ts, apps/office/src/sw/browser/editor/browser-writer-edit-window.ts. Six corresponding writer canonical runtime/provenance records. Fresh two native source/browser tests. Caller-only geometry assignment migrations in 12 existing tests: apps/office/src/sw/source/uibase/uiview/native-column-item-boundary.test.ts, apps/office/src/sw/source/uibase/uiview/native-row-item-boundary.test.ts, apps/office/src/sw/source/uibase/docvw/native-table-row-drag.test.ts, apps/office/src/sw/source/uibase/docvw/native-row-modifier-drag.test.ts, apps/office/src/sw/source/uibase/docvw/native-table-column-drag.test.ts, apps/office/src/sw/source/uibase/docvw/native-table-linear-drag.test.ts, apps/office/src/sw/source/uibase/docvw/native-table-proportional-drag.test.ts, apps/office/src/sw/source/uibase/docvw/native-ruler-ownership.test.ts, apps/office/src/sw/source/core/frmedt/native-table-mouse.test.ts, apps/office/src/sw/source/core/docnode/native-column-frame-normalization.test.ts, apps/office/src/sw/source/core/docnode/native-tabrows.test.ts, apps/office/src/sw/source/core/docnode/native-row-frame-size.test.ts. No other old acceptance edits. Scope follows one constructor/ownership contract, no persistent page/follow hierarchy claim. Required TS7 caller closure also includes apps/office/test-support/table-mouse.ts with identical constructor-only geometry assignment migration; 13 original fixture files total, no runtime scope expansion."
  Plan: "SwTabFrame(table,sibling?), SwRowFrame(line,sibling?), SwCellFrame(box,sibling?) forward the original root-bearing sibling to SwLayoutFrame. Table passes itself to rows and rows pass themselves to cells. Device mouseGeometry stays an explicit optional field, removed from native constructor; old fixture callers use standard Object.assign with the original geometry object instead. Core pagination passes its existing sibling and actual browser mouse allocation passes its existing shell layout. No new adapter, factory, state map or manager. Keep format/rows/cells and native lifetime/notifications unchanged otherwise."
  Verify Steps: "Inspect pinned tabfrm.cxx table/row/cell constructors and original SwFrame root propagation. Fresh actual native root, independent roots, detached defaults, original lower/root identities, notifications and destruction tests plus actual BrowserWriterEditWindow mouse allocation/reuse/history/root identity. Whole three current production modules original Istanbul 100% four metrics and positive counters; new+related once, tooling and current native table-column/row/modifier/browser regressions. Four reference symlinks physically absent and finally exactrestore for every producer. Scoped format/full lint/TS7/JSDoc/size/deps/build/static. Restored-reference nine metadata gates (source-tree/provenance/registry/resources--check/invariants/parity/routing/doctor/diff). For each old caller migration reverse only Object.assign(new SwTabFrame(table),{mouseGeometry:original}) to original new SwTabFrame(table,original), then require all scanner tokens equal including assertions/declarations/data; all other old tests byte-identical. Preserve canonical prefixes and input/build hashes. Same-agent non-independent quality and clean finish. Cycle 4/10: upcoming full continues, following full pauses after repairs."
  Verification: |-
    Command: ignored apps/office/node_modules/.cache/parity-coverage/6KP5DV/run.cjs exact recorded producers, physically absent four references with exact finally restoration; related Vitest and failed-only closure, tooling and six native table Chromium profiles; all static producers and audit.cjs nine restored-reference metadata gates. Result: pass. Evidence: 14,265 unique related scenarios in 542 files (14,264 initial pass; one new numeric fixture expectation corrected and failed-only case passes), 26 tooling, 13 Chromium; 14,304 unique accepted with no unresolved failures. Three entire current production modules: lines 832/832, statements 926/926, functions 134/134, branches 746/746; 1,806 positive original raw counters. Exact-definition standard whole current-source map merge retains both immutable raw maps, no counters/locations/exclusions/threshold changes. Full lint, final TS7/fresh lint/format, JSDoc, size, dependencies, build/static and nine metadata gates pass. All 950 other old tests byte-identical. Thirteen caller fixture files (12 tests and shared support) contain 23 geometry argument migrations: reverse only standard Object.assign geometry placement and all original scanner tokens including every assertion/declaration/data token are identical. Six canonical history/scalar/default/classification prefixes retained, 137 static files frozen, accepted source hashes/source pin verified in proof.json, accepted-results.json and audit-results.json.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-14T04:51:38.262Z — VERIFY — ok

    By: CODER

    Note: 14,304 unique accepted; three entire current production modules 100% four metrics and 1,806 positive raw counters. Thirteen caller fixtures preserve all original tokens; 950 other tests unchanged, six canonical prefixes/137 build files retained. All static and nine metadata gates pass. Evidence apps/office/node_modules/.cache/parity-coverage/6KP5DV/proof.json and accepted-results.json. Cycle 4/10; upcoming full continues, following full pauses.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-14T04:51:37.282Z, excerpt_hash=sha256:2f1622ae8939833e01b6d913259a8316585392e578495f0c09b6c7ed69fea9e6

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610140430-6KP5DV/blueprint/resolved-snapshot.json
    - old_digest: 507291a8ae3393f1b092622e200355fe02246ccfbdadd1c6616f06412274edb0
    - current_digest: 507291a8ae3393f1b092622e200355fe02246ccfbdadd1c6616f06412274edb0
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610140430-6KP5DV

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610140430-6KP5DV
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert scoped semantic commit without rewriting history. Four exact symlinks restored in finally; no source/helper/raw copies in Agentplane, no network/global access/publication/dependency setup."
  Findings: |-
    Writer clean at 062ce5b992d8 after correction 3/10. Pin 9bc445578031fecf56086729d8e4940c77e14d65. Original native constructors borrow a sibling into SwLayoutFrame to preserve actual root, passing table to its rows and row to its cells. Current table second argument is device geometry and lower constructors omit sibling, so actual table/lower frames have no root despite existing root-bearing SwFrame constructor. This is a source-backed prerequisite to native shared layout/UI frame ownership. Temporary per-render table frames and full persistent page/master/follow/paint/hit graph remain unresolved, not replaced by a parity claim. No suspicious core source logic observed; protected IO/recovery/Space unchanged.

    Completed native sibling-root ownership correction in three original modules. Table supplies itself to original rows and rows to cells; existing core paginator and actual mouse allocator borrow their original native root-bearing sibling. Removed second-argument device geometry contract; ordinary JS field assignment retains exact original measured objects without a new layer or factory. Required shared test-support caller identified by TS7 is included in the same contract migration. New pre-change tests show five genuine root identity failures, one detached-default pass, plus two initial new fixture errors (page descriptor input and width expectation); errors corrected without changing production behavior. Initial non-null assertions/JSDoc receiver count and page descriptor API corrected in fresh tests; final TS7/fresh lint/format pass. Related first final-code run has one fresh width expectation failure: full-aligned single current native column occupies 6,000 twips, not 3,000; only that failed case rerun. All original old acceptance semantics retained. Same-agent EVALUATOR phase is explicitly non-independent. Native headers require the sibling argument; represented absent sibling models the existing detached/null browser/test construction, not a claim of complete native constructor/default API parity. Native insert-content/follow constructors and full persistent page/master/follow/paint/hit graph remain unverified; temporary render/pagination frames remain unresolved. No suspicious source core logic observed. Cycle 4/10; upcoming full continues, following full pauses after repairs.
id_source: "generated"
---
## Summary

Restore original sibling-root constructor contracts across native table, row and cell frames.

## Scope

Production three modules: apps/office/src/sw/source/core/layout/tabfrm.ts, apps/office/src/sw/source/core/layout/newfrm.ts, apps/office/src/sw/browser/editor/browser-writer-edit-window.ts. Six corresponding writer canonical runtime/provenance records. Fresh two native source/browser tests. Caller-only geometry assignment migrations in 12 existing tests: apps/office/src/sw/source/uibase/uiview/native-column-item-boundary.test.ts, apps/office/src/sw/source/uibase/uiview/native-row-item-boundary.test.ts, apps/office/src/sw/source/uibase/docvw/native-table-row-drag.test.ts, apps/office/src/sw/source/uibase/docvw/native-row-modifier-drag.test.ts, apps/office/src/sw/source/uibase/docvw/native-table-column-drag.test.ts, apps/office/src/sw/source/uibase/docvw/native-table-linear-drag.test.ts, apps/office/src/sw/source/uibase/docvw/native-table-proportional-drag.test.ts, apps/office/src/sw/source/uibase/docvw/native-ruler-ownership.test.ts, apps/office/src/sw/source/core/frmedt/native-table-mouse.test.ts, apps/office/src/sw/source/core/docnode/native-column-frame-normalization.test.ts, apps/office/src/sw/source/core/docnode/native-tabrows.test.ts, apps/office/src/sw/source/core/docnode/native-row-frame-size.test.ts. No other old acceptance edits. Scope follows one constructor/ownership contract, no persistent page/follow hierarchy claim. Required TS7 caller closure also includes apps/office/test-support/table-mouse.ts with identical constructor-only geometry assignment migration; 13 original fixture files total, no runtime scope expansion.

## Plan

SwTabFrame(table,sibling?), SwRowFrame(line,sibling?), SwCellFrame(box,sibling?) forward the original root-bearing sibling to SwLayoutFrame. Table passes itself to rows and rows pass themselves to cells. Device mouseGeometry stays an explicit optional field, removed from native constructor; old fixture callers use standard Object.assign with the original geometry object instead. Core pagination passes its existing sibling and actual browser mouse allocation passes its existing shell layout. No new adapter, factory, state map or manager. Keep format/rows/cells and native lifetime/notifications unchanged otherwise.

## Verify Steps

Inspect pinned tabfrm.cxx table/row/cell constructors and original SwFrame root propagation. Fresh actual native root, independent roots, detached defaults, original lower/root identities, notifications and destruction tests plus actual BrowserWriterEditWindow mouse allocation/reuse/history/root identity. Whole three current production modules original Istanbul 100% four metrics and positive counters; new+related once, tooling and current native table-column/row/modifier/browser regressions. Four reference symlinks physically absent and finally exactrestore for every producer. Scoped format/full lint/TS7/JSDoc/size/deps/build/static. Restored-reference nine metadata gates (source-tree/provenance/registry/resources--check/invariants/parity/routing/doctor/diff). For each old caller migration reverse only Object.assign(new SwTabFrame(table),{mouseGeometry:original}) to original new SwTabFrame(table,original), then require all scanner tokens equal including assertions/declarations/data; all other old tests byte-identical. Preserve canonical prefixes and input/build hashes. Same-agent non-independent quality and clean finish. Cycle 4/10: upcoming full continues, following full pauses after repairs.

## Verification

Command: ignored apps/office/node_modules/.cache/parity-coverage/6KP5DV/run.cjs exact recorded producers, physically absent four references with exact finally restoration; related Vitest and failed-only closure, tooling and six native table Chromium profiles; all static producers and audit.cjs nine restored-reference metadata gates. Result: pass. Evidence: 14,265 unique related scenarios in 542 files (14,264 initial pass; one new numeric fixture expectation corrected and failed-only case passes), 26 tooling, 13 Chromium; 14,304 unique accepted with no unresolved failures. Three entire current production modules: lines 832/832, statements 926/926, functions 134/134, branches 746/746; 1,806 positive original raw counters. Exact-definition standard whole current-source map merge retains both immutable raw maps, no counters/locations/exclusions/threshold changes. Full lint, final TS7/fresh lint/format, JSDoc, size, dependencies, build/static and nine metadata gates pass. All 950 other old tests byte-identical. Thirteen caller fixture files (12 tests and shared support) contain 23 geometry argument migrations: reverse only standard Object.assign geometry placement and all original scanner tokens including every assertion/declaration/data token are identical. Six canonical history/scalar/default/classification prefixes retained, 137 static files frozen, accepted source hashes/source pin verified in proof.json, accepted-results.json and audit-results.json.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-14T04:51:38.262Z — VERIFY — ok

By: CODER

Note: 14,304 unique accepted; three entire current production modules 100% four metrics and 1,806 positive raw counters. Thirteen caller fixtures preserve all original tokens; 950 other tests unchanged, six canonical prefixes/137 build files retained. All static and nine metadata gates pass. Evidence apps/office/node_modules/.cache/parity-coverage/6KP5DV/proof.json and accepted-results.json. Cycle 4/10; upcoming full continues, following full pauses.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-14T04:51:37.282Z, excerpt_hash=sha256:2f1622ae8939833e01b6d913259a8316585392e578495f0c09b6c7ed69fea9e6

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610140430-6KP5DV/blueprint/resolved-snapshot.json
- old_digest: 507291a8ae3393f1b092622e200355fe02246ccfbdadd1c6616f06412274edb0
- current_digest: 507291a8ae3393f1b092622e200355fe02246ccfbdadd1c6616f06412274edb0
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610140430-6KP5DV

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610140430-6KP5DV
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert scoped semantic commit without rewriting history. Four exact symlinks restored in finally; no source/helper/raw copies in Agentplane, no network/global access/publication/dependency setup.

## Findings

Writer clean at 062ce5b992d8 after correction 3/10. Pin 9bc445578031fecf56086729d8e4940c77e14d65. Original native constructors borrow a sibling into SwLayoutFrame to preserve actual root, passing table to its rows and row to its cells. Current table second argument is device geometry and lower constructors omit sibling, so actual table/lower frames have no root despite existing root-bearing SwFrame constructor. This is a source-backed prerequisite to native shared layout/UI frame ownership. Temporary per-render table frames and full persistent page/master/follow/paint/hit graph remain unresolved, not replaced by a parity claim. No suspicious core source logic observed; protected IO/recovery/Space unchanged.

Completed native sibling-root ownership correction in three original modules. Table supplies itself to original rows and rows to cells; existing core paginator and actual mouse allocator borrow their original native root-bearing sibling. Removed second-argument device geometry contract; ordinary JS field assignment retains exact original measured objects without a new layer or factory. Required shared test-support caller identified by TS7 is included in the same contract migration. New pre-change tests show five genuine root identity failures, one detached-default pass, plus two initial new fixture errors (page descriptor input and width expectation); errors corrected without changing production behavior. Initial non-null assertions/JSDoc receiver count and page descriptor API corrected in fresh tests; final TS7/fresh lint/format pass. Related first final-code run has one fresh width expectation failure: full-aligned single current native column occupies 6,000 twips, not 3,000; only that failed case rerun. All original old acceptance semantics retained. Same-agent EVALUATOR phase is explicitly non-independent. Native headers require the sibling argument; represented absent sibling models the existing detached/null browser/test construction, not a claim of complete native constructor/default API parity. Native insert-content/follow constructors and full persistent page/master/follow/paint/hit graph remain unverified; temporary render/pagination frames remain unresolved. No suspicious source core logic observed. Cycle 4/10; upcoming full continues, following full pauses after repairs.
