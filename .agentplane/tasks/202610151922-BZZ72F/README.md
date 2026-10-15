---
id: "202610151922-BZZ72F"
title: "Connect native locale uppercase for Calc string interning"
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
  updated_at: "2026-10-15T19:22:24.061Z"
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
    body: "Start: implement the required source-backed uppercase field operation at original module boundaries, reuse actual shared mappings and verify whole-string JS counterexamples without a new ICU/service facade."
events:
  -
    type: "status"
    at: "2026-10-15T19:22:49.115Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the required source-backed uppercase field operation at original module boundaries, reuse actual shared mappings and verify whole-string JS counterexamples without a new ICU/service facade."
doc_version: 3
doc_updated_at: "2026-10-15T19:47:09.326Z"
doc_updated_by: "CODER"
description: "Task166: implement source-aligned locale uppercase operation across original unotools/i18npool boundaries using actual shared Locale/OUString and existing i18nutil mappings. Verify native JS equivalence and retain source behavior where counterexamples exist; no fake CharClass/UNO service or new ICU/memory library."
sections:
  Summary: "Task166: actual source-backed locale uppercase operation required by Calc SharedStringPool, reusing existing case mappings instead of a non-equivalent whole-string JS replacement."
  Scope: "Field-specific uppercase functions in original unotools/inc/charclass.ts, source/i18n/charclass.ts, i18npool/source/characterclassification/cclass_unicode.ts and source/transliteration/transliteration_body.ts; one focused test and conformance evidence; associated shared registry/capability records, Calc docs and necessary original module edges (up to20 non-task paths). No fabricated full CharClass/UNO/Transliteration class, custom memory/refcount/weak/cache manager, native probe/compiler, new ICU implementation or browser consumer migration."
  Plan: "Trace original CharClass uppercase overloads/catch boundary, cclass_Unicode range clamp and no-offset transliterateImpl ToUpper mapping loop. Port this complete required operation as explicit field bindings at original module boundaries using real OUString/Locale, existing MappingType/getValue and native GC-managed typed data. Compare to native JS and retain confirmed divergence witnesses; do not introduce a full service facade or claim complete LanguageTag/CharClass. Test original mapped cases, locale distinctions, expanding/deleting/surrogate mappings, valid ranges/empty/end/overrun clamp, actual UNO exception fallback and propagation of unrelated JS errors. Register bounded evidence and remaining actual string pool/document dependencies; strict raw100 for new executable owners and all Calc, related shared/Writer tests and13 source gates. No app/browser behavior change or full-suite milestone claim."
  Verify Steps: "Audit pinned unotools charclass header/source, cclass_unicode, transliteration_body/commonclass and existing casefolding mapping data; verify exact full/range overload and original ToUpper mode/loop and exception boundary without native compilation. Test genuine shared Locale/OUString values, selected range/count clamp and preserved original input backing for source neighbor rules, expansion/null/surrogate boundaries, en/tr/az/lt/el whole-string JS differences and ASCII matches; compare source-mapping fixtures and real UNO exception type fallback versus unrelated JS errors. New shared owner exact raw S/B/F/L100/all counters positive and all33 Calc owners raw100 with4 reference symlinks absent/restored; run related actual shared/Writer tests and13 existing gates/inventory/provenance. No new ICU/library memory engine, fake full service or UI/ODS readiness claim; no full all-app suite before user milestone."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task source/test/evidence/registry/docs commit together; existing scalar mappings and all previous tasks stay intact. No document state, browser entrypoint or string pool lifecycle is migrated by this task."
  Findings: |-
    - Observation: Initial related run:20 existing cases passed; new uppercase suite failed during module evaluation with Class extends value undefined at RuntimeException extends Exception. Direct import of Exception reaches Reference -> Any -> genfunc -> RuntimeException before the base class is initialized.
      Impact: No new uppercase assertions executed. This is an existing shared CPPU entry-order defect exposed by the genuine base-exception catch boundary; it must not be hidden by consumer import ordering.
      Resolution: Persist the approved uppercase work as an unverified checkpoint, open a separate source-scoped CPPU initialization correction, preserve public exception class identity/member bodies/type factory and test independent public entry orders. Resume this task after the dependency fix; no goal/full-suite milestone change.

    - Observation: After shared exception fix:48 related tests/4 files,187 Calc tests/76 files and2 Chromium shared scenarios pass; strict3 shared owners S20/B8/F3/L16 and33 Calc S4179/B2731/F821/L3727 all raw counters positive. Native audit pins9 blobs,7 native fixtures/19 uppercase assertions and6 JS divergence witnesses. Metadata gate failures found incorrect QA marker suffixes and the dependency task common-unit filename explanation; no production behavior failed.
      Impact: Whole-string JS locale uppercasing is not equivalent for the selected source contracts. Existing i18nutil mappings are required; no new ICU implementation is justified. Pending metadata gates must pass before task closure.
      Resolution: Use exact testTitleCase/testSigma source fixture names, record explicit ESM module-resolution filename necessity in task166a provenance, retain no full class/service/document/UI/ODS parity claim. Re-run only failed/pending source gates.
