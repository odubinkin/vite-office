---
id: "202609140950-74FBSQ"
title: "Implement stage 6 ODT worker pipeline"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "frontend"
task_kind: "code"
mutation_scope: "code"
verify:
  - "node .agentplane/policy/check-routing.mjs"
  - "npm run check:dependencies"
  - "npm run check:docs"
  - "npm run check:file-size"
  - "npm run inventory:parity"
  - "npm run lint"
  - "npm run test:coverage --workspace @vite-office/office"
  - "npm run test:e2e -- --grep ODT"
  - "npm run typecheck"
plan_approval:
  state: "approved"
  updated_at: "2026-09-14T09:51:29.793Z"
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
    body: "Start: Implement the approved Stage 6 ODT worker pipeline against the pinned LibreOffice reference, including cancellation, atomic integration, bounded resources, and declared verification."
events:
  -
    type: "status"
    at: "2026-09-14T09:51:35.324Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement the approved Stage 6 ODT worker pipeline against the pinned LibreOffice reference, including cancellation, atomic integration, bounded resources, and declared verification."
doc_version: 3
doc_updated_at: "2026-09-14T09:51:35.324Z"
doc_updated_by: "CODER"
description: "Implement section 10 (Stage 6) of docs/program/vite-office-upstream-parity-plan.md: move bounded ODT import/export ZIP and XML work behind a real versioned Web Worker protocol with cancellation, stale-result rejection, structured errors, transferables, resource limits, atomic document replacement, upstream-pinned semantic fixtures, and explicit STORE-only export constraints, staying maximally aligned with pinned LibreOffice ownership and behavior."
sections:
  Summary: |-
    Implement stage 6 ODT worker pipeline

    Implement section 10 (Stage 6) of docs/program/vite-office-upstream-parity-plan.md: move bounded ODT import/export ZIP and XML work behind a real versioned Web Worker protocol with cancellation, stale-result rejection, structured errors, transferables, resource limits, atomic document replacement, upstream-pinned semantic fixtures, and explicit STORE-only export constraints, staying maximally aligned with pinned LibreOffice ownership and behavior.
  Scope: |-
    - In scope: the bounded ODT import/export pipeline under `apps/office/src/{framework,package,xmloff,sw,vcl}`; the Writer document-shell integration; Web Worker entry/runtime; cancellation, stale-result rejection, transferable buffers, structured errors, protocol versioning, resource limits; semantic ODT fixtures/tests; parity/runtime records and Stage 6 documentation.
    - Upstream reference: the pinned local checkout at `vendor/libreoffice-reference` and baseline commit `9bc445578031fecf56086729d8e4940c77e14d65`; preserve LibreOffice package/xmloff/sw ownership and observable ODT semantics while adapting worker/browser plumbing.
    - Out of scope: unsupported ODT features, DEFLATE export, server-side services, unrelated Writer features, and byte-for-byte archive equivalence.
  Plan: |-
    1. Inspect the existing ODT, package, worker-protocol, document-shell, and browser medium paths, plus the exact pinned LibreOffice package/xmloff/sw counterparts and tests.
    2. Implement a real versioned ODT worker boundary whose import and export requests carry IDs, use transferable buffers, report typed progress/errors, support cancellation/disposal, reject stale results, and keep heavy ZIP/XML work off the UI path.
    3. Route Writer open/save/export through the worker service while validating the neutral result on the main thread and replacing the active SwDoc atomically only after complete success; retain the existing document on failure/cancellation.
    4. Enforce bounded archive/XML/resource behavior and keep STORE-only export explicit and size-controlled.
    5. Add upstream-pinned fixtures and focused unit/integration/E2E coverage for semantic roundtrip, malformed input, cancellation, stale results, transfer semantics, and session atomicity; update parity/runtime and technical documentation.
    6. Run all declared verification and Agentplane checks, record evidence, and finish the task without unrelated changes.
  Verify Steps: |-
    1. Run `npm run test:coverage --workspace @vite-office/office`. Expected: all office tests pass, including worker protocol/service, ODT semantic roundtrip, malformed-resource limits, cancellation/stale-result behavior, and atomic document-shell integration.
    2. Run `npm run typecheck`. Expected: worker messages, transferables, neutral ODT results, and document-shell integration type-check in both app and tooling projects.
    3. Run `npm run lint`. Expected: all changed TypeScript/TSX and tests pass lint with no warnings.
    4. Run `npm run check:dependencies`. Expected: package → xmloff → sw/filter → document-shell/browser boundaries remain valid with worker/browser code at the framework edge.
    5. Run `npm run check:docs`. Expected: all added public/internal symbols have the required JSDoc and file overviews.
    6. Run `npm run check:file-size`. Expected: no authored file violates the mandatory size threshold.
    7. Run `npm run inventory:parity`. Expected: Stage 6 runtime/parity mappings validate against the pinned local LibreOffice checkout.
    8. Run `npm run test:e2e -- --grep ODT`. Expected: ODT open/export scenarios pass through the worker-backed UI path.
    9. Run `npm run build`. Expected: Vite emits the worker and application static bundles successfully.
    10. Run `node .agentplane/policy/check-routing.mjs`. Expected: Agentplane policy routing remains valid.
    11. Inspect `git diff --check` and `git status --short --untracked-files=all`. Expected: no whitespace errors or unintended artifacts; the pre-existing untracked parity plan remains preserved.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert only the implementation and task close commits for `202609140950-74FBSQ`; do not remove the pre-existing untracked Stage 6 plan.
    - Re-run the focused ODT tests, typecheck, dependency check, and production build to confirm the prior synchronous path is restored.
  Findings: ""
