---
id: "202610160328-6NB2F9"
title: "Implement native legacy language names and defined tag mappings"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "calc-core"
  - "code"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-16T03:29:29.678Z"
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
    body: "Start: implement complete source OUString name conversion and defined mappings required by LanguageTag,with raw IDs/order/independent values and strict portable checks;no missing byte overload fake."
events:
  -
    type: "status"
    at: "2026-10-16T03:29:40.542Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement complete source OUString name conversion and defined mappings required by LanguageTag,with raw IDs/order/independent values and strict portable checks;no missing byte overload fake."
doc_version: 3
doc_updated_at: "2026-10-16T03:39:05.746Z"
doc_updated_by: "CODER"
description: "Task191: implement complete OUString convertIsoNamesToLanguage and getDefinedLanguagetags prerequisites called by LanguageTag conversion/canonicalization,port exact four legacy tables and preserve raw IDs/order/sentinels. No fake LanguageTag or byte overload requiring missing class."
sections:
  Summary: "Implement the complete native OUString legacy-name conversion and defined-tag mapping sequence required by LanguageTagImpl conversion/canonicalization on the Calc font critical path. Standing user approval covers these shared prerequisites and correction of shared behavior."
  Scope: "Only vite-office-calc branch calc. Exact English-country,nonstandard-country,best-name and private/ISO lookup order;raw language IDs without override normalization;all sentinel rows and643defined ordered mappings. Original mapping records use actual independently owned OUString fields and numeric IDs,ordinary JS record value structure without native allocation/refcount machinery. Public represented conversion is the explicit OUString/OUString/bool native overload;byte overload with missing LanguageTag/on-the-fly behavior remains unrepresented,not replaced with a fake. Reuse existing tables/ASCII/OUString owners. Update source inventory/provenance/Calc readiness and suspected ledger. No ICU/liblangtag/compiler/probe/memory engine,guard edits or full all-app run. Maximum25non-task files."
  Plan: "Port complete source OUString legacy-name converter and defined mapping sequence needed by native LanguageTag;retain raw IDs/sentinels/order/ownership,record suspicious source table rows and verify related/Calc strict raw100 plus real browser/Writer. No byte overload fake,library or memory engine."
  Verify Steps: |-
    - node output/playwright/task191-checks/native-audit.mjs:5source pins,exact four legacy table projections/sentinels/order/aliases,643defined mappings,native method/header markers and unchanged existing conversions/guards.
    - node output/playwright/task191-checks/portable.mjs:related converter/source mapping/Writer and wholeCalc tests with four refs absent/restored;exact two changed shared executable owners and36Calc raw S/B/F/L100,every counter positive;Writer-only coverage gaps exempt.
    - node output/playwright/task191-checks/browser-portable.mjs:production build,actual native name conversion/mapping ownership in Chromium/DOM-free Worker and related Writer startup,source refs absent/restored.
    - node output/playwright/task191-checks/source-gates.mjs:13source gates including inventory/provenance/boundaries/doctor,no exemptions.
    - node output/playwright/task191-checks/final-audit.mjs:exact paths/owners/evidence/source refs/limits;source commit,recorded verification and same-agent EVALUATOR review before descriptive finish.
  Verification: "Command: node output/playwright/task191-checks/native-audit.mjs. Result:pass. Evidence:5native pinned hashes,exact80legacy rows/4sentinels and643main defined entries,raw IDs/aliases,required native LanguageTag caller edges;existing conversion bodies and7related owners/guard unchanged. No native binary execution. Command: node output/playwright/task191-checks/portable.mjs. Result:pass. Evidence:68related/9files and196Calc/78files;exact2changed shared owners raw S123/B92/F7/L103100 and36Calc raw S4310/B2777/F864/L3857100,every raw counter positive. Four source refs absent/restored. Includes alllegacytablequeries,ASCII/UTF16 boundaries,skip/country-only/private/name priorities,643ordered mapping records and actual OUString ownership/Writer defaults/ODF roundtrip. Command: node output/playwright/task191-checks/browser-portable.mjs. Result:pass. Evidence:production build,actual Chromium/DOM-free Worker Unicode name lookup/raw priority/643mapping ownership andWriter startup/load/edit pass,4refs restored. Command: node output/playwright/task191-checks/source-gates.mjs. Result:13gates pass including inventory/provenance/boundaries/doctor. Command: node output/playwright/task191-checks/final-audit.mjs. Result:pass. Evidence:12intentional paths,exact owners/counters/manifests,capability broad parityflags remainfalse. CALC-174 records suspicious English rows without correction. Explicit Unicode overload only;byte overload/actual LanguageTag state/canonicalization/registry/Font/defaults/pools/document/UI/ODS pending. No fakeclass/constructor,ICU/nativecompiler/memoryengine/all-app run;goal active."
  Rollback Plan: "Revert task source and associated metadata/doc changes without resetting user work or touching unrelated tasks;retain historical task evidence."
  Findings: |-
    Source inspection identified native convertLocaleToLang calling the missing legacy-name fallback and getKnowns calling defined-tag mappings. These are direct prerequisites rather than interface localization.

    - Observation: Initial raw-versus-override test selected a later Latin alias whose language/country already has a preceding canonical ISO row;source lookup correctly returns earlier1142 rather than alias32886.
      Impact: Test selection contradicted first-match priority;production converter follows native order and all other67related scenarios pass.
      Resolution: Use independent ku/IQ literal vector with source first raw3622 versus override-normalized1170;retain all643defined entries including the later Latin aliases.

    - Observation: The ku/IQ alias candidate is also shadowed by an earlier canonical1170 row. Exhaustive first-row inspection shows every numeric redirect ISO row is preceded by a row for the same language/country.
      Impact: A forced raw-versus-normalized numeric disagreement is not supported by this source table. The converter's direct raw return and defined mapping alias retention remain required contracts.
      Resolution: Test actual first-match la/VA1142 and ku/IQ1170 alongside the retained later32886/3622 records;remove the unsupported disagreement assertion and correct browser expected literal. Production code unchanged.
