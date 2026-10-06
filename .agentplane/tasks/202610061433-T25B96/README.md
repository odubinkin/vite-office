---
id: "202610061433-T25B96"
title: "Move table mouse pointer policy into the native edit window"
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
  updated_at: "2026-10-06T14:34:36.708Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-06T14:52:44.643Z"
  updated_by: "CODER"
  note: "Native table pointer ownership and source glyph behavior verified at da4164f194218a31f1dc43d682ecb8ea2ab42227;12954app109inventory5scripts212Chromium aggregate PASS, actual100 coverage. One absent full profile and original failed cases only,2focused skips retained. Same-agent exact-SHA quality PASS, not independent review; full parity unverified."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-06T14:51:59.336Z"
  updated_by: "EVALUATOR"
  note: "Same-agent exact-SHA native table pointer review PASS at da4164f194218a31f1dc43d682ecb8ea2ab42227; not independent review."
  evaluated_sha: "da4164f194218a31f1dc43d682ecb8ea2ab42227"
  blueprint_digest: "f7cae7371e6712a2699af9adfb8922181410b69c92ea17bb1d30d2c2b3695320"
  evidence_refs:
    - ".agentplane/tasks/202610061433-T25B96/README.md"
    - ".agentplane/tasks/202610061433-T25B96/quality/20261006-145159336-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610061433-T25B96/quality/20261006-145159336-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610061433-T25B96/quality/20261006-145159336-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610061433-T25B96/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610061433-T25B96/evidence/exact-sha-quality.json"
    - ".agentplane/tasks/202610061433-T25B96/evidence/source-review.json"
  findings:
    - "Native edit-window policy replaces browser pointer switch; actual table-mode guard, exact native IDs, five X11 masks/hotspots and platform projection verified.12954app109inventory5scripts212Chromium aggregate PASS, actual100 app/inventory coverage; only original1inventory and2Chrome failures replayed,2focused skips retained.16semantic paths,491 old acceptance files byte-identical,495total;272 old semantic fields/full prefixes preserved plus2 explicitly unverified owners274. No upstream source/helper artifacts in AP; registered I/O/recovery exceptions unchanged."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement approved native edit-window table pointer ownership and exact platform glyph projection under standing iterative user authorization."
events:
  -
    type: "status"
    at: "2026-10-06T14:34:37.149Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved native edit-window table pointer ownership and exact platform glyph projection under standing iterative user authorization."
  -
    type: "verify"
    at: "2026-10-06T14:52:44.643Z"
    author: "CODER"
    state: "ok"
    note: "Native table pointer ownership and source glyph behavior verified at da4164f194218a31f1dc43d682ecb8ea2ab42227;12954app109inventory5scripts212Chromium aggregate PASS, actual100 coverage. One absent full profile and original failed cases only,2focused skips retained. Same-agent exact-SHA quality PASS, not independent review; full parity unverified."
