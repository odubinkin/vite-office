---
id: "202610050456-HYVJ07"
title: "Route table cell editing through the persistent Writer shell"
result_summary: "Removed table DOM-diff/innerHTML/event bypass and duplicate paragraph ownership. Actual cell text sections now support shared typing, selection, composition, formatting, split/join and UndoRedo with body/neighbor isolation and ODT persistence. One absent full profile plus failed/new-only closure, cumulative coverage100%,244statuses and I/O deviations preserved. Full UI/native parity remains unverified."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 15
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
  state: "ok"
  updated_at: "2026-10-05T05:36:59.630Z"
  updated_by: "CODER"
  note: "Connected-cell shared input/history,canonical section ownership and real PaM formatting pass. ONE absent full profile plus exact failed/error-causing/new-only closure;current cumulative coverage100%allfour,100Chromium unique cases,restored source audits,244states/deviations preserved. Exact31ce9a867534 same-actor readonly qualitypass;full native/UI parity remains unverified."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-05T05:35:49.377Z"
  updated_by: "EVALUATOR"
  note: "Same-actor read-only review of exact 31ce9a86753410efec8a9b189e155d8ad48ad0df passes the bounded connected-cell editing contract;not independent review or full native/UI parity."
  evaluated_sha: "31ce9a86753410efec8a9b189e155d8ad48ad0df"
  blueprint_digest: "74f0570fb807a488439bcfb0fc4e81cfcd3ebbe5a8b99a956eb40f6157e40435"
  evidence_refs:
    - ".agentplane/tasks/202610050456-HYVJ07/README.md"
    - ".agentplane/tasks/202610050456-HYVJ07/quality/20261005-053549377-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610050456-HYVJ07/quality/20261005-053549377-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610050456-HYVJ07/quality/20261005-053549377-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610050456-HYVJ07/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610050456-HYVJ07/evidence/scope-and-native-hashes.json"
    - ".agentplane/tasks/202610050456-HYVJ07/evidence/absent-profile.json"
    - ".agentplane/tasks/202610050456-HYVJ07/evidence/failed-only-replay.json"
    - ".agentplane/tasks/202610050456-HYVJ07/evidence/new-section-case.json"
    - ".agentplane/tasks/202610050456-HYVJ07/evidence/chromium-failed-only-replay.json"
    - ".agentplane/tasks/202610050456-HYVJ07/evidence/cumulative-coverage.json"
    - ".agentplane/tasks/202610050456-HYVJ07/evidence/restored-source-audits.json"
    - "Read-only exact 31ce9a86753410efec8a9b189e155d8ad48ad0df audit exit0;git show maxBuffer32MiB;committed18paths equal reviewed workspace."
  findings:
    - "Actual diff has18approvedpaths. Cell DOM-diff/innerHTML/bypass/cache layers removed;actual section nodes,PaM text traversal and common shell own input,format,split/join and Undo. Native shape reviewed against7pinned source hashes without upstream execution."
    - "ONE full absent build/app/inventory/scripts/Chromium profile;initial6failed and1uniqueerror-causingcase plus3newcases close by selected9+1. Browser sole failedcase closes after physical native DOM caret assertion;99passing cases never replay. Application cumulative source/countcoverage100%allfour,inventory first100%."
    - "364priorfiles361byteidentical;only3exact observed legacycelladaptercases changed.244states/defaults/knownexceptions/classifications preserved,22bounded appendices,stale deleted symbol removed only. Doctor0errors/twoexisting warnings,routingpass,Agentplane3995files0forbidden."
commit:
  hash: "83bee69aa5acf5edf0566cc87f01651298540012"
  message: "🧩 HYVJ07 task: record verified table editing"
