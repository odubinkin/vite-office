---
id: "202610070602-3D968G"
title: "Replace aggregate table border widgets with native six-line border page"
result_summary: "Implemented native FrameSelector/SvxBorderTabPage six-edge selection, styles/presets/thickness, independent distances, Reset and info-only FillItemSet;13451app110inventory14infrastructure258Chromium PASS, source-bound app/inventory100%, no passing replay. Whole kernel/browser parity remains unverified and parent goal active."
status: "DONE"
priority: "high"
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
  updated_at: "2026-10-07T06:03:28.484Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-07T07:09:39.428Z"
  updated_by: "CODER"
  note: "PASS exact implementation 61d4c2617649b72096cca1f2d40df9d74d9dcb3f: approved native six-line border page; actual13451app110inventory14infrastructure258Chromium; source-bound app/inventory100%; one full upstream-absent profile, failed/new-only closures, no passing replay. Final Findings/Verification precede this canonical record. Same-agent EVALUATOR pass explicitly not independent; whole parity remains active."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-07T07:08:56.832Z"
  updated_by: "EVALUATOR"
  note: "Same current agent EVALUATOR exact implementation 61d4c2617649b72096cca1f2d40df9d74d9dcb3f passes approved native six-line border-page scope; explicitly not independent."
  evaluated_sha: "61d4c2617649b72096cca1f2d40df9d74d9dcb3f"
  blueprint_digest: "c2c868f664cf8469b4ea2293f3e693bcbbb2c27ad74e4edaf1232f26bd329ac5"
  evidence_refs:
    - ".agentplane/tasks/202610070602-3D968G/README.md"
    - ".agentplane/tasks/202610070602-3D968G/quality/20261007-070856832-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610070602-3D968G/quality/20261007-070856832-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610070602-3D968G/quality/20261007-070856832-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610070602-3D968G/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610070602-3D968G/evidence/exact-sha-review.json"
    - ".agentplane/tasks/202610070602-3D968G/evidence/scope-final.json"
    - ".agentplane/tasks/202610070602-3D968G/evidence/final-coverage.json"
    - ".agentplane/tasks/202610070602-3D968G/evidence/case-census.json"
    - ".agentplane/tasks/202610070602-3D968G/evidence/source-review.json"
  findings:
    - "Native FrameSelector and SvxBorderTabPage own six edges, native tri-state selection, source presets and styles, independent four distances, Reset and info-only FillItemSet. React renders and dispatches the native owner, including source pointer multi-hit and silent focus behavior."
    - "Exact source, complete old acceptance migrations, all prior metadata fields and registered deviations are preserved. Current source-bound actual app and inventory counters and case census reconstruct exactly without passing test replay."
commit:
  hash: "61d4c2617649b72096cca1f2d40df9d74d9dcb3f"
  message: "🚧 3D968G code: use native six-line table border page"
comments:
  -
    author: "CODER"
    body: "Start: replace aggregate table border widgets with source-owned native FrameSelector and SvxBorderTabPage under standing iterative native architecture authorization, preserving registered I/O deviations."
  -
    author: "CODER"
    body: "Verified: native six-line border page and React interactions match approved source scope; one full upstream-absent profile and failed/new-only closures; exact same-agent review PASS."
events:
  -
    type: "status"
    at: "2026-10-07T06:03:29.146Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: replace aggregate table border widgets with source-owned native FrameSelector and SvxBorderTabPage under standing iterative native architecture authorization, preserving registered I/O deviations."
  -
    type: "verify"
    at: "2026-10-07T07:09:39.428Z"
    author: "CODER"
    state: "ok"
    note: "PASS exact implementation 61d4c2617649b72096cca1f2d40df9d74d9dcb3f: approved native six-line border page; actual13451app110inventory14infrastructure258Chromium; source-bound app/inventory100%; one full upstream-absent profile, failed/new-only closures, no passing replay. Final Findings/Verification precede this canonical record. Same-agent EVALUATOR pass explicitly not independent; whole parity remains active."
  -
    type: "status"
    at: "2026-10-07T07:09:57.985Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: native six-line border page and React interactions match approved source scope; one full upstream-absent profile and failed/new-only closures; exact same-agent review PASS."
