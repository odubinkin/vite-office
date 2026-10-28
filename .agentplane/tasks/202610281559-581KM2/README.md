---
id: "202610281559-581KM2"
title: "Integrate Writer and Calc and synchronize development branches"
status: "DOING"
priority: "high"
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
  updated_at: "2026-10-28T15:59:22.392Z"
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
    body: "Start: Execute approved integration of Writer and Calc with full verification and branch synchronization."
events:
  -
    type: "status"
    at: "2026-10-28T15:59:26.557Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Execute approved integration of Writer and Calc with full verification and branch synchronization."
doc_version: 3
doc_updated_at: "2026-10-28T16:35:28.629Z"
doc_updated_by: "CODER"
description: "Push current Writer and Calc branches, merge both into main, resolve conflicts, run full verification and repair failures, document suspected upstream issues, push main and merge it back into both development branches. User explicitly authorized network pushes and all three repositories."
sections:
  Summary: "Integrate the current Writer and Calc work into main and synchronize all three published branches."
  Scope: "The three user-named repositories, branch merges, conflict resolution, failed-check repairs and regression tests, and suspected upstream issue documentation. Preserve unrelated untracked output. No history rewrites."
  Plan: "Execute the user-approved nine-step integration and synchronization plan with full npm verification, targeted regression repairs, upstream findings documentation and final remote/ancestry/working-tree checks."
  Verify Steps: |-
    1. Run npm run verify on integrated main, covering formatting, lint, types, tooling, coverage, browser tests, static build, documentation and provenance/inventory checks.
    2. Run ap doctor and node .agentplane/policy/check-routing.mjs.
    3. Confirm main is an ancestor of writer and calc, all three local branches equal their origin branches, and tracked working trees are clean. Preserve pre-existing calc output files.
  Verification: "PASS: full formatting; full lint plus changed-file lint; full typecheck after numeric repair; module boundaries (1860 sources/10028 imports); source provenance after repair (1861 modules); JSDoc after repair (4141 authored files); size limits; Writer/Calc resource checks; source-tree (115 paths/32 retired roots); Writer WhichIds (79); ap doctor (existing readiness warning only); policy routing. Tooling: initial38/40 files and167/169 tests pass; both failures repaired and focused rerun2/2 pass. Test ownership rerun after adding new regression file1/1 pass. Inventory38files/130tests pass with1734/1734 statements,1290/1290 branches,437/437 functions,1670/1670 lines. Complete browser suite537/537 pass in21.5minutes. Formatter repair: existing clipboard suite10/10 passes; four relevant suites44/44 pass; final current-source integer regression11/11 passes. Full initial application coverage run continues; its original clipboard failure is repaired and focused verified. Current-code static rebuild and remaining inventory gates pending. Logs retained locally under ignored .agentplane/tmp/."
  Rollback Plan: "Preserve original commit IDs. Resolve locally before publishing main. Use revert commits for any published correction; never reset or force-push shared branches."
  Findings: |-
    Resolved merge conflicts preserving both feature sets and registry evidence. New journal append collisions are renumbered with canonical Markdown cross-references updated; older pre-existing duplicate headings remain outside this integration correction. Direct pinned upstream comparison confirmed comphelper strip/surrogate loops, documen3 grammar/language/lazy UNO registration, and all86 numeric language constants. Existing serial-only RemoveUnoObject and local boolean ApplyPatternAreaTab return are pre-existing port limitations, not upstream defects. Tooling repairs: classify three actual Calc-model tests as Calc integration and retain source-backed ICU dependency expectation (Library_i18npool links icui18n/icuuc). Full initial application run found unsupported builtin format1 numeric output. Implemented original finite, one-DIGIT-token integer branch via actual SAL corrected rounding, F conversion and backwards mandatory/optional/figure-space filling; cBlankDigit is original U+2007. No conditions, decimals, grouping, scaling or NatNum transliteration are fabricated. Existing clipboard-resources test now10/10 pass; four relevant suites44/44 pass, and final-current-source integer cases11/11 pass. New fixture initially assumed an unavailable PutEntry API; corrected it to the actual SvNumberformat constructor with real formatter-owned scanners. Runtime/provenance metadata records bounded admission and remaining unsupported formats; no broad parity flags changed. No newly discovered upstream defect. Doctor passed with existing hook readiness warning; routing passed.

    - Observation: Coverage diagnostic for actual BinaryXInputStream caller: all9 binary-stream tests pass; binaryinputstream.ts branches96.55%, only conditional branch0 at line30 remains [0,3]. Reaching the smaller-than32768 remaining count requires copying almost SAL_MAX_INT64 bytes. This source-preserved limitation is already documented in CALC-361.
      Impact: The configured strict100 global branch gate cannot pass this practical test domain. Upstream source and thresholds remain unchanged.
      Resolution: Requested an explicit user decision for this one recorded coverage exception while the complete application suite continues. Other test failures and checks remain mandatory.
