---
id: "202611280821-BZWR3G"
title: "Paint Calc Filled alignment and Shrink to fit in the grid"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
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
doc_updated_at: "2026-11-28T08:21:25.587Z"
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
  Findings: ""
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
