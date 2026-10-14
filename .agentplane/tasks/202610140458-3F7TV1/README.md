---
id: "202610140458-3F7TV1"
title: "Share layout-owned native table frames with browser rendering"
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
  updated_at: "2026-10-14T04:59:39.575Z"
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
    body: "Start: original root owns represented native table masters; row measurement and actual visible/shadow paint borrow original hierarchy, shared freshness scan replaces private duplicate. No new manager/map. Cycle 5/10 with whole current five-module 100% coverage."
events:
  -
    type: "status"
    at: "2026-10-14T04:59:49.472Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: original root owns represented native table masters; row measurement and actual visible/shadow paint borrow original hierarchy, shared freshness scan replaces private duplicate. No new manager/map. Cycle 5/10 with whole current five-module 100% coverage."
doc_version: 3
doc_updated_at: "2026-10-14T04:59:49.472Z"
doc_updated_by: "CODER"
description: "Cycle 5/10: original root owns/reuses one represented native master per table, row measurement and visible/shadow rendering borrow it. Remove per-render/pagination ownership on actual path and consolidate existing model hierarchy freshness predicate without a manager/map. Preserve detached standalone compatibility and consciously registered IO/recovery/Space. Physical page/follow and pointer ownership remain separate pending scope."
sections:
  Summary: "Reuse actual layout-owned native table masters in row measurement and both browser paint surfaces."
  Scope: "Five production modules apps/office/src/sw/source/core/layout/newfrm.ts, apps/office/src/sw/source/core/layout/tabfrm.ts, apps/office/src/sw/browser/editor/browser-writer-edit-window.ts, apps/office/src/sw/browser/editor/WriterEditableTable.tsx, apps/office/src/sw/browser/editor/WriterPlainTextEditor.tsx. Ten corresponding writer canonical records. Two fresh native source/browser suites. Source-backed lifetime observation migration only in apps/office/src/sw/browser/editor/native-row-format-client.test.tsx, apps/office/src/sw/browser/editor/native-painter-frame-borrow.test.tsx; preserve all functional/numeric assertions and add exact native ownership/teardown assertions. Necessary snapshot fixture type closure within same contract if required. Correction 5/10. No new runtime manager/module/side map."
  Plan: "Own one actual SwTabFrame per represented model table in existing root snapshot, borrow valid previous original hierarchy and retain original root identity; release removed/rebuilt table frames and all owned frames on root destruction, with new-frame exception cleanup. Measure actual owned native rows, remove duplicate temporary measurement rows. Existing page projections retain borrowed native frame identity. Core paginator borrows provided original frame; detached standalone creation retains its existing owned lifetime. Actual visible and shadow UI pass original layout-owned frame to WriterEditableTable, which destroys only its own detached fallback. Extract existing mouse hierarchy freshness scan once into an explicit temporary browser-device admission helper, no duplicated predicate/private wrapper or new state map. Physical page/body/follow graph and mouse frame ownership remain unresolved."
  Verify Steps: "Pinned SwTableNode MakeOwnFrames/DelFrames and SwTabFramePainter borrowed-frame ingress. Fresh actual native root tests cover identity across cached format/reflow/format claim, topology replacement/removal/document replacement, root close and formatting exception cleanup; borrowed renderer/painter must retain original identity and lifetime including JSX failure; actual Writer workbench visible/shadow render/rerender/unmount preserves one native hierarchy and closes it only with owning root. All old functional/numeric acceptance retained; source-backed old temporary-client lifetime observations become exact original persistent-client identity and root teardown assertions, record original/replacement clauses. Whole five current modules original Istanbul 100% four metrics/positive counters; new+related once and meaningful new-only/failure-only closure, tooling/current native table Chromium regressions. Four references physically absent/finally exactrestore per producer. Scoped format/full lint/final TS7/JSDoc/size/deps/build/static; nine restored-reference metadata gates source-tree/provenance/registry/resources--check/invariants/parity/routing/doctor/diff. Preserve all other old test bytes, ten canonical prefixes, accepted source/build hashes; same-agent non-independent quality and clean finish. Cycle 5/10: upcoming full continues, following full pauses after repairs."
  Verification: "Pending current-source focused native/browser coverage and metadata gates."
  Rollback Plan: "Revert scoped semantic commit without history rewrite. Exact four symlink restoration in finally; no source/helper/raw copies in Agentplane, no network/global access/publication/setup tasks."
  Findings: "Writer clean at 4251d505d3d3 after 6KP5DV. Pin 9bc445578031fecf56086729d8e4940c77e14d65: native model creates original table frames in layout, DelFrames destroys owned hierarchy, painter borrows actual rTabFrame. Current root paginator, row measurement and browser renderer recreate temporary native graphs, while mouse has another owned graph. Reuse original core master across actual measurement/paint without another cache/controller. This is represented master ownership, not physical page/body/follow/paint/hit full parity; mouse ownership remains separate for subsequent correction. No suspected source bug observed. Protected IO/recovery/Space unchanged."
