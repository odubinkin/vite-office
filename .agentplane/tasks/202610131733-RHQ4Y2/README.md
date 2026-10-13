---
id: "202610131733-RHQ4Y2"
title: "Implement shared search parameter values for Calc options and UI"
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
  updated_at: "2026-10-13T17:34:33.415Z"
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
    body: "Start: actual shared SearchParam values and mode/boolean conversions with genuine OUString, no search engine/locale/configuration substitute or ownership manager."
events:
  -
    type: "status"
    at: "2026-10-13T17:34:43.329Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: actual shared SearchParam values and mode/boolean conversions with genuine OUString, no search engine/locale/configuration substitute or ownership manager."
doc_version: 3
doc_updated_at: "2026-10-13T17:34:43.329Z"
doc_updated_by: "CODER"
description: "Task94 actual utl SearchParam value owner/static search-mode conversion prerequisite for ScDocOptions, ODS search settings and real UI search, reusing actual shared OUString without a substitute search engine or configuration defaults."
sections:
  Summary: "Task94 actual shared SearchParam value and mode conversion owner required by Calc document/ODS options and UI search."
  Scope: "Original complete SearchParam class value fields, text/copy constructors, implicit memberwise copy_assign, getters with stable borrowed OUString member, original defaults/case/wildcard selection/UInt32 escape signed API output, SearchType enum and ConvertToSearchType/ConvertToBool with caller boolean outputs. Source-shaped unotools/inc/textsearch.ts and source/i18n/textsearch.ts, existing shared OUString reused. JS refs/GC, no new dispose/refcount/smart-pointer/search engine. Native complete original SearchParam class excerpt plus full unchanged constructors/destructor definitions over genuine existing dependencies, normal only; no fake TextSearch/locale/config/formatter peers, native lifetime/ABI/full QA claim. Add native helper/fixture/test, actual runtime/provenance/capability records and Calc checkpoint, suspected-case note only if meaningful case observed. Whole Calc and complete affected shared SAL/SearchParam owner coverage using existing consumers, source links absent/restored, static/Calc profile,16gates/exact review/DONE. Actual ScDocOptions still requires real metric/year/config services, no invented constants. Pause after scheduled full101 and relevant Calc/shared repairs, Writer-only coverage untouched."
  Plan: "Actual shared SearchParam values/conversions for ScDocOptions/ODS/UI, reuse OUString and native JS narrowing/GC; complete initialized normal native streams, scoped raw100,16gates/exact review/DONE. No search/config/locale substitute; pause after full101 and relevant repairs."
  Verify Steps: |-
    1. node scripts/search-param-native-probe.mjs --write then --check observes complete original SearchParam class/constructor definitions over genuine OUString dependencies, all scoped search enum/int32 outputs and boolean input combinations, UInt32 escape boundaries and UTF16 defaults/copy/assignment/borrow histories. Normal-only full streams match portable tests, no fake peers/native memory counts/invalid lifetime/sanitizer.
    2. Source-absence runner whole npm run test:coverage:calc plus complete affected shared SearchParam and SAL owner suites with existing actual consumers; raw unmodified S/B/F/L100 every counter positive, four exact links restored. Static build and Calc profile0UI. No Writer-only fixes or full run before101.
    3. Existing whole16format/lint/type/docs/size/dependencies/resources/tooling/tree/provenance/registry/invariants/inventory/routing/doctor/diff checks. Actual named owner/provenance and bounded scope; no coverage exclusions, threshold/private-state forcing or wrapper duplication. Record failures before correction.
    4. Exact current/committed non-task hashes, same-agent separate EVALUATOR (not independent review), canonical DONE and clean git status --short --untracked-files=all on calc. No TextSearch engine/document/ODS/UI or full original QA completion claim; stop goal only after scheduled full101 and bounded relevant repairs.
  Verification: "Pending approved implementation and checks."
  Rollback Plan: "Revert intentional task94 changes through followup task, restore all reference symlinks; no merges/history rewrite or unrelated tasks."
  Findings: "ScDocOptions stores utl SearchParam::SearchType and calls ConvertToSearchType for ODS configuration booleans; real metric locale and two-digit year configuration peers are absent, so do not fake ScDocOptions defaults. SearchParam original value class needs only genuine existing OUString. Full TextSearch engine/backend/caching and generic ostream diagnostic remain outside current value-family scope. Existing SAL value cleanup is separate unchanged legacy boundary; no new ownership manager/finalizer/explicit SearchParam dispose API. Prior task93 completed shared grammar, pause after full101 remains pending."
