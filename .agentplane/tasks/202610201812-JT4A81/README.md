---
id: "202610201812-JT4A81"
title: "Restore native Calc text-size context and shared browser line measurement"
status: "DOING"
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
  updated_at: "2026-10-20T18:12:36.438Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: restore native row text-size/script ownership and share the actual Writer browser line measurer as required groundwork for canonical automatic wrapped row layout;no substitute metrics engine."
events:
  -
    type: "status"
    at: "2026-10-20T18:12:47.283Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore native row text-size/script ownership and share the actual Writer browser line measurer as required groundwork for canonical automatic wrapped row layout;no substitute metrics engine."
doc_version: 3
doc_updated_at: "2026-10-20T18:41:31.992Z"
doc_updated_by: "CODER"
description: "Continue the required automatic wrapped-height path without a scrollHeight substitute. Restore the full original RowHeightContext scales/zoom/device-reference contract, actual document-owned script service and native cached script metadata boundaries, route existing UI script classification through those owners, and move the existing Writer DOM line measurement implementation into shared VCL for later Calc device use. Automatic wrapped layout still requires original GetNeededSize/EditEngine and remains an explicit active goal requirement."
sections:
  Summary: |-
    Restore native Calc text-size context and shared browser line measurement

    Continue the required automatic wrapped-height path without a scrollHeight substitute. Restore the full original RowHeightContext scales/zoom/device-reference contract, actual document-owned script service and native cached script metadata boundaries, route existing UI script classification through those owners, and move the existing Writer DOM line measurement implementation into shared VCL for later Calc device use. Automatic wrapped layout still requires original GetNeededSize/EditEngine and remains an explicit active goal requirement.
  Scope: "Native text-size context and script ownership required by GetNeededSize,source cached script metadata accessors,and actual shared VCL browser text-line measurement reused by Writer. Up to25 source/test files plus registry/provenance/evidence and readiness documentation. No synthetic wrapped row heights,complete EditEngine/OutputDevice/UNO claim,or replacement document model."
  Plan: "Port the original six-argument RowHeightContext constructor and all scale/zoom/output-device accessors,keeping a borrowed opaque device identity without inventing an OutputDevice implementation; migrate every current caller and test to the source constructor. Add actual ScScriptTypeData lazy XBreakIterator ownership and ScDocument GetBreakIterator/GetStringScriptType,using the real existing BreakIteratorImpl as the browser service binding rather than emulating UNO. Move the current source UI-language fallback into ScGlobal.GetDefaultScriptType and route existing Calc selection font classification through these real owners. Add original cached address GetScriptType/SetScriptType delegation through document/table/column metadata,retaining UNKNOWN,validity,sparse allocation and existing CellTextAttr reset semantics;do not pretend this is the missing formatted-cell UpdateScriptType cache. Extract existing Writer DOM Range line measurement unchanged into shared VCL and keep Writer wrappers and geometry contracts. Verify real font/selection operations and DOM-free source ownership,shared measurement in Writer Chromium,source constructor/native boundary tests and strict owner coverage. Up to25 source/test files plus corresponding registry/provenance/current-readiness/evidence records. Complete GetNeededSize/EditEngine wrapped-row auto-layout remains the next required path;no estimated row-height substitute or full completion claim. Work only calc checkout/branch;no network,merges,subagents,dependency changes or unrelated services."
  Verify Steps: "Read native source constructor/script/storage contracts and task route. Require complete Calc Istanbul100 S/B/F/L with unchanged thresholds,plus focused shared VCL measurement and affected Writer font/layout/selection tests and100 raw coverage for changed shared/Writer owners. Preserve and verify unchanged baseline source hashes for complete shared100 where reused. Run types,changed-source lint/format,dependencies,Writer/Calc resources,docs,size,tree,provenance,registry,routing,doctor,build and static-build checks. Run existing relevant Calc font/wrap desktop/mobile/Worker and Writer layout/cursor browser acceptance,inspect screenshots and preserve exact reports/commands/source hashes. Obtain evaluator pass and clean calc state. No full-suite checkpoint before60;automatic wrapped row layout remains unimplemented until actual GetNeededSize/EditEngine is ported."
  Verification: |-
    Command: exact commands,cwds and static argv are retained in evidence/commands.json. Portable verification: node .agentplane/tasks/202610201812-JT4A81/evidence/audit-archives.mjs.

    Result: pass.

    Evidence: 154 Calc files /502 tests;6 related files /35 tests;9 browser cases,0failed/0skipped/0retries. Build and14static stages pass.

    Scope: complete Calc raw Istanbul coverage100 S10454/B6489/F1958/L9380. Changed shared VCL and Writer measurement raw coverage100 separately;complete shared100 is recomputed from hash-verified unchanged task52 owners plus fresh shared owner. Raw archives,original repair logs,SHA256 source/native snapshots and4 current inspected screenshots are committed.

    Full all-app suite: not due under the user cadence;repaired checkpoint51 retained,next checkpoint60. Automatic wrapped row-height remains unported and the broader goal remains active.
  Rollback Plan: "Revert only this task implementation commit while preserving prior Wrap Text work and native reference/evidence;no history rewrite or branch changes."
  Findings: |-
    Observation: pinned RowHeightContext has six inputs;all current callers now retain original independent scales/zooms and a borrowed opaque device identity. ScScriptTypeData is a per-document owner. The original process-context creation read site is an explicit borrowed browser factory supplying the actual shared BreakIteratorImpl;Calc core imports only XBreakIterator. Empty-string laziness,empty-reference retries and native script loop are exercised with the genuine backend in jsdom,Chromium and a DOM-free Worker.
    Impact: script classification and size-context contracts now reside with their original native owners. The previous browser singleton is removed. The exact Writer DOM Range measurement algorithm is shared in VCL,while Writer retains its own node/frame/geometry packaging.
    Resolution: source review and focused/full-owner checks cover the approved slice. Cached address getters retain UNKNOWN without formatting/classification. Setter allocation preconditions are preserved and documented as CALC238;no grouped-formula context or missing metadata is invented.

    Initial repair history: initial new fixtures incorrectly treated ASCII digits as weak and referenced unavailable language constants;fixtures now use genuine weak text and real native numeric language IDs. Typecheck exposed a remaining XML import constructor call;it now uses the original six arguments. Dependency verification rejected a direct core sc-to-i18npool import;the real factory moved to the existing browser boundary without dependency-allowlist changes. Original logs remain in execution-history.json.gz. A wrong-cwd Vitest attempt found no tests;an incorrectly narrowed .ts-only local rerun was interrupted and is not accepted as coverage. The accepted rerun uses the unchanged stock vitest.calc.config.ts,including TSX and locale integration cases,with no threshold/exclusion/timeout/retry changes.

    Residual scope: GetNeededSize/GetOptimalHeight,formatted-cell UpdateScriptType/GetRangeScriptType and consumed EditEngine services remain required for automatic wrapped row heights. Native numeric-wrap suppression,90percent width threshold,paper width/margins and manual-height rules must be ported before claiming that behavior. This task supplies required contracts and the existing shared browser measurer;it does not implement an OutputDevice/UNO emulator or claim full UI/font/device/ABI parity. The broader UI goal remains active. Full repaired checkpoint51 remains evidence;next all-app checkpoint60. Only this task is closed.
