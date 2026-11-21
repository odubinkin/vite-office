---
id: "202611210659-458SWH"
title: "Connect Calc conditional formatting manager and rule editor"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 12
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T06:59:53.717Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Connect native Calc conditional formatting authoring and manager commands and verify the tenth regression checkpoint."
events:
  -
    type: "status"
    at: "2026-11-21T06:59:54.286Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Connect native Calc conditional formatting authoring and manager commands and verify the tenth regression checkpoint."
doc_version: 3
doc_updated_at: "2026-11-21T08:06:18.883Z"
doc_updated_by: "CODER"
description: "Expose the existing Calc conditional rule families, native range assignments and transactional manager through the upstream dialog, slot, and history structure."
sections:
  Summary: "Connect existing conditional formats to the source Calc rule editor and manager, on the active sheet, with native Sfx responses and undo."
  Scope: "Connect the Format conditional-format actions and the original editor and manager. Support the conditional-format families already represented in the core, with native rule order, named styles and range assignments. Port the source document-function and undo boundaries needed for add, replace and remove. Preserve unrelated formats, sheet state and file workflows. Run the scheduled full application regression cycle after the focused feature checks."
  Plan: "Model source command selection, range and rule drafts, and manager result exchange. Port native document mutations and undo with the existing format list and attributed cells. Build browser dialogs including reference selection. Verify focused regressions and the scheduled full test cycle."
  Verify Steps: |-
    - Run focused conditional-format dialog, range, grid, history, and selected ODS/XLSX settings regressions. Include upstream UI cases for manager edit/delete, range changes, condition-type changes, dates and color scales as applicable.
    - Run changed-path lint and format, tooling and office TypeScript, Calc resources, provenance, dependency and file-size checks.
    - Run the regular full office, inventory, tooling and browser suites and the static build after the tenth task implementation. Record exit status and counts for each.
  Verification: |-
    Implementation `448e6b30dcaf` and test type corrections `81623a51659f`.

    - Calc Vitest conditional-format suite: 5 passed. Covers the native quick rule, paint, range picking, formula reference origin, manager draft operations, Undo/Redo, and ODS/XLSX reopening.
    - Calc UI resource suite: 3 passed. The related run also passed all 3 print-area cases.
    - Playwright formatting toolbar: 2 passed, desktop and mobile Chrome.
    - Changed-path Prettier and ESLint, office and tooling TypeScript, Calc generated resources, module boundaries, source provenance and file size: passed.
    - Production build and static smoke: passed. Four relative JavaScript bundles and no backend endpoints.
    - Full inventory: exit 1, 117 passed and 13 failed. The 31-test retry passed 26. Four failures reproduce the same stale Writer parity marker on the clean baseline. One Writer parity CLI case exceeded its fixed 120-second timeout again.
    - Full tooling: exit 1, 192 passed and two compiler checks exceeded the 5-second timeout. Both checks passed on the targeted retry.

    The first Office coverage and full browser runs were interrupted after widespread test timeouts under memory pressure. Both exited 130. The full Office test restart uses one worker, a 600-second per-test timeout, and coverage disabled. The full browser restart follows it with one worker and longer waits. The final counts for those runs are pending.
  Rollback Plan: "Revert the implementation commits to restore the prior condition import and paint behavior and remove the newly exposed management commands."
  Findings: |-
    The implementation follows the pinned Calc condition slot routes, edit and manager ownership, conditional list and attributed cell associations, and undo command boundaries. The browser uses the worksheet's range selection and the existing Sfx dialog response lifecycle. The implemented rule families are cell comparisons, formulas, dates and two- or three-point color scales.

    The upstream quick editor wraps literal text in quotes without escaping embedded quotation marks. The port preserves this behavior and records it as CALC-792 in the Calc upstream suspected issues log.

    The tdf163897 regression repeats the upstream manager interactions with tdf105544.ods. The test reconstructs the archive without the unrelated database-range element so it reaches the conditional-format code in the existing importer. tdf119178 is covered through the browser's range picker and the resulting relative formula origin.

    The full inventory gate exposed an existing Writer parity evidence error. All four registry scopes report the missing `Color` marker in `apps/office/src/sw/browser/presentation/WriterBorderPage.tsx`. Running the same registry tests against clean baseline `b4398ddc1c6e` reproduced this error. Writer source and evidence are outside the conditional-format task scope.
