---
id: "202610070143-JBMND6"
title: "Move cell vertical alignment into native document ownership and common selection state"
result_summary: "Native SwFormatVertOrient replaces scalar cell alignment; document owns common selected/current state and ring updates, UI consumes numeric native state, full item preserved in ODT/primitive boundary/history; intentional I/O deviations retained. Full project parity remains unverified."
status: "DONE"
priority: "high"
owner: "CODER"
revision: 18
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-07T01:47:40.349Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-07T02:18:50.030Z"
  updated_by: "CODER"
  note: "PASS: implementation800b91a6be0b7f57cd36669a8b6c822f9ba1199d exact scope/native contracts/same-agent non-independent evaluator; distinct13216app109inventory5scripts246Chromium,48 skips retained; actual100 app/inventory source/map proof; one full upstream-absent profile, focused failures/new only, finally restored; unchanged scoped lint repair and source gates pass;0forbidden current-leaf artifacts, parent536977 prefix and registered I/O exceptions preserved."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-07T02:18:07.620Z"
  updated_by: "EVALUATOR"
  note: "Native document cell orientation ownership and selected common UI contract pass at 800b91a6be0b7f57cd36669a8b6c822f9ba1199d; same current agent EVALUATOR phase, explicitly not independent"
  evaluated_sha: "800b91a6be0b7f57cd36669a8b6c822f9ba1199d"
  blueprint_digest: "250b16738e00fd87da72fe477c68ef3afd9b4021569063e4c61cd048c9347423"
  evidence_refs:
    - ".agentplane/tasks/202610070143-JBMND6/README.md"
    - ".agentplane/tasks/202610070143-JBMND6/quality/20261007-021807620-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610070143-JBMND6/quality/20261007-021807620-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610070143-JBMND6/quality/20261007-021807620-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610070143-JBMND6/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610070143-JBMND6/evidence/exact-sha-review.json"
    - ".agentplane/tasks/202610070143-JBMND6/evidence/changed-file-closure4.json"
    - ".agentplane/tasks/202610070143-JBMND6/evidence/coverage-source-proof.json"
  findings:
    - "Exact SHA scope39, native full three-field item, selected/current/ring admissions, numeric dialog state, ODT and primitive boundary, history and fixed-row alignment validated. Original lint rework closed by case block and unchanged targeted lint/JSDoc/format. Distinct13216app109inventory5scripts246Chromium pass;48 focused skips stay skipped, no passing replay; actual100 application/inventory with exact source/map transfer proof."
commit:
  hash: "800b91a6be0b7f57cd36669a8b6c822f9ba1199d"
  message: "🚧 JBMND6 code: close native orientation lexical declaration verification"
comments:
  -
    author: "CODER"
    body: "Start: implement native document-owned complete cell vertical alignment under standing iterative authorization; no upstream-executing tests or raw AP artifacts."
  -
    author: "CODER"
    body: "Verified: native full cell orientation document ownership and selection-driven UI; same current-agent EVALUATOR explicitly not independent;13216app109inventory5scripts246ChromiumPASS actual100 app/inventory,48 focused skips retained; real lint rework closed, no passing replay or upstream invocation, clean canonical verification tail."
events:
  -
    type: "status"
    at: "2026-10-07T01:44:25.607Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement native document-owned complete cell vertical alignment under standing iterative authorization; no upstream-executing tests or raw AP artifacts."
  -
    type: "verify"
    at: "2026-10-07T02:18:50.030Z"
    author: "CODER"
    state: "ok"
    note: "PASS: implementation800b91a6be0b7f57cd36669a8b6c822f9ba1199d exact scope/native contracts/same-agent non-independent evaluator; distinct13216app109inventory5scripts246Chromium,48 skips retained; actual100 app/inventory source/map proof; one full upstream-absent profile, focused failures/new only, finally restored; unchanged scoped lint repair and source gates pass;0forbidden current-leaf artifacts, parent536977 prefix and registered I/O exceptions preserved."
  -
    type: "status"
    at: "2026-10-07T02:19:04.986Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: native full cell orientation document ownership and selection-driven UI; same current-agent EVALUATOR explicitly not independent;13216app109inventory5scripts246ChromiumPASS actual100 app/inventory,48 focused skips retained; real lint rework closed, no passing replay or upstream invocation, clean canonical verification tail."
