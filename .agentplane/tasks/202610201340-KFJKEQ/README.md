---
id: "202610201340-KFJKEQ"
title: "Implement native Calc text shadow and relief pipeline"
result_summary: "Native Calc shadow and relief preserve history ODS and ordered text raster effects"
status: "DONE"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-20T13:40:56.703Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-20T14:05:45.468Z"
  updated_by: "CODER"
  note: "Verified commit36cf91269a43: native Shadowed/CharacterRelief state,real attribute history,shared Writer menu,canonical XML handlers and common VCL browser raster effects. Calc16/shared11 cases,91related tooling cases and8production browser cases pass;expanded4case shadow/relief acceptance also passes with desktop/mobile primary ODS reopens and DOM-free Worker. Current source/native hashes and4inspected screenshots are retained in evidence/text-effects-final.json. Declared local gates pass without broad native parity claims. Last full checkpoint40,next50;pause goal after that next full run regardless of outcome."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-20T14:05:47.040Z"
  updated_by: "EVALUATOR"
  note: "Reviewed commit36cf91269a43 against approved scoped native text-effect implementation and concrete evidence;criteria pass with explicit browser device limits."
  evaluated_sha: "36cf91269a43ede8ad36444521da75de2450f294"
  blueprint_digest: "2626794ed05943edc7c8ee0674dfa84d889a4bd8edf2bbac99759002cde584a8"
  evidence_refs:
    - ".agentplane/tasks/202610201340-KFJKEQ/README.md"
    - ".agentplane/tasks/202610201340-KFJKEQ/quality/20261020-140547040-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610201340-KFJKEQ/quality/20261020-140547040-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610201340-KFJKEQ/quality/20261020-140547040-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610201340-KFJKEQ/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610201340-KFJKEQ/evidence/text-effects-final.json"
    - ".agentplane/tasks/202610201340-KFJKEQ/evidence/native-value-edge-diff.patch"
    - ".agentplane/tasks/202610201340-KFJKEQ/evidence/shadow-reopened-390.png"
    - ".agentplane/tasks/202610201340-KFJKEQ/evidence/relief-black-lines-raster.png"
    - "36cf91269a43ede8ad36444521da75de2450f294"
  findings:
    - "Actual source shadow108/relief124 items,default/mixed states,complete typed arguments and real selection/history are consumed. Shadow uses the existing Writer menu control;native nonconfigurable CharacterRelief receives no invented placement."
    - "Canonical shared XML handlers preserve original constructor,Any,exact lexical and unusual output branches. Independent XML fixtures and repeated real packages prove persistence;CALC235/236 retain suspicious upstream behavior."
    - "Common browser raster owner preserves relief precedence,exact black-to-white changes,independent line colors,source luminance/offset and shadow/outline order over one accessible text raster. Desktop/mobile primary ODS and genuine Worker acceptance pass;four screenshots inspected. Obsolete outline-only production owner was removed with references migrated."
    - "49non-task paths fit120approved. Only exact native Any/TypeClass dependency data was added;general guard algorithms/restrictions remain unchanged and91related tooling cases pass. Types,authored lint/format,resources,docs,size,source/provenance,scoped registry,build/static,routing and doctor pass."
commit:
  hash: "36cf91269a43ede8ad36444521da75de2450f294"
  message: "✨ KFJKEQ calc: connect native shadow relief and shared text raster"
comments:
  -
    author: "CODER"
    body: "Start: implement approved native shadow and relief text effects with shared Writer controls and source XML/raster contracts."
  -
    author: "CODER"
    body: "Verified: native Calc shadow and relief preserve real selection history and ODS through shared Writer menu controls and original ordered VCL browser raster effects. Related module/tooling and desktop/mobile/DOM-free Worker checks pass with inspected screenshots and source hashes."
