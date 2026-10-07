---
id: "202610071025-6RKM2B"
title: "Move native row height editing to its upstream dialog"
result_summary: "Native row height uses its source separate dialog with Fit to size and MINLAY bounds; Table Properties omits the extra height control, and menu refocus preserves selected row owners before native height dispatch."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 22
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-07T10:50:11.128Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-07T11:02:51.928Z"
  updated_by: "CODER"
  note: "Source row height slot20507 and separate Fixed/Minimum dialog preserve native current and selected row owners, menu refocus and history. Exact implementation c6c4eb13 reviewed by same agent, not independent; 13495 app 110 inventory 14 infrastructure 272 Chromium resolved, actual source-bound coverage 100 percent, zero passing replay. Final Findings and Verification precede this record."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-07T11:01:59.617Z"
  updated_by: "EVALUATOR"
  note: "Exact implementation c6c4eb13 source-bound native row height dialog checks pass; same current-agent EVALUATOR, not independent."
  evaluated_sha: "c6c4eb13d4d8ef76e817f097c4900253d196de64"
  blueprint_digest: "74b2f94ef27959e32cf27ed60433337679acc841c6909741cbfea93b41c1cebc"
  evidence_refs:
    - ".agentplane/tasks/202610071025-6RKM2B/README.md"
    - ".agentplane/tasks/202610071025-6RKM2B/quality/20261007-110159617-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610071025-6RKM2B/quality/20261007-110159617-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610071025-6RKM2B/quality/20261007-110159617-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610071025-6RKM2B/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610071025-6RKM2B/evidence/exact-sha-review.json"
  findings:
    - "13495 app, 110 inventory, 14 infrastructure and 272 Chromium cases resolved without passing replay; actual current-source app and inventory coverage 100 percent; 21 approved semantic paths and original metadata preserved. Scope audit reconstruction normalized path order only."
commit:
  hash: "c6c4eb13d4d8ef76e817f097c4900253d196de64"
  message: "🚧 6RKM2B code: edit native row height in its own dialog"
comments:
  -
    author: "CODER"
    body: "Start: Port separate native row height dialog and source command placement under standing iterative authorization; preserve original selection and history."
  -
    author: "CODER"
    body: "Verified: source native row height dialog and slot20507 preserve native row selection, Fixed and Minimum behavior, clipping, owners and undo through the generated menu; exact implementation reviewed with source-bound evidence and no passing replay."
events:
  -
    type: "status"
    at: "2026-10-07T10:25:49.053Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Port separate native row height dialog and source command placement under standing iterative authorization; preserve original selection and history."
  -
    type: "verify"
    at: "2026-10-07T11:02:51.928Z"
    author: "CODER"
    state: "ok"
    note: "Source row height slot20507 and separate Fixed/Minimum dialog preserve native current and selected row owners, menu refocus and history. Exact implementation c6c4eb13 reviewed by same agent, not independent; 13495 app 110 inventory 14 infrastructure 272 Chromium resolved, actual source-bound coverage 100 percent, zero passing replay. Final Findings and Verification precede this record."
  -
    type: "status"
    at: "2026-10-07T11:03:03.793Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: source native row height dialog and slot20507 preserve native row selection, Fixed and Minimum behavior, clipping, owners and undo through the generated menu; exact implementation reviewed with source-bound evidence and no passing replay."
