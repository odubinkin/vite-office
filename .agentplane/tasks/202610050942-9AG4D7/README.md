---
id: "202610050942-9AG4D7"
title: "Own Ctrl Home End cell and table section selection in native cursor and shell"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 13
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-05T10:06:28.458Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-05T10:20:45.976Z"
  updated_by: "CODER"
  note: "Bounded native section cursor and shared table editing host verified at a0faca4f67f585c96fcf866df59df71f663f105e;actual app/inventory100percent,385prior testfiles unchanged,112uniqueChromium closed,only failed/new source cases repeated. Full native table/UI parity remains unverified."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-05T10:19:35.502Z"
  updated_by: "EVALUATOR"
  note: "Same-agent read-only exact-SHA review passes for native CtrlHomeEnd section/table cursor ownership and removal of nested table editing hosts; broad parity remains unverified."
  evaluated_sha: "a0faca4f67f585c96fcf866df59df71f663f105e"
  blueprint_digest: "1c8d5b725b587691261f679f4166a068b232ca8a522f070ee311971ec5802e99"
  evidence_refs:
    - ".agentplane/tasks/202610050942-9AG4D7/README.md"
    - ".agentplane/tasks/202610050942-9AG4D7/quality/20261005-101935502-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610050942-9AG4D7/quality/20261005-101935502-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610050942-9AG4D7/quality/20261005-101935502-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610050942-9AG4D7/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610050942-9AG4D7/evidence/exact-sha-review.json"
    - ".agentplane/tasks/202610050942-9AG4D7/evidence/cumulative-coverage.json"
    - ".agentplane/tasks/202610050942-9AG4D7/evidence/restored-source-audits.json"
  findings:
    - "Twenty-five new app cases and three new browser cases close the bounded contracts;385 previous testfiles unchanged,246runtime states/defaults/exceptions preserved,actual cumulative app/inventory100percent,five restored source audits pass. Original failing browser selection now spans actual cell paragraphs;only failed/new cases ran after two renderer attribute removals."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Implement the approved native section boundary cursor and marked table escalation with actual node identities; preserve registered deviations and absent-only verification."
events:
  -
    type: "status"
    at: "2026-10-05T09:43:43.020Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement the approved native section boundary cursor and marked table escalation with actual node identities; preserve registered deviations and absent-only verification."
  -
    type: "verify"
    at: "2026-10-05T10:20:45.976Z"
    author: "CODER"
    state: "ok"
    note: "Bounded native section cursor and shared table editing host verified at a0faca4f67f585c96fcf866df59df71f663f105e;actual app/inventory100percent,385prior testfiles unchanged,112uniqueChromium closed,only failed/new source cases repeated. Full native table/UI parity remains unverified."