id_source: "generated"
---
## Summary

Restore native Calc text-size context and shared browser line measurement

Continue the required automatic wrapped-height path without a scrollHeight substitute. Restore the full original RowHeightContext scales/zoom/device-reference contract, actual document-owned script service and native cached script metadata boundaries, route existing UI script classification through those owners, and move the existing Writer DOM line measurement implementation into shared VCL for later Calc device use. Automatic wrapped layout still requires original GetNeededSize/EditEngine and remains an explicit active goal requirement.

## Scope

Native text-size context and script ownership required by GetNeededSize,source cached script metadata accessors,and actual shared VCL browser text-line measurement reused by Writer. Up to25 source/test files plus registry/provenance/evidence and readiness documentation. No synthetic wrapped row heights,complete EditEngine/OutputDevice/UNO claim,or replacement document model.

## Plan

Port the original six-argument RowHeightContext constructor and all scale/zoom/output-device accessors,keeping a borrowed opaque device identity without inventing an OutputDevice implementation; migrate every current caller and test to the source constructor. Add actual ScScriptTypeData lazy XBreakIterator ownership and ScDocument GetBreakIterator/GetStringScriptType,using the real existing BreakIteratorImpl as the browser service binding rather than emulating UNO. Move the current source UI-language fallback into ScGlobal.GetDefaultScriptType and route existing Calc selection font classification through these real owners. Add original cached address GetScriptType/SetScriptType delegation through document/table/column metadata,retaining UNKNOWN,validity,sparse allocation and existing CellTextAttr reset semantics;do not pretend this is the missing formatted-cell UpdateScriptType cache. Extract existing Writer DOM Range line measurement unchanged into shared VCL and keep Writer wrappers and geometry contracts. Verify real font/selection operations and DOM-free source ownership,shared measurement in Writer Chromium,source constructor/native boundary tests and strict owner coverage. Up to25 source/test files plus corresponding registry/provenance/current-readiness/evidence records. Complete GetNeededSize/EditEngine wrapped-row auto-layout remains the next required path;no estimated row-height substitute or full completion claim. Work only calc checkout/branch;no network,merges,subagents,dependency changes or unrelated services.

