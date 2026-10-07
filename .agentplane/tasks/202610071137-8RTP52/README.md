---
id: "202610071137-8RTP52"
title: "Restore native table naming through properties and undo"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 17
origin:
  system: "manual"
depends_on: []
tags:
  - "parity"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-07T12:13:57.378Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-07T12:35:09.698Z"
  updated_by: "CODER"
  note: "Native frame table names, changed-only Properties and cursor-free lookup undo verified at c0168febda45; 13509 app, 110 inventory, 14 infrastructure, 274 Chromium resolved; source-bound actual100; ONE upstream-absent full run and failed/new-only closure, no passing replay. Same current-agent evaluator PASS, explicitly not independent. Full parity remains unverified."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-07T12:30:48.063Z"
  updated_by: "EVALUATOR"
  note: "Exact c0168febda45 source-bound table-name closure passes:13509app110inventory14infrastructure274Chromium; actual100 app/inventory; ONE full upstream-absent run and failed/new-only closure; same current agent, explicitly not independent."
  evaluated_sha: "c0168febda45e1cdce445aa9fdaf4c687770576c"
  blueprint_digest: "968c963501a0cb8de16ee40d5a6891280c7a6a05ab2747614c7e8dc00536746b"
  evidence_refs:
    - ".agentplane/tasks/202610071137-8RTP52/README.md"
    - ".agentplane/tasks/202610071137-8RTP52/quality/20261007-123048063-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610071137-8RTP52/quality/20261007-123048063-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610071137-8RTP52/quality/20261007-123048063-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610071137-8RTP52/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610071137-8RTP52/evidence/exact-sha-review.json"
  findings:
    - "Native frame name owner, raw document rename, cursor-free name lookup undo/recreated owners, replay suppression, Properties changed Name/page guard/reset/cancel/history/ODT verified.21semantic paths,577old files573identical4exact migrations,580current, all293prior metadata fields/defaults/exceptions preserved; no whole-parity promotion."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: restore source-owned table names and Properties behavior under standing iterative authorization."
events:
  -
    type: "status"
    at: "2026-10-07T11:38:09.646Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore source-owned table names and Properties behavior under standing iterative authorization."
  -
    type: "verify"
    at: "2026-10-07T12:35:09.698Z"
    author: "CODER"
    state: "ok"
    note: "Native frame table names, changed-only Properties and cursor-free lookup undo verified at c0168febda45; 13509 app, 110 inventory, 14 infrastructure, 274 Chromium resolved; source-bound actual100; ONE upstream-absent full run and failed/new-only closure, no passing replay. Same current-agent evaluator PASS, explicitly not independent. Full parity remains unverified."
