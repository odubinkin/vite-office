---
id: "202610010156-ZDTVKE"
title: "Restore native repeated-sublist restart ownership"
status: "DOING"
priority: "med"
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
  updated_at: "2026-10-01T01:58:14.396Z"
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
    body: "Start: restore source-owned repeated-sublist count and pending block restart inheritance,consumption and return under the persistent approved goal."
events:
  -
    type: "status"
    at: "2026-10-01T01:58:14.868Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore source-owned repeated-sublist count and pending block restart inheritance,consumption and return under the persistent approved goal."
doc_version: 3
doc_updated_at: "2026-10-01T01:58:14.868Z"
doc_updated_by: "CODER"
description: "Iteration32: source-owned list item/block contexts retain repeated-sublist count and inherited,consumed,returned block restart state. Preserve intentional save/open/recovery differences."
sections:
  Summary: "Restore source-owned repeated-sublist restart state for existing list imports. Iteration32 under the persistent full upstream goal."
  Scope: "xmloff/source/text/txtparai.ts,txtlists.ts,new XMLTextListBlockContext.ts/XMLTextListItemContext.ts and focused context tests; genuine ODT sublist restart transport tests; provenance/runtime inventory/writer-odt-format.md; task-local native probes. Existing found numbered/bullet rules and nested lists without text:continue-numbering overrides. The override and coupled root continuation identity,unknown-style factories,style overrides,numbered-paragraph and full UNO/helper architecture remain separately unverified. Preserve Worker16,ODF1.3,registered save/open/recovery and unchanged gates."
  Plan: "Move existing inline list block/item contexts into their native source-named owners without compatibility aliases or callback emulation. Retain real block context references in XMLTextListsHelper. Each item counts its child lists; the second/later child passes native restart-at-sublist=true. Block owns a pending restart flag inherited from parent OR the explicit repeated-sublist signal. First paragraph consumes/reset the flag independently of counted state and combines it with any existing explicit item start. Block end propagates any still-pending flag to its parent before popping and clearing the parent item signal. Keep existing found rule/identity resolution unchanged. Compare unmodified primary item child factory,block inheritance/end/getter/reset and paragraph restart consumption excerpts under explicit UNO/token/helper/property adapters; no full native build claim. Assert empty/header/nested-first,explicit zero and ordinary starts,multi-paragraph continuations,sibling item isolation and deeper inheritance. Genuine common/automatic ODT tests verify literal counters,labels,flags,owned copies,Worker16,conditional XML and native reopen omissions. Run unchanged full verify,doctor,routing,diff;record actual code hash,quality and clean state."
  Verify Steps: "Reproduce the existing two-sublist7./7.5./7.6. result without restart. Compile unmodified pinned XMLTextListItemContext::createFastChildContext, XMLTextListBlockContext parent-inheritance/end bodies and IsRestartNumbering/ResetRestartNumbering plus txtimp restart consumption with explicit platform/token/UNO/helper/property shims; compare actual SAX paragraph counted/restart/start/level traces for repeated/empty/third/deep/sibling/header/paragraph-before-and-after-nesting/explicit0 and other start sequences, including parent pending-flag return. Verify moved ownership and no change to unrelated style/list identities. Genuine common/automatic numbered/bullet ODT packages must assert literal text,count,levels,restart/explicit/effective start,number,vectors,labels,independent owned rule/item copies,Worker16,selected restart XML and reopen. Retain native uncounted restart omission rather than inventing lossless unsupported retention. Run npm run verify unchanged with both100% coverage suites and all browser/resource/static/source/provenance/invariant gates;ap doctor,routing validator,git diff --check. Record actual implementation hash,quality review and final clean tracked state. No gate/schema changes or whole-module/full-goal promotion."
  Verification: "Pending implementation and declared checks. No mandatory gate skipped."
  Rollback Plan: "If needed revert scoped implementation through a new executable task, keeping immutable DONE evidence and the full parent goal active."
  Findings: "Preflight clean main/direct,parent202609240501-C9TN6M only active. Persistent user goal authorizes safe local iterations; no network/outside access/delegation. Prior goal turn is progress: childZRYS74 DONE,actual code218b25bd8e27e82ac85819a8436a6bbaae6b58ff,qualityf331a35e39206a2ce491c9f2c69b9b5491f62220,close3836f01a7a3ae60dfc9481353a11b6b5ebad4ac4,parent473f8562a6bd40c4ad786ffd8ed56867286f057d. Native pinlibreoffice-26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. Actual genuine ODT probe of two sublists under one item yields7.,7.5.,7.6. and all restartfalse. Pinned item child factory passes mnSubListCount>1,block constructor inherits parent restart OR this flag,txtimp consumes/reset at first paragraph and block end transfers remaining flag back. These coupled states are absent locally. Native MakeNumRule can clear restart when constructing a new unresolved rule; only existing found styles are in this task. text:continue-numbering overrides also affect root last-processed identities and need a separate complete contract rather than a partial new token. Full list/default/UNO/style/UI obligations remain open."
