---
id: "202610040731-HX17XM"
title: "Round Writer paragraph ruler anchors to native pixels"
result_summary: "Paragraph ruler anchors round to native CSS pixels while precise items and Undo/Redo remain intact."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 17
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-04T07:33:10.272Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-04T07:45:59.703Z"
  updated_by: "CODER"
  note: "Final exact-SHA quality and post-review integrity passed; no test suites repeated."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-04T07:45:38.907Z"
  updated_by: "EVALUATOR"
  note: "Same-actor quality phase reviewed exact semantic HEAD 0acd09fb56b886a59ecd07b7721e3446f9334ee7; approved bounded paragraph anchor conversion passes."
  evaluated_sha: "0acd09fb56b886a59ecd07b7721e3446f9334ee7"
  blueprint_digest: "fde1ebbe9eb59e122bedd1259f32466e18cd5b793c0e22cf43a73595b2ade739"
  evidence_refs:
    - ".agentplane/tasks/202610040731-HX17XM/README.md"
    - ".agentplane/tasks/202610040731-HX17XM/quality/20261004-074538907-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610040731-HX17XM/quality/20261004-074538907-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610040731-HX17XM/quality/20261004-074538907-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610040731-HX17XM/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610040731-HX17XM/scope-integrity.json"
    - ".agentplane/tasks/202610040731-HX17XM/final-integrity.json"
    - ".agentplane/tasks/202610040731-HX17XM/vendor-restoration.json"
    - ".agentplane/tasks/202610040731-HX17XM/screenshots.json"
  findings:
    - "Production diff only applies the existing signed complete-coordinate pixel converter to three paragraph anchors. Precise model items, projection values and history remain intact; scope hashes match the reviewed SHA."
    - "All 1186/109/5/73 test cases passed on one vendor-absent pipeline. Seven static gates, four source audits, zero semantic violations, unchanged pinned hashes, two inspected screenshots and ignored-inclusive artifact integrity satisfy the declared contract."
commit:
  hash: "0acd09fb56b886a59ecd07b7721e3446f9334ee7"
  message: "🛠️ HX17XM code: round paragraph ruler anchors to native pixels"
comments:
  -
    author: "CODER"
    body: "Start: implement approved three paragraph-anchor rounding correction understandinggoal;one absent-upstream suitepass and separate sourceaudits."
  -
    author: "CODER"
    body: "Verified: rounded all three paragraph ruler anchors using native signed full-coordinate conversion; all declared bounded evidence and clean exact-SHA review passed."
events:
  -
    type: "status"
    at: "2026-10-04T07:33:10.705Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved three paragraph-anchor rounding correction understandinggoal;one absent-upstream suitepass and separate sourceaudits."
  -
    type: "verify"
    at: "2026-10-04T07:44:59.660Z"
    author: "CODER"
    state: "ok"
    note: "All declared bounded checks passed; one upstream-absent test pass, 1186/109/5/73 cases, complete coverage, zero semantic violations and forbidden artifacts; six-path scope and two pinned hashes verified."
  -
    type: "verify"
    at: "2026-10-04T07:45:59.703Z"
    author: "CODER"
    state: "ok"
    note: "Final exact-SHA quality and post-review integrity passed; no test suites repeated."
  -
    type: "status"
    at: "2026-10-04T07:46:02.238Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: rounded all three paragraph ruler anchors using native signed full-coordinate conversion; all declared bounded evidence and clean exact-SHA review passed."
