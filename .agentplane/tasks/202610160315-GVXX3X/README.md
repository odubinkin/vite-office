---
id: "202610160315-GVXX3X"
title: "Implement native LanguageTag simple extraction for shared font fallbacks"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 9
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
  updated_at: "2026-10-16T03:15:45.957Z"
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
    body: "Start: port full native simpleExtract,connect admitted field extraction to actual shared canonical-tag fallbacks,verify related and Calc raw100 without fake LanguageTag or library/memory engine."
events:
  -
    type: "status"
    at: "2026-10-16T03:15:56.365Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port full native simpleExtract,connect admitted field extraction to actual shared canonical-tag fallbacks,verify related and Calc raw100 without fake LanguageTag or library/memory engine."
doc_version: 3
doc_updated_at: "2026-10-16T03:25:01.575Z"
doc_updated_by: "CODER"
description: "Task190: port full LanguageTagImpl::simpleExtract field/output/branch semantics, reuse it in existing canonical-tag field projection at native cacheSimpleLSCV boundary, correct real shared font/Locale fallback fields, preserve general parser limits and verify exact raw coverage."
sections:
  Summary: "Implement the complete native LanguageTagImpl simpleExtract algorithm required by known-tag canonicalization and connect its fields to existing shared font/Locale fallback consumers. Standing approval covers Calc core prerequisites and shared correctness fixes."
  Scope: "Only vite-office-calc branch calc. Full extraction enum/branches/casing/UTF16/output preservation, shared canonical-tag field projection and directly affected font/Locale consumers/tests. Native strings may use JS logical UTF16 primitives inside this private field algorithm; reuse existing ASCII operations. No fake LanguageTag class, parser success/no-op methods, ICU/liblangtag port, native compiler/generator, physical memory cache or guard/policy changes. General parser projection remains explicitly bounded until actual class implementation. Update inventory/provenance and Calc readiness honestly. Maximum25 non-task files."
  Plan: "Port full native simpleExtract and reuse cacheSimpleLSCV-admitted fields in current shared font/Locale fallbacks;preserve actual branch/output contracts,correct extension/region fields,record honest metadata and raw100 portable evidence. Full LanguageTag/parser/UI/ODS remain pending."
  Verify Steps: |-
    - node output/playwright/task190-checks/native-audit.mjs: pinned complete native extraction/enum/cache admission and consumer source,source anchors/branch responsibility and unchanged unrelated production owners/guards.
    - node output/playwright/task190-checks/portable.mjs: related extraction/font/Locale/Writer consumers and wholeCalc with four source links absent/restored;exact two changed shared executable owners plus existing36Calc owners raw S/B/F/L100,every counter positive. Writer-only coverage gaps exempt.
    - node output/playwright/task190-checks/browser-portable.mjs: production build,actual extraction/fallback/font/Locale Chromium and DOM-free Worker and related Writer startup,source links absent/restored.
    - node output/playwright/task190-checks/source-gates.mjs:13source gates including inventory/provenance,boundaries and doctor;no algorithm exemptions.
    - node output/playwright/task190-checks/final-audit.mjs: exact changed paths/owners/evidence and references restored;source commit,verification and same-agent EVALUATOR review then finish with descriptive result.
  Verification: "Command: node output/playwright/task190-checks/native-audit.mjs. Result:pass. Evidence:5pinned native hashes,all8enum decisions and complete extraction branch anchors/cache admission;ordered fallback algorithm and7related owners/guard unchanged. No native binary execution. Command: node output/playwright/task190-checks/portable.mjs. Result:pass. Evidence:110related/9files,196Calc/78files;exact2changed shared owners raw S159/B250/F7/L143100 and36Calc raw S4310/B2777/F864/L3857100,every raw counter positive. Four source references absent/restored. Source structural cases include ASCII-only/embeddedNUL/lone-surrogate,slot preservation/clear,private/known-extension/numeric-region behavior and actual font/Locale consumers;related Writer defaults/ODF roundtrip pass. Command: node output/playwright/task190-checks/browser-portable.mjs. Result:pass. Evidence:production build,actual Chromium/DOM-free Worker extraction/fallback/font/Locale consumers andWriter startup/load/edit pass,4refs restored. Command: node output/playwright/task190-checks/source-gates.mjs. Result:13gates pass including unchanged dependency/boundary guards,inventory and provenance. Command: node output/playwright/task190-checks/final-audit.mjs. Result:pass. Evidence:10intentional paths,exact owners/counters/manifests,capability parity flags remainfalse. Full LanguageTag/state/canonicalization/ID registry,Font/defaults/pool/document/UI/ODS remain pending;no ICU/liblangtag/native compiler/memory engine/all-app run. Goal stays active."
  Rollback Plan: "Revert task source commit and source metadata;preserve task history and unrelated user work. Never reset other active tasks."
  Findings: |-
    None.

    - Observation: Initial negative vector de-abc-aaaa expected no extraction, but native structural branch admits a three-unit region slot without checking digits.
      Impact: Test expectation contradicted the explicit source Does not check case or content contract;production port follows native behavior.
      Resolution: Move vector to positive EXTRACTED_LR with region abc and variants aaaa. This is deliberate extraction rather than validity checking,not a new suspected upstream bug.

    - Observation: All related scenarios pass and full new extraction owner already has positive raw counters;raw gate found two uncovered pre-existing general field-projection branches after common tags moved to native extraction.
      Impact: Whole changed-owner raw100 not yet satisfied;no source or guard weakening is needed.
      Resolution: Add explicit script-with-extension and joker prepared-projection boundary cases,then rerun scoped portable raw coverage.

    - Observation: Existing prepared-tag projection synthesized x or * language fallback for private tags and treated a three-unit region as the native country getter;known es-ES-u-co-trad lost its source variant field.
      Impact: These were local projection gaps,not suspected upstream bugs. Native simpleExtract/cache/getter contracts provide the correct fields.
      Resolution: Reuse native extraction for LSC/LV/LR and empty private-tag field behavior;retain explicit separate general-parser boundary without claiming full LanguageTag. New direct/shared/browser tests cover corrected cases.
