---
id: "202611212010-FJ8YQ4"
title: "Connect Calc Paste Special dialog and presets"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 20
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
  - "frontend"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T20:11:10.881Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-21T22:44:47.693Z"
  updated_by: "CODER"
  note: "Verified Calc Paste Special presets, format-only Undo and external format handling. Full Office completed and all three failing Calc assertions and both unhandled keyboard events passed targeted retries. All four browser Calc-associated failures passed targeted retries on corrected expectations. Two previously documented Writer alignment failures remain. Inventory, tooling, static, and scoped post-fix Chrome checks passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-21T22:45:06.920Z"
  updated_by: "EVALUATOR"
  note: "The source Paste Special workflow and presets are connected, verified in browser and native Calc tests, and the tenth-task full checkpoint and focused remediation are recorded."
  evaluated_sha: "67eece481542ea68be090e2effd6070de9a4ac4d"
  blueprint_digest: "d95f8aa94500ed4cd503d16670e6ab6d03850381376451c9bc1d4ed99ca4c6d2"
  evidence_refs:
    - ".agentplane/tasks/202611212010-FJ8YQ4/README.md"
    - ".agentplane/tasks/202611212010-FJ8YQ4/quality/20261121-224506920-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611212010-FJ8YQ4/quality/20261121-224506920-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611212010-FJ8YQ4/quality/20261121-224506920-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611212010-FJ8YQ4/blueprint/resolved-snapshot.json"
    - "output/calc-task10-verification-progress.md"
    - "output/calc-task10-shortcut-retry.log"
    - "output/calc-task10-shortcut-browser-retry.log"
    - "output/calc-task10-full-office.log"
    - "output/calc-task10-full-browser.log"
  findings:
    - "Verified exact format-only behavior, undo ownership, combined flags, clipboard preferences, and default control availability against the task contract. Inspected the full Office and Chrome logs and scoped retries for all Calc failures and both uncaught keyboard events."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: connect Calc Paste Special presets and run the ten-task verification checkpoint."
events:
  -
    type: "status"
    at: "2026-11-21T20:11:11.766Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: connect Calc Paste Special presets and run the ten-task verification checkpoint."
  -
    type: "verify"
    at: "2026-11-21T22:44:47.693Z"
    author: "CODER"
    state: "ok"
    note: "Verified Calc Paste Special presets, format-only Undo and external format handling. Full Office completed and all three failing Calc assertions and both unhandled keyboard events passed targeted retries. All four browser Calc-associated failures passed targeted retries on corrected expectations. Two previously documented Writer alignment failures remain. Inventory, tooling, static, and scoped post-fix Chrome checks passed."
