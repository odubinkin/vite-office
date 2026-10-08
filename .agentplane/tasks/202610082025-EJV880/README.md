---
id: "202610082025-EJV880"
title: "Connect native linked cell frame clients to original formats and rendering lifetime"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-08T20:26:19.884Z"
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
    body: "Start: Connect original linked native SwCellFrame clients through common frame bases, format claims/history, direct rendering and recursive flat teardown; retain all prior acceptance files and registered deviations."
events:
  -
    type: "status"
    at: "2026-10-08T20:26:20.125Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Connect original linked native SwCellFrame clients through common frame bases, format claims/history, direct rendering and recursive flat teardown; retain all prior acceptance files and registered deviations."
doc_version: 3
doc_updated_at: "2026-10-08T20:26:20.125Z"
doc_updated_by: "CODER"
description: "Iteration244: replace duplicated flat-row registration with native frame bases and original linked cell clients; retarget native box claims/history, recursive deletion and direct main UI/painter ownership without DTOs. Preserve registered deviations and targeted test cadence."
sections:
  Summary: "Native linked cell frame ownership and format client lifetime over original table models."
  Scope: |-
    apps/office/src/sw/source/core/layout/wsfrm.ts
    apps/office/src/sw/source/core/layout/tabfrm.ts
    apps/office/src/sw/source/core/table/swtable.ts
    apps/office/src/sw/source/core/docnode/nodes.ts
    apps/office/src/sw/source/core/layout/paintfrm.ts
    apps/office/src/sw/browser/editor/WriterEditableTable.tsx
    apps/office/src/sw/source/core/layout/native-cell-format-client.test.ts
    apps/office/src/sw/source/core/undo/native-cell-format-client-history.test.ts
    apps/office/src/sw/browser/editor/native-cell-format-client.test.tsx
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
  Plan: "Iteration244 adds native SwFrame/SwLayoutFrame original-client registration and linked upper/previous/next/lower ownership, replacing duplicated row frame GetFormat/RegisterToFormat with common native bases. SwRowFrame constructs original SwCellFrame children in box order and recursively releases flat children on destruction. SwCellFrame registers at the actual original box format, borrows typed GetFormat/GetTabBox, follows only matching native TableBoxFormatChanged/MoveTableBoxHint, and destroys a final-client format. SwTableBox ClaimFrameFormat directly retargets matching actual cell clients before model registration; Chg and SaveTable already publish exact native hints. Actual destructive column/row/table section deletion removes cell frames from their parent links before registration release, ordinary model RemoveBox remains nondestructive. Main JSX table consumes the row's original linked cell frame formats; collapsing-border painter and physical box-width query read registered native frames with bounded finally cleanup. Preserve all657 prior acceptance files byte-identically, registered save/open/recovery deviations/IO4/whole writer-view/pin/stash. Three fresh files cover hierarchy order/sibling mutations/client registration/claim/hints/last-client teardown, original-cell Undo/Redo/numeric deletion and actual main UI/measurement/painter success/exception lifetimes. One new wsfrm source has unverified native frame geometry/invalidation/content/accessibility/fly/flags/root; old316 metadata fields/order/status/default/classification/prefixes preserved and append one bounded unverified native record317, no promotion. Full content/follow/split/nested/merged/UNO/vertical/RTL/invalidation/calculation/whole parity remain partial. New/related runtime/build once physically upstream absent/restored finally; only failed/new/unexecuted closures, no passing replay. All-four100 actual counters source-bound from243 entire identical source/maps or complete unchanged declaration/body/enclosing branch/all locations. Last full237,next247,no full244. Current agent sequential ORCHESTRATOR/PLANNER/CODER/EVALUATOR roles, explicitly non-independent actual-SHA review; no network/global/subagents/source/Python/scripts/raw evidence in AP/DONE edits; parent exact-prefix710281/hash fccb2f0dca6bfdaa56b2a602f0468b718442a13c68e175bdfb935f427e3de80a; safe local scope authorized by standing user goal."
  Verify Steps: |-
    1. Byte-bind native SwFrame ctor/KnowsFormat/RegisterToFormat/InsertBehind/RemoveFromLayout and SwLayoutFrame ctor in wsfrm.cxx, typed GetFormat/DestroyImpl in ssfrm.cxx, Row/Cell ctor/DestroyImpl/SwClientNotify in tabfrm.cxx, SwTableBox ClaimFrameFormat cell client loop in swtable.cxx and exact MoveTableBoxHint/BoxFormatChanged history. Pin9bc445578031fecf56086729d8e4940c77e14d65; no source copies in AP.
    2. Fresh tests assert original SwFrame/SwLayoutFrame/SwCellFrame/row identities, default null links, original linked cell order and insertion/removal neighbors, exclusive/shared claims and matching repeated clients before model registration, distinct native borrowed hints/no sibling retarget, final-client deletion and flat recursive teardown. Real complete cell attribute Undo/Redo moves actual frames while preserving original cell/text/cursor; numeric row/column/table deletion destroys actual frame registrations and Redo creates new model owners. Real JSX/collapsing paint/width measurement read registered native frames and release clients after success/exception. No DTO/cache/layout graph copy. Full native geometry/invalidation/content/follow/accessibility/UNO remains partial.
    3. Baseline657 prior acceptance files all byte-identical; three fresh files no only/skip/todo. Existing316metadata fields/order/status/default/classification/evidence prefixes preserved, new unverified wsfrm native record appended to317; no promotion. Normal physical source lines<1000, intentional scope only.
    4. Six statics/build and exact new/related native row/cell format/border/geometry/insertion/history/mounted/ODF/Chromium selections once upstream physically absent/restored finally; no passing runtime replay. Failed/new/unexecuted-only closures retain raw threshold exits/skips. Full244 skipped per user last237,next247.
    5. Actual all-four100 app/inventory coverage reconstructs source/map equality or complete unchanged declaration/body/enclosing branch/all branch locations from243; no clamping/sanitization/weaker thresholds. Unchanged inventory/infra runtime not replayed.
    6. Restored-vendor UI generator/source-tree/provenance/inventory invariants/parity, doctor/routing/diff/artifact audit. IO4/whole writer-view/pin/stash preserved; no AP upstream/application/Python/scripts/raw maps/results. Current-agent explicitly non-independent EVALUATOR binds actual implementation SHA and reconstructs four certificates byte-identically. Clean meaningful close/DONE immutability; parent exact-prefix710281/hash fccb2f0dca6bfdaa56b2a602f0468b718442a13c68e175bdfb935f427e3de80a append, goal ACTIVE.
  Verification: "Pending implementation and targeted verification; no completion claim."
  Rollback Plan: "Revert the intentional implementation commit through a new approved follow-up without rewriting completed task history. Preserve registered I/O deviations, actual coverage certificates and original model ownership."
  Findings: "Previous243 is DONE at implementation57b9fda0a19503f9df84fccce914b73f71c44474; main/direct clean preflight, parent only active. Read-only comparison found absent native cell frame clients and duplicated row registration, missing linked row cell ownership. Standing user goal authorizes this safe local coherent repair; no repeat approval requested. Native GetFormat belongs to SwLayoutFrame (ssfrm.cxx), while shared registration/links belong to SwFrame (wsfrm.cxx). A guessed absent layfrm.cxx path and a no-match wsfrm MoveTableBox search were followed by route recomputation and exact discovered sources; no mutation or runtime was performed on those errors. Full frame invalidation/geometry/content/accessibility/follows remain partial. No global/network/subagents/AP copied source/raw evidence."
