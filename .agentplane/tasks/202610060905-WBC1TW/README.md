---
id: "202610060905-WBC1TW"
title: "Implement native flat row insertion before and after selection across core and UI"
status: "DOING"
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
  updated_at: "2026-10-06T09:09:32.002Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-06T09:32:53.250Z"
  updated_by: "CODER"
  note: "Verified native counted row insertion before/after actual selected boxes, contextual SwTableShell slots and native list/text/table stack; one document-owned undo with stable selection and recreated-table redo. All12823app109inventory5scripts191Chrome distinct cases pass;100% app/inventory actual-counter coverage. Six static and restored source/scope/governance checks pass; same-agent exact-SHA quality pass at fc664e2c9dc868cabac07854de739e4f3d50d0cd. One full absent profile plus only two original failed case closures; skipped remain skipped. Registered I/O deviations preserved; parent/goal ACTIVE, full parity UNVERIFIED."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-06T09:32:22.895Z"
  updated_by: "EVALUATOR"
  note: "Same-agent exact-SHA review passes native counted row insertion and contextual menu routing at fc664e2c9dc868cabac07854de739e4f3d50d0cd; complete UI/core parity remains unverified."
  evaluated_sha: "fc664e2c9dc868cabac07854de739e4f3d50d0cd"
  blueprint_digest: "8f1a751f9d200aa752017a237b77ed8fb6d7b5404f4be541206c0cdd7d56b1b6"
  evidence_refs:
    - ".agentplane/tasks/202610060905-WBC1TW/README.md"
    - ".agentplane/tasks/202610060905-WBC1TW/quality/20261006-093222895-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610060905-WBC1TW/quality/20261006-093222895-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610060905-WBC1TW/quality/20261006-093222895-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610060905-WBC1TW/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610060905-WBC1TW/evidence/exact-sha-review.json"
  findings:
    - "Actual native box/row/table ownership and one undo action preserve selection across before/after counts, mixed text history and recreated tables; all12823app109inventory5scripts191Chrome cases pass with100% actual-counter coverage."
    - "One full absent profile, original-case-only closures and exact identical maps; all269 semantic statuses/defaults/classes/evidence and conscious I/O deviations preserved."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: authorized iteration181 native counted flat rows and contextual table UI slots with one absent verification profile."
events:
  -
    type: "status"
    at: "2026-10-06T09:09:32.694Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: authorized iteration181 native counted flat rows and contextual table UI slots with one absent verification profile."
  -
    type: "verify"
    at: "2026-10-06T09:32:53.250Z"
    author: "CODER"
    state: "ok"
    note: "Verified native counted row insertion before/after actual selected boxes, contextual SwTableShell slots and native list/text/table stack; one document-owned undo with stable selection and recreated-table redo. All12823app109inventory5scripts191Chrome distinct cases pass;100% app/inventory actual-counter coverage. Six static and restored source/scope/governance checks pass; same-agent exact-SHA quality pass at fc664e2c9dc868cabac07854de739e4f3d50d0cd. One full absent profile plus only two original failed case closures; skipped remain skipped. Registered I/O deviations preserved; parent/goal ACTIVE, full parity UNVERIFIED."