doc_version: 3
doc_updated_at: "2026-11-21T22:45:06.126Z"
doc_updated_by: "CODER"
description: "Enable the source Paste Special dialog for implemented clipboard mechanisms and run the ten-task test checkpoint."
sections:
  Summary: "Expose the source Calc Paste Special dialogs and presets. Run the scheduled full test checkpoint after the tenth task and keep the Calc goal active."
  Scope: "Connect the original same-workbook Paste Special dialog with its preset, paste, shift, options and operation groups. Enable the represented content types, Formats Only, values and formats, transpose and skip-empty. Keep unrepresented link, shift, arithmetic, comment and object services disabled. Route portable text through the source format selection and existing text import. Port tdf69450, exercise source preset defaults and history, and run the full Office, inventory, tooling and browser test suites. Preserve deliberate application I/O deviations."
  Plan: "Connect represented Paste Special controls and presets, format-only and skip-empty pattern operations, then run the tenth-task full checkpoint."
  Verify Steps: "Run focused clipboard, paste, format, Undo and workspace tests. Run Office TypeScript, changed-path ESLint and Prettier, resources, provenance, dependencies, policy routing and AgentPlane doctor. Run the full Office Vitest project, inventory, tooling and all browser projects as the tenth-task checkpoint."
  Verification: |-
    - Command: `cd apps/office && ../../node_modules/.bin/vitest run --config vitest.calc.config.ts --maxWorkers 2 --testTimeout 180000 clipboard paste-block paste-selection paste-editability reference-protocol impex calc-workbench calc-recalculation`. Result: pass. Evidence: 274 tests in 22 files, including tdf69450 and the Paste Special presets, external text format, formula owner and history.
    - Office TypeScript, changed-path Prettier and ESLint, Calc resources, source provenance, dependencies, policy routing and AgentPlane doctor passed. Doctor shows the existing managed hook readiness warning.
    - Production build and static output verification passed. The full browser checkpoint used the installed Google Chrome and the separate 4174 preview.
    - Inventory full run: 127 passed and three failed while checking Calc resource runtime declarations. After correction e5df97f80, all three cases passed together in the focused rerun. Together the runs verify 130 scenarios.
    - Command: `node_modules/.bin/vitest run --config vitest.tooling.config.ts --maxWorkers 1 --testTimeout 240000 --hookTimeout 180000`. Result: pass. Evidence: 194 tests in 47 files. The first npm-wrapper invocation rejected the duplicate worker setting before running any tests.
    - The full Office run exposed stale resource expectations for Tools, Copy and Paste. Updated these tests and the mirrored browser toolbar expectations in 4c277369f. The resource and clipboard Vitest retry passed all 21 tests in two files. The real browser toolbar passed at both configured viewport sizes, including accessibility checks.
    - The full Office run also exposed a stale assertion that native Excel A1 formula output was unsupported. Updated the check to assert the exact exported sheet-qualified formula in 19f546e1658e. The formula, range utility and Calc options retry passed all 40 tests in three files.
    - Both Writer cell-alignment browser scenarios reproduce the known mismatch from task 458SWH. The traces show Chromium returning `safe flex-end` for the assertion expecting `safe flow-end`.
    - Direct Chrome smoke with clipboard permissions on the built application passed. The Copy toolbar button and Ctrl+Shift+V opened the original preset dialog, Values Only pasted the source formula result as a constant, and Undo cleared the destination while preserving the source. Evidence: output/playwright/calc-task10/paste-special-*-evidence.log.
    - The Calc browser project finished with 112 passes and two stale standard-toolbar expectations in the original mirror. Both traces report the expected eight buttons and actual ten buttons. The two updated toolbar tests passed on the same built application, for 114 verified Calc browser scenarios across both runs.
    - Full Playwright: 607 passed and six failed across 613 scenarios (exit 1). The two Calc toolbar failures passed in the earlier targeted retry. Two shared scenarios for Calc narrow menus had a stale native root list that omitted Tools. Updated the complete Calc root list in 930fa7f2141f and ran all five shared menu cases, with three Calc and two Writer passes. Across the full run and retries, 611 distinct browser scenarios passed and two known Writer alignment failures remain.
    - Full Office Vitest: 33,957 passed, three failed and 23 skipped across 2,258 files (exit 1). All three failed Calc assertions passed after the test corrections. The full run also found two uncaught Calc keyboard events in otherwise passing scenarios. Reproduced both exceptions in isolation and fixed DOM key adaptation in 67eece481542. The scoped retry passed 60 tests in seven files, with zero unhandled errors. Across the full run and fixes, 33,960 active scenarios have passing evidence.
    - Post-fix TypeScript, changed-path lint and formatting, provenance, resources, dependencies, policy routing, AgentPlane doctor, Vite production build, and static smoke passed. The scoped Chrome retry passed all six cases on the rebuilt application, including Calc row and column selection and standard toolbar at both widths and Writer submenu Enter and Space.
  Rollback Plan: "Revert the clipboard implementation commits to restore the earlier command availability and admission mask without changing workbook data or I/O policy."
  Findings: |-
    The browser uses the original Calc Paste Special slot and accelerators. Internal cell transfers open the Insert Contents workflow with the pinned first-open defaults, four presets, the original Run immediately control, and session preferences. The unsupported arithmetic, link, shift, comment and object controls are disabled. External browser text presents the available format and then uses the existing text importer.

    The clipboard transaction now admits attribute-only copies and combined content, formatting and Skip Empty Cells. Format-only Undo neither clears nor re-creates formula cells. The mounted port of tdf69450 covers populated and styled-empty source cells. Additional mounted cases cover preserving a formula owner, combined presets and the external format dialog. CALC-817 records how the upstream session mask treats All on subsequent opens.

    The full browser and Office Vitest checkpoints completed. The previous Writer checkout owns localhost port 4173, so the browser suite uses a temporary mirror in output/playwright/calc-task10 on port 4174. The mirror changes only the preview origin in ten copied test files and uses the current Calc build. Playwright lists all 613 cases in 275 files. The full browser run keeps the toolbar expectations from the initial snapshot. Both updated toolbar scenarios and the two affected Calc overflow scenarios passed separately from the tracked test sources. The two baseline Writer alignment assertions reproduce the CSS value mismatch recorded in task 458SWH.

    The Calc edit focus tests reproduced uncaught exceptions when native DOM key values for + and a modified nonbreaking space reached the strict command-string parser. The browser adapter now translates the real plus key to the existing VCL ADD accelerator before parsing and ignores whitespace-only events other than an actual Space key. The registry preserves its validation of invalid command descriptions. The original editor selection and typing tests now complete without uncaught errors.
