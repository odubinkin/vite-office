---
id: "202611211734-CJ68YT"
title: "Connect Calc names from selection labels"
result_summary: "Connect Calc Create Names from labels with native scope history and R1C1 syntax"
status: "DONE"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T17:34:48.738Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-21T18:09:41.225Z"
  updated_by: "CODER"
  note: "All 40 focused Calc tests and declared static checks passed, including the tdf137617 A1/R1C1 path, name conflict responses, grouped scope history and XLSX named arrays."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-21T18:09:46.232Z"
  updated_by: "EVALUATOR"
  note: "Source interaction, native scope history, formula syntax and existing name filters were verified through Calc tests."
  evaluated_sha: "1990258a1d4e17e09ca4d90243dd51e4f7a9c2b4"
  blueprint_digest: "b8a7956f3d8c207ee9177e62915a9b8f6d9d3e2d4704496d5ba82e651c03fbf9"
  evidence_refs:
    - ".agentplane/tasks/202611211734-CJ68YT/README.md"
    - ".agentplane/tasks/202611211734-CJ68YT/quality/20261121-180946232-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611211734-CJ68YT/quality/20261121-180946232-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611211734-CJ68YT/quality/20261121-180946232-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611211734-CJ68YT/blueprint/resolved-snapshot.json"
    - "output/calc-CJ68YT-verification.md"
    - "output/calc-CJ68YT-verified.log"
    - "output/calc-CJ68YT-xlsx-verified.log"
    - "1990258a1d4e17e09ca4d90243dd51e4f7a9c2b4"
  findings:
    - "The pinned tdf137617 orientation and position-box assertions passed in Calc A1 and Excel R1C1."
    - "Yes, No and Cancel decisions and atomic history passed through the real sheet-menu and cell paths."
commit:
  hash: "1990258a1d4e17e09ca4d90243dd51e4f7a9c2b4"
  message: "🧩 CJ68YT code: serialize Calc formulas in the document R1C1 grammar"
comments:
  -
    author: "CODER"
    body: "Start: Connect the native Create Names dialog and selection-label name creation with indexed scope history."
  -
    author: "CODER"
    body: "Verified: 40 targeted Calc tests passed with declared type, lint, format, resource, provenance, dependency and policy checks."
events:
  -
    type: "status"
    at: "2026-11-21T17:34:49.097Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Connect the native Create Names dialog and selection-label name creation with indexed scope history."
  -
    type: "verify"
    at: "2026-11-21T18:09:41.225Z"
    author: "CODER"
    state: "ok"
    note: "All 40 focused Calc tests and declared static checks passed, including the tdf137617 A1/R1C1 path, name conflict responses, grouped scope history and XLSX named arrays."
  -
    type: "status"
    at: "2026-11-21T18:12:31.574Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: 40 targeted Calc tests passed with declared type, lint, format, resource, provenance, dependency and policy checks."
doc_version: 3
doc_updated_at: "2026-11-21T18:12:31.575Z"
doc_updated_by: "CODER"
description: "Expose the LibreOffice Create Names command using the existing indexed name collections, reference formatting, dialog service and range-name history."
sections:
  Summary: "Connect the original Calc Create Names command to the indexed range-name model and document history."
  Scope: "Calc source and browser range-name UI, dialog resources and commands, core/name creation, focused tests, and their source registry entries. Task 3 of the ten-task verification cycle."
  Plan: "Port the source selection defaults and orientation dialog. Reuse native cell/reference APIs to create names from edge labels, including valid-name conversion, replace/skip/cancel handling, and scope history. Verify against the source test scenarios and browser command entry points."
  Verify Steps: "Run focused Calc named-range, formula, selection, workbook and menu tests including the pinned tdf137617 Create Names scenarios, conflict handling and Undo. Run Office TypeScript, changed-path lint and format, generated Calc resources, source provenance, dependency boundaries, policy routing and AgentPlane doctor."
  Verification: |-
    - Command: `cd apps/office && node ../../node_modules/vitest/vitest.mjs run --config vitest.calc.config.ts calc-named-ranges calc-view-controller calc-workbench calc-visible-selection address.r1c1 native-a1-formula ui-resources --maxWorkers 1 --testTimeout 600000 --reporter verbose`.
      Result: pass. Evidence: 7 test files and 38 tests passed.
      Scope: Create Names in Calc A1 and Excel R1C1, dependent formulas, three duplicate responses, Undo/Redo, ODS and XLSX name round trips, visible selection, commands and workbench behavior.
    - Command: `node_modules/.bin/tsc --noEmit --project apps/office/tsconfig.json --singleThreaded --checkers 1 --incremental --tsBuildInfoFile output/calc-458SWH-office.tsbuildinfo`.
      Result: pass. Scope: Office TypeScript.
    - Commands: changed-path `eslint --max-warnings 0`, `prettier --check`, and `git diff --check`.
      Result: pass. Scope: Calc changes and the shared formula serialization guard.
    - Commands: `npm run check:calc-resources`, `npm run check:source-provenance`, and `npm run check:dependencies`.
      Result: pass. Evidence: 477 source commands, 2987 provenance modules and 2986 boundary-checked runtime sources.
    - Commands: `node .agentplane/policy/check-routing.mjs` and `ap doctor`.
      Result: pass. Evidence: routing OK and doctor OK with the existing hook shim readiness warning.
    - Command: `cd apps/office && node ../../node_modules/vitest/vitest.mjs run --config vitest.calc.config.ts excelfilter.named-arrays --maxWorkers 1 --testTimeout 600000 --reporter verbose`.
      Result: pass. Evidence: 1 file and 2 tests passed. Scope: XLSX/ODS named array regression, including the isolated retry after the concurrent test timeout.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-21T18:09:41.225Z — VERIFY — ok

    By: CODER

    Note: All 40 focused Calc tests and declared static checks passed, including the tdf137617 A1/R1C1 path, name conflict responses, grouped scope history and XLSX named arrays.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T18:09:38.301Z, excerpt_hash=sha256:41b10040be31f858efee7242adca3d069d43704cccee43fdf8612ca55a7216d0

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611211734-CJ68YT/blueprint/resolved-snapshot.json
    - old_digest: b8a7956f3d8c207ee9177e62915a9b8f6d9d3e2d4704496d5ba82e651c03fbf9
    - current_digest: b8a7956f3d8c207ee9177e62915a9b8f6d9d3e2d4704496d5ba82e651c03fbf9
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611211734-CJ68YT

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611211734-CJ68YT
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the source commit for this task to remove the new command and restore previous range-name entry points."
  Findings: |-
    - CALC-809 captures the original partial application when Cancel is selected in the replacement prompt. The browser preserves the earlier draft entries and stops further labels, with one scope Undo.
    - Range name creation reuses actual cell values and the indexed name model. The name box resolves local then global definitions by exact selected block, and formula input consults the document grammar.
    - The tdf137617 browser port sets the document grammar directly for the Excel R1C1 scenario. The Calc options UI is outside this task's scope.
    - AgentPlane doctor returned its existing hook shim readiness warning and no errors.
    - This is task 3 of the ten-task verification cycle. Full verification is due after seven more AgentPlane tasks.
