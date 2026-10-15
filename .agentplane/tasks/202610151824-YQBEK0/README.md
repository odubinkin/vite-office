---
id: "202610151824-YQBEK0"
title: "Port shared configured default-font candidates"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 16
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
  state: "ok"
  updated_at: "2026-10-15T18:33:11.901Z"
  updated_by: "CODER"
  note: "PASS:30 related and187 Calc tests, exact5 shared/33 Calc owners raw100, all13 gates/43 boundary tests; complete33-locale/256-property resource and23 IDs source-audited against5 pinned blobs.22 paths; refs restored. No browser consumer mutation or full-suite milestone claim."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-15T18:33:50.635Z"
  updated_by: "EVALUATOR"
  note: "Source-derived configured default-font candidates and native UTF16 token parsing are implemented in shared owners with complete pinned resource data and explicit service limits."
  evaluated_sha: "bddbcdcf610f61391600c4d0d5c66d717c63f5bb"
  blueprint_digest: "a796508a9b5ca1c626b08823dbffbce25f41b5bd5670419d315aeef4da8a492a"
  evidence_refs:
    - ".agentplane/tasks/202610151824-YQBEK0/README.md"
    - ".agentplane/tasks/202610151824-YQBEK0/quality/20261015-183350635-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610151824-YQBEK0/quality/20261015-183350635-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610151824-YQBEK0/quality/20261015-183350635-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610151824-YQBEK0/blueprint/resolved-snapshot.json"
    - "output/playwright/task163-checks/final-verification.json"
    - "apps/office/src/unotools/source/config/native-default-fonts.test.ts"
    - "apps/office/src/unotools/source/misc/native-font-token.test.ts"
  findings:
    - "Same-agent review, not independent. Exact33 locales/256 properties/23 IDs audited against5 pinned source blobs;30 related tests and187 Calc tests with strict5 shared/33 Calc raw100 and all13 gates/43 boundary cases pass. The Verify Steps production/browser phrase is scoped by the approved plan to no existing browser-consumer migration; intended shared production code changes and pure numeric-locale projection extraction are explicit in Scope and checked. Parent upstream token-name test is context only, not claimed ported equivalent. Original unotools-to-i18nlangtag edge added; no cycle exception or algorithm change. Full configuration/system/device and UI/ODS remain pending."
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
  -
    type: "verify"
    at: "2026-10-15T18:33:11.901Z"
    author: "CODER"
    state: "ok"
    note: "PASS:30 related and187 Calc tests, exact5 shared/33 Calc owners raw100, all13 gates/43 boundary tests; complete33-locale/256-property resource and23 IDs source-audited against5 pinned blobs.22 paths; refs restored. No browser consumer mutation or full-suite milestone claim."
