---
id: "202610050310-EWM4P2"
title: "Restore native same-node selected insertion undo sequence"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-05T03:11:08.814Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-05T03:24:37.139Z"
  updated_by: "EVALUATOR"
  note: "Same-actor read-only review passed for exact semantic SHA 207d82ff77a81ab96b246513597e4bbf0288eaf0. Native same-node selected insertion uses ordered delete and forced insertion in one list/notification transaction. This is bounded verified progress, not independent review or full parity."
  evaluated_sha: "207d82ff77a81ab96b246513597e4bbf0288eaf0"
  blueprint_digest: "3b7434084c329f194e7e5086fa86a07465a5df7b7f02310c2dd8599f156db969"
  evidence_refs:
    - ".agentplane/tasks/202610050310-EWM4P2/README.md"
    - ".agentplane/tasks/202610050310-EWM4P2/quality/20261005-032437139-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610050310-EWM4P2/quality/20261005-032437139-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610050310-EWM4P2/quality/20261005-032437139-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610050310-EWM4P2/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610050310-EWM4P2/evidence/scope-and-native-hashes.json"
    - ".agentplane/tasks/202610050310-EWM4P2/evidence/absent-profile.json"
    - ".agentplane/tasks/202610050310-EWM4P2/evidence/failed-case-replay.json"
    - ".agentplane/tasks/202610050310-EWM4P2/evidence/failed-case-replay-2.json"
    - ".agentplane/tasks/202610050310-EWM4P2/evidence/ledger-recovery.json"
    - ".agentplane/tasks/202610050310-EWM4P2/evidence/static-gates.json"
    - ".agentplane/tasks/202610050310-EWM4P2/evidence/restored-source-audits.json"
  findings:
    - "Five approved semantic paths and exact committed bytes checked;361 prior test/spec files byte-identical;869 new cases,243 runtime rows/statuses/defaults/exceptions and registered I/O deviations retained. Native range/history/mode/order/ownership/input/direction/notification/nesting/retention evidence reviewed against eight source hashes."
    - "Six static gates passed;one full upstream-absent build/app/inventory/scripts/Chromium profile;app10854pass/168fail first with100%coverage,inventory109/100%,scripts5,Chromium99. Only168 exact failed names replayed,156passed/12failed,then only12 replayed and passed;no passing replay. Production/docs hashes unchanged. Five restored audits passed,zero semantic violations."
    - "AUTO identity fixture assumptions corrected to reconstructed portions and literal per-character formatting;all old tests untouched. Scope audit caught overwritten first replay ledger;two bounded records restored from completed tool evidence without reruns. Doctor zero errors/two unchanged warnings,routing and ignored-inclusive forbidden-artifact scan passed."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement the approved same-node native delete-plus-forced insertion sequence and independent literal application tests; preserve registered deviations and execute one upstream-absent profile only."
events:
  -
    type: "status"
    at: "2026-10-05T03:11:09.244Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the approved same-node native delete-plus-forced insertion sequence and independent literal application tests; preserve registered deviations and execute one upstream-absent profile only."