events:
  -
    type: "status"
    at: "2026-10-20T13:41:25.367Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved native shadow and relief text effects with shared Writer controls and source XML/raster contracts."
  -
    type: "verify"
    at: "2026-10-20T14:05:45.468Z"
    author: "CODER"
    state: "ok"
    note: "Verified commit36cf91269a43: native Shadowed/CharacterRelief state,real attribute history,shared Writer menu,canonical XML handlers and common VCL browser raster effects. Calc16/shared11 cases,91related tooling cases and8production browser cases pass;expanded4case shadow/relief acceptance also passes with desktop/mobile primary ODS reopens and DOM-free Worker. Current source/native hashes and4inspected screenshots are retained in evidence/text-effects-final.json. Declared local gates pass without broad native parity claims. Last full checkpoint40,next50;pause goal after that next full run regardless of outcome."
  -
    type: "status"
    at: "2026-10-20T14:06:20.268Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: native Calc shadow and relief preserve real selection history and ODS through shared Writer menu controls and original ordered VCL browser raster effects. Related module/tooling and desktop/mobile/DOM-free Worker checks pass with inspected screenshots and source hashes."
doc_version: 3
doc_updated_at: "2026-10-20T14:06:20.271Z"
doc_updated_by: "CODER"
description: "Task49: connect native font shadow/relief attributes,state,history and ODS to shared Writer menu controls and source-ordered common VCL special-text painting;keep calc branch and pause goal after next full checkpoint50."
sections:
  Summary: "Task49 adds native Calc text shadow and relief state/operations/ODS and shared browser VCL special-text painting. It continues the approved UI goal after task48."
  Scope: "Only vite-office-calc on calc;up to120 non-task paths. Existing native shadow108/relief124 items and ScFormatShell/view/controller/slot owners;source shadow XML handler and chained text property mapping;shared VCL browser special-text raster pipeline preserving original relief/shadow/outline order and colors;existing Writer menu controls and source resource placements;focused tests,registry and evidence. No fake native device,font or UNO services. Browser metrics remain actual browser measurements with explicit device-parity limitations. No merges,branches,network,outside files or unrelated historical tasks. Preserve Writer primary/autosave/open/no-recovery policy. Document suspicious upstream branches without repairing them."
  Plan: "Implement source-shaped Calc shadow/relief commands,state,history and ODS with shared Writer controls and original ordered VCL raster effects;up to120non-task paths,only calc. Verify related modules and desktop/mobile/Worker plus declared gates. No full run before checkpoint50;pause goal after that run."
  Verify Steps: "Source anchors: native formatsh ExecuteAttr/GetAttrState,SVX items/pool defaults,shdwdhdl.cxx/txtprhdl.cxx/txtprmap.cxx and OutputDevice::ImplDrawSpecialText. Affected Calc/shared/Writer tests must assert actual mapped items/default/mixed/typed-argument/no-argument semantics,real selection/history and unchanged values;literal native luminance/offset/color/layer order,relief overriding shadow/outline and outline/shadow combination;independent XML lexical cases and repeated actual ZIP reopens. Production browser tests cover shared menu controls,desktop1280/mobile390 and inspected raster screenshots;actual DOM-free Worker covers source operations/history/ODS. Run only affected tests until full checkpoint50;do not change retries/timeouts/skip policies. Run types,changed authored lint/format,dependencies,JSDoc,size,resource generation,source/provenance,registry/scoped parity,production/static build,routing,doctor,diff. Retain commands/exits,test counts,current source/test/native hashes and screenshots;record implementation commit,verification,quality review and clean tracked state."
  Verification: |-
    Pending implementation and declared evidence.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-20T14:05:45.468Z — VERIFY — ok

    By: CODER

    Note: Verified commit36cf91269a43: native Shadowed/CharacterRelief state,real attribute history,shared Writer menu,canonical XML handlers and common VCL browser raster effects. Calc16/shared11 cases,91related tooling cases and8production browser cases pass;expanded4case shadow/relief acceptance also passes with desktop/mobile primary ODS reopens and DOM-free Worker. Current source/native hashes and4inspected screenshots are retained in evidence/text-effects-final.json. Declared local gates pass without broad native parity claims. Last full checkpoint40,next50;pause goal after that next full run regardless of outcome.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-20T14:04:28.463Z, excerpt_hash=sha256:d65941a8dde4ef21b2ebb96c2e98073d61a85de25c35622545997491d7ffa517

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610201340-KFJKEQ/blueprint/resolved-snapshot.json
    - old_digest: 2626794ed05943edc7c8ee0674dfa84d889a4bd8edf2bbac99759002cde584a8
    - current_digest: 2626794ed05943edc7c8ee0674dfa84d889a4bd8edf2bbac99759002cde584a8
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610201340-KFJKEQ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610201340-KFJKEQ
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task through separately scoped authorized changes;never reset unrelated work or alter pinned upstream sources."
  Findings: |-
    Task49 implements original shadow108 and relief124 commands/state through actual native attribute operations/history and shared Writer menus. CharacterRelief remains native nonconfigurable,with no invented menu/toolbar placement. Shared XMLShadowedPropHdl and XMLConstantsPropertyHandler retain exact source lexical,required constructor,typed Any and failure/output contracts(CALC235/236). The common VCL browser special-text owner preserves relief precedence,black-to-white relief foreground and independent line colors,native luminance/offset arithmetic and source shadow/contour draw order;the obsolete outline-only production wrapper was removed. Actual browser CSS bounds/96dpi remain an explicit adaptation,not fake native font/device services. Full device,font,printer,mixed-script/rich-edit/Sfx/UNO parity remains unverified.
    Command: exact commands,exits and current authored/native hashes are retained in evidence/text-effects-final.json and copied scoped logs.
    Result: pass for16Calc cases across4files,11shared cases across3files,91related tooling cases across3files and8production browser cases across2files. The expanded four-case shadow/relief production spec separately passes with actual primary ODS reopens,desktop1280/mobile390,outline composition,independent line colors,black-to-white relief and genuine DOM-free Worker shadow/relief/history/ODS. All four saved raster screenshots were visually inspected. Types,authored lint/format,dependencies,JSDoc,size,resources,source tree/provenance,registry/scoped parity,build/static,routing and doctor pass. Existing shim readiness advisory is informational;no hooks/config changed.
    Evidence: evidence/text-effects-final.json and its referenced logs/screenshots;native-value-edge-diff.patch records exact dependency data changes. Only source-backed Any/TypeClass edges were admitted for the new common handlers;general module restrictions and guard algorithms remain unchanged and negative tests pass. Initial fixture matcher/typed-union and exact-import gate failures were repaired and rerun. No timeout,retry,skip or pass-criterion changes were made. No existing Writer runtime imports the former outline-only module or new handlers;Writer resource checks pass and unrelated Writer tests were not run.
    Scope:49non-task paths within120approved. Three stale historical DOING records remain untouched. Last full checkpoint40,next50. Pause the active goal immediately after that next full all-app run regardless of success/failure. No full run occurred in task49.
