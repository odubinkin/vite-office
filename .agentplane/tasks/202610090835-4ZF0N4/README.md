---
id: "202610090835-4ZF0N4"
title: "Restore native table frame layout ownership"
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
  updated_at: "2026-10-09T08:36:44.300Z"
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
    body: "Start: Restore original native table layout ownership and deterministic temporary-client lifetimes, preserving existing documented I/O/recovery deviations and explicit persistent root/page gaps."
events:
  -
    type: "status"
    at: "2026-10-09T08:36:45.566Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Restore original native table layout ownership and deterministic temporary-client lifetimes, preserving existing documented I/O/recovery deviations and explicit persistent root/page gaps."
doc_version: 3
doc_updated_at: "2026-10-09T08:36:45.566Z"
doc_updated_by: "CODER"
description: "Iteration251 under C9TN6M: replace the standalone SwTabFrame geometry object with native SwLayoutFrame registration and linked original row/cell ownership, including deterministic lifetime at all temporary production consumers. This is the required table hierarchy prerequisite for persistent page/root/UI integration; preserve documented recovery/open/save/settings deviations."
sections:
  Summary: "Restore native SwTabFrame layout registration and original linked row/cell ownership; eliminate redundant temporary cell registration during width queries and guarantee production temporary-frame cleanup."
  Scope: "Writer only: sw/source/core/layout/tabfrm.ts, wsfrm.ts and newfrm.ts; sw/source/core/frmedt/fetab.ts and tblsel.ts; sw/source/uibase/table/swtablerep.ts; sw/browser/editor/WriterEditableTable.tsx and browser-writer-edit-window.ts. Fresh table-hierarchy/lifetime tests and related native tests as needed for actual contract migration; matching canonical Writer runtime/provenance records, task bounded evidence, append-only parent Findings. No source/helper copies under AgentPlane, dependency setup, network or registered I/O/recovery/settings changes. Persistent page/root ownership and full follows remain subsequent work."
  Plan: "1. CODER ports native Tab type, SwLayoutFrame inheritance, original table-format registration and linked original nonempty row/cell lowers. Width helper borrows actual linked cell format; UI renders through one owned native table hierarchy. 2. Make every production geometry/flow/dialog/split consumer release temporary table frames in finally; browser mouse-measurement owner releases replaced and unmounted frames deterministically while shell continues to borrow current frames. Preserve current scalar table model import boundaries; do not falsely promote them to full native item/layout parity. 3. Add independent native identity/lifetime and real consumer cases, migrate only affected ownership contracts if required, update canonical inventory. Run declared upstream-absent targeted all-four100 and scoped gates, preserve raw evidence, explicitly non-independent evaluator, commit and close only this leaf. Native page/root/follows, persistent browser integration, full table model attribute ownership remain next work; last full247, no full251."
  Verify Steps: "1. Compare pinned9bc445578031fecf56086729d8e4940c77e14d65 SwTabFrame constructor/DestroyImpl and frame.hxx type bits. Assert original registration, table/row/cell pointers, skipped empty rows, shared claims/history, recursive detach and borrowed width reads with independent literal tests. Test actual UI render, hidden measurement, geometry consumers and mouse frame replacement/unmount lifetimes without invoking upstream. 2. Run new and related tests once upstream-absent, actual current changed-module all-four100 coverage; preserve raw failures, reuse prior coverage only for whole unchanged source or complete unchanged declarations/bodies/enclosing-branch/all-location proof. No unchanged passing replay, last full247, no full251. 3. While upstream absent run scoped format/lint/typecheck/dependency/docs/size/static build; restore in finally, native pin/tree clean. Canonical build, scoped/global registry, provenance/tree/routing and AP doctor gates pass. 4. Record bounded evidence, same-agent explicitly non-independent evaluator, commit implementation and finish leaf with semantic SHA. Final Writer clean; parent/broad goal remains active; persistent page/root/follows/content/redlines/full UI integration unverified."
  Verification: "Pending native hierarchy and lifetime implementation plus actual targeted checks."
  Rollback Plan: "Normal revert of the scoped implementation if requested; no reset, checkout/dependency change, upstream modification or user merge."
  Findings: "Read-only audit: current SwTabFrame is a standalone geometry facade with no native registration or linked rows. Native inherits SwLayoutFrame and creates SwRowFrame lowers, retaining only nonempty rows. Current production geometry consumers rely on resource-free construction; all must release newly represented native registrations. UI separately reconstructs each row and width query separately constructs a cell; those redundant temporary clients can be removed by borrowing the new table lower hierarchy. Persistent root/page owners and full follow/content layout remain later work."
