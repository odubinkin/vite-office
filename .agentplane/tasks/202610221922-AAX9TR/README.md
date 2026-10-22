---
id: "202610221922-AAX9TR"
title: "Complete native Writer column width dialog and table sizing command path"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 13
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-22T19:22:40.834Z"
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
    body: "Start: complete the authorized native column sizing dialog and actual frame command path using pinned local sources and related tests."
events:
  -
    type: "status"
    at: "2026-10-22T19:22:46.280Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: complete the authorized native column sizing dialog and actual frame command path using pinned local sources and related tests."
doc_version: 3
doc_updated_at: "2026-10-22T19:35:55.454Z"
doc_updated_by: "CODER"
description: "Connect the existing table width manager to the original SetColumnWidth dialog command; port missing native maximum-width and draft contracts, source controls and module units, and verify real frame selection/history/ODT behavior."
sections:
  Summary: |-
    Complete native Writer column width dialog and table sizing command path

    Connect the existing table width manager to the original SetColumnWidth dialog command; port missing native maximum-width and draft contracts, source controls and module units, and verify real frame selection/history/ODT behavior.
  Scope: "Only vite-office-writer on writer. Existing SwTableFUNC/table shell and browser dialog owners; source-shaped colwd draft, ColumnWidthDialog presenter and pinned generated command resources; related sizing/state/history/ODT/browser tests and conservative runtime/provenance records. Necessary test maintenance stays within this table-sizing function. No network, merges, branch changes, structural table deletion, recovery/save/open policy changes or locale expansion."
  Plan: "Port GetMaxColWidth and SwTableWidthDlg from pinned tablemgr.cxx/colwd.cxx/columnwidth.ui with original visible-column numbering, minimum/maximum updates, construction-time draft and Apply-time reinitialization and uint16 ingress. Connect SetColumnWidth through the actual frame/dialog lifecycle and existing manager/history; render original Column and Width controls with current module units. Verify column scope, hidden intervals, cancel/replacement, native bounds, Undo/Redo and ODT on desktop/mobile; continue the active goal after closing the task."
  Verify Steps: "Run related table manager, native column dialog, actual frame/browser sizing and ODT roundtrip tests. Cover first/middle/last and single columns, native hidden separators/max borrowing, draft cancellation, Apply-time refresh and uint16 conversion, current units and native column-number changes, history and modal document replacement. Verify menu and complete dialog at1280/390 with actual ODT export. Run strict focused coverage for changed responsibilities without reducing thresholds; typecheck, changed-source ESLint/Prettier, build/static, generated resources, dependency boundaries, JSDoc/file-size, source-tree/provenance/invariants and AgentPlane doctor/routing. This is task2 after the ACR55N full checkpoint; retain one full run per ten tasks."
  Verification: "Passed related39 files /477 tests; final strict owner run3 files /24 tests passes fresh100 for native column draft, full table manager and browser presenter (90 statements,36 branch arms,21 functions,77 lines). Source-identity incremental audit includes the current Writer view:4 owners,312 statements,191 branch arms,97 functions,288 lines all100, with prior hits allowed only on exact unchanged source spans at git-diff-corresponding positions after baseline SHA256 checks. Changed counters require fresh hits. Browser4/4 CM/INCH at1280/390 passes source menu, selector reset, cancellation, native width conversion, Undo/Redo, aligned grid geometry and actual ODT. Final desktop/mobile screenshots inspected. Native tests cover current first/middle/last columns, single-column field lock, native hidden intervals/max borrowing, Apply-time geometry refresh, large valid UInt16 width, original cursor/history and ODT. Mounted tests cover both sizing families on document replacement and replacement during submit propagation. Typecheck, scoped ESLint/Prettier, build/static, generated resources, dependency boundaries, JSDoc/file-size, source-tree/provenance, invariants/parity, doctor and routing passed. Doctor retains the existing managed hook readiness warning with zero errors; no hook changes. Evidence: output/playwright/writer-column-sizing/{related-coverage.log,strict-coverage-final.log,browser-layout-final.log,incremental-coverage-audit.json,audit-incremental-coverage.mjs,check-*.log,build-final.log}. Raw partial-owner coverage gate failures are retained and do not substitute for the strict final audit. Task2 after ACR55N full checkpoint; no full rerun under the approved one-per-ten cadence. No network/branch/integration or save/open/recovery changes; continue goal after close."
  Rollback Plan: "Revert only this task implementation commits, retaining prior table flow and metric controls. No integration or branch operations."
  Findings: |-
    The previous goal turn made concrete verified progress: DZ4EH4 closed with native table flow commands, UI/history/ODT evidence and clean writer state. User continuation and mutation authorization remain active. Inspection found a missing SetColumnWidth dialog over an already consumed width manager; structural deletion core is absent and remains a separate implementation block. Use pinned local sources; no outside access or network required.

    - Observation: Initial bounded edit batch stopped on an exact generator-spec marker assertion after writing the manager method and native column draft.
      Impact: The generator was not written and no verification ran; only intended scoped core files changed.
      Resolution: Inspect actual generator declaration before adding the command; continue from current diff within the approved sizing scope.

    - Observation: Initial native dialog test fixtures inherited FULL table orientation, which scales authored widths to the page body; a wide fixture also exceeded the represented65535-twip geometry bound. The single-column Apply invokes existing frame normalization even when field width is unchanged. One header-close test used the wrong accessible label.
      Impact: Test expectations initially described different geometry and modal labels from the actual source-driven owners; implementation source was not changed to satisfy them.
      Resolution: Author fixed-width fixtures explicitly with native LEFT orientation, test65000 inside actual wide geometry bounds, preserve existing Apply normalization/history, and use the shared Close label. Related27 tests now pass, including native manager, draft, mounted width/height dialogs and document replacement during submit propagation.

    - Observation: Focused coverage initially exposed an untested existing last-column separator adjustment; browser integer-inch expectations omitted the configured two decimal digits. Visual review found the numeric and metric fields did not share one grid column.
      Impact: These checks identified missing regression evidence and a source-layout discrepancy within the approved sizing function.
      Resolution: Added actual first/last edge-column Apply/Undo/Redo scenarios, retained native two-digit browser formatting, and placed both controls in the source-shaped common grid with linked labels and unique React IDs. Final24 owner/UI tests achieve fresh100 across90 statements,36 branch arms,21 functions and77 lines; final4 desktop/mobile CM/INCH browser scenarios pass including aligned bounding boxes and ODT. Related39 files /477 tests pass. Exact-source incremental audit adds only unchanged prior Writer view counters and reaches100 over4 current owners:312 statements,191 branch arms,97 functions,288 lines. Raw focused owner-wide failures remain recorded; thresholds are unchanged.
