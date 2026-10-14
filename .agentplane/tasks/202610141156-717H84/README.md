---
id: "202610141156-717H84"
title: "Align shared native font posture and Calc script defaults"
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
  updated_at: "2026-10-14T11:57:49.775Z"
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
    body: "Start: align real shared posture enum Any and VCL slant conversion, preserve existing Writer aliases, source-backed expectations and Calc3script defaults; targeted100."
events:
  -
    type: "status"
    at: "2026-10-14T11:57:55.545Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: align real shared posture enum Any and VCL slant conversion, preserve existing Writer aliases, source-backed expectations and Calc3script defaults; targeted100."
doc_version: 3
doc_updated_at: "2026-10-14T11:57:55.545Z"
doc_updated_by: "CODER"
description: "Task122: canonical existing SvxPostureItem over real SfxEnumItem with native FontItalic/VCL ConvertFontSlant/real UNO FontSlant enum; preserve browser aliases once, source-backed expectation migration and Calc103114119NONE defaults. Targeted raw100; full only at minimum UI+ODS readiness then repair/pause."
sections:
  Summary: "Correct existing shared font posture contract for Calc3script defaults and future UI/ODS. Reuse real enum/Any/VCL owners, preserve existing Writer import names as aliases to canonical enum. Localcalc only, no merges."
  Scope: "Existing EditEng textitem posture becomes actual SfxEnumItem with native getter/bool/setters/factory/copy/Clone/typed Any members; tools fontenum adds original FontItalic, existing browser FontItalic names become const/type aliases to same enum. New postitem header, VCL unohelp header/core slant overload families, OffAPI FontSlant actual enum/type binding, memberids and scitems103114119. Existing textitem tests source-backed migrations,2newtests, exact native VCL→tools/offapi edges/checker test, runtime/provenance/caps/Calcdocs/suspectedcases. No other font conversion families/localized presentation/cache/memoryABI/fullDocPool/documentprovider."
  Plan: "Port original FontItalic enum/sentinel once; preserve Writer NONE/OBLIQUE/NORMAL/DONTKNOW API aliases without duplicate enum. Existing browser constructor validation remains explicit host boundary for integer0through native maxenum, now admits native initialized unknown4 and sentinel; negative/fractional errors retained, not native abort claim. Original posture Bool is value>=OBLIQUE (DONTKNOWtrue), same-type/payload equality ignoresWhich via actual SfxEnumItem. Native copy/Clone/factory and SetBool select NORMAL/NONE. Query bool or real FontSlant enum; Put bool common Any2Bool or actual enum extraction then signed32 fallback; unknownmembers untouchedsuccess. VCL ConvertFontSlant two enum families use explicit erased-family selector because both are JSnumbers, preserving full switch/default/reverse/sentinel mapping. Actual cppumaker-normal type binding reuses CPPU; no generator execution. Source-backed test expectation migrations for DONTKNOW/equality/unknown4, no threshold weakening. Calc script defaultNONE itemset copies. Targeted raw100/12gates/boundaries/exactsource/nativepins/same-agentEVAL/APclose; full only at minimum actual UI+ODSread/save readiness then repair/pause."
  Verify Steps: "Read complete native posture/header/factory/toolsFontItalic and both VCL ConvertFontSlant bodies/header, FontSlantIDL/normalcppumaker type emission/memberids/DocPool and actual SfxEnumItem/Any. Cover4normalitalic+sentinel+unknown nativevalues,6normalSlant+sentinel+unknown mappings, copy/Clone/factory/boolthreshold/SetBool/Which/hash/typed ENUM/coldwarm type/getter, realenum andsigned32 fallback/memberconvert/narrow/unknownsuccess/failedunchanged. Preserve negative/fractional host validation and positiveunknown4 history in existing tests; exact2boolean/equality expectation corrections justified from source. WholeCalc and complete changedshared owner rawS/B/F/L100 everycounterpositive4referencesabsent/restoredfinally; include current fulltextitem/font-effects/nativebool/Writerattributes/numbering consumers. Focusedformat/lint/typecheck/docs/size/deps/tree/provenance/inventory/moduleboundaries/routing/doctor/diff, initialfailuresretained, exactpaths/freshGitbaseline/nativeSHA256pins. Same-agentEVAL not independent. No fullsuite now."
  Verification: "Pending implementation/checks."
  Rollback Plan: "Revert only task122source commit preserving task121/userhistory; no reset/merge/externalpublication."
  Findings: "Previous goal turn task121verifiedprogress. Preflight cleancalc, unrelated active tasks untouched. Native posture mismatches discovered: DONTKNOW booltrue andpayload equality ignoresWhich; host constructorunknown4 rejection narrower than native enum value domain. User fidelity authorization covers correction with source-backed tests. Next full only real minimum UI+ODSread/save readiness then repair/pause; no fixedtasknumbertrigger."
