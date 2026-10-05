---
id: "202610050655-WD3HVN"
title: "End empty Writer lists through the native edit-window Enter decision"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-05T07:16:19.045Z"
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
  updated_at: "2026-10-05T07:17:04.761Z"
  updated_by: "EVALUATOR"
  note: "Same-actor read-only exact-SHA review ff0b20b58f76813ca315fa2b0b277725ee89928c passed after exit0 audit;no independent review claim. Native Enter decision,document deletion and attribute undo within scope;one full absent profile plus exact2failedapp closure,actual100coverage,103Chromium firstpass."
  evaluated_sha: "ff0b20b58f76813ca315fa2b0b277725ee89928c"
  blueprint_digest: "ff31693f8fddae8ff937e249980cfdfd5cc5d686508fd4c85eee9a44a0d3b25a"
  evidence_refs:
    - ".agentplane/tasks/202610050655-WD3HVN/README.md"
    - ".agentplane/tasks/202610050655-WD3HVN/quality/20261005-071704761-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610050655-WD3HVN/quality/20261005-071704761-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610050655-WD3HVN/quality/20261005-071704761-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610050655-WD3HVN/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610050655-WD3HVN/evidence/scope-and-native-hashes.json"
    - ".agentplane/tasks/202610050655-WD3HVN/evidence/absent-profile.json"
    - ".agentplane/tasks/202610050655-WD3HVN/evidence/failed-only-replay.json"
    - ".agentplane/tasks/202610050655-WD3HVN/evidence/cumulative-coverage.json"
    - ".agentplane/tasks/202610050655-WD3HVN/evidence/restored-source-audits.json"
  findings:
    - "Reviewed exact11semantic paths and native6hashes;13newappcontracts,old372tests371byteidentical,soleplatformmockcompatibility. All244states/defaults/exceptions retained,10boundednotes. Five restoredsourceaudits and doctor/routingpass. No passing suite/build replay,upstream sources/helpers/probes inAP,or broad parity promotion."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Implement the approved native Enter list transition and actual-node numbering deletion/history with owned body and cell evidence."
events:
  -
    type: "status"
    at: "2026-10-05T06:55:24.789Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement the approved native Enter list transition and actual-node numbering deletion/history with owned body and cell evidence."
