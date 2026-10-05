---
id: "202610050616-VQX14V"
title: "Use native node ranges and delta undo for Writer list levels"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 12
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
  state: "ok"
  updated_at: "2026-10-05T06:45:56.616Z"
  updated_by: "CODER"
  note: "Verified b1ea7a3e9e0c3e0c3f2d6ddeba09304dc3efb1cb:native cell/body list-level ranges and signed-delta undo;one absent profile plus exact app/inventory failed-only closure,firstapp100,cumulativeinventory100,102Chromium firstpass. Prior assertions and244states preserved;progress only."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-05T06:44:59.536Z"
  updated_by: "EVALUATOR"
  note: "Verified progress on exact b1ea7a3e9e0c3e0c3f2d6ddeba09304dc3efb1cb:native actual-node list-level range and signed-delta undo;one absent profile plus exact app/inventory failed-case closure. Same-actor readonly quality phase,not independent review;full parity unverified."
  evaluated_sha: "b1ea7a3e9e0c3e0c3f2d6ddeba09304dc3efb1cb"
  blueprint_digest: "c94e6e36725f9100d6c7229eb6f7064517d083068e712d3ea47a3b0a2c2a7d51"
  evidence_refs:
    - ".agentplane/tasks/202610050616-VQX14V/README.md"
    - ".agentplane/tasks/202610050616-VQX14V/quality/20261005-064459536-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610050616-VQX14V/quality/20261005-064459536-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610050616-VQX14V/quality/20261005-064459536-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610050616-VQX14V/blueprint/resolved-snapshot.json"
    - "b1ea7a3e9e0c3e0c3f2d6ddeba09304dc3efb1cb"
    - ".agentplane/tasks/202610050616-VQX14V/evidence/scope-and-native-hashes.json"
    - ".agentplane/tasks/202610050616-VQX14V/evidence/absent-profile.json"
    - ".agentplane/tasks/202610050616-VQX14V/evidence/failed-only-replay.json"
    - ".agentplane/tasks/202610050616-VQX14V/evidence/cumulative-coverage.json"
    - ".agentplane/tasks/202610050616-VQX14V/evidence/static-gates.json"
    - ".agentplane/tasks/202610050616-VQX14V/evidence/changed-source-static-checks.json"
    - ".agentplane/tasks/202610050616-VQX14V/evidence/restored-source-audits.json"
  findings:
    - "Eleven approved semantic paths only. Doc-owned inclusive SwNodes range and all-node derived-level validation replace body-only traversal. Level setter preserves rule/listID/restart/count metadata. One SwUndoNumUpDown range/direction action replaces complete list snapshots and per-node grouping;inverse/forward history and native captions retained. Nine new app and one real cell Chromium contracts cover supported branch."
    - "369priorfiles368byteidentical;remaining old test has only obsolete->native class identity tokens. Mapping has one exact obsolete local class marker replacement;inventory test unchanged. App11891pass/1newgesturefail with first100fourmetrics,inventory108pass/1stale-markerfail;exact1+1failed closure passes with1+2skipped.102Chromium firstpass. Production unchanged after firstprofile;firstapp100 and actual unchanged-script cumulativeinventory100. All244states/defaults/exceptions unchanged,six native hashes."
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
  -
    type: "verify"
    at: "2026-10-05T06:45:56.616Z"
    author: "CODER"
    state: "ok"
    note: "Verified b1ea7a3e9e0c3e0c3f2d6ddeba09304dc3efb1cb:native cell/body list-level ranges and signed-delta undo;one absent profile plus exact app/inventory failed-only closure,firstapp100,cumulativeinventory100,102Chromium firstpass. Prior assertions and244states preserved;progress only."
