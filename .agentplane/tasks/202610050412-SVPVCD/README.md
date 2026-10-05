---
id: "202610050412-SVPVCD"
title: "Restore native cross-node selected deletion and forced insertion"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 14
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
  state: "ok"
  updated_at: "2026-10-05T04:50:41.558Z"
  updated_by: "CODER"
  note: "Verified native body-text cross deletion/survivor/history and selected mode5 at 07ea47010148bf373c2cb691eb6ce56120109adf. One full absent profile,application first coverage100%;exact failed-only576+1 closure,zero passing replay. Six static andfive restored audits pass;363 old files/362 identical/only generic-helper syntax. Inventory cumulative source/count closure documented,not fresh full measurement. Same-actor exactSHAquality pass. Registered deviations andexisting243states/defaults/exceptions unchanged,newmoduleunverified. Fullcore/UI parity remainsunverified;TextRun render boundary next priority."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-05T04:49:21.712Z"
  updated_by: "EVALUATOR"
  note: "Completed same-actor read-only audit of exact 07ea47010148bf373c2cb691eb6ce56120109adf: bounded native body-text cross deletion/history/survivor/mode5 passes; full core/UI parity unverified. Supersedes the earlier report recorded before its collector completed."
  evaluated_sha: "07ea47010148bf373c2cb691eb6ce56120109adf"
  blueprint_digest: "0772bc3c216d62244be9fbbb1e426cc06ce42207bcb6828a71f8a5a444eb6364"
  evidence_refs:
    - ".agentplane/tasks/202610050412-SVPVCD/README.md"
    - ".agentplane/tasks/202610050412-SVPVCD/quality/20261005-044921712-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610050412-SVPVCD/quality/20261005-044921712-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610050412-SVPVCD/quality/20261005-044921712-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610050412-SVPVCD/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610050412-SVPVCD/evidence/scope-and-native-hashes.json"
    - ".agentplane/tasks/202610050412-SVPVCD/evidence/failed-only-replay.json"
    - ".agentplane/tasks/202610050412-SVPVCD/evidence/inventory-cumulative-coverage.json"
    - "Completed readonly exactSHA audit 07ea47010148bf373c2cb691eb6ce56120109adf: semantic tree matches workspace,six native hashes,all last static outcomes and five restored audits pass,reference restored."
  findings:
    - "Exact semantic tree/10paths reviewed.782 new cases;363 prior files/362 byte-identical/only generic-helper syntax change,all prior expectations unchanged.243 existing states/defaults/exceptions preserved,new docedt wholly unverified. First application coverage100%,unchanged production. Exact failed-only576+1 cases closed,zero passing replays. Audit collector initially exceeded the default git-show buffer on the provenance manifest;only that readonly audit was repeated with a bounded32MiB buffer and passed."
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
  -
    type: "verify"
    at: "2026-10-05T04:50:41.558Z"
    author: "CODER"
    state: "ok"
    note: "Verified native body-text cross deletion/survivor/history and selected mode5 at 07ea47010148bf373c2cb691eb6ce56120109adf. One full absent profile,application first coverage100%;exact failed-only576+1 closure,zero passing replay. Six static andfive restored audits pass;363 old files/362 identical/only generic-helper syntax. Inventory cumulative source/count closure documented,not fresh full measurement. Same-actor exactSHAquality pass. Registered deviations andexisting243states/defaults/exceptions unchanged,newmoduleunverified. Fullcore/UI parity remainsunverified;TextRun render boundary next priority."