id_source: "generated"
---
## Summary

Complete native Writer column width dialog and table sizing command path

Connect the existing table width manager to the original SetColumnWidth dialog command; port missing native maximum-width and draft contracts, source controls and module units, and verify real frame selection/history/ODT behavior.

## Scope

Only vite-office-writer on writer. Existing SwTableFUNC/table shell and browser dialog owners; source-shaped colwd draft, ColumnWidthDialog presenter and pinned generated command resources; related sizing/state/history/ODT/browser tests and conservative runtime/provenance records. Necessary test maintenance stays within this table-sizing function. No network, merges, branch changes, structural table deletion, recovery/save/open policy changes or locale expansion.

## Plan

Port GetMaxColWidth and SwTableWidthDlg from pinned tablemgr.cxx/colwd.cxx/columnwidth.ui with original visible-column numbering, minimum/maximum updates, construction-time draft and Apply-time reinitialization and uint16 ingress. Connect SetColumnWidth through the actual frame/dialog lifecycle and existing manager/history; render original Column and Width controls with current module units. Verify column scope, hidden intervals, cancel/replacement, native bounds, Undo/Redo and ODT on desktop/mobile; continue the active goal after closing the task.

## Verify Steps

Run related table manager, native column dialog, actual frame/browser sizing and ODT roundtrip tests. Cover first/middle/last and single columns, native hidden separators/max borrowing, draft cancellation, Apply-time refresh and uint16 conversion, current units and native column-number changes, history and modal document replacement. Verify menu and complete dialog at1280/390 with actual ODT export. Run strict focused coverage for changed responsibilities without reducing thresholds; typecheck, changed-source ESLint/Prettier, build/static, generated resources, dependency boundaries, JSDoc/file-size, source-tree/provenance/invariants and AgentPlane doctor/routing. This is task2 after the ACR55N full checkpoint; retain one full run per ten tasks.

