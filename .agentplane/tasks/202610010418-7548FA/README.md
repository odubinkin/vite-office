---
id: "202610010418-7548FA"
title: "Retain native list trees across item mutations"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 15
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-01T04:31:11.198Z"
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
    body: "Start: approved iterative parity goal;retain source-shaped supported list roots and item transitions,prefix validation;preserve IO exceptions and all gates."
events:
  -
    type: "status"
    at: "2026-10-01T04:19:59.297Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: approved iterative parity goal;retain source-shaped supported list roots and item transitions,prefix validation;preserve IO exceptions and all gates."
doc_version: 3
doc_updated_at: "2026-10-01T04:33:36.703Z"
doc_updated_by: "CODER"
description: "Iteration35 of approved parity goal: replace deferred SwList reconstruction with retained single supported range roots,source-shaped insertion/removal/level transitions and validating counter reads. Preserve registered document IO deviations and all verification gates."
sections:
  Summary: "Iteration35 of the user-authorized persistent parity goal. Retain SwList roots and registered SwNodeNum objects across supported body-range item transitions; remove deferred topology reconstruction and make counter reads validate native prefixes."
  Scope: "Runtime: sw/source/core/doc/list.ts,DocumentListsManager.ts,SwNumberTree/SwNumberTree.ts,SwNumberTree/SwNodeNum.ts,docnode/nodes.ts,txtnode/ndtxt.ts. Tests:list.test.ts,list-invariants.test.ts,number.test.ts,SwNumberTree.test.ts,SwNumberTree-phantoms.test.ts and new SwNumberTree-lifecycle.test.ts. Bounded provenance/runtime-inventory updates and task-local baseline/native probes. Remove source-stale insertion-level cache/constructor parameter at the same retained-object transition boundary. Existing single body-range hierarchical Arabic/bullet slice; no redline/additional-range/continuous numbering or full native notification/lifetime claim. Preserve registered save/open/recovery deviations,Worker16,ODF1.3 and gates. No status/default/module/whole-goal promotion."
  Plan: "1. Record pre-edit direct-read/topology/identity failure. 2. Compile unmodified pinned list/tree transition bodies. 3. Port retained root/incremental registration/removal/level changes,prefix validation and canonical move registration;remove unused ordering and insertion-level cache/constructor contracts including SwNodeNum call sites. 4. Verify source-derived lifecycle/document evidence and bounded provenance. 5. Run focused checks then full unchanged verify,record quality and real code hash,finish only child and update parent. Owner CODER;single correction;safe constructor refactor included under user persistent goal authorization;IO exceptions preserved."
  Verify Steps: "Run actual pre-edit baseline for unattached registered records,empty direct vectors and replaced root/item identities. Compile unchanged pinned AddChild,RemoveChild,RemoveMe,MoveChildren,SetLevelInListTree,GetNumber,GetNumberVector_,IsValid,Validate,ValidateHierarchical,SetLastValid/InvalidateTree and SwList insertion/removal/validation ownership methods with explicit bounded range/text/rule/container/notification adapters. Compare actual document/list/tree objects across shuffled insertion,skipped phantom levels,removal/reinsert,level changes,zero/nonzero starts,restart/count changes and immediate reads;capture literal topology,object identity,counters/vectors/labels. Cover canonical document move/remove/copy/undo and existing genuine ODT/Worker tests. Focused tests,lint,typecheck,docs,provenance/parity before unchanged npm run verify;both coverage suites100%,all browser/resource/static/source/provenance/invariant gates. Doctor,routing,diff,evaluator,actual code SHA and final clean status required. No skipped/relaxed gates or broad metadata promotion."
  Verification: "Pending owner execution; no successful verification inferred from previous iteration."
  Rollback Plan: "Revert only the task implementation commit if this bounded lifecycle change fails; preserve task evidence and previous DONE artifacts. No destructive history actions."
  Findings: |-
    Read-only startup: main/direct,clean checkout,parent C9TN6M only active before childcreation;no user-instructions. Native SwList creates roots at construction,AddChild at insertion and RemoveMe at removal;local SwList currently replaces records and reconstructs topology at validation. Existing native prefix validation and descendant-move algorithms can support this correction without rebuilding. One read-only combined search returned1 because DocumentStateManager has no GetNumRule/SwDoc/GetNodes matches;actual file subsequently read,no mutation or assumption from empty search. Persistent user goal authorizes this safe in-repo correction and local lifecycle;network/outside access remains prohibited.

    - Observation: Pre-edit baseline confirms direct vector empty/number0,unattached registered records and replaced item/root after level change. Initial differential failed case48 because old probe disabled insertion invalidation;source IsNotificationEnabled evidence required normal true mode and full unchanged Invalidate/InvalidateMe. Revised37native definitions compare216sequences/9168states. Initial focused commands used guessed vitest.config and then wrong working directory;no tests executed. Typecheck found newly unused document destructure after removing obsolete ordering argument.
      Impact: Failures were bounded source/probe/command issues in the approved contract,not successful evidence;native disabled notification delivery remains explicit.
      Resolution: Enabled native insertion invalidation,ported native prefix invalidation,recomputed route,located actual vite.config and reran from apps/office. Remove unused destructure when confirmed by typecheck;retain literal tests/gates.

    - Observation: Expanded37-definition native probe passes864sequences/73056states. Focused tests initially exposed old assertions that direct counter should remain0 and cached insertion level changes by object replacement;source validating getter and derived-level contracts now require2/current tree level. Lint rejected non-null assertions and an unused constructor level. Strong fixture-presence helper replaces assertions;approved same-goal scope includes SwNodeNum and phantom constructor call sites;removed stale level cache/constructor and obsolete ResetTree.
      Impact: Retained items expose stale constructor metadata that deferred object replacement had hidden. Existing counter/vector literal assertions remain intact except source-stale direct-read0 expectation;phantom depth assertions now use independent supplied levels.
      Resolution: Removed unused ordering/constructor/rebuild contracts and use source-derived GetLevelInListTree. Focused43tests/9files and typecheck7031 now pass;all required gates remain unchanged. Full callback/redline/continuous/native ownership architecture remains separately unverified.
