---
id: "202611220105-51SY7G"
title: "Connect Calc cell protection controls and visibility"
result_summary: "Connected Calc cell protection, unlocked selection and protected visibility."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 12
origin:
  system: "manual"
depends_on:
  - "202611220050-2Z7YAP"
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-22T01:06:11.050Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-22T01:19:46.630Z"
  updated_by: "CODER"
  note: "Verified: native cell protection and unlocked selection, hidden visibility and clipboard rules, history teardown, 72 cases and production Chromium."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-22T01:20:01.281Z"
  updated_by: "EVALUATOR"
  note: "Native Calc cell protection and unlocked selection are backed by actual model attributes, original selection semantics and protected output."
  evaluated_sha: "a6b1bbf29c4d1fca90ab9c2c353fbdd4ec850251"
  blueprint_digest: "953f3602d47a60f7c617f77ce19667b4429e4535bb3efd8e52283639ecd0bf79"
  evidence_refs:
    - ".agentplane/tasks/202611220105-51SY7G/README.md"
    - ".agentplane/tasks/202611220105-51SY7G/quality/20261122-012001281-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611220105-51SY7G/quality/20261122-012001281-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611220105-51SY7G/quality/20261122-012001281-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611220105-51SY7G/blueprint/resolved-snapshot.json"
    - "output/calc-task16-verification.md"
    - "output/calc-task16-calc-final.log"
    - "output/calc-task16-files-retry.log"
    - "output/playwright/calc-task16/smoke.log"
  findings:
    - "Both menu commands, native history and tdf151752/tdf152327 pass through the actual Calc workspace."
    - "Protected grid and input line visibility and clipboard formula-result conversion are verified and preserve original source cells."
    - "The mounted test exposed a prior teardown ordering error. History now releases before the document style pool and the lifecycle checks pass."
commit:
  hash: "a6b1bbf29c4d1fca90ab9c2c353fbdd4ec850251"
  message: "🧩 51SY7G code: connect Calc cell protection commands and protected output"
comments:
  -
    author: "CODER"
    body: "Start: connect native cell protection, unlocked selections and model-backed output."
  -
    author: "CODER"
    body: "Verified: native Calc cell-protection toggle, unlocked selection, protected grid and clipboard output, safe history teardown and production Chromium."
events:
  -
    type: "status"
    at: "2026-11-22T01:06:11.410Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: connect native cell protection, unlocked selections and model-backed output."
  -
    type: "verify"
    at: "2026-11-22T01:19:46.630Z"
    author: "CODER"
    state: "ok"
    note: "Verified: native cell protection and unlocked selection, hidden visibility and clipboard rules, history teardown, 72 cases and production Chromium."
  -
    type: "status"
    at: "2026-11-22T01:20:59.470Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: native Calc cell-protection toggle, unlocked selection, protected grid and clipboard output, safe history teardown and production Chromium."
