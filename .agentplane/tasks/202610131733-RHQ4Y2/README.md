---
id: "202610131733-RHQ4Y2"
title: "Implement shared search parameter values for Calc options and UI"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
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
doc_updated_at: "2026-10-13T17:55:34.922Z"
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
  Verification: |-
    Command: node scripts/search-param-native-probe.mjs --write and --check
    Result: pass.
    Evidence: complete original SearchParam declaration and unchanged ctor/destructor definitions, verified real dependencies446sources/six normal commands,17252byte whole initialized stream with preserved SHA256.
    Scope: original defaults/UTF16/scoped mode conversions/caller bool writes/UInt32 signed escape/copy/assignment/stable member references. No native memory counts/invalid lifetime/ABI/sanitizer/full QA, no fake TextSearch or config peers.

    Command: node output/playwright/task94-checks/portable.mjs
    Result: pass.
    Evidence: whole Calc133tests44files and affected shared76tests23files; raw every counter positive S/B/F/L100, Calc26owners3623S2412B669F3221L unchanged, shared13owners755S473B165F600L. Original four links absent/restored, static/Calc profile exit0,0UI scenarios.
    Scope: complete affected SAL/string-view/SearchParam owners with existing genuine consumer tests. Existing runtime/TestSearchParam capture bytes unchanged after profile; only source-backed checker edge/docs/metadata change subsequently. No Writer-only repair.

    Command: node output/playwright/task94-checks/gates.mjs --early and --late; npm run check:dependencies final supporting-file recheck
    Result: pass; all16required terminal gates exit0, initial failed dependency/metadata results and final rechecks retained.
    Scope: whole repository gates; only added unotools->sal edge is pinned original textsearch.hxx->rtl/ustring.hxx, cycle enforcement retained. Passed whole format/lint followed by targeted final supporting-file Prettier/ESLint checks and changed docs formatting; no other runtime changes. Exact current/committed source hashes and separate same-agent EVALUATOR required before closure; not independent review.13intentional non-task paths, goal active until full101/repairs then pause.
  Rollback Plan: "Revert intentional task94 changes through followup task, restore all reference symlinks; no merges/history rewrite or unrelated tasks."
  Findings: |-
    Original shared SearchParam values/static mode conversions advance actual ScDocOptions/ODS settings and UI search dependencies. Genuine OUString reuse/copy and stable borrowed member references, UInt32 escape/signed32 API, wildcard priority and exact boolean writes. No new SearchParam dispose/count/finalizer/allocator wrapper; existing SAL cleanup remains separate unchanged boundary. No TextSearch backend/cache/diagnostic ostream, metric/year/config defaults or actual document/UI/ODS substitute. Native446source hashes/six ordinary commands/17252byte stream with full original class/constructor definitions, no fake peers/native ABI/lifetime/count/sanitizer/full QA claim. Scoped unnamed SearchType values valid for fixed Int32 enum. Original QA search had no relevant exact SearchParam class anchor; source/name-similar makeSearchParam functions are not used as fake proof; native/portable actual comparison is evidence.

    Initial unotools/inc directory absent caused intended header write failure after new core file; create approved original header directory, no source widening. Initial native C++ caller used forbidden surrogate universal-character escapes; diagnostics/failed manifest retained, corrected to genuine scalar U0001F600 yielding same UTF16 units. Original definitions unchanged; final normal --write/--check passed. Dependency gate lacked newly instantiated original unotools->sal; add only source-backed textsearch.hxx->rtl/ustring.hxx edge to existing checker and retain cycle enforcement. One supporting file, no new string wrapper or approval scope drift. Whole format/lint passed; final supporting-file targeted Prettier/ESLint and actual dependency check pass before remaining10gates.

    CALC-083 records source-only ScDocOptions comparator omission of bIgnoreLineBreaks; native document instantiation/consumer effects unverified because real locale/config/formatter owners absent. Preserve original comparison when porting, no invented peer or silent fix.13intentional non-task paths; existing Writer/shared runtime unchanged, new actual header/core SearchParam owners only. Exact-source same-agent separate EVALUATOR and canonical closure required, not independent review. Goal active priority actual original document/editing/UI/ODS dependencies; pause after full101 and relevant repairs, Writer-only coverage untouched, unrelated DOING tasks untouched.

    Strict capability schema rejected missing upstream.tests, affecting registry/invariants and4inventory cases119/123. Added actual unexecuted testRegexForXLOOKUP document-mode context, explicitly not constructor or full QA proof. Native/portable complete value observations remain actual evidence; no invented makeSearchParam connection, schema exception or threshold relaxation. Final changed capability JSON formatting checked; only affected metadata gates rerun.
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

