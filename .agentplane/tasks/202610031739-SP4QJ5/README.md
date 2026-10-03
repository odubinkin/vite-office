---
id: "202610031739-SP4QJ5"
title: "Restore text-owned numbering notification and destruction policy"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 19
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-03T18:08:37.095Z"
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
  -
    author: "CODER"
    body: "Start: continue approved notification correction with required unchanged helper decomposition to the sole editing consumer; preserve gates,old tests and IO/recovery decisions."
events:
  -
    type: "status"
    at: "2026-10-03T17:40:57.258Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore text-owned predicates and document destruction suppression for existing numbering operations with owned literal tests and no source/helper artifact storage."
  -
    type: "status"
    at: "2026-10-03T18:09:08.452Z"
    author: "CODER"
    from: "DOING"
    to: "DOING"
    note: "Start: continue approved notification correction with required unchanged helper decomposition to the sole editing consumer; preserve gates,old tests and IO/recovery decisions."
doc_version: 3
doc_updated_at: "2026-10-03T18:09:08.452Z"
doc_updated_by: "CODER"
description: "Iteration64: restore SwTextNode-owned IsNotifiable/IsNotificationEnabled and private true-default blocker, delegate real SwNodeNum records to text policy, and add native false-default SwDoc.mbDtor/IsInDtor set before existing document list teardown. Roots/phantoms retain caller-context reading/dtor checks. Owned tests cover defaults, exact APIs, real traversal/blocker and actual Dispose ordering/suppression; broader constructor suppressor/dtor/range/redline/final-class lifetimes remain unverified. No upstream invocation/source-helper artifacts or registered IO/recovery changes."
sections:
  Summary: "Restore native text-owned notification predicates, independent temporary blocker and document destruction policy for existing numbering operations. Local direct reading checks omit ownership and teardown suppression."
  Scope: |-
    Only production SwNumberTree/SwNodeNum.ts,txtnode/ndtxt.ts and doc/doc.ts: add private SwTextNode.m_bNotifiable=true, public zero-argument IsNotifiable/IsNotificationEnabled, private SwDoc.mbDtor=false and public zero-argument IsInDtor; set mbDtor before existing list removals in Dispose. Real SwNodeNum records delegate separately to text-owned predicates; no-text records use required caller document !reading&&!dtor. Add one owned txtnode/numbering-notification-policy.test.ts covering exact types/private fields/defaults,document/text/root predicate branches and order,private diagnostic blocked state,actual retained prefix/traversal and Dispose flag timing/no list notifications/owned detachment. Append narrow evidence to three rows in source-provenance/runtime-inventory. All old test files and literals unchanged. No public blocker/dtor setter,compatibility bridge,native source/helper artifacts or upstream access by tests. Native temporary suppressor class/autoattribute constructor,full destructor/undo/nonshown/range/redline/client/word-count/layout/private-final architecture/browser lifetimes remain separately unverified. Registered save/open/recovery deviations and gates unchanged.

    Necessary refactor under the standing user instruction: add existing uibase/wrtsh/wrtsh-editing.ts to production scope. check:file-size rejects ndtxt.ts at1009 authored lines after required policy methods. Move the three existing grapheme boundary helpers verbatim from ndtxt.ts into their sole editing consumer as private functions; no compatibility re-export or new module. Update ndtxt and editing metadata localSymbols/evidence/responsibility descriptions to actual owners. Final semantic scope is seven paths/four production owners,one owned test,two metadata manifests;four narrowly affected rows each,all prior tests unchanged.
  Plan: |-
    1. Capture fresh pinned declarations/body/default/destruction ordering hashes and add owned baseline notification tests. 2. Restore complete selected text/root notification predicates and native document destruction flag at existing teardown boundary in three production owners. 3. Append narrow evidence to three affected metadata rows; preserve old test assertions,verify tests with vendor absent/restored and run full gates. 4. Commit exact semantic scope,evaluate actual semantic SHA,finish leaf and record wider ownership/destructor/browser audit remains open.

    Before final gates,resolve the discovered hard file-size gate by rehoming unchanged grapheme helper bodies to their only editing caller,then verify exact helper and editing method body integrity. No whitespace compression,threshold relaxation or behavioral rewrite. This local refactor is explicitly authorized by the standing user goal; no external/destructive action or document IO scope expansion.
  Verify Steps: |-
    1. Fresh manual pinned declarations/predicate/constructor-default/document destructor flag and node-removal order inspection; store only hashes/conclusions, no source/helper or compiled native probes. Owned baseline tests fail for missing contracts,owner predicate delegation and actual Dispose suppression,then pass final.
    2. Verify public required zero-argument bool contracts/private flag absence,no setters,default false/true,short-circuit reading-before-dtor and blocked-before-enabled,actual text delegation versus foreign context,root/phantom caller policy,raw counters/prefix/topology,selected blocked traversal and real document Dispose ordering/detachment/no numbering callbacks. All prior tests byte-identical; metadata changes only three evidence/justification rows per manifest, no status/default/omission/deviation promotion.
    3. Focused numbering/doc/text-node tests plus boundary/resource tests pass with vendor/libreoffice-reference absent; restore exact pin in finally. Tests never read/compile/invoke upstream. Ignored-inclusive Agentplane tasks/tmp source/helper/executable count remains0.
    4. npm run verify passes all format/lint/type/dependency/resource/static/docs/source/inventory/browser gates and both100% coverage gates. Policy routing,ap doctor,git diff --check and exact scoped review pass. Canonical verification,actual semantic-SHA quality and clean leaf closure; parent/full module/goal remain active.
    5. Required decomposition leaves ndtxt.ts below1000 authored lines by moving all three unchanged grapheme helper bodies into existing wrtsh-editing.ts. Verify sole-consumer topology,private helper visibility,no re-export,identical existing editing method bodies and232prior test/spec files. Metadata accurately reflects removed core exports and private caller ownership in four rows each with all semantic statuses/defaults/registered divergences preserved. Full gates pass after refactor.
  Verification: "Pending owned baseline and implementation checks. No native execution or source/helper artifacts. Existing doctor warnings retained without unrelated changes."
  Rollback Plan: "Revert the semantic commit if selected owned notification/destruction policy regresses existing numbering operations. Preserve prior tests/literals and explicit save/open/recovery decisions; do not restore hidden policy ownership or source/helper storage."
  Findings: |-
    Preflight clean main atae825527ec689be8830173b6a55f4f2ad7c60fe9; previous turn PROGRESS,iteration63 DONE not goal completion. Native SwNodeNum.cxx125..150 delegates real text IsNotifiable/IsNotificationEnabled; roots use !rDoc.IsInReading&&!rDoc.IsInDtor. Native ndtxt.hxx declares zero-argument public predicates/private m_bNotifiable; constructor defaults true and IsNotifiable gates enabled through this flag. Native SwDoc.mbDtor defaults false and becomes true before content/node deletion; local Dispose removes owned list items while notification reading policy remains enabled. Native temporary suppressor is a friend helper used in autoattribute constructor; that entire constructor/lifetime is not inferred from diagnostic flag branch tests. Document destruction graph beyond existing local teardown stays unverified.

    Verification development: final owned runtime tests passed8/8 and types/lint passed. Initial full and second full npm run verify both passed811application tests but failed unchanged100% statement/branch gates at11049/11050 and8335/8336. Missing HTML annotation was initially misidentified as GetRoot; exact surrounding method inspection identified GetPred no-parent return instead. New teardown test now directly asserts both root predecessor modes and root invalidation no-op,with fresh native guard hashes and no core tree or old test changes. Full verification is rerunning; no skipped/relaxed gate. An initial new fixture expected root invalidation to notify; corrected it to use an attached record for traversal and re-ran baseline8fail. One standalone runtime command used the wrong relative cwd; shell reported missing output directory and did not run the test or create a file. Correct repository-local command passed. No source/helper files are stored.

    Third full verify passed811app/109inventory/20browser,both100% coverage and all gates through docs,but file-size gate rejected ndtxt.ts1009lines. Standing user goal explicitly authorizes necessary refactors. The two grapheme exports and their private enumerator are used solely by existing wrtsh-editing.ts; moving unchanged bodies to that consumer removes unrelated editing adapters from SwTextNode and resolves the real size blocker without gaming line formatting or weakening checks. Scope amended/re-approved through existing user authorization before this additional edit. Wider native grapheme/cursor semantics are not newly certified.
