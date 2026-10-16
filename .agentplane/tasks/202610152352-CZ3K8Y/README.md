---
id: "202610152352-CZ3K8Y"
title: "Restore shared native size item contracts for Calc pool construction"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 13
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-15T23:53:03.284Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-16T00:03:41.912Z"
  updated_by: "CODER"
  note: "95related/187Calc scenarios pass;exact5shared and33Calc raw S/B/F/L100,every counter positive,no Writer gaps. All13source gates,14native pins/16constants/75unchanged unrelated algorithms,build and actual Chromium size/Writer startup-load-edit pass. Four refs restored;native size contracts only,full Calc pool/document/UI/ODS pending,no all-app run."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: restore shared size value/Any behavior and necessary Writer derived contracts using existing geometry,CPPU and conversions;preserve upstream quirks and test without native probes."
events:
  -
    type: "status"
    at: "2026-10-15T23:53:04.566Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore shared size value/Any behavior and necessary Writer derived contracts using existing geometry,CPPU and conversions;preserve upstream quirks and test without native probes."
  -
    type: "verify"
    at: "2026-10-16T00:03:41.912Z"
    author: "CODER"
    state: "ok"
    note: "95related/187Calc scenarios pass;exact5shared and33Calc raw S/B/F/L100,every counter positive,no Writer gaps. All13source gates,14native pins/16constants/75unchanged unrelated algorithms,build and actual Chromium size/Writer startup-load-edit pass. Four refs restored;native size contracts only,full Calc pool/document/UI/ODS pending,no all-app run."
