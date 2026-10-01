---
id: "202610010156-ZDTVKE"
title: "Restore native repeated-sublist restart ownership"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 18
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
doc_updated_at: "2026-10-01T02:32:56.550Z"
doc_updated_by: "CODER"
description: "Iteration32: source-owned list item/block contexts retain repeated-sublist count and inherited,consumed,returned block restart state. Preserve intentional save/open/recovery differences."
sections:
  Summary: "Restore source-owned repeated-sublist restart state for existing list imports. Iteration32 under the persistent full upstream goal."
  Scope: "xmloff/source/text/txtparai.ts,txtlists.ts,new XMLTextListBlockContext.ts/XMLTextListItemContext.ts and focused context tests; genuine ODT sublist restart transport tests; provenance/runtime inventory/writer-odt-format.md; task-local native probes. Existing found numbered/bullet rules and nested lists without text:continue-numbering overrides. The override and coupled root continuation identity,unknown-style factories,style overrides,numbered-paragraph and full UNO/helper architecture remain separately unverified. Preserve Worker16,ODF1.3,registered save/open/recovery and unchanged gates."
  Plan: "Move existing inline list block/item contexts into their native source-named owners without compatibility aliases or callback emulation. Retain real block context references in XMLTextListsHelper. Each item counts its child lists; the second/later child passes native restart-at-sublist=true. Block owns a pending restart flag inherited from parent OR the explicit repeated-sublist signal. First paragraph consumes/reset the flag independently of counted state and combines it with any existing explicit item start. Block end propagates any still-pending flag to its parent before popping and clearing the parent item signal. Keep existing found rule/identity resolution unchanged. Compare unmodified primary item child factory,block inheritance/end/getter/reset and paragraph restart consumption excerpts under explicit UNO/token/helper/property adapters; no full native build claim. Assert empty/header/nested-first,explicit zero and ordinary starts,multi-paragraph continuations,sibling item isolation and deeper inheritance. Genuine common/automatic ODT tests verify literal counters,labels,flags,owned copies,Worker16,conditional XML and native reopen omissions. Run unchanged full verify,doctor,routing,diff;record actual code hash,quality and clean state."
  Verify Steps: "Reproduce the existing two-sublist7./7.5./7.6. result without restart. Compile unmodified pinned XMLTextListItemContext::createFastChildContext, XMLTextListBlockContext parent-inheritance/end bodies and IsRestartNumbering/ResetRestartNumbering plus txtimp restart consumption with explicit platform/token/UNO/helper/property shims; compare actual SAX paragraph counted/restart/start/level traces for repeated/empty/third/deep/sibling/header/paragraph-before-and-after-nesting/explicit0 and other start sequences, including parent pending-flag return. Verify moved ownership and no change to unrelated style/list identities. Genuine common/automatic numbered/bullet ODT packages must assert literal text,count,levels,restart/explicit/effective start,number,vectors,labels,independent owned rule/item copies,Worker16,selected restart XML and reopen. Retain native uncounted restart omission rather than inventing lossless unsupported retention. Run npm run verify unchanged with both100% coverage suites and all browser/resource/static/source/provenance/invariant gates;ap doctor,routing validator,git diff --check. Record actual implementation hash,quality review and final clean tracked state. No gate/schema changes or whole-module/full-goal promotion."
  Verification: "Pending implementation and declared checks. No mandatory gate skipped."
  Rollback Plan: "If needed revert scoped implementation through a new executable task, keeping immutable DONE evidence and the full parent goal active."
  Findings: |-
    Preflight clean main/direct,parent202609240501-C9TN6M only active. Persistent user goal authorizes safe local iterations; no network/outside access/delegation. Prior goal turn is progress: childZRYS74 DONE,actual code218b25bd8e27e82ac85819a8436a6bbaae6b58ff,qualityf331a35e39206a2ce491c9f2c69b9b5491f62220,close3836f01a7a3ae60dfc9481353a11b6b5ebad4ac4,parent473f8562a6bd40c4ad786ffd8ed56867286f057d. Native pinlibreoffice-26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. Actual genuine ODT probe of two sublists under one item yields7.,7.5.,7.6. and all restartfalse. Pinned item child factory passes mnSubListCount>1,block constructor inherits parent restart OR this flag,txtimp consumes/reset at first paragraph and block end transfers remaining flag back. These coupled states are absent locally. Native MakeNumRule can clear restart when constructing a new unresolved rule; only existing found styles are in this task. text:continue-numbering overrides also affect root last-processed identities and need a separate complete contract rather than a partial new token. Full list/default/UNO/style/UI obligations remain open.

    - Observation: Native harness compile exits1: the extracted parent-inheritance snippet needs its native sParentListStyleName local,and token shims lacked XML_ aliases used by the unmodified child factory.
      Impact: Only harness adapters fail; no differential result is established yet.
      Resolution: Supply the native local and matching token aliases outside primary bodies,persist active artifacts and rerun unchanged evidence contract.

    - Observation: Focused test command used a nonexistent apps/office/vitest.config.ts and failed before executing tests; an initial read also used nonexistent root tests directory.
      Impact: No runtime evidence was produced by those path assumptions.
      Resolution: Recompute route, locate repository configuration and rerun the existing Vite-config test command without changing gates.

    - Observation: Native import comparison passes1536 trees/10752 paragraph states. Genuine ODT transport test passes32 numbered/bullet common/automatic packages with literal flags,starts,counters,labels,owned copies and Worker16. Newly public source-owned block/helper references have a direct ownership assertion.
      Impact: Repeated sublists now restart and inherited flags are consumed or returned according to the bounded primary excerpts. No full native/UNO/helper build or whole-module parity claim.
      Resolution: Retain native uncounted restart omission. Current export canonicalizes counted implicit restart to explicit start; pinned txtparae.cxx1262..1284 instead closes/reopens same-level nested lists when restart has no direct start. Record this distinct export obligation for the next task without widening the approved import correction.

    - Observation: Full verify session73105 terminal exit1 after650 application tests with100% coverage. Inventory suite108/109 passes; CAP evidence still points to TEXT_START_VALUE in txtparai.ts after item ownership moved, so strict marker validation correctly fails.
      Impact: Runtime tests pass but complete verification is not established; the source evidence reference must follow its relocated owner.
      Resolution: Preserve failed terminal log and route-required artifacts; relocate only the existing writer-command-slice.json implementation evidence path to XMLTextListItemContext.ts as part of approved source ownership/provenance maintenance. Keep assertion,marker,schemas,gates and acceptance criteria unchanged; rerun full verify.

    - Observation: Second full verify session93645 terminal exit1:650 application tests still100%; inventory108/109 fails because the two new runtime module entries were appended instead of lexicographically ordered.
      Impact: All relocated source markers now resolve; strict manifest ordering prevents complete verification. The previous commentary inferred a second stale marker before the terminal report; actual cause is ordering.
      Resolution: Preserve terminal evidence,sort only existing runtime modules by path and provenance entries by localPath under the current schema,run focused parity CLI/provenance validation before the third unchanged full verify. No runtime,gate or acceptance changes.

    - Observation: Additional primary-header audit finds mnSubListCount is sal_Int16, while the first probe adapter/local counter used unbounded/int count. Compiled unmodified item child factory with the actual signed16 field matches9 boundary states across65538 child lists;32768 narrows negative and65538 returns to2.
      Impact: The current bounded1536-tree comparison remains valid, but the implementation needs native signed16 assignment narrowing for large documents within the existing1,000,000-element parser ceiling.
      Resolution: Keep this within the approved per-item count correction. Wait for current verify terminal without changing live runtime inputs; then narrow the counter,add actual-context boundary test,correct the native adapter field and rerun final unchanged verification. No broader native overflow policy claim.

    - Observation: Final-count verify session51727 terminal exit1 after651 app/109 inventory tests,both100%. Browser18/19 passes; mobile resize test at responsive-sidebar.spec.ts58 sees html intercept Paragraph click then the menu item detaches; snapshot shows Styles open although Format was clicked. Earlier unchanged-browser full verify36986 passed19/19.
      Impact: Complete mandatory verification is not established; this may be an intermittent existing menu/resize issue but its cause is not yet proven. No browser implementation changed in this task.
      Resolution: Preserve failed terminal log,trace,screenshot/context in active task;run3 isolated repetitions of the existing mobile test without weakening assertions,timeouts,retries or config. If it passes,run unchanged full verify again; a reproduced defect must be handled as a separate correction under the goal.
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

