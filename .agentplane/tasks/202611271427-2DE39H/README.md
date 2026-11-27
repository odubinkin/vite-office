---
id: "202611271427-2DE39H"
title: "Preserve Calc external data area links through ODS"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 4
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "links"
  - "ods"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T14:27:31.940Z"
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
    body: "Start: Match original Calc cell-range-source parsing, area-link registration and ODF writeback."
events:
  -
    type: "status"
    at: "2026-11-27T14:27:32.475Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Match original Calc cell-range-source parsing, area-link registration and ODF writeback."
doc_version: 3
doc_updated_at: "2026-11-27T14:27:32.475Z"
doc_updated_by: "CODER"
description: "Import and export Calc external data range definitions using native cell-range-source contexts, ScAreaLink ownership, destination ranges and original defaults. Preserve the cached worksheet cells, independent area and sheet link identity, and browser Worker transfer. Port the relevant pinned tdf124829 ODS case and verify sibling ODS link paths."
sections:
  Summary: |-
    Preserve Calc external data area links through ODS

    Import and export Calc external data range definitions using native cell-range-source contexts, ScAreaLink ownership, destination ranges and original defaults. Preserve the cached worksheet cells, independent area and sheet link identity, and browser Worker transfer. Port the relevant pinned tdf124829 ODS case and verify sibling ODS link paths.
  Scope: |-
    - In scope: Import and export Calc external data range definitions using native cell-range-source contexts, ScAreaLink ownership, destination ranges and original defaults. Preserve the cached worksheet cells, independent area and sheet link identity, and browser Worker transfer. Port the relevant pinned tdf124829 ODS case and verify sibling ODS link paths.
    - Out of scope: unrelated refactors not required for "Preserve Calc external data area links through ODS".
  Plan: "Follow pinned ScXMLCellRangeSourceContext, ScXMLTableRowCellContext::SetCellRangeSource, ScAreaLink, the ordered LinkManager registration boundary, and ScXMLExport area-link collection and emission. Share the established ODF relative reference and time conversion. Keep area-link definitions independent of cached cells, per-sheet links and external formula caches. Restore the canonical links through the existing Calc Worker graph. The represented import/export loads cached cells and link metadata without initiating source reload. Port the ODS portion of tdf124829, including its distinct linked areas and six sheets, and run existing ODS and Worker checks. Record surprising source defaults or selection where applicable."
  Verify Steps: |-
    PLANNER fallback scaffold for "Preserve Calc external data area links through ODS". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Preserve Calc external data area links through ODS". Expected: the visible result matches ## Summary and stays inside approved scope.
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

Preserve Calc external data area links through ODS

Import and export Calc external data range definitions using native cell-range-source contexts, ScAreaLink ownership, destination ranges and original defaults. Preserve the cached worksheet cells, independent area and sheet link identity, and browser Worker transfer. Port the relevant pinned tdf124829 ODS case and verify sibling ODS link paths.

## Scope

- In scope: Import and export Calc external data range definitions using native cell-range-source contexts, ScAreaLink ownership, destination ranges and original defaults. Preserve the cached worksheet cells, independent area and sheet link identity, and browser Worker transfer. Port the relevant pinned tdf124829 ODS case and verify sibling ODS link paths.
- Out of scope: unrelated refactors not required for "Preserve Calc external data area links through ODS".

## Plan

Follow pinned ScXMLCellRangeSourceContext, ScXMLTableRowCellContext::SetCellRangeSource, ScAreaLink, the ordered LinkManager registration boundary, and ScXMLExport area-link collection and emission. Share the established ODF relative reference and time conversion. Keep area-link definitions independent of cached cells, per-sheet links and external formula caches. Restore the canonical links through the existing Calc Worker graph. The represented import/export loads cached cells and link metadata without initiating source reload. Port the ODS portion of tdf124829, including its distinct linked areas and six sheets, and run existing ODS and Worker checks. Record surprising source defaults or selection where applicable.

## Verify Steps

PLANNER fallback scaffold for "Preserve Calc external data area links through ODS". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Preserve Calc external data area links through ODS". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
