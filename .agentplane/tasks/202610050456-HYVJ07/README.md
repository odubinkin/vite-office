---
id: "202610050456-HYVJ07"
title: "Route table cell editing through the persistent Writer shell"
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
  updated_at: "2026-10-05T05:19:22.349Z"
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
    body: "Start: use standing goal/user UI approval to remove cell DOM-diff bypass and connect real cell nodes to the persistent Writer cursor/input/history;preserve registered deviations and all244 semantic statuses. One full absent profile,failed-only closure."
  -
    author: "CODER"
    body: "Start: close observed connected-cell section and formatting failures in the existing approved UI editing scope."
events:
  -
    type: "status"
    at: "2026-10-05T04:58:22.150Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: use standing goal/user UI approval to remove cell DOM-diff bypass and connect real cell nodes to the persistent Writer cursor/input/history;preserve registered deviations and all244 semantic statuses. One full absent profile,failed-only closure."
  -
    type: "status"
    at: "2026-10-05T05:19:22.938Z"
    author: "CODER"
    from: "DOING"
    to: "DOING"
    note: "Start: close observed connected-cell section and formatting failures in the existing approved UI editing scope."
doc_version: 3
doc_updated_at: "2026-10-05T05:19:22.938Z"
doc_updated_by: "CODER"
description: "Remove browser cell DOM-diff/direct mutation and input bypass, use canonical Writer cursor/input/Undo owners, and derive cell paragraphs from SwNodes sections."
sections:
  Summary: "Route table cell editing through the persistent Writer shell."
  Scope: |-
    - apps/office/src/sw/browser/editor/WriterEditableTable.tsx
    - apps/office/src/sw/browser/editor/WriterPlainTextEditor.tsx
    - apps/office/src/sw/browser/editor/browser-writer-edit-window.ts
    - apps/office/src/sw/browser/presentation/writer-view-projection.ts
    - apps/office/src/sw/browser/presentation/writer-view.tsx
    - apps/office/src/sw/source/uibase/docvw/edtwin.ts
    - apps/office/src/sw/source/core/table/swtable.ts
    - apps/office/src/sw/source/core/docnode/nodes.ts
    - apps/office/src/sw/source/uibase/wrtsh/wrtsh-editing.ts
    - apps/office/src/sw/browser/presentation/WriterTableDialog.test.tsx
    - apps/office/src/sw/browser/editor/native-table-editing.test.tsx
    - apps/office/src/sw/source/uibase/wrtsh/native-table-editing.test.ts
    - apps/office/e2e/writer-native-table-editing.spec.ts
    - docs/program/source-provenance.json
    - docs/program/parity/runtime-inventory.json
    - apps/office/src/sw/source/core/crsr/pam.ts
    - apps/office/src/sw/browser/presentation/writer-view.test.tsx
    - apps/office/src/sw/browser/editor/browser-writer-edit-window.test.ts
  Plan: "Remove table-cell post-DOM text diff/direct node mutation,renderToStaticMarkup/innerHTML synchronization and event isolation. Render cell text declaratively with canonical paragraph/node/content metadata and register cell paragraphs in the existing browser selection registry;route table beforeinput/composition/cut/paste/format/history through the single BrowserWriterEditWindow->SwEditWin->SwWrtShell path. Keep one necessary DOM event/selection platform adapter. Admit connected cell text in SwEditWin by actual SwNodes owner rather than body-only projection. Project active cell and all connected text identities from real nodes,retain body-only paragraph/layout list separately;feed those identities to table rendering without editable model DTO round-trip. Derive SwTableBox text paragraphs from its start/end SwNodes section,remove duplicate cached paragraph array/AddParagraph calls. Use real adjacent text nodes in the same section for Backspace/Delete paragraph joins,prevent joins across cell/table sentinels. Preserve native existing text attributes,selected insertion modes/grouping,UndoRedo/model notifications and ODT table serialization. Tests independently exercise same-cell typed/replacement/ranged deletion,Enter/within-cell join,composition,formatting,UndoRedo,cursor ownership,body/neighbor isolation,section guards and mounted input/Chromium persistence. Existing obsolete direct cell-diff test will migrate after its first static import failure;other prior expectations unchanged unless exact first-profile observed source contradiction. Native table-wide selection/navigation/merged cells/full layout/text portion render/list UI remain unverified and next dependent tasks;no new unsupported operation claim or semantic status promotion. All244 existing states/defaults/exceptions and registered I/O/recovery deviations unchanged;bounded evidence/notes only. Six static gates first;one full sequential absent build/app/inventory/scripts/Chromium profile with reportOnFailure and JSON counts copied to ignored repository app cache for both coverages;immediate exact failed-name persistence before collector assertions. Repeat failed/new-unexecuted cases only,zero passing replay;restore in finally before five source audits and scope/nativehash/exactSHA same-actor readonly quality/doctor/routing/CODER verify/canonical finish. No Agentplane sources/helpers/Python/probes/rawdiagnostics,no network/outside/global/subagents. One leaf138 per turn;full goal active. First absent profile observes6 failed cases plus an uncaught error in the old cell-bypass case and1 new Chromium failure;exact names persisted before collection assertions. Finish the same connected-cell input contract by using actual same-section text in SwNodes.removeTextNode and actual SwNodes-span text ranges in SwPaM,retaining nonempty section and sentinel isolation guards. Add pam.ts and the two exact observed legacy test paths to scope;adapt only the old post-DOM cell edit and bypass expectation to actual beforeinput,all other prior assertions retained. This is necessary completion of approved same-cell split/join/format/history,not wider table navigation/layout. Focused changed-source statics and failed-only coverage/Chromium closure follow;never replay passing full suites or the full static build. Regenerate only modified browser assets for the failed Chromium case."
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

    Independent core/mounted/Chromium table cursor/input/history contracts;one absent full profile,failed-only closure,no passing replay. Both first coverage count maps remain only in ignored app cache. All244 existing statuses/defaults/exceptions preserved.
  Verification: "Pending implementation and validation."
  Rollback Plan: "Revert semantic leaf commit without history rewriting."
  Findings: "Iteration138 previous137 verified progress DONE,clean main fe80a59b9d37a21c99b91f47968eb52213adacac,direct,only parent active. Four matched policies loaded,user-instructions absent. User prioritizes upstream UI/list/table behavior and removal of unnecessary layers. Current cell independently changes DOM then editWriterTableCell diffs text and directly erases/inserts SwTextNode;controller bypasses table beforeinput and cell suppresses key/paste/pointer propagation,selection restoration skips table focus. SwEditWin rejects cell nodes through body-only paragraph membership. SwTableBox duplicates paragraph ownership in an array,so native Split/Join history cannot update it. Upstream edtwin.cxx FlushInBuffer calls actual SwWrtShell Insert at1072;wrtsh1.cxx241 native selection->DelRight->Insert2 uses common cursor/history,without cell DOM diff. swtable.cxx135/1801 cell text/ranges come from GetSttNd native section nodes;docedt.cxx joins adjacent same-section content. These are the executable owner/path discrepancies,not cosmetic DTO renaming. Existing244 runtime statuses/defaults/exceptions and registered I/O deviations preserved. Full rendering/native portions/table navigation/selection/merged cells/list UI remain unverified. First absent profile: build pass,11862 app cases pass/6 fail with two uncaught errors,app100%allfour,inventory109pass100%allfour,scripts5pass,Chromium99pass/1fail. Observed body-only SwNodes.removeTextNode blocks cell split undo/join;getWriterSelectedTextRanges excludes cell formatting. Legacy writer-view cell post-DOM edit and browser-window bypass reflect the removed adapter;the latter unbound method causes uncaught error. Scope addition remains same approved connected-cell input/history contract;no full suites replay."
