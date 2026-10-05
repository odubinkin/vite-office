---
id: "202610051742-WTVMYA"
title: "Resolve insertion undo through native node indices"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 15
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "frontend"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-05T17:55:48.073Z"
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
    body: "Start: Implement approved native insertion node-index ownership and actual current body/cell grouping/history tests under standing iterative user authorization. Existing tests/defaults/exceptions untouched; ONE absent profile then restored source audits."
events:
  -
    type: "status"
    at: "2026-10-05T17:43:42.235Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement approved native insertion node-index ownership and actual current body/cell grouping/history tests under standing iterative user authorization. Existing tests/defaults/exceptions untouched; ONE absent profile then restored source audits."
doc_version: 3
doc_updated_at: "2026-10-05T18:01:12.078Z"
doc_updated_by: "CODER"
description: "Iteration157 removes retained paragraph-object target from represented SwUndoInsert, resolving the current native node by m_nNode and native m_rDoc as pinned unins.cxx. Required prerequisite for removing retained split trailing identity bridge. Numeric grouping/current node replacement/body and table shell evidence; existing fragment payload and offset contract unchanged and unverified as full native undo content semantics. Standing iterative UI/refactoring authorization; previous turn156 verified progress, clean main. Four scoped paths;409prior test files unchanged;250states/defaults/exceptions/prior evidence preserved. One absent full profile, only failures/new cases repeated; no upstream source/helper artifacts in AP."
sections:
  Summary: "Remove retained paragraph-object target from represented insertion undo by adopting native numeric node index/document ownership. This prepares later removal of the split identity bridge while preserving actual UI typing behavior."
  Scope: |-
    apps/office/src/sw/source/core/undo/unins.ts
    apps/office/src/sw/source/core/undo/native-insert-node-index.test.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
    apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
    apps/office/src/sw/source/core/edit/eddel.ts
    409prior tests unchanged;250states/defaults/exceptions preserved. Source-confirmed4failed-case integration refinement under standing iterative UI/core authorization.
  Plan: "Iteration157 replace represented SwUndoInsert retained paragraph pointer with pinned native m_nNode plus m_rDoc. unins.cxx constructors102/116 capture index and document; CanGrouping147 compares index/content, Undo227/Redo326 resolve current native nodes. Preserve existing insertion offset/fragment/items/flags/grouping-class behavior; full native maText/MoveToUndoNds/RSID/redline/nontext/append ownership remains unverified. Resolve transient current native target using actual SwNodes at saved index and existing ownership checks; compare document and numeric index for grouping, reconstruct after cursor with native retained document. No new adapter/module/DTO/TextRuns. Four paths (unins,new native-insert-node-index test,provenance,inventory).409prior tests unchanged,250states/defaults/classifications/exceptions/prior evidence preserved, additive unins owner only. Actual body/cell native replacement UndoRedo/grouping and real shell typing tests, default and explicit formatted insertion modes, foreign grouping boundary, independent snapshots/pending items. Six statics first then ONE absent build/app/inventory/scripts/Chromium; all tests never access upstream. Exact failures/errors before assertion, only failed/new cases retried; no passing replay/skipped=skipped. Vendor repository rename try/finally restore before5source audits/scope/AP scan. Actual app/inventory100%L/S/F/B; maps and any initial local source variants only ignored appcache. AP bounded English counts/hashes/outcomes/exact failures only, no upstreamcopies/helpers/Python/nativeprobes/binaries/rawdiffs/sourceframes/diagnostics. Same-agent explicit EVALUATOR exact semantic SHApass then recordedverify/canonical meaningfulfinish/parentcheckpoint clean main; broader goal active. No network/outside/global/subagents. Standing explicit iterative UI/refactoring authorization applies; prior156 verified progress. Other action payload identities and split RestoreSplitTextNode bridge remain open prerequisites, no fullmodule promotion. Integration refinement from original4failures:2new real shell replacement cases expose redundant activeParagraph cache disconnected from persistent cursor; remove entire cached owner and all redundant writes, derive active native paragraph from getShellCursor point, adjust2 immediate pending lookups accordingly.2old selected deletion direction cases reveal prior156 persistent point substitution loses intended reversed/partial endpoint; retain chosen final actual registered SwPosition across sequential mutation and record completed point through existing numeric action API, dispose finally. This preserves native direction/own-cell caret without forecast object substitution or weakened old tests.6scopedpaths, additive2additional existingowners;409prior tests unchanged,250metadata unchanged. Retry only original4failed cases plus one genuinely new shell current cursor lifecycle case, no passing9newcase or120Chromium replay. Source final changed-file statics and actual initial/failed/new-only coverage locations with exact source hashes; final browser initial variant evidence explicitly bounded, no unsupported broad finalbrowser claim."
  Verify Steps: |-
    1. Six statics first: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Only failed gates/changed-file remediation repeated.
    2. ONE sequential upstream-absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Vendor rename in repository try/finally restore before source audits; tests never invoke/access upstream. Persist exact failures/errors before assertions, failed/new-only repeats, skipped=skipped. Actual app/inventory L/S/F/B100%; maps only ignored appcache.
    3. New native insertion-index tests prove current body/cell target after replacing original object, correct native text/hints and cursor across UndoRedo, grouping same numeric slot after replacement, different node/document rejection, snapshot/pending independence and real shell native insertion. All409prior tests byte-identical;250states/defaults/classifications/exceptions/prior evidence preserved. Four scoped paths, additive unins owner evidence only; full maText/nontext/append/undo-area/redline/RSID/payload and split identities remain unverified.
    4. After restoration: npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. Scoped diff/defaults/prior test/AP forbidden artifact audit, doctor/routing checks. Same-agent EVALUATOR exact semantic SHApass, verify/canonical finish/parent checkpoint and clean main. Broad goal stays active.
    5. Required6path integration removes entire redundant active paragraph cache, derives current native paragraph from persistent cursor across replacement/lifecycle/navigation; registered final SwPosition preserves selected deletion reversed/partial caret through sequential actual mutation. Original4failed cases only plus one new public cursor lifecycle/navigation case;9passed newcases and120passed Chromium not replayed. Validate changed-file statics and actual source-aligned counters; record final browser source variant limitation explicitly.
  Verification: "Pending declared checks. No completion or blanket semantic promotion claimed."
  Rollback Plan: "Revert only the task semantic commit if necessary; preserve prior task records and conscious save/open/recovery deviations. No history rewrite."
  Findings: |-
    Iteration157 verified bounded progress. Represented SwUndoInsert no longer retains its target paragraph object. Pinned unins.cxx constructor stores m_nNode and m_rDoc; implementation captures actual numeric slot/native document, resolves current actual SwNodes target at Undo/Redo, groups by document/index rather than physical object identity and reconstructs after cursor against m_rDoc. Existing insertion offset/fragment/items/flags/class contracts preserved; no new adapter/DTO/TextRuns module. This removes one prerequisite for later split fresh-node ownership migration, not the whole retained split bridge.

    Initial full profile exposed2new shell replacement failures due redundant cached activeParagraph and2old native reversed/partial table caret failures from prior completed-point substitution. Remove entire shell cached object and all9redundant writes; GetActiveParagraph derives current actual displayed native cursor. Selection deletion carries its chosen final actual registered SwPosition across sequential mutations, then records completed numeric point and disposes finally. Existing409prior testfiles unchanged; no old expectation edits or ignored assertions. One genuinely new shell cursor navigation/model lifecycle case validates final native owner across replacement, table next-cell/row/boundary movement, replacement document and typing/history.

    Command: six statics first, allpass once; changed-file Prettier/ESLint/JSDoc/no-emit actual tsconfig/1000line checks passed. Command: ONE full upstream-absent test:static/app coverage/inventory coverage/scripts/Chromium profile, vendor rename try/finally. Result:buildpass,12245app pass/4fail of12249in313files,109inventory/36files100%,5scripts/2filespass,120Chromium pass. Exact4failed names persisted before assertions and9initialnewcasepasses retained. Only4originalfailed cases plus1new case executed after remediation:5pass/0fail/23skipped. No passing test/gate/suite/Chromium/inventory/profile replay; initial11new now12new distinct. Final distinct12250app in313files,109inventory,5scripts. Browser evidence120pass at initial full variant; final changed shell/deletion source tested by failed/new-only native cases and changed no-emit statics, passing browser cases intentionally not replayed; no full final browser variant parity claim.

    Evidence:actual app/inventory100%L/S/F/B. App12350lines/13522statements/3376functions/10068branches;inventory1464/1523/384/1080. Final current closure map carries only actual exact unchanged contiguous counters from hashed initial sources for2changedowners; new/changed/crossing locations require actual5-case counters. Initial source copies/maps only ignored appcache; no fabricated counters. Unins finalhash equals original full profile. All250states/defaults/classifications/exceptions/prior evidence preserved; additive3existingowner evidence only,6scopepaths. Five restored source audits pass0semantic violations. AP ignored-inclusive scan4243files0forbidden before review,doctor0errors2oldwarnings,routingOK. No upstreamcopies/helpers/Python/nativeprobes/binaries/rawdiffs/sourceframes/diagnostics inAP; vendor finallyrestored; no network/outside/global/subagents.

    Limits:existing formatted fragment/start-offset/pending native insert payload differs from full maText/MoveToUndoNds/nontext/append/RSID/redline behavior; remaining delete/format/list action payload object retention, retained split trailing bridge and native physical fresh-prefix/original-suffix semantics still open. Full undo-area/CutImpl/client/frame/field/redline lifetimes and broad UI/list/table merged/nested/protected/layout/clipboard remain unverified. Conscious save/open/recovery deviations preserved. No whole-module or broad parity promotion; parentDOING,goalactive.
