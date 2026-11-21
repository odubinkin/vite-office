---
id: "202611211736-V4SBB6"
title: "Align Calc ODS named ranges and expressions with LibreOffice"
result_summary: "Aligned named range and expression grammar, base addresses, flags and XML export with LibreOffice."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T17:36:30.885Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-21T17:46:17.347Z"
  updated_by: "CODER"
  note: "Verified native Calc ODS named range and expression import, reference typing and export."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-21T17:46:17.962Z"
  updated_by: "EVALUATOR"
  note: "ODS named definitions use the native name, address, formula and token owners."
  evaluated_sha: "694877f423755ec2e26538b0fbeeedbebdb3e0e2"
  blueprint_digest: "5be1dc266426120cd4e1e368dd6a7119816b4a96a6f242505951632f5c1b26dd"
  evidence_refs:
    - ".agentplane/tasks/202611211736-V4SBB6/README.md"
    - ".agentplane/tasks/202611211736-V4SBB6/quality/20261121-174617962-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611211736-V4SBB6/quality/20261121-174617962-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611211736-V4SBB6/quality/20261121-174617962-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611211736-V4SBB6/blueprint/resolved-snapshot.json"
    - "output/playwright/V4SBB6/calc.log"
    - "output/playwright/V4SBB6/names-final.log"
    - "output/playwright/V4SBB6/types-final.log"
    - "output/playwright/V4SBB6/provenance.log"
  findings:
    - "Pinned hidden and global fixtures, Worker transfer and cross-sheet endpoints confirm name scope and serialization."
commit:
  hash: "694877f423755ec2e26538b0fbeeedbebdb3e0e2"
  message: "🧩 V4SBB6 code: align Calc ODS named definitions"
comments:
  -
    author: "CODER"
    body: "Start: port native named definitions across ODS parsing, formula compilation and export."
  -
    author: "CODER"
    body: "Verified: native Calc named definitions through original ODS fixtures, scoped Calc suites, Worker transfer and package reopening."
events:
  -
    type: "status"
    at: "2026-11-21T17:36:35.241Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port native named definitions across ODS parsing, formula compilation and export."
  -
    type: "verify"
    at: "2026-11-21T17:46:17.347Z"
    author: "CODER"
    state: "ok"
    note: "Verified native Calc ODS named range and expression import, reference typing and export."
  -
    type: "status"
    at: "2026-11-21T17:48:07.630Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: native Calc named definitions through original ODS fixtures, scoped Calc suites, Worker transfer and package reopening."
doc_version: 3
doc_updated_at: "2026-11-21T17:48:07.633Z"
doc_updated_by: "CODER"
description: "Port named range address conversion, per-definition formula grammar and base resolution, native reference classification and export of named ranges and expressions. Verify pinned hidden and global fixtures, qualified references, and Worker transfer."
sections:
  Summary: "Align Calc ODS named range and expression import/export with pinned LibreOffice."
  Scope: "Calc XML name contexts, range-address conversion and formula grammar, base-address lookup, native name type and reference detection, qualified reference compilation, ODS export and existing Worker round trips. Preserve workbook and local scope. Run the original hidden/global fixture assertions supported by the current model."
  Plan: "Port the named-range address conversion and native storage grammar selection. Use the original base-address conversion, preserve native name flags and distinguish compiled references from formulas on export. Verify qualified and relative ranges, hidden names, source fixtures, and the same definitions after Worker transfer."
  Verify Steps: "Run targeted Calc named range, formula reference, ODS XML, print range and Worker tests. Verify original ODS fixture values, hidden range and expression flags, qualified/relative ranges, storage grammar, and base-address fallback. Run office typecheck, scoped ESLint and Prettier, module boundaries, source provenance, policy routing, doctor and git whitespace checks."
  Verification: |-
    Pending.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-21T17:46:17.347Z — VERIFY — ok

    By: CODER

    Note: Verified native Calc ODS named range and expression import, reference typing and export.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T17:36:35.241Z, excerpt_hash=sha256:9e87aa380532ef6075dcd4374840ddc57e2cddb211a72f737dfe3b137358828c

    Details:

    Implementation 694877f42375. Scoped Calc ODS XML, Worker, formula A1 and reference, named-array fixtures, print and XLSX name suites passed 161 scenarios in 37 files. Final targeted rerun passed all three ODS naming scenarios, including the export-time base revalidation. Original named-ranges-global and hidden ODS fixtures, the ODS hidden expressions fixture and the hidden XLSX-to-ODS fixture passed. Office typecheck, scoped lint and format, module boundaries, provenance, routing and git diff checks passed. Doctor reported the existing managed hook shim warning. The qualified reference work covers internal sheets with the represented formula grammar and does not add older document-version support. CALC-811 records the original first-reference flag behavior. This is task five of ten since the full-test cadence reset, and the goal remains active.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611211736-V4SBB6/blueprint/resolved-snapshot.json
    - old_digest: 5be1dc266426120cd4e1e368dd6a7119816b4a96a6f242505951632f5c1b26dd
    - current_digest: 5be1dc266426120cd4e1e368dd6a7119816b4a96a6f242505951632f5c1b26dd
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611211736-V4SBB6

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611211736-V4SBB6
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the implementation commit."
  Findings: "None at intake."
id_source: "generated"
---
## Summary

Align Calc ODS named range and expression import/export with pinned LibreOffice.

## Scope

Calc XML name contexts, range-address conversion and formula grammar, base-address lookup, native name type and reference detection, qualified reference compilation, ODS export and existing Worker round trips. Preserve workbook and local scope. Run the original hidden/global fixture assertions supported by the current model.

## Plan

Port the named-range address conversion and native storage grammar selection. Use the original base-address conversion, preserve native name flags and distinguish compiled references from formulas on export. Verify qualified and relative ranges, hidden names, source fixtures, and the same definitions after Worker transfer.

## Verify Steps

Run targeted Calc named range, formula reference, ODS XML, print range and Worker tests. Verify original ODS fixture values, hidden range and expression flags, qualified/relative ranges, storage grammar, and base-address fallback. Run office typecheck, scoped ESLint and Prettier, module boundaries, source provenance, policy routing, doctor and git whitespace checks.

## Verification

Pending.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-21T17:46:17.347Z — VERIFY — ok

By: CODER

Note: Verified native Calc ODS named range and expression import, reference typing and export.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T17:36:35.241Z, excerpt_hash=sha256:9e87aa380532ef6075dcd4374840ddc57e2cddb211a72f737dfe3b137358828c

Details:

Implementation 694877f42375. Scoped Calc ODS XML, Worker, formula A1 and reference, named-array fixtures, print and XLSX name suites passed 161 scenarios in 37 files. Final targeted rerun passed all three ODS naming scenarios, including the export-time base revalidation. Original named-ranges-global and hidden ODS fixtures, the ODS hidden expressions fixture and the hidden XLSX-to-ODS fixture passed. Office typecheck, scoped lint and format, module boundaries, provenance, routing and git diff checks passed. Doctor reported the existing managed hook shim warning. The qualified reference work covers internal sheets with the represented formula grammar and does not add older document-version support. CALC-811 records the original first-reference flag behavior. This is task five of ten since the full-test cadence reset, and the goal remains active.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611211736-V4SBB6/blueprint/resolved-snapshot.json
- old_digest: 5be1dc266426120cd4e1e368dd6a7119816b4a96a6f242505951632f5c1b26dd
- current_digest: 5be1dc266426120cd4e1e368dd6a7119816b4a96a6f242505951632f5c1b26dd
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611211736-V4SBB6

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611211736-V4SBB6
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the implementation commit.

## Findings

None at intake.