doc_version: 3
doc_updated_at: "2026-10-05T10:20:46.031Z"
doc_updated_by: "CODER"
description: "Repair browser-owned document boundary keys through actual SwNodes cell section, table and document cursor contracts. Preserve fixed selection marks and native marked table restrictions; no TextRuns navigation or registered I/O deviation changes."
sections:
  Summary: "Own existing document-boundary keyboard behavior in native cursor and shell."
  Scope: |-
    - apps/office/src/sw/source/core/crsr/swcrsr.ts
    - apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
    - apps/office/src/sw/source/uibase/docvw/edtwin.ts
    - apps/office/src/sw/browser/editor/browser-writer-edit-window.ts
    - apps/office/src/sw/source/uibase/wrtsh/native-section-navigation.test.ts
    - apps/office/src/sw/browser/editor/native-section-navigation.test.tsx
    - apps/office/e2e/writer-native-section-navigation.spec.ts
    - docs/program/source-provenance.json
    - docs/program/parity/runtime-inventory.json
    - apps/office/src/sw/browser/editor/WriterEditableParagraph.tsx
    - apps/office/src/sw/browser/editor/WriterEditableTable.tsx
  Plan: "Implement native SwCursor current-section, current-table and document boundary movement over actual SwNodes, plus bounded SwTableCursor ownership for marked table escalation. SwWrtShell StartOfSection/EndOfSection owns selection setup, table cursor activation and refresh; SwEditWin and browser translate only Ctrl/Meta Home/End intent. Verify first/last paragraph offsets, repeated cell/table/document escalation, fixed marks and table cursor lifetime, body and table at document edges, empty cells, pending attributes and typing/history grouping in new core, mounted and Chromium cases. Preserve all existing tests, classifications and registered I/O deviations. Plain visual-line Home/End, full native table box selection painting/rings/layout and protected/merged/nested tables remain unverified. One leaf only. Chromium first run110pass/1failed shows browser text selection clipped to separate per-paragraph contenteditable hosts. Under the standing explicit UI adapter-refactoring authorization, remove the two obsolete table/paragraph editing-host overrides so all text inherits the existing document host. Add new unexecuted mounted/browser checks for the inherited host and multi-paragraph range. Preserve the failed selection assertion; repair its later ordinary-key expectation to native cell/table escalation. Repeat only the failed Chromium case and genuinely new cases against final source through an in-memory development-server configuration; no passing build or suite replay. Initial six statics/build/app/inventory/scripts remain recorded; changed files get focused static checks and actual source-aligned cumulative coverage."
  Verify Steps: |-
    1. Run six static gates once: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Repeat only failed gates, plus changed-file static checks after remediation.
    2. Rename vendor/libreoffice-reference inside this repository and restore in finally. Run one sequential absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Persist exact failed/error-causing names before assertions and replay only failures/new unexecuted cases; never replay passing cases or run tests with upstream present. Keep real initial Istanbul countmaps only in ignored app cache and preserve 100 percent app/inventory cumulative metrics without suppressing branches or relaxing criteria.
    3. After restoration run five source audits: npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. Hash consulted native sources; do not store upstream source, helpers, code, raw diffs or source diagnostics in Agentplane.
    4. Assert new tests cover real core cursor identity, cell/table/document bounds, marked table cursor escalation and lifetime, direction, empty and multiple paragraphs, table-only document edge ordering, pending input/history and actual DOM/Chromium keyboard behavior. All prior tests remain byte-identical; runtime classifications/defaults/registered deviations stay unchanged. Record bounded residuals, exact implementation SHA review, quality and custom verification; run ap doctor, routing, ignored-inclusive AP scan and final clean status.
  Verification: |-
    Command: Six initial static gates; ONE sequential upstream-absent build/app/inventory/scripts/Chromium profile with reportOnFailure; failed/new-only final-source profiles; five source audits after restoration; source/scope and exact-SHA review; ap doctor; routing; ignored-inclusive Agentplane scan.
    Result: pass.
    Evidence: Implementation a0faca4f67f585c96fcf866df59df71f663f105e; quality pass .agentplane/tasks/202610050942-9AG4D7/quality/20261005-101935502-recovery-context/quality-report.json. Initial app12046 tests/296files andinventory109/36files pass first with100 percent allfour metrics;script tests5pass. InitialChromium110pass/1newfailed of111,no flakes. Removed two obsolete renderer editing-host overrides after the real selection failure. Original failing Chromium case and one new mounted host/range case pass on finalsource;only one additional failed new split/join case repeated after replacing unsupported visual Home positioning with ArrowLeft twice,retaining all semantic assertions. Twenty-five new app cases andthree newChromium cases are closed,total112uniqueChromium;385previous testfiles byte-identical,no passing/full/build replay. Actual source-aligned cumulative app11826lines/12946statements/3307functions/9728branches andinventory1464/1523/384/1080 all100percent. Five restored source audits pass,semanticViolationCount0. Existing246runtime states/defaults/classifications/registeredexceptions preserved;8nativehashes and12boundedowner notes. Doctor0errors/2preexistingwarnings;route/diff/AP scan pass.
    Scope: Actual cell-section,table and document endpoint order; native ordinary/table cursor ownership and fixed marks; shared inherited document editing host; real browser selection,typing,split,join,UndoRedo and independent neighbors.
    Validation limit: Initial successful static bundle/build andfullChromium predate only the two attribute-removal corrections. Final source was tested through the existing Playwright configuration loaded in memory with a development server; no successful build was repeated. Isolated coverage thresholds0 are diagnostic only; actual cumulative source metrics remain100 and project configuration unchanged.
    Residual: Plain visual-line HomeEnd,complete selected-box painting/cursor rings/layout/native SwCursorShell,protected/merged/nested/redline/fullcore/UI remain unverified. Parent goal stays active; no blanket promotion.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-05T10:20:45.976Z — VERIFY — ok

    By: CODER

    Note: Bounded native section cursor and shared table editing host verified at a0faca4f67f585c96fcf866df59df71f663f105e;actual app/inventory100percent,385prior testfiles unchanged,112uniqueChromium closed,only failed/new source cases repeated. Full native table/UI parity remains unverified.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-05T10:20:45.263Z, excerpt_hash=sha256:5bf65c2b9851afabf9196eb14dcfa16ecc4ee77ca40563cd10b40e752ba87dce

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610050942-9AG4D7/blueprint/resolved-snapshot.json
    - old_digest: 1c8d5b725b587691261f679f4166a068b232ca8a522f070ee311971ec5802e99
    - current_digest: 1c8d5b725b587691261f679f4166a068b232ca8a522f070ee311971ec5802e99
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610050942-9AG4D7

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610050942-9AG4D7
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only the scoped implementation commit and retain task evidence; no history rewrite or registered deviation changes."
  Findings: "Previous goal turn145 was verified progress. Current upstream move.cxx, txtcrsr.cxx, select.cxx, pam.cxx, swcrsr.cxx and trvltbl.cxx show cell-section first, table cursor conversion on marked escalation, then document bounds. Browser currently delegates these keys. Native raw MoveTable rejects marked ordinary cursors; shell converts to a table cursor. This task implements the existing flat cell graph and direction-preserving endpoints; complete selected-box painting/rings/protected/merged/nested behavior remains unverified. No network, outside-repository access, subagents, upstream execution or Agentplane code artifacts. Six statics passed after one unused-import lint failure; only failed lint repeated. First ONE absent profile: build pass;12046 app/296 files and109 inventory/36 files pass with100 percent allfour metrics;scripts5pass;Chromium110pass/1failed/no flakes. Failed exact case is Writer Shift Ctrl Home selects cell paragraphs through native point and mark;selected browser text was Tail instead of containing Second. Actual old table wrapper contentEditable=false and per-cell-paragraph contentEditable=true create independent editing hosts. Remove those adapters inside existing UI authorization, retain original range assertion and add native host checks. No production core/shell changes are needed. Final closures: initial failed ShiftCtrlHome case passes against final source after shared host fix;one new mounted host/range case passes with6prior cases skipped. New Chromium split/join case initially used visual Home,which did not move the macOS browser caret and Backspace deleted the final character;the unsupported visual Home gap remains explicit. Replace only failed-case fixture placement with two ArrowLeft keys and retain all actual join,Undo,Redo and neighbor assertions. Sole failed new case passes;no passing case replay. Existing config was loaded in memory with development server for changed UI,so no successful static build was repeated. The first build/full Chromiums predate the two attribute-removal corrections;final source selection/typing/split/join/history were checked in real Chromium. Final production core/shell/editwin/adapter four hashes match first profile;only two renderer attributes changed. Actual initial/new-case Istanbul maps align only exact contiguous source-identical locations;changed/crossing locations use final counters,app11826lines/12946statements/3307functions/9728branches andinventory1464/1523/384/1080 all100percent. Five restored source audits pass,semantic violations0. Scope audit:385prior app/script testfiles byte-identical;25new app cases and3new Chromium cases,total112 unique Chromium closed;246existing runtime states/defaults/classifications/deviations retained,12bounded notes across6owners,8native source hashes. AP ignored-inclusive scan4085files/0forbidden;doctor0errors/2preexistingwarnings,routing/diffcheckpass. Full selected-box painting/cursor rings/layout/native SwCursorShell,visual-line HomeEnd,protected/merged/nested/redline/fullUI and parentgoal remain unverified."
