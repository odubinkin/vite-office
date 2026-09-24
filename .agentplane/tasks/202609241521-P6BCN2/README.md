---
id: "202609241521-P6BCN2"
title: "Close certification ODT whole-document acceptance"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on:
  - "202609241521-Q9V21Y"
tags:
  - "code"
task_kind: "code"
mutation_scope: "code"
verify:
  - "Run private sample acceptance and representative upstream ODT matrix; record semantic deltas, warning categories and UI persistence."
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-24T15:23:17.972Z"
  updated_by: "ORCHESTRATOR"
  note: "User requested implementation of the seven ordered phases in docs/program/certification-odt-import-plan.md; outside-repo sample access remains pending separate authorization."
verification:
  state: "ok"
  updated_at: "2026-09-24T22:35:16.551Z"
  updated_by: "CODER"
  note: "npm run verify passed: 537 app tests at 100% coverage, 109 inventory tests, 15 Chromium e2e and all static/docs/source checks. Pinned phase 0-5 ODT matrix and source-backed table service test passed. Authorized private ODT Open/edit/Export/reopen in fresh Chromium sessions retained 59 body paragraphs and runs, 5 rows/15 cells, 8 bookmarks, 8 paragraph/cell breaks, table-owned break, and page geometry; second saved package was byte-identical. One browser warning summarizes 260 detailed unsupported declarations in 119 contexts; remaining style and list omissions are documented."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-24T22:35:31.959Z"
  updated_by: "EVALUATOR"
  note: "Whole-document certification ODT acceptance satisfies the bounded compatibility gate."
  evaluated_sha: "f935dc55783479e9914de7a959c2de6af8a7fd59"
  blueprint_digest: "9619eb0eb05dbd5981d1d8fa17b3642ef6763359fe9407991d39d6329dba0bb5"
  evidence_refs:
    - ".agentplane/tasks/202609241521-P6BCN2/README.md"
    - ".agentplane/tasks/202609241521-P6BCN2/quality/20260924-223531959-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609241521-P6BCN2/quality/20260924-223531959-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609241521-P6BCN2/quality/20260924-223531959-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609241521-P6BCN2/blueprint/resolved-snapshot.json"
    - "docs/program/certification-odt-acceptance.md"
    - "apps/office/e2e/writer-odt-file.spec.ts"
    - "apps/office/src/sw/source/filter/xml/odt-filter-service.test.ts"
    - "npm-run-verify"
  findings:
    - "Fresh Chromium import/edit/export/reopen retained source body text and runs, nonedited cells, bookmarks, logical breaks and page geometry; second save was byte-identical. Pinned ODT matrix and full verify pass. Remaining 260 unsupported declarations are explicitly classified, summarized once in the browser, and documented without claiming complete LibreOffice layout parity."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: close whole-document ODT acceptance and compatibility contract."
events:
  -
    type: "status"
    at: "2026-09-24T22:04:02.244Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: close whole-document ODT acceptance and compatibility contract."
  -
    type: "verify"
    at: "2026-09-24T22:35:16.551Z"
    author: "CODER"
    state: "ok"
    note: "npm run verify passed: 537 app tests at 100% coverage, 109 inventory tests, 15 Chromium e2e and all static/docs/source checks. Pinned phase 0-5 ODT matrix and source-backed table service test passed. Authorized private ODT Open/edit/Export/reopen in fresh Chromium sessions retained 59 body paragraphs and runs, 5 rows/15 cells, 8 bookmarks, 8 paragraph/cell breaks, table-owned break, and page geometry; second saved package was byte-identical. One browser warning summarizes 260 detailed unsupported declarations in 119 contexts; remaining style and list omissions are documented."
