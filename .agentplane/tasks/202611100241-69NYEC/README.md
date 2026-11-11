---
id: "202611100241-69NYEC"
title: "Integrate current native Writer filters and Calc CSV changes into main"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify:
  - "ap doctor"
  - "node .agentplane/policy/check-routing.mjs"
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-11-10T02:42:04.354Z"
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
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-11-10T02:42:08.314Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-11-11T09:35:41.965Z"
doc_updated_by: "CODER"
description: "November synchronization of Writer 0d5e5b16c and Calc 2eded1223 with main, including full verification, integration regression repairs, and reverse synchronization. Prior integration 581KM2 retains its historical coverage dependency."
sections:
  Summary: "Publish the current Writer and Calc tips, integrate both branches into main, and synchronize the development branches."
  Scope: "The three named checkouts, fast-forward pushes, merges, conflict resolution, verification, regression repairs and tests, and the Calc and Writer upstream findings journals."
  Plan: "Publish writer and calc, fetch all three refs in vite-office, merge both branches into main, resolve conflicts and verify, publish main, then fetch and merge main back into writer and calc and publish those refs."
  Verify Steps: |-
    1. Run npm run verify on integrated main. If the aggregate script stops early, run the remaining component checks and record any failed gates.
    2. Run ap doctor and node .agentplane/policy/check-routing.mjs.
    3. Verify that main contains both input tips, both development branches contain published main, each checkout is on its designated branch, and all three local tips match origin. Check full Git status and preserve pre-existing Calc output.
  Verification: "Pending."
  Rollback Plan: "Keep the original tips in history. Resolve locally before publishing main and use revert commits if a published correction is needed."
  Findings: |-
    Writer and Calc input tips were published and merged into main. Shared source owners were reconciled against pinned LibreOffice and ICU sources. Full app coverage replay on Node 24 executed 29,837 tests: 29,824 passed, 13 failed, with two additional worker startup errors. Focused repairs and replays are in progress. The retained 100% coverage gate failed: statements 97.64%, branches 95.43%, functions 99.33%, lines 98.26%. Coverage thresholds have not been lowered. The inventory coverage and browser replays are also in progress; no final green verification is claimed.

    The native UNO numbering service applies PropertyValue entries in sequence order. The port's XML importer incorrectly emitted ListFormat before ParentNumbering. The pinned xmloff/source/style/xmlnumi.cxx emits ListFormat last; the port now preserves that order and the existing explicit-pattern ODT round-trip test remains unchanged. WRITER424 records the underlying order-sensitive upstream API contract. Native patched ICU observations were independently compiled using the existing LibreOffice-patched ICU library and original C++ Unicode word methods; the stock ICU observation fixture is retained separately.
id_source: "generated"
---
## Summary

Publish the current Writer and Calc tips, integrate both branches into main, and synchronize the development branches.

## Scope

The three named checkouts, fast-forward pushes, merges, conflict resolution, verification, regression repairs and tests, and the Calc and Writer upstream findings journals.

## Plan

Publish writer and calc, fetch all three refs in vite-office, merge both branches into main, resolve conflicts and verify, publish main, then fetch and merge main back into writer and calc and publish those refs.

## Verify Steps

1. Run npm run verify on integrated main. If the aggregate script stops early, run the remaining component checks and record any failed gates.
2. Run ap doctor and node .agentplane/policy/check-routing.mjs.
3. Verify that main contains both input tips, both development branches contain published main, each checkout is on its designated branch, and all three local tips match origin. Check full Git status and preserve pre-existing Calc output.

## Verification

Pending.

## Rollback Plan

Keep the original tips in history. Resolve locally before publishing main and use revert commits if a published correction is needed.

## Findings

Writer and Calc input tips were published and merged into main. Shared source owners were reconciled against pinned LibreOffice and ICU sources. Full app coverage replay on Node 24 executed 29,837 tests: 29,824 passed, 13 failed, with two additional worker startup errors. Focused repairs and replays are in progress. The retained 100% coverage gate failed: statements 97.64%, branches 95.43%, functions 99.33%, lines 98.26%. Coverage thresholds have not been lowered. The inventory coverage and browser replays are also in progress; no final green verification is claimed.

The native UNO numbering service applies PropertyValue entries in sequence order. The port's XML importer incorrectly emitted ListFormat before ParentNumbering. The pinned xmloff/source/style/xmlnumi.cxx emits ListFormat last; the port now preserves that order and the existing explicit-pattern ODT round-trip test remains unchanged. WRITER424 records the underlying order-sensitive upstream API contract. Native patched ICU observations were independently compiled using the existing LibreOffice-patched ICU library and original C++ Unicode word methods; the stock ICU observation fixture is retained separately.
