---
id: "202610181353-EGPAKC"
title: "Add canonical row-major cell traversal for ODS export"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-18T13:54:27.230Z"
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
    body: "Start: add actual row-major typed-block traversal for same-model ODS export,reusing native column views and shared mdds without a second grid or UI."
events:
  -
    type: "status"
    at: "2026-10-18T13:54:27.647Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: add actual row-major typed-block traversal for same-model ODS export,reusing native column views and shared mdds without a second grid or UI."
doc_version: 3
doc_updated_at: "2026-10-18T13:54:27.647Z"
doc_updated_by: "CODER"
description: "Task203: implement actual ScHorizontalCellIterator over existing typed column blocks and borrowed cell views, preserving native row-major state/skip behavior and sheet reset. Reuse native GetCellStore and allocated-column bounds;no copied grid or UI. This is the direct core traversal consumed by minimal same-model ODS export."
sections:
  Summary: "Task203 implements the real row-major nonempty-cell traversal required by same-model ODS export. It visits existing typed column blocks and borrowed ScRefCellValue owners,without a copied grid or UI implementation."
  Scope: "New sc/inc/dociter.ts facade and sc/source/core/data/dociter.ts ScHorizontalCellIterator with native constructor,SetTab,GetNext,GetPos,Advance,SkipInvalid,SkipInvalidInRow,FindNextNonEmptyRow;actual maColPositions/block cursors and stable maCurCell view. Existing ScColumn.GetCellStore,ScTable.ClampToAllocatedColumns and native sc::toRefCell in core/data/mtvelements.ts re-exported through inc/mtvelements.ts. Refactor existing Column.GetCellValue to the same native typed conversion helper instead of duplicating it. Valid bounded row/column range and existing sheet are native preconditions;SetTab does not widen the original constructor clamp and rejects an unallocated column range rather than manufacturing a fallback. Numeric/string/formula/empty families only;rich edit-text is still absent. Paired inventory/provenance/capability/readiness docs and focused tests. No shared mdds algorithm changes,ODS filter/UI claim,language detour,native compilation or new lifetime machinery."
  Plan: "1. Audit pinned dociter.cxx/hxx horizontal cursor state and mtvelements typed view conversion,allocated-column clamp. 2. Implement actual row-major block skip logic and reuse shared mdds const iterators and cell views. 3. Verify sparse/interleaved/contiguous blocks,bounded cuts,end state,stable view identity,empty and unallocated ranges,sheet reset and formula/string values without evaluation. 4. Record source-derived evidence and exact raw100 whole Calc/related tests,real browser/Worker traversal,existing13source gates,path/hash audit,commit and same-agent quality review. ODS filter work follows immediately after this traversal prerequisite."
  Verify Steps: |-
    node output/playwright/task203-checks/source-audit.mjs: pinned native cursor/helper/clamp proof,source markers/hashes,no C++ execution.
    node output/playwright/task203-checks/portable.mjs: whole Calc strict raw S/B/F/L100 exact executable owners and related mdds/token/string tests,with all5native references absent/restored;Writer-only coverage gaps exempt.
    node output/playwright/task203-checks/browser-portable.mjs: build and actual sparse row-major traversal in Chromium/DOM-free Worker,without source references.
    node output/playwright/task203-checks/source-gates.mjs: existing13format/lint/types/docs/size/dependency/tree/provenance/inventory/routing/doctor/diff/boundary gates with no threshold/allowlist relaxation.
    Final exact path/hash/reference/coverage audit,recorded verification/source commit and same-agent review. No all-app full run until minimum core plus basic ODS milestone,then pause;UI remains separate.
  Verification: "Pending approved implementation and declared evidence."
  Rollback Plan: "Revert only task203 code and metadata commits;retain task202 formula output and existing shared stores. No branch integration or user file changes."
  Findings: "Standing user approval covers the minimal canonical core and same-model ODS priority. Prior goal turn completed task202 atc01a5ffd9013/close2b96eacc0bbf and is progress. Existing shared ZIP/manifest/SAX/XML facilities will be reused by Calc filters. Native output-reference coordinates use mutable one-element slots;JS GC owns physical lifetime. No copied cell model is introduced."
id_source: "generated"
---
## Summary

Task203 implements the real row-major nonempty-cell traversal required by same-model ODS export. It visits existing typed column blocks and borrowed ScRefCellValue owners,without a copied grid or UI implementation.

## Scope

New sc/inc/dociter.ts facade and sc/source/core/data/dociter.ts ScHorizontalCellIterator with native constructor,SetTab,GetNext,GetPos,Advance,SkipInvalid,SkipInvalidInRow,FindNextNonEmptyRow;actual maColPositions/block cursors and stable maCurCell view. Existing ScColumn.GetCellStore,ScTable.ClampToAllocatedColumns and native sc::toRefCell in core/data/mtvelements.ts re-exported through inc/mtvelements.ts. Refactor existing Column.GetCellValue to the same native typed conversion helper instead of duplicating it. Valid bounded row/column range and existing sheet are native preconditions;SetTab does not widen the original constructor clamp and rejects an unallocated column range rather than manufacturing a fallback. Numeric/string/formula/empty families only;rich edit-text is still absent. Paired inventory/provenance/capability/readiness docs and focused tests. No shared mdds algorithm changes,ODS filter/UI claim,language detour,native compilation or new lifetime machinery.

## Plan

1. Audit pinned dociter.cxx/hxx horizontal cursor state and mtvelements typed view conversion,allocated-column clamp. 2. Implement actual row-major block skip logic and reuse shared mdds const iterators and cell views. 3. Verify sparse/interleaved/contiguous blocks,bounded cuts,end state,stable view identity,empty and unallocated ranges,sheet reset and formula/string values without evaluation. 4. Record source-derived evidence and exact raw100 whole Calc/related tests,real browser/Worker traversal,existing13source gates,path/hash audit,commit and same-agent quality review. ODS filter work follows immediately after this traversal prerequisite.

## Verify Steps

node output/playwright/task203-checks/source-audit.mjs: pinned native cursor/helper/clamp proof,source markers/hashes,no C++ execution.
node output/playwright/task203-checks/portable.mjs: whole Calc strict raw S/B/F/L100 exact executable owners and related mdds/token/string tests,with all5native references absent/restored;Writer-only coverage gaps exempt.
node output/playwright/task203-checks/browser-portable.mjs: build and actual sparse row-major traversal in Chromium/DOM-free Worker,without source references.
node output/playwright/task203-checks/source-gates.mjs: existing13format/lint/types/docs/size/dependency/tree/provenance/inventory/routing/doctor/diff/boundary gates with no threshold/allowlist relaxation.
Final exact path/hash/reference/coverage audit,recorded verification/source commit and same-agent review. No all-app full run until minimum core plus basic ODS milestone,then pause;UI remains separate.

## Verification

Pending approved implementation and declared evidence.

## Rollback Plan

Revert only task203 code and metadata commits;retain task202 formula output and existing shared stores. No branch integration or user file changes.

## Findings

Standing user approval covers the minimal canonical core and same-model ODS priority. Prior goal turn completed task202 atc01a5ffd9013/close2b96eacc0bbf and is progress. Existing shared ZIP/manifest/SAX/XML facilities will be reused by Calc filters. Native output-reference coordinates use mutable one-element slots;JS GC owns physical lifetime. No copied cell model is introduced.
