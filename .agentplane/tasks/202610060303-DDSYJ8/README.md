---
id: "202610060303-DDSYJ8"
title: "Route table properties through native editing and history owners"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "parity"
task_kind: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-06T03:04:09.197Z"
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
    body: "Start: implement native table-property ownership under standing iterative approval."
events:
  -
    type: "status"
    at: "2026-10-06T03:04:10.303Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement native table-property ownership under standing iterative approval."
doc_version: 3
doc_updated_at: "2026-10-06T03:04:10.303Z"
doc_updated_by: "CODER"
description: "Iteration176: remove React table-property mutations through source-shaped SwFEShell and ItemSetToTableParam; grouped native attribute history and correct selection ownership. Full alignment controls remain a subsequent atomic task."
sections:
  Summary: "Restore native table-property application and history ownership."
  Scope: |-
    apps/office/src/sw/source/core/frmedt/fetab.ts
    apps/office/src/sw/source/uibase/shells/tabsh.ts
    apps/office/src/sw/source/core/undo/untbl.ts
    apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
    apps/office/src/sw/browser/presentation/writer-view.tsx
    apps/office/src/sw/browser/presentation/WriterTableDialog.tsx
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
    apps/office/src/sw/source/uibase/wrtsh/native-table-properties.test.ts
    apps/office/src/sw/browser/presentation/native-table-properties.test.tsx
    apps/office/e2e/writer-table-properties-history.spec.ts
  Plan: "Iteration176 ONE direct CODER leaf under standing user approval. Restore represented table-property application through source-shaped SwFEShell inherited by SwWrtShell and native ItemSetToTableParam in tabsh.ts. Remove React table/column/row/box writes and selection traversal for properties. Existing dialog draft contract extends shared core property inputs; no TextRuns, document/table clone, new manager, write adapter, or upstream execution. Native SetTableAttr,SetTabCols,SetRowsToRepeat,SetRowHeight,SetRowSplit,SetTabBorders,SetBoxAlign own canonical mutation/notification. Native SwUndoAttrTable in existing untbl.ts snapshots only table/row/box attributes and widths, resolves actual table node, swaps retained attributes for undo/redo. ItemSetToTableParam groups existing native history and notification transaction. Borders/row split without table selection affect whole table; with selection affect selected cells/rows; box vertical alignment uses selected boxes/current box; row height uses current/selected rows. Preserve original table,row,box,text identities and cursor ring. Existing insertion paths stay bounded follow-up. Eleven semantic paths, six production including two new source-shaped owners, two metadata,three new tests. Preserve456 prior testfiles byte-identical and259 prior semantic statuses/defaults/classes/registeredIOexceptions/evidence prefixes; new owners remain unverified. Complete alignment/spacing/relative-width controls,native Sfx table-format item model,merged/nested/protection/complex frame and completeUI/core parity UNVERIFIED. Six initialstatics then ONE absent fullprofile; only failures/genuinelynew closure; exact100coverage,source/mapidentity; vendor restore beforeaudits; source audits,sameagent exactSHA evaluation,verify/finish,parentcheckpoint. No source/helpers/Python/rawdiagnosticsAP,no testsupstream,no passingreplay,network/global/subagents."
  Verify Steps: |-
    1. Six initial static gates: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Recover only failed gates; after full profile changed-file checks only.
    2. ONE upstream-absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Rename pinned vendor directory in-repo and restore finally. Tests never read/compile/invoke upstream. Persist exact failures/counts/errors/hashes before assertions. Subsequently only original failures and genuinely new cases; skipped means skipped; no passing/full replay. Rebuild only after production change. Actual100coverage proof uses exact final source/maps or whole contiguous byte-identical ranges and real counters; raw maps/results/source only ignored appcache.
    3. Independent literal assertions for actual selection ownership, grouped single Undo/Redo, modified/save-position lifecycle, cursor/ring and native table,row,box,text identity, row height/split/borders/box align/header/column/width values, non-table admission and invalid columns before partial mutation. Mounted actual workbench and real Chromium1280/390 Table Properties changes/Cancel/UndoRedo retain neighboring text. No old test/oracle changes.
    4. Preserve456prior testfiles byte-identical and259semantic states/defaults/classes/registeredIOexceptions/evidence prefixes;11approvedsemanticpaths; append evidence only,new native owner remains partial/unverified. AP ignored-inclusive no sources/helpers/Python/rawdiagnostics;doctor/routing/diff.
    5. After vendor restored, five source audits: npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. ExactSHA sameagent EVALUATOR,no independent reviewer claim,semanticcommit,recordverify,meaningfulfinish,wholeparentcheckpoint;parentDOINGgoalACTIVE.
  Verification: "Pending execution."
  Rollback Plan: "Revert the semantic commit; retain task evidence and registered I/O exceptions."
  Findings: |-
    Read-only discovery found React property mutation without native grouped history and row-wide box alignment. Three bounded guessed-path errors occurred (tabsh under ui/shells twice,wrtsh under sw/inc once); route recomputed and actual native uibase/core paths located, no source mutation after failures. Earlier summary discovery was read-only. Full goal remains ACTIVE and parity UNVERIFIED.

    - Observation: Plan approval rejected because full-doc Summary used level1 heading; start-ready then rejected before any source mutation.
      Impact: No implementation started; task remains TODO.
      Resolution: Recomputed route, filled canonical Summary section and follow sequential successful approval/start.