id_source: "generated"
---
## Summary

Implement stage 6 ODT worker pipeline

Implement section 10 (Stage 6) of docs/program/vite-office-upstream-parity-plan.md: move bounded ODT import/export ZIP and XML work behind a real versioned Web Worker protocol with cancellation, stale-result rejection, structured errors, transferables, resource limits, atomic document replacement, upstream-pinned semantic fixtures, and explicit STORE-only export constraints, staying maximally aligned with pinned LibreOffice ownership and behavior.

## Scope

- In scope: the bounded ODT import/export pipeline under `apps/office/src/{framework,package,xmloff,sw,vcl}`; the Writer document-shell integration; Web Worker entry/runtime; cancellation, stale-result rejection, transferable buffers, structured errors, protocol versioning, resource limits; semantic ODT fixtures/tests; parity/runtime records and Stage 6 documentation.
- Upstream reference: the pinned local checkout at `vendor/libreoffice-reference` and baseline commit `9bc445578031fecf56086729d8e4940c77e14d65`; preserve LibreOffice package/xmloff/sw ownership and observable ODT semantics while adapting worker/browser plumbing.
- Out of scope: unsupported ODT features, DEFLATE export, server-side services, unrelated Writer features, and byte-for-byte archive equivalence.

## Plan

1. Inspect the existing ODT, package, worker-protocol, document-shell, and browser medium paths, plus the exact pinned LibreOffice package/xmloff/sw counterparts and tests.
2. Implement a real versioned ODT worker boundary whose import and export requests carry IDs, use transferable buffers, report typed progress/errors, support cancellation/disposal, reject stale results, and keep heavy ZIP/XML work off the UI path.
3. Route Writer open/save/export through the worker service while validating the neutral result on the main thread and replacing the active SwDoc atomically only after complete success; retain the existing document on failure/cancellation.
4. Enforce bounded archive/XML/resource behavior and keep STORE-only export explicit and size-controlled.
5. Add upstream-pinned fixtures and focused unit/integration/E2E coverage for semantic roundtrip, malformed input, cancellation, stale results, transfer semantics, and session atomicity; update parity/runtime and technical documentation.
6. Run all declared verification and Agentplane checks, record evidence, and finish the task without unrelated changes.

## Verify Steps

1. Run `npm run test:coverage --workspace @vite-office/office`. Expected: all office tests pass, including worker protocol/service, ODT semantic roundtrip, malformed-resource limits, cancellation/stale-result behavior, and atomic document-shell integration.
2. Run `npm run typecheck`. Expected: worker messages, transferables, neutral ODT results, and document-shell integration type-check in both app and tooling projects.
3. Run `npm run lint`. Expected: all changed TypeScript/TSX and tests pass lint with no warnings.
4. Run `npm run check:dependencies`. Expected: package → xmloff → sw/filter → document-shell/browser boundaries remain valid with worker/browser code at the framework edge.
5. Run `npm run check:docs`. Expected: all added public/internal symbols have the required JSDoc and file overviews.
6. Run `npm run check:file-size`. Expected: no authored file violates the mandatory size threshold.
7. Run `npm run inventory:parity`. Expected: Stage 6 runtime/parity mappings validate against the pinned local LibreOffice checkout.
8. Run `npm run test:e2e -- --grep ODT`. Expected: ODT open/export scenarios pass through the worker-backed UI path.
9. Run `npm run build`. Expected: Vite emits the worker and application static bundles successfully.
10. Run `node .agentplane/policy/check-routing.mjs`. Expected: Agentplane policy routing remains valid.
11. Inspect `git diff --check` and `git status --short --untracked-files=all`. Expected: no whitespace errors or unintended artifacts; the pre-existing untracked parity plan remains preserved.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert only the implementation and task close commits for `202609140950-74FBSQ`; do not remove the pre-existing untracked Stage 6 plan.
- Re-run the focused ODT tests, typecheck, dependency check, and production build to confirm the prior synchronous path is restored.

## Findings
