---
id: "202610050543-WCNKTY"
title: "Share Writer paragraph rendering between body text and table cells"
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
  updated_at: "2026-10-05T05:44:37.998Z"
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
    body: "Start: remove the partial table cell renderer and share actual paragraph projection, native list labels and display behavior with body and measurement text."
events:
  -
    type: "status"
    at: "2026-10-05T05:44:38.596Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: remove the partial table cell renderer and share actual paragraph projection, native list labels and display behavior with body and measurement text."
doc_version: 3
doc_updated_at: "2026-10-05T05:44:38.596Z"
doc_updated_by: "CODER"
description: "Remove the partial cell font/spacing renderer and identity fallback; render actual cell paragraph projections and native list labels through the same paragraph component on visible and measurement surfaces. Preserve shared input/history ownership, registered I/O deviations and all semantic statuses."
sections:
  Summary: "Share Writer paragraph rendering between body text and table cells."
  Scope: |-
    - apps/office/src/sw/browser/editor/WriterEditableParagraph.tsx
    - apps/office/src/sw/browser/editor/WriterEditableTable.tsx
    - apps/office/src/sw/browser/editor/WriterPlainTextEditor.tsx
    - apps/office/src/sw/browser/presentation/WriterTableDialog.test.tsx
    - apps/office/src/sw/browser/editor/cell-paragraph-rendering.test.tsx
    - apps/office/e2e/writer-cell-paragraph-format.spec.ts
    - docs/program/source-provenance.json
    - docs/program/parity/runtime-inventory.json
  Plan: "Use one browser paragraph renderer and one immutable native-node projection for body and cell text,matching pinned SwCellFrame -> InsertCnt_ -> MakeTextFrame -> SwTextFrame ownership. Remove WriterEditableTableCell's partial attribute/font/spacing/readTextRuns assembly and synthetic node-index identity fallback. Require table paragraph projections keyed by actual SwNodes index;build the shared map once in WriterPlainTextEditor and pass the same values to visible and closed-shadow measurement tables. Reuse WriterEditableParagraph for actual effective alignment,style,color/highlight,font,indent and native node.GetListLabel/list-layout display,without editable DTO round-trip or React list numbering/history logic. Add only structural cell position/explicit editable-island/spacing context to the common paragraph;use native stable paragraph IDs for unique accessibility descriptions and React keys,retain empty-cell caret and shared DOM selection registration. Keep body fragment/layout/line-number contracts and existing shell edits unchanged. Independent owned projection/mounted and Chromium cases check literal alignment,signed/manual or automatic first-line values,supported list labels/level geometry,style and text colors,font runs,neighbor/body isolation,actual native model/history and ODT reopen;visible and measurement rendering share values. First-static observed old standalone table-prop fixtures receive required projection-map plumbing only,all prior assertions retained unless an exact first-profile source contradiction is observed. Three existing runtime rows receive bounded notes/evidence only;all244states/defaults/exceptions unchanged,no promotion/newmodule. Table-wide Home/navigation/selection,merged/nested cell/native table text-frame pagination/spacing collapse,full portion engine and list structural operations remain unverified,next leaves. Six static gates first;ONE sequential full build/app/inventory/scripts/Chromium profile with vendor renamed inside repository in try/finally and reportOnFailure;persist exact failed/error-causing names before collector assertions,both first coverage JSON countmaps only ignored appcache. Repeat failed/new-unexecuted cases only,zero passing replay;restore before five source audits. Scope/native hashes,exact-SHA same-actor readonly quality,doctor/routing,CODER Verification beforeverify and canonicalfinish. No network/outside/global/subagents/Agentplane sources/helpers/Python/probes/rawdiagnostics;oneleaf139 only,goalactive."
  Verify Steps: |-
    - `npm run format:check`
    - `npm run lint`
    - `npm run typecheck`
    - `npm run check:dependencies`
    - `npm run check:docs`
    - `npm run check:file-size`
    - `npm run test:static`
    - `npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure`
    - `npm run test:inventory:coverage -- --coverage.reportOnFailure`
    - `npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts`
    - `npm exec -- playwright test --config apps/office/playwright.config.ts`
    - `npm exec -- tsx scripts/generate-writer-ui-resources.ts --check`
    - `npm run check:source-tree`
    - `npm run check:source-provenance`
    - `npm run inventory:invariants`
    - `npm run inventory:parity`
    - `ap doctor`
    - `node .agentplane/policy/check-routing.mjs`

    Owned literal native-node projection,mounted cell/body and Chromium format/list/history/ODT contracts. ONE absent full profile,exact failed/new-only closure,no passing replay. Both first countmaps retained only in ignored appcache. All244states/defaults/exceptions remain unchanged.
  Verification: "Pending implementation and validation."
  Rollback Plan: "Revert the semantic leaf commit without history rewriting."
  Findings: "Iteration139 preflight clean main beae94174aaffd5afdb6121f2d8718069a7976dc,direct,only parent active;previous138 classified verified progress DONE. Four matched policies loaded,user-instructions absent. Actual cell renderer still independently reads font/height/weight/posture/spacing and text runs,omits paragraph alignment,common direct/inherited style/color/indent and native list label display. WriterViewProjection already projects all connected text and actual native GetListLabel values,so no new core projection is needed. Pinned tabfrm.cxx5804/5817 SwCellFrame inserts native cell content through InsertCnt_;frmtool.cxx1622 chooses MakeTextFrame;txtfrm.cxx762/916 constructs the ordinary SwTextFrame for the node;itrcrsr.cxx uses common paragraph/list margins with table-specific guards. This is a concrete shared text-display owner gap,not a claim of full native table layout equivalence. Standing user goal and explicit UI/list/table instruction authorize safe local correction. Preserve all244 semantic states/defaults/exceptions and registered I/O/recovery decisions."
