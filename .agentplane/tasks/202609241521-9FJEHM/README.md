---
id: "202609241521-9FJEHM"
title: "Add canonical inline bookmarks and soft page breaks"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on:
  - "202609241521-D5QMQG"
tags:
  - "code"
task_kind: "code"
mutation_scope: "code"
verify:
  - "Run pinned bookmark, hyperlink and soft-page-break ODT fixtures plus UI create/navigate/rename/remove and save/reopen tests."
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-24T15:23:16.683Z"
  updated_by: "ORCHESTRATOR"
  note: "User requested implementation of the seven ordered phases in docs/program/certification-odt-import-plan.md; outside-repo sample access remains pending separate authorization."
verification:
  state: "ok"
  updated_at: "2026-09-24T20:19:33.070Z"
  updated_by: "CODER"
  note: "Full verify and approved phase-3 private sample gate passed; table-owned breaks assigned to phase 5."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-24T20:19:42.550Z"
  updated_by: "EVALUATOR"
  note: "Phase-3 inline marker implementation matches the approved bounded Writer scope and all declared checks pass."
  evaluated_sha: "bc5370b27280355d941863014cf46029688c8fec"
  blueprint_digest: "bc0e6901ec7f00e195372e7fc893b38ae197a3ea79c7115680003f55a95bfcb8"
  evidence_refs:
    - ".agentplane/tasks/202609241521-9FJEHM/README.md"
    - ".agentplane/tasks/202609241521-9FJEHM/quality/20260924-201942550-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609241521-9FJEHM/quality/20260924-201942550-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609241521-9FJEHM/quality/20260924-201942550-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609241521-9FJEHM/blueprint/resolved-snapshot.json"
    - ".agentplane/tmp/phase3-verify.log"
    - "docs/program/certification-odt-inline-marker-parity.md"
    - "2e183a1"
  findings:
    - "Document-owned marks and soft pagination hints retain positions through edits, Worker transfer and ODT reimport; bookmark and break UI paths are tested."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-09-24T17:32:25.378Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-09-24T20:19:33.070Z"
    author: "CODER"
    state: "ok"
    note: "Full verify and approved phase-3 private sample gate passed; table-owned breaks assigned to phase 5."
doc_version: 3
doc_updated_at: "2026-09-24T20:19:33.118Z"
doc_updated_by: "CODER"
description: "Phase 3: Writer mark/hint state, nested links, Worker transfer, export and bookmark/break UI controls."
sections:
  Summary: |-
    Add canonical inline bookmarks and soft page breaks

    Phase 3: Writer mark/hint state, nested links, Worker transfer, export and bookmark/break UI controls.
  Scope: "Canonical bookmark positions, soft page-break hints and nested links; Worker transfer, export, rendering and bookmark/break/hyperlink UI."
  Plan: |-
    1. Match pinned Writer text-context and mark ownership behavior.
    2. Add mark/hint state and stable edit/transfer/export positions.
    3. Add bookmark insert/edit/navigation and applicable break controls.
    4. Test pinned upstream fixtures, synthetic edge cases and UI round trips.
  Verify Steps: |-
    1. `npm run verify` passes.
    2. `collapsed_bookmark.odt`, `hyperlink.odt` and `tdf94882.odt` tests assert ranges/targets/positions through reimport.
    3. UI tests create, navigate, rename and remove bookmarks and exercise break/hyperlink controls.
    4. Private sample retains eight bookmarks and six body-paragraph soft breaks at logical positions; record diagnostics and deltas. The three table-owned soft breaks move to phase 5 by user approval.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-24T20:19:33.070Z — VERIFY — ok

    By: CODER

    Note: Full verify and approved phase-3 private sample gate passed; table-owned breaks assigned to phase 5.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T20:18:50.862Z, excerpt_hash=sha256:da82fcbd2fe2874155701a72d279e1d0fa1c1363c93eb7e29585f729e00ee47e

    Details:

    Command: npm run verify
    Result: pass
    Evidence: 506/506 application tests and 109/109 inventory tests passed with 100% statement, branch, function and line coverage; 14/14 browser tests passed; build, formatting, lint, types, docs, source provenance, module boundaries, static build and parity checks passed.
    Scope: Writer inline markers, bookmark/break UI, upstream fixtures, inventory and generated resources.
    Command: local private certification ODT import -> export -> reimport diagnostic
    Result: pass for approved phase-3 gate
    Evidence: 8 bookmarks and 6 body-paragraph soft breaks retained exact paragraph/UTF-16 positions; paragraph/link projections 59/14; warning occurrences declined from 393 to 371. Three table-owned soft breaks are explicitly assigned to phase 5 by user approval.
    Scope: private sample, read locally only; never tracked as a test fixture.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609241521-9FJEHM/blueprint/resolved-snapshot.json
    - old_digest: bc0e6901ec7f00e195372e7fc893b38ae197a3ea79c7115680003f55a95bfcb8
    - current_digest: bc0e6901ec7f00e195372e7fc893b38ae197a3ea79c7115680003f55a95bfcb8
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609241521-9FJEHM

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609241521-9FJEHM
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: ""
id_source: "generated"
---
## Summary