doc_version: 3
doc_updated_at: "2026-10-07T11:03:03.794Z"
doc_updated_by: "CODER"
description: "Replace misplaced Table Properties height control with source SwTableHeightDlg and SetRowHeight menu command, preserving native row ownership and history."
sections:
  Summary: "Port existing row-height editing to the pinned source dialog and generated menu command."
  Scope: |-
    apps/office/src/sw/source/ui/table/rowht.ts
    apps/office/src/sw/browser/presentation/WriterRowHeightDialog.tsx
    apps/office/src/sw/browser/presentation/WriterTableDialog.tsx
    apps/office/src/sw/browser/presentation/writer-view.tsx
    scripts/generate-writer-ui-resources.ts
    apps/office/src/sw/uiconfig/swriter/writer-ui.generated.json
    apps/office/src/sw/browser/editor/native-table-selection.test.tsx
    apps/office/src/sw/browser/editor/native-row-frame-size.test.tsx
    apps/office/src/sw/browser/presentation/native-table-properties-reset.test.tsx
    apps/office/src/sw/browser/presentation/native-table-column-page.test.tsx
    apps/office/src/sw/browser/presentation/writer-view.test.tsx
    apps/office/src/sw/browser/presentation/native-table-height-delta.test.tsx
    apps/office/src/sw/browser/presentation/WriterTableDialog.test.tsx
    apps/office/e2e/writer-native-table-properties-reset.spec.ts
    apps/office/src/sw/source/ui/table/native-row-height-dialog.test.ts
    apps/office/src/sw/browser/presentation/native-row-height-dialog.test.tsx
    apps/office/e2e/writer-native-row-height-dialog.spec.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
    apps/office/src/sw/browser/editor/browser-writer-edit-window.ts
    scripts/libreoffice-inventory/parity-mapping-cli.test.ts
  Plan: |-
    One CODER leaf under standing iterative user authorization: port source SwTableHeightDlg height/fit draft and Apply using original SwWrtShell GetRowHeight/SetRowHeight, MINLAY23, native Fixed/Minimum and current/selected-row scope; render separate Row Height modal with Height and Fit to size, OK/Cancel, generated .uno:SetRowHeight source slot/menu Table > Size. Remove extra minimum-height field and rowHeight ingress from Table Properties; preserve separate existing direct API compatibility pending native item-set refactor. Migrate only affected obsolete control assertions to source-shaped command, preserve all other prior acceptance bytes and assertions; add native/mounted/real Chromium1280/390 Fixed/Minimum/Variable defaults, Cancel/escape, selected/current height mode, minimum admission, grouped history/three UndoRedo/original owners/continued editing/ODT reopen. Approved semantic paths: apps/office/src/sw/source/ui/table/rowht.ts, apps/office/src/sw/browser/presentation/WriterRowHeightDialog.tsx, apps/office/src/sw/browser/presentation/WriterTableDialog.tsx, apps/office/src/sw/browser/presentation/writer-view.tsx, scripts/generate-writer-ui-resources.ts, apps/office/src/sw/uiconfig/swriter/writer-ui.generated.json, apps/office/src/sw/browser/editor/native-table-selection.test.tsx, apps/office/src/sw/browser/editor/native-row-frame-size.test.tsx, apps/office/src/sw/browser/presentation/native-table-properties-reset.test.tsx, apps/office/src/sw/browser/presentation/native-table-column-page.test.tsx, apps/office/src/sw/browser/presentation/writer-view.test.tsx, apps/office/src/sw/browser/presentation/native-table-height-delta.test.tsx, apps/office/src/sw/browser/presentation/WriterTableDialog.test.tsx, apps/office/e2e/writer-native-table-properties-reset.spec.ts, apps/office/src/sw/source/ui/table/native-row-height-dialog.test.ts, apps/office/src/sw/browser/presentation/native-row-height-dialog.test.tsx, apps/office/e2e/writer-native-row-height-dialog.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Preserve all291 prior metadata complete fields/prefixes/status/defaults/registered save/open/recovery deviations; add precisely mapped rowht module and source-backed bounded notes, no blanket promotion. Six static gates once, ONE full upstream-absent build/app/inventory/infrastructure/Chromium profile, failure-only/genuinely-new closures. Strict100 actual current app/inventory coverage from whole byte-identical source and complete maps or complete contiguous declaration/body/enclosing branch/all mapped locations; no fabricated counters/exclusions/skip promotion/passing replay. Restore vendor finally before source gates. Unchanged JSDoc and actualphysical<1000, strict scope/artifact/governance and exact same-agent EVALUATOR review (not independent), final prose before canonicalverify, finish actual implementationSHA and parent complete prefix append, finalclean. No upstream sources/scripts/Python/raw maps/results in AP; no network/global/subagents. Help content integration/other unimplemented size slots/whole parity remain unverified, not deliberate exceptions.
    Source-backed required remediation within the same row-height task: include apps/office/src/sw/browser/editor/browser-writer-edit-window.ts. Menu restores focus before command dispatch; current browser HandleFocus repositions native cursor to stale focused paragraph. Native SwEditWin::GetFocus preserves shell cursor (edtwin.cxx5732-5745). Returning from a role=menu must preserve native cursor/table selection; add one genuinely-new mounted row-height regression only, do not replay passed tests. Full terminal profile found two original migrated app failures, one inventory lexical-order failure and two new Chromium CSS-device-quantization expectation failures. Resolve metadata insertion order while preserving complete old records by identity, correct only exact newfailed CSS expectation to chromium 1/64-pixel device value, retain all original assertions. ONE failed-only/new-case closure with rebuilt changed input; no second full profile.
    Include scripts/libreoffice-inventory/parity-mapping-cli.test.ts for exact source-backed command census migration55->56 because generated SetRowHeight adds one existing height-operation command; all other report fields and assertions unchanged. New additional refocus regression remains genuinely unexecuted (initial closure mistakenly nested it under filtered-out callback); move only its added definition to top level, keep initial four passing definitions byte-identical. Initial full and closure1 terminal, vendor restored, no passing replay. Final approved semantic21paths/old migration9files/564 prior byte-identical/576 total acceptance.
  Verify Steps: |-
    1. Initial six static gates once: npm run format:check, lint, typecheck, check:dependencies, check:docs, check:file-size. Unchanged JSDoc validator and actual physical line count for changed sources.
    2. ONE full upstream-absent profile: test:static build; app coverage; inventory coverage; infrastructure source/resource/boundary tests; Chromium. Restore vendor in finally. Failed-only or genuinely-new closure, no passing replay. Preserve every assertion outside exact obsolete-control migration intervals. Verify native Fixed/Minimum/Variable input, MINLAY23, separate menu/dialog, original current/selected row owners, Cancel/Escape/Enter, Fit checkbox, clipping, three Undo/Redo, ODT roundtrip, continued edits.
    3. Strict actual100 app/inventory source-bound coverage, finite nonnegative counters, whole byte-identical source/maps or complete contiguous mapped declaration/body/branch transfer. No exclusions, counter fabrication, skips promotion.
    4. After restoration source generation --check/tree/provenance/invariants/parity gates. Exact scope, all291 old metadata fields/prefixes/registered deviations, all573 old acceptance files except approved assertion migrations; no forbidden AP content. Governance and exact implementationSHA same-agent EVALUATOR (not independent). Final Findings/Verification before canonicalverify. Close actual implementationSHA then parent complete prefix append and clean state.
  Verification: |-
    Command: six initial static gates once; failed/changed-input closures only; ONE full upstream-absent build/app/inventory/infrastructure/Chromium profile followed only original failures or genuinely new case. Source gates after restoration; source-bound actual coverage/case/scope/metadata/artifact/governance and exact implementationSHA review.
    Result: PASS source-shaped separate row height command/dialog and native selection preservation.
    Evidence: implementation c6c4eb13d4d8ef76e817f097c4900253d196de64;13495app110inventory14infrastructure272Chromium resolved,0unresolved0passing replay. Actual100 app/inventory all four metrics with complete current source/map bindings and one full contiguous transfer; invalid negative raw painter counters retained and whole verified prior identical map selected.35app/4inventory skipped observations retained. See exact-sha-review.json, final-coverage.json, case-census.json, scope-final.json, source-review.json and quality/20261007-110159617-recovery-context/quality-report.json.21approved semantic paths;564prior test files byte-identical,9approved migrations,3new; all291prior metadata records preserved plus2new. Four priority bullet regressions pass.
    Scope: native Fixed/Minimum/Variable capture, MINLAY bounds, source menu/modal, native current/selected owners/cursor, Cancel/Escape/Enter, fit checkbox/clipping, three Undo/Redo, ODT reopening and continued edits. Same current-agent EVALUATOR explicitly not independent. Full Help/unit preferences/modal lifecycle/other size commands/direct minRowHeight compatibility and whole parity remain unverified; parent/goal ACTIVE.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-07T11:02:51.928Z — VERIFY — ok

    By: CODER

    Note: Source row height slot20507 and separate Fixed/Minimum dialog preserve native current and selected row owners, menu refocus and history. Exact implementation c6c4eb13 reviewed by same agent, not independent; 13495 app 110 inventory 14 infrastructure 272 Chromium resolved, actual source-bound coverage 100 percent, zero passing replay. Final Findings and Verification precede this record.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-07T11:02:51.446Z, excerpt_hash=sha256:e985eb2962e9d10262eafd168176e4163d3c2b0af6e73dac63221d825431ee15

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610071025-6RKM2B/blueprint/resolved-snapshot.json
    - old_digest: 74b2f94ef27959e32cf27ed60433337679acc841c6909741cbfea93b41c1cebc
    - current_digest: 74b2f94ef27959e32cf27ed60433337679acc841c6909741cbfea93b41c1cebc
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610071025-6RKM2B

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610071025-6RKM2B -m 🧩 6RKM2B task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task implementation commit; preserve previously registered save/open/recovery exceptions and task history."
  Findings: |-
    Pinned local rowht.cxx35-67: captures GetRowHeight, fit defaults type!=Fixed, MINLAY23, Apply Fixed or Minimum through SetRowHeight. tabsh.cxx910 opens independent dialog and Apply only RET_OK. rowheight.ui has Height/Fit to size/OK/Cancel/Help; Table Properties Text Flow has no row-height field. Source menubar TableAutoFitMenu > SetRowHeight, SDI FN_TABLE_SET_ROW_HEIGHT. Help system and other unimplemented size commands remain unverified.

    Iteration212 verified closure. Implementation c6c4eb13d4d8ef76e817f097c4900253d196de64 ports source SwTableHeightDlg: capture native GetRowHeight, MINLAY23, Fixed default and Minimum when Fit to size is checked, native SetRowHeight on accept. Generated source slot20507 appears at Table > Size > Row Height, with Height and Fit to size modal. Table Properties no longer contains the extra Text Flow minimum-height control. Native current/selected row owners, cursor, bounds, Cancel/Escape/Enter, clipping, three Undo/Redo, ODT roundtrip and continued editing verified. Menu focus restoration now preserves shell selection, following edtwin.cxx GetFocus rather than resolving stale DOM paragraph coordinates. Pinned source libreoffice-26.8.0.2 9bc445578031fecf56086729d8e4940c77e14d65; source-review.json binds eleven upstream files and seven production files.

    Initial six static gates once; failed-only and changed-input static closures passed. ONE full upstream-absent runtime profile then original failures or genuinely new case only: actual13495app110inventory14infrastructure272Chromium PASS,0unresolved0passing replay. Initial two app failures exposed menu focus repositioning; exact failures passed after source-shaped focus fix. Inventory initial ordering failure fixed, then source command census exact55-to56 literal updated and same failure passed. Two new Chromium CSS expectations corrected exact40.0667px-to40.0625px device quantization interval; all other bytes/assertions retained. New mouse-selection regression initially nested under filtered-out callback and did not execute; skip retained, moved only new case top-level with original four passing mounted definitions token-identical. First actual execution failed guessed Paragraph1 body label; exact label corrected to actual Writer document text and only that failure passed. Focused exits1 from global coverage thresholds retained honestly; app35/inventory4skip observations remain skipped. All handles terminal, vendor restored finally before source or AP mutations.

    Strict actual current-source app100 L16257S17843F4138B13341 across290files:289whole source/map certificates and one complete contiguous focuscontroller transfer,3regions254statements42functions67branches including full mapped declarations/bodies/enclosing branches/all locations. Inventory100 L1464S1523F384B1081 across38whole source/maps. Invalid V8 inferred painter else aggregate -36 retained raw and rejected; entire prior verified unchanged source/map/counter entry selected, no individual clamp or manufactured counts. App map/proof f9a3f15015d69f9a588c4652b7772b7c10c2210a1d6ccfc30e5db687330dceb1/8c7630e183f625edb9bbdfd8ce82c59a10cb99cc1afd424fe0a2925e2b1dd916; inventory 6c1d9602256239065ceeab281a1008c7899a261454f6db6ebf972a1cef561163/ce72eaece0f734e0cd19165b1865b26fe8dd215af21fd54269494097c27500a5. Same current-agent EVALUATOR, explicitly not independent, exactSHA PASS. Initial reviewer audit mismatch was path-array ordering after new files became tracked; reconstructed semantic scope normalized order only, counted newly added review artifact separately and restored committed scope bytes. No implementation change or runtime replay.

    Scope21approved21actual:7production9exact source-backed prior acceptance migrations3fresh tests2metadata. Prior573acceptance files:564byte-identical,9approved obsolete-control/native-command or exact census migrations;3new=576. Native7new passing cases byte-identical; original4mounted definitions token-identical plus1genuinely new case; browser exact one device CSS correction. Metadata291-to293 adds only native rowht and browser RowHeightDialog; every prior field/prefix/status/default/registered save/open/recovery deviation preserved by identity. Provenance prior order restored; changed source-provenance gate passed. Runtime inventory sorted. No whole module verification promotion. Source generation/tree/provenance/invariant/parity gates passed after restoration; unchanged JSDoc/physical source limits passed. Doctor0errors2known warnings, routing/diff pass. AP bounded English json/md only,0upstream sources/Python/raw results/maps/snapshots; raw evidence in ignored project dependency cache. Complete575377-character parent Findings prefix SHAf1acffd23bc38e9bbfcfba9ef6da42bea7f2879e41effd0bd78e3a2c37cfa5c4 preserved.

    Priority bullet fix e625c6f3b56279490cd3fc9292afa2a3ee2f4d92 unchanged; source native marker width and MinimumDistance prevent overlap. Four actual full Chromium body/cell1280/390 cases pass. Residual: full native Help/unit preferences/modal lifecycle/other size commands and direct minRowHeight ItemSetToTableParam compatibility remain unverified next work, not registered intentional exceptions. Leaf bounded scope complete; parent/goal ACTIVE. Final prose before canonicalverify, finish actual implementationSHA.
