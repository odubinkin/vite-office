---
id: "202611210455-2Z6XQG"
title: "Connect Calc print ranges and source edit dialog"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on:
  - "202611210443-QJ6DRG"
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T04:55:44.956Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-21T05:14:55.932Z"
  updated_by: "CODER"
  note: "Verified: Native print range commands, typed history and modeless grid references passed 132 focused tests across Calc, shared menus, tooling and installed Chrome, plus production build and source checks."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-21T05:15:12.206Z"
  updated_by: "EVALUATOR"
  note: "The original print area actions and range-dialog result are connected to canonical workbook settings and history."
  evaluated_sha: "053b8df4b0091e69fd2df8afa21de6d693570e30"
  blueprint_digest: "75a5ea6dc8f644f5a293051ec011b748671d14df325aba4f70908bfc858a2a00"
  evidence_refs:
    - ".agentplane/tasks/202611210455-2Z6XQG/README.md"
    - ".agentplane/tasks/202611210455-2Z6XQG/quality/20261121-051512206-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611210455-2Z6XQG/quality/20261121-051512206-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611210455-2Z6XQG/quality/20261121-051512206-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611210455-2Z6XQG/blueprint/resolved-snapshot.json"
    - "29 Calc, 95 shared menu, 5 command catalog, and 3 installed Chrome tests passed."
    - "Production build and Playwright CLI dialog replay passed."
  findings:
    - "The Format submenu and standard toolbar share the original Sfx slots. The browser selects references through existing grid tracking while retaining the active sheet and cursor. Original repeat parser and print snapshot quirks remain documented."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-11-21T04:56:14.879Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-11-21T05:14:55.932Z"
    author: "CODER"
    state: "ok"
    note: "Verified: Native print range commands, typed history and modeless grid references passed 132 focused tests across Calc, shared menus, tooling and installed Chrome, plus production build and source checks."
doc_version: 3
doc_updated_at: "2026-11-21T05:14:55.990Z"
doc_updated_by: "CODER"
description: "Project the native Format Print Ranges popup, connect define/add/edit/clear commands with workbook print snapshots, and implement the native modeless range and repeat-title dialog with live grid references and file round trips."
sections:
  Summary: "Connect the original Calc Format > Print Ranges popup and its editing dialog."
  Scope: "Define, add, remove and edit the existing print areas and repeated row and column titles. Use native selected sheet iteration, native address parsing conventions, print range snapshots, and typed dialog parameters. Preserve workbook format and source default distinctions, and connect the modeless dialog’s three range selectors to the grid. Sheet copying and printer pagination remain separate source actions. Record native irregularities discovered in the covered path."
  Plan: "Generate the upstream print range popup, apply native sheet and history behavior, implement the modeless dialog with repeat and reference handling, and verify focused regressions."
  Verify Steps: |-
    - Run targeted Calc tests for print ranges, Calc resources and relevant workspace view and file persistence.
    - Run the tooling and office TypeScript checks.
    - Run changed-path ESLint and Prettier, source provenance, resource generation and file-size checks, and patch whitespace validation.
  Verification: |-
    - Command: `npm run test:calc -- calc-print-areas /filter/excel/print-ranges.test.ts /sc/uiconfig/scalc/ui-resources.test.tsx calc-view-options calc-sheet-commands calc-files --maxWorkers 1 --testTimeout 600000`. Result: pass. Evidence: 29 tests across 6 files. Scope: native print ranges, Calc menu and sheet interaction, XLSX and ODS print settings, and file workflows.
    - Command: `npm run test:shared --workspace @vite-office/office -- CommandMenuBar menubar-overflow --maxWorkers 1 --testTimeout 600000`. Result: pass. Evidence: 95 tests across 7 files. Scope: shared menu, context label presentation, and overflow regressions.
    - Command: `npm run test:tooling -- office-ui-command-catalog`. Result: pass. Evidence: 5 tests. Scope: the shared pinned command catalog reader.
    - Command: `npm run typecheck:tools && npm run build`. Result: pass. Evidence: tooling TypeScript check, office tsc --noEmit and production Vite build.
    - Commands: changed-path `prettier --check`, `eslint --max-warnings 0`, `npm run check:calc-resources`, `npm run check:source-provenance`, `npm run check:file-size`, and `git diff --check`. Result: pass. Evidence: all 33 implementation paths formatted, lint clean, 465 generated command resources, 2915 mapped or classified runtime modules, and authored files within the size limit.
    - Command: `npx playwright test --config .playwright-cli/calc-print.config.ts --project calc --workers 1 standard-toolbar.spec.ts xlsx-page-breaks.spec.ts`. Result: pass. Evidence: 3 Chrome tests, including toolbar geometry and accessibility at 1280×800 and 390×600, and the XLSX page-break regression. The temporary config selects installed Chrome because the stock Playwright headless binary is missing.
    - Command: `npm run preview -- --host 127.0.0.1 --port 4193 --strictPort` from apps/office and Playwright CLI against the production build. Result: pass. Evidence: defined the area via the toolbar, selected C4:D5 by dragging in the modeless dialog, captured row $5 while collapsed, entered $C:$D, and verified all three fields after reopening. The grid regained focus after submission.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-21T05:14:55.932Z — VERIFY — ok

    By: CODER

    Note: Verified: Native print range commands, typed history and modeless grid references passed 132 focused tests across Calc, shared menus, tooling and installed Chrome, plus production build and source checks.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T05:14:55.346Z, excerpt_hash=sha256:20da0a18c9c12db9c5b1dbc1dec84f1e051cb57b0424b35a1153bf58b04b1d6c

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611210455-2Z6XQG/blueprint/resolved-snapshot.json
    - old_digest: 75a5ea6dc8f644f5a293051ec011b748671d14df325aba4f70908bfc858a2a00
    - current_digest: 75a5ea6dc8f644f5a293051ec011b748671d14df325aba4f70908bfc858a2a00
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611210455-2Z6XQG

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611210455-2Z6XQG
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the implementation commit while retaining the previous print-range data owners and file imports."
  Findings: "The source print-range dialog regression is ported through the production browser presenter and Sfx dispatch. The second upstream printRange.py scenario depends on the separate Move/Copy Sheet workflow. Printer pagination is a separate source mechanism. Source quirks in A1 repeat parsing and sheet-local print-area name restoration remain unchanged and appear in CALC-784 through CALC-786."
