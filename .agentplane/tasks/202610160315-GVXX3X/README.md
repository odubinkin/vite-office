---
id: "202610160315-GVXX3X"
title: "Implement native LanguageTag simple extraction for shared font fallbacks"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 5
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
doc_updated_at: "2026-10-16T03:15:56.365Z"
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
  Verification: "Pending. Next full all-app run remains deferred until actual minimum UI/ODS readiness,then fix applicable failures and pause. Goal remains active."
  Rollback Plan: "Revert task source commit and source metadata;preserve task history and unrelated user work. Never reset other active tasks."
  Findings: "None."
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

Pending. Next full all-app run remains deferred until actual minimum UI/ODS readiness,then fix applicable failures and pause. Goal remains active.

## Rollback Plan

Revert task source commit and source metadata;preserve task history and unrelated user work. Never reset other active tasks.

## Findings

None.