doc_version: 3
doc_updated_at: "2026-10-05T07:14:43.709Z"
doc_updated_by: "CODER"
description: "One Enter transition with document-owned DelNumRules and native list-attribute undo;body and cell UI behavior against pinned source."
sections:
  Summary: "End empty Writer lists through the native edit-window Enter decision."
  Scope: |-
    - apps/office/src/sw/source/core/doc/doc.ts
    - apps/office/src/sw/source/core/undo/unnum.ts
    - apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
    - apps/office/src/sw/source/uibase/docvw/edtwin.ts
    - apps/office/src/sw/browser/editor/browser-writer-edit-window.ts
    - apps/office/src/sw/source/uibase/docvw/native-list-enter.test.ts
    - apps/office/src/sw/browser/editor/native-cell-list-enter.test.tsx
    - apps/office/e2e/writer-cell-list-enter.spec.ts
    - docs/program/source-provenance.json
    - docs/program/parity/runtime-inventory.json
    - apps/office/src/sw/browser/editor/browser-writer-edit-window.test.ts
  Plan: "Iteration141 one existing Enter/list transition correction. SwEditWin owns native KEY_RETURN empty ordinary numbered/bullet paragraph decision: actual PaM has no mark,node empty,actual rule exists and is not outline;disable numbering without split. Add InsertParagraph edit-window entry used only for insertParagraph platform input;retain SplitNode as unconditional shell operation and existing insertLineBreak path until its own audit. Add native-shaped SwWrtShell.DelNumRules,one SwUndoDelNum storing native range and direct list-attribute history,and SwDoc.DelNumRules inclusive actual SwNodes resetting direct rule or overriding inherited rule with empty,reset ID/level/restart/value/count,assigned outline count semantics. Reuse existing actual-node traversal;no body DTO,React list decision,or per-node UI history. Owned app tests prove empty root/nested/uncounted lists,body/cells,rule format NONE,selection/outline/nonempty/plain splits,stable node identity/direct formatting,reset metadata,UndoRedo,followuptyping,actual cell boundaries and invalidation. Mounted/Chromium prove real Enter ends empty cell list without adding paragraphs,nextEnter splits and history. Existing tests unchanged;metadata bounded notes for affected existing owners,all states/defaults/exceptions preserved. Six statics then ONE sequential absent full build/app/inventory/scripts/Chromium with reportOnFailure,exact failed names before assertions,both first JSONcountmaps ignoredappcache only. Failed/new-only closure and actual maps100,no passing/fullbuild replay. finallyrestore then five source audits,scope/hash readonly exact-SHA sameactor quality,doctor/routing,CODERVerification beforeverify/canonicalfinish,cleanmain,parentgoalactive. No network/outside/global/subagents/APsource/helper/Python/probe/rawdiagnostics. Firstprofile observed the old platform mock omits newInsertParagraph method;add that spy and split former2calls into1InsertParagraph+1SplitNode assertion only,everyotheroldassertionunchanged. NewNONEcase must assert literalnativeformatNONE,rather than unsupportedexistingdisplaykind;displayNONE projection remainsunverifiedfollowup. No production changes afterfirstprofile;twofailedappcasesonly,all103Chromiumfirstpass."
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

    Owned native Enter range/history and mounted/Chromium contracts. ONE absent profile; exact failed/new-only closure,100 actual coverage,zero passing replay.
  Verification: "Pending implementation and validation."
  Rollback Plan: "Revert the semantic leaf commit without rewriting history."
  Findings: "Iteration140 verified progress DONE. Clean main52d2d13,onlyparentactive,direct,all4matched policies,userinstructionsabsent. Pinned edtwin.cxx1985/2009 KEY_RETURN rule-present nonoutline noselection emptyparagraph ->NumOff,2756 ->DelNumRules;SwWrtShell.SplitNode1452 is unconditionalsplit. Local beforeinput conflatesinsertParagraph andlinebreak and alwayssplits. Native docnum1432 resets directrule orsets empty inherited rule plus5listattrs;unnum156 retainsattributehistory and RedocallsDoc.DelNumRules. Usergoal/explicitUI/list/table mandateauthorizessafelocalcorrection. ShiftEnter,Backspace,fulloutline/layout/rings/redlines remainunverified;registered deviations untouched. Firstprofile buildpass;app11903pass/2failof11905/288files,coverage99.88/99.89/100/99.86 only browserowner incompletebecause oldmockabortedtest. Exactfailednamespersistedimmediately beforecollectors. Inventory109pass100,scripts5pass,Chromium103passnoflake. Twofailures:oldmock missingInsertParagraph;newNONEcase incorrectlyexpectsGetListKindnone despite currentgetWriterNumFormatKind mappingallnonbulletnumbered. Fixactualmockcontractandliteralnativeformatassertion;widerdisplayNONEgapexplicitlyunverified. Production unchanged afterfirstprofile,zero passingreplay. Closure:exact2failedappcases passed,13skipped;actualunchangedproductionIstanbulfirst+failed counters100allfour;inventoryfirstmap100 retained,noinventoryreplay. Sixglobalstaticsfirstpass;onlychangedtestformat/ESLintaftermock/NONEcorrection. Five restoredsourceauditspass/semanticviolations0. Scope proof372oldtests371byteidentical,solemockaddition/former2splitcalls->1Enter+1split;all244rowstates/defaults/exceptions unchanged,10boundednotes/oneadditiveundosymbol. 13newappcases12firstpass+solefailureclosed;103Chromiumfirstpass/noflake. Native references6hashes retained,no nativecode/probe/copiedsource inAP. Doctor0errors2preexistingwarnings,routingpass. ResidualNONEdisplay,ShiftEnter,Backspace,fulloutline,selectionrings,merged/redlineprops,fullnativeundo/layout/tablenav/UI andoverallgoalunverified."
id_source: "generated"
---
## Summary

End empty Writer lists through the native edit-window Enter decision.

## Scope

- apps/office/src/sw/source/core/doc/doc.ts
- apps/office/src/sw/source/core/undo/unnum.ts
- apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
- apps/office/src/sw/source/uibase/docvw/edtwin.ts
- apps/office/src/sw/browser/editor/browser-writer-edit-window.ts
- apps/office/src/sw/source/uibase/docvw/native-list-enter.test.ts
- apps/office/src/sw/browser/editor/native-cell-list-enter.test.tsx
- apps/office/e2e/writer-cell-list-enter.spec.ts
- docs/program/source-provenance.json
- docs/program/parity/runtime-inventory.json
- apps/office/src/sw/browser/editor/browser-writer-edit-window.test.ts

## Plan