doc_version: 3
doc_updated_at: "2026-10-07T12:35:09.752Z"
doc_updated_by: "CODER"
description: "Iteration214: source-owned SwFrameFormat table identity, document rename and cursor-free name undo, editable native Properties Name control and source-backed validation. Preserve registered deviations and all unrelated assertions."
sections:
  Summary: "Restore the existing Table Properties name field and document-owned rename history according to pinned LibreOffice."
  Scope: "Iteration214 under standing user authorization. One CODER leaf restores native frame-format table name ownership, SwDoc/SwEditShell SetTableName, name-only cursor-free rename undo with replay suppression, and editable Properties Name with saved-value deltas, ASCII-space page guard, focus, Reset/Cancel. Empty or colliding names use document unique names; direct API retains raw names. Approved semantic paths: apps/office/src/sw/source/core/attr/format.ts, apps/office/src/sw/source/core/layout/atrfrm.ts, apps/office/src/sw/source/core/table/swtable.ts, apps/office/src/sw/source/core/doc/doc.ts, apps/office/src/sw/source/core/doc/docchart.ts, apps/office/src/sw/source/core/edit/edtab.ts, apps/office/src/sw/source/core/undo/docundo.ts, apps/office/src/sw/source/core/undo/undobj.ts, apps/office/src/sw/source/core/undo/untbl.ts, apps/office/src/sw/source/uibase/shells/tabsh.ts, apps/office/src/sw/source/ui/table/tabledlg.ts, apps/office/src/sw/browser/presentation/WriterTableDialog.tsx, apps/office/src/sw/source/core/doc/writer-attributes.test.ts, apps/office/src/sw/browser/presentation/native-table-properties-reset.test.tsx, apps/office/src/sw/browser/presentation/native-table-column-page.test.tsx, apps/office/src/sw/source/uibase/wrtsh/native-table-name-history.test.ts, apps/office/src/sw/browser/presentation/native-table-name-page.test.tsx, apps/office/e2e/native-table-name.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Only four exact old source-backed test migrations: generic format blank-name prohibition removed; two obsolete Properties empty-name error cases use ASCII-space invalid names; one failed live-style test explicitly requests native broadcast=true, preserving every assertion. Every unrelated assertion and all other577 acceptance files remain unchanged. Preserve existing metadata fields/statuses/registered deviations; add new source/acceptance linkage without promotion. Formulas/charts/mail merge and full frame attribute collection remain unverified residuals. Six initial static gates once, failed or changed-input closure only; ONE full upstream-absent runtime profile, then original failures or genuinely new cases only, no passing replay. Strict current-source actual100 app/inventory coverage by whole identical source/maps or contiguous complete mapped units; never fabricate counters/exclude tests/promote skips. Source gates after vendor restoration. Raw snapshots/results/maps in ignored dependency cache, AP bounded English md/json only. Same-agent EVALUATOR not independent, canonical verify exact implementation SHA/finish and complete-prefix parent append. No network/global access/subagents. Goal remains ACTIVE. Additional exact caller migration under standing source-parity authorization: apps/office/src/sw/browser/presentation/writer-style-selector.test.tsx. New geometry guard case retains existing rejection for empty native table graphs. New Chromium continued-edit fixture uses the established explicit DOM end caret instead of treating End as caret setup; every assertion is retained. Actual Home/End behavior remains an unverified follow-up. No new production path or verification change."
  Plan: "Iteration214 under standing user authorization. One CODER leaf restores native frame-format table name ownership, SwDoc/SwEditShell SetTableName, name-only cursor-free rename undo with replay suppression, and editable Properties Name with saved-value deltas, ASCII-space page guard, focus, Reset/Cancel. Empty or colliding names use document unique names; direct API retains raw names. Approved semantic paths: apps/office/src/sw/source/core/attr/format.ts, apps/office/src/sw/source/core/layout/atrfrm.ts, apps/office/src/sw/source/core/table/swtable.ts, apps/office/src/sw/source/core/doc/doc.ts, apps/office/src/sw/source/core/doc/docchart.ts, apps/office/src/sw/source/core/edit/edtab.ts, apps/office/src/sw/source/core/undo/docundo.ts, apps/office/src/sw/source/core/undo/undobj.ts, apps/office/src/sw/source/core/undo/untbl.ts, apps/office/src/sw/source/uibase/shells/tabsh.ts, apps/office/src/sw/source/ui/table/tabledlg.ts, apps/office/src/sw/browser/presentation/WriterTableDialog.tsx, apps/office/src/sw/source/core/doc/writer-attributes.test.ts, apps/office/src/sw/browser/presentation/native-table-properties-reset.test.tsx, apps/office/src/sw/browser/presentation/native-table-column-page.test.tsx, apps/office/src/sw/source/uibase/wrtsh/native-table-name-history.test.ts, apps/office/src/sw/browser/presentation/native-table-name-page.test.tsx, apps/office/e2e/native-table-name.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Only four exact old source-backed test migrations: generic format blank-name prohibition removed; two obsolete Properties empty-name error cases use ASCII-space invalid names; one failed live-style test explicitly requests native broadcast=true, preserving every assertion. Every unrelated assertion and all other577 acceptance files remain unchanged. Preserve existing metadata fields/statuses/registered deviations; add new source/acceptance linkage without promotion. Formulas/charts/mail merge and full frame attribute collection remain unverified residuals. Six initial static gates once, failed or changed-input closure only; ONE full upstream-absent runtime profile, then original failures or genuinely new cases only, no passing replay. Strict current-source actual100 app/inventory coverage by whole identical source/maps or contiguous complete mapped units; never fabricate counters/exclude tests/promote skips. Source gates after vendor restoration. Raw snapshots/results/maps in ignored dependency cache, AP bounded English md/json only. Same-agent EVALUATOR not independent, canonical verify exact implementation SHA/finish and complete-prefix parent append. No network/global access/subagents. Goal remains ACTIVE. Additional exact caller migration under standing source-parity authorization: apps/office/src/sw/browser/presentation/writer-style-selector.test.tsx. New geometry guard case retains existing rejection for empty native table graphs. New Chromium continued-edit fixture uses the established explicit DOM end caret instead of treating End as caret setup; every assertion is retained. Actual Home/End behavior remains an unverified follow-up. No new production path or verification change."
  Verify Steps: "Run six initial static gates once: npm run format:check, lint, typecheck, check:dependencies, check:docs, check:file-size. Verify original577 acceptance files outside exact three source-backed migrations remain byte-identical, metadata prefixes/fields preserved, physical files below1000. Run ONE full upstream-absent build/app/inventory/infrastructure/Chromium profile, then only original failures or genuinely new cases. Require native name owner, no-op/empty/collision/raw names, name lookup recreation, cursor-free three-cycle undo/redo, replay suppression, grouped geometry history, ODT and continued edit; mounted and browser Name validation/focus/tab blocking/reset/cancel. Strict current-source actual100 app/inventory evidence without fabricated counters. Restore vendor then source/resource/provenance/inventory gates. Doctor/routing/diff and exact same-agent evaluator review, canonical verification, implementation-SHA finish and parent full-prefix append."
  Verification: |-
    Command: six initial static gates once and changed-input failures/closures; ONE full upstream-absent build/app/inventory/infrastructure/Chromium profile, then original failures or one genuinely new geometry-guard case only; source gates after vendor restoration, strict source-bound coverage/case/scope/AP/governance and exact implementation review.
    Result: PASS approved native table-name ownership, Properties application and undo scope.
    Evidence: implementation c0168febda45e1cdce445aa9fdaf4c687770576c;13509app110inventory14infrastructure274Chromium resolved,0unresolved0passing replay;18app2inventory focused skip observations retained, subset threshold exit1 recorded. Actual100 all four app/inventory metrics across292/38whole current sources/maps plus10complete prior app declaration/body/ancestor certificates,0post-profile production changes. Raw negative painter aggregate retained and entire prior identical verified entry selected. See exact-sha-review.json, final-coverage.json, case-census.json, scope-final.json, source-review.json and quality/20261007-123048063-recovery-context/quality-report.json.21semantic paths,573prior test files identical4exact migrations3newfiles; all293prior metadata fields/defaults/exceptions preserved,2new source records unverified. Four priority bullet cases pass.
    Scope: one native frame name owner; raw/no-op/empty/collision names, name lookup after recreation, missing lookup and cursor-free history, recording suppression, changed-only saved Name page/reset/ASCII-space guard, grouped geometry, three Undo/Redo, ODT/reopen/continued edit. Same current-agent EVALUATOR explicitly not independent. Full frame/allocator/formula/chart/NameChanged/modal and browser Home/End remain unverified; whole parity parent/goal ACTIVE.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-07T12:35:09.698Z — VERIFY — ok

    By: CODER

    Note: Native frame table names, changed-only Properties and cursor-free lookup undo verified at c0168febda45; 13509 app, 110 inventory, 14 infrastructure, 274 Chromium resolved; source-bound actual100; ONE upstream-absent full run and failed/new-only closure, no passing replay. Same current-agent evaluator PASS, explicitly not independent. Full parity remains unverified.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-07T12:34:58.868Z, excerpt_hash=sha256:bed90887d708208868714371d54254320eb82f78e56839e7d16d6325c089995e

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610071137-8RTP52/blueprint/resolved-snapshot.json
    - old_digest: 968c963501a0cb8de16ee40d5a6891280c7a6a05ab2747614c7e8dc00536746b
    - current_digest: 968c963501a0cb8de16ee40d5a6891280c7a6a05ab2747614c7e8dc00536746b
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610071137-8RTP52

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610071137-8RTP52
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only the semantic implementation commit if regression is discovered; retain truthful evidence and registered exceptions."
  Findings: |-
    Pinned native docchart.cxx uses frame-format identity, collision/empty unique-name substitution and old/new-name lookup undo in untbl.cxx. tabledlg.cxx emits changed names only and blocks ASCII spaces with Name focus. Project currently has no editable Properties Name input. Formulas/charts/mail merge remain unimplemented and unverified; this leaf does not invent those layers.

    Iteration214 verified closure. Implementation c0168febda45e1cdce445aa9fdaf4c687770576c restores native table naming through SwFrameFormat/SwFormat, SwDoc.SetTableName, edit shell delegation and name-only SwUndoRenameTable. Removed the duplicate private table-name string and fabricated blank-name guard. Native frame identity owns raw names, broadcast defaults false, same-name is a no-op, empty/collision uses existing unique naming. Undo resolves the current live frame by name and retains no table pointer or cursor; missing lookup is a no-op. Undo/Redo temporarily disable action recording and restore the original flag. Properties apply only a changed native Name item in the original geometry group. SwFormatTablePage owns saved/raw Name, reset and ASCII-space departure guard; browser focus, tab blocking, reset/cancel, raw empty/tab/NBSP, geometry rejection, original owners, recreation, three Undo/Redo, ODT reopen and continued edit pass. Full native frame attributes, allocator and informational-modal behavior are not claimed.

    Six initial static gates once: four PASS, format/typecheck initially failed for newly authored fixtures; corrected actual revision/Close APIs, cursor construction and new-file formatting. Only changed-input scoped format/eslint/typecheck closures afterward. ONE full upstream-absent build/app/inventory/infrastructure/Chromium profile:13506app PASS2FAIL of13508,109inventory PASS1FAIL of110,14infrastructure PASS,272Chromium PASS2FAIL of274. An unchanged desktop imported-document case initially timed out and passed its unchanged original-failure-only retry; no save/open/recovery source changed. Live style rename required explicit broadcast=true under native default false; only that call changed, every assertion retained. Metadata records required native lexical ordering; sorted only, unchanged failed inventory case passed. Both new Name browser cases failed final caret setup with End and passed after established explicit DOM end-caret setup, every assertion unchanged; actual browser Home/End remains unverified. One genuinely new mounted rowless-geometry guard acceptance case passed. Narrow closure:3app PASS18SKIP,1inventory PASS2SKIP,2Chromium PASS. App/inventory commands exit1 solely from subset global coverage thresholds, retained honestly. Actual union13509app110inventory14infrastructure274Chromium PASS,0unresolved0passing replay. All12production paths byte-identical full/build/browser/closure/current commit; runtime terminal and vendor restored finally before source/AP writes.

    Strict current-source app actual100 L16314S17905F4158B13375 across292whole current source/maps plus10 complete prior-region certificates; inventory100 L1464S1523F384B1081 across38whole files. Prior-region transfers require verified prior source hash, identical contiguous bytes, complete function declarations/bodies, enclosing branches and all locations. No partial post-profile production transfers, source changes, fabricated counters, exclusions or skip promotion. Raw V8 inferred painter else aggregate-36 preserved and rejected; entire prior verified current-identical source/maps/counters selected for the unchanged painter entry, never individual clamp. App map/proof a67f6b226c823f5a5a67d88f2b4c50cbd1a9b72773d9b836d6e40438ffa0873e/c30f917e541214567d3040c3ea74502070a3d1cce08c4934ace733f933bbfafe; inventory 53bf9c1555003dcdd974f4c2f124ac0e597c38d24244cb81ed39d6051bcdc8bf/e4a57c478310d6bacc7a9b7d4d3d11b0a37bc5c7872abb8e69eae124af3b57c6. Coverage/case/scope reports reconstructed byte-identically after implementation commit; all current counters finite/nonnegative and whole fallback bound. Same current agent EVALUATOR explicitly not independent exact-SHA PASS, quality/20261007-123048063-recovery-context/quality-report.json.

    Scope21approved21actual:12production4exact source-backed old acceptance migrations3newfiles2metadata. Prior577acceptance files573byte-identical4exact migration intervals, current580. Exact reconstruction preserves all unrelated assertions/bytes with repository Prettier settings. All293prior metadata complete fields/prefixes/statuses/defaults/registered save/open/recovery deviations retained. Added2source-native atrfrm/docchart records as unverified, current295; no blanket promotion. Pinned source8files libreoffice-26.8.0.2 9bc445578031fecf56086729d8e4940c77e14d65 reviewed with bounded hashes/locations. Five source gates after restoration PASS; final metadata formatting and only3changed-input provenance/invariants/parity gates PASS. JSDoc and physical changed files max990lines PASS; doctor0errors2knownwarnings, routing/diff PASS. AP census5317files at inspection,0forbidden upstream source/Python/raw maps/results/snapshots; bounded English json/md, raw evidence only ignored project dependency cache. Complete585271-character parent Findings SHA c75cbad1fffd8967f011799b9fe521e303d4b5ef0599055b17f9db57f33fbf6e preserved. Four priority bullet body/cell1280/390 full Chromium regressions PASS; original overlap fix unchanged. Deferred stash untouched.

    Tool/audit corrections: two JS construction syntax failures before execution, no side effects; unmatched atomic patch changed nothing, route recomputed and smaller patch applied; read-only guessed paths/globs missing had no mutation. Scope helper name shadowing caused a pre-write path error; renamed preservePrefix and exact audit passed. AP require-clean first rejected unstaged semantic paths, then exact21 paths staged; hook rejected code scope, changed to allowed parity scope. No disabled hooks, source changes or passing runtime replay for those corrections.

    Residual: formulas/OLE/chart references, numeric suffix/mail-merge allocator, full/default/unused/all frame ownership, native NameChanged hint granularity and native informational-message modal composition/dismissal remain unverified. Existing inline React validation presentation is bounded behavior only. Browser End failed to establish expected end caret in the new fixture; Home/End is a separate source audit. Whole kernel/browser parity remains unverified, parent/goal ACTIVE. Final Findings/Verification precede canonical verify; finish actual implementation SHA.
