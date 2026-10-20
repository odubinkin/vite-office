---
id: "202610200120-RV75WR"
title: "Implement native Calc column widths,visibility,metric dialog and ODS geometry"
result_summary: "verified-202610200120-RV75WR"
status: "DONE"
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
  updated_at: "2026-10-20T01:21:44.307Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-20T02:48:00.339Z"
  updated_by: "CODER"
  note: "verified-202610200120-RV75WR"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-20T02:47:40.023Z"
  updated_by: "EVALUATOR"
  note: "Approved finite Calc column-geometry and common numeric/request slice is implemented and verified at fee73c7085d3;ready for direct closeout."
  evaluated_sha: "fee73c7085d3f134eeb099d929833f4bf402bcf0"
  blueprint_digest: "ba6f765fb953d51c0029329c47bce69ffcaa08b94d4858fabbc8667d559a864e"
  evidence_refs:
    - ".agentplane/tasks/202610200120-RV75WR/README.md"
    - ".agentplane/tasks/202610200120-RV75WR/quality/20261020-024740023-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610200120-RV75WR/quality/20261020-024740023-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610200120-RV75WR/quality/20261020-024740023-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610200120-RV75WR/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610200120-RV75WR/evidence/calc-current-proof.json"
    - ".agentplane/tasks/202610200120-RV75WR/evidence/changed-owners-proof.json"
    - ".agentplane/tasks/202610200120-RV75WR/evidence/native-source-audit.json"
    - ".agentplane/tasks/202610200120-RV75WR/evidence/shared-proof.json"
    - ".agentplane/tasks/202610200120-RV75WR/evidence/writer-proof.json"
    - ".agentplane/tasks/202610200120-RV75WR/evidence/browser-current-commands.json"
    - ".agentplane/tasks/202610200120-RV75WR/evidence/checks.json"
  findings:
    - "Native source hashes/anchors,1280twip defaults,UInt16/HMM casts,signed ODS widths,hidden-range ownership,actual geometry undo documents and native metric/current/default/recording quirks agree with the declared consumed source slice. Unsupported column parent styles are diagnosed."
    - "All425 Calc cases pass;complete current controller,metric-dialog and XML-style maps replace their earlier complete owners without counter merging. Every other Calc source hash is retained. All37 modified executable owners100;shared152 and Writer57 cases pass with complete current owner coverage."
    - "17 unique actual-browser cases pass,with four affected cases rerun on the final build;primary ODS reopens,Undo/Redo,spin arrows,axe and DOM-free Worker are exercised. Native ICU/LibreOffice classification matches all1114112 codepoints. Tooling93 and all declared deterministic gates pass. Exactly100 non-task paths remain in calc;no network,merge or full-all-app run occurred."
commit:
  hash: "92d45eab7259381c3c07d5c92f421b034029da95"
  message: "🧾 RV75WR task: retain verified column geometry review"
comments:
  -
    author: "CODER"
    body: "Start: implement native column width/visibility storage,metric dialog,shared UI,geometry history and ODS with exact source defaults and declared scoped100 evidence."
  -
    author: "CODER"
    body: "Verified: verified-202610200120-RV75WR. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
events:
  -
    type: "status"
    at: "2026-10-20T01:21:49.126Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement native column width/visibility storage,metric dialog,shared UI,geometry history and ODS with exact source defaults and declared scoped100 evidence."
  -
    type: "verify"
    at: "2026-10-20T02:45:43.885Z"
    author: "CODER"
    state: "ok"
    note: "Verified fee73c7085d3: Calc425 cases and current complete maps S9040/B5626/F1758/L8095 all100;shared152 and Writer57 cases,all37 changed executable owners100;native1114112-codepoint protocol;17 unique browser cases plus4 affected cases on final build;93 tooling checks and all declared static/source gates pass. Exact evidence under task evidence/. Full all-app checkpoint40 retained,next50."
  -
    type: "verify"
    at: "2026-10-20T02:48:00.339Z"
    author: "CODER"
    state: "ok"
    note: "verified-202610200120-RV75WR"
  -
    type: "status"
    at: "2026-10-20T02:48:00.482Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: verified-202610200120-RV75WR. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
