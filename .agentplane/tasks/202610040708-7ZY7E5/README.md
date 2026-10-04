---
id: "202610040708-7ZY7E5"
title: "Round explicit Writer ruler tab anchors to native pixels"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 19
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-04T07:18:34.050Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "needs_rework"
  updated_at: "2026-10-04T07:23:42.312Z"
  updated_by: "CODER"
  note: "Final app1176/inventory109/scripts5 pass;69oldChromium pass. Only2newE2Efixtures wrongly place Default first;correct owned fixture,rerun only2failed browsercases absent. No product/scope/gate changes."
  attempts: 2
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement approved explicit-tab pixel projection under standing goal;preserve logical values and single absent-upstream verification."
events:
  -
    type: "status"
    at: "2026-10-04T07:10:08.457Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved explicit-tab pixel projection under standing goal;preserve logical values and single absent-upstream verification."
  -
    type: "verify"
    at: "2026-10-04T07:17:32.900Z"
    author: "PLANNER"
    state: "needs_rework"
    note: "Single absent application gate failed2 old callback expectations237->231 from rounded physical origin;all13newcases pass. Scope update required before two owned fixture corrections;unrun later gates remain pending."
  -
    type: "verify"
    at: "2026-10-04T07:23:42.312Z"
    author: "CODER"
    state: "needs_rework"
    note: "Final app1176/inventory109/scripts5 pass;69oldChromium pass. Only2newE2Efixtures wrongly place Default first;correct owned fixture,rerun only2failed browsercases absent. No product/scope/gate changes."
