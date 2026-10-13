---
id: "202610131334-XA0XZ1"
title: "Implement original Calc scalar cell value ownership"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-13T13:35:15.086Z"
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
    body: "Start: original scalar cell value owner under active UI/ODS priority, shared values reused and no fake peer owners."
events:
  -
    type: "status"
    at: "2026-10-13T13:35:16.819Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: original scalar cell value owner under active UI/ODS priority, shared values reused and no fake peer owners."
doc_version: 3
doc_updated_at: "2026-10-13T13:53:48.687Z"
doc_updated_by: "CODER"
description: "Iteration86 UI/ODS prerequisite: original ScCellValue empty/double/SharedString constructors, scalar set/clear/getType/getDouble/getSharedString/isEmpty/swap and semantic move construction/assignment over original variant indices. Ordinary GC refs, reused SharedString values, no fake EditTextObject/ScFormulaCell/document. Native original scalar-family observations, actual pointer-free forward declarations only; whole Calc/affected shared raw100, inventory and gates."
sections:
  Summary: "Iteration86 original scalar ScCellValue owner, needed by document editing and ODS."
  Scope: "Calc only: new sc/inc/cellvalue header boundary and sc/source/core/data/cellvalue owner with original empty/double/SharedString variant families, scalar set/clear/getType/getDouble/getSharedString/isEmpty/swap, semantic move construction/assignment and scalar factory branch. Native JS tagged variant and refs replace physical std::variant/unique_ptr ownership; actual SharedString reused. No new memory manager or fake EditTextObject/ScFormulaCell/document. Complete native test/fixture/helper, two new runtime/provenance records/new capability, calc-core and suspected journal if native behavior warrants. Rich-text/formula/copy constructors requiring actual peer owners, document commit/release/assign and string-formatting helpers remain subsequent original families."
  Plan: "Original scalar ScCellValue constructors/setters/queries/clear/swap/logical moves via native JS variant/ref semantics and existing shared string values, no missing-pointee substitute. Native unchanged scalar scopes, whole Calc/affected shared raw100, registry/gates/journal/exact review. UI/ODS prerequisite focus retained."
  Verify Steps: |-
    1. node scripts/calc-cell-value-native-probe.mjs --check and complete scalar cell test: empty/finite/IEEE/error/string values, setters/type-specific access, wrong variant exceptions, clearing, swap, move constructor/assignment/self-move and source emptiness, strings copied/retained; original methods unchanged, no rich-text/formula pointees or sanitizer execution.
    2. node output/playwright/task86-checks/portable.mjs: whole Calc and complete affected shared mdds/SAL/SVL/formula owner/test profiles raw S/B/F/L100 every raw counter positive, four source links absent/restored, static build and Calc profile0UI.
    3. node output/playwright/task86-checks/gates.mjs: all16repository/tooling/inventory gates, no Writer-only repair or threshold weakening, next full91.
    4. Exact current/committed runtime/test/config/fixture hashes, same-agent separate EVALUATOR, canonical DONE and clean calc branch. Scalar family deliberately partial, real rich-text/formula/document/UI/ODS owners pending; do not claim full ScCellValue/native ABI coverage.
  Verification: "Pass: node scripts/calc-cell-value-native-probe.mjs --write then --check, unchanged original scalar method/header scopes over451original sources and6positive ordinary commands,3747-byte complete value stream. Empty/double/SharedString families only; genuine uninstantiated peer forward declarations, no fake object or native managed-pointer/ABI/memory-timing certification. Wrong variant messages match at JS TypeError boundary, self move clearing/retained copied strings/empty-string type and IEEE/error values pass. Command: portable.mjs. Result: pass with four original links absent/restored. Calc129tests40files25owners raw3267S2203B595F2891L, shared245tests51files39owners raw4042S2063B829F3620L; S/B/F/L100 every raw counter positive. Static build and Calc browser profile0UI pass. Command: gates.mjs. Result:16gates pass,36tooling tests10files and123inventory tests38files configured coverage100. Current inventory/journal/UI-ODS priority updated; original QA marker is unexecuted context. No Writer/shared runtime change, no memory manager or alternative browser cell DTO. Scalar cell family deliberately incomplete: actual rich-text/formula/ref/copy/document/storage/UI/ODS owners remain pending. Exact source commit and same-agent separate EVALUATOR pending canonical closure; goal active, next full91."
  Rollback Plan: "Revert only intentional iteration86 changes through a new task; preserve native evidence/shared owners, no merge or history rewrite."
  Findings: "Current repo has CellType/SharedString/mdds foundations but no ScCellValue, ScColumn/Table/Document or actual EditTextObject/ScFormulaCell. This leaf installs real scalar cell semantics rather than a browser DTO. No new native allocation/refcount emulation; existing shared-value cleanup remains a separate boundary. Original self move assignment clears its own value because clear occurs before moving data; certify and preserve."