doc_version: 3
doc_updated_at: "2026-10-06T09:32:53.336Z"
doc_updated_by: "CODER"
description: "Iteration181: remove final-row/count-one restrictions in existing SwDoc.InsertRow; native SwTable selects boundary row and inserts counted flat rows before or after actual boxes, document owns one undo action. Connect upstream InsertRowsBefore/After menu slots through SwTableShell and SwFEShell, preserving actual selection and history and all registered I/O deviations."
sections:
  Summary: "Implement native flat row insertion count and before/after boundary through SwTable, SwDoc, SwFEShell and contextual SwTableShell; expose existing upstream InsertRowsBefore/After menu commands with coherent native selection and one history action."
  Scope: "apps/office/src/sw/source/core/doc/doc.ts; apps/office/src/sw/source/core/docnode/nodes.ts; apps/office/src/sw/source/core/table/swtable.ts; apps/office/src/sw/source/core/undo/untbl.ts; apps/office/src/sw/source/core/frmedt/fetab.ts; apps/office/src/sw/source/uibase/shells/tabsh.ts; apps/office/src/sw/source/uibase/uiview/view.ts; scripts/generate-writer-ui-resources.ts; apps/office/src/sw/uiconfig/swriter/writer-ui.generated.json; docs/program/source-provenance.json; docs/program/parity/runtime-inventory.json; docs/program/parity/writer-command-slice.json; apps/office/src/sw/source/core/crsr/native-table-shell-owner.test.ts; apps/office/src/sw/source/core/table/native-row-insertion.test.ts; apps/office/src/sw/browser/editor/native-table-row-commands.test.tsx; apps/office/e2e/writer-native-row-commands.spec.ts. Bounded related menu-resource fixtures may change only actual upstream composition expectations. No registered I/O deviations, upstream/source/helper artifacts, subagents, network or outside-repo actions. Related generated table-context fixture: apps/office/src/sw/source/uibase/shells/native-list-context.test.ts; scripts/libreoffice-inventory/parity-mapping-cli.test.ts. Original selected-cell flag assertions and mapping semantic expectations remain unchanged; update only native stack positions and generated command count."
  Plan: "Complete native flat row insertion count and before/after selection across core history and contextual UI slots; preserve I/O deviations; one upstream-absent profile; full parity remains unverified."
  Verify Steps: |-
    1. npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size pass, with failed gates only repeated.
    2. ONE full profile while vendor/libreoffice-reference is renamed inside repository and restored in finally: npm run test:static; full app/inventory coverage --coverage.reportOnFailure plus JSON case results; script acceptance; all Chromium against dist. Persist exit codes, exact failures, case identities/counts and hashes before assertions. Only original failures and genuinely new cases may rerun; no passing/full/source replay.
    3. New native and mounted/browser acceptance proves counts and before/after edges, original selection preservation, contextual native shell command routing, one undo action, existing Tab append and mixed/recreated-table history. App/inventory100% actual-counter coverage; only exact unchanged maps or entire byte-identical ranges may transfer counters.
    4. After upstream restoration: source-tree/provenance/invariant/parity and resource generation --check audits, prior test byte/semantic prefix scope checks, AP source/helper prohibition audit, doctor/routing and same-agent exact-SHA review. Explicit scoped implementation/evidence commits, verification then clean direct close; parent/goal active and full parity unverified.
  Verification: |-
    All six static gates pass after failed-type-only closure. ONE upstream-absent full profile plus original-case-only closures yields12823application109inventory5script191Chromium distinct passed cases, zero runtime errors/final failures/flaky,100% app/inventory actual-counter coverage; skipped closure cases remain skipped. Source/generation/scope/changed-file/AP artifact gates pass. Exact-SHA quality and direct close pending; parent/goal remain ACTIVE and full parity UNVERIFIED.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-06T09:32:53.250Z — VERIFY — ok

    By: CODER

    Note: Verified native counted row insertion before/after actual selected boxes, contextual SwTableShell slots and native list/text/table stack; one document-owned undo with stable selection and recreated-table redo. All12823app109inventory5scripts191Chrome distinct cases pass;100% app/inventory actual-counter coverage. Six static and restored source/scope/governance checks pass; same-agent exact-SHA quality pass at fc664e2c9dc868cabac07854de739e4f3d50d0cd. One full absent profile plus only two original failed case closures; skipped remain skipped. Registered I/O deviations preserved; parent/goal ACTIVE, full parity UNVERIFIED.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-06T09:31:31.532Z, excerpt_hash=sha256:3627165df3937c19793584f306ff9db2f596f754e7efc3109d47e6c267f3587d

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610060905-WBC1TW/blueprint/resolved-snapshot.json
    - old_digest: 8f1a751f9d200aa752017a237b77ed8fb6d7b5404f4be541206c0cdd7d56b1b6
    - current_digest: 8f1a751f9d200aa752017a237b77ed8fb6d7b5404f4be541206c0cdd7d56b1b6
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610060905-WBC1TW

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610060905-WBC1TW
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the scoped implementation commit through a separate approved task if native default cell traversal/history regresses; preserve registered I/O deviations and immutable completed task evidence."
  Findings: "Iteration180 completed verified progress with implementation 642c72010a7146b4dcd01d29b778533cd84b0caf, parent checkpoint cc1dd22a8d6bcc0770f09c77e9d956c343944236. Read-only discovery confirms existing InsertRow rejects all but one final-row append, and upstream InsertRowsBefore/After menu commands are filtered by generation. Pinned native model chooses selected edge row, copies whole row count times; table shell derives selected row range count. Discovery recovered wrong composition extension, ignored-vendor rg and two auxiliary Node syntax/data-shape errors by route recomputation before mutation. No sources/helpers saved in AP. Implementation: counted native flat rows at selected min/max edge; inherited SwFEShell preserves live selected boxes/cursor; contextual SwTableShell owns two generated void slots above text/list shells; document appends one native undo action with numeric row/table coordinates and supports recreated-table redo. No TextRuns conversion or operation adapter added. Initial six static gates fivePASS/typeFAIL for two new fixture API mistakes; failed type-only closurePASS; scoped changed-file/fixture checksPASS. ONE full absent profile buildPASS, app12822PASS1FAIL/12823 with100%coverage, inventory108PASS1FAIL/109 with100%coverage, scripts5PASS, Chromium191PASS0flaky. Two old expectations updated within existing context/resource scope: upstream view.cxx pushes table above text/list, and new slots change generated count47->49. Only those original cases reran: app1PASS13skipped/inventory1PASS2skipped; exit1 solely partial global coverage thresholds. Entire identical app266/inventory38 maps merged with actual max counters and unchanged seven production hashes; final100% allmetrics. No passing/full/source audit replay, no production change/rebuild after full profile; vendor restored. Prior269semantic states/defaults/classes/evidence preserved;470/473oldtestfiles byte-identical; only invalid-default fixture, native context positions and commandcount modified. Read-only tool orchestration syntax error and two wrong optional fixture API usages recovered through route recomputation; an auxiliary source display included a nonexistent optional file but no source/mutation followed that absence. Native source/CLI validations pass; no source/helper copies in AP. Complete UI/core parity remains UNVERIFIED; merged/nested/rowspan/redline/layout/formula/protection/repeated-headline and complete undo reconstruction remain gaps. Registered I/O/recovery deviations unchanged; parent/goal ACTIVE. Commit-message gate rejected the initial feat scope (expected code/task/close/integrate); no commit was created. Route recomputed, corrected only the subject to code, retaining all checks and staged scope."
