---
id: "202611271641-NYB3FQ"
title: "Reconcile Writer WhichId tooling with native TOX marks"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 4
origin:
  system: "manual"
depends_on: []
tags:
  - "checkpoint"
  - "writer"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T16:41:30.294Z"
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
    body: "Start: reconcile the observed deterministic tooling failure from the full ODF checkpoint."
events:
  -
    type: "status"
    at: "2026-11-27T16:41:32.134Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: reconcile the observed deterministic tooling failure from the full ODF checkpoint."
doc_version: 3
doc_updated_at: "2026-11-27T16:41:32.134Z"
doc_updated_by: "CODER"
description: "Resolve the deterministic full-checkpoint tooling failure caused by the addition of the original RES_TXTATR_TOXMARK identity. Keep all upstream expression and mismatch validation, update the coverage assertion against the current identity set, and replay the failing tooling file."
sections:
  Summary: |-
    Reconcile Writer WhichId tooling with native TOX marks

    Resolve the deterministic full-checkpoint tooling failure caused by the addition of the original RES_TXTATR_TOXMARK identity. Keep all upstream expression and mismatch validation, update the coverage assertion against the current identity set, and replay the failing tooling file.
  Scope: |-
    - In scope: Resolve the deterministic full-checkpoint tooling failure caused by the addition of the original RES_TXTATR_TOXMARK identity. Keep all upstream expression and mismatch validation, update the coverage assertion against the current identity set, and replay the failing tooling file.
    - Out of scope: unrelated refactors not required for "Reconcile Writer WhichId tooling with native TOX marks".
  Plan: "Compare the pinned source expression and the existing local TOX hint introduced by MY81Z8. Update the stale aggregate assertion from 130 to 131 in the existing tooling test, preserving the native expression verification and deliberate mismatch checks. Run that tooling file and the dedicated Writer WhichId check."
  Verify Steps: |-
    PLANNER fallback scaffold for "Reconcile Writer WhichId tooling with native TOX marks". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Reconcile Writer WhichId tooling with native TOX marks". Expected: the visible result matches ## Summary and stays inside approved scope.
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

Reconcile Writer WhichId tooling with native TOX marks

Resolve the deterministic full-checkpoint tooling failure caused by the addition of the original RES_TXTATR_TOXMARK identity. Keep all upstream expression and mismatch validation, update the coverage assertion against the current identity set, and replay the failing tooling file.

## Scope

- In scope: Resolve the deterministic full-checkpoint tooling failure caused by the addition of the original RES_TXTATR_TOXMARK identity. Keep all upstream expression and mismatch validation, update the coverage assertion against the current identity set, and replay the failing tooling file.
- Out of scope: unrelated refactors not required for "Reconcile Writer WhichId tooling with native TOX marks".

## Plan

Compare the pinned source expression and the existing local TOX hint introduced by MY81Z8. Update the stale aggregate assertion from 130 to 131 in the existing tooling test, preserving the native expression verification and deliberate mismatch checks. Run that tooling file and the dedicated Writer WhichId check.

## Verify Steps

PLANNER fallback scaffold for "Reconcile Writer WhichId tooling with native TOX marks". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Reconcile Writer WhichId tooling with native TOX marks". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