comments:
  -
    author: "CODER"
    body: "Start: use standing goal/user UI approval to remove cell DOM-diff bypass and connect real cell nodes to the persistent Writer cursor/input/history;preserve registered deviations and all244 semantic statuses. One full absent profile,failed-only closure."
  -
    author: "CODER"
    body: "Start: close observed connected-cell section and formatting failures in the existing approved UI editing scope."
  -
    author: "CODER"
    body: "Verified: table cells use shared Writer input, PaM, formatting, section nodes and history; exact failed/new-only closure and restored audits pass."
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
  -
    type: "verify"
    at: "2026-10-05T05:36:59.630Z"
    author: "CODER"
    state: "ok"
    note: "Connected-cell shared input/history,canonical section ownership and real PaM formatting pass. ONE absent full profile plus exact failed/error-causing/new-only closure;current cumulative coverage100%allfour,100Chromium unique cases,restored source audits,244states/deviations preserved. Exact31ce9a867534 same-actor readonly qualitypass;full native/UI parity remains unverified."
  -
    type: "status"
    at: "2026-10-05T05:38:03.079Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: table cells use shared Writer input, PaM, formatting, section nodes and history; exact failed/new-only closure and restored audits pass."
doc_version: 3
doc_updated_at: "2026-10-05T05:38:03.081Z"
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
  Verification: |-
    Command: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size.
    Result: pass after the first observed obsolete cell-diff import failure and exact legacy display-case migration;changed-source formatting/lint/TypeScript/docs/size checks also pass.
    Evidence: evidence/static-gates.json; evidence/changed-source-static-checks.json.
    Scope: approved18semanticpaths;364prior testfiles/361byte-identical,only3exactobserved legacy cell-adapter cases change.

    Command: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts.
    Result: ONE full sequential upstream-absent profile. Build pass;first application11862pass/6failof11868in283files plus2uncaught errors,first coverage100%allfour;inventory109pass/36files100%allfour;scripts5pass;Chromium99pass/1fail.
    Evidence: evidence/absent-profile.json stores exact failed/error-causing names before collector assertions. Both first instrumented countmaps reside only in ignored repository app cache.
    Scope: current application,inventory,source-check fixtures and real Chromium;no pinned upstream reads/compilation/execution by tests.

    Command: exact failed/error-causing/new-case Vitest coverage selection; exact sole failed Chromium selection.
    Result: pass. App6failed+1unique error-causing+2new cases9pass/28skipped;one subsequent new section/index case1pass/10skipped.15newappcases and1newChromiumcase total. Sole browser failure closes after independently asserted ArrowLeft caret;Home/platform navigation remains outside the certified bounded contract. A full-title-anchor collection attempt selected0cases,then only the still-failed case executed.99passing browser cases and all other passing tests never replayed. Vite changed-asset regeneration only;the passed full static-build gate was not replayed.
    Evidence: evidence/failed-only-replay.json; evidence/new-section-case.json; evidence/chromium-failed-only-replay.json; evidence/cumulative-coverage.json.
    Scope: actual cell section,input,selection,composition,formatting,split/join,history,isolation and ODTpersistence. Current cumulative appcoverage100%allfour aligns only exact contiguous unchanged source locations from first counts;edited/crossing locations use actual failed/new counts. Generated anonymous ordinals and empty branch sentinels are normalized without test replay. Replay diagnostic0 thresholds leave repository100%configuration unchanged;no fresh full current-source measurement claimed.

    Command: npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity; ap doctor; node .agentplane/policy/check-routing.mjs.
    Result: pass after upstream restoration in finally. Five source audits pass,semanticviolations0;doctor0errors/two unchanged warnings;policy routing OK.
    Evidence: evidence/restored-source-audits.json; evidence/scope-and-native-hashes.json; evidence/doctor-and-routing.json.
    Scope:244existing states/defaults/exceptions preserved,no newmodule or promotion,22boundedappendices,7pinned source hashes;Agentplane3995files0forbidden beforequality.

    Command: exact 31ce9a86753410efec8a9b189e155d8ad48ad0df same-actor read-only EVALUATOR review.
    Result: pass;readonly audit completed successfully before quality recording,18committedpaths equal reviewed files;git-show buffer32MiB.
    Evidence: .agentplane/tasks/202610050456-HYVJ07/quality/20261005-053549377-recovery-context/quality-report.json.
    Scope: this bounded cell editing owner correction only;independent review not claimed. Read-only TextRun display,body-ordinal sidebar context,native table-wide Home/navigation/selection,nested or merged cells,layout/text portions,list UI and full native/parent parity remain unverified. Registered save/open/recovery deviations unchanged;parent and goal active.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-05T05:36:59.630Z — VERIFY — ok

    By: CODER

    Note: Connected-cell shared input/history,canonical section ownership and real PaM formatting pass. ONE absent full profile plus exact failed/error-causing/new-only closure;current cumulative coverage100%allfour,100Chromium unique cases,restored source audits,244states/deviations preserved. Exact31ce9a867534 same-actor readonly qualitypass;full native/UI parity remains unverified.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-05T05:36:59.137Z, excerpt_hash=sha256:f03b330f22c715bca1c40c9f0f6e6f0d3294f6836d73f22b9dc1fbe11be841b7

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610050456-HYVJ07/blueprint/resolved-snapshot.json
    - old_digest: 74f0570fb807a488439bcfb0fc4e81cfcd3ebbe5a8b99a956eb40f6157e40435
    - current_digest: 74f0570fb807a488439bcfb0fc4e81cfcd3ebbe5a8b99a956eb40f6157e40435
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610050456-HYVJ07

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610050456-HYVJ07
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert semantic leaf commit without history rewriting."
  Findings: "Iteration138 previous137 verified progress DONE,clean main fe80a59b9d37a21c99b91f47968eb52213adacac,direct,only parent active. Four matched policies loaded,user-instructions absent. User prioritizes upstream UI/list/table behavior and removal of unnecessary layers. Current cell independently changes DOM then editWriterTableCell diffs text and directly erases/inserts SwTextNode;controller bypasses table beforeinput and cell suppresses key/paste/pointer propagation,selection restoration skips table focus. SwEditWin rejects cell nodes through body-only paragraph membership. SwTableBox duplicates paragraph ownership in an array,so native Split/Join history cannot update it. Upstream edtwin.cxx FlushInBuffer calls actual SwWrtShell Insert at1072;wrtsh1.cxx241 native selection->DelRight->Insert2 uses common cursor/history,without cell DOM diff. swtable.cxx135/1801 cell text/ranges come from GetSttNd native section nodes;docedt.cxx joins adjacent same-section content. These are the executable owner/path discrepancies,not cosmetic DTO renaming. Existing244 runtime statuses/defaults/exceptions and registered I/O deviations preserved. Full rendering/native portions/table navigation/selection/merged cells/list UI remain unverified. First absent profile: build pass,11862 app cases pass/6 fail with two uncaught errors,app100%allfour,inventory109pass100%allfour,scripts5pass,Chromium99pass/1fail. Observed body-only SwNodes.removeTextNode blocks cell split undo/join;getWriterSelectedTextRanges excludes cell formatting. Legacy writer-view cell post-DOM edit and browser-window bypass reflect the removed adapter;the latter unbound method causes uncaught error. Scope addition remains same approved connected-cell input/history contract;no full suites replay. Closure: static6latestpass,firsttypecheck obsolete helper import observed then sole old display case migrated. ONE full absent build pass,app11862pass/6failof11868/283files with2uncaught errors,inventory109pass/36files100%allfour,scripts5pass,Chromium99pass/1fail. App exact6failed+1uniqueerror-causing+2new cases9pass/28skipped;one further new connected-cell membership/index case1pass/10skipped;15newappcases total. No passing test/full static-build gate replay. Vite assets alone regenerated once for two subsequently modified core owners. Chromium wrong full-title anchor selected0 cases (collection error,not execution),then sole failedcase reproduced Home assumption and finally passes with independently asserted physical ArrowLeft caret and explicit real DOM selection for formatting. Home/native platform navigation remains a future gap,not newly certified. Both first100%coverage countmaps stay only in ignored appcache;current source cumulative100%allfour uses exact contiguous source-identical LCS locations from first map plus edited/crossing locations solely from failed/new instrumentation,empty branch sentinels and generated anonymous ordinal normalization corrected without test replay. Five restored source audits pass0semanticviolations;364priorfiles361byteidentical,only3exactobserved old cell-adapter cases change;22bounded notes,all244states/defaults/exceptions retained,no newmodule/promotion. Seven pinned native hashes recorded. Doctor0errors/two unchanged warnings oldhookshim and DONE2Z3962 missingimplementation hash,routingpass,ignored-inclusiveAgentplane3995files0forbidden. Readonly text-run display,body ordinal sidebar context,native list UI/table Home/navigation/fullselection/mergedcells/layout remain unverified;goalactive."
