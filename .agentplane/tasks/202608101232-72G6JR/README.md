---
id: "202608101232-72G6JR"
title: "Implement browser worker request cancellation protocol"
status: "DOING"
priority: "high"
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
  updated_at: "2026-08-10T12:32:54.247Z"
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
    body: "Start: implement approved browser worker request cancellation protocol."
events:
  -
    type: "status"
    at: "2026-08-10T12:32:54.888Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved browser worker request cancellation protocol."
doc_version: 3
doc_updated_at: "2026-08-10T12:32:54.888Z"
doc_updated_by: "CODER"
description: "Add a browser-independent typed worker request, result, error, and cancellation protocol with deterministic stale-result classification, focused tests, and documentation; exclude Worker spawning, document parsing, rendering, and UI progress handling."
sections:
  Summary: |-
    Implement browser worker request cancellation protocol

    Add a browser-independent typed worker request, result, error, and cancellation protocol with deterministic stale-result classification, focused tests, and documentation; exclude Worker spawning, document parsing, rendering, and UI progress handling.
  Scope: |-
    - In scope: Add a browser-independent typed worker request, result, error, and cancellation protocol with deterministic stale-result classification, focused tests, and documentation; exclude Worker spawning, document parsing, rendering, and UI progress handling.
    - Out of scope: unrelated refactors not required for "Implement browser worker request cancellation protocol".
  Plan: "1. Define JSON-compatible worker request, result, error, cancellation, and client-state contracts. 2. Implement pure request sequencing and stale-result/cancellation classification without Worker APIs. 3. Add complete tests for monotonically issued requests, matching results, stale results, cancellation, invalid identifiers, and immutable transitions. 4. Document protocol versioning and deferred Worker-runtime policy. 5. Run full verification, review, evaluator, and close."
  Verify Steps: |-
    1. Run strict TypeScript, ESLint, JSDoc, Prettier, and authored-file-size checks.
    2. Require 100% application coverage and unchanged 100% inventory coverage.
    3. Unit-test request sequencing, matching/stale results, cancellation, invalid identifiers, and immutable protocol state.
    4. Run npm run verify, agentplane doctor, and node .agentplane/policy/check-routing.mjs.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: ""
id_source: "generated"
---
## Summary

Implement browser worker request cancellation protocol

Add a browser-independent typed worker request, result, error, and cancellation protocol with deterministic stale-result classification, focused tests, and documentation; exclude Worker spawning, document parsing, rendering, and UI progress handling.

## Scope

- In scope: Add a browser-independent typed worker request, result, error, and cancellation protocol with deterministic stale-result classification, focused tests, and documentation; exclude Worker spawning, document parsing, rendering, and UI progress handling.
- Out of scope: unrelated refactors not required for "Implement browser worker request cancellation protocol".

## Plan

1. Define JSON-compatible worker request, result, error, cancellation, and client-state contracts. 2. Implement pure request sequencing and stale-result/cancellation classification without Worker APIs. 3. Add complete tests for monotonically issued requests, matching results, stale results, cancellation, invalid identifiers, and immutable transitions. 4. Document protocol versioning and deferred Worker-runtime policy. 5. Run full verification, review, evaluator, and close.

## Verify Steps

1. Run strict TypeScript, ESLint, JSDoc, Prettier, and authored-file-size checks.
2. Require 100% application coverage and unchanged 100% inventory coverage.
3. Unit-test request sequencing, matching/stale results, cancellation, invalid identifiers, and immutable protocol state.
4. Run npm run verify, agentplane doctor, and node .agentplane/policy/check-routing.mjs.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