id_source: "generated"
---
## Summary

Restore native text-owned notification predicates, independent temporary blocker and document destruction policy for existing numbering operations. Local direct reading checks omit ownership and teardown suppression.

## Scope

Only production SwNumberTree/SwNodeNum.ts,txtnode/ndtxt.ts and doc/doc.ts: add private SwTextNode.m_bNotifiable=true, public zero-argument IsNotifiable/IsNotificationEnabled, private SwDoc.mbDtor=false and public zero-argument IsInDtor; set mbDtor before existing list removals in Dispose. Real SwNodeNum records delegate separately to text-owned predicates; no-text records use required caller document !reading&&!dtor. Add one owned txtnode/numbering-notification-policy.test.ts covering exact types/private fields/defaults,document/text/root predicate branches and order,private diagnostic blocked state,actual retained prefix/traversal and Dispose flag timing/no list notifications/owned detachment. Append narrow evidence to three rows in source-provenance/runtime-inventory. All old test files and literals unchanged. No public blocker/dtor setter,compatibility bridge,native source/helper artifacts or upstream access by tests. Native temporary suppressor class/autoattribute constructor,full destructor/undo/nonshown/range/redline/client/word-count/layout/private-final architecture/browser lifetimes remain separately unverified. Registered save/open/recovery deviations and gates unchanged.

Necessary refactor under the standing user instruction: add existing uibase/wrtsh/wrtsh-editing.ts to production scope. check:file-size rejects ndtxt.ts at1009 authored lines after required policy methods. Move the three existing grapheme boundary helpers verbatim from ndtxt.ts into their sole editing consumer as private functions; no compatibility re-export or new module. Update ndtxt and editing metadata localSymbols/evidence/responsibility descriptions to actual owners. Final semantic scope is seven paths/four production owners,one owned test,two metadata manifests;four narrowly affected rows each,all prior tests unchanged.

