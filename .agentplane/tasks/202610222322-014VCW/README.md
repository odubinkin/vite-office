---
id: "202610222322-014VCW"
title: "Canonicalize Writer font size controls and grow shrink commands"
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
  updated_at: "2026-10-22T23:23:19.801Z"
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
    body: "Start: implement original font size numeric controls and Grow/Shrink traversal, slots and UI over actual Writer owners, with related tests and strict source-bound coverage in writer."
events:
  -
    type: "status"
    at: "2026-10-22T23:23:34.853Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement original font size numeric controls and Grow/Shrink traversal, slots and UI over actual Writer owners, with related tests and strict source-bound coverage in writer."
doc_version: 3
doc_updated_at: "2026-10-22T23:23:34.853Z"
doc_updated_by: "CODER"
description: "Replace the restricted font-size select with original absolute FontSizeBox numeric behavior and standard sizes, and connect native Writer Grow/Shrink traversal and slots to sidebar/menu/core/history/ODT."
sections:
  Summary: |-
    Canonicalize Writer font size controls and grow shrink commands

    Replace the restricted font-size select with original absolute FontSizeBox numeric behavior and standard sizes, and connect native Writer Grow/Shrink traversal and slots to sidebar/menu/core/history/ODT.
  Scope: "Only writer checkout and writer branch. Original FontList scalable size array at canonical source/header owner, consumed absolute FontSizeBox numeric parsing/formatting/clamping using existing VCL field/host decimal boundaries, shared editable font-size widget, native Writer ExecCharAttr/GetAttrState Grow/Shrink and GetItemWithPaM character traversal over actual hint/item/cursor owners, commands/resources/sidebar/menu, selection/table typing/history/graph/ODT. Up to32 implementation/resource/tooling paths plus paired canonical records/generated views and up to20 test paths. No synthetic font/script/provider service, native memory/lifetime emulation, network, merges, locale-data expansion or deliberate recovery/autosave/open/save policy changes."
  Plan: "Port original scalable FontList sizes and absolute FontSizeBox numeric contracts through existing real VCL conversion/locale fields; replace fixed select with editable browser combo behavior retaining native acceptance. Implement original GetItemWithPaM traversal and Writer Grow/Shrink state/execute over actual source items/scripts/cursors and existing undo transactions. Wire generated resources and native Character sidebar/menu placements. Verify actual custom-size entry, mixed/caret/table all-script changes, history/ODT and Calc shared widget regression; document suspected native issues without changing contracts; update canonical records, related strict coverage and local gates, close task and continue active goal."
  Verify Steps: "Read pinned ctrltool.cxx/ctrlbox.cxx/tbcontrl.cxx, txtattr.cxx ExecCharAttr/GetAttrState and edattr.cxx GetItemWithPaM, actual sidebartextpanel.ui and swriter.sdi. Prove original32 scalable sizes, absolute decimal/suffix conversion, empty/invalid/clamp/rounding behavior and keyboard/pointer acceptance without partial keystroke formatting or hidden preset substitution. Prove source40twip increment/19998 maximum and unsigned32 arithmetic, single/mixed selection and original segmentation/null/default state contracts, all-script items, caret/table/history ownership and readonly request boundaries. Related font/character/script/selection/hint/history/ODT/widget/Calc-sharing/resource tests, actual Chromium desktop/mobile custom size/grow/shrink/Undo/Redo/download/reopen. Strict current changed-responsibility coverage with exact source identities; all declared local typecheck/scoped lint/format/build/static/docs/dependencies/resources/provenance/tree/invariants/parity/size/doctor/routing/diff/status gates. Seventh task after ACR55N: no full suite."
  Verification: "Pending implementation and related checks. No full native font-device/locale-name/style/redline/service graph parity claim."
  Rollback Plan: "Revert only this task implementation commits, preserving prior paper/table/character work and task traceability. No reset, merge or external write."
  Findings: "Previous goal turn is progress: PQAY2F closed at1cb47ad46dff, sourcef791f50bb11a,494 current related/133 focused/21 boundary/9 Chromium tests and exact10-owner100 audit; writer clean. Current read-only audit finds hardcoded15-size select, no editable absolute size and no sidebar Grow/Shrink placements despite actual upstream controls. Pinned native Writer increments40twips, not scalable-list stepping, with maximum19998; mixed selection uses original GetItemWithPaM. Broad user mutation/continuation approval persists and prior stop requests are revoked. Only approved pinned local LO sources9bc445578031fecf56086729d8e4940c77e14d65. Goal stays active."
