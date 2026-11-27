---
id: "202611271843-KBGKS7"
title: "Port native Calc ODS database filter item values"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 4
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "odf"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T18:44:59.987Z"
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
    body: "Start: bind ODS database filter input and output to actual native query item values."
events:
  -
    type: "status"
    at: "2026-11-27T18:45:00.587Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: bind ODS database filter input and output to actual native query item values."
doc_version: 3
doc_updated_at: "2026-11-27T18:45:00.587Z"
doc_updated_by: "CODER"
description: "Use actual native Calc colors in database query items and preserve the filter operators and lexical values in ODS. Apply the original color and automatic-color conversions, dialect property admission and Worker binding with existing-record compatibility. Port native ODS autofilter color assertions and preserve and document the original non-empty filter parser behavior."
sections:
  Summary: |-
    Port native Calc ODS database filter item values

    Use actual native Calc colors in database query items and preserve the filter operators and lexical values in ODS. Apply the original color and automatic-color conversions, dialect property admission and Worker binding with existing-record compatibility. Port native ODS autofilter color assertions and preserve and document the original non-empty filter parser behavior.
  Scope: |-
    - In scope: Use actual native Calc colors in database query items and preserve the filter operators and lexical values in ODS. Apply the original color and automatic-color conversions, dialect property admission and Worker binding with existing-record compatibility. Port native ODS autofilter color assertions and preserve and document the original non-empty filter parser behavior.
    - Out of scope: unrelated refactors not required for "Port native Calc ODS database filter item values".
  Plan: "Port the original typed values within Calc database query criteria. Store native Color items, consume both supported automatic-color tokens and preserve last-attribute precedence. Use the existing native decimal conversion and output paths for numeric criteria and retain original lexical set members. Restore structured Worker records with compatibility for existing lexical colors. Preserve and document the upstream non-empty criterion overwrite and exercise original autofilter-colors.ods plus related database and Worker cases."
  Verify Steps: |-
    PLANNER fallback scaffold for "Port native Calc ODS database filter item values". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Port native Calc ODS database filter item values". Expected: the visible result matches ## Summary and stays inside approved scope.
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

Port native Calc ODS database filter item values

Use actual native Calc colors in database query items and preserve the filter operators and lexical values in ODS. Apply the original color and automatic-color conversions, dialect property admission and Worker binding with existing-record compatibility. Port native ODS autofilter color assertions and preserve and document the original non-empty filter parser behavior.

## Scope

- In scope: Use actual native Calc colors in database query items and preserve the filter operators and lexical values in ODS. Apply the original color and automatic-color conversions, dialect property admission and Worker binding with existing-record compatibility. Port native ODS autofilter color assertions and preserve and document the original non-empty filter parser behavior.
- Out of scope: unrelated refactors not required for "Port native Calc ODS database filter item values".

## Plan

Port the original typed values within Calc database query criteria. Store native Color items, consume both supported automatic-color tokens and preserve last-attribute precedence. Use the existing native decimal conversion and output paths for numeric criteria and retain original lexical set members. Restore structured Worker records with compatibility for existing lexical colors. Preserve and document the upstream non-empty criterion overwrite and exercise original autofilter-colors.ods plus related database and Worker cases.

## Verify Steps

PLANNER fallback scaffold for "Port native Calc ODS database filter item values". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Port native Calc ODS database filter item values". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