doc_version: 3
doc_updated_at: "2026-10-07T02:19:04.987Z"
doc_updated_by: "CODER"
description: "Iteration203: replace scalar kernel cell alignment and shell-owned mutation with full SwFormatVertOrient, native SwDoc SetBoxAttr/SetBoxAlign/GetBoxAlign selection and history; use common native dialog state and changed-item submission, preserving registered document I/O deviations."
sections:
  Summary: "Iteration203 replaces represented scalar cell alignment and shell-owned box mutations with native SwFormatVertOrient and document-owned cell attribute selection/history. Standing user iterative authorization; full parent/goal remains active and unverified."
  Scope: |-
    Approved exact production paths:
    apps/office/src/offapi/com/sun/star/text/VertOrientation.ts
    apps/office/src/offapi/com/sun/star/text/RelOrientation.ts
    apps/office/src/sw/inc/fmtornt.ts
    apps/office/src/sw/inc/hintids.ts
    apps/office/src/sw/source/core/table/swtable.ts
    apps/office/src/sw/source/core/docnode/ndtbl1.ts
    apps/office/src/sw/source/core/doc/doc.ts
    apps/office/src/sw/source/core/frmedt/fetab.ts
    apps/office/src/sw/source/uibase/shells/tabsh.ts
    apps/office/src/sw/source/filter/xml/xmltbli.ts
    apps/office/src/sw/source/filter/xml/xmlexp.ts
    apps/office/src/sw/browser/filter/xml/writer-document-codec.ts
    apps/office/src/sw/browser/editor/WriterEditableTable.tsx
    apps/office/src/sw/browser/presentation/WriterTableDialog.tsx
    apps/office/src/sw/browser/presentation/WriterInsertTableDialog.tsx
    apps/office/src/sw/browser/presentation/writer-view.tsx
    apps/office/src/sw/source/core/undo/untbl.ts
    Approved existing acceptance paths, explicit native item/enum fixture/assertion migrations and upstream changed-item correction only:
    apps/office/src/sw/browser/presentation/writer-view.test.tsx
    apps/office/src/sw/source/filter/xml/odt-table-roundtrip.test.ts
    apps/office/src/sw/browser/presentation/WriterTableDialog.test.tsx
    apps/office/src/sw/browser/presentation/native-table-properties-reset.test.tsx
    apps/office/src/sw/source/uibase/wrtsh/native-row-split-owner-history.test.ts
    apps/office/src/sw/source/uibase/wrtsh/native-table-properties.test.ts
    apps/office/src/sw/source/uibase/wrtsh/native-row-height-owner-history.test.ts
    apps/office/src/sw/source/uibase/wrtsh/native-table-column-page-history.test.ts
    apps/office/src/sw/source/uibase/wrtsh/native-table-text-flow-split-history.test.ts
    apps/office/src/sw/source/uibase/wrtsh/native-table-text-flow-headline-history.test.ts
    apps/office/src/sw/source/uibase/wrtsh/native-table-format-lifecycle-history.test.ts
    apps/office/src/sw/source/uibase/wrtsh/native-table-traversal.test.ts
    apps/office/src/sw/source/uibase/wrtsh/native-table-properties-reset-history.test.ts
    apps/office/src/sw/source/core/undo/native-insert-table-history.test.ts
    apps/office/e2e/writer-table-properties-history.spec.ts
    New acceptance paths:
    apps/office/src/sw/inc/fmtornt.test.ts
    apps/office/src/sw/source/core/docnode/native-cell-alignment-owner.test.ts
    apps/office/src/sw/source/filter/xml/native-cell-alignment-roundtrip.test.ts
    apps/office/src/sw/browser/presentation/native-cell-alignment-state.test.tsx
    apps/office/e2e/writer-native-cell-alignment.spec.ts
    Metadata: docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Current leaf AP bounded evidence and immutable-prefix parent append. Native insertion undo payload must clone the new complete item; this is necessary original approved full-item history, one exact production path refinement under standing iterative authorization. No network/outside/global access, raw data or source/scripts in AP. Raw only ignored application cache.
  Plan: |-
    1. Native VertOrientation/RelOrientation and complete SwFormatVertOrient item; cloned original box storage; document SetBoxAttr/SetBoxAlign/GetBoxAlign and thin shell delegates. Keep unrelated border/table paths scoped for future work.
    2. Native numeric property boundary, common shell dialog state and native changed-item submission, browser CSS enum rendering, ODT conversion and full primitive codec ingress/egress. Explicit acceptance migrations preserve intended old behavior except documented upstream changed-item correction.
    3. New native/codec/ODT/mounted/Chromium evidence, metadata bounded additions preserving old prefixes, static/source gates and single absence profile with real100 counters, evaluator and scoped commit/finish. Parent immutable prefix append only after leaf closure.
  Verify Steps: |-
    1. Six initial static gates once: npm run format:check, lint, typecheck, check:dependencies, check:docs, check:file-size; unchanged JSDoc validator scoped changed files and actual physical lines<1000. Only failed or genuinely changed checks afterward.
    2. ONE full upstream-absent npm run test:static, app coverage, inventory coverage, script tests, production Chromium profile. Restore vendor finally; await all source/audit handles before profile, no source/AP audits during absence. Only original failed or genuinely new cases afterward, rebuild production after production edits. Actual100% application/inventory coverage; only complete identical source/maps or contiguous identical complete function-body/full enclosing branch-location counters can be reused. Keep focused skips as skips.
    3. Native literal enums/defaults/full three-field equality/clone/query/update; setter ordinary full ring versus getter only current point, table cursor canonical selection, mixed65535, absent/foreign/no-selected admissions, same-value history, original graph/cursor lifetime and repeated UndoRedo. ODT top maps NONE, middle CENTER, bottom BOTTOM; codec preserves full position/relation without class transport; legacy scalar only storage ingress. Real browser1280/390 proves selected common dialog state, mixed native fallback and unchanged alignment omission, changed selected-cell alignment and history, no first-table-cell guessing. Existing acceptance semantic scenarios retained; explicit primitive-to-item/numeric ingress migrations proved against baseline541files; prior278metadata records/defaults/classifications/registered I/O deviations retained.
    4. After restoration source-dependent generation --check, source-tree/provenance/invariants/parity audits; doctor/routing/diff/pinned source hashes; current-leaf AP census0forbidden. Same-agent EVALUATOR explicitly not independent, final prose before canonical verify, implementationSHA commit/finish, clean tracked/untracked state. Preserve full536977-character parent prefix SHA2bb082e29f12548a1d2c55fb78d9954a1f9f287bcaebc5480a9177486420a848. Full native pooling/fly/layout/border/protection/shared formats and overall parity remain unproven.
  Verification: |-
    PASS at actual implementation 800b91a6be0b7f57cd36669a8b6c822f9ba1199d. Initial six static gates ONCE plus failed/genuinely changed closures; source gates/closures, exact39path/541old526byte-identical15migration546total/278prior+3unverified281 record scope, registered I/O exceptions/full536977 parent prefix/stash checks pass. Current unchanged scoped lint/format/JSDoc/physical93-line item and129-line new test close real evaluator lexical REWORK.
    ONE full upstream-absent build/app/inventory/scripts/Chromium; only original failures and genuinely new cases afterward, rebuild after production edits. Distinct13216application109inventory5scripts246Chromium PASS0residual/flaky;48 focused skips remain skips including misaddressed all-skip closure. No passing/full replay, no test invokes upstream. All audits outside live profiles, vendor finally restored.
    Actual100 all app/inventory dimensions. App278 L15086/S16551/F3858/B12295 mapa1cab5f59dd9445ded2a6cb5d6c6452f9240f9a0600f1a01b8f76c2b352434dc proofee86ae3ec1f7a39b8971b7bdf1f592be74ac8da7a5d43a4bd102a0c81118feca;275whole source/map-identical+3full contiguous region files. Inventory38 L1464/S1523/F384/B1080 mape740bbac836d1d69cf6186775a42eab25b4eb1a512782119b5af959a8111475f proofbba763d4d7885fd8e6c808012fa5076f978483a51ef15926e7e324b1ca130222. Exact complete source/maps or entire mapped declaration/body/enclosing branch/locations verified, genuine counters only.
    Same current-agent EVALUATOR explicitly not independent PASS; generated quality/current-leaf artifact audit, canonical verify and actualSHA finish, immutable full parent append/clean census complete closure. Native pooling/fly/nested/merged/protection/full layout/borders/row splitting/SfxItemSet/widget and overall parity remain unverified; parent/goal active.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-07T02:18:50.030Z — VERIFY — ok

    By: CODER

    Note: PASS: implementation800b91a6be0b7f57cd36669a8b6c822f9ba1199d exact scope/native contracts/same-agent non-independent evaluator; distinct13216app109inventory5scripts246Chromium,48 skips retained; actual100 app/inventory source/map proof; one full upstream-absent profile, focused failures/new only, finally restored; unchanged scoped lint repair and source gates pass;0forbidden current-leaf artifacts, parent536977 prefix and registered I/O exceptions preserved.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-07T02:18:42.870Z, excerpt_hash=sha256:edf3a6470247be928900266e373c65529e88c5c82d866209d7c79ba37c548dae

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610070143-JBMND6/blueprint/resolved-snapshot.json
    - old_digest: 250b16738e00fd87da72fe477c68ef3afd9b4021569063e4c61cd048c9347423
    - current_digest: 250b16738e00fd87da72fe477c68ef3afd9b4021569063e4c61cd048c9347423
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610070143-JBMND6

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610070143-JBMND6
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only the task-scoped implementation commit if needed; preserve source reference, registered I/O exceptions, existing DONE evidence and deferred stash. No destructive history operations."
  Findings: |-
    Read-only source confirms lcl_GetBoxSel expands all ordinary ring points only for SetBoxAttr, GetBoxAlign reads current point unless native table cursor. SetBoxAlign constructs position0 with requested orientation and default PRINT_AREA relation. Table dialog Reset uses native common alignment and FillItemSet submits only changed valid orientation. Previous goal turn restated completed bullet correction; this leaf takes the next executable safe action. Two earlier guessed source lookups found no files; route recomputed before leaf creation or implementation. No processes live.

    Final outcome: native SwFormatVertOrient Which109 with full position/orientation/relation, NONE0 and PRINT_AREA1 defaults, Clone/equality/native member queries and updates; native enum literals preserved. Scalar verticalAlign removed from original kernel boxes, copied native item is canonical. Document owns selected/current getter and full-ring setter, mixed ushort65535 and signed narrowing follow source; shell delegates. Common selection drives numeric dialog state; unchanged alignment omitted, mixed state native Top widget fallback. ODT top/NONE, middle/CENTER, bottom/BOTTOM; primitive codec retains complete item and validates integer values, legacy scalar only storage ingress. Fixed row cell alignment uses safe nonnegative offsets. Insert undo clones full authored item. Existing graph, selection, history and intentional I/O deviations preserved.
    Verification: initial six static gates once, failed/genuinely changed scoped closures; unchanged JSDoc and actual physical lines<1000. Initial source gates and source closures pass. ONE full absent build/app/inventory/scripts/Chromium profile:13208appPASS2FAIL,109inventoryPASS,5scriptsPASS,245ChromiumPASS. Only original two failed and genuinely new cases afterward; closure1 rebuild/6appPASS32skip/newChromium1PASS; closure2 rebuild/newapp1PASS6skip; lexical repair closure3 rebuildPASS but mistaken neighboring test path caused0PASS7skip, corrected closure4 genuinely new exact app1PASS3skip with no second build because production was byte-identical to completed build. Distinct13216app109inventory5scripts246ChromiumPASS,0residual failures/flaky;48 focused skip observations remain skipped; no full or historical passing replay. Source/scope/AP audits awaited outside profiles, vendor restored finally, tests never call upstream.
    Real evaluator rework: truncated closure2 output had hidden one ESLint no-case-declarations at fmtornt.ts80. Same-agent exact review rejected it and recorded REWORK. Case2 lexical block repaired; unchanged targeted format/lint/JSDoc checks pass on both changed files. Genuine new failed UNO scalar extraction/clone case passes. Intermediate raw coverage initially discarded valid older unchanged regions; strict merge now checks entire source/maps for unchanged files, full contiguous mapped declaration/body and enclosing branch/all locations for intermediate item versions. Actual counters only; no coverage weakening or synthesized counts.
    Actual100 app278files L15086/S16551/F3858/B12295 mapa1cab5f59dd9445ded2a6cb5d6c6452f9240f9a0600f1a01b8f76c2b352434dc proofee86ae3ec1f7a39b8971b7bdf1f592be74ac8da7a5d43a4bd102a0c81118feca;275whole-identical+3complete-region files. Native item alternate focused1/2 complete source/maps proven equal and initial unchanged full mapped ranges verified; previous202 entire byte-identical editing-host map retains verified digest. Inventory38files L1464/S1523/F384/B1080 mape740bbac836d1d69cf6186775a42eab25b4eb1a512782119b5af959a8111475f proofbba763d4d7885fd8e6c808012fa5076f978483a51ef15926e7e324b1ca130222.
    Scope39semantic17production15exact old native item/enum fixture and changed-item UI migrations5new acceptance2metadata;541prior526byte-identical15explicit transformations546total.278complete prior metadata records/prefixes/defaults/statuses/classifications/registered I/O exceptions retained+3new unverified281. Full parent Findings536977/hash2bb082e29f12548a1d2c55fb78d9954a1f9f287bcaebc5480a9177486420a848 untouched before closure. Doctor0errors2known warnings/routing/diff pass. Deferred stash retained. Current-leaf and generated quality census has0forbidden upstream/source/helper/Python/raw maps/cases/results/screenshots. No network/global/outside/subagent actions.
    Exact implementation800b91a6be0b7f57cd36669a8b6c822f9ba1199d PASS reviewed by same current agent EVALUATOR explicitly not independent. Historical REWORK preserved. Final prose before canonical verify, actual implementation SHA finish, immutable whole parent prefix append and clean final state. Native pooling/fly/nested/merged/protection/full layout/borders/row splitting/SfxItemSet/widget and overall parity unverified; parent and goal active.