extensions:
  implementation_commit:
    hash: "31ce9a86753410efec8a9b189e155d8ad48ad0df"
    message: "🧩 HYVJ07 code: route table input through Writer shell"
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

Command: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size.
Result: pass after the first observed obsolete cell-diff import failure and exact legacy display-case migration;changed-source formatting/lint/TypeScript/docs/size checks also pass.
Evidence: evidence/static-gates.json; evidence/changed-source-static-checks.json.
Scope: approved18semanticpaths;364prior testfiles/361byte-identical,only3exactobserved legacy cell-adapter cases change.

Command: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts.
Result: ONE full sequential upstream-absent profile. Build pass;first application11862pass/6failof11868in283files plus2uncaught errors,first coverage100%allfour;inventory109pass/36files100%allfour;scripts5pass;Chromium99pass/1fail.
Evidence: evidence/absent-profile.json stores exact failed/error-causing names before collector assertions. Both first instrumented countmaps reside only in ignored repository app cache.
Scope: current application,inventory,source-check fixtures and real Chromium;no pinned upstream reads/compilation/execution by tests.

Command: exact failed/error-causing/new-case Vitest coverage selection; exact sole failed Chromium selection.
Result: pass. App6failed+1unique error-causing+2new cases9pass/28skipped;one subsequent new section/index case1pass/10skipped.15newappcases and1newChromiumcase total. Sole browser failure closes after independently asserted ArrowLeft caret;Home/platform navigation remains outside the certified bounded contract. A full-title-anchor collection attempt selected0cases,then only the still-failed case executed.99passing browser cases and all other passing tests never replayed. Vite changed-asset regeneration only;the passed full static-build gate was not replayed.
Evidence: evidence/failed-only-replay.json; evidence/new-section-case.json; evidence/chromium-failed-only-replay.json; evidence/cumulative-coverage.json.
Scope: actual cell section,input,selection,composition,formatting,split/join,history,isolation and ODTpersistence. Current cumulative appcoverage100%allfour aligns only exact contiguous unchanged source locations from first counts;edited/crossing locations use actual failed/new counts. Generated anonymous ordinals and empty branch sentinels are normalized without test replay. Replay diagnostic0 thresholds leave repository100%configuration unchanged;no fresh full current-source measurement claimed.