id_source: "generated"
---
## Summary

Implement native flat row insertion count and before/after boundary through SwTable, SwDoc, SwFEShell and contextual SwTableShell; expose existing upstream InsertRowsBefore/After menu commands with coherent native selection and one history action.

## Scope

apps/office/src/sw/source/core/doc/doc.ts; apps/office/src/sw/source/core/docnode/nodes.ts; apps/office/src/sw/source/core/table/swtable.ts; apps/office/src/sw/source/core/undo/untbl.ts; apps/office/src/sw/source/core/frmedt/fetab.ts; apps/office/src/sw/source/uibase/shells/tabsh.ts; apps/office/src/sw/source/uibase/uiview/view.ts; scripts/generate-writer-ui-resources.ts; apps/office/src/sw/uiconfig/swriter/writer-ui.generated.json; docs/program/source-provenance.json; docs/program/parity/runtime-inventory.json; docs/program/parity/writer-command-slice.json; apps/office/src/sw/source/core/crsr/native-table-shell-owner.test.ts; apps/office/src/sw/source/core/table/native-row-insertion.test.ts; apps/office/src/sw/browser/editor/native-table-row-commands.test.tsx; apps/office/e2e/writer-native-row-commands.spec.ts. Bounded related menu-resource fixtures may change only actual upstream composition expectations. No registered I/O deviations, upstream/source/helper artifacts, subagents, network or outside-repo actions. Related generated table-context fixture: apps/office/src/sw/source/uibase/shells/native-list-context.test.ts; scripts/libreoffice-inventory/parity-mapping-cli.test.ts. Original selected-cell flag assertions and mapping semantic expectations remain unchanged; update only native stack positions and generated command count.

## Plan

Complete native flat row insertion count and before/after selection across core history and contextual UI slots; preserve I/O deviations; one upstream-absent profile; full parity remains unverified.

## Verify Steps

1. npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size pass, with failed gates only repeated.
2. ONE full profile while vendor/libreoffice-reference is renamed inside repository and restored in finally: npm run test:static; full app/inventory coverage --coverage.reportOnFailure plus JSON case results; script acceptance; all Chromium against dist. Persist exit codes, exact failures, case identities/counts and hashes before assertions. Only original failures and genuinely new cases may rerun; no passing/full/source replay.
3. New native and mounted/browser acceptance proves counts and before/after edges, original selection preservation, contextual native shell command routing, one undo action, existing Tab append and mixed/recreated-table history. App/inventory100% actual-counter coverage; only exact unchanged maps or entire byte-identical ranges may transfer counters.
4. After upstream restoration: source-tree/provenance/invariant/parity and resource generation --check audits, prior test byte/semantic prefix scope checks, AP source/helper prohibition audit, doctor/routing and same-agent exact-SHA review. Explicit scoped implementation/evidence commits, verification then clean direct close; parent/goal active and full parity unverified.

