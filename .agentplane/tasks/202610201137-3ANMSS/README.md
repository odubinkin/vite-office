---
id: "202610201137-3ANMSS"
title: "Implement native Calc cell border toolbar and ODS workflows"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-20T11:38:11.138Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-20T13:35:36.538Z"
  updated_by: "CODER"
  note: "verified-202610201137-3ANMSS"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-20T13:35:08.804Z"
  updated_by: "EVALUATOR"
  note: "Reviewed commit2b7c04e957fb against approved native border UI/core/ODS scope and declared evidence;scoped task criteria pass without claiming complete LibreOffice parity."
  evaluated_sha: "2b7c04e957fb3fdc6c1896af278d53bdf1390d17"
  blueprint_digest: "275c51f28d51230d0431b8aaedf4160fcaeab091983bd270ed9f01cb4a87953d"
  evidence_refs:
    - ".agentplane/tasks/202610201137-3ANMSS/README.md"
    - ".agentplane/tasks/202610201137-3ANMSS/quality/20261020-133508804-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610201137-3ANMSS/quality/20261020-133508804-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610201137-3ANMSS/quality/20261020-133508804-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610201137-3ANMSS/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610201137-3ANMSS/evidence/border-ui-ods-final.json"
    - ".agentplane/tasks/202610201137-3ANMSS/evidence/borders-1280.png"
    - ".agentplane/tasks/202610201137-3ANMSS/evidence/borders-390.png"
    - "2b7c04e957fb3fdc6c1896af278d53bdf1390d17"
  findings:
    - "Source-shaped item/cache/view/operation/history owners retain pinned defaults,validity masks,adjacent envelope ordering,admitted-success returns and documented CALC227-234 branches. Native anchors and current authored/test hashes are verified."
    - "Actual shared Writer toolbar/palette/lazy popup and common border converter are reused. Production1280/390 tests and inspected screenshots demonstrate viewport bounds,Undo/Redo,preset/style/color/diagonal interaction,keyboard focus and dismissal. Independent ODF and genuine DOM-free Worker tests prove real package/history state."
    - "All declared local gates pass;148non-task paths remain within180approved. Full all-app run intentionally remains checkpoint50 under the approved cadence. Existing shim advisory is informational;doctor exits0."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement approved native Calc border toolbar,selection history and ODS block in calc."
events:
  -
    type: "status"
    at: "2026-10-20T11:38:22.075Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved native Calc border toolbar,selection history and ODS block in calc."
  -
    type: "verify"
    at: "2026-10-20T13:35:06.725Z"
    author: "CODER"
    state: "ok"
    note: "Verified native Calc border toolbar,source selection/history,shared Writer popup controls and ODS in commit 2b7c04e957fb. Related Calc89/shared48/Writer39 tests and3 production desktop/mobile/DOM-free Worker cases pass. Current source/native hashes and inspected screenshots are recorded in evidence/border-ui-ods-final.json. Declared types,authored lint/format,resources,boundaries,docs,size,source/provenance,scoped registry,build/static,routing and doctor pass. Full all-app checkpoint remains40,next50;goal will pause after that next full run."
  -
    type: "verify"
    at: "2026-10-20T13:35:36.538Z"
    author: "CODER"
    state: "ok"
    note: "verified-202610201137-3ANMSS"