id_source: "generated"
---
## Summary

Iteration203 replaces represented scalar cell alignment and shell-owned box mutations with native SwFormatVertOrient and document-owned cell attribute selection/history. Standing user iterative authorization; full parent/goal remains active and unverified.

## Scope

Approved exact production paths:
apps/office/src/offapi/com/sun/star/text/VertOrientation.ts
apps/office/src/offapi/com/sun/star/text/RelOrientation.ts
apps/office/src/sw/inc/fmtornt.ts
apps/office/src/sw/inc/hintids.ts
apps/office/src/sw/source/core/table/swtable.ts
apps/office/src/sw/source/core/docnode/ndtbl1.ts
apps/office/src/sw/source/core/doc/doc.ts
apps/office/src/sw/source/core/frmedt/fetab.ts
apps/office/src/sw/source/uibase/shells/tabsh.ts
apps/office/src/sw/source/filter/xml/xmltbli.ts
apps/office/src/sw/source/filter/xml/xmlexp.ts
apps/office/src/sw/browser/filter/xml/writer-document-codec.ts
apps/office/src/sw/browser/editor/WriterEditableTable.tsx
apps/office/src/sw/browser/presentation/WriterTableDialog.tsx
apps/office/src/sw/browser/presentation/WriterInsertTableDialog.tsx
apps/office/src/sw/browser/presentation/writer-view.tsx
apps/office/src/sw/source/core/undo/untbl.ts
Approved existing acceptance paths, explicit native item/enum fixture/assertion migrations and upstream changed-item correction only:
apps/office/src/sw/browser/presentation/writer-view.test.tsx
apps/office/src/sw/source/filter/xml/odt-table-roundtrip.test.ts
apps/office/src/sw/browser/presentation/WriterTableDialog.test.tsx
apps/office/src/sw/browser/presentation/native-table-properties-reset.test.tsx
apps/office/src/sw/source/uibase/wrtsh/native-row-split-owner-history.test.ts
apps/office/src/sw/source/uibase/wrtsh/native-table-properties.test.ts
apps/office/src/sw/source/uibase/wrtsh/native-row-height-owner-history.test.ts
apps/office/src/sw/source/uibase/wrtsh/native-table-column-page-history.test.ts
apps/office/src/sw/source/uibase/wrtsh/native-table-text-flow-split-history.test.ts
apps/office/src/sw/source/uibase/wrtsh/native-table-text-flow-headline-history.test.ts
apps/office/src/sw/source/uibase/wrtsh/native-table-format-lifecycle-history.test.ts
apps/office/src/sw/source/uibase/wrtsh/native-table-traversal.test.ts
apps/office/src/sw/source/uibase/wrtsh/native-table-properties-reset-history.test.ts
apps/office/src/sw/source/core/undo/native-insert-table-history.test.ts
apps/office/e2e/writer-table-properties-history.spec.ts
New acceptance paths:
apps/office/src/sw/inc/fmtornt.test.ts
apps/office/src/sw/source/core/docnode/native-cell-alignment-owner.test.ts
apps/office/src/sw/source/filter/xml/native-cell-alignment-roundtrip.test.ts
apps/office/src/sw/browser/presentation/native-cell-alignment-state.test.tsx
apps/office/e2e/writer-native-cell-alignment.spec.ts
Metadata: docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Current leaf AP bounded evidence and immutable-prefix parent append. Native insertion undo payload must clone the new complete item; this is necessary original approved full-item history, one exact production path refinement under standing iterative authorization. No network/outside/global access, raw data or source/scripts in AP. Raw only ignored application cache.

