---
id: "202611211651-DM546D"
title: "Connect Calc named range definition and navigation"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 14
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T16:51:37.267Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-21T17:04:23.391Z"
  updated_by: "CODER"
  note: "The 41 scoped tests passed with Office TypeScript, lint, formatting, module boundaries, and provenance. The global file-size check reports seven unchanged baseline files."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-21T17:04:24.034Z"
  updated_by: "EVALUATOR"
  note: "Calc name definition and navigation follow source scope, naming, reference, and native undo contracts."
  evaluated_sha: "f648269b8e0a02514b32de7b76753c55735a72af"
  blueprint_digest: "1b8b547c3f1705bf599e7e6872e47de8086f8e65142e6d38448fc55d3df0fb6e"
  evidence_refs:
    - ".agentplane/tasks/202611211651-DM546D/README.md"
    - ".agentplane/tasks/202611211651-DM546D/quality/20261121-170424034-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611211651-DM546D/quality/20261121-170424034-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611211651-DM546D/quality/20261121-170424034-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611211651-DM546D/blueprint/resolved-snapshot.json"
    - "output/calc-DM546D-verification.md"
    - "output/calc-DM546D-test.log"
  findings:
    - "Forty-one focused tests verify the actual Sheet menu, position box, navigation, history, and both document filters."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Connect native Calc range-name definition, selection and name-box navigation with source undo."
events:
  -
    type: "status"
    at: "2026-11-21T16:51:37.673Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Connect native Calc range-name definition, selection and name-box navigation with source undo."
  -
    type: "verify"
    at: "2026-11-21T17:04:23.391Z"
    author: "CODER"
    state: "ok"
    note: "The 41 scoped tests passed with Office TypeScript, lint, formatting, module boundaries, and provenance. The global file-size check reports seven unchanged baseline files."
doc_version: 3
doc_updated_at: "2026-11-21T17:04:23.440Z"
doc_updated_by: "CODER"
description: "Expose native named range definition and name-box navigation through the existing Calc range collections and undo contracts."
sections:
  Summary: "Connect the Calc Define Name dialog and name-box range creation and navigation to native workbook and sheet name collections."
  Scope: "Use the original FID_ADD_NAME command, reference picker, name/type/scope fields, validation, insertion, source-index-aware undo, and name-box navigation. Reuse the existing workbook model and ODS and XLSX names. This is task 1 of the ten-task regression cycle."
  Plan: "Map upstream definition and navigation entry points to the existing range names, compile/validate and index-preserving undo, connect Sfx and the native reference picker, and verify scope/history/file round-trips and nearby formula/view tests."
  Verify Steps: "Run affected Calc named-range, formula, IO, and view tests including the new definition and navigation scenarios. Check changed-path format and lint, Office TypeScript, and new-source provenance and module boundaries."
  Verification: |-
    Implementation commit `f648269b8e0a`.

    | Check | Result | Evidence |
    | --- | --- | --- |
    | Calc Vitest projects selected by `calc-named-ranges calc-view-controller calc-workbench named-arrays xename print-ranges ui-resources calc-conditional-format` | Pass | 41 tests across 8 files. The Define Name command opens through the real Sheet menu. The scenarios exercise validation, grid picking, name-box formula resolution and navigation, original index restoration with Undo/Redo, and ODS/XLSX reopening. |
    | Office TypeScript with the repository compiler | Pass | `tsc --noEmit --project apps/office/tsconfig.json --singleThreaded --checkers 1 --incremental` |
    | Changed-path ESLint and Prettier | Pass | All changed sources, tests, and documentation were checked. |
    | `npm run check:source-provenance` and `npm run check:dependencies` | Pass | 2,979 provenance entries and 20,431 relative imports checked. |
    | AgentPlane doctor and routing validation | Pass | Both checks reported OK. |
    | `npm run check:file-size` | Existing failures | Seven files already meet or exceed the 1,000-line limit. Their bytes match the task baseline `0617406d9`. Changed sources stay below the limit. |

    This is task 1 of the ten-task regression cycle. Logs are under `output/calc-DM546D-*`.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-21T17:04:23.391Z — VERIFY — ok

    By: CODER

    Note: The 41 scoped tests passed with Office TypeScript, lint, formatting, module boundaries, and provenance. The global file-size check reports seven unchanged baseline files.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T17:04:22.861Z, excerpt_hash=sha256:f54901533df57b64e39b008bc82009594dfaab0566a40f86e9d321ddc4ac7eda

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611211651-DM546D/blueprint/resolved-snapshot.json
    - old_digest: 1b8b547c3f1705bf599e7e6872e47de8086f8e65142e6d38448fc55d3df0fb6e
    - current_digest: 1b8b547c3f1705bf599e7e6872e47de8086f8e65142e6d38448fc55d3df0fb6e
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611211651-DM546D

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611211651-DM546D
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task code commits to remove command and name-box authoring without changing persisted name formats."
  Findings: |-
    The browser adapter exposes the source Define Name workflow and position-box definition and navigation. The native name manager and insert-name picker are separate upstream workflows. Workbook and sheet name storage, token indexes, and file encodings are reused.

    Manual admission uses the original first-reference classification and token compilation while checking both source scope and formula validity. The source explicitly questions first-reference classification in mixed formulas. The port retains the classification for manual input and records it as CALC-807.

    The targeted tests port the creation path from `create_range_name.py` and invalid-name behavior from `tdf86214.py`. The validation loop checks supported address grammars. Lotus A1 has the same unqualified row/column token shape for the identifiers admitted by this dialog.