doc_version: 3
doc_updated_at: "2026-10-20T13:35:59.150Z"
doc_updated_by: "CODER"
description: "Task48 continues authorized Calc UI work only in calc checkout/branch. Deliver native cell border presets,line style/color and actual selection-frame mutation/history,using real shared box/line items,source default frame line and shared Writer browser controls. Port consumed missing border pool/cache/frame/mark owners and native ODS properties;actual grid borders and desktop/mobile/Worker acceptance. Canonicalize shared Writer helpers directly when required. Up to180 non-task paths with source-backed registries/docs/tests. Preserve native suspicious behavior and established primary/autosave/open/no-recovery policy. Only related module tests;last full all-app checkpoint40,next50. No branch,merge,network,outside files or fake native protection/device/UNO services."
sections:
  Summary: "Task48 delivers native Calc cell-border toolbar workflows over actual source attributes,selection frames,history and ODS,using the existing shared Writer visual controls. Task47 completed indentation/manual-row geometry and is verified progress on the continuing goal."
  Scope: "Only vite-office-calc on calc;up to180 non-task paths. Native cell border pool items,ScItemPoolCache and consumed frame-array/column/table/document/view/shell/history owners;actual default frame-line state and source border preset/style/color semantics;shared Writer toolbar/popup/color/presentation primitives and canonical common helpers where needed;real grid border projection;native ODF border conversion;source-backed tests,registry and documentation. Preserve native defaults,validity flags,adjacent-cell removal,grouped/disjoint marks and suspicious upstream behavior. Real existing model owners only. Unported protection,matrix/rich-edit,device/painting,outline and complete UNO/window services remain explicit;do not replace them with fake services. Preserve primary/autosave/open/no-recovery behavior. No branch/worktree,merge,network,outside files or unrelated task mutations."
  Plan: "Deliver native Calc border presets/style/color,actual selection-frame/cache/history and ODS through shared Writer controls;verify affected modules and desktop/mobile/Worker,record evidence and clean direct closure. Up to180 non-task paths;only calc,no merges/network/outside files;full all-app checkpoint50."
  Verify Steps: "Inspect pinned native pool/default/cache/frame/preset/style/color/ODS source. Related tests must prove real box/info items,validity masks,outer/inner/single-row/single-column and disjoint/grouped selection semantics,pattern coalescing,actual adjacent-cell envelope removal,real undo/redo and unchanged cell values;source default frame line,zero-width marker replacement,preset modifier and style/color ordering. Preserve native row/column geometry and source selection behavior. Independent ODF fixtures and actual ZIP package reopens verify borders and unsupported-property diagnostics. Focused browser cases exercise shared Writer controls,menus/popups,keyboard/cancel/outside handling,1280/390,actual DOM-free Worker and ODS. Run only affected Calc/shared/Writer module tests and relevant tooling;full all-app checkpoint40 remains last,next50,no blanket coverage run. Types,authored lint/format,boundaries,JSDoc,size,Calc/Writer resources,source/provenance,invariants/scoped parity,production/static build,routing,doctor,diff must pass. Retain exact commands/exits,nonempty test results,current source/test hashes,native anchors and inspected screenshots. Record implementation commit,verification,quality review and clean final tracked state."
  Verification: |-
    Pending implementation and scoped evidence;no broad native parity claim.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-20T13:35:06.725Z — VERIFY — ok

    By: CODER

    Note: Verified native Calc border toolbar,source selection/history,shared Writer popup controls and ODS in commit 2b7c04e957fb. Related Calc89/shared48/Writer39 tests and3 production desktop/mobile/DOM-free Worker cases pass. Current source/native hashes and inspected screenshots are recorded in evidence/border-ui-ods-final.json. Declared types,authored lint/format,resources,boundaries,docs,size,source/provenance,scoped registry,build/static,routing and doctor pass. Full all-app checkpoint remains40,next50;goal will pause after that next full run.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-20T13:33:47.143Z, excerpt_hash=sha256:0f61d903ce21d41e87a309e71b451760fc25552711da43a297c5150e0e54dac6

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610201137-3ANMSS/blueprint/resolved-snapshot.json
    - old_digest: 275c51f28d51230d0431b8aaedf4160fcaeab091983bd270ed9f01cb4a87953d
    - current_digest: 275c51f28d51230d0431b8aaedf4160fcaeab091983bd270ed9f01cb4a87953d
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610201137-3ANMSS

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610201137-3ANMSS
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    ### 2026-10-20T13:35:36.538Z — VERIFY — ok

    By: CODER

    Note: verified-202610201137-3ANMSS
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-20T13:35:06.874Z, excerpt_hash=sha256:0f61d903ce21d41e87a309e71b451760fc25552711da43a297c5150e0e54dac6

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610201137-3ANMSS/blueprint/resolved-snapshot.json
    - old_digest: 275c51f28d51230d0431b8aaedf4160fcaeab091983bd270ed9f01cb4a87953d
    - current_digest: 275c51f28d51230d0431b8aaedf4160fcaeab091983bd270ed9f01cb4a87953d
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610201137-3ANMSS

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202610201137-3ANMSS --result verified-202610201137-3ANMSS --commit 2b7c04e957fb3fdc6c1896af278d53bdf1390d17
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task through a separately scoped authorized change;do not reset unrelated work or alter pinned native references."
  Findings: |-
    Preflight clean calc with three stale historical DOING records left untouched. Real shared border/line items and Writer controls already exist;Calc currently lacks ATTR_BORDER/INNER pool defaults and consumed native selection-frame/cache/mutation paths. Existing actual ScMarkData envelope owners will be reused for native adjacent-cell behavior. User authorization covers canonical changes to common Writer modules. This coherent visible UI block is within the continuing approved goal;no new approval is required.

    Progress checkpoint: real frame/cache/pool/view-shell and envelope-aware native attribute history are implemented;147 related scenarios pass across11files (Calc27/shared31/Writer89). Types,changed-source lint/format,dependencies,JSDoc,size,source tree/provenance and scoped Calc registry pass. CALC227 documents source rectangular Redo dropping adjacent envelopes;the source order is retained. Core first test run exposed this original behavior;the test now independently asserts both selected and adjacent edges. Full task verification is pending toolbar/style/color/diagonal dispatch,grid projection,ODS and browser acceptance. Evidence: evidence/frame-foundation-progress.json. No full all-app test run or task-count checkpoint advancement. The three old DOING entries are historical audit/test-run/deferred-language records,not live parallel Calc work;they remain untouched.

    Final scoped implementation: all twelve original Calc border presets, last-used glyph/repetition, Shift-only validity reset, style/color and independent diagonal slots now use shared Writer toolbar/SVX controls. Native ScViewFunc/operation/cache/document/history owners retain source defaults and branches, including admitted-success returns and adjacent envelope ordering. Actual grid frames resolve neighbor conflicts through shared native SVX Array; CSS and palette are shared with Writer. Common popup content is created lazily and constrained to the viewport. No timeouts, retries or skip policies were increased.

    ODS: original cell property map, ContextFilter equal-side/equal-width reduction and finished merge preserve independent sides, compounds and diagonals through actual ZIP packages. New diagonal widths override the old spelling inside the original shorthand branch. Common SvxLineToLine now selects integral native twip conversion before IDL narrowing. Shared compound-width parsing retains original three-token consumption. CALC227-234 document and preserve suspicious source behavior. Padding margin, complex-color, merged/rich-edit/drawing/device/protection and complete UNO services remain outside the consumed slice.

    Command: exact commands and current source/test/native hashes are retained in evidence/border-ui-ods-final.json and referenced logs.
    Result: pass for 176 related module scenarios across 25 files (Calc89/shared48/Writer39), three production browser cases (1280px,390px,DOM-free Worker), plus the two Writer resource tooling checks. Tail changes to shared width parsing separately pass five independent ODS cases and33 Writer border cases. Types, authored lint/format, dependencies, JSDoc, size, source tree/provenance, resource checks, registry/scoped parity, production/static build, routing and doctor pass. Doctor reports an existing managed-shim readiness advisory but exits0; no unrelated hook/config changes were made.
    Evidence: evidence/border-ui-ods-final.json; evidence/borders-1280.png; evidence/borders-390.png. Both screenshots were visually inspected. Browser tests cover actual Undo/Redo, preset count, popup viewport bounds, style/color, diagonals, keyboard movement, source owner focus and outside dismissal; the actual Worker retains border history, value42 and ODS with typeof document undefined.
    Scope: current approved task48 only; full native parity is not claimed. Initial fixture mistakes and source-contract mismatches were repaired and rerun; previous failed logs remain under output/playwright. Final task quality review and direct closure follow the implementation commit.

    Stop condition from user: pause the active goal immediately after the next full all-app run, regardless of success/failure. Last full checkpoint40;next50. This task did not run the full suite or advance that checkpoint. The three historical DOING records remain untouched and do not constitute live parallel work.

    Closeout observation: the route-oracle task complete command exited5 before mutation because verification/evaluator records made the active task README dirty. No implementation checks failed. Persist the active task verification/quality artifacts in a task-only commit,then repeat the unchanged oracle close command. No approval scope or verification criteria change is needed.
