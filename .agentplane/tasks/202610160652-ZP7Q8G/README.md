---
id: "202610160652-ZP7Q8G"
title: "Compile basic arithmetic formula tokens to canonical RPN"
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
  updated_at: "2026-10-16T06:52:54.645Z"
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
    body: "Start: implement source-backed shared arithmetic token compilation for the minimal Calc formula path, preserving explicit unsupported boundaries and existing token owners."
events:
  -
    type: "status"
    at: "2026-10-16T06:52:59.373Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement source-backed shared arithmetic token compilation for the minimal Calc formula path, preserving explicit unsupported boundaries and existing token owners."
doc_version: 3
doc_updated_at: "2026-10-16T06:52:59.373Z"
doc_updated_by: "CODER"
description: "Advance the minimal Calc formula editing path by extending the existing shared FormulaCompiler with the source-shaped scalar arithmetic compilation subset over the actual FormulaTokenArray. No UI, locale expansion or alternate expression model."
sections:
  Summary: "Task199: implement the existing shared FormulaCompiler scalar token-to-RPN arithmetic subset required by upcoming Calc formula entry/evaluation. Reuse FormulaTokenArray and real FormulaToken identities; no new grid or AST."
  Scope: "Existing shared formula/source/core/api/FormulaCompiler.ts; focused arithmetic tests; its runtime/provenance records and existing capability; Calc readiness documentation and task evidence. Preserve static jump classification. Supported default-mode tokens: ocPush, parentheses, scalar arithmetic, unary negation, percent and whitespace. Other opcode families or non-default implicit-intersection/matrix compilation modes must reject explicitly before modifying RPN. No text scanner, Calc formula-cell/recalc, ODS or UI implementation in this slice."
  Plan: "1. Audit pinned compiler grammar, defaults, first-error virtual hook and arithmetic QA. 2. Extend the existing shared owner into a class with source-shaped precedence/member boundaries and actual shared array output. 3. Verify precedence, token identity, errors, repeat compilation and explicit unsupported boundaries. 4. Update inventory without claiming full compiler parity; run portable Calc coverage and strict changed-shared coverage, related token tests, browser/Worker smoke, source gates and same-agent evaluation."
  Verify Steps: |-
    - node output/playwright/task199-checks/source-audit.mjs: source-backed precedence/default/error/return-value audit, no native execution.
    - node output/playwright/task199-checks/portable.mjs: whole Calc strict raw S/B/F/L100 with exact owner set; changed shared FormulaCompiler every counter positive and related formula token/array tests, all reference links absent/restored.
    - node output/playwright/task199-checks/browser-portable.mjs: production build and actual compiled shared compiler in Chromium/DOM-free Worker; same-model scalar Calc smoke.
    - node output/playwright/task199-checks/source-gates.mjs: format/lint/types/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff.
    - Final hash/scope audit, recorded verify/source commit/same-agent quality review before finish. No full all-app run until minimal formula editing and same-model ODS are ready; then pause. UI remains separate.
  Verification: "Pending implementation and checks."
  Rollback Plan: "Revert only the task source/metadata commits, preserving unrelated work and the deferred LanguageTag snapshot. No destructive reset."
  Findings: "The previous turn completed task198 with commit 3ed61a9e7d027d599ff76898163e88ca1024f4d6 and clean calc branch. User standing approval covers minimal core work; UI implementation explicitly excluded. Native compilation returns subtotal presence, not success. Native power is left associative and unary negation binds before power. Base SetError is a real empty virtual operation; error-recording belongs to ScCompiler override and must not be silently relocated to the shared base."
id_source: "generated"
---
## Summary

Task199: implement the existing shared FormulaCompiler scalar token-to-RPN arithmetic subset required by upcoming Calc formula entry/evaluation. Reuse FormulaTokenArray and real FormulaToken identities; no new grid or AST.

## Scope

Existing shared formula/source/core/api/FormulaCompiler.ts; focused arithmetic tests; its runtime/provenance records and existing capability; Calc readiness documentation and task evidence. Preserve static jump classification. Supported default-mode tokens: ocPush, parentheses, scalar arithmetic, unary negation, percent and whitespace. Other opcode families or non-default implicit-intersection/matrix compilation modes must reject explicitly before modifying RPN. No text scanner, Calc formula-cell/recalc, ODS or UI implementation in this slice.

## Plan

1. Audit pinned compiler grammar, defaults, first-error virtual hook and arithmetic QA. 2. Extend the existing shared owner into a class with source-shaped precedence/member boundaries and actual shared array output. 3. Verify precedence, token identity, errors, repeat compilation and explicit unsupported boundaries. 4. Update inventory without claiming full compiler parity; run portable Calc coverage and strict changed-shared coverage, related token tests, browser/Worker smoke, source gates and same-agent evaluation.

## Verify Steps

- node output/playwright/task199-checks/source-audit.mjs: source-backed precedence/default/error/return-value audit, no native execution.
- node output/playwright/task199-checks/portable.mjs: whole Calc strict raw S/B/F/L100 with exact owner set; changed shared FormulaCompiler every counter positive and related formula token/array tests, all reference links absent/restored.
- node output/playwright/task199-checks/browser-portable.mjs: production build and actual compiled shared compiler in Chromium/DOM-free Worker; same-model scalar Calc smoke.
- node output/playwright/task199-checks/source-gates.mjs: format/lint/types/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff.
- Final hash/scope audit, recorded verify/source commit/same-agent quality review before finish. No full all-app run until minimal formula editing and same-model ODS are ready; then pause. UI remains separate.

## Verification

Pending implementation and checks.

## Rollback Plan

Revert only the task source/metadata commits, preserving unrelated work and the deferred LanguageTag snapshot. No destructive reset.

## Findings

The previous turn completed task198 with commit 3ed61a9e7d027d599ff76898163e88ca1024f4d6 and clean calc branch. User standing approval covers minimal core work; UI implementation explicitly excluded. Native compilation returns subtotal presence, not success. Native power is left associative and unary negation binds before power. Base SetError is a real empty virtual operation; error-recording belongs to ScCompiler override and must not be silently relocated to the shared base.