id_source: "generated"
---
## Summary

Canonicalize Writer font size controls and grow shrink commands

Replace the restricted font-size select with original absolute FontSizeBox numeric behavior and standard sizes, and connect native Writer Grow/Shrink traversal and slots to sidebar/menu/core/history/ODT.

## Scope

Only writer checkout and writer branch. Original FontList scalable size array at canonical source/header owner, consumed absolute FontSizeBox numeric parsing/formatting/clamping using existing VCL field/host decimal boundaries, shared editable font-size widget, native Writer ExecCharAttr/GetAttrState Grow/Shrink and GetItemWithPaM character traversal over actual hint/item/cursor owners, commands/resources/sidebar/menu, selection/table typing/history/graph/ODT. Up to32 implementation/resource/tooling paths plus paired canonical records/generated views and up to20 test paths. No synthetic font/script/provider service, native memory/lifetime emulation, network, merges, locale-data expansion or deliberate recovery/autosave/open/save policy changes.

## Plan

Port original scalable FontList sizes and absolute FontSizeBox numeric contracts through existing real VCL conversion/locale fields; replace fixed select with editable browser combo behavior retaining native acceptance. Implement original GetItemWithPaM traversal and Writer Grow/Shrink state/execute over actual source items/scripts/cursors and existing undo transactions. Wire generated resources and native Character sidebar/menu placements. Verify actual custom-size entry, mixed/caret/table all-script changes, history/ODT and Calc shared widget regression; document suspected native issues without changing contracts; update canonical records, related strict coverage and local gates, close task and continue active goal.

## Verify Steps

Read pinned ctrltool.cxx/ctrlbox.cxx/tbcontrl.cxx, txtattr.cxx ExecCharAttr/GetAttrState and edattr.cxx GetItemWithPaM, actual sidebartextpanel.ui and swriter.sdi. Prove original32 scalable sizes, absolute decimal/suffix conversion, empty/invalid/clamp/rounding behavior and keyboard/pointer acceptance without partial keystroke formatting or hidden preset substitution. Prove source40twip increment/19998 maximum and unsigned32 arithmetic, single/mixed selection and original segmentation/null/default state contracts, all-script items, caret/table/history ownership and readonly request boundaries. Related font/character/script/selection/hint/history/ODT/widget/Calc-sharing/resource tests, actual Chromium desktop/mobile custom size/grow/shrink/Undo/Redo/download/reopen. Strict current changed-responsibility coverage with exact source identities; all declared local typecheck/scoped lint/format/build/static/docs/dependencies/resources/provenance/tree/invariants/parity/size/doctor/routing/diff/status gates. Seventh task after ACR55N: no full suite.

## Verification

Pending implementation and related checks. No full native font-device/locale-name/style/redline/service graph parity claim.

## Rollback Plan

Revert only this task implementation commits, preserving prior paper/table/character work and task traceability. No reset, merge or external write.

## Findings

Previous goal turn is progress: PQAY2F closed at1cb47ad46dff, sourcef791f50bb11a,494 current related/133 focused/21 boundary/9 Chromium tests and exact10-owner100 audit; writer clean. Current read-only audit finds hardcoded15-size select, no editable absolute size and no sidebar Grow/Shrink placements despite actual upstream controls. Pinned native Writer increments40twips, not scalable-list stepping, with maximum19998; mixed selection uses original GetItemWithPaM. Broad user mutation/continuation approval persists and prior stop requests are revoked. Only approved pinned local LO sources9bc445578031fecf56086729d8e4940c77e14d65. Goal stays active.
