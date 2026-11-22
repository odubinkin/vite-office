---
id: "202611212341-5A4TN3"
title: "Connect Calc merged cells to the grid and commands"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on:
  - "202611212311-DWTX6F"
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T23:42:24.397Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-22T00:20:27.109Z"
  updated_by: "CODER"
  note: "Verified: native Calc merge modes, visible spans, original worksheet regressions, Undo and Redo, and final Chromium workflow."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-22T00:20:40.478Z"
  updated_by: "EVALUATOR"
  note: "The browser surfaces dispatch the source merge and split contracts and preserve native workbook history."
  evaluated_sha: "b53c51bcc002bbf72e88d6f26851521c68105a3f"
  blueprint_digest: "8268a17b9729fc0aa898b6e786b43a31ef50ccb073c4232c5c84f693ed9728f2"
  evidence_refs:
    - ".agentplane/tasks/202611212341-5A4TN3/README.md"
    - ".agentplane/tasks/202611212341-5A4TN3/quality/20261122-002040478-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611212341-5A4TN3/quality/20261122-002040478-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611212341-5A4TN3/quality/20261122-002040478-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611212341-5A4TN3/blueprint/resolved-snapshot.json"
    - "output/calc-task13-verification.md"
    - "output/playwright/calc-task13/smoke-final.log"
  findings:
    - "Current Chromium, original Calc fixture coverage and focused regression tests cover the actual command entry points and retained source behavior."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-11-21T23:42:34.732Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-11-22T00:20:27.109Z"
    author: "CODER"
    state: "ok"
    note: "Verified: native Calc merge modes, visible spans, original worksheet regressions, Undo and Redo, and final Chromium workflow."
