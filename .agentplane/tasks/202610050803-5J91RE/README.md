---
id: "202610050803-5J91RE"
title: "Retain native uncounted list text geometry in body and table cells"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-05T08:04:52.585Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-05T08:22:50.079Z"
  updated_by: "CODER"
  note: "Native uncounted text-left verified on exact semantic SHA7639d7ac:33 new cases and106 Chromium firstpass;one absent full11954/109/5,100coverage,378prior tests unchanged,5restored audits,244states/defaults/deviations preserved.Quality pass;full parity unverified."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-05T08:21:46.650Z"
  updated_by: "EVALUATOR"
  note: "Same-actor read-only review of exact semantic SHA 7639d7ac72d809e1891c2a3ebf524f56475b4eb1 passes represented native uncounted list body/cell text geometry;full parity remains unverified."
  evaluated_sha: "7639d7ac72d809e1891c2a3ebf524f56475b4eb1"
  blueprint_digest: "ab4d2a169dd271ded500db4c0118c5ff5a32004733bb4b32fdd8f5c271a415f8"
  evidence_refs:
    - ".agentplane/tasks/202610050803-5J91RE/README.md"
    - ".agentplane/tasks/202610050803-5J91RE/quality/20261005-082146650-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610050803-5J91RE/quality/20261005-082146650-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610050803-5J91RE/quality/20261005-082146650-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610050803-5J91RE/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610050803-5J91RE/evidence/scope-and-native-hashes.json"
    - ".agentplane/tasks/202610050803-5J91RE/evidence/absent-profile.json"
    - ".agentplane/tasks/202610050803-5J91RE/evidence/restored-source-audits.json"
  findings:
    - "Core owns bound-rule alignment and legacy text-left;uncounted first-line0 and shared presentation preserve actual body/cell geometry/history. Six statics,one absent full11954 app/109 inventory/5 scripts/106 Chromium all firstpass,actual100coverage;378prior tests byte-identical;244states/defaults/deviations unchanged;five restored source audits pass. No passing replay or production edits after profile;no independent review claim."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement native uncounted list text geometry on actual body and cell nodes under the standing approved parity goal."
events:
  -
    type: "status"
    at: "2026-10-05T08:04:54.893Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement native uncounted list text geometry on actual body and cell nodes under the standing approved parity goal."
  -
    type: "verify"
    at: "2026-10-05T08:22:50.079Z"
    author: "CODER"
    state: "ok"
    note: "Native uncounted text-left verified on exact semantic SHA7639d7ac:33 new cases and106 Chromium firstpass;one absent full11954/109/5,100coverage,378prior tests unchanged,5restored audits,244states/defaults/deviations preserved.Quality pass;full parity unverified."
