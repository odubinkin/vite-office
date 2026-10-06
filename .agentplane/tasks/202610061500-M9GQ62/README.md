---
id: "202610061500-M9GQ62"
title: "Replace width-array table edits with native column separator ownership"
result_summary: "Removed shell width-array table mutation in favor of native SwTabCols and document-owned width/history mechanics; physical relative-column UI drafts and three UndoRedo cycles verified. Shared flat model only; complete column-page/frame notifications, ruler resize and complex layout remain unverified."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 20
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-06T15:02:55.391Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-06T15:45:23.757Z"
  updated_by: "CODER"
  note: "Native separator ownership verified at implementation9911d7d81c1975c8d6eb79c3e7638f1270b12546. Union12985app109inventory5scripts214ChromiumPASS, actual100 app/inventory coverage. One full absent profile; closures only original failed/new cases, skips39 and4 retained, no passing/full replay. Source/static/scoped/scope/security gates PASS,doctor0errors2knownwarnings. Same-agent exact-SHA EVALUATOR phase PASS, not independent review. Full parity/goal remains unverified/active."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-06T15:44:46.404Z"
  updated_by: "EVALUATOR"
  note: "Exact implementation9911d7d81c1975c8d6eb79c3e7638f1270b12546 meets the bounded native separator task; same current agent EVALUATOR phase, not independent review."
  evaluated_sha: "9911d7d81c1975c8d6eb79c3e7638f1270b12546"
  blueprint_digest: "80ed108458693aceca2cbbaa8a9b9e7c18f9343e86e84d82c0e2bf55b506deae"
  evidence_refs:
    - ".agentplane/tasks/202610061500-M9GQ62/README.md"
    - ".agentplane/tasks/202610061500-M9GQ62/quality/20261006-154446404-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610061500-M9GQ62/quality/20261006-154446404-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610061500-M9GQ62/quality/20261006-154446404-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610061500-M9GQ62/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610061500-M9GQ62/evidence/exact-sha-quality.json"
  findings:
    - "Native carrier replaces shell width-array mutation; document owns print normalization and attribute history; connected physical draft, actual owner/cursor/list/ODT and new Chromium history cases pass. Actual100 app/inventory coverage proven over identical whole source/maps or complete contiguous ranges with actual counters. One full absent profile and only failed/new closures; all274 prior metadata prefixes and494 old acceptance files preserved; goal/full parity remains active/unverified."
commit:
  hash: "9911d7d81c1975c8d6eb79c3e7638f1270b12546"
  message: "🚧 M9GQ62 code: own table column edits with native separators"
comments:
  -
    author: "CODER"
    body: "Start: replace approved connected width-array shell path with native separator/table/document ownership under standing iterative user authorization."
  -
    author: "CODER"
    body: "Verified: native separator/history/physical draft paths pass;12985app109inventory5scripts214Chromium union with actual100 app/inventory coverage. Same-agent EVALUATOR exact implementation SHA PASS; full parity/goal remains unverified/active."
events:
  -
    type: "status"
    at: "2026-10-06T15:02:55.843Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: replace approved connected width-array shell path with native separator/table/document ownership under standing iterative user authorization."
  -
    type: "verify"
    at: "2026-10-06T15:45:23.757Z"
    author: "CODER"
    state: "ok"
    note: "Native separator ownership verified at implementation9911d7d81c1975c8d6eb79c3e7638f1270b12546. Union12985app109inventory5scripts214ChromiumPASS, actual100 app/inventory coverage. One full absent profile; closures only original failed/new cases, skips39 and4 retained, no passing/full replay. Source/static/scoped/scope/security gates PASS,doctor0errors2knownwarnings. Same-agent exact-SHA EVALUATOR phase PASS, not independent review. Full parity/goal remains unverified/active."
  -
    type: "status"
    at: "2026-10-06T15:46:08.358Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: native separator/history/physical draft paths pass;12985app109inventory5scripts214Chromium union with actual100 app/inventory coverage. Same-agent EVALUATOR exact implementation SHA PASS; full parity/goal remains unverified/active."
