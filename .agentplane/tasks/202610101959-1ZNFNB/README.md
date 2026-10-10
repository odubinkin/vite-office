---
id: "202610101959-1ZNFNB"
title: "Restore native layout root registration and frame root ownership"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-10T20:00:54.591Z"
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
    body: "Start: Restore native registered Root subtype, original derived frame format lifecycle and source constructor root propagation; preserve device and conscious IO boundaries with targeted upstream-absent checks and inventory."
events:
  -
    type: "status"
    at: "2026-10-10T20:00:55.801Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Restore native registered Root subtype, original derived frame format lifecycle and source constructor root propagation; preserve device and conscious IO boundaries with targeted upstream-absent checks and inventory."
doc_version: 3
doc_updated_at: "2026-10-10T20:00:55.801Z"
doc_updated_by: "CODER"
description: "Correction6/10 after BZ14P4: make current Writer layout root an original SwLayoutFrame with native Root discriminator/own derived frame format, restore source constructor mpRoot propagation through actual frames and document/view lifecycle; preserve browser device and registered I/O boundaries."
sections:
  Summary: "Restore original native frame root ownership as prerequisite for retiring the measured cursor-map query path. Existing Writer rendering/current-root/cursor frames share one actual registered native Root rather than an unrelated plain object."
  Scope: "Implement native Root discriminator and original SwFrame mpRoot/getRootFrame/setRootFrame, source optional sibling constructor propagation through SwLayoutFrame/SwContentFrame/SwTextFrame, native SwRootFrame inheritance and original derived Root format lifecycle, document replacement registration and production pagination/cursor-frame root propagation. Approved4production: wsfrm.ts,ssfrm.ts,newfrm.ts,txtfrm.ts;8 corresponding historical canonical runtime/provenance plus necessary mutation metadata and parent Findings; up to3 old native constructor/owner fixture migrations preserving other cases/matrices/device inputs/matchers; up to2fresh core/React tests and existing related Chromium. Actual entire4 production modules100 all-four with current hashes/raw nonnegative counters, static/build/new+related acceptance upstream-absent restored finally,9 restored-source metadata gates, exact semantic same-agent non-independent review/clean closure. Native Doc MakeFrameFormat registry/creation-deletion Undo, complete page/body/root hierarchy/GetFrameOfModify/native geometry, complete root flags/view/native query remain explicit gaps; local root directly owns an original SwFrameFormat derived from document default instead of claiming the omitted Doc factory. Existing document replacement callback boundary retained. No full at6/10; after next full and repairs pause goal."
  Plan: "Restore native root registration, original derived format lifecycle and constructor mpRoot propagation across4approved production modules; preserve8canonical history prefixes/old acceptance, run actual whole modules100 targeted/static/build/browser upstream-absent and9 source metadata gates, exact semantic review/clean closure. Native Doc factory/Undo, full root flags/page hierarchy/query/native geometry remain explicit gaps. Correction6/10; pause after next full and required repairs."
  Verify Steps: |-
    1. Source-only pin9bc445578031fecf56086729d8e4940c77e14d65 wsfrm.cxx/frame.hxx source mpRoot constructor/default/access/setter, native layout/content/text constructor sibling ownership, newfrm.cxx native Root subtype and own derived Root format release. Original format objects only; Doc factory/Undo/full hierarchy/query/geometry/flags unverified. No source calls in tests.
    2. Actual initialized SwDoc/SwRootFrame/SwFrame native type/self root/derived format/direct native registration, null sibling/default pointers, original sibling-derived root across text/cursor pagination/master/follow/reuse/error cleanup; two views remain independent, document replacement rebinds original format/model and close destroys native clients/derived original format without disposing default format. Mounted React original root and edit/UndoRedo/unmount/close; existing Chromium page/list/table/cursor/historical-owner scenarios. No mocks or cloned owners.
    3. Changed Prettier/ESLint, TS7 type/dependencies/docs/file-size/build/static; fresh/new and related acceptance, actual entire4modules100 all four metrics/current whole maps/current hashes/nonnegative counters. Runtime/static/build/browser reference symlinks absent and restored finally; no full at correction6/10. Repair only affected/failed scenarios, no passing replay for helper/metadata fixes.
    4. Restored-source registry build/source-tree/provenance/registry/resources generation/invariants/parity/routing/doctor; all historical canonical prefixes/status/default/classification/exception evidence preserved, old cases/matrices/device inputs/matchers unchanged except approved native-owner migrations; explicit omitted Doc factory/native root flags/page/body/hierarchy/query/native geometry. Same-agent exact semantic quality and clean writer/restored refs.
  Verification: "Pending current-source checks."
  Rollback Plan: "Revert only this task semantic commit; preserve other task history and conscious I/O exceptions. No external publication."
  Findings: "Previous ECR55T progressed: semantic7d151660ea9771b2046e21efcb4485c3f6ae671d/close3427860938465e1a1a6017ad549bc6b1da91421f; clean writer confirmed. Source registered follow chains are present but plain root and absent native frame mpRoot prevent native query selection. This restores actual class/root/format ownership and ctor propagation; does not fabricate page hierarchy or claim missing Doc MakeFrameFormat registry/Undo. Broad standing goal/resume authorizes safe local scope and inventory, no fresh human approval needed. No live prior producer. Stop after next full and required repairs."