id_source: "generated"
---
## Summary

Connect the Calc Define Name dialog and name-box range creation and navigation to native workbook and sheet name collections.

## Scope

Use the original FID_ADD_NAME command, reference picker, name/type/scope fields, validation, insertion, source-index-aware undo, and name-box navigation. Reuse the existing workbook model and ODS and XLSX names. This is task 1 of the ten-task regression cycle.

## Plan

Map upstream definition and navigation entry points to the existing range names, compile/validate and index-preserving undo, connect Sfx and the native reference picker, and verify scope/history/file round-trips and nearby formula/view tests.

## Verify Steps

Run affected Calc named-range, formula, IO, and view tests including the new definition and navigation scenarios. Check changed-path format and lint, Office TypeScript, and new-source provenance and module boundaries.

## Verification

Implementation commit `f648269b8e0a`.

| Check | Result | Evidence |
| --- | --- | --- |
| Calc Vitest projects selected by `calc-named-ranges calc-view-controller calc-workbench named-arrays xename print-ranges ui-resources calc-conditional-format` | Pass | 41 tests across 8 files. The Define Name command opens through the real Sheet menu. The scenarios exercise validation, grid picking, name-box formula resolution and navigation, original index restoration with Undo/Redo, and ODS/XLSX reopening. |
| Office TypeScript with the repository compiler | Pass | `tsc --noEmit --project apps/office/tsconfig.json --singleThreaded --checkers 1 --incremental` |
| Changed-path ESLint and Prettier | Pass | All changed sources, tests, and documentation were checked. |
| `npm run check:source-provenance` and `npm run check:dependencies` | Pass | 2,979 provenance entries and 20,431 relative imports checked. |
| AgentPlane doctor and routing validation | Pass | Both checks reported OK. |
| `npm run check:file-size` | Existing failures | Seven files already meet or exceed the 1,000-line limit. Their bytes match the task baseline `0617406d9`. Changed sources stay below the limit. |

This is task 1 of the ten-task regression cycle. Logs are under `output/calc-DM546D-*`.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-21T17:04:23.391Z — VERIFY — ok

By: CODER

Note: The 41 scoped tests passed with Office TypeScript, lint, formatting, module boundaries, and provenance. The global file-size check reports seven unchanged baseline files.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T17:04:22.861Z, excerpt_hash=sha256:f54901533df57b64e39b008bc82009594dfaab0566a40f86e9d321ddc4ac7eda

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611211651-DM546D/blueprint/resolved-snapshot.json
- old_digest: 1b8b547c3f1705bf599e7e6872e47de8086f8e65142e6d38448fc55d3df0fb6e
- current_digest: 1b8b547c3f1705bf599e7e6872e47de8086f8e65142e6d38448fc55d3df0fb6e
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611211651-DM546D

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611211651-DM546D
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task code commits to remove command and name-box authoring without changing persisted name formats.

## Findings

The browser adapter exposes the source Define Name workflow and position-box definition and navigation. The native name manager and insert-name picker are separate upstream workflows. Workbook and sheet name storage, token indexes, and file encodings are reused.

Manual admission uses the original first-reference classification and token compilation while checking both source scope and formula validity. The source explicitly questions first-reference classification in mixed formulas. The port retains the classification for manual input and records it as CALC-807.

The targeted tests port the creation path from `create_range_name.py` and invalid-name behavior from `tdf86214.py`. The validation loop checks supported address grammars. Lotus A1 has the same unqualified row/column token shape for the identifiers admitted by this dialog.
