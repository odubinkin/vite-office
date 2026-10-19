---
id: "202610191240-WP2DC4"
title: "Connect Calc font-size UI to native cell attributes and ODS persistence"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
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
doc_updated_at: "2026-10-19T13:50:28.937Z"
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
  Verification: "Passed whole Calc115files326cases with raw S7281/B4632/F1481/L6527 all100%,zero skipped and no new exclusions. Related shared5files33cases raw S278/B61/F11/L271 all100%. Twenty complete executable changed application owners raw S1668/B792/F289/L1525 all100%;the canonical column re-export has no own Istanbul counters. All17Calc browser cases pass on final build,including actual shared font-size widget at1280/390,selection,mixed state and undo/redo. Related tooling3files91cases pass. Types,build,static,changed-path lint/format,JSDoc,size,source-tree,dependencies,source provenance,Calc resources,scoped Calc/shared inventories,doctor,routing and diff checks pass. Source-audit and original untouched raw maps,source/dist/screenshot hashes are under evidence. Final screenshots inspected;large fonts clip in pre-existing fixed22px rows,so automatic row height/overflow remain next UI work. Task34;last full30,next full40. Full broad native parity remains unverified."
  Rollback Plan: "Revert only this task's explicit implementation commit and its corresponding inventory/provenance entries if the action fails acceptance; retain evidence and do not alter other active tasks, the calc branch or user-owned merges."
  Findings: "User explicitly authorized all currently feasible Calc UI actions and concrete required kernel dependencies. This leaf delivers only font-size UI through genuine model/undo/ODS owners. The original35-path estimate was too small for34implementation/test/tooling paths plus43canonical registry records and2docs;all79non-task paths implement or document this same authorized vertical slice. No extra UI feature,network,external write,branch/worktree or merge was added. The old domain/VCL rule conflated pure native values with browser adapters;only DocPool->fntstyle/outdev-font is admitted,with source-backed sc->tools and vcl->i18nlangtag edges and negative/reverse/browser tests. No threshold or broad browser guard was disabled. Pool scope is actual contiguous100..124,with no fake page/cell defaults. Full script-aware foreign painting,named styles,family application,remaining defaults and row layout remain pending. Visual inspection confirms large text clips inside existing22px rows;next UI priority is real row-height/overflow behavior,not guessed CSS. CALC-194 records preserved native single-run out-of-range lookup;compiled native reproduction was not claimed. Native redundant interval guard is reduced only by integer-row invariant,without coverage exclusions. Initial UI expectation/cancellation gaps,source-pin whitespace and lint/docs issues were repaired;an optional TypeScript inspection exhausted Node heap and was replaced by bounded syntax-only inspection. Mandatory typecheck passes. Existing bundle/hook-readiness warnings remain. Root full lint's historical ignored output artifacts were not changed;intentional changed paths pass. No full all-app replay before iteration40."
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

Passed whole Calc115files326cases with raw S7281/B4632/F1481/L6527 all100%,zero skipped and no new exclusions. Related shared5files33cases raw S278/B61/F11/L271 all100%. Twenty complete executable changed application owners raw S1668/B792/F289/L1525 all100%;the canonical column re-export has no own Istanbul counters. All17Calc browser cases pass on final build,including actual shared font-size widget at1280/390,selection,mixed state and undo/redo. Related tooling3files91cases pass. Types,build,static,changed-path lint/format,JSDoc,size,source-tree,dependencies,source provenance,Calc resources,scoped Calc/shared inventories,doctor,routing and diff checks pass. Source-audit and original untouched raw maps,source/dist/screenshot hashes are under evidence. Final screenshots inspected;large fonts clip in pre-existing fixed22px rows,so automatic row height/overflow remain next UI work. Task34;last full30,next full40. Full broad native parity remains unverified.

## Rollback Plan

Revert only this task's explicit implementation commit and its corresponding inventory/provenance entries if the action fails acceptance; retain evidence and do not alter other active tasks, the calc branch or user-owned merges.

## Findings

User explicitly authorized all currently feasible Calc UI actions and concrete required kernel dependencies. This leaf delivers only font-size UI through genuine model/undo/ODS owners. The original35-path estimate was too small for34implementation/test/tooling paths plus43canonical registry records and2docs;all79non-task paths implement or document this same authorized vertical slice. No extra UI feature,network,external write,branch/worktree or merge was added. The old domain/VCL rule conflated pure native values with browser adapters;only DocPool->fntstyle/outdev-font is admitted,with source-backed sc->tools and vcl->i18nlangtag edges and negative/reverse/browser tests. No threshold or broad browser guard was disabled. Pool scope is actual contiguous100..124,with no fake page/cell defaults. Full script-aware foreign painting,named styles,family application,remaining defaults and row layout remain pending. Visual inspection confirms large text clips inside existing22px rows;next UI priority is real row-height/overflow behavior,not guessed CSS. CALC-194 records preserved native single-run out-of-range lookup;compiled native reproduction was not claimed. Native redundant interval guard is reduced only by integer-row invariant,without coverage exclusions. Initial UI expectation/cancellation gaps,source-pin whitespace and lint/docs issues were repaired;an optional TypeScript inspection exhausted Node heap and was replaced by bounded syntax-only inspection. Mandatory typecheck passes. Existing bundle/hook-readiness warnings remain. Root full lint's historical ignored output artifacts were not changed;intentional changed paths pass. No full all-app replay before iteration40.
