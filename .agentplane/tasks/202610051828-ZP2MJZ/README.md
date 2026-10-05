---
id: "202610051828-ZP2MJZ"
title: "Resolve formatting history through current native coordinates"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 13
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "parity"
  - "undo"
task_kind: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-05T18:28:22.043Z"
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
    body: "Start: native formatting coordinate ownership migration under standing iterative authorization."
events:
  -
    type: "status"
    at: "2026-10-05T18:28:23.314Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: native formatting coordinate ownership migration under standing iterative authorization."
doc_version: 3
doc_updated_at: "2026-10-05T18:44:29.510Z"
doc_updated_by: "CODER"
description: "Iteration159 migrate formatting/reset/style history node ownership to native numeric targets and range replay; remove retained paragraph identities blocking native split ownership migration."
sections:
  Summary: "Resolve formatting undo through current native numeric coordinates, removing stale paragraph-object payload ownership."
  Scope: |-
    apps/office/src/sw/source/core/undo/unattr.ts
    apps/office/src/sw/source/core/undo/unfmco.ts
    apps/office/src/sw/source/core/undo/native-format-node-index.test.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
  Plan: "Iteration159 remove retained paragraph-object identities from represented direct character/paragraph item/alignment/margin/reset and style collection history. Pinned unattr.cxx SwUndoAttr/SwUndoResetAttr use numeric SwUndRng coordinates and current undo document; unfmco.cxx uses SwUndRng for redo and numeric native SwHistory for rollback. Retain existing current portable fragment/item/hint snapshots and named-style/direct-item/emptylist rollback contracts, payload sizes/comments/defaults and foreign-document guards; full native SwHistory/attribute payload machinery still unverified. Resolve each direct action via saved numeric node index and original document ownership boundary, ResetAttr owns numeric range/native indices and transient current nodes for ApplyExact/Undo/Redo, FormatColl owns numeric capture entries and SwUndRng, named Redo reconstructs current native PaM/current inclusive text nodes. No new adapter/helper/shared module/DTO/TextRuns fallback. Five scopepaths/additive2owners,411prior testfiles byte-identical and250states/defaults/classifications/exceptions/prior evidence preserved. New actual body/cell section-preserving replacement and persistent shell history cases for each represented action,style composite/reset and ordered/reversed/collapsed boundaries,cursor/pending/neighbor/independent payload contracts. Six statics first; ONEupstream-absent build/app/inventory/scripts/Chromium profile, exactfailures/errors before assertions and failed/new-only remediation/no passing replay/skipped=skipped,repository vendor rename try/finally restore before5source audits. Actual app/inventory100%L/S/F/B, maps and optional initial local source variants only ignored appcache; AP bounded Englishcounts/hashes/prose/exactnames/outcomes only,no upstreamcopies/helpers/Python/probes/binaries/rawdiffs/sourceframes/diagnostics. Exact semantic SHA same-agent EVALUATOR pass,recordedverify/canonical meaningfulfinish/parentcheckpoint clean main. Standing iterativeuserauthorization applies,no network/outside/global/subagents. Full history/payload/native split physical ownership/other actions/broad UI parity remainopen,goalactive,no broadpromotion."
  Verify Steps: |-
    1. Six statics first: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Only failed gates/changed-file remediation repeated.
    2. ONE sequential upstream-absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Vendor rename in repository try/finally restore before source audits; tests never invoke/access upstream. Persist exact failures/errors before assertions, failed/new-only repeats, skipped=skipped. Actual app/inventory L/S/F/B100%; maps only ignored appcache.
    3. New native formatting-index cases prove each represented character/item/alignment/margin/reset/style action and real composite style history targets current body/cell native slots after repeated physical replacement; current inclusive range and original cursor direction/pending state, independent retained values and untouched neighbor.411prior testfiles byte-identical/250states/defaults/classifications/exceptions/prior evidence preserved;5paths/additive2owners only. No full native SwHistory/attribute payload/split/UI promotion.
    4. After restoration: npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. Scope/prior tests/defaults/APartifact audit,doctor/routing, same-agent explicit EVALUATOR exact semantic SHApass,recordedverify/meaningfulfinish/parentcheckpoint clean main.
  Verification: "Command:6static gates (onlyfailedlint repeated),ONEfull upstream-absent build/app/inventory/scripts/Chromium,original4failed-only case closure,changed-file statics,5restored source audits,scope/AP/doctor/routing. Result:pass after newfixture correction only. Evidence:12316distinctapp/109inventory/5scripts/120Chromium exact finalproduction;45new/411prior unchanged/250records preserved;actual100%app/inventory L/S/F/B;sourcehashes unchanged since fullprofile. Scope:5paths/2owners represented numeric formatting/reset/style ownership;fullnative payload/SwHistory/split/UI parity unverified. Same-agent EVALUATOR exactsemanticSHA review pending."
  Rollback Plan: "Revert only intentional semantic implementation commit in a separately authorized follow-up task; preserve lifecycle history and registered exceptions."
  Findings: |-
    Iteration159 source-confirmed represented formatting history ownership now resolves current numeric native nodes. SwUndoAttr, SwUndoParagraphItem, SwUndoParagraphFormat and SwUndoMoveLeftMargin capture numeric node indices; existing original document/foreign-context boundary remains explicit through retained document and existing GetUndoTextNode. SwUndoResetAttr records numeric range/entry indices, recaptures current native hint owners at ApplyExact, reconstructs SwUndRng/PaM/current inclusive nodes for non-exact redo. SwUndoFormatColl records numeric rollback entries and native SwUndRng; named redo reconstructs current range/nodes rather than retaining old paragraph list. All temporary replay PaMs/positions disposed finally. No new adapter/helper/sharedmodule/DTO/TextRuns/stale node fallback. Existing comments/payload sizes/defaults and portable fragment/directitem/fullhint/style identifier snapshots preserved; complete native SwHistory/client/delta/attribute payload/base document ownership still unverified. Pinned unattr SwUndoAttr/ResetAttr range constructors/Undo/Redo and unfmco SwUndRng/name/DoSetFormatColl inspected. Full native payload migration deferred, not fullmodulepromotion.
    Evidence:45new distinct actual native body/cell section-preserving replacements/direct and real shell composite/standalone style/reset histories,3cycles replacement before replay,collapsed/forward/reversed cursor/content and pendingitems,character native fragment snapshot independence/direct and inheriteditem branches/alignment/margin,exactreset current recapture/nohints/default nonexactredo,namedstyle disappearance still independent reset,foreigndocument guards,unselectedneighbors.411prior testfiles byte-identical;250states/defaults/classifications/exceptions/prior evidence preserved;5scopepaths/additive2existingowners.
    Six staticgates pass:initialformat once,initiallint failed only newKind alias missing JSDoc,comment added and failedlint only repeated;remainingtype/dependencies/docs/filesize executed once. Newtest changed-format and5changed-file Prettier/ESLint/JSDoc/actual no-emittsconfig/1000line checks pass. ONEfull upstream-absent profile:buildpass,12312app pass4fail/12316in315files,109inventory/36files100%,5scripts/2files,120Chromium pass exact final production. Exact4failed names persisted beforeassertions; all are newcollapsed composite style cases body/cells ×resetAll false/true. Fixture CopyTo builds fresh native attributes with constructor flags, so it changed unselected neighbor flags while test intended state-preserving node replacement. Corrected replacement hint copy to same-pool clone, assertions preserved,production unchanged. Onlyoriginal4failedcases retried4pass0fail41skipped;41initialnewpasses/allprior passes/inventory/Chromium/build/fullprofile not replayed.
    Actual final app/inventory100%L/S/F/B:app12386lines/13558statements/3374functions/10070branches;inventory1464/1523/384/1080. Actual initial/failed-only counters merged only after identical statement/function/branch location maps and unchanged productionSHA unattr a74074921c7655a1f78d2fc0c4de3ea393bf6023ff1aaaafb947e9fff195fb9d,unfmco125b4e478767cc1dbc83eab3bf2c9ec662cb8c751c0640cdc3d8762378fb53ee. No changed-source counter transfer/fabrication. Maps/results onlyignored appcache.5restoredsource audits pass0semanticviolations. APignoredinclusive scan4271files0forbidden/doctor0errors2oldwarnings/routingOK. Vendor restoredfinally afterbothabsent profiles;no network/outside/global/subagents/upstreamcopies/helpers/Python/probes/binaries/rawdiffs/sourceframes/diagnostics inAP. Inline edit assertion caught stale replacement string beforefilewrite,route recomputed and corrected inline safely,no partial sourcewrite.
    Limits:represented numeric target/range ownership only. Wholecharacter fragments still replay through ReplaceUndoRange rather than full native attribute-only m_AttrSet/SwHistory machinery; directitem/fullhint/style identifier snapshots and originaldocguard adjuncts remain portable contracts. Fullnative SwHistory/SwRegHistory/registered item/text deltas/reset-range/conditionalcollection/undoarea/redline/client/frame semantics stillopen. Other list/deletion action pointers, retained split trailing bridge and native freshprefix/originalsuffix physicalownership remainopen. Broad UI/list/table merged/nested/protected/layout/clipboard/rendering behavior unverified;conscious save/open/recovery deviations preserved,parentDOING/goalactive,no broad/fullmodulepromotion.
