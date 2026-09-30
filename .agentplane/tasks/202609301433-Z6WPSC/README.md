---
id: "202609301433-Z6WPSC"
title: "Preserve signed Writer paragraph side margins"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-30T14:33:45.489Z"
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
    body: "Start: complete the signed paragraph margin correction under the user-approved iterative upstream audit; preserve fixed browser product decisions."
events:
  -
    type: "status"
    at: "2026-09-30T14:33:51.088Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: complete the signed paragraph margin correction under the user-approved iterative upstream audit; preserve fixed browser product decisions."
doc_version: 3
doc_updated_at: "2026-09-30T14:33:51.088Z"
doc_updated_by: "CODER"
description: "One upstream parity correction: permit signed text-left and right-margin item values and ODT paragraph measures, preserving the negative result of unsnapped MoveLeftMargin and its undo/redo. User authorized iterative existing-function parity fixes on 2026-09-30. Preserve deliberate recovery, save/open and rendering exceptions."
sections:
  Summary: |-
    Preserve signed Writer paragraph side margins

    One upstream parity correction: permit signed text-left and right-margin item values and ODT paragraph measures, preserving the negative result of unsnapped MoveLeftMargin and its undo/redo. User authorized iterative existing-function parity fixes on 2026-09-30. Preserve deliberate recovery, save/open and rendering exceptions.
  Scope: |-
    - In scope: One upstream parity correction: permit signed text-left and right-margin item values and ODT paragraph measures, preserving the negative result of unsnapped MoveLeftMargin and its undo/redo. User authorized iterative existing-function parity fixes on 2026-09-30. Preserve deliberate recovery, save/open and rendering exceptions.
    - Out of scope: unrelated refactors not required for "Preserve signed Writer paragraph side margins".
  Plan: "1. Compare signed paragraph side-margin setters and ODF property mappings with pinned frmitems.cxx, txtprmap.cxx and docfmt.cxx. 2. Correct only paraitem.ts and xmlstyle.ts signed-value rejection; add item-codec, ODT and unsnapped indent undo/redo assertions in the three existing tests. 3. Append focused runtime inventory evidence without promoting whole-module status. 4. Run npm run verify, ap doctor and routing validation; record evidence and commit only the six implementation/evidence files and this task. This bounded correction is an iteration of approved audit 202609240501-C9TN6M; all product exceptions remain preserved."
  Verify Steps: "1. npm run verify passes all formatting, lint, type, source/provenance, resource, inventory, unit coverage, browser and static-build gates. 2. Signed left/right values survive clone and item-codec transfer; ODT imports and round-trips negative paragraph margins while page margins stay unchanged. 3. An unsnapped decrease from 300 by 720 twips yields -420 and supports undo/redo, following pinned SwDoc::MoveLeftMargin. 4. ap doctor and node .agentplane/policy/check-routing.mjs pass; final task diff is limited to the declared six files and task artifacts, with clean tracked checkout after closure."
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

Preserve signed Writer paragraph side margins

One upstream parity correction: permit signed text-left and right-margin item values and ODT paragraph measures, preserving the negative result of unsnapped MoveLeftMargin and its undo/redo. User authorized iterative existing-function parity fixes on 2026-09-30. Preserve deliberate recovery, save/open and rendering exceptions.

## Scope

- In scope: One upstream parity correction: permit signed text-left and right-margin item values and ODT paragraph measures, preserving the negative result of unsnapped MoveLeftMargin and its undo/redo. User authorized iterative existing-function parity fixes on 2026-09-30. Preserve deliberate recovery, save/open and rendering exceptions.
- Out of scope: unrelated refactors not required for "Preserve signed Writer paragraph side margins".

## Plan

1. Compare signed paragraph side-margin setters and ODF property mappings with pinned frmitems.cxx, txtprmap.cxx and docfmt.cxx. 2. Correct only paraitem.ts and xmlstyle.ts signed-value rejection; add item-codec, ODT and unsnapped indent undo/redo assertions in the three existing tests. 3. Append focused runtime inventory evidence without promoting whole-module status. 4. Run npm run verify, ap doctor and routing validation; record evidence and commit only the six implementation/evidence files and this task. This bounded correction is an iteration of approved audit 202609240501-C9TN6M; all product exceptions remain preserved.

## Verify Steps

1. npm run verify passes all formatting, lint, type, source/provenance, resource, inventory, unit coverage, browser and static-build gates. 2. Signed left/right values survive clone and item-codec transfer; ODT imports and round-trips negative paragraph margins while page margins stay unchanged. 3. An unsnapped decrease from 300 by 720 twips yields -420 and supports undo/redo, following pinned SwDoc::MoveLeftMargin. 4. ap doctor and node .agentplane/policy/check-routing.mjs pass; final task diff is limited to the declared six files and task artifacts, with clean tracked checkout after closure.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