doc_version: 3
doc_updated_at: "2026-10-04T07:46:02.239Z"
doc_updated_by: "CODER"
description: "Iteration96: match complete-coordinate signed SvxRuler UpdatePara pixel rounding for three existing paragraph indent handles. Preserve logical items,history and gesture ownership;add actual Writer/DOM/Chromium evidence. Correct one obsolete rounded-start fixture delta. One absent-upstream test pass;separate static source audits."
sections:
  Summary: "Iteration96 applies inspected native signed whole-coordinate pixel conversion to the three existing paragraph ruler handles while preserving authoritative logical items."
  Scope: |-
    apps/office/src/sw/browser/presentation/WriterRulers.tsx
    apps/office/src/sw/browser/presentation/writer-view-ruler-indent-pixels.test.tsx
    apps/office/e2e/writer-ruler-indent-pixels.spec.ts
    apps/office/src/sw/browser/presentation/WriterPageLayout.test.tsx
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
    Exactly6semanticpaths pluscanonical leaf/parent records andboundedevidence.294oldtestfiles:293identical,one exactrounded-start assertion107->101 inWriterPageLayout.220manifestrows eachpreserveorder/status/owner/default/exceptions with1append-onlyrow. Core/projection/snapalgorithm/page/vertical/visibility/RTL remainoutsidechange;no network/global/outside/native/APsources/helpers.
  Plan: "Under standing goal implement one paragraph anchor projection correction:reuse toRulerPixel on complete left/first-line/right logical coordinates before existing RulerHandle rendering/admission/tracking. Preserve logical items/history/gesture and snap algorithm;no page-margin/vertical/autoFirst/RTL scope. New real Writer projection/DOM tests cover positive/negative/zero/extreme signed inputs and allthree accepted/cancelled/no-motion/Undo paths. New Chromium1280/390 imported ownedfixture puts allthree roundedhandles onscreen andchecks actualhits/transactions/reprojection/screenshots. Change exactlyone obsolete WriterPageLayout expectation107->101,allother oldtest bytes intact. Append oneexisting row inboth manifests withoutpromotion. One absent-upstream suites plus separate static sourceaudits;exactsemantic same-actor EVALUATOR/cleanfinish,fullgoalactive."
  Verify Steps: "Read ap task verify-show;read-only inspect pinned SvxRuler UpdatePara/ConvertHPosPixel andVCL lcl_logicToPixel;store2sourcefilehashes/markers/conclusions only,no native execution. No baseline/focused test runs. Run format:check,lint,typecheck,check:dependencies,test:static(buildonly),check:docs,check:file-size. Renamevendor/libreoffice-reference insidevendor;run npm run test once(app/inventorycoverage),npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts once,and npm run test:e2e once;restorefinally. Onlyfailedcorrected gates/cases mayrerun,alwaysabsent,no passing-suite duplication. Afterrestoration runresourcegenerator--check,source-tree,provenance,invariants,parityCLI separately;require100%fourapp/inventorycoverage and0semanticviolations. Owned realmodel/projection/DOM cases verify signed complete-coordinate rounded left/firstline/right anchors,unchanged tuple/frozenDTO/history/spacing/tabs,zero/extreme/signed fields and source-domain geometry withoutcaps;actualall3gesture cases check no-motion/cancel/acceptedtwipitem changes/oneUndo/Redo. Chromium1280/390 confirmsall3integeranchors/realhits/no newtabs/cancel/acceptedmoves/Undo/reprojection/laterediting andactualscreenshots. Exactscope6paths,294priorfiles/293byte-identical/oneoldassertion107->101;220rows each1append-onlyupdate/no status/default/owner/exception promotion;2pinnedhashes unchanged. Scope/source/artifact audits onlyaftervendor restored,sequentiallyaftertests;ignored-inclusiveAgentplane source/helper/Python/native/archive/rawframes/codediff0,onlyboundedhashes/results/conclusions. Routing/doctor pass;exactSHA same-actor EVALUATOR andcleanfinish;keep parentDOING/fullgoalactive."
  Verification: |-
    Command: the declared split static gates; npm run test; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm run test:e2e; the four source audits; npm run inventory:parity; routing, doctor, scope and ignored-inclusive artifact audits.
    Result: pass after correcting only new E2E formatting and rerunning format:check. No test gate failed or was repeated.
    Evidence: 1186 application cases in 223 files, 109 inventory cases in 36 files, 5 owned resource/provenance cases, and 73 Chromium cases passed with vendor/libreoffice-reference unavailable. Both coverage summaries retain 100% lines/statements/functions/branches; semantic violations are zero. Vendor restored in finally with no failure. All seven static gates and four source audits passed; routing and doctor exit zero. Doctor retains its existing historical warnings.
    Scope: six approved semantic paths; all 294 previous test/spec files accounted for, 293 byte-identical and one exact 107-to-101 assertion correction. Both 220-row manifests preserve order and status/default/owner/exception fields, with one existing row amended each. Two pinned source hashes remain unchanged. Agentplane contains no forbidden source/helper/Python/executable/archive/source-frame/code-diff content; five historical prose-only references remain.
    Visual evidence: both actual 1280/390 screenshots show the three integer paragraph anchors and were inspected. Screenshots stay under test-results/e2e, outside Agentplane; only paths, hashes and conclusions are recorded.
    This verifies the signed full-coordinate CSS 96 dpi paragraph marker conversion and precise item/DTO/gesture/history contracts, not complete native or parent parity.
    Exact implementation SHA: 0acd09fb56b886a59ecd07b7721e3446f9334ee7. Same-actor EVALUATOR review passed at quality/20261004-074538907-recovery-context/quality-report.json; the post-review scope/hash/artifact audit passed without repeating tests.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-04T07:45:59.703Z — VERIFY — ok

    By: CODER

    Note: Final exact-SHA quality and post-review integrity passed; no test suites repeated.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-04T07:45:59.359Z, excerpt_hash=sha256:60b6043d7238497875f3a2c4842ddf402609918dbe80f6ce390316bfaf4a5819

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610040731-HX17XM/blueprint/resolved-snapshot.json
    - old_digest: fde1ebbe9eb59e122bedd1259f32466e18cd5b793c0e22cf43a73595b2ade739
    - current_digest: fde1ebbe9eb59e122bedd1259f32466e18cd5b793c0e22cf43a73595b2ade739
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610040731-HX17XM

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202610040731-HX17XM --result verified-202610040731-HX17XM --commit 0acd09fb56b886a59ecd07b7721e3446f9334ee7
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert isolated semanticcommit ifrequired;restore temporarilyrenamedvendor finally. No historyrewrite."
  Findings: |-
    The initial format gate identified only formatting in the new browser test; Prettier corrected it and only that failed static gate was repeated. Every test gate passed on its sole upstream-absent run. Source, scope and artifact audits ran after vendor restoration. No source bodies, executables or scripts were stored in Agentplane.
    The actual seven literal signed-coordinate projection cases and three real model gesture cases retain precise logical margins, spacing, tab metadata, immutable projections and history. Browser cases at 1280/390 exercise all three real hit targets, no-motion Enter, moved Escape, accepted drags, Undo/Redo and later editing.
    Next confirmed gap: native SvxRuler::UpdatePara marks the first-line indent invisible when the effective item IsAutoFirst is true; the existing browser projection omits that flag and always renders its control. Address separately.
    Auto-first visibility, RTL/vertical/theme/system DPI/hit priority/modifiers/snapping/capture/full frame/page/core indent mutation and whole-parent parity remain unverified. Registered save/open/recovery deviations remain preserved. Full goal stays active.
