---
id: "202610050803-5J91RE"
title: "Retain native uncounted list text geometry in body and table cells"
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
  updated_at: "2026-10-05T08:04:52.585Z"
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
doc_version: 3
doc_updated_at: "2026-10-05T08:20:38.750Z"
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
  Verification: "Pending implementation and validation."
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

Pending implementation and validation.

## Rollback Plan

Revert semantic leaf without history rewriting.

## Findings

Iteration142 verifiedprogress DONE. Currentmain6e0140b clean,parentonlyactive,direct,fourmatchedpolicies,userinstructionsabsent. Pinned ndtxt.cxx3382 GetLeftMarginWithNum(true) retains effective alignment text-left regardless counted and supports legacy absolute/relative spacing;3440 GetFirstLineOfsWithNum writes0 for uncounted. itrcrsr165 SwTextMargin consumes native text-left and0firstline,includingfollow. Local renderer wraps only visiblemarker and applies plainmargin only listkindnone,so uncounted numbered/bullet loses leftgeometry;projectSwTextPrintBounds retains raw/listGeometryWinsheuristic andwronguncountedfirstline. Existing resolveSwListParagraphIndents authoritative independentaxis alreadycountoff0. Standingusergoal/UI instruction authorizessafeinrepo leaf. First compact metadatalookup hit absentsemantic field;read-only boundedlookup correction,no sourceorstatechange. Restored source derivation includes frmtool2440 frame print-left and frmitems815 ResolveLeft:legacy absolute spacing retains negative authored first-line contribution in text-left (AbsLSpace minus min(0,rawfirst));relative spacing adds rawparagraphtextleft. Helper applies exact bounded twip formula,not guessed absolute cancellation. No scope expansion. Closure: sixfirststatics passed;onefullabsent build/app11954/291files/inventory109/36files/scripts5/Chromium106 allpassed first,nofailures/noflakes/no replay. All4app+inventory coverage100 actualfirstmaps. Five restoredsourceaudits passed semanticviolations0. All378priorapp/script testfiles byteidentical;33newappcases+2newChromiumgeometry cases passedfirst. Fourownerrows8boundednotes/localhelper symboladditive;all244states/defaults/deviations preserved;5nativehashes. Doctor0errors2oldwarnings,routing/diffpass;AP4049files0forbidden. Productionunchangedafterfirstprofile. Counted marker/tab layout,RTL/fontrelative/large-indent cell clamping,HomeEnd/table navigation,full frames/outline/history/UI andgoal remainunverified.