## Plan

1. Native VertOrientation/RelOrientation and complete SwFormatVertOrient item; cloned original box storage; document SetBoxAttr/SetBoxAlign/GetBoxAlign and thin shell delegates. Keep unrelated border/table paths scoped for future work.
2. Native numeric property boundary, common shell dialog state and native changed-item submission, browser CSS enum rendering, ODT conversion and full primitive codec ingress/egress. Explicit acceptance migrations preserve intended old behavior except documented upstream changed-item correction.
3. New native/codec/ODT/mounted/Chromium evidence, metadata bounded additions preserving old prefixes, static/source gates and single absence profile with real100 counters, evaluator and scoped commit/finish. Parent immutable prefix append only after leaf closure.

## Verify Steps

1. Six initial static gates once: npm run format:check, lint, typecheck, check:dependencies, check:docs, check:file-size; unchanged JSDoc validator scoped changed files and actual physical lines<1000. Only failed or genuinely changed checks afterward.
2. ONE full upstream-absent npm run test:static, app coverage, inventory coverage, script tests, production Chromium profile. Restore vendor finally; await all source/audit handles before profile, no source/AP audits during absence. Only original failed or genuinely new cases afterward, rebuild production after production edits. Actual100% application/inventory coverage; only complete identical source/maps or contiguous identical complete function-body/full enclosing branch-location counters can be reused. Keep focused skips as skips.
3. Native literal enums/defaults/full three-field equality/clone/query/update; setter ordinary full ring versus getter only current point, table cursor canonical selection, mixed65535, absent/foreign/no-selected admissions, same-value history, original graph/cursor lifetime and repeated UndoRedo. ODT top maps NONE, middle CENTER, bottom BOTTOM; codec preserves full position/relation without class transport; legacy scalar only storage ingress. Real browser1280/390 proves selected common dialog state, mixed native fallback and unchanged alignment omission, changed selected-cell alignment and history, no first-table-cell guessing. Existing acceptance semantic scenarios retained; explicit primitive-to-item/numeric ingress migrations proved against baseline541files; prior278metadata records/defaults/classifications/registered I/O deviations retained.
4. After restoration source-dependent generation --check, source-tree/provenance/invariants/parity audits; doctor/routing/diff/pinned source hashes; current-leaf AP census0forbidden. Same-agent EVALUATOR explicitly not independent, final prose before canonical verify, implementationSHA commit/finish, clean tracked/untracked state. Preserve full536977-character parent prefix SHA2bb082e29f12548a1d2c55fb78d9954a1f9f287bcaebc5480a9177486420a848. Full native pooling/fly/layout/border/protection/shared formats and overall parity remain unproven.