id_source: "generated"
---
## Summary

Connect existing conditional formats to the source Calc rule editor and manager, on the active sheet, with native Sfx responses and undo.

## Scope

Connect the Format conditional-format actions and the original editor and manager. Support the conditional-format families already represented in the core, with native rule order, named styles and range assignments. Port the source document-function and undo boundaries needed for add, replace and remove. Preserve unrelated formats, sheet state and file workflows. Run the scheduled full application regression cycle after the focused feature checks.

## Plan

Model source command selection, range and rule drafts, and manager result exchange. Port native document mutations and undo with the existing format list and attributed cells. Build browser dialogs including reference selection. Verify focused regressions and the scheduled full test cycle.

## Verify Steps

- Run focused conditional-format dialog, range, grid, history, and selected ODS/XLSX settings regressions. Include upstream UI cases for manager edit/delete, range changes, condition-type changes, dates and color scales as applicable.
- Run changed-path lint and format, tooling and office TypeScript, Calc resources, provenance, dependency and file-size checks.
- Run the regular full office, inventory, tooling and browser suites and the static build after the tenth task implementation. Record exit status and counts for each.

## Verification

Implementation `448e6b30dcaf` and test type corrections `81623a51659f`.

- Calc Vitest conditional-format suite: 5 passed. Covers the native quick rule, paint, range picking, formula reference origin, manager draft operations, Undo/Redo, and ODS/XLSX reopening.
- Calc UI resource suite: 3 passed. The related run also passed all 3 print-area cases.
- Playwright formatting toolbar: 2 passed, desktop and mobile Chrome.
- Changed-path Prettier and ESLint, office and tooling TypeScript, Calc generated resources, module boundaries, source provenance and file size: passed.
- Production build and static smoke: passed. Four relative JavaScript bundles and no backend endpoints.
- Full inventory: exit 1, 117 passed and 13 failed. The 31-test retry passed 26. Four failures reproduce the same stale Writer parity marker on the clean baseline. One Writer parity CLI case exceeded its fixed 120-second timeout again.
- Full tooling: exit 1, 192 passed and two compiler checks exceeded the 5-second timeout. Both checks passed on the targeted retry.

The first Office coverage and full browser runs were interrupted after widespread test timeouts under memory pressure. Both exited 130. The full Office test restart uses one worker, a 600-second per-test timeout, and coverage disabled. The full browser restart follows it with one worker and longer waits. The final counts for those runs are pending.

## Rollback Plan

Revert the implementation commits to restore the prior condition import and paint behavior and remove the newly exposed management commands.

## Findings

The implementation follows the pinned Calc condition slot routes, edit and manager ownership, conditional list and attributed cell associations, and undo command boundaries. The browser uses the worksheet's range selection and the existing Sfx dialog response lifecycle. The implemented rule families are cell comparisons, formulas, dates and two- or three-point color scales.

The upstream quick editor wraps literal text in quotes without escaping embedded quotation marks. The port preserves this behavior and records it as CALC-792 in the Calc upstream suspected issues log.

The tdf163897 regression repeats the upstream manager interactions with tdf105544.ods. The test reconstructs the archive without the unrelated database-range element so it reaches the conditional-format code in the existing importer. tdf119178 is covered through the browser's range picker and the resulting relative formula origin.

The full inventory gate exposed an existing Writer parity evidence error. All four registry scopes report the missing `Color` marker in `apps/office/src/sw/browser/presentation/WriterBorderPage.tsx`. Running the same registry tests against clean baseline `b4398ddc1c6e` reproduced this error. Writer source and evidence are outside the conditional-format task scope.
