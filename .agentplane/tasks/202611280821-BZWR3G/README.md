---
id: "202611280821-BZWR3G"
title: "Paint Calc Filled alignment and Shrink to fit in the grid"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-28T08:21:17.009Z"
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
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-11-28T08:21:25.587Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-11-28T08:31:20.141Z"
doc_updated_by: "CODER"
description: "Connect Calc's Filled alignment and Shrink to fit attributes to the existing grid text painter. Preserve the ScOutputData admission order for wrapping, repetition and shrinking. Resolve text extent from the rendered script font runs in the browser content box, including margin and merged geometry. Apply the pinned repeat count and bounded scaling decisions, keeping the actual stored/displayed cell value, accessibility, in-cell editor and history contracts. Keep the resulting browser text layout under its existing drawing and clipping boundaries."
sections:
  Summary: |-
    Paint Calc Filled alignment and Shrink to fit in the grid

    Connect Calc's Filled alignment and Shrink to fit attributes to the existing grid text painter. Preserve the ScOutputData admission order for wrapping, repetition and shrinking. Resolve text extent from the rendered script font runs in the browser content box, including margin and merged geometry. Apply the pinned repeat count and bounded scaling decisions, keeping the actual stored/displayed cell value, accessibility, in-cell editor and history contracts. Keep the resulting browser text layout under its existing drawing and clipping boundaries.
  Scope: "Connect Calc's Filled alignment and Shrink to fit attributes to the existing grid text painter. Preserve the ScOutputData admission order for wrapping, repetition and shrinking. Resolve text extent from the rendered script font runs in the browser content box, including margin and merged geometry. Apply the pinned repeat count and bounded scaling decisions, keeping the actual stored/displayed cell value, accessibility, in-cell editor and history contracts. Keep the resulting browser text layout under its existing drawing and clipping boundaries."
  Plan: "Connect native fit-mode admission, measure actual script runs, render whole repetitions and bounded scaling, and verify with affected source and browser cases."
  Verify Steps: |-
    - Trace the pinned ScOutputData Fill and Shrink decisions, use the existing grid text rendering entry point, and port relevant upstream assertions for the represented behavior.
    - Run only targeted cell text layout, selection, ODS and overlap tests and real browser cases for measured repetition and scaling. Use one worker by default.
    - Verify toggling through normal Format Cells, whole repetitions, empty and too-wide text, the priority of wrapping, resize, merge and Undo/Redo.
    - Run changed-source lint, format, JSDoc, types, dependency boundaries, scoped provenance and AgentPlane checks. Record verified inherited diagnostics.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: |-
    - **Command:** Scoped Vitest for output2, calc-cell-text-layout, calc-font-step, calc-boundary-controls, calc-wrap-text and calc-merge-cells with one worker. **Result:** pass. **Evidence:** 26 tests across six files. **Scope:** native fit admission, repeat and retry arithmetic, the source wrap and shrink flag matrix projected to ODS, merged cells, font runs, wrapping and accessibility.
    - **Command:** Production build and Chromium Calc `cell-text-fit.spec.ts` with one worker, using the installed Chromium headless shell 1228. **Result:** all three scenarios passed across the initial and narrow-fixture runs. **Evidence:** two viewport assertions passed on the final production build; the overflow-mark scenario passed after making its column narrow enough that the actual font could not fit. **Scope:** applied alignment choices, actual browser text metrics, column width, merged geometry, wrap priority, Undo, and numeric overflow without changing the accessible value.
    - **Command:** Changed-source ESLint, Prettier, JSDoc and provenance, Office app build/typecheck, dependency and source-tree checks, AgentPlane routing and doctor. **Result:** pass. **Evidence:** scoped validations passed with the existing AgentPlane hook-readiness warning. **Scope:** affected sources and registry paths.
    - **Command:** Global source provenance and Calc inventory. **Result:** fail at inherited evidence. **Evidence:** missing Writer overline and shared XML style rawLineStart markers. **Scope:** unrelated global metadata diagnostics.
    - **Boundary:** The browser measures rendered script runs in a cell content box. Native printer-device metric differences and drawing over adjacent cells remain outside the existing grid painting boundary. The source wrap and shrink matrix is exercised via ODS rather than the legacy SpreadsheetML importer.
id_source: "generated"
---
## Summary

Paint Calc Filled alignment and Shrink to fit in the grid

Connect Calc's Filled alignment and Shrink to fit attributes to the existing grid text painter. Preserve the ScOutputData admission order for wrapping, repetition and shrinking. Resolve text extent from the rendered script font runs in the browser content box, including margin and merged geometry. Apply the pinned repeat count and bounded scaling decisions, keeping the actual stored/displayed cell value, accessibility, in-cell editor and history contracts. Keep the resulting browser text layout under its existing drawing and clipping boundaries.

## Scope

Connect Calc's Filled alignment and Shrink to fit attributes to the existing grid text painter. Preserve the ScOutputData admission order for wrapping, repetition and shrinking. Resolve text extent from the rendered script font runs in the browser content box, including margin and merged geometry. Apply the pinned repeat count and bounded scaling decisions, keeping the actual stored/displayed cell value, accessibility, in-cell editor and history contracts. Keep the resulting browser text layout under its existing drawing and clipping boundaries.

## Plan

Connect native fit-mode admission, measure actual script runs, render whole repetitions and bounded scaling, and verify with affected source and browser cases.

## Verify Steps

- Trace the pinned ScOutputData Fill and Shrink decisions, use the existing grid text rendering entry point, and port relevant upstream assertions for the represented behavior.
- Run only targeted cell text layout, selection, ODS and overlap tests and real browser cases for measured repetition and scaling. Use one worker by default.
- Verify toggling through normal Format Cells, whole repetitions, empty and too-wide text, the priority of wrapping, resize, merge and Undo/Redo.
- Run changed-source lint, format, JSDoc, types, dependency boundaries, scoped provenance and AgentPlane checks. Record verified inherited diagnostics.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

- **Command:** Scoped Vitest for output2, calc-cell-text-layout, calc-font-step, calc-boundary-controls, calc-wrap-text and calc-merge-cells with one worker. **Result:** pass. **Evidence:** 26 tests across six files. **Scope:** native fit admission, repeat and retry arithmetic, the source wrap and shrink flag matrix projected to ODS, merged cells, font runs, wrapping and accessibility.
- **Command:** Production build and Chromium Calc `cell-text-fit.spec.ts` with one worker, using the installed Chromium headless shell 1228. **Result:** all three scenarios passed across the initial and narrow-fixture runs. **Evidence:** two viewport assertions passed on the final production build; the overflow-mark scenario passed after making its column narrow enough that the actual font could not fit. **Scope:** applied alignment choices, actual browser text metrics, column width, merged geometry, wrap priority, Undo, and numeric overflow without changing the accessible value.
- **Command:** Changed-source ESLint, Prettier, JSDoc and provenance, Office app build/typecheck, dependency and source-tree checks, AgentPlane routing and doctor. **Result:** pass. **Evidence:** scoped validations passed with the existing AgentPlane hook-readiness warning. **Scope:** affected sources and registry paths.
- **Command:** Global source provenance and Calc inventory. **Result:** fail at inherited evidence. **Evidence:** missing Writer overline and shared XML style rawLineStart markers. **Scope:** unrelated global metadata diagnostics.
- **Boundary:** The browser measures rendered script runs in a cell content box. Native printer-device metric differences and drawing over adjacent cells remain outside the existing grid painting boundary. The source wrap and shrink matrix is exercised via ODS rather than the legacy SpreadsheetML importer.
