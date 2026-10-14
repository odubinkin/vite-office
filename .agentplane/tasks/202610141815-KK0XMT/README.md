---
id: "202610141815-KK0XMT"
title: "Implement shared byte item and Calc paper-tray default"
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
  updated_at: "2026-10-14T18:16:17.484Z"
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
    body: "Start: implement original shared byte and paper-bin values for Calc159 with native Any signed8 boundary; reuse shared services and verify strict portable coverage, no localized provider or lifetime fake."
events:
  -
    type: "status"
    at: "2026-10-14T18:16:23.141Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement original shared byte and paper-bin values for Calc159 with native Any signed8 boundary; reuse shared services and verify strict portable coverage, no localized provider or lifetime fake."
doc_version: 3
doc_updated_at: "2026-10-14T18:16:23.141Z"
doc_updated_by: "CODER"
description: "Task139 ports original CntByteItem/SfxByteItem and SvxPaperBinItem value/default/copy/hash/typed Any behavior for Calc159. Reuse shared Any and o3tl owners, no unsigned16 substitution or lifetime machinery; presentation localization remains explicitly pending."
sections:
  Summary: "Task139 closes the real paper-tray value dependency of ScDocumentPool with original shared CntByteItem/SfxByteItem and SvxPaperBinItem. User continuation authorizes in-scope canonical shared/core work on calc."
  Scope: "At most30 intentional source/doc/inventory paths: existing svl cintitem/intitem owners and headers, editeng frmitems paper-bin shard and pbinitem header/reexport, Calc159 identifier and real item-set test, native byte tests, matching runtime/provenance records and one bounded capability, calc-core documentation. Reuse Any/hash/pool; no new memory mechanisms, native probes, fake localized presentation or ScDocumentPool."
  Plan: "Implement native shared byte value family and paper-bin defaults/clone/Any/hash for real Calc159; bounded30paths, reuse shared services, no fake localized presentation or lifetime engine. Related/wholeCalc strict raw100, portable build/source gates/pins/hash and clean calc; full suite remains readiness-gated."
  Verify Steps: "Test native byte values0,127,128,255, scalar narrowing, independent copy/clone, concrete equality and Which-independent comparison/hash source fold; signed8 Any queries including255 to-1, ignored members, admitted numeric Any types from actual shared assignNumeric source and rejected types without mutation. SfxByteItem default Which0/value0 and concrete clone. PaperBin factory Which0/value255, explicit values, copy/clone retaining Which, no duplicated storage; real Calc159 item-set owned copies. Entire changed shared executable owners and entire Calc coverage must have every S/B/F/L raw counter positive100; run relevant existing numeric and Writer consumer tests, leave Writer-only coverage gaps. Remove all4native reference links during tests/build and restore finally. Scoped formatting/lint, npm run typecheck, check:docs, check:file-size, check:dependencies, check:source-tree, check:source-provenance, inventory:parity, routing checker, ap doctor, git diff --check, module-boundary tests. Audit pinned source hashes, all intentional paths within30, no unrelated source changes and clean calc. No UI change/browser run or full-suite checkpoint: next full run waits actual minimum UI plus same-model ODS readiness, then repair and pause."
  Verification: "Pending execution."
  Rollback Plan: "Revert only task changes through a subsequent authorized task; no destructive reset, merge or external publication."
  Findings: "Source CntByteItem stores sal_uInt8 but QueryValue/PutValue use sal_Int8; retain255/-1 as defined source behavior rather than unsigned16 fallback. Original localized paper-bin presentation requires EditResId services not yet ported; do not add a fake provider or claim complete item parity. JS GC owns lifetime. Same-agent evaluator will not be independent."
id_source: "generated"
---
## Summary

Task139 closes the real paper-tray value dependency of ScDocumentPool with original shared CntByteItem/SfxByteItem and SvxPaperBinItem. User continuation authorizes in-scope canonical shared/core work on calc.

## Scope

At most30 intentional source/doc/inventory paths: existing svl cintitem/intitem owners and headers, editeng frmitems paper-bin shard and pbinitem header/reexport, Calc159 identifier and real item-set test, native byte tests, matching runtime/provenance records and one bounded capability, calc-core documentation. Reuse Any/hash/pool; no new memory mechanisms, native probes, fake localized presentation or ScDocumentPool.

## Plan

Implement native shared byte value family and paper-bin defaults/clone/Any/hash for real Calc159; bounded30paths, reuse shared services, no fake localized presentation or lifetime engine. Related/wholeCalc strict raw100, portable build/source gates/pins/hash and clean calc; full suite remains readiness-gated.

## Verify Steps

Test native byte values0,127,128,255, scalar narrowing, independent copy/clone, concrete equality and Which-independent comparison/hash source fold; signed8 Any queries including255 to-1, ignored members, admitted numeric Any types from actual shared assignNumeric source and rejected types without mutation. SfxByteItem default Which0/value0 and concrete clone. PaperBin factory Which0/value255, explicit values, copy/clone retaining Which, no duplicated storage; real Calc159 item-set owned copies. Entire changed shared executable owners and entire Calc coverage must have every S/B/F/L raw counter positive100; run relevant existing numeric and Writer consumer tests, leave Writer-only coverage gaps. Remove all4native reference links during tests/build and restore finally. Scoped formatting/lint, npm run typecheck, check:docs, check:file-size, check:dependencies, check:source-tree, check:source-provenance, inventory:parity, routing checker, ap doctor, git diff --check, module-boundary tests. Audit pinned source hashes, all intentional paths within30, no unrelated source changes and clean calc. No UI change/browser run or full-suite checkpoint: next full run waits actual minimum UI plus same-model ODS readiness, then repair and pause.

## Verification

Pending execution.

## Rollback Plan

Revert only task changes through a subsequent authorized task; no destructive reset, merge or external publication.

## Findings

Source CntByteItem stores sal_uInt8 but QueryValue/PutValue use sal_Int8; retain255/-1 as defined source behavior rather than unsigned16 fallback. Original localized paper-bin presentation requires EditResId services not yet ported; do not add a fake provider or claim complete item parity. JS GC owns lifetime. Same-agent evaluator will not be independent.