id_source: "generated"
---
## Summary

Task94 actual shared SearchParam value and mode conversion owner required by Calc document/ODS options and UI search.

## Scope

Original complete SearchParam class value fields, text/copy constructors, implicit memberwise copy_assign, getters with stable borrowed OUString member, original defaults/case/wildcard selection/UInt32 escape signed API output, SearchType enum and ConvertToSearchType/ConvertToBool with caller boolean outputs. Source-shaped unotools/inc/textsearch.ts and source/i18n/textsearch.ts, existing shared OUString reused. JS refs/GC, no new dispose/refcount/smart-pointer/search engine. Native complete original SearchParam class excerpt plus full unchanged constructors/destructor definitions over genuine existing dependencies, normal only; no fake TextSearch/locale/config/formatter peers, native lifetime/ABI/full QA claim. Add native helper/fixture/test, actual runtime/provenance/capability records and Calc checkpoint, suspected-case note only if meaningful case observed. Whole Calc and complete affected shared SAL/SearchParam owner coverage using existing consumers, source links absent/restored, static/Calc profile,16gates/exact review/DONE. Actual ScDocOptions still requires real metric/year/config services, no invented constants. Pause after scheduled full101 and relevant Calc/shared repairs, Writer-only coverage untouched.

## Plan

Actual shared SearchParam values/conversions for ScDocOptions/ODS/UI, reuse OUString and native JS narrowing/GC; complete initialized normal native streams, scoped raw100,16gates/exact review/DONE. No search/config/locale substitute; pause after full101 and relevant repairs.

## Verify Steps

1. node scripts/search-param-native-probe.mjs --write then --check observes complete original SearchParam class/constructor definitions over genuine OUString dependencies, all scoped search enum/int32 outputs and boolean input combinations, UInt32 escape boundaries and UTF16 defaults/copy/assignment/borrow histories. Normal-only full streams match portable tests, no fake peers/native memory counts/invalid lifetime/sanitizer.
2. Source-absence runner whole npm run test:coverage:calc plus complete affected shared SearchParam and SAL owner suites with existing actual consumers; raw unmodified S/B/F/L100 every counter positive, four exact links restored. Static build and Calc profile0UI. No Writer-only fixes or full run before101.
3. Existing whole16format/lint/type/docs/size/dependencies/resources/tooling/tree/provenance/registry/invariants/inventory/routing/doctor/diff checks. Actual named owner/provenance and bounded scope; no coverage exclusions, threshold/private-state forcing or wrapper duplication. Record failures before correction.
4. Exact current/committed non-task hashes, same-agent separate EVALUATOR (not independent review), canonical DONE and clean git status --short --untracked-files=all on calc. No TextSearch engine/document/ODS/UI or full original QA completion claim; stop goal only after scheduled full101 and bounded relevant repairs.

## Verification

Pending approved implementation and checks.

## Rollback Plan

Revert intentional task94 changes through followup task, restore all reference symlinks; no merges/history rewrite or unrelated tasks.

## Findings

ScDocOptions stores utl SearchParam::SearchType and calls ConvertToSearchType for ODS configuration booleans; real metric locale and two-digit year configuration peers are absent, so do not fake ScDocOptions defaults. SearchParam original value class needs only genuine existing OUString. Full TextSearch engine/backend/caching and generic ostream diagnostic remain outside current value-family scope. Existing SAL value cleanup is separate unchanged legacy boundary; no new ownership manager/finalizer/explicit SearchParam dispose API. Prior task93 completed shared grammar, pause after full101 remains pending.
