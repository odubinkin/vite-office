---
id: "202611281054-0HRQHN"
title: "Align Calc ODS text search and character-position functions with LibreOffice"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 4
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-28T10:54:16.711Z"
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
    body: "Start: align native text search and character-position formula families."
events:
  -
    type: "status"
    at: "2026-11-28T10:54:17.128Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: align native text search and character-position formula families."
doc_version: 3
doc_updated_at: "2026-11-28T10:54:17.128Z"
doc_updated_by: "CODER"
description: "Implement native FIND, SEARCH, LEN, EXACT, LEFT, RIGHT, MID and REPLACE across the formula compiler and interpreter. Use native TextSearch parameter conversion and imported document search mode. Replay the relevant pinned FODS function assertions and ODS round trips with focused checks."
sections:
  Summary: |-
    Align Calc ODS text search and character-position functions with LibreOffice

    Implement native FIND, SEARCH, LEN, EXACT, LEFT, RIGHT, MID and REPLACE across the formula compiler and interpreter. Use native TextSearch parameter conversion and imported document search mode. Replay the relevant pinned FODS function assertions and ODS round trips with focused checks.
  Scope: |-
    - In scope: Implement native FIND, SEARCH, LEN, EXACT, LEFT, RIGHT, MID and REPLACE across the formula compiler and interpreter. Use native TextSearch parameter conversion and imported document search mode. Replay the relevant pinned FODS function assertions and ODS round trips with focused checks.
    - Out of scope: unrelated refactors not required for "Align Calc ODS text search and character-position functions with LibreOffice".
  Plan: "Port the eight current scalar UTF-16/code-point text functions from the pinned interpreter with native opcodes, argument conversion, bounds, defaults, result formats and error contracts. Bind SEARCH through the native shared TextSearch locale/search parameter conversion and use the imported ODS search setting. Reuse the existing realm regex service and native OUString traversal. Replay applicable Calc function fixture assertions, including ODS Worker and reopen where relevant, and run focused checks."
  Verify Steps: |-
    PLANNER fallback scaffold for "Align Calc ODS text search and character-position functions with LibreOffice". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Align Calc ODS text search and character-position functions with LibreOffice". Expected: the visible result matches ## Summary and stays inside approved scope.
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

Align Calc ODS text search and character-position functions with LibreOffice

Implement native FIND, SEARCH, LEN, EXACT, LEFT, RIGHT, MID and REPLACE across the formula compiler and interpreter. Use native TextSearch parameter conversion and imported document search mode. Replay the relevant pinned FODS function assertions and ODS round trips with focused checks.

## Scope

- In scope: Implement native FIND, SEARCH, LEN, EXACT, LEFT, RIGHT, MID and REPLACE across the formula compiler and interpreter. Use native TextSearch parameter conversion and imported document search mode. Replay the relevant pinned FODS function assertions and ODS round trips with focused checks.
- Out of scope: unrelated refactors not required for "Align Calc ODS text search and character-position functions with LibreOffice".

## Plan

Port the eight current scalar UTF-16/code-point text functions from the pinned interpreter with native opcodes, argument conversion, bounds, defaults, result formats and error contracts. Bind SEARCH through the native shared TextSearch locale/search parameter conversion and use the imported ODS search setting. Reuse the existing realm regex service and native OUString traversal. Replay applicable Calc function fixture assertions, including ODS Worker and reopen where relevant, and run focused checks.

## Verify Steps

PLANNER fallback scaffold for "Align Calc ODS text search and character-position functions with LibreOffice". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Align Calc ODS text search and character-position functions with LibreOffice". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