doc_version: 3
doc_updated_at: "2026-10-07T07:09:57.987Z"
doc_updated_by: "CODER"
description: "Iteration208: source-owned FrameSelector and SvxBorderTabPage for existing Writer box/info line and distance items; native presets, selected-line style/color/width, independent padding/sync, Reset and exact separate FillItemSet deltas through actual properties. Remove aggregate CSS border/padding controls; preserve registered I/O deviations and whole goal."
sections:
  Summary: "Replace aggregate table border controls with source-owned native line selector and border tab page."
  Scope: |-
    Approved paths:
    - apps/office/src/svx/source/dialog/frmsel.ts
    - apps/office/src/cui/source/tabpages/border.ts
    - apps/office/src/sw/browser/presentation/WriterBorderPage.tsx
    - apps/office/src/sw/browser/presentation/WriterTableDialog.tsx
    - scripts/check-module-boundaries.mjs
    - scripts/check-module-boundaries.test.ts
    - apps/office/e2e/writer-table-properties-history.spec.ts
    - apps/office/e2e/writer-native-table-properties-reset.spec.ts
    - apps/office/e2e/writer-table-border-changed-items.spec.ts
    - apps/office/e2e/writer-table-border-common-state.spec.ts
    - apps/office/src/sw/browser/presentation/native-table-border-changed-items.test.tsx
    - apps/office/src/sw/browser/editor/native-cell-box-render.test.tsx
    - apps/office/src/sw/browser/presentation/native-table-column-page.test.tsx
    - apps/office/src/sw/browser/presentation/native-table-properties-reset.test.tsx
    - apps/office/src/sw/browser/presentation/native-table-border-common-state.test.tsx
    - apps/office/src/sw/browser/presentation/native-table-properties.test.tsx
    - apps/office/src/sw/browser/presentation/WriterTableDialog.test.tsx
    - apps/office/src/svx/source/dialog/native-frame-selector.test.ts
    - apps/office/src/cui/source/tabpages/native-border-page.test.ts
    - apps/office/src/sw/browser/presentation/native-border-page.test.tsx
    - apps/office/e2e/writer-native-border-page.spec.ts
    - docs/program/source-provenance.json
    - docs/program/parity/runtime-inventory.json

    Registered save/open/recovery deviations and every old metadata prefix retained. Full native shadow/diagonal/merge and Sfx orchestration remain unverified follow-ups.
  Plan: "One CODER leaf under standing explicit iterative native UI/refactoring authorization. Add native svx FrameSelector and cui SvxBorderTabPage owners, using existing SvxBorderLine/SvxBoxItem/SvxBoxInfoItem/SfxItemSet; preserve source tri-state six-line selection and native presets, mouse modifier/keyboard operations, uniform visible line defaults, selected-line style/color/thickness including DOUBLE_THIN rules, independent four padding fields and synchronize/source automatic distance transitions. Port represented Reset/FillItemSet with separate box/info outputs, including unchanged-box info-only deltas and mixed-distance normalization; no aggregate CSS shorthand output or change-only approximation. React only renders owner state and dispatches native handlers; remove old aggregate border/padding UI. Add precise cui/sw/svx inward module edges and keep reverse/browser bans, meaningful new boundary test. Existing old cases migrate only explicit removed-control actions/assertions to native controls and source-proven delta semantics; old graph/history/ODT/names/generators/defaults stay intact. Full shadow/merge/diagonal and Sfx orchestration outside existing represented owners remain unverified follow-ups, no full parity claim. Six initial static gates once; one full upstream-absent build/app/inventory/scripts/Chromium profile, failed or genuinely new only afterward. Actual100 coverage with exact current source and complete maps or contiguous declaration/body/branch/location proof; no exclusion or fake counters. Post-restoration source/scope/metadata/governance checks, exact same-agent EVALUATOR not independent; final docs before canonical verify, evidence tail/actual implementation finish and complete parent prefix append/clean state. No source/scripts/Python/raw results in AP, network/global/delegation."
  Verify Steps: |-
    1. Native FrameSelector matches six supported source edges, hide/show/dontcare cycles, current cached line/style/color, original selection/modifier behavior and keyboard neighbors/space; Reset copies owned input and uniform-line style/color selection, enabled inner flags and DISABLE policy. Tests cover independently styled lines, all six states, presets across cell/horizontal/vertical/table modes and item ownership.
    2. Native SvxBorderTabPage owns independent four distances, saved values/modified flags, synchronize and automatic default distance; native line styles/thickness list/custom/DOUBLE_THIN min and selected-line-only changes. FillItemSet reconstructs fresh box/info, source per-component validity and separate changed item publication, default-state clearing, mixed-distance zero normalization and info-only output even without box changes. Direct mounted and real Chromium1280/390 per-edge/inner/style/color/padding/reset/cancel/selection/3UndoRedo/ODT continued editing evidence required. Aggregate border/padding controls removed; every old acceptance case/generator and non-migration assertion retained under exact source-backed control/delta migrations; every old286 metadata prefix/default/status/exception retained.
    3. Initial format:check/lint/typecheck/check:dependencies/check:docs/check:file-size once; unchanged scoped JSDoc and actual physical<1000. One full upstream-absent local static build/app/inventory/scripts/Chromium profile with finally restore, no upstream test invocation or concurrent mutation/audit. Only original failures/genuinely new cases afterward; actual100 app/inventory counters bound to whole identical source/maps or complete contiguous declarations/bodies/enclosing branches/all mapped locations, no manufactured coverage/exclusions/promoted skips or passing/full replay.
    4. After vendor restoration source resource generation--check/tree/provenance/invariants/parity, strict scope/source-backed migration/metadata audits, doctor/routing/diff and bounded English artifact census0forbidden. Same current-agent exact implementation EVALUATOR explicitly not independent; final Findings/Verification before canonical verify, finish actual implementation SHA with clean tracked/all state. Parent full Findings prefix preserved on append; parent/goal full parity remain active.
  Verification: |-
    Command: initial six static gates once; failed/changed-input closures only; ONE full upstream-absent profile and original-failure/genuinely-new-only closures; source gates after vendor restoration; changed-file/docs/dependency/format closures; exact source/scope/metadata/counter/case/governance review.
    Result: PASS approved native six-line border-page scope.
    Evidence: implementation 61d4c2617649b72096cca1f2d40df9d74d9dcb3f;13451app110inventory14infrastructure258Chromium cases,0unresolved0passing replay;116/2focused skip observations remain skipped; actual100% all four app/inventory metrics with strict current-source/map counter binding. See evidence/exact-sha-review.json, final-coverage.json, case-census.json, scope-final.json, source-review.json and canonical quality report. All runtime checks without vendor, finally restored. Original559contracts and286metadata prefixes/statuses/defaults/registered exceptions retained through precise source-backed migrations. Four current priority bullet Chromium regressions PASS without replay.
    Scope: native six-edge selector, presets/styles/thickness, independent four distances, Reset/FillItemSet including info-only output and React behavior. Exact VCL geometry, full widget units, shadow/merge/theme/SfxTabPage infrastructure, RTL/vertical/follow/shared-format and whole parity remain unverified. Same current-agent evaluator, explicitly not independent; parent/goal ACTIVE.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-07T07:09:39.428Z — VERIFY — ok

    By: CODER

    Note: PASS exact implementation 61d4c2617649b72096cca1f2d40df9d74d9dcb3f: approved native six-line border page; actual13451app110inventory14infrastructure258Chromium; source-bound app/inventory100%; one full upstream-absent profile, failed/new-only closures, no passing replay. Final Findings/Verification precede this canonical record. Same-agent EVALUATOR pass explicitly not independent; whole parity remains active.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-07T07:09:38.802Z, excerpt_hash=sha256:4b11797e1697a1cc802292f1dbd84732c04f04e1fce33eb37779515ddf37be9a

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610070602-3D968G/blueprint/resolved-snapshot.json
    - old_digest: c2c868f664cf8469b4ea2293f3e693bcbbb2c27ad74e4edaf1232f26bd329ac5
    - current_digest: c2c868f664cf8469b4ea2293f3e693bcbbb2c27ad74e4edaf1232f26bd329ac5
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610070602-3D968G

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610070602-3D968G -m 🧩 3D968G task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this leaf implementation commit; retain immutable completed evidence and deliberate I/O deviations."
  Findings: |-
    Previous turn is concrete progress: iteration207 native common-border input DONE, implementation ae01a2e08e28a876ea8514b837c18d345920429d, evidence tail ee6fe8908cd84307b2c313a74b0f1edb14f1cdc5, close bbc3283eeeb6a7c0a0f7a7056af1073467e264e5, parent progress079a06d1bbf9. Current main clean. Existing native box/info supports six edges/four distances but UI still has aggregate padding and three CSS border options; source border.cxx/frmsel.cxx defines actual owner behavior. Source FillItemSet can publish info without changed box and normalize invalid distance even without edited widgets, unlike the current changed-only approximation. This leaf replaces that mechanism rather than adding another compatibility layer. Full border/shadow/merge/orchestration and whole parity remain unverified. No subagents/network/global access.

    Iteration208 final closure. Implementation 61d4c2617649b72096cca1f2d40df9d74d9dcb3f replaces aggregate border/padding drafts with native FrameSelector and SvxBorderTabPage owners. Six enabled edges retain source selection and Show/DontCare/Hide transitions, cached cloned lines, pointer multi-hit, silent pointer focus, keyboard neighbors and source empty-selector false result. The page owns native preset matrices, source style ordering, thickness/custom limits and independently saved/modified four distances with Synchronize. Reset captures original SfxItemSet; FillItemSet clones native box/info, publishes source validity and info-only changes, and clears default-equal output. React renders native state and forwards interactions; no scalar first-cell draft reconstruction.

    Command: initial six static gates once, failed or changed-input static closures only; ONE full upstream-absent build/app/inventory/infrastructure/Chromium profile; original-failure and genuinely-new-only closures. Result: PASS approved scope. Current union13451app110inventory14infrastructure258Chromium,0unresolved0passing runtime replay;116app/2inventory focused skip observations remain skipped. Filtered app/inventory command exit1 was subset globalcoverage threshold, not an actual case failure. A new Chromium focus grep first discovered0cases and was corrected to run only the2genuinely new cases. Initial newly authored empty-arrow assertion was corrected true to source false; unchanged complete remainder and a genuinely new all-four-arrow trace bind the correction without replaying a previously passing case. Build/runtime checks all ran without vendor, finally restored. Source gates ran only after restoration. Final scoped formatting, lint/typecheck, provenance/parity/dependencies, JSDoc and physical<1000 budget PASS. Doctor0errors2knownwarnings; routing/diff PASS.

    Strict source-bound actual app coverage100%: L16049 S17620 F4091 B13207 across286covered files. Inventory100% L1464 S1523 F384 B1081 across38files. Whole identical source/maps or complete contiguous declaration/body/enclosing branch/all locations were certified; no fabricated counters/exclusions/skippromotion. App final SHA21d09911e56aad7a99d125f91f85f4e395ca248df581cc31de8fc77db9499096/proof61ed067187880c78aa79cc3745fe09e2c033fc0941c4f165dab7bf5067af84bb; inventory final4d28303359a40d81f6561b021418d1a053cc09033832ea09913dd8fc3d61d33d/proofe4a57c478310d6bacc7a9b7d4d3d11b0a37bc5c7872abb8e69eae124af3b57c6. Exact implementation review reconstructed counters/census identically without runtime replay.

    Scope23approved paths exactly.559old acceptance files547byte-identical+11precise native control/delta/metric migrations+1infrastructure new-case addition;4new files=563. Complete original case definitions/generators and non-migration tokens retained.286metadata complete old fields/prefixes/statuses/defaults and registered I/O/recovery exceptions preserved;3new=289, no semantic promotion. Migrationproof6a18d2f8c4bca1c8b12079567220577c4d4e76df2b198b2f96fb191ba1324042; structureproof4f230eb8078d0963e0def3885883467c73014abe8ccf1f963abf7c18e08ecda7. Same current-agent EVALUATOR exactSHA PASS, explicitly not independent, evidence/exact-sha-review.json and quality/20261007-070856832-recovery-context/quality-report.json. AP contains bounded English summaries only:0forbidden source/Python artifacts; raw sources/scripts/maps/results remain ignored project cache.

    Priority bullet correction e625c6f3b56279490cd3fc9292afa2a3ee2f4d92 is already on main. Current SwNumberPortion::Format comparison reconfirms occupied label width at least measured glyph plus native minimum distance. All four existing Chromium1280/390 body/cell overlap/nesting/large-label/wrap/edit/history regressions PASS in the original absence profile without replay.

    Residual: exact VCL pixel/arrow/diagonal geometry and full widget units, shadow/merge/theme controls and full SfxTabPage infrastructure, RTL/vertical/follow/shared-format and whole kernel/browser parity remain UNVERIFIED. Leaf scope complete; parent/goal ACTIVE. Entire prior557896-character parent Findings prefix SHA1d3320d0c5fa0682e1bdd5cc8075e9e0373efa520bcd7d15c60f71ecf9752266 must be preserved on append. Final prose precedes canonical verification; finish actual implementation SHA.
