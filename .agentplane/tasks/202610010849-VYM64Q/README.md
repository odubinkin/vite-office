---
id: "202610010849-VYM64Q"
title: "Restore Writer attribute handle mutation lifecycle"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on:
  - "202610010735-THRTCH"
tags:
  - "code"
task_kind: "code"
mutation_scope: "code"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-10-01T08:54:21.371Z"
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
    body: "Start: restore approved existing Writer attribute handle mutation lifecycle under the continuing explicit goal,with real baseline and unchanged source evidence before production edits;retain all registered IO and bounded native lifetime gaps."
events:
  -
    type: "status"
    at: "2026-10-01T08:54:21.808Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore approved existing Writer attribute handle mutation lifecycle under the continuing explicit goal,with real baseline and unchanged source evidence before production edits;retain all registered IO and bounded native lifetime gaps."
doc_version: 3
doc_updated_at: "2026-10-01T08:54:21.808Z"
doc_updated_by: "CODER"
description: "Iteration39: replace in-place SwContentNode attribute mutation with source-owned copy/commit handle helpers,restore native clear-delta callbacks and notification-before-release/no-op contracts. SetAttr participates in the same handle lifecycle so nested notification writes cannot mutate retained old sets. Existing registered items/unlocked observer path only;full native autostyle cache/refcount/modify-lock/lifetime remains explicit. Preserve IO deviations and active parent audit."
sections:
  Summary: "Iteration39 restores native copy/commit attribute-handle ownership for existing Writer content-node mutations and notification-before-empty-release ordering. Reset no-op and invalid/disabled delta distinctions follow pinned source;SetAttr uses the same handle helpers so nested writes cannot mutate retained old handles. Parent audit and unlimited goal stay active."
  Scope: "svl/source/items/itemset.ts for source Changed hooks before Put/Clear storage mutation;itempool.ts for native static IsWhich category needed by SwAttrSet Changed. sw/source/core/attr/swatrset.ts for native Changed and Put_BC/ClearItem_BC delta capture;docnode/node.ts and source-owner node-attribute-handle.ts helper for stable handle/copy/commit and existing SetAttr(single/bulk),ResetAttr(single/range/vector),ResetAllAttr. Tests:existing itemset.test.ts and writer-attributes.test.ts plus native/literal mutation lifecycle regression module and src/test fixture as needed;existing Undo/Worker/ODT/outline tests retain assertions. docs/program/source-provenance.json and parity/runtime-inventory.json register exact bounded ownership/evidence,without status promotion. Task-local pre-edit baselines,compiled unchanged pinned native bodies and hashes,actual model comparison,all failure/check logs and quality. Profile:registered Writer items,canonical displayed text nodes and existing model observer notifications. Native IStyleAccess dedup/shared pool,modify-lock/cache/refcount/surrogates/listeners/background/auto-style direct item/conditional style machinery remain explicit unimplemented dependencies;do not invent a native full-lifetime claim. No network/outside access/subagents,gate/config/schema changes or registered document save/open/recovery changes. Source handle replacement is required for both set and reset and belongs to this one owner lifecycle correction."
  Plan: "1.Capture actual pre-edit empty-set reset retention,callback-visible handle identity/ownership,retained pre-mutation set contents and nested writes for singles,batches/ranges/vectors/all.2.Compile unchanged complete relevant SwContentNode SetAttr/ResetAttr/ResetAllAttr/ClearItemsFromAttrSet,AttrSetHandleHelper Put/Put_BC/ClearItem_BC,SwAttrSet Changed/Put_BC/ClearItem_BC and necessary SfxItemSet Changed removal/insertion ordering plus native IsWhich bodies. Byte hashes against pinned26.8.0.2;named raw storage/default/item copy/automatic-style fresh-handle/normal unlocked listener/cache/platform dependency adapters. Compare actual ordinary/INVALID/DISABLED/direct/inherited items,delta sets,return counts,handle replacement and notification snapshots including nested SetAttr/Reset inside the existing model listener.3.Port source owner responsibilities through stable mpAttrSet handle and copy/commit helpers,maintaining existing public Writer item contracts;old/new accumulators belong to SwAttrSet,storage hooks to SfxItemSet,category to SfxItemPool. Preserve no-op identity and source release decisions after listeners. Do not emulate callback deltas by hand in SwContentNode or mutate retained old handles.4.Add independent literal regressions and retained real Undo/Worker/ODT/outline behavior;update only source-proven stale assertions. Run focused static/source checks and unchanged full npm run verify,both100% gates;doctor/routing/diff.5.Record verified actual implementation SHA,evaluator pass,finish immutable child,append bounded parent progress and clean tracked/untracked state. Stop/reapprove if security,external writes,material scope or acceptance changes;safe necessary local implementation follows persistent explicit user goal approval."
  Verify Steps: "Before production edits save actual SwDoc/SwTextNode pre-edit failures for empty allocated sets,reset callback ownership and retained old-set mutation. Compile complete unchanged pinned native mutation/handle/delta bodies with byte identities and explicit dependency adapters;test ordinary/same/default/nonregistered-slot/sentinel/parent states,duplicate ordered vectors,empty/default/reversed ranges/all resets,all return counts,notification order and identity,callback nested set/reset and style changes. Compare actual SwAttrSet delta sets and core items,not JS-only imitation. Literal assertions independently prove no-op retention/release distinctions,resetall semantic count excluding invalid/disabled,handle-copy ownership,static Which category endpoints and notification-visible still-owned cleared sets. Existing Undo/Worker16/genuine ODT/reopen and outline/direct-list tests remain intact. Focused tests/format/lint/types/docs/size/source checks before unchanged npm run verify:all692previous app tests plus additions,109inventory,19browser,both coverage suites100% in all four categories and remaining gates. Doctor,routing,diff,recorded verification,actual code commit/evaluator and final clean tracked/untracked state. No waived gates,blanket semantic/default status promotion or registered IO change."
  Verification: "Pending actual pre-edit baseline,unchanged native body comparison and all final gates;no semantic closure claimed."
  Rollback Plan: "Revert only the actual iteration39 implementation commit if required,preserving all task evidence and prior DONE artifacts. No history rewriting or registered IO changes."
  Findings: "Preflight clean main/direct;only parent audit DOING. Pinned node.cxx1699-1799 retains cleared direct handles during client notifications and differs between changed/no-op single/range/vector/all release. AttrSetHandleHelper source comment explicitly prohibits direct mutation and clones before committing a new handle. Necessary SetAttr correction belongs to the same ownership lifecycle to preserve retained handles during nested writes. Native SwAttrSet Changed skips invalid/disabled and uses parent or pool defaults for clear delta;ResetAllAttr returns new delta count. SfxItemPool static IsWhich classifies nonzero IDs through4999,while the existing local instance method incorrectly means registered defaults and has no production callers. No native full autostyle cache/shared pool/refcount/modify-lock/cache/platform claim. Prior unexplained UI failures remain unproven."
