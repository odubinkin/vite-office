---
id: "202610031739-SP4QJ5"
title: "Restore text-owned numbering notification and destruction policy"
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
  updated_at: "2026-10-03T17:40:18.909Z"
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
    body: "Start: restore text-owned predicates and document destruction suppression for existing numbering operations with owned literal tests and no source/helper artifact storage."
events:
  -
    type: "status"
    at: "2026-10-03T17:40:57.258Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore text-owned predicates and document destruction suppression for existing numbering operations with owned literal tests and no source/helper artifact storage."
doc_version: 3
doc_updated_at: "2026-10-03T17:40:57.258Z"
doc_updated_by: "CODER"
description: "Iteration64: restore SwTextNode-owned IsNotifiable/IsNotificationEnabled and private true-default blocker, delegate real SwNodeNum records to text policy, and add native false-default SwDoc.mbDtor/IsInDtor set before existing document list teardown. Roots/phantoms retain caller-context reading/dtor checks. Owned tests cover defaults, exact APIs, real traversal/blocker and actual Dispose ordering/suppression; broader constructor suppressor/dtor/range/redline/final-class lifetimes remain unverified. No upstream invocation/source-helper artifacts or registered IO/recovery changes."
sections:
  Summary: "Restore native text-owned notification predicates, independent temporary blocker and document destruction policy for existing numbering operations. Local direct reading checks omit ownership and teardown suppression."
  Scope: "Only production SwNumberTree/SwNodeNum.ts,txtnode/ndtxt.ts and doc/doc.ts: add private SwTextNode.m_bNotifiable=true, public zero-argument IsNotifiable/IsNotificationEnabled, private SwDoc.mbDtor=false and public zero-argument IsInDtor; set mbDtor before existing list removals in Dispose. Real SwNodeNum records delegate separately to text-owned predicates; no-text records use required caller document !reading&&!dtor. Add one owned txtnode/numbering-notification-policy.test.ts covering exact types/private fields/defaults,document/text/root predicate branches and order,private diagnostic blocked state,actual retained prefix/traversal and Dispose flag timing/no list notifications/owned detachment. Append narrow evidence to three rows in source-provenance/runtime-inventory. All old test files and literals unchanged. No public blocker/dtor setter,compatibility bridge,native source/helper artifacts or upstream access by tests. Native temporary suppressor class/autoattribute constructor,full destructor/undo/nonshown/range/redline/client/word-count/layout/private-final architecture/browser lifetimes remain separately unverified. Registered save/open/recovery deviations and gates unchanged."
  Plan: "1. Capture fresh pinned declarations/body/default/destruction ordering hashes and add owned baseline notification tests. 2. Restore complete selected text/root notification predicates and native document destruction flag at existing teardown boundary in three production owners. 3. Append narrow evidence to three affected metadata rows; preserve old test assertions,verify tests with vendor absent/restored and run full gates. 4. Commit exact semantic scope,evaluate actual semantic SHA,finish leaf and record wider ownership/destructor/browser audit remains open."
  Verify Steps: |-
    1. Fresh manual pinned declarations/predicate/constructor-default/document destructor flag and node-removal order inspection; store only hashes/conclusions, no source/helper or compiled native probes. Owned baseline tests fail for missing contracts,owner predicate delegation and actual Dispose suppression,then pass final.
    2. Verify public required zero-argument bool contracts/private flag absence,no setters,default false/true,short-circuit reading-before-dtor and blocked-before-enabled,actual text delegation versus foreign context,root/phantom caller policy,raw counters/prefix/topology,selected blocked traversal and real document Dispose ordering/detachment/no numbering callbacks. All prior tests byte-identical; metadata changes only three evidence/justification rows per manifest, no status/default/omission/deviation promotion.
    3. Focused numbering/doc/text-node tests plus boundary/resource tests pass with vendor/libreoffice-reference absent; restore exact pin in finally. Tests never read/compile/invoke upstream. Ignored-inclusive Agentplane tasks/tmp source/helper/executable count remains0.
    4. npm run verify passes all format/lint/type/dependency/resource/static/docs/source/inventory/browser gates and both100% coverage gates. Policy routing,ap doctor,git diff --check and exact scoped review pass. Canonical verification,actual semantic-SHA quality and clean leaf closure; parent/full module/goal remain active.
  Verification: "Pending owned baseline and implementation checks. No native execution or source/helper artifacts. Existing doctor warnings retained without unrelated changes."
  Rollback Plan: "Revert the semantic commit if selected owned notification/destruction policy regresses existing numbering operations. Preserve prior tests/literals and explicit save/open/recovery decisions; do not restore hidden policy ownership or source/helper storage."
  Findings: "Preflight clean main atae825527ec689be8830173b6a55f4f2ad7c60fe9; previous turn PROGRESS,iteration63 DONE not goal completion. Native SwNodeNum.cxx125..150 delegates real text IsNotifiable/IsNotificationEnabled; roots use !rDoc.IsInReading&&!rDoc.IsInDtor. Native ndtxt.hxx declares zero-argument public predicates/private m_bNotifiable; constructor defaults true and IsNotifiable gates enabled through this flag. Native SwDoc.mbDtor defaults false and becomes true before content/node deletion; local Dispose removes owned list items while notification reading policy remains enabled. Native temporary suppressor is a friend helper used in autoattribute constructor; that entire constructor/lifetime is not inferred from diagnostic flag branch tests. Document destruction graph beyond existing local teardown stays unverified."
