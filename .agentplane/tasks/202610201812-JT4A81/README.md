---
id: "202610201812-JT4A81"
title: "Restore native Calc text-size context and shared browser line measurement"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
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
doc_updated_at: "2026-10-20T18:12:47.283Z"
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
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task implementation commit while preserving prior Wrap Text work and native reference/evidence;no history rewrite or branch changes."
  Findings: ""
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

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task implementation commit while preserving prior Wrap Text work and native reference/evidence;no history rewrite or branch changes.

## Findings
