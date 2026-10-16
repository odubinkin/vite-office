---
id: "202610160228-Q5ZD5F"
title: "Implement native system language resolution and locale wrappers"
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
  updated_at: "2026-10-16T02:29:50.872Z"
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
    body: "Start: port actual native system/data/UI language resolution and Locale wrappers,reuse host Locale preparation and correct empty-language shared fallback;verify related and Calc raw100 without RTL memory machinery."
events:
  -
    type: "status"
    at: "2026-10-16T02:29:51.289Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port actual native system/data/UI language resolution and Locale wrappers,reuse host Locale preparation and correct empty-language shared fallback;verify related and Calc raw100 without RTL memory machinery."
doc_version: 3
doc_updated_at: "2026-10-16T02:29:51.289Z"
doc_updated_by: "CODER"
description: "Task188: implement actual MsLangId configured/system/UI resolution and public Locale wrappers;reuse one browser platform-locale field binding instead of adding RTL locale memory structures or fake LanguageTag services."
sections:
  Summary: "Implement native MsLangId configured/system/UI language resolution and public Locale wrappers,closing the explicit empty-language fallback gap needed by LanguageTag and Calc font defaults."
  Scope: "New mslangid core source and browser-platform insys field binding;move existing host Locale preparation unchanged into one shared lower-level platform responsibility and delegate existing SysLocale query. Native configured/system/UI scalar state and getRealLanguage,convertLanguageToLocale,convertLocaleToLanguage,getFallbackLocale plus2required aliases;canonical facade and i18npool integration. Tests,inventory/provenance/capability/readiness and actual Chromium/Worker/Writer. Maximum45non-task paths. No RTL locale allocator/registry/refcount/cache engine,fake LanguageTag/OS/service,no new ICU/native compiler/generator/probe,network or all-app run. Existing private table algorithms and browser host parsing remain unchanged."
  Plan: "Implement documented Task188 native system/configured language scalar state and public locale wrappers over one existing browser platform Locale source under standing user approval."
  Verify Steps: "Pin mslangid.cxx/mslangid.hxx,insys/inunx/inwnt platform sources,lang.h,LanguageTag and LocaleData consumers. Exact native alias constants0x0400/0x0800,configured scalar defaults0,UI/data independence,lazy platform snapshots,normalization/unknown behavior,nonrecursive configured aliases and invalid mapping last-resort only for original system aliases. Actual Locale wrappers copy fields and preserve explicit Locale behavior;empty input resolves actual configured/platform locale. Prove moved host Locale preparation and value-construction emitted tokens unchanged,old private tables/converters and unrelated Writer/defaults/guards unchanged. Existing regressions plus actual empty-Locale decimal/measurement/tab/document setting consumers. Exact changed shared executable owner set raw S/B/F/L100,every counter positive;whole Calc raw100,related Writer tests,13source gates,production build and actual Chromium/dedicated DOM-free Worker/Writer;4refs absent/restored. Platform binding is explicit browser adaptation,not Unix environment/Win32/RTL ABI implementation;full LanguageTag/canonicalization/fonts/pool/document/UI/ODS pending. No compiler/generator/probe or all-app run."
  Verification: "Pending implementation and required checks."
  Rollback Plan: "Revert only Task188 source/task commits,preserve calc branch,other work and4reference links. No merge/history rewrite,guard weakening,external writes or unrelated Writer-only coverage repair."
  Findings: "Native configured data/UI language defaults are independent LANGUAGE_SYSTEM scalars;platform language access lazily captures corresponding values. Scalar configuration and snapshot identity are observable logical behavior,not physical memory management. Browser exposes one primary locale source,so data/UI platform bindings use it while retaining independent snapshots and configured overrides. Public empty-language fallback delegates original getRealLanguage and then private table fallback;do not emulate it by unconditional en-US."
id_source: "generated"
---
## Summary

Implement native MsLangId configured/system/UI language resolution and public Locale wrappers,closing the explicit empty-language fallback gap needed by LanguageTag and Calc font defaults.

## Scope

New mslangid core source and browser-platform insys field binding;move existing host Locale preparation unchanged into one shared lower-level platform responsibility and delegate existing SysLocale query. Native configured/system/UI scalar state and getRealLanguage,convertLanguageToLocale,convertLocaleToLanguage,getFallbackLocale plus2required aliases;canonical facade and i18npool integration. Tests,inventory/provenance/capability/readiness and actual Chromium/Worker/Writer. Maximum45non-task paths. No RTL locale allocator/registry/refcount/cache engine,fake LanguageTag/OS/service,no new ICU/native compiler/generator/probe,network or all-app run. Existing private table algorithms and browser host parsing remain unchanged.

## Plan

Implement documented Task188 native system/configured language scalar state and public locale wrappers over one existing browser platform Locale source under standing user approval.

## Verify Steps

Pin mslangid.cxx/mslangid.hxx,insys/inunx/inwnt platform sources,lang.h,LanguageTag and LocaleData consumers. Exact native alias constants0x0400/0x0800,configured scalar defaults0,UI/data independence,lazy platform snapshots,normalization/unknown behavior,nonrecursive configured aliases and invalid mapping last-resort only for original system aliases. Actual Locale wrappers copy fields and preserve explicit Locale behavior;empty input resolves actual configured/platform locale. Prove moved host Locale preparation and value-construction emitted tokens unchanged,old private tables/converters and unrelated Writer/defaults/guards unchanged. Existing regressions plus actual empty-Locale decimal/measurement/tab/document setting consumers. Exact changed shared executable owner set raw S/B/F/L100,every counter positive;whole Calc raw100,related Writer tests,13source gates,production build and actual Chromium/dedicated DOM-free Worker/Writer;4refs absent/restored. Platform binding is explicit browser adaptation,not Unix environment/Win32/RTL ABI implementation;full LanguageTag/canonicalization/fonts/pool/document/UI/ODS pending. No compiler/generator/probe or all-app run.

## Verification

Pending implementation and required checks.

## Rollback Plan

Revert only Task188 source/task commits,preserve calc branch,other work and4reference links. No merge/history rewrite,guard weakening,external writes or unrelated Writer-only coverage repair.

## Findings

Native configured data/UI language defaults are independent LANGUAGE_SYSTEM scalars;platform language access lazily captures corresponding values. Scalar configuration and snapshot identity are observable logical behavior,not physical memory management. Browser exposes one primary locale source,so data/UI platform bindings use it while retaining independent snapshots and configured overrides. Public empty-language fallback delegates original getRealLanguage and then private table fallback;do not emulate it by unconditional en-US.