doc_version: 3
doc_updated_at: "2026-10-06T15:46:08.359Z"
doc_updated_by: "CODER"
description: "Iteration190 under C9TN6M: establish SwTabCols data/geometry contracts and document-owned table column mutation/history; remove the array-based SetTabCols shell contract from existing table properties. This is a connected prerequisite for native table border dragging; complete UI resize and broader layout remain open. Standing user iterative refactor authorization applies."
sections:
  Summary: "Iteration190: replace width-array SetTabCols with native SwTabCols separator geometry and document-owned table attribute history in the existing table property path. Connected prerequisite for native UI border drag; standing iterative user authorization applies."
  Scope: |-
    Only apps/office/src/sw/source/core/bastyp/tabcol.ts, apps/office/src/sw/source/core/table/swtable.ts, apps/office/src/sw/source/core/doc/doc.ts, apps/office/src/sw/source/core/frmedt/fetab.ts, apps/office/src/sw/source/uibase/table/swtablerep.ts, apps/office/src/sw/source/uibase/shells/tabsh.ts, apps/office/src/sw/source/core/bastyp/tabcol.test.ts, apps/office/src/sw/source/core/table/native-tabcols.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-tabcols-history.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-properties.test.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Leaf AP bounded evidence and entire parent Findings checkpoint included. No save/open/recovery change, network/global access, AP upstream sources/scripts/helpers/raw maps. Complete ruler/UI resize, per-row width graphs, nested/merged/RTL/vertical/protected layout and full native contracts remain unverified.
    Failure closure remains within the same twelve semantic paths: migrate the two existing table-property expectations to native HoriOrientation.LEFT and physical LR spacing, preserving all width/history/owner/cursor/content assertions. Keep the existing mounted writer-view edit/reopen case byte-identical. Complete the represented SwTableRep physical-separator input, including print-width normalization for relative imported/insertion widths; empty unattached drafts retain their existing read-only fallback. New bounded native arithmetic and ingress cases only; no full/passing replay.
    Add one bounded corrective acceptance path: apps/office/e2e/writer-native-tabcols.spec.ts, with new Chromium1280/390 relative-width physical-column dialog, edit and grouped Undo/Redo cases. Rebuild changed production once; run these new cases only. Prior495 acceptance files: one native contract migration,494 byte-identical; four new acceptance files,499 total. No new implementation path or feature scope.
  Plan: "1. Port SwTabCols/entry defaults, copy/assignment, separator positions, min/max/hidden flags, edges and last-row flag. 2. Move represented flat SwTable GetTabCols/SetTabCols scaling, source edge orientation rules and new-model width changes into actual table owner. Add document SetTabCols history/notification owner and replace shell width-array API with native separator carrier. 3. Add SwTableRep FillTabCols and use native GetTabCols -> FillTabCols -> SetTabCols in existing table properties; migrate only one old direct array-based acceptance fixture. 4. Verify literal carriers/flat source arithmetic/selection/history/ODT and unchanged real UI behavior; one full absent profile, original failures/new regressions only; exact-SHA same-agent quality, close leaf and preserve whole parent prefix."
  Verify Steps: |-
    1. Initial six static gates npm run format:check/lint/typecheck/check:dependencies/check:docs/check:file-size once; unchanged scoped JSDoc, physical lines<1000; original failed or changed-path gates only afterward.
    2. ONE full upstream-absent build/app/inventory/scripts/Chromium profile; vendor restored finally. Exact counts/errors/hashes before assertions. Actual100 app and inventory coverage with whole identical maps/source or complete contiguous identical ranges/full function and branch locations/actual counters. No source/scope/AP audits while any absent profile live. Only original failed cases or genuinely new cases afterward; no passing/full replay, no tests invoking pinned upstream. Raw maps/cases/source diagnostics only ignored app cache; AP bounded counts/hashes/prose.
    3. Literal SwTabCols defaults/copy/assignment/mutable entries/insert/remove/hidden/edges/last-row flag; flat GetTabCols separator scaling/limits/hidden refresh, new-model moved border widths/fuzzy20/truncation and source orientation edges. Actual shell and document ownership/non-table/foreign/unsupported per-row admission, prevalidation, one grouped table properties history, original table/row/cell/text identities,3UndoRedo cycles, continued text/list operations and ODT roundtrip. Existing properties UI and Chromium assertions preserved.495 old acceptance files:1 native-carrier fixture and two native format expectation migrations in one file,494 byte-identical;4new files499total. Scope includes the bounded new relative-column Chromium1280/390 corrective path; only six original app failures, new arithmetic/input/regression cases and original new Chromium failures run in closures.
    4. Once restored resource generation --check/source-tree/provenance/invariants/parity; prior274 semantic fields/full prefixes preserved plus1 explicitly UNVERIFIED SwTabCols owner275. Doctor/routing/diff/pinned hashes/current leaf/generated quality census0forbidden. Exact implementation SHA same-agent EVALUATOR phase, not independent review. Clean leaf close and parent entire482408-character prefix SHA3ae6e6d7f333100806ae8c6846c29ff265b114650700d6a19e04a1439e8af95f preserved. Parent/goal ACTIVE/full parity UNVERIFIED.
  Verification: |-
    One full upstream-absent profile: buildPASS;12968appPASS6FAIL,109inventoryPASSactual100,5scriptsPASS,212ChromiumPASS. Initial app failures: relative model widths leaked into physical table draft (old mounted editing/ODT case), new fixture used incorrect page print width9360 instead of8640 and missing document-owned list registration, and two old native-property exact format expectations retained legacy align-only representation. Closures: original6app failures plus10new casesPASS,39filterSKIP; new structural-frame admission casePASS,4filterSKIP; new Chromium1280/390 cases initially failed only expected numeric display4.00 versus actual4, then bothPASS with three UndoRedo cycles. No initial passing-case replay, no second full profile, all runtime/acceptance runs upstream-absent with vendor restored finally. Build repeated once because production SwTableRep changed; current new browser cases use rebuilt dist. Final union12985app109inventory5scripts214ChromiumPASS; filter skips stay skipped.
    Actual100 app coverage272files14334lines15716statements3677functions11691branches, mapSHA79896b368fb973a0f8375c48fe8ebd6994404f238ebfcceb214a230db67f0f85. Actual100 inventory38files1464lines1523statements384functions1080branches, mapSHA59c9092457d28c069b34c3d72e61b43ef178a5b175cfb01fd0fcd02afc694116. App271 whole source/maps identical; changed SwTableRep counters transferred only across complete contiguous byte-identical ranges with whole mapped function declaration/body and complete branch locations. Changed constructor uses actual focused counters. Inventory38 entire source files unchanged. Source proof310files, no synthetic counters. Raw reports/maps/cases/source snapshots/proofs stay only ignored app cache; AP bounded prose/counts/hashes.
    Initial six static gates: formatting/dependencies/docs/file-sizePASS, lint/typecheck initially rejected new fixture syntax/style; original failed checks and changed-path checks repaired, final current scoped unchanged JSDoc/physical lines/format/lintPASS and typecheckPASS. Once-restored source generation/tree/provenance/invariants/parityPASS;doctor0errors2knownwarnings,routing/diffPASS.13 semantic paths,494 old acceptance files byte-identical; one old native-property file migrates carrier and exact native format expectations without dropping owner/cursor/content/history/width assertions,4new acceptance files499total. All274 prior semantic fields/full prefixes retained plus1 explicitly unverified SwTabCols owner275; I/O/recovery command mapping byte-identical. Parent482408-character entire prefix SHA3ae6e6d7f333100806ae8c6846c29ff265b114650700d6a19e04a1439e8af95f unchanged before checkpoint. Exact implementation9911d7d81c1975c8d6eb79c3e7638f1270b12546 same-agent EVALUATOR phase PASS, explicitly not independent review; CODER verification recorded OK. Clean close pending; full native parity and whole goal remain unverified/active.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-06T15:45:23.757Z — VERIFY — ok

    By: CODER

    Note: Native separator ownership verified at implementation9911d7d81c1975c8d6eb79c3e7638f1270b12546. Union12985app109inventory5scripts214ChromiumPASS, actual100 app/inventory coverage. One full absent profile; closures only original failed/new cases, skips39 and4 retained, no passing/full replay. Source/static/scoped/scope/security gates PASS,doctor0errors2knownwarnings. Same-agent exact-SHA EVALUATOR phase PASS, not independent review. Full parity/goal remains unverified/active.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-06T15:42:45.155Z, excerpt_hash=sha256:b2a3713491552c63935a385b94f045b30b8db4722ade6e7e3532ce5d7962826e

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610061500-M9GQ62/blueprint/resolved-snapshot.json
    - old_digest: 80ed108458693aceca2cbbaa8a9b9e7c18f9343e86e84d82c0e2bf55b506deae
    - current_digest: 80ed108458693aceca2cbbaa8a9b9e7c18f9343e86e84d82c0e2bf55b506deae
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610061500-M9GQ62

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610061500-M9GQ62 -m 🧩 M9GQ62 task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Use a new executable task to revert the implementation commit if needed; retain traceability and evidence; no destructive history operation."
  Findings: |-
    Native source: tabcol.hxx/tabcol.cxx own separator data and true last-row default; SwFEShell fetab.cxx835/853 delegates native column operations through document/frame ownership. ndtbl.cxx3060 owns attribute history before SwTable SetTabCols. swtable.cxx526/831/1166 owns GetTabCols/NewSetTabCols/edge changes, COLFUZZY20 and integer scaling; source setters do not use width arrays. tabsh.cxx432-435 uses GetTabCols -> SwTableRep::FillTabCols -> SetTabCols. Current shell array mutation/history is the connected architectural gap. Scope keeps the existing shared flat column model; per-row-only writes are explicitly rejected rather than changing all rows. Complete frame hierarchy, rowspans/nested/RTL/vertical geometry, relative widths/shadows/native notifications and ruler UI drag remain unverified. Source-long values outside JavaScript safe coordinate range remain unverified. Previous goal turn completed native pointer task189; classified progress. Current analysis identifies a necessary connected resize prerequisite, not whole-parity completion.

    Completed represented native path: SwFEShell GetTabCols/SetTabCols no longer accepts a width array; SwTableRep Reset/Fill use physical native separators for connected tables; SwDoc validates, normalizes frame print size before Undo and owns mutation/history notifications; shared flat SwTable owns source fuzzy/integer/edge width changes. Old relative-width mounted edit/ODT acceptance remains byte-identical and now passes. Native physical reset is read-only; empty unattached draft fallback retained. Native frame-format width notifications, automatic adjacent-column dialog adjustment, ruler resize and complex/hidden/per-row/RTL/vertical/protected/nested/span/shadow/multiframe ownership remain unverified. Literal robust arithmetic boundary cases cover ushort positions and negative wished-size fallback, without claiming wide native Long parity. Registered save/open/recovery deviations unchanged. Initial and focused failures and counts are preserved in bounded evidence; no sources/helpers/probes/raw maps/cases in AP.
