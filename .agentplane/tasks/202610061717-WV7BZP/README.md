---
id: "202610061717-WV7BZP"
title: "Port native Writer mouse row-border resizing"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on:
  - "202610061649-BNNDEG"
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-06T17:17:52.619Z"
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
    body: "Start: explicitly authorized priority row-border resizing, source-owned SwTabCols geometry and deferred native row history; prior column/bullet leaves remain unchanged."
events:
  -
    type: "status"
    at: "2026-10-06T17:18:20.590Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: explicitly authorized priority row-border resizing, source-owned SwTabCols geometry and deferred native row history; prior column/bullet leaves remain unchanged."
doc_version: 3
doc_updated_at: "2026-10-06T17:18:20.590Z"
doc_updated_by: "CODER"
description: "Iteration194 user-priority: native GetTabRows/SetTabRows and row ruler tracking shift following boundaries and table bottom, preserve actual owners/history and prevent browser text drag/selection."
sections:
  Summary: "Iteration194: source-owned Writer row geometry and mouse ruler tracking, continuing explicitly authorized priority table UI parity. Grow/shrink the actual row, shift subsequent boundaries/table bottom, and publish one native history after accepted release."
  Scope: "Only apps/office/src/sw/source/core/doc/doc.ts, apps/office/src/sw/source/core/docnode/ndtbl.ts, apps/office/src/sw/source/core/layout/tabfrm.ts, apps/office/src/sw/source/core/frmedt/fetab.ts, apps/office/src/sw/source/uibase/docvw/edtwin.ts, apps/office/src/sw/browser/editor/browser-writer-edit-window.ts, apps/office/src/sw/source/core/docnode/native-tabrows.test.ts, apps/office/src/sw/source/uibase/docvw/native-table-row-drag.test.ts, apps/office/src/sw/browser/editor/native-table-row-drag.test.tsx, apps/office/e2e/writer-native-table-row-drag.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Existing flat horizontal LTR table functionality; actual master/follow/repeated native box frame ownership.504 old acceptance files byte-identical+4new=508;275 prior metadata records/prefixes preserved+1source responsibility split=276. Native ndtbl.ts split keeps SwDoc under mandatory1000physical lines. Conscious I/O deviations and THKZ38 stash unchanged."
  Plan: "Under persistent iterative/user authorization: port source GetTabRows fuzzy boundary/minimum/hidden/follow flag and SetTabRows row-height deltas into SwDoc source owner split, using actual measured frames and boxes, SwTabCols and existing native attr history/notification transaction. Add shell current/mouse ingress without moving text PaM. Refactor column-specific tracking draft and browser guide/capture into shared axis mechanics retaining old API/contracts while admitting ROW_HORI. Rows default shift all following separators/right edge by same delta; source ROWFUZZY25 avoids tiny/no-op writes. Real mouse, Escape/Enter/blur/teardown, no text drag/selection, grouped history, graph/list/cursor retention and ODT re-open verified. Do not replace row mechanisms with UI heights arrays."
  Verify Steps: |-
    1. Initial six static gates once, then only original failed or genuinely changed-path checks; scoped unchanged JSDoc and physical lines<1000.
    2. ONE full upstream-absent build/app/inventory/scripts/Chromium profile, counts/errors/hashes before assertions, restore finally. No source/scope/AP audit while live. Only original failed or genuinely new cases afterward; no historical passing/full replay, no tests with upstream. Actual100 app/inventory with complete source/maps or complete contiguous byte-identical regions/full function declaration-body/full enclosing branch-location proof. Raw source/maps/cases/logs only ignored app cache; AP bounded prose/counts/hashes/outcomes; filtered skips retained.
    3. Native literal GetTabRows boundaries/leftMin/right/rightMax/hidden/ROWFUZZY25/last-row guard, SetTabRows actual row delta and current-column admission, default following-row shift, bottom edge, minimum5device-pixels and negative/shrink/grow/clamp/no-op; cancellation/stale/detached/foreign/right/double/table-mode/top/column guards. Original cursor/list/table/line/box/text identities retained and3UndoRedo cycles; continued typing and ODT row minimum roundtrip. No mutation/history during preview;one accepted history.
    4. Mounted and production Chromium1280/390 actual horizontal boundaries, cross-column motion/off-host release, cancellation/Enter and drag/selection interference, physical later-row translation and bottom expansion; normal content minimum constraints preserved.504 old acceptance files unchanged+4new=508;275old metadata contracts/prefixes+1new source split=276,I/O mapping unchanged.
    5. Once restored five source gates;doctor/routing/diff,pinned source hashes,currentleaf quality census0forbidden; exact implementationSHA same-agent EVALUATOR explicitly not independent. Final prose BEFORE canonical ap verify, verification tail before finish(actual implementationSHA),clean final checkout. Entire prior494113-character parent prefix SHA88a9ab5e7e83b4cb66990c05fb2fefea4bb86893f7f71a664a2f3f0b2abef932 preserved; full parity UNVERIFIED/goalACTIVE.
  Verification: "Pending. Full native modifiers/proportional resizing, vertical/RTL, merged/nested/protected cells and full row-split layout remain unverified beyond currently existing project functionality."
  Rollback Plan: "Revert only final leaf implementation through a new task. Preserve all other task/source history and deferred THKZ38 stash."
  Findings: "Pinned ndtbl.cxx GetTabRows builds fuzzy25-twip cell top/bottom boundaries, keeps preceding top as nMin, LONG_MAX nMax, hides separators outside actual selected column and marks split-last-row admission. SetTabRows compares old/new intervals, ignores delta<25, finds actual cell lower border, adjusts connected SwTableLine height from measured cell height+delta and converts variable to minimum. svxruler.cxx default row drag shifts following borders and lower margin; column neighbor balancing is incorrect for rows. Existing row model supports minimum height; existing layout uses whole flat rows with native master/follow boxes, not arbitrary merged/split structures."
