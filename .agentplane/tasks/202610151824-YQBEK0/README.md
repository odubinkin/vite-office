---
id: "202610151824-YQBEK0"
title: "Port shared configured default-font candidates"
status: "DOING"
priority: "med"
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
  updated_at: "2026-10-15T18:24:41.395Z"
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
    body: "Start: implement pinned shared font configuration resource lookup and native UTF16 token parsing with actual Locale input and explicit provider limits."
events:
  -
    type: "status"
    at: "2026-10-15T18:24:49.376Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement pinned shared font configuration resource lookup and native UTF16 token parsing with actual Locale input and explicit provider limits."
doc_version: 3
doc_updated_at: "2026-10-15T18:24:49.376Z"
doc_updated_by: "CODER"
description: "Task163: port original DefaultFontType values, complete pinned VCL DefaultFonts resource and source fallback query over actual shared Locale, plus native font token parsing needed by OutputDevice selection. Field-specific browser resource binding, no fake configuration/LanguageTag/OutputDevice service."
sections:
  Summary: "Task163: source-backed shared configured default-font candidates and exact native font-token parsing for Calc defaults."
  Scope: "New unotools/inc/fontdefs.ts and source/misc/fontdefs.ts, source/config/fontcfg.ts with complete default-fonts JSON, focused tests (up to7 source/test/data paths), associated shared runtime/provenance/capability records and Calc docs (up to22 non-task paths). Reuse actual Locale and existing LanguageTag fallback algorithm. No fake UNO configuration provider/LanguageTag class/default device, native compilation, ICU/memory manager or unrelated Writer correction."
  Plan: "Extract and verify all pinned VCL DefaultFonts nodes/properties; port23 original DefaultFontType IDs. Implement the original configured getDefaultFont responsibility as a field-specific resource binding taking actual Locale values, preserving exact/language/non-ISO fallback/en order without inventing whole LanguageTag/configuration services. Port GetNextFontToken exact UTF16 index/delimiter behavior in original source/header boundaries. Register bounded evidence/limitations; test all resource locales/roles plus non-ISO aliases, unknown types and token boundaries. Strict raw100 on new executable shared owners and all Calc, related real shared/Writer tests,13 source gates; no UI/build replay required for unreachable shared resource functions with no browser consumer mutation. Next actual OutputDevice/config/font collection services remain pending."
  Verify Steps: "Verify complete default-fonts projection against pinned VCL.xcu, exact23 native enum IDs and source fallback/token bodies without native compiler. Test actual generated Locale and shared OUString ownership; direct/language/non-ISO/en fallback and absent unknown roles; UTF16 cursor including empty/repeated/comma/semicolon/trailing delimiters and invalid signed index. Run focused shared/related Writer tests and whole Calc with reference links absent/restored; exact measured owner set and raw S/B/F/L100 for new executable shared owners and all33 Calc owners. Run13 established source gates and provenance/inventory validation; retain limitations and do not claim actual default-device selection. No production/browser code changes, no full all-app run before minimum UI/ODS milestone."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert intentional task source/test/data/registry/docs commit. No existing runtime consumer, document format or browser UI is migrated in this task."
  Findings: ""
id_source: "generated"
---
## Summary

Task163: source-backed shared configured default-font candidates and exact native font-token parsing for Calc defaults.

## Scope

New unotools/inc/fontdefs.ts and source/misc/fontdefs.ts, source/config/fontcfg.ts with complete default-fonts JSON, focused tests (up to7 source/test/data paths), associated shared runtime/provenance/capability records and Calc docs (up to22 non-task paths). Reuse actual Locale and existing LanguageTag fallback algorithm. No fake UNO configuration provider/LanguageTag class/default device, native compilation, ICU/memory manager or unrelated Writer correction.

## Plan

Extract and verify all pinned VCL DefaultFonts nodes/properties; port23 original DefaultFontType IDs. Implement the original configured getDefaultFont responsibility as a field-specific resource binding taking actual Locale values, preserving exact/language/non-ISO fallback/en order without inventing whole LanguageTag/configuration services. Port GetNextFontToken exact UTF16 index/delimiter behavior in original source/header boundaries. Register bounded evidence/limitations; test all resource locales/roles plus non-ISO aliases, unknown types and token boundaries. Strict raw100 on new executable shared owners and all Calc, related real shared/Writer tests,13 source gates; no UI/build replay required for unreachable shared resource functions with no browser consumer mutation. Next actual OutputDevice/config/font collection services remain pending.

## Verify Steps

Verify complete default-fonts projection against pinned VCL.xcu, exact23 native enum IDs and source fallback/token bodies without native compiler. Test actual generated Locale and shared OUString ownership; direct/language/non-ISO/en fallback and absent unknown roles; UTF16 cursor including empty/repeated/comma/semicolon/trailing delimiters and invalid signed index. Run focused shared/related Writer tests and whole Calc with reference links absent/restored; exact measured owner set and raw S/B/F/L100 for new executable shared owners and all33 Calc owners. Run13 established source gates and provenance/inventory validation; retain limitations and do not claim actual default-device selection. No production/browser code changes, no full all-app run before minimum UI/ODS milestone.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert intentional task source/test/data/registry/docs commit. No existing runtime consumer, document format or browser UI is migrated in this task.

## Findings
