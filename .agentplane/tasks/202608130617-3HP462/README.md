---
id: "202608130617-3HP462"
title: "Serialize Writer list selections as semantic clipboard HTML"
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
  updated_at: "2026-08-13T06:18:08.742Z"
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
    body: "Start: implement semantic Writer list clipboard transfer through the current clipboard serializer."
events:
  -
    type: "status"
    at: "2026-08-13T06:18:09.335Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement semantic Writer list clipboard transfer through the current clipboard serializer."
doc_version: 3
doc_updated_at: "2026-08-13T06:18:09.335Z"
doc_updated_by: "CODER"
description: "Make copied contiguous Writer list selections interoperate through semantic ul/ol/li HTML and list-aware plain text while preserving existing non-list and partial-selection behavior."
sections:
  Summary: |-
    Serialize Writer list selections as semantic clipboard HTML

    Make copied contiguous Writer list selections interoperate through semantic ul/ol/li HTML and list-aware plain text while preserving existing non-list and partial-selection behavior.
  Scope: |-
    - In scope: Make copied contiguous Writer list selections interoperate through semantic ul/ol/li HTML and list-aware plain text while preserving existing non-list and partial-selection behavior.
    - Out of scope: unrelated refactors not required for "Serialize Writer list selections as semantic clipboard HTML".
  Plan: "1. Map semantic Writer list clipboard transfer to pinned copy/list source, tests, and Help evidence. 2. Extend the  Writer selection serializer so complete contiguous list items become semantic ul/ol/li HTML and readable list-aware plain text, while partial selections and non-list paragraphs keep their current exact behavior. 3. Verify browser clipboard adapters consume the richer payload without exposing accessibility-only text or DOM marker artifacts. 4. Add unit, integration, focused Chromium, documentation, and parity evidence; record remaining list transfer gaps as future work. 5. Run fast coverage and focused clipboard browser verification, deferring the aggregate suite under the approved cadence."
  Verify Steps: |-
    1. Run npm run test:coverage. Expected: all office tests pass at 100 percent coverage, including semantic list and partial-selection clipboard paths.
    2. Run npm run test:e2e -- --grep "Writer list clipboard". Expected: production Chromium exposes semantic list HTML and readable plain text without copying hidden descriptions or DOM-only markers.
    3. Run npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference. Expected: the new semantic-list clipboard record resolves pinned implementation, test, Help, and local evidence.
    4. Run npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs. Expected: all pass.
    5. Defer npm run verify, static smoke, inventory coverage, and the full browser matrix under the user-approved ten-task cadence; record residual risk.
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

Serialize Writer list selections as semantic clipboard HTML

Make copied contiguous Writer list selections interoperate through semantic ul/ol/li HTML and list-aware plain text while preserving existing non-list and partial-selection behavior.

## Scope

- In scope: Make copied contiguous Writer list selections interoperate through semantic ul/ol/li HTML and list-aware plain text while preserving existing non-list and partial-selection behavior.
- Out of scope: unrelated refactors not required for "Serialize Writer list selections as semantic clipboard HTML".

## Plan

1. Map semantic Writer list clipboard transfer to pinned copy/list source, tests, and Help evidence. 2. Extend the  Writer selection serializer so complete contiguous list items become semantic ul/ol/li HTML and readable list-aware plain text, while partial selections and non-list paragraphs keep their current exact behavior. 3. Verify browser clipboard adapters consume the richer payload without exposing accessibility-only text or DOM marker artifacts. 4. Add unit, integration, focused Chromium, documentation, and parity evidence; record remaining list transfer gaps as future work. 5. Run fast coverage and focused clipboard browser verification, deferring the aggregate suite under the approved cadence.

## Verify Steps

1. Run npm run test:coverage. Expected: all office tests pass at 100 percent coverage, including semantic list and partial-selection clipboard paths.
2. Run npm run test:e2e -- --grep "Writer list clipboard". Expected: production Chromium exposes semantic list HTML and readable plain text without copying hidden descriptions or DOM-only markers.
3. Run npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference. Expected: the new semantic-list clipboard record resolves pinned implementation, test, Help, and local evidence.
4. Run npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs. Expected: all pass.
5. Defer npm run verify, static smoke, inventory coverage, and the full browser matrix under the user-approved ten-task cadence; record residual risk.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
