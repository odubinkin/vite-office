---
id: "202610160119-EC0NT5"
title: "Implement native Calc document calculation options"
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
  updated_at: "2026-10-16T01:20:33.551Z"
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
    body: "Start: implement actual document calculation options and item using native defaults and reused shared SearchParam/locale/pool values;verify exact related and Calc raw100."
events:
  -
    type: "status"
    at: "2026-10-16T01:20:33.958Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement actual document calculation options and item using native defaults and reused shared SearchParam/locale/pool values;verify exact related and Calc raw100."
doc_version: 3
doc_updated_at: "2026-10-16T01:20:33.958Z"
doc_updated_by: "CODER"
description: "Task185: implement actual ScDocOptions/ScTpCalcItem required by eager ScPoolHelper document construction,shared locale measurement binding and source schema date defaults;reuse SearchParam."
sections:
  Summary: "Implement actual Calc ScDocOptions value owner and ScTpCalcItem required by document pool helper construction,including native defaults,copy,search-mode state transitions and comparison."
  Scope: "Calc docoptio source/header/tests;shared source locale measurement field/resource and system-locale reuse,SVL formatter default-value responsibility/resource,necessary actual native dependency edge metadata,inventory/provenance/readiness/suspicion journal and actual browser/Worker test. Maximum50non-task paths. Reuse SearchParam,Locale,OUString,SfxPoolItem. No fake document/pool/formatter/service,physical memory engine,native compiler,network or full all-app run. Full configuration services and number formatting remain pending;bind only current shipped source configuration fields."
  Plan: "Implement documented Task185 document calculation options and required real shared default/locale bindings under standing user approval."
  Verify Steps: "Pin docoptio.hxx/cxx,optutil.cxx,textsearch.hxx,locale-data sources/wrapper/schema and formatter defaults. Verify all ScDocOptions defaults,US/metric tab distance,1950schema date threshold,all getters/setters/native integer widths,date output slots,copy/assignment/self-assignment,equality short-circuit at each represented field,ignored linebreak field,search cached-mode normalization and flag no-op transitions;reuse actual SearchParam. ScTpCalcItem real base Which/copy/Clone/borrowed const options/equality. Reconstruct all shipped LC_CTYPE measurement fields with recursive ref resolution and prove exact source table;keep existing decimal field results and canonical locale fallback order. Related shared and whole Calc raw S/B/F/L100,every raw counter positive,exact owner sets;Writer-only gaps exempt.13source gates,production build,actual Chromium/dedicated DOM-free Worker options values and Writer startup/load/edit,4reference links absent/restored. No native compiler/probe or all-app run."
  Verification: "Pending implementation and required checks."
  Rollback Plan: "Revert only Task185 source and task commits;preserve calc branch,other tasks and4reference symlinks. No merge/history rewrite,guard weakening or unrelated Writer-only coverage repairs."
  Findings: "ScDocOptions is eagerly default-constructed inside ScPoolHelper and carries required document calculation/search/null-date settings. Source normal default reads Common/DateFormat/TwoDigitYear1950;1930 occurs only in fuzzing. Native comparison omits bIgnoreLineBreaks and compares cached eFormulaSearchType directly;preserve and document without declaring an upstream bug."
id_source: "generated"
---
## Summary

Implement actual Calc ScDocOptions value owner and ScTpCalcItem required by document pool helper construction,including native defaults,copy,search-mode state transitions and comparison.

## Scope

Calc docoptio source/header/tests;shared source locale measurement field/resource and system-locale reuse,SVL formatter default-value responsibility/resource,necessary actual native dependency edge metadata,inventory/provenance/readiness/suspicion journal and actual browser/Worker test. Maximum50non-task paths. Reuse SearchParam,Locale,OUString,SfxPoolItem. No fake document/pool/formatter/service,physical memory engine,native compiler,network or full all-app run. Full configuration services and number formatting remain pending;bind only current shipped source configuration fields.

## Plan

Implement documented Task185 document calculation options and required real shared default/locale bindings under standing user approval.

## Verify Steps

Pin docoptio.hxx/cxx,optutil.cxx,textsearch.hxx,locale-data sources/wrapper/schema and formatter defaults. Verify all ScDocOptions defaults,US/metric tab distance,1950schema date threshold,all getters/setters/native integer widths,date output slots,copy/assignment/self-assignment,equality short-circuit at each represented field,ignored linebreak field,search cached-mode normalization and flag no-op transitions;reuse actual SearchParam. ScTpCalcItem real base Which/copy/Clone/borrowed const options/equality. Reconstruct all shipped LC_CTYPE measurement fields with recursive ref resolution and prove exact source table;keep existing decimal field results and canonical locale fallback order. Related shared and whole Calc raw S/B/F/L100,every raw counter positive,exact owner sets;Writer-only gaps exempt.13source gates,production build,actual Chromium/dedicated DOM-free Worker options values and Writer startup/load/edit,4reference links absent/restored. No native compiler/probe or all-app run.

## Verification

Pending implementation and required checks.

## Rollback Plan

Revert only Task185 source and task commits;preserve calc branch,other tasks and4reference symlinks. No merge/history rewrite,guard weakening or unrelated Writer-only coverage repairs.

## Findings

ScDocOptions is eagerly default-constructed inside ScPoolHelper and carries required document calculation/search/null-date settings. Source normal default reads Common/DateFormat/TwoDigitYear1950;1930 occurs only in fuzzing. Native comparison omits bIgnoreLineBreaks and compares cached eFormulaSearchType directly;preserve and document without declaring an upstream bug.
