---
id: "202611220102-128X13"
title: "Preserve and display Calc ODS conditional icon sets"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 4
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
  - "ods"
task_kind: "code"
mutation_scope: "code"
verify:
  - "Build Office and run a focused production Chromium original-ODS icon set scenario."
  - "Run focused Calc icon-set, ODS conditional formatting, Worker, and conditional-format presenter suites."
  - "npm run check:dependencies && npm run check:source-provenance"
plan_approval:
  state: "approved"
  updated_at: "2026-11-22T01:02:46.241Z"
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
    body: "Start: implement the native Calc icon-set owner and port the pinned LibreOffice ODS import, output and grid paths."
events:
  -
    type: "status"
    at: "2026-11-22T01:02:50.426Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the native Calc icon-set owner and port the pinned LibreOffice ODS import, output and grid paths."
doc_version: 3
doc_updated_at: "2026-11-22T01:02:50.426Z"
doc_updated_by: "CODER"
description: "Port the native icon-set owner, threshold selection, ODS and Worker transport, and the existing grid and conditional-format manager integration using the pinned LibreOffice icon resources and fixtures."
sections:
  Summary: "Bring Calc conditional icon sets from the pinned LibreOffice core through the ODS filters, Worker transfer, existing manager, and grid. Use the original format table, thresholds, reference ownership and icon resources."
  Scope: |-
    - Native ScIconSetFormat and settings, numeric result selection, threshold updates and conditional paint resolution.
    - ODS import and export, current Worker codec, existing browser conditional-format editor and the grid display of represented icons.
    - Pinned ODS regression fixtures, focused native and production tests, source witnesses, and suspected upstream behavior documentation.
  Plan: |-
    1. Trace the native icon-set type table, default settings, ordered threshold comparisons, formula reference changes and result geometry. Implement the owner next to the existing color-scale and data-bar owners.
    2. Wire the shared conditional threshold context into the native ODS icon-set context and exporter. Preserve native attribute ordering and conventions and document any input or output asymmetries. Carry the complete represented settings through native copies and current Worker records.
    3. Resolve the icon set independently from existing conditional results. Adapt the native output geometry and use the pinned Calc icon pixels from the repository theme. Open imported rules through the existing manager and retain unaffected settings when editing.
    4. Port the original tdf64401.ods and tdf101104.ods expectations and verify export, reopen and live reference thresholds. Add a focused production Chromium ODS case and run the relevant suites and invariant checks.
  Verify Steps: |-
    - Run focused Calc suites on the new icon-set ODS and geometry tests, existing ODS data-bar and conditional-format editor tests, and the affected Worker codec and view owners.
    - Build Office and run a targeted Chromium Calc original-ODS icon-set scenario with the installed repo-local browser. Confirm the selected native image and live change or reopen behavior.
    - Run scoped ESLint and Prettier, Office typecheck, module boundaries, source provenance, Calc registry invariants, AgentPlane routing and doctor, and git diff checks.
    - Record the task-scoped checkout status and finish with the Graphify refresh. The next complete regression follows the ten-task cadence.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the icon-set implementation and its registry witnesses together. Existing non-icon conditional rules retain their stored representation."
  Findings: "This is the third implementation task after CMXMAC. The pinned Calc suite includes two original ODS fixtures for formula thresholds and matching icon selection. The original exporter emits the extension formatting entries using the same conditional threshold family as data bars."
id_source: "generated"
---
## Summary

Bring Calc conditional icon sets from the pinned LibreOffice core through the ODS filters, Worker transfer, existing manager, and grid. Use the original format table, thresholds, reference ownership and icon resources.

## Scope

- Native ScIconSetFormat and settings, numeric result selection, threshold updates and conditional paint resolution.
- ODS import and export, current Worker codec, existing browser conditional-format editor and the grid display of represented icons.
- Pinned ODS regression fixtures, focused native and production tests, source witnesses, and suspected upstream behavior documentation.

## Plan

1. Trace the native icon-set type table, default settings, ordered threshold comparisons, formula reference changes and result geometry. Implement the owner next to the existing color-scale and data-bar owners.
2. Wire the shared conditional threshold context into the native ODS icon-set context and exporter. Preserve native attribute ordering and conventions and document any input or output asymmetries. Carry the complete represented settings through native copies and current Worker records.
3. Resolve the icon set independently from existing conditional results. Adapt the native output geometry and use the pinned Calc icon pixels from the repository theme. Open imported rules through the existing manager and retain unaffected settings when editing.
4. Port the original tdf64401.ods and tdf101104.ods expectations and verify export, reopen and live reference thresholds. Add a focused production Chromium ODS case and run the relevant suites and invariant checks.

## Verify Steps

- Run focused Calc suites on the new icon-set ODS and geometry tests, existing ODS data-bar and conditional-format editor tests, and the affected Worker codec and view owners.
- Build Office and run a targeted Chromium Calc original-ODS icon-set scenario with the installed repo-local browser. Confirm the selected native image and live change or reopen behavior.
- Run scoped ESLint and Prettier, Office typecheck, module boundaries, source provenance, Calc registry invariants, AgentPlane routing and doctor, and git diff checks.
- Record the task-scoped checkout status and finish with the Graphify refresh. The next complete regression follows the ten-task cadence.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the icon-set implementation and its registry witnesses together. Existing non-icon conditional rules retain their stored representation.

## Findings

This is the third implementation task after CMXMAC. The pinned Calc suite includes two original ODS fixtures for formula thresholds and matching icon selection. The original exporter emits the extension formatting entries using the same conditional threshold family as data bars.