## Verification

PASS at actual implementation 800b91a6be0b7f57cd36669a8b6c822f9ba1199d. Initial six static gates ONCE plus failed/genuinely changed closures; source gates/closures, exact39path/541old526byte-identical15migration546total/278prior+3unverified281 record scope, registered I/O exceptions/full536977 parent prefix/stash checks pass. Current unchanged scoped lint/format/JSDoc/physical93-line item and129-line new test close real evaluator lexical REWORK.
ONE full upstream-absent build/app/inventory/scripts/Chromium; only original failures and genuinely new cases afterward, rebuild after production edits. Distinct13216application109inventory5scripts246Chromium PASS0residual/flaky;48 focused skips remain skips including misaddressed all-skip closure. No passing/full replay, no test invokes upstream. All audits outside live profiles, vendor finally restored.
Actual100 all app/inventory dimensions. App278 L15086/S16551/F3858/B12295 mapa1cab5f59dd9445ded2a6cb5d6c6452f9240f9a0600f1a01b8f76c2b352434dc proofee86ae3ec1f7a39b8971b7bdf1f592be74ac8da7a5d43a4bd102a0c81118feca;275whole source/map-identical+3full contiguous region files. Inventory38 L1464/S1523/F384/B1080 mape740bbac836d1d69cf6186775a42eab25b4eb1a512782119b5af959a8111475f proofbba763d4d7885fd8e6c808012fa5076f978483a51ef15926e7e324b1ca130222. Exact complete source/maps or entire mapped declaration/body/enclosing branch/locations verified, genuine counters only.
Same current-agent EVALUATOR explicitly not independent PASS; generated quality/current-leaf artifact audit, canonical verify and actualSHA finish, immutable full parent append/clean census complete closure. Native pooling/fly/nested/merged/protection/full layout/borders/row splitting/SfxItemSet/widget and overall parity remain unverified; parent/goal active.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-07T02:18:50.030Z — VERIFY — ok

