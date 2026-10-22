---
id: "202610221922-AAX9TR"
title: "Complete native Writer column width dialog and table sizing command path"
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
doc_updated_at: "2026-10-22T19:22:46.280Z"
doc_updated_by: "CODER"
description: "Connect the existing table width manager to the original SetColumnWidth dialog command; port missing native maximum-width and draft contracts, source controls and module units, and verify real frame selection/history/ODT behavior."
sections:
  Summary: |-
    Complete native Writer column width dialog and table sizing command path

    Connect the existing table width manager to the original SetColumnWidth dialog command; port missing native maximum-width and draft contracts, source controls and module units, and verify real frame selection/history/ODT behavior.
  Scope: "Only vite-office-writer on writer. Existing SwTableFUNC/table shell and browser dialog owners; source-shaped colwd draft, ColumnWidthDialog presenter and pinned generated command resources; related sizing/state/history/ODT/browser tests and conservative runtime/provenance records. Necessary test maintenance stays within this table-sizing function. No network, merges, branch changes, structural table deletion, recovery/save/open policy changes or locale expansion."
  Plan: "Port GetMaxColWidth and SwTableWidthDlg from pinned tablemgr.cxx/colwd.cxx/columnwidth.ui with original visible-column numbering, minimum/maximum updates, construction-time draft and Apply-time reinitialization and uint16 ingress. Connect SetColumnWidth through the actual frame/dialog lifecycle and existing manager/history; render original Column and Width controls with current module units. Verify column scope, hidden intervals, cancel/replacement, native bounds, Undo/Redo and ODT on desktop/mobile; continue the active goal after closing the task."
  Verify Steps: "Run related table manager, native column dialog, actual frame/browser sizing and ODT roundtrip tests. Cover first/middle/last and single columns, native hidden separators/max borrowing, draft cancellation, Apply-time refresh and uint16 conversion, current units and native column-number changes, history and modal document replacement. Verify menu and complete dialog at1280/390 with actual ODT export. Run strict focused coverage for changed responsibilities without reducing thresholds; typecheck, changed-source ESLint/Prettier, build/static, generated resources, dependency boundaries, JSDoc/file-size, source-tree/provenance/invariants and AgentPlane doctor/routing. This is task2 after the ACR55N full checkpoint; retain one full run per ten tasks."
  Verification: "Pending implementation and bounded checks."
  Rollback Plan: "Revert only this task implementation commits, retaining prior table flow and metric controls. No integration or branch operations."
  Findings: "The previous goal turn made concrete verified progress: DZ4EH4 closed with native table flow commands, UI/history/ODT evidence and clean writer state. User continuation and mutation authorization remain active. Inspection found a missing SetColumnWidth dialog over an already consumed width manager; structural deletion core is absent and remains a separate implementation block. Use pinned local sources; no outside access or network required."
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

Pending implementation and bounded checks.

## Rollback Plan

Revert only this task implementation commits, retaining prior table flow and metric controls. No integration or branch operations.

## Findings

The previous goal turn made concrete verified progress: DZ4EH4 closed with native table flow commands, UI/history/ODT evidence and clean writer state. User continuation and mutation authorization remain active. Inspection found a missing SetColumnWidth dialog over an already consumed width manager; structural deletion core is absent and remains a separate implementation block. Use pinned local sources; no outside access or network required.