id_source: "generated"
---
## Summary

Resolve formatting undo through current native numeric coordinates, removing stale paragraph-object payload ownership.

## Scope

apps/office/src/sw/source/core/undo/unattr.ts
apps/office/src/sw/source/core/undo/unfmco.ts
apps/office/src/sw/source/core/undo/native-format-node-index.test.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json

## Plan

Iteration159 remove retained paragraph-object identities from represented direct character/paragraph item/alignment/margin/reset and style collection history. Pinned unattr.cxx SwUndoAttr/SwUndoResetAttr use numeric SwUndRng coordinates and current undo document; unfmco.cxx uses SwUndRng for redo and numeric native SwHistory for rollback. Retain existing current portable fragment/item/hint snapshots and named-style/direct-item/emptylist rollback contracts, payload sizes/comments/defaults and foreign-document guards; full native SwHistory/attribute payload machinery still unverified. Resolve each direct action via saved numeric node index and original document ownership boundary, ResetAttr owns numeric range/native indices and transient current nodes for ApplyExact/Undo/Redo, FormatColl owns numeric capture entries and SwUndRng, named Redo reconstructs current native PaM/current inclusive text nodes. No new adapter/helper/shared module/DTO/TextRuns fallback. Five scopepaths/additive2owners,411prior testfiles byte-identical and250states/defaults/classifications/exceptions/prior evidence preserved. New actual body/cell section-preserving replacement and persistent shell history cases for each represented action,style composite/reset and ordered/reversed/collapsed boundaries,cursor/pending/neighbor/independent payload contracts. Six statics first; ONEupstream-absent build/app/inventory/scripts/Chromium profile, exactfailures/errors before assertions and failed/new-only remediation/no passing replay/skipped=skipped,repository vendor rename try/finally restore before5source audits. Actual app/inventory100%L/S/F/B, maps and optional initial local source variants only ignored appcache; AP bounded Englishcounts/hashes/prose/exactnames/outcomes only,no upstreamcopies/helpers/Python/probes/binaries/rawdiffs/sourceframes/diagnostics. Exact semantic SHA same-agent EVALUATOR pass,recordedverify/canonical meaningfulfinish/parentcheckpoint clean main. Standing iterativeuserauthorization applies,no network/outside/global/subagents. Full history/payload/native split physical ownership/other actions/broad UI parity remainopen,goalactive,no broadpromotion.