id_source: "generated"
---
## Summary

Task49 adds native Calc text shadow and relief state/operations/ODS and shared browser VCL special-text painting. It continues the approved UI goal after task48.

## Scope

Only vite-office-calc on calc;up to120 non-task paths. Existing native shadow108/relief124 items and ScFormatShell/view/controller/slot owners;source shadow XML handler and chained text property mapping;shared VCL browser special-text raster pipeline preserving original relief/shadow/outline order and colors;existing Writer menu controls and source resource placements;focused tests,registry and evidence. No fake native device,font or UNO services. Browser metrics remain actual browser measurements with explicit device-parity limitations. No merges,branches,network,outside files or unrelated historical tasks. Preserve Writer primary/autosave/open/no-recovery policy. Document suspicious upstream branches without repairing them.

## Plan

Implement source-shaped Calc shadow/relief commands,state,history and ODS with shared Writer controls and original ordered VCL raster effects;up to120non-task paths,only calc. Verify related modules and desktop/mobile/Worker plus declared gates. No full run before checkpoint50;pause goal after that run.

## Verify Steps

Source anchors: native formatsh ExecuteAttr/GetAttrState,SVX items/pool defaults,shdwdhdl.cxx/txtprhdl.cxx/txtprmap.cxx and OutputDevice::ImplDrawSpecialText. Affected Calc/shared/Writer tests must assert actual mapped items/default/mixed/typed-argument/no-argument semantics,real selection/history and unchanged values;literal native luminance/offset/color/layer order,relief overriding shadow/outline and outline/shadow combination;independent XML lexical cases and repeated actual ZIP reopens. Production browser tests cover shared menu controls,desktop1280/mobile390 and inspected raster screenshots;actual DOM-free Worker covers source operations/history/ODS. Run only affected tests until full checkpoint50;do not change retries/timeouts/skip policies. Run types,changed authored lint/format,dependencies,JSDoc,size,resource generation,source/provenance,registry/scoped parity,production/static build,routing,doctor,diff. Retain commands/exits,test counts,current source/test/native hashes and screenshots;record implementation commit,verification,quality review and clean tracked state.

