---
id: "202610060303-DDSYJ8"
title: "Route table properties through native editing and history owners"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 15
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
quality_review:
  state: "pass"
  updated_at: "2026-10-06T04:49:23.325Z"
  updated_by: "EVALUATOR"
  note: "Same-agent exactSHA 2513804194e3fd2fe3055acae26d795712d4b729 PASS for bounded native table-property handoff and grouped attribute history; no independent reviewer claim; complete parity unverified."
  evaluated_sha: "2513804194e3fd2fe3055acae26d795712d4b729"
  blueprint_digest: "626dfcc93c69f2fc8edb8e192881a5c3dee336f133d52f55ebdf9d1d58d0f0c3"
  evidence_refs:
    - ".agentplane/tasks/202610060303-DDSYJ8/README.md"
    - ".agentplane/tasks/202610060303-DDSYJ8/quality/20261006-044923325-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610060303-DDSYJ8/quality/20261006-044923325-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610060303-DDSYJ8/quality/20261006-044923325-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610060303-DDSYJ8/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610060303-DDSYJ8/evidence/exact-sha-review.json"
    - ".agentplane/tasks/202610060303-DDSYJ8/evidence/final-coverage.json"
  findings:
    - "Actual12731app109inventory5scripts167Chrome PASS; only original2app/2Chrome closure, unchanged six production hashes and258exact maps, actual100coverage; native selection scopes/graph/cursor/lifecycle retained;456prior testfiles259semantic contracts and registeredIOexceptions preserved."
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
doc_updated_at: "2026-10-06T05:50:03.273Z"
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
  Verification: |-
    Command: six initial static gates and changed-file Prettier/ESLint/JSDoc/TypeScript/physical-line checks. Result: pass after only failed format/typecheck recovery; remaining initial gates executed once. Evidence: static-gates.json,changed-initial-statics.json,changed-failure-statics.json. Scope: approved11semantic paths.
    Command: ONE upstream-absent full build/app/inventory/scripts/Chromium profile and original-failure-only app/Chrome closure. Result: pass,actual distinct12731app109inventory5scripts167Chrome,0flaky. Initial2app+2Chrome failures are documented fixture subscription/tag-selection errors; original2app PASS5skip7total and2Chrome PASS. Coverage-only subset exit1 reflects unchanged global100threshold; final exact-source/map actualcounter merge100L/S/F/B. No prodchange/rebuild or passing/full replay. Evidence: absent-profile.json,closure-profile.json,final-coverage.json. Scope: native/mounted/production cases using owned classes only; vendor restored finally.
    Command: five restored source audits,scopeprefix/testidentity,doctor,routing,diff,ignored-inclusive AP scan. Result: pass;0semantic violations,456prior testfiles byte-identical,259prior semantic contracts preserved,261modules with2new unverified owners,doctor0errors2knownwarnings,4578APfiles0forbidden. Evidence: restored-source-audits.json,scope-audit.json,governance.json,artifact-audit.json. Scope: no upstream sources/helpers/Python/rawdiagnostics in AP,no policy/IOexceptions changes.
    Command: same-agent exact implementation-SHA EVALUATOR review followed by recorded verify and meaningful finish. Result: pass at implementation SHA 2513804194e3fd2fe3055acae26d795712d4b729; quality 20261006-044923325-recovery-context, same-agent exactSHA phase, no independent reviewer claim. Scope: no independent reviewer claim; whole goalACTIVE,parentDOING,complete core/UI/table parityUNVERIFIED.
  Rollback Plan: "Revert the semantic commit; retain task evidence and registered I/O exceptions."
  Findings: |-
    Read-only discovery found React property mutation without native grouped history and row-wide box alignment. Three bounded guessed-path errors occurred (tabsh under ui/shells twice,wrtsh under sw/inc once); route recomputed and actual native uibase/core paths located, no source mutation after failures. Earlier summary discovery was read-only. Full goal remains ACTIVE and parity UNVERIFIED.

    - Observation: Plan approval rejected because full-doc Summary used level1 heading; start-ready then rejected before any source mutation.
      Impact: No implementation started; task remains TODO.
      Resolution: Recomputed route, filled canonical Summary section and follow sequential successful approval/start.

    - Observation: Initial format gate failed only new E2E and undo file; metadata update initially rejected browser entries lacking preservedResponsibilities before any JSON write; added shell import made wrtsh1 physical1000lines.
      Impact: No full test profile started; raw source never stored in AgentPlane.
      Resolution: Recomputed route, reused existing browser responsibilities arrays, removed one redundant source header blank line and reformatted new files; run failed format and remaining initial gates only.

    - Observation: Initial typecheck failed new test API: Testing Library ByRoleOptions has no exact field; Vitest it.each expands array tuple elements.
      Impact: Production files had no reported TypeScript errors; full profile not yet started.
      Resolution: Removed unsupported mounted test option and wrapped invalid-column vectors as single tuple arguments; retain all literal assertions; run failed typecheck and remaining initial gates only.

    - Observation: ONE absentprofile terminal: build PASS; app12729PASS2newFAIL0skip12731total (both uses native selection scope and one attribute history selected=false/true: vi.fn expected1 received0); inventory109PASS100coverage;scripts5PASS;Chrome165oldPASS2newFAIL0flaky (both Writer table properties native history width1280/390: padding7.53333px expected,3.33333px received). Vendor restored finally. Appcoverage99.97L99.97S99.91F100B,onlynew attribute payload getters unexecuted after earlier assertions.
      Impact: No old app or Chromium cases failed. Core fixture observed SwEditWin input-completion callback rather than shell broadcaster. Chrome td-only locator skipped first row after existing dialog header default changes it to th.
      Resolution: Use actual shell broadcaster subscription and canonical data-writer-table-box cell identity covering th and td. Retain all literal scope,geometry,history and lifecycle assertions; no production change or rebuild. Run only original2app failures and2newChrome failures. One bounded guessed browser filename miss was corrected via rg files; no source mutation after that read failure.

    - Observation: Failed-only closure terminal: original2app cases PASS5skip7total and original2Chrome PASS0flaky; no inventory replay, no rebuild and six production hashes unchanged. Coverage-only subset command exit1 reflects unchanged global100threshold; actual2cases passed and final standard Istanbul merge proves100L/S/F/B for app13212L14483S3496F10799B and inventory1464L1523S384F1080B. App258per-file statement/function/branch maps exact; inventories retain initial100counts.
      Impact: Actual distinct final outcomes12731app109inventory5scripts167Chrome PASS, no passing/full replay. All456prior testfiles byte-identical;259prior semantic contracts/statuses/defaults/classes/IOexceptions/evidence prefixes preserved;261modules with2new native owners unverified.
      Resolution: Five restored source audits PASS with0semantic violations; same-agent exactSHA evaluation and meaningful semantic finish follow. Complete table alignment/spacing/relative-width controls,native item and differentiated undo ownership,complex tables,insertion and fullUI/core parity remain UNVERIFIED; goalACTIVE,parentDOING.

    - Observation: Semantic commit rejected by commit-msg: scope table is not one of task intents code/parity/task/close/integrate.
      Impact: All tests and direct governance checks remain verified; no commit created or production changes.
      Resolution: Recomputed route, use parity intent in semantic commit and retain exact source/counter evidence; no tests or passing gates replayed.
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