doc_version: 3
doc_updated_at: "2026-10-05T08:22:50.134Z"
doc_updated_by: "CODER"
description: "Iteration143 shared native alignment and legacy text-left projection for uncounted Writer list paragraphs, browser rendering and print bounds with history and body/cell geometry evidence; preserve registered deviations."
sections:
  Summary: "Retain native uncounted list text geometry in body and table cells."
  Scope: |-
    - apps/office/src/sw/source/core/txtnode/ndtxt-list-indent.ts
    - apps/office/src/sw/source/core/layout/newfrm.ts
    - apps/office/src/sw/browser/presentation/writer-view-projection.ts
    - apps/office/src/sw/browser/editor/WriterEditableParagraph.tsx
    - apps/office/src/sw/browser/presentation/writer-view-uncounted-list-layout.test.tsx
    - apps/office/e2e/writer-uncounted-list-layout.spec.ts
    - docs/program/source-provenance.json
    - docs/program/parity/runtime-inventory.json
  Plan: "Iteration143 preserve native uncounted list text geometry across actual body/cell nodes. Add core text-left resolver using bound SwNodeNum rule,existing independent alignment mask or legacy AbsLSpace plus paragraph margin when not absolute;native text-left is independent of counted flag. Existing alignment resolver already returns firstLine0 for uncounted. Project one optional immutable uncounted text-left value only for actual bound uncounted rules;React uses that primitive and zero first-line offset without marker/spacer/tab-follower and without paragraph/listGeometryWins heuristics. Print bounds consume same core text-left for uncounted while counted existing layout remains separately unverified. Literal tests cover bullet/numbered,nested,independent direct/style/zero/negative margin masks,legacy absolute/nonabsolute,unbound/plain noops,follow frames,metadata independence,body/cells,real Backspace/ShiftBackspace and UndoRedo. Chromium measures body/cell text and wrapper positions;uncounted text remains at native text-left,not label-tab position,and restores through native history without changing neighbor,text or list identity. Existing tests remain byte-identical unless exact observed obsolete compatibility assertion requires scoped reapproval. Four existing ownership rows bounded evidence/local helper symbol only;244states/defaults/classifications/deviations unchanged. Sixstatics first;ONE absent build/app/inventory/scripts/Chromium reportOnFailure,exact failures persisted before collectors,bothfirstmaps ignoredappcache only;failed/new-only closure,no passingreplays,actual100coverage. Restore finally beforefive sourceaudits;scope/nativehash/exactSHA sameactorreadonlyquality;CODERVerification beforeverify/canonicalfinish;cleanmain,parentgoalactive. Counted marker/tab legacy layout,RTL/font-relative/large-indent cell clamp,fullnative frames/history/navigation/UI remainunverified. No network/outside/global/subagents/APsources/helpers/Python/probes/rawdiagnostics."
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

    Literal native text-left/zero first-line,body/cell rendered geometry,Backspace count/history and neighbor preservation;one absent full profile,failed/new-only closure,actual100coverage.
  Verification: |-
    Implementation: 7639d7ac72d809e1891c2a3ebf524f56475b4eb1. Exact-SHA same-actor read-only quality review passed before recording evaluator verdict; no independent review claim. Quality: .agentplane/tasks/202610050803-5J91RE/quality/20261005-082146650-recovery-context/quality-report.json.

    - Command: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Result: pass, six first executions. Evidence: evidence/static-gates.json. Scope: represented native geometry helper,print bounds,immutable browser projection and shared body/cell renderer,new tests and metadata.
    - Command: npm run test:static. Result: pass. Evidence: evidence/absent-profile.json build record. Scope: local static build while upstream unavailable.
    - Command: npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure (JSON reporter options recorded in absent-profile). Result: pass,11954 cases/291 files first,33 new cases;100% lines/statements/functions/branches. Evidence: evidence/absent-profile.json and cumulative-coverage.json. Scope: complete application,actual native body/cell text-left,independent zero/negative/direct/style axes,legacy absolute/relative spacing,follow fragments,count UndoRedo and neighbor preservation.
    - Command: npm run test:inventory:coverage -- --coverage.reportOnFailure (JSON reporter options recorded in absent-profile). Result: pass,109 cases/36 files first;100% all four metrics. Evidence: same actual first absent countmap summaries and hashes. Scope: inventory invariants and semantic data.
    - Command: npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts. Result: pass,5 cases/2files first. Evidence: absent-profile scripts record. Scope: local script contracts.
    - Command: npm exec -- playwright test --config apps/office/playwright.config.ts (JSON reporter options recorded in absent-profile). Result: pass,106 first,nofailures/noflakes;2 new body/cell actual DOM rectangle and glyph-position cases. Evidence: absent-profile Chromium record. Scope: native Backspace/ShiftBackspace count transitions,UndoRedo,stable rendered text-left,no marker or neighbor/text corruption.
    - Command: npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. Result: pass,5 restored-source audits,semanticViolationCount0. Evidence: evidence/restored-source-audits.json. Scope: pinned-source references and metadata after vendor restored.
    - Command: ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check. Result: pass. Evidence: doctor0errors/2previouswarnings;policy routing OK;no whitespace errors. Scope: repository workflow and diff.
    - Command: exact scope/native-hash audit and ignored-inclusive Agentplane scan. Result: pass. Evidence: evidence/scope-and-native-hashes.json;4049 AP files/0forbidden before quality. Scope: all378prior app/script testfiles byte-identical,four ownershiprows8bounded appendices and one local helper symbol,all244states/defaults/exceptions/classifications unchanged,5nativehashes.

    One full sequential absent profile;finally restored vendor. No failed cases,no replays,no production changes after profile. First app and inventory Istanbul maps remain only in ignored appcache;actual maps prove100 coverage. No upstream source/helper/Python/probe/binary/rawdiagnostic artifacts. Counted marker/tab layout,RTL/font-relative/large-indent cell clamping,full native frames,HomeEnd/table navigation,zero-mark/recentTab counters,outline/history/UI and broad goal remain unverified. Canonical finish and final clean-state audit follow.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-05T08:22:50.079Z — VERIFY — ok

    By: CODER

    Note: Native uncounted text-left verified on exact semantic SHA7639d7ac:33 new cases and106 Chromium firstpass;one absent full11954/109/5,100coverage,378prior tests unchanged,5restored audits,244states/defaults/deviations preserved.Quality pass;full parity unverified.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-05T08:22:49.281Z, excerpt_hash=sha256:d2ef50768c7c2656302f812efd6c20cb1a092c64f9c5a2d397581eb010e9156b

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610050803-5J91RE/blueprint/resolved-snapshot.json
    - old_digest: ab4d2a169dd271ded500db4c0118c5ff5a32004733bb4b32fdd8f5c271a415f8
    - current_digest: ab4d2a169dd271ded500db4c0118c5ff5a32004733bb4b32fdd8f5c271a415f8
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610050803-5J91RE

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610050803-5J91RE
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert semantic leaf without history rewriting."
  Findings: "Iteration142 verifiedprogress DONE. Currentmain6e0140b clean,parentonlyactive,direct,fourmatchedpolicies,userinstructionsabsent. Pinned ndtxt.cxx3382 GetLeftMarginWithNum(true) retains effective alignment text-left regardless counted and supports legacy absolute/relative spacing;3440 GetFirstLineOfsWithNum writes0 for uncounted. itrcrsr165 SwTextMargin consumes native text-left and0firstline,includingfollow. Local renderer wraps only visiblemarker and applies plainmargin only listkindnone,so uncounted numbered/bullet loses leftgeometry;projectSwTextPrintBounds retains raw/listGeometryWinsheuristic andwronguncountedfirstline. Existing resolveSwListParagraphIndents authoritative independentaxis alreadycountoff0. Standingusergoal/UI instruction authorizessafeinrepo leaf. First compact metadatalookup hit absentsemantic field;read-only boundedlookup correction,no sourceorstatechange. Restored source derivation includes frmtool2440 frame print-left and frmitems815 ResolveLeft:legacy absolute spacing retains negative authored first-line contribution in text-left (AbsLSpace minus min(0,rawfirst));relative spacing adds rawparagraphtextleft. Helper applies exact bounded twip formula,not guessed absolute cancellation. No scope expansion. Closure: sixfirststatics passed;onefullabsent build/app11954/291files/inventory109/36files/scripts5/Chromium106 allpassed first,nofailures/noflakes/no replay. All4app+inventory coverage100 actualfirstmaps. Five restoredsourceaudits passed semanticviolations0. All378priorapp/script testfiles byteidentical;33newappcases+2newChromiumgeometry cases passedfirst. Fourownerrows8boundednotes/localhelper symboladditive;all244states/defaults/deviations preserved;5nativehashes. Doctor0errors2oldwarnings,routing/diffpass;AP4049files0forbidden. Productionunchangedafterfirstprofile. Counted marker/tab layout,RTL/fontrelative/large-indent cell clamping,HomeEnd/table navigation,full frames/outline/history/UI andgoal remainunverified."