doc_version: 3
doc_updated_at: "2026-10-04T07:23:42.363Z"
doc_updated_by: "CODER"
description: "Iteration95: use inspected SvxRuler ConvertHPosPixel/VCL signed rounding for complete explicit tab origins at CSS96dpi. Preserve raw logical item positions and typed hit ownership;add real model/DOM/Undo and Chromium rounding cases. One absent-upstream test pass;separate static source audits."
sections:
  Summary: "Iteration95 projects existing explicit Writer ruler tab anchors through the inspected SvxRuler/VCL signed pixel conversion at CSS96dpi,sharing the existing default-tab rounder."
  Scope: |-
    apps/office/src/sw/browser/presentation/WriterRulers.tsx
    apps/office/src/sw/browser/presentation/writer-view-ruler-tab-pixels.test.tsx
    apps/office/e2e/writer-ruler-tab-pixels.spec.ts
    apps/office/e2e/writer-ruler-tab-glyphs.spec.ts
    apps/office/e2e/writer-ruler-tab-identity.spec.ts
    apps/office/src/sw/browser/presentation/WriterPageLayout.test.tsx
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
    Revised scope:exactly8semanticpaths pluscanonical records/bounded evidence.292prior tests:289byte-identical;3oldfiles permit exactly7assertion replacements:5postdrag fractionalbrowsercoordinates->integer218,and2WriterPageLayout callbacks237->231. Allother assertions/bytes retained.220rows/order/status/owner/default/exception fields preserved;1append-onlyrow update. No core/projection/snapalgorithm/config changes,network/outside/global/native execution/APsources/helpers.
  Plan: |-
    Implement one explicit tab pixel-projection correction:use existing toRulerPixel on complete origin+logical stop before typed RulerHandle admission/render/tracking;preserve immutable raw-index/point records,model metadata/general paragraph positions and undo ownership. Add real model/DOM/Undo cases for alltypes,fractional positive/negative/zero/extreme coordinates and bothoriginsettings;new Chromium1280/390 fixture verifies actual rounded glyph/hitanchor,cancel/no-motion/move/undo/reprojection. Update exactly5 obsolete postdrag assertions across2oldE2E files to exact native integer positions;allother oldbytes/assertions retained. Append one existing WriterRulers row per220-row manifest without promotion. Run all static checks and one absent-upstream suite pass;source audits separately;exact semanticSHA same-actor evaluator andcleanfinish;parent staysDOING.
    Revised afterfailed appgate:include WriterPageLayout.test.tsx and change exactly2old rounded-origin callback expectations237->231. Scope8paths,3oldfixtures/7expectation updates,289of292oldtests identical. Preserveallotherbytes/assertions andexisting snapalgorithm. Repeatonlyfailed appcoveragegate;inventory/scripts/Chromium notyet run. No scope/risk/acceptance weakening;standinggoal authorizes local correction.
  Verify Steps: "Read ap task verify-show;read-only inspect pinned SvxRuler ConvertHPosPixel/UpdateTabs and VCL lcl_logicToPixel,record2filehashes/markers/conclusions only,no native execution. No baseline/focused tests. Run format:check,lint,typecheck,check:dependencies,test:static,check:docs,check:file-size. Rename vendor/libreoffice-reference insidevendor;run npm run test once(app/inventorycoverage),npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts once,and npm run test:e2e once;restorefinally. Only failed corrected gates may rerun;the firstappcoveragegatefailed2oldcallbackassertions so rerun thisfailedgate aftercorrection,then run unruninventory/scripts/browser once,tests alwaysabsent,no passing-suite duplicates. Afterrestore separately run generator--check,source-tree,provenance,invariants,parityCLI;require100%4app/inventorycoverage,0semanticviolations. New realprojection/DOM cases cover Left/Right/Center/Decimal integeranchors,complete-origin rounding,positive/negative/zero/signed32endpoints,relativeflag,falseorigin,model/history/frozenDTO preservation,and accepted/cancelled/no-motion/rawindex/Undo behavior. Chromium1280/390 checks rounded anchors/typed actualhitbounds,clickownership andoneUndo/Redo plusactualscreenshots. Exactscope8paths,292prior tests/289identical/3oldfiles exact7expectation replacements(5E2Eintegeranchors,2rounded-startcallbacks),220rows each1append-onlyupdate/no promotion,2pinnedhashes unchanged. Ignored-inclusive AP source/helper/Python/native/archive/rawframes/codediff audit0;only boundedresults/hashes/conclusions. Routing/doctor pass;exact-SHA same-actor EVALUATOR andcleanfinish;fullgoalactive."
  Verification: |-
    Pending single absent-upstream tests and separate static audits;no tests run.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-04T07:17:32.900Z — VERIFY — needs_rework

    By: PLANNER

    Note: Single absent application gate failed2 old callback expectations237->231 from rounded physical origin;all13newcases pass. Scope update required before two owned fixture corrections;unrun later gates remain pending.
    Attempts: 1

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-04T07:17:32.539Z, excerpt_hash=sha256:2541a578452435830a87cd8c779fc52600944362ec6989fd6427a2c174401a5c

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610040708-7ZY7E5/blueprint/resolved-snapshot.json
    - old_digest: 58ea296b5f58168841bb37ab237797a6b05ec6d749f3d822aabe73803f7e860b
    - current_digest: 58ea296b5f58168841bb37ab237797a6b05ec6d749f3d822aabe73803f7e860b
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610040708-7ZY7E5

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610040708-7ZY7E5 -m 🧩 7ZY7E5 task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-10-04T07:23:42.312Z — VERIFY — needs_rework

    By: CODER

    Note: Final app1176/inventory109/scripts5 pass;69oldChromium pass. Only2newE2Efixtures wrongly place Default first;correct owned fixture,rerun only2failed browsercases absent. No product/scope/gate changes.
    Attempts: 2

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-04T07:23:41.961Z, excerpt_hash=sha256:5951fdab32d15f7c4f6518dba225b95b90290dcd78482f107795120a7976f430

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610040708-7ZY7E5/blueprint/resolved-snapshot.json
    - old_digest: 58ea296b5f58168841bb37ab237797a6b05ec6d749f3d822aabe73803f7e860b
    - current_digest: 58ea296b5f58168841bb37ab237797a6b05ec6d749f3d822aabe73803f7e860b
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610040708-7ZY7E5

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610040708-7ZY7E5 -m 🧩 7ZY7E5 task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert isolated semantic commit if needed;restore temporarily renamedvendor infinally. No historyrewrite."
  Findings: |-
    Previousgoalturn is verifiedprogress:iteration94DONE semantic4602af9e,currentcleanmain dac71556. Read-only evidence confirms nativeexplicit UpdateTabs uses ConvertHPosPixel ofcomplete tab origin+offset,andLogicToPixel usesllround;local explicitmarkers retainfractional division. Correct displayed/hit/tracking anchoronly;model stayslogical. Two oldChromium fixtures explicitlyassert obsoletefractional postdragposition;replace5expectations with exactrounded218 while preserving allother assertions/bytes. Nativefull geometry/RTL/vertical/systemDPI/theme/hitpriority/snap/modifiers/capture/selector/fullnative andparent parity remainunverified. Registered save/open/recovery deviations preserved.
    First single absent-upstream application coverage gate failed only2old WriterPageLayout tab-drag assertions:expected237,actual231 from the newly rounded initial physical anchor;1174/1176pass including all13newcases. Inventory/scripts/Chromium didnotrun because orchestration stopped at failed gate,vendor restored in finally. Bounded failure exit/hash/counts only retained;raw diagnostic frames remain outsideAP. Source/domain inspection validates the fixture's initial1974twips rounds132px;the existing 1mm snapped endpoint yields231 rather than fractional-start237. Re-approve oneadditional priorfixturepath and exactly2callback expectations before correction;no snapping algorithm/core/gate/config changes. Allpassing suites willnot be rerun;failedapplicationcoveragegate mustrerun to produce currentcoverage,then unruninventory/scripts/browser. Standinggoal authorizes this local expectation correction;ORCHESTRATOR approves revised exact scope.
    Corrected appgate passed1176app/222files andunrun109inventory/36files+5scripts/2files firstpass. FirstChromiumgatepassed69oldscenarios;only2newpixel cases failed:nointeractive tabs afterODTimport because the fixture puts Defaultfirst,whose source-compatible importcontainer selects onlythatfirstDefault andskipslater explicitstops (owned xmltabi sourceconfirmed). Remove onlythe newE2Efixture'sDefaultstop;retain hidden-Default/rawindexcoverage in13passing ownedunitcases. No product/import/gate/config change,no scopeexpansion,no expectationweakening. Repeatonlythese2failed Chromiumcases with upstreamabsent;do notrerun69passingbrowser/app/inventory/script suites. Keepbounded initialexit/hash/counts,raw diagnostics/screenshots/traces outsideAP.