id_source: "generated"
---
## Summary

Restore the existing Table Properties name field and document-owned rename history according to pinned LibreOffice.

## Scope

Iteration214 under standing user authorization. One CODER leaf restores native frame-format table name ownership, SwDoc/SwEditShell SetTableName, name-only cursor-free rename undo with replay suppression, and editable Properties Name with saved-value deltas, ASCII-space page guard, focus, Reset/Cancel. Empty or colliding names use document unique names; direct API retains raw names. Approved semantic paths: apps/office/src/sw/source/core/attr/format.ts, apps/office/src/sw/source/core/layout/atrfrm.ts, apps/office/src/sw/source/core/table/swtable.ts, apps/office/src/sw/source/core/doc/doc.ts, apps/office/src/sw/source/core/doc/docchart.ts, apps/office/src/sw/source/core/edit/edtab.ts, apps/office/src/sw/source/core/undo/docundo.ts, apps/office/src/sw/source/core/undo/undobj.ts, apps/office/src/sw/source/core/undo/untbl.ts, apps/office/src/sw/source/uibase/shells/tabsh.ts, apps/office/src/sw/source/ui/table/tabledlg.ts, apps/office/src/sw/browser/presentation/WriterTableDialog.tsx, apps/office/src/sw/source/core/doc/writer-attributes.test.ts, apps/office/src/sw/browser/presentation/native-table-properties-reset.test.tsx, apps/office/src/sw/browser/presentation/native-table-column-page.test.tsx, apps/office/src/sw/source/uibase/wrtsh/native-table-name-history.test.ts, apps/office/src/sw/browser/presentation/native-table-name-page.test.tsx, apps/office/e2e/native-table-name.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Only four exact old source-backed test migrations: generic format blank-name prohibition removed; two obsolete Properties empty-name error cases use ASCII-space invalid names; one failed live-style test explicitly requests native broadcast=true, preserving every assertion. Every unrelated assertion and all other577 acceptance files remain unchanged. Preserve existing metadata fields/statuses/registered deviations; add new source/acceptance linkage without promotion. Formulas/charts/mail merge and full frame attribute collection remain unverified residuals. Six initial static gates once, failed or changed-input closure only; ONE full upstream-absent runtime profile, then original failures or genuinely new cases only, no passing replay. Strict current-source actual100 app/inventory coverage by whole identical source/maps or contiguous complete mapped units; never fabricate counters/exclude tests/promote skips. Source gates after vendor restoration. Raw snapshots/results/maps in ignored dependency cache, AP bounded English md/json only. Same-agent EVALUATOR not independent, canonical verify exact implementation SHA/finish and complete-prefix parent append. No network/global access/subagents. Goal remains ACTIVE. Additional exact caller migration under standing source-parity authorization: apps/office/src/sw/browser/presentation/writer-style-selector.test.tsx. New geometry guard case retains existing rejection for empty native table graphs. New Chromium continued-edit fixture uses the established explicit DOM end caret instead of treating End as caret setup; every assertion is retained. Actual Home/End behavior remains an unverified follow-up. No new production path or verification change.

