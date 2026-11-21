---
id: "202611212120-ADJVW8"
title: "Connect Calc clipboard Text Import dialog and separator modes"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 14
origin:
  system: "manual"
depends_on:
  - "202611212010-FJ8YQ4"
tags:
  - "calc"
  - "code"
  - "frontend"
task_kind: "code"
mutation_scope: "code"
verify:
  - "Run Calc clipboard, CSV import and UI resource Vitest tests. Verify explicit one-line import, ordinary and cancelled paste, Unicode fixed-width splits, preview/import agreement and one-step Undo. Run Office TypeScript, changed-path ESLint and Prettier, Calc resource and provenance audits, policy routing and AgentPlane doctor."
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T21:21:29.579Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-21T23:08:38.534Z"
  updated_by: "CODER"
  note: "Verified: the source Calc Text Import slot, separator modes, locale, fixed-width ruler, viewport-safe paste and Undo through 189 focused scenarios and the rebuilt Chrome workflow."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-21T23:08:51.871Z"
  updated_by: "EVALUATOR"
  note: "The Calc clipboard Text Import command, source separator modes and ruler, locale and native undo route meet the approved scope."
  evaluated_sha: "d9fa462a5b60909050e4a5bcad94a1e3f83f5ff0"
  blueprint_digest: "e9032ad66927e5493aa0c04ca8ad31f91821ba21f9eaba57c22274b0ff9a59ff"
  evidence_refs:
    - ".agentplane/tasks/202611212120-ADJVW8/README.md"
    - ".agentplane/tasks/202611212120-ADJVW8/quality/20261121-230851871-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611212120-ADJVW8/quality/20261121-230851871-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611212120-ADJVW8/quality/20261121-230851871-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611212120-ADJVW8/blueprint/resolved-snapshot.json"
    - "output/calc-task11-verification.md"
    - "output/calc-task11-resize-retry.log"
    - "output/playwright/calc-task11/retry/smoke.log"
    - "d9fa462a5b60909050e4a5bcad94a1e3f83f5ff0"
  findings:
    - "Both upstream regression adaptations and the mounted resize and stale-selection scenarios pass. Chrome confirmed the same Unicode column boundaries and Undo after resizing to 390px."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: connect the native Calc clipboard Text Import slot and separator options."
events:
  -
    type: "status"
    at: "2026-11-21T22:48:12.843Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: connect the native Calc clipboard Text Import slot and separator options."
  -
    type: "verify"
    at: "2026-11-21T23:08:38.534Z"
    author: "CODER"
    state: "ok"
    note: "Verified: the source Calc Text Import slot, separator modes, locale, fixed-width ruler, viewport-safe paste and Undo through 189 focused scenarios and the rebuilt Chrome workflow."