By: CODER

Note: PASS: implementation800b91a6be0b7f57cd36669a8b6c822f9ba1199d exact scope/native contracts/same-agent non-independent evaluator; distinct13216app109inventory5scripts246Chromium,48 skips retained; actual100 app/inventory source/map proof; one full upstream-absent profile, focused failures/new only, finally restored; unchanged scoped lint repair and source gates pass;0forbidden current-leaf artifacts, parent536977 prefix and registered I/O exceptions preserved.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-07T02:18:42.870Z, excerpt_hash=sha256:edf3a6470247be928900266e373c65529e88c5c82d866209d7c79ba37c548dae

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610070143-JBMND6/blueprint/resolved-snapshot.json
- old_digest: 250b16738e00fd87da72fe477c68ef3afd9b4021569063e4c61cd048c9347423
- current_digest: 250b16738e00fd87da72fe477c68ef3afd9b4021569063e4c61cd048c9347423
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610070143-JBMND6

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610070143-JBMND6
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only the task-scoped implementation commit if needed; preserve source reference, registered I/O exceptions, existing DONE evidence and deferred stash. No destructive history operations.

## Findings

Read-only source confirms lcl_GetBoxSel expands all ordinary ring points only for SetBoxAttr, GetBoxAlign reads current point unless native table cursor. SetBoxAlign constructs position0 with requested orientation and default PRINT_AREA relation. Table dialog Reset uses native common alignment and FillItemSet submits only changed valid orientation. Previous goal turn restated completed bullet correction; this leaf takes the next executable safe action. Two earlier guessed source lookups found no files; route recomputed before leaf creation or implementation. No processes live.