id_source: "generated"
---
## Summary

Port existing row-height editing to the pinned source dialog and generated menu command.

## Scope

apps/office/src/sw/source/ui/table/rowht.ts
apps/office/src/sw/browser/presentation/WriterRowHeightDialog.tsx
apps/office/src/sw/browser/presentation/WriterTableDialog.tsx
apps/office/src/sw/browser/presentation/writer-view.tsx
scripts/generate-writer-ui-resources.ts
apps/office/src/sw/uiconfig/swriter/writer-ui.generated.json
apps/office/src/sw/browser/editor/native-table-selection.test.tsx
apps/office/src/sw/browser/editor/native-row-frame-size.test.tsx
apps/office/src/sw/browser/presentation/native-table-properties-reset.test.tsx
apps/office/src/sw/browser/presentation/native-table-column-page.test.tsx
apps/office/src/sw/browser/presentation/writer-view.test.tsx
apps/office/src/sw/browser/presentation/native-table-height-delta.test.tsx
apps/office/src/sw/browser/presentation/WriterTableDialog.test.tsx
apps/office/e2e/writer-native-table-properties-reset.spec.ts
apps/office/src/sw/source/ui/table/native-row-height-dialog.test.ts
apps/office/src/sw/browser/presentation/native-row-height-dialog.test.tsx
apps/office/e2e/writer-native-row-height-dialog.spec.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json
apps/office/src/sw/browser/editor/browser-writer-edit-window.ts
scripts/libreoffice-inventory/parity-mapping-cli.test.ts

