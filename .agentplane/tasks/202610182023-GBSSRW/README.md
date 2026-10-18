---
id: "202610182023-GBSSRW"
title: "Use native owning cell values and formula clones for Calc Undo"
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
  updated_at: "2026-10-18T20:23:31.586Z"
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
    body: "Start: Replace browser stored-cell snapshots with actual native cell/formula ownership and source deep-token clones."
events:
  -
    type: "status"
    at: "2026-10-18T20:23:36.427Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Replace browser stored-cell snapshots with actual native cell/formula ownership and source deep-token clones."
doc_version: 3
doc_updated_at: "2026-10-18T20:23:36.427Z"
doc_updated_by: "CODER"
description: "Approved Calc UI continuation task14. Port ScTokenArray deep Clone with source code/RPN alias rules and represented metadata. Add same-document same-position ScFormulaCell copy/Clone and native represented destruction lifecycle;unsupported reference relocation and external/name/group services remain explicit. Extend actual ScCellValue owning formula/copy/document assign/commit APIs for existing scalar cells. Replace browser CalcCellContent history snapshots with actual ScCellValue owners and dispose through existing SfxUndoAction lifecycle. Preserve original clone error reset/recompile behavior for current token slice,real subscriptions and history. Up to40non-task files including truthful source/provenance records. AllCalc100percent,related token/formula/undo/shared tests and source gates;next full task20;only calc checkout/branch."
sections:
  Summary: |-
    Use native owning cell values and formula clones for Calc Undo

    Approved Calc UI continuation task14. Port ScTokenArray deep Clone with source code/RPN alias rules and represented metadata. Add same-document same-position ScFormulaCell copy/Clone and native represented destruction lifecycle;unsupported reference relocation and external/name/group services remain explicit. Extend actual ScCellValue owning formula/copy/document assign/commit APIs for existing scalar cells. Replace browser CalcCellContent history snapshots with actual ScCellValue owners and dispose through existing SfxUndoAction lifecycle. Preserve original clone error reset/recompile behavior for current token slice,real subscriptions and history. Up to40non-task files including truthful source/provenance records. AllCalc100percent,related token/formula/undo/shared tests and source gates;next full task20;only calc checkout/branch.
  Scope: |-
    - In scope: Approved Calc UI continuation task14. Port ScTokenArray deep Clone with source code/RPN alias rules and represented metadata. Add same-document same-position ScFormulaCell copy/Clone and native represented destruction lifecycle;unsupported reference relocation and external/name/group services remain explicit. Extend actual ScCellValue owning formula/copy/document assign/commit APIs for existing scalar cells. Replace browser CalcCellContent history snapshots with actual ScCellValue owners and dispose through existing SfxUndoAction lifecycle. Preserve original clone error reset/recompile behavior for current token slice,real subscriptions and history. Up to40non-task files including truthful source/provenance records. AllCalc100percent,related token/formula/undo/shared tests and source gates;next full task20;only calc checkout/branch.
    - Out of scope: unrelated refactors not required for "Use native owning cell values and formula clones for Calc Undo".
  Plan: "Port current represented ScTokenArray Clone fields and exact independent-code/first-shared-code RPN token ownership. Implement native same-position same-document formula copy/Clone with copied result/dirty/grammar,deep code and original code-error recompile rule;unported relocation and foreign-document services explicitly reject unsupported copy overloads. Add represented formula destruction tracking cleanup. Extend native ScCellValue copy/reference/document assign,formula ownership,type/get/clear and document commit using existing literal text setter for the current plain-text kernel. Browser Undo payloads become ScCellValue with existing SfxUndoAction Dispose;browser parse input stays transient and no parallel stored-cell union remains. Test token identity/metadata,source clone behavior,cached/error formulas,real subscriptions,string ownership,history trimming/replacement and mounted editing. AllCalc100percent,related FormulaTokenArray/ScFormulaResult/SfxUndoManager/shared menu tests,source contracts,types/build/style/source/provenance/scoped inventory and production browser review. Up to40non-task paths;task14,next full task20."
  Verify Steps: "1. npm run test:coverage:calc raw100percent statements/branches/functions/lines. Source-backed tests cover deep token code/RPN alias rules and flags,formula cached result/dirty independence,error-reset recompilation and unsupported relocation guard,ScCellValue scalar/formula copy/assign/commit/clear ownership and real dependency updates through Undo/Redo. 2. Related shared FormulaTokenArray,ScFormulaResult/SfxUndoAction lifecycle and Writer/shared menu tests pass with original assertions preserved. 3. App/tools types,build,touched prettier/eslint,module/docs/size/source/provenance,scoped Calc/shared inventory,doctor/routing pass. 4. Built browser edits dependent formulas and verifies actual Undo/Redo recalculation. Keep next full suite at task20 and document unported clone services without broad parity claims."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: ""