id_source: "generated"
---
## Summary

Task166: actual source-backed locale uppercase operation required by Calc SharedStringPool, reusing existing case mappings instead of a non-equivalent whole-string JS replacement.

## Scope

Field-specific uppercase functions in original unotools/inc/charclass.ts, source/i18n/charclass.ts, i18npool/source/characterclassification/cclass_unicode.ts and source/transliteration/transliteration_body.ts; one focused test and conformance evidence; associated shared registry/capability records, Calc docs and necessary original module edges (up to20 non-task paths). No fabricated full CharClass/UNO/Transliteration class, custom memory/refcount/weak/cache manager, native probe/compiler, new ICU implementation or browser consumer migration.

## Plan

Trace original CharClass uppercase overloads/catch boundary, cclass_Unicode range clamp and no-offset transliterateImpl ToUpper mapping loop. Port this complete required operation as explicit field bindings at original module boundaries using real OUString/Locale, existing MappingType/getValue and native GC-managed typed data. Compare to native JS and retain confirmed divergence witnesses; do not introduce a full service facade or claim complete LanguageTag/CharClass. Test original mapped cases, locale distinctions, expanding/deleting/surrogate mappings, valid ranges/empty/end/overrun clamp, actual UNO exception fallback and propagation of unrelated JS errors. Register bounded evidence and remaining actual string pool/document dependencies; strict raw100 for new executable owners and all Calc, related shared/Writer tests and13 source gates. No app/browser behavior change or full-suite milestone claim.

## Verify Steps

Audit pinned unotools charclass header/source, cclass_unicode, transliteration_body/commonclass and existing casefolding mapping data; verify exact full/range overload and original ToUpper mode/loop and exception boundary without native compilation. Test genuine shared Locale/OUString values, selected range/count clamp and preserved original input backing for source neighbor rules, expansion/null/surrogate boundaries, en/tr/az/lt/el whole-string JS differences and ASCII matches; compare source-mapping fixtures and real UNO exception type fallback versus unrelated JS errors. New shared owner exact raw S/B/F/L100/all counters positive and all33 Calc owners raw100 with4 reference symlinks absent/restored; run related actual shared/Writer tests and13 existing gates/inventory/provenance. No new ICU/library memory engine, fake full service or UI/ODS readiness claim; no full all-app suite before user milestone.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task source/test/evidence/registry/docs commit together; existing scalar mappings and all previous tasks stay intact. No document state, browser entrypoint or string pool lifecycle is migrated by this task.

## Findings

- Observation: Initial related run:20 existing cases passed; new uppercase suite failed during module evaluation with Class extends value undefined at RuntimeException extends Exception. Direct import of Exception reaches Reference -> Any -> genfunc -> RuntimeException before the base class is initialized.
  Impact: No new uppercase assertions executed. This is an existing shared CPPU entry-order defect exposed by the genuine base-exception catch boundary; it must not be hidden by consumer import ordering.
  Resolution: Persist the approved uppercase work as an unverified checkpoint, open a separate source-scoped CPPU initialization correction, preserve public exception class identity/member bodies/type factory and test independent public entry orders. Resume this task after the dependency fix; no goal/full-suite milestone change.

- Observation: After shared exception fix:48 related tests/4 files,187 Calc tests/76 files and2 Chromium shared scenarios pass; strict3 shared owners S20/B8/F3/L16 and33 Calc S4179/B2731/F821/L3727 all raw counters positive. Native audit pins9 blobs,7 native fixtures/19 uppercase assertions and6 JS divergence witnesses. Metadata gate failures found incorrect QA marker suffixes and the dependency task common-unit filename explanation; no production behavior failed.
  Impact: Whole-string JS locale uppercasing is not equivalent for the selected source contracts. Existing i18nutil mappings are required; no new ICU implementation is justified. Pending metadata gates must pass before task closure.
  Resolution: Use exact testTitleCase/testSigma source fixture names, record explicit ESM module-resolution filename necessity in task166a provenance, retain no full class/service/document/UI/ODS parity claim. Re-run only failed/pending source gates.