id_source: "generated"
---
## Summary

Iteration95 projects existing explicit Writer ruler tab anchors through the inspected SvxRuler/VCL signed pixel conversion at CSS96dpi,sharing the existing default-tab rounder.

## Scope

apps/office/src/sw/browser/presentation/WriterRulers.tsx
apps/office/src/sw/browser/presentation/writer-view-ruler-tab-pixels.test.tsx
apps/office/e2e/writer-ruler-tab-pixels.spec.ts
apps/office/e2e/writer-ruler-tab-glyphs.spec.ts
apps/office/e2e/writer-ruler-tab-identity.spec.ts
apps/office/src/sw/browser/presentation/WriterPageLayout.test.tsx
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json
Revised scope:exactly8semanticpaths pluscanonical records/bounded evidence.292prior tests:289byte-identical;3oldfiles permit exactly7assertion replacements:5postdrag fractionalbrowsercoordinates->integer218,and2WriterPageLayout callbacks237->231. Allother assertions/bytes retained.220rows/order/status/owner/default/exception fields preserved;1append-onlyrow update. No core/projection/snapalgorithm/config changes,network/outside/global/native execution/APsources/helpers.

## Plan

Implement one explicit tab pixel-projection correction:use existing toRulerPixel on complete origin+logical stop before typed RulerHandle admission/render/tracking;preserve immutable raw-index/point records,model metadata/general paragraph positions and undo ownership. Add real model/DOM/Undo cases for alltypes,fractional positive/negative/zero/extreme coordinates and bothoriginsettings;new Chromium1280/390 fixture verifies actual rounded glyph/hitanchor,cancel/no-motion/move/undo/reprojection. Update exactly5 obsolete postdrag assertions across2oldE2E files to exact native integer positions;allother oldbytes/assertions retained. Append one existing WriterRulers row per220-row manifest without promotion. Run all static checks and one absent-upstream suite pass;source audits separately;exact semanticSHA same-actor evaluator andcleanfinish;parent staysDOING.
Revised afterfailed appgate:include WriterPageLayout.test.tsx and change exactly2old rounded-origin callback expectations237->231. Scope8paths,3oldfixtures/7expectation updates,289of292oldtests identical. Preserveallotherbytes/assertions andexisting snapalgorithm. Repeatonlyfailed appcoveragegate;inventory/scripts/Chromium notyet run. No scope/risk/acceptance weakening;standinggoal authorizes local correction.

## Verify Steps

Read ap task verify-show;read-only inspect pinned SvxRuler ConvertHPosPixel/UpdateTabs and VCL lcl_logicToPixel,record2filehashes/markers/conclusions only,no native execution. No baseline/focused tests. Run format:check,lint,typecheck,check:dependencies,test:static,check:docs,check:file-size. Rename vendor/libreoffice-reference insidevendor;run npm run test once(app/inventorycoverage),npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts once,and npm run test:e2e once;restorefinally. Only failed corrected gates may rerun;the firstappcoveragegatefailed2oldcallbackassertions so rerun thisfailedgate aftercorrection,then run unruninventory/scripts/browser once,tests alwaysabsent,no passing-suite duplicates. Afterrestore separately run generator--check,source-tree,provenance,invariants,parityCLI;require100%4app/inventorycoverage,0semanticviolations. New realprojection/DOM cases cover Left/Right/Center/Decimal integeranchors,complete-origin rounding,positive/negative/zero/signed32endpoints,relativeflag,falseorigin,model/history/frozenDTO preservation,and accepted/cancelled/no-motion/rawindex/Undo behavior. Chromium1280/390 checks rounded anchors/typed actualhitbounds,clickownership andoneUndo/Redo plusactualscreenshots. Exactscope8paths,292prior tests/289identical/3oldfiles exact7expectation replacements(5E2Eintegeranchors,2rounded-startcallbacks),220rows each1append-onlyupdate/no promotion,2pinnedhashes unchanged. Ignored-inclusive AP source/helper/Python/native/archive/rawframes/codediff audit0;only boundedresults/hashes/conclusions. Routing/doctor pass;exact-SHA same-actor EVALUATOR andcleanfinish;fullgoalactive.