Command: npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity; ap doctor; node .agentplane/policy/check-routing.mjs.
Result: pass after upstream restoration in finally. Five source audits pass,semanticviolations0;doctor0errors/two unchanged warnings;policy routing OK.
Evidence: evidence/restored-source-audits.json; evidence/scope-and-native-hashes.json; evidence/doctor-and-routing.json.
Scope:244existing states/defaults/exceptions preserved,no newmodule or promotion,22boundedappendices,7pinned source hashes;Agentplane3995files0forbidden beforequality.

Command: exact 31ce9a86753410efec8a9b189e155d8ad48ad0df same-actor read-only EVALUATOR review.
Result: pass;readonly audit completed successfully before quality recording,18committedpaths equal reviewed files;git-show buffer32MiB.
Evidence: .agentplane/tasks/202610050456-HYVJ07/quality/20261005-053549377-recovery-context/quality-report.json.
Scope: this bounded cell editing owner correction only;independent review not claimed. Read-only TextRun display,body-ordinal sidebar context,native table-wide Home/navigation/selection,nested or merged cells,layout/text portions,list UI and full native/parent parity remain unverified. Registered save/open/recovery deviations unchanged;parent and goal active.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-05T05:36:59.630Z — VERIFY — ok

By: CODER

Note: Connected-cell shared input/history,canonical section ownership and real PaM formatting pass. ONE absent full profile plus exact failed/error-causing/new-only closure;current cumulative coverage100%allfour,100Chromium unique cases,restored source audits,244states/deviations preserved. Exact31ce9a867534 same-actor readonly qualitypass;full native/UI parity remains unverified.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-05T05:36:59.137Z, excerpt_hash=sha256:f03b330f22c715bca1c40c9f0f6e6f0d3294f6836d73f22b9dc1fbe11be841b7

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610050456-HYVJ07/blueprint/resolved-snapshot.json
- old_digest: 74f0570fb807a488439bcfb0fc4e81cfcd3ebbe5a8b99a956eb40f6157e40435
- current_digest: 74f0570fb807a488439bcfb0fc4e81cfcd3ebbe5a8b99a956eb40f6157e40435
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610050456-HYVJ07

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610050456-HYVJ07
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert semantic leaf commit without history rewriting.