doc_version: 3
doc_updated_at: "2026-11-22T00:20:27.160Z"
doc_updated_by: "CODER"
description: "Connect persisted Calc merge spans to the browser grid and implement original merge, merge and center, and split commands through the source view, document, and undo contracts."
sections:
  Summary: "Connect existing Calc merged ranges to browser rendering and expose the source merge, merge-and-center, and split cell commands."
  Scope: "Calc grid painting, selection and hit testing, native ScCellShell and ScViewFunc dispatch, ScDocFunc and Undo changes for merge and unmerge, and the native merge contents dialog through the existing browser dialog broker. Reuse existing merge attributes, anchor and covered flags, persisted ranges, and editability checks. Use the pinned LibreOffice source and applicable fixture tests. Preserve the current file workflow."
  Plan: "Project existing merge spans into the grid, connect source merge and unmerge commands and contents dialog through native document and undo owners, port relevant upstream cases, and run focused verification."
  Verify Steps: |-
    - Run focused Calc Vitest cases for merge attributes, grid interaction, merge command state and contents dialog, merged-range undo and redo, and ODS/XLSX fixture paths affected by the change.
    - Run repository typecheck, lint and format on changed code, dependency, source provenance and UI resource checks, and AgentPlane routing and doctor.
    - Build the Calc browser app and exercise the merge, split, and undo flow in local Chromium.
    - Record exact commands and evidence. This is task three of the ten-task checkpoint interval.
  Verification: |-
    - Command: `cd apps/office && ../../node_modules/.bin/vitest run --config vitest.calc.config.ts --maxWorkers 2 --testTimeout 180000 calc-merge-cells calc-page-style calc-header-footer calc-text-to-columns calc-presenters calc-pane-commands docsh.xlsx cell-merge-history merge-refresh merge-cells`
      - Result: 35 passed in nine related modules. The initial three new menu tests reached React's pre-render batched state. Fixed the test dispatch timing and reran the changed file below.
      - Evidence: `output/calc-task13-ui-focused.log`
      - Scope: canonical attributes and Undo, grid and pane projection, both original XLSX admission and round trip paths, and adjacent page style, header/footer and text import workflows.
    - Command: `cd apps/office && ../../node_modules/.bin/vitest run --config vitest.calc.config.ts --maxWorkers 2 --testTimeout 180000 calc-merge-cells`
      - Result: pass, four scenarios. Total focused verification is 39 distinct tests across these two runs.
      - Evidence: `output/calc-task13-ui-merge-final.log`
      - Scope: the tdf117367 radio controls, tdf51368 original ODS calculation and Undo, tdf37901 source cell block and Undo, grid spans, and stale response cancellation. The complete tdf37901 workbook reaches an unrelated unsupported formula during import, so the regression uses the original 2×2 data and command sequence.
    - Command: `npm run typecheck`, `npm run test:static`
      - Result: pass. The final build includes application typecheck, production bundling and a static smoke check of the emitted assets.
      - Evidence: `output/calc-task13-ui-types.log` and `output/calc-task13-ui-static-final.log`
      - Scope: repository and app types, plus production deployment assets.
    - Command: `npx --no-install eslint <changed TypeScript and TSX> --max-warnings 0`, `npx --no-install prettier --check <changed source>`, `git diff --check`
      - Result: pass. Recorded results for the grid, core/history and browser work on each implementation commit.
      - Evidence: `output/calc-task13-groundwork-lint.log`, `output/calc-task13-merge-history-final-lint.log`, `output/calc-task13-merge-copy-lint.log` and final lint/format output.
      - Scope: all modified Calc source, presentation and tests.
    - Command: `npm run check:dependencies && npm run check:source-provenance && npm run check:calc-resources && npm run check:source-tree && node .agentplane/policy/check-routing.mjs && ap doctor`
      - Result: pass. AgentPlane doctor reports one existing hook readiness warning.
      - Evidence: final scoped gate output and `output/calc-task13-ui-doctor-final.log`
      - Scope: module boundaries, provenance inventory, pinned command resources, source paths and task routing.
    - Command: `npm run inventory:parity:calc`
      - Result: pass, semanticViolationCount 0.
      - Evidence: `output/calc-task13-ui-inventory-final.log`
      - Scope: canonical Calc capability and runtime registry checks.
    - Command: `playwright-cli -s=calc-task13-final run-code --filename smoke.js` over the final local production preview
      - Result: pass. Menu opens the occupied-cell choices with Keep initially selected, Move joins both values, grid exposes a two-column span, and the active toolbar button unmerges. Two Undo actions restore the two original values.
      - Evidence: `output/playwright/calc-task13/smoke-final.log`
      - Scope: actual Chromium selection, dialog, native dispatch, grid rendering and history.
    - Command: `npm run check:file-size`
      - Result: repository-wide check still flags seven existing files outside the task's changed paths. All touched authored files are below the limit.
      - Evidence: `output/calc-task13-ui-filesize-final.log`
      - Scope: mandatory authored file-size threshold. Extracted page-style and history workflows and placed cell-shell slots in their own source module.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-22T00:20:27.109Z — VERIFY — ok

    By: CODER

    Note: Verified: native Calc merge modes, visible spans, original worksheet regressions, Undo and Redo, and final Chromium workflow.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-22T00:20:26.475Z, excerpt_hash=sha256:5f67be00fe2dbd292f66d1e4630b241579f6bf614446f94cccd39ad0e78ad0da

    Details:

    - Command: `cd apps/office && ../../node_modules/.bin/vitest run --config vitest.calc.config.ts --maxWorkers 2 --testTimeout 180000 calc-merge-cells calc-page-style calc-header-footer calc-text-to-columns calc-presenters calc-pane-commands docsh.xlsx cell-merge-history merge-refresh merge-cells`
      - Result: 35 passed in nine related modules. The initial three new menu tests reached React's pre-render batched state. Fixed the test dispatch timing and reran the changed file below.
      - Evidence: `output/calc-task13-ui-focused.log`
      - Scope: canonical attributes and Undo, grid and pane projection, both original XLSX admission and round trip paths, and adjacent page style, header/footer and text import workflows.
    - Command: `cd apps/office && ../../node_modules/.bin/vitest run --config vitest.calc.config.ts --maxWorkers 2 --testTimeout 180000 calc-merge-cells`
      - Result: pass, four scenarios. Total focused verification is 39 distinct tests across these two runs.
      - Evidence: `output/calc-task13-ui-merge-final.log`
      - Scope: the tdf117367 radio controls, tdf51368 original ODS calculation and Undo, tdf37901 source cell block and Undo, grid spans, and stale response cancellation. The complete tdf37901 workbook reaches an unrelated unsupported formula during import, so the regression uses the original 2×2 data and command sequence.
    - Command: `npm run typecheck`, `npm run test:static`
      - Result: pass. The final build includes application typecheck, production bundling and a static smoke check of the emitted assets.
      - Evidence: `output/calc-task13-ui-types.log` and `output/calc-task13-ui-static-final.log`
      - Scope: repository and app types, plus production deployment assets.
    - Command: `npx --no-install eslint <changed TypeScript and TSX> --max-warnings 0`, `npx --no-install prettier --check <changed source>`, `git diff --check`
      - Result: pass. Recorded results for the grid, core/history and browser work on each implementation commit.
      - Evidence: `output/calc-task13-groundwork-lint.log`, `output/calc-task13-merge-history-final-lint.log`, `output/calc-task13-merge-copy-lint.log` and final lint/format output.
      - Scope: all modified Calc source, presentation and tests.
    - Command: `npm run check:dependencies && npm run check:source-provenance && npm run check:calc-resources && npm run check:source-tree && node .agentplane/policy/check-routing.mjs && ap doctor`
      - Result: pass. AgentPlane doctor reports one existing hook readiness warning.
      - Evidence: final scoped gate output and `output/calc-task13-ui-doctor-final.log`
      - Scope: module boundaries, provenance inventory, pinned command resources, source paths and task routing.
    - Command: `npm run inventory:parity:calc`
      - Result: pass, semanticViolationCount 0.
      - Evidence: `output/calc-task13-ui-inventory-final.log`
      - Scope: canonical Calc capability and runtime registry checks.
    - Command: `playwright-cli -s=calc-task13-final run-code --filename smoke.js` over the final local production preview
      - Result: pass. Menu opens the occupied-cell choices with Keep initially selected, Move joins both values, grid exposes a two-column span, and the active toolbar button unmerges. Two Undo actions restore the two original values.
      - Evidence: `output/playwright/calc-task13/smoke-final.log`
      - Scope: actual Chromium selection, dialog, native dispatch, grid rendering and history.
    - Command: `npm run check:file-size`
      - Result: repository-wide check still flags seven existing files outside the task's changed paths. All touched authored files are below the limit.
      - Evidence: `output/calc-task13-ui-filesize-final.log`
      - Scope: mandatory authored file-size threshold. Extracted page-style and history workflows and placed cell-shell slots in their own source module.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611212341-5A4TN3/blueprint/resolved-snapshot.json
    - old_digest: 8268a17b9729fc0aa898b6e786b43a31ef50ccb073c4232c5c84f693ed9728f2
    - current_digest: 8268a17b9729fc0aa898b6e786b43a31ef50ccb073c4232c5c84f693ed9728f2
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611212341-5A4TN3

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611212341-5A4TN3
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only the task's implementation commits. Existing imported merge data remains owned by the current Calc model and file codecs."
  Findings: |-
    - Preserved source merge selection, radio defaults, native split and Undo/Redo ownership. Findings CALC-819 through CALC-822 record the unusual behaviors retained from the pinned source.
    - The browser dialog preserves the native Help control in the standard disabled state. The Calc web app has no contextual help dispatcher.
    - The original tdf51368 workbook validates calculation and Undo. The tdf37901 regression uses its source A1:B2 block because the full workbook reaches unsupported formula lookup elsewhere.
    - The global file-size command lists seven pre-existing oversized Calc, Writer and Xmloff files outside this task. All modified modules satisfy the size threshold.
    - Verified the relevant suites for checkpoint task three of ten. The full-suite checkpoint remains after seven further completed AgentPlane tasks.