doc_version: 3
doc_updated_at: "2026-10-05T04:50:41.648Z"
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
    - apps/office/src/sw/source/core/docnode/nodes.ts
    - apps/office/src/sw/source/core/txtnode/internet-node-transitions.test.ts
  Plan: "Port native sw_GetJoinFlags and sw_JoinText for registered same-section body text nodes in source-owned docedt.ts with actual SwPaM Exchange, native five-pair character preparation and JoinPrev BREAK/PAGEDESC clearing/copy. Add DocumentContentOperationsManager.DeleteAndJoin body-text kernel: normalize join flags, raw EraseText boundary tails/heads,remove intact middle nodes,correct collapsed point,join survivor chosen by source. Extend existing SwUndoDelete rather than introduce an alternative action: optional cross selection,raw m_aSttStr/m_aEndStr,m_bJoinNext,boundary whole-hint/direct-item/live-collection history,retained middle content,Undo raw-string restoration/NOHINTEXPAND plus forward history,Redo same DeleteAndJoin/TmpEnd reset,release retained area on disposal. Existing boundary node identity/cursor-reference and AppendTextNode zero-copy/InsertHint/zero-CopyAttr adapters remain unverified and require subsequent source-owned refactoring;no whole native structural history claim. Replace shell fragment-action list with one SwUndoDelete,normalized native Undo selection orientation;unify marked insertion into DeleteAtCursor result then createWriterInsertTextAction force5 on actual surviving cursor node in one Replace StartUndo/EndUndo notification transaction. Preserve same-node/collapsed/import/paste contracts and registered I/O/recovery deviations. Add literal independent real-owner range/direction/survivor/whole-hint/direct/meta/history/force5/zero-retention/nested/notifications tests;old tests unchanged except exact first-profile source-contradicted cases,document explicitly. Register one new source-owned module whollyunverified,append only bounded mappings/notes,all existing243states/defaults/exceptions preserved. Six static gates first;one sequential full build/appcoverage/inventory/scripts/Chromium while upstream unavailable with finally restore. Export first appcoverage JSON into ignored repository app cache for cumulative coverage merging if only failed/new cases need replay;Agentplane keeps bounded counts/hashes/commands/exactnames/prose only,no sources/helpers/rawdiagnostics. Persist exactfailednames before any assertions after each gate/replay;repeat only failed gates/cases plus newly added unexecuted cases,zero passing replay. Restore before five source audits,scope/nativehash/exactSHA sameactor readonly quality,doctor/routing/CODERverification/canonicalfinish. No network/outside/global/subagents;oneleaf137 only,goalactive. Generalize existing SwNodes.insertTextNodeAfter predecessor parameter to actual SwNode so JoinPrev undo can reconnect retained leading boundaries after the real body start sentinel without a temporary paragraph or index cast;existing insertion body unchanged. First static typecheck observes the prior transition test helper incorrectly accepts only SwTextNode while its existing history case supplies SwTextINetFormat. Make that existing helper generic without changing any prior expectations; this is the sole pre-profile prior-test syntax correction."
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
  Verification: |-
    Command: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size.
    Result: pass after only failed typecheck/documentation corrections.
    Evidence: static-gates.json preserves initial failures and final successful outcomes. changed-test-static-checks.json verifies changed-test formatting/lint and application type syntax after the test probe correction.
    Scope: ten semantic paths; prior transition helper syntax is generic, all prior test expectations unchanged.

    Command: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure --coverage.reporter=text --coverage.reporter=json-summary --coverage.reporter=html --coverage.reporter=json; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts.
    Result: one sequential full upstream-absent profile; all first observed failures closed by exact failed-only selection.
    Evidence: absent-profile.json records first buildpass, application11280pass/576fail of11856 in281 files, first instrumented100%lines/statements/functions/branches,inventory108pass/1fail of109 in36files,scripts5pass,Chromium99pass. failed-only-replay.json records exact576 new failed app names once passed576/skipped206 and exact sole inventory failed name once passed1/skipped2. Selected-name hashes agree with first failed names.782 independent new cases;206 passed first and576 passed once after correcting the test to observe actual surviving-node InsertText mode5. Inventory row inserted in canonical lexical order. Production hashes unchanged after the full profile. All references restored in finally;no source/scope/Agentplane audits concurrent with tests,zero passing-case/suite/build replays.
    Scope: registered body-text boundary selection in both directions,0/1/3 middle nodes,AUTO/INET whole-hint fresh history,live collections/direct items,survivor,canonical Undo direction,two cycles and Delete/Insert/Replace/composition inputs,retention disposal,nested history and structural guards.

    Command: first-full application coverage plus failed-only inventory instrumented cumulative closure.
    Result: pass for unchanged application production100%and documented inventory cumulative closure.
    Evidence: initial-coverage-counts.json application100%allfour/no incomplete files;full count-map retained only in ignored application cache and its hash preserved. inventory-initial-coverage-counts.json records first lines99.72/statements99.73/functions99.21/branches100. inventory-cumulative-coverage.json records sole incomplete unchanged parity-mapping-cli source:four missing statement/line positions125,130,140,159 instrumented with positive counts by sole failed-case replay;all six functions instrumented,three previously missed functions closed;first-full100%branches retained. First inventory raw count-map was not exported;no raw map union or fresh full post-fix V8 report claimed. Isolated diagnostic thresholds0 leave repository100%configuration unchanged.
    Scope: no inventory production edits or passing replay.

    Command: npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity.
    Result: five passed after reference restoration.
    Evidence: restored-source-audits.json;semantic violations0.
    Scope: source-only audits;test/runtime/E2E do not use pinned upstream.

    Command: ap doctor; node .agentplane/policy/check-routing.mjs; scope/native hash/readonly exact semanticSHA audit;ignored-inclusiveAgentplane scan.
    Result: pass;doctor0errors/two unchanged warnings;routingpass;3975files/zero forbidden before quality.
    Evidence: scope-and-native-hashes.json;.agentplane/tasks/202610050412-SVPVCD/quality/20261005-044921712-recovery-context/quality-report.json. Completed same-actor read-only review of exact 07ea47010148bf373c2cb691eb6ce56120109adf,not independent evaluation. Collector initially exceeded default git-show buffer on provenance JSON;only readonly audit retried with32MiB andpassed,latest quality report supersedes earlier prematurely recorded report. Ten semantic paths;363 prior files/362 byte-identical/only generic helper syntax changed,all old expectations intact.782 newcases;243 old runtime states/defaults/exceptions unchanged,new docedt wholly unverified,ten bounded note appendices,six native hashes.
    Scope: native body-text join flags/survivor selection,raw-boundary single SwUndoDelete history and selected insertion mode5. Existing boundary object identity/cursor references,AppendTextNode cloning,zero-length CopyAttr,full native structural/ring/redline/bookmark/field/layout history remain unverified. UI editing already routes to real SwEditWin/SwWrtShell/SwDoc;TextRun display projection remains and is next priority. Registered save/open/recovery deviations unchanged;whole-module and overall core/UI parity unverified;goalactive.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-05T04:50:41.558Z — VERIFY — ok

    By: CODER

    Note: Verified native body-text cross deletion/survivor/history and selected mode5 at 07ea47010148bf373c2cb691eb6ce56120109adf. One full absent profile,application first coverage100%;exact failed-only576+1 closure,zero passing replay. Six static andfive restored audits pass;363 old files/362 identical/only generic-helper syntax. Inventory cumulative source/count closure documented,not fresh full measurement. Same-actor exactSHAquality pass. Registered deviations andexisting243states/defaults/exceptions unchanged,newmoduleunverified. Fullcore/UI parity remainsunverified;TextRun render boundary next priority.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-05T04:50:15.284Z, excerpt_hash=sha256:79c83b98cbd225b9aed7d89740a8edba5778059d697a7b5886df88b2c859a094

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610050412-SVPVCD/blueprint/resolved-snapshot.json
    - old_digest: 0772bc3c216d62244be9fbbb1e426cc06ce42207bcb6828a71f8a5a444eb6364
    - current_digest: 0772bc3c216d62244be9fbbb1e426cc06ce42207bcb6828a71f8a5a444eb6364
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610050412-SVPVCD

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610050412-SVPVCD
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the semantic leaf commit without history rewriting."
  Findings: |-
    Iteration137preflight clean main fa31cccfa1af22bd3320c081a43706c30a314d73,direct,onlyparentactive;136verifiedprogress DONE. Four matched policies loaded,user-instructions absent. Pin26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. Existingcross deletes multiple fragment SwUndoReplace actions then repeatedly joins into firstnode;selectedcross Insert passes falseforce. Native docedt.cxx329 normalizespoint/mark andchooses end survivor whenstart0/endleavessuffix,360joinPrev Break/PageDesc andchar preparation. DocumentContentOperationsManager.cxx4557 flags thenDeleteRangeImpl andJoinText;undel.cxx247 JoinNext flag,455rawfirsttail/endhead+wholeboundaryhints/directsets,269collectionhistory,1043freshhistory,1233TmpEnd reset. Existingcursor/retainedboundaryidentity/AppendTextNodeclone mechanisms remain source gaps and will be explicitly retainedunverified for this bounded body-text deletion correction.136fullcoverage measured99.97 withcumulativeproof only;137firstcoverageJSONwill preserve countmap for instrumented cumulative closure rather than lose payload. No old test edits before first-profile observations.

    Implementation: native body-text sw_GetJoinFlags/SwPaM Exchange and sw_JoinText select the source-defined surviving boundary. One SwUndoDelete owns raw boundary strings, whole boundary native hint/direct-item/collection history and retained middle nodes. Selected Insert/Replace/composition apply mode5 to the actual surviving node within one Replace list. SwNodes accepts an actual predecessor node, including the body start sentinel. Existing boundary object identity, AppendTextNode cloning and zero-length CopyAttr are retained explicitly unverified adapters; full structural node-index/ring/bookmark/redline/field/layout/history parity remains unverified.

    Command: six static gates, changed-test formatting/lint/application typecheck, one sequential upstream-absent build/application coverage/inventory coverage/script/Chromium profile, exact failed-only replay, five restored source audits, doctor/routing and scope/native hash review.
    Result: pass after bounded test-probe and manifest-order corrections. First typecheck exposed a prior required-node helper used with a text attribute; make the helper generic without changing any existing expectation. Initial documentation gate required three new callback comments. Application first profile 11280 passed and576 failed of11856 in281 files; all failures were new cases observing the wrong manager insertion seam. SwUndoInsert calls the actual target node InsertText, whose mode5 is now observed. Exact576 failed names replayed once passed576/skipped206. Inventory first108 passed/1 failed of109 in36 files because the new module row was not lexicographically inserted; sort both manifests without changing old row content. Exact sole failed name replayed once passed1/skipped2. Build, scripts5 andChromium99 passed first. No passing test, suite or build replay; all upstream-absent invocations restored the reference in finally and no source/scope/Agentplane audit ran concurrently with them.
    Evidence: static-gates.json; changed-test-static-checks.json; absent-profile.json; failed-only-replay.json; initial-coverage-counts.json; inventory-initial-coverage-counts.json; inventory-cumulative-coverage.json; restored-source-audits.json; scope-and-native-hashes.json. Application first full instrumented coverage100% in all four metrics; production hashes unchanged after profile and full count-map retained only in ignored application cache. Inventory initial lines99.72/statements99.73/functions99.21/branches100; sole failed-case actual counts close four missing statements/lines and three functions, while retaining initially covered branches. First inventory raw map was not exported by configured reporters; cumulative source/count closure is documented and is not a fresh full V8 measurement or raw map union. Isolated diagnostic thresholds0 leave repository100%configuration unchanged.
    Scope: ten semantic paths,782 new independent cases,363 prior test files with362 byte-identical and the remaining helper changed only in generic type syntax. Existing243 runtime semantic states/defaults/exceptions unchanged, one wholly unverified docedt row added, ten bounded note appendices. Six native file hashes recorded. Doctor0errors/two unchanged warnings; routing passed. Ignored-inclusive Agentplane scan3975 files/zero forbidden before quality. No upstream sources/helpers/Python/native probes/raw diagnostics stored in Agentplane; no network or outside/global file access. Existing broad goal remains active and full core/browser parity remains unverified.

    Read-only follow-up finding from user steering: ordinary browser edit events already use BrowserWriterEditWindow -> SwEditWin -> SwWrtShell with actual SwDoc/SwPaM. Presentation still projects nodes into WriterTextRun DTOs for paragraph/table rendering. Next priority is a source-owned layout/text-portion display boundary with browser DOM/event/geometry adaptation; direct mutable React model access alone is not upstream parity. No UI architecture change is included in this leaf.
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
- apps/office/src/sw/source/core/docnode/nodes.ts
- apps/office/src/sw/source/core/txtnode/internet-node-transitions.test.ts