id_source: "generated"
---
## Summary

Own existing document-boundary keyboard behavior in native cursor and shell.

## Scope

- apps/office/src/sw/source/core/crsr/swcrsr.ts
- apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
- apps/office/src/sw/source/uibase/docvw/edtwin.ts
- apps/office/src/sw/browser/editor/browser-writer-edit-window.ts
- apps/office/src/sw/source/uibase/wrtsh/native-section-navigation.test.ts
- apps/office/src/sw/browser/editor/native-section-navigation.test.tsx
- apps/office/e2e/writer-native-section-navigation.spec.ts
- docs/program/source-provenance.json
- docs/program/parity/runtime-inventory.json
- apps/office/src/sw/browser/editor/WriterEditableParagraph.tsx
- apps/office/src/sw/browser/editor/WriterEditableTable.tsx

## Plan

Implement native SwCursor current-section, current-table and document boundary movement over actual SwNodes, plus bounded SwTableCursor ownership for marked table escalation. SwWrtShell StartOfSection/EndOfSection owns selection setup, table cursor activation and refresh; SwEditWin and browser translate only Ctrl/Meta Home/End intent. Verify first/last paragraph offsets, repeated cell/table/document escalation, fixed marks and table cursor lifetime, body and table at document edges, empty cells, pending attributes and typing/history grouping in new core, mounted and Chromium cases. Preserve all existing tests, classifications and registered I/O deviations. Plain visual-line Home/End, full native table box selection painting/rings/layout and protected/merged/nested tables remain unverified. One leaf only. Chromium first run110pass/1failed shows browser text selection clipped to separate per-paragraph contenteditable hosts. Under the standing explicit UI adapter-refactoring authorization, remove the two obsolete table/paragraph editing-host overrides so all text inherits the existing document host. Add new unexecuted mounted/browser checks for the inherited host and multi-paragraph range. Preserve the failed selection assertion; repair its later ordinary-key expectation to native cell/table escalation. Repeat only the failed Chromium case and genuinely new cases against final source through an in-memory development-server configuration; no passing build or suite replay. Initial six statics/build/app/inventory/scripts remain recorded; changed files get focused static checks and actual source-aligned cumulative coverage.

