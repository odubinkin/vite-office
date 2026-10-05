---
id: "202610050616-VQX14V"
title: "Use native node ranges and delta undo for Writer list levels"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-05T06:35:39.505Z"
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
    body: "Start: replace body-only list-level traversal and full-list snapshots with actual document node-range mutation and native range/direction undo;verify bounded cell/body behavior with one absent profile."
events:
  -
    type: "status"
    at: "2026-10-05T06:18:30.233Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: replace body-only list-level traversal and full-list snapshots with actual document node-range mutation and native range/direction undo;verify bounded cell/body behavior with one absent profile."
doc_version: 3
doc_updated_at: "2026-10-05T06:42:19.472Z"
doc_updated_by: "CODER"
description: "Iteration140:replace body-only list-level traversal and whole-list-item snapshot adaptation with document-owned native SwNodes range mutation and one SwUndoNumUpDown range/direction action;verify actual cell/body range eligibility,attributes,history,UI and ODT while preserving registered deviations."
sections:
  Summary: "Use native node ranges and delta undo for Writer list levels."
  Scope: |-
    - apps/office/src/sw/source/core/doc/doc.ts
    - apps/office/src/sw/source/core/edit/ednumber.ts
    - apps/office/src/sw/source/core/undo/unnum.ts
    - apps/office/src/sw/source/core/doc/native-list-level-range.test.ts
    - apps/office/src/sw/browser/editor/native-cell-list-level.test.tsx
    - apps/office/e2e/writer-cell-list-level.spec.ts
    - docs/program/source-provenance.json
    - docs/program/parity/runtime-inventory.json
    - apps/office/src/sw/source/core/undo/undobj.test.ts
    - docs/program/parity/writer-command-slice.json
    - docs/program/writer-paragraph-lists.md
  Plan: "Iteration140 one ordinary list-level owner correction. Move represented non-outline NumUpDown range traversal/eligibility and mutation to SwDoc:actual inclusive SwPaM SwNodes coordinates,including cells and structural gaps,GetNumRule rather than display-kind/body array,all-selected native derived-level limits checked before any SetAttrListLevel. Keep current represented outline behavior unpromoted;full native OutlineUpDown/style reassignment,mixed outline,redline/merged props/layout expansion/selection rings remain separate unverified work,not advertised as solved. ednumber becomes shell state/delegation boundary over document query and one action. Replace SwUndoNumLevel whole-list-item snapshots plus grouped per-node actions with native-shaped SwUndoNumUpDown storing one range and signed direction;Undo/Redo reconstruct a PaM and call same document mutation with inverse/forward direction,retain shell cursor protocol,and alter only native level. No list DTO recreation,rule/listID/restart/count/geometry changes or React command decisions. Literal owned actual body/cell/structural and reversed-selection cases prove no partial mutation at0/9,stable rule/ID/other list fields,delta-only history after unrelated direct metadata change,single constant-size undo payload,actual nodes/notifications/cursor and ODT persistence. Mounted and real Chromium verify cell Promote/Demote and indent availability,level/geometry and shell history. Existing undobj class-identity fixture may be updated only after observed firststatic stale import failure;all other old assertions unchanged. Three existing mapped rows receive bounded notes/evidence and exact obsolete->native undo local-symbol replacement only;all244states/defaults/exceptions/classifications unchanged,no newmodule/promotion. Six statics first,ONE sequential full upstream-absent build/app/inventory/scripts/Chromium profile reportOnFailure with exact names persisted before collectors and both first JSON countmaps only ignored appcache;failed/new-only closure,zero passing/fullbuild repeat. Restore finally before five source audits. Scope/native hashes,exact-SHA same-actor readonly quality,doctor/routing,CODER Verification beforeverify/canonicalfinish;clean main,parent/goalactive. No network/outside/global/subagents/Agentplane sources/helpers/Python/native probes/rawdiagnostics. Oneleaf140only. First full absent profile found the mapping's obsolete class SwUndoNumLevel marker;replace that local implementation marker with actual SwUndoNumUpDown only,all mapping statuses/defaults/assertions unchanged. Update existing writer-paragraph-lists history prose and one provenance omitted-name reference to the actual document range/delta owner. Failed new mounted case must use the already implemented native submenu hover gesture;retain all behavioral assertions. App first100fourmetrics,inventory failed CLI marker requires exact one-case replay and actual first+failed unchanged-source countmap merge. No production edit or passing replay."
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

    Owned literal core,mounted cell and real Chromium list-level/history/ODT contracts. ONE absent full profile,exact failed/new-only closure,zero passing replay,both initial countmaps only ignored appcache.
  Verification: "Pending implementation and validation."
  Rollback Plan: "Revert the semantic leaf commit without history rewriting."
  Findings: |-
    Iteration139 classified verified progress DONE;current140 preflight clean main5c36a52c9781ce3e0b0c40aea351995217ebd930,direct,only parent active,user-instructions absent,four matched policies loaded. ednumber.getSelectedListNodes currently filters doc.paragraphs,so actual cell-node list level commands are disabled and ignored. It also recreates full list-item sets and groups node-local SwUndoNumLevel actions,unlike pinned docnum.cxx1846 inclusive native-node NumUpDown all-range validation/SetAttrListLevel and unnum.cxx256 SwUndoNumUpDown range/direction inverse operation. List shell and text indent share this owner,so fixing document range/undo improves both UI paths without another React adapter. Existing heading/outline style promotion is incomplete and not certified by this ordinary-list leaf. Standing user goal and explicit UI/list/table instruction authorize safe local correction;preserve all244states and registered deviations.

    Iteration140 implements actual document-owned inclusive PaM/SwNodes numbering traversal,including cells and structural gaps,validates every selected derived list level before mutation and sets only native level. ednumber no longer filters body paragraphs or recreates whole list item sets. SwUndoNumLevel and per-node SfxListUndoAction grouping removed;one SwUndoNumUpDown retains range and direction,uses same Doc.NumUpDown inverse/forward operation and native Demote/Promote list level labels. Unrelated direct restart/count/rule/listID metadata survives level history;selection direction and constant five-unit range payload retained. Existing shell cursor protocol remains;full OutlineUpDown/style reassignment,mixed outline,merged/redline/layout expansion,selection rings and full native undo lifetime remain unverified. First static new formatting/TestingLibrary exact option and old undo-class import errors corrected;old test changed only two class-identity tokens,all other assertions retained. Two missing new JSDoc callbacks repaired. Six static gates pass;focused modified source/test formatting/lint and last metadata/test/doc checks pass. ONE full absent profile:buildpass,app11891pass/1fail of11892/286files with first100fourmetrics,inventory108pass/1fail of109 with99.59lines/99.6statements/99.21functions/99.9branches,scripts5pass,Chromium102pass including new actual cell list-level/indent/history/ODT case. Exact names persisted before collectors,both first JSON countmaps only ignored appcache. Newapp9cases8firstpass/1failed closure;all native core and multi-cell bindings contracts firstpass. Sole mounted failure used click instead of current submenu hover gesture;native same-menu Chromium passed,gesture fixed with assertions retained. Inventory failure identified obsolete mapping marker class SwUndoNumLevel;only local class marker renamed in existing mapping,docs/one omitted-name reference aligned,no inventory test changes. Exact1app+1inventory replay closes1pass/1skipped and1pass/2skipped,zero passing/fullbuild repeats and no production changes after firstprofile. Firstapp100 retained;actual unchanged-script first+failed countmap merge closesinventory100fourmetrics,no summary substitution. All renames restored in finally before five source audits,allpass/semanticviolations0. Scope369priorfiles368byteidentical;remaining old file differs only obsolete->native undo class name. All244states/defaults/exceptions/classifications unchanged,no newmodule/promotion,six bounded appendices,six native hashes;mapping otherwise byteidentical. Doctor0errors/two unchanged oldwarnings,routingpass,ignored-inclusive AP4019files0forbidden beforequality. Progress only,goalactive. No upstream/AP sources/helpers/Python/rawdiagnostics/probes added. AP persistence request with no remaining changed task artifacts returned E_COMMIT_ALLOW_NO_MATCH;route recomputed direct_execution,no retry/no source scope widening.