id_source: "generated"
---
## Summary

Iteration39 restores native copy/commit attribute-handle ownership for existing Writer content-node mutations and notification-before-empty-release ordering. Reset no-op and invalid/disabled delta distinctions follow pinned source;SetAttr uses the same handle helpers so nested writes cannot mutate retained old handles. Parent audit and unlimited goal stay active.

## Scope

svl/source/items/itemset.ts for source Changed hooks before Put/Clear storage mutation;itempool.ts for native static IsWhich category needed by SwAttrSet Changed. sw/source/core/attr/swatrset.ts for native Changed and Put_BC/ClearItem_BC delta capture;docnode/node.ts and source-owner node-attribute-handle.ts helper for stable handle/copy/commit and existing SetAttr(single/bulk),ResetAttr(single/range/vector),ResetAllAttr. Tests:existing itemset.test.ts and writer-attributes.test.ts plus native/literal mutation lifecycle regression module and src/test fixture as needed;existing Undo/Worker/ODT/outline tests retain assertions. docs/program/source-provenance.json and parity/runtime-inventory.json register exact bounded ownership/evidence,without status promotion. Task-local pre-edit baselines,compiled unchanged pinned native bodies and hashes,actual model comparison,all failure/check logs and quality. Profile:registered Writer items,canonical displayed text nodes and existing model observer notifications. Native IStyleAccess dedup/shared pool,modify-lock/cache/refcount/surrogates/listeners/background/auto-style direct item/conditional style machinery remain explicit unimplemented dependencies;do not invent a native full-lifetime claim. No network/outside access/subagents,gate/config/schema changes or registered document save/open/recovery changes. Source handle replacement is required for both set and reset and belongs to this one owner lifecycle correction.