## Verification

Passed related39 files /477 tests; final strict owner run3 files /24 tests passes fresh100 for native column draft, full table manager and browser presenter (90 statements,36 branch arms,21 functions,77 lines). Source-identity incremental audit includes the current Writer view:4 owners,312 statements,191 branch arms,97 functions,288 lines all100, with prior hits allowed only on exact unchanged source spans at git-diff-corresponding positions after baseline SHA256 checks. Changed counters require fresh hits. Browser4/4 CM/INCH at1280/390 passes source menu, selector reset, cancellation, native width conversion, Undo/Redo, aligned grid geometry and actual ODT. Final desktop/mobile screenshots inspected. Native tests cover current first/middle/last columns, single-column field lock, native hidden intervals/max borrowing, Apply-time geometry refresh, large valid UInt16 width, original cursor/history and ODT. Mounted tests cover both sizing families on document replacement and replacement during submit propagation. Typecheck, scoped ESLint/Prettier, build/static, generated resources, dependency boundaries, JSDoc/file-size, source-tree/provenance, invariants/parity, doctor and routing passed. Doctor retains the existing managed hook readiness warning with zero errors; no hook changes. Evidence: output/playwright/writer-column-sizing/{related-coverage.log,strict-coverage-final.log,browser-layout-final.log,incremental-coverage-audit.json,audit-incremental-coverage.mjs,check-*.log,build-final.log}. Raw partial-owner coverage gate failures are retained and do not substitute for the strict final audit. Task2 after ACR55N full checkpoint; no full rerun under the approved one-per-ten cadence. No network/branch/integration or save/open/recovery changes; continue goal after close.

## Rollback Plan

Revert only this task implementation commits, retaining prior table flow and metric controls. No integration or branch operations.

## Findings

The previous goal turn made concrete verified progress: DZ4EH4 closed with native table flow commands, UI/history/ODT evidence and clean writer state. User continuation and mutation authorization remain active. Inspection found a missing SetColumnWidth dialog over an already consumed width manager; structural deletion core is absent and remains a separate implementation block. Use pinned local sources; no outside access or network required.

- Observation: Initial bounded edit batch stopped on an exact generator-spec marker assertion after writing the manager method and native column draft.
  Impact: The generator was not written and no verification ran; only intended scoped core files changed.
  Resolution: Inspect actual generator declaration before adding the command; continue from current diff within the approved sizing scope.

- Observation: Initial native dialog test fixtures inherited FULL table orientation, which scales authored widths to the page body; a wide fixture also exceeded the represented65535-twip geometry bound. The single-column Apply invokes existing frame normalization even when field width is unchanged. One header-close test used the wrong accessible label.
  Impact: Test expectations initially described different geometry and modal labels from the actual source-driven owners; implementation source was not changed to satisfy them.
  Resolution: Author fixed-width fixtures explicitly with native LEFT orientation, test65000 inside actual wide geometry bounds, preserve existing Apply normalization/history, and use the shared Close label. Related27 tests now pass, including native manager, draft, mounted width/height dialogs and document replacement during submit propagation.

- Observation: Focused coverage initially exposed an untested existing last-column separator adjustment; browser integer-inch expectations omitted the configured two decimal digits. Visual review found the numeric and metric fields did not share one grid column.
  Impact: These checks identified missing regression evidence and a source-layout discrepancy within the approved sizing function.
  Resolution: Added actual first/last edge-column Apply/Undo/Redo scenarios, retained native two-digit browser formatting, and placed both controls in the source-shaped common grid with linked labels and unique React IDs. Final24 owner/UI tests achieve fresh100 across90 statements,36 branch arms,21 functions and77 lines; final4 desktop/mobile CM/INCH browser scenarios pass including aligned bounding boxes and ODT. Related39 files /477 tests pass. Exact-source incremental audit adds only unchanged prior Writer view counters and reaches100 over4 current owners:312 statements,191 branch arms,97 functions,288 lines. Raw focused owner-wide failures remain recorded; thresholds are unchanged.