doc_version: 3
doc_updated_at: "2026-10-20T02:48:00.483Z"
doc_updated_by: "CODER"
description: "Task46 continues the authorized Calc UI goal. Replace fixed browser96px columns with source ScCompressedArray width/visibility storage and native1280twip default. Connect ColumnWidth and related Hide/Show source commands through actual marked/grouped ranges and width/history owners,shared Writer dialog/menu components and original metric/typed-HMM boundaries. Persist real column styles/visibility in ODS and verify browser scrolling/selection/history. Only calc checkout/branch;no network,branches,integration or full all-app run before checkpoint50."
sections:
  Summary: "Task46: native Calc column width/visibility storage and browser geometry,ColumnWidth metric dialog,Hide/Show commands,genuine geometry history and ODS column styles. Continue the approved UI goal using shared Writer controls and source contracts."
  Scope: "Only /Users/odubinkin/Projects/vite-office-calc branch calc. Up to100 non-task paths: original core ScTable/ScDocument compressed column width/hidden/flags and copy paths;native direct/show/hide view/cell shell and ScUndoWidthOrHeight owners;shared consumed numeric unit/metric widget boundary only where needed;native metric dialog state plus shared browser modal controls;controller/viewport/grid/scroll projection;ODS column styles/contexts/tokens/export;source-backed fixture migrations,focused tests/e2e and exact registry/capability/source-issue docs. Preserve1280twip default,UInt16 input casts,HMM versus twip contracts and original zero/direct visibility semantics. No fake VCL/font/device/UNO/locale services,no optimal-width calculation,rich/edit,drawing,outline/protection or alternate-view emulation. No branches,merges,network,outside files or verification weakening. Indent UI is deferred to its own task after real widths are available;do not use a fake96px width to enable it."
  Plan: "1. Port source compressed column width/visibility and geometry-copy/history contracts with original defaults. 2. Replace fixed browser column geometry with projections over actual storage;wire native direct/show/hide commands and consumed metric dialog through existing shared Writer controls and typed Sfx requests. 3. Add real ODS column styles/repeats/visibility and source-derived core/browser/Worker acceptance. 4. Freeze production owners,run scoped100 and related declared checks,retain exact evidence,quality review and clean direct closure. Existing user authorization covers this safe local implementation;stop only for material scope/security/verification drift."
  Verify Steps: "Read brief/route;pin native hashes/anchors. Actual compressed width/hidden storage verifies native defaults,zero fallback,UInt16 conversion,invalid coordinates,ranges,selected/grouped/disjoint sheets/columns and geometry-only copying/history without changing cells. Verify source direct width/HMM typed requests,optional FN_PARAM_1 column selection,no-argument metric dialog,default checkbox/current-value restore,normalization/ranges/unit conversions,cancel/close/dispose and snapshot admission. Verify hide/show retains stored widths and cursor/selection behavior from source;hidden/zero-width geometry cannot divide by zero or allocate cells. Real browser viewport/header/cell offsets,horizontal scroll,selection visibility and both1280/390 shared menu/dialog/shortcut paths use actual native geometry. Independently authored ODS column widths/visibility/repeats and export/reopen preserve geometry alongside existing attrs/cells;diagnose unsupported properties without silently flattening. Scoped Calc raw S/B/F/L100,related shared/Writer tests and complete changed executable application owners100,current hashes. Fresh build/focused browser primary ODS save/reload/open,Undo/Redo and DOM-free Worker,no uncaught errors. Types,root authored lint/format,dependencies,JSDoc,size,Calc/Writer resources,source tree/provenance,invariants/scoped parity,affected tooling/static,routing/doctor/diff. Retain exact argv/exits/nonempty raw/current hashes/source/browser evidence;quality review,implementation commit and clean direct closure. Full checkpoint40 retained;next50."
  Verification: |-
    Command: scoped Calc coverage plus complete-current controller,metric-dialog and XML style owner refresh;related shared and Writer coverage;fresh production browser acceptance;declared static/source/registry/routing checks.
    Result: pass.
    Evidence: Calc138files425cases,raw S9040/B5626/F1758/L8095 all100%;all three complete current owner/maps replace earlier complete owners without counter merging,with every unchanged owner hash retained. Shared19files152cases,S1134/B450/F101/L1077 all100% over16 complete owners. Writer2files57cases and complete docst owner S51/B54/F9/L44 all100%. All37 changed executable application owners100%;one additional static re-export header has no executable body. Native unchanged ICU78.3/LibreOffice character-type protocol matches1114112 codepoints. Tooling3files93cases passes. Browser17unique cases pass at1280/390 including primary ODS,reopen,Undo/Redo,shared controls,axe and genuine DOM-free Worker;4 affected ODS/column cases also pass on the final current build. Types,root lint,root Prettier plus all100 current changed paths,dependency directions,JSDoc,size,Calc/Writer resources,source tree/provenance,invariants,scoped parity,static build,routing,doctor and diff pass. Exact raw maps,results,source hashes,logs and commands are retained under evidence/;calc-current-proof.json,ui-proof.json,shared-proof.json,writer-proof.json and changed-owners-proof.json are authoritative. Earlier profile files are historical contexts,not current-owner substitutes.
    Scope: exactly100 non-task paths inside calc checkout/branch;no network,outside files,merges or full all-app run. Last broad checkpoint40,next50. Native source quirks CALC218..223 are preserved. Remaining native services/layout/optimal-sizing/UNO transforms and broad parity remain unverified. Ready for implementation commit,verification record and quality gate.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-20T02:45:43.885Z — VERIFY — ok

    By: CODER

    Note: Verified fee73c7085d3: Calc425 cases and current complete maps S9040/B5626/F1758/L8095 all100;shared152 and Writer57 cases,all37 changed executable owners100;native1114112-codepoint protocol;17 unique browser cases plus4 affected cases on final build;93 tooling checks and all declared static/source gates pass. Exact evidence under task evidence/. Full all-app checkpoint40 retained,next50.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-20T02:44:31.778Z, excerpt_hash=sha256:9f540a14a3711e0929ce095f2f9a71e0f1b60882cd8bf2d9f24e15bbcd9410d7

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610200120-RV75WR/blueprint/resolved-snapshot.json
    - old_digest: ba6f765fb953d51c0029329c47bce69ffcaa08b94d4858fabbc8667d559a864e
    - current_digest: ba6f765fb953d51c0029329c47bce69ffcaa08b94d4858fabbc8667d559a864e
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610200120-RV75WR

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610200120-RV75WR
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    ### 2026-10-20T02:48:00.339Z — VERIFY — ok

    By: CODER

    Note: verified-202610200120-RV75WR
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-20T02:45:43.947Z, excerpt_hash=sha256:9f540a14a3711e0929ce095f2f9a71e0f1b60882cd8bf2d9f24e15bbcd9410d7

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610200120-RV75WR/blueprint/resolved-snapshot.json
    - old_digest: ba6f765fb953d51c0029329c47bce69ffcaa08b94d4858fabbc8667d559a864e
    - current_digest: ba6f765fb953d51c0029329c47bce69ffcaa08b94d4858fabbc8667d559a864e
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610200120-RV75WR

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202610200120-RV75WR --result verified-202610200120-RV75WR --commit 92d45eab7259381c3c07d5c92f421b034029da95
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task implementation/registration commits through a new scoped authorized task;never reset unrelated work or edit the pinned upstream reference."
  Findings: |-
    Preflight clean calc;previous task45 is verified progress. Native widths use ScCompressedArray<SCCOL,UInt16> initialized1280twips;zero setter restores standard width while source view direct size0 hides without changing the previous stored width. Existing browser fixed96px columns must be replaced by actual source geometry. Native FID_COL_WIDTH typed SfxUInt16 payload is HMM;dialog result is twips and native macro recording converts through TwipsToEvenHMM. Metric dialog default/current values are normalized in its actual selected field unit;inspect conversion/default/range quirks rather than substituting raw twips or invented metrics. Existing compressed arrays,boolean column segments,o3tl conversions and shared Writer dialog/menu infrastructure can be reused. Full device optimal widths,outline/drawing/protection/alternate views remain unported.

    - Observation: ColumnWidth native async completion requires AppendItem,IsAPI and canonical separation of SfxRequest::SetReturnValue from Done. Existing shared request and one Writer style caller conflate Done with return assignment.
      Impact: A Calc-specific completion workaround would preserve the shared simplification and violate the user explicit instruction to canonicalize common Writer modules.
      Resolution: Within the existing user authorization for direct common-module corrections and100-path scope,port consumed original call modes/append/return/completion semantics,update actual dispatcher/Writer callers and related tests,retain browser argument transport limitation explicitly,with complete changed-owner100 evidence.

    - Observation: Native numeric-field suffix parsing depends on unicode::isAlpha/isControl,including FORMAT and line/paragraph separators. The actual shared Unicode utility and ICU78.3 main-property trie were ported rather than using host Unicode properties. The local pinned ICU archive and unchanged original ICU/LibreOffice function bodies produce the same four-byte protocol for all1114112 codepoints. Original initial-NUL cache behavior is retained. No network or fabricated locale/widget/service provider was used.
    - Observation: Source XMLMeasurePropHdl uses signed32 measure defaults before the native UInt16 width argument. Independent -1cm XML now verifies the original64969twip narrowing. New source quirks are documented as CALC218..223 without changing upstream behavior.
    - Observation: Final browser regression exposed a pre-existing task45 fixture still expecting Clear disabled. It now expects only Open and native Clear enabled,retaining every other toolbar state assertion. Actual width-dialog spin accessibility reads the real normalized range/current value;the browser acceptance includes axe. Exactly100 non-task paths remain within the approved scope.
    - Observation: Native width/hide may move the actual cursor;the browser name box now refreshes from that cursor. The complete current controller and metric-dialog owners are remeasured in an all-Calc test replay;their entire maps replace earlier complete owners,without merging stale counters. All remaining Calc source hashes must match the frozen measured owners.
