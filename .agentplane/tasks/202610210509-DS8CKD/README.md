---
id: "202610210509-DS8CKD"
title: "Connect native metric entry to Writer dimension dialogs"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 14
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-21T05:30:23.255Z"
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
    body: "Start: connect actual metric parser and conversion owners to existing Writer dimension dialogs with native unit suffixes and physical-value verification."
events:
  -
    type: "status"
    at: "2026-10-21T05:10:26.098Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: connect actual metric parser and conversion owners to existing Writer dimension dialogs with native unit suffixes and physical-value verification."
doc_version: 3
doc_updated_at: "2026-10-21T05:39:37.258Z"
doc_updated_by: "CODER"
description: "Prioritize existing Writer slice consistency:replace hardcoded centimetre numeric inputs in page,table,column,row-height and line-number dialogs with shared browser presentation of actual MetricSpinButton/parser;support explicit unit suffixes,locale decimals,defined ranges and physical-value preservation through ODT. No deeper locale services or invented settings facade."
sections:
  Summary: "Connect existing native metric parsing/conversion to current Writer dimension dialogs;preserve physical document values and source owner policies."
  Scope: "Writer checkout/branch only;up to40 non-task paths.Same dimension-entry feature:shared browser MetricSpinButton plus actual svtools SetFieldUnit and numeric digit/increment accessors,page/table/columns/row-height/line-numbering integration,related tests/ODT/Chromium and conservative registry/import data.No global preference facade,sidebar redesign,search expansion,network or outside writes.Keep existing CM default until genuine module configuration is connected;source display-unit mapping,precision and increments must be preserved."
  Plan: "Same approved coherent metric-entry feature,refined from35 to40 non-task paths:source inspection requires real svtools SetFieldUnit mapping,point precision and unit-dependent normalized increments;add actual numeric accessors and source-backed coverage rather than hardcode a universal browser step.Preserve physical twips and native table policy;related tests/ODT/Chromium and declared gates unchanged.Seventh leaf,no full run;current-slice settings/sidebar/UI-IO consistency remains next and next-full-run closure pauses goal."
  Verify Steps: "Inspect pinned VCL MetricSpinButton/field and four Writer dialog sources.Run new shared widget and changed Writer dialog/table-column/native row/line/page tests plus actual ODT roundtrip and mounted view regression;strict100 coverage on new widget using native parser.Owner dialog coverage gaps must be recorded,not hidden.Run Chromium actual metric entry integration,typecheck/static build,scoped ESLint/Prettier,dependencies/provenance,writer/shared inventories,docs/tree/size,doctor/routing,diff/status.Record retained failures and fixes;no gate/assertion/timeout weakening.No full suite before tenth leaf;stop rule after NEXT full-run task closure remains."
  Verification: "Pending declared source-backed implementation and targeted evidence."
  Rollback Plan: "Revert intentional leaf source/test/registry commits on writer only;preserve completed search prerequisites and intentional save/open/recovery deviations."
  Findings: |-
    Previous goal turn was progress:45MPFV was closed with source/quality/verification and the user priority correction was persisted in6B984M. Clean writer preflight;direct route;no nested AGENTS or user-instructions. All mutation remains in vite-office-writer/writer. No network,subagents,merges,pushes,outside writes or native lifetime machinery.

    This task addresses current-slice consistency instead of adding search/locale depth. Shared metric text/spin presentation now feeds actual native MetricSpinButton and parser,not HTML number conversion. Page dimensions/margins,table geometry/column slots,row height and line numbering spacing use physical twips and original table/shell/draft handlers. Invalid/incomplete text stays local;unchanged display/blur does not write rounded geometry. Keyboard and pointer arrows keep entry focus and native range sensitivity. Related ODT tests inspect actual byte reopens,not just codec-shaped objects.

    Source inspection of svtools SetFieldUnit found the initial universal tenth-unit browser increment was insufficient for alternate units. Same approved feature refined from35 to40 non-task paths to include actual native SetFieldUnit and numeric getters/increment storage. Original M/KM->CM,FOOT/MILE->INCH mappings,POINT precision narrowing,MM/CHAR/LINE50/500,INCH2/20,other10/100 normalized increments and denormalized twip range/value ordering are preserved. Browser formatting uses original first unit aliases and no-space inch/degree suffixes. Full localized grouping/currency/native widget/device/locale services remain unported;no full widget parity is claimed.

    The initial VCL/browser placement would create an upward VCL->SVTools dependency after connecting SetFieldUnit. The browser projection therefore belongs in svtools/browser/control;VCL retains its native numeric owner and SVTools retains unit configuration. Boundary failures are retained. Add only exact per-file native numeric/widget-alias/system-locale import data;do not widen module-wide permissions or change validator algorithms. Existing runtime classifications,semantic statuses/defaults and registered save/open/recovery deviations remain unchanged.

    Initial22-scenario run:12 passed,10 failed. Nine failures were obsolete HTML number.value assertions after conversion to text spin input;one upstream fixture path failed because the command ran at repository cwd rather than apps/office. Preserve original physical-geometry/history assertions and migrate numeric presentation assertions to aria-valuenow;run fixture tests from their actual package cwd. First instrumented32 run:30 passed,two failed (same cwd mistake and one existing30000ms row case under concurrent load). Later current-source related Writer runs retain original timeout/assertions and cover all scenarios;no deadline/skip/threshold/exclusion relaxation.

    The first localized widget test incorrectly assumed German accepts dot as a decimal alternate. Actual de_DE LC_CTYPE has comma decimal,empty alternate and dot grouping. Preserve original parser behavior:2.54 cm becomes254 cm there. Correct the test to literal source resources,verify the real Arabic dot alternate,and strengthen newly added physical-output assertions from substring matching to exact equality. No production parser logic is changed for that mistaken oracle.

    Native unit-helper tests initially assumed every display quantization preserves1440twips exactly. Source CHAR/LINE conversion constants and two-digit normalization produce1441;preserve and test that original quantization. A new degree-display test retained a detached DOM input across changing the root component;query the current mounted input instead. No production change is needed for either fixture correction.

    Seven existing Chromium specifications keep their geometry/history/selection assertions and now read numeric spin aria-valuenow rather than HTML number.value. Tests for untouched border widgets remain unchanged. Manual production browser acceptance entered1in and25.4mm into real Page Style,accepted and reopened both as2.54cm;actual pointer increment yielded2.64cm with entry focus. Screenshot inspected. The initial dev browser's only initial console error was favicon404;temporary HMR transitions during authored moves are not a production acceptance claim.

    Current-slice remaining work is explicit:real Writer module measurement preferences and their Options UI,ruler unit choices,remaining paragraph/tab/border fields,upstream sidebar structure/presentation and existing core/UI/import/export wiring. Display-unit props are actual presentation contracts,not a fabricated global preferences service;existing CM fallback remains until its real owner is connected. Search parent6B984M stays unfinished and lower priority than slice consistency.

    This is the seventh completed leaf since9BAAAC when closed. All runs here are related/targeted,not the next full test checkpoint. After NEXT full run,necessary fixes/test additions/coverage and final active-task closure,pause goal immediately and start no further task. Do not mark overall Writer objective complete.
