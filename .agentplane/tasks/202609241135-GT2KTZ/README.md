---
id: "202609241135-GT2KTZ"
title: "F5 Simplify Writer presentation layers"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on:
  - "202609241135-S2WG4Q"
tags:
  - "code"
  - "parity"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-24T13:13:57.938Z"
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
    body: "Start: split Writer presentation by interaction while preserving bindings and controller ownership."
events:
  -
    type: "status"
    at: "2026-09-24T13:14:08.267Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: split Writer presentation by interaction while preserving bindings and controller ownership."
doc_version: 3
doc_updated_at: "2026-09-24T13:14:08.267Z"
doc_updated_by: "CODER"
description: "Implement F5: split oversized controls by interaction and remove duplicate wrappers/state while preserving command bridge and accessibility."
sections:
  Summary: |-
    F5 Simplify Writer presentation layers

    Implement F5: split oversized controls by interaction and remove duplicate wrappers/state while preserving command bridge and accessibility.
  Scope: |-
    - In scope: Implement F5: split oversized controls by interaction and remove duplicate wrappers/state while preserving command bridge and accessibility.
    - Out of scope: unrelated refactors not required for "F5 Simplify Writer presentation layers".
  Plan: "Split the oversized advanced formatting presenter by browser interaction into color selector, paragraph dialog, and their toolbar composition while keeping one WriterDialogController request and one BrowserCommandSource bridge. Reduce WriterFormattingToolbar selector adapters and wrapper logic only where generated resource identity and binding state remain intact; keep writer-view-projection the sole immutable view projection. Preserve current command labels, keyboard/focus, ruler, save behavior and source provenance. Verify each rendered control dispatches exactly once, no duplicate model authority is introduced, all existing presentation tests and full npm run verify pass, and exact inventory/provenance data are updated only when paths change."
  Verify Steps: "1. Writer advanced formatting is split into focused browser presenters for color controls and paragraph dialog while preserving one command bridge and one dialog request owner; no React component stores canonical model or layout state. 2. Generated Writer resource identities, placement and binding-backed values still drive menu/toolbar/keyboard/sidebar behavior; color, spacing, paragraph and line-number interactions dispatch exactly once, with accessible labels, focus and cancellation covered by tests. 3. The sole writer-view-projection and documented ruler boundary remain; imports, exact provenance/inventory data and full npm run verify plus git diff --check pass."
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

F5 Simplify Writer presentation layers

Implement F5: split oversized controls by interaction and remove duplicate wrappers/state while preserving command bridge and accessibility.

## Scope

- In scope: Implement F5: split oversized controls by interaction and remove duplicate wrappers/state while preserving command bridge and accessibility.
- Out of scope: unrelated refactors not required for "F5 Simplify Writer presentation layers".

## Plan

Split the oversized advanced formatting presenter by browser interaction into color selector, paragraph dialog, and their toolbar composition while keeping one WriterDialogController request and one BrowserCommandSource bridge. Reduce WriterFormattingToolbar selector adapters and wrapper logic only where generated resource identity and binding state remain intact; keep writer-view-projection the sole immutable view projection. Preserve current command labels, keyboard/focus, ruler, save behavior and source provenance. Verify each rendered control dispatches exactly once, no duplicate model authority is introduced, all existing presentation tests and full npm run verify pass, and exact inventory/provenance data are updated only when paths change.

## Verify Steps

1. Writer advanced formatting is split into focused browser presenters for color controls and paragraph dialog while preserving one command bridge and one dialog request owner; no React component stores canonical model or layout state. 2. Generated Writer resource identities, placement and binding-backed values still drive menu/toolbar/keyboard/sidebar behavior; color, spacing, paragraph and line-number interactions dispatch exactly once, with accessible labels, focus and cancellation covered by tests. 3. The sole writer-view-projection and documented ruler boundary remain; imports, exact provenance/inventory data and full npm run verify plus git diff --check pass.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
