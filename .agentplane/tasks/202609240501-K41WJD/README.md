---
id: "202609240501-K41WJD"
title: "Restore Writer shell and UI command contracts"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on:
  - "202609240501-JB34TJ"
tags:
  - "code"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-24T07:17:30.432Z"
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
    body: "Start: move paragraph and ruler command policy into Writer shells with binding-backed state."
events:
  -
    type: "status"
    at: "2026-09-24T07:17:43.165Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: move paragraph and ruler command policy into Writer shells with binding-backed state."
doc_version: 3
doc_updated_at: "2026-09-24T07:17:43.165Z"
doc_updated_by: "CODER"
description: "Stage 4: move paragraph and ruler policy, validation, command state and dialog commit behavior from React into upstream-shaped shells and bindings"
sections:
  Summary: |-
    Restore Writer shell and UI command contracts

    Stage 4: move paragraph and ruler policy, validation, command state and dialog commit behavior from React into upstream-shaped shells and bindings
  Scope: |-
    - In scope: Stage 4: move paragraph and ruler policy, validation, command state and dialog commit behavior from React into upstream-shaped shells and bindings.
    - Out of scope: unrelated refactors not required for "Restore Writer shell and UI command contracts".
  Plan: |-
    1. Compare the supported paragraph dialog, line-spacing, tab-stop, ruler, and command-state branches with pinned SwTextShell, SwWrtShell, SwView, editeng items, and ruler sources. Keep browser gesture coordinates and drafts in React.
    2. Move tab-stop preservation, pooled item construction, value validation and multi-paragraph undoable dialog application into SwTextShell/SwWrtShell. React submits primitive draft values; cancelled or unchanged dialogs create no model action.
    3. Route ruler page-margin, paragraph-indent and tab-stop gestures as deltas or positions into shell methods; shell applies bounds and item transitions. Use existing SfxBindings state and generated command resources for supported menu/toolbar/shortcut actions.
    4. Add focused mixed-selection, unchanged, invalid, cancelled, pointer/keyboard and undo/redo tests for supported branches; update parity/provenance data only for verified ownership. Run npm run verify. Browser save UI/workflows and autosave stay unchanged.
  Verify Steps: |-
    1. No production React component creates pooled paragraph items or commits ruler model values. SwTextShell/SwWrtShell own conversion, validation, preservation of tab adjustment/leader fields, and one undo group for a multi-item or mixed selection edit. Source excerpts and focused assertions identify the pinned upstream responsibility.
    2. Paragraph dialog Cancel leaves state/history unchanged; OK with unchanged values is a no-op; invalid tab/spacing inputs do not mutate; edited tab stops retain existing alignment/leader when positions remain. Ruler pointer commits and dialog values go through shell APIs and undo/redo works.
    3. Existing menu, toolbar, accelerator and status surfaces resolve generated resources and live SfxBindings state for every supported command; focused keyboard and pointer tests confirm enabled/checked behavior. Browser save workflow and autosave have no changed paths.
    4. Run npm run verify, update existing inventory/provenance data with bounded evidence, and inspect the task-scoped diff and clean tracked state.
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

Restore Writer shell and UI command contracts

Stage 4: move paragraph and ruler policy, validation, command state and dialog commit behavior from React into upstream-shaped shells and bindings

## Scope

- In scope: Stage 4: move paragraph and ruler policy, validation, command state and dialog commit behavior from React into upstream-shaped shells and bindings.
- Out of scope: unrelated refactors not required for "Restore Writer shell and UI command contracts".

## Plan

1. Compare the supported paragraph dialog, line-spacing, tab-stop, ruler, and command-state branches with pinned SwTextShell, SwWrtShell, SwView, editeng items, and ruler sources. Keep browser gesture coordinates and drafts in React.
2. Move tab-stop preservation, pooled item construction, value validation and multi-paragraph undoable dialog application into SwTextShell/SwWrtShell. React submits primitive draft values; cancelled or unchanged dialogs create no model action.
3. Route ruler page-margin, paragraph-indent and tab-stop gestures as deltas or positions into shell methods; shell applies bounds and item transitions. Use existing SfxBindings state and generated command resources for supported menu/toolbar/shortcut actions.
4. Add focused mixed-selection, unchanged, invalid, cancelled, pointer/keyboard and undo/redo tests for supported branches; update parity/provenance data only for verified ownership. Run npm run verify. Browser save UI/workflows and autosave stay unchanged.

## Verify Steps

1. No production React component creates pooled paragraph items or commits ruler model values. SwTextShell/SwWrtShell own conversion, validation, preservation of tab adjustment/leader fields, and one undo group for a multi-item or mixed selection edit. Source excerpts and focused assertions identify the pinned upstream responsibility.
2. Paragraph dialog Cancel leaves state/history unchanged; OK with unchanged values is a no-op; invalid tab/spacing inputs do not mutate; edited tab stops retain existing alignment/leader when positions remain. Ruler pointer commits and dialog values go through shell APIs and undo/redo works.
3. Existing menu, toolbar, accelerator and status surfaces resolve generated resources and live SfxBindings state for every supported command; focused keyboard and pointer tests confirm enabled/checked behavior. Browser save workflow and autosave have no changed paths.
4. Run npm run verify, update existing inventory/provenance data with bounded evidence, and inspect the task-scoped diff and clean tracked state.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
