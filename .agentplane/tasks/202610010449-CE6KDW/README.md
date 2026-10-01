---
id: "202610010449-CE6KDW"
title: "Restore node-owned Writer numbering lifecycle"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 13
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-01T04:50:24.532Z"
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
    body: "Start: approved persistent parity goal;restore shown text-node numbering ownership,rule/document registration and native lazy getters;preserve document IO exceptions and gates."
events:
  -
    type: "status"
    at: "2026-10-01T04:50:25.210Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: approved persistent parity goal;restore shown text-node numbering ownership,rule/document registration and native lazy getters;preserve document IO exceptions and gates."
doc_version: 3
doc_updated_at: "2026-10-01T05:10:11.899Z"
doc_updated_by: "CODER"
description: "Iteration36 of approved persistent parity goal:SwTextNode owns shown SwNodeNum with native AddToList/RemoveFromList/GetNum/vector contracts,SwNodeNum rule/document registration hooks and non-owning SwList topology. Remove full-list read validation and ownership wrappers;preserve registered document IO exceptions and unchanged gates."
sections:
  Summary: "Iteration36 of the user-authorized parity goal:restore shown SwTextNode numbering ownership,typed lifecycle and lazy reads with rule/document registrations;remove SwList item allocation/map ownership and generic registration wrappers."
  Scope: "Runtime:sw/source/core/txtnode/ndtxt.ts,SwNumberTree/SwNodeNum.ts,SwNumberTree.ts,doc/list.ts,number.ts,doc.ts,DocumentListsManager.ts,new DocumentListItemsManager.ts,docnode/nodes.ts;sw/browser/filter/xml/writer-document-codec.ts and sw/source/filter/xml/xmlimp.ts registration call sites. Tests:new node-numbering-lifecycle.test.ts,new DocumentListItemsManager.test.ts,existing ndtxt/doc/list/list-invariants/number/SwNumberTree suites and impacted ODT assertions only when source-stale. Task-local baseline/native probes;bounded runtime-inventory/source-provenance including the new source-owned manager. Existing shown document-node hierarchical Arabic/bullet slice. Native layout expansion,redline/undo-node arrays,full callback/word-count/lifetime platform machinery,legacy/default factories remain explicit separate obligations. Preserve registered save/open/recovery deviations,Worker16/ODF1.3,all gates;no blanket status/default/goal promotion."
  Plan: "1. Capture actual owner/read/rule baseline. 2. Compile unmodified native lifecycle,registration and getter methods with explicit platform adapters. 3. Transfer shown record ownership to SwTextNode and rule/registry hooks to SwNodeNum;SwList owns only roots and references. Remove full-list reads and registration wrappers;reconcile document/ODT/copy/move lifecycle. 4. Add native/literal identity and membership evidence with bounded metadata for new manager. 5. Focused checks,full unchanged verify,real implementation SHA/evaluator/finish child/update active parent. Owner CODER;one correction;existing IO deviations preserved;authorization from persistent goal."
  Verify Steps: "Run actual baseline for missing GetNum/vector/lifecycle ownership APIs,whole-list counter read validating unrelated tails and detached records reading current text rule rather than retained native rule. Compile full unmodified pinned GetNum/GetNumberVector/IsInList/FindList/AddToList/RemoveFromList plus PreAdd/PostRemove/ChangeNumRule/Create,rule membership and document registry methods with explicit single-shown/no-layout/no-redline/doc-node/platform dependencies;record adapters and source body identity. Compare actual owner/tree/rule/registry objects for add/remove/readd,duplicate add,level/restart/counted/list/rule changes,detach/reinsert/move/delete/copy,Arabic/bullet,rule membership ordering/duplicate suppression,numbered registry filtering,and reverse/prefix-only reads with literal vectors/counters/labels and independent copies. Include genuine ODT/Worker/undo suites. Focused tests/lint/types/docs/provenance/parity before unchanged npm run verify;both coverage suites100%,all browser/static/resource/source/invariant gates. Doctor,routing,diff,real code SHA,evaluator pass and clean final checkout required;no weakened/skipped gates."
  Verification: "Pending owner execution;prior iteration35 is evidence only for retained topology,not this ownership correction."
  Rollback Plan: "Revert only the actual implementation commit if this ownership correction fails;preserve task evidence and prior DONE artifacts. No destructive history operations."
  Findings: |-
    Fresh preflight clean main/direct,parent C9TN6M only active,no user-instructions. Previous turn is verified progress:iteration35 code77fda1c876bba94fa18514fa0b2dce43e1d38493,full verify59167 exit0,closed child and clean parent98252afbd500. Native ndtxt.hxx owns mpNodeNum;shown AddToList allocates,RemoveFromList removes/resets,GetNum/GetNumberVector directly access it. PreAdd/PostRemove register rule clients and document list items. Current local SwList map allocates records,SwNodeNum reads text rule dynamically and paragraph getters force whole-list validation. Persistent goal authorizes this safe in-repo source-shaped correction and lifecycle;no network/outside access or subagents.

    - Observation: Actual pre-edit baseline:missing GetNum/GetNumberVector/AddToList;first counter7 read computes unrelated raw tail0to8;orphan retains dynamic format start7 instead of native cleared binding/default1. Native-owner compile24098 failed only five missing declaration methods in explicit frame/range/list-items adapters;no native body changed.
      Impact: Incomplete native dependency declarations prevent comparison and are not successful evidence. Reading tail/raw state and cleared rule binding must be independently verified after repair.
      Resolution: Add only range/frame/native node getIDocumentListItems forwarding adapter declarations;recompile full untouched native methods. Keep this failure and unsupported hidden/layout/platform callbacks explicit;no verification gate change.

    - Observation: Command: npm run typecheck --workspace @vite-office/office; Result: fail (session7380). Transitional diagnostics: old tests called list-owned Insert/Remove APIs; SwTextNode type-only import used for teardown; XML call-site replacement retained this prefix.
      Impact: Owner API migration required updating actual lifecycle fixtures and two imports/call sites; no verification gate relaxed.
      Resolution: Migrated tests to canonical node-owned AddToList/RemoveFromList, preserved tree-record insertion contracts, fixed value import and XML node reference; rerun pending.

    - Observation: Command: npx tsx .agentplane/tasks/202610010449-CE6KDW/compare-native.ts; initial Result: fail sequence48 step10; focused test session21085 failed detached start7 expectation.
      Impact: Actual attribute transitions removed after assignment; native HandleSetAttrAtTextNode removes before assignment so invalid-rule removal sees old list. PostRemove intentionally clears retained rule, making detached start1.
      Resolution: Matched pre-mutation removal/readd including same-rule set; preserved native expected states. Actual comparison now passes120 sequences/8976 owner states; focused25 tests pass session8693; new4 lifecycle/registry tests pass53768. No native expected state weakened.