## Plan

Iteration214 under standing user authorization. One CODER leaf restores native frame-format table name ownership, SwDoc/SwEditShell SetTableName, name-only cursor-free rename undo with replay suppression, and editable Properties Name with saved-value deltas, ASCII-space page guard, focus, Reset/Cancel. Empty or colliding names use document unique names; direct API retains raw names. Approved semantic paths: apps/office/src/sw/source/core/attr/format.ts, apps/office/src/sw/source/core/layout/atrfrm.ts, apps/office/src/sw/source/core/table/swtable.ts, apps/office/src/sw/source/core/doc/doc.ts, apps/office/src/sw/source/core/doc/docchart.ts, apps/office/src/sw/source/core/edit/edtab.ts, apps/office/src/sw/source/core/undo/docundo.ts, apps/office/src/sw/source/core/undo/undobj.ts, apps/office/src/sw/source/core/undo/untbl.ts, apps/office/src/sw/source/uibase/shells/tabsh.ts, apps/office/src/sw/source/ui/table/tabledlg.ts, apps/office/src/sw/browser/presentation/WriterTableDialog.tsx, apps/office/src/sw/source/core/doc/writer-attributes.test.ts, apps/office/src/sw/browser/presentation/native-table-properties-reset.test.tsx, apps/office/src/sw/browser/presentation/native-table-column-page.test.tsx, apps/office/src/sw/source/uibase/wrtsh/native-table-name-history.test.ts, apps/office/src/sw/browser/presentation/native-table-name-page.test.tsx, apps/office/e2e/native-table-name.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Only four exact old source-backed test migrations: generic format blank-name prohibition removed; two obsolete Properties empty-name error cases use ASCII-space invalid names; one failed live-style test explicitly requests native broadcast=true, preserving every assertion. Every unrelated assertion and all other577 acceptance files remain unchanged. Preserve existing metadata fields/statuses/registered deviations; add new source/acceptance linkage without promotion. Formulas/charts/mail merge and full frame attribute collection remain unverified residuals. Six initial static gates once, failed or changed-input closure only; ONE full upstream-absent runtime profile, then original failures or genuinely new cases only, no passing replay. Strict current-source actual100 app/inventory coverage by whole identical source/maps or contiguous complete mapped units; never fabricate counters/exclude tests/promote skips. Source gates after vendor restoration. Raw snapshots/results/maps in ignored dependency cache, AP bounded English md/json only. Same-agent EVALUATOR not independent, canonical verify exact implementation SHA/finish and complete-prefix parent append. No network/global access/subagents. Goal remains ACTIVE. Additional exact caller migration under standing source-parity authorization: apps/office/src/sw/browser/presentation/writer-style-selector.test.tsx. New geometry guard case retains existing rejection for empty native table graphs. New Chromium continued-edit fixture uses the established explicit DOM end caret instead of treating End as caret setup; every assertion is retained. Actual Home/End behavior remains an unverified follow-up. No new production path or verification change.

