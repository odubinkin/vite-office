---
id: "202610181334-NXE4RF"
title: "Serialize scalar Calc formulas through canonical compiler owners"
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
  updated_at: "2026-10-18T13:36:22.554Z"
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
    body: "Start: serialize real scalar/local-reference tokens through shared and Calc compiler owners for ODS, with consumed native decimal formatting and no UI or second formula model."
events:
  -
    type: "status"
    at: "2026-10-18T13:36:27.766Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: serialize real scalar/local-reference tokens through shared and Calc compiler owners for ODS, with consumed native decimal formatting and no UI or second formula model."
doc_version: 3
doc_updated_at: "2026-10-18T13:36:27.766Z"
doc_updated_by: "CODER"
description: "Task202: expose source-token formula serialization on the actual shared FormulaCompiler/Calc compiler/cell/document chain for same-model ODS. Implement the consumed native RTL Automatic/Max decimal-format specialization with JS shortest-decimal primitives and source integer rounding; retain native exponent/default/sign rules. No UI or broad locale/function parity."
sections:
  Summary: "Task202: serialize the actual scalar/local-reference formula token owner through shared FormulaCompiler, ScCompiler reference output and ScFormulaCell.GetFormula(GRAM_ODFF), directly enabling same-model ODS export. No UI implementation."
  Scope: "Existing formula/source/core/api/FormulaCompiler.ts, sc/source/core/tool/compiler.ts, sc/source/core/data/formulacell.ts and their header facades as needed. Shared consumed Automatic/Max/erase/no-group RTL decimal specialization in sal/rtl/strtmpl.math.ts, with native JS shortest decimal decomposition and exact integer half-up rounding; formula/inc/core_resource.ts bounded real ODFF resource data reused by the scanner and serializer. English ODFF only; native shared compiler grammar state/default and native empty reference virtual are preserved; actual string/space tokens may serialize without promising interpreter support. Original buffer/output-reference contracts use actual OUString assignment or returned text fragments, no physical buffer/memory manager. Paired inventory/provenance/capabilities, readiness/journal docs and focused tests including numeric-format source witnesses and real Chromium/Worker formula serialization. No full locale/format modes, names/external/range/function/matrix/rewrite services or document-native grammar facade are claimed."
  Plan: "1. Audit pinned FormulaCompiler token-array/token/AppendDouble flow, native RTL Automatic/Max rounding/exponent rules, ScCompiler ODFF reference convention and ScFormulaCell GetFormula. 2. Implement actual source owners and reuse native ODFF resource data and shared strings; preserve explicit unsupported boundaries. 3. Verify canonical source/result serialization, edits and A1 offset/absolute flags, signed zero/infinities/rounding/max/subnormal numeric cases, no mutation of code/RPN/result, and actual browser/Worker portability. 4. Update paired inventory without parity promotion; record raw100 whole Calc/changed shared and related tests, existing source gates, source/path/hash audits, commit and same-agent quality review."
  Verify Steps: |-
    node output/playwright/task202-checks/source-audit.mjs: pinned source behavior/markers/hashes, no native compilation.
    node output/playwright/task202-checks/portable.mjs: whole Calc strict raw S/B/F/L100 exact owners plus all changed shared owners every raw counter positive and related compiler/token/SAL tests; all5native references absent/restored; Writer-only gaps exempt.
    node output/playwright/task202-checks/browser-portable.mjs: production build and actual Calc formula serialization in Chromium and DOM-free Worker with all5native references absent/restored.
    node output/playwright/task202-checks/source-gates.mjs: all13existing format/lint/types/docs/size/dependency/tree/provenance/inventory/routing/doctor/diff/boundary gates, no criteria relaxation.
    Final exact path/hash/reference/coverage audit; recorded verification, source commit and same-agent quality review. No UI/ODS readiness or full all-app run until minimal ODS milestone.
  Verification: "Pending approved implementation and all declared checks."
  Rollback Plan: "Revert only the task202 implementation commit and associated inventory/docs;retain completed task201 and shared existing owners. No branch integration or user changes."
  Findings: "Standing user approval covers minimal canonical core and same-model ODS, shared-module corrections and native JS primitives where behavior agrees. UI remains a separate task. Prior goal turn completed task201 at229b0d18a438/close7b709ebd2359 and counts as progress. Next full all-app run is due at minimal editable-core plus ODS readiness, then pause."
id_source: "generated"
---
## Summary

Task202: serialize the actual scalar/local-reference formula token owner through shared FormulaCompiler, ScCompiler reference output and ScFormulaCell.GetFormula(GRAM_ODFF), directly enabling same-model ODS export. No UI implementation.

## Scope

Existing formula/source/core/api/FormulaCompiler.ts, sc/source/core/tool/compiler.ts, sc/source/core/data/formulacell.ts and their header facades as needed. Shared consumed Automatic/Max/erase/no-group RTL decimal specialization in sal/rtl/strtmpl.math.ts, with native JS shortest decimal decomposition and exact integer half-up rounding; formula/inc/core_resource.ts bounded real ODFF resource data reused by the scanner and serializer. English ODFF only; native shared compiler grammar state/default and native empty reference virtual are preserved; actual string/space tokens may serialize without promising interpreter support. Original buffer/output-reference contracts use actual OUString assignment or returned text fragments, no physical buffer/memory manager. Paired inventory/provenance/capabilities, readiness/journal docs and focused tests including numeric-format source witnesses and real Chromium/Worker formula serialization. No full locale/format modes, names/external/range/function/matrix/rewrite services or document-native grammar facade are claimed.

## Plan

1. Audit pinned FormulaCompiler token-array/token/AppendDouble flow, native RTL Automatic/Max rounding/exponent rules, ScCompiler ODFF reference convention and ScFormulaCell GetFormula. 2. Implement actual source owners and reuse native ODFF resource data and shared strings; preserve explicit unsupported boundaries. 3. Verify canonical source/result serialization, edits and A1 offset/absolute flags, signed zero/infinities/rounding/max/subnormal numeric cases, no mutation of code/RPN/result, and actual browser/Worker portability. 4. Update paired inventory without parity promotion; record raw100 whole Calc/changed shared and related tests, existing source gates, source/path/hash audits, commit and same-agent quality review.

## Verify Steps

node output/playwright/task202-checks/source-audit.mjs: pinned source behavior/markers/hashes, no native compilation.
node output/playwright/task202-checks/portable.mjs: whole Calc strict raw S/B/F/L100 exact owners plus all changed shared owners every raw counter positive and related compiler/token/SAL tests; all5native references absent/restored; Writer-only gaps exempt.
node output/playwright/task202-checks/browser-portable.mjs: production build and actual Calc formula serialization in Chromium and DOM-free Worker with all5native references absent/restored.
node output/playwright/task202-checks/source-gates.mjs: all13existing format/lint/types/docs/size/dependency/tree/provenance/inventory/routing/doctor/diff/boundary gates, no criteria relaxation.
Final exact path/hash/reference/coverage audit; recorded verification, source commit and same-agent quality review. No UI/ODS readiness or full all-app run until minimal ODS milestone.

## Verification

Pending approved implementation and all declared checks.

## Rollback Plan

Revert only the task202 implementation commit and associated inventory/docs;retain completed task201 and shared existing owners. No branch integration or user changes.

## Findings

Standing user approval covers minimal canonical core and same-model ODS, shared-module corrections and native JS primitives where behavior agrees. UI remains a separate task. Prior goal turn completed task201 at229b0d18a438/close7b709ebd2359 and counts as progress. Next full all-app run is due at minimal editable-core plus ODS readiness, then pause.