## Verify Steps

1. Run six static gates once: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Repeat only failed gates, plus changed-file static checks after remediation.
2. Rename vendor/libreoffice-reference inside this repository and restore in finally. Run one sequential absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Persist exact failed/error-causing names before assertions and replay only failures/new unexecuted cases; never replay passing cases or run tests with upstream present. Keep real initial Istanbul countmaps only in ignored app cache and preserve 100 percent app/inventory cumulative metrics without suppressing branches or relaxing criteria.
3. After restoration run five source audits: npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. Hash consulted native sources; do not store upstream source, helpers, code, raw diffs or source diagnostics in Agentplane.
4. Assert new tests cover real core cursor identity, cell/table/document bounds, marked table cursor escalation and lifetime, direction, empty and multiple paragraphs, table-only document edge ordering, pending input/history and actual DOM/Chromium keyboard behavior. All prior tests remain byte-identical; runtime classifications/defaults/registered deviations stay unchanged. Record bounded residuals, exact implementation SHA review, quality and custom verification; run ap doctor, routing, ignored-inclusive AP scan and final clean status.

## Verification

Command: Six initial static gates; ONE sequential upstream-absent build/app/inventory/scripts/Chromium profile with reportOnFailure; failed/new-only final-source profiles; five source audits after restoration; source/scope and exact-SHA review; ap doctor; routing; ignored-inclusive Agentplane scan.
Result: pass.
Evidence: Implementation a0faca4f67f585c96fcf866df59df71f663f105e; quality pass .agentplane/tasks/202610050942-9AG4D7/quality/20261005-101935502-recovery-context/quality-report.json. Initial app12046 tests/296files andinventory109/36files pass first with100 percent allfour metrics;script tests5pass. InitialChromium110pass/1newfailed of111,no flakes. Removed two obsolete renderer editing-host overrides after the real selection failure. Original failing Chromium case and one new mounted host/range case pass on finalsource;only one additional failed new split/join case repeated after replacing unsupported visual Home positioning with ArrowLeft twice,retaining all semantic assertions. Twenty-five new app cases andthree newChromium cases are closed,total112uniqueChromium;385previous testfiles byte-identical,no passing/full/build replay. Actual source-aligned cumulative app11826lines/12946statements/3307functions/9728branches andinventory1464/1523/384/1080 all100percent. Five restored source audits pass,semanticViolationCount0. Existing246runtime states/defaults/classifications/registeredexceptions preserved;8nativehashes and12boundedowner notes. Doctor0errors/2preexistingwarnings;route/diff/AP scan pass.
Scope: Actual cell-section,table and document endpoint order; native ordinary/table cursor ownership and fixed marks; shared inherited document editing host; real browser selection,typing,split,join,UndoRedo and independent neighbors.
Validation limit: Initial successful static bundle/build andfullChromium predate only the two attribute-removal corrections. Final source was tested through the existing Playwright configuration loaded in memory with a development server; no successful build was repeated. Isolated coverage thresholds0 are diagnostic only; actual cumulative source metrics remain100 and project configuration unchanged.
Residual: Plain visual-line HomeEnd,complete selected-box painting/cursor rings/layout/native SwCursorShell,protected/merged/nested/redline/fullcore/UI remain unverified. Parent goal stays active; no blanket promotion.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-05T10:20:45.976Z — VERIFY — ok