- Observation: Native harness compile exits1: the extracted parent-inheritance snippet needs its native sParentListStyleName local,and token shims lacked XML_ aliases used by the unmodified child factory.
  Impact: Only harness adapters fail; no differential result is established yet.
  Resolution: Supply the native local and matching token aliases outside primary bodies,persist active artifacts and rerun unchanged evidence contract.

- Observation: Focused test command used a nonexistent apps/office/vitest.config.ts and failed before executing tests; an initial read also used nonexistent root tests directory.
  Impact: No runtime evidence was produced by those path assumptions.
  Resolution: Recompute route, locate repository configuration and rerun the existing Vite-config test command without changing gates.

- Observation: Native import comparison passes1536 trees/10752 paragraph states. Genuine ODT transport test passes32 numbered/bullet common/automatic packages with literal flags,starts,counters,labels,owned copies and Worker16. Newly public source-owned block/helper references have a direct ownership assertion.
  Impact: Repeated sublists now restart and inherited flags are consumed or returned according to the bounded primary excerpts. No full native/UNO/helper build or whole-module parity claim.
  Resolution: Retain native uncounted restart omission. Current export canonicalizes counted implicit restart to explicit start; pinned txtparae.cxx1262..1284 instead closes/reopens same-level nested lists when restart has no direct start. Record this distinct export obligation for the next task without widening the approved import correction.

