---
id: "202610060937-TR4M9D"
title: "Implement native counted column insertion and width redistribution through table UI"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 15
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-06T09:38:37.681Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-06T10:04:38.441Z"
  updated_by: "CODER"
  note: "PASS at explicit implementation2c76be1460f59495b7ab618efa8babf2e7870c3d: all declared checks; one absent build/app12833/inventory109/scripts5/Chromium193;100% actual raw counters, no replay. Exact-SHA same-agent quality PASS; scope and source/helper prohibition satisfied. Complex layouts/history and whole parity unverified."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-06T10:04:34.742Z"
  updated_by: "EVALUATOR"
  note: "Same-agent exact-SHA review PASS at2c76be1460f59495b7ab618efa8babf2e7870c3d: native counted flat columns, conserved cumulative widths, actual box owners and shared history; single absent profile12833/109/5/193 and100% raw-counter app/inventory coverage."
  evaluated_sha: "2c76be1460f59495b7ab618efa8babf2e7870c3d"
  blueprint_digest: "7db24b2129f82ff778c72f711e860ca6b20bc79428ab08ed80a7305a57a82d30"
  evidence_refs:
    - ".agentplane/tasks/202610060937-TR4M9D/README.md"
    - ".agentplane/tasks/202610060937-TR4M9D/quality/20261006-100434742-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610060937-TR4M9D/quality/20261006-100434742-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610060937-TR4M9D/quality/20261006-100434742-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610060937-TR4M9D/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610060937-TR4M9D/evidence/exact-sha-review.json"
    - ".agentplane/tasks/202610060937-TR4M9D/evidence/absent-profile.json"
    - ".agentplane/tasks/202610060937-TR4M9D/evidence/scope-audit.json"
  findings:
    - "All declared gates and scope checks pass; no test replay, coverage transfer or source/helper AP copies. Prior269 semantic records preserved;270 current;475/476 old test files identical, one count fixture49->51."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: iteration182 native column ownership, width redistribution and UI slots with one absent profile; full parity unverified."
events:
  -
    type: "status"
    at: "2026-10-06T09:38:38.655Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: iteration182 native column ownership, width redistribution and UI slots with one absent profile; full parity unverified."
  -
    type: "verify"
    at: "2026-10-06T10:04:38.441Z"
    author: "CODER"
    state: "ok"
    note: "PASS at explicit implementation2c76be1460f59495b7ab618efa8babf2e7870c3d: all declared checks; one absent build/app12833/inventory109/scripts5/Chromium193;100% actual raw counters, no replay. Exact-SHA same-agent quality PASS; scope and source/helper prohibition satisfied. Complex layouts/history and whole parity unverified."