## Plan

Port native sw_GetJoinFlags and sw_JoinText for registered same-section body text nodes in source-owned docedt.ts with actual SwPaM Exchange, native five-pair character preparation and JoinPrev BREAK/PAGEDESC clearing/copy. Add DocumentContentOperationsManager.DeleteAndJoin body-text kernel: normalize join flags, raw EraseText boundary tails/heads,remove intact middle nodes,correct collapsed point,join survivor chosen by source. Extend existing SwUndoDelete rather than introduce an alternative action: optional cross selection,raw m_aSttStr/m_aEndStr,m_bJoinNext,boundary whole-hint/direct-item/live-collection history,retained middle content,Undo raw-string restoration/NOHINTEXPAND plus forward history,Redo same DeleteAndJoin/TmpEnd reset,release retained area on disposal. Existing boundary node identity/cursor-reference and AppendTextNode zero-copy/InsertHint/zero-CopyAttr adapters remain unverified and require subsequent source-owned refactoring;no whole native structural history claim. Replace shell fragment-action list with one SwUndoDelete,normalized native Undo selection orientation;unify marked insertion into DeleteAtCursor result then createWriterInsertTextAction force5 on actual surviving cursor node in one Replace StartUndo/EndUndo notification transaction. Preserve same-node/collapsed/import/paste contracts and registered I/O/recovery deviations. Add literal independent real-owner range/direction/survivor/whole-hint/direct/meta/history/force5/zero-retention/nested/notifications tests;old tests unchanged except exact first-profile source-contradicted cases,document explicitly. Register one new source-owned module whollyunverified,append only bounded mappings/notes,all existing243states/defaults/exceptions preserved. Six static gates first;one sequential full build/appcoverage/inventory/scripts/Chromium while upstream unavailable with finally restore. Export first appcoverage JSON into ignored repository app cache for cumulative coverage merging if only failed/new cases need replay;Agentplane keeps bounded counts/hashes/commands/exactnames/prose only,no sources/helpers/rawdiagnostics. Persist exactfailednames before any assertions after each gate/replay;repeat only failed gates/cases plus newly added unexecuted cases,zero passing replay. Restore before five source audits,scope/nativehash/exactSHA sameactor readonly quality,doctor/routing/CODERverification/canonicalfinish. No network/outside/global/subagents;oneleaf137 only,goalactive. Generalize existing SwNodes.insertTextNodeAfter predecessor parameter to actual SwNode so JoinPrev undo can reconnect retained leading boundaries after the real body start sentinel without a temporary paragraph or index cast;existing insertion body unchanged. First static typecheck observes the prior transition test helper incorrectly accepts only SwTextNode while its existing history case supplies SwTextINetFormat. Make that existing helper generic without changing any prior expectations; this is the sole pre-profile prior-test syntax correction.

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

