---
id: "202610131543-CD8JQC"
title: "Implement shared formula token array storage and recalc state"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-13T15:44:34.948Z"
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
    body: "Start: actual shared FormulaTokenArray code/RPN and recalc operation family needed by real Calc formula cell and ODS; existing token owners, original alias/copy/default logic and GC refs."
events:
  -
    type: "status"
    at: "2026-10-13T15:44:44.000Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: actual shared FormulaTokenArray code/RPN and recalc operation family needed by real Calc formula cell and ODS; existing token owners, original alias/copy/default logic and GC refs."
doc_version: 3
doc_updated_at: "2026-10-13T15:44:44.000Z"
doc_updated_by: "CODER"
description: "Iteration90 direct prerequisite for genuine ScTokenArray/ScFormulaCell and ODS formulas: original shared FormulaTokenArray code/RPN ownership semantics, construction/copy/move/edit/query/finalization and recalculation state over actual tokens with JS GC."
sections:
  Summary: "Iteration90 shared FormulaTokenArray storage and recalc owner required by genuine ScTokenArray/ScFormulaCell and ODS formula storage."
  Scope: "New original formula/inc/tokenarray boundary and one source-shaped token.array class shard mapped to formula/source/core/api/token.cxx. Original code/RPN nullable buffers and active lengths; default/copy/logical move/copy and move assignment/Clear/Finalize/DelRPN; Add/AddToken/Double/String/Error; XML placeholder Assign with count witness; initialized RPN assignment; ReplaceToken/ReplaceRPNToken/RemoveToken; first/last/index/PeekPrev/opcode and reference/name/opcode queries; original ScRecalcMode constants and all flags/priority setters/getters. Reuse actual FormulaToken classes and ordinary JS refs, no capacity32/unique_ptr/refcount/pool/allocator/finalizer emulation. Preserve8192limit/ocStop sentinel, finalized rejection, alias behavior and initialized active contents, fixed16/8 widths. Refcount gates in replace/remove specialize to actual RPN identity scans, preserving original forward-index/adjacent-skip traversal; break when native refcount1 implies no further RPN matches. No native None-policy/undefined pointer or tail read. Genuine partial declaration scaffold for selected complete original source methods, original static compiler declaration/function only with no fake instance; no dummy document/token array peer. Complete fixtures/tests/provenance/capability/Calc/GC/journal updates. Full UNO AddFormulaToken/Fill/opcode jump builder/compiler/rewrites/range iterators and ScTokenArray/ScFormulaCell/document/UI/ODS remain later real owners."
  Plan: "Actual shared FormulaTokenArray code/RPN storage and recalc state for ScTokenArray/formula-cell/ODS prerequisites. Genuine tokens and GC refs, original finalize/8192bound/stop/shallowcopy/move/replace/remove/query/flag contracts; no fake peers/capacity/refcount library. Native selected scopes all initialized data, Calc/complete affected shared raw100,16gates/inventory/exact review, next full91."
  Verify Steps: |-
    1. node scripts/formula-token-array-native-probe.mjs --check and full original array/recalc stream tests: default/meta/recalc bits/priority, append/finalize/8192stop, shallow copy/transfer/reset/self assignment, XML placeholder initialized arrays, RPN aliases and replacements/removals including duplicate adjacency, query ranges/flags/opcode/reference/name and index output preservation. Complete unchanged selected source/inlines and genuine headers; no tail/undefined cast, native count output or sanitizer.
    2. node output/playwright/task90-checks/portable.mjs whole Calc plus complete new shared FormulaTokenArray and affected shared owner/tests raw S/B/F/L100 every counter positive, sources absent/restored, static and actual Calc browser profile. No Writer-only repair or threshold weakening.
    3. node output/playwright/task90-checks/gates.mjs all16repository/tooling/inventory gates and registry/GC invariant/journal/docs updates.
    4. Exact current/committed non-task hashes, same-agent separate EVALUATOR, canonical DONE/clean calc. Partial array operation family and native declaration scaffold explicitly bounded; full array/ScTokenArray/ScFormulaCell/document/storage/UI/ODS still pending, full91.
  Verification: "Pending implementation."
  Rollback Plan: "Revert intentional task90 changes through a new task only; no merge/history rewrite."
  Findings: "Default ScFormulaCell requires actual ScTokenArray, whose base FormulaTokenArray is absent. This installs real shared storage rather than inventing Calc-specific sequences. Copy constructor shares token identity but finalizes nonempty code. Move empties source buffers/lengths but retains its other flags. Native refcount1 stop conditions imply no remaining RPN match; removing those memory gates does not justify changing forward-index traversal. Uninitialized array capacity/tails and jump token code are outside this leaf."
