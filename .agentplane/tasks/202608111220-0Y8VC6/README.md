---
id: "202608111220-0Y8VC6"
title: "Implement Writer paragraph reordering"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 4
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-08-11T12:20:42.517Z"
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
    body: "Start: implementing the approved bounded Writer adjacent-paragraph reordering model, contextual controls, history and storage behavior, provenance documentation, and focused evidence."
events:
  -
    type: "status"
    at: "2026-08-11T12:20:47.728Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implementing the approved bounded Writer adjacent-paragraph reordering model, contextual controls, history and storage behavior, provenance documentation, and focused evidence."
doc_version: 3
doc_updated_at: "2026-08-11T12:20:47.728Z"
doc_updated_by: "CODER"
description: "Add a bounded immutable Writer paragraph reordering capability that moves one selected paragraph one position up or down while preserving its text, style, alignment, identity, browser-local persistence, and undo/redo behavior. Expose contextual accessible movement controls in the Writer document canvas and map the narrow operation to pinned Writer MoveParagraph evidence without claiming change tracking, range selection, or layout parity."
sections:
  Summary: |-
    Implement Writer paragraph reordering

    Add a bounded immutable Writer paragraph reordering capability that moves one selected paragraph one position up or down while preserving its text, style, alignment, identity, browser-local persistence, and undo/redo behavior. Expose contextual accessible movement controls in the Writer document canvas and map the narrow operation to pinned Writer MoveParagraph evidence without claiming change tracking, range selection, or layout parity.
  Scope: |-
    - In scope: Add a bounded immutable Writer paragraph reordering capability that moves one selected paragraph one position up or down while preserving its text, style, alignment, identity, browser-local persistence, and undo/redo behavior. Expose contextual accessible movement controls in the Writer document canvas and map the narrow operation to pinned Writer MoveParagraph evidence without claiming change tracking, range selection, or layout parity.
    - Out of scope: unrelated refactors not required for "Implement Writer paragraph reordering".
  Plan: "1. Add a pure Writer-domain transition that moves a named paragraph exactly one adjacent position in the requested direction, preserves all paragraph objects and data, marks a changed document dirty, and rejects absent IDs or out-of-bounds requests. 2. Wire contextual Move paragraph up/down controls into WriterPlainTextEditor; apply movements through immutable history, preserve or deterministically update active focus, and retain the ordering through browser-local save/load. 3. Add domain, storage, React integration, and targeted production-browser accessibility tests for order, boundaries, focus, undo/redo, styles, and alignment retention. 4. Document the bounded feature with pinned MoveParagraph upstream UIWriter provenance and explicit gaps around change tracking, selection, layout, and document formats. 5. Run Prettier, lint, typecheck, JSDoc check, file-size check, focused 100% coverage, targeted Playwright/axe, diff check, AgentPlane doctor, and routing validation. Defer static/inventory/full aggregation under the approved every-ten-tasks cadence and record residual risks."
  Verify Steps: |-
    PLANNER fallback scaffold. Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the changed artifact or behavior for the `code` task. Expected: the requested outcome is visible and matches the approved scope.
    2. Run the most relevant validation step for the `code` task. Expected: it succeeds without unexpected regressions in touched scope.
    3. Compare the final result against the task summary and scope. Expected: any remaining follow-up is explicit in ## Findings.
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

Implement Writer paragraph reordering

Add a bounded immutable Writer paragraph reordering capability that moves one selected paragraph one position up or down while preserving its text, style, alignment, identity, browser-local persistence, and undo/redo behavior. Expose contextual accessible movement controls in the Writer document canvas and map the narrow operation to pinned Writer MoveParagraph evidence without claiming change tracking, range selection, or layout parity.

## Scope

- In scope: Add a bounded immutable Writer paragraph reordering capability that moves one selected paragraph one position up or down while preserving its text, style, alignment, identity, browser-local persistence, and undo/redo behavior. Expose contextual accessible movement controls in the Writer document canvas and map the narrow operation to pinned Writer MoveParagraph evidence without claiming change tracking, range selection, or layout parity.
- Out of scope: unrelated refactors not required for "Implement Writer paragraph reordering".

## Plan

1. Add a pure Writer-domain transition that moves a named paragraph exactly one adjacent position in the requested direction, preserves all paragraph objects and data, marks a changed document dirty, and rejects absent IDs or out-of-bounds requests. 2. Wire contextual Move paragraph up/down controls into WriterPlainTextEditor; apply movements through immutable history, preserve or deterministically update active focus, and retain the ordering through browser-local save/load. 3. Add domain, storage, React integration, and targeted production-browser accessibility tests for order, boundaries, focus, undo/redo, styles, and alignment retention. 4. Document the bounded feature with pinned MoveParagraph upstream UIWriter provenance and explicit gaps around change tracking, selection, layout, and document formats. 5. Run Prettier, lint, typecheck, JSDoc check, file-size check, focused 100% coverage, targeted Playwright/axe, diff check, AgentPlane doctor, and routing validation. Defer static/inventory/full aggregation under the approved every-ten-tasks cadence and record residual risks.

## Verify Steps

PLANNER fallback scaffold. Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the changed artifact or behavior for the `code` task. Expected: the requested outcome is visible and matches the approved scope.
2. Run the most relevant validation step for the `code` task. Expected: it succeeds without unexpected regressions in touched scope.
3. Compare the final result against the task summary and scope. Expected: any remaining follow-up is explicit in ## Findings.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
