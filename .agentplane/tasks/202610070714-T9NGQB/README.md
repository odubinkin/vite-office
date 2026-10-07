---
id: "202610070714-T9NGQB"
title: "Restore native table collapsing-border control and rendering"
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
  updated_at: "2026-10-07T07:14:52.450Z"
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
    body: "Start: restore source-owned collapsing-border item and control through existing table attributes, history, paint and ODT under standing iterative parity authorization."
events:
  -
    type: "status"
    at: "2026-10-07T07:15:00.711Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore source-owned collapsing-border item and control through existing table attributes, history, paint and ODT under standing iterative parity authorization."
doc_version: 3
doc_updated_at: "2026-10-07T07:15:00.711Z"
doc_updated_by: "CODER"
description: "Iteration209: restore existing table borderModel behavior through the source-owned Merge adjacent line styles control, native boolean item input/output, grouped table attributes, rendering and ODT/history; preserve registered I/O deviations."
sections:
  Summary: "Restore native Merge adjacent line styles and existing table border-model rendering."
  Scope: |-
    Approved paths:
    - apps/office/src/sw/inc/hintids.ts
    - apps/office/src/sw/source/core/attr/swatrset.ts
    - apps/office/src/svl/source/items/cenumitm.ts
    - apps/office/src/cui/source/tabpages/border.ts
    - apps/office/src/sw/source/uibase/shells/tabsh.ts
    - apps/office/src/sw/browser/presentation/WriterBorderPage.tsx
    - apps/office/src/sw/browser/presentation/WriterTableDialog.tsx
    - apps/office/src/sw/browser/editor/WriterEditableTable.tsx
    - apps/office/src/cui/source/tabpages/native-collapsing-border-page.test.ts
    - apps/office/src/sw/browser/presentation/native-collapsing-table-borders.test.tsx
    - apps/office/e2e/writer-native-collapsing-borders.spec.ts
    - apps/office/src/sw/browser/editor/native-cell-box-render.test.tsx
    - apps/office/src/sw/browser/presentation/native-border-page.test.tsx
    - docs/program/source-provenance.json
    - docs/program/parity/runtime-inventory.json

    Preserve registered I/O/recovery deviations. Full native line arbitration, shadow and unrepresented Sfx page/layout behavior remain unverified.
  Plan: "One CODER leaf under standing iterative UI/native ownership authorization: restore existing collapsing/separating table border model through native RES_COLLAPSING_BORDERS=132 with false pool default, SfxBoolItem SetValue, source saved tri-state Reset/FillItemSet and changed-item-only output. Existing generic boxWhich injection extends to native collapseWhich without reverse CUI-to-SW dependency; React supplies Writer WhichId, displays Merge adjacent line styles and forwards native state. Shell captures existing table format into native items, separates table attributes from cell box/info writes and applies accepted native boolean via existing grouped SetTableAttr history. Browser paint reads existing native borderModel and source false default; explicit zero border spacing adapts contiguous native cell geometry. Preserve all original acceptance contracts and metadata prefixes/statuses/defaults/exceptions; only source-backed output/control/paint expectation migrations if required. New core/mounted and Chromium1280/390 tests cover default/input tri-state, clone/clear/unchanged behavior, Reset/Cancel, selected-row input with table-wide format effect, owner/cursor/text preservation, three Undo/Redo and ODT continuation. Initial six static gates once, one full upstream-absent runtime profile, failed/genuinely-new-only closures;100actual app/inventory coverage without fabrication/exclusions or passing replay. Source/scope/governance review after restoration, same-agent EVALUATOR exact implementation and canonical close/parent-prefix preservation. No upstream source/scripts/Python/raw results in AP, network/outside/delegation. Full native competing-line pixel arbitration, shadow/diagonal/theme/Sfx orchestration and whole parity remain unverified."
  Verify Steps: |-
    1. Source-backed native RES_COLLAPSING_BORDERS132 false pool default, owned bool clone/SetValue, Reset saved true/false/unknown and changed-only native FillItemSet including indeterminate ClearItem and absent original behavior. Native existing four distances/six lines remain intact. React checkbox uses native owner; Reset and Cancel do not mutate document.
    2. Real native shell properties capture original collapsing/separating/default format; accepted boolean applies via grouped native table attributes without treating table-only items as cell-border edits. Selected row input still changes actual table format. Browser paint reflects actual native table model with source false default and zero native gap. Existing owner/graph/text/cursor/selection/history intact; three Undo/Redo, ODT roundtrip and continued editing. Chromium1280/390 real imported models, checkbox/default/Reset/Cancel/accepted/history/geometry required.
    3. Initial format:check/lint/typecheck/check:dependencies/check:docs/check:file-size once, scoped unchanged JSDoc/physical<1000. ONE full upstream-absent local static build/app/inventory/infrastructure/Chromium profile with finally restore; no concurrent source/AP/audit mutation. Only original failure or genuinely new cases afterward; actual100 app/inventory with whole identical source/maps or complete contiguous declaration/body/branch/all locations proofs, no manufactured coverage/exclusions/skippromotion or passing/full replay.
    4. Post-restoration generation--check/source-tree/provenance/invariants/parity; strict old acceptance/metadata prefix/default/status/registered deviation preservation, doctor/routing/diff and bounded English artifact0forbidden. Same current-agent EVALUATOR explicitly not independent exact implementation review. Final Findings/Verification before canonical verify and actual implementation finish; clean tracked/all state; preserve complete parent prefix on append, parent/goal ACTIVE.
  Verification: "Pending implementation and one upstream-absent runtime profile."
  Rollback Plan: "Revert only this leaf implementation commit and retain completed immutable evidence and registered deviations."
  Findings: "Previous goal turn made concrete progress: native six-line border page208 DONE at61d4c2617649b72096cca1f2d40df9d74d9dcb3f. Current main clean. Source border.cxx Reset/FillItemSet/PageCreated exposes Merge adjacent line styles for Writer tables; init.cxx defaults RES_COLLAPSING_BORDERS false, tabfrm.cxx reads that flag. Existing SwTableFormat and ODT already retain borderModel, but native page has no control and browser always paints collapse. This leaf restores existing functionality end to end. Read-only discovery used two guessed absent paths and recomputed route; no mutation from that command. One task, no subagents/network/global access."
