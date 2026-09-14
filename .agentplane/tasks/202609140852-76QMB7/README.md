---
id: "202609140852-76QMB7"
title: "Implement stage 5 document medium, storage, and recovery"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-14T08:54:46.782Z"
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
    body: "Start: Implement the approved Stage 5 medium, persistence, and recovery architecture with focused acceptance tests and full local verification."
events:
  -
    type: "status"
    at: "2026-09-14T08:54:53.048Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement the approved Stage 5 medium, persistence, and recovery architecture with focused acceptance tests and full local verification."
doc_version: 3
doc_updated_at: "2026-09-14T08:54:53.048Z"
doc_updated_by: "CODER"
description: "Implement section 9 of docs/program/vite-office-upstream-parity-plan.md with LibreOffice-aligned medium semantics, storage separation, application-owned recovery, browser recovery safety, and tests."
sections:
  Summary: "Implement Stage 5 (section 9) of the upstream parity plan: explicit SfxMedium-like state, distinct document I/O semantics, application-owned recovery orchestration, and browser-safe durable recovery behavior."
  Scope: "In scope: sfx2 document medium and lifecycle descriptors; Writer document-shell primary/open/export/recovery operations; framework AutoRecovery ownership and scheduling hooks; IndexedDB transactional recovery generations, cleanup, and coordination primitives; Writer session composition; focused unit/integration tests. Preserve upstream SfxMedium/SfxObjectShell/AutoRecovery separation while adapting native lockfiles and file URLs to browser capabilities. Out of scope: Stage 6 worker/filter refactor, new document formats, remote backends, and UI redesign."
  Plan: "1. Replace the minimal medium shape with validated immutable medium state covering origin, source/destination, filter, identity, generations, capabilities, and last operation. 2. Make SwDocShell the document-level owner of Open, Save, Save As, Export, Recovery Save, and Download semantics, acknowledging primary saves only after confirmed writable-medium completion. 3. Add a framework-owned AutoRecovery service that observes multiple document shells, serializes changed generations, records success/failure callbacks, schedules interval/page lifecycle saves, restores the latest intact snapshot, and coordinates per-document writes. 4. Extend IndexedDB persistence to retain ordered recovery generations transactionally with bounded cleanup and exact latest-snapshot recovery. 5. Wire the Writer composition root and browser lifecycle adapters while keeping React presentational. 6. Add acceptance tests for section 9.6 and run project verification."
  Verify Steps: |-
    1. pnpm --filter @vite-office/office exec vitest run src/sfx2/source/doc/docfile.test.ts src/sw/source/uibase/app/docsh.test.ts src/framework/source/services/autorecovery.test.ts src/vcl/browser/indexeddb-storage.test.ts src/sw/source/uibase/uiview/view-session.test.tsx
    2. pnpm --filter @vite-office/office test
    3. pnpm --filter @vite-office/office typecheck
    4. pnpm --filter @vite-office/office lint
    5. pnpm --filter @vite-office/office build
    6. pnpm check:jsdoc
    7. pnpm check:file-size
    8. node .agentplane/policy/check-routing.mjs
    Acceptance: sequential dirty generations create distinct recovery snapshots; failed recovery does not acknowledge; successful primary save alone changes modified state; Export/Download do not replace or acknowledge the primary medium; latest intact recovery survives reload; concurrent tabs/writers cannot silently overwrite one document.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only the implementation commit(s) and task close commit for 202609140852-76QMB7. The changes are additive/local to the medium, recovery, IndexedDB, Writer shell/session, and tests; no persistent schema migration may delete existing browser data."
  Findings: |-
    No material drift identified at planning time. Network access is not approved; implementation will rely on the repository's pinned upstream mappings and local code only.

    - Observation: Task documentation command used unsupported section name Rollback.
      Impact: Rollback Plan was not populated; no implementation files were changed.
      Resolution: Use the doc_version=3 section name Rollback Plan and re-run task validation.
      Promotion: incident-candidate
      Fixability: repo-fixable
id_source: "generated"
---
## Summary

Implement Stage 5 (section 9) of the upstream parity plan: explicit SfxMedium-like state, distinct document I/O semantics, application-owned recovery orchestration, and browser-safe durable recovery behavior.

## Scope

In scope: sfx2 document medium and lifecycle descriptors; Writer document-shell primary/open/export/recovery operations; framework AutoRecovery ownership and scheduling hooks; IndexedDB transactional recovery generations, cleanup, and coordination primitives; Writer session composition; focused unit/integration tests. Preserve upstream SfxMedium/SfxObjectShell/AutoRecovery separation while adapting native lockfiles and file URLs to browser capabilities. Out of scope: Stage 6 worker/filter refactor, new document formats, remote backends, and UI redesign.

## Plan

1. Replace the minimal medium shape with validated immutable medium state covering origin, source/destination, filter, identity, generations, capabilities, and last operation. 2. Make SwDocShell the document-level owner of Open, Save, Save As, Export, Recovery Save, and Download semantics, acknowledging primary saves only after confirmed writable-medium completion. 3. Add a framework-owned AutoRecovery service that observes multiple document shells, serializes changed generations, records success/failure callbacks, schedules interval/page lifecycle saves, restores the latest intact snapshot, and coordinates per-document writes. 4. Extend IndexedDB persistence to retain ordered recovery generations transactionally with bounded cleanup and exact latest-snapshot recovery. 5. Wire the Writer composition root and browser lifecycle adapters while keeping React presentational. 6. Add acceptance tests for section 9.6 and run project verification.

## Verify Steps

1. pnpm --filter @vite-office/office exec vitest run src/sfx2/source/doc/docfile.test.ts src/sw/source/uibase/app/docsh.test.ts src/framework/source/services/autorecovery.test.ts src/vcl/browser/indexeddb-storage.test.ts src/sw/source/uibase/uiview/view-session.test.tsx
2. pnpm --filter @vite-office/office test
3. pnpm --filter @vite-office/office typecheck
4. pnpm --filter @vite-office/office lint
5. pnpm --filter @vite-office/office build
6. pnpm check:jsdoc
7. pnpm check:file-size
8. node .agentplane/policy/check-routing.mjs
Acceptance: sequential dirty generations create distinct recovery snapshots; failed recovery does not acknowledge; successful primary save alone changes modified state; Export/Download do not replace or acknowledge the primary medium; latest intact recovery survives reload; concurrent tabs/writers cannot silently overwrite one document.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only the implementation commit(s) and task close commit for 202609140852-76QMB7. The changes are additive/local to the medium, recovery, IndexedDB, Writer shell/session, and tests; no persistent schema migration may delete existing browser data.

## Findings

No material drift identified at planning time. Network access is not approved; implementation will rely on the repository's pinned upstream mappings and local code only.

- Observation: Task documentation command used unsupported section name Rollback.
  Impact: Rollback Plan was not populated; no implementation files were changed.
  Resolution: Use the doc_version=3 section name Rollback Plan and re-run task validation.
  Promotion: incident-candidate
  Fixability: repo-fixable
