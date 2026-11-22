---
id: "202611220247-KQ341H"
title: "Align Calc ODS master-page headers and footers"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on:
  - "202611220216-0YJAN7"
tags:
  - "calc"
  - "code"
  - "ods"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-22T02:47:50.928Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-22T02:59:47.744Z"
  updated_by: "CODER"
  note: "All 43 focused Calc tests and static checks passed. Pinned ODS, native header/footer layouts, original variant ordering and Calc Worker round trips verified."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-22T02:59:56.502Z"
  updated_by: "EVALUATOR"
  note: "Native Calc ODS header/footer child order, item groups and Worker round trips verified."
  evaluated_sha: "33821146405ab6fce26b9e471d0bc9a69538c368"
  blueprint_digest: "3ec6169932848083376a81724cdac3536d0eab62d4c130ec34f0eae59190bc44"
  evidence_refs:
    - ".agentplane/tasks/202611220247-KQ341H/README.md"
    - ".agentplane/tasks/202611220247-KQ341H/quality/20261122-025956502-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611220247-KQ341H/quality/20261122-025956502-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611220247-KQ341H/quality/20261122-025956502-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611220247-KQ341H/blueprint/resolved-snapshot.json"
    - "output/playwright/calc-ods-header-footer/verification.md"
  findings:
    - "All 43 related Calc tests passed on final sources, including the original LibreOffice ODS witness and directly affected XLSX page-layout path."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-11-22T02:48:46.420Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-11-22T02:59:47.744Z"
    author: "CODER"
    state: "ok"
    note: "All 43 focused Calc tests and static checks passed. Pinned ODS, native header/footer layouts, original variant ordering and Calc Worker round trips verified."
doc_version: 3
doc_updated_at: "2026-11-22T02:59:47.794Z"
doc_updated_by: "CODER"
description: "Preserve native page-style header/footer variants, regions and dimensions through Calc ODS and Worker, including source fixture regressions."
sections:
  Summary: "Align Calc's ODF master-page header/footer text, visibility and page-layout item handling with the pinned LibreOffice implementation."
  Scope: |-
    - Use Calc's original right, left and first header/footer variants, native content regions and sharing flags. Match center-only and empty region emission, including hidden variants with stored content.
    - Apply the page-layout mapper to the original nested height, body distance, margins, background color, border and padding items. Reuse Calc's native page box mapper. Preserve authored and default values through the ODS stream and the Calc Worker style path.
    - Port the applicable pinned Calc ODS header/footer regression. Keep the scope on the existing page style and EditEngine field profile.
  Plan: "Trace pinned master-page text, layout and UNO setters; implement native header/footer region and nested item rules; verify original ODS fixtures and Worker transfer."
  Verify Steps: |-
    - Run focused Calc ODS page master, header/footer and native page-item tests plus directly affected Worker and page-style editor tests.
    - Run scoped ESLint and Prettier, Office typecheck, module boundaries, source provenance, Calc registry invariants, routing, AgentPlane doctor and git diff checks.
    - Record deterministic verification and refresh the graph at closeout. This is the ninth task in the next ten-task regression cadence.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-22T02:59:47.744Z — VERIFY — ok

    By: CODER

    Note: All 43 focused Calc tests and static checks passed. Pinned ODS, native header/footer layouts, original variant ordering and Calc Worker round trips verified.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-22T02:48:46.420Z, excerpt_hash=sha256:3a3af7e0af2e9f64adc2c9828966b9643d8af6972a56e43654d469d17ab29cf4

    Details:

    # Calc ODS master-page headers and footers

    Implementation commits `8ec156cbf` and `33821146405a` align the Calc master-page child gate and page-style reset, regional content emission, nested height/distance, margins, brush color, border and padding. The Calc Worker uses the same native page-style XML format. Calc issues CALC-821 and CALC-822 document the reproduced height and variant admission rules.

    The original `header-footer-content.ods` fixture exercises the four right and first page text assertions from `testHeaderFooterContentODS` plus the original Report style layout. Separate cases cover scope-specific native items, a hidden left footer, empty region omission, same-style reimport and unexpected variant order. The focused fixture and page-settings replay passed 24 tests in two files after the source-backed default-state correction.

    Office typecheck, scoped ESLint and Prettier, module boundaries, source provenance, Calc registry invariants, routing, AgentPlane doctor and git diff checks passed. AgentPlane doctor reported the existing managed hook shim warning.

    The final Calc verification passed all 43 tests in seven selected files, including the native ODS witness, ODS and XLSX page settings, page-style editor and header/footer controls.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611220247-KQ341H/blueprint/resolved-snapshot.json
    - old_digest: 3ec6169932848083376a81724cdac3536d0eab62d4c130ec34f0eae59190bc44
    - current_digest: 3ec6169932848083376a81724cdac3536d0eab62d4c130ec34f0eae59190bc44
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611220247-KQ341H

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611220247-KQ341H
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert this task's code and provenance commits and rerun the focused Calc page-style and header/footer tests."
  Findings: ""