doc_version: 3
doc_updated_at: "2026-11-22T01:20:59.471Z"
doc_updated_by: "CODER"
description: "Expose native cell protection toggle and unlocked-cell selection, and apply stored hidden-cell and hidden-formula flags to grid, input line, and native clipboard copies."
sections:
  Summary: |-
    Connect Calc cell protection controls and visibility

    Expose native cell protection toggle and unlocked-cell selection, and apply stored hidden-cell and hidden-formula flags to grid, input line, and native clipboard copies.
  Scope: "Cover SID_SCATTR_CELLPROTECTION and SID_SELECT_UNPROTECTED_CELLS, source cell-protection toggle flags and undo, compressed unlocked selection, and imported protection visibility in normal output, formula view, input line and clipboard. Keep the existing protected-cell attribute storage and selective copy semantics. The full Format Cells dialog, print output and workbook structure protection are separate consumers."
  Plan: "Connect the source CellProtection and SelectUnprotectedCells commands; port clipped attribute-run selection and the existing protection attributes' grid, input line and clipboard projection; retain native request, history, selection and filter semantics."
  Verify Steps: |-
    - Run focused Calc tests for source slots, protected cell visibility, editing, original unprotected-selection regressions, history, clipboard restriction, and ODS protection attributes.
    - Run application typecheck, changed-source lint and format, static build, dependency, Calc resource, source provenance and inventory checks, and AgentPlane routing and doctor.
    - Verify the actual Calc menu commands and new cell selections using local Chromium. This is task six of the current ten-task checkpoint interval.
  Verification: |-
    - Command: `cd apps/office && ../../node_modules/.bin/vitest run --config vitest.calc.config.ts --maxWorkers 2 --testTimeout 180000 calc-cell-protection calc-cell-clipboard calc-data-selection calc-sheet-protection protectionattr tabview2-protection ods-sheet-protection cell-style-selection ui-resources`.
      - Result: 60 distinct focused checks passed across the initial run and targeted retries. The initial mounted toggle test was looking under Format. The pinned resource places the command under Edit. With the corrected entry point, closing a document with cursor attribute history exposed stale style-pool references. Clearing history before releasing document resources matched native teardown and resolved the failure.
      - Evidence: `output/calc-task16-calc.log`, `output/calc-task16-calc-retry.log`, and `output/calc-task16-calc-final.log`.
      - Scope: native toggle request and history, original unlocked selection tdf151752/tdf152327, protected input, grid visibility, hidden cell and formula masking in both clipboard representations, standard protection attributes, ODS, and shared menu integration.
    - Commands: `cd apps/office && ../../node_modules/.bin/vitest run --config vitest.calc.config.ts --maxWorkers 2 --testTimeout 180000 calc-cell-protection calc-files calc-cell-styles` and isolated retry of the two file import cases at `--maxWorkers 1`.
      - Result: 12 additional distinct cases passed, for 72 total. Two file-dialog assertions timed out while concurrent type and build checks ran and both passed on an isolated retry.
      - Evidence: `output/calc-task16-calc-final.log` and `output/calc-task16-files-retry.log`.
      - Scope: document lifecycle, file workflows, and existing named styles and history.
    - Commands: `npm run typecheck`, `npm run test:static`, changed-source `eslint --max-warnings 0`, `prettier --check`, and `git diff --check`.
      - Result: pass.
      - Evidence: `output/calc-task16-{types,static,final-lint,docsh-lint,final-format}.log`.
      - Scope: repository types, static build, and changed authored files.
    - Commands: `npm run check:dependencies`, `npm run check:calc-resources`, `npm run check:source-provenance`, `npm run inventory:parity:calc`, `npm run check:source-tree`, `node .agentplane/policy/check-routing.mjs`, and `ap doctor`.
      - Result: pass. Inventory semanticViolationCount is 0. Doctor reports the existing hook readiness warning.
      - Evidence: `output/calc-task16-{deps,resources,final-provenance,final-inventory,source-tree,routing,doctor}.log`.
      - Scope: dependencies, native resources and provenance, inventory, source tree, routing and task workflow.
    - Command: `playwright-cli -s=calc-task16-final run-code --filename smoke.js` in the local production preview.
      - Result: pass. The native cell toggle updates the selected attribute, the unlocked selection marks the intended cell, protected input rejects on the locked cell, and unlocked input updates the workbook.
      - Evidence: `output/playwright/calc-task16/smoke.log`.
      - Scope: actual Chromium menu, native marks, sheet protection state and editing.
    - Command: `npm run check:file-size`.
      - Result: reports the seven pre-existing authored file limit violations. Task files remain below the limit.
      - Evidence: `output/calc-task16-filesize.log`.
      - Scope: authored file size.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-22T01:19:46.630Z — VERIFY — ok

    By: CODER

    Note: Verified: native cell protection and unlocked selection, hidden visibility and clipboard rules, history teardown, 72 cases and production Chromium.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-22T01:19:45.772Z, excerpt_hash=sha256:49c9e3e80a694b268e95d25bc5fe9d51f77bfa20e9f21fc7111ae61d11470b95

    Details:

    - Command: `cd apps/office && ../../node_modules/.bin/vitest run --config vitest.calc.config.ts --maxWorkers 2 --testTimeout 180000 calc-cell-protection calc-cell-clipboard calc-data-selection calc-sheet-protection protectionattr tabview2-protection ods-sheet-protection cell-style-selection ui-resources`.
      - Result: 60 distinct focused checks passed across the initial run and targeted retries. The initial mounted toggle test was looking under Format. The pinned resource places the command under Edit. With the corrected entry point, closing a document with cursor attribute history exposed stale style-pool references. Clearing history before releasing document resources matched native teardown and resolved the failure.
      - Evidence: `output/calc-task16-calc.log`, `output/calc-task16-calc-retry.log`, and `output/calc-task16-calc-final.log`.
      - Scope: native toggle request and history, original unlocked selection tdf151752/tdf152327, protected input, grid visibility, hidden cell and formula masking in both clipboard representations, standard protection attributes, ODS, and shared menu integration.
    - Commands: `cd apps/office && ../../node_modules/.bin/vitest run --config vitest.calc.config.ts --maxWorkers 2 --testTimeout 180000 calc-cell-protection calc-files calc-cell-styles` and isolated retry of the two file import cases at `--maxWorkers 1`.
      - Result: 12 additional distinct cases passed, for 72 total. Two file-dialog assertions timed out while concurrent type and build checks ran and both passed on an isolated retry.
      - Evidence: `output/calc-task16-calc-final.log` and `output/calc-task16-files-retry.log`.
      - Scope: document lifecycle, file workflows, and existing named styles and history.
    - Commands: `npm run typecheck`, `npm run test:static`, changed-source `eslint --max-warnings 0`, `prettier --check`, and `git diff --check`.
      - Result: pass.
      - Evidence: `output/calc-task16-{types,static,final-lint,docsh-lint,final-format}.log`.
      - Scope: repository types, static build, and changed authored files.
    - Commands: `npm run check:dependencies`, `npm run check:calc-resources`, `npm run check:source-provenance`, `npm run inventory:parity:calc`, `npm run check:source-tree`, `node .agentplane/policy/check-routing.mjs`, and `ap doctor`.
      - Result: pass. Inventory semanticViolationCount is 0. Doctor reports the existing hook readiness warning.
      - Evidence: `output/calc-task16-{deps,resources,final-provenance,final-inventory,source-tree,routing,doctor}.log`.
      - Scope: dependencies, native resources and provenance, inventory, source tree, routing and task workflow.
    - Command: `playwright-cli -s=calc-task16-final run-code --filename smoke.js` in the local production preview.
      - Result: pass. The native cell toggle updates the selected attribute, the unlocked selection marks the intended cell, protected input rejects on the locked cell, and unlocked input updates the workbook.
      - Evidence: `output/playwright/calc-task16/smoke.log`.
      - Scope: actual Chromium menu, native marks, sheet protection state and editing.
    - Command: `npm run check:file-size`.
      - Result: reports the seven pre-existing authored file limit violations. Task files remain below the limit.
      - Evidence: `output/calc-task16-filesize.log`.
      - Scope: authored file size.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611220105-51SY7G/blueprint/resolved-snapshot.json
    - old_digest: 953f3602d47a60f7c617f77ce19667b4429e4535bb3efd8e52283639ecd0bf79
    - current_digest: 953f3602d47a60f7c617f77ce19667b4429e4535bb3efd8e52283639ecd0bf79
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611220105-51SY7G

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611220105-51SY7G
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task implementation commits. Existing document field and file representations remain in the original cell and sheet protection owners."
  Findings: |-
    - CALC-826 records that the original unlocked range scan only checks the Protected flag, while input editability also checks Hide All. The regression passes against the real marks and input owners.
    - CALC-827 records the allocated-column limit in the original unlocked range scan. An unlocked default-column run in an unallocated column remains outside the marked result.
    - Calc close now deletes history-owned cell pattern references while the document style pool remains alive, matching ScDocShell destruction.
    - The represented clipboard covers native cells and plain text. The original tdf159174 bitmap-paste continuation still needs the drawing transfer service. The full Format Cells dialog and print output are separate consumers.
    - This is the sixth task in the current ten-task checkpoint interval. Four tasks remain before the full run.
