---
id: "202610051029-N7ZF90"
title: "Own table row selection and selected box painting in native cursor"
result_summary: "Native cursor owns selected table boxes; shell row selection and table context drive UI painting and properties, with single-host cell focus preserved."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 14
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-05T10:29:54.833Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-05T10:58:43.292Z"
  updated_by: "CODER"
  note: "Approved bounded native table selection ownership verified at 48804c121de7fa288070253f798bbfea17985e1f; actual app/inventory coverage100%,19new app/2new Chromium,114unique browser cases closed; failed/new-only closure and final focus-wrapper validation boundary recorded."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-05T10:58:39.216Z"
  updated_by: "EVALUATOR"
  note: "Exact-SHA bounded table selection ownership verified at 48804c121de7fa288070253f798bbfea17985e1f. React row/table authority removed; native boxes drive UI and properties."
  evaluated_sha: "48804c121de7fa288070253f798bbfea17985e1f"
  blueprint_digest: "c688f153facf5e8b32c2474df42bd8d4929185fe33f6de71dbc825076b4f5c2f"
  evidence_refs:
    - ".agentplane/tasks/202610051029-N7ZF90/README.md"
    - ".agentplane/tasks/202610051029-N7ZF90/quality/20261005-105839216-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610051029-N7ZF90/quality/20261005-105839216-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610051029-N7ZF90/quality/20261005-105839216-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610051029-N7ZF90/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610051029-N7ZF90/evidence/evaluated-sha-audit.json"
    - ".agentplane/tasks/202610051029-N7ZF90/evidence/final-coverage.json"
    - ".agentplane/tasks/202610051029-N7ZF90/evidence/restored-source-audits.json"
  findings:
    - "19 new app cases and 2 new Chromium cases closed. All 388 prior test files byte-identical; 246 semantic states/defaults/classifications/exceptions retained. Actual coverage 100%; one full absent profile, failed/new-only closure and five restored audits."
    - "Same actor EVALUATOR phase; read-only exact-SHA evidence audit completed before report. No independent review claim."
commit:
  hash: "c4f54ad27ea3f49ccaf55efe02e9e13ec2043482"
  message: "🧩 N7ZF90 task: record native table selection verification"
comments:
  -
    author: "CODER"
    body: "Start: user authorized iterative UI upstream refactoring; native table selection leaf 147."
  -
    author: "CODER"
    body: "Verified: native table selected-box/row ownership replaces React selected-row state; actual app/inventory coverage100%,19new app/2new Chromium,114unique browser cases closed,388prior testfiles unchanged. Full-profile and final click-focus validation boundary recorded."
events:
  -
    type: "status"
    at: "2026-10-05T10:29:56.359Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: user authorized iterative UI upstream refactoring; native table selection leaf 147."
  -
    type: "verify"
    at: "2026-10-05T10:58:43.292Z"
    author: "CODER"
    state: "ok"
    note: "Approved bounded native table selection ownership verified at 48804c121de7fa288070253f798bbfea17985e1f; actual app/inventory coverage100%,19new app/2new Chromium,114unique browser cases closed; failed/new-only closure and final focus-wrapper validation boundary recorded."
  -
    type: "status"
    at: "2026-10-05T10:59:15.551Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: native table selected-box/row ownership replaces React selected-row state; actual app/inventory coverage100%,19new app/2new Chromium,114unique browser cases closed,388prior testfiles unchanged. Full-profile and final click-focus validation boundary recorded."