Command: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size.
Result: pass after only failed typecheck/documentation corrections.
Evidence: static-gates.json preserves initial failures and final successful outcomes. changed-test-static-checks.json verifies changed-test formatting/lint and application type syntax after the test probe correction.
Scope: ten semantic paths; prior transition helper syntax is generic, all prior test expectations unchanged.

Command: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure --coverage.reporter=text --coverage.reporter=json-summary --coverage.reporter=html --coverage.reporter=json; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts.
Result: one sequential full upstream-absent profile; all first observed failures closed by exact failed-only selection.
Evidence: absent-profile.json records first buildpass, application11280pass/576fail of11856 in281 files, first instrumented100%lines/statements/functions/branches,inventory108pass/1fail of109 in36files,scripts5pass,Chromium99pass. failed-only-replay.json records exact576 new failed app names once passed576/skipped206 and exact sole inventory failed name once passed1/skipped2. Selected-name hashes agree with first failed names.782 independent new cases;206 passed first and576 passed once after correcting the test to observe actual surviving-node InsertText mode5. Inventory row inserted in canonical lexical order. Production hashes unchanged after the full profile. All references restored in finally;no source/scope/Agentplane audits concurrent with tests,zero passing-case/suite/build replays.
Scope: registered body-text boundary selection in both directions,0/1/3 middle nodes,AUTO/INET whole-hint fresh history,live collections/direct items,survivor,canonical Undo direction,two cycles and Delete/Insert/Replace/composition inputs,retention disposal,nested history and structural guards.