id_source: "generated"
---
## Summary

Task48 delivers native Calc cell-border toolbar workflows over actual source attributes,selection frames,history and ODS,using the existing shared Writer visual controls. Task47 completed indentation/manual-row geometry and is verified progress on the continuing goal.

## Scope

Only vite-office-calc on calc;up to180 non-task paths. Native cell border pool items,ScItemPoolCache and consumed frame-array/column/table/document/view/shell/history owners;actual default frame-line state and source border preset/style/color semantics;shared Writer toolbar/popup/color/presentation primitives and canonical common helpers where needed;real grid border projection;native ODF border conversion;source-backed tests,registry and documentation. Preserve native defaults,validity flags,adjacent-cell removal,grouped/disjoint marks and suspicious upstream behavior. Real existing model owners only. Unported protection,matrix/rich-edit,device/painting,outline and complete UNO/window services remain explicit;do not replace them with fake services. Preserve primary/autosave/open/no-recovery behavior. No branch/worktree,merge,network,outside files or unrelated task mutations.

## Plan

Deliver native Calc border presets/style/color,actual selection-frame/cache/history and ODS through shared Writer controls;verify affected modules and desktop/mobile/Worker,record evidence and clean direct closure. Up to180 non-task paths;only calc,no merges/network/outside files;full all-app checkpoint50.