id_source: "generated"
---
## Summary

Use native node ranges and delta undo for Writer list levels.

## Scope

- apps/office/src/sw/source/core/doc/doc.ts
- apps/office/src/sw/source/core/edit/ednumber.ts
- apps/office/src/sw/source/core/undo/unnum.ts
- apps/office/src/sw/source/core/doc/native-list-level-range.test.ts
- apps/office/src/sw/browser/editor/native-cell-list-level.test.tsx
- apps/office/e2e/writer-cell-list-level.spec.ts
- docs/program/source-provenance.json
- docs/program/parity/runtime-inventory.json
- apps/office/src/sw/source/core/undo/undobj.test.ts
- docs/program/parity/writer-command-slice.json
- docs/program/writer-paragraph-lists.md

## Plan

Iteration140 one ordinary list-level owner correction. Move represented non-outline NumUpDown range traversal/eligibility and mutation to SwDoc:actual inclusive SwPaM SwNodes coordinates,including cells and structural gaps,GetNumRule rather than display-kind/body array,all-selected native derived-level limits checked before any SetAttrListLevel. Keep current represented outline behavior unpromoted;full native OutlineUpDown/style reassignment,mixed outline,redline/merged props/layout expansion/selection rings remain separate unverified work,not advertised as solved. ednumber becomes shell state/delegation boundary over document query and one action. Replace SwUndoNumLevel whole-list-item snapshots plus grouped per-node actions with native-shaped SwUndoNumUpDown storing one range and signed direction;Undo/Redo reconstruct a PaM and call same document mutation with inverse/forward direction,retain shell cursor protocol,and alter only native level. No list DTO recreation,rule/listID/restart/count/geometry changes or React command decisions. Literal owned actual body/cell/structural and reversed-selection cases prove no partial mutation at0/9,stable rule/ID/other list fields,delta-only history after unrelated direct metadata change,single constant-size undo payload,actual nodes/notifications/cursor and ODT persistence. Mounted and real Chromium verify cell Promote/Demote and indent availability,level/geometry and shell history. Existing undobj class-identity fixture may be updated only after observed firststatic stale import failure;all other old assertions unchanged. Three existing mapped rows receive bounded notes/evidence and exact obsolete->native undo local-symbol replacement only;all244states/defaults/exceptions/classifications unchanged,no newmodule/promotion. Six statics first,ONE sequential full upstream-absent build/app/inventory/scripts/Chromium profile reportOnFailure with exact names persisted before collectors and both first JSON countmaps only ignored appcache;failed/new-only closure,zero passing/fullbuild repeat. Restore finally before five source audits. Scope/native hashes,exact-SHA same-actor readonly quality,doctor/routing,CODER Verification beforeverify/canonicalfinish;clean main,parent/goalactive. No network/outside/global/subagents/Agentplane sources/helpers/Python/native probes/rawdiagnostics. Oneleaf140only. First full absent profile found the mapping's obsolete class SwUndoNumLevel marker;replace that local implementation marker with actual SwUndoNumUpDown only,all mapping statuses/defaults/assertions unchanged. Update existing writer-paragraph-lists history prose and one provenance omitted-name reference to the actual document range/delta owner. Failed new mounted case must use the already implemented native submenu hover gesture;retain all behavioral assertions. App first100fourmetrics,inventory failed CLI marker requires exact one-case replay and actual first+failed unchanged-source countmap merge. No production edit or passing replay.

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