id_source: "generated"
---
## Summary

Connect Calc cell protection controls and visibility

Expose native cell protection toggle and unlocked-cell selection, and apply stored hidden-cell and hidden-formula flags to grid, input line, and native clipboard copies.

## Scope

Cover SID_SCATTR_CELLPROTECTION and SID_SELECT_UNPROTECTED_CELLS, source cell-protection toggle flags and undo, compressed unlocked selection, and imported protection visibility in normal output, formula view, input line and clipboard. Keep the existing protected-cell attribute storage and selective copy semantics. The full Format Cells dialog, print output and workbook structure protection are separate consumers.

## Plan

Connect the source CellProtection and SelectUnprotectedCells commands; port clipped attribute-run selection and the existing protection attributes' grid, input line and clipboard projection; retain native request, history, selection and filter semantics.

## Verify Steps

- Run focused Calc tests for source slots, protected cell visibility, editing, original unprotected-selection regressions, history, clipboard restriction, and ODS protection attributes.
- Run application typecheck, changed-source lint and format, static build, dependency, Calc resource, source provenance and inventory checks, and AgentPlane routing and doctor.
- Verify the actual Calc menu commands and new cell selections using local Chromium. This is task six of the current ten-task checkpoint interval.

## Verification

- Command: `cd apps/office && ../../node_modules/.bin/vitest run --config vitest.calc.config.ts --maxWorkers 2 --testTimeout 180000 calc-cell-protection calc-cell-clipboard calc-data-selection calc-sheet-protection protectionattr tabview2-protection ods-sheet-protection cell-style-selection ui-resources`.
  - Result: 60 distinct focused checks passed across the initial run and targeted retries. The initial mounted toggle test was looking under Format. The pinned resource places the command under Edit. With the corrected entry point, closing a document with cursor attribute history exposed stale style-pool references. Clearing history before releasing document resources matched native teardown and resolved the failure.
  - Evidence: `output/calc-task16-calc.log`, `output/calc-task16-calc-retry.log`, and `output/calc-task16-calc-final.log`.
  - Scope: native toggle request and history, original unlocked selection tdf151752/tdf152327, protected input, grid visibility, hidden cell and formula masking in both clipboard representations, standard protection attributes, ODS, and shared menu integration.