doc_version: 3
doc_updated_at: "2026-11-21T23:08:38.595Z"
doc_updated_by: "CODER"
description: "Expose the LibreOffice Use Text Import Dialog command in the external Paste Special format chooser. Connect the existing Calc CSV import kernel to the native dialog modes, fixed-width splits, and clipboard-specific settings, while preserving ordinary paste and undo semantics."
sections:
  Summary: "Route the source external Paste Special command to the Calc clipboard Text Import dialog, and expose the existing CSV kernel capabilities behind its native separator modes."
  Scope: "Use the pinned CalcCommands.xcu, cellsh.sdi and cellsh1.cxx slot contract, the Paste Special format dialog in cui, and the clipboard branch of ScImportAsciiDlg. Connect a separate Use Text Import Dialog choice for external text that opens for one line and multiple lines. Present Detected, Separated by, and Fixed width with matching field preview, column format and clipboard-specific options. Preserve ordinary paste, asynchronous selection guards, one-step Undo, and the deliberate file-open and save policy. Change only clipboard import workflow, relevant presentation and source resources, any shared scanner behavior needed for preview/import agreement, and focused tests."
  Plan: |-
    1. Expose the native Text Import slot and dispatch it from the separate command row in the external format chooser. Preserve the existing ordinary paste route and test cancellation and destination ownership.
    2. Bind the source clipboard import defaults and separator modes to the existing importer. Use the same scanner and fixed-width visual positions in the preview and final import, with source column types and undo behavior.
    3. Port relevant upstream regression fixtures and run the focused verification steps. Begin implementation once task FJ8YQ4 has closed the scheduled full checkpoint.
  Verify Steps: "Run the focused Calc Vitest configuration for clipboard, CSV import, text import, and UI resources. Check default plain external paste, explicit one-line import, cancellation, active selection protection, and one-step Undo. Port the relevant tdf117868 automatic pipe detection and tdf92503 fixed-width DMY checks to the clipboard dialog path and verify visual-width splits with Unicode. Run Office TypeScript, changed-path ESLint and Prettier, Calc resource and provenance audits, dependency checks, policy routing, and AgentPlane doctor."
  Verification: |-
    - `cd apps/office && ../../node_modules/.bin/vitest run --config vitest.calc.config.ts --maxWorkers 2 --testTimeout 180000 calc-cell-clipboard.test.tsx impex asciiopt ui-resources.test.tsx paste-block calc-workbench calc-view-controller.test.ts calc-viewport calc-pointer-selection.test.tsx` passed 189 scenarios in 11 files with no unhandled errors. The mounted clipboard tests verify explicit one-line import, the ordinary plain format, cancellation and stale destinations, scoped Undo, manual locale preferences, Unicode widths, and adaptations of tdf117868 and tdf92503.
    - `npm run typecheck --workspace @vite-office/office`, changed-path Prettier and ESLint, and `git diff --check` passed.
    - Calc resource, source provenance, dependency boundary, policy routing, and Calc inventory checks passed. The Calc inventory reported zero semantic violations. AgentPlane doctor passed with the existing managed hook readiness warning.
    - The production Vite build and `node scripts/check-static-build.mjs` passed. Chrome opened Use Text Import Dialog for the single clipboard line `A漢B`. A pointer click and keyboard edits set ruler splits, the preview and final A1:C1 agreed, and the dialog remained operable after a resize to 390 by 600. Undo cleared the three cells. The browser console showed only the existing missing favicon. Evidence is preserved in `output/playwright/calc-task11/retry/smoke.log`.
    - This is the first task after the preceding full checkpoint. Verification was scoped to the affected modules and browser workflow.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-21T23:08:38.534Z — VERIFY — ok

    By: CODER

    Note: Verified: the source Calc Text Import slot, separator modes, locale, fixed-width ruler, viewport-safe paste and Undo through 189 focused scenarios and the rebuilt Chrome workflow.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T23:08:37.893Z, excerpt_hash=sha256:cae25221a64d20539c6e9f9320d9157bebb8612d31feaf2fea201def924a3172

    Details:

    - `cd apps/office && ../../node_modules/.bin/vitest run --config vitest.calc.config.ts --maxWorkers 2 --testTimeout 180000 calc-cell-clipboard.test.tsx impex asciiopt ui-resources.test.tsx paste-block calc-workbench calc-view-controller.test.ts calc-viewport calc-pointer-selection.test.tsx` passed 189 scenarios in 11 files with no unhandled errors. The mounted clipboard tests verify explicit one-line import, the ordinary plain format, cancellation and stale destinations, scoped Undo, manual locale preferences, Unicode widths, and adaptations of tdf117868 and tdf92503.
    - `npm run typecheck --workspace @vite-office/office`, changed-path Prettier and ESLint, and `git diff --check` passed.
    - Calc resource, source provenance, dependency boundary, policy routing, and Calc inventory checks passed. The Calc inventory reported zero semantic violations. AgentPlane doctor passed with the existing managed hook readiness warning.
    - The production Vite build and `node scripts/check-static-build.mjs` passed. Chrome opened Use Text Import Dialog for the single clipboard line `A漢B`. A pointer click and keyboard edits set ruler splits, the preview and final A1:C1 agreed, and the dialog remained operable after a resize to 390 by 600. Undo cleared the three cells. The browser console showed only the existing missing favicon. Evidence is preserved in `output/playwright/calc-task11/retry/smoke.log`.
    - This is the first task after the preceding full checkpoint. Verification was scoped to the affected modules and browser workflow.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611212120-ADJVW8/blueprint/resolved-snapshot.json
    - old_digest: e9032ad66927e5493aa0c04ca8ad31f91821ba21f9eaba57c22274b0ff9a59ff
    - current_digest: e9032ad66927e5493aa0c04ca8ad31f91821ba21f9eaba57c22274b0ff9a59ff
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611212120-ADJVW8

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611212120-ADJVW8
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task commits to restore the prior clipboard format chooser and text import rendering. Imported workbook changes remain under the existing Calc Undo mechanism."
  Findings: |-
    The external Paste Special chooser retains the original text format and separately dispatches SID_PASTE_TEXTIMPORT_DIALOG through the active Sfx frame. The explicit slot opens the existing importer for one or multiple lines. Normal paste still chooses the clipboard dialog by the source multiline rule.

    The clipboard dialog now represents Detected, Separated by, and Fixed width. Detection is recalculated for the current clipboard text and delimiter. The fixed-width ruler supports pointer and keyboard split editing and shares the visual-width calculation used by final import. Its column contract uses the source terminal skip entry. Locale and separator settings are retained for the Calc session on acceptance, and ruler positions are retained when the dialog closes. Browser clipboard text arrives as Unicode, so the character-set control displays the fixed value. The delimited preview remains a sample of seven rows and up to forty columns. The import engine keeps its own sheet limits.

    A real Chrome viewport resize initially dismissed an accepted import without writing the cells because the render revision had also been used to guard the command target. Browser layout publications now preserve the command-target revision. Document and selection changes still invalidate the pending transfer.

    Source counterparts are sc/source/ui/view/cellsh1.cxx, cui/source/dialogs/pastedlg.cxx, sc/source/ui/dbgui/scuiasciiopt.cxx, csvruler.cxx, csvgrid.cxx, and the ClipboardTextImport defaults in officecfg/registry/schema/org/openoffice/Office/Calc.xcs.