Command: first-full application coverage plus failed-only inventory instrumented cumulative closure.
Result: pass for unchanged application production100%and documented inventory cumulative closure.
Evidence: initial-coverage-counts.json application100%allfour/no incomplete files;full count-map retained only in ignored application cache and its hash preserved. inventory-initial-coverage-counts.json records first lines99.72/statements99.73/functions99.21/branches100. inventory-cumulative-coverage.json records sole incomplete unchanged parity-mapping-cli source:four missing statement/line positions125,130,140,159 instrumented with positive counts by sole failed-case replay;all six functions instrumented,three previously missed functions closed;first-full100%branches retained. First inventory raw count-map was not exported;no raw map union or fresh full post-fix V8 report claimed. Isolated diagnostic thresholds0 leave repository100%configuration unchanged.
Scope: no inventory production edits or passing replay.

Command: npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity.
Result: five passed after reference restoration.
Evidence: restored-source-audits.json;semantic violations0.
Scope: source-only audits;test/runtime/E2E do not use pinned upstream.

Command: ap doctor; node .agentplane/policy/check-routing.mjs; scope/native hash/readonly exact semanticSHA audit;ignored-inclusiveAgentplane scan.
Result: pass;doctor0errors/two unchanged warnings;routingpass;3975files/zero forbidden before quality.
Evidence: scope-and-native-hashes.json;.agentplane/tasks/202610050412-SVPVCD/quality/20261005-044921712-recovery-context/quality-report.json. Completed same-actor read-only review of exact 07ea47010148bf373c2cb691eb6ce56120109adf,not independent evaluation. Collector initially exceeded default git-show buffer on provenance JSON;only readonly audit retried with32MiB andpassed,latest quality report supersedes earlier prematurely recorded report. Ten semantic paths;363 prior files/362 byte-identical/only generic helper syntax changed,all old expectations intact.782 newcases;243 old runtime states/defaults/exceptions unchanged,new docedt wholly unverified,ten bounded note appendices,six native hashes.
Scope: native body-text join flags/survivor selection,raw-boundary single SwUndoDelete history and selected insertion mode5. Existing boundary object identity/cursor references,AppendTextNode cloning,zero-length CopyAttr,full native structural/ring/redline/bookmark/field/layout history remain unverified. UI editing already routes to real SwEditWin/SwWrtShell/SwDoc;TextRun display projection remains and is next priority. Registered save/open/recovery deviations unchanged;whole-module and overall core/UI parity unverified;goalactive.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-05T04:50:41.558Z — VERIFY — ok