id_source: "generated"
---
## Summary

Iteration36 of the user-authorized parity goal:restore shown SwTextNode numbering ownership,typed lifecycle and lazy reads with rule/document registrations;remove SwList item allocation/map ownership and generic registration wrappers.

## Scope

Runtime:sw/source/core/txtnode/ndtxt.ts,SwNumberTree/SwNodeNum.ts,SwNumberTree.ts,doc/list.ts,number.ts,doc.ts,DocumentListsManager.ts,new DocumentListItemsManager.ts,docnode/nodes.ts;sw/browser/filter/xml/writer-document-codec.ts and sw/source/filter/xml/xmlimp.ts registration call sites. Tests:new node-numbering-lifecycle.test.ts,new DocumentListItemsManager.test.ts,existing ndtxt/doc/list/list-invariants/number/SwNumberTree suites and impacted ODT assertions only when source-stale. Task-local baseline/native probes;bounded runtime-inventory/source-provenance including the new source-owned manager. Existing shown document-node hierarchical Arabic/bullet slice. Native layout expansion,redline/undo-node arrays,full callback/word-count/lifetime platform machinery,legacy/default factories remain explicit separate obligations. Preserve registered save/open/recovery deviations,Worker16/ODF1.3,all gates;no blanket status/default/goal promotion.

## Plan

