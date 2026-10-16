---
id: "202610160438-32SN26"
title: "Implement Calc language-tag scanner and registered subtag lookup"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-16T04:39:24.596Z"
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
    body: "Start: implement source-backed token scanning and registered subtag lookup for the actual general parser dependency chain, preserving JS GC ownership."
events:
  -
    type: "status"
    at: "2026-10-16T04:39:29.291Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement source-backed token scanning and registered subtag lookup for the actual general parser dependency chain, preserving JS GC ownership."
doc_version: 3
doc_updated_at: "2026-10-16T04:39:29.291Z"
doc_updated_by: "CODER"
description: "Task194: implement the actual liblangtag token scanner and ordered IANA registry lookup needed by the general LanguageTag parser, using pinned source and functional data with JS GC; no substitute complete parser or physical library framework."
sections:
  Summary: "Task194 implements the complete private token scanner and functional IANA registry lookup required by the pending LanguageTag general parser, using already downloaded pinned liblangtag0.6.8 and IANA2026-06-14 sources."
  Scope: "Only vite-office-calc branch calc. Up to20 non-task files: two actual external/liblangtag executable responsibility owners, their tests, ordered functional registry data, MPL notice/license, local source-reference link, browser evidence, runtime/provenance/capability records and Calc readiness documentation. Preserve source token/errors/C-string boundary and registered exact-key lookup including wildcard records and expanded ranges. Native JS Map/strings/managed arrays replace XML/trie/allocation machinery, not observable language semantics. No complete parser/LanguageTag facade, native compilation/generators/memory engine, UI localization, guard changes, unrelated Writer fixes or full all-app run. Existing user approval covers this implementation."
  Plan: "Implement complete native token scanner and pinned functional IANA registry lookup, then validate strict shared/Calc coverage, source-data equivalence and real browser/Worker portability; general parser and LanguageTag remain pending."
  Verify Steps: |-
    - node output/playwright/task194-checks/native-audit.mjs: verify pinned archive/source hashes, full expanded IANA functional data versus local source, scanner/DB source anchors and intentional paths; no native executable/generator.
    - node output/playwright/task194-checks/portable.mjs: selected related tests plus whole Calc with all five upstream source links absent/restored; exact changed shared executable owners and36Calc owners every raw S/B/F counter positive and S/B/F/L100. Writer-only gaps exempt if encountered.
    - node output/playwright/task194-checks/browser-portable.mjs: production build and actual Chromium/DOM-free Worker scanner/registry cases with five source refs absent/restored.
    - node output/playwright/task194-checks/source-gates.mjs: all13 existing source gates, unchanged guard algorithms, inventory/provenance/boundaries/routing/doctor.
    - node output/playwright/task194-checks/final-audit.mjs: exact source/ref/path/coverage evidence and truthful remaining parser boundary; record verification, source commit and same-agent EVALUATOR review followed by descriptive finish.
  Verification: "Pending implementation and declared checks."
  Rollback Plan: "Revert only this task source commit and its registry records/link; preserve user work and unrelated tasks. Ignored pinned archives remain evidence."
  Findings: "Previous turn answered readiness without code changes;this turn resumes the actual dependency chain. Native JS Intl substitution is already disproved;source-derived outcomes are not described as executed native tests. Physical C ownership, XML DOM/trie and locks are unnecessary for immutable in-process registered data under JS GC."
id_source: "generated"
---
## Summary

Task194 implements the complete private token scanner and functional IANA registry lookup required by the pending LanguageTag general parser, using already downloaded pinned liblangtag0.6.8 and IANA2026-06-14 sources.

## Scope

Only vite-office-calc branch calc. Up to20 non-task files: two actual external/liblangtag executable responsibility owners, their tests, ordered functional registry data, MPL notice/license, local source-reference link, browser evidence, runtime/provenance/capability records and Calc readiness documentation. Preserve source token/errors/C-string boundary and registered exact-key lookup including wildcard records and expanded ranges. Native JS Map/strings/managed arrays replace XML/trie/allocation machinery, not observable language semantics. No complete parser/LanguageTag facade, native compilation/generators/memory engine, UI localization, guard changes, unrelated Writer fixes or full all-app run. Existing user approval covers this implementation.

## Plan

Implement complete native token scanner and pinned functional IANA registry lookup, then validate strict shared/Calc coverage, source-data equivalence and real browser/Worker portability; general parser and LanguageTag remain pending.

## Verify Steps

- node output/playwright/task194-checks/native-audit.mjs: verify pinned archive/source hashes, full expanded IANA functional data versus local source, scanner/DB source anchors and intentional paths; no native executable/generator.
- node output/playwright/task194-checks/portable.mjs: selected related tests plus whole Calc with all five upstream source links absent/restored; exact changed shared executable owners and36Calc owners every raw S/B/F counter positive and S/B/F/L100. Writer-only gaps exempt if encountered.
- node output/playwright/task194-checks/browser-portable.mjs: production build and actual Chromium/DOM-free Worker scanner/registry cases with five source refs absent/restored.
- node output/playwright/task194-checks/source-gates.mjs: all13 existing source gates, unchanged guard algorithms, inventory/provenance/boundaries/routing/doctor.
- node output/playwright/task194-checks/final-audit.mjs: exact source/ref/path/coverage evidence and truthful remaining parser boundary; record verification, source commit and same-agent EVALUATOR review followed by descriptive finish.

## Verification

Pending implementation and declared checks.

## Rollback Plan

Revert only this task source commit and its registry records/link; preserve user work and unrelated tasks. Ignored pinned archives remain evidence.

## Findings

Previous turn answered readiness without code changes;this turn resumes the actual dependency chain. Native JS Intl substitution is already disproved;source-derived outcomes are not described as executed native tests. Physical C ownership, XML DOM/trie and locks are unnecessary for immutable in-process registered data under JS GC.
