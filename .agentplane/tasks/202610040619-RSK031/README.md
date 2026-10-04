---
id: "202610040619-RSK031"
title: "Project Writer ruler tab adjustment glyphs and anchored hit bounds"
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
  updated_at: "2026-10-04T06:20:16.842Z"
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
    body: "Start: implement approved existing ruler type glyph/anchor correction under the standing goal,with one vendor-absent test pass and separate source audits."
events:
  -
    type: "status"
    at: "2026-10-04T06:20:23.154Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved existing ruler type glyph/anchor correction under the standing goal,with one vendor-absent test pass and separate source audits."
doc_version: 3
doc_updated_at: "2026-10-04T06:20:23.154Z"
doc_updated_by: "CODER"
description: "Iteration93: preserve each explicit tab adjustment in immutable ruler projection and render source-shaped Left/Right/Center/Decimal glyphs with type-dependent horizontal hit bounds. Keep raw-index movement, model metadata, preview/cancellation/undo and intentional I/O exceptions. Test once without pinned upstream; static source comparison separately."
sections:
  Summary: "Iteration93 corrects the existing Writer explicit tab markers: project immutable adjustment with raw index/position, render Left/Right/Center/Decimal native rectangle glyphs and use their anchored horizontal hit bounds. Temporary new-tab preview uses the same Left glyph as accepted insertion. One coherent source-shaped browser correction under the standing goal."
  Scope: |-
    apps/office/src/sw/browser/presentation/WriterRulers.tsx
    apps/office/src/sw/browser/presentation/writer-view-projection.ts
    apps/office/src/sw/browser/presentation/WriterPageLayout.test.tsx
    apps/office/src/sw/browser/presentation/WriterRulers-tracking.test.tsx
    apps/office/src/sw/browser/presentation/writer-view-ruler-tab-identity.test.tsx
    apps/office/src/sw/browser/presentation/writer-view-ruler-tab-insertion.test.tsx
    apps/office/src/sw/browser/presentation/writer-view-ruler-tab-glyphs.test.tsx
    apps/office/e2e/writer-ruler-tab-glyphs.spec.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
    Exactly10semantic paths plus canonical leaf/parent task records and bounded result/hash/conclusion evidence. No new runtime modules. Keep220manifest rows/status/owners/defaults/exceptions/order;append responsibility/evidence only for existing WriterRulers and writer-view-projection. Four prior tests need11primitive DTO adjustment additions (including stricter DTO expectations);all other prior bytes/assertions preserved apart from formatting those payloads. No core tab mutation/I/O/recovery changes, selector/RTL/new gesture features, network/global/outside access, Agentplane sources/helpers/Python/native probes.
  Plan: "Implement one existing marker-type correction: require adjustment in immutable explicit tab DTO;reuse native DPI1 rectangle geometry for four glyphs and anchored horizontal bounds;share fresh Left glyph with temporary preview. Extend11owned DTO payloads across4prior tests without weakening assertions,add actual Writer/DOM/Undo and Chromium desktop/mobile evidence,append2existing manifests with no promotions,and execute the single absent-upstream test contract plus separate static audits. Standing goal authorizes local scope;no subagents or external actions."
  Verify Steps: "Read ap task verify-show. Inspect pinned svtools ruler_tab/ImplDrawRulerTab/ImplHitTest and svx ToSvTab_Impl/UpdateTabs read-only;record hashes/path/markers/conclusions only. No upstream execution or baseline/focused pre-fix suite. Run format:check,lint,typecheck,check:dependencies,test:static(build/static only),check:docs,check:file-size. Rename vendor/libreoffice-reference inside vendor;run npm run test once(app+inventory coverage),npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts once,and npm run test:e2e once;restore in finally. Only failed corrected gates may rerun,always absent upstream for tests;never repeat a passing suite with source present/absent. After restore run generator --check,source-tree,provenance,invariants,parity CLI separately. Require all pass,app+inventory4coverage metrics100%,semantic violations0. Verify glyph rectangles and anchor/hit bounds for all4types,immutable/raw-index projection,temporaryLeft preview/cancel,typed drag/undo/redo/metadata and desktop/mobile Chromium. Integrity must prove10paths,288prior testfiles with284identical and exact11DTOadditions across4files/no assertion removal,220rows with2append-onlyupdates/no promotions,2source hashes unchanged. Ignored-inclusive Agentplane audit zero code/helper/Python/native/archive/raw diagnostic frames. Routing validation and ap doctor pass. Same-actor separate EVALUATOR on actual semantic SHA;finish cleantracked/untracked and keepparentgoal active."
  Verification: "Pending final single absent-upstream suite pass and separate static source audits;no suites have run for this iteration."
  Rollback Plan: "Revert isolated semantic commit if needed. Restore temporarily renamed vendor directory in finally. Preserve bounded hashes/results;no history rewrite."
  Findings: "Previous goal turn is verified progress:iteration92leafDONE/semantic77c416a9/currentcleanmain22ac1c17. Current ruler projection retains raw index/position but discards adjustment;all explicit and temporary tab markers use identical centered left-border CSS. Pinned SvxRuler ToSvTab_Impl maps each adjustment;Ruler draws distinct anchored Left/Right/Center/Decimal rectangles and type-dependent horizontal hit bounds at DPI1. Correct existing type display and its horizontal marker admission coherently;preserve existing gesture owner/coordinate conversion/snap/Undo and Default exclusion. Native full default glyph generation,selector,RTL,verticaltabs,systemDPI/theme/focus/hit priority/verticalbounds,modifiers/deletion/capture and complete ruler/native/parent parity remain unverified. CSSpixels project inspected DPI1 rectangles;no claim of native platform render equivalence. User one absent testpass/nohelpers rule authoritative."