## Verify Steps

Read native source constructor/script/storage contracts and task route. Require complete Calc Istanbul100 S/B/F/L with unchanged thresholds,plus focused shared VCL measurement and affected Writer font/layout/selection tests and100 raw coverage for changed shared/Writer owners. Preserve and verify unchanged baseline source hashes for complete shared100 where reused. Run types,changed-source lint/format,dependencies,Writer/Calc resources,docs,size,tree,provenance,registry,routing,doctor,build and static-build checks. Run existing relevant Calc font/wrap desktop/mobile/Worker and Writer layout/cursor browser acceptance,inspect screenshots and preserve exact reports/commands/source hashes. Obtain evaluator pass and clean calc state. No full-suite checkpoint before60;automatic wrapped row layout remains unimplemented until actual GetNeededSize/EditEngine is ported.

## Verification

Command: exact commands,cwds and static argv are retained in evidence/commands.json. Portable verification: node .agentplane/tasks/202610201812-JT4A81/evidence/audit-archives.mjs.

Result: pass.

Evidence: 154 Calc files /502 tests;6 related files /35 tests;9 browser cases,0failed/0skipped/0retries. Build and14static stages pass.

Scope: complete Calc raw Istanbul coverage100 S10454/B6489/F1958/L9380. Changed shared VCL and Writer measurement raw coverage100 separately;complete shared100 is recomputed from hash-verified unchanged task52 owners plus fresh shared owner. Raw archives,original repair logs,SHA256 source/native snapshots and4 current inspected screenshots are committed.

Full all-app suite: not due under the user cadence;repaired checkpoint51 retained,next checkpoint60. Automatic wrapped row-height remains unported and the broader goal remains active.

## Rollback Plan

Revert only this task implementation commit while preserving prior Wrap Text work and native reference/evidence;no history rewrite or branch changes.

## Findings

Observation: pinned RowHeightContext has six inputs;all current callers now retain original independent scales/zooms and a borrowed opaque device identity. ScScriptTypeData is a per-document owner. The original process-context creation read site is an explicit borrowed browser factory supplying the actual shared BreakIteratorImpl;Calc core imports only XBreakIterator. Empty-string laziness,empty-reference retries and native script loop are exercised with the genuine backend in jsdom,Chromium and a DOM-free Worker.
Impact: script classification and size-context contracts now reside with their original native owners. The previous browser singleton is removed. The exact Writer DOM Range measurement algorithm is shared in VCL,while Writer retains its own node/frame/geometry packaging.
Resolution: source review and focused/full-owner checks cover the approved slice. Cached address getters retain UNKNOWN without formatting/classification. Setter allocation preconditions are preserved and documented as CALC238;no grouped-formula context or missing metadata is invented.

Initial repair history: initial new fixtures incorrectly treated ASCII digits as weak and referenced unavailable language constants;fixtures now use genuine weak text and real native numeric language IDs. Typecheck exposed a remaining XML import constructor call;it now uses the original six arguments. Dependency verification rejected a direct core sc-to-i18npool import;the real factory moved to the existing browser boundary without dependency-allowlist changes. Original logs remain in execution-history.json.gz. A wrong-cwd Vitest attempt found no tests;an incorrectly narrowed .ts-only local rerun was interrupted and is not accepted as coverage. The accepted rerun uses the unchanged stock vitest.calc.config.ts,including TSX and locale integration cases,with no threshold/exclusion/timeout/retry changes.

Residual scope: GetNeededSize/GetOptimalHeight,formatted-cell UpdateScriptType/GetRangeScriptType and consumed EditEngine services remain required for automatic wrapped row heights. Native numeric-wrap suppression,90percent width threshold,paper width/margins and manual-height rules must be ported before claiming that behavior. This task supplies required contracts and the existing shared browser measurer;it does not implement an OutputDevice/UNO emulator or claim full UI/font/device/ABI parity. The broader UI goal remains active. Full repaired checkpoint51 remains evidence;next all-app checkpoint60. Only this task is closed.
