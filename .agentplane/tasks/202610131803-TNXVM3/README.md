---
id: "202610131803-TNXVM3"
title: "Implement Calc single and double reference tokens"
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
  updated_at: "2026-10-13T18:04:03.841Z"
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
    body: "Start: actual Calc single/double reference tokens and original TextEqual using existing real shared/data/bounds owners and normal native scopes, no fake document or ownership engine."
events:
  -
    type: "status"
    at: "2026-10-13T18:04:11.114Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: actual Calc single/double reference tokens and original TextEqual using existing real shared/data/bounds owners and normal native scopes, no fake document or ownership engine."
doc_version: 3
doc_updated_at: "2026-10-13T18:04:11.114Z"
doc_updated_by: "CODER"
description: "Task95 actual ScSingleRefToken/ScDoubleRefToken ctor/copy/clone/member references/equality/TextEqual using existing reference data and sheet limits, prerequisite for real compiler/token array/UI/ODS formula references; no document/config substitute."
sections:
  Summary: "Task95 original Calc single/double reference token owners needed by real formula compilation and UI/ODS references."
  Scope: "Extend existing sc/core/tool/token.ts and token header with actual ScSingleRefToken/ScDoubleRefToken constructors/implicit copy/Clone, stable mutable member getters, original base-and-data equality and full matching-type checkTextEqual helper through actual reference data/toAbs/sheet limits. Reuse existing shared FormulaToken, ScSingleRefData/ScComplexRefData/ScSheetLimits/ScAddress/ScRange owners, no duplicated models or new smart pointer. Native complete original two class definitions/member methods/checkTextEqual, genuine real address/refdata/sheet-limit/formula headers and selected complete doc-free reference functions; do not reuse old fake ScDocument scaffold or supply fake peers. Normal-only initialized matching true derived types, code/type mismatch branches, reference/clone/flags/bounds histories. Ordinary JS refs retain sheet bounds; no native memory/count/invalid derived casts/arithmetic overflow/full ABI/QA claim. Add native helper/fixture/test, update original runtime/provenance plus new capability, Calc/GC checkpoint and suspected cases if observed. Whole Calc/affected shared raw100 and existing16gates/static/Calc0UI/exact source closure on calc. True document/compile/config/locale/ODS pipeline remains pending; goal pauses only after second upcoming full111 and relevant repairs, next full101 first."
  Plan: "Actual single/double reference tokens with existing bounds/data/shared base and original TextEqual; genuine normal native value proof, scoped raw100,16gates/exact review/DONE. No fake peers/count emulation; next full101 first, continue then pause after full111/repairs."
  Verify Steps: |-
    1. node scripts/calc-reference-token-native-probe.mjs --write then --check: complete original single/double classes/inline/default/copy/clone/method bodies and checkTextEqual, real formula/address/refdata/sheetlimit headers plus genuine doc-free method definitions and dependencies; normal only. Full initialized live clone/member/flags/coordinate/bounds/base mismatches/value/text comparisons match current tests; original raw counts/ABI/invalid peers/overflow excluded, no fake ScDocument/ScMatrix/Compiler bodies.
    2. Source-absence whole npm run test:coverage:calc and full affected shared FormulaToken/SAL/related owner profile with existing consumer suites; raw S/B/F/L100 every counter positive, four exact reference links restored. Static/Calc browser profile pass,0UI does not prove editable-grid readiness. No Writer-only coverage repair/full run before101.
    3. Existing16whole format/lint/type/docs/size/dependencies/resources/tooling/tree/provenance/registry/invariants/inventory/routing/doctor/diff checks. Actual single token runtime owner and native/source/QA contextual metadata; failure evidence before bounded fixes, no thresholds/private-state forcing or source-validation weakening.
    4. Exact current/committed non-task source hashes and same-agent separate EVALUATOR (not independent reviewer), canonical DONE clean git status --short --untracked-files=all branchcalc. No full compiler/ScTokenArray/document/UI/ODS/native ownership/QA claim. Goal continues past full101 and pauses after full111 plus bounded relevant repairs.
  Verification: "Pending approved implementation/checks."
  Rollback Plan: "Revert only intentional task95 files through followup task; restore links on every exit; no branch merges/history rewrite or unrelated tasks."
  Findings: "Original reference token classes own copied reference data and borrow sheet limits. Existing real data/limits/address/shared token owners are present. Old refdata native helper uses synthetic document scaffolding; do not reuse that caller as true native token proof. Genuine full reference headers allow original forward declarations without creating fake peers; only doc-free actual definitions compiled. TextEqual base guard requires true matching concrete tag classes and uses receiver limits/origin range canonicalization; respect valid input domain. User changed stop rule to second next full111; previous task94 stop-after101 is superseded."