id_source: "generated"
---
## Summary

Integrate the current Writer and Calc work into main and synchronize all three published branches.

## Scope

The three user-named repositories, branch merges, conflict resolution, failed-check repairs and regression tests, and suspected upstream issue documentation. Preserve unrelated untracked output. No history rewrites.

## Plan

Execute the user-approved nine-step integration and synchronization plan with full npm verification, targeted regression repairs, upstream findings documentation and final remote/ancestry/working-tree checks.

## Verify Steps

1. Run npm run verify on integrated main, covering formatting, lint, types, tooling, coverage, browser tests, static build, documentation and provenance/inventory checks.
2. Run ap doctor and node .agentplane/policy/check-routing.mjs.
3. Confirm main is an ancestor of writer and calc, all three local branches equal their origin branches, and tracked working trees are clean. Preserve pre-existing calc output files.

## Verification

PASS: full formatting; full lint plus changed-file lint; full typecheck after numeric repair; module boundaries (1860 sources/10028 imports); source provenance after repair (1861 modules); JSDoc after repair (4141 authored files); size limits; Writer/Calc resource checks; source-tree (115 paths/32 retired roots); Writer WhichIds (79); ap doctor (existing readiness warning only); policy routing. Tooling: initial38/40 files and167/169 tests pass; both failures repaired and focused rerun2/2 pass. Test ownership rerun after adding new regression file1/1 pass. Inventory38files/130tests pass with1734/1734 statements,1290/1290 branches,437/437 functions,1670/1670 lines. Complete browser suite537/537 pass in21.5minutes. Formatter repair: existing clipboard suite10/10 passes; four relevant suites44/44 pass; final current-source integer regression11/11 passes. Full initial application coverage run continues; its original clipboard failure is repaired and focused verified. Current-code static rebuild and remaining inventory gates pending. Logs retained locally under ignored .agentplane/tmp/.

## Rollback Plan

Preserve original commit IDs. Resolve locally before publishing main. Use revert commits for any published correction; never reset or force-push shared branches.

## Findings

Resolved merge conflicts preserving both feature sets and registry evidence. New journal append collisions are renumbered with canonical Markdown cross-references updated; older pre-existing duplicate headings remain outside this integration correction. Direct pinned upstream comparison confirmed comphelper strip/surrogate loops, documen3 grammar/language/lazy UNO registration, and all86 numeric language constants. Existing serial-only RemoveUnoObject and local boolean ApplyPatternAreaTab return are pre-existing port limitations, not upstream defects. Tooling repairs: classify three actual Calc-model tests as Calc integration and retain source-backed ICU dependency expectation (Library_i18npool links icui18n/icuuc). Full initial application run found unsupported builtin format1 numeric output. Implemented original finite, one-DIGIT-token integer branch via actual SAL corrected rounding, F conversion and backwards mandatory/optional/figure-space filling; cBlankDigit is original U+2007. No conditions, decimals, grouping, scaling or NatNum transliteration are fabricated. Existing clipboard-resources test now10/10 pass; four relevant suites44/44 pass, and final-current-source integer cases11/11 pass. New fixture initially assumed an unavailable PutEntry API; corrected it to the actual SvNumberformat constructor with real formatter-owned scanners. Runtime/provenance metadata records bounded admission and remaining unsupported formats; no broad parity flags changed. No newly discovered upstream defect. Doctor passed with existing hook readiness warning; routing passed.

- Observation: Coverage diagnostic for actual BinaryXInputStream caller: all9 binary-stream tests pass; binaryinputstream.ts branches96.55%, only conditional branch0 at line30 remains [0,3]. Reaching the smaller-than32768 remaining count requires copying almost SAL_MAX_INT64 bytes. This source-preserved limitation is already documented in CALC-361.
  Impact: The configured strict100 global branch gate cannot pass this practical test domain. Upstream source and thresholds remain unchanged.
  Resolution: Requested an explicit user decision for this one recorded coverage exception while the complete application suite continues. Other test failures and checks remain mandatory.