id_source: "generated"
---
## Summary

Replace aggregate table border controls with source-owned native line selector and border tab page.

## Scope

Approved paths:
- apps/office/src/svx/source/dialog/frmsel.ts
- apps/office/src/cui/source/tabpages/border.ts
- apps/office/src/sw/browser/presentation/WriterBorderPage.tsx
- apps/office/src/sw/browser/presentation/WriterTableDialog.tsx
- scripts/check-module-boundaries.mjs
- scripts/check-module-boundaries.test.ts
- apps/office/e2e/writer-table-properties-history.spec.ts
- apps/office/e2e/writer-native-table-properties-reset.spec.ts
- apps/office/e2e/writer-table-border-changed-items.spec.ts
- apps/office/e2e/writer-table-border-common-state.spec.ts
- apps/office/src/sw/browser/presentation/native-table-border-changed-items.test.tsx
- apps/office/src/sw/browser/editor/native-cell-box-render.test.tsx
- apps/office/src/sw/browser/presentation/native-table-column-page.test.tsx
- apps/office/src/sw/browser/presentation/native-table-properties-reset.test.tsx
- apps/office/src/sw/browser/presentation/native-table-border-common-state.test.tsx
- apps/office/src/sw/browser/presentation/native-table-properties.test.tsx
- apps/office/src/sw/browser/presentation/WriterTableDialog.test.tsx
- apps/office/src/svx/source/dialog/native-frame-selector.test.ts
- apps/office/src/cui/source/tabpages/native-border-page.test.ts
- apps/office/src/sw/browser/presentation/native-border-page.test.tsx
- apps/office/e2e/writer-native-border-page.spec.ts
- docs/program/source-provenance.json
- docs/program/parity/runtime-inventory.json

