---
id: "202611271823-P3TJDC"
title: "Preserve native Writer bookmark and mark reference fields in ODT"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 4
origin:
  system: "manual"
depends_on: []
tags:
  - "odf"
  - "writer"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T18:24:27.621Z"
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
    body: "Start: add native Writer GetReference text-field ownership and ODT paths."
events:
  -
    type: "status"
    at: "2026-11-27T18:24:28.043Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: add native Writer GetReference text-field ownership and ODT paths."
doc_version: 3
doc_updated_at: "2026-11-27T18:24:28.043Z"
doc_updated_by: "CODER"
description: "Port the original Writer GetReference field owners and the ODT bookmark-ref and reference-ref contracts. Preserve the field result, source, format and language, text reference updates against current bookmark and reference mark owners, and Worker transport. Port represented assertions from the original named reference fixtures. Page-layout and additional reference sources remain scoped to their currently represented behavior."
sections:
  Summary: |-
    Preserve native Writer bookmark and mark reference fields in ODT

    Port the original Writer GetReference field owners and the ODT bookmark-ref and reference-ref contracts. Preserve the field result, source, format and language, text reference updates against current bookmark and reference mark owners, and Worker transport. Port represented assertions from the original named reference fixtures. Page-layout and additional reference sources remain scoped to their currently represented behavior.
  Scope: |-
    - In scope: Port the original Writer GetReference field owners and the ODT bookmark-ref and reference-ref contracts. Preserve the field result, source, format and language, text reference updates against current bookmark and reference mark owners, and Worker transport. Port represented assertions from the original named reference fixtures. Page-layout and additional reference sources remain scoped to their currently represented behavior.
    - Out of scope: unrelated refactors not required for "Preserve native Writer bookmark and mark reference fields in ODT".
  Plan: "Introduce native GetReference document field ownership alongside annotations. Keep the original RefFieldFormat and ReferencesSubtype values, ODF token defaults and named reference properties. Attach fields through the real Writer text model, apply native text-reference updates using registered bookmark and reference mark anchors, and preserve remembered values where the required paginated field calculation is outside this slice. Rebind the original field data through Worker transport and export named fields. Use the original tdf157287 and tdf159101 reference fixtures for their represented text and storage assertions."
  Verify Steps: |-
    PLANNER fallback scaffold for "Preserve native Writer bookmark and mark reference fields in ODT". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Preserve native Writer bookmark and mark reference fields in ODT". Expected: the visible result matches ## Summary and stays inside approved scope.
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

Preserve native Writer bookmark and mark reference fields in ODT

Port the original Writer GetReference field owners and the ODT bookmark-ref and reference-ref contracts. Preserve the field result, source, format and language, text reference updates against current bookmark and reference mark owners, and Worker transport. Port represented assertions from the original named reference fixtures. Page-layout and additional reference sources remain scoped to their currently represented behavior.

## Scope

- In scope: Port the original Writer GetReference field owners and the ODT bookmark-ref and reference-ref contracts. Preserve the field result, source, format and language, text reference updates against current bookmark and reference mark owners, and Worker transport. Port represented assertions from the original named reference fixtures. Page-layout and additional reference sources remain scoped to their currently represented behavior.
- Out of scope: unrelated refactors not required for "Preserve native Writer bookmark and mark reference fields in ODT".

## Plan

Introduce native GetReference document field ownership alongside annotations. Keep the original RefFieldFormat and ReferencesSubtype values, ODF token defaults and named reference properties. Attach fields through the real Writer text model, apply native text-reference updates using registered bookmark and reference mark anchors, and preserve remembered values where the required paginated field calculation is outside this slice. Rebind the original field data through Worker transport and export named fields. Use the original tdf157287 and tdf159101 reference fixtures for their represented text and storage assertions.

## Verify Steps

PLANNER fallback scaffold for "Preserve native Writer bookmark and mark reference fields in ODT". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Preserve native Writer bookmark and mark reference fields in ODT". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