## Verification

Pending single absent-upstream tests and separate static audits;no tests run.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-04T07:17:32.900Z — VERIFY — needs_rework

By: PLANNER

Note: Single absent application gate failed2 old callback expectations237->231 from rounded physical origin;all13newcases pass. Scope update required before two owned fixture corrections;unrun later gates remain pending.
Attempts: 1

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-04T07:17:32.539Z, excerpt_hash=sha256:2541a578452435830a87cd8c779fc52600944362ec6989fd6427a2c174401a5c

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610040708-7ZY7E5/blueprint/resolved-snapshot.json
- old_digest: 58ea296b5f58168841bb37ab237797a6b05ec6d749f3d822aabe73803f7e860b
- current_digest: 58ea296b5f58168841bb37ab237797a6b05ec6d749f3d822aabe73803f7e860b
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610040708-7ZY7E5

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610040708-7ZY7E5 -m 🧩 7ZY7E5 task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-10-04T07:23:42.312Z — VERIFY — needs_rework

By: CODER

Note: Final app1176/inventory109/scripts5 pass;69oldChromium pass. Only2newE2Efixtures wrongly place Default first;correct owned fixture,rerun only2failed browsercases absent. No product/scope/gate changes.
Attempts: 2

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-04T07:23:41.961Z, excerpt_hash=sha256:5951fdab32d15f7c4f6518dba225b95b90290dcd78482f107795120a7976f430

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610040708-7ZY7E5/blueprint/resolved-snapshot.json
- old_digest: 58ea296b5f58168841bb37ab237797a6b05ec6d749f3d822aabe73803f7e860b
- current_digest: 58ea296b5f58168841bb37ab237797a6b05ec6d749f3d822aabe73803f7e860b
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610040708-7ZY7E5

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610040708-7ZY7E5 -m 🧩 7ZY7E5 task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert isolated semantic commit if needed;restore temporarily renamedvendor infinally. No historyrewrite.

## Findings

Previousgoalturn is verifiedprogress:iteration94DONE semantic4602af9e,currentcleanmain dac71556. Read-only evidence confirms nativeexplicit UpdateTabs uses ConvertHPosPixel ofcomplete tab origin+offset,andLogicToPixel usesllround;local explicitmarkers retainfractional division. Correct displayed/hit/tracking anchoronly;model stayslogical. Two oldChromium fixtures explicitlyassert obsoletefractional postdragposition;replace5expectations with exactrounded218 while preserving allother assertions/bytes. Nativefull geometry/RTL/vertical/systemDPI/theme/hitpriority/snap/modifiers/capture/selector/fullnative andparent parity remainunverified. Registered save/open/recovery deviations preserved.
First single absent-upstream application coverage gate failed only2old WriterPageLayout tab-drag assertions:expected237,actual231 from the newly rounded initial physical anchor;1174/1176pass including all13newcases. Inventory/scripts/Chromium didnotrun because orchestration stopped at failed gate,vendor restored in finally. Bounded failure exit/hash/counts only retained;raw diagnostic frames remain outsideAP. Source/domain inspection validates the fixture's initial1974twips rounds132px;the existing 1mm snapped endpoint yields231 rather than fractional-start237. Re-approve oneadditional priorfixturepath and exactly2callback expectations before correction;no snapping algorithm/core/gate/config changes. Allpassing suites willnot be rerun;failedapplicationcoveragegate mustrerun to produce currentcoverage,then unruninventory/scripts/browser. Standinggoal authorizes this local expectation correction;ORCHESTRATOR approves revised exact scope.
Corrected appgate passed1176app/222files andunrun109inventory/36files+5scripts/2files firstpass. FirstChromiumgatepassed69oldscenarios;only2newpixel cases failed:nointeractive tabs afterODTimport because the fixture puts Defaultfirst,whose source-compatible importcontainer selects onlythatfirstDefault andskipslater explicitstops (owned xmltabi sourceconfirmed). Remove onlythe newE2Efixture'sDefaultstop;retain hidden-Default/rawindexcoverage in13passing ownedunitcases. No product/import/gate/config change,no scopeexpansion,no expectationweakening. Repeatonlythese2failed Chromiumcases with upstreamabsent;do notrerun69passingbrowser/app/inventory/script suites. Keepbounded initialexit/hash/counts,raw diagnostics/screenshots/traces outsideAP.