id_source: "generated"
---
## Summary

Native linked cell frame ownership and format client lifetime over original table models.

## Scope

apps/office/src/sw/source/core/layout/wsfrm.ts
apps/office/src/sw/source/core/layout/tabfrm.ts
apps/office/src/sw/source/core/table/swtable.ts
apps/office/src/sw/source/core/docnode/nodes.ts
apps/office/src/sw/source/core/layout/paintfrm.ts
apps/office/src/sw/browser/editor/WriterEditableTable.tsx
apps/office/src/sw/source/core/layout/native-cell-format-client.test.ts
apps/office/src/sw/source/core/undo/native-cell-format-client-history.test.ts
apps/office/src/sw/browser/editor/native-cell-format-client.test.tsx
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json

## Plan

Iteration244 adds native SwFrame/SwLayoutFrame original-client registration and linked upper/previous/next/lower ownership, replacing duplicated row frame GetFormat/RegisterToFormat with common native bases. SwRowFrame constructs original SwCellFrame children in box order and recursively releases flat children on destruction. SwCellFrame registers at the actual original box format, borrows typed GetFormat/GetTabBox, follows only matching native TableBoxFormatChanged/MoveTableBoxHint, and destroys a final-client format. SwTableBox ClaimFrameFormat directly retargets matching actual cell clients before model registration; Chg and SaveTable already publish exact native hints. Actual destructive column/row/table section deletion removes cell frames from their parent links before registration release, ordinary model RemoveBox remains nondestructive. Main JSX table consumes the row's original linked cell frame formats; collapsing-border painter and physical box-width query read registered native frames with bounded finally cleanup. Preserve all657 prior acceptance files byte-identically, registered save/open/recovery deviations/IO4/whole writer-view/pin/stash. Three fresh files cover hierarchy order/sibling mutations/client registration/claim/hints/last-client teardown, original-cell Undo/Redo/numeric deletion and actual main UI/measurement/painter success/exception lifetimes. One new wsfrm source has unverified native frame geometry/invalidation/content/accessibility/fly/flags/root; old316 metadata fields/order/status/default/classification/prefixes preserved and append one bounded unverified native record317, no promotion. Full content/follow/split/nested/merged/UNO/vertical/RTL/invalidation/calculation/whole parity remain partial. New/related runtime/build once physically upstream absent/restored finally; only failed/new/unexecuted closures, no passing replay. All-four100 actual counters source-bound from243 entire identical source/maps or complete unchanged declaration/body/enclosing branch/all locations. Last full237,next247,no full244. Current agent sequential ORCHESTRATOR/PLANNER/CODER/EVALUATOR roles, explicitly non-independent actual-SHA review; no network/global/subagents/source/Python/scripts/raw evidence in AP/DONE edits; parent exact-prefix710281/hash fccb2f0dca6bfdaa56b2a602f0468b718442a13c68e175bdfb935f427e3de80a; safe local scope authorized by standing user goal.

