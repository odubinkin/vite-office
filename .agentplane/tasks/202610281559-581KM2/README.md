---
id: "202610281559-581KM2"
title: "Integrate Writer and Calc and synchronize development branches"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 8
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
doc_updated_at: "2026-10-28T16:18:30.573Z"
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
  Verification: "In progress. PASS: npm run typecheck; npm run lint; npm run check:dependencies (1860 sources,10028 imports); npm run check:source-provenance (1861 modules); npm run check:file-size; npm run check:docs (4140 files); check:writer-resources and check:calc-resources; ap doctor (existing hook readiness warning only); policy routing. Initial npm run verify stopped at formatting in three existing files; all three repaired and targeted Prettier passed. Initial tooling run:38 files/167 tests passed,2 failures. Repaired Calc ownership for actual SfxBaseModel/ScModelObj integration tests and obsolete ICU edge expectation, keeping all strict gates. Focused rerun of both failed files:2/2 passed. Complete application coverage,inventory coverage,browser/static and remaining gates pending. Evidence logs are under ignored .agentplane/tmp/."
  Rollback Plan: "Preserve original commit IDs. Resolve locally before publishing main. Use revert commits for any published correction; never reset or force-push shared branches."
  Findings: "Resolved merge conflicts preserving both feature sets and registry evidence. New journal append collisions are renumbered with canonical Markdown cross-references updated; older pre-existing duplicate headings remain outside this integration correction. Direct pinned upstream comparison confirmed comphelper strip/surrogate loops, documen3 grammar/language/lazy UNO registration, and all86 numeric language constants. Existing serial-only RemoveUnoObject and local boolean ApplyPatternAreaTab return are pre-existing port limitations, not upstream defects. Tooling repairs: classify three actual Calc-model tests as Calc integration and retain source-backed ICU dependency expectation (Library_i18npool links icui18n/icuuc). Full initial application run found unsupported builtin format1 numeric output. Implemented original finite, one-DIGIT-token integer branch via actual SAL corrected rounding, F conversion and backwards mandatory/optional/figure-space filling; cBlankDigit is original U+2007. No conditions, decimals, grouping, scaling or NatNum transliteration are fabricated. Existing clipboard-resources test now10/10 pass; four relevant suites44/44 pass, and final-current-source integer cases11/11 pass. New fixture initially assumed an unavailable PutEntry API; corrected it to the actual SvNumberformat constructor with real formatter-owned scanners. Runtime/provenance metadata records bounded admission and remaining unsupported formats; no broad parity flags changed. No newly discovered upstream defect. Doctor passed with existing hook readiness warning; routing passed."
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

In progress. PASS: npm run typecheck; npm run lint; npm run check:dependencies (1860 sources,10028 imports); npm run check:source-provenance (1861 modules); npm run check:file-size; npm run check:docs (4140 files); check:writer-resources and check:calc-resources; ap doctor (existing hook readiness warning only); policy routing. Initial npm run verify stopped at formatting in three existing files; all three repaired and targeted Prettier passed. Initial tooling run:38 files/167 tests passed,2 failures. Repaired Calc ownership for actual SfxBaseModel/ScModelObj integration tests and obsolete ICU edge expectation, keeping all strict gates. Focused rerun of both failed files:2/2 passed. Complete application coverage,inventory coverage,browser/static and remaining gates pending. Evidence logs are under ignored .agentplane/tmp/.

## Rollback Plan

Preserve original commit IDs. Resolve locally before publishing main. Use revert commits for any published correction; never reset or force-push shared branches.

## Findings

Resolved merge conflicts preserving both feature sets and registry evidence. New journal append collisions are renumbered with canonical Markdown cross-references updated; older pre-existing duplicate headings remain outside this integration correction. Direct pinned upstream comparison confirmed comphelper strip/surrogate loops, documen3 grammar/language/lazy UNO registration, and all86 numeric language constants. Existing serial-only RemoveUnoObject and local boolean ApplyPatternAreaTab return are pre-existing port limitations, not upstream defects. Tooling repairs: classify three actual Calc-model tests as Calc integration and retain source-backed ICU dependency expectation (Library_i18npool links icui18n/icuuc). Full initial application run found unsupported builtin format1 numeric output. Implemented original finite, one-DIGIT-token integer branch via actual SAL corrected rounding, F conversion and backwards mandatory/optional/figure-space filling; cBlankDigit is original U+2007. No conditions, decimals, grouping, scaling or NatNum transliteration are fabricated. Existing clipboard-resources test now10/10 pass; four relevant suites44/44 pass, and final-current-source integer cases11/11 pass. New fixture initially assumed an unavailable PutEntry API; corrected it to the actual SvNumberformat constructor with real formatter-owned scanners. Runtime/provenance metadata records bounded admission and remaining unsupported formats; no broad parity flags changed. No newly discovered upstream defect. Doctor passed with existing hook readiness warning; routing passed.
