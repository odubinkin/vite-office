---
id: "202611271759-8EGZMJ"
title: "Implement native Writer reference marks in ODT"
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
  updated_at: "2026-11-27T17:59:43.342Z"
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
    body: "Start: implement actual Writer reference-mark hints and the ODT paths."
events:
  -
    type: "status"
    at: "2026-11-27T17:59:43.730Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement actual Writer reference-mark hints and the ODT paths."
doc_version: 3
doc_updated_at: "2026-11-27T17:59:43.730Z"
doc_updated_by: "CODER"
description: "Port the SwFormatRefMark and SwTextRefMark item and hint owners, original point and paragraph-scoped ranged XML import, ODT export and Worker persistence. Retain the native missing-end collapse and first-match behavior, native hint identity and expansion. Port the point and ranged assertions from the pinned whitespace.odt regression and document the preserved reference mark expansion issue."
sections:
  Summary: |-
    Implement native Writer reference marks in ODT

    Port the SwFormatRefMark and SwTextRefMark item and hint owners, original point and paragraph-scoped ranged XML import, ODT export and Worker persistence. Retain the native missing-end collapse and first-match behavior, native hint identity and expansion. Port the point and ranged assertions from the pinned whitespace.odt regression and document the preserved reference mark expansion issue.
  Scope: |-
    - In scope: Port the SwFormatRefMark and SwTextRefMark item and hint owners, original point and paragraph-scoped ranged XML import, ODT export and Worker persistence. Retain the native missing-end collapse and first-match behavior, native hint identity and expansion. Port the point and ranged assertions from the pinned whitespace.odt regression and document the preserved reference mark expansion issue.
    - Out of scope: unrelated refactors not required for "Implement native Writer reference marks in ODT".
  Plan: "Implement the original reference-mark pooled item, no-end dummy character and overlap-capable SwTextRefMark in existing Writer hint maps. Use the native insertion naming and range rules through the Writer UNO adapter. Keep point and ranged ODT import in their original xmloff contexts and export names at native paragraph boundaries. Transfer the same hints through the Worker. Port the original whitespace.odt point and range expectations, preserve missing-end collapse and expansion behavior, and update WhichId provenance and the suspected issue note. The reference field evaluator and desktop commands are outside this slice."
  Verify Steps: |-
    PLANNER fallback scaffold for "Implement native Writer reference marks in ODT". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Implement native Writer reference marks in ODT". Expected: the visible result matches ## Summary and stays inside approved scope.
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

Implement native Writer reference marks in ODT

Port the SwFormatRefMark and SwTextRefMark item and hint owners, original point and paragraph-scoped ranged XML import, ODT export and Worker persistence. Retain the native missing-end collapse and first-match behavior, native hint identity and expansion. Port the point and ranged assertions from the pinned whitespace.odt regression and document the preserved reference mark expansion issue.

## Scope

- In scope: Port the SwFormatRefMark and SwTextRefMark item and hint owners, original point and paragraph-scoped ranged XML import, ODT export and Worker persistence. Retain the native missing-end collapse and first-match behavior, native hint identity and expansion. Port the point and ranged assertions from the pinned whitespace.odt regression and document the preserved reference mark expansion issue.
- Out of scope: unrelated refactors not required for "Implement native Writer reference marks in ODT".

## Plan

Implement the original reference-mark pooled item, no-end dummy character and overlap-capable SwTextRefMark in existing Writer hint maps. Use the native insertion naming and range rules through the Writer UNO adapter. Keep point and ranged ODT import in their original xmloff contexts and export names at native paragraph boundaries. Transfer the same hints through the Worker. Port the original whitespace.odt point and range expectations, preserve missing-end collapse and expansion behavior, and update WhichId provenance and the suspected issue note. The reference field evaluator and desktop commands are outside this slice.

## Verify Steps

PLANNER fallback scaffold for "Implement native Writer reference marks in ODT". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Implement native Writer reference marks in ODT". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