Owned literal core,mounted cell and real Chromium list-level/history/ODT contracts. ONE absent full profile,exact failed/new-only closure,zero passing replay,both initial countmaps only ignored appcache.

## Verification

Pending implementation and validation.

## Rollback Plan

Revert the semantic leaf commit without history rewriting.

## Findings

Iteration139 classified verified progress DONE;current140 preflight clean main5c36a52c9781ce3e0b0c40aea351995217ebd930,direct,only parent active,user-instructions absent,four matched policies loaded. ednumber.getSelectedListNodes currently filters doc.paragraphs,so actual cell-node list level commands are disabled and ignored. It also recreates full list-item sets and groups node-local SwUndoNumLevel actions,unlike pinned docnum.cxx1846 inclusive native-node NumUpDown all-range validation/SetAttrListLevel and unnum.cxx256 SwUndoNumUpDown range/direction inverse operation. List shell and text indent share this owner,so fixing document range/undo improves both UI paths without another React adapter. Existing heading/outline style promotion is incomplete and not certified by this ordinary-list leaf. Standing user goal and explicit UI/list/table instruction authorize safe local correction;preserve all244states and registered deviations.

Iteration140 implements actual document-owned inclusive PaM/SwNodes numbering traversal,including cells and structural gaps,validates every selected derived list level before mutation and sets only native level. ednumber no longer filters body paragraphs or recreates whole list item sets. SwUndoNumLevel and per-node SfxListUndoAction grouping removed;one SwUndoNumUpDown retains range and direction,uses same Doc.NumUpDown inverse/forward operation and native Demote/Promote list level labels. Unrelated direct restart/count/rule/listID metadata survives level history;selection direction and constant five-unit range payload retained. Existing shell cursor protocol remains;full OutlineUpDown/style reassignment,mixed outline,merged/redline/layout expansion,selection rings and full native undo lifetime remain unverified. First static new formatting/TestingLibrary exact option and old undo-class import errors corrected;old test changed only two class-identity tokens,all other assertions retained. Two missing new JSDoc callbacks repaired. Six static gates pass;focused modified source/test formatting/lint and last metadata/test/doc checks pass. ONE full absent profile:buildpass,app11891pass/1fail of11892/286files with first100fourmetrics,inventory108pass/1fail of109 with99.59lines/99.6statements/99.21functions/99.9branches,scripts5pass,Chromium102pass including new actual cell list-level/indent/history/ODT case. Exact names persisted before collectors,both first JSON countmaps only ignored appcache. Newapp9cases8firstpass/1failed closure;all native core and multi-cell bindings contracts firstpass. Sole mounted failure used click instead of current submenu hover gesture;native same-menu Chromium passed,gesture fixed with assertions retained. Inventory failure identified obsolete mapping marker class SwUndoNumLevel;only local class marker renamed in existing mapping,docs/one omitted-name reference aligned,no inventory test changes. Exact1app+1inventory replay closes1pass/1skipped and1pass/2skipped,zero passing/fullbuild repeats and no production changes after firstprofile. Firstapp100 retained;actual unchanged-script first+failed countmap merge closesinventory100fourmetrics,no summary substitution. All renames restored in finally before five source audits,allpass/semanticviolations0. Scope369priorfiles368byteidentical;remaining old file differs only obsolete->native undo class name. All244states/defaults/exceptions/classifications unchanged,no newmodule/promotion,six bounded appendices,six native hashes;mapping otherwise byteidentical. Doctor0errors/two unchanged oldwarnings,routingpass,ignored-inclusive AP4019files0forbidden beforequality. Progress only,goalactive. No upstream/AP sources/helpers/Python/rawdiagnostics/probes added. AP persistence request with no remaining changed task artifacts returned E_COMMIT_ALLOW_NO_MATCH;route recomputed direct_execution,no retry/no source scope widening.
