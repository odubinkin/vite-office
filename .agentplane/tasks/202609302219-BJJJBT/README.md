---
id: "202609302219-BJJJBT"
title: "Restore native list declaration defaults and ownership"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "numbering"
  - "parity"
task_kind: "code"
mutation_scope: "code"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-30T22:20:09.847Z"
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
    body: "Start: Restore native supported declaration defaults and source-owned list/level contexts under the iterative goal."
events:
  -
    type: "status"
    at: "2026-09-30T22:20:10.310Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Restore native supported declaration defaults and source-owned list/level contexts under the iterative goal."
doc_version: 3
doc_updated_at: "2026-09-30T22:20:10.310Z"
doc_updated_by: "CODER"
description: "Move supported list-style and level declaration ownership to xmlnumi, restore native optional marker/format/level defaults and integer parsing, and ignore unrelated list children while preserving explicit unsupported-family errors."
sections:
  Summary: "Restore pinned optional declaration defaults and xmlnumi ownership for existing Arabic/bullet list styles."
  Scope: "Runtime: xmloff/source/style/xmlnumi.ts and xmlstyle.ts. Matching xmlnumi/context/ODT tests, source provenance/parity metadata and task-local differential evidence. Bounded supporting import/type edits if required to keep the current declaration port coherent. No network, outside-repository access, policy/gate/schema changes or registered save/open/recovery changes."
  Plan: "Retain native list and level context references in xmlnumi, with GetLevel/GetProperties and source-ordered collection. Parse the existing supported Arabic/bullet declarations with native missing-field and byte-string integer behavior; skip missing/out-of-range levels, permit empty/missing bullet marker and missing numeric format, and ignore unrelated child subtrees using an explicit adapter for the current strict SAX dispatcher. Keep image/other numbering families explicitly unsupported. Verify independent native scalar/context source evidence plus literal common/automatic ODT, copy/snapshot and reopen cases. Run all final mandatory gates, record scoped commit and quality, finish the child and keep the parent/goal active."
  Verify Steps: "Run focused xmlnumi/xmlstyle and ODT tests for missing/empty/default marker and numeric format, missing/present/invalid/signed/prefix/overflow level attributes, native context ownership/GetLevel/GetProperties, source order and ignored unrelated children. Produce a compiled primary-source differential probe for byte-string toInt32 and native level normalization, comparing manual context fixtures to local output. Verify literal common/automatic ODT cycles, copying/browser snapshots and native empty-bullet serialization. Run complete npm run verify with required 100% coverage unchanged. Run ap doctor, node .agentplane/policy/check-routing.mjs and git diff --check; record the final clean state and real implementation hash."
  Verification: "Pending."
  Rollback Plan: "Revert the scoped implementation commit after inspecting later numbering corrections; preserve task evidence and intentional browser deviations."
  Findings: "Previous goal turn was progress: child 202609302147-2R4T31 DONE, implementation d8bd6fcc54790da70f365460161ea0307a0a4ce2, parent progress 0c452823d826; no live processes or pending mutations. Preflight confirms clean main/direct with only parent 202609240501-C9TN6M active. Persistent /goal authorizes safe local iterative corrections. Pinned source: libreoffice-26.8.0.2 commit 9bc445578031fecf56086729d8e4940c77e14d65 cached in vendor/libreoffice-reference. xmlnumi.cxx level constructor starts sNumFormat='1', cBullet=0, nLevel=-1; present levels use FastAttributeList/o3tl byte-string integer parsing and normalize nonpositive values to level zero. FillUnoNumRule skips invalid indices and reads only valid level properties. Native list context owns a vector of level references. Local xmlstyle owns marker parsing, requires optional fields and rejects unrelated children. o3tl::toInt32 uses signed64 parsing then returns zero outside signed32; byte-string whitespace is ASCII controls 1..32, not JS Unicode trim. Nonnative global null dispatch remains a separate audit; this task uses a bounded ignore-context adaptation at list owners. Prefix/start/display-level/font/graphics/number-family and wider rule contracts remain unverified."
id_source: "generated"
---
## Summary

Restore pinned optional declaration defaults and xmlnumi ownership for existing Arabic/bullet list styles.

## Scope

Runtime: xmloff/source/style/xmlnumi.ts and xmlstyle.ts. Matching xmlnumi/context/ODT tests, source provenance/parity metadata and task-local differential evidence. Bounded supporting import/type edits if required to keep the current declaration port coherent. No network, outside-repository access, policy/gate/schema changes or registered save/open/recovery changes.

## Plan

Retain native list and level context references in xmlnumi, with GetLevel/GetProperties and source-ordered collection. Parse the existing supported Arabic/bullet declarations with native missing-field and byte-string integer behavior; skip missing/out-of-range levels, permit empty/missing bullet marker and missing numeric format, and ignore unrelated child subtrees using an explicit adapter for the current strict SAX dispatcher. Keep image/other numbering families explicitly unsupported. Verify independent native scalar/context source evidence plus literal common/automatic ODT, copy/snapshot and reopen cases. Run all final mandatory gates, record scoped commit and quality, finish the child and keep the parent/goal active.

## Verify Steps

Run focused xmlnumi/xmlstyle and ODT tests for missing/empty/default marker and numeric format, missing/present/invalid/signed/prefix/overflow level attributes, native context ownership/GetLevel/GetProperties, source order and ignored unrelated children. Produce a compiled primary-source differential probe for byte-string toInt32 and native level normalization, comparing manual context fixtures to local output. Verify literal common/automatic ODT cycles, copying/browser snapshots and native empty-bullet serialization. Run complete npm run verify with required 100% coverage unchanged. Run ap doctor, node .agentplane/policy/check-routing.mjs and git diff --check; record the final clean state and real implementation hash.

## Verification

Pending.

## Rollback Plan

Revert the scoped implementation commit after inspecting later numbering corrections; preserve task evidence and intentional browser deviations.

## Findings

Previous goal turn was progress: child 202609302147-2R4T31 DONE, implementation d8bd6fcc54790da70f365460161ea0307a0a4ce2, parent progress 0c452823d826; no live processes or pending mutations. Preflight confirms clean main/direct with only parent 202609240501-C9TN6M active. Persistent /goal authorizes safe local iterative corrections. Pinned source: libreoffice-26.8.0.2 commit 9bc445578031fecf56086729d8e4940c77e14d65 cached in vendor/libreoffice-reference. xmlnumi.cxx level constructor starts sNumFormat='1', cBullet=0, nLevel=-1; present levels use FastAttributeList/o3tl byte-string integer parsing and normalize nonpositive values to level zero. FillUnoNumRule skips invalid indices and reads only valid level properties. Native list context owns a vector of level references. Local xmlstyle owns marker parsing, requires optional fields and rejects unrelated children. o3tl::toInt32 uses signed64 parsing then returns zero outside signed32; byte-string whitespace is ASCII controls 1..32, not JS Unicode trim. Nonnative global null dispatch remains a separate audit; this task uses a bounded ignore-context adaptation at list owners. Prefix/start/display-level/font/graphics/number-family and wider rule contracts remain unverified.