id_source: "generated"
---
## Summary

Iteration190: replace width-array SetTabCols with native SwTabCols separator geometry and document-owned table attribute history in the existing table property path. Connected prerequisite for native UI border drag; standing iterative user authorization applies.

## Scope

Only apps/office/src/sw/source/core/bastyp/tabcol.ts, apps/office/src/sw/source/core/table/swtable.ts, apps/office/src/sw/source/core/doc/doc.ts, apps/office/src/sw/source/core/frmedt/fetab.ts, apps/office/src/sw/source/uibase/table/swtablerep.ts, apps/office/src/sw/source/uibase/shells/tabsh.ts, apps/office/src/sw/source/core/bastyp/tabcol.test.ts, apps/office/src/sw/source/core/table/native-tabcols.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-tabcols-history.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-properties.test.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Leaf AP bounded evidence and entire parent Findings checkpoint included. No save/open/recovery change, network/global access, AP upstream sources/scripts/helpers/raw maps. Complete ruler/UI resize, per-row width graphs, nested/merged/RTL/vertical/protected layout and full native contracts remain unverified.
Failure closure remains within the same twelve semantic paths: migrate the two existing table-property expectations to native HoriOrientation.LEFT and physical LR spacing, preserving all width/history/owner/cursor/content assertions. Keep the existing mounted writer-view edit/reopen case byte-identical. Complete the represented SwTableRep physical-separator input, including print-width normalization for relative imported/insertion widths; empty unattached drafts retain their existing read-only fallback. New bounded native arithmetic and ingress cases only; no full/passing replay.
Add one bounded corrective acceptance path: apps/office/e2e/writer-native-tabcols.spec.ts, with new Chromium1280/390 relative-width physical-column dialog, edit and grouped Undo/Redo cases. Rebuild changed production once; run these new cases only. Prior495 acceptance files: one native contract migration,494 byte-identical; four new acceptance files,499 total. No new implementation path or feature scope.