doc_version: 3
doc_updated_at: "2026-10-16T00:03:41.972Z"
doc_updated_by: "CODER"
description: "Task179: canonical SvxSizeItem over actual tools Size and generated awt Size/Any,correct native member conversion/equality/scaling and necessary Writer frame-size caller migration;reuse shared geometry/conversion/CPPU. Direct prerequisite for ScDocumentPool page-size defaults,not a document or UI facade."
sections:
  Summary: "Restore the existing shared size item to native value and UNO member behavior before Calc document-pool construction;reuse tools Size,CPPU Any and unit conversions. Correct the necessary Writer derived owner and callers instead of duplicating the base."
  Scope: "SvxSizeItem shard/header and existing frmitems facade;genuine generated awt Size/Type binding;native SVL/Writer member constants;necessary SwFormatFrameSize construction,geometry access,Any query/put and native HasMetrics override;related tests,evidence,inventory/readiness/suspected cases. Maximum80non-task paths. Native finite safe-integer geometry domain and existing scalar transport stay explicit;no native binary ABI,allocator,localization/presentation service,document substitute,network or all-app run."
  Plan: "Restore actual shared SvxSizeItem native constructors,stable tools::Size value member,equality independent of Which,CreateDefault,metric scaling and complete Size/width/height Any member contracts using existing geometry,CPPU and unit conversions. Add the genuine awt Size IDL value/type binding and required native member constants. Move the single size implementation into a source responsibility shard and canonical sizeitem header;update necessary Writer frame-size construction/access/query overrides and tests to native contracts without duplicate base logic. Preserve explicit browser no-argument query transport only where actually used,without bypassing native Any calls. Do not add localization/presentation services,full pool/document facades,memory managers,native probes or all-app run. Update inventory/readiness/suspected cases;maximum80non-task paths. Verify exact source definitions/IDL/constants and unchanged unrelated algorithms;whole Calc and affected shared raw S/B/F/L100,Writer-only gaps exempt,related Writer tests,13source gates,production build and real shared Chromium plus Writer startup/load/edit. Keep overall goal active until connected UI/same-model ODS milestone."
  Verify Steps: "Pin sizeitem.hxx,frmitems.cxx,tools gen.hxx,awt Size.idl,generated struct/type-generation contracts,svl memberid.h,Writer fmtfsize.hxx/atrfrm.cxx/unomid.h and existing unit conversion definitions. Test default/explicit/copy,stable borrowed geometry and copy assignment,Which-independent payload equality,clone,all3native Any members and convert flags,int32 narrowing,bad Any failure destinations including native HEIGHT success-without-write,metric scaling signs/ties. Writer must retain native derived member contracts,always-converted queries,Put conversion selection,percent/sync/type/clamp behavior and nonmetric override. Related Writer tests and whole Calc;all measured shared executable owners raw S/B/F/L100,every raw counter positive;Writer-only gaps exempt.13source gates,production build,actual Chromium shared size scenario and Writer startup/load/edit,all4upstream refs absent at runtime and restored. No native probes or full all-app run;full UI/ODS milestone remains pending."
  Verification: |-
    Command: node output/playwright/task179-checks/native-audit.mjs. Result:pass. Evidence:14pinned native source/IDL/generator/QA blobs,16member/minimum constants,75unchanged unrelated emitted algorithm bodies;reused tools geometry,tools/o3tl conversions and dependency guard byte-identical. Scope:source-shaped shared size contracts and required Writer derived members;supporting serializer QA is geometry context only,not a claimed native size-item QA port. Command: node output/playwright/task179-checks/portable.mjs. Result:pass. Evidence:95related scenarios/12files and187Calc/76files;exact5shared raw S406/B321/F124/L368 and33Calc raw S4179/B2731/F821/L3727,every raw counter positive100;no Writer gap in this profile. Scope:actual changed/shared owners and related Writer modules,without coverage filtering. Command: node output/playwright/task179-checks/build-browser-portable.mjs. Result:pass. Evidence:production build,actual Chromium typed size/borrowed geometry/failure behavior and Writer startup/load/edit;all4source refs absent/restored. Scope:real source code/browser integration. All13source gates pass after tuple/JSDoc/facade-inventory repairs;final artifact audit required before commit. Limits:localized presentation,XML diagnostics,native binary/overflow/memory domains and full Calc pool/document/UI/ODS remain unverified;no native probe or all-app run.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-16T00:03:41.912Z — VERIFY — ok

    By: CODER

    Note: 95related/187Calc scenarios pass;exact5shared and33Calc raw S/B/F/L100,every counter positive,no Writer gaps. All13source gates,14native pins/16constants/75unchanged unrelated algorithms,build and actual Chromium size/Writer startup-load-edit pass. Four refs restored;native size contracts only,full Calc pool/document/UI/ODS pending,no all-app run.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-16T00:03:04.229Z, excerpt_hash=sha256:bcedf69e7953631632ffb8e39ed4f72aad17d6c0769f98e08708d51fcc4813fd

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610152352-CZ3K8Y/blueprint/resolved-snapshot.json
    - old_digest: f013e6f6468a3d77dc6bc11b2d72fc16788d0ad30f6779b38c14ff3d7a079b65
    - current_digest: f013e6f6468a3d77dc6bc11b2d72fc16788d0ad30f6779b38c14ff3d7a079b65
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610152352-CZ3K8Y

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610152352-CZ3K8Y
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert task179 changes only,preserving calc branch and other work;no merges or history rewriting. Restore reference symlinks in portable wrappers finally blocks. Do not weaken gates or repair Writer-only coverage gaps."
  Findings: |-
    - Observation: Initial74related tests pass and every new size/IDL/member/geometry raw counter is covered. Existing frmitems protection and border-extraction bodies remain uncovered in the selected profile after extracting the single size class.
      Impact: Strict changed shared-owner acceptance is incomplete despite unchanged unrelated algorithm bodies;no raw counters may be filtered.
      Resolution: Retain initial diagnostics and add existing native protection and line-member suites covering the unchanged owner,then rerun exact shared coverage. Fix the Writer CONVERT_TWIPS import to its actual header export;production typecheck now passes.

    - Observation: All functional cases pass and strict shared raw coverage reaches100 after exercising the existing default-true border-validity setter. Inventory initially treated facade reexports as local class declarations;lint/docs also identified test tuple assertions and missing callback documentation.
      Impact: No production semantics or verification criteria changed. The actual size class must be inventoried once in its source shard,while header and legacy exports borrow it.
      Resolution: Use const tuples and callback docs;record empty local declarations for the pure header and remove the retired local class declaration from the legacy owner semantic record. Preserve provenance exports and all prior parity statuses. Inventory and all source gates now pass;rerun final portable profiles and browser acceptance.
id_source: "generated"
---
## Summary

Restore the existing shared size item to native value and UNO member behavior before Calc document-pool construction;reuse tools Size,CPPU Any and unit conversions. Correct the necessary Writer derived owner and callers instead of duplicating the base.

## Scope

SvxSizeItem shard/header and existing frmitems facade;genuine generated awt Size/Type binding;native SVL/Writer member constants;necessary SwFormatFrameSize construction,geometry access,Any query/put and native HasMetrics override;related tests,evidence,inventory/readiness/suspected cases. Maximum80non-task paths. Native finite safe-integer geometry domain and existing scalar transport stay explicit;no native binary ABI,allocator,localization/presentation service,document substitute,network or all-app run.

## Plan

Restore actual shared SvxSizeItem native constructors,stable tools::Size value member,equality independent of Which,CreateDefault,metric scaling and complete Size/width/height Any member contracts using existing geometry,CPPU and unit conversions. Add the genuine awt Size IDL value/type binding and required native member constants. Move the single size implementation into a source responsibility shard and canonical sizeitem header;update necessary Writer frame-size construction/access/query overrides and tests to native contracts without duplicate base logic. Preserve explicit browser no-argument query transport only where actually used,without bypassing native Any calls. Do not add localization/presentation services,full pool/document facades,memory managers,native probes or all-app run. Update inventory/readiness/suspected cases;maximum80non-task paths. Verify exact source definitions/IDL/constants and unchanged unrelated algorithms;whole Calc and affected shared raw S/B/F/L100,Writer-only gaps exempt,related Writer tests,13source gates,production build and real shared Chromium plus Writer startup/load/edit. Keep overall goal active until connected UI/same-model ODS milestone.