id_source: "generated"
---
## Summary

Restore native table-property application and history ownership.

## Scope

apps/office/src/sw/source/core/frmedt/fetab.ts
apps/office/src/sw/source/uibase/shells/tabsh.ts
apps/office/src/sw/source/core/undo/untbl.ts
apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
apps/office/src/sw/browser/presentation/writer-view.tsx
apps/office/src/sw/browser/presentation/WriterTableDialog.tsx
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json
apps/office/src/sw/source/uibase/wrtsh/native-table-properties.test.ts
apps/office/src/sw/browser/presentation/native-table-properties.test.tsx
apps/office/e2e/writer-table-properties-history.spec.ts

## Plan

Iteration176 ONE direct CODER leaf under standing user approval. Restore represented table-property application through source-shaped SwFEShell inherited by SwWrtShell and native ItemSetToTableParam in tabsh.ts. Remove React table/column/row/box writes and selection traversal for properties. Existing dialog draft contract extends shared core property inputs; no TextRuns, document/table clone, new manager, write adapter, or upstream execution. Native SetTableAttr,SetTabCols,SetRowsToRepeat,SetRowHeight,SetRowSplit,SetTabBorders,SetBoxAlign own canonical mutation/notification. Native SwUndoAttrTable in existing untbl.ts snapshots only table/row/box attributes and widths, resolves actual table node, swaps retained attributes for undo/redo. ItemSetToTableParam groups existing native history and notification transaction. Borders/row split without table selection affect whole table; with selection affect selected cells/rows; box vertical alignment uses selected boxes/current box; row height uses current/selected rows. Preserve original table,row,box,text identities and cursor ring. Existing insertion paths stay bounded follow-up. Eleven semantic paths, six production including two new source-shaped owners, two metadata,three new tests. Preserve456 prior testfiles byte-identical and259 prior semantic statuses/defaults/classes/registeredIOexceptions/evidence prefixes; new owners remain unverified. Complete alignment/spacing/relative-width controls,native Sfx table-format item model,merged/nested/protection/complex frame and completeUI/core parity UNVERIFIED. Six initialstatics then ONE absent fullprofile; only failures/genuinelynew closure; exact100coverage,source/mapidentity; vendor restore beforeaudits; source audits,sameagent exactSHA evaluation,verify/finish,parentcheckpoint. No source/helpers/Python/rawdiagnosticsAP,no testsupstream,no passingreplay,network/global/subagents.

## Verify Steps

1. Six initial static gates: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Recover only failed gates; after full profile changed-file checks only.
2. ONE upstream-absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Rename pinned vendor directory in-repo and restore finally. Tests never read/compile/invoke upstream. Persist exact failures/counts/errors/hashes before assertions. Subsequently only original failures and genuinely new cases; skipped means skipped; no passing/full replay. Rebuild only after production change. Actual100coverage proof uses exact final source/maps or whole contiguous byte-identical ranges and real counters; raw maps/results/source only ignored appcache.
3. Independent literal assertions for actual selection ownership, grouped single Undo/Redo, modified/save-position lifecycle, cursor/ring and native table,row,box,text identity, row height/split/borders/box align/header/column/width values, non-table admission and invalid columns before partial mutation. Mounted actual workbench and real Chromium1280/390 Table Properties changes/Cancel/UndoRedo retain neighboring text. No old test/oracle changes.
4. Preserve456prior testfiles byte-identical and259semantic states/defaults/classes/registeredIOexceptions/evidence prefixes;11approvedsemanticpaths; append evidence only,new native owner remains partial/unverified. AP ignored-inclusive no sources/helpers/Python/rawdiagnostics;doctor/routing/diff.
5. After vendor restored, five source audits: npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. ExactSHA sameagent EVALUATOR,no independent reviewer claim,semanticcommit,recordverify,meaningfulfinish,wholeparentcheckpoint;parentDOINGgoalACTIVE.

## Verification

Pending execution.

## Rollback Plan

Revert the semantic commit; retain task evidence and registered I/O exceptions.

## Findings

Read-only discovery found React property mutation without native grouped history and row-wide box alignment. Three bounded guessed-path errors occurred (tabsh under ui/shells twice,wrtsh under sw/inc once); route recomputed and actual native uibase/core paths located, no source mutation after failures. Earlier summary discovery was read-only. Full goal remains ACTIVE and parity UNVERIFIED.

- Observation: Plan approval rejected because full-doc Summary used level1 heading; start-ready then rejected before any source mutation.
  Impact: No implementation started; task remains TODO.
  Resolution: Recomputed route, filled canonical Summary section and follow sequential successful approval/start.