## Plan

1. Port SwTabCols/entry defaults, copy/assignment, separator positions, min/max/hidden flags, edges and last-row flag. 2. Move represented flat SwTable GetTabCols/SetTabCols scaling, source edge orientation rules and new-model width changes into actual table owner. Add document SetTabCols history/notification owner and replace shell width-array API with native separator carrier. 3. Add SwTableRep FillTabCols and use native GetTabCols -> FillTabCols -> SetTabCols in existing table properties; migrate only one old direct array-based acceptance fixture. 4. Verify literal carriers/flat source arithmetic/selection/history/ODT and unchanged real UI behavior; one full absent profile, original failures/new regressions only; exact-SHA same-agent quality, close leaf and preserve whole parent prefix.

## Verify Steps

1. Initial six static gates npm run format:check/lint/typecheck/check:dependencies/check:docs/check:file-size once; unchanged scoped JSDoc, physical lines<1000; original failed or changed-path gates only afterward.
2. ONE full upstream-absent build/app/inventory/scripts/Chromium profile; vendor restored finally. Exact counts/errors/hashes before assertions. Actual100 app and inventory coverage with whole identical maps/source or complete contiguous identical ranges/full function and branch locations/actual counters. No source/scope/AP audits while any absent profile live. Only original failed cases or genuinely new cases afterward; no passing/full replay, no tests invoking pinned upstream. Raw maps/cases/source diagnostics only ignored app cache; AP bounded counts/hashes/prose.
3. Literal SwTabCols defaults/copy/assignment/mutable entries/insert/remove/hidden/edges/last-row flag; flat GetTabCols separator scaling/limits/hidden refresh, new-model moved border widths/fuzzy20/truncation and source orientation edges. Actual shell and document ownership/non-table/foreign/unsupported per-row admission, prevalidation, one grouped table properties history, original table/row/cell/text identities,3UndoRedo cycles, continued text/list operations and ODT roundtrip. Existing properties UI and Chromium assertions preserved.495 old acceptance files:1 native-carrier fixture and two native format expectation migrations in one file,494 byte-identical;4new files499total. Scope includes the bounded new relative-column Chromium1280/390 corrective path; only six original app failures, new arithmetic/input/regression cases and original new Chromium failures run in closures.
4. Once restored resource generation --check/source-tree/provenance/invariants/parity; prior274 semantic fields/full prefixes preserved plus1 explicitly UNVERIFIED SwTabCols owner275. Doctor/routing/diff/pinned hashes/current leaf/generated quality census0forbidden. Exact implementation SHA same-agent EVALUATOR phase, not independent review. Clean leaf close and parent entire482408-character prefix SHA3ae6e6d7f333100806ae8c6846c29ff265b114650700d6a19e04a1439e8af95f preserved. Parent/goal ACTIVE/full parity UNVERIFIED.

