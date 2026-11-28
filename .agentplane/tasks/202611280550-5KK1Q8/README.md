---
id: "202611280550-5KK1Q8"
title: "Port native Calc ODS tracked cell content changes"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 4
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "ods"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-28T05:51:09.688Z"
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
    body: "Start: adopt and export native Calc ODS cell content change actions."
events:
  -
    type: "status"
    at: "2026-11-28T05:51:10.158Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: adopt and export native Calc ODS cell content change actions."
doc_version: 3
doc_updated_at: "2026-11-28T05:51:10.158Z"
doc_updated_by: "CODER"
description: "Build the native ScChangeTrack and ScChangeActionContent ownership needed for existing Calc cells, with ODF change info, previous values and content dependencies, export and Worker transport. Port the actual change-tracking.ods fixture and the original author/date privacy behavior for the represented change actions."
sections:
  Summary: |-
    Port native Calc ODS tracked cell content changes

    Build the native ScChangeTrack and ScChangeActionContent ownership needed for existing Calc cells, with ODF change info, previous values and content dependencies, export and Worker transport. Port the actual change-tracking.ods fixture and the original author/date privacy behavior for the represented change actions.
  Scope: |-
    - In scope: Build the native ScChangeTrack and ScChangeActionContent ownership needed for existing Calc cells, with ODF change info, previous values and content dependencies, export and Worker transport. Port the actual change-tracking.ods fixture and the original author/date privacy behavior for the represented change actions.
    - Out of scope: unrelated refactors not required for "Port native Calc ODS tracked cell content changes".
  Plan: "Port document-owned ScChangeTrack and ScChangeActionContent with original BigRange positions, action numbering, acceptance, authors, time values and previous scalar cell snapshots. Reconstruct content dependencies and the latest current cell after import; keep non-content structural actions explicit and outside this task. Integrate through native tracked changes contexts, the Calc XML change tracking helpers and Worker transport. Use the upstream flags and defaults for author/date anonymization and port the original change-tracking.ods case through the actual ODS entry points. Use only focused affected tests and close after verification."
  Verify Steps: |-
    PLANNER fallback scaffold for "Port native Calc ODS tracked cell content changes". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Port native Calc ODS tracked cell content changes". Expected: the visible result matches ## Summary and stays inside approved scope.
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

Port native Calc ODS tracked cell content changes

Build the native ScChangeTrack and ScChangeActionContent ownership needed for existing Calc cells, with ODF change info, previous values and content dependencies, export and Worker transport. Port the actual change-tracking.ods fixture and the original author/date privacy behavior for the represented change actions.

## Scope

- In scope: Build the native ScChangeTrack and ScChangeActionContent ownership needed for existing Calc cells, with ODF change info, previous values and content dependencies, export and Worker transport. Port the actual change-tracking.ods fixture and the original author/date privacy behavior for the represented change actions.
- Out of scope: unrelated refactors not required for "Port native Calc ODS tracked cell content changes".

## Plan

Port document-owned ScChangeTrack and ScChangeActionContent with original BigRange positions, action numbering, acceptance, authors, time values and previous scalar cell snapshots. Reconstruct content dependencies and the latest current cell after import; keep non-content structural actions explicit and outside this task. Integrate through native tracked changes contexts, the Calc XML change tracking helpers and Worker transport. Use the upstream flags and defaults for author/date anonymization and port the original change-tracking.ods case through the actual ODS entry points. Use only focused affected tests and close after verification.

## Verify Steps

PLANNER fallback scaffold for "Port native Calc ODS tracked cell content changes". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Port native Calc ODS tracked cell content changes". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