id_source: "generated"
---
## Summary

Route the source external Paste Special command to the Calc clipboard Text Import dialog, and expose the existing CSV kernel capabilities behind its native separator modes.

## Scope

Use the pinned CalcCommands.xcu, cellsh.sdi and cellsh1.cxx slot contract, the Paste Special format dialog in cui, and the clipboard branch of ScImportAsciiDlg. Connect a separate Use Text Import Dialog choice for external text that opens for one line and multiple lines. Present Detected, Separated by, and Fixed width with matching field preview, column format and clipboard-specific options. Preserve ordinary paste, asynchronous selection guards, one-step Undo, and the deliberate file-open and save policy. Change only clipboard import workflow, relevant presentation and source resources, any shared scanner behavior needed for preview/import agreement, and focused tests.

## Plan

1. Expose the native Text Import slot and dispatch it from the separate command row in the external format chooser. Preserve the existing ordinary paste route and test cancellation and destination ownership.
2. Bind the source clipboard import defaults and separator modes to the existing importer. Use the same scanner and fixed-width visual positions in the preview and final import, with source column types and undo behavior.
3. Port relevant upstream regression fixtures and run the focused verification steps. Begin implementation once task FJ8YQ4 has closed the scheduled full checkpoint.

## Verify Steps

Run the focused Calc Vitest configuration for clipboard, CSV import, text import, and UI resources. Check default plain external paste, explicit one-line import, cancellation, active selection protection, and one-step Undo. Port the relevant tdf117868 automatic pipe detection and tdf92503 fixed-width DMY checks to the clipboard dialog path and verify visual-width splits with Unicode. Run Office TypeScript, changed-path ESLint and Prettier, Calc resource and provenance audits, dependency checks, policy routing, and AgentPlane doctor.

## Verification

- `cd apps/office && ../../node_modules/.bin/vitest run --config vitest.calc.config.ts --maxWorkers 2 --testTimeout 180000 calc-cell-clipboard.test.tsx impex asciiopt ui-resources.test.tsx paste-block calc-workbench calc-view-controller.test.ts calc-viewport calc-pointer-selection.test.tsx` passed 189 scenarios in 11 files with no unhandled errors. The mounted clipboard tests verify explicit one-line import, the ordinary plain format, cancellation and stale destinations, scoped Undo, manual locale preferences, Unicode widths, and adaptations of tdf117868 and tdf92503.
- `npm run typecheck --workspace @vite-office/office`, changed-path Prettier and ESLint, and `git diff --check` passed.
- Calc resource, source provenance, dependency boundary, policy routing, and Calc inventory checks passed. The Calc inventory reported zero semantic violations. AgentPlane doctor passed with the existing managed hook readiness warning.
- The production Vite build and `node scripts/check-static-build.mjs` passed. Chrome opened Use Text Import Dialog for the single clipboard line `A漢B`. A pointer click and keyboard edits set ruler splits, the preview and final A1:C1 agreed, and the dialog remained operable after a resize to 390 by 600. Undo cleared the three cells. The browser console showed only the existing missing favicon. Evidence is preserved in `output/playwright/calc-task11/retry/smoke.log`.
- This is the first task after the preceding full checkpoint. Verification was scoped to the affected modules and browser workflow.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-21T23:08:38.534Z — VERIFY — ok

