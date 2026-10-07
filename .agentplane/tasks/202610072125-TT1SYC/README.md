---
id: "202610072125-TT1SYC"
title: "Advance list text past occupied bullet at exhausted tab stops"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "parity"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-07T21:26:27.695Z"
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
    body: "Start: implement priority native list tab advance after occupied glyph width under standing user authorization; preserve all old acceptance and one upstream-absent runtime."
events:
  -
    type: "status"
    at: "2026-10-07T21:26:28.152Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement priority native list tab advance after occupied glyph width under standing user authorization; preserve all old acceptance and one upstream-absent runtime."
doc_version: 3
doc_updated_at: "2026-10-07T21:26:28.152Z"
doc_updated_by: "CODER"
description: "Priority follow-up to reported bullet overlap: source-bound LTR label-alignment list tab selection after actual glyph advance, next explicit/default tab with native compatibility flags, measured browser refresh. Preserve legacy label-width distance, authored four-field layout, model/history/IO deviations. One full runtime absent upstream; no passing replay or upstream/raw AP sources."
sections:
  Summary: "Priority native list-tab repair after occupied bullet glyph width exceeds its authored stop."
  Scope: |-
    apps/office/src/sw/browser/editor/WriterEditableParagraph.tsx
    apps/office/src/sw/browser/presentation/writer-view-projection.ts
    apps/office/src/sw/source/core/text/txttab.ts
    apps/office/src/sw/source/core/text/native-numbering-tab.test.ts
    apps/office/src/sw/browser/editor/native-numbering-tab.test.tsx
    apps/office/e2e/writer-native-numbering-tab.spec.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
  Plan: "One issue: label-alignment list text must advance to the first native tab strictly after the measured occupied label, including next explicit/default tabs when the authored list tab is exhausted. Port the bounded LTR left/default tab search/default spacing/hanging-indent compatibility from txttab.cxx and list-tab merge from inftxt.cxx; normalize primitive read-only positions at the browser projection, measure actual glyph advance with font/size refresh before paint. Keep legacy numbering distance and the exact four authored listLayout fields, detached compatibility, model/cursor/history and registered IO deviations. Three production files, three fresh regression files, two metadata files; all609 previous acceptance files byte-identical and302 existing metadata prefixes/status/defaults retained, one actual mapped core module added. Tests use only local runtime. Initial six static checks once, ONE full upstream-absent profile with finally restoration; subsequent only actual failures/new cases or failed/changed static inputs; source-bound all4 coverage100, no count clamping. Five source gates after restoration. English bounded AP hashes/identifiers/counts only; no source/script/raw snapshots. Standing user priority request and goal authorize safe local work, no network/outside-repo/destructive action. Full RTL, vertical, right/center/decimal/fill tabs, narrow-frame overflow and native formatter remain explicitly partial; this does not promote a full formatter or complete parity. Native ruler refactor deferred until this priority repair is complete."
  Verify Steps: |-
    1. Bind the production strict-after-label tab selection to pinned txttab.cxx SwLineInfo::GetTabStop/NewTabPortion, inftxt.cxx InitLineInfo and ndtxt.cxx GetListTabStopPosition; prove ordinary/collapsed/narrow/equal/multiple explicit/default tabs, relative/absolute origins, hanging-indent flags, 50-twip noncompat minimum, legacy preservation, fresh browser width/font refresh and body/cell editing/UndoRedo. No tests invoke upstream.
    2. Initial format/lint/type/dependencies/JSDoc/physical-size checks once; subsequent only failed/changed-input closure. ONE full upstream-absent build/app/inventory/infrastructure/Chromium profile, finally restore vendor, zero passing replay. All4 app/inventory100 via exact identical source/maps or complete contiguous declaration/body/enclosing branch/location proofs, no clamps/exclusions; actual failures remain recorded, focused skips stay skipped.
    3. Five restored source/resource/provenance/invariants/parity CLI gates; scope8 semantic paths,609 old acceptance files unchanged,302 old metadata prefixes/classes/status/defaults retained plus exactly one honest partial mapped module; physical lines<1000, JSDoc, AP source/script/raw ban, doctor/routing/diff. All limitations remain explicit, full goal ACTIVE.
    4. Final Findings/Verification before canonical verify; exact implementation SHA proof reconstruction and same-current-agent EVALUATOR explicitly not independent, canonical verification checkpoint before finish actual implementation SHA. Preserve entire parent643730character prefix SHA5b3500c7addba14f05e2f3baefde30448bba14a6721ec84016944482a48572c7 and stash c85f4a0e453dfd06d6e199554784f2c286737472. Clean final Git.
  Verification: "Pending implementation and the single upstream-absent runtime profile."
  Rollback Plan: "Revert only this leaf's intentional implementation and task artifacts; retain previous occupied-label correction and parent history."
  Findings: "Current e625c6f3 intrinsic minimum width is present. Source inspection identifies an additional LTR tab fallback gap: current flex slot can end exactly at the glyph when the list tab is exhausted; native tab lookup advances strictly beyond it. No user-specific document is available, so exact original reproduction remains unspecified."