- Commands: `cd apps/office && ../../node_modules/.bin/vitest run --config vitest.calc.config.ts --maxWorkers 2 --testTimeout 180000 calc-cell-protection calc-files calc-cell-styles` and isolated retry of the two file import cases at `--maxWorkers 1`.
  - Result: 12 additional distinct cases passed, for 72 total. Two file-dialog assertions timed out while concurrent type and build checks ran and both passed on an isolated retry.
  - Evidence: `output/calc-task16-calc-final.log` and `output/calc-task16-files-retry.log`.
  - Scope: document lifecycle, file workflows, and existing named styles and history.
- Commands: `npm run typecheck`, `npm run test:static`, changed-source `eslint --max-warnings 0`, `prettier --check`, and `git diff --check`.
  - Result: pass.
  - Evidence: `output/calc-task16-{types,static,final-lint,docsh-lint,final-format}.log`.
  - Scope: repository types, static build, and changed authored files.
- Commands: `npm run check:dependencies`, `npm run check:calc-resources`, `npm run check:source-provenance`, `npm run inventory:parity:calc`, `npm run check:source-tree`, `node .agentplane/policy/check-routing.mjs`, and `ap doctor`.
  - Result: pass. Inventory semanticViolationCount is 0. Doctor reports the existing hook readiness warning.
  - Evidence: `output/calc-task16-{deps,resources,final-provenance,final-inventory,source-tree,routing,doctor}.log`.
  - Scope: dependencies, native resources and provenance, inventory, source tree, routing and task workflow.
- Command: `playwright-cli -s=calc-task16-final run-code --filename smoke.js` in the local production preview.
  - Result: pass. The native cell toggle updates the selected attribute, the unlocked selection marks the intended cell, protected input rejects on the locked cell, and unlocked input updates the workbook.
  - Evidence: `output/playwright/calc-task16/smoke.log`.
  - Scope: actual Chromium menu, native marks, sheet protection state and editing.
- Command: `npm run check:file-size`.
  - Result: reports the seven pre-existing authored file limit violations. Task files remain below the limit.
  - Evidence: `output/calc-task16-filesize.log`.
  - Scope: authored file size.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-22T01:19:46.630Z — VERIFY — ok

By: CODER

Note: Verified: native cell protection and unlocked selection, hidden visibility and clipboard rules, history teardown, 72 cases and production Chromium.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-22T01:19:45.772Z, excerpt_hash=sha256:49c9e3e80a694b268e95d25bc5fe9d51f77bfa20e9f21fc7111ae61d11470b95