doc_version: 3
doc_updated_at: "2026-10-05T10:59:15.554Z"
doc_updated_by: "CODER"
description: "Iteration 147 under 202609240501-C9TN6M. Remove React selected table and row state; use native SwTableCursor selected boxes and shell row selection for the implemented flat table profile."
sections:
  Summary: "Move implemented table selection ownership from React state into native table/cursor/shell owners."
  Scope: "Iteration147: one atomic CODER leaf under 202609240501-C9TN6M, standing user approval to remove unnecessary UI layers. Implement flat unmerged equal-column native SwTable selection over actual box sections, SwTableCursor sorted selected boxes/actualization and shell SelectTableRow ownership. Project selected box start indices immutably for cell/row painting. Remove React selectedTable/selectedTableRow and editor selected-row adapter; properties follow actual cursor table and selected boxes. Preserve browser row gesture while converting native node coordinates through SwEditWin; insert dialog focuses native first cell. Keep I/O/recovery exceptions and semantic classifications/defaults/states unchanged. Scope: apps/office/src/sw/source/core/table/swtable.ts, apps/office/src/sw/source/core/crsr/swcrsr.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts, apps/office/src/sw/source/uibase/docvw/edtwin.ts, apps/office/src/sw/browser/presentation/writer-view-projection.ts, apps/office/src/sw/browser/presentation/writer-view.tsx, apps/office/src/sw/browser/editor/WriterPlainTextEditor.tsx, apps/office/src/sw/browser/editor/WriterEditableTable.tsx, apps/office/src/sw/source/uibase/wrtsh/native-table-selection.test.ts, apps/office/src/sw/browser/editor/native-table-selection.test.tsx, apps/office/e2e/writer-native-table-selection.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. No network/outside access, upstream copies, AP scripts/raw diagnostics, whole-module promotion, full native cursor rings/layout/merged/protected selection claims. Plain Home/End and structural table editing remain separate."
  Plan: "Iteration147: one atomic CODER leaf under 202609240501-C9TN6M, standing user approval to remove unnecessary UI layers. Implement flat unmerged equal-column native SwTable selection over actual box sections, SwTableCursor sorted selected boxes/actualization and shell SelectTableRow ownership. Project selected box start indices immutably for cell/row painting. Remove React selectedTable/selectedTableRow and editor selected-row adapter; properties follow actual cursor table and selected boxes. Preserve browser row gesture while converting native node coordinates through SwEditWin; insert dialog focuses native first cell. Keep I/O/recovery exceptions and semantic classifications/defaults/states unchanged. Scope: apps/office/src/sw/source/core/table/swtable.ts, apps/office/src/sw/source/core/crsr/swcrsr.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts, apps/office/src/sw/source/uibase/docvw/edtwin.ts, apps/office/src/sw/browser/presentation/writer-view-projection.ts, apps/office/src/sw/browser/presentation/writer-view.tsx, apps/office/src/sw/browser/editor/WriterPlainTextEditor.tsx, apps/office/src/sw/browser/editor/WriterEditableTable.tsx, apps/office/src/sw/source/uibase/wrtsh/native-table-selection.test.ts, apps/office/src/sw/browser/editor/native-table-selection.test.tsx, apps/office/e2e/writer-native-table-selection.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. No network/outside access, upstream copies, AP scripts/raw diagnostics, whole-module promotion, full native cursor rings/layout/merged/protected selection claims. Plain Home/End and structural table editing remain separate."
  Verify Steps: |-
    1. Six static gates first: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Changed-file checks only after fixes.
    2. Rename pinned vendor inside repo with finally restoration; ONE sequential upstream-absent npm run test:static, app and inventory coverage with --coverage.reportOnFailure, scripts source-provenance/resource tests and full Chromium. Persist exact failed/error-causing case names before assertions. Coverage maps only ignored appcache, AP bounded English outcomes. No tests execute or read pinned upstream.
    3. Assert real native sorted identity/dedup/difference selection, rectangle versus row ownership, mark/point direction, no body selection, same/different table, existing table navigation updates, history-free row selection and selection kill. Mounted and Chromium assert row gesture actual shell owner, selected-cell painting, caret/body context changes and stale-state removal; preserve all existing test assertions. Close only failed gates/cases and genuinely new unexecuted cases. Never replay passing full/static/build/suite/test.
    4. After vendor restoration run resource generation --check, source-tree, provenance, inventory invariants and parity source audits. Retain semantic states, classifications, defaults and conscious save/open/recovery deviations. Verify no upstream sources/scripts/Python/raw frames in AP, clean scoped final status, exact-SHA evaluator audit, quality, canonical verification and finish; append bounded parent progress. Broad goal remains active.
  Verification: |-
    Command: six declared static gates; ONE upstream-absent build/app/inventory/script/Chromium profile with coverage.reportOnFailure; failed/new-only app and development-server Chromium closure; restored resource/source-tree/provenance/invariants/parity audits.
    Result: pass for approved bounded final scope.
    Evidence: semantic implementation48804c121de7fa288070253f798bbfea17985e1f; exact-SHA audit passed before quality report. Full app12062 assertions/298files pass;3 additional new cases closed separately;19new app cases total. Inventory109/36 coverage100%,scripts5/2. Full Chromium113pass/1failed;originalfailed ODT case passed unchanged in focused closure;114unique casesclosed,no flakes;2newChromium. Coverage actual counters:100% lines11919,statements13049,functions3323,branches9771;inventory100%. Initial maps and diagnostics appcacheonly. Anonymous function numeric IDs normalized only at unchanged decl/loc; initial changed-file source reconstructed and hash confirmed. Final changed-onlyformat/lint pass and actual app compiler diagnostics0. First additional audit used nonexistent app config; corrected in memory, no production failure or passingcheck replay. Five restored source audits pass;0semanticviolations. All388prior testfiles byte-identical and246semanticstates/defaults/classifications/exceptions unchanged; no APsources/helpers/Python/rawframes.
    Scope: native flat table selected boxes and row ownership, actual properties context and immutable selected-box painting; DOM click focus preserves single editing host. No broad upstream completion claim.
    Validation boundary: full static/build/full Chromium ran before only DOM click-focus wrapper and3newtests; wrapper validated by mountedfocus and originalfailed ODT Chromium via development server, no repeat successfulbundle orfullprofile. Full rings/per-box selected edits/layout/drag/column/merged/nested/protected/hidden tables remainunverified.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-05T10:58:43.292Z — VERIFY — ok

    By: CODER

    Note: Approved bounded native table selection ownership verified at 48804c121de7fa288070253f798bbfea17985e1f; actual app/inventory coverage100%,19new app/2new Chromium,114unique browser cases closed; failed/new-only closure and final focus-wrapper validation boundary recorded.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-05T10:58:41.609Z, excerpt_hash=sha256:f07b4e04b43681d5df10af4663427c72f5952fc0243e2133936c044dede50fbf

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610051029-N7ZF90/blueprint/resolved-snapshot.json
    - old_digest: c688f153facf5e8b32c2474df42bd8d4929185fe33f6de71dbc825076b4f5c2f
    - current_digest: c688f153facf5e8b32c2474df42bd8d4929185fe33f6de71dbc825076b4f5c2f
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610051029-N7ZF90

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610051029-N7ZF90 -m 🧩 N7ZF90 task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the intentional semantic commit and task closure through a new authorized leaf; no history rewrite."
  Findings: |-
    Iteration147 verified bounded progress: removed React selectedTable/selectedTableRow and editor selected-row props. Native SwTableCursor sorted actual box identities, SwTable flat shared-column rectangle/row selection, shell point-first/mark-last row selection and native table context, immutable selected-box painting. No content history for selection. Insert focuses actual first cell. Properties follow actual current table/row selection; ordinary caret clears stale row paint. One existing Chromium focus failure exposed already-current first-cell focus; a DOM click-focus wrapper retains a single editing host and closes the original assertion without editing old tests.
    Verification: six static gates pass after failed-only lint/type/doc corrections; changed-file format/lint pass. ONE upstream-absent full profile: static build pass; app12062/298 all assertions pass, initial coverage short2statements3branches; inventory109/36,100%; scripts5/2; Chromium113pass/1failed of114 with no flakes. Initial exact failed case saved before closure: Writer types in a table cell and reopens the edited ODT. New-only closure ran3 actual new cases (2pass/1ambiguous DOM label query), original failed Chromium only passed using development server. Scoped failed DOM query to First table and sole failed case passed; no production changes after the focus wrapper. Total19new app cases and2new Chromium cases;114unique Chromium closed. No passing full/static/build/suite/test replay. Final map actual counters100% lines11919,statements13049,functions3323,branches9771. Initial maps ignored appcache only. One changed production file after full profile; reconstruct initial source hash exactly; carry only contiguous unchanged locations, anonymous numeric function labels normalized by unchanged decl/loc; changed/crossing locations use executed new cases. Final wrapper validated by mounted focus and original failed Chromium ODT case; successful bundle/full profiles not rebuilt/replayed. This validation boundary remains explicit.
    After restoration five source audits pass; source-provenance required missing test markers corrected and failed gate only retried, invariants/parity then first executions pass. Existing246 module states/defaults/classifications/exceptions and all prior tests retained. AP ignored-inclusive scan4101files/0forbidden; no saved helper/script/Python/upstream/raw source/raw diagnostics. No network/outside/subagent access. Native source hashes and scoped diff recorded. Full cursor rings/per-box edit ranges, native table layout, merged/nested/protected/hidden cells, drag/column selections and plain visual Home/End remain unverified. Broad goal remains active.