id_source: "generated"
---
## Summary

Restore native SwTabFrame layout registration and original linked row/cell ownership; eliminate redundant temporary cell registration during width queries and guarantee production temporary-frame cleanup.

## Scope

Writer only: sw/source/core/layout/tabfrm.ts, wsfrm.ts and newfrm.ts; sw/source/core/frmedt/fetab.ts and tblsel.ts; sw/source/uibase/table/swtablerep.ts; sw/browser/editor/WriterEditableTable.tsx and browser-writer-edit-window.ts. Fresh table-hierarchy/lifetime tests and related native tests as needed for actual contract migration; matching canonical Writer runtime/provenance records, task bounded evidence, append-only parent Findings. No source/helper copies under AgentPlane, dependency setup, network or registered I/O/recovery/settings changes. Persistent page/root ownership and full follows remain subsequent work.

## Plan

1. CODER ports native Tab type, SwLayoutFrame inheritance, original table-format registration and linked original nonempty row/cell lowers. Width helper borrows actual linked cell format; UI renders through one owned native table hierarchy. 2. Make every production geometry/flow/dialog/split consumer release temporary table frames in finally; browser mouse-measurement owner releases replaced and unmounted frames deterministically while shell continues to borrow current frames. Preserve current scalar table model import boundaries; do not falsely promote them to full native item/layout parity. 3. Add independent native identity/lifetime and real consumer cases, migrate only affected ownership contracts if required, update canonical inventory. Run declared upstream-absent targeted all-four100 and scoped gates, preserve raw evidence, explicitly non-independent evaluator, commit and close only this leaf. Native page/root/follows, persistent browser integration, full table model attribute ownership remain next work; last full247, no full251.

## Verify Steps

1. Compare pinned9bc445578031fecf56086729d8e4940c77e14d65 SwTabFrame constructor/DestroyImpl and frame.hxx type bits. Assert original registration, table/row/cell pointers, skipped empty rows, shared claims/history, recursive detach and borrowed width reads with independent literal tests. Test actual UI render, hidden measurement, geometry consumers and mouse frame replacement/unmount lifetimes without invoking upstream. 2. Run new and related tests once upstream-absent, actual current changed-module all-four100 coverage; preserve raw failures, reuse prior coverage only for whole unchanged source or complete unchanged declarations/bodies/enclosing-branch/all-location proof. No unchanged passing replay, last full247, no full251. 3. While upstream absent run scoped format/lint/typecheck/dependency/docs/size/static build; restore in finally, native pin/tree clean. Canonical build, scoped/global registry, provenance/tree/routing and AP doctor gates pass. 4. Record bounded evidence, same-agent explicitly non-independent evaluator, commit implementation and finish leaf with semantic SHA. Final Writer clean; parent/broad goal remains active; persistent page/root/follows/content/redlines/full UI integration unverified.

## Verification

Pending native hierarchy and lifetime implementation plus actual targeted checks.

## Rollback Plan

Normal revert of the scoped implementation if requested; no reset, checkout/dependency change, upstream modification or user merge.

## Findings

Read-only audit: current SwTabFrame is a standalone geometry facade with no native registration or linked rows. Native inherits SwLayoutFrame and creates SwRowFrame lowers, retaining only nonempty rows. Current production geometry consumers rely on resource-free construction; all must release newly represented native registrations. UI separately reconstructs each row and width query separately constructs a cell; those redundant temporary clients can be removed by borrowing the new table lower hierarchy. Persistent root/page owners and full follow/content layout remain later work.