## Verify Steps

Run six initial static gates once: npm run format:check, lint, typecheck, check:dependencies, check:docs, check:file-size. Verify original577 acceptance files outside exact three source-backed migrations remain byte-identical, metadata prefixes/fields preserved, physical files below1000. Run ONE full upstream-absent build/app/inventory/infrastructure/Chromium profile, then only original failures or genuinely new cases. Require native name owner, no-op/empty/collision/raw names, name lookup recreation, cursor-free three-cycle undo/redo, replay suppression, grouped geometry history, ODT and continued edit; mounted and browser Name validation/focus/tab blocking/reset/cancel. Strict current-source actual100 app/inventory evidence without fabricated counters. Restore vendor then source/resource/provenance/inventory gates. Doctor/routing/diff and exact same-agent evaluator review, canonical verification, implementation-SHA finish and parent full-prefix append.

## Verification

Command: six initial static gates once and changed-input failures/closures; ONE full upstream-absent build/app/inventory/infrastructure/Chromium profile, then original failures or one genuinely new geometry-guard case only; source gates after vendor restoration, strict source-bound coverage/case/scope/AP/governance and exact implementation review.
Result: PASS approved native table-name ownership, Properties application and undo scope.
Evidence: implementation c0168febda45e1cdce445aa9fdaf4c687770576c;13509app110inventory14infrastructure274Chromium resolved,0unresolved0passing replay;18app2inventory focused skip observations retained, subset threshold exit1 recorded. Actual100 all four app/inventory metrics across292/38whole current sources/maps plus10complete prior app declaration/body/ancestor certificates,0post-profile production changes. Raw negative painter aggregate retained and entire prior identical verified entry selected. See exact-sha-review.json, final-coverage.json, case-census.json, scope-final.json, source-review.json and quality/20261007-123048063-recovery-context/quality-report.json.21semantic paths,573prior test files identical4exact migrations3newfiles; all293prior metadata fields/defaults/exceptions preserved,2new source records unverified. Four priority bullet cases pass.
Scope: one native frame name owner; raw/no-op/empty/collision names, name lookup after recreation, missing lookup and cursor-free history, recording suppression, changed-only saved Name page/reset/ASCII-space guard, grouped geometry, three Undo/Redo, ODT/reopen/continued edit. Same current-agent EVALUATOR explicitly not independent. Full frame/allocator/formula/chart/NameChanged/modal and browser Home/End remain unverified; whole parity parent/goal ACTIVE.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-07T12:35:09.698Z — VERIFY — ok