## Verify Steps

Inspect pinned native pool/default/cache/frame/preset/style/color/ODS source. Related tests must prove real box/info items,validity masks,outer/inner/single-row/single-column and disjoint/grouped selection semantics,pattern coalescing,actual adjacent-cell envelope removal,real undo/redo and unchanged cell values;source default frame line,zero-width marker replacement,preset modifier and style/color ordering. Preserve native row/column geometry and source selection behavior. Independent ODF fixtures and actual ZIP package reopens verify borders and unsupported-property diagnostics. Focused browser cases exercise shared Writer controls,menus/popups,keyboard/cancel/outside handling,1280/390,actual DOM-free Worker and ODS. Run only affected Calc/shared/Writer module tests and relevant tooling;full all-app checkpoint40 remains last,next50,no blanket coverage run. Types,authored lint/format,boundaries,JSDoc,size,Calc/Writer resources,source/provenance,invariants/scoped parity,production/static build,routing,doctor,diff must pass. Retain exact commands/exits,nonempty test results,current source/test hashes,native anchors and inspected screenshots. Record implementation commit,verification,quality review and clean final tracked state.

## Verification

Pending implementation and scoped evidence;no broad native parity claim.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-20T13:35:06.725Z — VERIFY — ok

By: CODER

Note: Verified native Calc border toolbar,source selection/history,shared Writer popup controls and ODS in commit 2b7c04e957fb. Related Calc89/shared48/Writer39 tests and3 production desktop/mobile/DOM-free Worker cases pass. Current source/native hashes and inspected screenshots are recorded in evidence/border-ui-ods-final.json. Declared types,authored lint/format,resources,boundaries,docs,size,source/provenance,scoped registry,build/static,routing and doctor pass. Full all-app checkpoint remains40,next50;goal will pause after that next full run.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-20T13:33:47.143Z, excerpt_hash=sha256:0f61d903ce21d41e87a309e71b451760fc25552711da43a297c5150e0e54dac6

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610201137-3ANMSS/blueprint/resolved-snapshot.json
- old_digest: 275c51f28d51230d0431b8aaedf4160fcaeab091983bd270ed9f01cb4a87953d
- current_digest: 275c51f28d51230d0431b8aaedf4160fcaeab091983bd270ed9f01cb4a87953d
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610201137-3ANMSS

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610201137-3ANMSS
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

### 2026-10-20T13:35:36.538Z — VERIFY — ok

By: CODER

Note: verified-202610201137-3ANMSS
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-20T13:35:06.874Z, excerpt_hash=sha256:0f61d903ce21d41e87a309e71b451760fc25552711da43a297c5150e0e54dac6

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610201137-3ANMSS/blueprint/resolved-snapshot.json
- old_digest: 275c51f28d51230d0431b8aaedf4160fcaeab091983bd270ed9f01cb4a87953d
- current_digest: 275c51f28d51230d0431b8aaedf4160fcaeab091983bd270ed9f01cb4a87953d
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610201137-3ANMSS

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202610201137-3ANMSS --result verified-202610201137-3ANMSS --commit 2b7c04e957fb3fdc6c1896af278d53bdf1390d17
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task through a separately scoped authorized change;do not reset unrelated work or alter pinned native references.