id_source: "generated"
---
## Summary

Task95 original Calc single/double reference token owners needed by real formula compilation and UI/ODS references.

## Scope

Extend existing sc/core/tool/token.ts and token header with actual ScSingleRefToken/ScDoubleRefToken constructors/implicit copy/Clone, stable mutable member getters, original base-and-data equality and full matching-type checkTextEqual helper through actual reference data/toAbs/sheet limits. Reuse existing shared FormulaToken, ScSingleRefData/ScComplexRefData/ScSheetLimits/ScAddress/ScRange owners, no duplicated models or new smart pointer. Native complete original two class definitions/member methods/checkTextEqual, genuine real address/refdata/sheet-limit/formula headers and selected complete doc-free reference functions; do not reuse old fake ScDocument scaffold or supply fake peers. Normal-only initialized matching true derived types, code/type mismatch branches, reference/clone/flags/bounds histories. Ordinary JS refs retain sheet bounds; no native memory/count/invalid derived casts/arithmetic overflow/full ABI/QA claim. Add native helper/fixture/test, update original runtime/provenance plus new capability, Calc/GC checkpoint and suspected cases if observed. Whole Calc/affected shared raw100 and existing16gates/static/Calc0UI/exact source closure on calc. True document/compile/config/locale/ODS pipeline remains pending; goal pauses only after second upcoming full111 and relevant repairs, next full101 first.

## Plan

Actual single/double reference tokens with existing bounds/data/shared base and original TextEqual; genuine normal native value proof, scoped raw100,16gates/exact review/DONE. No fake peers/count emulation; next full101 first, continue then pause after full111/repairs.

## Verify Steps

1. node scripts/calc-reference-token-native-probe.mjs --write then --check: complete original single/double classes/inline/default/copy/clone/method bodies and checkTextEqual, real formula/address/refdata/sheetlimit headers plus genuine doc-free method definitions and dependencies; normal only. Full initialized live clone/member/flags/coordinate/bounds/base mismatches/value/text comparisons match current tests; original raw counts/ABI/invalid peers/overflow excluded, no fake ScDocument/ScMatrix/Compiler bodies.
2. Source-absence whole npm run test:coverage:calc and full affected shared FormulaToken/SAL/related owner profile with existing consumer suites; raw S/B/F/L100 every counter positive, four exact reference links restored. Static/Calc browser profile pass,0UI does not prove editable-grid readiness. No Writer-only coverage repair/full run before101.
3. Existing16whole format/lint/type/docs/size/dependencies/resources/tooling/tree/provenance/registry/invariants/inventory/routing/doctor/diff checks. Actual single token runtime owner and native/source/QA contextual metadata; failure evidence before bounded fixes, no thresholds/private-state forcing or source-validation weakening.
4. Exact current/committed non-task source hashes and same-agent separate EVALUATOR (not independent reviewer), canonical DONE clean git status --short --untracked-files=all branchcalc. No full compiler/ScTokenArray/document/UI/ODS/native ownership/QA claim. Goal continues past full101 and pauses after full111 plus bounded relevant repairs.

## Verification

Pending approved implementation/checks.

## Rollback Plan

Revert only intentional task95 files through followup task; restore links on every exit; no branch merges/history rewrite or unrelated tasks.

## Findings

Original reference token classes own copied reference data and borrow sheet limits. Existing real data/limits/address/shared token owners are present. Old refdata native helper uses synthetic document scaffolding; do not reuse that caller as true native token proof. Genuine full reference headers allow original forward declarations without creating fake peers; only doc-free actual definitions compiled. TextEqual base guard requires true matching concrete tag classes and uses receiver limits/origin range canonicalization; respect valid input domain. User changed stop rule to second next full111; previous task94 stop-after101 is superseded.