Command: node scripts/search-param-native-probe.mjs --write and --check
Result: pass.
Evidence: complete original SearchParam declaration and unchanged ctor/destructor definitions, verified real dependencies446sources/six normal commands,17252byte whole initialized stream with preserved SHA256.
Scope: original defaults/UTF16/scoped mode conversions/caller bool writes/UInt32 signed escape/copy/assignment/stable member references. No native memory counts/invalid lifetime/ABI/sanitizer/full QA, no fake TextSearch or config peers.

Command: node output/playwright/task94-checks/portable.mjs
Result: pass.
Evidence: whole Calc133tests44files and affected shared76tests23files; raw every counter positive S/B/F/L100, Calc26owners3623S2412B669F3221L unchanged, shared13owners755S473B165F600L. Original four links absent/restored, static/Calc profile exit0,0UI scenarios.
Scope: complete affected SAL/string-view/SearchParam owners with existing genuine consumer tests. Existing runtime/TestSearchParam capture bytes unchanged after profile; only source-backed checker edge/docs/metadata change subsequently. No Writer-only repair.

Command: node output/playwright/task94-checks/gates.mjs --early and --late; npm run check:dependencies final supporting-file recheck
Result: pass; all16required terminal gates exit0, initial failed dependency/metadata results and final rechecks retained.
Scope: whole repository gates; only added unotools->sal edge is pinned original textsearch.hxx->rtl/ustring.hxx, cycle enforcement retained. Passed whole format/lint followed by targeted final supporting-file Prettier/ESLint checks and changed docs formatting; no other runtime changes. Exact current/committed source hashes and separate same-agent EVALUATOR required before closure; not independent review.13intentional non-task paths, goal active until full101/repairs then pause.

## Rollback Plan

Revert intentional task94 changes through followup task, restore all reference symlinks; no merges/history rewrite or unrelated tasks.

## Findings

Original shared SearchParam values/static mode conversions advance actual ScDocOptions/ODS settings and UI search dependencies. Genuine OUString reuse/copy and stable borrowed member references, UInt32 escape/signed32 API, wildcard priority and exact boolean writes. No new SearchParam dispose/count/finalizer/allocator wrapper; existing SAL cleanup remains separate unchanged boundary. No TextSearch backend/cache/diagnostic ostream, metric/year/config defaults or actual document/UI/ODS substitute. Native446source hashes/six ordinary commands/17252byte stream with full original class/constructor definitions, no fake peers/native ABI/lifetime/count/sanitizer/full QA claim. Scoped unnamed SearchType values valid for fixed Int32 enum. Original QA search had no relevant exact SearchParam class anchor; source/name-similar makeSearchParam functions are not used as fake proof; native/portable actual comparison is evidence.

Initial unotools/inc directory absent caused intended header write failure after new core file; create approved original header directory, no source widening. Initial native C++ caller used forbidden surrogate universal-character escapes; diagnostics/failed manifest retained, corrected to genuine scalar U0001F600 yielding same UTF16 units. Original definitions unchanged; final normal --write/--check passed. Dependency gate lacked newly instantiated original unotools->sal; add only source-backed textsearch.hxx->rtl/ustring.hxx edge to existing checker and retain cycle enforcement. One supporting file, no new string wrapper or approval scope drift. Whole format/lint passed; final supporting-file targeted Prettier/ESLint and actual dependency check pass before remaining10gates.

CALC-083 records source-only ScDocOptions comparator omission of bIgnoreLineBreaks; native document instantiation/consumer effects unverified because real locale/config/formatter owners absent. Preserve original comparison when porting, no invented peer or silent fix.13intentional non-task paths; existing Writer/shared runtime unchanged, new actual header/core SearchParam owners only. Exact-source same-agent separate EVALUATOR and canonical closure required, not independent review. Goal active priority actual original document/editing/UI/ODS dependencies; pause after full101 and relevant repairs, Writer-only coverage untouched, unrelated DOING tasks untouched.

Strict capability schema rejected missing upstream.tests, affecting registry/invariants and4inventory cases119/123. Added actual unexecuted testRegexForXLOOKUP document-mode context, explicitly not constructor or full QA proof. Native/portable complete value observations remain actual evidence; no invented makeSearchParam connection, schema exception or threshold relaxation. Final changed capability JSON formatting checked; only affected metadata gates rerun.
