---
id: "202610050828-ZJ34MV"
title: "Project native independent list indent axes into shared UI layout"
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
  updated_at: "2026-10-05T08:31:30.927Z"
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
    body: "Start: replace browser list-axis heuristic with native core geometry shared by actual body and table cell presentation and print bounds."
events:
  -
    type: "status"
    at: "2026-10-05T08:29:54.573Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: replace browser list-axis heuristic with native core geometry shared by actual body and table cell presentation and print bounds."
doc_version: 3
doc_updated_at: "2026-10-05T08:36:47.500Z"
doc_updated_by: "CODER"
description: "Iteration144 remove React paragraph-versus-list and listGeometryWins layout decisions;core owns effective counted first-line and text-left for alignment/legacy modes;shared body/cell projection and print bounds with native literal/history/browser evidence and preserved intentional deviations."
sections:
  Summary: "Project native independent list indent axes into shared UI layout."
  Scope: |-
    - apps/office/src/sw/source/core/txtnode/ndtxt-list-indent.ts
    - apps/office/src/sw/source/core/layout/newfrm.ts
    - apps/office/src/sw/browser/presentation/writer-view-projection.ts
    - apps/office/src/sw/browser/editor/WriterEditableParagraph.tsx
    - apps/office/src/sw/browser/presentation/writer-view-counted-list-layout.test.tsx
    - apps/office/e2e/writer-counted-list-layout.spec.ts
    - apps/office/src/sw/browser/editor/WriterEditableParagraph.test.tsx
    - docs/program/source-provenance.json
    - docs/program/parity/runtime-inventory.json
  Plan: "Iteration144 one independent native list-indent geometry correction. Core first-line resolver uses bound numbering owner:existing alignment mask and signed-short semantics,legacy firstLineOffset plus rawparagraph firstline unless IGNORE_FIRST_LINE_INDENT_IN_NUMBERING,zero for uncounted,existing plain paragraph first-line resolver when unbound. Shared print bounds use native list text-left plus firstline;remove GetAbsLSpace/DoesListGeometryWin raw heuristic. Projection supplies native effective left and firstline in existing immutable listLayout for bound numbered/bullet formats;renderer consumes these values directly,removes paragraphIndentWins branch and never chooses based on legacy listGeometryWins metadata. Retain persisted/imported legacyflag and readonly projection metadata for codec/source evidence,without behavioral authority. Keep represented follower fields and actual browser widths;full label/tab/space/nothing geometry,overflow/wrapping and legacy minimum distances remain unverified followup,not claimed parity. Body/cell native literal tests independent style/direct axes,zero/negative,signedshort/compatibility,both positioning modes,count/history/metadata independence,follow fragments and unbound/plain. Chromium real paragraph edits/UndoRedo measure marker position in body/cell after directleft and firstline changes. Preserve every oldtest unless the first exact obsolete detached rendering assertion requires narrow fixture correction in approved oldrenderer file;refresh scope/plan reapprove before changing it. Four ownership rows8boundednotes/local firstline symbol only;244states/defaults/classifications/deviations unchanged. Sixstaticsfirst;ONE absent full build/app/inventory/scripts/Chromium reportOnFailure,exactfailednamesbeforeassertions,firstmaps ignoredappcache only;failed/new-only closure,no passing replay,actual100coverage. finallyrestore beforefive sourceaudits,scope/nativehash,exactSHA sameactorreadonlyquality,CODERVerification beforeverify,canonicalfinish,cleanmain,parentactive. No network/outside/global/subagents/APsource/helpers/Python/probes/rawdiagnostics."
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

    Literal native axes,body/cell marker offsets and paragraph/history edits;one absent fullprofile,failed/new-only closure,actual100coverage,no passing replay.
  Verification: "Pending implementation and validation."
  Rollback Plan: "Revert semantic leaf without rewriting history."
  Findings: "Previous143 verifiedprogress DONE. Currentmain7bb6f6fb clean,parentonlyactive,direct,fourmatchedpolicies,userinstructionsabsent. Native ndtxt3382/3440 selects left/first independently and legacy short/IGNORE/count semantics;itrcrsr/frmtool consume resolved geometry. Local React paragraphIndentWins makes bothaxes follow rawparagraphleft or legacyflag,despite native mask helper alreadypresent;printbounds similarlyheuristic. Initial targeted query guessed missingportab.cxx;bounded actualcoretext search found txtfld/porfld/txttab;readonly,no mutation. Native labelportion/fontwidth/taborigin mechanics widerthan thissingleaxis correction,remainunverified. StandingUI/goal authorization applies;no userreapproval needed forroutineinrepo scope. Firstformat gate failed only new apps/office/e2e/writer-counted-list-layout.spec.ts after first formatting command. Correct formatter output,rerun failedformat then run first unexecuted lint/type/dependency/docs/size;no passing gates replayed,no semantic change."