extensions:
  implementation_commit:
    hash: "fee73c7085d3f134eeb099d929833f4bf402bcf0"
    message: "✨ RV75WR calc: implement native column geometry and shared metric controls"
id_source: "generated"
---
## Summary

Task46: native Calc column width/visibility storage and browser geometry,ColumnWidth metric dialog,Hide/Show commands,genuine geometry history and ODS column styles. Continue the approved UI goal using shared Writer controls and source contracts.

## Scope

Only /Users/odubinkin/Projects/vite-office-calc branch calc. Up to100 non-task paths: original core ScTable/ScDocument compressed column width/hidden/flags and copy paths;native direct/show/hide view/cell shell and ScUndoWidthOrHeight owners;shared consumed numeric unit/metric widget boundary only where needed;native metric dialog state plus shared browser modal controls;controller/viewport/grid/scroll projection;ODS column styles/contexts/tokens/export;source-backed fixture migrations,focused tests/e2e and exact registry/capability/source-issue docs. Preserve1280twip default,UInt16 input casts,HMM versus twip contracts and original zero/direct visibility semantics. No fake VCL/font/device/UNO/locale services,no optimal-width calculation,rich/edit,drawing,outline/protection or alternate-view emulation. No branches,merges,network,outside files or verification weakening. Indent UI is deferred to its own task after real widths are available;do not use a fake96px width to enable it.

