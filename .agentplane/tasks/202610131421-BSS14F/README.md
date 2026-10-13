---
id: "202610131421-BSS14F"
title: "Implement original Calc matrix result token owners"
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
  updated_at: "2026-10-13T14:22:07.520Z"
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
    body: "Start: actual three matrix result token owners needed by formula result and ODS, reuse real matrix/shared token, preserve original alias/cloning overloads without memory manager."
events:
  -
    type: "status"
    at: "2026-10-13T14:22:19.156Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: actual three matrix result token owners needed by formula result and ODS, reuse real matrix/shared token, preserve original alias/cloning overloads without memory manager."
doc_version: 3
doc_updated_at: "2026-10-13T14:43:16.521Z"
doc_updated_by: "CODER"
description: "Iteration88 UI/ODS prerequisite for real ScFormulaResult/ScFormulaCell: actual ScMatrixToken, ScMatrixCellResultToken and ScMatrixFormulaCellToken using existing matrix/formula token owners, no reference manager."
sections:
  Summary: "Iteration88 original Calc matrix result token owners needed by actual ScFormulaResult/ScFormulaCell and ODS cached formula results."
  Scope: "Actual ScMatrixToken, ScMatrixCellResultToken and ScMatrixFormulaCellToken in existing Calc token header/core and original ScMatrixRef/ScConstMatrixRef type aliases at types header. Reuse actual ScMatrix and FormulaToken classes; ordinary JS nullable references replace Boost runtime. Preserve original base/copy constructors, shallow result refs, numeric upper-left clones in formula constructor/copy/typed result assignment, dimensions, overload-specific Assign, equality and ResetResult/SetUpperLeftDouble. Native unchanged class/member scopes over genuine original matrix/formula dependencies, fixture/test/helper, exact scopes and metadata/capability/docs updates. No dummy peer or alternate matrix, memory manager/refcount/finalizer/sanitizer or unrelated matrix aggregation. Original static overloaded Assign distinguishes base-result vs FormulaToken overload via explicit type witness when needed. Upstream suspected alias cases recorded and preserved. ScFormulaResult/ScFormulaCell/document/UI/ODS remain later real owners."
  Plan: "Actual matrix result token family for ScFormulaResult/ScFormulaCell/ODS cached results; reuse genuine matrix/token owners and ordinary JS refs, preserve overload-specific clones/aliases and dimensions. Unchanged original native scopes, complete Calc/shared raw100,16gates/inventory/exact review; no fake peers/refcount library, full91."
  Verify Steps: |-
    1. node scripts/calc-matrix-token-native-probe.mjs --check and complete matrix result token test streams. Verify original real matrix identities/dimensions and null refs; numeric clones, string sharing, typed vs generic Assign including self-assignment, mutable upper-left changes, ResetResult/equality and finite/IEEE/encoded errors. Genuine dependency/source hashes; no fake classes, native count output, sanitizer or management certification.
    2. node output/playwright/task88-checks/portable.mjs whole Calc and complete related shared owners/tests raw S/B/F/L100 every counter positive, four source links absent/restored; static and actual Calc browser profile pass. No Writer-only repair.
    3. node output/playwright/task88-checks/gates.mjs all16repository/tooling/inventory gates and current inventory/docs/journal.
    4. Exact current/committed non-task hashes, same-agent separate EVALUATOR, canonical DONE/clean calc. Reference/matrix-range token and ScFormulaResult/ScFormulaCell/document/editing/UI/ODS still pending; full91.
  Verification: "Pending implementation."
  Rollback Plan: "Revert only intentional task88 changes through new task; no merge/history rewrite."
  Findings: |-
    Original CloneUpperLeftIfNecessary always clones double and needs no refcount branch. Generic FormulaToken Assign of an actual matrix-result token calls base Assign without numeric cloning, whereas typed result overload clones: preserve and record if alias observation confirms. JS ordinary references preserve identity and mutable aliases with no manager.

    - Observation: First ordinary native caller compilation failed because selected original ScMatrixToken declaration requires SC_DLLPUBLIC from its genuine scdllapi.h include. No C++/TS test assertion ran or failed.
      Impact: Caller include scaffold incomplete; original class/member scopes unchanged and scope/verification unchanged.
      Resolution: Load genuine original scdllapi.h and include original sc/inc path, retain failed evidence and rerun ordinary native capture. No fake macro/class or criterion change.

    - Observation: Second native caller compile exposed missing genuine osl/diagnose.h for OSL_ENSURE/OSL_FAIL in unchanged matrix formula definitions.
      Impact: Only declaration/include scaffold incomplete; original implementations and certification domain unchanged.
      Resolution: Include original osl/diagnose.h, retain source scopes unchanged and rerun ordinary native capture. No debug macro emulation, sanitizer or acceptance weakening.

    - Observation: Native link succeeds after original includes; separate whole-header dependency compilation lacked the same sc/inc and mdds include paths, causing scdllapi.h lookup failure.
      Impact: Dependency observation command mismatch only; no original runtime or behavioral assertion failure.
      Resolution: Give dependency-only compile the same genuine include paths as normal caller build, preserving original scopes and thresholds. Final check will cover complete regenerated dependency hashes.

    - Observation: Initial whole Calc131case profile:130pass and1new stream fails before token comparison because fixture passed a JS string to OUString, whose original port requires the existing UTF16/length constructor.
      Impact: Test caller argument error only; ordinary C++10319-byte stream unchanged and no shared/runtime defect diagnosed.
      Resolution: Use genuine existing UInt16/length constructor for A, retain initial log/manifest, verify fresh stream then rerun required whole Calc/shared raw100. No threshold/expectation or Writer change.

    - Observation: Whole Calc131 and shared247 streams/tests pass. Static TS7 rejects generic Assign overload declaration for missing override modifier; implementation and other overload already marked override.
      Impact: Type-only signature modifier missing, no behavioral/expectation failure. Source links restored by wrapper.
      Resolution: Add required override to generic signature, rerun Calc on final source and source-absent static/profile checks; reuse unchanged passed shared-owner coverage. No criteria or native stream change.