doc_version: 3
doc_updated_at: "2026-10-06T14:52:44.698Z"
doc_updated_by: "CODER"
description: "Iteration189 under C9TN6M: remove browser-owned SwTab pointer policy, restore native IsTableMode/changeMousePointer decisions, and render native table selection cursor masks/hotspots. Resize drag itself, object hit arbitration, and vertical/RTL layout remain unverified. Standing user iterative UI/core/refactor authorization applies."
sections:
  Summary: "Iteration189: centralize Writer table hover pointer decisions in native SwEditWin and render exact native table selection glyphs instead of resize arrows. Standing iterative user authorization applies; goal remains ACTIVE."
  Scope: "Only apps/office/src/sw/source/core/crsr/trvltbl.ts, apps/office/src/sw/source/uibase/docvw/edtwin.ts, apps/office/src/sw/browser/editor/browser-writer-edit-window.ts, apps/office/src/vcl/ptrstyle.ts, apps/office/src/vcl/browser/pointer.ts, apps/office/src/vcl/browser/cursors/tblsels.svg, apps/office/src/vcl/browser/cursors/tblsele.svg, apps/office/src/vcl/browser/cursors/tblselse.svg, apps/office/src/vcl/browser/cursors/tblselw.svg, apps/office/src/vcl/browser/cursors/tblselsw.svg, apps/office/src/sw/source/uibase/docvw/native-table-pointer.test.ts, apps/office/src/vcl/browser/pointer.test.ts, apps/office/src/sw/browser/editor/native-table-mouse.test.tsx, apps/office/e2e/writer-native-table-mouse.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. AP leaf evidence and parent entire-prefix checkpoint are lifecycle scope. No save/open/recovery change, network, global files, upstream source copies in AP, helper/probe scripts in AP. Resize drag, object selection, full RTL/vertical layout remain unverified."
  Plan: "1. Add exact represented PointerStyle numeric IDs, native IsTableMode and edit-window changeMousePointer/GetPointer state; preserve upstream resize-mode guard and enhanced selection mapping. 2. Replace browser SwTab pointer switch with VCL platform projection; convert five native X11 source/mask pixels and hotspots into licensed runtime SVG assets. 3. Add native decision, literal asset and mounted/Chromium hover cases; retain every substantive prior assertion. 4. One initial static gate pass, one full upstream-absent profile, original failure/new regression closures only; record exact-SHA same-agent quality, close leaf and preserve whole parent prefix."
  Verify Steps: |-
    1. Initial npm run format:check, lint, typecheck, check:dependencies, check:docs, check:file-size once; unchanged scoped JSDoc and physical lines<1000. Only failed gates/changed paths afterward.
    2. ONE full upstream-absent build/app/inventory/scripts/Chromium profile, vendor restored finally. Exact counts/errors/hashes before assertions, actual100 application and inventory coverage. No source/scope/AP audits while absent profile live. Only original failed cases or genuinely new cases afterward; no passing/full replay, no with-upstream test execution. Raw maps/cases/source diagnostics only ignored app cache; AP bounded prose/counts/hashes.
    3. Native literal13 SwTab decisions, exact PointerStyle IDs, ordinary/table-selection cursor guard, pointer preservation/reset, no selection/history side effects; exact five16x16 source/mask pixels and hotspots, browser row/column/corner glyphs versus resize borders, table-mode guard and capture preservation at1280/390. Existing2 acceptance files may update obsolete cursor expectations/add assertions;491 other existing acceptance files byte-identical;2 new test files495total.
    4. Once restored resource generation --check/source-tree/provenance/invariants/parity; prior272 semantic fields/full prefixes preserved plus2 explicitly unverified module owners. Doctor/routing/diff/source hashes/new leaf and quality artifact census0forbidden. Exact implementation SHA same-agent EVALUATOR phase, explicitly not independent review. Clean leaf close, whole parent Findings prefix preserved, goal ACTIVE/full parity UNVERIFIED.
  Verification: |-
    PASS at exact implementation SHAda4164f194218a31f1dc43d682ecb8ea2ab42227. Same current agent EVALUATOR phase, not independent review.12954app109inventory5scripts212Chromium aggregated PASS with one full upstream-absent profile and original failures only; actual100 app/inventory coverage;2focused filter skips remain skipped. Static/scoped/source/governance/scope and generated quality audit PASS;18leaf/quality files0forbidden. Full upstream parity UNVERIFIED; parent/goal ACTIVE.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-06T14:52:44.643Z — VERIFY — ok

    By: CODER

    Note: Native table pointer ownership and source glyph behavior verified at da4164f194218a31f1dc43d682ecb8ea2ab42227;12954app109inventory5scripts212Chromium aggregate PASS, actual100 coverage. One absent full profile and original failed cases only,2focused skips retained. Same-agent exact-SHA quality PASS, not independent review; full parity unverified.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-06T14:52:44.003Z, excerpt_hash=sha256:55c99abffc49fa9eb3b53aec2b1e636703c15e498184379e669cc0b8affeec23

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610061433-T25B96/blueprint/resolved-snapshot.json
    - old_digest: f7cae7371e6712a2699af9adfb8922181410b69c92ea17bb1d30d2c2b3695320
    - current_digest: f7cae7371e6712a2699af9adfb8922181410b69c92ea17bb1d30d2c2b3695320
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610061433-T25B96

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610061433-T25B96 -m 🧩 T25B96 task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert this leaf implementation commit with a new executable task; preserve traceability and evidence. No destructive history operation."
  Findings: |-
    Source review: edtwin.cxx changeMousePointer4101 uses HSizeBar/VSizeBar for resize, native TabSelect glyphs for enhanced selection, and IsTableMode guards only resize pointer changes. Browser currently duplicates classification and incorrectly paints enhanced selection as resize arrows. crsrsh.hxx708 checks actual table cursor presence. ptrstyle.hxx/SystemPointer.idl provide exact represented IDs; gtkdata.cxx191-192 maps resize CSS names and278-281 uses native table masks. Complete object hit arbitration, LibreOfficeKit, remaining pointer families and physical RTL/vertical layout remain unverified. Discovery corrected two guessed source paths and one guessed configuration path through actual rg inventory; no source mutation or tests preceded approval.

    Command: initial six static gates and unchanged scoped JSDoc/physical lines/format/lint. Result: PASS; final changed E2E formatter PASS. One full upstream-absent profile: build PASS,12954 app PASS0fail0skip actual100;inventory108PASS1FAIL(path lexical ordering),scripts5PASS;Chromium210PASS2FAIL(new outer-container computed cursor expected text, actual auto). Exact initial counts/errors/hashes retained before assertions. Corrected metadata ordering with codepoint lexical comparator (locale sorting was inappropriate); corrected only the new outer-container fallback expectation to existing auto CSS, keeping historical selection/content/history assertions intact. Production source did not change after initial profile, so no rebuild. Closure1: only original failed inventory case1PASS2filterSKIP and original two Chromium cases2PASS0skip0flaky; vendor restored finally. No full/passing replay or tests with pinned upstream. Aggregate12954app109inventory5scripts212ChromiumPASS.
    Actual100 coverage:271app14110L15469S3643F11538B, final map476ff9006130f78b6cf20fb70fd6878cf6e2ea916770d7c42f53c5b806b8e75b;38inventory1464L1523S384F1080B, final mapec335e880c41fac2f2f0594de0bf4960b18d292e0c4317dd6dbcc1f7637b3480. Entire309source-file bytes and complete inventory statement/function/branch maps verified unchanged; only actual focused counters added; focused2skips remain skipped. All raw maps/cases/source snapshots/source proof only ignored app cache; AP hashes/counts/bounded prose. Once-restored generation/source-tree/provenance/invariants/parity PASS.16semantic paths,491 prior acceptance files byte-identical,2 declared existing migrations and2new tests495total; all272 prior states/defaults/classifications/entire prefixes preserved plus2 explicitly unverified owners274. Command map byte-identical. Parent whole478980-character prefix SHAe5f2aaf634a89e6734ed9fae3e06d35245b64c43f7ab4312c4ee812696e0bff7 preserved.
    Native read-only source review additionally verified X11 saldisp.cxx1732-1747 native glyph mapping and black/white source-mask colors1766-1774. Assets use native X11 pixels/hotspots; GTK themed/high-DPI shapes remain unverified. All12 non-NONE native switch branches tested, unsupported physical directions isolated through classifier spies and not claimed as layout parity. Full resize gestures/object/list/LOK/general UpdatePointer remain unverified. Doctor0errors2knownwarnings,routing/diffPASS; current leaf artifact census0forbidden. Exact implementation-SHA da4164f194218a31f1dc43d682ecb8ea2ab42227 same-agent EVALUATOR review PASS; explicitly not independent review. Final current leaf/generated quality census18files0forbidden. Goal ACTIVE/full core/UI parity UNVERIFIED; save/open/recovery exceptions unchanged.
