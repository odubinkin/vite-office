---
id: "202609221204-Y797VJ"
title: "Fix Writer UI ruler, multi-paragraph formatting, lists, and sidebar controls"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-22T12:04:19.809Z"
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
    body: "Start: implementing the approved Writer UI corrections in the direct-mode checkout."
events:
  -
    type: "status"
    at: "2026-09-22T12:04:29.389Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implementing the approved Writer UI corrections in the direct-mode checkout."
doc_version: 3
doc_updated_at: "2026-09-22T12:04:29.389Z"
doc_updated_by: "CODER"
description: "Correct document-only ruler layout, apply character formatting across full and multi-paragraph selections, reconcile list marker/paragraph indentation and vertical alignment with pinned Writer behavior, and render sidebar commands as icon buttons."
sections:
  Summary: |-
    Fix Writer UI ruler, multi-paragraph formatting, lists, and sidebar controls

    Correct document-only ruler layout, apply character formatting across full and multi-paragraph selections, reconcile list marker/paragraph indentation and vertical alignment with pinned Writer behavior, and render sidebar commands as icon buttons.
  Scope: |-
    - In scope: Correct document-only ruler layout, apply character formatting across full and multi-paragraph selections, reconcile list marker/paragraph indentation and vertical alignment with pinned Writer behavior, and render sidebar commands as icon buttons.
    - Out of scope: unrelated refactors not required for "Fix Writer UI ruler, multi-paragraph formatting, lists, and sidebar controls".
  Plan: "1. Make the workspace ruler participate in the same desktop grid as the document canvas, excluding the sidebar. 2. Generalize selection-to-model formatting dispatch from same-paragraph ranges to ordered ranges across all selected paragraphs, retaining direction/caret restoration. 3. Compose list marker offsets with paragraph margins exactly once and align markers to the paragraph text line box; ensure marker typography inherits paragraph character properties where upstream semantics require it. 4. Supply Lucide icons for sidebar alignment/list actions while preserving command labels. 5. Add targeted regressions and run the declared unit, E2E, and static checks."
  Verify Steps: |-
    1. Run targeted unit tests for Writer selection mapping, editor projection, and command surfaces.
    2. Run Writer character-formatting and list Playwright specs, covering whole-paragraph and multi-paragraph selections plus marker placement.
    3. Run TypeScript/lint/build checks required by the package scripts.
    4. Confirm the horizontal ruler is constrained to the document canvas beside an open sidebar and sidebar command controls expose icon-only accessible buttons.
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

Fix Writer UI ruler, multi-paragraph formatting, lists, and sidebar controls

Correct document-only ruler layout, apply character formatting across full and multi-paragraph selections, reconcile list marker/paragraph indentation and vertical alignment with pinned Writer behavior, and render sidebar commands as icon buttons.

## Scope

- In scope: Correct document-only ruler layout, apply character formatting across full and multi-paragraph selections, reconcile list marker/paragraph indentation and vertical alignment with pinned Writer behavior, and render sidebar commands as icon buttons.
- Out of scope: unrelated refactors not required for "Fix Writer UI ruler, multi-paragraph formatting, lists, and sidebar controls".

## Plan

1. Make the workspace ruler participate in the same desktop grid as the document canvas, excluding the sidebar. 2. Generalize selection-to-model formatting dispatch from same-paragraph ranges to ordered ranges across all selected paragraphs, retaining direction/caret restoration. 3. Compose list marker offsets with paragraph margins exactly once and align markers to the paragraph text line box; ensure marker typography inherits paragraph character properties where upstream semantics require it. 4. Supply Lucide icons for sidebar alignment/list actions while preserving command labels. 5. Add targeted regressions and run the declared unit, E2E, and static checks.

## Verify Steps

1. Run targeted unit tests for Writer selection mapping, editor projection, and command surfaces.
2. Run Writer character-formatting and list Playwright specs, covering whole-paragraph and multi-paragraph selections plus marker placement.
3. Run TypeScript/lint/build checks required by the package scripts.
4. Confirm the horizontal ruler is constrained to the document canvas beside an open sidebar and sidebar command controls expose icon-only accessible buttons.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