1. Capture actual owner/read/rule baseline. 2. Compile unmodified native lifecycle,registration and getter methods with explicit platform adapters. 3. Transfer shown record ownership to SwTextNode and rule/registry hooks to SwNodeNum;SwList owns only roots and references. Remove full-list reads and registration wrappers;reconcile document/ODT/copy/move lifecycle. 4. Add native/literal identity and membership evidence with bounded metadata for new manager. 5. Focused checks,full unchanged verify,real implementation SHA/evaluator/finish child/update active parent. Owner CODER;one correction;existing IO deviations preserved;authorization from persistent goal.

## Verify Steps

Run actual baseline for missing GetNum/vector/lifecycle ownership APIs,whole-list counter read validating unrelated tails and detached records reading current text rule rather than retained native rule. Compile full unmodified pinned GetNum/GetNumberVector/IsInList/FindList/AddToList/RemoveFromList plus PreAdd/PostRemove/ChangeNumRule/Create,rule membership and document registry methods with explicit single-shown/no-layout/no-redline/doc-node/platform dependencies;record adapters and source body identity. Compare actual owner/tree/rule/registry objects for add/remove/readd,duplicate add,level/restart/counted/list/rule changes,detach/reinsert/move/delete/copy,Arabic/bullet,rule membership ordering/duplicate suppression,numbered registry filtering,and reverse/prefix-only reads with literal vectors/counters/labels and independent copies. Include genuine ODT/Worker/undo suites. Focused tests/lint/types/docs/provenance/parity before unchanged npm run verify;both coverage suites100%,all browser/static/resource/source/invariant gates. Doctor,routing,diff,real code SHA,evaluator pass and clean final checkout required;no weakened/skipped gates.

## Verification

Pending owner execution;prior iteration35 is evidence only for retained topology,not this ownership correction.

## Rollback Plan

Revert only the actual implementation commit if this ownership correction fails;preserve task evidence and prior DONE artifacts. No destructive history operations.

## Findings

Fresh preflight clean main/direct,parent C9TN6M only active,no user-instructions. Previous turn is verified progress:iteration35 code77fda1c876bba94fa18514fa0b2dce43e1d38493,full verify59167 exit0,closed child and clean parent98252afbd500. Native ndtxt.hxx owns mpNodeNum;shown AddToList allocates,RemoveFromList removes/resets,GetNum/GetNumberVector directly access it. PreAdd/PostRemove register rule clients and document list items. Current local SwList map allocates records,SwNodeNum reads text rule dynamically and paragraph getters force whole-list validation. Persistent goal authorizes this safe in-repo source-shaped correction and lifecycle;no network/outside access or subagents.

- Observation: Actual pre-edit baseline:missing GetNum/GetNumberVector/AddToList;first counter7 read computes unrelated raw tail0to8;orphan retains dynamic format start7 instead of native cleared binding/default1. Native-owner compile24098 failed only five missing declaration methods in explicit frame/range/list-items adapters;no native body changed.
  Impact: Incomplete native dependency declarations prevent comparison and are not successful evidence. Reading tail/raw state and cleared rule binding must be independently verified after repair.
  Resolution: Add only range/frame/native node getIDocumentListItems forwarding adapter declarations;recompile full untouched native methods. Keep this failure and unsupported hidden/layout/platform callbacks explicit;no verification gate change.

- Observation: Command: npm run typecheck --workspace @vite-office/office; Result: fail (session7380). Transitional diagnostics: old tests called list-owned Insert/Remove APIs; SwTextNode type-only import used for teardown; XML call-site replacement retained this prefix.
  Impact: Owner API migration required updating actual lifecycle fixtures and two imports/call sites; no verification gate relaxed.
  Resolution: Migrated tests to canonical node-owned AddToList/RemoveFromList, preserved tree-record insertion contracts, fixed value import and XML node reference; rerun pending.

- Observation: Command: npx tsx .agentplane/tasks/202610010449-CE6KDW/compare-native.ts; initial Result: fail sequence48 step10; focused test session21085 failed detached start7 expectation.
  Impact: Actual attribute transitions removed after assignment; native HandleSetAttrAtTextNode removes before assignment so invalid-rule removal sees old list. PostRemove intentionally clears retained rule, making detached start1.
  Resolution: Matched pre-mutation removal/readd including same-rule set; preserved native expected states. Actual comparison now passes120 sequences/8976 owner states; focused25 tests pass session8693; new4 lifecycle/registry tests pass53768. No native expected state weakened.