id_source: "generated"
---
## Summary

Retain native uncounted list text geometry in body and table cells.

## Scope

- apps/office/src/sw/source/core/txtnode/ndtxt-list-indent.ts
- apps/office/src/sw/source/core/layout/newfrm.ts
- apps/office/src/sw/browser/presentation/writer-view-projection.ts
- apps/office/src/sw/browser/editor/WriterEditableParagraph.tsx
- apps/office/src/sw/browser/presentation/writer-view-uncounted-list-layout.test.tsx
- apps/office/e2e/writer-uncounted-list-layout.spec.ts
- docs/program/source-provenance.json
- docs/program/parity/runtime-inventory.json

## Plan

Iteration143 preserve native uncounted list text geometry across actual body/cell nodes. Add core text-left resolver using bound SwNodeNum rule,existing independent alignment mask or legacy AbsLSpace plus paragraph margin when not absolute;native text-left is independent of counted flag. Existing alignment resolver already returns firstLine0 for uncounted. Project one optional immutable uncounted text-left value only for actual bound uncounted rules;React uses that primitive and zero first-line offset without marker/spacer/tab-follower and without paragraph/listGeometryWins heuristics. Print bounds consume same core text-left for uncounted while counted existing layout remains separately unverified. Literal tests cover bullet/numbered,nested,independent direct/style/zero/negative margin masks,legacy absolute/nonabsolute,unbound/plain noops,follow frames,metadata independence,body/cells,real Backspace/ShiftBackspace and UndoRedo. Chromium measures body/cell text and wrapper positions;uncounted text remains at native text-left,not label-tab position,and restores through native history without changing neighbor,text or list identity. Existing tests remain byte-identical unless exact observed obsolete compatibility assertion requires scoped reapproval. Four existing ownership rows bounded evidence/local helper symbol only;244states/defaults/classifications/deviations unchanged. Sixstatics first;ONE absent build/app/inventory/scripts/Chromium reportOnFailure,exact failures persisted before collectors,bothfirstmaps ignoredappcache only;failed/new-only closure,no passingreplays,actual100coverage. Restore finally beforefive sourceaudits;scope/nativehash/exactSHA sameactorreadonlyquality;CODERVerification beforeverify/canonicalfinish;cleanmain,parentgoalactive. Counted marker/tab legacy layout,RTL/font-relative/large-indent cell clamp,fullnative frames/history/navigation/UI remainunverified. No network/outside/global/subagents/APsources/helpers/Python/probes/rawdiagnostics.

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