Details:

- Command: `cd apps/office && ../../node_modules/.bin/vitest run --config vitest.calc.config.ts --maxWorkers 2 --testTimeout 180000 calc-cell-protection calc-cell-clipboard calc-data-selection calc-sheet-protection protectionattr tabview2-protection ods-sheet-protection cell-style-selection ui-resources`.
  - Result: 60 distinct focused checks passed across the initial run and targeted retries. The initial mounted toggle test was looking under Format. The pinned resource places the command under Edit. With the corrected entry point, closing a document with cursor attribute history exposed stale style-pool references. Clearing history before releasing document resources matched native teardown and resolved the failure.
  - Evidence: `output/calc-task16-calc.log`, `output/calc-task16-calc-retry.log`, and `output/calc-task16-calc-final.log`.
  - Scope: native toggle request and history, original unlocked selection tdf151752/tdf152327, protected input, grid visibility, hidden cell and formula masking in both clipboard representations, standard protection attributes, ODS, and shared menu integration.
- Commands: `cd apps/office && ../../node_modules/.bin/vitest run --config vitest.calc.config.ts --maxWorkers 2 --testTimeout 180000 calc-cell-protection calc-files calc-cell-styles` and isolated retry of the two file import cases at `--maxWorkers 1`.
  - Result: 12 additional distinct cases passed, for 72 total. Two file-dialog assertions timed out while concurrent type and build checks ran and both passed on an isolated retry.
  - Evidence: `output/calc-task16-calc-final.log` and `output/calc-task16-files-retry.log`.
  - Scope: document lifecycle, file workflows, and existing named styles and history.
- Commands: `npm run typecheck`, `npm run test:static`, changed-source `eslint --max-warnings 0`, `prettier --check`, and `git diff --check`.
  - Result: pass.
  - Evidence: `output/calc-task16-{types,static,final-lint,docsh-lint,final-format}.log`.
  - Scope: repository types, static build, and changed authored files.
- Commands: `npm run check:dependencies`, `npm run check:calc-resources`, `npm run check:source-provenance`, `npm run inventory:parity:calc`, `npm run check:source-tree`, `node .agentplane/policy/check-routing.mjs`, and `ap doctor`.
  - Result: pass. Inventory semanticViolationCount is 0. Doctor reports the existing hook readiness warning.
  - Evidence: `output/calc-task16-{deps,resources,final-provenance,final-inventory,source-tree,routing,doctor}.log`.
  - Scope: dependencies, native resources and provenance, inventory, source tree, routing and task workflow.
- Command: `playwright-cli -s=calc-task16-final run-code --filename smoke.js` in the local production preview.
  - Result: pass. The native cell toggle updates the selected attribute, the unlocked selection marks the intended cell, protected input rejects on the locked cell, and unlocked input updates the workbook.
  - Evidence: `output/playwright/calc-task16/smoke.log`.
  - Scope: actual Chromium menu, native marks, sheet protection state and editing.
- Command: `npm run check:file-size`.
  - Result: reports the seven pre-existing authored file limit violations. Task files remain below the limit.
  - Evidence: `output/calc-task16-filesize.log`.
  - Scope: authored file size.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611220105-51SY7G/blueprint/resolved-snapshot.json
- old_digest: 953f3602d47a60f7c617f77ce19667b4429e4535bb3efd8e52283639ecd0bf79
- current_digest: 953f3602d47a60f7c617f77ce19667b4429e4535bb3efd8e52283639ecd0bf79
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611220105-51SY7G

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611220105-51SY7G
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task implementation commits. Existing document field and file representations remain in the original cell and sheet protection owners.

## Findings

- CALC-826 records that the original unlocked range scan only checks the Protected flag, while input editability also checks Hide All. The regression passes against the real marks and input owners.
- CALC-827 records the allocated-column limit in the original unlocked range scan. An unlocked default-column run in an unallocated column remains outside the marked result.
- Calc close now deletes history-owned cell pattern references while the document style pool remains alive, matching ScDocShell destruction.
- The represented clipboard covers native cells and plain text. The original tdf159174 bitmap-paste continuation still needs the drawing transfer service. The full Format Cells dialog and print output are separate consumers.
- This is the sixth task in the current ten-task checkpoint interval. Four tasks remain before the full run.
