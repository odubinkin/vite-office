---
id: "202610131647-N6A5MQ"
title: "Implement Calc document calculation configuration values"
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
  updated_at: "2026-10-13T16:47:52.763Z"
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
    body: "Start: actual Calc document calculation value settings and shared grammar AddressConvention with real shared Writer containers, no configuration service stub or ownership manager."
events:
  -
    type: "status"
    at: "2026-10-13T16:48:00.885Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: actual Calc document calculation value settings and shared grammar AddressConvention with real shared Writer containers, no configuration service stub or ownership manager."
doc_version: 3
doc_updated_at: "2026-10-13T16:48:00.885Z"
doc_updated_by: "CODER"
description: "Task92 original ScCalcConfig instance settings/defaults/copy/merge/reset/equality and shared FormulaGrammar AddressConvention prerequisite for real document/UI/ODS and ScTokenArray; reuse shared Writer SortedVector, GC references, no fake global config/listeners."
sections:
  Summary: "Task92 implements actual document formula calculation value settings required by ScDocument, ScTokenArray and ODS import."
  Scope: "Original ScCalcConfig instance constructor/copy/copy_assign, public fields, setOpenCLConfigToDefault/reset/MergeDocumentSpecific/SetStringRefSyntax/equality and original ScRecalcOptions/ForceCalculationType/StringConversion values. Reuse existing shared Writer SortedVector and OUString; add actual shared FormulaGrammar AddressConvention enum/header owner only. Native unchanged instance definitions/full headers over real existing dependencies, ordinary mode, no fake peers or config listener. Static environment/configuration listener methods, opcode symbolic conversion, full grammar/compiler/interpreter/document/UI/ODS filters remain pending, no default runtime OpenCL/threading stub. Add source-shaped calcconfig core/header/test/fixture/native-helper, shared grammar core/header/test, per-owner runtime/provenance/capability records, Calc checkpoint and suspected-issue note if observed. No refcount/library/ABI emulation, network or unrelated Writer mutation. Whole Calc plus directly affected full shared owner suites raw100, static/Calc browser profile and existing16gates; next full101."
  Plan: "Original Calc document configuration value owner and shared grammar address enum; reuse Writer/shared SortedVector and OUString, initialized native observations, scoped raw100,16gates, exact review; actual service methods remain pending without stubs, UI/ODS priority, next full101."
  Verify Steps: |-
    1. node scripts/calc-config-native-probe.mjs --write then --check captures unchanged complete original ScCalcConfig instance methods/full headers and genuine dependencies, initialized defaults/fields/copy/merge/reset/equality/static-default-set aliases and all AddressConvention enum values, no fake config listener/static method bodies or sanitizer. Compare complete stream in portable tests.
    2. Scoped source-absence runner whole npm run test:coverage:calc and affected shared coverage suites including grammar/o3tl/sal; unmodified raw maps S/B/F/L100 every statement/function/branch positive; restore four exact links. Static build and actual Calc browser profile no editable-UI claim.
    3. Whole format/lint/typecheck/docs/size/dependencies/resources/tooling/tree/provenance/registry/invariants/inventory/routing/doctor/diff16gates. Inventory actual owners, broad unsupported operations unverified. Record any failures before bounded correction, no threshold/private-state coverage tricks.
    4. Exact current/committed source hashes and same-agent separate EVALUATOR, canonical DONE, git status --short --untracked-files=all on calc. No full grammar/compiler/config-service/document/UI/ODS or original QA claim. Goal remains active, next full101.
  Verification: "Pending implementation and declared checks."
  Rollback Plan: "Revert only intentional task92 files through followup task, restore source symlinks after checks, no merge/history rewrite or unrelated task mutation."
  Findings: "ScDocument owns maCalcConfig and exposes GetCalcConfig/SetCalcConfig; ScXMLImport::SetStringRefSyntaxIfMissing changes a copied configuration to CONV_A1_XL_A1. ScTokenArray::ResetVectorState requires actual static ScCalcConfig service methods, so those cannot be filled with constant/browser fake state. This task implements genuine document value owner first; configuration service remains subsequent dependency. SortedVector already shared with Writer; reuse it, no duplicate sorted-set or memory manager. Previous task91 full run passed, goal active."
id_source: "generated"
---
## Summary

Task92 implements actual document formula calculation value settings required by ScDocument, ScTokenArray and ODS import.

## Scope

Original ScCalcConfig instance constructor/copy/copy_assign, public fields, setOpenCLConfigToDefault/reset/MergeDocumentSpecific/SetStringRefSyntax/equality and original ScRecalcOptions/ForceCalculationType/StringConversion values. Reuse existing shared Writer SortedVector and OUString; add actual shared FormulaGrammar AddressConvention enum/header owner only. Native unchanged instance definitions/full headers over real existing dependencies, ordinary mode, no fake peers or config listener. Static environment/configuration listener methods, opcode symbolic conversion, full grammar/compiler/interpreter/document/UI/ODS filters remain pending, no default runtime OpenCL/threading stub. Add source-shaped calcconfig core/header/test/fixture/native-helper, shared grammar core/header/test, per-owner runtime/provenance/capability records, Calc checkpoint and suspected-issue note if observed. No refcount/library/ABI emulation, network or unrelated Writer mutation. Whole Calc plus directly affected full shared owner suites raw100, static/Calc browser profile and existing16gates; next full101.

## Plan

Original Calc document configuration value owner and shared grammar address enum; reuse Writer/shared SortedVector and OUString, initialized native observations, scoped raw100,16gates, exact review; actual service methods remain pending without stubs, UI/ODS priority, next full101.

## Verify Steps

1. node scripts/calc-config-native-probe.mjs --write then --check captures unchanged complete original ScCalcConfig instance methods/full headers and genuine dependencies, initialized defaults/fields/copy/merge/reset/equality/static-default-set aliases and all AddressConvention enum values, no fake config listener/static method bodies or sanitizer. Compare complete stream in portable tests.
2. Scoped source-absence runner whole npm run test:coverage:calc and affected shared coverage suites including grammar/o3tl/sal; unmodified raw maps S/B/F/L100 every statement/function/branch positive; restore four exact links. Static build and actual Calc browser profile no editable-UI claim.
3. Whole format/lint/typecheck/docs/size/dependencies/resources/tooling/tree/provenance/registry/invariants/inventory/routing/doctor/diff16gates. Inventory actual owners, broad unsupported operations unverified. Record any failures before bounded correction, no threshold/private-state coverage tricks.
4. Exact current/committed source hashes and same-agent separate EVALUATOR, canonical DONE, git status --short --untracked-files=all on calc. No full grammar/compiler/config-service/document/UI/ODS or original QA claim. Goal remains active, next full101.

## Verification

Pending implementation and declared checks.

## Rollback Plan

Revert only intentional task92 files through followup task, restore source symlinks after checks, no merge/history rewrite or unrelated task mutation.

## Findings

ScDocument owns maCalcConfig and exposes GetCalcConfig/SetCalcConfig; ScXMLImport::SetStringRefSyntaxIfMissing changes a copied configuration to CONV_A1_XL_A1. ScTokenArray::ResetVectorState requires actual static ScCalcConfig service methods, so those cannot be filled with constant/browser fake state. This task implements genuine document value owner first; configuration service remains subsequent dependency. SortedVector already shared with Writer; reuse it, no duplicate sorted-set or memory manager. Previous task91 full run passed, goal active.
