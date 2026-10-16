---
id: "202610160149-P52EJ4"
title: "Implement shared native language ID and locale conversion"
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
  updated_at: "2026-10-16T01:51:04.849Z"
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
    body: "Start: port actual ordered MsLangId Conversion tables/algorithms and reuse them for existing locale fallback,using actual Locale/OUString/SAL ASCII values without ICU or fake services."
events:
  -
    type: "status"
    at: "2026-10-16T01:51:05.271Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port actual ordered MsLangId Conversion tables/algorithms and reuse them for existing locale fallback,using actual Locale/OUString/SAL ASCII values without ICU or fake services."
doc_version: 3
doc_updated_at: "2026-10-16T01:51:05.271Z"
doc_updated_by: "CODER"
description: "Task187: port MsLangId Conversion table algorithms required by LanguageTag/default-font and ODS language attributes,using actual upstream ordered ID/ISO/script/BCP47/private-use mappings and existing Locale/OUString/SAL ASCII helpers."
sections:
  Summary: "Implement actual shared MsLangId Conversion table-based locale/ID/fallback responsibilities required by LanguageTag,standard font defaults and ODS language attributes."
  Scope: "Shared i18nlangtag ordered ISO/script/BCP47/private tables,entry operations and native forward/reverse/private/override/fallback conversions;canonical mslangid header and required lang constant;reuse actual Locale/OUString/SAL character operations. Replace existing i18npool language-only fallback projection with the actual shared conversion owner and retain prior source-projected values as a test fixture. Tests,inventory/provenance/capability/readiness/suspected cases and real Chromium/Worker. At most60non-task paths. No fake LanguageTag/configuration/font/document service,ICU/liblangtag import,native compiler/generator/probe,memory engine,network or all-app run."
  Plan: "Implement documented Task187 real shared locale/ID/fallback conversion scope and source-absent verification under standing user approval."
  Verify Steps: "Pin native isolang.cxx,lang.h,mslangid.hxx,LanguageTag consumer and QA anchors;prove every table row,order,alias,private sentinel and special countryless fallback ID exactly matches source. Known native QA-derived locale/ID pairs and independent literal old-code/override/script/BCP47/private/unknown examples. Forward output preserves caller stable Locale fields and leaves all untouched for unmapped IDs;both override modes and all UInt16 inputs. Reverse ASCII-only case handling,unknown IDs,private wildcard,x-prefix,qlt mismatch,variant/country rules. Override and fallback selection,script-prefix/country-length boundaries,first-match and special countryless rules. Old306language-only fallback fixture exact under new owner plus existing decimal/font/Writer tests. Exact executable changed shared owner set,all raw S/B/F/L100,every counter positive,whole Calc raw100;Writer-only gaps exempt.13gates,production build,actual Chromium/dedicated DOM-free Worker and Writer startup/load/edit with4refs absent/restored. No C++ compiler/generator/probe;full LanguageTag canonicalization/system settings/font/doc/UI/ODS remain pending."
  Verification: "Pending implementation and required verification."
  Rollback Plan: "Revert only Task187 source/task commits,preserving calc branch,other tasks and4reference links. No merge/history rewrite,guard weakening,external writes or unrelated Writer-only coverage repair."
  Findings: "LanguageTag numeric-ID and font language fields require actual native locale/ID tables. This responsibility performs table conversion and ASCII matching,not ICU Unicode casing,BCP47 canonicalization or localized interface labels. Existing language-only fallback projection can become a regression fixture once actual shared fallback owns the behavior."
id_source: "generated"
---
## Summary

Implement actual shared MsLangId Conversion table-based locale/ID/fallback responsibilities required by LanguageTag,standard font defaults and ODS language attributes.

## Scope

Shared i18nlangtag ordered ISO/script/BCP47/private tables,entry operations and native forward/reverse/private/override/fallback conversions;canonical mslangid header and required lang constant;reuse actual Locale/OUString/SAL character operations. Replace existing i18npool language-only fallback projection with the actual shared conversion owner and retain prior source-projected values as a test fixture. Tests,inventory/provenance/capability/readiness/suspected cases and real Chromium/Worker. At most60non-task paths. No fake LanguageTag/configuration/font/document service,ICU/liblangtag import,native compiler/generator/probe,memory engine,network or all-app run.

## Plan

Implement documented Task187 real shared locale/ID/fallback conversion scope and source-absent verification under standing user approval.

## Verify Steps

Pin native isolang.cxx,lang.h,mslangid.hxx,LanguageTag consumer and QA anchors;prove every table row,order,alias,private sentinel and special countryless fallback ID exactly matches source. Known native QA-derived locale/ID pairs and independent literal old-code/override/script/BCP47/private/unknown examples. Forward output preserves caller stable Locale fields and leaves all untouched for unmapped IDs;both override modes and all UInt16 inputs. Reverse ASCII-only case handling,unknown IDs,private wildcard,x-prefix,qlt mismatch,variant/country rules. Override and fallback selection,script-prefix/country-length boundaries,first-match and special countryless rules. Old306language-only fallback fixture exact under new owner plus existing decimal/font/Writer tests. Exact executable changed shared owner set,all raw S/B/F/L100,every counter positive,whole Calc raw100;Writer-only gaps exempt.13gates,production build,actual Chromium/dedicated DOM-free Worker and Writer startup/load/edit with4refs absent/restored. No C++ compiler/generator/probe;full LanguageTag canonicalization/system settings/font/doc/UI/ODS remain pending.

## Verification

Pending implementation and required verification.

## Rollback Plan

Revert only Task187 source/task commits,preserving calc branch,other tasks and4reference links. No merge/history rewrite,guard weakening,external writes or unrelated Writer-only coverage repair.

## Findings

LanguageTag numeric-ID and font language fields require actual native locale/ID tables. This responsibility performs table conversion and ASCII matching,not ICU Unicode casing,BCP47 canonicalization or localized interface labels. Existing language-only fallback projection can become a regression fixture once actual shared fallback owns the behavior.