id_source: "generated"
---
## Summary

Align Calc's ODF master-page header/footer text, visibility and page-layout item handling with the pinned LibreOffice implementation.

## Scope

- Use Calc's original right, left and first header/footer variants, native content regions and sharing flags. Match center-only and empty region emission, including hidden variants with stored content.
- Apply the page-layout mapper to the original nested height, body distance, margins, background color, border and padding items. Reuse Calc's native page box mapper. Preserve authored and default values through the ODS stream and the Calc Worker style path.
- Port the applicable pinned Calc ODS header/footer regression. Keep the scope on the existing page style and EditEngine field profile.

## Plan

Trace pinned master-page text, layout and UNO setters; implement native header/footer region and nested item rules; verify original ODS fixtures and Worker transfer.

## Verify Steps

- Run focused Calc ODS page master, header/footer and native page-item tests plus directly affected Worker and page-style editor tests.
- Run scoped ESLint and Prettier, Office typecheck, module boundaries, source provenance, Calc registry invariants, routing, AgentPlane doctor and git diff checks.
- Record deterministic verification and refresh the graph at closeout. This is the ninth task in the next ten-task regression cadence.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-22T02:59:47.744Z — VERIFY — ok

By: CODER

Note: All 43 focused Calc tests and static checks passed. Pinned ODS, native header/footer layouts, original variant ordering and Calc Worker round trips verified.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-22T02:48:46.420Z, excerpt_hash=sha256:3a3af7e0af2e9f64adc2c9828966b9643d8af6972a56e43654d469d17ab29cf4

Details:

# Calc ODS master-page headers and footers

Implementation commits `8ec156cbf` and `33821146405a` align the Calc master-page child gate and page-style reset, regional content emission, nested height/distance, margins, brush color, border and padding. The Calc Worker uses the same native page-style XML format. Calc issues CALC-821 and CALC-822 document the reproduced height and variant admission rules.

The original `header-footer-content.ods` fixture exercises the four right and first page text assertions from `testHeaderFooterContentODS` plus the original Report style layout. Separate cases cover scope-specific native items, a hidden left footer, empty region omission, same-style reimport and unexpected variant order. The focused fixture and page-settings replay passed 24 tests in two files after the source-backed default-state correction.

Office typecheck, scoped ESLint and Prettier, module boundaries, source provenance, Calc registry invariants, routing, AgentPlane doctor and git diff checks passed. AgentPlane doctor reported the existing managed hook shim warning.

The final Calc verification passed all 43 tests in seven selected files, including the native ODS witness, ODS and XLSX page settings, page-style editor and header/footer controls.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611220247-KQ341H/blueprint/resolved-snapshot.json
- old_digest: 3ec6169932848083376a81724cdac3536d0eab62d4c130ec34f0eae59190bc44
- current_digest: 3ec6169932848083376a81724cdac3536d0eab62d4c130ec34f0eae59190bc44
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611220247-KQ341H

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611220247-KQ341H
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert this task's code and provenance commits and rerun the focused Calc page-style and header/footer tests.

## Findings
