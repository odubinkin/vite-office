---
id: "202610222030-N700C9"
title: "Connect native Writer strikethrough formatting through UI and ODT"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 12
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
doc_updated_at: "2026-10-22T20:55:22.441Z"
doc_updated_by: "CODER"
description: "Complete the current character-formatting slice with original crossed-out items, source toggle/state contracts, sidebar/menu placement, browser projection and native XML property mappings; preserve full enum values in history and persistence."
sections:
  Summary: |-
    Connect native Writer strikethrough formatting through UI and ODT

    Complete the current character-formatting slice with original crossed-out items, source toggle/state contracts, sidebar/menu placement, browser projection and native XML property mappings; preserve full enum values in history and persistence.
  Scope: "Only writer checkout/branch. Character WhichId/ranges/pool snapshots and item deltas, native shell command state/execute and existing Sfx toggle boundary, generated native menu/toolbar resources, Character sidebar and browser text/numbering projection where consumed, ODF text-property handler/mapping/import/export and persistence codec if needed. Related tests and browser ODT flows; conservative records for every changed native/browser owner, source-shaped extraction if an existing owner approaches1000 lines. Expected up to24 implementation/resource paths plus their registry records and up to8 test paths. No locale/search expansion, table structural operations, network, branches/merges or save/open/recovery policy changes."
  Plan: "Register original RES_CHRATR_CROSSEDOUT and NONE default with existing shared SvxCrossedOutItem; preserve actual enum across node/style/hint inheritance, item snapshots, direct-format history and cursor pending attributes. Follow source Sfx enum-bool toggle including mixed state and typed execution rather than a parallel boolean core. Bind original Strikeout command, menu/toolbar resources and sidebar order. Carry full native value into browser rendering and ODF chained style/type/width/text handlers in source order, preserving explicit off and inherited styles. Verify selected/caret/table text, mixed enum values, edit/history/model replacement, persistence and ODT, native handler permutations, and desktop/mobile UI. Record unsupported native layout/service coverage honestly without status promotion; continue active goal after closure."
  Verify Steps: "Read pinned init.cxx/hintids, SfxBindings Execute_Impl, SwBaseShell ExecTextCtrl/GetTextCtrlState, native command declarations and sidebar placements, and native XML crossed-out handlers/property map. Targeted tests must cover default and complete enum storage, clone/restore, inherited and direct NONE, native mixed/typed/toggle state, pending insertion and selection/table history, preservation of adjacent formatting, actual ODT style/span roundtrip including property-order cases. Browser1280/390 must prove actual native command placements, checked/mixed state, rendering, undo/redo and downloaded ODT reopen. Run related character/item/hints/history/view/XML/resource tests and strict changed-responsibility coverage; typecheck, scoped lint/format, build/static, resources/boundaries/docs/file-size/source-tree/provenance/invariants/parity, doctor/routing, diff/status. No full suite: fourth task after ACR55N under the ten-task cadence."
  Verification: "Implementation checkpoint, task remains DOING. Nine current native command/history/caret/table/ODT tests pass;13 current shared device tests pass; two real Chromium1280/390 scenarios pass with original command controls, all six imported paint values, Undo/Redo, downloaded ODT and normal reopen. Screenshots inspected. Current Canvas-source build and typecheck pass; scoped lint passes before the final XML expectation/test additions. Earlier22 Writer files/186 tests pass. Expanded75-file related run had511 pass and one stale property-token-count expectation: native mapping now has14 tokens including four crossed-out entries; repaired with literal token/order assertions and actual SAX-order/DOUBLE-precedence tests. Final shared map/device rerun is recorded in output/playwright/writer-strikeout/shared-map-device.log. Strict coverage, further native boundary cases, canonical records/generated views and all remaining declared gates are pending. No whole-module/feature completion or full-suite run claimed. Evidence output/playwright/writer-strikeout and initial writer-strikeout-*.log files."
  Rollback Plan: "Revert only this task implementation commits; preserve completed row/column/sidebar work and task traceability. No reset, merge or external changes."
  Findings: |-
    Previous goal turn was progress: TV1H69 source d3539d3199ec, closure66b172a2c83c, verified final45 tests/16 browser and exact-span coverage audit; clean writer. Current audit found shared crossed-out item and native XML handlers already exist but Writer lacks WhichId/default, state/UI and I/O wiring. Native enum exposes bool only for command toggling; preserve the full numeric enum in model/history/filter. Broad user mutation/continuation approval remains in force. Old stop requests are revoked by latest user instruction; keep goal active. Source reads are local pinned LibreOffice9bc445578031fecf56086729d8e4940c77e14d65.

    - Observation: Initial command test discovery failed because Strikeout alias was added before its CommandSpec; no tests executed. Native same-as-style DOUBLE ODT fixture incorrectly required an automatic-style attribute in content.xml although original named style is in styles.xml. An initial VCL invocation used Writer-only project and therefore discovered only Writer tests; final VCL runs explicitly use shared project. A browser CLI invocation used variadic --project writer before the file path, so no scenarios executed. Lint required pure metric helpers outside the React component module; a canvas test fixture initially lacked fillRect/fillText.
      Impact: Raw discovery/fixture/lint failures do not establish product failures or skipped checks. No gate/threshold weakened. Expanded related suite exposed one obsolete literal10-token expectation after four original source mappings were added.
      Resolution: Add original CommandSpec and regenerate; inspect both ODT XML parts; run actual shared tests; use --project=writer; move original fallback/repetition arithmetic into vcl/source/font/fontmetric.ts and vcl/source/outdev/textline.ts; provide genuine test-device draw spies. Update token expectation to14 with exact native ordered IDs and SAX precedence tests. Browser two scenarios and nine core cases pass. Complete current-source strict coverage, metadata and remaining gates before closure; keep goal active.

    - Observation: Current75-file related Istanbul profile executes513 tests successfully; raw complete-owner coverage is86.74% lines,84.32% statements,87.02% functions,77.16% branches, so the unchanged strict100 gate exits1. New canvas/font fallback and generic character-state boundary counters still need dedicated meaningful cases; unchanged unrelated owner counters also remain unexecuted by this scoped run.
      Impact: Task is not verified or ready for closure. No threshold modification, fabricated counter or fresh whole-owner100 claim is allowed. Native GetCurAttr/SetAttrSet represented profile also needs further empty/table/selection boundary audit before broad claims.
      Resolution: Retain raw output and fresh maps under output/playwright/writer-strikeout/fresh-current-coverage. Add missing current responsibility cases, rerun only affected tests and use the existing deterministic exact-source historical-counter audit only for byte-identical unchanged spans against baseline51bababa8ab3 and prior verified profiles. Canonical runtime/provenance records now cover all changed owners without status promotion; generated views refreshed. Remaining type/lint/static/resources/boundaries/docs/source-tree/provenance/invariants/parity/doctor/routing checks and source review must pass before task verification and finish.
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