doc_version: 3
doc_updated_at: "2026-10-06T10:04:38.542Z"
doc_updated_by: "CODER"
description: "Iteration182: port flat SwTable InsertCol/NewInsertCol selected column edges and proportional cumulative rounding; native column search expansion, document-owned shared SwUndoTableNdsChg history and contextual InsertColumnsBefore/After slots. Preserve original selection, table geometry and I/O deviations; one full upstream-absent profile."
sections:
  Summary: "Implement native counted flat column insertion and cumulative proportional width redistribution through the existing table shell/UI and shared document history."
  Scope: "apps/office/src/sw/source/core/table/swtable.ts; apps/office/src/sw/source/core/docnode/nodes.ts; apps/office/src/sw/source/core/doc/doc.ts; apps/office/src/sw/source/core/undo/untbl.ts; apps/office/src/sw/source/core/frmedt/fetab.ts; apps/office/src/sw/source/core/frmedt/tblsel.ts; apps/office/src/sw/source/uibase/shells/tabsh.ts; scripts/generate-writer-ui-resources.ts; apps/office/src/sw/uiconfig/swriter/writer-ui.generated.json; docs/program/source-provenance.json; docs/program/parity/runtime-inventory.json; apps/office/src/sw/source/core/table/native-column-insertion.test.ts; apps/office/src/sw/browser/editor/native-table-column-commands.test.tsx; apps/office/e2e/writer-native-column-commands.spec.ts; scripts/libreoffice-inventory/parity-mapping-cli.test.ts. Bounded related context/menu-resource fixture expectations may change only actual upstream composition. Add one source owner CheckSplitCells with unverified semantic fields; preserve all prior269 states/defaults/classes/evidence and conscious I/O/recovery deviations. Only bounded English prose/counts/hashes/outcomes/failures in AP; no source/helper/Python copies; raw results/maps/local snapshots only ignored app cache. No subagents, network or outside-repository work."
  Plan: "Standing user authorization applies. Port SwTable InsertCol/NewInsertCol and cumulative AdjustWidths rounding from selected column range; expand native column search across rows in SwFEShell and represent MINLAY layout admission via existing SwTabFrame/page geometry. Generalize the existing SwUndoTableNdsChg to native column mode with actual cell sections, widths and numeric insertion boundaries; document publishes one already-executed action. Native table shell computes menu count from actual selected column coordinates and exposes InsertColumnsBefore/After pinned slots. Preserve original selected owners, cursor/pending items, mixed row/column/text and recreated-table history; rendering and worker/ODF use actual graph and widths. Verify six initial static gates, ONE full upstream-absent profile, only original failures/new cases and failed gates repeated, restored source audits and same-agent exact-SHA quality; close one leaf and append parent checkpoint. Merged/nested/rowspan/RTL/redline/border-side/formula/protection/repeated-headline/full native undo/layout hierarchy remain unverified, no full parity promotion."
  Verify Steps: |-
    1. npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size pass, with failed gates only repeated.
    2. ONE full profile while vendor/libreoffice-reference is renamed inside repository and restored in finally: npm run test:static; full app/inventory coverage --coverage.reportOnFailure plus JSON case results; script acceptance; all Chromium against dist. Persist exit codes, exact failures, case identities/counts and hashes before assertions. Only original failures and genuinely new cases may rerun; no passing/full/source replay.
    3. New native and mounted/browser acceptance proves column count and before/after edges across all rows, upstream cumulative proportional width rounding and unchanged table print width, MINLAY refusal without mutation, original selection/pending items, native contextual menu slots, one undo action, mixed row/column/text and recreated-table history, mounted colgroup geometry and Chromium caret. App/inventory100% actual-counter coverage; only exact unchanged maps or entire byte-identical ranges may transfer counters.
    4. After upstream restoration: source-tree/provenance/invariant/parity and resource generation --check audits, prior test byte/semantic prefix scope checks, AP source/helper prohibition audit, doctor/routing and same-agent exact-SHA review. Explicit scoped implementation/evidence commits, verification then clean direct close; parent/goal active and full parity unverified.
  Verification: |-
    Command: six initial static gates; only failed lint/type/docs closures; scoped changed-file checks; ONE full upstream-absent build/app/inventory/scripts/Chromium profile; restored five source gates; scope and artifact audits; doctor/routing/diff; exact-SHA review. Result: PASS completed gates/profile, exact-SHA review pending. Evidence: evidence/*.json contains bounded outcomes/counts/hashes and exact initial failures;12833 application,109 inventory,5 script,193 Chromium;100% app/inventory raw-counter coverage;0 runtime/test/browser failures. Scope: counted flat native column insertion, width redistribution, selection/history/menu/colgroup/worker/ODF behavior. No profile replay or merged coverage. Full parity unverified.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-06T10:04:38.441Z — VERIFY — ok

    By: CODER

    Note: PASS at explicit implementation2c76be1460f59495b7ab618efa8babf2e7870c3d: all declared checks; one absent build/app12833/inventory109/scripts5/Chromium193;100% actual raw counters, no replay. Exact-SHA same-agent quality PASS; scope and source/helper prohibition satisfied. Complex layouts/history and whole parity unverified.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-06T10:03:34.709Z, excerpt_hash=sha256:ca1895ed8bd0cfaf1ae3d537b4bc4f7b6e49cafa3a32c919db970a72619d6b9d

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610060937-TR4M9D/blueprint/resolved-snapshot.json
    - old_digest: 7db24b2129f82ff778c72f711e860ca6b20bc79428ab08ed80a7305a57a82d30
    - current_digest: 7db24b2129f82ff778c72f711e860ca6b20bc79428ab08ed80a7305a57a82d30
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610060937-TR4M9D

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610060937-TR4M9D
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the scoped implementation through a separate approved leaf if actual column graph/geometry/selection/history regresses; preserve registered I/O deviations and completed immutable evidence."
  Findings: |-
    Previous goal turn made verified progress: iteration181 DONE implementation fc664e2c9dc868cabac07854de739e4f3d50d0cd, parent checkpoint 52e82f832bd37a819bd809eb5861635a00d50ae6. Read-only discovery confirms native InsertCol/NewInsertCol, cumulative proportional AdjustWidths, column-search expansion and CheckSplitCells MINLAY admission are missing locally; menu commands are filtered. Native source preserves total width with cumulative rounding and copies empty first-paragraph attributes per source box. Discovery resolved wrong optional layout/worker/table-editor paths and unmatched shell glob; nonzero routes recomputed before mutation. No source/helper artifacts in AP.

    Iteration182 result: native counted before/after column insertion reaches SwTableShell -> inherited SwFEShell -> SwDoc -> SwTable/NewInsertCol and actual SwNodes boxes. Table preserves total shared reference width with selected-range averaged width and cumulative integer boundary rounding. Row and column creation now share PrepareTableBox instead of duplicating empty-cell construction. Existing SwUndoTableNdsChg owns one document-published action, actual retained boxes/widths and numeric insertion coordinates resolving recreated tables. Original selected box owners, point/mark and pending items persist; native worker/ODF and mounted colgroups use actual graph. Generated native SfxImageItem column slots bring command count to51; only old inventory count fixture changes49->51.

    Initial format/dependency/file-size gates passed. Initial lint failed unused row, type failed unused row/missing SwTable import, docs failed missing GetTableSel search parameter documentation; repaired before full profile and ONLY those failed gates rerun PASS. Scoped changed-file checks PASS. Pre-profile cumulative rounding fixture corrected analytically to75/153/152/231 and inventory ordering preserved before any test profile. Read-only optional-path/glob discovery nonzero routes recomputed; no sources/helpers copied to AP.

    Command: ONE full upstream-absent profile (exact commands in evidence/absent-profile.json), vendor renamed inside repository and restored in finally. Result: PASS build;12833 application cases;109 inventory;5 script;193 Chromium;0 failures,0 skips,0 flaky,0 runtime errors. Evidence: final-coverage.json records raw actual Istanbul map hashes,267 app and38 inventory maps,100% lines/statements/functions/branches. Scope: represented runtime/browser acceptance. No test failure closures, merges, transfers or replays needed. Raw maps/cases/output/local snapshots remain ignored app cache only.

    Restored source resource/tree/provenance/invariant/parity gates PASS once;270 runtime owners (186 mapped,68 browser adaptations,16 local infrastructure). Scope audit PASS: all prior269 semantic states/defaults/classes/evidence preserved;475/476 prior test files byte-identical;3 new acceptance files,479 total. Source responsibility review13 pinned files stores hashes and bounded prose only. Incremental current leaf artifact audit found11 md/json files,0 forbidden artifacts. Doctor0errors2known pre-existing warnings (hook readiness shim and old DONE202610031635-2Z3962 missing implementation hash); routing and diff checks PASS.

    Residual limits: flat shared-column geometry only. Full native CheckSplitCells frame unions/follow-page/RTL/vertical/fly hierarchy, merged/nested/rowspan/protection/formula/redline/border/repeated-headline state and full SaveTable/CreateNew undo reconstruction remain unverified. CheckSplitCells uses represented SwTabFrame/page print geometry and is added as UNVERIFIED. Same-agent exact-SHA quality review required; no independent reviewer claim. Conscious I/O/recovery deviations preserved; parent/whole goal ACTIVE, full parity UNVERIFIED.
id_source: "generated"
---
## Summary

Implement native counted flat column insertion and cumulative proportional width redistribution through the existing table shell/UI and shared document history.

## Scope

apps/office/src/sw/source/core/table/swtable.ts; apps/office/src/sw/source/core/docnode/nodes.ts; apps/office/src/sw/source/core/doc/doc.ts; apps/office/src/sw/source/core/undo/untbl.ts; apps/office/src/sw/source/core/frmedt/fetab.ts; apps/office/src/sw/source/core/frmedt/tblsel.ts; apps/office/src/sw/source/uibase/shells/tabsh.ts; scripts/generate-writer-ui-resources.ts; apps/office/src/sw/uiconfig/swriter/writer-ui.generated.json; docs/program/source-provenance.json; docs/program/parity/runtime-inventory.json; apps/office/src/sw/source/core/table/native-column-insertion.test.ts; apps/office/src/sw/browser/editor/native-table-column-commands.test.tsx; apps/office/e2e/writer-native-column-commands.spec.ts; scripts/libreoffice-inventory/parity-mapping-cli.test.ts. Bounded related context/menu-resource fixture expectations may change only actual upstream composition. Add one source owner CheckSplitCells with unverified semantic fields; preserve all prior269 states/defaults/classes/evidence and conscious I/O/recovery deviations. Only bounded English prose/counts/hashes/outcomes/failures in AP; no source/helper/Python copies; raw results/maps/local snapshots only ignored app cache. No subagents, network or outside-repository work.

## Plan

Standing user authorization applies. Port SwTable InsertCol/NewInsertCol and cumulative AdjustWidths rounding from selected column range; expand native column search across rows in SwFEShell and represent MINLAY layout admission via existing SwTabFrame/page geometry. Generalize the existing SwUndoTableNdsChg to native column mode with actual cell sections, widths and numeric insertion boundaries; document publishes one already-executed action. Native table shell computes menu count from actual selected column coordinates and exposes InsertColumnsBefore/After pinned slots. Preserve original selected owners, cursor/pending items, mixed row/column/text and recreated-table history; rendering and worker/ODF use actual graph and widths. Verify six initial static gates, ONE full upstream-absent profile, only original failures/new cases and failed gates repeated, restored source audits and same-agent exact-SHA quality; close one leaf and append parent checkpoint. Merged/nested/rowspan/RTL/redline/border-side/formula/protection/repeated-headline/full native undo/layout hierarchy remain unverified, no full parity promotion.

## Verify Steps

1. npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size pass, with failed gates only repeated.
2. ONE full profile while vendor/libreoffice-reference is renamed inside repository and restored in finally: npm run test:static; full app/inventory coverage --coverage.reportOnFailure plus JSON case results; script acceptance; all Chromium against dist. Persist exit codes, exact failures, case identities/counts and hashes before assertions. Only original failures and genuinely new cases may rerun; no passing/full/source replay.
3. New native and mounted/browser acceptance proves column count and before/after edges across all rows, upstream cumulative proportional width rounding and unchanged table print width, MINLAY refusal without mutation, original selection/pending items, native contextual menu slots, one undo action, mixed row/column/text and recreated-table history, mounted colgroup geometry and Chromium caret. App/inventory100% actual-counter coverage; only exact unchanged maps or entire byte-identical ranges may transfer counters.
4. After upstream restoration: source-tree/provenance/invariant/parity and resource generation --check audits, prior test byte/semantic prefix scope checks, AP source/helper prohibition audit, doctor/routing and same-agent exact-SHA review. Explicit scoped implementation/evidence commits, verification then clean direct close; parent/goal active and full parity unverified.

## Verification

Command: six initial static gates; only failed lint/type/docs closures; scoped changed-file checks; ONE full upstream-absent build/app/inventory/scripts/Chromium profile; restored five source gates; scope and artifact audits; doctor/routing/diff; exact-SHA review. Result: PASS completed gates/profile, exact-SHA review pending. Evidence: evidence/*.json contains bounded outcomes/counts/hashes and exact initial failures;12833 application,109 inventory,5 script,193 Chromium;100% app/inventory raw-counter coverage;0 runtime/test/browser failures. Scope: counted flat native column insertion, width redistribution, selection/history/menu/colgroup/worker/ODF behavior. No profile replay or merged coverage. Full parity unverified.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-06T10:04:38.441Z — VERIFY — ok

By: CODER

Note: PASS at explicit implementation2c76be1460f59495b7ab618efa8babf2e7870c3d: all declared checks; one absent build/app12833/inventory109/scripts5/Chromium193;100% actual raw counters, no replay. Exact-SHA same-agent quality PASS; scope and source/helper prohibition satisfied. Complex layouts/history and whole parity unverified.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-06T10:03:34.709Z, excerpt_hash=sha256:ca1895ed8bd0cfaf1ae3d537b4bc4f7b6e49cafa3a32c919db970a72619d6b9d

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610060937-TR4M9D/blueprint/resolved-snapshot.json
- old_digest: 7db24b2129f82ff778c72f711e860ca6b20bc79428ab08ed80a7305a57a82d30
- current_digest: 7db24b2129f82ff778c72f711e860ca6b20bc79428ab08ed80a7305a57a82d30
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610060937-TR4M9D

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610060937-TR4M9D
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the scoped implementation through a separate approved leaf if actual column graph/geometry/selection/history regresses; preserve registered I/O deviations and completed immutable evidence.

## Findings

Previous goal turn made verified progress: iteration181 DONE implementation fc664e2c9dc868cabac07854de739e4f3d50d0cd, parent checkpoint 52e82f832bd37a819bd809eb5861635a00d50ae6. Read-only discovery confirms native InsertCol/NewInsertCol, cumulative proportional AdjustWidths, column-search expansion and CheckSplitCells MINLAY admission are missing locally; menu commands are filtered. Native source preserves total width with cumulative rounding and copies empty first-paragraph attributes per source box. Discovery resolved wrong optional layout/worker/table-editor paths and unmatched shell glob; nonzero routes recomputed before mutation. No source/helper artifacts in AP.

Iteration182 result: native counted before/after column insertion reaches SwTableShell -> inherited SwFEShell -> SwDoc -> SwTable/NewInsertCol and actual SwNodes boxes. Table preserves total shared reference width with selected-range averaged width and cumulative integer boundary rounding. Row and column creation now share PrepareTableBox instead of duplicating empty-cell construction. Existing SwUndoTableNdsChg owns one document-published action, actual retained boxes/widths and numeric insertion coordinates resolving recreated tables. Original selected box owners, point/mark and pending items persist; native worker/ODF and mounted colgroups use actual graph. Generated native SfxImageItem column slots bring command count to51; only old inventory count fixture changes49->51.

Initial format/dependency/file-size gates passed. Initial lint failed unused row, type failed unused row/missing SwTable import, docs failed missing GetTableSel search parameter documentation; repaired before full profile and ONLY those failed gates rerun PASS. Scoped changed-file checks PASS. Pre-profile cumulative rounding fixture corrected analytically to75/153/152/231 and inventory ordering preserved before any test profile. Read-only optional-path/glob discovery nonzero routes recomputed; no sources/helpers copied to AP.

Command: ONE full upstream-absent profile (exact commands in evidence/absent-profile.json), vendor renamed inside repository and restored in finally. Result: PASS build;12833 application cases;109 inventory;5 script;193 Chromium;0 failures,0 skips,0 flaky,0 runtime errors. Evidence: final-coverage.json records raw actual Istanbul map hashes,267 app and38 inventory maps,100% lines/statements/functions/branches. Scope: represented runtime/browser acceptance. No test failure closures, merges, transfers or replays needed. Raw maps/cases/output/local snapshots remain ignored app cache only.

Restored source resource/tree/provenance/invariant/parity gates PASS once;270 runtime owners (186 mapped,68 browser adaptations,16 local infrastructure). Scope audit PASS: all prior269 semantic states/defaults/classes/evidence preserved;475/476 prior test files byte-identical;3 new acceptance files,479 total. Source responsibility review13 pinned files stores hashes and bounded prose only. Incremental current leaf artifact audit found11 md/json files,0 forbidden artifacts. Doctor0errors2known pre-existing warnings (hook readiness shim and old DONE202610031635-2Z3962 missing implementation hash); routing and diff checks PASS.

Residual limits: flat shared-column geometry only. Full native CheckSplitCells frame unions/follow-page/RTL/vertical/fly hierarchy, merged/nested/rowspan/protection/formula/redline/border/repeated-headline state and full SaveTable/CreateNew undo reconstruction remain unverified. CheckSplitCells uses represented SwTabFrame/page print geometry and is added as UNVERIFIED. Same-agent exact-SHA quality review required; no independent reviewer claim. Conscious I/O/recovery deviations preserved; parent/whole goal ACTIVE, full parity UNVERIFIED.