id_source: "generated"
---
## Summary

Remove retained paragraph-object target from represented insertion undo by adopting native numeric node index/document ownership. This prepares later removal of the split identity bridge while preserving actual UI typing behavior.

## Scope

apps/office/src/sw/source/core/undo/unins.ts
apps/office/src/sw/source/core/undo/native-insert-node-index.test.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json
apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
apps/office/src/sw/source/core/edit/eddel.ts
409prior tests unchanged;250states/defaults/exceptions preserved. Source-confirmed4failed-case integration refinement under standing iterative UI/core authorization.

## Plan

Iteration157 replace represented SwUndoInsert retained paragraph pointer with pinned native m_nNode plus m_rDoc. unins.cxx constructors102/116 capture index and document; CanGrouping147 compares index/content, Undo227/Redo326 resolve current native nodes. Preserve existing insertion offset/fragment/items/flags/grouping-class behavior; full native maText/MoveToUndoNds/RSID/redline/nontext/append ownership remains unverified. Resolve transient current native target using actual SwNodes at saved index and existing ownership checks; compare document and numeric index for grouping, reconstruct after cursor with native retained document. No new adapter/module/DTO/TextRuns. Four paths (unins,new native-insert-node-index test,provenance,inventory).409prior tests unchanged,250states/defaults/classifications/exceptions/prior evidence preserved, additive unins owner only. Actual body/cell native replacement UndoRedo/grouping and real shell typing tests, default and explicit formatted insertion modes, foreign grouping boundary, independent snapshots/pending items. Six statics first then ONE absent build/app/inventory/scripts/Chromium; all tests never access upstream. Exact failures/errors before assertion, only failed/new cases retried; no passing replay/skipped=skipped. Vendor repository rename try/finally restore before5source audits/scope/AP scan. Actual app/inventory100%L/S/F/B; maps and any initial local source variants only ignored appcache. AP bounded English counts/hashes/outcomes/exact failures only, no upstreamcopies/helpers/Python/nativeprobes/binaries/rawdiffs/sourceframes/diagnostics. Same-agent explicit EVALUATOR exact semantic SHApass then recordedverify/canonical meaningfulfinish/parentcheckpoint clean main; broader goal active. No network/outside/global/subagents. Standing explicit iterative UI/refactoring authorization applies; prior156 verified progress. Other action payload identities and split RestoreSplitTextNode bridge remain open prerequisites, no fullmodule promotion. Integration refinement from original4failures:2new real shell replacement cases expose redundant activeParagraph cache disconnected from persistent cursor; remove entire cached owner and all redundant writes, derive active native paragraph from getShellCursor point, adjust2 immediate pending lookups accordingly.2old selected deletion direction cases reveal prior156 persistent point substitution loses intended reversed/partial endpoint; retain chosen final actual registered SwPosition across sequential mutation and record completed point through existing numeric action API, dispose finally. This preserves native direction/own-cell caret without forecast object substitution or weakened old tests.6scopedpaths, additive2additional existingowners;409prior tests unchanged,250metadata unchanged. Retry only original4failed cases plus one genuinely new shell current cursor lifecycle case, no passing9newcase or120Chromium replay. Source final changed-file statics and actual initial/failed/new-only coverage locations with exact source hashes; final browser initial variant evidence explicitly bounded, no unsupported broad finalbrowser claim.