- Observation: Full verify session73105 terminal exit1 after650 application tests with100% coverage. Inventory suite108/109 passes; CAP evidence still points to TEXT_START_VALUE in txtparai.ts after item ownership moved, so strict marker validation correctly fails.
  Impact: Runtime tests pass but complete verification is not established; the source evidence reference must follow its relocated owner.
  Resolution: Preserve failed terminal log and route-required artifacts; relocate only the existing writer-command-slice.json implementation evidence path to XMLTextListItemContext.ts as part of approved source ownership/provenance maintenance. Keep assertion,marker,schemas,gates and acceptance criteria unchanged; rerun full verify.

- Observation: Second full verify session93645 terminal exit1:650 application tests still100%; inventory108/109 fails because the two new runtime module entries were appended instead of lexicographically ordered.
  Impact: All relocated source markers now resolve; strict manifest ordering prevents complete verification. The previous commentary inferred a second stale marker before the terminal report; actual cause is ordering.
  Resolution: Preserve terminal evidence,sort only existing runtime modules by path and provenance entries by localPath under the current schema,run focused parity CLI/provenance validation before the third unchanged full verify. No runtime,gate or acceptance changes.

- Observation: Additional primary-header audit finds mnSubListCount is sal_Int16, while the first probe adapter/local counter used unbounded/int count. Compiled unmodified item child factory with the actual signed16 field matches9 boundary states across65538 child lists;32768 narrows negative and65538 returns to2.
  Impact: The current bounded1536-tree comparison remains valid, but the implementation needs native signed16 assignment narrowing for large documents within the existing1,000,000-element parser ceiling.
  Resolution: Keep this within the approved per-item count correction. Wait for current verify terminal without changing live runtime inputs; then narrow the counter,add actual-context boundary test,correct the native adapter field and rerun final unchanged verification. No broader native overflow policy claim.

- Observation: Final-count verify session51727 terminal exit1 after651 app/109 inventory tests,both100%. Browser18/19 passes; mobile resize test at responsive-sidebar.spec.ts58 sees html intercept Paragraph click then the menu item detaches; snapshot shows Styles open although Format was clicked. Earlier unchanged-browser full verify36986 passed19/19.
  Impact: Complete mandatory verification is not established; this may be an intermittent existing menu/resize issue but its cause is not yet proven. No browser implementation changed in this task.
  Resolution: Preserve failed terminal log,trace,screenshot/context in active task;run3 isolated repetitions of the existing mobile test without weakening assertions,timeouts,retries or config. If it passes,run unchanged full verify again; a reproduced defect must be handled as a separate correction under the goal.
