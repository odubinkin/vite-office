---
id: "202609211327-2J9NYP"
title: "Close remaining Writer P0 parity gaps"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-21T13:27:36.057Z"
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
    body: "Start: implement approved Writer P0-2, P0-3, and P0-5 remediation with focused and full verification."
events:
  -
    type: "status"
    at: "2026-09-21T13:27:41.632Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved Writer P0-2, P0-3, and P0-5 remediation with focused and full verification."
doc_version: 3
doc_updated_at: "2026-09-21T13:27:41.632Z"
doc_updated_by: "CODER"
description: "Fix audited P0-2, P0-3, and P0-5 discrepancies while keeping the P0-1 inventory model unchanged: make Sfx execution slot/request-driven, isolate browser projection and event DTOs from sw/source, and expose only paragraph styles with complete supported upstream defaults."
sections:
  Summary: "Close the remaining audited Writer P0-2, P0-3, and P0-5 gaps without changing P0-1 inventory mechanics."
  Scope: "In scope: Sfx slot/request/shell execution and state contracts; separation of command execution from presentation metadata; removal of paragraphId, DOM clipboard-event arguments, browser projections, and React snapshot ownership from sw/source; browser-side projection/store adapters; restriction of built-in paragraph-style creation and assignment to the source-backed supported set; completion of supported upstream defaults and ancestry; focused architecture, behavior, and regression tests. Out of scope: P0-1 inventory schema/closure behavior, broad P1/P2 refactors beyond the required boundary move, legacy persisted-schema compatibility, networking, publication, and unrelated UI changes."
  Plan: "Implement the approved seven-step P0-2/P0-3/P0-5 remediation and verification plan while preserving P0-1 mechanics."
  Verify Steps: |-
    1. Run focused Sfx tests proving shell priority, numeric-slot lookup, SfxRequest delivery/completion, slot-state queries, async state, and declarative presentation metadata.
    2. Run focused Writer/browser tests proving sw/source contains no paragraphId or DOM clipboard-event contracts, browser IDs resolve to SwPosition/SwPaM before shell entry, and browser snapshots are owned under sw/browser.
    3. Run exhaustive style tests proving only source-backed styles and their available ancestry can be created/assigned, unavailable built-ins fail before mutation, and every available style matches implemented pinned defaults.
    4. Run npm run format:check, npm run lint, npm run typecheck, npm run check:dependencies, npm run check:source-tree, and npm run check:source-provenance.
    5. Run npm run test:coverage, npm run test:inventory:coverage, npm run test:e2e, and npm run verify.
    6. Run ap doctor and node .agentplane/policy/check-routing.mjs.
    7. Inspect git diff --check and git status --short --untracked-files=all; only approved P0-2/P0-3/P0-5 code, tests, parity records, and task artifacts may change, with P0-1 mechanics untouched.
  Verification: "Pending implementation and verification."
  Rollback Plan: "Revert the implementation commit and deterministic Agentplane close commit; no external state or persisted-schema migration is involved."
  Findings: "Pending implementation findings."
id_source: "generated"
---
## Summary

Close the remaining audited Writer P0-2, P0-3, and P0-5 gaps without changing P0-1 inventory mechanics.

## Scope

In scope: Sfx slot/request/shell execution and state contracts; separation of command execution from presentation metadata; removal of paragraphId, DOM clipboard-event arguments, browser projections, and React snapshot ownership from sw/source; browser-side projection/store adapters; restriction of built-in paragraph-style creation and assignment to the source-backed supported set; completion of supported upstream defaults and ancestry; focused architecture, behavior, and regression tests. Out of scope: P0-1 inventory schema/closure behavior, broad P1/P2 refactors beyond the required boundary move, legacy persisted-schema compatibility, networking, publication, and unrelated UI changes.

## Plan

Implement the approved seven-step P0-2/P0-3/P0-5 remediation and verification plan while preserving P0-1 mechanics.

## Verify Steps

1. Run focused Sfx tests proving shell priority, numeric-slot lookup, SfxRequest delivery/completion, slot-state queries, async state, and declarative presentation metadata.
2. Run focused Writer/browser tests proving sw/source contains no paragraphId or DOM clipboard-event contracts, browser IDs resolve to SwPosition/SwPaM before shell entry, and browser snapshots are owned under sw/browser.
3. Run exhaustive style tests proving only source-backed styles and their available ancestry can be created/assigned, unavailable built-ins fail before mutation, and every available style matches implemented pinned defaults.
4. Run npm run format:check, npm run lint, npm run typecheck, npm run check:dependencies, npm run check:source-tree, and npm run check:source-provenance.
5. Run npm run test:coverage, npm run test:inventory:coverage, npm run test:e2e, and npm run verify.
6. Run ap doctor and node .agentplane/policy/check-routing.mjs.
7. Inspect git diff --check and git status --short --untracked-files=all; only approved P0-2/P0-3/P0-5 code, tests, parity records, and task artifacts may change, with P0-1 mechanics untouched.

## Verification

Pending implementation and verification.

## Rollback Plan

Revert the implementation commit and deterministic Agentplane close commit; no external state or persisted-schema migration is involved.

## Findings

Pending implementation findings.