## Verification

One full upstream-absent profile: buildPASS;12968appPASS6FAIL,109inventoryPASSactual100,5scriptsPASS,212ChromiumPASS. Initial app failures: relative model widths leaked into physical table draft (old mounted editing/ODT case), new fixture used incorrect page print width9360 instead of8640 and missing document-owned list registration, and two old native-property exact format expectations retained legacy align-only representation. Closures: original6app failures plus10new casesPASS,39filterSKIP; new structural-frame admission casePASS,4filterSKIP; new Chromium1280/390 cases initially failed only expected numeric display4.00 versus actual4, then bothPASS with three UndoRedo cycles. No initial passing-case replay, no second full profile, all runtime/acceptance runs upstream-absent with vendor restored finally. Build repeated once because production SwTableRep changed; current new browser cases use rebuilt dist. Final union12985app109inventory5scripts214ChromiumPASS; filter skips stay skipped.
Actual100 app coverage272files14334lines15716statements3677functions11691branches, mapSHA79896b368fb973a0f8375c48fe8ebd6994404f238ebfcceb214a230db67f0f85. Actual100 inventory38files1464lines1523statements384functions1080branches, mapSHA59c9092457d28c069b34c3d72e61b43ef178a5b175cfb01fd0fcd02afc694116. App271 whole source/maps identical; changed SwTableRep counters transferred only across complete contiguous byte-identical ranges with whole mapped function declaration/body and complete branch locations. Changed constructor uses actual focused counters. Inventory38 entire source files unchanged. Source proof310files, no synthetic counters. Raw reports/maps/cases/source snapshots/proofs stay only ignored app cache; AP bounded prose/counts/hashes.
Initial six static gates: formatting/dependencies/docs/file-sizePASS, lint/typecheck initially rejected new fixture syntax/style; original failed checks and changed-path checks repaired, final current scoped unchanged JSDoc/physical lines/format/lintPASS and typecheckPASS. Once-restored source generation/tree/provenance/invariants/parityPASS;doctor0errors2knownwarnings,routing/diffPASS.13 semantic paths,494 old acceptance files byte-identical; one old native-property file migrates carrier and exact native format expectations without dropping owner/cursor/content/history/width assertions,4new acceptance files499total. All274 prior semantic fields/full prefixes retained plus1 explicitly unverified SwTabCols owner275; I/O/recovery command mapping byte-identical. Parent482408-character entire prefix SHA3ae6e6d7f333100806ae8c6846c29ff265b114650700d6a19e04a1439e8af95f unchanged before checkpoint. Exact implementation9911d7d81c1975c8d6eb79c3e7638f1270b12546 same-agent EVALUATOR phase PASS, explicitly not independent review; CODER verification recorded OK. Clean close pending; full native parity and whole goal remain unverified/active.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-06T15:45:23.757Z — VERIFY — ok