id_source: "generated"
---
## Summary

Connect existing native metric parsing/conversion to current Writer dimension dialogs;preserve physical document values and source owner policies.

## Scope

Writer checkout/branch only;up to40 non-task paths.Same dimension-entry feature:shared browser MetricSpinButton plus actual svtools SetFieldUnit and numeric digit/increment accessors,page/table/columns/row-height/line-numbering integration,related tests/ODT/Chromium and conservative registry/import data.No global preference facade,sidebar redesign,search expansion,network or outside writes.Keep existing CM default until genuine module configuration is connected;source display-unit mapping,precision and increments must be preserved.

## Plan

Same approved coherent metric-entry feature,refined from35 to40 non-task paths:source inspection requires real svtools SetFieldUnit mapping,point precision and unit-dependent normalized increments;add actual numeric accessors and source-backed coverage rather than hardcode a universal browser step.Preserve physical twips and native table policy;related tests/ODT/Chromium and declared gates unchanged.Seventh leaf,no full run;current-slice settings/sidebar/UI-IO consistency remains next and next-full-run closure pauses goal.

## Verify Steps

Inspect pinned VCL MetricSpinButton/field and four Writer dialog sources.Run new shared widget and changed Writer dialog/table-column/native row/line/page tests plus actual ODT roundtrip and mounted view regression;strict100 coverage on new widget using native parser.Owner dialog coverage gaps must be recorded,not hidden.Run Chromium actual metric entry integration,typecheck/static build,scoped ESLint/Prettier,dependencies/provenance,writer/shared inventories,docs/tree/size,doctor/routing,diff/status.Record retained failures and fixes;no gate/assertion/timeout weakening.No full suite before tenth leaf;stop rule after NEXT full-run task closure remains.