doc_version: 3
doc_updated_at: "2026-10-05T03:23:30.341Z"
doc_updated_by: "CODER"
description: "Iteration135: replace same-node selected typing fragment replacement with native deletion and forced text insertion in one Writer undo list, retaining old attribute history and mode5. Preserve cross-node/paste adapters and registered I/O deviations; independent tests, one absent full profile, no upstream test dependency."
sections:
  Summary: "Restore native same-node selected insertion undo sequence."
  Scope: |-
    - apps/office/src/sw/source/uibase/wrtsh/wrtsh-editing.ts
    - apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
    - apps/office/src/sw/source/uibase/wrtsh/native-selected-insertion.test.ts
    - docs/program/source-provenance.json
    - docs/program/parity/runtime-inventory.json
  Plan: "Replace same-node selected Insert/Replace/composition SwUndoReplace fragment adapter with native DeleteAtCursor plus createWriterInsertTextAction forced only when deletion succeeds, inside one StartUndo/EndUndo Replace list. Keep cross-node and paste/range adapters unchanged. Capture insertion cursor after deletion and preserve original directional selection through deletion undo; empty mark uses ordinary mode1. Native action order delete then insert, undo reverse, redo forward, no merging with surrounding typing. Test actual AUTO/INET ownership, literal range boundaries, constructor flags/history/FormatIgnore/item metadata, both selection directions, input paths, pending items, old IgnoreDontExpand restoration, failed deletion empty selection, nested list/capacity/save branch/history and notification effects. Preserve all existing runtime statuses/defaults/exceptions and registered I/O/recovery deviations; bounded responsibility appendices only, no promotion. Existing tests byte-identical unless exact first-profile observed expectations contradict pinned native semantics; record and minimally correct only failed cases. Six static gates first; one sequential full build/app/inventory/scripts/Chromium profile absent upstream, immediate exact failed-name ledger and finally restore; repeat only failed gates/cases, no passing replays. Five source audits only after restoration. Exact source/hash/scope/read-only same-actor quality, doctor/routing, CODER verification and canonical finish; English bounded prose/counts/hashes only in Agentplane, no sources/helpers/Python/raw diagnostics, no network/global/outside access. Broader core/UI parity remains unverified."
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

    Audit prior tests and runtime rows, native source hashes and exact semantic SHA. One absent profile only; failed-only repeats; restore before source and scope audits.
  Verification: "Pending implementation and validation."
  Rollback Plan: "Revert the semantic leaf commit without rewriting history."
  Findings: "Iteration134 made verified progress and is DONE; current clean main baseline 26805a98703fa8f905daffd8b2e1da7029137eb1. Direct mode, only parent active before leaf creation, four matched policies loaded, user-instructions absent. Pin26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. Native wrtsh1.cxx241-305 starts REPLACE undo list, deletes same-node selection, clears mark then Insert2 passes deletion result; editsh.cxx98 selects flags5 after successful deletion versus1. Native docundo.cxx269/301 delegates StartUndo/EndUndo to Sfx list actions; undo.cxx1018/1096 retains composite order. Current same-node branch uses SwUndoReplace with portable fragments, bypassing forced insertion and whole-node attribute history. Existing history/action machinery now supports native sequence. Cross-node/redline/multicursor/overwrite/selection options/content controls/list IDs/native comment rewriting remain unverified. Implemented same-node native delete-plus-forced insertion inside Replace StartUndo/EndUndo and existing shell transaction port; five semantic paths including shell notification binding. All 361 prior test/spec files byte-identical. 869 new cases: three real input paths, both directions, AUTO/INET, nine literal ranges and eight flag masks with locks/old IgnoreDontExpand; native action order/history/maps/backlinks/item identity and constructor defaults, selected versus empty mark modes5/1, one aggregate notification, surrounding typing isolation, nested lists and zero retention. Six static gates passed first. One absent profile: build pass, app10854pass/168fail of11022 in279files and100%allfourcoverage, inventory109/36files/100%allfour, scripts5,Chromium99 all first-pass. All failures new AUTO portion identity expectations; native BuildPortions permits replacing/splitting AUTO portions. Tests corrected to assert detached original, actual reconstructed ownership and per-character effective formatting. Production/docs byte hashes unchanged after first profile. Exact failed-only replay168 =>156pass/12fail/701skip; remaining12 repeated =>12pass/857skip. Zero passing replays. Second orchestration mistakenly overwrote first bounded ledger; scope audit caught missing distinct ledger. Preserved second record and recovered first exact hashes/counts/names from observed completed tool result, no rerun or production edits; ledger-recovery.json records process correction. Vendor restored finally before five source audits, all passed/0semanticviolations. All243runtime rows/states/defaults/exceptions retained; onlyfour bounded appendices. Scope/nativehash checks passed for8sources and unchanged cross-node/collapsed/remaining editing bodies. Doctor0errors/two unchangedlegacywarnings,routingpassed,ignored-inclusiveAP3943files0forbidden beforequality. Full native selection options/redlines/multicursor/overwrite/comments/listIDs/BuildPortions/history/core/UI remain unverified;registered I/O deviations preserved,no promotion. Next dependent source audit: cross-node selected insertion deletion result propagation/forced mode and structural history, while full native cross-node deletion rollback is still unverified. Goal active, iteration135 verified progress, no blocker."
id_source: "generated"
---
## Summary

Restore native same-node selected insertion undo sequence.

## Scope

- apps/office/src/sw/source/uibase/wrtsh/wrtsh-editing.ts
- apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
- apps/office/src/sw/source/uibase/wrtsh/native-selected-insertion.test.ts
- docs/program/source-provenance.json
- docs/program/parity/runtime-inventory.json

## Plan

