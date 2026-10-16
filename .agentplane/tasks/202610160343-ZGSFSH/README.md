---
id: "202610160343-ZGSFSH"
title: "Implement native LanguageTag conversion state and shared font tag assembly"
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
  updated_at: "2026-10-16T03:44:38.804Z"
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
    body: "Start: port complete native private LanguageTag conversion state/vendor methods and reuse actual Locale tag assembly in shared font selection;verify flags/identity and strict portable coverage without a fake class/parser."
events:
  -
    type: "status"
    at: "2026-10-16T03:44:45.272Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port complete native private LanguageTag conversion state/vendor methods and reuse actual Locale tag assembly in shared font selection;verify flags/identity and strict portable coverage without a fake class/parser."
doc_version: 3
doc_updated_at: "2026-10-16T03:44:45.272Z"
doc_updated_by: "CODER"
description: "Task192: port complete native private ID/Locale/BCP47 conversion state methods and vendor cleanup using actual Locale/OUString/Decision values;reuse raw Locale-to-BCP47 in actual configured font binding. Preserve lazy flags/system origin/borrowed field identity;no fake complete LanguageTag or parser."
sections:
  Summary: "Port the complete native ID/Locale/BCP47 conversion-state method group and vendor-variant cleanup required by LanguageTag,then reuse raw Locale tag assembly in actual configured-font selection. Standing approval covers safe shared Calc font prerequisites."
  Scope: "Only vite-office-calc branch calc. Six full native responsibilities:handleVendorVariant,LanguageTagImpl static convertToBcp47(Locale),convertLangToLocale,convertLocaleToBcp47,convertLangToBcp47,getBcp47. Use real Locale/OUString owners,Decision enum and explicit conversion-state fields;preserve lazy initialized flags,system origin,raw IDs and borrowed field identity. This is a private method group,not a fake complete LanguageTag class/public getters/registry/parser. Source diagnostic bad-luck empty BCP47 outcome can be handled by the total raw converter's existing empty-input path without observable change. Reuse common assembly in actual shared fontcfg and update inventory/provenance/readiness. No ICU/liblangtag/native compiler/probe/memory cache,policy/guard edits or all-app run. Maximum25non-task paths."
  Plan: "Port six complete native private LanguageTag conversion/vendor responsibilities with actual value owners and lazy flags;reuse raw Locale tag conversion in configured-font consumer. Preserve source outputs/borrowed state without fake class/parser or memory engine;verify related/Calc raw100 and real browser/Writer."
  Verify Steps: |-
    - node output/playwright/task192-checks/native-audit.mjs:5pinned native sources,six complete method/Decision/state markers,empty-result equivalence and unchanged MsLangId/tables/extraction/resources/guard.
    - node output/playwright/task192-checks/portable.mjs:related state/font/Locale/Writer and wholeCalc with four source refs absent/restored;exact two changed shared executable owners and36Calc raw S/B/F/L100,every counter positive;Writer-only gaps exempt.
    - node output/playwright/task192-checks/browser-portable.mjs:production build,actual state transitions/borrowed identity/real configured fonts in Chromium/DOM-free Worker and related Writer startup;four source refs absent/restored.
    - node output/playwright/task192-checks/source-gates.mjs:13source gates including source-tree/provenance/inventory/boundaries/doctor,no exceptions.
    - node output/playwright/task192-checks/final-audit.mjs:exact paths/owners/manifests/references;source commit,recorded verification and same-agent EVALUATOR review before descriptive finish.
  Verification: "Pending. Full LanguageTag class/state synchronization/canonicalization/registry/parser,Font/defaults/pools/document/UI/ODS remain pending. Next all-app run waits for real minimum UI/ODS readiness,then fix applicable failures and pause goal."
  Rollback Plan: "Revert the source commit and associated metadata/docs;retain historical task evidence and do not reset user work or touch unrelated active tasks."
  Findings: "The private conversion group has source-defined lazy state independent of the general parser. Its total raw converter preserves the diagnostic empty-result outcome without needing a fabricated locale backend or native memory mechanisms."
id_source: "generated"
---
## Summary

Port the complete native ID/Locale/BCP47 conversion-state method group and vendor-variant cleanup required by LanguageTag,then reuse raw Locale tag assembly in actual configured-font selection. Standing approval covers safe shared Calc font prerequisites.

## Scope

Only vite-office-calc branch calc. Six full native responsibilities:handleVendorVariant,LanguageTagImpl static convertToBcp47(Locale),convertLangToLocale,convertLocaleToBcp47,convertLangToBcp47,getBcp47. Use real Locale/OUString owners,Decision enum and explicit conversion-state fields;preserve lazy initialized flags,system origin,raw IDs and borrowed field identity. This is a private method group,not a fake complete LanguageTag class/public getters/registry/parser. Source diagnostic bad-luck empty BCP47 outcome can be handled by the total raw converter's existing empty-input path without observable change. Reuse common assembly in actual shared fontcfg and update inventory/provenance/readiness. No ICU/liblangtag/native compiler/probe/memory cache,policy/guard edits or all-app run. Maximum25non-task paths.

## Plan

Port six complete native private LanguageTag conversion/vendor responsibilities with actual value owners and lazy flags;reuse raw Locale tag conversion in configured-font consumer. Preserve source outputs/borrowed state without fake class/parser or memory engine;verify related/Calc raw100 and real browser/Writer.

## Verify Steps

- node output/playwright/task192-checks/native-audit.mjs:5pinned native sources,six complete method/Decision/state markers,empty-result equivalence and unchanged MsLangId/tables/extraction/resources/guard.
- node output/playwright/task192-checks/portable.mjs:related state/font/Locale/Writer and wholeCalc with four source refs absent/restored;exact two changed shared executable owners and36Calc raw S/B/F/L100,every counter positive;Writer-only gaps exempt.
- node output/playwright/task192-checks/browser-portable.mjs:production build,actual state transitions/borrowed identity/real configured fonts in Chromium/DOM-free Worker and related Writer startup;four source refs absent/restored.
- node output/playwright/task192-checks/source-gates.mjs:13source gates including source-tree/provenance/inventory/boundaries/doctor,no exceptions.
- node output/playwright/task192-checks/final-audit.mjs:exact paths/owners/manifests/references;source commit,recorded verification and same-agent EVALUATOR review before descriptive finish.

## Verification

Pending. Full LanguageTag class/state synchronization/canonicalization/registry/parser,Font/defaults/pools/document/UI/ODS remain pending. Next all-app run waits for real minimum UI/ODS readiness,then fix applicable failures and pause goal.

## Rollback Plan

Revert the source commit and associated metadata/docs;retain historical task evidence and do not reset user work or touch unrelated active tasks.

## Findings

The private conversion group has source-defined lazy state independent of the general parser. Its total raw converter preserves the diagnostic empty-result outcome without needing a fabricated locale backend or native memory mechanisms.