id_source: "generated"
---
## Summary

Connect existing Calc merged ranges to browser rendering and expose the source merge, merge-and-center, and split cell commands.

## Scope

Calc grid painting, selection and hit testing, native ScCellShell and ScViewFunc dispatch, ScDocFunc and Undo changes for merge and unmerge, and the native merge contents dialog through the existing browser dialog broker. Reuse existing merge attributes, anchor and covered flags, persisted ranges, and editability checks. Use the pinned LibreOffice source and applicable fixture tests. Preserve the current file workflow.

## Plan

Project existing merge spans into the grid, connect source merge and unmerge commands and contents dialog through native document and undo owners, port relevant upstream cases, and run focused verification.

## Verify Steps

- Run focused Calc Vitest cases for merge attributes, grid interaction, merge command state and contents dialog, merged-range undo and redo, and ODS/XLSX fixture paths affected by the change.
- Run repository typecheck, lint and format on changed code, dependency, source provenance and UI resource checks, and AgentPlane routing and doctor.
- Build the Calc browser app and exercise the merge, split, and undo flow in local Chromium.
- Record exact commands and evidence. This is task three of the ten-task checkpoint interval.

## Verification

- Command: `cd apps/office && ../../node_modules/.bin/vitest run --config vitest.calc.config.ts --maxWorkers 2 --testTimeout 180000 calc-merge-cells calc-page-style calc-header-footer calc-text-to-columns calc-presenters calc-pane-commands docsh.xlsx cell-merge-history merge-refresh merge-cells`
  - Result: 35 passed in nine related modules. The initial three new menu tests reached React's pre-render batched state. Fixed the test dispatch timing and reran the changed file below.
  - Evidence: `output/calc-task13-ui-focused.log`
  - Scope: canonical attributes and Undo, grid and pane projection, both original XLSX admission and round trip paths, and adjacent page style, header/footer and text import workflows.
