---
id: "202610101731-H21CAK"
title: "Port original locale-aware case-mapping values for Calc string service"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-10T17:34:32.818Z"
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
    body: "Start: implement approved original locale-aware case value dependency in calc checkout, reusing actual shared string/Unicode owners and preserving native source contracts; no fake service/type substitutes."
events:
  -
    type: "status"
    at: "2026-10-10T17:34:34.080Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved original locale-aware case value dependency in calc checkout, reusing actual shared string/Unicode owners and preserving native source contracts; no fake service/type substitutes."
doc_version: 3
doc_updated_at: "2026-10-10T17:34:34.080Z"
doc_updated_by: "CODER"
description: "Task39: implement original casefolding getValue/getConditionalValue and complete source data with real Locale string fields/default ownership and original default UNO RuntimeException boundary. Reuse actual shared OUString, RTL character and proven ICU scalar contracts. Preserve suspect upstream behavior. Verify source/owner contracts and unchanged native reference without fake service/type stand-ins; portable Calc/affected shared100 and scoped gates. No UI shell, Writer duplication or full-run before41."
sections:
  Summary: "Task39 implements the original locale-aware case-mapping value layer required by the Calc shared string service: source-defined Locale value fields/defaults and actual casefolding getValue/getConditionalValue tables, conditions, UTF16 boundaries and scalar fallbacks. This is a prerequisite of real CharClass/SharedStringPool, not an editable document or a substitute service."
  Scope: "Only vite-office-calc branch calc. Shared source-shaped owners under apps/office/src/udkapi/com/sun/star/lang (Locale), udkapi/com/sun/star/uno (actual exception/interface dependency declarations if required), cppu/uno reference/value dependency owners if required by the original exception boundary, i18nutil/inc/casefolding.ts and i18nutil/source/utility/casefolding.ts/casefolding_data.ts with exact original JSON tables, adjacent portable tests and native observation fixture; scripts/casefolding-native-probe.mjs and necessary source acquisition/generation helpers within this task; complete shared runtime/provenance/capability records, calc-core.md and genuine calc-upstream-suspected-issues.md entries. Reuse original OUString, RTL character and selected ICU scalar owners. Original source/generated-native artifacts stay ignored. No mocked native Locale/exception/service owners, temporary CharClass or SharedStringPool, widthfolding/getNextChar replacement, Writer runtime changes, policy/coverage threshold changes, dependencies installed or external publication."
  Plan: "1. Resolve real Locale/exception ownership contracts from actual IDL and cppumaker, then reuse existing shared Unicode/RTL owners. 2. Port complete getValue/getConditionalValue and original data with exact native value-copy, UTF16 and conditional semantics; preserve suspicious behavior. 3. Capture unchanged original native dependencies, portable100 tests and scoped provenance/inventory/tooling evidence; independently evaluate and close only this dependency. Full suite task41, full Calc goal remains active."
  Verify Steps: |-
    1. Read pinned full Locale.idl, cppumaker struct emission and casefolding hxx/cxx/full tables; confirm original field order/default/copy/string ownership, exact language comparison and UTF16/value return contracts. Preserve existing CALC035 and document genuine new suspect behavior without fixing it.
    2. Verify the original getValue/getConditionalValue closure against unchanged source and true native dependency owners; node scripts/casefolding-native-probe.mjs --check must reproduce complete native inputs/outputs/source hashes with sanitizers. Do not call a handwritten Locale/UNO/ICU substitute original upstream evidence. Native JS decisions remain task38-selected contracts.
    3. Portable npm run test:coverage:calc and affected shared tests cover all changed executable owners S/B/F/L100 and every raw counter with original sources absent; exercise actual locale/surrogate/extra/conditional/error/value-copy behavior and standard defaults.
    4. Run affected boundary/provenance/registry tooling tests, typecheck/lint/JSDoc/file-size/dependency/source-tree/source-provenance, Calc/shared inventory, changed-file Prettier, routing/doctor/diff. Original sources restored before native/provenance. Full run remains task41; no Writer-only repair.
    5. Record evidence, separate EVALUATOR assessment and clean direct closure. Real locale service/pool/document/view remain incomplete; full goal stays active.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only intentional task39 implementation/metadata commits if needed and rerun scoped checks. Preserve unrelated user work, Writer/main branches, shared verified Unicode/RTL contracts and original sources. Remove only task39-owned ignored probe artifacts if obsolete."
  Findings: |-
    - Observation: Preflight confirms calc branch and clean checkout, direct workflow, previous task38 DONE. The only other active tasks are inherited C9TN6M/X6VV8G; neither is reused for new source work. Read-only discovery guessed Locale under offapi instead of its actual udkapi path, and guessed two absent native helper filenames.
      Impact: No implementation or verification claim relied on those failed reads. Source routing now uses actual rg-discovered files and verified existing RTL native helpers.
      Resolution: Follow task39 route, source-shaped owners and declared verification contract. Existing user goal/continue and UI-prerequisite prioritization authorize this safe local dependency work; no new network or destructive actions are needed.