extensions:
  implementation_commit:
    hash: "48804c121de7fa288070253f798bbfea17985e1f"
    message: "🧩 N7ZF90 code: move table selection state from React into native cursor"
id_source: "generated"
---
## Summary

Move implemented table selection ownership from React state into native table/cursor/shell owners.

## Scope

Iteration147: one atomic CODER leaf under 202609240501-C9TN6M, standing user approval to remove unnecessary UI layers. Implement flat unmerged equal-column native SwTable selection over actual box sections, SwTableCursor sorted selected boxes/actualization and shell SelectTableRow ownership. Project selected box start indices immutably for cell/row painting. Remove React selectedTable/selectedTableRow and editor selected-row adapter; properties follow actual cursor table and selected boxes. Preserve browser row gesture while converting native node coordinates through SwEditWin; insert dialog focuses native first cell. Keep I/O/recovery exceptions and semantic classifications/defaults/states unchanged. Scope: apps/office/src/sw/source/core/table/swtable.ts, apps/office/src/sw/source/core/crsr/swcrsr.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts, apps/office/src/sw/source/uibase/docvw/edtwin.ts, apps/office/src/sw/browser/presentation/writer-view-projection.ts, apps/office/src/sw/browser/presentation/writer-view.tsx, apps/office/src/sw/browser/editor/WriterPlainTextEditor.tsx, apps/office/src/sw/browser/editor/WriterEditableTable.tsx, apps/office/src/sw/source/uibase/wrtsh/native-table-selection.test.ts, apps/office/src/sw/browser/editor/native-table-selection.test.tsx, apps/office/e2e/writer-native-table-selection.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. No network/outside access, upstream copies, AP scripts/raw diagnostics, whole-module promotion, full native cursor rings/layout/merged/protected selection claims. Plain Home/End and structural table editing remain separate.