- Command: `cd apps/office && ../../node_modules/.bin/vitest run --config vitest.calc.config.ts --maxWorkers 2 --testTimeout 180000 calc-merge-cells`
  - Result: pass, four scenarios. Total focused verification is 39 distinct tests across these two runs.
  - Evidence: `output/calc-task13-ui-merge-final.log`
  - Scope: the tdf117367 radio controls, tdf51368 original ODS calculation and Undo, tdf37901 source cell block and Undo, grid spans, and stale response cancellation. The complete tdf37901 workbook reaches an unrelated unsupported formula during import, so the regression uses the original 2×2 data and command sequence.
- Command: `npm run typecheck`, `npm run test:static`
  - Result: pass. The final build includes application typecheck, production bundling and a static smoke check of the emitted assets.
  - Evidence: `output/calc-task13-ui-types.log` and `output/calc-task13-ui-static-final.log`
  - Scope: repository and app types, plus production deployment assets.
- Command: `npx --no-install eslint <changed TypeScript and TSX> --max-warnings 0`, `npx --no-install prettier --check <changed source>`, `git diff --check`
  - Result: pass. Recorded results for the grid, core/history and browser work on each implementation commit.
  - Evidence: `output/calc-task13-groundwork-lint.log`, `output/calc-task13-merge-history-final-lint.log`, `output/calc-task13-merge-copy-lint.log` and final lint/format output.
  - Scope: all modified Calc source, presentation and tests.
- Command: `npm run check:dependencies && npm run check:source-provenance && npm run check:calc-resources && npm run check:source-tree && node .agentplane/policy/check-routing.mjs && ap doctor`
  - Result: pass. AgentPlane doctor reports one existing hook readiness warning.
  - Evidence: final scoped gate output and `output/calc-task13-ui-doctor-final.log`
  - Scope: module boundaries, provenance inventory, pinned command resources, source paths and task routing.
- Command: `npm run inventory:parity:calc`
  - Result: pass, semanticViolationCount 0.
  - Evidence: `output/calc-task13-ui-inventory-final.log`
  - Scope: canonical Calc capability and runtime registry checks.
- Command: `playwright-cli -s=calc-task13-final run-code --filename smoke.js` over the final local production preview
  - Result: pass. Menu opens the occupied-cell choices with Keep initially selected, Move joins both values, grid exposes a two-column span, and the active toolbar button unmerges. Two Undo actions restore the two original values.
  - Evidence: `output/playwright/calc-task13/smoke-final.log`
  - Scope: actual Chromium selection, dialog, native dispatch, grid rendering and history.
- Command: `npm run check:file-size`
  - Result: repository-wide check still flags seven existing files outside the task's changed paths. All touched authored files are below the limit.
  - Evidence: `output/calc-task13-ui-filesize-final.log`
  - Scope: mandatory authored file-size threshold. Extracted page-style and history workflows and placed cell-shell slots in their own source module.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-22T00:20:27.109Z — VERIFY — ok

By: CODER

Note: Verified: native Calc merge modes, visible spans, original worksheet regressions, Undo and Redo, and final Chromium workflow.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-22T00:20:26.475Z, excerpt_hash=sha256:5f67be00fe2dbd292f66d1e4630b241579f6bf614446f94cccd39ad0e78ad0da

Details:

- Command: `cd apps/office && ../../node_modules/.bin/vitest run --config vitest.calc.config.ts --maxWorkers 2 --testTimeout 180000 calc-merge-cells calc-page-style calc-header-footer calc-text-to-columns calc-presenters calc-pane-commands docsh.xlsx cell-merge-history merge-refresh merge-cells`
  - Result: 35 passed in nine related modules. The initial three new menu tests reached React's pre-render batched state. Fixed the test dispatch timing and reran the changed file below.
  - Evidence: `output/calc-task13-ui-focused.log`
  - Scope: canonical attributes and Undo, grid and pane projection, both original XLSX admission and round trip paths, and adjacent page style, header/footer and text import workflows.