## Plan

One CODER leaf under standing iterative user authorization: port source SwTableHeightDlg height/fit draft and Apply using original SwWrtShell GetRowHeight/SetRowHeight, MINLAY23, native Fixed/Minimum and current/selected-row scope; render separate Row Height modal with Height and Fit to size, OK/Cancel, generated .uno:SetRowHeight source slot/menu Table > Size. Remove extra minimum-height field and rowHeight ingress from Table Properties; preserve separate existing direct API compatibility pending native item-set refactor. Migrate only affected obsolete control assertions to source-shaped command, preserve all other prior acceptance bytes and assertions; add native/mounted/real Chromium1280/390 Fixed/Minimum/Variable defaults, Cancel/escape, selected/current height mode, minimum admission, grouped history/three UndoRedo/original owners/continued editing/ODT reopen. Approved semantic paths: apps/office/src/sw/source/ui/table/rowht.ts, apps/office/src/sw/browser/presentation/WriterRowHeightDialog.tsx, apps/office/src/sw/browser/presentation/WriterTableDialog.tsx, apps/office/src/sw/browser/presentation/writer-view.tsx, scripts/generate-writer-ui-resources.ts, apps/office/src/sw/uiconfig/swriter/writer-ui.generated.json, apps/office/src/sw/browser/editor/native-table-selection.test.tsx, apps/office/src/sw/browser/editor/native-row-frame-size.test.tsx, apps/office/src/sw/browser/presentation/native-table-properties-reset.test.tsx, apps/office/src/sw/browser/presentation/native-table-column-page.test.tsx, apps/office/src/sw/browser/presentation/writer-view.test.tsx, apps/office/src/sw/browser/presentation/native-table-height-delta.test.tsx, apps/office/src/sw/browser/presentation/WriterTableDialog.test.tsx, apps/office/e2e/writer-native-table-properties-reset.spec.ts, apps/office/src/sw/source/ui/table/native-row-height-dialog.test.ts, apps/office/src/sw/browser/presentation/native-row-height-dialog.test.tsx, apps/office/e2e/writer-native-row-height-dialog.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Preserve all291 prior metadata complete fields/prefixes/status/defaults/registered save/open/recovery deviations; add precisely mapped rowht module and source-backed bounded notes, no blanket promotion. Six static gates once, ONE full upstream-absent build/app/inventory/infrastructure/Chromium profile, failure-only/genuinely-new closures. Strict100 actual current app/inventory coverage from whole byte-identical source and complete maps or complete contiguous declaration/body/enclosing branch/all mapped locations; no fabricated counters/exclusions/skip promotion/passing replay. Restore vendor finally before source gates. Unchanged JSDoc and actualphysical<1000, strict scope/artifact/governance and exact same-agent EVALUATOR review (not independent), final prose before canonicalverify, finish actual implementationSHA and parent complete prefix append, finalclean. No upstream sources/scripts/Python/raw maps/results in AP; no network/global/subagents. Help content integration/other unimplemented size slots/whole parity remain unverified, not deliberate exceptions.
Source-backed required remediation within the same row-height task: include apps/office/src/sw/browser/editor/browser-writer-edit-window.ts. Menu restores focus before command dispatch; current browser HandleFocus repositions native cursor to stale focused paragraph. Native SwEditWin::GetFocus preserves shell cursor (edtwin.cxx5732-5745). Returning from a role=menu must preserve native cursor/table selection; add one genuinely-new mounted row-height regression only, do not replay passed tests. Full terminal profile found two original migrated app failures, one inventory lexical-order failure and two new Chromium CSS-device-quantization expectation failures. Resolve metadata insertion order while preserving complete old records by identity, correct only exact newfailed CSS expectation to chromium 1/64-pixel device value, retain all original assertions. ONE failed-only/new-case closure with rebuilt changed input; no second full profile.
Include scripts/libreoffice-inventory/parity-mapping-cli.test.ts for exact source-backed command census migration55->56 because generated SetRowHeight adds one existing height-operation command; all other report fields and assertions unchanged. New additional refocus regression remains genuinely unexecuted (initial closure mistakenly nested it under filtered-out callback); move only its added definition to top level, keep initial four passing definitions byte-identical. Initial full and closure1 terminal, vendor restored, no passing replay. Final approved semantic21paths/old migration9files/564 prior byte-identical/576 total acceptance.