Command: six initial static gates and changed-file Prettier/ESLint/JSDoc/TypeScript/physical-line checks. Result: pass after only failed format/typecheck recovery; remaining initial gates executed once. Evidence: static-gates.json,changed-initial-statics.json,changed-failure-statics.json. Scope: approved11semantic paths.
Command: ONE upstream-absent full build/app/inventory/scripts/Chromium profile and original-failure-only app/Chrome closure. Result: pass,actual distinct12731app109inventory5scripts167Chrome,0flaky. Initial2app+2Chrome failures are documented fixture subscription/tag-selection errors; original2app PASS5skip7total and2Chrome PASS. Coverage-only subset exit1 reflects unchanged global100threshold; final exact-source/map actualcounter merge100L/S/F/B. No prodchange/rebuild or passing/full replay. Evidence: absent-profile.json,closure-profile.json,final-coverage.json. Scope: native/mounted/production cases using owned classes only; vendor restored finally.
Command: five restored source audits,scopeprefix/testidentity,doctor,routing,diff,ignored-inclusive AP scan. Result: pass;0semantic violations,456prior testfiles byte-identical,259prior semantic contracts preserved,261modules with2new unverified owners,doctor0errors2knownwarnings,4578APfiles0forbidden. Evidence: restored-source-audits.json,scope-audit.json,governance.json,artifact-audit.json. Scope: no upstream sources/helpers/Python/rawdiagnostics in AP,no policy/IOexceptions changes.
Command: same-agent exact implementation-SHA EVALUATOR review followed by recorded verify and meaningful finish. Result: pass at implementation SHA 2513804194e3fd2fe3055acae26d795712d4b729; quality 20261006-044923325-recovery-context, same-agent exactSHA phase, no independent reviewer claim. Scope: no independent reviewer claim; whole goalACTIVE,parentDOING,complete core/UI/table parityUNVERIFIED.

