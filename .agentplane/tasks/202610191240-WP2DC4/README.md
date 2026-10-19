---
id: "202610191240-WP2DC4"
title: "Connect Calc font-size UI to native cell attributes and ODS persistence"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-19T12:40:55.460Z"
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
    body: "Start: User authorized all currently feasible Calc UI actions; implement end-to-end shared font-size control with original attribute storage/defaults and no unrelated kernel prerequisites."
events:
  -
    type: "status"
    at: "2026-10-19T12:41:00.004Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: User authorized all currently feasible Calc UI actions; implement end-to-end shared font-size control with original attribute storage/defaults and no unrelated kernel prerequisites."
doc_version: 3
doc_updated_at: "2026-10-19T12:41:00.004Z"
doc_updated_by: "CODER"
description: "Iteration34: deliver the existing shared Writer font-size selector as a working Calc action. Implement the consumed upstream cell attribute storage/pool contracts, real selection application and readback, undo/redo, grid rendering, and ODS/autosave persistence. Preserve original font-height defaults and three-script application. Keep unsupported family/style actions disabled until their own concrete dependencies are present. Work only in this checkout on calc; no full suite before iteration40."
sections:
  Summary: |-
    Connect Calc font-size UI to native cell attributes and ODS persistence

    Iteration34: deliver the existing shared Writer font-size selector as a working Calc action. Implement the consumed upstream cell attribute storage/pool contracts, real selection application and readback, undo/redo, grid rendering, and ODS/autosave persistence. Preserve original font-height defaults and three-script application. Keep unsupported family/style actions disabled until their own concrete dependencies are present. Work only in this checkout on calc; no full suite before iteration40.
  Scope: |-
    - In scope: Iteration34: deliver the existing shared Writer font-size selector as a working Calc action. Implement the consumed upstream cell attribute storage/pool contracts, real selection application and readback, undo/redo, grid rendering, and ODS/autosave persistence. Preserve original font-height defaults and three-script application. Keep unsupported family/style actions disabled until their own concrete dependencies are present. Work only in this checkout on calc; no full suite before iteration40.
    - Out of scope: unrelated refactors not required for "Connect Calc font-size UI to native cell attributes and ODS persistence".
  Plan: "Deliver font size end to end through the existing shared Writer selector and real Calc Sfx command. Port the consumed native ScDocumentPool font prefix and ScAttrArray row spans, connect column/table/document pattern APIs, apply all three native font-height items over real selected ranges and sheets with undo ownership, project effective/mixed height state and grid CSS, and round-trip automatic cell styles including styled empty ranges through ODS. Add meaningful core/command/browser/persistence regressions and original-source provenance/capability evidence. Expected scope: up to 35 implementation/test/inventory/doc paths plus task evidence. Validate whole Calc raw S/B/F/L 100%, complete changed-owner coverage 100%, related modules, Calc browser flows, types/build/static/style/inventory/provenance gates. No unrelated codec work; no full suite before task40."
  Verify Steps: "Run npm run test:coverage:calc in apps/office and require raw statements/branches/functions/lines 100% with no added exclusions. Run related shared-owner tests and full changed-owner raw coverage at 100%. Verify original source constants/defaults/split/merge/ownership and font-size three-script selection behavior; multi-sheet, mixed/default, input rejection, undo/redo and ODS styled empty ranges must be covered. Run Calc browser font-size flows at desktop/mobile sizes against a fresh build. Run app types/build, changed-path lint/format/docs/size, architecture/dependencies/provenance/resource/capability validators, doctor and routing. Save evidence and require clean calc checkout after task closure. Full application test suite is deliberately scheduled at iteration40 per user cadence (last full30)."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task's explicit implementation commit and its corresponding inventory/provenance entries if the action fails acceptance; retain evidence and do not alter other active tasks, the calc branch or user-owned merges."
  Findings: ""
id_source: "generated"
---
## Summary

Connect Calc font-size UI to native cell attributes and ODS persistence

Iteration34: deliver the existing shared Writer font-size selector as a working Calc action. Implement the consumed upstream cell attribute storage/pool contracts, real selection application and readback, undo/redo, grid rendering, and ODS/autosave persistence. Preserve original font-height defaults and three-script application. Keep unsupported family/style actions disabled until their own concrete dependencies are present. Work only in this checkout on calc; no full suite before iteration40.

## Scope

- In scope: Iteration34: deliver the existing shared Writer font-size selector as a working Calc action. Implement the consumed upstream cell attribute storage/pool contracts, real selection application and readback, undo/redo, grid rendering, and ODS/autosave persistence. Preserve original font-height defaults and three-script application. Keep unsupported family/style actions disabled until their own concrete dependencies are present. Work only in this checkout on calc; no full suite before iteration40.
- Out of scope: unrelated refactors not required for "Connect Calc font-size UI to native cell attributes and ODS persistence".

## Plan

Deliver font size end to end through the existing shared Writer selector and real Calc Sfx command. Port the consumed native ScDocumentPool font prefix and ScAttrArray row spans, connect column/table/document pattern APIs, apply all three native font-height items over real selected ranges and sheets with undo ownership, project effective/mixed height state and grid CSS, and round-trip automatic cell styles including styled empty ranges through ODS. Add meaningful core/command/browser/persistence regressions and original-source provenance/capability evidence. Expected scope: up to 35 implementation/test/inventory/doc paths plus task evidence. Validate whole Calc raw S/B/F/L 100%, complete changed-owner coverage 100%, related modules, Calc browser flows, types/build/static/style/inventory/provenance gates. No unrelated codec work; no full suite before task40.

## Verify Steps

Run npm run test:coverage:calc in apps/office and require raw statements/branches/functions/lines 100% with no added exclusions. Run related shared-owner tests and full changed-owner raw coverage at 100%. Verify original source constants/defaults/split/merge/ownership and font-size three-script selection behavior; multi-sheet, mixed/default, input rejection, undo/redo and ODS styled empty ranges must be covered. Run Calc browser font-size flows at desktop/mobile sizes against a fresh build. Run app types/build, changed-path lint/format/docs/size, architecture/dependencies/provenance/resource/capability validators, doctor and routing. Save evidence and require clean calc checkout after task closure. Full application test suite is deliberately scheduled at iteration40 per user cadence (last full30).

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task's explicit implementation commit and its corresponding inventory/provenance entries if the action fails acceptance; retain evidence and do not alter other active tasks, the calc branch or user-owned merges.

## Findings