## Findings

Iteration138 previous137 verified progress DONE,clean main fe80a59b9d37a21c99b91f47968eb52213adacac,direct,only parent active. Four matched policies loaded,user-instructions absent. User prioritizes upstream UI/list/table behavior and removal of unnecessary layers. Current cell independently changes DOM then editWriterTableCell diffs text and directly erases/inserts SwTextNode;controller bypasses table beforeinput and cell suppresses key/paste/pointer propagation,selection restoration skips table focus. SwEditWin rejects cell nodes through body-only paragraph membership. SwTableBox duplicates paragraph ownership in an array,so native Split/Join history cannot update it. Upstream edtwin.cxx FlushInBuffer calls actual SwWrtShell Insert at1072;wrtsh1.cxx241 native selection->DelRight->Insert2 uses common cursor/history,without cell DOM diff. swtable.cxx135/1801 cell text/ranges come from GetSttNd native section nodes;docedt.cxx joins adjacent same-section content. These are the executable owner/path discrepancies,not cosmetic DTO renaming. Existing244 runtime statuses/defaults/exceptions and registered I/O deviations preserved. Full rendering/native portions/table navigation/selection/merged cells/list UI remain unverified. First absent profile: build pass,11862 app cases pass/6 fail with two uncaught errors,app100%allfour,inventory109pass100%allfour,scripts5pass,Chromium99pass/1fail. Observed body-only SwNodes.removeTextNode blocks cell split undo/join;getWriterSelectedTextRanges excludes cell formatting. Legacy writer-view cell post-DOM edit and browser-window bypass reflect the removed adapter;the latter unbound method causes uncaught error. Scope addition remains same approved connected-cell input/history contract;no full suites replay. Closure: static6latestpass,firsttypecheck obsolete helper import observed then sole old display case migrated. ONE full absent build pass,app11862pass/6failof11868/283files with2uncaught errors,inventory109pass/36files100%allfour,scripts5pass,Chromium99pass/1fail. App exact6failed+1uniqueerror-causing+2new cases9pass/28skipped;one further new connected-cell membership/index case1pass/10skipped;15newappcases total. No passing test/full static-build gate replay. Vite assets alone regenerated once for two subsequently modified core owners. Chromium wrong full-title anchor selected0 cases (collection error,not execution),then sole failedcase reproduced Home assumption and finally passes with independently asserted physical ArrowLeft caret and explicit real DOM selection for formatting. Home/native platform navigation remains a future gap,not newly certified. Both first100%coverage countmaps stay only in ignored appcache;current source cumulative100%allfour uses exact contiguous source-identical LCS locations from first map plus edited/crossing locations solely from failed/new instrumentation,empty branch sentinels and generated anonymous ordinal normalization corrected without test replay. Five restored source audits pass0semanticviolations;364priorfiles361byteidentical,only3exactobserved old cell-adapter cases change;22bounded notes,all244states/defaults/exceptions retained,no newmodule/promotion. Seven pinned native hashes recorded. Doctor0errors/two unchanged warnings oldhookshim and DONE2Z3962 missingimplementation hash,routingpass,ignored-inclusiveAgentplane3995files0forbidden. Readonly text-run display,body ordinal sidebar context,native list UI/table Home/navigation/fullselection/mergedcells/layout remain unverified;goalactive.
