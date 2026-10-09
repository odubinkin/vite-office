---
id: "202610090749-C6C6AB"
title: "Implement Calc reference address and immutable sheet limits"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-09T07:49:29.489Z"
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
    body: "Start: implement original reference address and sheet-limit header owners, reusing numerical helpers and documenting actual dependency gaps."
events:
  -
    type: "status"
    at: "2026-10-09T07:49:36.697Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement original reference address and sheet-limit header owners, reusing numerical helpers and documenting actual dependency gaps."
doc_version: 3
doc_updated_at: "2026-10-09T07:49:36.697Z"
doc_updated_by: "CODER"
description: "Port the initialized header contracts of ScRefAddress and ScSheetLimits from pinned local LibreOffice, reuse existing address checks and owners, and register source/test provenance. Keep configuration-dependent CreateDefault and GetRefString for their actual ScModule/formatting dependencies without stubs."
sections:
  Summary: "Implement native initialized reference address ownership and immutable sheet limit contracts as prerequisites for Calc formula references."
  Scope: "sc/inc/address.ts ScRefAddress; new sc/inc/sheetlimits.ts; reference-address and sheetlimits tests; two new Calc capabilities; existing address runtime/provenance; new sheetlimits runtime/provenance; calc-core and registry README descriptions. Preserve shared/Writer sources and records. Exactly this checkout on calc, no merges. This is Calc milestone4; full suite due after milestone10."
  Plan: "Implement native reference-address default/numeric/copy constructors, stable-owner assignment, both Set overloads, independent flags, getters and equality. Implement explicit immutable native sheet limits with original widths, validity and sanitize delegation, counts and max-column string. Reuse existing ScAddress and helpers. Test ownership, signed widths, all flag combinations and each bounded validity axis for standard/jumbo/custom limits. Record exact local/upstream evidence and omissions without parity promotion. Validate actual100 Calc coverage, typecheck, boundaries, JSDoc, size, affected lint/format, scoped registry, routing and doctor. Leave CreateDefault and GetRefString absent until real native dependencies exist, no replacement factory or stub. Existing user goal authorizes this core progression."
  Verify Steps: "Run npm run test:coverage:calc and require actual100 lines/statements/functions/branches; retain all existing tests. Run npm run typecheck, npm run check:dependencies, npm run check:docs, npm run check:file-size; affected ESLint and Prettier; Calc scoped registry gate with zero semantic violations. Verify source markers against pinned local headers and factory dependency, no shared duplication. Run node .agentplane/policy/check-routing.mjs and ap doctor. Run git diff --check and final git status --short --untracked-files=all; branch must be calc. Full suite intentionally scheduled at Calc task10."
  Verification: "Pending implementation and scoped acceptance checks."
  Rollback Plan: "Revert only this task implementation commit; keep earlier numerical coordinates and sticky movements intact."
  Findings: "ScSheetLimits owns only max row/column and delegates native header helpers; its native SimpleReferenceObject lifetime is represented by JavaScript object ownership, not a second reference-count implementation. CreateDefault in documen2.cxx depends on compile feature and ScModule defaults; configuration owner is not yet ported. ScRefAddress formatting depends on future address convention/document ownership. No default factory or formatter fallback will be invented."
id_source: "generated"
---
## Summary

Implement native initialized reference address ownership and immutable sheet limit contracts as prerequisites for Calc formula references.

## Scope

sc/inc/address.ts ScRefAddress; new sc/inc/sheetlimits.ts; reference-address and sheetlimits tests; two new Calc capabilities; existing address runtime/provenance; new sheetlimits runtime/provenance; calc-core and registry README descriptions. Preserve shared/Writer sources and records. Exactly this checkout on calc, no merges. This is Calc milestone4; full suite due after milestone10.

## Plan

Implement native reference-address default/numeric/copy constructors, stable-owner assignment, both Set overloads, independent flags, getters and equality. Implement explicit immutable native sheet limits with original widths, validity and sanitize delegation, counts and max-column string. Reuse existing ScAddress and helpers. Test ownership, signed widths, all flag combinations and each bounded validity axis for standard/jumbo/custom limits. Record exact local/upstream evidence and omissions without parity promotion. Validate actual100 Calc coverage, typecheck, boundaries, JSDoc, size, affected lint/format, scoped registry, routing and doctor. Leave CreateDefault and GetRefString absent until real native dependencies exist, no replacement factory or stub. Existing user goal authorizes this core progression.

## Verify Steps

Run npm run test:coverage:calc and require actual100 lines/statements/functions/branches; retain all existing tests. Run npm run typecheck, npm run check:dependencies, npm run check:docs, npm run check:file-size; affected ESLint and Prettier; Calc scoped registry gate with zero semantic violations. Verify source markers against pinned local headers and factory dependency, no shared duplication. Run node .agentplane/policy/check-routing.mjs and ap doctor. Run git diff --check and final git status --short --untracked-files=all; branch must be calc. Full suite intentionally scheduled at Calc task10.

## Verification

Pending implementation and scoped acceptance checks.

## Rollback Plan

Revert only this task implementation commit; keep earlier numerical coordinates and sticky movements intact.

## Findings

ScSheetLimits owns only max row/column and delegates native header helpers; its native SimpleReferenceObject lifetime is represented by JavaScript object ownership, not a second reference-count implementation. CreateDefault in documen2.cxx depends on compile feature and ScModule defaults; configuration owner is not yet ported. ScRefAddress formatting depends on future address convention/document ownership. No default factory or formatter fallback will be invented.