id_source: "generated"
---
## Summary

Correct existing shared font posture contract for Calc3script defaults and future UI/ODS. Reuse real enum/Any/VCL owners, preserve existing Writer import names as aliases to canonical enum. Localcalc only, no merges.

## Scope

Existing EditEng textitem posture becomes actual SfxEnumItem with native getter/bool/setters/factory/copy/Clone/typed Any members; tools fontenum adds original FontItalic, existing browser FontItalic names become const/type aliases to same enum. New postitem header, VCL unohelp header/core slant overload families, OffAPI FontSlant actual enum/type binding, memberids and scitems103114119. Existing textitem tests source-backed migrations,2newtests, exact native VCL→tools/offapi edges/checker test, runtime/provenance/caps/Calcdocs/suspectedcases. No other font conversion families/localized presentation/cache/memoryABI/fullDocPool/documentprovider.

## Plan

Port original FontItalic enum/sentinel once; preserve Writer NONE/OBLIQUE/NORMAL/DONTKNOW API aliases without duplicate enum. Existing browser constructor validation remains explicit host boundary for integer0through native maxenum, now admits native initialized unknown4 and sentinel; negative/fractional errors retained, not native abort claim. Original posture Bool is value>=OBLIQUE (DONTKNOWtrue), same-type/payload equality ignoresWhich via actual SfxEnumItem. Native copy/Clone/factory and SetBool select NORMAL/NONE. Query bool or real FontSlant enum; Put bool common Any2Bool or actual enum extraction then signed32 fallback; unknownmembers untouchedsuccess. VCL ConvertFontSlant two enum families use explicit erased-family selector because both are JSnumbers, preserving full switch/default/reverse/sentinel mapping. Actual cppumaker-normal type binding reuses CPPU; no generator execution. Source-backed test expectation migrations for DONTKNOW/equality/unknown4, no threshold weakening. Calc script defaultNONE itemset copies. Targeted raw100/12gates/boundaries/exactsource/nativepins/same-agentEVAL/APclose; full only at minimum actual UI+ODSread/save readiness then repair/pause.

## Verify Steps

Read complete native posture/header/factory/toolsFontItalic and both VCL ConvertFontSlant bodies/header, FontSlantIDL/normalcppumaker type emission/memberids/DocPool and actual SfxEnumItem/Any. Cover4normalitalic+sentinel+unknown nativevalues,6normalSlant+sentinel+unknown mappings, copy/Clone/factory/boolthreshold/SetBool/Which/hash/typed ENUM/coldwarm type/getter, realenum andsigned32 fallback/memberconvert/narrow/unknownsuccess/failedunchanged. Preserve negative/fractional host validation and positiveunknown4 history in existing tests; exact2boolean/equality expectation corrections justified from source. WholeCalc and complete changedshared owner rawS/B/F/L100 everycounterpositive4referencesabsent/restoredfinally; include current fulltextitem/font-effects/nativebool/Writerattributes/numbering consumers. Focusedformat/lint/typecheck/docs/size/deps/tree/provenance/inventory/moduleboundaries/routing/doctor/diff, initialfailuresretained, exactpaths/freshGitbaseline/nativeSHA256pins. Same-agentEVAL not independent. No fullsuite now.

## Verification

Pending implementation/checks.

## Rollback Plan

Revert only task122source commit preserving task121/userhistory; no reset/merge/externalpublication.

## Findings

Previous goal turn task121verifiedprogress. Preflight cleancalc, unrelated active tasks untouched. Native posture mismatches discovered: DONTKNOW booltrue andpayload equality ignoresWhich; host constructorunknown4 rejection narrower than native enum value domain. User fidelity authorization covers correction with source-backed tests. Next full only real minimum UI+ODSread/save readiness then repair/pause; no fixedtasknumbertrigger.