doc_version: 3
doc_updated_at: "2026-09-24T22:35:16.610Z"
doc_updated_by: "CODER"
description: "Phase 6: private sample Open/render/edit/Save As/reopen acceptance, upstream fixture matrix and documented ODT contract/parity limitations."
sections:
  Summary: |-
    Close certification ODT whole-document acceptance

    Phase 6: private sample Open/render/edit/Save As/reopen acceptance, upstream fixture matrix and documented ODT contract/parity limitations.
  Scope: "Whole-document private sample and upstream fixture matrix acceptance, UI persistence, ODT contract and parity documentation."
  Plan: |-
    1. Run Open/render/edit/Save As/reopen on the private sample and representative pinned ODTs.
    2. Compare the phase 0 semantic inventory and classified diagnostics.
    3. Inspect/edit imported settings through dialogs; save and reopen.
    4. Update ODT contract, parity matrix and user-facing limitations with verified evidence.
  Verify Steps: |-
    1. `npm run verify` passes.
    2. Representative pinned fixtures from phases 0–5 and private sample pass the acceptance commands with exact results recorded.
    3. No uncaught errors, repetitive expected-feature warnings or lost text/cells; supported semantic inventory remains stable across repeated save/reopen.
    4. All remaining omissions have targeted tests or explicit follow-up, and docs match verified behavior.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-24T22:35:16.551Z — VERIFY — ok

    By: CODER

    Note: npm run verify passed: 537 app tests at 100% coverage, 109 inventory tests, 15 Chromium e2e and all static/docs/source checks. Pinned phase 0-5 ODT matrix and source-backed table service test passed. Authorized private ODT Open/edit/Export/reopen in fresh Chromium sessions retained 59 body paragraphs and runs, 5 rows/15 cells, 8 bookmarks, 8 paragraph/cell breaks, table-owned break, and page geometry; second saved package was byte-identical. One browser warning summarizes 260 detailed unsupported declarations in 119 contexts; remaining style and list omissions are documented.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T22:04:02.244Z, excerpt_hash=sha256:f199445b406fbba5b3771c21fb542f938a79e934d8cf730859dafda6cd2425bf

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609241521-P6BCN2/blueprint/resolved-snapshot.json
    - old_digest: 9619eb0eb05dbd5981d1d8fa17b3642ef6763359fe9407991d39d6329dba0bb5
    - current_digest: 9619eb0eb05dbd5981d1d8fa17b3642ef6763359fe9407991d39d6329dba0bb5
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609241521-P6BCN2

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609241521-P6BCN2
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

Close certification ODT whole-document acceptance

Phase 6: private sample Open/render/edit/Save As/reopen acceptance, upstream fixture matrix and documented ODT contract/parity limitations.

## Scope

Whole-document private sample and upstream fixture matrix acceptance, UI persistence, ODT contract and parity documentation.

## Plan

1. Run Open/render/edit/Save As/reopen on the private sample and representative pinned ODTs.
2. Compare the phase 0 semantic inventory and classified diagnostics.
3. Inspect/edit imported settings through dialogs; save and reopen.
4. Update ODT contract, parity matrix and user-facing limitations with verified evidence.

## Verify Steps

1. `npm run verify` passes.
2. Representative pinned fixtures from phases 0–5 and private sample pass the acceptance commands with exact results recorded.
3. No uncaught errors, repetitive expected-feature warnings or lost text/cells; supported semantic inventory remains stable across repeated save/reopen.
4. All remaining omissions have targeted tests or explicit follow-up, and docs match verified behavior.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-24T22:35:16.551Z — VERIFY — ok

By: CODER

Note: npm run verify passed: 537 app tests at 100% coverage, 109 inventory tests, 15 Chromium e2e and all static/docs/source checks. Pinned phase 0-5 ODT matrix and source-backed table service test passed. Authorized private ODT Open/edit/Export/reopen in fresh Chromium sessions retained 59 body paragraphs and runs, 5 rows/15 cells, 8 bookmarks, 8 paragraph/cell breaks, table-owned break, and page geometry; second saved package was byte-identical. One browser warning summarizes 260 detailed unsupported declarations in 119 contexts; remaining style and list omissions are documented.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T22:04:02.244Z, excerpt_hash=sha256:f199445b406fbba5b3771c21fb542f938a79e934d8cf730859dafda6cd2425bf

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609241521-P6BCN2/blueprint/resolved-snapshot.json
- old_digest: 9619eb0eb05dbd5981d1d8fa17b3642ef6763359fe9407991d39d6329dba0bb5
- current_digest: 9619eb0eb05dbd5981d1d8fa17b3642ef6763359fe9407991d39d6329dba0bb5
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609241521-P6BCN2

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609241521-P6BCN2
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