id_source: "generated"
---
## Summary

Restore original native frame root ownership as prerequisite for retiring the measured cursor-map query path. Existing Writer rendering/current-root/cursor frames share one actual registered native Root rather than an unrelated plain object.

## Scope

Implement native Root discriminator and original SwFrame mpRoot/getRootFrame/setRootFrame, source optional sibling constructor propagation through SwLayoutFrame/SwContentFrame/SwTextFrame, native SwRootFrame inheritance and original derived Root format lifecycle, document replacement registration and production pagination/cursor-frame root propagation. Approved4production: wsfrm.ts,ssfrm.ts,newfrm.ts,txtfrm.ts;8 corresponding historical canonical runtime/provenance plus necessary mutation metadata and parent Findings; up to3 old native constructor/owner fixture migrations preserving other cases/matrices/device inputs/matchers; up to2fresh core/React tests and existing related Chromium. Actual entire4 production modules100 all-four with current hashes/raw nonnegative counters, static/build/new+related acceptance upstream-absent restored finally,9 restored-source metadata gates, exact semantic same-agent non-independent review/clean closure. Native Doc MakeFrameFormat registry/creation-deletion Undo, complete page/body/root hierarchy/GetFrameOfModify/native geometry, complete root flags/view/native query remain explicit gaps; local root directly owns an original SwFrameFormat derived from document default instead of claiming the omitted Doc factory. Existing document replacement callback boundary retained. No full at6/10; after next full and repairs pause goal.

## Plan

Restore native root registration, original derived format lifecycle and constructor mpRoot propagation across4approved production modules; preserve8canonical history prefixes/old acceptance, run actual whole modules100 targeted/static/build/browser upstream-absent and9 source metadata gates, exact semantic review/clean closure. Native Doc factory/Undo, full root flags/page hierarchy/query/native geometry remain explicit gaps. Correction6/10; pause after next full and required repairs.

## Verify Steps

1. Source-only pin9bc445578031fecf56086729d8e4940c77e14d65 wsfrm.cxx/frame.hxx source mpRoot constructor/default/access/setter, native layout/content/text constructor sibling ownership, newfrm.cxx native Root subtype and own derived Root format release. Original format objects only; Doc factory/Undo/full hierarchy/query/geometry/flags unverified. No source calls in tests.
2. Actual initialized SwDoc/SwRootFrame/SwFrame native type/self root/derived format/direct native registration, null sibling/default pointers, original sibling-derived root across text/cursor pagination/master/follow/reuse/error cleanup; two views remain independent, document replacement rebinds original format/model and close destroys native clients/derived original format without disposing default format. Mounted React original root and edit/UndoRedo/unmount/close; existing Chromium page/list/table/cursor/historical-owner scenarios. No mocks or cloned owners.
3. Changed Prettier/ESLint, TS7 type/dependencies/docs/file-size/build/static; fresh/new and related acceptance, actual entire4modules100 all four metrics/current whole maps/current hashes/nonnegative counters. Runtime/static/build/browser reference symlinks absent and restored finally; no full at correction6/10. Repair only affected/failed scenarios, no passing replay for helper/metadata fixes.
4. Restored-source registry build/source-tree/provenance/registry/resources generation/invariants/parity/routing/doctor; all historical canonical prefixes/status/default/classification/exception evidence preserved, old cases/matrices/device inputs/matchers unchanged except approved native-owner migrations; explicit omitted Doc factory/native root flags/page/body/hierarchy/query/native geometry. Same-agent exact semantic quality and clean writer/restored refs.

## Verification

Pending current-source checks.

## Rollback Plan

Revert only this task semantic commit; preserve other task history and conscious I/O exceptions. No external publication.

## Findings

Previous ECR55T progressed: semantic7d151660ea9771b2046e21efcb4485c3f6ae671d/close3427860938465e1a1a6017ad549bc6b1da91421f; clean writer confirmed. Source registered follow chains are present but plain root and absent native frame mpRoot prevent native query selection. This restores actual class/root/format ownership and ctor propagation; does not fabricate page hierarchy or claim missing Doc MakeFrameFormat registry/Undo. Broad standing goal/resume authorizes safe local scope and inventory, no fresh human approval needed. No live prior producer. Stop after next full and required repairs.