extensions:
  implementation_commit:
    hash: "0acd09fb56b886a59ecd07b7721e3446f9334ee7"
    message: "🛠️ HX17XM code: round paragraph ruler anchors to native pixels"
id_source: "generated"
---
## Summary

Iteration96 applies inspected native signed whole-coordinate pixel conversion to the three existing paragraph ruler handles while preserving authoritative logical items.

## Scope

apps/office/src/sw/browser/presentation/WriterRulers.tsx
apps/office/src/sw/browser/presentation/writer-view-ruler-indent-pixels.test.tsx
apps/office/e2e/writer-ruler-indent-pixels.spec.ts
apps/office/src/sw/browser/presentation/WriterPageLayout.test.tsx
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json
Exactly6semanticpaths pluscanonical leaf/parent records andboundedevidence.294oldtestfiles:293identical,one exactrounded-start assertion107->101 inWriterPageLayout.220manifestrows eachpreserveorder/status/owner/default/exceptions with1append-onlyrow. Core/projection/snapalgorithm/page/vertical/visibility/RTL remainoutsidechange;no network/global/outside/native/APsources/helpers.

## Plan

Under standing goal implement one paragraph anchor projection correction:reuse toRulerPixel on complete left/first-line/right logical coordinates before existing RulerHandle rendering/admission/tracking. Preserve logical items/history/gesture and snap algorithm;no page-margin/vertical/autoFirst/RTL scope. New real Writer projection/DOM tests cover positive/negative/zero/extreme signed inputs and allthree accepted/cancelled/no-motion/Undo paths. New Chromium1280/390 imported ownedfixture puts allthree roundedhandles onscreen andchecks actualhits/transactions/reprojection/screenshots. Change exactlyone obsolete WriterPageLayout expectation107->101,allother oldtest bytes intact. Append oneexisting row inboth manifests withoutpromotion. One absent-upstream suites plus separate static sourceaudits;exactsemantic same-actor EVALUATOR/cleanfinish,fullgoalactive.

## Verify Steps

