---
id: "202611271536-NFVPTH"
title: "Preserve native Writer tracked changes through ODT"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 4
origin:
  system: "manual"
depends_on: []
tags:
  - "odt"
  - "redline"
  - "writer"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T15:36:29.528Z"
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
    body: "Start: Follow the pinned Writer redline owner and ODF definition and marker contracts for ordinary package retention."
events:
  -
    type: "status"
    at: "2026-11-27T15:36:30.071Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Follow the pinned Writer redline owner and ODF definition and marker contracts for ordinary package retention."
doc_version: 3
doc_updated_at: "2026-11-27T15:36:30.071Z"
doc_updated_by: "CODER"
description: "Preserve the currently represented Writer text ranges and detached deletion sections in ODT tracked changes. Port native redline definition, ownership, boundary dispatch, date and flag handling, ODF export and the existing Writer Worker graph. Verify pinned midnight and whitespace fixtures."
sections:
  Summary: |-
    Preserve native Writer tracked changes through ODT

    Preserve the currently represented Writer text ranges and detached deletion sections in ODT tracked changes. Port native redline definition, ownership, boundary dispatch, date and flag handling, ODF export and the existing Writer Worker graph. Verify pinned midnight and whitespace fixtures.
  Scope: |-
    - In scope: Preserve the currently represented Writer text ranges and detached deletion sections in ODT tracked changes. Port native redline definition, ownership, boundary dispatch, date and flag handling, ODF export and the existing Writer Worker graph. Verify pinned midnight and whitespace fixtures.
    - Out of scope: unrelated refactors not required for "Preserve native Writer tracked changes through ODT".
  Plan: "Follow pinned SwRedlineData, SwRangeRedline, SwRedlineTable, DocumentRedlineManager, XMLRedlineImportHelper and xmloff original tracked-change contexts and XMLRedlineExport. Preserve actual Writer range endpoints and detached redline text sections, recorded change metadata and direction, original redline flag and ODF date defaults, and the current graph transport. Use the actual represented Writer text and style owners. Limit the task to ordinary package preservation, without altering recovery, autosave, browser open/save behavior or adding a tracked-change editing UI. Port midnight_redline.fodt and the relevant tracked range portions of whitespace.odt and run related focused checks."
  Verify Steps: |-
    PLANNER fallback scaffold for "Preserve native Writer tracked changes through ODT". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Preserve native Writer tracked changes through ODT". Expected: the visible result matches ## Summary and stays inside approved scope.
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

Preserve native Writer tracked changes through ODT

Preserve the currently represented Writer text ranges and detached deletion sections in ODT tracked changes. Port native redline definition, ownership, boundary dispatch, date and flag handling, ODF export and the existing Writer Worker graph. Verify pinned midnight and whitespace fixtures.

## Scope

- In scope: Preserve the currently represented Writer text ranges and detached deletion sections in ODT tracked changes. Port native redline definition, ownership, boundary dispatch, date and flag handling, ODF export and the existing Writer Worker graph. Verify pinned midnight and whitespace fixtures.
- Out of scope: unrelated refactors not required for "Preserve native Writer tracked changes through ODT".

## Plan

Follow pinned SwRedlineData, SwRangeRedline, SwRedlineTable, DocumentRedlineManager, XMLRedlineImportHelper and xmloff original tracked-change contexts and XMLRedlineExport. Preserve actual Writer range endpoints and detached redline text sections, recorded change metadata and direction, original redline flag and ODF date defaults, and the current graph transport. Use the actual represented Writer text and style owners. Limit the task to ordinary package preservation, without altering recovery, autosave, browser open/save behavior or adding a tracked-change editing UI. Port midnight_redline.fodt and the relevant tracked range portions of whitespace.odt and run related focused checks.

## Verify Steps

PLANNER fallback scaffold for "Preserve native Writer tracked changes through ODT". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Preserve native Writer tracked changes through ODT". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
