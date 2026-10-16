---
id: "202610160449-4VVT0H"
title: "Implement registered Unicode language-tag extension parsing"
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
  updated_at: "2026-10-16T04:50:28.295Z"
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
    body: "Start: implement actual Unicode extension callbacks and pinned functional CLDR data,sharing source ASCII and diagnostic values with the existing scanner and registered-key owners."
events:
  -
    type: "status"
    at: "2026-10-16T04:50:33.836Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement actual Unicode extension callbacks and pinned functional CLDR data,sharing source ASCII and diagnostic values with the existing scanner and registered-key owners."
doc_version: 3
doc_updated_at: "2026-10-16T04:50:33.836Z"
doc_updated_by: "CODER"
description: "Task195: implement the actual liblangtag Unicode extension state machine and pinned ordered CLDR functional lookup needed by general LanguageTag grammar/canonicalization, reusing shared byte/error/ASCII values without physical library machinery."
sections:
  Summary: "Task195 implements liblangtag0.6.8 Unicode extension parsing and ordered functional CLDR values required by the actual general LanguageTag parser. Task194 scanner and IANA lookup are complete prerequisites;the t handler requires the pending actual general parser and is not replaced with a stub."
  Scope: "Only vite-office-calc branch calc. Up to30 non-task paths: actual Unicode extension state owner, native ASCII comparison/lower helpers, shared diagnostic declarations, ordered CLDR keyword/language-alias data provider and tests, reuse/refactor of task194 scanner/registry diagnostics/ASCII operations, Unicode notices, runtime/provenance/capability records, browser evidence, Calc readiness and suspected-issue documentation. All source comes from existing pinned local archives. Preserve actual source state transitions,raw spelling,case-sensitive XPath key selection,case-insensitive type matching,CODEPOINTS special case,sort/order/duplicates and validation behavior. No general parser,full LanguageTag,t handler stub,localized language labels,physical memory/XML/module-loader engine,guard changes,native compilation/generators,network or full all-app run. Standing user approval covers this required core/shared implementation."
  Plan: "Implement complete native Unicode extension state callbacks and pinned ordered CLDR functional provider,sharing actual ASCII/error declarations with existing scanner/IANA owners;verify strict raw coverage,source data and actual browser/Worker without5source refs,then review/finish. General grammar,t handler,canonicalization and LanguageTag remain pending."
  Verify Steps: |-
    - node output/playwright/task195-checks/native-audit.mjs: exact pinned archive/source/QA/data hashes,all ordered CLDR functional values versus original XML,shared refactor proof and documented suspicious native cases;no native execution/generator.
    - node output/playwright/task195-checks/portable.mjs: related scanner/IANA/ASCII/CLDR/Unicode-extension scenarios and wholeCalc with all5source refs absent/restored;exact changed shared executable owner set and36Calc owners every raw S/B/F counter positive and S/B/F/L100. Writer-only gaps exempt if encountered.
    - node output/playwright/task195-checks/browser-portable.mjs: production build and actual Chromium/DOM-free Worker new/shared parsing values with5source refs absent/restored;selected Writer functional smoke only.
    - node output/playwright/task195-checks/source-gates.mjs: all13existing gates including inventory/provenance/boundaries/routing/doctor;no guard algorithm modifications or exemptions.
    - node output/playwright/task195-checks/final-audit.mjs: exact changed paths,source/ref/coverage evidence,truthful remaining parser boundary;record verify,commit and same-agent EVALUATOR review then descriptive finish.
  Verification: "Pending implementation and declared checks."
  Rollback Plan: "Revert only this task's implementation and registry records;retain pinned ignored source evidence and unrelated user/task changes. No destructive reset or merge."
  Findings: "Source preflight confirms clean calc branch and no matching active task. The previous goal turn made authoritative progress:task194 DONE with scanner/IANA owners and verified portable strict coverage. New t handler cannot be honestly completed before actual general tag parser;this task implements complete independent Unicode handler and required functional CLDR responsibility boundary. Diagnostic values remain explicit projections of fresh native internal error slots,not a physical error stack/library."
id_source: "generated"
---
## Summary

Task195 implements liblangtag0.6.8 Unicode extension parsing and ordered functional CLDR values required by the actual general LanguageTag parser. Task194 scanner and IANA lookup are complete prerequisites;the t handler requires the pending actual general parser and is not replaced with a stub.

## Scope

Only vite-office-calc branch calc. Up to30 non-task paths: actual Unicode extension state owner, native ASCII comparison/lower helpers, shared diagnostic declarations, ordered CLDR keyword/language-alias data provider and tests, reuse/refactor of task194 scanner/registry diagnostics/ASCII operations, Unicode notices, runtime/provenance/capability records, browser evidence, Calc readiness and suspected-issue documentation. All source comes from existing pinned local archives. Preserve actual source state transitions,raw spelling,case-sensitive XPath key selection,case-insensitive type matching,CODEPOINTS special case,sort/order/duplicates and validation behavior. No general parser,full LanguageTag,t handler stub,localized language labels,physical memory/XML/module-loader engine,guard changes,native compilation/generators,network or full all-app run. Standing user approval covers this required core/shared implementation.

## Plan

Implement complete native Unicode extension state callbacks and pinned ordered CLDR functional provider,sharing actual ASCII/error declarations with existing scanner/IANA owners;verify strict raw coverage,source data and actual browser/Worker without5source refs,then review/finish. General grammar,t handler,canonicalization and LanguageTag remain pending.

## Verify Steps

- node output/playwright/task195-checks/native-audit.mjs: exact pinned archive/source/QA/data hashes,all ordered CLDR functional values versus original XML,shared refactor proof and documented suspicious native cases;no native execution/generator.
- node output/playwright/task195-checks/portable.mjs: related scanner/IANA/ASCII/CLDR/Unicode-extension scenarios and wholeCalc with all5source refs absent/restored;exact changed shared executable owner set and36Calc owners every raw S/B/F counter positive and S/B/F/L100. Writer-only gaps exempt if encountered.
- node output/playwright/task195-checks/browser-portable.mjs: production build and actual Chromium/DOM-free Worker new/shared parsing values with5source refs absent/restored;selected Writer functional smoke only.
- node output/playwright/task195-checks/source-gates.mjs: all13existing gates including inventory/provenance/boundaries/routing/doctor;no guard algorithm modifications or exemptions.
- node output/playwright/task195-checks/final-audit.mjs: exact changed paths,source/ref/coverage evidence,truthful remaining parser boundary;record verify,commit and same-agent EVALUATOR review then descriptive finish.

## Verification

Pending implementation and declared checks.

## Rollback Plan

Revert only this task's implementation and registry records;retain pinned ignored source evidence and unrelated user/task changes. No destructive reset or merge.

## Findings

Source preflight confirms clean calc branch and no matching active task. The previous goal turn made authoritative progress:task194 DONE with scanner/IANA owners and verified portable strict coverage. New t handler cannot be honestly completed before actual general tag parser;this task implements complete independent Unicode handler and required functional CLDR responsibility boundary. Diagnostic values remain explicit projections of fresh native internal error slots,not a physical error stack/library.