## Verify Steps

1. Six statics first: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Only failed gates/changed-file remediation repeated.
2. ONE sequential upstream-absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Vendor rename in repository try/finally restore before source audits; tests never invoke/access upstream. Persist exact failures/errors before assertions, failed/new-only repeats, skipped=skipped. Actual app/inventory L/S/F/B100%; maps only ignored appcache.
3. New native insertion-index tests prove current body/cell target after replacing original object, correct native text/hints and cursor across UndoRedo, grouping same numeric slot after replacement, different node/document rejection, snapshot/pending independence and real shell native insertion. All409prior tests byte-identical;250states/defaults/classifications/exceptions/prior evidence preserved. Four scoped paths, additive unins owner evidence only; full maText/nontext/append/undo-area/redline/RSID/payload and split identities remain unverified.
4. After restoration: npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. Scoped diff/defaults/prior test/AP forbidden artifact audit, doctor/routing checks. Same-agent EVALUATOR exact semantic SHApass, verify/canonical finish/parent checkpoint and clean main. Broad goal stays active.
5. Required6path integration removes entire redundant active paragraph cache, derives current native paragraph from persistent cursor across replacement/lifecycle/navigation; registered final SwPosition preserves selected deletion reversed/partial caret through sequential actual mutation. Original4failed cases only plus one new public cursor lifecycle/navigation case;9passed newcases and120passed Chromium not replayed. Validate changed-file statics and actual source-aligned counters; record final browser source variant limitation explicitly.