## Plan

1. Port source compressed column width/visibility and geometry-copy/history contracts with original defaults. 2. Replace fixed browser column geometry with projections over actual storage;wire native direct/show/hide commands and consumed metric dialog through existing shared Writer controls and typed Sfx requests. 3. Add real ODS column styles/repeats/visibility and source-derived core/browser/Worker acceptance. 4. Freeze production owners,run scoped100 and related declared checks,retain exact evidence,quality review and clean direct closure. Existing user authorization covers this safe local implementation;stop only for material scope/security/verification drift.

## Verify Steps

Read brief/route;pin native hashes/anchors. Actual compressed width/hidden storage verifies native defaults,zero fallback,UInt16 conversion,invalid coordinates,ranges,selected/grouped/disjoint sheets/columns and geometry-only copying/history without changing cells. Verify source direct width/HMM typed requests,optional FN_PARAM_1 column selection,no-argument metric dialog,default checkbox/current-value restore,normalization/ranges/unit conversions,cancel/close/dispose and snapshot admission. Verify hide/show retains stored widths and cursor/selection behavior from source;hidden/zero-width geometry cannot divide by zero or allocate cells. Real browser viewport/header/cell offsets,horizontal scroll,selection visibility and both1280/390 shared menu/dialog/shortcut paths use actual native geometry. Independently authored ODS column widths/visibility/repeats and export/reopen preserve geometry alongside existing attrs/cells;diagnose unsupported properties without silently flattening. Scoped Calc raw S/B/F/L100,related shared/Writer tests and complete changed executable application owners100,current hashes. Fresh build/focused browser primary ODS save/reload/open,Undo/Redo and DOM-free Worker,no uncaught errors. Types,root authored lint/format,dependencies,JSDoc,size,Calc/Writer resources,source tree/provenance,invariants/scoped parity,affected tooling/static,routing/doctor/diff. Retain exact argv/exits/nonempty raw/current hashes/source/browser evidence;quality review,implementation commit and clean direct closure. Full checkpoint40 retained;next50.

