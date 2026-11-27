---
id: "202611270615-N5GDD4"
title: "Reconcile Writer and shared ODF provenance after branch integration"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "docs"
  - "odt"
  - "writer"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T06:15:53.930Z"
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
    at: "2026-11-27T06:16:22.198Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-11-27T06:16:22.198Z"
doc_updated_by: "CODER"
description: "Restore traceable references to native ODT character effects, rotation, annotation and paragraph line numbering after the Writer and Calc integration. Re-run the affected existing tests and repository provenance and registry checks."
sections:
  Summary: "Reconcile the Writer and shared ODF registry evidence affected by the main-branch integration."
  Scope: "Canonical shared and Writer ODF runtime/provenance records for native paragraph line numbering, character line modes, rotation, overline, outline, shadow, relief and annotation rich text. Retain precise existing test and source markers."
  Plan: "Rebind stale Writer and shared ODF provenance to the moved owners and equivalent tests, and rerun their existing tests and registry gates."
  Verify Steps: |-
    - Run source provenance, Calc and Writer registry invariants, and canonical evidence discovery.
    - Run the affected existing Writer ODT, shared text-property, and default-property tests.
    - Check changed registry formatting, policy routing, AgentPlane doctor and git diff integrity.
  Verification: "Pending verification."
  Rollback Plan: "Revert the registry evidence commit."
  Findings: "The Calc annotation task exposed stale global and shared evidence in the merged baseline. Its native Calc provenance and focused 44-test run passed independently."
id_source: "generated"
---
## Summary

Reconcile the Writer and shared ODF registry evidence affected by the main-branch integration.

## Scope

Canonical shared and Writer ODF runtime/provenance records for native paragraph line numbering, character line modes, rotation, overline, outline, shadow, relief and annotation rich text. Retain precise existing test and source markers.

## Plan

Rebind stale Writer and shared ODF provenance to the moved owners and equivalent tests, and rerun their existing tests and registry gates.

## Verify Steps

- Run source provenance, Calc and Writer registry invariants, and canonical evidence discovery.
- Run the affected existing Writer ODT, shared text-property, and default-property tests.
- Check changed registry formatting, policy routing, AgentPlane doctor and git diff integrity.

## Verification

Pending verification.

## Rollback Plan

Revert the registry evidence commit.

## Findings

The Calc annotation task exposed stale global and shared evidence in the merged baseline. Its native Calc provenance and focused 44-test run passed independently.