By: CODER

Note: Verified native body-text cross deletion/survivor/history and selected mode5 at 07ea47010148bf373c2cb691eb6ce56120109adf. One full absent profile,application first coverage100%;exact failed-only576+1 closure,zero passing replay. Six static andfive restored audits pass;363 old files/362 identical/only generic-helper syntax. Inventory cumulative source/count closure documented,not fresh full measurement. Same-actor exactSHAquality pass. Registered deviations andexisting243states/defaults/exceptions unchanged,newmoduleunverified. Fullcore/UI parity remainsunverified;TextRun render boundary next priority.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-05T04:50:15.284Z, excerpt_hash=sha256:79c83b98cbd225b9aed7d89740a8edba5778059d697a7b5886df88b2c859a094

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610050412-SVPVCD/blueprint/resolved-snapshot.json
- old_digest: 0772bc3c216d62244be9fbbb1e426cc06ce42207bcb6828a71f8a5a444eb6364
- current_digest: 0772bc3c216d62244be9fbbb1e426cc06ce42207bcb6828a71f8a5a444eb6364
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610050412-SVPVCD

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610050412-SVPVCD
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the semantic leaf commit without history rewriting.

## Findings

Iteration137preflight clean main fa31cccfa1af22bd3320c081a43706c30a314d73,direct,onlyparentactive;136verifiedprogress DONE. Four matched policies loaded,user-instructions absent. Pin26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. Existingcross deletes multiple fragment SwUndoReplace actions then repeatedly joins into firstnode;selectedcross Insert passes falseforce. Native docedt.cxx329 normalizespoint/mark andchooses end survivor whenstart0/endleavessuffix,360joinPrev Break/PageDesc andchar preparation. DocumentContentOperationsManager.cxx4557 flags thenDeleteRangeImpl andJoinText;undel.cxx247 JoinNext flag,455rawfirsttail/endhead+wholeboundaryhints/directsets,269collectionhistory,1043freshhistory,1233TmpEnd reset. Existingcursor/retainedboundaryidentity/AppendTextNodeclone mechanisms remain source gaps and will be explicitly retainedunverified for this bounded body-text deletion correction.136fullcoverage measured99.97 withcumulativeproof only;137firstcoverageJSONwill preserve countmap for instrumented cumulative closure rather than lose payload. No old test edits before first-profile observations.