Registered save/open/recovery deviations and every old metadata prefix retained. Full native shadow/diagonal/merge and Sfx orchestration remain unverified follow-ups.

## Plan

One CODER leaf under standing explicit iterative native UI/refactoring authorization. Add native svx FrameSelector and cui SvxBorderTabPage owners, using existing SvxBorderLine/SvxBoxItem/SvxBoxInfoItem/SfxItemSet; preserve source tri-state six-line selection and native presets, mouse modifier/keyboard operations, uniform visible line defaults, selected-line style/color/thickness including DOUBLE_THIN rules, independent four padding fields and synchronize/source automatic distance transitions. Port represented Reset/FillItemSet with separate box/info outputs, including unchanged-box info-only deltas and mixed-distance normalization; no aggregate CSS shorthand output or change-only approximation. React only renders owner state and dispatches native handlers; remove old aggregate border/padding UI. Add precise cui/sw/svx inward module edges and keep reverse/browser bans, meaningful new boundary test. Existing old cases migrate only explicit removed-control actions/assertions to native controls and source-proven delta semantics; old graph/history/ODT/names/generators/defaults stay intact. Full shadow/merge/diagonal and Sfx orchestration outside existing represented owners remain unverified follow-ups, no full parity claim. Six initial static gates once; one full upstream-absent build/app/inventory/scripts/Chromium profile, failed or genuinely new only afterward. Actual100 coverage with exact current source and complete maps or contiguous declaration/body/branch/location proof; no exclusion or fake counters. Post-restoration source/scope/metadata/governance checks, exact same-agent EVALUATOR not independent; final docs before canonical verify, evidence tail/actual implementation finish and complete parent prefix append/clean state. No source/scripts/Python/raw results in AP, network/global/delegation.