Read ap task verify-show;read-only inspect pinned SvxRuler UpdatePara/ConvertHPosPixel andVCL lcl_logicToPixel;store2sourcefilehashes/markers/conclusions only,no native execution. No baseline/focused test runs. Run format:check,lint,typecheck,check:dependencies,test:static(buildonly),check:docs,check:file-size. Renamevendor/libreoffice-reference insidevendor;run npm run test once(app/inventorycoverage),npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts once,and npm run test:e2e once;restorefinally. Onlyfailedcorrected gates/cases mayrerun,alwaysabsent,no passing-suite duplication. Afterrestoration runresourcegenerator--check,source-tree,provenance,invariants,parityCLI separately;require100%fourapp/inventorycoverage and0semanticviolations. Owned realmodel/projection/DOM cases verify signed complete-coordinate rounded left/firstline/right anchors,unchanged tuple/frozenDTO/history/spacing/tabs,zero/extreme/signed fields and source-domain geometry withoutcaps;actualall3gesture cases check no-motion/cancel/acceptedtwipitem changes/oneUndo/Redo. Chromium1280/390 confirmsall3integeranchors/realhits/no newtabs/cancel/acceptedmoves/Undo/reprojection/laterediting andactualscreenshots. Exactscope6paths,294priorfiles/293byte-identical/oneoldassertion107->101;220rows each1append-onlyupdate/no status/default/owner/exception promotion;2pinnedhashes unchanged. Scope/source/artifact audits onlyaftervendor restored,sequentiallyaftertests;ignored-inclusiveAgentplane source/helper/Python/native/archive/rawframes/codediff0,onlyboundedhashes/results/conclusions. Routing/doctor pass;exactSHA same-actor EVALUATOR andcleanfinish;keep parentDOING/fullgoalactive.

## Verification

Command: the declared split static gates; npm run test; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm run test:e2e; the four source audits; npm run inventory:parity; routing, doctor, scope and ignored-inclusive artifact audits.
Result: pass after correcting only new E2E formatting and rerunning format:check. No test gate failed or was repeated.
Evidence: 1186 application cases in 223 files, 109 inventory cases in 36 files, 5 owned resource/provenance cases, and 73 Chromium cases passed with vendor/libreoffice-reference unavailable. Both coverage summaries retain 100% lines/statements/functions/branches; semantic violations are zero. Vendor restored in finally with no failure. All seven static gates and four source audits passed; routing and doctor exit zero. Doctor retains its existing historical warnings.
Scope: six approved semantic paths; all 294 previous test/spec files accounted for, 293 byte-identical and one exact 107-to-101 assertion correction. Both 220-row manifests preserve order and status/default/owner/exception fields, with one existing row amended each. Two pinned source hashes remain unchanged. Agentplane contains no forbidden source/helper/Python/executable/archive/source-frame/code-diff content; five historical prose-only references remain.
Visual evidence: both actual 1280/390 screenshots show the three integer paragraph anchors and were inspected. Screenshots stay under test-results/e2e, outside Agentplane; only paths, hashes and conclusions are recorded.
This verifies the signed full-coordinate CSS 96 dpi paragraph marker conversion and precise item/DTO/gesture/history contracts, not complete native or parent parity.
Exact implementation SHA: 0acd09fb56b886a59ecd07b7721e3446f9334ee7. Same-actor EVALUATOR review passed at quality/20261004-074538907-recovery-context/quality-report.json; the post-review scope/hash/artifact audit passed without repeating tests.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-04T07:45:59.703Z — VERIFY — ok

By: CODER

Note: Final exact-SHA quality and post-review integrity passed; no test suites repeated.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-04T07:45:59.359Z, excerpt_hash=sha256:60b6043d7238497875f3a2c4842ddf402609918dbe80f6ce390316bfaf4a5819

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610040731-HX17XM/blueprint/resolved-snapshot.json
- old_digest: fde1ebbe9eb59e122bedd1259f32466e18cd5b793c0e22cf43a73595b2ade739
- current_digest: fde1ebbe9eb59e122bedd1259f32466e18cd5b793c0e22cf43a73595b2ade739
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610040731-HX17XM

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202610040731-HX17XM --result verified-202610040731-HX17XM --commit 0acd09fb56b886a59ecd07b7721e3446f9334ee7
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert isolated semanticcommit ifrequired;restore temporarilyrenamedvendor finally. No historyrewrite.

## Findings

The initial format gate identified only formatting in the new browser test; Prettier corrected it and only that failed static gate was repeated. Every test gate passed on its sole upstream-absent run. Source, scope and artifact audits ran after vendor restoration. No source bodies, executables or scripts were stored in Agentplane.
The actual seven literal signed-coordinate projection cases and three real model gesture cases retain precise logical margins, spacing, tab metadata, immutable projections and history. Browser cases at 1280/390 exercise all three real hit targets, no-motion Enter, moved Escape, accepted drags, Undo/Redo and later editing.
Next confirmed gap: native SvxRuler::UpdatePara marks the first-line indent invisible when the effective item IsAutoFirst is true; the existing browser projection omits that flag and always renders its control. Address separately.
Auto-first visibility, RTL/vertical/theme/system DPI/hit priority/modifiers/snapping/capture/full frame/page/core indent mutation and whole-parent parity remain unverified. Registered save/open/recovery deviations remain preserved. Full goal stays active.
