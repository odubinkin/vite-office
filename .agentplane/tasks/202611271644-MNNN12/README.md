---
id: "202611271644-MNNN12"
title: "Implement native Calc ODS consolidation settings and sheet scenarios"
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
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T16:45:13.864Z"
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
    body: "Start: port native document consolidation and scenario ODF owners."
events:
  -
    type: "status"
    at: "2026-11-27T16:45:14.865Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port native document consolidation and scenario ODF owners."
doc_version: 3
doc_updated_at: "2026-11-27T16:45:14.865Z"
doc_updated_by: "CODER"
description: "Implement ScConsolidateParam, native scenario range flags, ODS importer and exporter, and Worker support in apps/office/src/sc and the shared ODF token module. Verify with LibreOffice consolidation inputs and a native scenario ODS round trip."
sections:
  Summary: |-
    Preserve native Calc consolidation settings and sheet scenarios in ODS

    Port the original ScConsolidateParam and per-sheet scenarios with their native defaults, address conversion and ScMF::Scenario cell-range marking. Connect the Calc document, ODS importer and exporter, and Worker graph. Verify the two pinned consolidation fixtures and one critical scenario transfer without adding desktop dialogs.
  Scope: |-
    - In scope: Port the original ScConsolidateParam and per-sheet scenarios with their native defaults, address conversion and ScMF::Scenario cell-range marking. Connect the Calc document, ODS importer and exporter, and Worker graph. Verify the two pinned consolidation fixtures and one critical scenario transfer without adding desktop dialogs.
    - Out of scope: unrelated refactors not required for "Preserve native Calc consolidation settings and sheet scenarios in ODS".
  Plan: "Follow ScArea, ScConsolidateParam, ScDocument and ScTable scenario ownership, XMLConsolidationContext, xmlsceni and xmlexprt in the pinned source. Reuse Calc's native range parser, subtotal function converter, sheet merge flags and mark data. Preserve source order, default and malformed-input behavior, ODS placement and Worker restoration. Port the represented assertions from tdf149752 and tdf136551 plus one critical ODS scenario round trip. Keep existing browser save and lifecycle behavior and run related Calc tests only."
  Verify Steps: |-
    PLANNER fallback scaffold for "Preserve native Calc consolidation settings and sheet scenarios in ODS". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Preserve native Calc consolidation settings and sheet scenarios in ODS". Expected: the visible result matches ## Summary and stays inside approved scope.
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

Preserve native Calc consolidation settings and sheet scenarios in ODS

Port the original ScConsolidateParam and per-sheet scenarios with their native defaults, address conversion and ScMF::Scenario cell-range marking. Connect the Calc document, ODS importer and exporter, and Worker graph. Verify the two pinned consolidation fixtures and one critical scenario transfer without adding desktop dialogs.

## Scope

- In scope: Port the original ScConsolidateParam and per-sheet scenarios with their native defaults, address conversion and ScMF::Scenario cell-range marking. Connect the Calc document, ODS importer and exporter, and Worker graph. Verify the two pinned consolidation fixtures and one critical scenario transfer without adding desktop dialogs.
- Out of scope: unrelated refactors not required for "Preserve native Calc consolidation settings and sheet scenarios in ODS".

## Plan

Follow ScArea, ScConsolidateParam, ScDocument and ScTable scenario ownership, XMLConsolidationContext, xmlsceni and xmlexprt in the pinned source. Reuse Calc's native range parser, subtotal function converter, sheet merge flags and mark data. Preserve source order, default and malformed-input behavior, ODS placement and Worker restoration. Port the represented assertions from tdf149752 and tdf136551 plus one critical ODS scenario round trip. Keep existing browser save and lifecycle behavior and run related Calc tests only.

## Verify Steps

PLANNER fallback scaffold for "Preserve native Calc consolidation settings and sheet scenarios in ODS". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Preserve native Calc consolidation settings and sheet scenarios in ODS". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