id_source: "generated"
---
## Summary

Restore native text-owned notification predicates, independent temporary blocker and document destruction policy for existing numbering operations. Local direct reading checks omit ownership and teardown suppression.

## Scope

Only production SwNumberTree/SwNodeNum.ts,txtnode/ndtxt.ts and doc/doc.ts: add private SwTextNode.m_bNotifiable=true, public zero-argument IsNotifiable/IsNotificationEnabled, private SwDoc.mbDtor=false and public zero-argument IsInDtor; set mbDtor before existing list removals in Dispose. Real SwNodeNum records delegate separately to text-owned predicates; no-text records use required caller document !reading&&!dtor. Add one owned txtnode/numbering-notification-policy.test.ts covering exact types/private fields/defaults,document/text/root predicate branches and order,private diagnostic blocked state,actual retained prefix/traversal and Dispose flag timing/no list notifications/owned detachment. Append narrow evidence to three rows in source-provenance/runtime-inventory. All old test files and literals unchanged. No public blocker/dtor setter,compatibility bridge,native source/helper artifacts or upstream access by tests. Native temporary suppressor class/autoattribute constructor,full destructor/undo/nonshown/range/redline/client/word-count/layout/private-final architecture/browser lifetimes remain separately unverified. Registered save/open/recovery deviations and gates unchanged.

## Plan

1. Capture fresh pinned declarations/body/default/destruction ordering hashes and add owned baseline notification tests. 2. Restore complete selected text/root notification predicates and native document destruction flag at existing teardown boundary in three production owners. 3. Append narrow evidence to three affected metadata rows; preserve old test assertions,verify tests with vendor absent/restored and run full gates. 4. Commit exact semantic scope,evaluate actual semantic SHA,finish leaf and record wider ownership/destructor/browser audit remains open.

## Verify Steps

1. Fresh manual pinned declarations/predicate/constructor-default/document destructor flag and node-removal order inspection; store only hashes/conclusions, no source/helper or compiled native probes. Owned baseline tests fail for missing contracts,owner predicate delegation and actual Dispose suppression,then pass final.
2. Verify public required zero-argument bool contracts/private flag absence,no setters,default false/true,short-circuit reading-before-dtor and blocked-before-enabled,actual text delegation versus foreign context,root/phantom caller policy,raw counters/prefix/topology,selected blocked traversal and real document Dispose ordering/detachment/no numbering callbacks. All prior tests byte-identical; metadata changes only three evidence/justification rows per manifest, no status/default/omission/deviation promotion.
3. Focused numbering/doc/text-node tests plus boundary/resource tests pass with vendor/libreoffice-reference absent; restore exact pin in finally. Tests never read/compile/invoke upstream. Ignored-inclusive Agentplane tasks/tmp source/helper/executable count remains0.
4. npm run verify passes all format/lint/type/dependency/resource/static/docs/source/inventory/browser gates and both100% coverage gates. Policy routing,ap doctor,git diff --check and exact scoped review pass. Canonical verification,actual semantic-SHA quality and clean leaf closure; parent/full module/goal remain active.

## Verification

Pending owned baseline and implementation checks. No native execution or source/helper artifacts. Existing doctor warnings retained without unrelated changes.

## Rollback Plan

Revert the semantic commit if selected owned notification/destruction policy regresses existing numbering operations. Preserve prior tests/literals and explicit save/open/recovery decisions; do not restore hidden policy ownership or source/helper storage.

## Findings

Preflight clean main atae825527ec689be8830173b6a55f4f2ad7c60fe9; previous turn PROGRESS,iteration63 DONE not goal completion. Native SwNodeNum.cxx125..150 delegates real text IsNotifiable/IsNotificationEnabled; roots use !rDoc.IsInReading&&!rDoc.IsInDtor. Native ndtxt.hxx declares zero-argument public predicates/private m_bNotifiable; constructor defaults true and IsNotifiable gates enabled through this flag. Native SwDoc.mbDtor defaults false and becomes true before content/node deletion; local Dispose removes owned list items while notification reading policy remains enabled. Native temporary suppressor is a friend helper used in autoattribute constructor; that entire constructor/lifetime is not inferred from diagnostic flag branch tests. Document destruction graph beyond existing local teardown stays unverified.