## Verify Steps

1. Native FrameSelector matches six supported source edges, hide/show/dontcare cycles, current cached line/style/color, original selection/modifier behavior and keyboard neighbors/space; Reset copies owned input and uniform-line style/color selection, enabled inner flags and DISABLE policy. Tests cover independently styled lines, all six states, presets across cell/horizontal/vertical/table modes and item ownership.
2. Native SvxBorderTabPage owns independent four distances, saved values/modified flags, synchronize and automatic default distance; native line styles/thickness list/custom/DOUBLE_THIN min and selected-line-only changes. FillItemSet reconstructs fresh box/info, source per-component validity and separate changed item publication, default-state clearing, mixed-distance zero normalization and info-only output even without box changes. Direct mounted and real Chromium1280/390 per-edge/inner/style/color/padding/reset/cancel/selection/3UndoRedo/ODT continued editing evidence required. Aggregate border/padding controls removed; every old acceptance case/generator and non-migration assertion retained under exact source-backed control/delta migrations; every old286 metadata prefix/default/status/exception retained.
3. Initial format:check/lint/typecheck/check:dependencies/check:docs/check:file-size once; unchanged scoped JSDoc and actual physical<1000. One full upstream-absent local static build/app/inventory/scripts/Chromium profile with finally restore, no upstream test invocation or concurrent mutation/audit. Only original failures/genuinely new cases afterward; actual100 app/inventory counters bound to whole identical source/maps or complete contiguous declarations/bodies/enclosing branches/all mapped locations, no manufactured coverage/exclusions/promoted skips or passing/full replay.
4. After vendor restoration source resource generation--check/tree/provenance/invariants/parity, strict scope/source-backed migration/metadata audits, doctor/routing/diff and bounded English artifact census0forbidden. Same current-agent exact implementation EVALUATOR explicitly not independent; final Findings/Verification before canonical verify, finish actual implementation SHA with clean tracked/all state. Parent full Findings prefix preserved on append; parent/goal full parity remain active.

