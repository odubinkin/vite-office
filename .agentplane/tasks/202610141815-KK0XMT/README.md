---
id: "202610141815-KK0XMT"
title: "Implement shared byte item and Calc paper-tray default"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
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
doc_updated_at: "2026-10-14T18:20:46.632Z"
doc_updated_by: "CODER"
description: "Task139 ports original CntByteItem/SfxByteItem and SvxPaperBinItem value/default/copy/hash/typed Any behavior for Calc159. Reuse shared Any and o3tl owners, no unsigned16 substitution or lifetime machinery; presentation localization remains explicitly pending."
sections:
  Summary: "Task139 closes the real paper-tray value dependency of ScDocumentPool with original shared CntByteItem/SfxByteItem and SvxPaperBinItem. User continuation authorizes in-scope canonical shared/core work on calc."
  Scope: "At most30 intentional source/doc/inventory paths: existing svl cintitem/intitem owners and headers, editeng frmitems paper-bin shard and pbinitem header/reexport, Calc159 identifier and real item-set test, native byte tests, matching runtime/provenance records and one bounded capability, calc-core documentation. Reuse Any/hash/pool; no new memory mechanisms, native probes, fake localized presentation or ScDocumentPool."
  Plan: "Implement native shared byte value family and paper-bin defaults/clone/Any/hash for real Calc159; bounded30paths, reuse shared services, no fake localized presentation or lifetime engine. Related/wholeCalc strict raw100, portable build/source gates/pins/hash and clean calc; full suite remains readiness-gated."
  Verify Steps: "Test native byte values0,127,128,255, scalar narrowing, independent copy/clone, concrete equality and Which-independent comparison/hash source fold; signed8 Any queries including255 to-1, ignored members, admitted numeric Any types from actual shared assignNumeric source and rejected types without mutation. SfxByteItem default Which0/value0 and concrete clone. PaperBin factory Which0/value255, explicit values, copy/clone retaining Which, no duplicated storage; real Calc159 item-set owned copies. Entire changed shared executable owners and entire Calc coverage must have every S/B/F/L raw counter positive100; run relevant existing numeric and Writer consumer tests, leave Writer-only coverage gaps. Remove all4native reference links during tests/build and restore finally. Scoped formatting/lint, npm run typecheck, check:docs, check:file-size, check:dependencies, check:source-tree, check:source-provenance, inventory:parity, routing checker, ap doctor, git diff --check, module-boundary tests. Audit pinned source hashes, all intentional paths within30, no unrelated source changes and clean calc. No UI change/browser run or full-suite checkpoint: next full run waits actual minimum UI plus same-model ODS readiness, then repair and pause."
  Verification: |-
    - Command: `node output/playwright/task139-checks/portable.mjs`.
    - Result: pass.
    - Evidence:29related tests/7files,3complete changed shared executable owners raw S160/B124/F56/L147 at100, every counter positive. WholeCalc179tests/71files,33owners raw S4170/B2731/F821/L3718 at100, every counter positive. All4reference links absent during both runs and restored in finally. Existing Writer notification/history/browser component tests pass; no Writer runtime owner modified or coverage-only repair. No repository threshold, exclusion or coverage-map edits.
    - Scope: original byte defaults/copy/narrowing/equality/hash/Any255-to-1 and byte-only extraction failures; shared paper-bin inheritance/default/copy and actual Calc159owned item-set clones. Existing signed/unsigned numeric owner contracts retained. After runtime verification, test-only readonly tuple annotations corrected TypeScript inference without changing emitted behavior; production sources and coverage locations are unchanged.

    - Command: `node output/playwright/task139-checks/build-portable.mjs`.
    - Result: pass.
    - Evidence:production build with all4reference links absent/restored finally. Existing Vite chunk-size advisory remains.
    - Scope: application compilation/bundling; no UI change and no browser-flow run required by this scope.

    - Command: scoped `npx prettier --check`, `npx eslint ... --max-warnings 0`, `npm run typecheck`, `npm run check:docs`, `npm run check:file-size`, `npm run check:dependencies`, `npm run check:source-tree`, `npm run check:source-provenance`, `npm run inventory:parity`, `node .agentplane/policy/check-routing.mjs`, `ap doctor`, `git diff --check`, `npx vitest run scripts/check-module-boundaries.test.ts`.
    - Result: pass after test tuple annotation correction.
    - Evidence:1888authored JSDoc files;632runtime dependency sources/2828relative imports/92allowed edges;114required tree paths/33retired roots;633runtime/provenance records and zero semantic violations;37boundary tests. Same existing hook-shim warning.13source gates pass; retained initial failure/final logs distinguish the corrected test-only typing issue.
    - Scope: exact29intentional paths within30approved,8runtime/provenance pairs and one bounded capability.3802to3811non-agent source hashes,20existing changes/9new/3782unchanged,8native source pins, original pinned HEAD and4reference links. Evidence: `output/playwright/task139-checks/verification.json`, `source-gates.json` and retained logs. Same-agent quality review is not independent.

    Original numeric/localized presentation, native ABI/debug diagnostics and real ScDocumentPool/ScPatternAttr/ScColumn/ScTable/ScDocument/UI/ODS remain pending. Full-suite checkpoint is deferred by the human to actual minimum UI plus same-model ODS readiness, then fixes and pause; this value dependency does not yet satisfy that checkpoint.
  Rollback Plan: "Revert only task changes through a subsequent authorized task; no destructive reset, merge or external publication."
  Findings: |-
    Source CntByteItem stores sal_uInt8 but QueryValue/PutValue use sal_Int8; retain255/-1 as defined source behavior rather than unsigned16 fallback. Original localized paper-bin presentation requires EditResId services not yet ported; do not add a fake provider or claim complete item parity. JS GC owns lifetime. Same-agent evaluator will not be independent.

    - Observation: Initial typecheck rejected a new test pair array inferred as number[][] under noUncheckedIndexedAccess; runtime tests and coverage passed.
      Impact: Only test fixture typing, no production failure or scope drift.
      Resolution: Declare independent numeric witness pairs as readonly tuples using as const, then rerun typecheck and scoped format/lint; runtime semantics unchanged.
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