- Command: `cd apps/office && ../../node_modules/.bin/vitest run --config vitest.calc.config.ts --maxWorkers 2 --testTimeout 180000 calc-merge-cells`
  - Result: pass, four scenarios. Total focused verification is 39 distinct tests across these two runs.
  - Evidence: `output/calc-task13-ui-merge-final.log`
  - Scope: the tdf117367 radio controls, tdf51368 original ODS calculation and Undo, tdf37901 source cell block and Undo, grid spans, and stale response cancellation. The complete tdf37901 workbook reaches an unrelated unsupported formula during import, so the regression uses the original 2×2 data and command sequence.
- Command: `npm run typecheck`, `npm run test:static`
  - Result: pass. The final build includes application typecheck, production bundling and a static smoke check of the emitted assets.
  - Evidence: `output/calc-task13-ui-types.log` and `output/calc-task13-ui-static-final.log`
  - Scope: repository and app types, plus production deployment assets.
- Command: `npx --no-install eslint <changed TypeScript and TSX> --max-warnings 0`, `npx --no-install prettier --check <changed source>`, `git diff --check`
  - Result: pass. Recorded results for the grid, core/history and browser work on each implementation commit.
  - Evidence: `output/calc-task13-groundwork-lint.log`, `output/calc-task13-merge-history-final-lint.log`, `output/calc-task13-merge-copy-lint.log` and final lint/format output.
  - Scope: all modified Calc source, presentation and tests.
- Command: `npm run check:dependencies && npm run check:source-provenance && npm run check:calc-resources && npm run check:source-tree && node .agentplane/policy/check-routing.mjs && ap doctor`
  - Result: pass. AgentPlane doctor reports one existing hook readiness warning.
  - Evidence: final scoped gate output and `output/calc-task13-ui-doctor-final.log`
  - Scope: module boundaries, provenance inventory, pinned command resources, source paths and task routing.
- Command: `npm run inventory:parity:calc`
  - Result: pass, semanticViolationCount 0.
  - Evidence: `output/calc-task13-ui-inventory-final.log`
  - Scope: canonical Calc capability and runtime registry checks.
- Command: `playwright-cli -s=calc-task13-final run-code --filename smoke.js` over the final local production preview
  - Result: pass. Menu opens the occupied-cell choices with Keep initially selected, Move joins both values, grid exposes a two-column span, and the active toolbar button unmerges. Two Undo actions restore the two original values.
  - Evidence: `output/playwright/calc-task13/smoke-final.log`
  - Scope: actual Chromium selection, dialog, native dispatch, grid rendering and history.
- Command: `npm run check:file-size`
  - Result: repository-wide check still flags seven existing files outside the task's changed paths. All touched authored files are below the limit.
  - Evidence: `output/calc-task13-ui-filesize-final.log`
  - Scope: mandatory authored file-size threshold. Extracted page-style and history workflows and placed cell-shell slots in their own source module.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611212341-5A4TN3/blueprint/resolved-snapshot.json
- old_digest: 8268a17b9729fc0aa898b6e786b43a31ef50ccb073c4232c5c84f693ed9728f2
- current_digest: 8268a17b9729fc0aa898b6e786b43a31ef50ccb073c4232c5c84f693ed9728f2
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611212341-5A4TN3

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611212341-5A4TN3
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only the task's implementation commits. Existing imported merge data remains owned by the current Calc model and file codecs.

## Findings

- Preserved source merge selection, radio defaults, native split and Undo/Redo ownership. Findings CALC-819 through CALC-822 record the unusual behaviors retained from the pinned source.
- The browser dialog preserves the native Help control in the standard disabled state. The Calc web app has no contextual help dispatcher.
- The original tdf51368 workbook validates calculation and Undo. The tdf37901 regression uses its source A1:B2 block because the full workbook reaches unsupported formula lookup elsewhere.
- The global file-size command lists seven pre-existing oversized Calc, Writer and Xmloff files outside this task. All modified modules satisfy the size threshold.
- Verified the relevant suites for checkpoint task three of ten. The full-suite checkpoint remains after seven further completed AgentPlane tasks.