Literal native text-left/zero first-line,body/cell rendered geometry,Backspace count/history and neighbor preservation;one absent full profile,failed/new-only closure,actual100coverage.

## Verification

Implementation: 7639d7ac72d809e1891c2a3ebf524f56475b4eb1. Exact-SHA same-actor read-only quality review passed before recording evaluator verdict; no independent review claim. Quality: .agentplane/tasks/202610050803-5J91RE/quality/20261005-082146650-recovery-context/quality-report.json.

- Command: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Result: pass, six first executions. Evidence: evidence/static-gates.json. Scope: represented native geometry helper,print bounds,immutable browser projection and shared body/cell renderer,new tests and metadata.
- Command: npm run test:static. Result: pass. Evidence: evidence/absent-profile.json build record. Scope: local static build while upstream unavailable.
- Command: npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure (JSON reporter options recorded in absent-profile). Result: pass,11954 cases/291 files first,33 new cases;100% lines/statements/functions/branches. Evidence: evidence/absent-profile.json and cumulative-coverage.json. Scope: complete application,actual native body/cell text-left,independent zero/negative/direct/style axes,legacy absolute/relative spacing,follow fragments,count UndoRedo and neighbor preservation.
- Command: npm run test:inventory:coverage -- --coverage.reportOnFailure (JSON reporter options recorded in absent-profile). Result: pass,109 cases/36 files first;100% all four metrics. Evidence: same actual first absent countmap summaries and hashes. Scope: inventory invariants and semantic data.
- Command: npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts. Result: pass,5 cases/2files first. Evidence: absent-profile scripts record. Scope: local script contracts.
- Command: npm exec -- playwright test --config apps/office/playwright.config.ts (JSON reporter options recorded in absent-profile). Result: pass,106 first,nofailures/noflakes;2 new body/cell actual DOM rectangle and glyph-position cases. Evidence: absent-profile Chromium record. Scope: native Backspace/ShiftBackspace count transitions,UndoRedo,stable rendered text-left,no marker or neighbor/text corruption.
- Command: npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. Result: pass,5 restored-source audits,semanticViolationCount0. Evidence: evidence/restored-source-audits.json. Scope: pinned-source references and metadata after vendor restored.
- Command: ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check. Result: pass. Evidence: doctor0errors/2previouswarnings;policy routing OK;no whitespace errors. Scope: repository workflow and diff.
- Command: exact scope/native-hash audit and ignored-inclusive Agentplane scan. Result: pass. Evidence: evidence/scope-and-native-hashes.json;4049 AP files/0forbidden before quality. Scope: all378prior app/script testfiles byte-identical,four ownershiprows8bounded appendices and one local helper symbol,all244states/defaults/exceptions/classifications unchanged,5nativehashes.