## Verification

Pending implementation and declared evidence.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-20T14:05:45.468Z — VERIFY — ok

By: CODER

Note: Verified commit36cf91269a43: native Shadowed/CharacterRelief state,real attribute history,shared Writer menu,canonical XML handlers and common VCL browser raster effects. Calc16/shared11 cases,91related tooling cases and8production browser cases pass;expanded4case shadow/relief acceptance also passes with desktop/mobile primary ODS reopens and DOM-free Worker. Current source/native hashes and4inspected screenshots are retained in evidence/text-effects-final.json. Declared local gates pass without broad native parity claims. Last full checkpoint40,next50;pause goal after that next full run regardless of outcome.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-20T14:04:28.463Z, excerpt_hash=sha256:d65941a8dde4ef21b2ebb96c2e98073d61a85de25c35622545997491d7ffa517

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610201340-KFJKEQ/blueprint/resolved-snapshot.json
- old_digest: 2626794ed05943edc7c8ee0674dfa84d889a4bd8edf2bbac99759002cde584a8
- current_digest: 2626794ed05943edc7c8ee0674dfa84d889a4bd8edf2bbac99759002cde584a8
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610201340-KFJKEQ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610201340-KFJKEQ
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task through separately scoped authorized changes;never reset unrelated work or alter pinned upstream sources.

## Findings

Task49 implements original shadow108 and relief124 commands/state through actual native attribute operations/history and shared Writer menus. CharacterRelief remains native nonconfigurable,with no invented menu/toolbar placement. Shared XMLShadowedPropHdl and XMLConstantsPropertyHandler retain exact source lexical,required constructor,typed Any and failure/output contracts(CALC235/236). The common VCL browser special-text owner preserves relief precedence,black-to-white relief foreground and independent line colors,native luminance/offset arithmetic and source shadow/contour draw order;the obsolete outline-only production wrapper was removed. Actual browser CSS bounds/96dpi remain an explicit adaptation,not fake native font/device services. Full device,font,printer,mixed-script/rich-edit/Sfx/UNO parity remains unverified.
Command: exact commands,exits and current authored/native hashes are retained in evidence/text-effects-final.json and copied scoped logs.
Result: pass for16Calc cases across4files,11shared cases across3files,91related tooling cases across3files and8production browser cases across2files. The expanded four-case shadow/relief production spec separately passes with actual primary ODS reopens,desktop1280/mobile390,outline composition,independent line colors,black-to-white relief and genuine DOM-free Worker shadow/relief/history/ODS. All four saved raster screenshots were visually inspected. Types,authored lint/format,dependencies,JSDoc,size,resources,source tree/provenance,registry/scoped parity,build/static,routing and doctor pass. Existing shim readiness advisory is informational;no hooks/config changed.
Evidence: evidence/text-effects-final.json and its referenced logs/screenshots;native-value-edge-diff.patch records exact dependency data changes. Only source-backed Any/TypeClass edges were admitted for the new common handlers;general module restrictions and guard algorithms remain unchanged and negative tests pass. Initial fixture matcher/typed-union and exact-import gate failures were repaired and rerun. No timeout,retry,skip or pass-criterion changes were made. No existing Writer runtime imports the former outline-only module or new handlers;Writer resource checks pass and unrelated Writer tests were not run.
Scope:49non-task paths within120approved. Three stale historical DOING records remain untouched. Last full checkpoint40,next50. Pause the active goal immediately after that next full all-app run regardless of success/failure. No full run occurred in task49.
