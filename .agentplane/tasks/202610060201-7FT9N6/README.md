---
id: "202610060201-7FT9N6"
title: "Restore native cross-cell selection and repeated headline admission"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
task_kind: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-06T02:02:03.160Z"
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
    body: "Start: Implement approved native flat-table selection admission and original-only painting through existing shell and DOM owners; preserve old tests and deliberate IO exceptions."
events:
  -
    type: "status"
    at: "2026-10-06T02:02:13.065Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement approved native flat-table selection admission and original-only painting through existing shell and DOM owners; preserve old tests and deliberate IO exceptions."
doc_version: 3
doc_updated_at: "2026-10-06T02:02:13.065Z"
doc_updated_by: "CODER"
description: "Align actual browser cross-cell gestures with native table cursor ownership and repeated headline restrictions; paint selected original boxes without selecting repeated headline copies. Preserve registered IO deviations and prior tests."
sections:
  Summary: "Restore native cross-cell selection and repeated headline admission in existing core and UI owners."
  Scope: |-
    apps/office/src/sw/browser/editor/writer-selection-types.ts
    apps/office/src/sw/browser/editor/writer-selection.ts
    apps/office/src/sw/browser/editor/browser-writer-edit-window.ts
    apps/office/src/sw/browser/editor/WriterEditableTable.tsx
    apps/office/src/sw/source/uibase/docvw/edtwin.ts
    apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
    apps/office/src/sw/source/uibase/wrtsh/wrtsh-selection.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
    apps/office/src/sw/source/uibase/docvw/native-headline-selection.test.ts
    apps/office/src/sw/browser/editor/native-headline-selection.test.tsx
    apps/office/e2e/writer-headline-selection.spec.ts
  Plan: "Iteration174 under standing approved iterative upstream convergence goal. One atomic direct CODER leaf: existing flat cross-cell browser PaM must activate native SwTableCursor when both distinct cell sections share a table; point/mark identity and direction preserved, existing NewTableSelection/MakeBoxSels ownership reused. Carry only actual repeated-headline view occurrence flag through existing DOM selection/edit-window endpoints to existing shell admission; no cloned model, DTO layer, selection manager or TextRuns conversion. Native crsrsh UpdateCursor prohibits table cursor with either endpoint in repeated headline: new cross-cell attempt collapses to fixed mark, existing table cursor reduces to mark cell boundary using actual MoveSection and source direction. Same-cell selection/editing remains ordinary and original nodes stay shared. Native viscrs FillRects traverses GetNextCellLeaf/GetFollowCell of split rows, not repeated headline frames: suppress selected row/cell paint on repeated copies while painting actual native original boxes. Seven existing owners,two canonical metadata,three new test files,12semantic paths. Preserve449 prior testfiles and258 semantic states/defaults/classes/IOexception/evidence prefixes. Actual mounted forward/reverse original/body/follow admission,existing-table boundary,copy text/format/history and real ODT Chromium1280/390. Full nested/merged/rowspan/split rows/vertical/RTL/fly/multicolumn/protection/complete frame lifecycle/core/UI parity remains unverified. Six initial statics,ONE upstream-absent fullprofile then failed/new-only closure with actual100percent maps/source identity; no passing replay/no tests upstream/no AP sources/helpers/rawdiagnostics. Same-agent exactSHA EVALUATOR,verify,meaningfulfinish,parent checkpoint,goalACTIVE."
  Verify Steps: |-
    1. Six initial static gates npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Failed-gate-only recovery,changed-file-only checks after full profile.
    2. ONE upstream-absent fullprofile npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Rename vendor/.offline-7FT9N6 and restore finally; tests never read/invoke/compile pinned upstream. Persist exact failures/errors/counts/hashes before assertions. Afterwards only original failures/genuinely new cases; skipped means skipped,no passing/full replay. Rebuild only production change. Actual100percent maps require exact source/maps identity or entire contiguous unchanged source ranges plus actual counters; maps/raw results/source snapshots only ignored appcache.
    3. New actual owner cases independently assert ordinary forward/reverse same-table cross-cell rectangle and native table cursor,body/other-table/same-cell controls,point-or-mark repeated-headline new admission collapse,existing table selection reduced to fixed mark cell beginning/end with direction,invalid endpoints,no model mutation/history. Mounted same native cases plus shared header copy editing/UndoRedo,original-only selected-box/row painting,repeat descriptions and controls. Real production ODT Open Chromium1280/390 exercises browser ranges and actual header/body neighboring text,paint and history.
    4. Preserve449prior tests byte-identical and258semantic state/default/classification/IOexception/evidence prefixes; twelve approved paths,native source hashes,scopeaudit,ignored-inclusiveAP hygiene,doctor,routing,diff. No broad module promotion; deliberate IO deviations unchanged.
    5. Vendor restored before five source audits npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. Same-agent EVALUATOR exactsemanticSHA,recordverification,meaningfulfinish,whole parentcheckpoint,parentDOINGgoalACTIVE.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only the semantic implementation commit; preserve immutable task evidence and registered IO deviations."
  Findings: "Previous173 PROGRESS: committed and closed native repeated headline editing. Read-only174 audit confirms crsrsh UpdateCursor repeated-headline restrictions and viscrs FillRects/GetNextCellLeaf/GetFollowCell split-row-only painting. Initial guessed trvlfrm/crsrsh/selection/config paths were absent; rg actual filenames resolved them, route recomputed after nonzero lookups. No mutation before standing approved plan, no network/outside/global/subagents. Broad parity remains unverified."
