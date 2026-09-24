---
id: "202609241135-WGR5X8"
title: "F1 Align Writer indent with MoveLeftMargin and NumUpDown"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "parity"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-24T11:35:57.309Z"
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
    body: "Start: implement F1 from the approved upstream parity plan, preserving pinned Writer indent ownership and behavior."
events:
  -
    type: "status"
    at: "2026-09-24T11:35:58.576Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement F1 from the approved upstream parity plan, preserving pinned Writer indent ownership and behavior."
doc_version: 3
doc_updated_at: "2026-09-24T11:35:58.576Z"
doc_updated_by: "CODER"
description: "Implement F1 from docs/program/vite-office-upstream-parity-plan.md: use upstream text shell dispatch, SwEditShell and SwDoc ownership, document tab defaults, selected paragraphs, layout bounds and undo."
sections:
  Summary: |-
    F1 Align Writer indent with MoveLeftMargin and NumUpDown

    Implement F1 from docs/program/vite-office-upstream-parity-plan.md: use upstream text shell dispatch, SwEditShell and SwDoc ownership, document tab defaults, selected paragraphs, layout bounds and undo.
  Scope: |-
    - In scope: Implement F1 from docs/program/vite-office-upstream-parity-plan.md: use upstream text shell dispatch, SwEditShell and SwDoc ownership, document tab defaults, selected paragraphs, layout bounds and undo.
    - Out of scope: unrelated refactors not required for "F1 Align Writer indent with MoveLeftMargin and NumUpDown".
  Plan: |-
    1. Compare pinned indent execution and enabled state with local shell, selection and document models.
    2. Move MoveLeftMargin calculation into SwDoc and selection traversal into an edit-shell owner, keeping text-shell slot choice; add focused differential tests.
    3. Update source provenance and runtime inventory data for changed modules and run all declared checks.
  Verify Steps: |-
    1. Focused Writer indent tests cover document default tab distance, multi-paragraph selection, list NumUpDown, undo/redo, both directions, modifier and layout bounds.
    2. Source ownership matches pinned textsh1.cxx, edattr.cxx and docfmt.cxx; no 1134 hardcode except upstream fallback.
    3. npm run verify passes; source provenance and runtime inventory data match changed paths.
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

F1 Align Writer indent with MoveLeftMargin and NumUpDown

Implement F1 from docs/program/vite-office-upstream-parity-plan.md: use upstream text shell dispatch, SwEditShell and SwDoc ownership, document tab defaults, selected paragraphs, layout bounds and undo.

## Scope

- In scope: Implement F1 from docs/program/vite-office-upstream-parity-plan.md: use upstream text shell dispatch, SwEditShell and SwDoc ownership, document tab defaults, selected paragraphs, layout bounds and undo.
- Out of scope: unrelated refactors not required for "F1 Align Writer indent with MoveLeftMargin and NumUpDown".

## Plan

1. Compare pinned indent execution and enabled state with local shell, selection and document models.
2. Move MoveLeftMargin calculation into SwDoc and selection traversal into an edit-shell owner, keeping text-shell slot choice; add focused differential tests.
3. Update source provenance and runtime inventory data for changed modules and run all declared checks.

## Verify Steps

1. Focused Writer indent tests cover document default tab distance, multi-paragraph selection, list NumUpDown, undo/redo, both directions, modifier and layout bounds.
2. Source ownership matches pinned textsh1.cxx, edattr.cxx and docfmt.cxx; no 1134 hardcode except upstream fallback.
3. npm run verify passes; source provenance and runtime inventory data match changed paths.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