## Verify Steps

1. Six statics first: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Only failed gates/changed-file remediation repeated.
2. ONE sequential upstream-absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Vendor rename in repository try/finally restore before source audits; tests never invoke/access upstream. Persist exact failures/errors before assertions, failed/new-only repeats, skipped=skipped. Actual app/inventory L/S/F/B100%; maps only ignored appcache.
3. New native formatting-index cases prove each represented character/item/alignment/margin/reset/style action and real composite style history targets current body/cell native slots after repeated physical replacement; current inclusive range and original cursor direction/pending state, independent retained values and untouched neighbor.411prior testfiles byte-identical/250states/defaults/classifications/exceptions/prior evidence preserved;5paths/additive2owners only. No full native SwHistory/attribute payload/split/UI promotion.
4. After restoration: npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. Scope/prior tests/defaults/APartifact audit,doctor/routing, same-agent explicit EVALUATOR exact semantic SHApass,recordedverify/meaningfulfinish/parentcheckpoint clean main.

## Verification

Command:6static gates (onlyfailedlint repeated),ONEfull upstream-absent build/app/inventory/scripts/Chromium,original4failed-only case closure,changed-file statics,5restored source audits,scope/AP/doctor/routing. Result:pass after newfixture correction only. Evidence:12316distinctapp/109inventory/5scripts/120Chromium exact finalproduction;45new/411prior unchanged/250records preserved;actual100%app/inventory L/S/F/B;sourcehashes unchanged since fullprofile. Scope:5paths/2owners represented numeric formatting/reset/style ownership;fullnative payload/SwHistory/split/UI parity unverified. Same-agent EVALUATOR exactsemanticSHA review pending.

## Rollback Plan