id_source: "generated"
---
## Summary

Restore source-owned repeated-sublist restart state for existing list imports. Iteration32 under the persistent full upstream goal.

## Scope

xmloff/source/text/txtparai.ts,txtlists.ts,new XMLTextListBlockContext.ts/XMLTextListItemContext.ts and focused context tests; genuine ODT sublist restart transport tests; provenance/runtime inventory/writer-odt-format.md; task-local native probes. Existing found numbered/bullet rules and nested lists without text:continue-numbering overrides. The override and coupled root continuation identity,unknown-style factories,style overrides,numbered-paragraph and full UNO/helper architecture remain separately unverified. Preserve Worker16,ODF1.3,registered save/open/recovery and unchanged gates.

## Plan

Move existing inline list block/item contexts into their native source-named owners without compatibility aliases or callback emulation. Retain real block context references in XMLTextListsHelper. Each item counts its child lists; the second/later child passes native restart-at-sublist=true. Block owns a pending restart flag inherited from parent OR the explicit repeated-sublist signal. First paragraph consumes/reset the flag independently of counted state and combines it with any existing explicit item start. Block end propagates any still-pending flag to its parent before popping and clearing the parent item signal. Keep existing found rule/identity resolution unchanged. Compare unmodified primary item child factory,block inheritance/end/getter/reset and paragraph restart consumption excerpts under explicit UNO/token/helper/property adapters; no full native build claim. Assert empty/header/nested-first,explicit zero and ordinary starts,multi-paragraph continuations,sibling item isolation and deeper inheritance. Genuine common/automatic ODT tests verify literal counters,labels,flags,owned copies,Worker16,conditional XML and native reopen omissions. Run unchanged full verify,doctor,routing,diff;record actual code hash,quality and clean state.

## Verify Steps

Reproduce the existing two-sublist7./7.5./7.6. result without restart. Compile unmodified pinned XMLTextListItemContext::createFastChildContext, XMLTextListBlockContext parent-inheritance/end bodies and IsRestartNumbering/ResetRestartNumbering plus txtimp restart consumption with explicit platform/token/UNO/helper/property shims; compare actual SAX paragraph counted/restart/start/level traces for repeated/empty/third/deep/sibling/header/paragraph-before-and-after-nesting/explicit0 and other start sequences, including parent pending-flag return. Verify moved ownership and no change to unrelated style/list identities. Genuine common/automatic numbered/bullet ODT packages must assert literal text,count,levels,restart/explicit/effective start,number,vectors,labels,independent owned rule/item copies,Worker16,selected restart XML and reopen. Retain native uncounted restart omission rather than inventing lossless unsupported retention. Run npm run verify unchanged with both100% coverage suites and all browser/resource/static/source/provenance/invariant gates;ap doctor,routing validator,git diff --check. Record actual implementation hash,quality review and final clean tracked state. No gate/schema changes or whole-module/full-goal promotion.

## Verification

Pending implementation and declared checks. No mandatory gate skipped.

## Rollback Plan

If needed revert scoped implementation through a new executable task, keeping immutable DONE evidence and the full parent goal active.

## Findings

Preflight clean main/direct,parent202609240501-C9TN6M only active. Persistent user goal authorizes safe local iterations; no network/outside access/delegation. Prior goal turn is progress: childZRYS74 DONE,actual code218b25bd8e27e82ac85819a8436a6bbaae6b58ff,qualityf331a35e39206a2ce491c9f2c69b9b5491f62220,close3836f01a7a3ae60dfc9481353a11b6b5ebad4ac4,parent473f8562a6bd40c4ad786ffd8ed56867286f057d. Native pinlibreoffice-26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. Actual genuine ODT probe of two sublists under one item yields7.,7.5.,7.6. and all restartfalse. Pinned item child factory passes mnSubListCount>1,block constructor inherits parent restart OR this flag,txtimp consumes/reset at first paragraph and block end transfers remaining flag back. These coupled states are absent locally. Native MakeNumRule can clear restart when constructing a new unresolved rule; only existing found styles are in this task. text:continue-numbering overrides also affect root last-processed identities and need a separate complete contract rather than a partial new token. Full list/default/UNO/style/UI obligations remain open.