id_source: "generated"
---
## Summary

Implement the complete native LanguageTagImpl simpleExtract algorithm required by known-tag canonicalization and connect its fields to existing shared font/Locale fallback consumers. Standing approval covers Calc core prerequisites and shared correctness fixes.

## Scope

Only vite-office-calc branch calc. Full extraction enum/branches/casing/UTF16/output preservation, shared canonical-tag field projection and directly affected font/Locale consumers/tests. Native strings may use JS logical UTF16 primitives inside this private field algorithm; reuse existing ASCII operations. No fake LanguageTag class, parser success/no-op methods, ICU/liblangtag port, native compiler/generator, physical memory cache or guard/policy changes. General parser projection remains explicitly bounded until actual class implementation. Update inventory/provenance and Calc readiness honestly. Maximum25 non-task files.

## Plan

Port full native simpleExtract and reuse cacheSimpleLSCV-admitted fields in current shared font/Locale fallbacks;preserve actual branch/output contracts,correct extension/region fields,record honest metadata and raw100 portable evidence. Full LanguageTag/parser/UI/ODS remain pending.

## Verify Steps

- node output/playwright/task190-checks/native-audit.mjs: pinned complete native extraction/enum/cache admission and consumer source,source anchors/branch responsibility and unchanged unrelated production owners/guards.
- node output/playwright/task190-checks/portable.mjs: related extraction/font/Locale/Writer consumers and wholeCalc with four source links absent/restored;exact two changed shared executable owners plus existing36Calc owners raw S/B/F/L100,every counter positive. Writer-only coverage gaps exempt.
- node output/playwright/task190-checks/browser-portable.mjs: production build,actual extraction/fallback/font/Locale Chromium and DOM-free Worker and related Writer startup,source links absent/restored.
- node output/playwright/task190-checks/source-gates.mjs:13source gates including inventory/provenance,boundaries and doctor;no algorithm exemptions.
- node output/playwright/task190-checks/final-audit.mjs: exact changed paths/owners/evidence and references restored;source commit,verification and same-agent EVALUATOR review then finish with descriptive result.

## Verification

Command: node output/playwright/task190-checks/native-audit.mjs. Result:pass. Evidence:5pinned native hashes,all8enum decisions and complete extraction branch anchors/cache admission;ordered fallback algorithm and7related owners/guard unchanged. No native binary execution. Command: node output/playwright/task190-checks/portable.mjs. Result:pass. Evidence:110related/9files,196Calc/78files;exact2changed shared owners raw S159/B250/F7/L143100 and36Calc raw S4310/B2777/F864/L3857100,every raw counter positive. Four source references absent/restored. Source structural cases include ASCII-only/embeddedNUL/lone-surrogate,slot preservation/clear,private/known-extension/numeric-region behavior and actual font/Locale consumers;related Writer defaults/ODF roundtrip pass. Command: node output/playwright/task190-checks/browser-portable.mjs. Result:pass. Evidence:production build,actual Chromium/DOM-free Worker extraction/fallback/font/Locale consumers andWriter startup/load/edit pass,4refs restored. Command: node output/playwright/task190-checks/source-gates.mjs. Result:13gates pass including unchanged dependency/boundary guards,inventory and provenance. Command: node output/playwright/task190-checks/final-audit.mjs. Result:pass. Evidence:10intentional paths,exact owners/counters/manifests,capability parity flags remainfalse. Full LanguageTag/state/canonicalization/ID registry,Font/defaults/pool/document/UI/ODS remain pending;no ICU/liblangtag/native compiler/memory engine/all-app run. Goal stays active.

## Rollback Plan

Revert task source commit and source metadata;preserve task history and unrelated user work. Never reset other active tasks.

## Findings

None.

- Observation: Initial negative vector de-abc-aaaa expected no extraction, but native structural branch admits a three-unit region slot without checking digits.
  Impact: Test expectation contradicted the explicit source Does not check case or content contract;production port follows native behavior.
  Resolution: Move vector to positive EXTRACTED_LR with region abc and variants aaaa. This is deliberate extraction rather than validity checking,not a new suspected upstream bug.

- Observation: All related scenarios pass and full new extraction owner already has positive raw counters;raw gate found two uncovered pre-existing general field-projection branches after common tags moved to native extraction.
  Impact: Whole changed-owner raw100 not yet satisfied;no source or guard weakening is needed.
  Resolution: Add explicit script-with-extension and joker prepared-projection boundary cases,then rerun scoped portable raw coverage.

- Observation: Existing prepared-tag projection synthesized x or * language fallback for private tags and treated a three-unit region as the native country getter;known es-ES-u-co-trad lost its source variant field.
  Impact: These were local projection gaps,not suspected upstream bugs. Native simpleExtract/cache/getter contracts provide the correct fields.
  Resolution: Reuse native extraction for LSC/LV/LR and empty private-tag field behavior;retain explicit separate general-parser boundary without claiming full LanguageTag. New direct/shared/browser tests cover corrected cases.