id_source: "generated"
---
## Summary

Implement the complete native OUString legacy-name conversion and defined-tag mapping sequence required by LanguageTagImpl conversion/canonicalization on the Calc font critical path. Standing user approval covers these shared prerequisites and correction of shared behavior.

## Scope

Only vite-office-calc branch calc. Exact English-country,nonstandard-country,best-name and private/ISO lookup order;raw language IDs without override normalization;all sentinel rows and643defined ordered mappings. Original mapping records use actual independently owned OUString fields and numeric IDs,ordinary JS record value structure without native allocation/refcount machinery. Public represented conversion is the explicit OUString/OUString/bool native overload;byte overload with missing LanguageTag/on-the-fly behavior remains unrepresented,not replaced with a fake. Reuse existing tables/ASCII/OUString owners. Update source inventory/provenance/Calc readiness and suspected ledger. No ICU/liblangtag/compiler/probe/memory engine,guard edits or full all-app run. Maximum25non-task files.

## Plan

Port complete source OUString legacy-name converter and defined mapping sequence needed by native LanguageTag;retain raw IDs/sentinels/order/ownership,record suspicious source table rows and verify related/Calc strict raw100 plus real browser/Writer. No byte overload fake,library or memory engine.

## Verify Steps

- node output/playwright/task191-checks/native-audit.mjs:5source pins,exact four legacy table projections/sentinels/order/aliases,643defined mappings,native method/header markers and unchanged existing conversions/guards.
- node output/playwright/task191-checks/portable.mjs:related converter/source mapping/Writer and wholeCalc tests with four refs absent/restored;exact two changed shared executable owners and36Calc raw S/B/F/L100,every counter positive;Writer-only coverage gaps exempt.
- node output/playwright/task191-checks/browser-portable.mjs:production build,actual native name conversion/mapping ownership in Chromium/DOM-free Worker and related Writer startup,source refs absent/restored.
- node output/playwright/task191-checks/source-gates.mjs:13source gates including inventory/provenance/boundaries/doctor,no exemptions.
- node output/playwright/task191-checks/final-audit.mjs:exact paths/owners/evidence/source refs/limits;source commit,recorded verification and same-agent EVALUATOR review before descriptive finish.

## Verification

Command: node output/playwright/task191-checks/native-audit.mjs. Result:pass. Evidence:5native pinned hashes,exact80legacy rows/4sentinels and643main defined entries,raw IDs/aliases,required native LanguageTag caller edges;existing conversion bodies and7related owners/guard unchanged. No native binary execution. Command: node output/playwright/task191-checks/portable.mjs. Result:pass. Evidence:68related/9files and196Calc/78files;exact2changed shared owners raw S123/B92/F7/L103100 and36Calc raw S4310/B2777/F864/L3857100,every raw counter positive. Four source refs absent/restored. Includes alllegacytablequeries,ASCII/UTF16 boundaries,skip/country-only/private/name priorities,643ordered mapping records and actual OUString ownership/Writer defaults/ODF roundtrip. Command: node output/playwright/task191-checks/browser-portable.mjs. Result:pass. Evidence:production build,actual Chromium/DOM-free Worker Unicode name lookup/raw priority/643mapping ownership andWriter startup/load/edit pass,4refs restored. Command: node output/playwright/task191-checks/source-gates.mjs. Result:13gates pass including inventory/provenance/boundaries/doctor. Command: node output/playwright/task191-checks/final-audit.mjs. Result:pass. Evidence:12intentional paths,exact owners/counters/manifests,capability broad parityflags remainfalse. CALC-174 records suspicious English rows without correction. Explicit Unicode overload only;byte overload/actual LanguageTag state/canonicalization/registry/Font/defaults/pools/document/UI/ODS pending. No fakeclass/constructor,ICU/nativecompiler/memoryengine/all-app run;goal active.

## Rollback Plan

Revert task source and associated metadata/doc changes without resetting user work or touching unrelated tasks;retain historical task evidence.

## Findings

Source inspection identified native convertLocaleToLang calling the missing legacy-name fallback and getKnowns calling defined-tag mappings. These are direct prerequisites rather than interface localization.

- Observation: Initial raw-versus-override test selected a later Latin alias whose language/country already has a preceding canonical ISO row;source lookup correctly returns earlier1142 rather than alias32886.
  Impact: Test selection contradicted first-match priority;production converter follows native order and all other67related scenarios pass.
  Resolution: Use independent ku/IQ literal vector with source first raw3622 versus override-normalized1170;retain all643defined entries including the later Latin aliases.

- Observation: The ku/IQ alias candidate is also shadowed by an earlier canonical1170 row. Exhaustive first-row inspection shows every numeric redirect ISO row is preceded by a row for the same language/country.
  Impact: A forced raw-versus-normalized numeric disagreement is not supported by this source table. The converter's direct raw return and defined mapping alias retention remain required contracts.
  Resolution: Test actual first-match la/VA1142 and ku/IQ1170 alongside the retained later32886/3622 records;remove the unsupported disagreement assertion and correct browser expected literal. Production code unchanged.
