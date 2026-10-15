---
id: "202610150556-ERB0RG"
title: "Implement native language item values for Calc font defaults"
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
  updated_at: "2026-10-15T05:57:11.376Z"
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
    body: "Start: native language identity/item prerequisites for Calc font defaults, reusing existing shared owners and primitive GC values; no fake Locale services or compiler/memory layer."
events:
  -
    type: "status"
    at: "2026-10-15T05:57:18.325Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: native language identity/item prerequisites for Calc font defaults, reusing existing shared owners and primitive GC values; no fake Locale services or compiler/memory layer."
doc_version: 3
doc_updated_at: "2026-10-15T05:57:18.325Z"
doc_updated_by: "CODER"
description: "Task146 adds primitive unsigned16 LanguageType identities/primary mask and original SvxLanguageItem value/copy/default/int Any contracts for Calc font language defaults. Reuse existing SfxEnumItem/Any and existing Locale owner; do not fake LanguageTag/locale translation or localized language-table providers. Native strong_int/MSVC/cache machinery is erased under JS primitives/GC."
sections:
  Summary: "Task146 implements actual language pooled values needed by all three Calc font script defaults, with native numeric identities and signed UNO scalar behavior. Reuse shared SfxEnumItem/Any and the existing Locale owner. Full document/UI/ODS goal remains active."
  Scope: "At most32intentional non-agent paths: i18nlangtag/inc/lang.ts primitive LanguageType/primary and needed native special/default declarations; native SvxLanguageItem in size-constrained textitem.language.ts with canonical langitem.ts header; focused shared tests and actual Calc language default identity witness/constants; admit exact original editeng-to-i18nlangtag module edge and tests, no cycle exception. Matched runtime/provenance/capability, including necessary textitem source filename split under500line limit, and calc-core docs. Native C++ strong-int tags/MSVC helper base/instance manager are erased, not implemented as JS object/memory machinery. Real LanguageTag LANGID/Locale conversion and SvtLanguageTable localized presentation remain explicit pending services; known locale member unsupportedfalse, no fake Locale, callbacks, guessed Intl mapping or fallback language. Existing Locale is not duplicated."
  Plan: "Implement original uint16 language identity and native language pooled-value prerequisite, reuse shared base/Any and existing Locale, preserve source defaults/casts/member behavior with explicit missing real Locale/presentation services. Add original module owner/edge without cycle exception, actual Calc witness, raw whole changed shared/Calc100 plus relevant tests, portable build/source gates/inventory/pins/hash32path audit and clean calc."
  Verify Steps: "Compare pinned lang.h/langitem.hxx/textitem.cxx/memberids.h/scitems.hxx/docpool.cxx. Native uint16 value/primary mask and special/default IDs, German Which0 factory versus Calc DONTKNOW defaults, constructor/copy/Clone/SetValue/SetEnumValue narrowing, concrete payload equality ignoringWhich, signed16 Any query and int32 extraction (including negative/overflow-wrap), wrong-type failure/nonmutation, selector conversion-bit masking and unknown untouched success. Locale member explicitly unsupported without a fake native provider. Shared primitive representation has no strong_int/ABI/memory layer. Entire new/changed shared executable owners and whole Calc raw S/B/F/L100 every counter positive; related SVL enum and language values;39 or actual boundary tests.4references absent/restored finally in tests/build. All13 scoped source gates, honest inventory/provenance/necessary filename split, native pin/source hash32path bound audit/clean calc. No Writer runtime changes expected; any genuine behavioral failure fixed canonically, Writer-only coverage gaps measured/left. No full suite until actual minimum connected UI plus same-model ODS, then repair applicable failures and pause."
  Verification: "Pending implementation and validation."
  Rollback Plan: "Revert only intentional task paths in a later authorized task; no reset, merge or publication."
  Findings: "Native SvxLanguageItem_Base exists explicitly for an MSVC workaround and has no distinct logical value behavior. JS primitive unsigned16 values and direct SfxEnumItem inheritance preserve runtime semantics without porting that compiler workaround. Existing Locale is already shared and must not be duplicated. Full numeric language-to-locale mappings cannot be inferred from Intl.Locale because native MS-LANGID identities are a separate source table. Same-agent EVALUATOR is not independent."
id_source: "generated"
---
## Summary

Task146 implements actual language pooled values needed by all three Calc font script defaults, with native numeric identities and signed UNO scalar behavior. Reuse shared SfxEnumItem/Any and the existing Locale owner. Full document/UI/ODS goal remains active.

## Scope

At most32intentional non-agent paths: i18nlangtag/inc/lang.ts primitive LanguageType/primary and needed native special/default declarations; native SvxLanguageItem in size-constrained textitem.language.ts with canonical langitem.ts header; focused shared tests and actual Calc language default identity witness/constants; admit exact original editeng-to-i18nlangtag module edge and tests, no cycle exception. Matched runtime/provenance/capability, including necessary textitem source filename split under500line limit, and calc-core docs. Native C++ strong-int tags/MSVC helper base/instance manager are erased, not implemented as JS object/memory machinery. Real LanguageTag LANGID/Locale conversion and SvtLanguageTable localized presentation remain explicit pending services; known locale member unsupportedfalse, no fake Locale, callbacks, guessed Intl mapping or fallback language. Existing Locale is not duplicated.

## Plan

Implement original uint16 language identity and native language pooled-value prerequisite, reuse shared base/Any and existing Locale, preserve source defaults/casts/member behavior with explicit missing real Locale/presentation services. Add original module owner/edge without cycle exception, actual Calc witness, raw whole changed shared/Calc100 plus relevant tests, portable build/source gates/inventory/pins/hash32path audit and clean calc.

## Verify Steps

Compare pinned lang.h/langitem.hxx/textitem.cxx/memberids.h/scitems.hxx/docpool.cxx. Native uint16 value/primary mask and special/default IDs, German Which0 factory versus Calc DONTKNOW defaults, constructor/copy/Clone/SetValue/SetEnumValue narrowing, concrete payload equality ignoringWhich, signed16 Any query and int32 extraction (including negative/overflow-wrap), wrong-type failure/nonmutation, selector conversion-bit masking and unknown untouched success. Locale member explicitly unsupported without a fake native provider. Shared primitive representation has no strong_int/ABI/memory layer. Entire new/changed shared executable owners and whole Calc raw S/B/F/L100 every counter positive; related SVL enum and language values;39 or actual boundary tests.4references absent/restored finally in tests/build. All13 scoped source gates, honest inventory/provenance/necessary filename split, native pin/source hash32path bound audit/clean calc. No Writer runtime changes expected; any genuine behavioral failure fixed canonically, Writer-only coverage gaps measured/left. No full suite until actual minimum connected UI plus same-model ODS, then repair applicable failures and pause.

## Verification

Pending implementation and validation.

## Rollback Plan

Revert only intentional task paths in a later authorized task; no reset, merge or publication.

## Findings

Native SvxLanguageItem_Base exists explicitly for an MSVC workaround and has no distinct logical value behavior. JS primitive unsigned16 values and direct SfxEnumItem inheritance preserve runtime semantics without porting that compiler workaround. Existing Locale is already shared and must not be duplicated. Full numeric language-to-locale mappings cannot be inferred from Intl.Locale because native MS-LANGID identities are a separate source table. Same-agent EVALUATOR is not independent.