id_source: "generated"
---
## Summary

Iteration86 original scalar ScCellValue owner, needed by document editing and ODS.

## Scope

Calc only: new sc/inc/cellvalue header boundary and sc/source/core/data/cellvalue owner with original empty/double/SharedString variant families, scalar set/clear/getType/getDouble/getSharedString/isEmpty/swap, semantic move construction/assignment and scalar factory branch. Native JS tagged variant and refs replace physical std::variant/unique_ptr ownership; actual SharedString reused. No new memory manager or fake EditTextObject/ScFormulaCell/document. Complete native test/fixture/helper, two new runtime/provenance records/new capability, calc-core and suspected journal if native behavior warrants. Rich-text/formula/copy constructors requiring actual peer owners, document commit/release/assign and string-formatting helpers remain subsequent original families.

## Plan

Original scalar ScCellValue constructors/setters/queries/clear/swap/logical moves via native JS variant/ref semantics and existing shared string values, no missing-pointee substitute. Native unchanged scalar scopes, whole Calc/affected shared raw100, registry/gates/journal/exact review. UI/ODS prerequisite focus retained.

## Verify Steps

1. node scripts/calc-cell-value-native-probe.mjs --check and complete scalar cell test: empty/finite/IEEE/error/string values, setters/type-specific access, wrong variant exceptions, clearing, swap, move constructor/assignment/self-move and source emptiness, strings copied/retained; original methods unchanged, no rich-text/formula pointees or sanitizer execution.
2. node output/playwright/task86-checks/portable.mjs: whole Calc and complete affected shared mdds/SAL/SVL/formula owner/test profiles raw S/B/F/L100 every raw counter positive, four source links absent/restored, static build and Calc profile0UI.
3. node output/playwright/task86-checks/gates.mjs: all16repository/tooling/inventory gates, no Writer-only repair or threshold weakening, next full91.
4. Exact current/committed runtime/test/config/fixture hashes, same-agent separate EVALUATOR, canonical DONE and clean calc branch. Scalar family deliberately partial, real rich-text/formula/document/UI/ODS owners pending; do not claim full ScCellValue/native ABI coverage.

## Verification

Pass: node scripts/calc-cell-value-native-probe.mjs --write then --check, unchanged original scalar method/header scopes over451original sources and6positive ordinary commands,3747-byte complete value stream. Empty/double/SharedString families only; genuine uninstantiated peer forward declarations, no fake object or native managed-pointer/ABI/memory-timing certification. Wrong variant messages match at JS TypeError boundary, self move clearing/retained copied strings/empty-string type and IEEE/error values pass. Command: portable.mjs. Result: pass with four original links absent/restored. Calc129tests40files25owners raw3267S2203B595F2891L, shared245tests51files39owners raw4042S2063B829F3620L; S/B/F/L100 every raw counter positive. Static build and Calc browser profile0UI pass. Command: gates.mjs. Result:16gates pass,36tooling tests10files and123inventory tests38files configured coverage100. Current inventory/journal/UI-ODS priority updated; original QA marker is unexecuted context. No Writer/shared runtime change, no memory manager or alternative browser cell DTO. Scalar cell family deliberately incomplete: actual rich-text/formula/ref/copy/document/storage/UI/ODS owners remain pending. Exact source commit and same-agent separate EVALUATOR pending canonical closure; goal active, next full91.

## Rollback Plan

Revert only intentional iteration86 changes through a new task; preserve native evidence/shared owners, no merge or history rewrite.

## Findings

Current repo has CellType/SharedString/mdds foundations but no ScCellValue, ScColumn/Table/Document or actual EditTextObject/ScFormulaCell. This leaf installs real scalar cell semantics rather than a browser DTO. No new native allocation/refcount emulation; existing shared-value cleanup remains a separate boundary. Original self move assignment clears its own value because clear occurs before moving data; certify and preserve.