## Verification

Pending declared source-backed implementation and targeted evidence.

## Rollback Plan

Revert intentional leaf source/test/registry commits on writer only;preserve completed search prerequisites and intentional save/open/recovery deviations.

## Findings

Previous goal turn was progress:45MPFV was closed with source/quality/verification and the user priority correction was persisted in6B984M. Clean writer preflight;direct route;no nested AGENTS or user-instructions. All mutation remains in vite-office-writer/writer. No network,subagents,merges,pushes,outside writes or native lifetime machinery.

This task addresses current-slice consistency instead of adding search/locale depth. Shared metric text/spin presentation now feeds actual native MetricSpinButton and parser,not HTML number conversion. Page dimensions/margins,table geometry/column slots,row height and line numbering spacing use physical twips and original table/shell/draft handlers. Invalid/incomplete text stays local;unchanged display/blur does not write rounded geometry. Keyboard and pointer arrows keep entry focus and native range sensitivity. Related ODT tests inspect actual byte reopens,not just codec-shaped objects.

Source inspection of svtools SetFieldUnit found the initial universal tenth-unit browser increment was insufficient for alternate units. Same approved feature refined from35 to40 non-task paths to include actual native SetFieldUnit and numeric getters/increment storage. Original M/KM->CM,FOOT/MILE->INCH mappings,POINT precision narrowing,MM/CHAR/LINE50/500,INCH2/20,other10/100 normalized increments and denormalized twip range/value ordering are preserved. Browser formatting uses original first unit aliases and no-space inch/degree suffixes. Full localized grouping/currency/native widget/device/locale services remain unported;no full widget parity is claimed.

The initial VCL/browser placement would create an upward VCL->SVTools dependency after connecting SetFieldUnit. The browser projection therefore belongs in svtools/browser/control;VCL retains its native numeric owner and SVTools retains unit configuration. Boundary failures are retained. Add only exact per-file native numeric/widget-alias/system-locale import data;do not widen module-wide permissions or change validator algorithms. Existing runtime classifications,semantic statuses/defaults and registered save/open/recovery deviations remain unchanged.

Initial22-scenario run:12 passed,10 failed. Nine failures were obsolete HTML number.value assertions after conversion to text spin input;one upstream fixture path failed because the command ran at repository cwd rather than apps/office. Preserve original physical-geometry/history assertions and migrate numeric presentation assertions to aria-valuenow;run fixture tests from their actual package cwd. First instrumented32 run:30 passed,two failed (same cwd mistake and one existing30000ms row case under concurrent load). Later current-source related Writer runs retain original timeout/assertions and cover all scenarios;no deadline/skip/threshold/exclusion relaxation.

The first localized widget test incorrectly assumed German accepts dot as a decimal alternate. Actual de_DE LC_CTYPE has comma decimal,empty alternate and dot grouping. Preserve original parser behavior:2.54 cm becomes254 cm there. Correct the test to literal source resources,verify the real Arabic dot alternate,and strengthen newly added physical-output assertions from substring matching to exact equality. No production parser logic is changed for that mistaken oracle.

Native unit-helper tests initially assumed every display quantization preserves1440twips exactly. Source CHAR/LINE conversion constants and two-digit normalization produce1441;preserve and test that original quantization. A new degree-display test retained a detached DOM input across changing the root component;query the current mounted input instead. No production change is needed for either fixture correction.

Seven existing Chromium specifications keep their geometry/history/selection assertions and now read numeric spin aria-valuenow rather than HTML number.value. Tests for untouched border widgets remain unchanged. Manual production browser acceptance entered1in and25.4mm into real Page Style,accepted and reopened both as2.54cm;actual pointer increment yielded2.64cm with entry focus. Screenshot inspected. The initial dev browser's only initial console error was favicon404;temporary HMR transitions during authored moves are not a production acceptance claim.

Current-slice remaining work is explicit:real Writer module measurement preferences and their Options UI,ruler unit choices,remaining paragraph/tab/border fields,upstream sidebar structure/presentation and existing core/UI/import/export wiring. Display-unit props are actual presentation contracts,not a fabricated global preferences service;existing CM fallback remains until its real owner is connected. Search parent6B984M stays unfinished and lower priority than slice consistency.

This is the seventh completed leaf since9BAAAC when closed. All runs here are related/targeted,not the next full test checkpoint. After NEXT full run,necessary fixes/test additions/coverage and final active-task closure,pause goal immediately and start no further task. Do not mark overall Writer objective complete.