id_source: "generated"
---
## Summary

Route table cell editing through the persistent Writer shell.

## Scope

- apps/office/src/sw/browser/editor/WriterEditableTable.tsx
- apps/office/src/sw/browser/editor/WriterPlainTextEditor.tsx
- apps/office/src/sw/browser/editor/browser-writer-edit-window.ts
- apps/office/src/sw/browser/presentation/writer-view-projection.ts
- apps/office/src/sw/browser/presentation/writer-view.tsx
- apps/office/src/sw/source/uibase/docvw/edtwin.ts
- apps/office/src/sw/source/core/table/swtable.ts
- apps/office/src/sw/source/core/docnode/nodes.ts
- apps/office/src/sw/source/uibase/wrtsh/wrtsh-editing.ts
- apps/office/src/sw/browser/presentation/WriterTableDialog.test.tsx
- apps/office/src/sw/browser/editor/native-table-editing.test.tsx
- apps/office/src/sw/source/uibase/wrtsh/native-table-editing.test.ts
- apps/office/e2e/writer-native-table-editing.spec.ts
- docs/program/source-provenance.json
- docs/program/parity/runtime-inventory.json
- apps/office/src/sw/source/core/crsr/pam.ts
- apps/office/src/sw/browser/presentation/writer-view.test.tsx
- apps/office/src/sw/browser/editor/browser-writer-edit-window.test.ts

## Plan

