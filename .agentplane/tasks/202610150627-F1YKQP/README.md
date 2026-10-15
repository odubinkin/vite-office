---
id: "202610150627-F1YKQP"
title: "Use native pooled item comparisons for rich text dependencies"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-15T06:28:03.769Z"
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
    body: "Start: restore native pooled-item identity/type/value comparison and real shared item-set integration for rich text dependencies, with scoped raw100 validation and no localization or lifetime manager."
events:
  -
    type: "status"
    at: "2026-10-15T06:28:10.640Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore native pooled-item identity/type/value comparison and real shared item-set integration for rich text dependencies, with scoped raw100 validation and no localization or lifetime manager."
doc_version: 3
doc_updated_at: "2026-10-15T06:28:10.640Z"
doc_updated_by: "CODER"
description: "Task148 ports SfxPoolItem.areSame identity/null/Which/type/value ordering and adopts it in shared SfxItemSet equality and Put as original upstream requires. This is a real shared dependency for future EditTextObject paragraph/character comparisons; no fake rich text facade, ownership manager or localization."
sections:
  Summary: "Task148 restores original SfxPoolItem.areSame and shared SfxItemSet comparisons required by rich-text paragraph and character attributes."
  Scope: "At most18intentional non-agent paths: poolitem.ts, itemset.ts, direct regression tests, existing related item-set/Writer consumers tests selected without unrelated coverage repairs, matched runtime/provenance/capability records and calc-core documentation. Native identity/null/Which/type/value order is preserved using host object/concrete-class identity. No native type-number ABI, memory manager, fake rich text, UI localization or pool facade."
  Plan: "Restore native shared pooled-item comparison and actual item-set integration, independent type/identity regressions, raw100 scoped coverage and portable gates/build, honest inventory and clean calc finish within18paths."
  Verify Steps: "Read native poolitem.cxx areSame pointer/reference overloads, poolitem.hxx ItemType declarations and itemset.cxx Equals/PutImpl. Test identity short circuit without payload evaluation, both absent/single absent, unequal Which/type before equals, equal/unequal values and sentinels. Use independent permissive-value regression to expose pre-fix wrong-type Equals and replacement; actual concrete types for ordinary equality. Run all related shared itemset/pool/item consumers and affected Writer equality tests; whole changed shared executable owners and whole Calc raw S/B/F/L counters positive100. Writer-only coverage gaps exempt. Portable tests/build remove four reference symlinks and restore finally; no native compiler/probes. All13 scoped source gates including existing boundary suite, inventory zero violations, source/native/hash audit and clean calc. Full all-app suite remains deferred until minimal connected UI plus same-model ODS readiness, then fix applicable failures and pause."
  Verification: "Pending execution."
  Rollback Plan: "Revert only intentional task paths through a later authorized task; no reset, merge or publication."
  Findings: "Previous shared direct equals calls omitted native concrete-type guards. This is a local implementation discrepancy, not a suspected upstream issue. JS GC owns lifetime. Same-agent evaluation is not independent."
id_source: "generated"
---
## Summary

Task148 restores original SfxPoolItem.areSame and shared SfxItemSet comparisons required by rich-text paragraph and character attributes.

## Scope

At most18intentional non-agent paths: poolitem.ts, itemset.ts, direct regression tests, existing related item-set/Writer consumers tests selected without unrelated coverage repairs, matched runtime/provenance/capability records and calc-core documentation. Native identity/null/Which/type/value order is preserved using host object/concrete-class identity. No native type-number ABI, memory manager, fake rich text, UI localization or pool facade.

## Plan

Restore native shared pooled-item comparison and actual item-set integration, independent type/identity regressions, raw100 scoped coverage and portable gates/build, honest inventory and clean calc finish within18paths.

## Verify Steps

Read native poolitem.cxx areSame pointer/reference overloads, poolitem.hxx ItemType declarations and itemset.cxx Equals/PutImpl. Test identity short circuit without payload evaluation, both absent/single absent, unequal Which/type before equals, equal/unequal values and sentinels. Use independent permissive-value regression to expose pre-fix wrong-type Equals and replacement; actual concrete types for ordinary equality. Run all related shared itemset/pool/item consumers and affected Writer equality tests; whole changed shared executable owners and whole Calc raw S/B/F/L counters positive100. Writer-only coverage gaps exempt. Portable tests/build remove four reference symlinks and restore finally; no native compiler/probes. All13 scoped source gates including existing boundary suite, inventory zero violations, source/native/hash audit and clean calc. Full all-app suite remains deferred until minimal connected UI plus same-model ODS readiness, then fix applicable failures and pause.

## Verification

Pending execution.

## Rollback Plan

Revert only intentional task paths through a later authorized task; no reset, merge or publication.

## Findings

Previous shared direct equals calls omitted native concrete-type guards. This is a local implementation discrepancy, not a suspected upstream issue. JS GC owns lifetime. Same-agent evaluation is not independent.
