---
id: "202611280923-SNE18T"
title: "Port Writer ODT placeholders and drop-down text fields"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 4
origin:
  system: "manual"
depends_on: []
tags:
  - "writer"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-28T09:23:52.565Z"
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
    body: "Start: Port the native placeholder and drop-down Writer text field contracts through the ODT filters and Worker."
events:
  -
    type: "status"
    at: "2026-11-28T09:23:52.987Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Port the native placeholder and drop-down Writer text field contracts through the ODT filters and Worker."
doc_version: 3
doc_updated_at: "2026-11-28T09:23:52.987Z"
doc_updated_by: "CODER"
description: "Preserve the native JumpEdit and DropDown text field owners, UNO properties, ODF element contracts, and Worker transfer. Replay the pinned Writer placeholder fixture and verify the represented drop-down options, default presentation and authored selection."
sections:
  Summary: |-
    Port Writer ODT placeholders and drop-down text fields

    Preserve the native JumpEdit and DropDown text field owners, UNO properties, ODF element contracts, and Worker transfer. Replay the pinned Writer placeholder fixture and verify the represented drop-down options, default presentation and authored selection.
  Scope: |-
    - In scope: Preserve the native JumpEdit and DropDown text field owners, UNO properties, ODF element contracts, and Worker transfer. Replay the pinned Writer placeholder fixture and verify the represented drop-down options, default presentation and authored selection.
    - Out of scope: unrelated refactors not required for "Port Writer ODT placeholders and drop-down text fields".
  Plan: "Trace SwJumpEditField, SwDropDownField, their UNO property maps and both ODF field contexts. Keep the original field types, format enum, selected item matching and expansion behavior. Connect native text points, ODT read and write, and browser Worker records, with the original source names and typed properties. Replay the pinned testTdf106663.odt placeholder fields and verify one authored drop-down roundtrip. Keep browser file/save and recovery behavior. Run only the affected tests."
  Verify Steps: |-
    PLANNER fallback scaffold for "Port Writer ODT placeholders and drop-down text fields". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Port Writer ODT placeholders and drop-down text fields". Expected: the visible result matches ## Summary and stays inside approved scope.
    2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
    3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.
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

Port Writer ODT placeholders and drop-down text fields

Preserve the native JumpEdit and DropDown text field owners, UNO properties, ODF element contracts, and Worker transfer. Replay the pinned Writer placeholder fixture and verify the represented drop-down options, default presentation and authored selection.

## Scope

- In scope: Preserve the native JumpEdit and DropDown text field owners, UNO properties, ODF element contracts, and Worker transfer. Replay the pinned Writer placeholder fixture and verify the represented drop-down options, default presentation and authored selection.
- Out of scope: unrelated refactors not required for "Port Writer ODT placeholders and drop-down text fields".

## Plan

Trace SwJumpEditField, SwDropDownField, their UNO property maps and both ODF field contexts. Keep the original field types, format enum, selected item matching and expansion behavior. Connect native text points, ODT read and write, and browser Worker records, with the original source names and typed properties. Replay the pinned testTdf106663.odt placeholder fields and verify one authored drop-down roundtrip. Keep browser file/save and recovery behavior. Run only the affected tests.

## Verify Steps

PLANNER fallback scaffold for "Port Writer ODT placeholders and drop-down text fields". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Port Writer ODT placeholders and drop-down text fields". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
