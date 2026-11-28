---
id: "202611281115-6T6XDX"
title: "Align Calc ODS scalar error predicates and fallback branches with LibreOffice"
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
  updated_at: "2026-11-28T11:15:22.747Z"
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
    body: "Start: implement native scalar error predicates and conditional error fallbacks."
events:
  -
    type: "status"
    at: "2026-11-28T11:15:23.106Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement native scalar error predicates and conditional error fallbacks."
doc_version: 3
doc_updated_at: "2026-11-28T11:15:23.106Z"
doc_updated_by: "CODER"
description: "Port IFERROR and IFNA native jump tokens, scalar error propagation and ISERROR, ISERR and ISNA predicate semantics across ODS compile, calculation and persistence. Replay the pinned scalar IFERROR and information-function assertions with focused checks."
sections:
  Summary: |-
    Align Calc ODS scalar error predicates and fallback branches with LibreOffice

    Port IFERROR and IFNA native jump tokens, scalar error propagation and ISERROR, ISERR and ISNA predicate semantics across ODS compile, calculation and persistence. Replay the pinned scalar IFERROR and information-function assertions with focused checks.
  Scope: |-
    - In scope: Port IFERROR and IFNA native jump tokens, scalar error propagation and ISERROR, ISERR and ISNA predicate semantics across ODS compile, calculation and persistence. Replay the pinned scalar IFERROR and information-function assertions with focused checks.
    - Out of scope: unrelated refactors not required for "Align Calc ODS scalar error predicates and fallback branches with LibreOffice".
  Plan: "Extend native formula resources and jump compilation for IFERROR and IFNA, and scalar error classification for ISERROR, ISERR and ISNA. Follow upstream interpreter stack-base and error-function continuation semantics for represented scalar and reference results. Test native lazy fallback and error/value type behavior through ODS recalculation and Worker/save/reopen. Replay pinned TestFormula2 scalar checks and applicable information-function assertions. Matrix jump lifting remains a separate responsibility."
  Verify Steps: |-
    PLANNER fallback scaffold for "Align Calc ODS scalar error predicates and fallback branches with LibreOffice". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Align Calc ODS scalar error predicates and fallback branches with LibreOffice". Expected: the visible result matches ## Summary and stays inside approved scope.
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

Align Calc ODS scalar error predicates and fallback branches with LibreOffice

Port IFERROR and IFNA native jump tokens, scalar error propagation and ISERROR, ISERR and ISNA predicate semantics across ODS compile, calculation and persistence. Replay the pinned scalar IFERROR and information-function assertions with focused checks.

## Scope

- In scope: Port IFERROR and IFNA native jump tokens, scalar error propagation and ISERROR, ISERR and ISNA predicate semantics across ODS compile, calculation and persistence. Replay the pinned scalar IFERROR and information-function assertions with focused checks.
- Out of scope: unrelated refactors not required for "Align Calc ODS scalar error predicates and fallback branches with LibreOffice".

## Plan

Extend native formula resources and jump compilation for IFERROR and IFNA, and scalar error classification for ISERROR, ISERR and ISNA. Follow upstream interpreter stack-base and error-function continuation semantics for represented scalar and reference results. Test native lazy fallback and error/value type behavior through ODS recalculation and Worker/save/reopen. Replay pinned TestFormula2 scalar checks and applicable information-function assertions. Matrix jump lifting remains a separate responsibility.

## Verify Steps

PLANNER fallback scaffold for "Align Calc ODS scalar error predicates and fallback branches with LibreOffice". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Align Calc ODS scalar error predicates and fallback branches with LibreOffice". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