id_source: "generated"
---
## Summary

Iteration189: centralize Writer table hover pointer decisions in native SwEditWin and render exact native table selection glyphs instead of resize arrows. Standing iterative user authorization applies; goal remains ACTIVE.

## Scope

Only apps/office/src/sw/source/core/crsr/trvltbl.ts, apps/office/src/sw/source/uibase/docvw/edtwin.ts, apps/office/src/sw/browser/editor/browser-writer-edit-window.ts, apps/office/src/vcl/ptrstyle.ts, apps/office/src/vcl/browser/pointer.ts, apps/office/src/vcl/browser/cursors/tblsels.svg, apps/office/src/vcl/browser/cursors/tblsele.svg, apps/office/src/vcl/browser/cursors/tblselse.svg, apps/office/src/vcl/browser/cursors/tblselw.svg, apps/office/src/vcl/browser/cursors/tblselsw.svg, apps/office/src/sw/source/uibase/docvw/native-table-pointer.test.ts, apps/office/src/vcl/browser/pointer.test.ts, apps/office/src/sw/browser/editor/native-table-mouse.test.tsx, apps/office/e2e/writer-native-table-mouse.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. AP leaf evidence and parent entire-prefix checkpoint are lifecycle scope. No save/open/recovery change, network, global files, upstream source copies in AP, helper/probe scripts in AP. Resize drag, object selection, full RTL/vertical layout remain unverified.