id_source: "generated"
---
## Summary

Iteration90 shared FormulaTokenArray storage and recalc owner required by genuine ScTokenArray/ScFormulaCell and ODS formula storage.

## Scope

New original formula/inc/tokenarray boundary and one source-shaped token.array class shard mapped to formula/source/core/api/token.cxx. Original code/RPN nullable buffers and active lengths; default/copy/logical move/copy and move assignment/Clear/Finalize/DelRPN; Add/AddToken/Double/String/Error; XML placeholder Assign with count witness; initialized RPN assignment; ReplaceToken/ReplaceRPNToken/RemoveToken; first/last/index/PeekPrev/opcode and reference/name/opcode queries; original ScRecalcMode constants and all flags/priority setters/getters. Reuse actual FormulaToken classes and ordinary JS refs, no capacity32/unique_ptr/refcount/pool/allocator/finalizer emulation. Preserve8192limit/ocStop sentinel, finalized rejection, alias behavior and initialized active contents, fixed16/8 widths. Refcount gates in replace/remove specialize to actual RPN identity scans, preserving original forward-index/adjacent-skip traversal; break when native refcount1 implies no further RPN matches. No native None-policy/undefined pointer or tail read. Genuine partial declaration scaffold for selected complete original source methods, original static compiler declaration/function only with no fake instance; no dummy document/token array peer. Complete fixtures/tests/provenance/capability/Calc/GC/journal updates. Full UNO AddFormulaToken/Fill/opcode jump builder/compiler/rewrites/range iterators and ScTokenArray/ScFormulaCell/document/UI/ODS remain later real owners.

## Plan

Actual shared FormulaTokenArray code/RPN storage and recalc state for ScTokenArray/formula-cell/ODS prerequisites. Genuine tokens and GC refs, original finalize/8192bound/stop/shallowcopy/move/replace/remove/query/flag contracts; no fake peers/capacity/refcount library. Native selected scopes all initialized data, Calc/complete affected shared raw100,16gates/inventory/exact review, next full91.

## Verify Steps

1. node scripts/formula-token-array-native-probe.mjs --check and full original array/recalc stream tests: default/meta/recalc bits/priority, append/finalize/8192stop, shallow copy/transfer/reset/self assignment, XML placeholder initialized arrays, RPN aliases and replacements/removals including duplicate adjacency, query ranges/flags/opcode/reference/name and index output preservation. Complete unchanged selected source/inlines and genuine headers; no tail/undefined cast, native count output or sanitizer.
2. node output/playwright/task90-checks/portable.mjs whole Calc plus complete new shared FormulaTokenArray and affected shared owner/tests raw S/B/F/L100 every counter positive, sources absent/restored, static and actual Calc browser profile. No Writer-only repair or threshold weakening.
3. node output/playwright/task90-checks/gates.mjs all16repository/tooling/inventory gates and registry/GC invariant/journal/docs updates.
4. Exact current/committed non-task hashes, same-agent separate EVALUATOR, canonical DONE/clean calc. Partial array operation family and native declaration scaffold explicitly bounded; full array/ScTokenArray/ScFormulaCell/document/storage/UI/ODS still pending, full91.

## Verification

Pending implementation.

## Rollback Plan

Revert intentional task90 changes through a new task only; no merge/history rewrite.

## Findings

Default ScFormulaCell requires actual ScTokenArray, whose base FormulaTokenArray is absent. This installs real shared storage rather than inventing Calc-specific sequences. Copy constructor shares token identity but finalizes nonempty code. Move empties source buffers/lengths but retains its other flags. Native refcount1 stop conditions imply no remaining RPN match; removing those memory gates does not justify changing forward-index traversal. Uninitialized array capacity/tails and jump token code are outside this leaf.