id_source: "generated"
---
## Summary

Restore native Merge adjacent line styles and existing table border-model rendering.

## Scope

Approved paths:
- apps/office/src/sw/inc/hintids.ts
- apps/office/src/sw/source/core/attr/swatrset.ts
- apps/office/src/svl/source/items/cenumitm.ts
- apps/office/src/cui/source/tabpages/border.ts
- apps/office/src/sw/source/uibase/shells/tabsh.ts
- apps/office/src/sw/browser/presentation/WriterBorderPage.tsx
- apps/office/src/sw/browser/presentation/WriterTableDialog.tsx
- apps/office/src/sw/browser/editor/WriterEditableTable.tsx
- apps/office/src/cui/source/tabpages/native-collapsing-border-page.test.ts
- apps/office/src/sw/browser/presentation/native-collapsing-table-borders.test.tsx
- apps/office/e2e/writer-native-collapsing-borders.spec.ts
- apps/office/src/sw/browser/editor/native-cell-box-render.test.tsx
- apps/office/src/sw/browser/presentation/native-border-page.test.tsx
- docs/program/source-provenance.json
- docs/program/parity/runtime-inventory.json

Preserve registered I/O/recovery deviations. Full native line arbitration, shadow and unrepresented Sfx page/layout behavior remain unverified.

## Plan