id_source: "generated"
---
## Summary

Iteration194: source-owned Writer row geometry and mouse ruler tracking, continuing explicitly authorized priority table UI parity. Grow/shrink the actual row, shift subsequent boundaries/table bottom, and publish one native history after accepted release.

## Scope

Only apps/office/src/sw/source/core/doc/doc.ts, apps/office/src/sw/source/core/docnode/ndtbl.ts, apps/office/src/sw/source/core/layout/tabfrm.ts, apps/office/src/sw/source/core/frmedt/fetab.ts, apps/office/src/sw/source/uibase/docvw/edtwin.ts, apps/office/src/sw/browser/editor/browser-writer-edit-window.ts, apps/office/src/sw/source/core/docnode/native-tabrows.test.ts, apps/office/src/sw/source/uibase/docvw/native-table-row-drag.test.ts, apps/office/src/sw/browser/editor/native-table-row-drag.test.tsx, apps/office/e2e/writer-native-table-row-drag.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Existing flat horizontal LTR table functionality; actual master/follow/repeated native box frame ownership.504 old acceptance files byte-identical+4new=508;275 prior metadata records/prefixes preserved+1source responsibility split=276. Native ndtbl.ts split keeps SwDoc under mandatory1000physical lines. Conscious I/O deviations and THKZ38 stash unchanged.

## Plan

Under persistent iterative/user authorization: port source GetTabRows fuzzy boundary/minimum/hidden/follow flag and SetTabRows row-height deltas into SwDoc source owner split, using actual measured frames and boxes, SwTabCols and existing native attr history/notification transaction. Add shell current/mouse ingress without moving text PaM. Refactor column-specific tracking draft and browser guide/capture into shared axis mechanics retaining old API/contracts while admitting ROW_HORI. Rows default shift all following separators/right edge by same delta; source ROWFUZZY25 avoids tiny/no-op writes. Real mouse, Escape/Enter/blur/teardown, no text drag/selection, grouped history, graph/list/cursor retention and ODT re-open verified. Do not replace row mechanisms with UI heights arrays.

## Verify Steps

1. Initial six static gates once, then only original failed or genuinely changed-path checks; scoped unchanged JSDoc and physical lines<1000.
2. ONE full upstream-absent build/app/inventory/scripts/Chromium profile, counts/errors/hashes before assertions, restore finally. No source/scope/AP audit while live. Only original failed or genuinely new cases afterward; no historical passing/full replay, no tests with upstream. Actual100 app/inventory with complete source/maps or complete contiguous byte-identical regions/full function declaration-body/full enclosing branch-location proof. Raw source/maps/cases/logs only ignored app cache; AP bounded prose/counts/hashes/outcomes; filtered skips retained.
3. Native literal GetTabRows boundaries/leftMin/right/rightMax/hidden/ROWFUZZY25/last-row guard, SetTabRows actual row delta and current-column admission, default following-row shift, bottom edge, minimum5device-pixels and negative/shrink/grow/clamp/no-op; cancellation/stale/detached/foreign/right/double/table-mode/top/column guards. Original cursor/list/table/line/box/text identities retained and3UndoRedo cycles; continued typing and ODT row minimum roundtrip. No mutation/history during preview;one accepted history.
4. Mounted and production Chromium1280/390 actual horizontal boundaries, cross-column motion/off-host release, cancellation/Enter and drag/selection interference, physical later-row translation and bottom expansion; normal content minimum constraints preserved.504 old acceptance files unchanged+4new=508;275old metadata contracts/prefixes+1new source split=276,I/O mapping unchanged.
5. Once restored five source gates;doctor/routing/diff,pinned source hashes,currentleaf quality census0forbidden; exact implementationSHA same-agent EVALUATOR explicitly not independent. Final prose BEFORE canonical ap verify, verification tail before finish(actual implementationSHA),clean final checkout. Entire prior494113-character parent prefix SHA88a9ab5e7e83b4cb66990c05fb2fefea4bb86893f7f71a664a2f3f0b2abef932 preserved; full parity UNVERIFIED/goalACTIVE.

## Verification

Pending. Full native modifiers/proportional resizing, vertical/RTL, merged/nested/protected cells and full row-split layout remain unverified beyond currently existing project functionality.

## Rollback Plan

Revert only final leaf implementation through a new task. Preserve all other task/source history and deferred THKZ38 stash.

## Findings

Pinned ndtbl.cxx GetTabRows builds fuzzy25-twip cell top/bottom boundaries, keeps preceding top as nMin, LONG_MAX nMax, hides separators outside actual selected column and marks split-last-row admission. SetTabRows compares old/new intervals, ignores delta<25, finds actual cell lower border, adjusts connected SwTableLine height from measured cell height+delta and converts variable to minimum. svxruler.cxx default row drag shifts following borders and lower margin; column neighbor balancing is incorrect for rows. Existing row model supports minimum height; existing layout uses whole flat rows with native master/follow boxes, not arbitrary merged/split structures.