id_source: "generated"
---
## Summary

Connect the original Calc Create Names command to the indexed range-name model and document history.

## Scope

Calc source and browser range-name UI, dialog resources and commands, core/name creation, focused tests, and their source registry entries. Task 3 of the ten-task verification cycle.

## Plan

Port the source selection defaults and orientation dialog. Reuse native cell/reference APIs to create names from edge labels, including valid-name conversion, replace/skip/cancel handling, and scope history. Verify against the source test scenarios and browser command entry points.

## Verify Steps

Run focused Calc named-range, formula, selection, workbook and menu tests including the pinned tdf137617 Create Names scenarios, conflict handling and Undo. Run Office TypeScript, changed-path lint and format, generated Calc resources, source provenance, dependency boundaries, policy routing and AgentPlane doctor.

## Verification

- Command: `cd apps/office && node ../../node_modules/vitest/vitest.mjs run --config vitest.calc.config.ts calc-named-ranges calc-view-controller calc-workbench calc-visible-selection address.r1c1 native-a1-formula ui-resources --maxWorkers 1 --testTimeout 600000 --reporter verbose`.
  Result: pass. Evidence: 7 test files and 38 tests passed.
  Scope: Create Names in Calc A1 and Excel R1C1, dependent formulas, three duplicate responses, Undo/Redo, ODS and XLSX name round trips, visible selection, commands and workbench behavior.
- Command: `node_modules/.bin/tsc --noEmit --project apps/office/tsconfig.json --singleThreaded --checkers 1 --incremental --tsBuildInfoFile output/calc-458SWH-office.tsbuildinfo`.
  Result: pass. Scope: Office TypeScript.
- Commands: changed-path `eslint --max-warnings 0`, `prettier --check`, and `git diff --check`.
  Result: pass. Scope: Calc changes and the shared formula serialization guard.
- Commands: `npm run check:calc-resources`, `npm run check:source-provenance`, and `npm run check:dependencies`.
  Result: pass. Evidence: 477 source commands, 2987 provenance modules and 2986 boundary-checked runtime sources.
- Commands: `node .agentplane/policy/check-routing.mjs` and `ap doctor`.
  Result: pass. Evidence: routing OK and doctor OK with the existing hook shim readiness warning.
- Command: `cd apps/office && node ../../node_modules/vitest/vitest.mjs run --config vitest.calc.config.ts excelfilter.named-arrays --maxWorkers 1 --testTimeout 600000 --reporter verbose`.
  Result: pass. Evidence: 1 file and 2 tests passed. Scope: XLSX/ODS named array regression, including the isolated retry after the concurrent test timeout.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-21T18:09:41.225Z — VERIFY — ok

By: CODER

Note: All 40 focused Calc tests and declared static checks passed, including the tdf137617 A1/R1C1 path, name conflict responses, grouped scope history and XLSX named arrays.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T18:09:38.301Z, excerpt_hash=sha256:41b10040be31f858efee7242adca3d069d43704cccee43fdf8612ca55a7216d0

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611211734-CJ68YT/blueprint/resolved-snapshot.json
- old_digest: b8a7956f3d8c207ee9177e62915a9b8f6d9d3e2d4704496d5ba82e651c03fbf9
- current_digest: b8a7956f3d8c207ee9177e62915a9b8f6d9d3e2d4704496d5ba82e651c03fbf9
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611211734-CJ68YT

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611211734-CJ68YT
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the source commit for this task to remove the new command and restore previous range-name entry points.

## Findings

- CALC-809 captures the original partial application when Cancel is selected in the replacement prompt. The browser preserves the earlier draft entries and stops further labels, with one scope Undo.
- Range name creation reuses actual cell values and the indexed name model. The name box resolves local then global definitions by exact selected block, and formula input consults the document grammar.
- The tdf137617 browser port sets the document grammar directly for the Excel R1C1 scenario. The Calc options UI is outside this task's scope.
- AgentPlane doctor returned its existing hook shim readiness warning and no errors.
- This is task 3 of the ten-task verification cycle. Full verification is due after seven more AgentPlane tasks.