id_source: "generated"
---
## Summary

Iteration93 corrects the existing Writer explicit tab markers: project immutable adjustment with raw index/position, render Left/Right/Center/Decimal native rectangle glyphs and use their anchored horizontal hit bounds. Temporary new-tab preview uses the same Left glyph as accepted insertion. One coherent source-shaped browser correction under the standing goal.

## Scope

apps/office/src/sw/browser/presentation/WriterRulers.tsx
apps/office/src/sw/browser/presentation/writer-view-projection.ts
apps/office/src/sw/browser/presentation/WriterPageLayout.test.tsx
apps/office/src/sw/browser/presentation/WriterRulers-tracking.test.tsx
apps/office/src/sw/browser/presentation/writer-view-ruler-tab-identity.test.tsx
apps/office/src/sw/browser/presentation/writer-view-ruler-tab-insertion.test.tsx
apps/office/src/sw/browser/presentation/writer-view-ruler-tab-glyphs.test.tsx
apps/office/e2e/writer-ruler-tab-glyphs.spec.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json
Exactly10semantic paths plus canonical leaf/parent task records and bounded result/hash/conclusion evidence. No new runtime modules. Keep220manifest rows/status/owners/defaults/exceptions/order;append responsibility/evidence only for existing WriterRulers and writer-view-projection. Four prior tests need11primitive DTO adjustment additions (including stricter DTO expectations);all other prior bytes/assertions preserved apart from formatting those payloads. No core tab mutation/I/O/recovery changes, selector/RTL/new gesture features, network/global/outside access, Agentplane sources/helpers/Python/native probes.

## Plan

Implement one existing marker-type correction: require adjustment in immutable explicit tab DTO;reuse native DPI1 rectangle geometry for four glyphs and anchored horizontal bounds;share fresh Left glyph with temporary preview. Extend11owned DTO payloads across4prior tests without weakening assertions,add actual Writer/DOM/Undo and Chromium desktop/mobile evidence,append2existing manifests with no promotions,and execute the single absent-upstream test contract plus separate static audits. Standing goal authorizes local scope;no subagents or external actions.

## Verify Steps

Read ap task verify-show. Inspect pinned svtools ruler_tab/ImplDrawRulerTab/ImplHitTest and svx ToSvTab_Impl/UpdateTabs read-only;record hashes/path/markers/conclusions only. No upstream execution or baseline/focused pre-fix suite. Run format:check,lint,typecheck,check:dependencies,test:static(build/static only),check:docs,check:file-size. Rename vendor/libreoffice-reference inside vendor;run npm run test once(app+inventory coverage),npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts once,and npm run test:e2e once;restore in finally. Only failed corrected gates may rerun,always absent upstream for tests;never repeat a passing suite with source present/absent. After restore run generator --check,source-tree,provenance,invariants,parity CLI separately. Require all pass,app+inventory4coverage metrics100%,semantic violations0. Verify glyph rectangles and anchor/hit bounds for all4types,immutable/raw-index projection,temporaryLeft preview/cancel,typed drag/undo/redo/metadata and desktop/mobile Chromium. Integrity must prove10paths,288prior testfiles with284identical and exact11DTOadditions across4files/no assertion removal,220rows with2append-onlyupdates/no promotions,2source hashes unchanged. Ignored-inclusive Agentplane audit zero code/helper/Python/native/archive/raw diagnostic frames. Routing validation and ap doctor pass. Same-actor separate EVALUATOR on actual semantic SHA;finish cleantracked/untracked and keepparentgoal active.

## Verification

Pending final single absent-upstream suite pass and separate static source audits;no suites have run for this iteration.

## Rollback Plan

Revert isolated semantic commit if needed. Restore temporarily renamed vendor directory in finally. Preserve bounded hashes/results;no history rewrite.

## Findings

Previous goal turn is verified progress:iteration92leafDONE/semantic77c416a9/currentcleanmain22ac1c17. Current ruler projection retains raw index/position but discards adjustment;all explicit and temporary tab markers use identical centered left-border CSS. Pinned SvxRuler ToSvTab_Impl maps each adjustment;Ruler draws distinct anchored Left/Right/Center/Decimal rectangles and type-dependent horizontal hit bounds at DPI1. Correct existing type display and its horizontal marker admission coherently;preserve existing gesture owner/coordinate conversion/snap/Undo and Default exclusion. Native full default glyph generation,selector,RTL,verticaltabs,systemDPI/theme/focus/hit priority/verticalbounds,modifiers/deletion/capture and complete ruler/native/parent parity remain unverified. CSSpixels project inspected DPI1 rectangles;no claim of native platform render equivalence. User one absent testpass/nohelpers rule authoritative.