By: CODER

Note: Native frame table names, changed-only Properties and cursor-free lookup undo verified at c0168febda45; 13509 app, 110 inventory, 14 infrastructure, 274 Chromium resolved; source-bound actual100; ONE upstream-absent full run and failed/new-only closure, no passing replay. Same current-agent evaluator PASS, explicitly not independent. Full parity remains unverified.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-07T12:34:58.868Z, excerpt_hash=sha256:bed90887d708208868714371d54254320eb82f78e56839e7d16d6325c089995e

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610071137-8RTP52/blueprint/resolved-snapshot.json
- old_digest: 968c963501a0cb8de16ee40d5a6891280c7a6a05ab2747614c7e8dc00536746b
- current_digest: 968c963501a0cb8de16ee40d5a6891280c7a6a05ab2747614c7e8dc00536746b
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610071137-8RTP52

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610071137-8RTP52
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only the semantic implementation commit if regression is discovered; retain truthful evidence and registered exceptions.

## Findings

Pinned native docchart.cxx uses frame-format identity, collision/empty unique-name substitution and old/new-name lookup undo in untbl.cxx. tabledlg.cxx emits changed names only and blocks ASCII spaces with Name focus. Project currently has no editable Properties Name input. Formulas/charts/mail merge remain unimplemented and unverified; this leaf does not invent those layers.