id_source: "generated"
---
## Summary

Use native owning cell values and formula clones for Calc Undo

Approved Calc UI continuation task14. Port ScTokenArray deep Clone with source code/RPN alias rules and represented metadata. Add same-document same-position ScFormulaCell copy/Clone and native represented destruction lifecycle;unsupported reference relocation and external/name/group services remain explicit. Extend actual ScCellValue owning formula/copy/document assign/commit APIs for existing scalar cells. Replace browser CalcCellContent history snapshots with actual ScCellValue owners and dispose through existing SfxUndoAction lifecycle. Preserve original clone error reset/recompile behavior for current token slice,real subscriptions and history. Up to40non-task files including truthful source/provenance records. AllCalc100percent,related token/formula/undo/shared tests and source gates;next full task20;only calc checkout/branch.

## Scope

- In scope: Approved Calc UI continuation task14. Port ScTokenArray deep Clone with source code/RPN alias rules and represented metadata. Add same-document same-position ScFormulaCell copy/Clone and native represented destruction lifecycle;unsupported reference relocation and external/name/group services remain explicit. Extend actual ScCellValue owning formula/copy/document assign/commit APIs for existing scalar cells. Replace browser CalcCellContent history snapshots with actual ScCellValue owners and dispose through existing SfxUndoAction lifecycle. Preserve original clone error reset/recompile behavior for current token slice,real subscriptions and history. Up to40non-task files including truthful source/provenance records. AllCalc100percent,related token/formula/undo/shared tests and source gates;next full task20;only calc checkout/branch.
- Out of scope: unrelated refactors not required for "Use native owning cell values and formula clones for Calc Undo".

## Plan

Port current represented ScTokenArray Clone fields and exact independent-code/first-shared-code RPN token ownership. Implement native same-position same-document formula copy/Clone with copied result/dirty/grammar,deep code and original code-error recompile rule;unported relocation and foreign-document services explicitly reject unsupported copy overloads. Add represented formula destruction tracking cleanup. Extend native ScCellValue copy/reference/document assign,formula ownership,type/get/clear and document commit using existing literal text setter for the current plain-text kernel. Browser Undo payloads become ScCellValue with existing SfxUndoAction Dispose;browser parse input stays transient and no parallel stored-cell union remains. Test token identity/metadata,source clone behavior,cached/error formulas,real subscriptions,string ownership,history trimming/replacement and mounted editing. AllCalc100percent,related FormulaTokenArray/ScFormulaResult/SfxUndoManager/shared menu tests,source contracts,types/build/style/source/provenance/scoped inventory and production browser review. Up to40non-task paths;task14,next full task20.

## Verify Steps

1. npm run test:coverage:calc raw100percent statements/branches/functions/lines. Source-backed tests cover deep token code/RPN alias rules and flags,formula cached result/dirty independence,error-reset recompilation and unsupported relocation guard,ScCellValue scalar/formula copy/assign/commit/clear ownership and real dependency updates through Undo/Redo. 2. Related shared FormulaTokenArray,ScFormulaResult/SfxUndoAction lifecycle and Writer/shared menu tests pass with original assertions preserved. 3. App/tools types,build,touched prettier/eslint,module/docs/size/source/provenance,scoped Calc/shared inventory,doctor/routing pass. 4. Built browser edits dependent formulas and verifies actual Undo/Redo recalculation. Keep next full suite at task20 and document unported clone services without broad parity claims.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
