---
id: "202610010418-7548FA"
title: "Retain native list trees across item mutations"
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
  updated_at: "2026-10-01T04:19:58.362Z"
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
doc_updated_at: "2026-10-01T04:19:59.297Z"
doc_updated_by: "CODER"
description: "Iteration35 of approved parity goal: replace deferred SwList reconstruction with retained single supported range roots,source-shaped insertion/removal/level transitions and validating counter reads. Preserve registered document IO deviations and all verification gates."
sections:
  Summary: "Iteration35 of the user-authorized persistent parity goal. Retain SwList roots and registered SwNodeNum objects across supported body-range item transitions; remove deferred topology reconstruction and make counter reads validate native prefixes."
  Scope: "Runtime: sw/source/core/doc/list.ts,DocumentListsManager.ts,SwNumberTree/SwNumberTree.ts,docnode/nodes.ts,txtnode/ndtxt.ts. Tests:list.test.ts,list-invariants.test.ts,number.test.ts,SwNumberTree.test.ts and new SwNumberTree-lifecycle.test.ts. Bounded provenance/runtime-inventory updates and task-local baseline/native probes. Existing single body-range hierarchical Arabic/bullet slice; no redline/additional-range/continuous numbering or full native notification/lifetime claim. Preserve all registered save/open/recovery deviations,Worker16,ODF1.3 and gates. No status/default/module/whole-goal promotion."
  Plan: "1. Record pre-edit direct-read/topology/identity failure with actual objects. 2. Compile unmodified pinned tree/list transition bodies and document adapters. 3. Port retained root/incremental registration/removal/level changes,prefix validation and canonical move registration;remove unused deferred ordering contract. 4. Add source-derived lifecycle and document tests,update only bounded provenance notes. 5. Run focused checks then full unchanged verify,record quality and real implementation hash,finish only child and update active parent. Owner CODER;one correction task;approval from persistent /goal,all IO exceptions preserved."
  Verify Steps: "Run actual pre-edit baseline for unattached registered records,empty direct vectors and replaced root/item identities. Compile unchanged pinned AddChild,RemoveChild,RemoveMe,MoveChildren,SetLevelInListTree,GetNumber,GetNumberVector_,IsValid,Validate,ValidateHierarchical,SetLastValid/InvalidateTree and SwList insertion/removal/validation ownership methods with explicit bounded range/text/rule/container/notification adapters. Compare actual document/list/tree objects across shuffled insertion,skipped phantom levels,removal/reinsert,level changes,zero/nonzero starts,restart/count changes and immediate reads;capture literal topology,object identity,counters/vectors/labels. Cover canonical document move/remove/copy/undo and existing genuine ODT/Worker tests. Focused tests,lint,typecheck,docs,provenance/parity before unchanged npm run verify;both coverage suites100%,all browser/resource/static/source/provenance/invariant gates. Doctor,routing,diff,evaluator,actual code SHA and final clean status required. No skipped/relaxed gates or broad metadata promotion."
  Verification: "Pending owner execution; no successful verification inferred from previous iteration."
  Rollback Plan: "Revert only the task implementation commit if this bounded lifecycle change fails; preserve task evidence and previous DONE artifacts. No destructive history actions."
  Findings: "Read-only startup: main/direct,clean checkout,parent C9TN6M only active before childcreation;no user-instructions. Native SwList creates roots at construction,AddChild at insertion and RemoveMe at removal;local SwList currently replaces records and reconstructs topology at validation. Existing native prefix validation and descendant-move algorithms can support this correction without rebuilding. One read-only combined search returned1 because DocumentStateManager has no GetNumRule/SwDoc/GetNodes matches;actual file subsequently read,no mutation or assumption from empty search. Persistent user goal authorizes this safe in-repo correction and local lifecycle;network/outside access remains prohibited."
id_source: "generated"
---
## Summary

Iteration35 of the user-authorized persistent parity goal. Retain SwList roots and registered SwNodeNum objects across supported body-range item transitions; remove deferred topology reconstruction and make counter reads validate native prefixes.

## Scope

Runtime: sw/source/core/doc/list.ts,DocumentListsManager.ts,SwNumberTree/SwNumberTree.ts,docnode/nodes.ts,txtnode/ndtxt.ts. Tests:list.test.ts,list-invariants.test.ts,number.test.ts,SwNumberTree.test.ts and new SwNumberTree-lifecycle.test.ts. Bounded provenance/runtime-inventory updates and task-local baseline/native probes. Existing single body-range hierarchical Arabic/bullet slice; no redline/additional-range/continuous numbering or full native notification/lifetime claim. Preserve all registered save/open/recovery deviations,Worker16,ODF1.3 and gates. No status/default/module/whole-goal promotion.

## Plan

1. Record pre-edit direct-read/topology/identity failure with actual objects. 2. Compile unmodified pinned tree/list transition bodies and document adapters. 3. Port retained root/incremental registration/removal/level changes,prefix validation and canonical move registration;remove unused deferred ordering contract. 4. Add source-derived lifecycle and document tests,update only bounded provenance notes. 5. Run focused checks then full unchanged verify,record quality and real implementation hash,finish only child and update active parent. Owner CODER;one correction task;approval from persistent /goal,all IO exceptions preserved.

## Verify Steps

Run actual pre-edit baseline for unattached registered records,empty direct vectors and replaced root/item identities. Compile unchanged pinned AddChild,RemoveChild,RemoveMe,MoveChildren,SetLevelInListTree,GetNumber,GetNumberVector_,IsValid,Validate,ValidateHierarchical,SetLastValid/InvalidateTree and SwList insertion/removal/validation ownership methods with explicit bounded range/text/rule/container/notification adapters. Compare actual document/list/tree objects across shuffled insertion,skipped phantom levels,removal/reinsert,level changes,zero/nonzero starts,restart/count changes and immediate reads;capture literal topology,object identity,counters/vectors/labels. Cover canonical document move/remove/copy/undo and existing genuine ODT/Worker tests. Focused tests,lint,typecheck,docs,provenance/parity before unchanged npm run verify;both coverage suites100%,all browser/resource/static/source/provenance/invariant gates. Doctor,routing,diff,evaluator,actual code SHA and final clean status required. No skipped/relaxed gates or broad metadata promotion.

## Verification

Pending owner execution; no successful verification inferred from previous iteration.

## Rollback Plan

Revert only the task implementation commit if this bounded lifecycle change fails; preserve task evidence and previous DONE artifacts. No destructive history actions.

## Findings

Read-only startup: main/direct,clean checkout,parent C9TN6M only active before childcreation;no user-instructions. Native SwList creates roots at construction,AddChild at insertion and RemoveMe at removal;local SwList currently replaces records and reconstructs topology at validation. Existing native prefix validation and descendant-move algorithms can support this correction without rebuilding. One read-only combined search returned1 because DocumentStateManager has no GetNumRule/SwDoc/GetNodes matches;actual file subsequently read,no mutation or assumption from empty search. Persistent user goal authorizes this safe in-repo correction and local lifecycle;network/outside access remains prohibited.
