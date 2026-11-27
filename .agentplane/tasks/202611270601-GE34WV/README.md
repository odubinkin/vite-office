---
id: "202611270601-GE34WV"
title: "Connect Calc Asian Typography to native slots and ODS styles"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T06:01:35.802Z"
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
    body: "Start: Implement source-backed Asian Typography controls and Calc ODF paragraph formatting."
events:
  -
    type: "status"
    at: "2026-11-27T06:01:36.470Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement source-backed Asian Typography controls and Calc ODF paragraph formatting."
doc_version: 3
doc_updated_at: "2026-11-27T06:01:36.470Z"
doc_updated_by: "CODER"
description: "Complete the Calc Format Cells notebook using pinned CUI slot admission, grouped attribute history, and all three original ODF paragraph property mappings. Reuse shared Writer/Calc ODF tokens and document source evidence."
sections:
  Summary: "Complete Asian Typography in the Calc Format Cells notebook and preserve the pinned Asian paragraph ODF properties."
  Scope: "Expose the original three controls in Calc, resolve their availability through the Calc pool, apply changes through the existing grouped attribute command, and round-trip the three flags in ODS. Reuse the integrated XML tokens and named boolean handler, preserve Writer behavior and document the pinned EditEngine transfer in CALC239. Update the parity registry for the consumed native owners."
  Plan: "Connect the pinned CUI tab in Calc, restore native ODF paragraph flag mappings, and verify slot admission, item-set exchange, grouped history and ODS persistence."
  Verify Steps: |-
    - Run focused Calc Format Cells and ODS tests and the shared CUI paragraph and Writer ODF diagnostic tests from the Office working directory.
    - Run Office typecheck, changed-source lint and format, dependencies, source tree and provenance, Calc/shared parity registry, AgentPlane routing and doctor. Inspect both source and test evidence for native slot availability and all ODS lexical pairs.
  Verification: "Pending execution."
  Rollback Plan: "Revert the scoped task changes and leave current shared Writer token registration intact."
  Findings: "The integrated base already registers the ODF tokens and covers their Writer admission. The original Calc pool maps only the forbidden-character checkbox into the cell selection."
id_source: "generated"
---
## Summary

Complete Asian Typography in the Calc Format Cells notebook and preserve the pinned Asian paragraph ODF properties.

## Scope

Expose the original three controls in Calc, resolve their availability through the Calc pool, apply changes through the existing grouped attribute command, and round-trip the three flags in ODS. Reuse the integrated XML tokens and named boolean handler, preserve Writer behavior and document the pinned EditEngine transfer in CALC239. Update the parity registry for the consumed native owners.

## Plan

Connect the pinned CUI tab in Calc, restore native ODF paragraph flag mappings, and verify slot admission, item-set exchange, grouped history and ODS persistence.

## Verify Steps

- Run focused Calc Format Cells and ODS tests and the shared CUI paragraph and Writer ODF diagnostic tests from the Office working directory.
- Run Office typecheck, changed-source lint and format, dependencies, source tree and provenance, Calc/shared parity registry, AgentPlane routing and doctor. Inspect both source and test evidence for native slot availability and all ODS lexical pairs.

## Verification

Pending execution.

## Rollback Plan

Revert the scoped task changes and leave current shared Writer token registration intact.

## Findings

The integrated base already registers the ODF tokens and covers their Writer admission. The original Calc pool maps only the forbidden-character checkbox into the cell selection.
