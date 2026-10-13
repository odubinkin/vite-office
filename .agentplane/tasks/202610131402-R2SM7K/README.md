---
id: "202610131402-R2SM7K"
title: "Implement original Calc scalar cell reference boundary"
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
  updated_at: "2026-10-13T14:02:47.979Z"
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
    body: "Start: original scalar borrowed ScRefCellValue contract and evidence, reused SharedString and ordinary JS refs; human UI/ODS goal authorization, no missing peer stand-in."
events:
  -
    type: "status"
    at: "2026-10-13T14:03:01.860Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: original scalar borrowed ScRefCellValue contract and evidence, reused SharedString and ordinary JS refs; human UI/ODS goal authorization, no missing peer stand-in."
doc_version: 3
doc_updated_at: "2026-10-13T14:03:01.860Z"
doc_updated_by: "CODER"
description: "Iteration87 UI and ODS prerequisite: actual ScRefCellValue scalar borrowed value boundary at original cellvalue header/core, no fake formula/text/document peers or memory management."
sections:
  Summary: "Iteration87 original scalar ScRefCellValue boundary for actual document/UI/ODS prerequisites."
  Scope: "Extend original sc/inc/cellvalue and core/data/cellvalue with ScRefCellValue default/number/borrowed-string constructors, compiler-provided copy construction/assignment, clear, getType/getDouble/getSharedString/isEmpty. Reuse real SharedString; null string pointers retain STRING tag. No ownership/refcount library, fake rich-text/formula/document peers or wrong-type union access certification. Add native unchanged original scalar scopes and fixture/test, update existing cell-value inventory records/capability and Calc checkpoint. Full formula-dependent methods remain subsequent real owners."
  Plan: "Implement original scalar ScRefCellValue borrowed owner boundary with real shared strings and original tags; ordinary JS memberwise reference/value copy, no new memory library. Native closed scalar family and complete portable raw100; inventory/docs16gates/exact review; next actual store/document/ODS priority, full91."
  Verify Steps: |-
    1. node scripts/calc-ref-cell-value-native-probe.mjs --check and complete original scalar stream test; finite/IEEE/error numbers, borrowed UTF16/null/empty strings, identity retention and implicit memberwise copy/assignment/self-copy, clear/type/emptiness; no sanitizer/fake peer/undefined getter exercise.
    2. node output/playwright/task87-checks/portable.mjs: whole Calc and complete affected shared owners/tests S/B/F/L100 every raw counter positive, four source links absent/restored, static and Calc browser profile. No Writer-only repair.
    3. node output/playwright/task87-checks/gates.mjs:16repository/tooling/inventory gates and updated scoped inventory.
    4. Exact current/committed non-task hashes and same-agent separate EVALUATOR review, canonical DONE and clean calc branch. Broad ScRefCellValue, document/UI/ODS remain unverified; next full91.
  Verification: "Pending execution."
  Rollback Plan: "Revert intentional task87 changes through a new task, no merge/history rewrite."
  Findings: "Original scalar borrowed values do not own/copy SharedString. Formula methods must wait for actual ScFormulaCell, not fake peers. Constructor null-pointer disambiguation uses explicit JS null argument for string family; missing argument remains NONE. Native union ABI and wrong-type reads are outside legal typed contract."
id_source: "generated"
---
## Summary

Iteration87 original scalar ScRefCellValue boundary for actual document/UI/ODS prerequisites.

## Scope

Extend original sc/inc/cellvalue and core/data/cellvalue with ScRefCellValue default/number/borrowed-string constructors, compiler-provided copy construction/assignment, clear, getType/getDouble/getSharedString/isEmpty. Reuse real SharedString; null string pointers retain STRING tag. No ownership/refcount library, fake rich-text/formula/document peers or wrong-type union access certification. Add native unchanged original scalar scopes and fixture/test, update existing cell-value inventory records/capability and Calc checkpoint. Full formula-dependent methods remain subsequent real owners.

## Plan

Implement original scalar ScRefCellValue borrowed owner boundary with real shared strings and original tags; ordinary JS memberwise reference/value copy, no new memory library. Native closed scalar family and complete portable raw100; inventory/docs16gates/exact review; next actual store/document/ODS priority, full91.

## Verify Steps

1. node scripts/calc-ref-cell-value-native-probe.mjs --check and complete original scalar stream test; finite/IEEE/error numbers, borrowed UTF16/null/empty strings, identity retention and implicit memberwise copy/assignment/self-copy, clear/type/emptiness; no sanitizer/fake peer/undefined getter exercise.
2. node output/playwright/task87-checks/portable.mjs: whole Calc and complete affected shared owners/tests S/B/F/L100 every raw counter positive, four source links absent/restored, static and Calc browser profile. No Writer-only repair.
3. node output/playwright/task87-checks/gates.mjs:16repository/tooling/inventory gates and updated scoped inventory.
4. Exact current/committed non-task hashes and same-agent separate EVALUATOR review, canonical DONE and clean calc branch. Broad ScRefCellValue, document/UI/ODS remain unverified; next full91.

## Verification

Pending execution.

## Rollback Plan

Revert intentional task87 changes through a new task, no merge/history rewrite.

## Findings

Original scalar borrowed values do not own/copy SharedString. Formula methods must wait for actual ScFormulaCell, not fake peers. Constructor null-pointer disambiguation uses explicit JS null argument for string family; missing argument remains NONE. Native union ABI and wrong-type reads are outside legal typed contract.
