---
id: "202609241521-Q9V21Y"
title: "Implement canonical Writer table slice"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on:
  - "202609241521-GAQ2CN"
tags:
  - "code"
task_kind: "code"
mutation_scope: "code"
verify:
  - "Run pinned table ODT fixtures, structural round trip, paragraph/list regression and UI table edit/reopen tests."
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-24T15:23:17.580Z"
  updated_by: "ORCHESTRATOR"
  note: "User requested implementation of the seven ordered phases in docs/program/certification-odt-import-plan.md; outside-repo sample access remains pending separate authorization."
verification:
  state: "ok"
  updated_at: "2026-09-24T22:02:48.933Z"
  updated_by: "CODER"
  note: "verified-202609241521-Q9V21Y"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-24T22:03:02.669Z"
  updated_by: "EVALUATOR"
  note: "Canonical table slice meets the supported phase-5 scope and full repository verification passes."
  evaluated_sha: "21b8e80e250b83526cc049d349e6459c4573a97b"
  blueprint_digest: "3f39ee7d95b14f8f0b6f84c642f8d345e3c2c9765faede0b02c52f9d508feb49"
  evidence_refs:
    - ".agentplane/tasks/202609241521-Q9V21Y/README.md"
    - ".agentplane/tasks/202609241521-Q9V21Y/quality/20260924-220302669-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609241521-Q9V21Y/quality/20260924-220302669-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609241521-Q9V21Y/quality/20260924-220302669-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609241521-Q9V21Y/blueprint/resolved-snapshot.json"
    - "apps/office/src/sw/source/filter/xml/odt-table-roundtrip.test.ts"
    - "apps/office/src/sw/browser/presentation/WriterTableDialog.test.tsx"
    - "docs/program/certification-odt-table-parity.md"
    - "npm-run-verify"
  findings:
    - "Pinned tdf132642_keepWithNextTable.odt replaced unsuitable candidates after source inspection; structural, Worker and UI roundtrips are covered. Private acceptance retained 5 rows, 15 cells and all three table-owned breaks. Row pagination and merged cells remain documented limits."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-09-24T21:06:27.585Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-09-24T22:02:41.922Z"
    author: "CODER"
    state: "ok"
    note: "npm run verify passed: 536 app tests, inventory coverage, 14 browser e2e, static/docs/source checks. Pinned tdf132642_keepWithNextTable.odt structural import/export/reimport and UI insert/edit/reopen pass. The two planned candidates were unsuitable (one has no table; the other requires merged cells), so the pinned replacement is documented. Authorized private ODT: one table, 5 rows, 15 cells, 3 table-owned breaks retained through Worker and ODT roundtrip."
  -
    type: "verify"
    at: "2026-09-24T22:02:48.933Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609241521-Q9V21Y"
doc_version: 3
doc_updated_at: "2026-09-24T22:02:48.984Z"
doc_updated_by: "CODER"
description: "Phase 5: upstream-shaped SwTable rows/cells/styles, layout/editing, Worker transfer, export and table UI."
sections:
  Summary: |-
    Implement canonical Writer table slice

    Phase 5: upstream-shaped SwTable rows/cells/styles, layout/editing, Worker transfer, export and table UI.
  Scope: "Canonical SwTable rows/cells/styles in document order, import/export, Worker transfer, browser layout/editing and table UI."
  Plan: |-
    1. Model ordered table rows/cells/paragraphs using pinned Writer node ownership.
    2. Import table elements and observed width/height/padding/border/alignment properties.
    3. Render/edit/select and transfer/export from the same model.
    4. Add Insert Table, Table Properties and contextual controls, then run source-backed and UI tests.
  Verify Steps: |-
    1. `npm run verify` passes.
    2. `tdf41542_borderlessPadding.odt` and `IndexingExport_Tables.odt` tests assert cell order/styles and structural export/reimport.
    3. UI tests insert a table, edit row/column/cell properties and reopen.
    4. Private sample has exactly five rows and fifteen cells with ordered content; paragraph/list regressions pass.
    5. The three table-owned soft page breaks in the private sample retain their logical table/cell positions through import/export/reimport.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-24T22:02:41.922Z — VERIFY — ok

    By: CODER

    Note: npm run verify passed: 536 app tests, inventory coverage, 14 browser e2e, static/docs/source checks. Pinned tdf132642_keepWithNextTable.odt structural import/export/reimport and UI insert/edit/reopen pass. The two planned candidates were unsuitable (one has no table; the other requires merged cells), so the pinned replacement is documented. Authorized private ODT: one table, 5 rows, 15 cells, 3 table-owned breaks retained through Worker and ODT roundtrip.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T21:06:27.585Z, excerpt_hash=sha256:be487fbfc16303b8b922e6fb3054189d49f1531214af71c17f64e3b451fb1428

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609241521-Q9V21Y/blueprint/resolved-snapshot.json
    - old_digest: 3f39ee7d95b14f8f0b6f84c642f8d345e3c2c9765faede0b02c52f9d508feb49
    - current_digest: 3f39ee7d95b14f8f0b6f84c642f8d345e3c2c9765faede0b02c52f9d508feb49
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609241521-Q9V21Y

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609241521-Q9V21Y
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    ### 2026-09-24T22:02:48.933Z — VERIFY — ok

    By: CODER

    Note: verified-202609241521-Q9V21Y
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T22:02:41.980Z, excerpt_hash=sha256:be487fbfc16303b8b922e6fb3054189d49f1531214af71c17f64e3b451fb1428

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609241521-Q9V21Y/blueprint/resolved-snapshot.json
    - old_digest: 3f39ee7d95b14f8f0b6f84c642f8d345e3c2c9765faede0b02c52f9d508feb49
    - current_digest: 3f39ee7d95b14f8f0b6f84c642f8d345e3c2c9765faede0b02c52f9d508feb49
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609241521-Q9V21Y

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609241521-Q9V21Y --result verified-202609241521-Q9V21Y --commit 21b8e80e250b83526cc049d349e6459c4573a97b
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: ""
id_source: "generated"
---
## Summary