By: CODER

Note: Bounded native section cursor and shared table editing host verified at a0faca4f67f585c96fcf866df59df71f663f105e;actual app/inventory100percent,385prior testfiles unchanged,112uniqueChromium closed,only failed/new source cases repeated. Full native table/UI parity remains unverified.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-05T10:20:45.263Z, excerpt_hash=sha256:5bf65c2b9851afabf9196eb14dcfa16ecc4ee77ca40563cd10b40e752ba87dce

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610050942-9AG4D7/blueprint/resolved-snapshot.json
- old_digest: 1c8d5b725b587691261f679f4166a068b232ca8a522f070ee311971ec5802e99
- current_digest: 1c8d5b725b587691261f679f4166a068b232ca8a522f070ee311971ec5802e99
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610050942-9AG4D7

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610050942-9AG4D7
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only the scoped implementation commit and retain task evidence; no history rewrite or registered deviation changes.

## Findings

Previous goal turn145 was verified progress. Current upstream move.cxx, txtcrsr.cxx, select.cxx, pam.cxx, swcrsr.cxx and trvltbl.cxx show cell-section first, table cursor conversion on marked escalation, then document bounds. Browser currently delegates these keys. Native raw MoveTable rejects marked ordinary cursors; shell converts to a table cursor. This task implements the existing flat cell graph and direction-preserving endpoints; complete selected-box painting/rings/protected/merged/nested behavior remains unverified. No network, outside-repository access, subagents, upstream execution or Agentplane code artifacts. Six statics passed after one unused-import lint failure; only failed lint repeated. First ONE absent profile: build pass;12046 app/296 files and109 inventory/36 files pass with100 percent allfour metrics;scripts5pass;Chromium110pass/1failed/no flakes. Failed exact case is Writer Shift Ctrl Home selects cell paragraphs through native point and mark;selected browser text was Tail instead of containing Second. Actual old table wrapper contentEditable=false and per-cell-paragraph contentEditable=true create independent editing hosts. Remove those adapters inside existing UI authorization, retain original range assertion and add native host checks. No production core/shell changes are needed. Final closures: initial failed ShiftCtrlHome case passes against final source after shared host fix;one new mounted host/range case passes with6prior cases skipped. New Chromium split/join case initially used visual Home,which did not move the macOS browser caret and Backspace deleted the final character;the unsupported visual Home gap remains explicit. Replace only failed-case fixture placement with two ArrowLeft keys and retain all actual join,Undo,Redo and neighbor assertions. Sole failed new case passes;no passing case replay. Existing config was loaded in memory with development server for changed UI,so no successful static build was repeated. The first build/full Chromiums predate the two attribute-removal corrections;final source selection/typing/split/join/history were checked in real Chromium. Final production core/shell/editwin/adapter four hashes match first profile;only two renderer attributes changed. Actual initial/new-case Istanbul maps align only exact contiguous source-identical locations;changed/crossing locations use final counters,app11826lines/12946statements/3307functions/9728branches andinventory1464/1523/384/1080 all100percent. Five restored source audits pass,semantic violations0. Scope audit:385prior app/script testfiles byte-identical;25new app cases and3new Chromium cases,total112 unique Chromium closed;246existing runtime states/defaults/classifications/deviations retained,12bounded notes across6owners,8native source hashes. AP ignored-inclusive scan4085files/0forbidden;doctor0errors/2preexistingwarnings,routing/diffcheckpass. Full selected-box painting/cursor rings/layout/native SwCursorShell,visual-line HomeEnd,protected/merged/nested/redline/fullUI and parentgoal remain unverified.
