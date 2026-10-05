---
id: "202610050655-WD3HVN"
title: "End empty Writer lists through the native edit-window Enter decision"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-05T06:55:24.145Z"
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
doc_updated_at: "2026-10-05T06:55:24.789Z"
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
  Plan: "Iteration141 one existing Enter/list transition correction. SwEditWin owns native KEY_RETURN empty ordinary numbered/bullet paragraph decision: actual PaM has no mark,node empty,actual rule exists and is not outline;disable numbering without split. Add InsertParagraph edit-window entry used only for insertParagraph platform input;retain SplitNode as unconditional shell operation and existing insertLineBreak path until its own audit. Add native-shaped SwWrtShell.DelNumRules,one SwUndoDelNum storing native range and direct list-attribute history,and SwDoc.DelNumRules inclusive actual SwNodes resetting direct rule or overriding inherited rule with empty,reset ID/level/restart/value/count,assigned outline count semantics. Reuse existing actual-node traversal;no body DTO,React list decision,or per-node UI history. Owned app tests prove empty root/nested/uncounted lists,body/cells,rule format NONE,selection/outline/nonempty/plain splits,stable node identity/direct formatting,reset metadata,UndoRedo,followuptyping,actual cell boundaries and invalidation. Mounted/Chromium prove real Enter ends empty cell list without adding paragraphs,nextEnter splits and history. Existing tests unchanged;metadata bounded notes for affected existing owners,all states/defaults/exceptions preserved. Six statics then ONE sequential absent full build/app/inventory/scripts/Chromium with reportOnFailure,exact failed names before assertions,both first JSONcountmaps ignoredappcache only. Failed/new-only closure and actual maps100,no passing/fullbuild replay. finallyrestore then five source audits,scope/hash readonly exact-SHA sameactor quality,doctor/routing,CODERVerification beforeverify/canonicalfinish,cleanmain,parentgoalactive. No network/outside/global/subagents/APsource/helper/Python/probe/rawdiagnostics."
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
  Findings: "Iteration140 verified progress DONE. Clean main52d2d13,onlyparentactive,direct,all4matched policies,userinstructionsabsent. Pinned edtwin.cxx1985/2009 KEY_RETURN rule-present nonoutline noselection emptyparagraph ->NumOff,2756 ->DelNumRules;SwWrtShell.SplitNode1452 is unconditionalsplit. Local beforeinput conflatesinsertParagraph andlinebreak and alwayssplits. Native docnum1432 resets directrule orsets empty inherited rule plus5listattrs;unnum156 retainsattributehistory and RedocallsDoc.DelNumRules. Usergoal/explicitUI/list/table mandateauthorizessafelocalcorrection. ShiftEnter,Backspace,fulloutline/layout/rings/redlines remainunverified;registered deviations untouched."
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

## Plan

Iteration141 one existing Enter/list transition correction. SwEditWin owns native KEY_RETURN empty ordinary numbered/bullet paragraph decision: actual PaM has no mark,node empty,actual rule exists and is not outline;disable numbering without split. Add InsertParagraph edit-window entry used only for insertParagraph platform input;retain SplitNode as unconditional shell operation and existing insertLineBreak path until its own audit. Add native-shaped SwWrtShell.DelNumRules,one SwUndoDelNum storing native range and direct list-attribute history,and SwDoc.DelNumRules inclusive actual SwNodes resetting direct rule or overriding inherited rule with empty,reset ID/level/restart/value/count,assigned outline count semantics. Reuse existing actual-node traversal;no body DTO,React list decision,or per-node UI history. Owned app tests prove empty root/nested/uncounted lists,body/cells,rule format NONE,selection/outline/nonempty/plain splits,stable node identity/direct formatting,reset metadata,UndoRedo,followuptyping,actual cell boundaries and invalidation. Mounted/Chromium prove real Enter ends empty cell list without adding paragraphs,nextEnter splits and history. Existing tests unchanged;metadata bounded notes for affected existing owners,all states/defaults/exceptions preserved. Six statics then ONE sequential absent full build/app/inventory/scripts/Chromium with reportOnFailure,exact failed names before assertions,both first JSONcountmaps ignoredappcache only. Failed/new-only closure and actual maps100,no passing/fullbuild replay. finallyrestore then five source audits,scope/hash readonly exact-SHA sameactor quality,doctor/routing,CODERVerification beforeverify/canonicalfinish,cleanmain,parentgoalactive. No network/outside/global/subagents/APsource/helper/Python/probe/rawdiagnostics.

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

Iteration140 verified progress DONE. Clean main52d2d13,onlyparentactive,direct,all4matched policies,userinstructionsabsent. Pinned edtwin.cxx1985/2009 KEY_RETURN rule-present nonoutline noselection emptyparagraph ->NumOff,2756 ->DelNumRules;SwWrtShell.SplitNode1452 is unconditionalsplit. Local beforeinput conflatesinsertParagraph andlinebreak and alwayssplits. Native docnum1432 resets directrule orsets empty inherited rule plus5listattrs;unnum156 retainsattributehistory and RedocallsDoc.DelNumRules. Usergoal/explicitUI/list/table mandateauthorizessafelocalcorrection. ShiftEnter,Backspace,fulloutline/layout/rings/redlines remainunverified;registered deviations untouched.