## Plan

Iteration147: one atomic CODER leaf under 202609240501-C9TN6M, standing user approval to remove unnecessary UI layers. Implement flat unmerged equal-column native SwTable selection over actual box sections, SwTableCursor sorted selected boxes/actualization and shell SelectTableRow ownership. Project selected box start indices immutably for cell/row painting. Remove React selectedTable/selectedTableRow and editor selected-row adapter; properties follow actual cursor table and selected boxes. Preserve browser row gesture while converting native node coordinates through SwEditWin; insert dialog focuses native first cell. Keep I/O/recovery exceptions and semantic classifications/defaults/states unchanged. Scope: apps/office/src/sw/source/core/table/swtable.ts, apps/office/src/sw/source/core/crsr/swcrsr.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts, apps/office/src/sw/source/uibase/docvw/edtwin.ts, apps/office/src/sw/browser/presentation/writer-view-projection.ts, apps/office/src/sw/browser/presentation/writer-view.tsx, apps/office/src/sw/browser/editor/WriterPlainTextEditor.tsx, apps/office/src/sw/browser/editor/WriterEditableTable.tsx, apps/office/src/sw/source/uibase/wrtsh/native-table-selection.test.ts, apps/office/src/sw/browser/editor/native-table-selection.test.tsx, apps/office/e2e/writer-native-table-selection.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. No network/outside access, upstream copies, AP scripts/raw diagnostics, whole-module promotion, full native cursor rings/layout/merged/protected selection claims. Plain Home/End and structural table editing remain separate.

## Verify Steps

1. Six static gates first: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Changed-file checks only after fixes.
2. Rename pinned vendor inside repo with finally restoration; ONE sequential upstream-absent npm run test:static, app and inventory coverage with --coverage.reportOnFailure, scripts source-provenance/resource tests and full Chromium. Persist exact failed/error-causing case names before assertions. Coverage maps only ignored appcache, AP bounded English outcomes. No tests execute or read pinned upstream.
3. Assert real native sorted identity/dedup/difference selection, rectangle versus row ownership, mark/point direction, no body selection, same/different table, existing table navigation updates, history-free row selection and selection kill. Mounted and Chromium assert row gesture actual shell owner, selected-cell painting, caret/body context changes and stale-state removal; preserve all existing test assertions. Close only failed gates/cases and genuinely new unexecuted cases. Never replay passing full/static/build/suite/test.
4. After vendor restoration run resource generation --check, source-tree, provenance, inventory invariants and parity source audits. Retain semantic states, classifications, defaults and conscious save/open/recovery deviations. Verify no upstream sources/scripts/Python/raw frames in AP, clean scoped final status, exact-SHA evaluator audit, quality, canonical verification and finish; append bounded parent progress. Broad goal remains active.

## Verification