## Verify Steps

1. Initial six static gates once: npm run format:check, lint, typecheck, check:dependencies, check:docs, check:file-size. Unchanged JSDoc validator and actual physical line count for changed sources.
2. ONE full upstream-absent profile: test:static build; app coverage; inventory coverage; infrastructure source/resource/boundary tests; Chromium. Restore vendor in finally. Failed-only or genuinely-new closure, no passing replay. Preserve every assertion outside exact obsolete-control migration intervals. Verify native Fixed/Minimum/Variable input, MINLAY23, separate menu/dialog, original current/selected row owners, Cancel/Escape/Enter, Fit checkbox, clipping, three Undo/Redo, ODT roundtrip, continued edits.
3. Strict actual100 app/inventory source-bound coverage, finite nonnegative counters, whole byte-identical source/maps or complete contiguous mapped declaration/body/branch transfer. No exclusions, counter fabrication, skips promotion.
4. After restoration source generation --check/tree/provenance/invariants/parity gates. Exact scope, all291 old metadata fields/prefixes/registered deviations, all573 old acceptance files except approved assertion migrations; no forbidden AP content. Governance and exact implementationSHA same-agent EVALUATOR (not independent). Final Findings/Verification before canonicalverify. Close actual implementationSHA then parent complete prefix append and clean state.

