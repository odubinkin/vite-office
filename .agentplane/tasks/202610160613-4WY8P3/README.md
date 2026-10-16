---
id: "202610160613-4WY8P3"
title: "Implement minimal Calc scalar document editing chain"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-16T06:14:09.463Z"
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
    body: "Start: implement the user-prioritized minimal canonical scalar document editing chain and update the UI/ODS critical path;defer unrelated language parity without discarding its unfinished work."
events:
  -
    type: "status"
    at: "2026-10-16T06:14:16.342Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the user-prioritized minimal canonical scalar document editing chain and update the UI/ODS critical path;defer unrelated language parity without discarding its unfinished work."
doc_version: 3
doc_updated_at: "2026-10-16T06:14:16.342Z"
doc_updated_by: "CODER"
description: "User-corrected priority:implement the first real source-aligned ScDocument->ScTable->ScColumn numeric/string editing subset using existing shared stores and strings;do not require full native constructors,language/font subsystems or all API parity before connecting UI. Preserve upstream contracts/defaults for supported operations and explicitly record missing services. UI and basic formulas/ODS will build on this same model,without a second browser grid model."
sections:
  Summary: "Implement the first source-aligned scalar spreadsheet document editing chain so browser UI work can begin before broad kernel parity."
  Scope: "Only vite-office-calc branch calc. At most35intentional implementation/test/registry/doc paths for the numeric/string ScColumn storage subset,ScTable ownership,ScDocument sheet insertion and scalar access needed by the first editor,plus existing shared component changes only when actually consumed. Reuse real mdds/string/coordinate owners. Preserve supported-operation contracts and defaults;record unimplemented services and APIs honestly. Do not instantiate fake pools/formatters/language services,no-op eager services,a second browser grid model or a separate ODS document. Full native construction/service/function parity is a later stage,not a gate for this explicit subset. Unfinished task197 language work remains deferred and is not a dependency. No network,native compiler/probes/generators,branch switching or merge."
  Plan: "Audit only source entry points reached by numeric/string editing;implement the minimal real document->table->column chain with existing shared stores and strings;exercise public round-trip/replacement/clear/coordinate/sheet semantics;record bounded inventory and API gaps. Keep adding UI/basic formula and ODS integration tasks directly after this slice instead of completing unrelated constructor dependency graphs."
  Verify Steps: |-
    - node output/playwright/task198-checks/source-audit.mjs: pinned native scalar write/read/clear/sheet entry points,actual shared-store reuse,and explicit omitted full constructor/service responsibilities;no native execution.
    - node output/playwright/task198-checks/portable.mjs: wholeCalc and directly related shared tests with source-reference links absent/restored;exact changed/new executable owner raw S/B/F/L100,every counter positive. Public document->sheet->column numeric/string writes,replacements,clears,coordinate boundaries and shared string behavior;no fake backend.
    - node output/playwright/task198-checks/browser-portable.mjs: production build and actual Chromium/Worker scalar document use without native references;related Writer functional smoke only for changed shared consumers.
    - node output/playwright/task198-checks/source-gates.mjs: existing format/lint/type/docs/size/dependency/tree/provenance/inventory/routing/doctor/diff gates,without relaxing guards.
    - node output/playwright/task198-checks/final-audit.mjs: exact source/path/coverage/ref evidence,explicit unsupported document services and next UI/formula/ODS steps;record verify/source commit/same-agent review before finish. Full all-app run remains deferred until the minimum editable UI and basic same-model ODS milestone,then pause as requested.
  Verification: "Pending implementation. User explicitly corrected priority to a minimal canonical editable UI/ODS slice;this supersedes prior dependency-completion scheduling."
  Rollback Plan: "Revert only this task intentional source/test/registry/doc changes. Preserve completed shared modules,user work,and the separately retained unfinished task197 work. No resets,branch moves or merges."
  Findings: "Source tree inspection confirms numeric/string cell values and supporting tokens/results exist,but no actual ScDocument/ScTable/ScColumn implementation exists. The prior plan treated a full native constructor dependency graph as an obligatory blocker and expanded into language infrastructure. The user rejected that breadth. Scope canonicality to observable supported operations and actual module boundaries;do not turn absence of full class parity into a prerequisite for beginning UI."
id_source: "generated"
---
## Summary

Implement the first source-aligned scalar spreadsheet document editing chain so browser UI work can begin before broad kernel parity.

## Scope

Only vite-office-calc branch calc. At most35intentional implementation/test/registry/doc paths for the numeric/string ScColumn storage subset,ScTable ownership,ScDocument sheet insertion and scalar access needed by the first editor,plus existing shared component changes only when actually consumed. Reuse real mdds/string/coordinate owners. Preserve supported-operation contracts and defaults;record unimplemented services and APIs honestly. Do not instantiate fake pools/formatters/language services,no-op eager services,a second browser grid model or a separate ODS document. Full native construction/service/function parity is a later stage,not a gate for this explicit subset. Unfinished task197 language work remains deferred and is not a dependency. No network,native compiler/probes/generators,branch switching or merge.

## Plan

Audit only source entry points reached by numeric/string editing;implement the minimal real document->table->column chain with existing shared stores and strings;exercise public round-trip/replacement/clear/coordinate/sheet semantics;record bounded inventory and API gaps. Keep adding UI/basic formula and ODS integration tasks directly after this slice instead of completing unrelated constructor dependency graphs.

## Verify Steps

- node output/playwright/task198-checks/source-audit.mjs: pinned native scalar write/read/clear/sheet entry points,actual shared-store reuse,and explicit omitted full constructor/service responsibilities;no native execution.
- node output/playwright/task198-checks/portable.mjs: wholeCalc and directly related shared tests with source-reference links absent/restored;exact changed/new executable owner raw S/B/F/L100,every counter positive. Public document->sheet->column numeric/string writes,replacements,clears,coordinate boundaries and shared string behavior;no fake backend.
- node output/playwright/task198-checks/browser-portable.mjs: production build and actual Chromium/Worker scalar document use without native references;related Writer functional smoke only for changed shared consumers.
- node output/playwright/task198-checks/source-gates.mjs: existing format/lint/type/docs/size/dependency/tree/provenance/inventory/routing/doctor/diff gates,without relaxing guards.
- node output/playwright/task198-checks/final-audit.mjs: exact source/path/coverage/ref evidence,explicit unsupported document services and next UI/formula/ODS steps;record verify/source commit/same-agent review before finish. Full all-app run remains deferred until the minimum editable UI and basic same-model ODS milestone,then pause as requested.

## Verification

Pending implementation. User explicitly corrected priority to a minimal canonical editable UI/ODS slice;this supersedes prior dependency-completion scheduling.

## Rollback Plan

Revert only this task intentional source/test/registry/doc changes. Preserve completed shared modules,user work,and the separately retained unfinished task197 work. No resets,branch moves or merges.

## Findings

Source tree inspection confirms numeric/string cell values and supporting tokens/results exist,but no actual ScDocument/ScTable/ScColumn implementation exists. The prior plan treated a full native constructor dependency graph as an obligatory blocker and expanded into language infrastructure. The user rejected that breadth. Scope canonicality to observable supported operations and actual module boundaries;do not turn absence of full class parity into a prerequisite for beginning UI.
