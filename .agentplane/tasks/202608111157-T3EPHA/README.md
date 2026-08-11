---
id: "202608111157-T3EPHA"
title: "Implement Writer paragraph alignment controls"
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
  updated_at: "2026-08-11T11:57:16.712Z"
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
    body: "Start: implementing the approved bounded Writer paragraph alignment model, toolbar controls, property feedback, documentation, and focused evidence without expanding into layout or file-format scope."
events:
  -
    type: "status"
    at: "2026-08-11T11:57:21.473Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implementing the approved bounded Writer paragraph alignment model, toolbar controls, property feedback, documentation, and focused evidence without expanding into layout or file-format scope."
doc_version: 3
doc_updated_at: "2026-08-11T11:57:21.473Z"
doc_updated_by: "CODER"
description: "Add a bounded immutable paragraph-alignment capability to the Writer workbench, using the existing LibreOffice-style formatting toolbar and properties sidebar while preserving the project visual language. Map the implemented left, center, right, and justified behavior to pinned upstream Writer UI command evidence; do not claim rich-text layout, ODT, or full Writer parity."
sections:
  Summary: |-
    Implement Writer paragraph alignment controls

    Add a bounded immutable paragraph-alignment capability to the Writer workbench, using the existing LibreOffice-style formatting toolbar and properties sidebar while preserving the project visual language. Map the implemented left, center, right, and justified behavior to pinned upstream Writer UI command evidence; do not claim rich-text layout, ODT, or full Writer parity.
  Scope: |-
    - In scope: Add a bounded immutable paragraph-alignment capability to the Writer workbench, using the existing LibreOffice-style formatting toolbar and properties sidebar while preserving the project visual language. Map the implemented left, center, right, and justified behavior to pinned upstream Writer UI command evidence; do not claim rich-text layout, ODT, or full Writer parity.
    - Out of scope: unrelated refactors not required for "Implement Writer paragraph alignment controls".
  Plan: "1. Extend the immutable Writer paragraph model with an explicit alignment value and a pure transition that validates paragraph identity, preserves no-op references, marks changed documents dirty, and participates in history/storage. 2. Track the focused Writer paragraph in the workbench so alignment commands apply to the active textarea; expose left, center, right, and justified commands in the existing formatting toolbar and current alignment feedback in the properties sidebar. 3. Render each textarea using its paragraph alignment without implementing rich text, pagination, ODT, or native LibreOffice layout. 4. Add domain and workbench tests for state transitions, active-paragraph targeting, undo/redo, local save/load, and semantic placement; document the bounded behavior with pinned upstream UI/help provenance (sw/uiconfig/swriter/ui/notebookbar*.ui and text/shared/01/05080400.xhp). 5. Run formatting, lint, typecheck, JSDoc checks, focused app coverage, targeted production Playwright/axe, diff check, AgentPlane doctor, and routing validation. Defer static/inventory/full aggregate verification under the approved every-ten-tasks cadence; record the residual risk."
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

Implement Writer paragraph alignment controls

Add a bounded immutable paragraph-alignment capability to the Writer workbench, using the existing LibreOffice-style formatting toolbar and properties sidebar while preserving the project visual language. Map the implemented left, center, right, and justified behavior to pinned upstream Writer UI command evidence; do not claim rich-text layout, ODT, or full Writer parity.

## Scope

- In scope: Add a bounded immutable paragraph-alignment capability to the Writer workbench, using the existing LibreOffice-style formatting toolbar and properties sidebar while preserving the project visual language. Map the implemented left, center, right, and justified behavior to pinned upstream Writer UI command evidence; do not claim rich-text layout, ODT, or full Writer parity.
- Out of scope: unrelated refactors not required for "Implement Writer paragraph alignment controls".

## Plan

1. Extend the immutable Writer paragraph model with an explicit alignment value and a pure transition that validates paragraph identity, preserves no-op references, marks changed documents dirty, and participates in history/storage. 2. Track the focused Writer paragraph in the workbench so alignment commands apply to the active textarea; expose left, center, right, and justified commands in the existing formatting toolbar and current alignment feedback in the properties sidebar. 3. Render each textarea using its paragraph alignment without implementing rich text, pagination, ODT, or native LibreOffice layout. 4. Add domain and workbench tests for state transitions, active-paragraph targeting, undo/redo, local save/load, and semantic placement; document the bounded behavior with pinned upstream UI/help provenance (sw/uiconfig/swriter/ui/notebookbar*.ui and text/shared/01/05080400.xhp). 5. Run formatting, lint, typecheck, JSDoc checks, focused app coverage, targeted production Playwright/axe, diff check, AgentPlane doctor, and routing validation. Defer static/inventory/full aggregate verification under the approved every-ten-tasks cadence; record the residual risk.

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