## Verification

Command: six initial static gates once; failed/changed-input closures only; ONE full upstream-absent build/app/inventory/infrastructure/Chromium profile followed only original failures or genuinely new case. Source gates after restoration; source-bound actual coverage/case/scope/metadata/artifact/governance and exact implementationSHA review.
Result: PASS source-shaped separate row height command/dialog and native selection preservation.
Evidence: implementation c6c4eb13d4d8ef76e817f097c4900253d196de64;13495app110inventory14infrastructure272Chromium resolved,0unresolved0passing replay. Actual100 app/inventory all four metrics with complete current source/map bindings and one full contiguous transfer; invalid negative raw painter counters retained and whole verified prior identical map selected.35app/4inventory skipped observations retained. See exact-sha-review.json, final-coverage.json, case-census.json, scope-final.json, source-review.json and quality/20261007-110159617-recovery-context/quality-report.json.21approved semantic paths;564prior test files byte-identical,9approved migrations,3new; all291prior metadata records preserved plus2new. Four priority bullet regressions pass.
Scope: native Fixed/Minimum/Variable capture, MINLAY bounds, source menu/modal, native current/selected owners/cursor, Cancel/Escape/Enter, fit checkbox/clipping, three Undo/Redo, ODT reopening and continued edits. Same current-agent EVALUATOR explicitly not independent. Full Help/unit preferences/modal lifecycle/other size commands/direct minRowHeight compatibility and whole parity remain unverified; parent/goal ACTIVE.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-07T11:02:51.928Z — VERIFY — ok