id_source: "generated"
---
## Summary

Reuse actual layout-owned native table masters in row measurement and both browser paint surfaces.

## Scope

Five production modules apps/office/src/sw/source/core/layout/newfrm.ts, apps/office/src/sw/source/core/layout/tabfrm.ts, apps/office/src/sw/browser/editor/browser-writer-edit-window.ts, apps/office/src/sw/browser/editor/WriterEditableTable.tsx, apps/office/src/sw/browser/editor/WriterPlainTextEditor.tsx. Ten corresponding writer canonical records. Two fresh native source/browser suites. Source-backed lifetime observation migration only in apps/office/src/sw/browser/editor/native-row-format-client.test.tsx, apps/office/src/sw/browser/editor/native-painter-frame-borrow.test.tsx; preserve all functional/numeric assertions and add exact native ownership/teardown assertions. Necessary snapshot fixture type closure within same contract if required. Correction 5/10. No new runtime manager/module/side map.

## Plan

Own one actual SwTabFrame per represented model table in existing root snapshot, borrow valid previous original hierarchy and retain original root identity; release removed/rebuilt table frames and all owned frames on root destruction, with new-frame exception cleanup. Measure actual owned native rows, remove duplicate temporary measurement rows. Existing page projections retain borrowed native frame identity. Core paginator borrows provided original frame; detached standalone creation retains its existing owned lifetime. Actual visible and shadow UI pass original layout-owned frame to WriterEditableTable, which destroys only its own detached fallback. Extract existing mouse hierarchy freshness scan once into an explicit temporary browser-device admission helper, no duplicated predicate/private wrapper or new state map. Physical page/body/follow graph and mouse frame ownership remain unresolved.

## Verify Steps

Pinned SwTableNode MakeOwnFrames/DelFrames and SwTabFramePainter borrowed-frame ingress. Fresh actual native root tests cover identity across cached format/reflow/format claim, topology replacement/removal/document replacement, root close and formatting exception cleanup; borrowed renderer/painter must retain original identity and lifetime including JSX failure; actual Writer workbench visible/shadow render/rerender/unmount preserves one native hierarchy and closes it only with owning root. All old functional/numeric acceptance retained; source-backed old temporary-client lifetime observations become exact original persistent-client identity and root teardown assertions, record original/replacement clauses. Whole five current modules original Istanbul 100% four metrics/positive counters; new+related once and meaningful new-only/failure-only closure, tooling/current native table Chromium regressions. Four references physically absent/finally exactrestore per producer. Scoped format/full lint/final TS7/JSDoc/size/deps/build/static; nine restored-reference metadata gates source-tree/provenance/registry/resources--check/invariants/parity/routing/doctor/diff. Preserve all other old test bytes, ten canonical prefixes, accepted source/build hashes; same-agent non-independent quality and clean finish. Cycle 5/10: upcoming full continues, following full pauses after repairs.

## Verification

Pending current-source focused native/browser coverage and metadata gates.

## Rollback Plan

Revert scoped semantic commit without history rewrite. Exact four symlink restoration in finally; no source/helper/raw copies in Agentplane, no network/global access/publication/setup tasks.

## Findings

Writer clean at 4251d505d3d3 after 6KP5DV. Pin 9bc445578031fecf56086729d8e4940c77e14d65: native model creates original table frames in layout, DelFrames destroys owned hierarchy, painter borrows actual rTabFrame. Current root paginator, row measurement and browser renderer recreate temporary native graphs, while mouse has another owned graph. Reuse original core master across actual measurement/paint without another cache/controller. This is represented master ownership, not physical page/body/follow/paint/hit full parity; mouse ownership remains separate for subsequent correction. No suspected source bug observed. Protected IO/recovery/Space unchanged.