Iteration141 one existing Enter/list transition correction. SwEditWin owns native KEY_RETURN empty ordinary numbered/bullet paragraph decision: actual PaM has no mark,node empty,actual rule exists and is not outline;disable numbering without split. Add InsertParagraph edit-window entry used only for insertParagraph platform input;retain SplitNode as unconditional shell operation and existing insertLineBreak path until its own audit. Add native-shaped SwWrtShell.DelNumRules,one SwUndoDelNum storing native range and direct list-attribute history,and SwDoc.DelNumRules inclusive actual SwNodes resetting direct rule or overriding inherited rule with empty,reset ID/level/restart/value/count,assigned outline count semantics. Reuse existing actual-node traversal;no body DTO,React list decision,or per-node UI history. Owned app tests prove empty root/nested/uncounted lists,body/cells,rule format NONE,selection/outline/nonempty/plain splits,stable node identity/direct formatting,reset metadata,UndoRedo,followuptyping,actual cell boundaries and invalidation. Mounted/Chromium prove real Enter ends empty cell list without adding paragraphs,nextEnter splits and history. Existing tests unchanged;metadata bounded notes for affected existing owners,all states/defaults/exceptions preserved. Six statics then ONE sequential absent full build/app/inventory/scripts/Chromium with reportOnFailure,exact failed names before assertions,both first JSONcountmaps ignoredappcache only. Failed/new-only closure and actual maps100,no passing/fullbuild replay. finallyrestore then five source audits,scope/hash readonly exact-SHA sameactor quality,doctor/routing,CODERVerification beforeverify/canonicalfinish,cleanmain,parentgoalactive. No network/outside/global/subagents/APsource/helper/Python/probe/rawdiagnostics. Firstprofile observed the old platform mock omits newInsertParagraph method;add that spy and split former2calls into1InsertParagraph+1SplitNode assertion only,everyotheroldassertionunchanged. NewNONEcase must assert literalnativeformatNONE,rather than unsupportedexistingdisplaykind;displayNONE projection remainsunverifiedfollowup. No production changes afterfirstprofile;twofailedappcasesonly,all103Chromiumfirstpass.

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

Owned native Enter range/history and mounted/Chromium contracts. ONE absent profile; exact failed/new-only closure,100 actual coverage,zero passing replay.

## Verification

Pending implementation and validation.

## Rollback Plan

Revert the semantic leaf commit without rewriting history.

## Findings

Iteration140 verified progress DONE. Clean main52d2d13,onlyparentactive,direct,all4matched policies,userinstructionsabsent. Pinned edtwin.cxx1985/2009 KEY_RETURN rule-present nonoutline noselection emptyparagraph ->NumOff,2756 ->DelNumRules;SwWrtShell.SplitNode1452 is unconditionalsplit. Local beforeinput conflatesinsertParagraph andlinebreak and alwayssplits. Native docnum1432 resets directrule orsets empty inherited rule plus5listattrs;unnum156 retainsattributehistory and RedocallsDoc.DelNumRules. Usergoal/explicitUI/list/table mandateauthorizessafelocalcorrection. ShiftEnter,Backspace,fulloutline/layout/rings/redlines remainunverified;registered deviations untouched. Firstprofile buildpass;app11903pass/2failof11905/288files,coverage99.88/99.89/100/99.86 only browserowner incompletebecause oldmockabortedtest. Exactfailednamespersistedimmediately beforecollectors. Inventory109pass100,scripts5pass,Chromium103passnoflake. Twofailures:oldmock missingInsertParagraph;newNONEcase incorrectlyexpectsGetListKindnone despite currentgetWriterNumFormatKind mappingallnonbulletnumbered. Fixactualmockcontractandliteralnativeformatassertion;widerdisplayNONEgapexplicitlyunverified. Production unchanged afterfirstprofile,zero passingreplay. Closure:exact2failedappcases passed,13skipped;actualunchangedproductionIstanbulfirst+failed counters100allfour;inventoryfirstmap100 retained,noinventoryreplay. Sixglobalstaticsfirstpass;onlychangedtestformat/ESLintaftermock/NONEcorrection. Five restoredsourceauditspass/semanticviolations0. Scope proof372oldtests371byteidentical,solemockaddition/former2splitcalls->1Enter+1split;all244rowstates/defaults/exceptions unchanged,10boundednotes/oneadditiveundosymbol. 13newappcases12firstpass+solefailureclosed;103Chromiumfirstpass/noflake. Native references6hashes retained,no nativecode/probe/copiedsource inAP. Doctor0errors2preexistingwarnings,routingpass. ResidualNONEdisplay,ShiftEnter,Backspace,fulloutline,selectionrings,merged/redlineprops,fullnativeundo/layout/tablenav/UI andoverallgoalunverified.