Iteration214 verified closure. Implementation c0168febda45e1cdce445aa9fdaf4c687770576c restores native table naming through SwFrameFormat/SwFormat, SwDoc.SetTableName, edit shell delegation and name-only SwUndoRenameTable. Removed the duplicate private table-name string and fabricated blank-name guard. Native frame identity owns raw names, broadcast defaults false, same-name is a no-op, empty/collision uses existing unique naming. Undo resolves the current live frame by name and retains no table pointer or cursor; missing lookup is a no-op. Undo/Redo temporarily disable action recording and restore the original flag. Properties apply only a changed native Name item in the original geometry group. SwFormatTablePage owns saved/raw Name, reset and ASCII-space departure guard; browser focus, tab blocking, reset/cancel, raw empty/tab/NBSP, geometry rejection, original owners, recreation, three Undo/Redo, ODT reopen and continued edit pass. Full native frame attributes, allocator and informational-modal behavior are not claimed.

Six initial static gates once: four PASS, format/typecheck initially failed for newly authored fixtures; corrected actual revision/Close APIs, cursor construction and new-file formatting. Only changed-input scoped format/eslint/typecheck closures afterward. ONE full upstream-absent build/app/inventory/infrastructure/Chromium profile:13506app PASS2FAIL of13508,109inventory PASS1FAIL of110,14infrastructure PASS,272Chromium PASS2FAIL of274. An unchanged desktop imported-document case initially timed out and passed its unchanged original-failure-only retry; no save/open/recovery source changed. Live style rename required explicit broadcast=true under native default false; only that call changed, every assertion retained. Metadata records required native lexical ordering; sorted only, unchanged failed inventory case passed. Both new Name browser cases failed final caret setup with End and passed after established explicit DOM end-caret setup, every assertion unchanged; actual browser Home/End remains unverified. One genuinely new mounted rowless-geometry guard acceptance case passed. Narrow closure:3app PASS18SKIP,1inventory PASS2SKIP,2Chromium PASS. App/inventory commands exit1 solely from subset global coverage thresholds, retained honestly. Actual union13509app110inventory14infrastructure274Chromium PASS,0unresolved0passing replay. All12production paths byte-identical full/build/browser/closure/current commit; runtime terminal and vendor restored finally before source/AP writes.