id_source: "generated"
---
## Summary

Task39 implements the original locale-aware case-mapping value layer required by the Calc shared string service: source-defined Locale value fields/defaults and actual casefolding getValue/getConditionalValue tables, conditions, UTF16 boundaries and scalar fallbacks. This is a prerequisite of real CharClass/SharedStringPool, not an editable document or a substitute service.

## Scope

Only vite-office-calc branch calc. Shared source-shaped owners under apps/office/src/udkapi/com/sun/star/lang (Locale), udkapi/com/sun/star/uno (actual exception/interface dependency declarations if required), cppu/uno reference/value dependency owners if required by the original exception boundary, i18nutil/inc/casefolding.ts and i18nutil/source/utility/casefolding.ts/casefolding_data.ts with exact original JSON tables, adjacent portable tests and native observation fixture; scripts/casefolding-native-probe.mjs and necessary source acquisition/generation helpers within this task; complete shared runtime/provenance/capability records, calc-core.md and genuine calc-upstream-suspected-issues.md entries. Reuse original OUString, RTL character and selected ICU scalar owners. Original source/generated-native artifacts stay ignored. No mocked native Locale/exception/service owners, temporary CharClass or SharedStringPool, widthfolding/getNextChar replacement, Writer runtime changes, policy/coverage threshold changes, dependencies installed or external publication.

## Plan

1. Resolve real Locale/exception ownership contracts from actual IDL and cppumaker, then reuse existing shared Unicode/RTL owners. 2. Port complete getValue/getConditionalValue and original data with exact native value-copy, UTF16 and conditional semantics; preserve suspicious behavior. 3. Capture unchanged original native dependencies, portable100 tests and scoped provenance/inventory/tooling evidence; independently evaluate and close only this dependency. Full suite task41, full Calc goal remains active.

## Verify Steps

1. Read pinned full Locale.idl, cppumaker struct emission and casefolding hxx/cxx/full tables; confirm original field order/default/copy/string ownership, exact language comparison and UTF16/value return contracts. Preserve existing CALC035 and document genuine new suspect behavior without fixing it.
2. Verify the original getValue/getConditionalValue closure against unchanged source and true native dependency owners; node scripts/casefolding-native-probe.mjs --check must reproduce complete native inputs/outputs/source hashes with sanitizers. Do not call a handwritten Locale/UNO/ICU substitute original upstream evidence. Native JS decisions remain task38-selected contracts.
3. Portable npm run test:coverage:calc and affected shared tests cover all changed executable owners S/B/F/L100 and every raw counter with original sources absent; exercise actual locale/surrogate/extra/conditional/error/value-copy behavior and standard defaults.
4. Run affected boundary/provenance/registry tooling tests, typecheck/lint/JSDoc/file-size/dependency/source-tree/source-provenance, Calc/shared inventory, changed-file Prettier, routing/doctor/diff. Original sources restored before native/provenance. Full run remains task41; no Writer-only repair.
5. Record evidence, separate EVALUATOR assessment and clean direct closure. Real locale service/pool/document/view remain incomplete; full goal stays active.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only intentional task39 implementation/metadata commits if needed and rerun scoped checks. Preserve unrelated user work, Writer/main branches, shared verified Unicode/RTL contracts and original sources. Remove only task39-owned ignored probe artifacts if obsolete.

## Findings

- Observation: Preflight confirms calc branch and clean checkout, direct workflow, previous task38 DONE. The only other active tasks are inherited C9TN6M/X6VV8G; neither is reused for new source work. Read-only discovery guessed Locale under offapi instead of its actual udkapi path, and guessed two absent native helper filenames.
  Impact: No implementation or verification claim relied on those failed reads. Source routing now uses actual rg-discovered files and verified existing RTL native helpers.
  Resolution: Follow task39 route, source-shaped owners and declared verification contract. Existing user goal/continue and UI-prerequisite prioritization authorize this safe local dependency work; no new network or destructive actions are needed.