## Findings

Preflight clean calc with three stale historical DOING records left untouched. Real shared border/line items and Writer controls already exist;Calc currently lacks ATTR_BORDER/INNER pool defaults and consumed native selection-frame/cache/mutation paths. Existing actual ScMarkData envelope owners will be reused for native adjacent-cell behavior. User authorization covers canonical changes to common Writer modules. This coherent visible UI block is within the continuing approved goal;no new approval is required.

Progress checkpoint: real frame/cache/pool/view-shell and envelope-aware native attribute history are implemented;147 related scenarios pass across11files (Calc27/shared31/Writer89). Types,changed-source lint/format,dependencies,JSDoc,size,source tree/provenance and scoped Calc registry pass. CALC227 documents source rectangular Redo dropping adjacent envelopes;the source order is retained. Core first test run exposed this original behavior;the test now independently asserts both selected and adjacent edges. Full task verification is pending toolbar/style/color/diagonal dispatch,grid projection,ODS and browser acceptance. Evidence: evidence/frame-foundation-progress.json. No full all-app test run or task-count checkpoint advancement. The three old DOING entries are historical audit/test-run/deferred-language records,not live parallel Calc work;they remain untouched.

Final scoped implementation: all twelve original Calc border presets, last-used glyph/repetition, Shift-only validity reset, style/color and independent diagonal slots now use shared Writer toolbar/SVX controls. Native ScViewFunc/operation/cache/document/history owners retain source defaults and branches, including admitted-success returns and adjacent envelope ordering. Actual grid frames resolve neighbor conflicts through shared native SVX Array; CSS and palette are shared with Writer. Common popup content is created lazily and constrained to the viewport. No timeouts, retries or skip policies were increased.

ODS: original cell property map, ContextFilter equal-side/equal-width reduction and finished merge preserve independent sides, compounds and diagonals through actual ZIP packages. New diagonal widths override the old spelling inside the original shorthand branch. Common SvxLineToLine now selects integral native twip conversion before IDL narrowing. Shared compound-width parsing retains original three-token consumption. CALC227-234 document and preserve suspicious source behavior. Padding margin, complex-color, merged/rich-edit/drawing/device/protection and complete UNO services remain outside the consumed slice.

Command: exact commands and current source/test/native hashes are retained in evidence/border-ui-ods-final.json and referenced logs.
Result: pass for 176 related module scenarios across 25 files (Calc89/shared48/Writer39), three production browser cases (1280px,390px,DOM-free Worker), plus the two Writer resource tooling checks. Tail changes to shared width parsing separately pass five independent ODS cases and33 Writer border cases. Types, authored lint/format, dependencies, JSDoc, size, source tree/provenance, resource checks, registry/scoped parity, production/static build, routing and doctor pass. Doctor reports an existing managed-shim readiness advisory but exits0; no unrelated hook/config changes were made.
Evidence: evidence/border-ui-ods-final.json; evidence/borders-1280.png; evidence/borders-390.png. Both screenshots were visually inspected. Browser tests cover actual Undo/Redo, preset count, popup viewport bounds, style/color, diagonals, keyboard movement, source owner focus and outside dismissal; the actual Worker retains border history, value42 and ODS with typeof document undefined.
Scope: current approved task48 only; full native parity is not claimed. Initial fixture mistakes and source-contract mismatches were repaired and rerun; previous failed logs remain under output/playwright. Final task quality review and direct closure follow the implementation commit.

Stop condition from user: pause the active goal immediately after the next full all-app run, regardless of success/failure. Last full checkpoint40;next50. This task did not run the full suite or advance that checkpoint. The three historical DOING records remain untouched and do not constitute live parallel work.

Closeout observation: the route-oracle task complete command exited5 before mutation because verification/evaluator records made the active task README dirty. No implementation checks failed. Persist the active task verification/quality artifacts in a task-only commit,then repeat the unchanged oracle close command. No approval scope or verification criteria change is needed.