## Verification

Command: scoped Calc coverage plus complete-current controller,metric-dialog and XML style owner refresh;related shared and Writer coverage;fresh production browser acceptance;declared static/source/registry/routing checks.
Result: pass.
Evidence: Calc138files425cases,raw S9040/B5626/F1758/L8095 all100%;all three complete current owner/maps replace earlier complete owners without counter merging,with every unchanged owner hash retained. Shared19files152cases,S1134/B450/F101/L1077 all100% over16 complete owners. Writer2files57cases and complete docst owner S51/B54/F9/L44 all100%. All37 changed executable application owners100%;one additional static re-export header has no executable body. Native unchanged ICU78.3/LibreOffice character-type protocol matches1114112 codepoints. Tooling3files93cases passes. Browser17unique cases pass at1280/390 including primary ODS,reopen,Undo/Redo,shared controls,axe and genuine DOM-free Worker;4 affected ODS/column cases also pass on the final current build. Types,root lint,root Prettier plus all100 current changed paths,dependency directions,JSDoc,size,Calc/Writer resources,source tree/provenance,invariants,scoped parity,static build,routing,doctor and diff pass. Exact raw maps,results,source hashes,logs and commands are retained under evidence/;calc-current-proof.json,ui-proof.json,shared-proof.json,writer-proof.json and changed-owners-proof.json are authoritative. Earlier profile files are historical contexts,not current-owner substitutes.
Scope: exactly100 non-task paths inside calc checkout/branch;no network,outside files,merges or full all-app run. Last broad checkpoint40,next50. Native source quirks CALC218..223 are preserved. Remaining native services/layout/optimal-sizing/UNO transforms and broad parity remain unverified. Ready for implementation commit,verification record and quality gate.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-20T02:45:43.885Z — VERIFY — ok

By: CODER

Note: Verified fee73c7085d3: Calc425 cases and current complete maps S9040/B5626/F1758/L8095 all100;shared152 and Writer57 cases,all37 changed executable owners100;native1114112-codepoint protocol;17 unique browser cases plus4 affected cases on final build;93 tooling checks and all declared static/source gates pass. Exact evidence under task evidence/. Full all-app checkpoint40 retained,next50.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-20T02:44:31.778Z, excerpt_hash=sha256:9f540a14a3711e0929ce095f2f9a71e0f1b60882cd8bf2d9f24e15bbcd9410d7

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610200120-RV75WR/blueprint/resolved-snapshot.json
- old_digest: ba6f765fb953d51c0029329c47bce69ffcaa08b94d4858fabbc8667d559a864e
- current_digest: ba6f765fb953d51c0029329c47bce69ffcaa08b94d4858fabbc8667d559a864e
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610200120-RV75WR

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610200120-RV75WR
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