doc_version: 3
doc_updated_at: "2026-10-15T18:33:11.957Z"
doc_updated_by: "CODER"
description: "Task163: port original DefaultFontType values, complete pinned VCL DefaultFonts resource and source fallback query over actual shared Locale, plus native font token parsing needed by OutputDevice selection. Field-specific browser resource binding, no fake configuration/LanguageTag/OutputDevice service."
sections:
  Summary: "Task163: source-backed shared configured default-font candidates and exact native font-token parsing for Calc defaults."
  Scope: "New unotools/inc/fontdefs.ts and source/misc/fontdefs.ts, source/config/fontcfg.ts with complete default-fonts JSON, focused tests (up to7 source/test/data paths), associated shared runtime/provenance/capability records and Calc docs (up to22 non-task paths). Reuse actual Locale and existing LanguageTag fallback algorithm. No fake UNO configuration provider/LanguageTag class/default device, native compilation, ICU/memory manager or unrelated Writer correction."
  Plan: "Extract and verify all pinned VCL DefaultFonts nodes/properties; port23 original DefaultFontType IDs. Implement the original configured getDefaultFont responsibility as a field-specific resource binding taking actual Locale values, preserving exact/language/non-ISO fallback/en order without inventing whole LanguageTag/configuration services. Port GetNextFontToken exact UTF16 index/delimiter behavior in original source/header boundaries. Register bounded evidence/limitations; test all resource locales/roles plus non-ISO aliases, unknown types and token boundaries. Strict raw100 on new executable shared owners and all Calc, related real shared/Writer tests,13 source gates; no UI/build replay required for unreachable shared resource functions with no browser consumer mutation. Next actual OutputDevice/config/font collection services remain pending."
  Verify Steps: "Verify complete default-fonts projection against pinned VCL.xcu, exact23 native enum IDs and source fallback/token bodies without native compiler. Test actual generated Locale and shared OUString ownership; direct/language/non-ISO/en fallback and absent unknown roles; UTF16 cursor including empty/repeated/comma/semicolon/trailing delimiters and invalid signed index. Run focused shared/related Writer tests and whole Calc with reference links absent/restored; exact measured owner set and raw S/B/F/L100 for new executable shared owners and all33 Calc owners. Run13 established source gates and provenance/inventory validation; retain limitations and do not claim actual default-device selection. No production/browser code changes, no full all-app run before minimum UI/ODS milestone."
  Verification: |-
    Command: node output/playwright/task163-checks/portable.mjs. Result: PASS after correcting one source-inaccurate new fixture;30 related tests/5 files and187 Calc tests/76 files. Scope: exact5 shared owners raw S147/B134/F12/L122 and exact33 Calc owners S4179/B2731/F821/L3727 all100, every raw counter positive. Exact sets checked against selection and accepted task160 final report. All4 source reference symlinks absent during execution and restored. Source audit:5 pinned complete blobs, exact23 role IDs, all33 locale nodes/256 properties; no native compilation. Command: node output/playwright/task163-checks/source-gates.mjs, resumed failed gates and refreshed format/lint after source-backed graph update, provenance/inventory/diff after metadata correction. Result: all13 gates PASS including43 boundary tests; doctor OK with existing warning. No existing browser consumer changed, so no UI/build replay required by approved plan; the reachable numeric-locale field projection is covered by original related tests with strict shared100. Full all-app suite not run under user milestone instruction. Evidence: output/playwright/task163-checks/final-verification.json,22 intentional non-task paths/hashes, native-audit.json and retained initial failure logs.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-15T18:33:11.901Z — VERIFY — ok

    By: CODER

    Note: PASS:30 related and187 Calc tests, exact5 shared/33 Calc owners raw100, all13 gates/43 boundary tests; complete33-locale/256-property resource and23 IDs source-audited against5 pinned blobs.22 paths; refs restored. No browser consumer mutation or full-suite milestone claim.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-15T18:33:11.168Z, excerpt_hash=sha256:00913cda625d413e7071eef6efe3eb66d935bc4d28940505c8e8af2a6bc98263

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610151824-YQBEK0/blueprint/resolved-snapshot.json
    - old_digest: a796508a9b5ca1c626b08823dbffbce25f41b5bd5670419d315aeef4da8a492a
    - current_digest: a796508a9b5ca1c626b08823dbffbce25f41b5bd5670419d315aeef4da8a492a
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610151824-YQBEK0

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610151824-YQBEK0
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert intentional task source/test/data/registry/docs commit. No existing runtime consumer, document format or browser UI is migrated in this task."
  Findings: |-
    - Observation: Initial related run:29 pass,1 new fixture failure. The fixture incorrectly assumed Japanese LATIN_TEXT was absent; the pinned table defines a Japanese serif list and lookup correctly returned it.
      Impact: The implementation must retain the native locale-specific result, not force English to satisfy an incorrect expectation.
      Resolution: Use am, whose LATIN_TEXT entry is actually absent in pinned VCL.xcu, for the missing-role fallback assertion. Preserve the failed log and rerun focused related coverage before Calc.

    - Observation: Dependency gate rejected the direct unotools -> i18nlangtag edge used to reuse the actual common fallback owner. Upstream Library_utl.mk links i18nlangtag and fontcfg.hxx includes its LanguageTag header.
      Impact: The local module allowlist omits an original shared dependency; duplicating the fallback algorithm would conceal it.
      Resolution: Add only the source-backed unotools -> i18nlangtag edge; preserve all ownership and runtime cycle checks. Refresh script format/lint and dependency/boundary verification.

    - Observation: Inventory requires a non-empty upstream test reference for the new bounded capability. Targeted unotools/vcl/sc QA searches and broader test-name search found no direct GetNextFontToken or configured default-font test.
      Impact: Source-derived tests cannot be described as a port of a nonexistent direct native test.
      Resolution: Record a real parent physical-font lookup test as context only, explicitly state it is not a ported equivalent, and retain direct native implementation/resource audits as the actual evidence. No validation weakening or full parity promotion.

    - Observation: After adding the parent QA reference, runtime inventory correctly rejected GetNextFontToken as a header-local definition: it is re-exported from its real source owner. FontTokenIndex is an erased interface rather than a runtime symbol.
      Impact: Runtime localSymbols must identify emitted local definitions, while provenance may describe declarations/re-exports.
      Resolution: Keep DefaultFontType as the header runtime symbol and GetNextFontToken as the source runtime symbol; retain their actual declaration boundaries in provenance. Do not add duplicate implementations to satisfy metadata.

    - Observation: Completed field-specific configured-font candidate query and original token parser. Shared canonical BCP47 field decomposition replaces the duplicated numeric-locale projection; no new canonicalization algorithm or LanguageTag class is claimed.
      Impact: Calc defaults can consume complete original configured candidate lists rather than hardcoded font choices. Actual physical-font/device selection is still missing and UI/ODS readiness is not established.
      Resolution: Reuse this shared resource/query and token owner in the real default-font selection path. Keep native configuration overrides/system resolution, UI-font special fallback, physical matching/substitution and unrelated font normalization explicitly pending. No full parity flags promoted and no native compiler/memory/ICU engine added.
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