## Verification

Command: initial six static gates once; failed/changed-input closures only; ONE full upstream-absent profile and original-failure/genuinely-new-only closures; source gates after vendor restoration; changed-file/docs/dependency/format closures; exact source/scope/metadata/counter/case/governance review.
Result: PASS approved native six-line border-page scope.
Evidence: implementation 61d4c2617649b72096cca1f2d40df9d74d9dcb3f;13451app110inventory14infrastructure258Chromium cases,0unresolved0passing replay;116/2focused skip observations remain skipped; actual100% all four app/inventory metrics with strict current-source/map counter binding. See evidence/exact-sha-review.json, final-coverage.json, case-census.json, scope-final.json, source-review.json and canonical quality report. All runtime checks without vendor, finally restored. Original559contracts and286metadata prefixes/statuses/defaults/registered exceptions retained through precise source-backed migrations. Four current priority bullet Chromium regressions PASS without replay.
Scope: native six-edge selector, presets/styles/thickness, independent four distances, Reset/FillItemSet including info-only output and React behavior. Exact VCL geometry, full widget units, shadow/merge/theme/SfxTabPage infrastructure, RTL/vertical/follow/shared-format and whole parity remain unverified. Same current-agent evaluator, explicitly not independent; parent/goal ACTIVE.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-07T07:09:39.428Z — VERIFY — ok

By: CODER

Note: PASS exact implementation 61d4c2617649b72096cca1f2d40df9d74d9dcb3f: approved native six-line border page; actual13451app110inventory14infrastructure258Chromium; source-bound app/inventory100%; one full upstream-absent profile, failed/new-only closures, no passing replay. Final Findings/Verification precede this canonical record. Same-agent EVALUATOR pass explicitly not independent; whole parity remains active.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-07T07:09:38.802Z, excerpt_hash=sha256:4b11797e1697a1cc802292f1dbd84732c04f04e1fce33eb37779515ddf37be9a

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610070602-3D968G/blueprint/resolved-snapshot.json
- old_digest: c2c868f664cf8469b4ea2293f3e693bcbbb2c27ad74e4edaf1232f26bd329ac5
- current_digest: c2c868f664cf8469b4ea2293f3e693bcbbb2c27ad74e4edaf1232f26bd329ac5
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610070602-3D968G

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610070602-3D968G -m 🧩 3D968G task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this leaf implementation commit; retain immutable completed evidence and deliberate I/O deviations.

## Findings

Previous turn is concrete progress: iteration207 native common-border input DONE, implementation ae01a2e08e28a876ea8514b837c18d345920429d, evidence tail ee6fe8908cd84307b2c313a74b0f1edb14f1cdc5, close bbc3283eeeb6a7c0a0f7a7056af1073467e264e5, parent progress079a06d1bbf9. Current main clean. Existing native box/info supports six edges/four distances but UI still has aggregate padding and three CSS border options; source border.cxx/frmsel.cxx defines actual owner behavior. Source FillItemSet can publish info without changed box and normalize invalid distance even without edited widgets, unlike the current changed-only approximation. This leaf replaces that mechanism rather than adding another compatibility layer. Full border/shadow/merge/orchestration and whole parity remain unverified. No subagents/network/global access.