## Verify Steps

1. Byte-bind native SwFrame ctor/KnowsFormat/RegisterToFormat/InsertBehind/RemoveFromLayout and SwLayoutFrame ctor in wsfrm.cxx, typed GetFormat/DestroyImpl in ssfrm.cxx, Row/Cell ctor/DestroyImpl/SwClientNotify in tabfrm.cxx, SwTableBox ClaimFrameFormat cell client loop in swtable.cxx and exact MoveTableBoxHint/BoxFormatChanged history. Pin9bc445578031fecf56086729d8e4940c77e14d65; no source copies in AP.
2. Fresh tests assert original SwFrame/SwLayoutFrame/SwCellFrame/row identities, default null links, original linked cell order and insertion/removal neighbors, exclusive/shared claims and matching repeated clients before model registration, distinct native borrowed hints/no sibling retarget, final-client deletion and flat recursive teardown. Real complete cell attribute Undo/Redo moves actual frames while preserving original cell/text/cursor; numeric row/column/table deletion destroys actual frame registrations and Redo creates new model owners. Real JSX/collapsing paint/width measurement read registered native frames and release clients after success/exception. No DTO/cache/layout graph copy. Full native geometry/invalidation/content/follow/accessibility/UNO remains partial.
3. Baseline657 prior acceptance files all byte-identical; three fresh files no only/skip/todo. Existing316metadata fields/order/status/default/classification/evidence prefixes preserved, new unverified wsfrm native record appended to317; no promotion. Normal physical source lines<1000, intentional scope only.
4. Six statics/build and exact new/related native row/cell format/border/geometry/insertion/history/mounted/ODF/Chromium selections once upstream physically absent/restored finally; no passing runtime replay. Failed/new/unexecuted-only closures retain raw threshold exits/skips. Full244 skipped per user last237,next247.
5. Actual all-four100 app/inventory coverage reconstructs source/map equality or complete unchanged declaration/body/enclosing branch/all branch locations from243; no clamping/sanitization/weaker thresholds. Unchanged inventory/infra runtime not replayed.
6. Restored-vendor UI generator/source-tree/provenance/inventory invariants/parity, doctor/routing/diff/artifact audit. IO4/whole writer-view/pin/stash preserved; no AP upstream/application/Python/scripts/raw maps/results. Current-agent explicitly non-independent EVALUATOR binds actual implementation SHA and reconstructs four certificates byte-identically. Clean meaningful close/DONE immutability; parent exact-prefix710281/hash fccb2f0dca6bfdaa56b2a602f0468b718442a13c68e175bdfb935f427e3de80a append, goal ACTIVE.

## Verification

Pending implementation and targeted verification; no completion claim.

## Rollback Plan

Revert the intentional implementation commit through a new approved follow-up without rewriting completed task history. Preserve registered I/O deviations, actual coverage certificates and original model ownership.

## Findings

Previous243 is DONE at implementation57b9fda0a19503f9df84fccce914b73f71c44474; main/direct clean preflight, parent only active. Read-only comparison found absent native cell frame clients and duplicated row registration, missing linked row cell ownership. Standing user goal authorizes this safe local coherent repair; no repeat approval requested. Native GetFormat belongs to SwLayoutFrame (ssfrm.cxx), while shared registration/links belong to SwFrame (wsfrm.cxx). A guessed absent layfrm.cxx path and a no-match wsfrm MoveTableBox search were followed by route recomputation and exact discovered sources; no mutation or runtime was performed on those errors. Full frame invalidation/geometry/content/accessibility/follows remain partial. No global/network/subagents/AP copied source/raw evidence.