id_source: "generated"
---
## Summary

Priority native list-tab repair after occupied bullet glyph width exceeds its authored stop.

## Scope

apps/office/src/sw/browser/editor/WriterEditableParagraph.tsx
apps/office/src/sw/browser/presentation/writer-view-projection.ts
apps/office/src/sw/source/core/text/txttab.ts
apps/office/src/sw/source/core/text/native-numbering-tab.test.ts
apps/office/src/sw/browser/editor/native-numbering-tab.test.tsx
apps/office/e2e/writer-native-numbering-tab.spec.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json

## Plan

One issue: label-alignment list text must advance to the first native tab strictly after the measured occupied label, including next explicit/default tabs when the authored list tab is exhausted. Port the bounded LTR left/default tab search/default spacing/hanging-indent compatibility from txttab.cxx and list-tab merge from inftxt.cxx; normalize primitive read-only positions at the browser projection, measure actual glyph advance with font/size refresh before paint. Keep legacy numbering distance and the exact four authored listLayout fields, detached compatibility, model/cursor/history and registered IO deviations. Three production files, three fresh regression files, two metadata files; all609 previous acceptance files byte-identical and302 existing metadata prefixes/status/defaults retained, one actual mapped core module added. Tests use only local runtime. Initial six static checks once, ONE full upstream-absent profile with finally restoration; subsequent only actual failures/new cases or failed/changed static inputs; source-bound all4 coverage100, no count clamping. Five source gates after restoration. English bounded AP hashes/identifiers/counts only; no source/script/raw snapshots. Standing user priority request and goal authorize safe local work, no network/outside-repo/destructive action. Full RTL, vertical, right/center/decimal/fill tabs, narrow-frame overflow and native formatter remain explicitly partial; this does not promote a full formatter or complete parity. Native ruler refactor deferred until this priority repair is complete.

## Verify Steps

1. Bind the production strict-after-label tab selection to pinned txttab.cxx SwLineInfo::GetTabStop/NewTabPortion, inftxt.cxx InitLineInfo and ndtxt.cxx GetListTabStopPosition; prove ordinary/collapsed/narrow/equal/multiple explicit/default tabs, relative/absolute origins, hanging-indent flags, 50-twip noncompat minimum, legacy preservation, fresh browser width/font refresh and body/cell editing/UndoRedo. No tests invoke upstream.
2. Initial format/lint/type/dependencies/JSDoc/physical-size checks once; subsequent only failed/changed-input closure. ONE full upstream-absent build/app/inventory/infrastructure/Chromium profile, finally restore vendor, zero passing replay. All4 app/inventory100 via exact identical source/maps or complete contiguous declaration/body/enclosing branch/location proofs, no clamps/exclusions; actual failures remain recorded, focused skips stay skipped.
3. Five restored source/resource/provenance/invariants/parity CLI gates; scope8 semantic paths,609 old acceptance files unchanged,302 old metadata prefixes/classes/status/defaults retained plus exactly one honest partial mapped module; physical lines<1000, JSDoc, AP source/script/raw ban, doctor/routing/diff. All limitations remain explicit, full goal ACTIVE.
4. Final Findings/Verification before canonical verify; exact implementation SHA proof reconstruction and same-current-agent EVALUATOR explicitly not independent, canonical verification checkpoint before finish actual implementation SHA. Preserve entire parent643730character prefix SHA5b3500c7addba14f05e2f3baefde30448bba14a6721ec84016944482a48572c7 and stash c85f4a0e453dfd06d6e199554784f2c286737472. Clean final Git.

## Verification

Pending implementation and the single upstream-absent runtime profile.

## Rollback Plan

Revert only this leaf's intentional implementation and task artifacts; retain previous occupied-label correction and parent history.

## Findings

Current e625c6f3 intrinsic minimum width is present. Source inspection identifies an additional LTR tab fallback gap: current flex slot can end exactly at the glyph when the list tab is exhausted; native tab lookup advances strictly beyond it. No user-specific document is available, so exact original reproduction remains unspecified.