doc_version: 3
doc_updated_at: "2026-10-05T06:45:56.696Z"
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
  Verification: |-
    CODER verified progress on semantic b1ea7a3e9e0c3e0c3f2d6ddeba09304dc3efb1cb:ordinary list-level commands use Doc-owned actual inclusive PaM/SwNodes coordinates and derived-level all-range validation,including cells;SetAttrListLevel changes only level. Body-only ednumber traversal,whole-list-item recreation,SwUndoNumLevel and per-node grouping removed. One native-shaped SwUndoNumUpDown range/direction action uses same document inverse/forward operation,preserves unrelated metadata and cursor direction,and has native labels. Nine new app/one Chromium contracts;all seven native core and one multi-cell UI firstpass,new hover-only case closes failed-only. Six static gates pass after observed new formatting/exact-option/JSDoc and obsolete old import failures;focused edited source/test/doc checks pass. ONE full absent profile:build0,app11891pass/1fail of11892/286files and first100fourmetrics,inventory108pass/1fail of109 with99.59/99.6/99.21/99.9metrics,scripts5pass,Chromium102pass. Exact1app+1inventory failed-only closure passes1/skipped1 and1/skipped2;zero passing/fullbuild repeats. New test corrected to existing native submenu hover;obsolete mapping class marker corrected only,inventory test unchanged. Both initial countmaps only ignored appcache;production source unchanged after firstprofile. Firstapp100 retained;actual unchanged-script first+failed countmaps merge inventory100fourmetrics,no summary substitution. All references restored in finally before five source audits,allpass/semanticviolations0. Scope369priorfiles368byteidentical;remaining old test changes only two class identity tokens. Existing244states/defaults/exceptions unchanged,no newmodule/promotion,sixnotes,sixnativehashes. Exact-SHA same-actor readonly audit exits0 beforequalitypass,not independent review. Quality .agentplane/tasks/202610050616-VQX14V/quality/20261005-064459536-recovery-context/quality-report.json. Doctor0errors/two preexisting warnings,routingpass,ignored-inclusive AP4019files0forbidden beforequality;finalscan follows parent persistence. Full native OutlineUpDown/style reassignment,mixed outline,merged/redline/layout expansion,selection rings,undo lifetime,list Enter/Backspace/continue and wide table navigation remain unverified. Registered I/O/recovery deviations unchanged;oneleaf140only,goalactive.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-05T06:45:56.616Z — VERIFY — ok

    By: CODER

    Note: Verified b1ea7a3e9e0c3e0c3f2d6ddeba09304dc3efb1cb:native cell/body list-level ranges and signed-delta undo;one absent profile plus exact app/inventory failed-only closure,firstapp100,cumulativeinventory100,102Chromium firstpass. Prior assertions and244states preserved;progress only.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-05T06:45:56.056Z, excerpt_hash=sha256:ec8fc5f5e8bf6395b0e3fb0d662a3248eb8fede9af0a460892516b78ad65473f

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610050616-VQX14V/blueprint/resolved-snapshot.json
    - old_digest: c94e6e36725f9100d6c7229eb6f7064517d083068e712d3ea47a3b0a2c2a7d51
    - current_digest: c94e6e36725f9100d6c7229eb6f7064517d083068e712d3ea47a3b0a2c2a7d51
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610050616-VQX14V

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610050616-VQX14V
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
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

CODER verified progress on semantic b1ea7a3e9e0c3e0c3f2d6ddeba09304dc3efb1cb:ordinary list-level commands use Doc-owned actual inclusive PaM/SwNodes coordinates and derived-level all-range validation,including cells;SetAttrListLevel changes only level. Body-only ednumber traversal,whole-list-item recreation,SwUndoNumLevel and per-node grouping removed. One native-shaped SwUndoNumUpDown range/direction action uses same document inverse/forward operation,preserves unrelated metadata and cursor direction,and has native labels. Nine new app/one Chromium contracts;all seven native core and one multi-cell UI firstpass,new hover-only case closes failed-only. Six static gates pass after observed new formatting/exact-option/JSDoc and obsolete old import failures;focused edited source/test/doc checks pass. ONE full absent profile:build0,app11891pass/1fail of11892/286files and first100fourmetrics,inventory108pass/1fail of109 with99.59/99.6/99.21/99.9metrics,scripts5pass,Chromium102pass. Exact1app+1inventory failed-only closure passes1/skipped1 and1/skipped2;zero passing/fullbuild repeats. New test corrected to existing native submenu hover;obsolete mapping class marker corrected only,inventory test unchanged. Both initial countmaps only ignored appcache;production source unchanged after firstprofile. Firstapp100 retained;actual unchanged-script first+failed countmaps merge inventory100fourmetrics,no summary substitution. All references restored in finally before five source audits,allpass/semanticviolations0. Scope369priorfiles368byteidentical;remaining old test changes only two class identity tokens. Existing244states/defaults/exceptions unchanged,no newmodule/promotion,sixnotes,sixnativehashes. Exact-SHA same-actor readonly audit exits0 beforequalitypass,not independent review. Quality .agentplane/tasks/202610050616-VQX14V/quality/20261005-064459536-recovery-context/quality-report.json. Doctor0errors/two preexisting warnings,routingpass,ignored-inclusive AP4019files0forbidden beforequality;finalscan follows parent persistence. Full native OutlineUpDown/style reassignment,mixed outline,merged/redline/layout expansion,selection rings,undo lifetime,list Enter/Backspace/continue and wide table navigation remain unverified. Registered I/O/recovery deviations unchanged;oneleaf140only,goalactive.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-05T06:45:56.616Z — VERIFY — ok