## Verify Steps

Pin sizeitem.hxx,frmitems.cxx,tools gen.hxx,awt Size.idl,generated struct/type-generation contracts,svl memberid.h,Writer fmtfsize.hxx/atrfrm.cxx/unomid.h and existing unit conversion definitions. Test default/explicit/copy,stable borrowed geometry and copy assignment,Which-independent payload equality,clone,all3native Any members and convert flags,int32 narrowing,bad Any failure destinations including native HEIGHT success-without-write,metric scaling signs/ties. Writer must retain native derived member contracts,always-converted queries,Put conversion selection,percent/sync/type/clamp behavior and nonmetric override. Related Writer tests and whole Calc;all measured shared executable owners raw S/B/F/L100,every raw counter positive;Writer-only gaps exempt.13source gates,production build,actual Chromium shared size scenario and Writer startup/load/edit,all4upstream refs absent at runtime and restored. No native probes or full all-app run;full UI/ODS milestone remains pending.

## Verification

Command: node output/playwright/task179-checks/native-audit.mjs. Result:pass. Evidence:14pinned native source/IDL/generator/QA blobs,16member/minimum constants,75unchanged unrelated emitted algorithm bodies;reused tools geometry,tools/o3tl conversions and dependency guard byte-identical. Scope:source-shaped shared size contracts and required Writer derived members;supporting serializer QA is geometry context only,not a claimed native size-item QA port. Command: node output/playwright/task179-checks/portable.mjs. Result:pass. Evidence:95related scenarios/12files and187Calc/76files;exact5shared raw S406/B321/F124/L368 and33Calc raw S4179/B2731/F821/L3727,every raw counter positive100;no Writer gap in this profile. Scope:actual changed/shared owners and related Writer modules,without coverage filtering. Command: node output/playwright/task179-checks/build-browser-portable.mjs. Result:pass. Evidence:production build,actual Chromium typed size/borrowed geometry/failure behavior and Writer startup/load/edit;all4source refs absent/restored. Scope:real source code/browser integration. All13source gates pass after tuple/JSDoc/facade-inventory repairs;final artifact audit required before commit. Limits:localized presentation,XML diagnostics,native binary/overflow/memory domains and full Calc pool/document/UI/ODS remain unverified;no native probe or all-app run.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-16T00:03:41.912Z — VERIFY — ok

By: CODER

Note: 95related/187Calc scenarios pass;exact5shared and33Calc raw S/B/F/L100,every counter positive,no Writer gaps. All13source gates,14native pins/16constants/75unchanged unrelated algorithms,build and actual Chromium size/Writer startup-load-edit pass. Four refs restored;native size contracts only,full Calc pool/document/UI/ODS pending,no all-app run.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-16T00:03:04.229Z, excerpt_hash=sha256:bcedf69e7953631632ffb8e39ed4f72aad17d6c0769f98e08708d51fcc4813fd

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610152352-CZ3K8Y/blueprint/resolved-snapshot.json
- old_digest: f013e6f6468a3d77dc6bc11b2d72fc16788d0ad30f6779b38c14ff3d7a079b65
- current_digest: f013e6f6468a3d77dc6bc11b2d72fc16788d0ad30f6779b38c14ff3d7a079b65
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610152352-CZ3K8Y

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610152352-CZ3K8Y
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert task179 changes only,preserving calc branch and other work;no merges or history rewriting. Restore reference symlinks in portable wrappers finally blocks. Do not weaken gates or repair Writer-only coverage gaps.

## Findings

- Observation: Initial74related tests pass and every new size/IDL/member/geometry raw counter is covered. Existing frmitems protection and border-extraction bodies remain uncovered in the selected profile after extracting the single size class.
  Impact: Strict changed shared-owner acceptance is incomplete despite unchanged unrelated algorithm bodies;no raw counters may be filtered.
  Resolution: Retain initial diagnostics and add existing native protection and line-member suites covering the unchanged owner,then rerun exact shared coverage. Fix the Writer CONVERT_TWIPS import to its actual header export;production typecheck now passes.

- Observation: All functional cases pass and strict shared raw coverage reaches100 after exercising the existing default-true border-validity setter. Inventory initially treated facade reexports as local class declarations;lint/docs also identified test tuple assertions and missing callback documentation.
  Impact: No production semantics or verification criteria changed. The actual size class must be inventoried once in its source shard,while header and legacy exports borrow it.
  Resolution: Use const tuples and callback docs;record empty local declarations for the pure header and remove the retired local class declaration from the legacy owner semantic record. Preserve provenance exports and all prior parity statuses. Inventory and all source gates now pass;rerun final portable profiles and browser acceptance.