Strict current-source app actual100 L16314S17905F4158B13375 across292whole current source/maps plus10 complete prior-region certificates; inventory100 L1464S1523F384B1081 across38whole files. Prior-region transfers require verified prior source hash, identical contiguous bytes, complete function declarations/bodies, enclosing branches and all locations. No partial post-profile production transfers, source changes, fabricated counters, exclusions or skip promotion. Raw V8 inferred painter else aggregate-36 preserved and rejected; entire prior verified current-identical source/maps/counters selected for the unchanged painter entry, never individual clamp. App map/proof a67f6b226c823f5a5a67d88f2b4c50cbd1a9b72773d9b836d6e40438ffa0873e/c30f917e541214567d3040c3ea74502070a3d1cce08c4934ace733f933bbfafe; inventory 53bf9c1555003dcdd974f4c2f124ac0e597c38d24244cb81ed39d6051bcdc8bf/e4a57c478310d6bacc7a9b7d4d3d11b0a37bc5c7872abb8e69eae124af3b57c6. Coverage/case/scope reports reconstructed byte-identically after implementation commit; all current counters finite/nonnegative and whole fallback bound. Same current agent EVALUATOR explicitly not independent exact-SHA PASS, quality/20261007-123048063-recovery-context/quality-report.json.

Scope21approved21actual:12production4exact source-backed old acceptance migrations3newfiles2metadata. Prior577acceptance files573byte-identical4exact migration intervals, current580. Exact reconstruction preserves all unrelated assertions/bytes with repository Prettier settings. All293prior metadata complete fields/prefixes/statuses/defaults/registered save/open/recovery deviations retained. Added2source-native atrfrm/docchart records as unverified, current295; no blanket promotion. Pinned source8files libreoffice-26.8.0.2 9bc445578031fecf56086729d8e4940c77e14d65 reviewed with bounded hashes/locations. Five source gates after restoration PASS; final metadata formatting and only3changed-input provenance/invariants/parity gates PASS. JSDoc and physical changed files max990lines PASS; doctor0errors2knownwarnings, routing/diff PASS. AP census5317files at inspection,0forbidden upstream source/Python/raw maps/results/snapshots; bounded English json/md, raw evidence only ignored project dependency cache. Complete585271-character parent Findings SHA c75cbad1fffd8967f011799b9fe521e303d4b5ef0599055b17f9db57f33fbf6e preserved. Four priority bullet body/cell1280/390 full Chromium regressions PASS; original overlap fix unchanged. Deferred stash untouched.

Tool/audit corrections: two JS construction syntax failures before execution, no side effects; unmatched atomic patch changed nothing, route recomputed and smaller patch applied; read-only guessed paths/globs missing had no mutation. Scope helper name shadowing caused a pre-write path error; renamed preservePrefix and exact audit passed. AP require-clean first rejected unstaged semantic paths, then exact21 paths staged; hook rejected code scope, changed to allowed parity scope. No disabled hooks, source changes or passing runtime replay for those corrections.

Residual: formulas/OLE/chart references, numeric suffix/mail-merge allocator, full/default/unused/all frame ownership, native NameChanged hint granularity and native informational-message modal composition/dismissal remain unverified. Existing inline React validation presentation is bounded behavior only. Browser End failed to establish expected end caret in the new fixture; Home/End is a separate source audit. Whole kernel/browser parity remains unverified, parent/goal ACTIVE. Final Findings/Verification precede canonical verify; finish actual implementation SHA.