id_source: "generated"
---
## Summary

Share Writer paragraph rendering between body text and table cells.

## Scope

- apps/office/src/sw/browser/editor/WriterEditableParagraph.tsx
- apps/office/src/sw/browser/editor/WriterEditableTable.tsx
- apps/office/src/sw/browser/editor/WriterPlainTextEditor.tsx
- apps/office/src/sw/browser/presentation/WriterTableDialog.test.tsx
- apps/office/src/sw/browser/editor/cell-paragraph-rendering.test.tsx
- apps/office/e2e/writer-cell-paragraph-format.spec.ts
- docs/program/source-provenance.json
- docs/program/parity/runtime-inventory.json

## Plan

Use one browser paragraph renderer and one immutable native-node projection for body and cell text,matching pinned SwCellFrame -> InsertCnt_ -> MakeTextFrame -> SwTextFrame ownership. Remove WriterEditableTableCell's partial attribute/font/spacing/readTextRuns assembly and synthetic node-index identity fallback. Require table paragraph projections keyed by actual SwNodes index;build the shared map once in WriterPlainTextEditor and pass the same values to visible and closed-shadow measurement tables. Reuse WriterEditableParagraph for actual effective alignment,style,color/highlight,font,indent and native node.GetListLabel/list-layout display,without editable DTO round-trip or React list numbering/history logic. Add only structural cell position/explicit editable-island/spacing context to the common paragraph;use native stable paragraph IDs for unique accessibility descriptions and React keys,retain empty-cell caret and shared DOM selection registration. Keep body fragment/layout/line-number contracts and existing shell edits unchanged. Independent owned projection/mounted and Chromium cases check literal alignment,signed/manual or automatic first-line values,supported list labels/level geometry,style and text colors,font runs,neighbor/body isolation,actual native model/history and ODT reopen;visible and measurement rendering share values. First-static observed old standalone table-prop fixtures receive required projection-map plumbing only,all prior assertions retained unless an exact first-profile source contradiction is observed. Three existing runtime rows receive bounded notes/evidence only;all244states/defaults/exceptions unchanged,no promotion/newmodule. Table-wide Home/navigation/selection,merged/nested cell/native table text-frame pagination/spacing collapse,full portion engine and list structural operations remain unverified,next leaves. Six static gates first;ONE sequential full build/app/inventory/scripts/Chromium profile with vendor renamed inside repository in try/finally and reportOnFailure;persist exact failed/error-causing names before collector assertions,both first coverage JSON countmaps only ignored appcache. Repeat failed/new-unexecuted cases only,zero passing replay;restore before five source audits. Scope/native hashes,exact-SHA same-actor readonly quality,doctor/routing,CODER Verification beforeverify and canonicalfinish. No network/outside/global/subagents/Agentplane sources/helpers/Python/probes/rawdiagnostics;oneleaf139 only,goalactive.

## Verify Steps

- `npm run format:check`
- `npm run lint`
- `npm run typecheck`
- `npm run check:dependencies`
- `npm run check:docs`
- `npm run check:file-size`
- `npm run test:static`
- `npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure`
- `npm run test:inventory:coverage -- --coverage.reportOnFailure`
- `npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts`
- `npm exec -- playwright test --config apps/office/playwright.config.ts`
- `npm exec -- tsx scripts/generate-writer-ui-resources.ts --check`
- `npm run check:source-tree`
- `npm run check:source-provenance`
- `npm run inventory:invariants`
- `npm run inventory:parity`
- `ap doctor`
- `node .agentplane/policy/check-routing.mjs`

Owned literal native-node projection,mounted cell/body and Chromium format/list/history/ODT contracts. ONE absent full profile,exact failed/new-only closure,no passing replay. Both first countmaps retained only in ignored appcache. All244states/defaults/exceptions remain unchanged.

## Verification

Pending implementation and validation.

## Rollback Plan

Revert the semantic leaf commit without history rewriting.

## Findings

Iteration139 preflight clean main beae94174aaffd5afdb6121f2d8718069a7976dc,direct,only parent active;previous138 classified verified progress DONE. Four matched policies loaded,user-instructions absent. Actual cell renderer still independently reads font/height/weight/posture/spacing and text runs,omits paragraph alignment,common direct/inherited style/color/indent and native list label display. WriterViewProjection already projects all connected text and actual native GetListLabel values,so no new core projection is needed. Pinned tabfrm.cxx5804/5817 SwCellFrame inserts native cell content through InsertCnt_;frmtool.cxx1622 chooses MakeTextFrame;txtfrm.cxx762/916 constructs the ordinary SwTextFrame for the node;itrcrsr.cxx uses common paragraph/list margins with table-specific guards. This is a concrete shared text-display owner gap,not a claim of full native table layout equivalence. Standing user goal and explicit UI/list/table instruction authorize safe local correction. Preserve all244 semantic states/defaults/exceptions and registered I/O/recovery decisions.
