---
id: "202609150939-CENAC4"
title: "Phase 0.3 re-attest Writer capability slice"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on:
  - "202609150939-2VYYDP"
  - "202609150939-KAZPAN"
tags:
  - "code"
  - "parity"
task_kind: "code"
mutation_scope: "code"
verify:
  - "npm run check:source-provenance"
  - "npm run inventory:parity"
  - "npm run test:inventory:coverage"
plan_approval:
  state: "approved"
  updated_at: "2026-09-15T09:40:35.530Z"
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
    body: "Start: re-attest all 35 Writer capabilities with independent implementation, contract, behavior, default, and verification states."
events:
  -
    type: "status"
    at: "2026-09-15T10:06:10.349Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: re-attest all 35 Writer capabilities with independent implementation, contract, behavior, default, and verification states."
doc_version: 3
doc_updated_at: "2026-09-15T10:06:10.349Z"
doc_updated_by: "CODER"
description: "Re-attest all 35 Writer capabilities with separate implementation, contract, behavior, default, and verification status plus exact evidence."
sections:
  Summary: "Implement P0.3 by re-attesting all 35 Writer capabilities without conflating local implementation with upstream parity."
  Scope: "In scope: writer-command-slice schema and all 35 records, parity summary/reporting, exact upstream/local evidence references and differential assertions. CAP-0130 remains explicitly bounded. Out of scope: implementing gaps assigned to later phases."
  Plan: |-
    1. Migrate the capability schema to separate implemented, contractParity, behaviorParity, defaultParity, and verified fields.
    2. Re-attest every CAP-0101 through CAP-0135 record against P0.1/P0.2 evidence.
    3. Demote claims supported only by path presence, local-behavior tests, or placeholders.
    4. Preserve CAP-0130 as bounded ODT round-trip verification.
    5. Update validation and summary logic so unresolved P0 defects prevent parity success.
  Verify Steps: |-
    1. Run focused parity-mapping tests; expect all 35 records to require five independent status fields and exact evidence.
    2. Inspect the generated summary; expect implemented counts to remain distinct from contract/default/behavior parity and verification.
    3. Confirm CAP-0130 is labelled bounded and no unresolved P0 capability reports parity.
    4. Run npm run test:inventory:coverage.
    5. Run npm run inventory:parity.
    6. Run npm run check:source-provenance.
  Verification: "Pending execution."
  Rollback Plan: "Revert the task commit to restore the previous capability schema and records, then regenerate any derived parity output."
  Findings: "None yet."
id_source: "generated"
---
## Summary

Implement P0.3 by re-attesting all 35 Writer capabilities without conflating local implementation with upstream parity.

## Scope

In scope: writer-command-slice schema and all 35 records, parity summary/reporting, exact upstream/local evidence references and differential assertions. CAP-0130 remains explicitly bounded. Out of scope: implementing gaps assigned to later phases.

## Plan

1. Migrate the capability schema to separate implemented, contractParity, behaviorParity, defaultParity, and verified fields.
2. Re-attest every CAP-0101 through CAP-0135 record against P0.1/P0.2 evidence.
3. Demote claims supported only by path presence, local-behavior tests, or placeholders.
4. Preserve CAP-0130 as bounded ODT round-trip verification.
5. Update validation and summary logic so unresolved P0 defects prevent parity success.

## Verify Steps

1. Run focused parity-mapping tests; expect all 35 records to require five independent status fields and exact evidence.
2. Inspect the generated summary; expect implemented counts to remain distinct from contract/default/behavior parity and verification.
3. Confirm CAP-0130 is labelled bounded and no unresolved P0 capability reports parity.
4. Run npm run test:inventory:coverage.
5. Run npm run inventory:parity.
6. Run npm run check:source-provenance.

## Verification

Pending execution.

## Rollback Plan

Revert the task commit to restore the previous capability schema and records, then regenerate any derived parity output.

## Findings

None yet.
