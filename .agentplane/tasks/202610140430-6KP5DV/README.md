---
id: "202610140430-6KP5DV"
title: "Restore native table frame sibling root constructor contracts"
status: "DOING"
priority: "high"
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
  updated_at: "2026-10-14T04:32:05.437Z"
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
    body: "Start: restore native table/row/cell sibling-root contract and core/browser callers; remove geometry constructor adapter with token-preserving caller migrations. One ownership correction 4/10, three whole source modules 100% coverage."
events:
  -
    type: "status"
    at: "2026-10-14T04:32:12.515Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore native table/row/cell sibling-root contract and core/browser callers; remove geometry constructor adapter with token-preserving caller migrations. One ownership correction 4/10, three whole source modules 100% coverage."
doc_version: 3
doc_updated_at: "2026-10-14T04:32:12.515Z"
doc_updated_by: "CODER"
description: "Correction 4/10: remove browser geometry from SwTabFrame constructor, restore native sibling root propagation through table/row/cell constructors and actual core pagination and browser mouse callers. Ordinary JS property assignment for device geometry. Source-backed caller-only old test migrations preserve all assertions/data. No persistent-layout parity claim or new adapter/manager."
sections:
  Summary: "Restore original sibling-root constructor contracts across native table, row and cell frames."
  Scope: "Production three modules: apps/office/src/sw/source/core/layout/tabfrm.ts, apps/office/src/sw/source/core/layout/newfrm.ts, apps/office/src/sw/browser/editor/browser-writer-edit-window.ts. Six corresponding writer canonical runtime/provenance records. Fresh two native source/browser tests. Caller-only geometry assignment migrations in 12 existing tests: apps/office/src/sw/source/uibase/uiview/native-column-item-boundary.test.ts, apps/office/src/sw/source/uibase/uiview/native-row-item-boundary.test.ts, apps/office/src/sw/source/uibase/docvw/native-table-row-drag.test.ts, apps/office/src/sw/source/uibase/docvw/native-row-modifier-drag.test.ts, apps/office/src/sw/source/uibase/docvw/native-table-column-drag.test.ts, apps/office/src/sw/source/uibase/docvw/native-table-linear-drag.test.ts, apps/office/src/sw/source/uibase/docvw/native-table-proportional-drag.test.ts, apps/office/src/sw/source/uibase/docvw/native-ruler-ownership.test.ts, apps/office/src/sw/source/core/frmedt/native-table-mouse.test.ts, apps/office/src/sw/source/core/docnode/native-column-frame-normalization.test.ts, apps/office/src/sw/source/core/docnode/native-tabrows.test.ts, apps/office/src/sw/source/core/docnode/native-row-frame-size.test.ts. No other old acceptance edits. Scope follows one constructor/ownership contract, no persistent page/follow hierarchy claim."
  Plan: "SwTabFrame(table,sibling?), SwRowFrame(line,sibling?), SwCellFrame(box,sibling?) forward the original root-bearing sibling to SwLayoutFrame. Table passes itself to rows and rows pass themselves to cells. Device mouseGeometry stays an explicit optional field, removed from native constructor; old fixture callers use standard Object.assign with the original geometry object instead. Core pagination passes its existing sibling and actual browser mouse allocation passes its existing shell layout. No new adapter, factory, state map or manager. Keep format/rows/cells and native lifetime/notifications unchanged otherwise."
  Verify Steps: "Inspect pinned tabfrm.cxx table/row/cell constructors and original SwFrame root propagation. Fresh actual native root, independent roots, detached defaults, original lower/root identities, notifications and destruction tests plus actual BrowserWriterEditWindow mouse allocation/reuse/history/root identity. Whole three current production modules original Istanbul 100% four metrics and positive counters; new+related once, tooling and current native table-column/row/modifier/browser regressions. Four reference symlinks physically absent and finally exactrestore for every producer. Scoped format/full lint/TS7/JSDoc/size/deps/build/static. Restored-reference nine metadata gates (source-tree/provenance/registry/resources--check/invariants/parity/routing/doctor/diff). For each old caller migration reverse only Object.assign(new SwTabFrame(table),{mouseGeometry:original}) to original new SwTabFrame(table,original), then require all scanner tokens equal including assertions/declarations/data; all other old tests byte-identical. Preserve canonical prefixes and input/build hashes. Same-agent non-independent quality and clean finish. Cycle 4/10: upcoming full continues, following full pauses after repairs."
  Verification: "Pending native constructor and browser focused verification."
  Rollback Plan: "Revert scoped semantic commit without rewriting history. Four exact symlinks restored in finally; no source/helper/raw copies in Agentplane, no network/global access/publication/dependency setup."
  Findings: "Writer clean at 062ce5b992d8 after correction 3/10. Pin 9bc445578031fecf56086729d8e4940c77e14d65. Original native constructors borrow a sibling into SwLayoutFrame to preserve actual root, passing table to its rows and row to its cells. Current table second argument is device geometry and lower constructors omit sibling, so actual table/lower frames have no root despite existing root-bearing SwFrame constructor. This is a source-backed prerequisite to native shared layout/UI frame ownership. Temporary per-render table frames and full persistent page/master/follow/paint/hit graph remain unresolved, not replaced by a parity claim. No suspicious core source logic observed; protected IO/recovery/Space unchanged."