Command: six declared static gates; ONE upstream-absent build/app/inventory/script/Chromium profile with coverage.reportOnFailure; failed/new-only app and development-server Chromium closure; restored resource/source-tree/provenance/invariants/parity audits.
Result: pass for approved bounded final scope.
Evidence: semantic implementation48804c121de7fa288070253f798bbfea17985e1f; exact-SHA audit passed before quality report. Full app12062 assertions/298files pass;3 additional new cases closed separately;19new app cases total. Inventory109/36 coverage100%,scripts5/2. Full Chromium113pass/1failed;originalfailed ODT case passed unchanged in focused closure;114unique casesclosed,no flakes;2newChromium. Coverage actual counters:100% lines11919,statements13049,functions3323,branches9771;inventory100%. Initial maps and diagnostics appcacheonly. Anonymous function numeric IDs normalized only at unchanged decl/loc; initial changed-file source reconstructed and hash confirmed. Final changed-onlyformat/lint pass and actual app compiler diagnostics0. First additional audit used nonexistent app config; corrected in memory, no production failure or passingcheck replay. Five restored source audits pass;0semanticviolations. All388prior testfiles byte-identical and246semanticstates/defaults/classifications/exceptions unchanged; no APsources/helpers/Python/rawframes.
Scope: native flat table selected boxes and row ownership, actual properties context and immutable selected-box painting; DOM click focus preserves single editing host. No broad upstream completion claim.
Validation boundary: full static/build/full Chromium ran before only DOM click-focus wrapper and3newtests; wrapper validated by mountedfocus and originalfailed ODT Chromium via development server, no repeat successfulbundle orfullprofile. Full rings/per-box selected edits/layout/drag/column/merged/nested/protected/hidden tables remainunverified.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-05T10:58:43.292Z — VERIFY — ok

By: CODER

Note: Approved bounded native table selection ownership verified at 48804c121de7fa288070253f798bbfea17985e1f; actual app/inventory coverage100%,19new app/2new Chromium,114unique browser cases closed; failed/new-only closure and final focus-wrapper validation boundary recorded.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-05T10:58:41.609Z, excerpt_hash=sha256:f07b4e04b43681d5df10af4663427c72f5952fc0243e2133936c044dede50fbf

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610051029-N7ZF90/blueprint/resolved-snapshot.json
- old_digest: c688f153facf5e8b32c2474df42bd8d4929185fe33f6de71dbc825076b4f5c2f
- current_digest: c688f153facf5e8b32c2474df42bd8d4929185fe33f6de71dbc825076b4f5c2f
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610051029-N7ZF90

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610051029-N7ZF90 -m 🧩 N7ZF90 task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the intentional semantic commit and task closure through a new authorized leaf; no history rewrite.

## Findings

Iteration147 verified bounded progress: removed React selectedTable/selectedTableRow and editor selected-row props. Native SwTableCursor sorted actual box identities, SwTable flat shared-column rectangle/row selection, shell point-first/mark-last row selection and native table context, immutable selected-box painting. No content history for selection. Insert focuses actual first cell. Properties follow actual current table/row selection; ordinary caret clears stale row paint. One existing Chromium focus failure exposed already-current first-cell focus; a DOM click-focus wrapper retains a single editing host and closes the original assertion without editing old tests.
Verification: six static gates pass after failed-only lint/type/doc corrections; changed-file format/lint pass. ONE upstream-absent full profile: static build pass; app12062/298 all assertions pass, initial coverage short2statements3branches; inventory109/36,100%; scripts5/2; Chromium113pass/1failed of114 with no flakes. Initial exact failed case saved before closure: Writer types in a table cell and reopens the edited ODT. New-only closure ran3 actual new cases (2pass/1ambiguous DOM label query), original failed Chromium only passed using development server. Scoped failed DOM query to First table and sole failed case passed; no production changes after the focus wrapper. Total19new app cases and2new Chromium cases;114unique Chromium closed. No passing full/static/build/suite/test replay. Final map actual counters100% lines11919,statements13049,functions3323,branches9771. Initial maps ignored appcache only. One changed production file after full profile; reconstruct initial source hash exactly; carry only contiguous unchanged locations, anonymous numeric function labels normalized by unchanged decl/loc; changed/crossing locations use executed new cases. Final wrapper validated by mounted focus and original failed Chromium ODT case; successful bundle/full profiles not rebuilt/replayed. This validation boundary remains explicit.
After restoration five source audits pass; source-provenance required missing test markers corrected and failed gate only retried, invariants/parity then first executions pass. Existing246 module states/defaults/classifications/exceptions and all prior tests retained. AP ignored-inclusive scan4101files/0forbidden; no saved helper/script/Python/upstream/raw source/raw diagnostics. No network/outside/subagent access. Native source hashes and scoped diff recorded. Full cursor rings/per-box edit ranges, native table layout, merged/nested/protected/hidden cells, drag/column selections and plain visual Home/End remain unverified. Broad goal remains active.
