---
id: "202610050412-SVPVCD"
title: "Restore native cross-node selected deletion and forced insertion"
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
  updated_at: "2026-10-05T04:13:47.586Z"
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
    body: "Start: implement native cross-node raw deletion/history and survivor/forced insertion under standing approved iterative goal;single full absent profile and failed/new-only replays,no sources/helpers in Agentplane."
events:
  -
    type: "status"
    at: "2026-10-05T04:13:48.009Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement native cross-node raw deletion/history and survivor/forced insertion under standing approved iterative goal;single full absent profile and failed/new-only replays,no sources/helpers in Agentplane."
doc_version: 3
doc_updated_at: "2026-10-05T04:13:48.009Z"
doc_updated_by: "CODER"
description: "Replace cross-paragraph fragment-action composition with one SwUndoDelete raw boundary-string/history action, native sw_GetJoinFlags survivor choice and DeleteAndJoin body-text kernel, then forced mode5 selected insertion. Preserve registered document I/O deviations and keep cursor/retained-boundary identity and full native graph/layout responsibilities explicitly unverified."
sections:
  Summary: "Restore native cross-node selected deletion and forced insertion."
  Scope: |-
    - apps/office/src/sw/source/core/doc/docedt.ts
    - apps/office/src/sw/source/core/doc/DocumentContentOperationsManager.ts
    - apps/office/src/sw/source/core/crsr/pam.ts
    - apps/office/src/sw/source/core/undo/undel.ts
    - apps/office/src/sw/source/uibase/wrtsh/wrtsh-editing.ts
    - apps/office/src/sw/source/uibase/wrtsh/native-cross-node-deletion.test.ts
    - docs/program/source-provenance.json
    - docs/program/parity/runtime-inventory.json
  Plan: "Port native sw_GetJoinFlags and sw_JoinText for registered same-section body text nodes in source-owned docedt.ts with actual SwPaM Exchange, native five-pair character preparation and JoinPrev BREAK/PAGEDESC clearing/copy. Add DocumentContentOperationsManager.DeleteAndJoin body-text kernel: normalize join flags, raw EraseText boundary tails/heads,remove intact middle nodes,correct collapsed point,join survivor chosen by source. Extend existing SwUndoDelete rather than introduce an alternative action: optional cross selection,raw m_aSttStr/m_aEndStr,m_bJoinNext,boundary whole-hint/direct-item/live-collection history,retained middle content,Undo raw-string restoration/NOHINTEXPAND plus forward history,Redo same DeleteAndJoin/TmpEnd reset,release retained area on disposal. Existing boundary node identity/cursor-reference and AppendTextNode zero-copy/InsertHint/zero-CopyAttr adapters remain unverified and require subsequent source-owned refactoring;no whole native structural history claim. Replace shell fragment-action list with one SwUndoDelete,normalized native Undo selection orientation;unify marked insertion into DeleteAtCursor result then createWriterInsertTextAction force5 on actual surviving cursor node in one Replace StartUndo/EndUndo notification transaction. Preserve same-node/collapsed/import/paste contracts and registered I/O/recovery deviations. Add literal independent real-owner range/direction/survivor/whole-hint/direct/meta/history/force5/zero-retention/nested/notifications tests;old tests unchanged except exact first-profile source-contradicted cases,document explicitly. Register one new source-owned module whollyunverified,append only bounded mappings/notes,all existing243states/defaults/exceptions preserved. Six static gates first;one sequential full build/appcoverage/inventory/scripts/Chromium while upstream unavailable with finally restore. Export first appcoverage JSON into ignored repository app cache for cumulative coverage merging if only failed/new cases need replay;Agentplane keeps bounded counts/hashes/commands/exactnames/prose only,no sources/helpers/rawdiagnostics. Persist exactfailednames before any assertions after each gate/replay;repeat only failed gates/cases plus newly added unexecuted cases,zero passing replay. Restore before five source audits,scope/nativehash/exactSHA sameactor readonly quality,doctor/routing/CODERverification/canonicalfinish. No network/outside/global/subagents;oneleaf137 only,goalactive."
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

    Literal independent selected cross-node contracts;firstcoverage JSON plus failed/new-case cumulative data,never passingreplays. Source audits only after restore. All existing statuses/defaults/exceptions remain unchanged;newmoduleunverified.
  Verification: "Pending implementation and validation."
  Rollback Plan: "Revert the semantic leaf commit without history rewriting."
  Findings: "Iteration137preflight clean main fa31cccfa1af22bd3320c081a43706c30a314d73,direct,onlyparentactive;136verifiedprogress DONE. Four matched policies loaded,user-instructions absent. Pin26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. Existingcross deletes multiple fragment SwUndoReplace actions then repeatedly joins into firstnode;selectedcross Insert passes falseforce. Native docedt.cxx329 normalizespoint/mark andchooses end survivor whenstart0/endleavessuffix,360joinPrev Break/PageDesc andchar preparation. DocumentContentOperationsManager.cxx4557 flags thenDeleteRangeImpl andJoinText;undel.cxx247 JoinNext flag,455rawfirsttail/endhead+wholeboundaryhints/directsets,269collectionhistory,1043freshhistory,1233TmpEnd reset. Existingcursor/retainedboundaryidentity/AppendTextNodeclone mechanisms remain source gaps and will be explicitly retainedunverified for this bounded body-text deletion correction.136fullcoverage measured99.97 withcumulativeproof only;137firstcoverageJSONwill preserve countmap for instrumented cumulative closure rather than lose payload. No old test edits before first-profile observations."