Command: node output/playwright/task163-checks/portable.mjs. Result: PASS after correcting one source-inaccurate new fixture;30 related tests/5 files and187 Calc tests/76 files. Scope: exact5 shared owners raw S147/B134/F12/L122 and exact33 Calc owners S4179/B2731/F821/L3727 all100, every raw counter positive. Exact sets checked against selection and accepted task160 final report. All4 source reference symlinks absent during execution and restored. Source audit:5 pinned complete blobs, exact23 role IDs, all33 locale nodes/256 properties; no native compilation. Command: node output/playwright/task163-checks/source-gates.mjs, resumed failed gates and refreshed format/lint after source-backed graph update, provenance/inventory/diff after metadata correction. Result: all13 gates PASS including43 boundary tests; doctor OK with existing warning. No existing browser consumer changed, so no UI/build replay required by approved plan; the reachable numeric-locale field projection is covered by original related tests with strict shared100. Full all-app suite not run under user milestone instruction. Evidence: output/playwright/task163-checks/final-verification.json,22 intentional non-task paths/hashes, native-audit.json and retained initial failure logs.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-15T18:33:11.901Z — VERIFY — ok

By: CODER

Note: PASS:30 related and187 Calc tests, exact5 shared/33 Calc owners raw100, all13 gates/43 boundary tests; complete33-locale/256-property resource and23 IDs source-audited against5 pinned blobs.22 paths; refs restored. No browser consumer mutation or full-suite milestone claim.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-15T18:33:11.168Z, excerpt_hash=sha256:00913cda625d413e7071eef6efe3eb66d935bc4d28940505c8e8af2a6bc98263

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610151824-YQBEK0/blueprint/resolved-snapshot.json
- old_digest: a796508a9b5ca1c626b08823dbffbce25f41b5bd5670419d315aeef4da8a492a
- current_digest: a796508a9b5ca1c626b08823dbffbce25f41b5bd5670419d315aeef4da8a492a
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610151824-YQBEK0

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610151824-YQBEK0
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert intentional task source/test/data/registry/docs commit. No existing runtime consumer, document format or browser UI is migrated in this task.

## Findings

- Observation: Initial related run:29 pass,1 new fixture failure. The fixture incorrectly assumed Japanese LATIN_TEXT was absent; the pinned table defines a Japanese serif list and lookup correctly returned it.
  Impact: The implementation must retain the native locale-specific result, not force English to satisfy an incorrect expectation.
  Resolution: Use am, whose LATIN_TEXT entry is actually absent in pinned VCL.xcu, for the missing-role fallback assertion. Preserve the failed log and rerun focused related coverage before Calc.

- Observation: Dependency gate rejected the direct unotools -> i18nlangtag edge used to reuse the actual common fallback owner. Upstream Library_utl.mk links i18nlangtag and fontcfg.hxx includes its LanguageTag header.
  Impact: The local module allowlist omits an original shared dependency; duplicating the fallback algorithm would conceal it.
  Resolution: Add only the source-backed unotools -> i18nlangtag edge; preserve all ownership and runtime cycle checks. Refresh script format/lint and dependency/boundary verification.

- Observation: Inventory requires a non-empty upstream test reference for the new bounded capability. Targeted unotools/vcl/sc QA searches and broader test-name search found no direct GetNextFontToken or configured default-font test.
  Impact: Source-derived tests cannot be described as a port of a nonexistent direct native test.
  Resolution: Record a real parent physical-font lookup test as context only, explicitly state it is not a ported equivalent, and retain direct native implementation/resource audits as the actual evidence. No validation weakening or full parity promotion.

- Observation: After adding the parent QA reference, runtime inventory correctly rejected GetNextFontToken as a header-local definition: it is re-exported from its real source owner. FontTokenIndex is an erased interface rather than a runtime symbol.
  Impact: Runtime localSymbols must identify emitted local definitions, while provenance may describe declarations/re-exports.
  Resolution: Keep DefaultFontType as the header runtime symbol and GetNextFontToken as the source runtime symbol; retain their actual declaration boundaries in provenance. Do not add duplicate implementations to satisfy metadata.

- Observation: Completed field-specific configured-font candidate query and original token parser. Shared canonical BCP47 field decomposition replaces the duplicated numeric-locale projection; no new canonicalization algorithm or LanguageTag class is claimed.
  Impact: Calc defaults can consume complete original configured candidate lists rather than hardcoded font choices. Actual physical-font/device selection is still missing and UI/ODS readiness is not established.
  Resolution: Reuse this shared resource/query and token owner in the real default-font selection path. Keep native configuration overrides/system resolution, UI-font special fallback, physical matching/substitution and unrelated font normalization explicitly pending. No full parity flags promoted and no native compiler/memory/ICU engine added.