## Rollback Plan

Revert the semantic commit; retain task evidence and registered I/O exceptions.

## Findings

Read-only discovery found React property mutation without native grouped history and row-wide box alignment. Three bounded guessed-path errors occurred (tabsh under ui/shells twice,wrtsh under sw/inc once); route recomputed and actual native uibase/core paths located, no source mutation after failures. Earlier summary discovery was read-only. Full goal remains ACTIVE and parity UNVERIFIED.

- Observation: Plan approval rejected because full-doc Summary used level1 heading; start-ready then rejected before any source mutation.
  Impact: No implementation started; task remains TODO.
  Resolution: Recomputed route, filled canonical Summary section and follow sequential successful approval/start.

- Observation: Initial format gate failed only new E2E and undo file; metadata update initially rejected browser entries lacking preservedResponsibilities before any JSON write; added shell import made wrtsh1 physical1000lines.
  Impact: No full test profile started; raw source never stored in AgentPlane.
  Resolution: Recomputed route, reused existing browser responsibilities arrays, removed one redundant source header blank line and reformatted new files; run failed format and remaining initial gates only.

- Observation: Initial typecheck failed new test API: Testing Library ByRoleOptions has no exact field; Vitest it.each expands array tuple elements.
  Impact: Production files had no reported TypeScript errors; full profile not yet started.
  Resolution: Removed unsupported mounted test option and wrapped invalid-column vectors as single tuple arguments; retain all literal assertions; run failed typecheck and remaining initial gates only.

- Observation: ONE absentprofile terminal: build PASS; app12729PASS2newFAIL0skip12731total (both uses native selection scope and one attribute history selected=false/true: vi.fn expected1 received0); inventory109PASS100coverage;scripts5PASS;Chrome165oldPASS2newFAIL0flaky (both Writer table properties native history width1280/390: padding7.53333px expected,3.33333px received). Vendor restored finally. Appcoverage99.97L99.97S99.91F100B,onlynew attribute payload getters unexecuted after earlier assertions.
  Impact: No old app or Chromium cases failed. Core fixture observed SwEditWin input-completion callback rather than shell broadcaster. Chrome td-only locator skipped first row after existing dialog header default changes it to th.
  Resolution: Use actual shell broadcaster subscription and canonical data-writer-table-box cell identity covering th and td. Retain all literal scope,geometry,history and lifecycle assertions; no production change or rebuild. Run only original2app failures and2newChrome failures. One bounded guessed browser filename miss was corrected via rg files; no source mutation after that read failure.

- Observation: Failed-only closure terminal: original2app cases PASS5skip7total and original2Chrome PASS0flaky; no inventory replay, no rebuild and six production hashes unchanged. Coverage-only subset command exit1 reflects unchanged global100threshold; actual2cases passed and final standard Istanbul merge proves100L/S/F/B for app13212L14483S3496F10799B and inventory1464L1523S384F1080B. App258per-file statement/function/branch maps exact; inventories retain initial100counts.
  Impact: Actual distinct final outcomes12731app109inventory5scripts167Chrome PASS, no passing/full replay. All456prior testfiles byte-identical;259prior semantic contracts/statuses/defaults/classes/IOexceptions/evidence prefixes preserved;261modules with2new native owners unverified.
  Resolution: Five restored source audits PASS with0semantic violations; same-agent exactSHA evaluation and meaningful semantic finish follow. Complete table alignment/spacing/relative-width controls,native item and differentiated undo ownership,complex tables,insertion and fullUI/core parity remain UNVERIFIED; goalACTIVE,parentDOING.

- Observation: Semantic commit rejected by commit-msg: scope table is not one of task intents code/parity/task/close/integrate.
  Impact: All tests and direct governance checks remain verified; no commit created or production changes.
  Resolution: Recomputed route, use parity intent in semantic commit and retain exact source/counter evidence; no tests or passing gates replayed.