One CODER leaf under standing iterative UI/native ownership authorization: restore existing collapsing/separating table border model through native RES_COLLAPSING_BORDERS=132 with false pool default, SfxBoolItem SetValue, source saved tri-state Reset/FillItemSet and changed-item-only output. Existing generic boxWhich injection extends to native collapseWhich without reverse CUI-to-SW dependency; React supplies Writer WhichId, displays Merge adjacent line styles and forwards native state. Shell captures existing table format into native items, separates table attributes from cell box/info writes and applies accepted native boolean via existing grouped SetTableAttr history. Browser paint reads existing native borderModel and source false default; explicit zero border spacing adapts contiguous native cell geometry. Preserve all original acceptance contracts and metadata prefixes/statuses/defaults/exceptions; only source-backed output/control/paint expectation migrations if required. New core/mounted and Chromium1280/390 tests cover default/input tri-state, clone/clear/unchanged behavior, Reset/Cancel, selected-row input with table-wide format effect, owner/cursor/text preservation, three Undo/Redo and ODT continuation. Initial six static gates once, one full upstream-absent runtime profile, failed/genuinely-new-only closures;100actual app/inventory coverage without fabrication/exclusions or passing replay. Source/scope/governance review after restoration, same-agent EVALUATOR exact implementation and canonical close/parent-prefix preservation. No upstream source/scripts/Python/raw results in AP, network/outside/delegation. Full native competing-line pixel arbitration, shadow/diagonal/theme/Sfx orchestration and whole parity remain unverified.

## Verify Steps

1. Source-backed native RES_COLLAPSING_BORDERS132 false pool default, owned bool clone/SetValue, Reset saved true/false/unknown and changed-only native FillItemSet including indeterminate ClearItem and absent original behavior. Native existing four distances/six lines remain intact. React checkbox uses native owner; Reset and Cancel do not mutate document.
2. Real native shell properties capture original collapsing/separating/default format; accepted boolean applies via grouped native table attributes without treating table-only items as cell-border edits. Selected row input still changes actual table format. Browser paint reflects actual native table model with source false default and zero native gap. Existing owner/graph/text/cursor/selection/history intact; three Undo/Redo, ODT roundtrip and continued editing. Chromium1280/390 real imported models, checkbox/default/Reset/Cancel/accepted/history/geometry required.
3. Initial format:check/lint/typecheck/check:dependencies/check:docs/check:file-size once, scoped unchanged JSDoc/physical<1000. ONE full upstream-absent local static build/app/inventory/infrastructure/Chromium profile with finally restore; no concurrent source/AP/audit mutation. Only original failure or genuinely new cases afterward; actual100 app/inventory with whole identical source/maps or complete contiguous declaration/body/branch/all locations proofs, no manufactured coverage/exclusions/skippromotion or passing/full replay.
4. Post-restoration generation--check/source-tree/provenance/invariants/parity; strict old acceptance/metadata prefix/default/status/registered deviation preservation, doctor/routing/diff and bounded English artifact0forbidden. Same current-agent EVALUATOR explicitly not independent exact implementation review. Final Findings/Verification before canonical verify and actual implementation finish; clean tracked/all state; preserve complete parent prefix on append, parent/goal ACTIVE.

## Verification

Pending implementation and one upstream-absent runtime profile.

## Rollback Plan

Revert only this leaf implementation commit and retain completed immutable evidence and registered deviations.

## Findings

Previous goal turn made concrete progress: native six-line border page208 DONE at61d4c2617649b72096cca1f2d40df9d74d9dcb3f. Current main clean. Source border.cxx Reset/FillItemSet/PageCreated exposes Merge adjacent line styles for Writer tables; init.cxx defaults RES_COLLAPSING_BORDERS false, tabfrm.cxx reads that flag. Existing SwTableFormat and ODT already retain borderModel, but native page has no control and browser always paints collapse. This leaf restores existing functionality end to end. Read-only discovery used two guessed absent paths and recomputed route; no mutation from that command. One task, no subagents/network/global access.