By: CODER

Note: Native separator ownership verified at implementation9911d7d81c1975c8d6eb79c3e7638f1270b12546. Union12985app109inventory5scripts214ChromiumPASS, actual100 app/inventory coverage. One full absent profile; closures only original failed/new cases, skips39 and4 retained, no passing/full replay. Source/static/scoped/scope/security gates PASS,doctor0errors2knownwarnings. Same-agent exact-SHA EVALUATOR phase PASS, not independent review. Full parity/goal remains unverified/active.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-06T15:42:45.155Z, excerpt_hash=sha256:b2a3713491552c63935a385b94f045b30b8db4722ade6e7e3532ce5d7962826e

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610061500-M9GQ62/blueprint/resolved-snapshot.json
- old_digest: 80ed108458693aceca2cbbaa8a9b9e7c18f9343e86e84d82c0e2bf55b506deae
- current_digest: 80ed108458693aceca2cbbaa8a9b9e7c18f9343e86e84d82c0e2bf55b506deae
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610061500-M9GQ62

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610061500-M9GQ62 -m 🧩 M9GQ62 task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Use a new executable task to revert the implementation commit if needed; retain traceability and evidence; no destructive history operation.

## Findings

Native source: tabcol.hxx/tabcol.cxx own separator data and true last-row default; SwFEShell fetab.cxx835/853 delegates native column operations through document/frame ownership. ndtbl.cxx3060 owns attribute history before SwTable SetTabCols. swtable.cxx526/831/1166 owns GetTabCols/NewSetTabCols/edge changes, COLFUZZY20 and integer scaling; source setters do not use width arrays. tabsh.cxx432-435 uses GetTabCols -> SwTableRep::FillTabCols -> SetTabCols. Current shell array mutation/history is the connected architectural gap. Scope keeps the existing shared flat column model; per-row-only writes are explicitly rejected rather than changing all rows. Complete frame hierarchy, rowspans/nested/RTL/vertical geometry, relative widths/shadows/native notifications and ruler UI drag remain unverified. Source-long values outside JavaScript safe coordinate range remain unverified. Previous goal turn completed native pointer task189; classified progress. Current analysis identifies a necessary connected resize prerequisite, not whole-parity completion.

Completed represented native path: SwFEShell GetTabCols/SetTabCols no longer accepts a width array; SwTableRep Reset/Fill use physical native separators for connected tables; SwDoc validates, normalizes frame print size before Undo and owns mutation/history notifications; shared flat SwTable owns source fuzzy/integer/edge width changes. Old relative-width mounted edit/ODT acceptance remains byte-identical and now passes. Native physical reset is read-only; empty unattached draft fallback retained. Native frame-format width notifications, automatic adjacent-column dialog adjustment, ruler resize and complex/hidden/per-row/RTL/vertical/protected/nested/span/shadow/multiframe ownership remain unverified. Literal robust arithmetic boundary cases cover ushort positions and negative wished-size fallback, without claiming wide native Long parity. Registered save/open/recovery deviations unchanged. Initial and focused failures and counts are preserved in bounded evidence; no sources/helpers/probes/raw maps/cases in AP.
