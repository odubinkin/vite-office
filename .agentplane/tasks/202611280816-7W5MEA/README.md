---
id: "202611280816-7W5MEA"
title: "Align Calc ODS row styles and height scheduling"
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
  updated_at: "2026-11-28T08:16:33.912Z"
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
    body: "Start: align ODS row-style properties, native cell-pattern routing, and the bounded saved-height recalculation pass."
events:
  -
    type: "status"
    at: "2026-11-28T08:16:35.431Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: align ODS row-style properties, native cell-pattern routing, and the bounded saved-height recalculation pass."
doc_version: 3
doc_updated_at: "2026-11-28T08:16:35.431Z"
doc_updated_by: "CODER"
description: "Port the pinned row-property mapping, saved and calculated height scheduling, and imported row cell backgrounds into their native Calc owners. Verify original row-height fixtures and the affected ODS geometry and style modules."
sections:
  Summary: |-
    Align Calc ODS row styles and height scheduling

    Port the pinned row-property mapping, saved and calculated height scheduling, and imported row cell backgrounds into their native Calc owners. Verify original row-height fixtures and the affected ODS geometry and style modules.
  Scope: |-
    - In scope: Port the pinned row-property mapping, saved and calculated height scheduling, and imported row cell backgrounds into their native Calc owners. Verify original row-height fixtures and the affected ODS geometry and style modules.
    - Out of scope: unrelated refactors not required for "Align Calc ODS row styles and height scheduling".
  Plan: "Read pinned XML row contexts and property mappers, UNO row geometry and ScDocRowHeightUpdater. Port row scope background and theme color into native cell patterns, convert saved row sizes through native UNO units, and move the selected-row height pass to the native document iterator owner. Preserve represented headless sizing and row geometry outside its supported scope. Use original row-height ODS fixtures and related Calc filter and row-core tests only. No full suite."
  Verify Steps: |-
    PLANNER fallback scaffold for "Align Calc ODS row styles and height scheduling". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Align Calc ODS row styles and height scheduling". Expected: the visible result matches ## Summary and stays inside approved scope.
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

Align Calc ODS row styles and height scheduling

Port the pinned row-property mapping, saved and calculated height scheduling, and imported row cell backgrounds into their native Calc owners. Verify original row-height fixtures and the affected ODS geometry and style modules.

## Scope

- In scope: Port the pinned row-property mapping, saved and calculated height scheduling, and imported row cell backgrounds into their native Calc owners. Verify original row-height fixtures and the affected ODS geometry and style modules.
- Out of scope: unrelated refactors not required for "Align Calc ODS row styles and height scheduling".

## Plan

Read pinned XML row contexts and property mappers, UNO row geometry and ScDocRowHeightUpdater. Port row scope background and theme color into native cell patterns, convert saved row sizes through native UNO units, and move the selected-row height pass to the native document iterator owner. Preserve represented headless sizing and row geometry outside its supported scope. Use original row-height ODS fixtures and related Calc filter and row-core tests only. No full suite.

## Verify Steps

PLANNER fallback scaffold for "Align Calc ODS row styles and height scheduling". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Align Calc ODS row styles and height scheduling". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