Implement canonical Writer table slice

Phase 5: upstream-shaped SwTable rows/cells/styles, layout/editing, Worker transfer, export and table UI.

## Scope

Canonical SwTable rows/cells/styles in document order, import/export, Worker transfer, browser layout/editing and table UI.

## Plan

1. Model ordered table rows/cells/paragraphs using pinned Writer node ownership.
2. Import table elements and observed width/height/padding/border/alignment properties.
3. Render/edit/select and transfer/export from the same model.
4. Add Insert Table, Table Properties and contextual controls, then run source-backed and UI tests.

## Verify Steps

1. `npm run verify` passes.
2. `tdf41542_borderlessPadding.odt` and `IndexingExport_Tables.odt` tests assert cell order/styles and structural export/reimport.
3. UI tests insert a table, edit row/column/cell properties and reopen.
4. Private sample has exactly five rows and fifteen cells with ordered content; paragraph/list regressions pass.
5. The three table-owned soft page breaks in the private sample retain their logical table/cell positions through import/export/reimport.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-24T22:02:41.922Z — VERIFY — ok

By: CODER

Note: npm run verify passed: 536 app tests, inventory coverage, 14 browser e2e, static/docs/source checks. Pinned tdf132642_keepWithNextTable.odt structural import/export/reimport and UI insert/edit/reopen pass. The two planned candidates were unsuitable (one has no table; the other requires merged cells), so the pinned replacement is documented. Authorized private ODT: one table, 5 rows, 15 cells, 3 table-owned breaks retained through Worker and ODT roundtrip.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T21:06:27.585Z, excerpt_hash=sha256:be487fbfc16303b8b922e6fb3054189d49f1531214af71c17f64e3b451fb1428

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609241521-Q9V21Y/blueprint/resolved-snapshot.json
- old_digest: 3f39ee7d95b14f8f0b6f84c642f8d345e3c2c9765faede0b02c52f9d508feb49
- current_digest: 3f39ee7d95b14f8f0b6f84c642f8d345e3c2c9765faede0b02c52f9d508feb49
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609241521-Q9V21Y

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609241521-Q9V21Y
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

### 2026-09-24T22:02:48.933Z — VERIFY — ok

By: CODER

Note: verified-202609241521-Q9V21Y
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T22:02:41.980Z, excerpt_hash=sha256:be487fbfc16303b8b922e6fb3054189d49f1531214af71c17f64e3b451fb1428

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609241521-Q9V21Y/blueprint/resolved-snapshot.json
- old_digest: 3f39ee7d95b14f8f0b6f84c642f8d345e3c2c9765faede0b02c52f9d508feb49
- current_digest: 3f39ee7d95b14f8f0b6f84c642f8d345e3c2c9765faede0b02c52f9d508feb49
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609241521-Q9V21Y

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609241521-Q9V21Y --result verified-202609241521-Q9V21Y --commit 21b8e80e250b83526cc049d349e6459c4573a97b
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