Final outcome: native SwFormatVertOrient Which109 with full position/orientation/relation, NONE0 and PRINT_AREA1 defaults, Clone/equality/native member queries and updates; native enum literals preserved. Scalar verticalAlign removed from original kernel boxes, copied native item is canonical. Document owns selected/current getter and full-ring setter, mixed ushort65535 and signed narrowing follow source; shell delegates. Common selection drives numeric dialog state; unchanged alignment omitted, mixed state native Top widget fallback. ODT top/NONE, middle/CENTER, bottom/BOTTOM; primitive codec retains complete item and validates integer values, legacy scalar only storage ingress. Fixed row cell alignment uses safe nonnegative offsets. Insert undo clones full authored item. Existing graph, selection, history and intentional I/O deviations preserved.
Verification: initial six static gates once, failed/genuinely changed scoped closures; unchanged JSDoc and actual physical lines<1000. Initial source gates and source closures pass. ONE full absent build/app/inventory/scripts/Chromium profile:13208appPASS2FAIL,109inventoryPASS,5scriptsPASS,245ChromiumPASS. Only original two failed and genuinely new cases afterward; closure1 rebuild/6appPASS32skip/newChromium1PASS; closure2 rebuild/newapp1PASS6skip; lexical repair closure3 rebuildPASS but mistaken neighboring test path caused0PASS7skip, corrected closure4 genuinely new exact app1PASS3skip with no second build because production was byte-identical to completed build. Distinct13216app109inventory5scripts246ChromiumPASS,0residual failures/flaky;48 focused skip observations remain skipped; no full or historical passing replay. Source/scope/AP audits awaited outside profiles, vendor restored finally, tests never call upstream.
Real evaluator rework: truncated closure2 output had hidden one ESLint no-case-declarations at fmtornt.ts80. Same-agent exact review rejected it and recorded REWORK. Case2 lexical block repaired; unchanged targeted format/lint/JSDoc checks pass on both changed files. Genuine new failed UNO scalar extraction/clone case passes. Intermediate raw coverage initially discarded valid older unchanged regions; strict merge now checks entire source/maps for unchanged files, full contiguous mapped declaration/body and enclosing branch/all locations for intermediate item versions. Actual counters only; no coverage weakening or synthesized counts.
Actual100 app278files L15086/S16551/F3858/B12295 mapa1cab5f59dd9445ded2a6cb5d6c6452f9240f9a0600f1a01b8f76c2b352434dc proofee86ae3ec1f7a39b8971b7bdf1f592be74ac8da7a5d43a4bd102a0c81118feca;275whole-identical+3complete-region files. Native item alternate focused1/2 complete source/maps proven equal and initial unchanged full mapped ranges verified; previous202 entire byte-identical editing-host map retains verified digest. Inventory38files L1464/S1523/F384/B1080 mape740bbac836d1d69cf6186775a42eab25b4eb1a512782119b5af959a8111475f proofbba763d4d7885fd8e6c808012fa5076f978483a51ef15926e7e324b1ca130222.
Scope39semantic17production15exact old native item/enum fixture and changed-item UI migrations5new acceptance2metadata;541prior526byte-identical15explicit transformations546total.278complete prior metadata records/prefixes/defaults/statuses/classifications/registered I/O exceptions retained+3new unverified281. Full parent Findings536977/hash2bb082e29f12548a1d2c55fb78d9954a1f9f287bcaebc5480a9177486420a848 untouched before closure. Doctor0errors2known warnings/routing/diff pass. Deferred stash retained. Current-leaf and generated quality census has0forbidden upstream/source/helper/Python/raw maps/cases/results/screenshots. No network/global/outside/subagent actions.
Exact implementation800b91a6be0b7f57cd36669a8b6c822f9ba1199d PASS reviewed by same current agent EVALUATOR explicitly not independent. Historical REWORK preserved. Final prose before canonical verify, actual implementation SHA finish, immutable whole parent prefix append and clean final state. Native pooling/fly/nested/merged/protection/full layout/borders/row splitting/SfxItemSet/widget and overall parity unverified; parent and goal active.
