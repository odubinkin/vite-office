---
id: "202610222030-N700C9"
title: "Connect native Writer strikethrough formatting through UI and ODT"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-22T20:30:50.218Z"
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
    body: "Start: implement approved native Writer crossed-out attribute, source command state, sidebar and ODT flow in writer using local pinned sources and related checks."
events:
  -
    type: "status"
    at: "2026-10-22T20:30:55.052Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved native Writer crossed-out attribute, source command state, sidebar and ODT flow in writer using local pinned sources and related checks."
doc_version: 3
doc_updated_at: "2026-10-22T20:30:55.052Z"
doc_updated_by: "CODER"
description: "Complete the current character-formatting slice with original crossed-out items, source toggle/state contracts, sidebar/menu placement, browser projection and native XML property mappings; preserve full enum values in history and persistence."
sections:
  Summary: |-
    Connect native Writer strikethrough formatting through UI and ODT

    Complete the current character-formatting slice with original crossed-out items, source toggle/state contracts, sidebar/menu placement, browser projection and native XML property mappings; preserve full enum values in history and persistence.
  Scope: "Only writer checkout/branch. Character WhichId/ranges/pool snapshots and item deltas, native shell command state/execute and existing Sfx toggle boundary, generated native menu/toolbar resources, Character sidebar and browser text/numbering projection where consumed, ODF text-property handler/mapping/import/export and persistence codec if needed. Related tests and browser ODT flows; conservative records for every changed native/browser owner, source-shaped extraction if an existing owner approaches1000 lines. Expected up to24 implementation/resource paths plus their registry records and up to8 test paths. No locale/search expansion, table structural operations, network, branches/merges or save/open/recovery policy changes."
  Plan: "Register original RES_CHRATR_CROSSEDOUT and NONE default with existing shared SvxCrossedOutItem; preserve actual enum across node/style/hint inheritance, item snapshots, direct-format history and cursor pending attributes. Follow source Sfx enum-bool toggle including mixed state and typed execution rather than a parallel boolean core. Bind original Strikeout command, menu/toolbar resources and sidebar order. Carry full native value into browser rendering and ODF chained style/type/width/text handlers in source order, preserving explicit off and inherited styles. Verify selected/caret/table text, mixed enum values, edit/history/model replacement, persistence and ODT, native handler permutations, and desktop/mobile UI. Record unsupported native layout/service coverage honestly without status promotion; continue active goal after closure."
  Verify Steps: "Read pinned init.cxx/hintids, SfxBindings Execute_Impl, SwBaseShell ExecTextCtrl/GetTextCtrlState, native command declarations and sidebar placements, and native XML crossed-out handlers/property map. Targeted tests must cover default and complete enum storage, clone/restore, inherited and direct NONE, native mixed/typed/toggle state, pending insertion and selection/table history, preservation of adjacent formatting, actual ODT style/span roundtrip including property-order cases. Browser1280/390 must prove actual native command placements, checked/mixed state, rendering, undo/redo and downloaded ODT reopen. Run related character/item/hints/history/view/XML/resource tests and strict changed-responsibility coverage; typecheck, scoped lint/format, build/static, resources/boundaries/docs/file-size/source-tree/provenance/invariants/parity, doctor/routing, diff/status. No full suite: fourth task after ACR55N under the ten-task cadence."
  Verification: "Pending implementation and declared checks."
  Rollback Plan: "Revert only this task implementation commits; preserve completed row/column/sidebar work and task traceability. No reset, merge or external changes."
  Findings: "Previous goal turn was progress: TV1H69 source d3539d3199ec, closure66b172a2c83c, verified final45 tests/16 browser and exact-span coverage audit; clean writer. Current audit found shared crossed-out item and native XML handlers already exist but Writer lacks WhichId/default, state/UI and I/O wiring. Native enum exposes bool only for command toggling; preserve the full numeric enum in model/history/filter. Broad user mutation/continuation approval remains in force. Old stop requests are revoked by latest user instruction; keep goal active. Source reads are local pinned LibreOffice9bc445578031fecf56086729d8e4940c77e14d65."
id_source: "generated"
---
## Summary

Connect native Writer strikethrough formatting through UI and ODT

Complete the current character-formatting slice with original crossed-out items, source toggle/state contracts, sidebar/menu placement, browser projection and native XML property mappings; preserve full enum values in history and persistence.

## Scope

Only writer checkout/branch. Character WhichId/ranges/pool snapshots and item deltas, native shell command state/execute and existing Sfx toggle boundary, generated native menu/toolbar resources, Character sidebar and browser text/numbering projection where consumed, ODF text-property handler/mapping/import/export and persistence codec if needed. Related tests and browser ODT flows; conservative records for every changed native/browser owner, source-shaped extraction if an existing owner approaches1000 lines. Expected up to24 implementation/resource paths plus their registry records and up to8 test paths. No locale/search expansion, table structural operations, network, branches/merges or save/open/recovery policy changes.

## Plan

Register original RES_CHRATR_CROSSEDOUT and NONE default with existing shared SvxCrossedOutItem; preserve actual enum across node/style/hint inheritance, item snapshots, direct-format history and cursor pending attributes. Follow source Sfx enum-bool toggle including mixed state and typed execution rather than a parallel boolean core. Bind original Strikeout command, menu/toolbar resources and sidebar order. Carry full native value into browser rendering and ODF chained style/type/width/text handlers in source order, preserving explicit off and inherited styles. Verify selected/caret/table text, mixed enum values, edit/history/model replacement, persistence and ODT, native handler permutations, and desktop/mobile UI. Record unsupported native layout/service coverage honestly without status promotion; continue active goal after closure.

## Verify Steps

Read pinned init.cxx/hintids, SfxBindings Execute_Impl, SwBaseShell ExecTextCtrl/GetTextCtrlState, native command declarations and sidebar placements, and native XML crossed-out handlers/property map. Targeted tests must cover default and complete enum storage, clone/restore, inherited and direct NONE, native mixed/typed/toggle state, pending insertion and selection/table history, preservation of adjacent formatting, actual ODT style/span roundtrip including property-order cases. Browser1280/390 must prove actual native command placements, checked/mixed state, rendering, undo/redo and downloaded ODT reopen. Run related character/item/hints/history/view/XML/resource tests and strict changed-responsibility coverage; typecheck, scoped lint/format, build/static, resources/boundaries/docs/file-size/source-tree/provenance/invariants/parity, doctor/routing, diff/status. No full suite: fourth task after ACR55N under the ten-task cadence.

## Verification

Pending implementation and declared checks.

## Rollback Plan

Revert only this task implementation commits; preserve completed row/column/sidebar work and task traceability. No reset, merge or external changes.

## Findings

Previous goal turn was progress: TV1H69 source d3539d3199ec, closure66b172a2c83c, verified final45 tests/16 browser and exact-span coverage audit; clean writer. Current audit found shared crossed-out item and native XML handlers already exist but Writer lacks WhichId/default, state/UI and I/O wiring. Native enum exposes bool only for command toggling; preserve the full numeric enum in model/history/filter. Broad user mutation/continuation approval remains in force. Old stop requests are revoked by latest user instruction; keep goal active. Source reads are local pinned LibreOffice9bc445578031fecf56086729d8e4940c77e14d65.