## Plan

1. Add exact represented PointerStyle numeric IDs, native IsTableMode and edit-window changeMousePointer/GetPointer state; preserve upstream resize-mode guard and enhanced selection mapping. 2. Replace browser SwTab pointer switch with VCL platform projection; convert five native X11 source/mask pixels and hotspots into licensed runtime SVG assets. 3. Add native decision, literal asset and mounted/Chromium hover cases; retain every substantive prior assertion. 4. One initial static gate pass, one full upstream-absent profile, original failure/new regression closures only; record exact-SHA same-agent quality, close leaf and preserve whole parent prefix.

## Verify Steps

1. Initial npm run format:check, lint, typecheck, check:dependencies, check:docs, check:file-size once; unchanged scoped JSDoc and physical lines<1000. Only failed gates/changed paths afterward.
2. ONE full upstream-absent build/app/inventory/scripts/Chromium profile, vendor restored finally. Exact counts/errors/hashes before assertions, actual100 application and inventory coverage. No source/scope/AP audits while absent profile live. Only original failed cases or genuinely new cases afterward; no passing/full replay, no with-upstream test execution. Raw maps/cases/source diagnostics only ignored app cache; AP bounded prose/counts/hashes.
3. Native literal13 SwTab decisions, exact PointerStyle IDs, ordinary/table-selection cursor guard, pointer preservation/reset, no selection/history side effects; exact five16x16 source/mask pixels and hotspots, browser row/column/corner glyphs versus resize borders, table-mode guard and capture preservation at1280/390. Existing2 acceptance files may update obsolete cursor expectations/add assertions;491 other existing acceptance files byte-identical;2 new test files495total.
4. Once restored resource generation --check/source-tree/provenance/invariants/parity; prior272 semantic fields/full prefixes preserved plus2 explicitly unverified module owners. Doctor/routing/diff/source hashes/new leaf and quality artifact census0forbidden. Exact implementation SHA same-agent EVALUATOR phase, explicitly not independent review. Clean leaf close, whole parent Findings prefix preserved, goal ACTIVE/full parity UNVERIFIED.

## Verification

PASS at exact implementation SHAda4164f194218a31f1dc43d682ecb8ea2ab42227. Same current agent EVALUATOR phase, not independent review.12954app109inventory5scripts212Chromium aggregated PASS with one full upstream-absent profile and original failures only; actual100 app/inventory coverage;2focused filter skips remain skipped. Static/scoped/source/governance/scope and generated quality audit PASS;18leaf/quality files0forbidden. Full upstream parity UNVERIFIED; parent/goal ACTIVE.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-06T14:52:44.643Z — VERIFY — ok

By: CODER

