---
id: "202611271712-T82AA2"
title: "Implement native Writer structural redline boundaries in ODT"
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
  updated_at: "2026-11-27T17:12:50.080Z"
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
    body: "Start: port original table and section redline placement."
events:
  -
    type: "status"
    at: "2026-11-27T17:12:50.523Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port original table and section redline placement."
doc_version: 3
doc_updated_at: "2026-11-27T17:12:50.523Z"
doc_updated_by: "CODER"
description: "Attach tracked-change markers around Writer tables and sections to their original registered structural nodes. Preserve position repair, structural markers and actual node relationships through ODT and the Worker. Use the original tdf132911 and section protection fixtures with related Writer regressions."
sections:
  Summary: |-
    Implement native Writer structural redline boundaries in ODT

    Attach tracked-change markers around Writer tables and sections to their original registered structural nodes. Preserve position repair, structural markers and actual node relationships through ODT and the Worker. Use the original tdf132911 and section protection fixtures with related Writer regressions.
  Scope: |-
    - In scope: Attach tracked-change markers around Writer tables and sections to their original registered structural nodes. Preserve position repair, structural markers and actual node relationships through ODT and the Worker. Use the original tdf132911 and section protection fixtures with related Writer regressions.
    - Out of scope: unrelated refactors not required for "Implement native Writer structural redline boundaries in ODT".
  Plan: "Port the native XMLRedlineImportHelper structural anchor mode and its open-ID adjustment at tables and sections. Attach outside-paragraph marks to actual registered start/end nodes, serialize node marks around corresponding XML blocks, and rebind structural graph references to actual restored node owners. Port the structural range in tdf132911 and preserve the section protection fixture when its source region is incomplete. Verify related Writer table, section and existing redline tests, leaving editor change actions and recovery outside this task."
  Verify Steps: |-
    PLANNER fallback scaffold for "Implement native Writer structural redline boundaries in ODT". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Implement native Writer structural redline boundaries in ODT". Expected: the visible result matches ## Summary and stays inside approved scope.
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

Implement native Writer structural redline boundaries in ODT

Attach tracked-change markers around Writer tables and sections to their original registered structural nodes. Preserve position repair, structural markers and actual node relationships through ODT and the Worker. Use the original tdf132911 and section protection fixtures with related Writer regressions.

## Scope

- In scope: Attach tracked-change markers around Writer tables and sections to their original registered structural nodes. Preserve position repair, structural markers and actual node relationships through ODT and the Worker. Use the original tdf132911 and section protection fixtures with related Writer regressions.
- Out of scope: unrelated refactors not required for "Implement native Writer structural redline boundaries in ODT".

## Plan

Port the native XMLRedlineImportHelper structural anchor mode and its open-ID adjustment at tables and sections. Attach outside-paragraph marks to actual registered start/end nodes, serialize node marks around corresponding XML blocks, and rebind structural graph references to actual restored node owners. Port the structural range in tdf132911 and preserve the section protection fixture when its source region is incomplete. Verify related Writer table, section and existing redline tests, leaving editor change actions and recovery outside this task.

## Verify Steps

PLANNER fallback scaffold for "Implement native Writer structural redline boundaries in ODT". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Implement native Writer structural redline boundaries in ODT". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
