---
id: "202611271734-VQYSKP"
title: "Implement native Writer ODT save visibility for tracked deletions"
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
  updated_at: "2026-11-27T17:35:21.398Z"
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
    body: "Start: attach the native SwXMLWriter redline save visibility transition."
events:
  -
    type: "status"
    at: "2026-11-27T17:35:21.863Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: attach the native SwXMLWriter redline save visibility transition."
doc_version: 3
doc_updated_at: "2026-11-27T17:35:21.863Z"
doc_updated_by: "CODER"
description: "Port the original redline visibility transition used by SwXMLWriter. Move represented deleted text into native redline sections for package export and restore the live document state, preserving positions and formatting. Verify the original whitespace, midnight timestamp and same-position deletion cases and restoration after an interrupted export."
sections:
  Summary: |-
    Implement native Writer ODT save visibility for tracked deletions

    Port the original redline visibility transition used by SwXMLWriter. Move represented deleted text into native redline sections for package export and restore the live document state, preserving positions and formatting. Verify the original whitespace, midnight timestamp and same-position deletion cases and restoration after an interrupted export.
  Scope: |-
    - In scope: Port the original redline visibility transition used by SwXMLWriter. Move represented deleted text into native redline sections for package export and restore the live document state, preserving positions and formatting. Verify the original whitespace, midnight timestamp and same-position deletion cases and restoration after an interrupted export.
    - Out of scope: unrelated refactors not required for "Implement native Writer ODT save visibility for tracked deletions".
  Plan: "Follow the pinned SwXMLWriter redline visibility guard and SwRangeRedline move operations. Use original owned redline sections and native Writer text range operations for represented same-paragraph deletions, preserving owner positions and restoring state on normal and cancelled saves. Keep package contents and browser save policy on their existing entry points. Verify the original whitespace and same-position deletion inputs and one critical save-restoration regression."
  Verify Steps: |-
    PLANNER fallback scaffold for "Implement native Writer ODT save visibility for tracked deletions". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Implement native Writer ODT save visibility for tracked deletions". Expected: the visible result matches ## Summary and stays inside approved scope.
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

Implement native Writer ODT save visibility for tracked deletions

Port the original redline visibility transition used by SwXMLWriter. Move represented deleted text into native redline sections for package export and restore the live document state, preserving positions and formatting. Verify the original whitespace, midnight timestamp and same-position deletion cases and restoration after an interrupted export.

## Scope

- In scope: Port the original redline visibility transition used by SwXMLWriter. Move represented deleted text into native redline sections for package export and restore the live document state, preserving positions and formatting. Verify the original whitespace, midnight timestamp and same-position deletion cases and restoration after an interrupted export.
- Out of scope: unrelated refactors not required for "Implement native Writer ODT save visibility for tracked deletions".

## Plan

Follow the pinned SwXMLWriter redline visibility guard and SwRangeRedline move operations. Use original owned redline sections and native Writer text range operations for represented same-paragraph deletions, preserving owner positions and restoring state on normal and cancelled saves. Keep package contents and browser save policy on their existing entry points. Verify the original whitespace and same-position deletion inputs and one critical save-restoration regression.

## Verify Steps

PLANNER fallback scaffold for "Implement native Writer ODT save visibility for tracked deletions". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Implement native Writer ODT save visibility for tracked deletions". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