id_source: "generated"
---
## Summary

Restore native cross-node selected deletion and forced insertion.

## Scope

- apps/office/src/sw/source/core/doc/docedt.ts
- apps/office/src/sw/source/core/doc/DocumentContentOperationsManager.ts
- apps/office/src/sw/source/core/crsr/pam.ts
- apps/office/src/sw/source/core/undo/undel.ts
- apps/office/src/sw/source/uibase/wrtsh/wrtsh-editing.ts
- apps/office/src/sw/source/uibase/wrtsh/native-cross-node-deletion.test.ts
- docs/program/source-provenance.json
- docs/program/parity/runtime-inventory.json

## Plan

Port native sw_GetJoinFlags and sw_JoinText for registered same-section body text nodes in source-owned docedt.ts with actual SwPaM Exchange, native five-pair character preparation and JoinPrev BREAK/PAGEDESC clearing/copy. Add DocumentContentOperationsManager.DeleteAndJoin body-text kernel: normalize join flags, raw EraseText boundary tails/heads,remove intact middle nodes,correct collapsed point,join survivor chosen by source. Extend existing SwUndoDelete rather than introduce an alternative action: optional cross selection,raw m_aSttStr/m_aEndStr,m_bJoinNext,boundary whole-hint/direct-item/live-collection history,retained middle content,Undo raw-string restoration/NOHINTEXPAND plus forward history,Redo same DeleteAndJoin/TmpEnd reset,release retained area on disposal. Existing boundary node identity/cursor-reference and AppendTextNode zero-copy/InsertHint/zero-CopyAttr adapters remain unverified and require subsequent source-owned refactoring;no whole native structural history claim. Replace shell fragment-action list with one SwUndoDelete,normalized native Undo selection orientation;unify marked insertion into DeleteAtCursor result then createWriterInsertTextAction force5 on actual surviving cursor node in one Replace StartUndo/EndUndo notification transaction. Preserve same-node/collapsed/import/paste contracts and registered I/O/recovery deviations. Add literal independent real-owner range/direction/survivor/whole-hint/direct/meta/history/force5/zero-retention/nested/notifications tests;old tests unchanged except exact first-profile source-contradicted cases,document explicitly. Register one new source-owned module whollyunverified,append only bounded mappings/notes,all existing243states/defaults/exceptions preserved. Six static gates first;one sequential full build/appcoverage/inventory/scripts/Chromium while upstream unavailable with finally restore. Export first appcoverage JSON into ignored repository app cache for cumulative coverage merging if only failed/new cases need replay;Agentplane keeps bounded counts/hashes/commands/exactnames/prose only,no sources/helpers/rawdiagnostics. Persist exactfailednames before any assertions after each gate/replay;repeat only failed gates/cases plus newly added unexecuted cases,zero passing replay. Restore before five source audits,scope/nativehash/exactSHA sameactor readonly quality,doctor/routing/CODERverification/canonicalfinish. No network/outside/global/subagents;oneleaf137 only,goalactive.

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

Literal independent selected cross-node contracts;firstcoverage JSON plus failed/new-case cumulative data,never passingreplays. Source audits only after restore. All existing statuses/defaults/exceptions remain unchanged;newmoduleunverified.

## Verification

Pending implementation and validation.

## Rollback Plan

Revert the semantic leaf commit without history rewriting.

## Findings

Iteration137preflight clean main fa31cccfa1af22bd3320c081a43706c30a314d73,direct,onlyparentactive;136verifiedprogress DONE. Four matched policies loaded,user-instructions absent. Pin26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. Existingcross deletes multiple fragment SwUndoReplace actions then repeatedly joins into firstnode;selectedcross Insert passes falseforce. Native docedt.cxx329 normalizespoint/mark andchooses end survivor whenstart0/endleavessuffix,360joinPrev Break/PageDesc andchar preparation. DocumentContentOperationsManager.cxx4557 flags thenDeleteRangeImpl andJoinText;undel.cxx247 JoinNext flag,455rawfirsttail/endhead+wholeboundaryhints/directsets,269collectionhistory,1043freshhistory,1233TmpEnd reset. Existingcursor/retainedboundaryidentity/AppendTextNodeclone mechanisms remain source gaps and will be explicitly retainedunverified for this bounded body-text deletion correction.136fullcoverage measured99.97 withcumulativeproof only;137firstcoverageJSONwill preserve countmap for instrumented cumulative closure rather than lose payload. No old test edits before first-profile observations.