id_source: "generated"
---
## Summary

Restore native cross-cell selection and repeated headline admission in existing core and UI owners.

## Scope

apps/office/src/sw/browser/editor/writer-selection-types.ts
apps/office/src/sw/browser/editor/writer-selection.ts
apps/office/src/sw/browser/editor/browser-writer-edit-window.ts
apps/office/src/sw/browser/editor/WriterEditableTable.tsx
apps/office/src/sw/source/uibase/docvw/edtwin.ts
apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
apps/office/src/sw/source/uibase/wrtsh/wrtsh-selection.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json
apps/office/src/sw/source/uibase/docvw/native-headline-selection.test.ts
apps/office/src/sw/browser/editor/native-headline-selection.test.tsx
apps/office/e2e/writer-headline-selection.spec.ts

## Plan

Iteration174 under standing approved iterative upstream convergence goal. One atomic direct CODER leaf: existing flat cross-cell browser PaM must activate native SwTableCursor when both distinct cell sections share a table; point/mark identity and direction preserved, existing NewTableSelection/MakeBoxSels ownership reused. Carry only actual repeated-headline view occurrence flag through existing DOM selection/edit-window endpoints to existing shell admission; no cloned model, DTO layer, selection manager or TextRuns conversion. Native crsrsh UpdateCursor prohibits table cursor with either endpoint in repeated headline: new cross-cell attempt collapses to fixed mark, existing table cursor reduces to mark cell boundary using actual MoveSection and source direction. Same-cell selection/editing remains ordinary and original nodes stay shared. Native viscrs FillRects traverses GetNextCellLeaf/GetFollowCell of split rows, not repeated headline frames: suppress selected row/cell paint on repeated copies while painting actual native original boxes. Seven existing owners,two canonical metadata,three new test files,12semantic paths. Preserve449 prior testfiles and258 semantic states/defaults/classes/IOexception/evidence prefixes. Actual mounted forward/reverse original/body/follow admission,existing-table boundary,copy text/format/history and real ODT Chromium1280/390. Full nested/merged/rowspan/split rows/vertical/RTL/fly/multicolumn/protection/complete frame lifecycle/core/UI parity remains unverified. Six initial statics,ONE upstream-absent fullprofile then failed/new-only closure with actual100percent maps/source identity; no passing replay/no tests upstream/no AP sources/helpers/rawdiagnostics. Same-agent exactSHA EVALUATOR,verify,meaningfulfinish,parent checkpoint,goalACTIVE.

## Verify Steps

1. Six initial static gates npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Failed-gate-only recovery,changed-file-only checks after full profile.
2. ONE upstream-absent fullprofile npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Rename vendor/.offline-7FT9N6 and restore finally; tests never read/invoke/compile pinned upstream. Persist exact failures/errors/counts/hashes before assertions. Afterwards only original failures/genuinely new cases; skipped means skipped,no passing/full replay. Rebuild only production change. Actual100percent maps require exact source/maps identity or entire contiguous unchanged source ranges plus actual counters; maps/raw results/source snapshots only ignored appcache.
3. New actual owner cases independently assert ordinary forward/reverse same-table cross-cell rectangle and native table cursor,body/other-table/same-cell controls,point-or-mark repeated-headline new admission collapse,existing table selection reduced to fixed mark cell beginning/end with direction,invalid endpoints,no model mutation/history. Mounted same native cases plus shared header copy editing/UndoRedo,original-only selected-box/row painting,repeat descriptions and controls. Real production ODT Open Chromium1280/390 exercises browser ranges and actual header/body neighboring text,paint and history.
4. Preserve449prior tests byte-identical and258semantic state/default/classification/IOexception/evidence prefixes; twelve approved paths,native source hashes,scopeaudit,ignored-inclusiveAP hygiene,doctor,routing,diff. No broad module promotion; deliberate IO deviations unchanged.
5. Vendor restored before five source audits npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. Same-agent EVALUATOR exactsemanticSHA,recordverification,meaningfulfinish,whole parentcheckpoint,parentDOINGgoalACTIVE.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only the semantic implementation commit; preserve immutable task evidence and registered IO deviations.

## Findings

Previous173 PROGRESS: committed and closed native repeated headline editing. Read-only174 audit confirms crsrsh UpdateCursor repeated-headline restrictions and viscrs FillRects/GetNextCellLeaf/GetFollowCell split-row-only painting. Initial guessed trvlfrm/crsrsh/selection/config paths were absent; rg actual filenames resolved them, route recomputed after nonzero lookups. No mutation before standing approved plan, no network/outside/global/subagents. Broad parity remains unverified.