Note: Native table pointer ownership and source glyph behavior verified at da4164f194218a31f1dc43d682ecb8ea2ab42227;12954app109inventory5scripts212Chromium aggregate PASS, actual100 coverage. One absent full profile and original failed cases only,2focused skips retained. Same-agent exact-SHA quality PASS, not independent review; full parity unverified.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-06T14:52:44.003Z, excerpt_hash=sha256:55c99abffc49fa9eb3b53aec2b1e636703c15e498184379e669cc0b8affeec23

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610061433-T25B96/blueprint/resolved-snapshot.json
- old_digest: f7cae7371e6712a2699af9adfb8922181410b69c92ea17bb1d30d2c2b3695320
- current_digest: f7cae7371e6712a2699af9adfb8922181410b69c92ea17bb1d30d2c2b3695320
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610061433-T25B96

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610061433-T25B96 -m 🧩 T25B96 task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert this leaf implementation commit with a new executable task; preserve traceability and evidence. No destructive history operation.

## Findings

Source review: edtwin.cxx changeMousePointer4101 uses HSizeBar/VSizeBar for resize, native TabSelect glyphs for enhanced selection, and IsTableMode guards only resize pointer changes. Browser currently duplicates classification and incorrectly paints enhanced selection as resize arrows. crsrsh.hxx708 checks actual table cursor presence. ptrstyle.hxx/SystemPointer.idl provide exact represented IDs; gtkdata.cxx191-192 maps resize CSS names and278-281 uses native table masks. Complete object hit arbitration, LibreOfficeKit, remaining pointer families and physical RTL/vertical layout remain unverified. Discovery corrected two guessed source paths and one guessed configuration path through actual rg inventory; no source mutation or tests preceded approval.

Command: initial six static gates and unchanged scoped JSDoc/physical lines/format/lint. Result: PASS; final changed E2E formatter PASS. One full upstream-absent profile: build PASS,12954 app PASS0fail0skip actual100;inventory108PASS1FAIL(path lexical ordering),scripts5PASS;Chromium210PASS2FAIL(new outer-container computed cursor expected text, actual auto). Exact initial counts/errors/hashes retained before assertions. Corrected metadata ordering with codepoint lexical comparator (locale sorting was inappropriate); corrected only the new outer-container fallback expectation to existing auto CSS, keeping historical selection/content/history assertions intact. Production source did not change after initial profile, so no rebuild. Closure1: only original failed inventory case1PASS2filterSKIP and original two Chromium cases2PASS0skip0flaky; vendor restored finally. No full/passing replay or tests with pinned upstream. Aggregate12954app109inventory5scripts212ChromiumPASS.
Actual100 coverage:271app14110L15469S3643F11538B, final map476ff9006130f78b6cf20fb70fd6878cf6e2ea916770d7c42f53c5b806b8e75b;38inventory1464L1523S384F1080B, final mapec335e880c41fac2f2f0594de0bf4960b18d292e0c4317dd6dbcc1f7637b3480. Entire309source-file bytes and complete inventory statement/function/branch maps verified unchanged; only actual focused counters added; focused2skips remain skipped. All raw maps/cases/source snapshots/source proof only ignored app cache; AP hashes/counts/bounded prose. Once-restored generation/source-tree/provenance/invariants/parity PASS.16semantic paths,491 prior acceptance files byte-identical,2 declared existing migrations and2new tests495total; all272 prior states/defaults/classifications/entire prefixes preserved plus2 explicitly unverified owners274. Command map byte-identical. Parent whole478980-character prefix SHAe5f2aaf634a89e6734ed9fae3e06d35245b64c43f7ab4312c4ee812696e0bff7 preserved.
Native read-only source review additionally verified X11 saldisp.cxx1732-1747 native glyph mapping and black/white source-mask colors1766-1774. Assets use native X11 pixels/hotspots; GTK themed/high-DPI shapes remain unverified. All12 non-NONE native switch branches tested, unsupported physical directions isolated through classifier spies and not claimed as layout parity. Full resize gestures/object/list/LOK/general UpdatePointer remain unverified. Doctor0errors2knownwarnings,routing/diffPASS; current leaf artifact census0forbidden. Exact implementation-SHA da4164f194218a31f1dc43d682ecb8ea2ab42227 same-agent EVALUATOR review PASS; explicitly not independent review. Final current leaf/generated quality census18files0forbidden. Goal ACTIVE/full core/UI parity UNVERIFIED; save/open/recovery exceptions unchanged.