Implementation: native body-text sw_GetJoinFlags/SwPaM Exchange and sw_JoinText select the source-defined surviving boundary. One SwUndoDelete owns raw boundary strings, whole boundary native hint/direct-item/collection history and retained middle nodes. Selected Insert/Replace/composition apply mode5 to the actual surviving node within one Replace list. SwNodes accepts an actual predecessor node, including the body start sentinel. Existing boundary object identity, AppendTextNode cloning and zero-length CopyAttr are retained explicitly unverified adapters; full structural node-index/ring/bookmark/redline/field/layout/history parity remains unverified.

Command: six static gates, changed-test formatting/lint/application typecheck, one sequential upstream-absent build/application coverage/inventory coverage/script/Chromium profile, exact failed-only replay, five restored source audits, doctor/routing and scope/native hash review.
Result: pass after bounded test-probe and manifest-order corrections. First typecheck exposed a prior required-node helper used with a text attribute; make the helper generic without changing any existing expectation. Initial documentation gate required three new callback comments. Application first profile 11280 passed and576 failed of11856 in281 files; all failures were new cases observing the wrong manager insertion seam. SwUndoInsert calls the actual target node InsertText, whose mode5 is now observed. Exact576 failed names replayed once passed576/skipped206. Inventory first108 passed/1 failed of109 in36 files because the new module row was not lexicographically inserted; sort both manifests without changing old row content. Exact sole failed name replayed once passed1/skipped2. Build, scripts5 andChromium99 passed first. No passing test, suite or build replay; all upstream-absent invocations restored the reference in finally and no source/scope/Agentplane audit ran concurrently with them.
Evidence: static-gates.json; changed-test-static-checks.json; absent-profile.json; failed-only-replay.json; initial-coverage-counts.json; inventory-initial-coverage-counts.json; inventory-cumulative-coverage.json; restored-source-audits.json; scope-and-native-hashes.json. Application first full instrumented coverage100% in all four metrics; production hashes unchanged after profile and full count-map retained only in ignored application cache. Inventory initial lines99.72/statements99.73/functions99.21/branches100; sole failed-case actual counts close four missing statements/lines and three functions, while retaining initially covered branches. First inventory raw map was not exported by configured reporters; cumulative source/count closure is documented and is not a fresh full V8 measurement or raw map union. Isolated diagnostic thresholds0 leave repository100%configuration unchanged.
Scope: ten semantic paths,782 new independent cases,363 prior test files with362 byte-identical and the remaining helper changed only in generic type syntax. Existing243 runtime semantic states/defaults/exceptions unchanged, one wholly unverified docedt row added, ten bounded note appendices. Six native file hashes recorded. Doctor0errors/two unchanged warnings; routing passed. Ignored-inclusive Agentplane scan3975 files/zero forbidden before quality. No upstream sources/helpers/Python/native probes/raw diagnostics stored in Agentplane; no network or outside/global file access. Existing broad goal remains active and full core/browser parity remains unverified.

Read-only follow-up finding from user steering: ordinary browser edit events already use BrowserWriterEditWindow -> SwEditWin -> SwWrtShell with actual SwDoc/SwPaM. Presentation still projects nodes into WriterTextRun DTOs for paragraph/table rendering. Next priority is a source-owned layout/text-portion display boundary with browser DOM/event/geometry adaptation; direct mutable React model access alone is not upstream parity. No UI architecture change is included in this leaf.