## Plan

1. Capture fresh pinned declarations/body/default/destruction ordering hashes and add owned baseline notification tests. 2. Restore complete selected text/root notification predicates and native document destruction flag at existing teardown boundary in three production owners. 3. Append narrow evidence to three affected metadata rows; preserve old test assertions,verify tests with vendor absent/restored and run full gates. 4. Commit exact semantic scope,evaluate actual semantic SHA,finish leaf and record wider ownership/destructor/browser audit remains open.

Before final gates,resolve the discovered hard file-size gate by rehoming unchanged grapheme helper bodies to their only editing caller,then verify exact helper and editing method body integrity. No whitespace compression,threshold relaxation or behavioral rewrite. This local refactor is explicitly authorized by the standing user goal; no external/destructive action or document IO scope expansion.

## Verify Steps

1. Fresh manual pinned declarations/predicate/constructor-default/document destructor flag and node-removal order inspection; store only hashes/conclusions, no source/helper or compiled native probes. Owned baseline tests fail for missing contracts,owner predicate delegation and actual Dispose suppression,then pass final.
2. Verify public required zero-argument bool contracts/private flag absence,no setters,default false/true,short-circuit reading-before-dtor and blocked-before-enabled,actual text delegation versus foreign context,root/phantom caller policy,raw counters/prefix/topology,selected blocked traversal and real document Dispose ordering/detachment/no numbering callbacks. All prior tests byte-identical; metadata changes only three evidence/justification rows per manifest, no status/default/omission/deviation promotion.
3. Focused numbering/doc/text-node tests plus boundary/resource tests pass with vendor/libreoffice-reference absent; restore exact pin in finally. Tests never read/compile/invoke upstream. Ignored-inclusive Agentplane tasks/tmp source/helper/executable count remains0.
4. npm run verify passes all format/lint/type/dependency/resource/static/docs/source/inventory/browser gates and both100% coverage gates. Policy routing,ap doctor,git diff --check and exact scoped review pass. Canonical verification,actual semantic-SHA quality and clean leaf closure; parent/full module/goal remain active.
5. Required decomposition leaves ndtxt.ts below1000 authored lines by moving all three unchanged grapheme helper bodies into existing wrtsh-editing.ts. Verify sole-consumer topology,private helper visibility,no re-export,identical existing editing method bodies and232prior test/spec files. Metadata accurately reflects removed core exports and private caller ownership in four rows each with all semantic statuses/defaults/registered divergences preserved. Full gates pass after refactor.

## Verification

Pending owned baseline and implementation checks. No native execution or source/helper artifacts. Existing doctor warnings retained without unrelated changes.

## Rollback Plan

Revert the semantic commit if selected owned notification/destruction policy regresses existing numbering operations. Preserve prior tests/literals and explicit save/open/recovery decisions; do not restore hidden policy ownership or source/helper storage.

## Findings

Preflight clean main atae825527ec689be8830173b6a55f4f2ad7c60fe9; previous turn PROGRESS,iteration63 DONE not goal completion. Native SwNodeNum.cxx125..150 delegates real text IsNotifiable/IsNotificationEnabled; roots use !rDoc.IsInReading&&!rDoc.IsInDtor. Native ndtxt.hxx declares zero-argument public predicates/private m_bNotifiable; constructor defaults true and IsNotifiable gates enabled through this flag. Native SwDoc.mbDtor defaults false and becomes true before content/node deletion; local Dispose removes owned list items while notification reading policy remains enabled. Native temporary suppressor is a friend helper used in autoattribute constructor; that entire constructor/lifetime is not inferred from diagnostic flag branch tests. Document destruction graph beyond existing local teardown stays unverified.

Verification development: final owned runtime tests passed8/8 and types/lint passed. Initial full and second full npm run verify both passed811application tests but failed unchanged100% statement/branch gates at11049/11050 and8335/8336. Missing HTML annotation was initially misidentified as GetRoot; exact surrounding method inspection identified GetPred no-parent return instead. New teardown test now directly asserts both root predecessor modes and root invalidation no-op,with fresh native guard hashes and no core tree or old test changes. Full verification is rerunning; no skipped/relaxed gate. An initial new fixture expected root invalidation to notify; corrected it to use an attached record for traversal and re-ran baseline8fail. One standalone runtime command used the wrong relative cwd; shell reported missing output directory and did not run the test or create a file. Correct repository-local command passed. No source/helper files are stored.

Third full verify passed811app/109inventory/20browser,both100% coverage and all gates through docs,but file-size gate rejected ndtxt.ts1009lines. Standing user goal explicitly authorizes necessary refactors. The two grapheme exports and their private enumerator are used solely by existing wrtsh-editing.ts; moving unchanged bodies to that consumer removes unrelated editing adapters from SwTextNode and resolves the real size blocker without gaming line formatting or weakening checks. Scope amended/re-approved through existing user authorization before this additional edit. Wider native grapheme/cursor semantics are not newly certified.