By: CODER

Note: Source row height slot20507 and separate Fixed/Minimum dialog preserve native current and selected row owners, menu refocus and history. Exact implementation c6c4eb13 reviewed by same agent, not independent; 13495 app 110 inventory 14 infrastructure 272 Chromium resolved, actual source-bound coverage 100 percent, zero passing replay. Final Findings and Verification precede this record.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-07T11:02:51.446Z, excerpt_hash=sha256:e985eb2962e9d10262eafd168176e4163d3c2b0af6e73dac63221d825431ee15

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610071025-6RKM2B/blueprint/resolved-snapshot.json
- old_digest: 74b2f94ef27959e32cf27ed60433337679acc841c6909741cbfea93b41c1cebc
- current_digest: 74b2f94ef27959e32cf27ed60433337679acc841c6909741cbfea93b41c1cebc
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610071025-6RKM2B

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610071025-6RKM2B -m 🧩 6RKM2B task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task implementation commit; preserve previously registered save/open/recovery exceptions and task history.

## Findings

Pinned local rowht.cxx35-67: captures GetRowHeight, fit defaults type!=Fixed, MINLAY23, Apply Fixed or Minimum through SetRowHeight. tabsh.cxx910 opens independent dialog and Apply only RET_OK. rowheight.ui has Height/Fit to size/OK/Cancel/Help; Table Properties Text Flow has no row-height field. Source menubar TableAutoFitMenu > SetRowHeight, SDI FN_TABLE_SET_ROW_HEIGHT. Help system and other unimplemented size commands remain unverified.