By: CODER

Note: Verified b1ea7a3e9e0c3e0c3f2d6ddeba09304dc3efb1cb:native cell/body list-level ranges and signed-delta undo;one absent profile plus exact app/inventory failed-only closure,firstapp100,cumulativeinventory100,102Chromium firstpass. Prior assertions and244states preserved;progress only.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-05T06:45:56.056Z, excerpt_hash=sha256:ec8fc5f5e8bf6395b0e3fb0d662a3248eb8fede9af0a460892516b78ad65473f

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610050616-VQX14V/blueprint/resolved-snapshot.json
- old_digest: c94e6e36725f9100d6c7229eb6f7064517d083068e712d3ea47a3b0a2c2a7d51
- current_digest: c94e6e36725f9100d6c7229eb6f7064517d083068e712d3ea47a3b0a2c2a7d51
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610050616-VQX14V

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610050616-VQX14V
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

Iteration139 classified verified progress DONE;current140 preflight clean main5c36a52c9781ce3e0b0c40aea351995217ebd930,direct,only parent active,user-instructions absent,four matched policies loaded. ednumber.getSelectedListNodes currently filters doc.paragraphs,so actual cell-node list level commands are disabled and ignored. It also recreates full list-item sets and groups node-local SwUndoNumLevel actions,unlike pinned docnum.cxx1846 inclusive native-node NumUpDown all-range validation/SetAttrListLevel and unnum.cxx256 SwUndoNumUpDown range/direction inverse operation. List shell and text indent share this owner,so fixing document range/undo improves both UI paths without another React adapter. Existing heading/outline style promotion is incomplete and not certified by this ordinary-list leaf. Standing user goal and explicit UI/list/table instruction authorize safe local correction;preserve all244states and registered deviations.

Iteration140 implements actual document-owned inclusive PaM/SwNodes numbering traversal,including cells and structural gaps,validates every selected derived list level before mutation and sets only native level. ednumber no longer filters body paragraphs or recreates whole list item sets. SwUndoNumLevel and per-node SfxListUndoAction grouping removed;one SwUndoNumUpDown retains range and direction,uses same Doc.NumUpDown inverse/forward operation and native Demote/Promote list level labels. Unrelated direct restart/count/rule/listID metadata survives level history;selection direction and constant five-unit range payload retained. Existing shell cursor protocol remains;full OutlineUpDown/style reassignment,mixed outline,merged/redline/layout expansion,selection rings and full native undo lifetime remain unverified. First static new formatting/TestingLibrary exact option and old undo-class import errors corrected;old test changed only two class-identity tokens,all other assertions retained. Two missing new JSDoc callbacks repaired. Six static gates pass;focused modified source/test formatting/lint and last metadata/test/doc checks pass. ONE full absent profile:buildpass,app11891pass/1fail of11892/286files with first100fourmetrics,inventory108pass/1fail of109 with99.59lines/99.6statements/99.21functions/99.9branches,scripts5pass,Chromium102pass including new actual cell list-level/indent/history/ODT case. Exact names persisted before collectors,both first JSON countmaps only ignored appcache. Newapp9cases8firstpass/1failed closure;all native core and multi-cell bindings contracts firstpass. Sole mounted failure used click instead of current submenu hover gesture;native same-menu Chromium passed,gesture fixed with assertions retained. Inventory failure identified obsolete mapping marker class SwUndoNumLevel;only local class marker renamed in existing mapping,docs/one omitted-name reference aligned,no inventory test changes. Exact1app+1inventory replay closes1pass/1skipped and1pass/2skipped,zero passing/fullbuild repeats and no production changes after firstprofile. Firstapp100 retained;actual unchanged-script first+failed countmap merge closesinventory100fourmetrics,no summary substitution. All renames restored in finally before five source audits,allpass/semanticviolations0. Scope369priorfiles368byteidentical;remaining old file differs only obsolete->native undo class name. All244states/defaults/exceptions/classifications unchanged,no newmodule/promotion,six bounded appendices,six native hashes;mapping otherwise byteidentical. Doctor0errors/two unchanged oldwarnings,routingpass,ignored-inclusive AP4019files0forbidden beforequality. Progress only,goalactive. No upstream/AP sources/helpers/Python/rawdiagnostics/probes added. AP persistence request with no remaining changed task artifacts returned E_COMMIT_ALLOW_NO_MATCH;route recomputed direct_execution,no retry/no source scope widening.