One full sequential absent profile;finally restored vendor. No failed cases,no replays,no production changes after profile. First app and inventory Istanbul maps remain only in ignored appcache;actual maps prove100 coverage. No upstream source/helper/Python/probe/binary/rawdiagnostic artifacts. Counted marker/tab layout,RTL/font-relative/large-indent cell clamping,full native frames,HomeEnd/table navigation,zero-mark/recentTab counters,outline/history/UI and broad goal remain unverified. Canonical finish and final clean-state audit follow.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-05T08:22:50.079Z — VERIFY — ok

By: CODER

Note: Native uncounted text-left verified on exact semantic SHA7639d7ac:33 new cases and106 Chromium firstpass;one absent full11954/109/5,100coverage,378prior tests unchanged,5restored audits,244states/defaults/deviations preserved.Quality pass;full parity unverified.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-05T08:22:49.281Z, excerpt_hash=sha256:d2ef50768c7c2656302f812efd6c20cb1a092c64f9c5a2d397581eb010e9156b

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610050803-5J91RE/blueprint/resolved-snapshot.json
- old_digest: ab4d2a169dd271ded500db4c0118c5ff5a32004733bb4b32fdd8f5c271a415f8
- current_digest: ab4d2a169dd271ded500db4c0118c5ff5a32004733bb4b32fdd8f5c271a415f8
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610050803-5J91RE

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610050803-5J91RE
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert semantic leaf without history rewriting.

## Findings

Iteration142 verifiedprogress DONE. Currentmain6e0140b clean,parentonlyactive,direct,fourmatchedpolicies,userinstructionsabsent. Pinned ndtxt.cxx3382 GetLeftMarginWithNum(true) retains effective alignment text-left regardless counted and supports legacy absolute/relative spacing;3440 GetFirstLineOfsWithNum writes0 for uncounted. itrcrsr165 SwTextMargin consumes native text-left and0firstline,includingfollow. Local renderer wraps only visiblemarker and applies plainmargin only listkindnone,so uncounted numbered/bullet loses leftgeometry;projectSwTextPrintBounds retains raw/listGeometryWinsheuristic andwronguncountedfirstline. Existing resolveSwListParagraphIndents authoritative independentaxis alreadycountoff0. Standingusergoal/UI instruction authorizessafeinrepo leaf. First compact metadatalookup hit absentsemantic field;read-only boundedlookup correction,no sourceorstatechange. Restored source derivation includes frmtool2440 frame print-left and frmitems815 ResolveLeft:legacy absolute spacing retains negative authored first-line contribution in text-left (AbsLSpace minus min(0,rawfirst));relative spacing adds rawparagraphtextleft. Helper applies exact bounded twip formula,not guessed absolute cancellation. No scope expansion. Closure: sixfirststatics passed;onefullabsent build/app11954/291files/inventory109/36files/scripts5/Chromium106 allpassed first,nofailures/noflakes/no replay. All4app+inventory coverage100 actualfirstmaps. Five restoredsourceaudits passed semanticviolations0. All378priorapp/script testfiles byteidentical;33newappcases+2newChromiumgeometry cases passedfirst. Fourownerrows8boundednotes/localhelper symboladditive;all244states/defaults/deviations preserved;5nativehashes. Doctor0errors2oldwarnings,routing/diffpass;AP4049files0forbidden. Productionunchangedafterfirstprofile. Counted marker/tab layout,RTL/fontrelative/large-indent cell clamping,HomeEnd/table navigation,full frames/outline/history/UI andgoal remainunverified.