Iteration212 verified closure. Implementation c6c4eb13d4d8ef76e817f097c4900253d196de64 ports source SwTableHeightDlg: capture native GetRowHeight, MINLAY23, Fixed default and Minimum when Fit to size is checked, native SetRowHeight on accept. Generated source slot20507 appears at Table > Size > Row Height, with Height and Fit to size modal. Table Properties no longer contains the extra Text Flow minimum-height control. Native current/selected row owners, cursor, bounds, Cancel/Escape/Enter, clipping, three Undo/Redo, ODT roundtrip and continued editing verified. Menu focus restoration now preserves shell selection, following edtwin.cxx GetFocus rather than resolving stale DOM paragraph coordinates. Pinned source libreoffice-26.8.0.2 9bc445578031fecf56086729d8e4940c77e14d65; source-review.json binds eleven upstream files and seven production files.

Initial six static gates once; failed-only and changed-input static closures passed. ONE full upstream-absent runtime profile then original failures or genuinely new case only: actual13495app110inventory14infrastructure272Chromium PASS,0unresolved0passing replay. Initial two app failures exposed menu focus repositioning; exact failures passed after source-shaped focus fix. Inventory initial ordering failure fixed, then source command census exact55-to56 literal updated and same failure passed. Two new Chromium CSS expectations corrected exact40.0667px-to40.0625px device quantization interval; all other bytes/assertions retained. New mouse-selection regression initially nested under filtered-out callback and did not execute; skip retained, moved only new case top-level with original four passing mounted definitions token-identical. First actual execution failed guessed Paragraph1 body label; exact label corrected to actual Writer document text and only that failure passed. Focused exits1 from global coverage thresholds retained honestly; app35/inventory4skip observations remain skipped. All handles terminal, vendor restored finally before source or AP mutations.

Strict actual current-source app100 L16257S17843F4138B13341 across290files:289whole source/map certificates and one complete contiguous focuscontroller transfer,3regions254statements42functions67branches including full mapped declarations/bodies/enclosing branches/all locations. Inventory100 L1464S1523F384B1081 across38whole source/maps. Invalid V8 inferred painter else aggregate -36 retained raw and rejected; entire prior verified unchanged source/map/counter entry selected, no individual clamp or manufactured counts. App map/proof f9a3f15015d69f9a588c4652b7772b7c10c2210a1d6ccfc30e5db687330dceb1/8c7630e183f625edb9bbdfd8ce82c59a10cb99cc1afd424fe0a2925e2b1dd916; inventory 6c1d9602256239065ceeab281a1008c7899a261454f6db6ebf972a1cef561163/ce72eaece0f734e0cd19165b1865b26fe8dd215af21fd54269494097c27500a5. Same current-agent EVALUATOR, explicitly not independent, exactSHA PASS. Initial reviewer audit mismatch was path-array ordering after new files became tracked; reconstructed semantic scope normalized order only, counted newly added review artifact separately and restored committed scope bytes. No implementation change or runtime replay.

Scope21approved21actual:7production9exact source-backed prior acceptance migrations3fresh tests2metadata. Prior573acceptance files:564byte-identical,9approved obsolete-control/native-command or exact census migrations;3new=576. Native7new passing cases byte-identical; original4mounted definitions token-identical plus1genuinely new case; browser exact one device CSS correction. Metadata291-to293 adds only native rowht and browser RowHeightDialog; every prior field/prefix/status/default/registered save/open/recovery deviation preserved by identity. Provenance prior order restored; changed source-provenance gate passed. Runtime inventory sorted. No whole module verification promotion. Source generation/tree/provenance/invariant/parity gates passed after restoration; unchanged JSDoc/physical source limits passed. Doctor0errors2known warnings, routing/diff pass. AP bounded English json/md only,0upstream sources/Python/raw results/maps/snapshots; raw evidence in ignored project dependency cache. Complete575377-character parent Findings prefix SHAf1acffd23bc38e9bbfcfba9ef6da42bea7f2879e41effd0bd78e3a2c37cfa5c4 preserved.

Priority bullet fix e625c6f3b56279490cd3fc9292afa2a3ee2f4d92 unchanged; source native marker width and MinimumDistance prevent overlap. Four actual full Chromium body/cell1280/390 cases pass. Residual: full native Help/unit preferences/modal lifecycle/other size commands and direct minRowHeight ItemSetToTableParam compatibility remain unverified next work, not registered intentional exceptions. Leaf bounded scope complete; parent/goal ACTIVE. Final prose before canonicalverify, finish actual implementationSHA.