Iteration208 final closure. Implementation 61d4c2617649b72096cca1f2d40df9d74d9dcb3f replaces aggregate border/padding drafts with native FrameSelector and SvxBorderTabPage owners. Six enabled edges retain source selection and Show/DontCare/Hide transitions, cached cloned lines, pointer multi-hit, silent pointer focus, keyboard neighbors and source empty-selector false result. The page owns native preset matrices, source style ordering, thickness/custom limits and independently saved/modified four distances with Synchronize. Reset captures original SfxItemSet; FillItemSet clones native box/info, publishes source validity and info-only changes, and clears default-equal output. React renders native state and forwards interactions; no scalar first-cell draft reconstruction.

Command: initial six static gates once, failed or changed-input static closures only; ONE full upstream-absent build/app/inventory/infrastructure/Chromium profile; original-failure and genuinely-new-only closures. Result: PASS approved scope. Current union13451app110inventory14infrastructure258Chromium,0unresolved0passing runtime replay;116app/2inventory focused skip observations remain skipped. Filtered app/inventory command exit1 was subset globalcoverage threshold, not an actual case failure. A new Chromium focus grep first discovered0cases and was corrected to run only the2genuinely new cases. Initial newly authored empty-arrow assertion was corrected true to source false; unchanged complete remainder and a genuinely new all-four-arrow trace bind the correction without replaying a previously passing case. Build/runtime checks all ran without vendor, finally restored. Source gates ran only after restoration. Final scoped formatting, lint/typecheck, provenance/parity/dependencies, JSDoc and physical<1000 budget PASS. Doctor0errors2knownwarnings; routing/diff PASS.

Strict source-bound actual app coverage100%: L16049 S17620 F4091 B13207 across286covered files. Inventory100% L1464 S1523 F384 B1081 across38files. Whole identical source/maps or complete contiguous declaration/body/enclosing branch/all locations were certified; no fabricated counters/exclusions/skippromotion. App final SHA21d09911e56aad7a99d125f91f85f4e395ca248df581cc31de8fc77db9499096/proof61ed067187880c78aa79cc3745fe09e2c033fc0941c4f165dab7bf5067af84bb; inventory final4d28303359a40d81f6561b021418d1a053cc09033832ea09913dd8fc3d61d33d/proofe4a57c478310d6bacc7a9b7d4d3d11b0a37bc5c7872abb8e69eae124af3b57c6. Exact implementation review reconstructed counters/census identically without runtime replay.

Scope23approved paths exactly.559old acceptance files547byte-identical+11precise native control/delta/metric migrations+1infrastructure new-case addition;4new files=563. Complete original case definitions/generators and non-migration tokens retained.286metadata complete old fields/prefixes/statuses/defaults and registered I/O/recovery exceptions preserved;3new=289, no semantic promotion. Migrationproof6a18d2f8c4bca1c8b12079567220577c4d4e76df2b198b2f96fb191ba1324042; structureproof4f230eb8078d0963e0def3885883467c73014abe8ccf1f963abf7c18e08ecda7. Same current-agent EVALUATOR exactSHA PASS, explicitly not independent, evidence/exact-sha-review.json and quality/20261007-070856832-recovery-context/quality-report.json. AP contains bounded English summaries only:0forbidden source/Python artifacts; raw sources/scripts/maps/results remain ignored project cache.

Priority bullet correction e625c6f3b56279490cd3fc9292afa2a3ee2f4d92 is already on main. Current SwNumberPortion::Format comparison reconfirms occupied label width at least measured glyph plus native minimum distance. All four existing Chromium1280/390 body/cell overlap/nesting/large-label/wrap/edit/history regressions PASS in the original absence profile without replay.

Residual: exact VCL pixel/arrow/diagonal geometry and full widget units, shadow/merge/theme controls and full SfxTabPage infrastructure, RTL/vertical/follow/shared-format and whole kernel/browser parity remain UNVERIFIED. Leaf scope complete; parent/goal ACTIVE. Entire prior557896-character parent Findings prefix SHA1d3320d0c5fa0682e1bdd5cc8075e9e0373efa520bcd7d15c60f71ecf9752266 must be preserved on append. Final prose precedes canonical verification; finish actual implementation SHA.