id_source: "generated"
---
## Summary

Expose the source Calc Paste Special dialogs and presets. Run the scheduled full test checkpoint after the tenth task and keep the Calc goal active.

## Scope

Connect the original same-workbook Paste Special dialog with its preset, paste, shift, options and operation groups. Enable the represented content types, Formats Only, values and formats, transpose and skip-empty. Keep unrepresented link, shift, arithmetic, comment and object services disabled. Route portable text through the source format selection and existing text import. Port tdf69450, exercise source preset defaults and history, and run the full Office, inventory, tooling and browser test suites. Preserve deliberate application I/O deviations.

## Plan

Connect represented Paste Special controls and presets, format-only and skip-empty pattern operations, then run the tenth-task full checkpoint.

## Verify Steps

Run focused clipboard, paste, format, Undo and workspace tests. Run Office TypeScript, changed-path ESLint and Prettier, resources, provenance, dependencies, policy routing and AgentPlane doctor. Run the full Office Vitest project, inventory, tooling and all browser projects as the tenth-task checkpoint.

## Verification

- Command: `cd apps/office && ../../node_modules/.bin/vitest run --config vitest.calc.config.ts --maxWorkers 2 --testTimeout 180000 clipboard paste-block paste-selection paste-editability reference-protocol impex calc-workbench calc-recalculation`. Result: pass. Evidence: 274 tests in 22 files, including tdf69450 and the Paste Special presets, external text format, formula owner and history.
- Office TypeScript, changed-path Prettier and ESLint, Calc resources, source provenance, dependencies, policy routing and AgentPlane doctor passed. Doctor shows the existing managed hook readiness warning.
- Production build and static output verification passed. The full browser checkpoint used the installed Google Chrome and the separate 4174 preview.
- Inventory full run: 127 passed and three failed while checking Calc resource runtime declarations. After correction e5df97f80, all three cases passed together in the focused rerun. Together the runs verify 130 scenarios.
- Command: `node_modules/.bin/vitest run --config vitest.tooling.config.ts --maxWorkers 1 --testTimeout 240000 --hookTimeout 180000`. Result: pass. Evidence: 194 tests in 47 files. The first npm-wrapper invocation rejected the duplicate worker setting before running any tests.
- The full Office run exposed stale resource expectations for Tools, Copy and Paste. Updated these tests and the mirrored browser toolbar expectations in 4c277369f. The resource and clipboard Vitest retry passed all 21 tests in two files. The real browser toolbar passed at both configured viewport sizes, including accessibility checks.
- The full Office run also exposed a stale assertion that native Excel A1 formula output was unsupported. Updated the check to assert the exact exported sheet-qualified formula in 19f546e1658e. The formula, range utility and Calc options retry passed all 40 tests in three files.
- Both Writer cell-alignment browser scenarios reproduce the known mismatch from task 458SWH. The traces show Chromium returning `safe flex-end` for the assertion expecting `safe flow-end`.
- Direct Chrome smoke with clipboard permissions on the built application passed. The Copy toolbar button and Ctrl+Shift+V opened the original preset dialog, Values Only pasted the source formula result as a constant, and Undo cleared the destination while preserving the source. Evidence: output/playwright/calc-task10/paste-special-*-evidence.log.
- The Calc browser project finished with 112 passes and two stale standard-toolbar expectations in the original mirror. Both traces report the expected eight buttons and actual ten buttons. The two updated toolbar tests passed on the same built application, for 114 verified Calc browser scenarios across both runs.
- Full Playwright: 607 passed and six failed across 613 scenarios (exit 1). The two Calc toolbar failures passed in the earlier targeted retry. Two shared scenarios for Calc narrow menus had a stale native root list that omitted Tools. Updated the complete Calc root list in 930fa7f2141f and ran all five shared menu cases, with three Calc and two Writer passes. Across the full run and retries, 611 distinct browser scenarios passed and two known Writer alignment failures remain.
- Full Office Vitest: 33,957 passed, three failed and 23 skipped across 2,258 files (exit 1). All three failed Calc assertions passed after the test corrections. The full run also found two uncaught Calc keyboard events in otherwise passing scenarios. Reproduced both exceptions in isolation and fixed DOM key adaptation in 67eece481542. The scoped retry passed 60 tests in seven files, with zero unhandled errors. Across the full run and fixes, 33,960 active scenarios have passing evidence.
- Post-fix TypeScript, changed-path lint and formatting, provenance, resources, dependencies, policy routing, AgentPlane doctor, Vite production build, and static smoke passed. The scoped Chrome retry passed all six cases on the rebuilt application, including Calc row and column selection and standard toolbar at both widths and Writer submenu Enter and Space.