id_source: "generated"
---
## Summary

Project native independent list indent axes into shared UI layout.

## Scope

- apps/office/src/sw/source/core/txtnode/ndtxt-list-indent.ts
- apps/office/src/sw/source/core/layout/newfrm.ts
- apps/office/src/sw/browser/presentation/writer-view-projection.ts
- apps/office/src/sw/browser/editor/WriterEditableParagraph.tsx
- apps/office/src/sw/browser/presentation/writer-view-counted-list-layout.test.tsx
- apps/office/e2e/writer-counted-list-layout.spec.ts
- apps/office/src/sw/browser/editor/WriterEditableParagraph.test.tsx
- docs/program/source-provenance.json
- docs/program/parity/runtime-inventory.json

## Plan

Iteration144 one independent native list-indent geometry correction. Core first-line resolver uses bound numbering owner:existing alignment mask and signed-short semantics,legacy firstLineOffset plus rawparagraph firstline unless IGNORE_FIRST_LINE_INDENT_IN_NUMBERING,zero for uncounted,existing plain paragraph first-line resolver when unbound. Shared print bounds use native list text-left plus firstline;remove GetAbsLSpace/DoesListGeometryWin raw heuristic. Projection supplies native effective left and firstline in existing immutable listLayout for bound numbered/bullet formats;renderer consumes these values directly,removes paragraphIndentWins branch and never chooses based on legacy listGeometryWins metadata. Retain persisted/imported legacyflag and readonly projection metadata for codec/source evidence,without behavioral authority. Keep represented follower fields and actual browser widths;full label/tab/space/nothing geometry,overflow/wrapping and legacy minimum distances remain unverified followup,not claimed parity. Body/cell native literal tests independent style/direct axes,zero/negative,signedshort/compatibility,both positioning modes,count/history/metadata independence,follow fragments and unbound/plain. Chromium real paragraph edits/UndoRedo measure marker position in body/cell after directleft and firstline changes. Preserve every oldtest unless the first exact obsolete detached rendering assertion requires narrow fixture correction in approved oldrenderer file;refresh scope/plan reapprove before changing it. Four ownership rows8boundednotes/local firstline symbol only;244states/defaults/classifications/deviations unchanged. Sixstaticsfirst;ONE absent full build/app/inventory/scripts/Chromium reportOnFailure,exactfailednamesbeforeassertions,firstmaps ignoredappcache only;failed/new-only closure,no passing replay,actual100coverage. finallyrestore beforefive sourceaudits,scope/nativehash,exactSHA sameactorreadonlyquality,CODERVerification beforeverify,canonicalfinish,cleanmain,parentactive. No network/outside/global/subagents/APsource/helpers/Python/probes/rawdiagnostics.

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

Literal native axes,body/cell marker offsets and paragraph/history edits;one absent fullprofile,failed/new-only closure,actual100coverage,no passing replay.

## Verification

Pending implementation and validation.

## Rollback Plan

Revert semantic leaf without rewriting history.

## Findings

Previous143 verifiedprogress DONE. Currentmain7bb6f6fb clean,parentonlyactive,direct,fourmatchedpolicies,userinstructionsabsent. Native ndtxt3382/3440 selects left/first independently and legacy short/IGNORE/count semantics;itrcrsr/frmtool consume resolved geometry. Local React paragraphIndentWins makes bothaxes follow rawparagraphleft or legacyflag,despite native mask helper alreadypresent;printbounds similarlyheuristic. Initial targeted query guessed missingportab.cxx;bounded actualcoretext search found txtfld/porfld/txttab;readonly,no mutation. Native labelportion/fontwidth/taborigin mechanics widerthan thissingleaxis correction,remainunverified. StandingUI/goal authorization applies;no userreapproval needed forroutineinrepo scope. Firstformat gate failed only new apps/office/e2e/writer-counted-list-layout.spec.ts after first formatting command. Correct formatter output,rerun failedformat then run first unexecuted lint/type/dependency/docs/size;no passing gates replayed,no semantic change.