## Verification

All six static gates pass after failed-type-only closure. ONE upstream-absent full profile plus original-case-only closures yields12823application109inventory5script191Chromium distinct passed cases, zero runtime errors/final failures/flaky,100% app/inventory actual-counter coverage; skipped closure cases remain skipped. Source/generation/scope/changed-file/AP artifact gates pass. Exact-SHA quality and direct close pending; parent/goal remain ACTIVE and full parity UNVERIFIED.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-06T09:32:53.250Z — VERIFY — ok

By: CODER

Note: Verified native counted row insertion before/after actual selected boxes, contextual SwTableShell slots and native list/text/table stack; one document-owned undo with stable selection and recreated-table redo. All12823app109inventory5scripts191Chrome distinct cases pass;100% app/inventory actual-counter coverage. Six static and restored source/scope/governance checks pass; same-agent exact-SHA quality pass at fc664e2c9dc868cabac07854de739e4f3d50d0cd. One full absent profile plus only two original failed case closures; skipped remain skipped. Registered I/O deviations preserved; parent/goal ACTIVE, full parity UNVERIFIED.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-06T09:31:31.532Z, excerpt_hash=sha256:3627165df3937c19793584f306ff9db2f596f754e7efc3109d47e6c267f3587d

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610060905-WBC1TW/blueprint/resolved-snapshot.json
- old_digest: 8f1a751f9d200aa752017a237b77ed8fb6d7b5404f4be541206c0cdd7d56b1b6
- current_digest: 8f1a751f9d200aa752017a237b77ed8fb6d7b5404f4be541206c0cdd7d56b1b6
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610060905-WBC1TW

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610060905-WBC1TW
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the scoped implementation commit through a separate approved task if native default cell traversal/history regresses; preserve registered I/O deviations and immutable completed task evidence.

## Findings

Iteration180 completed verified progress with implementation 642c72010a7146b4dcd01d29b778533cd84b0caf, parent checkpoint cc1dd22a8d6bcc0770f09c77e9d956c343944236. Read-only discovery confirms existing InsertRow rejects all but one final-row append, and upstream InsertRowsBefore/After menu commands are filtered by generation. Pinned native model chooses selected edge row, copies whole row count times; table shell derives selected row range count. Discovery recovered wrong composition extension, ignored-vendor rg and two auxiliary Node syntax/data-shape errors by route recomputation before mutation. No sources/helpers saved in AP. Implementation: counted native flat rows at selected min/max edge; inherited SwFEShell preserves live selected boxes/cursor; contextual SwTableShell owns two generated void slots above text/list shells; document appends one native undo action with numeric row/table coordinates and supports recreated-table redo. No TextRuns conversion or operation adapter added. Initial six static gates fivePASS/typeFAIL for two new fixture API mistakes; failed type-only closurePASS; scoped changed-file/fixture checksPASS. ONE full absent profile buildPASS, app12822PASS1FAIL/12823 with100%coverage, inventory108PASS1FAIL/109 with100%coverage, scripts5PASS, Chromium191PASS0flaky. Two old expectations updated within existing context/resource scope: upstream view.cxx pushes table above text/list, and new slots change generated count47->49. Only those original cases reran: app1PASS13skipped/inventory1PASS2skipped; exit1 solely partial global coverage thresholds. Entire identical app266/inventory38 maps merged with actual max counters and unchanged seven production hashes; final100% allmetrics. No passing/full/source audit replay, no production change/rebuild after full profile; vendor restored. Prior269semantic states/defaults/classes/evidence preserved;470/473oldtestfiles byte-identical; only invalid-default fixture, native context positions and commandcount modified. Read-only tool orchestration syntax error and two wrong optional fixture API usages recovered through route recomputation; an auxiliary source display included a nonexistent optional file but no source/mutation followed that absence. Native source/CLI validations pass; no source/helper copies in AP. Complete UI/core parity remains UNVERIFIED; merged/nested/rowspan/redline/layout/formula/protection/repeated-headline and complete undo reconstruction remain gaps. Registered I/O/recovery deviations unchanged; parent/goal ACTIVE. Commit-message gate rejected the initial feat scope (expected code/task/close/integrate); no commit was created. Route recomputed, corrected only the subject to code, retaining all checks and staged scope.