id_source: "generated"
---
## Summary

Iteration35 of the user-authorized persistent parity goal. Retain SwList roots and registered SwNodeNum objects across supported body-range item transitions; remove deferred topology reconstruction and make counter reads validate native prefixes.

## Scope

Runtime: sw/source/core/doc/list.ts,DocumentListsManager.ts,SwNumberTree/SwNumberTree.ts,SwNumberTree/SwNodeNum.ts,docnode/nodes.ts,txtnode/ndtxt.ts. Tests:list.test.ts,list-invariants.test.ts,number.test.ts,SwNumberTree.test.ts,SwNumberTree-phantoms.test.ts and new SwNumberTree-lifecycle.test.ts. Bounded provenance/runtime-inventory updates and task-local baseline/native probes. Remove source-stale insertion-level cache/constructor parameter at the same retained-object transition boundary. Existing single body-range hierarchical Arabic/bullet slice; no redline/additional-range/continuous numbering or full native notification/lifetime claim. Preserve registered save/open/recovery deviations,Worker16,ODF1.3 and gates. No status/default/module/whole-goal promotion.

## Plan

1. Record pre-edit direct-read/topology/identity failure. 2. Compile unmodified pinned list/tree transition bodies. 3. Port retained root/incremental registration/removal/level changes,prefix validation and canonical move registration;remove unused ordering and insertion-level cache/constructor contracts including SwNodeNum call sites. 4. Verify source-derived lifecycle/document evidence and bounded provenance. 5. Run focused checks then full unchanged verify,record quality and real code hash,finish only child and update parent. Owner CODER;single correction;safe constructor refactor included under user persistent goal authorization;IO exceptions preserved.

## Verify Steps

Run actual pre-edit baseline for unattached registered records,empty direct vectors and replaced root/item identities. Compile unchanged pinned AddChild,RemoveChild,RemoveMe,MoveChildren,SetLevelInListTree,GetNumber,GetNumberVector_,IsValid,Validate,ValidateHierarchical,SetLastValid/InvalidateTree and SwList insertion/removal/validation ownership methods with explicit bounded range/text/rule/container/notification adapters. Compare actual document/list/tree objects across shuffled insertion,skipped phantom levels,removal/reinsert,level changes,zero/nonzero starts,restart/count changes and immediate reads;capture literal topology,object identity,counters/vectors/labels. Cover canonical document move/remove/copy/undo and existing genuine ODT/Worker tests. Focused tests,lint,typecheck,docs,provenance/parity before unchanged npm run verify;both coverage suites100%,all browser/resource/static/source/provenance/invariant gates. Doctor,routing,diff,evaluator,actual code SHA and final clean status required. No skipped/relaxed gates or broad metadata promotion.

## Verification

Pending owner execution; no successful verification inferred from previous iteration.

## Rollback Plan

Revert only the task implementation commit if this bounded lifecycle change fails; preserve task evidence and previous DONE artifacts. No destructive history actions.

## Findings

Read-only startup: main/direct,clean checkout,parent C9TN6M only active before childcreation;no user-instructions. Native SwList creates roots at construction,AddChild at insertion and RemoveMe at removal;local SwList currently replaces records and reconstructs topology at validation. Existing native prefix validation and descendant-move algorithms can support this correction without rebuilding. One read-only combined search returned1 because DocumentStateManager has no GetNumRule/SwDoc/GetNodes matches;actual file subsequently read,no mutation or assumption from empty search. Persistent user goal authorizes this safe in-repo correction and local lifecycle;network/outside access remains prohibited.

- Observation: Pre-edit baseline confirms direct vector empty/number0,unattached registered records and replaced item/root after level change. Initial differential failed case48 because old probe disabled insertion invalidation;source IsNotificationEnabled evidence required normal true mode and full unchanged Invalidate/InvalidateMe. Revised37native definitions compare216sequences/9168states. Initial focused commands used guessed vitest.config and then wrong working directory;no tests executed. Typecheck found newly unused document destructure after removing obsolete ordering argument.
  Impact: Failures were bounded source/probe/command issues in the approved contract,not successful evidence;native disabled notification delivery remains explicit.
  Resolution: Enabled native insertion invalidation,ported native prefix invalidation,recomputed route,located actual vite.config and reran from apps/office. Remove unused destructure when confirmed by typecheck;retain literal tests/gates.

- Observation: Expanded37-definition native probe passes864sequences/73056states. Focused tests initially exposed old assertions that direct counter should remain0 and cached insertion level changes by object replacement;source validating getter and derived-level contracts now require2/current tree level. Lint rejected non-null assertions and an unused constructor level. Strong fixture-presence helper replaces assertions;approved same-goal scope includes SwNodeNum and phantom constructor call sites;removed stale level cache/constructor and obsolete ResetTree.
  Impact: Retained items expose stale constructor metadata that deferred object replacement had hidden. Existing counter/vector literal assertions remain intact except source-stale direct-read0 expectation;phantom depth assertions now use independent supplied levels.
  Resolution: Removed unused ordering/constructor/rebuild contracts and use source-derived GetLevelInListTree. Focused43tests/9files and typecheck7031 now pass;all required gates remain unchanged. Full callback/redline/continuous/native ownership architecture remains separately unverified.