id_source: "generated"
---
## Summary

Restore original sibling-root constructor contracts across native table, row and cell frames.

## Scope

Production three modules: apps/office/src/sw/source/core/layout/tabfrm.ts, apps/office/src/sw/source/core/layout/newfrm.ts, apps/office/src/sw/browser/editor/browser-writer-edit-window.ts. Six corresponding writer canonical runtime/provenance records. Fresh two native source/browser tests. Caller-only geometry assignment migrations in 12 existing tests: apps/office/src/sw/source/uibase/uiview/native-column-item-boundary.test.ts, apps/office/src/sw/source/uibase/uiview/native-row-item-boundary.test.ts, apps/office/src/sw/source/uibase/docvw/native-table-row-drag.test.ts, apps/office/src/sw/source/uibase/docvw/native-row-modifier-drag.test.ts, apps/office/src/sw/source/uibase/docvw/native-table-column-drag.test.ts, apps/office/src/sw/source/uibase/docvw/native-table-linear-drag.test.ts, apps/office/src/sw/source/uibase/docvw/native-table-proportional-drag.test.ts, apps/office/src/sw/source/uibase/docvw/native-ruler-ownership.test.ts, apps/office/src/sw/source/core/frmedt/native-table-mouse.test.ts, apps/office/src/sw/source/core/docnode/native-column-frame-normalization.test.ts, apps/office/src/sw/source/core/docnode/native-tabrows.test.ts, apps/office/src/sw/source/core/docnode/native-row-frame-size.test.ts. No other old acceptance edits. Scope follows one constructor/ownership contract, no persistent page/follow hierarchy claim.

## Plan

SwTabFrame(table,sibling?), SwRowFrame(line,sibling?), SwCellFrame(box,sibling?) forward the original root-bearing sibling to SwLayoutFrame. Table passes itself to rows and rows pass themselves to cells. Device mouseGeometry stays an explicit optional field, removed from native constructor; old fixture callers use standard Object.assign with the original geometry object instead. Core pagination passes its existing sibling and actual browser mouse allocation passes its existing shell layout. No new adapter, factory, state map or manager. Keep format/rows/cells and native lifetime/notifications unchanged otherwise.

## Verify Steps

Inspect pinned tabfrm.cxx table/row/cell constructors and original SwFrame root propagation. Fresh actual native root, independent roots, detached defaults, original lower/root identities, notifications and destruction tests plus actual BrowserWriterEditWindow mouse allocation/reuse/history/root identity. Whole three current production modules original Istanbul 100% four metrics and positive counters; new+related once, tooling and current native table-column/row/modifier/browser regressions. Four reference symlinks physically absent and finally exactrestore for every producer. Scoped format/full lint/TS7/JSDoc/size/deps/build/static. Restored-reference nine metadata gates (source-tree/provenance/registry/resources--check/invariants/parity/routing/doctor/diff). For each old caller migration reverse only Object.assign(new SwTabFrame(table),{mouseGeometry:original}) to original new SwTabFrame(table,original), then require all scanner tokens equal including assertions/declarations/data; all other old tests byte-identical. Preserve canonical prefixes and input/build hashes. Same-agent non-independent quality and clean finish. Cycle 4/10: upcoming full continues, following full pauses after repairs.

## Verification

Pending native constructor and browser focused verification.

## Rollback Plan

Revert scoped semantic commit without rewriting history. Four exact symlinks restored in finally; no source/helper/raw copies in Agentplane, no network/global access/publication/dependency setup.

## Findings

Writer clean at 062ce5b992d8 after correction 3/10. Pin 9bc445578031fecf56086729d8e4940c77e14d65. Original native constructors borrow a sibling into SwLayoutFrame to preserve actual root, passing table to its rows and row to its cells. Current table second argument is device geometry and lower constructors omit sibling, so actual table/lower frames have no root despite existing root-bearing SwFrame constructor. This is a source-backed prerequisite to native shared layout/UI frame ownership. Temporary per-render table frames and full persistent page/master/follow/paint/hit graph remain unresolved, not replaced by a parity claim. No suspicious core source logic observed; protected IO/recovery/Space unchanged.