id_source: "generated"
---
## Summary

Connect the original Calc Format > Print Ranges popup and its editing dialog.

## Scope

Define, add, remove and edit the existing print areas and repeated row and column titles. Use native selected sheet iteration, native address parsing conventions, print range snapshots, and typed dialog parameters. Preserve workbook format and source default distinctions, and connect the modeless dialog’s three range selectors to the grid. Sheet copying and printer pagination remain separate source actions. Record native irregularities discovered in the covered path.

## Plan

Generate the upstream print range popup, apply native sheet and history behavior, implement the modeless dialog with repeat and reference handling, and verify focused regressions.

## Verify Steps

- Run targeted Calc tests for print ranges, Calc resources and relevant workspace view and file persistence.
- Run the tooling and office TypeScript checks.
- Run changed-path ESLint and Prettier, source provenance, resource generation and file-size checks, and patch whitespace validation.

## Verification

- Command: `npm run test:calc -- calc-print-areas /filter/excel/print-ranges.test.ts /sc/uiconfig/scalc/ui-resources.test.tsx calc-view-options calc-sheet-commands calc-files --maxWorkers 1 --testTimeout 600000`. Result: pass. Evidence: 29 tests across 6 files. Scope: native print ranges, Calc menu and sheet interaction, XLSX and ODS print settings, and file workflows.
- Command: `npm run test:shared --workspace @vite-office/office -- CommandMenuBar menubar-overflow --maxWorkers 1 --testTimeout 600000`. Result: pass. Evidence: 95 tests across 7 files. Scope: shared menu, context label presentation, and overflow regressions.
- Command: `npm run test:tooling -- office-ui-command-catalog`. Result: pass. Evidence: 5 tests. Scope: the shared pinned command catalog reader.
- Command: `npm run typecheck:tools && npm run build`. Result: pass. Evidence: tooling TypeScript check, office tsc --noEmit and production Vite build.
- Commands: changed-path `prettier --check`, `eslint --max-warnings 0`, `npm run check:calc-resources`, `npm run check:source-provenance`, `npm run check:file-size`, and `git diff --check`. Result: pass. Evidence: all 33 implementation paths formatted, lint clean, 465 generated command resources, 2915 mapped or classified runtime modules, and authored files within the size limit.
- Command: `npx playwright test --config .playwright-cli/calc-print.config.ts --project calc --workers 1 standard-toolbar.spec.ts xlsx-page-breaks.spec.ts`. Result: pass. Evidence: 3 Chrome tests, including toolbar geometry and accessibility at 1280×800 and 390×600, and the XLSX page-break regression. The temporary config selects installed Chrome because the stock Playwright headless binary is missing.
- Command: `npm run preview -- --host 127.0.0.1 --port 4193 --strictPort` from apps/office and Playwright CLI against the production build. Result: pass. Evidence: defined the area via the toolbar, selected C4:D5 by dragging in the modeless dialog, captured row $5 while collapsed, entered $C:$D, and verified all three fields after reopening. The grid regained focus after submission.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-21T05:14:55.932Z — VERIFY — ok

By: CODER

Note: Verified: Native print range commands, typed history and modeless grid references passed 132 focused tests across Calc, shared menus, tooling and installed Chrome, plus production build and source checks.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T05:14:55.346Z, excerpt_hash=sha256:20da0a18c9c12db9c5b1dbc1dec84f1e051cb57b0424b35a1153bf58b04b1d6c

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611210455-2Z6XQG/blueprint/resolved-snapshot.json
- old_digest: 75a5ea6dc8f644f5a293051ec011b748671d14df325aba4f70908bfc858a2a00
- current_digest: 75a5ea6dc8f644f5a293051ec011b748671d14df325aba4f70908bfc858a2a00
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611210455-2Z6XQG

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611210455-2Z6XQG
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the implementation commit while retaining the previous print-range data owners and file imports.

## Findings

The source print-range dialog regression is ported through the production browser presenter and Sfx dispatch. The second upstream printRange.py scenario depends on the separate Move/Copy Sheet workflow. Printer pagination is a separate source mechanism. Source quirks in A1 repeat parsing and sheet-local print-area name restoration remain unchanged and appear in CALC-784 through CALC-786.