Replace same-node selected Insert/Replace/composition SwUndoReplace fragment adapter with native DeleteAtCursor plus createWriterInsertTextAction forced only when deletion succeeds, inside one StartUndo/EndUndo Replace list. Keep cross-node and paste/range adapters unchanged. Capture insertion cursor after deletion and preserve original directional selection through deletion undo; empty mark uses ordinary mode1. Native action order delete then insert, undo reverse, redo forward, no merging with surrounding typing. Test actual AUTO/INET ownership, literal range boundaries, constructor flags/history/FormatIgnore/item metadata, both selection directions, input paths, pending items, old IgnoreDontExpand restoration, failed deletion empty selection, nested list/capacity/save branch/history and notification effects. Preserve all existing runtime statuses/defaults/exceptions and registered I/O/recovery deviations; bounded responsibility appendices only, no promotion. Existing tests byte-identical unless exact first-profile observed expectations contradict pinned native semantics; record and minimally correct only failed cases. Six static gates first; one sequential full build/app/inventory/scripts/Chromium profile absent upstream, immediate exact failed-name ledger and finally restore; repeat only failed gates/cases, no passing replays. Five source audits only after restoration. Exact source/hash/scope/read-only same-actor quality, doctor/routing, CODER verification and canonical finish; English bounded prose/counts/hashes only in Agentplane, no sources/helpers/Python/raw diagnostics, no network/global/outside access. Broader core/UI parity remains unverified.

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

Audit prior tests and runtime rows, native source hashes and exact semantic SHA. One absent profile only; failed-only repeats; restore before source and scope audits.

## Verification

Pending implementation and validation.

## Rollback Plan

Revert the semantic leaf commit without rewriting history.

## Findings

Iteration134 made verified progress and is DONE; current clean main baseline 26805a98703fa8f905daffd8b2e1da7029137eb1. Direct mode, only parent active before leaf creation, four matched policies loaded, user-instructions absent. Pin26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. Native wrtsh1.cxx241-305 starts REPLACE undo list, deletes same-node selection, clears mark then Insert2 passes deletion result; editsh.cxx98 selects flags5 after successful deletion versus1. Native docundo.cxx269/301 delegates StartUndo/EndUndo to Sfx list actions; undo.cxx1018/1096 retains composite order. Current same-node branch uses SwUndoReplace with portable fragments, bypassing forced insertion and whole-node attribute history. Existing history/action machinery now supports native sequence. Cross-node/redline/multicursor/overwrite/selection options/content controls/list IDs/native comment rewriting remain unverified. Implemented same-node native delete-plus-forced insertion inside Replace StartUndo/EndUndo and existing shell transaction port; five semantic paths including shell notification binding. All 361 prior test/spec files byte-identical. 869 new cases: three real input paths, both directions, AUTO/INET, nine literal ranges and eight flag masks with locks/old IgnoreDontExpand; native action order/history/maps/backlinks/item identity and constructor defaults, selected versus empty mark modes5/1, one aggregate notification, surrounding typing isolation, nested lists and zero retention. Six static gates passed first. One absent profile: build pass, app10854pass/168fail of11022 in279files and100%allfourcoverage, inventory109/36files/100%allfour, scripts5,Chromium99 all first-pass. All failures new AUTO portion identity expectations; native BuildPortions permits replacing/splitting AUTO portions. Tests corrected to assert detached original, actual reconstructed ownership and per-character effective formatting. Production/docs byte hashes unchanged after first profile. Exact failed-only replay168 =>156pass/12fail/701skip; remaining12 repeated =>12pass/857skip. Zero passing replays. Second orchestration mistakenly overwrote first bounded ledger; scope audit caught missing distinct ledger. Preserved second record and recovered first exact hashes/counts/names from observed completed tool result, no rerun or production edits; ledger-recovery.json records process correction. Vendor restored finally before five source audits, all passed/0semanticviolations. All243runtime rows/states/defaults/exceptions retained; onlyfour bounded appendices. Scope/nativehash checks passed for8sources and unchanged cross-node/collapsed/remaining editing bodies. Doctor0errors/two unchangedlegacywarnings,routingpassed,ignored-inclusiveAP3943files0forbidden beforequality. Full native selection options/redlines/multicursor/overwrite/comments/listIDs/BuildPortions/history/core/UI remain unverified;registered I/O deviations preserved,no promotion. Next dependent source audit: cross-node selected insertion deletion result propagation/forced mode and structural history, while full native cross-node deletion rollback is still unverified. Goal active, iteration135 verified progress, no blocker.