Remove table-cell post-DOM text diff/direct node mutation,renderToStaticMarkup/innerHTML synchronization and event isolation. Render cell text declaratively with canonical paragraph/node/content metadata and register cell paragraphs in the existing browser selection registry;route table beforeinput/composition/cut/paste/format/history through the single BrowserWriterEditWindow->SwEditWin->SwWrtShell path. Keep one necessary DOM event/selection platform adapter. Admit connected cell text in SwEditWin by actual SwNodes owner rather than body-only projection. Project active cell and all connected text identities from real nodes,retain body-only paragraph/layout list separately;feed those identities to table rendering without editable model DTO round-trip. Derive SwTableBox text paragraphs from its start/end SwNodes section,remove duplicate cached paragraph array/AddParagraph calls. Use real adjacent text nodes in the same section for Backspace/Delete paragraph joins,prevent joins across cell/table sentinels. Preserve native existing text attributes,selected insertion modes/grouping,UndoRedo/model notifications and ODT table serialization. Tests independently exercise same-cell typed/replacement/ranged deletion,Enter/within-cell join,composition,formatting,UndoRedo,cursor ownership,body/neighbor isolation,section guards and mounted input/Chromium persistence. Existing obsolete direct cell-diff test will migrate after its first static import failure;other prior expectations unchanged unless exact first-profile observed source contradiction. Native table-wide selection/navigation/merged cells/full layout/text portion render/list UI remain unverified and next dependent tasks;no new unsupported operation claim or semantic status promotion. All244 existing states/defaults/exceptions and registered I/O/recovery deviations unchanged;bounded evidence/notes only. Six static gates first;one full sequential absent build/app/inventory/scripts/Chromium profile with reportOnFailure and JSON counts copied to ignored repository app cache for both coverages;immediate exact failed-name persistence before collector assertions. Repeat failed/new-unexecuted cases only,zero passing replay;restore in finally before five source audits and scope/nativehash/exactSHA same-actor readonly quality/doctor/routing/CODER verify/canonical finish. No Agentplane sources/helpers/Python/probes/rawdiagnostics,no network/outside/global/subagents. One leaf138 per turn;full goal active. First absent profile observes6 failed cases plus an uncaught error in the old cell-bypass case and1 new Chromium failure;exact names persisted before collection assertions. Finish the same connected-cell input contract by using actual same-section text in SwNodes.removeTextNode and actual SwNodes-span text ranges in SwPaM,retaining nonempty section and sentinel isolation guards. Add pam.ts and the two exact observed legacy test paths to scope;adapt only the old post-DOM cell edit and bypass expectation to actual beforeinput,all other prior assertions retained. This is necessary completion of approved same-cell split/join/format/history,not wider table navigation/layout. Focused changed-source statics and failed-only coverage/Chromium closure follow;never replay passing full suites or the full static build. Regenerate only modified browser assets for the failed Chromium case.

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

Independent core/mounted/Chromium table cursor/input/history contracts;one absent full profile,failed-only closure,no passing replay. Both first coverage count maps remain only in ignored app cache. All244 existing statuses/defaults/exceptions preserved.

## Verification

Pending implementation and validation.

## Rollback Plan

Revert semantic leaf commit without history rewriting.

## Findings

Iteration138 previous137 verified progress DONE,clean main fe80a59b9d37a21c99b91f47968eb52213adacac,direct,only parent active. Four matched policies loaded,user-instructions absent. User prioritizes upstream UI/list/table behavior and removal of unnecessary layers. Current cell independently changes DOM then editWriterTableCell diffs text and directly erases/inserts SwTextNode;controller bypasses table beforeinput and cell suppresses key/paste/pointer propagation,selection restoration skips table focus. SwEditWin rejects cell nodes through body-only paragraph membership. SwTableBox duplicates paragraph ownership in an array,so native Split/Join history cannot update it. Upstream edtwin.cxx FlushInBuffer calls actual SwWrtShell Insert at1072;wrtsh1.cxx241 native selection->DelRight->Insert2 uses common cursor/history,without cell DOM diff. swtable.cxx135/1801 cell text/ranges come from GetSttNd native section nodes;docedt.cxx joins adjacent same-section content. These are the executable owner/path discrepancies,not cosmetic DTO renaming. Existing244 runtime statuses/defaults/exceptions and registered I/O deviations preserved. Full rendering/native portions/table navigation/selection/merged cells/list UI remain unverified. First absent profile: build pass,11862 app cases pass/6 fail with two uncaught errors,app100%allfour,inventory109pass100%allfour,scripts5pass,Chromium99pass/1fail. Observed body-only SwNodes.removeTextNode blocks cell split undo/join;getWriterSelectedTextRanges excludes cell formatting. Legacy writer-view cell post-DOM edit and browser-window bypass reflect the removed adapter;the latter unbound method causes uncaught error. Scope addition remains same approved connected-cell input/history contract;no full suites replay.
