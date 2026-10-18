---
id: "202610182247-WN0H8T"
title: "Expose native trailing menubar entries through shared overflow popup"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify:
  - "Whole Calc raw100percent S/B/F/L;related shared menubar tests including measured suffix popup and resize lifecycle;built desktop/mobile Writer/Calc overflow reachability and keyboard/axe/pageerrors;types/build/freshness/touchedstyle/dependency/provenance/scopedinventories/doctor/routing. No full run before cadence30."
plan_approval:
  state: "approved"
  updated_at: "2026-10-18T22:47:33.920Z"
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
    body: "Start:implement native hidden-suffix parent popup in shared Writer/Calc menubar,then verify measured boundaries and real browser keyboard reachability."
events:
  -
    type: "status"
    at: "2026-10-18T22:47:34.704Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start:implement native hidden-suffix parent popup in shared Writer/Calc menubar,then verify measured boundaries and real browser keyboard reachability."
doc_version: 3
doc_updated_at: "2026-10-18T22:47:34.704Z"
doc_updated_by: "CODER"
description: "Task21 of approved Calc UI goal:fix inaccessible trailing top menus at narrow widths using native MenuBarWindow hidden-item parent popup behavior in actual shared Writer/Calc menubar. Preserve shared visual style,resource identities,commands and keyboard ownership. Only calc checkout/branch,no network/merge. Full regression already task20,next30."
sections:
  Summary: |-
    Expose native trailing menubar entries through shared overflow popup

    Task21 of approved Calc UI goal:fix inaccessible trailing top menus at narrow widths using native MenuBarWindow hidden-item parent popup behavior in actual shared Writer/Calc menubar. Preserve shared visual style,resource identities,commands and keyboard ownership. Only calc checkout/branch,no network/merge. Full regression already task20,next30.
  Scope: |-
    - In scope: Task21 of approved Calc UI goal:fix inaccessible trailing top menus at narrow widths using native MenuBarWindow hidden-item parent popup behavior in actual shared Writer/Calc menubar. Preserve shared visual style,resource identities,commands and keyboard ownership. Only calc checkout/branch,no network/merge. Full regression already task20,next30.
    - Out of scope: unrelated refactors not required for "Expose native trailing menubar entries through shared overflow popup".
  Plan: "1.CODER implements measured native trailing-menu projection with More menus parent popup in actual shared CommandMenuBar;Header permits constrained width,unchanged normal desktop appearance. Source:MenuBarWindow::ImplCreatePopup copies hidden suffix into parent popup and keyboard skips hidden roots. Keep native nested resources and existing execution/focus contracts.2.CODER verifies real suffix selection,source order,resizing,keyboard ownership,desktop/mobile Writer/Calc shared styling,unfilteredaxe/pageerrors and wholeCalc100percent plus affected module tests.3.Record evidence,evaluate and commit only task paths. Up to14non-task paths:shared menubar/header plus focused layout module/tests if required,shared runtime/provenance records,shared browser tests and current Calc architecture documentation. Existing goal approval applies;no new network/core formatting or merge. Full cadence next30."
  Verify Steps: "npm run test:coverage:calc must remain raw100percent statements/branches/functions/lines. Run affected shared menubar and header tests and meaningful layout boundary cases (fits,hidden suffix,unmeasured/empty,resize cleanup);new changed module raw100percent using scoped coverage and existing related tests. Built browser at1280x800 and390x600 for bothWriter/Calc:all source top menus reachable,hidden suffix order,mouse/keyboard submenu open/escape/focus and resize;original shared font/toolbar style retained;unfilteredaxe/pageerrors pass. npm run typecheck/build/check:dependencies/check:docs/check:file-size/check:source-tree/check:source-provenance/check:writer-resources/check:calc-resources,touchedPrettier/eslint,shared/Calc scopedinventory,ap doctor and routing. Full task20already passed;next full30."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only task21 measured menubar suffix projection and header constraint with associated tests/registry. Preserve task20 formatting controls and all earlier core owners. No branch resets or merges."
  Findings: ""
id_source: "generated"
---
## Summary

Expose native trailing menubar entries through shared overflow popup

Task21 of approved Calc UI goal:fix inaccessible trailing top menus at narrow widths using native MenuBarWindow hidden-item parent popup behavior in actual shared Writer/Calc menubar. Preserve shared visual style,resource identities,commands and keyboard ownership. Only calc checkout/branch,no network/merge. Full regression already task20,next30.

## Scope

- In scope: Task21 of approved Calc UI goal:fix inaccessible trailing top menus at narrow widths using native MenuBarWindow hidden-item parent popup behavior in actual shared Writer/Calc menubar. Preserve shared visual style,resource identities,commands and keyboard ownership. Only calc checkout/branch,no network/merge. Full regression already task20,next30.
- Out of scope: unrelated refactors not required for "Expose native trailing menubar entries through shared overflow popup".

## Plan

1.CODER implements measured native trailing-menu projection with More menus parent popup in actual shared CommandMenuBar;Header permits constrained width,unchanged normal desktop appearance. Source:MenuBarWindow::ImplCreatePopup copies hidden suffix into parent popup and keyboard skips hidden roots. Keep native nested resources and existing execution/focus contracts.2.CODER verifies real suffix selection,source order,resizing,keyboard ownership,desktop/mobile Writer/Calc shared styling,unfilteredaxe/pageerrors and wholeCalc100percent plus affected module tests.3.Record evidence,evaluate and commit only task paths. Up to14non-task paths:shared menubar/header plus focused layout module/tests if required,shared runtime/provenance records,shared browser tests and current Calc architecture documentation. Existing goal approval applies;no new network/core formatting or merge. Full cadence next30.

## Verify Steps

npm run test:coverage:calc must remain raw100percent statements/branches/functions/lines. Run affected shared menubar and header tests and meaningful layout boundary cases (fits,hidden suffix,unmeasured/empty,resize cleanup);new changed module raw100percent using scoped coverage and existing related tests. Built browser at1280x800 and390x600 for bothWriter/Calc:all source top menus reachable,hidden suffix order,mouse/keyboard submenu open/escape/focus and resize;original shared font/toolbar style retained;unfilteredaxe/pageerrors pass. npm run typecheck/build/check:dependencies/check:docs/check:file-size/check:source-tree/check:source-provenance/check:writer-resources/check:calc-resources,touchedPrettier/eslint,shared/Calc scopedinventory,ap doctor and routing. Full task20already passed;next full30.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only task21 measured menubar suffix projection and header constraint with associated tests/registry. Preserve task20 formatting controls and all earlier core owners. No branch resets or merges.

## Findings