## Verification

Pending declared checks. No completion or blanket semantic promotion claimed.

## Rollback Plan

Revert only the task semantic commit if necessary; preserve prior task records and conscious save/open/recovery deviations. No history rewrite.

## Findings

Iteration157 verified bounded progress. Represented SwUndoInsert no longer retains its target paragraph object. Pinned unins.cxx constructor stores m_nNode and m_rDoc; implementation captures actual numeric slot/native document, resolves current actual SwNodes target at Undo/Redo, groups by document/index rather than physical object identity and reconstructs after cursor against m_rDoc. Existing insertion offset/fragment/items/flags/class contracts preserved; no new adapter/DTO/TextRuns module. This removes one prerequisite for later split fresh-node ownership migration, not the whole retained split bridge.

Initial full profile exposed2new shell replacement failures due redundant cached activeParagraph and2old native reversed/partial table caret failures from prior completed-point substitution. Remove entire shell cached object and all9redundant writes; GetActiveParagraph derives current actual displayed native cursor. Selection deletion carries its chosen final actual registered SwPosition across sequential mutations, then records completed numeric point and disposes finally. Existing409prior testfiles unchanged; no old expectation edits or ignored assertions. One genuinely new shell cursor navigation/model lifecycle case validates final native owner across replacement, table next-cell/row/boundary movement, replacement document and typing/history.

Command: six statics first, allpass once; changed-file Prettier/ESLint/JSDoc/no-emit actual tsconfig/1000line checks passed. Command: ONE full upstream-absent test:static/app coverage/inventory coverage/scripts/Chromium profile, vendor rename try/finally. Result:buildpass,12245app pass/4fail of12249in313files,109inventory/36files100%,5scripts/2filespass,120Chromium pass. Exact4failed names persisted before assertions and9initialnewcasepasses retained. Only4originalfailed cases plus1new case executed after remediation:5pass/0fail/23skipped. No passing test/gate/suite/Chromium/inventory/profile replay; initial11new now12new distinct. Final distinct12250app in313files,109inventory,5scripts. Browser evidence120pass at initial full variant; final changed shell/deletion source tested by failed/new-only native cases and changed no-emit statics, passing browser cases intentionally not replayed; no full final browser variant parity claim.

Evidence:actual app/inventory100%L/S/F/B. App12350lines/13522statements/3376functions/10068branches;inventory1464/1523/384/1080. Final current closure map carries only actual exact unchanged contiguous counters from hashed initial sources for2changedowners; new/changed/crossing locations require actual5-case counters. Initial source copies/maps only ignored appcache; no fabricated counters. Unins finalhash equals original full profile. All250states/defaults/classifications/exceptions/prior evidence preserved; additive3existingowner evidence only,6scopepaths. Five restored source audits pass0semantic violations. AP ignored-inclusive scan4243files0forbidden before review,doctor0errors2oldwarnings,routingOK. No upstreamcopies/helpers/Python/nativeprobes/binaries/rawdiffs/sourceframes/diagnostics inAP; vendor finallyrestored; no network/outside/global/subagents.

Limits:existing formatted fragment/start-offset/pending native insert payload differs from full maText/MoveToUndoNds/nontext/append/RSID/redline behavior; remaining delete/format/list action payload object retention, retained split trailing bridge and native physical fresh-prefix/original-suffix semantics still open. Full undo-area/CutImpl/client/frame/field/redline lifetimes and broad UI/list/table merged/nested/protected/layout/clipboard remain unverified. Conscious save/open/recovery deviations preserved. No whole-module or broad parity promotion; parentDOING,goalactive.