## Rollback Plan

Revert the clipboard implementation commits to restore the earlier command availability and admission mask without changing workbook data or I/O policy.

## Findings

The browser uses the original Calc Paste Special slot and accelerators. Internal cell transfers open the Insert Contents workflow with the pinned first-open defaults, four presets, the original Run immediately control, and session preferences. The unsupported arithmetic, link, shift, comment and object controls are disabled. External browser text presents the available format and then uses the existing text importer.

The clipboard transaction now admits attribute-only copies and combined content, formatting and Skip Empty Cells. Format-only Undo neither clears nor re-creates formula cells. The mounted port of tdf69450 covers populated and styled-empty source cells. Additional mounted cases cover preserving a formula owner, combined presets and the external format dialog. CALC-817 records how the upstream session mask treats All on subsequent opens.

The full browser and Office Vitest checkpoints completed. The previous Writer checkout owns localhost port 4173, so the browser suite uses a temporary mirror in output/playwright/calc-task10 on port 4174. The mirror changes only the preview origin in ten copied test files and uses the current Calc build. Playwright lists all 613 cases in 275 files. The full browser run keeps the toolbar expectations from the initial snapshot. Both updated toolbar scenarios and the two affected Calc overflow scenarios passed separately from the tracked test sources. The two baseline Writer alignment assertions reproduce the CSS value mismatch recorded in task 458SWH.

The Calc edit focus tests reproduced uncaught exceptions when native DOM key values for + and a modified nonbreaking space reached the strict command-string parser. The browser adapter now translates the real plus key to the existing VCL ADD accelerator before parsing and ignores whitespace-only events other than an actual Space key. The registry preserves its validation of invalid command descriptions. The original editor selection and typing tests now complete without uncaught errors.
