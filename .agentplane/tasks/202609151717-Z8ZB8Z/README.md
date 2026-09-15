---
id: "202609151717-Z8ZB8Z"
title: "Implement Writer upstream parity Phase 7"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "frontend"
  - "parity"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-15T17:18:01.675Z"
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
    body: "Start: implement approved Phase 7 filter, persistence, recovery, and bounded ODT parity scope against pinned LibreOffice evidence."
events:
  -
    type: "status"
    at: "2026-09-15T17:18:07.740Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved Phase 7 filter, persistence, recovery, and bounded ODT parity scope against pinned LibreOffice evidence."
doc_version: 3
doc_updated_at: "2026-09-15T17:18:07.740Z"
doc_updated_by: "CODER"
description: "Align Writer XML filters, browser persistence, AutoRecovery ownership, and bounded ODT parity evidence with pinned LibreOffice 26.8.0.2. Reject prior persisted schemas without compatibility."
sections:
  Summary: "Implement Phase 7 of the approved upstream parity plan: bounded xmloff context ownership, external versioned Writer codecs, SfxMedium-backed browser persistence, framework-owned AutoRecovery, and broadened pinned ODT parity evidence."
  Scope: "In scope: apps/office Writer XML/package filters, xmloff contexts used by the supported slice, browser persistence codecs and IndexedDB ports, SfxObjectShell/SfxMedium recovery integration, browser recovery composition, focused tests/fixtures, and parity inventory updates required by changed modules. Preserve the pinned LibreOffice 26.8.0.2 ownership and source layout where browser/TypeScript constraints permit. Reject every prior stored schema; do not add compatibility or migrations. Exclude unrelated Writer features and non-Writer suites."
  Plan: |-
    1. Compare current filter, persistence, and recovery contracts with pinned upstream source and tests.
    2. Refactor supported XML import/export into bounded xmloff context/token ownership and remove lifecycle DTOs from filter APIs.
    3. Introduce explicit current-only storage envelopes carrying codec, model-version, and pinned baseline identifiers outside the core graph.
    4. Route primary and recovery storage through SfxMedium/object-shell contracts; harden interrupted writes, leases, corruption fallback, and newest-valid-generation selection.
    5. Align framework AutoRecovery registration, modified-state checks, recovery entry lifecycle, and completion while retaining browser timers/events in composition.
    6. Add pinned ODT fixtures and normalized package/XML plus reopen tests for the supported Writer feature slice and documented browser limits.
    7. Run targeted tests, full repository verification, routing checks, record evidence, commit only Phase 7 changes, finish the task, and push main.
  Verify Steps: |-
    1. npm run typecheck
    2. npm run test:coverage
    3. npm run test:inventory:coverage
    4. npm run test:e2e
    5. npm run verify
    6. node .agentplane/policy/check-routing.mjs
    7. ap doctor
    8. git status --short --untracked-files=all
    Acceptance: current storage envelope includes explicit codec/model/baseline identifiers and rejects all prior schemas; filters accept canonical Writer graph plus filter-owned metadata rather than lifecycle DTOs; primary and recovery paths use SfxMedium/object-shell contracts; recovery tests cover modified registration, completion, lease contention, corruption and newest-valid fallback; ODT tests cover paragraph, character, hyperlink, style, list, metadata and manifest reopen behavior.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the Phase 7 implementation commit and deterministic task-close commit. Browser copies written with the new schema may be discarded; no backward compatibility is promised. Restore only the previous filter/persistence/recovery code and tests without touching unrelated user changes."
  Findings: ""
id_source: "generated"
---
## Summary

Implement Phase 7 of the approved upstream parity plan: bounded xmloff context ownership, external versioned Writer codecs, SfxMedium-backed browser persistence, framework-owned AutoRecovery, and broadened pinned ODT parity evidence.

## Scope

In scope: apps/office Writer XML/package filters, xmloff contexts used by the supported slice, browser persistence codecs and IndexedDB ports, SfxObjectShell/SfxMedium recovery integration, browser recovery composition, focused tests/fixtures, and parity inventory updates required by changed modules. Preserve the pinned LibreOffice 26.8.0.2 ownership and source layout where browser/TypeScript constraints permit. Reject every prior stored schema; do not add compatibility or migrations. Exclude unrelated Writer features and non-Writer suites.

## Plan

1. Compare current filter, persistence, and recovery contracts with pinned upstream source and tests.
2. Refactor supported XML import/export into bounded xmloff context/token ownership and remove lifecycle DTOs from filter APIs.
3. Introduce explicit current-only storage envelopes carrying codec, model-version, and pinned baseline identifiers outside the core graph.
4. Route primary and recovery storage through SfxMedium/object-shell contracts; harden interrupted writes, leases, corruption fallback, and newest-valid-generation selection.
5. Align framework AutoRecovery registration, modified-state checks, recovery entry lifecycle, and completion while retaining browser timers/events in composition.
6. Add pinned ODT fixtures and normalized package/XML plus reopen tests for the supported Writer feature slice and documented browser limits.
7. Run targeted tests, full repository verification, routing checks, record evidence, commit only Phase 7 changes, finish the task, and push main.

## Verify Steps

1. npm run typecheck
2. npm run test:coverage
3. npm run test:inventory:coverage
4. npm run test:e2e
5. npm run verify
6. node .agentplane/policy/check-routing.mjs
7. ap doctor
8. git status --short --untracked-files=all
Acceptance: current storage envelope includes explicit codec/model/baseline identifiers and rejects all prior schemas; filters accept canonical Writer graph plus filter-owned metadata rather than lifecycle DTOs; primary and recovery paths use SfxMedium/object-shell contracts; recovery tests cover modified registration, completion, lease contention, corruption and newest-valid fallback; ODT tests cover paragraph, character, hyperlink, style, list, metadata and manifest reopen behavior.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the Phase 7 implementation commit and deterministic task-close commit. Browser copies written with the new schema may be discarded; no backward compatibility is promised. Restore only the previous filter/persistence/recovery code and tests without touching unrelated user changes.

## Findings