- Command: `node output/playwright/task139-checks/portable.mjs`.
- Result: pass.
- Evidence:29related tests/7files,3complete changed shared executable owners raw S160/B124/F56/L147 at100, every counter positive. WholeCalc179tests/71files,33owners raw S4170/B2731/F821/L3718 at100, every counter positive. All4reference links absent during both runs and restored in finally. Existing Writer notification/history/browser component tests pass; no Writer runtime owner modified or coverage-only repair. No repository threshold, exclusion or coverage-map edits.
- Scope: original byte defaults/copy/narrowing/equality/hash/Any255-to-1 and byte-only extraction failures; shared paper-bin inheritance/default/copy and actual Calc159owned item-set clones. Existing signed/unsigned numeric owner contracts retained. After runtime verification, test-only readonly tuple annotations corrected TypeScript inference without changing emitted behavior; production sources and coverage locations are unchanged.

- Command: `node output/playwright/task139-checks/build-portable.mjs`.
- Result: pass.
- Evidence:production build with all4reference links absent/restored finally. Existing Vite chunk-size advisory remains.
- Scope: application compilation/bundling; no UI change and no browser-flow run required by this scope.

- Command: scoped `npx prettier --check`, `npx eslint ... --max-warnings 0`, `npm run typecheck`, `npm run check:docs`, `npm run check:file-size`, `npm run check:dependencies`, `npm run check:source-tree`, `npm run check:source-provenance`, `npm run inventory:parity`, `node .agentplane/policy/check-routing.mjs`, `ap doctor`, `git diff --check`, `npx vitest run scripts/check-module-boundaries.test.ts`.
- Result: pass after test tuple annotation correction.
- Evidence:1888authored JSDoc files;632runtime dependency sources/2828relative imports/92allowed edges;114required tree paths/33retired roots;633runtime/provenance records and zero semantic violations;37boundary tests. Same existing hook-shim warning.13source gates pass; retained initial failure/final logs distinguish the corrected test-only typing issue.
- Scope: exact29intentional paths within30approved,8runtime/provenance pairs and one bounded capability.3802to3811non-agent source hashes,20existing changes/9new/3782unchanged,8native source pins, original pinned HEAD and4reference links. Evidence: `output/playwright/task139-checks/verification.json`, `source-gates.json` and retained logs. Same-agent quality review is not independent.

Original numeric/localized presentation, native ABI/debug diagnostics and real ScDocumentPool/ScPatternAttr/ScColumn/ScTable/ScDocument/UI/ODS remain pending. Full-suite checkpoint is deferred by the human to actual minimum UI plus same-model ODS readiness, then fixes and pause; this value dependency does not yet satisfy that checkpoint.

## Rollback Plan

Revert only task changes through a subsequent authorized task; no destructive reset, merge or external publication.

## Findings

Source CntByteItem stores sal_uInt8 but QueryValue/PutValue use sal_Int8; retain255/-1 as defined source behavior rather than unsigned16 fallback. Original localized paper-bin presentation requires EditResId services not yet ported; do not add a fake provider or claim complete item parity. JS GC owns lifetime. Same-agent evaluator will not be independent.

- Observation: Initial typecheck rejected a new test pair array inferred as number[][] under noUncheckedIndexedAccess; runtime tests and coverage passed.
  Impact: Only test fixture typing, no production failure or scope drift.
  Resolution: Declare independent numeric witness pairs as readonly tuples using as const, then rerun typecheck and scoped format/lint; runtime semantics unchanged.