By: CODER

Note: Verified: the source Calc Text Import slot, separator modes, locale, fixed-width ruler, viewport-safe paste and Undo through 189 focused scenarios and the rebuilt Chrome workflow.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T23:08:37.893Z, excerpt_hash=sha256:cae25221a64d20539c6e9f9320d9157bebb8612d31feaf2fea201def924a3172

Details:

- `cd apps/office && ../../node_modules/.bin/vitest run --config vitest.calc.config.ts --maxWorkers 2 --testTimeout 180000 calc-cell-clipboard.test.tsx impex asciiopt ui-resources.test.tsx paste-block calc-workbench calc-view-controller.test.ts calc-viewport calc-pointer-selection.test.tsx` passed 189 scenarios in 11 files with no unhandled errors. The mounted clipboard tests verify explicit one-line import, the ordinary plain format, cancellation and stale destinations, scoped Undo, manual locale preferences, Unicode widths, and adaptations of tdf117868 and tdf92503.
- `npm run typecheck --workspace @vite-office/office`, changed-path Prettier and ESLint, and `git diff --check` passed.
- Calc resource, source provenance, dependency boundary, policy routing, and Calc inventory checks passed. The Calc inventory reported zero semantic violations. AgentPlane doctor passed with the existing managed hook readiness warning.
- The production Vite build and `node scripts/check-static-build.mjs` passed. Chrome opened Use Text Import Dialog for the single clipboard line `A漢B`. A pointer click and keyboard edits set ruler splits, the preview and final A1:C1 agreed, and the dialog remained operable after a resize to 390 by 600. Undo cleared the three cells. The browser console showed only the existing missing favicon. Evidence is preserved in `output/playwright/calc-task11/retry/smoke.log`.
- This is the first task after the preceding full checkpoint. Verification was scoped to the affected modules and browser workflow.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611212120-ADJVW8/blueprint/resolved-snapshot.json
- old_digest: e9032ad66927e5493aa0c04ca8ad31f91821ba21f9eaba57c22274b0ff9a59ff
- current_digest: e9032ad66927e5493aa0c04ca8ad31f91821ba21f9eaba57c22274b0ff9a59ff
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611212120-ADJVW8

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611212120-ADJVW8
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task commits to restore the prior clipboard format chooser and text import rendering. Imported workbook changes remain under the existing Calc Undo mechanism.

## Findings

The external Paste Special chooser retains the original text format and separately dispatches SID_PASTE_TEXTIMPORT_DIALOG through the active Sfx frame. The explicit slot opens the existing importer for one or multiple lines. Normal paste still chooses the clipboard dialog by the source multiline rule.

The clipboard dialog now represents Detected, Separated by, and Fixed width. Detection is recalculated for the current clipboard text and delimiter. The fixed-width ruler supports pointer and keyboard split editing and shares the visual-width calculation used by final import. Its column contract uses the source terminal skip entry. Locale and separator settings are retained for the Calc session on acceptance, and ruler positions are retained when the dialog closes. Browser clipboard text arrives as Unicode, so the character-set control displays the fixed value. The delimited preview remains a sample of seven rows and up to forty columns. The import engine keeps its own sheet limits.

A real Chrome viewport resize initially dismissed an accepted import without writing the cells because the render revision had also been used to guard the command target. Browser layout publications now preserve the command-target revision. Document and selection changes still invalidate the pending transfer.

Source counterparts are sc/source/ui/view/cellsh1.cxx, cui/source/dialogs/pastedlg.cxx, sc/source/ui/dbgui/scuiasciiopt.cxx, csvruler.cxx, csvgrid.cxx, and the ClipboardTextImport defaults in officecfg/registry/schema/org/openoffice/Office/Calc.xcs.