Revert only intentional semantic implementation commit in a separately authorized follow-up task; preserve lifecycle history and registered exceptions.

## Findings

Iteration159 source-confirmed represented formatting history ownership now resolves current numeric native nodes. SwUndoAttr, SwUndoParagraphItem, SwUndoParagraphFormat and SwUndoMoveLeftMargin capture numeric node indices; existing original document/foreign-context boundary remains explicit through retained document and existing GetUndoTextNode. SwUndoResetAttr records numeric range/entry indices, recaptures current native hint owners at ApplyExact, reconstructs SwUndRng/PaM/current inclusive nodes for non-exact redo. SwUndoFormatColl records numeric rollback entries and native SwUndRng; named redo reconstructs current range/nodes rather than retaining old paragraph list. All temporary replay PaMs/positions disposed finally. No new adapter/helper/sharedmodule/DTO/TextRuns/stale node fallback. Existing comments/payload sizes/defaults and portable fragment/directitem/fullhint/style identifier snapshots preserved; complete native SwHistory/client/delta/attribute payload/base document ownership still unverified. Pinned unattr SwUndoAttr/ResetAttr range constructors/Undo/Redo and unfmco SwUndRng/name/DoSetFormatColl inspected. Full native payload migration deferred, not fullmodulepromotion.
Evidence:45new distinct actual native body/cell section-preserving replacements/direct and real shell composite/standalone style/reset histories,3cycles replacement before replay,collapsed/forward/reversed cursor/content and pendingitems,character native fragment snapshot independence/direct and inheriteditem branches/alignment/margin,exactreset current recapture/nohints/default nonexactredo,namedstyle disappearance still independent reset,foreigndocument guards,unselectedneighbors.411prior testfiles byte-identical;250states/defaults/classifications/exceptions/prior evidence preserved;5scopepaths/additive2existingowners.
Six staticgates pass:initialformat once,initiallint failed only newKind alias missing JSDoc,comment added and failedlint only repeated;remainingtype/dependencies/docs/filesize executed once. Newtest changed-format and5changed-file Prettier/ESLint/JSDoc/actual no-emittsconfig/1000line checks pass. ONEfull upstream-absent profile:buildpass,12312app pass4fail/12316in315files,109inventory/36files100%,5scripts/2files,120Chromium pass exact final production. Exact4failed names persisted beforeassertions; all are newcollapsed composite style cases body/cells ×resetAll false/true. Fixture CopyTo builds fresh native attributes with constructor flags, so it changed unselected neighbor flags while test intended state-preserving node replacement. Corrected replacement hint copy to same-pool clone, assertions preserved,production unchanged. Onlyoriginal4failedcases retried4pass0fail41skipped;41initialnewpasses/allprior passes/inventory/Chromium/build/fullprofile not replayed.
Actual final app/inventory100%L/S/F/B:app12386lines/13558statements/3374functions/10070branches;inventory1464/1523/384/1080. Actual initial/failed-only counters merged only after identical statement/function/branch location maps and unchanged productionSHA unattr a74074921c7655a1f78d2fc0c4de3ea393bf6023ff1aaaafb947e9fff195fb9d,unfmco125b4e478767cc1dbc83eab3bf2c9ec662cb8c751c0640cdc3d8762378fb53ee. No changed-source counter transfer/fabrication. Maps/results onlyignored appcache.5restoredsource audits pass0semanticviolations. APignoredinclusive scan4271files0forbidden/doctor0errors2oldwarnings/routingOK. Vendor restoredfinally afterbothabsent profiles;no network/outside/global/subagents/upstreamcopies/helpers/Python/probes/binaries/rawdiffs/sourceframes/diagnostics inAP. Inline edit assertion caught stale replacement string beforefilewrite,route recomputed and corrected inline safely,no partial sourcewrite.
Limits:represented numeric target/range ownership only. Wholecharacter fragments still replay through ReplaceUndoRange rather than full native attribute-only m_AttrSet/SwHistory machinery; directitem/fullhint/style identifier snapshots and originaldocguard adjuncts remain portable contracts. Fullnative SwHistory/SwRegHistory/registered item/text deltas/reset-range/conditionalcollection/undoarea/redline/client/frame semantics stillopen. Other list/deletion action pointers, retained split trailing bridge and native freshprefix/originalsuffix physicalownership remainopen. Broad UI/list/table merged/nested/protected/layout/clipboard/rendering behavior unverified;conscious save/open/recovery deviations preserved,parentDOING/goalactive,no broad/fullmodulepromotion.