id_source: "generated"
---
## Summary

Iteration88 original Calc matrix result token owners needed by actual ScFormulaResult/ScFormulaCell and ODS cached formula results.

## Scope

Actual ScMatrixToken, ScMatrixCellResultToken and ScMatrixFormulaCellToken in existing Calc token header/core and original ScMatrixRef/ScConstMatrixRef type aliases at types header. Reuse actual ScMatrix and FormulaToken classes; ordinary JS nullable references replace Boost runtime. Preserve original base/copy constructors, shallow result refs, numeric upper-left clones in formula constructor/copy/typed result assignment, dimensions, overload-specific Assign, equality and ResetResult/SetUpperLeftDouble. Native unchanged class/member scopes over genuine original matrix/formula dependencies, fixture/test/helper, exact scopes and metadata/capability/docs updates. No dummy peer or alternate matrix, memory manager/refcount/finalizer/sanitizer or unrelated matrix aggregation. Original static overloaded Assign distinguishes base-result vs FormulaToken overload via explicit type witness when needed. Upstream suspected alias cases recorded and preserved. ScFormulaResult/ScFormulaCell/document/UI/ODS remain later real owners.

## Plan

Actual matrix result token family for ScFormulaResult/ScFormulaCell/ODS cached results; reuse genuine matrix/token owners and ordinary JS refs, preserve overload-specific clones/aliases and dimensions. Unchanged original native scopes, complete Calc/shared raw100,16gates/inventory/exact review; no fake peers/refcount library, full91.

## Verify Steps

1. node scripts/calc-matrix-token-native-probe.mjs --check and complete matrix result token test streams. Verify original real matrix identities/dimensions and null refs; numeric clones, string sharing, typed vs generic Assign including self-assignment, mutable upper-left changes, ResetResult/equality and finite/IEEE/encoded errors. Genuine dependency/source hashes; no fake classes, native count output, sanitizer or management certification.
2. node output/playwright/task88-checks/portable.mjs whole Calc and complete related shared owners/tests raw S/B/F/L100 every counter positive, four source links absent/restored; static and actual Calc browser profile pass. No Writer-only repair.
3. node output/playwright/task88-checks/gates.mjs all16repository/tooling/inventory gates and current inventory/docs/journal.
4. Exact current/committed non-task hashes, same-agent separate EVALUATOR, canonical DONE/clean calc. Reference/matrix-range token and ScFormulaResult/ScFormulaCell/document/editing/UI/ODS still pending; full91.

## Verification

Pending implementation.

## Rollback Plan

Revert only intentional task88 changes through new task; no merge/history rewrite.

## Findings

Original CloneUpperLeftIfNecessary always clones double and needs no refcount branch. Generic FormulaToken Assign of an actual matrix-result token calls base Assign without numeric cloning, whereas typed result overload clones: preserve and record if alias observation confirms. JS ordinary references preserve identity and mutable aliases with no manager.

- Observation: First ordinary native caller compilation failed because selected original ScMatrixToken declaration requires SC_DLLPUBLIC from its genuine scdllapi.h include. No C++/TS test assertion ran or failed.
  Impact: Caller include scaffold incomplete; original class/member scopes unchanged and scope/verification unchanged.
  Resolution: Load genuine original scdllapi.h and include original sc/inc path, retain failed evidence and rerun ordinary native capture. No fake macro/class or criterion change.

- Observation: Second native caller compile exposed missing genuine osl/diagnose.h for OSL_ENSURE/OSL_FAIL in unchanged matrix formula definitions.
  Impact: Only declaration/include scaffold incomplete; original implementations and certification domain unchanged.
  Resolution: Include original osl/diagnose.h, retain source scopes unchanged and rerun ordinary native capture. No debug macro emulation, sanitizer or acceptance weakening.

- Observation: Native link succeeds after original includes; separate whole-header dependency compilation lacked the same sc/inc and mdds include paths, causing scdllapi.h lookup failure.
  Impact: Dependency observation command mismatch only; no original runtime or behavioral assertion failure.
  Resolution: Give dependency-only compile the same genuine include paths as normal caller build, preserving original scopes and thresholds. Final check will cover complete regenerated dependency hashes.

- Observation: Initial whole Calc131case profile:130pass and1new stream fails before token comparison because fixture passed a JS string to OUString, whose original port requires the existing UTF16/length constructor.
  Impact: Test caller argument error only; ordinary C++10319-byte stream unchanged and no shared/runtime defect diagnosed.
  Resolution: Use genuine existing UInt16/length constructor for A, retain initial log/manifest, verify fresh stream then rerun required whole Calc/shared raw100. No threshold/expectation or Writer change.

- Observation: Whole Calc131 and shared247 streams/tests pass. Static TS7 rejects generic Assign overload declaration for missing override modifier; implementation and other overload already marked override.
  Impact: Type-only signature modifier missing, no behavioral/expectation failure. Source links restored by wrapper.
  Resolution: Add required override to generic signature, rerun Calc on final source and source-absent static/profile checks; reuse unchanged passed shared-owner coverage. No criteria or native stream change.