Implementation checkpoint, task remains DOING. Nine current native command/history/caret/table/ODT tests pass;13 current shared device tests pass; two real Chromium1280/390 scenarios pass with original command controls, all six imported paint values, Undo/Redo, downloaded ODT and normal reopen. Screenshots inspected. Current Canvas-source build and typecheck pass; scoped lint passes before the final XML expectation/test additions. Earlier22 Writer files/186 tests pass. Expanded75-file related run had511 pass and one stale property-token-count expectation: native mapping now has14 tokens including four crossed-out entries; repaired with literal token/order assertions and actual SAX-order/DOUBLE-precedence tests. Final shared map/device rerun is recorded in output/playwright/writer-strikeout/shared-map-device.log. Strict coverage, further native boundary cases, canonical records/generated views and all remaining declared gates are pending. No whole-module/feature completion or full-suite run claimed. Evidence output/playwright/writer-strikeout and initial writer-strikeout-*.log files.

## Rollback Plan

Revert only this task implementation commits; preserve completed row/column/sidebar work and task traceability. No reset, merge or external changes.

## Findings

Previous goal turn was progress: TV1H69 source d3539d3199ec, closure66b172a2c83c, verified final45 tests/16 browser and exact-span coverage audit; clean writer. Current audit found shared crossed-out item and native XML handlers already exist but Writer lacks WhichId/default, state/UI and I/O wiring. Native enum exposes bool only for command toggling; preserve the full numeric enum in model/history/filter. Broad user mutation/continuation approval remains in force. Old stop requests are revoked by latest user instruction; keep goal active. Source reads are local pinned LibreOffice9bc445578031fecf56086729d8e4940c77e14d65.

- Observation: Initial command test discovery failed because Strikeout alias was added before its CommandSpec; no tests executed. Native same-as-style DOUBLE ODT fixture incorrectly required an automatic-style attribute in content.xml although original named style is in styles.xml. An initial VCL invocation used Writer-only project and therefore discovered only Writer tests; final VCL runs explicitly use shared project. A browser CLI invocation used variadic --project writer before the file path, so no scenarios executed. Lint required pure metric helpers outside the React component module; a canvas test fixture initially lacked fillRect/fillText.
  Impact: Raw discovery/fixture/lint failures do not establish product failures or skipped checks. No gate/threshold weakened. Expanded related suite exposed one obsolete literal10-token expectation after four original source mappings were added.
  Resolution: Add original CommandSpec and regenerate; inspect both ODT XML parts; run actual shared tests; use --project=writer; move original fallback/repetition arithmetic into vcl/source/font/fontmetric.ts and vcl/source/outdev/textline.ts; provide genuine test-device draw spies. Update token expectation to14 with exact native ordered IDs and SAX precedence tests. Browser two scenarios and nine core cases pass. Complete current-source strict coverage, metadata and remaining gates before closure; keep goal active.

- Observation: Current75-file related Istanbul profile executes513 tests successfully; raw complete-owner coverage is86.74% lines,84.32% statements,87.02% functions,77.16% branches, so the unchanged strict100 gate exits1. New canvas/font fallback and generic character-state boundary counters still need dedicated meaningful cases; unchanged unrelated owner counters also remain unexecuted by this scoped run.
  Impact: Task is not verified or ready for closure. No threshold modification, fabricated counter or fresh whole-owner100 claim is allowed. Native GetCurAttr/SetAttrSet represented profile also needs further empty/table/selection boundary audit before broad claims.
  Resolution: Retain raw output and fresh maps under output/playwright/writer-strikeout/fresh-current-coverage. Add missing current responsibility cases, rerun only affected tests and use the existing deterministic exact-source historical-counter audit only for byte-identical unchanged spans against baseline51bababa8ab3 and prior verified profiles. Canonical runtime/provenance records now cover all changed owners without status promotion; generated views refreshed. Remaining type/lint/static/resources/boundaries/docs/source-tree/provenance/invariants/parity/doctor/routing checks and source review must pass before task verification and finish.
