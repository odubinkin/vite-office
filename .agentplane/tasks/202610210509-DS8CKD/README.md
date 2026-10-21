---
id: "202610210509-DS8CKD"
title: "Connect native metric entry to Writer dimension dialogs"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-21T05:10:12.023Z"
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
doc_updated_at: "2026-10-21T05:10:26.098Z"
doc_updated_by: "CODER"
description: "Prioritize existing Writer slice consistency:replace hardcoded centimetre numeric inputs in page,table,column,row-height and line-number dialogs with shared browser presentation of actual MetricSpinButton/parser;support explicit unit suffixes,locale decimals,defined ranges and physical-value preservation through ODT. No deeper locale services or invented settings facade."
sections:
  Summary: "Connect existing native metric parsing/conversion to current Writer dimension dialogs;preserve physical document values and source owner policies."
  Scope: "Writer branch/checkout only;up to35 non-task paths.Shared browser MetricSpinButton presentation plus page/table/columns/row-height/line-numbering integration,explicit display-unit props,focused tests/ODT and Chromium evidence,conservative registry records.No new locale services,global preference facade,sidebar redesign,search expansion,network or external writes.Existing centimetre default remains until actual module configuration is connected;typed native unit suffixes work now."
  Plan: "Implement shared unit-aware text/spin input over actual MetricSpinButton and locale decimal fields;replace five hardcoded centimetre ingress paths,retain exact twip values unless edited and existing table policy handlers/ranges;verify unit suffixes,signed values,bounds,empty/invalid editing,steps,source-owned linked columns,Cancel/Undo and ODT reopen.Targeted seventh leaf since9BAAAC;no full run now.Prioritize settings/paragraph/sidebar and existing core/UI/IO consistency next;pause goal after next full-run repairs/coverage and active-task closure."
  Verify Steps: "Inspect pinned VCL MetricSpinButton/field and four Writer dialog sources.Run new shared widget and changed Writer dialog/table-column/native row/line/page tests plus actual ODT roundtrip and mounted view regression;strict100 coverage on new widget using native parser.Owner dialog coverage gaps must be recorded,not hidden.Run Chromium actual metric entry integration,typecheck/static build,scoped ESLint/Prettier,dependencies/provenance,writer/shared inventories,docs/tree/size,doctor/routing,diff/status.Record retained failures and fixes;no gate/assertion/timeout weakening.No full suite before tenth leaf;stop rule after NEXT full-run task closure remains."
  Verification: "Pending declared source-backed implementation and targeted evidence."
  Rollback Plan: "Revert intentional leaf source/test/registry commits on writer only;preserve completed search prerequisites and intentional save/open/recovery deviations."
  Findings: "Previous goal turn made progress:45MPFV closed and user priority correction persisted in6B984M. Clean writer preflight;direct workflow;no nested AGENTS or user-instructions. Existing MetricSpinButton and unit aliases/parser own conversion. Number inputs currently reject native suffixes and duplicate centimetre formulas.Global Writer preference/UI and paragraph/sidebar consistency remain explicit follow-up;do not fabricate native services."
id_source: "generated"
---
## Summary

Connect existing native metric parsing/conversion to current Writer dimension dialogs;preserve physical document values and source owner policies.

## Scope

Writer branch/checkout only;up to35 non-task paths.Shared browser MetricSpinButton presentation plus page/table/columns/row-height/line-numbering integration,explicit display-unit props,focused tests/ODT and Chromium evidence,conservative registry records.No new locale services,global preference facade,sidebar redesign,search expansion,network or external writes.Existing centimetre default remains until actual module configuration is connected;typed native unit suffixes work now.

## Plan

Implement shared unit-aware text/spin input over actual MetricSpinButton and locale decimal fields;replace five hardcoded centimetre ingress paths,retain exact twip values unless edited and existing table policy handlers/ranges;verify unit suffixes,signed values,bounds,empty/invalid editing,steps,source-owned linked columns,Cancel/Undo and ODT reopen.Targeted seventh leaf since9BAAAC;no full run now.Prioritize settings/paragraph/sidebar and existing core/UI/IO consistency next;pause goal after next full-run repairs/coverage and active-task closure.

## Verify Steps

Inspect pinned VCL MetricSpinButton/field and four Writer dialog sources.Run new shared widget and changed Writer dialog/table-column/native row/line/page tests plus actual ODT roundtrip and mounted view regression;strict100 coverage on new widget using native parser.Owner dialog coverage gaps must be recorded,not hidden.Run Chromium actual metric entry integration,typecheck/static build,scoped ESLint/Prettier,dependencies/provenance,writer/shared inventories,docs/tree/size,doctor/routing,diff/status.Record retained failures and fixes;no gate/assertion/timeout weakening.No full suite before tenth leaf;stop rule after NEXT full-run task closure remains.

## Verification

Pending declared source-backed implementation and targeted evidence.

## Rollback Plan

Revert intentional leaf source/test/registry commits on writer only;preserve completed search prerequisites and intentional save/open/recovery deviations.

## Findings

Previous goal turn made progress:45MPFV closed and user priority correction persisted in6B984M. Clean writer preflight;direct workflow;no nested AGENTS or user-instructions. Existing MetricSpinButton and unit aliases/parser own conversion. Number inputs currently reject native suffixes and duplicate centimetre formulas.Global Writer preference/UI and paragraph/sidebar consistency remain explicit follow-up;do not fabricate native services.
