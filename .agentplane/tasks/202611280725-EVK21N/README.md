---
id: "202611280725-EVK21N"
title: "Port Writer ODT document statistics fields"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 4
origin:
  system: "manual"
depends_on: []
tags:
  - "writer"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-28T07:25:56.428Z"
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
    body: "Start: port the Writer statistics manager and actual ODT count field lifecycle against the pinned sources."
events:
  -
    type: "status"
    at: "2026-11-28T07:25:57.451Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port the Writer statistics manager and actual ODT count field lifecycle against the pinned sources."
doc_version: 3
doc_updated_at: "2026-11-28T07:25:57.451Z"
doc_updated_by: "CODER"
description: "Implement the native Writer statistics field family and document statistic ownership across ODT import and export, layout-backed page totals and Writer Worker transfer. Port the pinned ODF page-count-range fixture and verify related Writer modules."
sections:
  Summary: |-
    Port Writer ODT document statistics fields

    Implement the native Writer statistics field family and document statistic ownership across ODT import and export, layout-backed page totals and Writer Worker transfer. Port the pinned ODF page-count-range fixture and verify related Writer modules.
  Scope: |-
    - In scope: Implement the native Writer statistics field family and document statistic ownership across ODT import and export, layout-backed page totals and Writer Worker transfer. Port the pinned ODF page-count-range fixture and verify related Writer modules.
    - Out of scope: unrelated refactors not required for "Port Writer ODT document statistics fields".
  Plan: "Trace SwDocStat, DocumentStatisticsManager, SwDocStatField and XMLCountFieldImportContext in the pinned LibreOffice tree. Port the document-owned statistics and supported native text counting and physical/page-range lookup. Wire UNO service attachment, metadata import/export, Writer XML field representation and Worker transfer within current Writer model facilities. Replay tdf71583.odt and verify nearby Writer ODT, layout and metadata tests plus static, provenance and parity checks. Keep shell save/open, auto-save and recovery behavior."
  Verify Steps: |-
    PLANNER fallback scaffold for "Port Writer ODT document statistics fields". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Port Writer ODT document statistics fields". Expected: the visible result matches ## Summary and stays inside approved scope.
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

Port Writer ODT document statistics fields

Implement the native Writer statistics field family and document statistic ownership across ODT import and export, layout-backed page totals and Writer Worker transfer. Port the pinned ODF page-count-range fixture and verify related Writer modules.

## Scope

- In scope: Implement the native Writer statistics field family and document statistic ownership across ODT import and export, layout-backed page totals and Writer Worker transfer. Port the pinned ODF page-count-range fixture and verify related Writer modules.
- Out of scope: unrelated refactors not required for "Port Writer ODT document statistics fields".

## Plan

Trace SwDocStat, DocumentStatisticsManager, SwDocStatField and XMLCountFieldImportContext in the pinned LibreOffice tree. Port the document-owned statistics and supported native text counting and physical/page-range lookup. Wire UNO service attachment, metadata import/export, Writer XML field representation and Worker transfer within current Writer model facilities. Replay tdf71583.odt and verify nearby Writer ODT, layout and metadata tests plus static, provenance and parity checks. Keep shell save/open, auto-save and recovery behavior.

## Verify Steps

PLANNER fallback scaffold for "Port Writer ODT document statistics fields". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Port Writer ODT document statistics fields". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
