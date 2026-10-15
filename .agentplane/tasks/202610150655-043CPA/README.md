---
id: "202610150655-043CPA"
title: "Restore native signed16 pooled item contracts for text metrics"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-15T06:55:45.052Z"
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
    body: "Start: correct original shared signed16 item contracts and real Calc inherited flag behavior, no compatibility shim or duplicate metric primitive; scoped strict coverage and portable source audit."
events:
  -
    type: "status"
    at: "2026-10-15T06:55:52.999Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: correct original shared signed16 item contracts and real Calc inherited flag behavior, no compatibility shim or duplicate metric primitive; scoped strict coverage and portable source audit."
doc_version: 3
doc_updated_at: "2026-10-15T06:55:52.999Z"
doc_updated_by: "CODER"
description: "Task151 corrects shared SfxInt16Item mutation/copy/payload equality/typed Any/hash/numeric presentation, with actual Calc ScMergeFlagAttr inherited behavior and related Writer tests. Real prerequisite for future SvxKerningItem; no duplicate wrapper, no UI localization or memory manager."
sections:
  Summary: "Task151 restores original shared SfxInt16Item value contracts required by native text-metric items, reusing and correcting the existing owner."
  Scope: "At most24intentional non-agent paths: existing svl intitem implementation/header metadata, direct signed16 tests, two obsolete equality assertions in existing sibling/itemset tests, actual Calc merge-flag inheritance regression, matched runtime/provenance/capability and calc-core docs. Native default/copy/SetValue/Clone, concrete payload equality excluding Which, typed Any short query/write, hash support and locale-independent numeric presentation. Existing validated JS scalar input domain and no-argument scalar query remain explicit browser boundaries. No false compatibility branch, native tree/Boost diagnostics port, memory manager, fake kerning class or UI localization."
  Plan: "Restore existing shared signed16 item native copy/mutation/equality/typed Any/hash/numeric presentation; correct obsolete expectations, verify actual Calc derived flags and Writer consumers, strict raw100/gates/build/source inventory audit and24path clean calc finish."
  Verify Steps: "Compare original svl/intitem.hxx and intitem.cxx constructors/value/copy/Clone/equality/typed short Any/hash/number presentation, ScMergeFlagAttr header inheritance and poolitem areSame guards. Test signed16 extrema/defaults/factory/copy/SetValue/Clone with independence, Which-excluding direct equality but exact native-type guard and areSame/set Which/type distinctions; existing checked JS scalar rejection remains explicit host precondition. Real Any short read/write ignoring all member values, extraction failure and unchanged values, existing scalar Query retained. Hash support/source value with repository unsigned64 logical size_t convention excluding Which; no persisted binary data claim. Native numeric presentation writes OUString without translation/resources or locale provider. Real Calc merge flags inherit mutation/Any, flags/masks/clone/state consistency and payload/Which separation. Related whole shared itempool/set/numeric/Writer automatic equality/notification/table tests; whole changed shared executable owner and whole Calc every raw S/B/F/L counter positive100. Writer-only coverage gaps exempt. Four references absent for tests/build and restored finally; all13source gates incl39boundary cases/inventory zero semantic violations, exact24path scope/source pins/hashes/clean calc. No native compiler/probe/Boost port. Full all-app suite only when actual minimum connected UI plus same-model ODS ready then applicable repairs/pause."
  Verification: "Pending execution."
  Rollback Plan: "Revert intentional task paths in later authorized task; no reset/merge/publication."
  Findings: "The immutable/no-setter/Which-in-payload behavior is a local divergence, not a suspected native defect. Correct shared owner without a Writer compatibility shim; task148 areSame retains original Which/type comparison at caller sites. Native diagnostic property-tree JSON/base serializer remains unported, no fake Boost owner. UI localization stays deferred. Actual EditEngine/EditTextObject/Calc pool/model/UI/ODS remain pending; same-agent evaluation is not independent."
id_source: "generated"
---
## Summary

Task151 restores original shared SfxInt16Item value contracts required by native text-metric items, reusing and correcting the existing owner.

## Scope

At most24intentional non-agent paths: existing svl intitem implementation/header metadata, direct signed16 tests, two obsolete equality assertions in existing sibling/itemset tests, actual Calc merge-flag inheritance regression, matched runtime/provenance/capability and calc-core docs. Native default/copy/SetValue/Clone, concrete payload equality excluding Which, typed Any short query/write, hash support and locale-independent numeric presentation. Existing validated JS scalar input domain and no-argument scalar query remain explicit browser boundaries. No false compatibility branch, native tree/Boost diagnostics port, memory manager, fake kerning class or UI localization.

## Plan

Restore existing shared signed16 item native copy/mutation/equality/typed Any/hash/numeric presentation; correct obsolete expectations, verify actual Calc derived flags and Writer consumers, strict raw100/gates/build/source inventory audit and24path clean calc finish.

## Verify Steps

Compare original svl/intitem.hxx and intitem.cxx constructors/value/copy/Clone/equality/typed short Any/hash/number presentation, ScMergeFlagAttr header inheritance and poolitem areSame guards. Test signed16 extrema/defaults/factory/copy/SetValue/Clone with independence, Which-excluding direct equality but exact native-type guard and areSame/set Which/type distinctions; existing checked JS scalar rejection remains explicit host precondition. Real Any short read/write ignoring all member values, extraction failure and unchanged values, existing scalar Query retained. Hash support/source value with repository unsigned64 logical size_t convention excluding Which; no persisted binary data claim. Native numeric presentation writes OUString without translation/resources or locale provider. Real Calc merge flags inherit mutation/Any, flags/masks/clone/state consistency and payload/Which separation. Related whole shared itempool/set/numeric/Writer automatic equality/notification/table tests; whole changed shared executable owner and whole Calc every raw S/B/F/L counter positive100. Writer-only coverage gaps exempt. Four references absent for tests/build and restored finally; all13source gates incl39boundary cases/inventory zero semantic violations, exact24path scope/source pins/hashes/clean calc. No native compiler/probe/Boost port. Full all-app suite only when actual minimum connected UI plus same-model ODS ready then applicable repairs/pause.

## Verification

Pending execution.

## Rollback Plan

Revert intentional task paths in later authorized task; no reset/merge/publication.

## Findings

The immutable/no-setter/Which-in-payload behavior is a local divergence, not a suspected native defect. Correct shared owner without a Writer compatibility shim; task148 areSame retains original Which/type comparison at caller sites. Native diagnostic property-tree JSON/base serializer remains unported, no fake Boost owner. UI localization stays deferred. Actual EditEngine/EditTextObject/Calc pool/model/UI/ODS remain pending; same-agent evaluation is not independent.