## Plan

1.Capture actual pre-edit empty-set reset retention,callback-visible handle identity/ownership,retained pre-mutation set contents and nested writes for singles,batches/ranges/vectors/all.2.Compile unchanged complete relevant SwContentNode SetAttr/ResetAttr/ResetAllAttr/ClearItemsFromAttrSet,AttrSetHandleHelper Put/Put_BC/ClearItem_BC,SwAttrSet Changed/Put_BC/ClearItem_BC and necessary SfxItemSet Changed removal/insertion ordering plus native IsWhich bodies. Byte hashes against pinned26.8.0.2;named raw storage/default/item copy/automatic-style fresh-handle/normal unlocked listener/cache/platform dependency adapters. Compare actual ordinary/INVALID/DISABLED/direct/inherited items,delta sets,return counts,handle replacement and notification snapshots including nested SetAttr/Reset inside the existing model listener.3.Port source owner responsibilities through stable mpAttrSet handle and copy/commit helpers,maintaining existing public Writer item contracts;old/new accumulators belong to SwAttrSet,storage hooks to SfxItemSet,category to SfxItemPool. Preserve no-op identity and source release decisions after listeners. Do not emulate callback deltas by hand in SwContentNode or mutate retained old handles.4.Add independent literal regressions and retained real Undo/Worker/ODT/outline behavior;update only source-proven stale assertions. Run focused static/source checks and unchanged full npm run verify,both100% gates;doctor/routing/diff.5.Record verified actual implementation SHA,evaluator pass,finish immutable child,append bounded parent progress and clean tracked/untracked state. Stop/reapprove if security,external writes,material scope or acceptance changes;safe necessary local implementation follows persistent explicit user goal approval.

## Verify Steps

Before production edits save actual SwDoc/SwTextNode pre-edit failures for empty allocated sets,reset callback ownership and retained old-set mutation. Compile complete unchanged pinned native mutation/handle/delta bodies with byte identities and explicit dependency adapters;test ordinary/same/default/nonregistered-slot/sentinel/parent states,duplicate ordered vectors,empty/default/reversed ranges/all resets,all return counts,notification order and identity,callback nested set/reset and style changes. Compare actual SwAttrSet delta sets and core items,not JS-only imitation. Literal assertions independently prove no-op retention/release distinctions,resetall semantic count excluding invalid/disabled,handle-copy ownership,static Which category endpoints and notification-visible still-owned cleared sets. Existing Undo/Worker16/genuine ODT/reopen and outline/direct-list tests remain intact. Focused tests/format/lint/types/docs/size/source checks before unchanged npm run verify:all692previous app tests plus additions,109inventory,19browser,both coverage suites100% in all four categories and remaining gates. Doctor,routing,diff,recorded verification,actual code commit/evaluator and final clean tracked/untracked state. No waived gates,blanket semantic/default status promotion or registered IO change.

## Verification

Pending actual pre-edit baseline,unchanged native body comparison and all final gates;no semantic closure claimed.

## Rollback Plan

Revert only the actual iteration39 implementation commit if required,preserving all task evidence and prior DONE artifacts. No history rewriting or registered IO changes.

## Findings

Preflight clean main/direct;only parent audit DOING. Pinned node.cxx1699-1799 retains cleared direct handles during client notifications and differs between changed/no-op single/range/vector/all release. AttrSetHandleHelper source comment explicitly prohibits direct mutation and clones before committing a new handle. Necessary SetAttr correction belongs to the same ownership lifecycle to preserve retained handles during nested writes. Native SwAttrSet Changed skips invalid/disabled and uses parent or pool defaults for clear delta;ResetAllAttr returns new delta count. SfxItemPool static IsWhich classifies nonzero IDs through4999,while the existing local instance method incorrectly means registered defaults and has no production callers. No native full autostyle cache/shared pool/refcount/modify-lock/cache/platform claim. Prior unexplained UI failures remain unproven.