### 2026-10-20T02:48:00.339Z — VERIFY — ok

By: CODER

Note: verified-202610200120-RV75WR
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-20T02:45:43.947Z, excerpt_hash=sha256:9f540a14a3711e0929ce095f2f9a71e0f1b60882cd8bf2d9f24e15bbcd9410d7

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610200120-RV75WR/blueprint/resolved-snapshot.json
- old_digest: ba6f765fb953d51c0029329c47bce69ffcaa08b94d4858fabbc8667d559a864e
- current_digest: ba6f765fb953d51c0029329c47bce69ffcaa08b94d4858fabbc8667d559a864e
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610200120-RV75WR

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202610200120-RV75WR --result verified-202610200120-RV75WR --commit 92d45eab7259381c3c07d5c92f421b034029da95
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task implementation/registration commits through a new scoped authorized task;never reset unrelated work or edit the pinned upstream reference.

## Findings

Preflight clean calc;previous task45 is verified progress. Native widths use ScCompressedArray<SCCOL,UInt16> initialized1280twips;zero setter restores standard width while source view direct size0 hides without changing the previous stored width. Existing browser fixed96px columns must be replaced by actual source geometry. Native FID_COL_WIDTH typed SfxUInt16 payload is HMM;dialog result is twips and native macro recording converts through TwipsToEvenHMM. Metric dialog default/current values are normalized in its actual selected field unit;inspect conversion/default/range quirks rather than substituting raw twips or invented metrics. Existing compressed arrays,boolean column segments,o3tl conversions and shared Writer dialog/menu infrastructure can be reused. Full device optimal widths,outline/drawing/protection/alternate views remain unported.

- Observation: ColumnWidth native async completion requires AppendItem,IsAPI and canonical separation of SfxRequest::SetReturnValue from Done. Existing shared request and one Writer style caller conflate Done with return assignment.
  Impact: A Calc-specific completion workaround would preserve the shared simplification and violate the user explicit instruction to canonicalize common Writer modules.
  Resolution: Within the existing user authorization for direct common-module corrections and100-path scope,port consumed original call modes/append/return/completion semantics,update actual dispatcher/Writer callers and related tests,retain browser argument transport limitation explicitly,with complete changed-owner100 evidence.

- Observation: Native numeric-field suffix parsing depends on unicode::isAlpha/isControl,including FORMAT and line/paragraph separators. The actual shared Unicode utility and ICU78.3 main-property trie were ported rather than using host Unicode properties. The local pinned ICU archive and unchanged original ICU/LibreOffice function bodies produce the same four-byte protocol for all1114112 codepoints. Original initial-NUL cache behavior is retained. No network or fabricated locale/widget/service provider was used.
- Observation: Source XMLMeasurePropHdl uses signed32 measure defaults before the native UInt16 width argument. Independent -1cm XML now verifies the original64969twip narrowing. New source quirks are documented as CALC218..223 without changing upstream behavior.
- Observation: Final browser regression exposed a pre-existing task45 fixture still expecting Clear disabled. It now expects only Open and native Clear enabled,retaining every other toolbar state assertion. Actual width-dialog spin accessibility reads the real normalized range/current value;the browser acceptance includes axe. Exactly100 non-task paths remain within the approved scope.
- Observation: Native width/hide may move the actual cursor;the browser name box now refreshes from that cursor. The complete current controller and metric-dialog owners are remeasured in an all-Calc test replay;their entire maps replace earlier complete owners,without merging stale counters. All remaining Calc source hashes must match the frozen measured owners.