Add canonical inline bookmarks and soft page breaks

Phase 3: Writer mark/hint state, nested links, Worker transfer, export and bookmark/break UI controls.

## Scope

Canonical bookmark positions, soft page-break hints and nested links; Worker transfer, export, rendering and bookmark/break/hyperlink UI.

## Plan

1. Match pinned Writer text-context and mark ownership behavior.
2. Add mark/hint state and stable edit/transfer/export positions.
3. Add bookmark insert/edit/navigation and applicable break controls.
4. Test pinned upstream fixtures, synthetic edge cases and UI round trips.

## Verify Steps

1. `npm run verify` passes.
2. `collapsed_bookmark.odt`, `hyperlink.odt` and `tdf94882.odt` tests assert ranges/targets/positions through reimport.
3. UI tests create, navigate, rename and remove bookmarks and exercise break/hyperlink controls.
4. Private sample retains eight bookmarks and six body-paragraph soft breaks at logical positions; record diagnostics and deltas. The three table-owned soft breaks move to phase 5 by user approval.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-24T20:19:33.070Z — VERIFY — ok

By: CODER

Note: Full verify and approved phase-3 private sample gate passed; table-owned breaks assigned to phase 5.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T20:18:50.862Z, excerpt_hash=sha256:da82fcbd2fe2874155701a72d279e1d0fa1c1363c93eb7e29585f729e00ee47e

Details:

Command: npm run verify
Result: pass
Evidence: 506/506 application tests and 109/109 inventory tests passed with 100% statement, branch, function and line coverage; 14/14 browser tests passed; build, formatting, lint, types, docs, source provenance, module boundaries, static build and parity checks passed.
Scope: Writer inline markers, bookmark/break UI, upstream fixtures, inventory and generated resources.
Command: local private certification ODT import -> export -> reimport diagnostic
Result: pass for approved phase-3 gate
Evidence: 8 bookmarks and 6 body-paragraph soft breaks retained exact paragraph/UTF-16 positions; paragraph/link projections 59/14; warning occurrences declined from 393 to 371. Three table-owned soft breaks are explicitly assigned to phase 5 by user approval.
Scope: private sample, read locally only; never tracked as a test fixture.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609241521-9FJEHM/blueprint/resolved-snapshot.json
- old_digest: bc0e6901ec7f00e195372e7fc893b38ae197a3ea79c7115680003f55a95bfcb8
- current_digest: bc0e6901ec7f00e195372e7fc893b38ae197a3ea79c7115680003f55a95bfcb8
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609241521-9FJEHM

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609241521-9FJEHM
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
