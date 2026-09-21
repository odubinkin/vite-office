---
id: "202609211752-HPT0S8"
title: "Fix P2 ownership enforcement gaps"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-21T17:53:03.701Z"
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
    at: "2026-09-21T17:53:15.409Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-09-21T17:53:15.409Z"
doc_updated_by: "CODER"
description: "Follow up P2 by enforcing browser and Sfx ownership across runtime modules, strengthening filename-divergence stack-necessity evidence, and adding negative tests."
sections:
  Summary: "Close the two P2-2 enforcement gaps found during review: browser/Sfx ownership coverage and auditable filename-divergence stack necessity."
  Scope: "Update scripts/check-module-boundaries.mjs and its tests to classify browser directories across runtime modules, enforce upstream-mechanism/core-to-browser prohibitions, and cover Sfx responsibility edges. Update the source-provenance filename-divergence contract, manifest records, and tests with structured stack-necessity evidence. Do not change Writer product behavior or broaden parity claims."
  Plan: "1. Generalize runtime ownership classification and add negative cases for cross-module browser imports plus Sfx boundaries. 2. Replace the phrase heuristic for filename divergences with structured necessity evidence and migrate every manifest divergence. 3. Run focused tests and static checks, then full npm run verify, routing check, and ap doctor. 4. Review the final diff, commit only task files, record verification, and close the direct task."
  Verify Steps: "1. Run npx vitest run scripts/check-module-boundaries.test.ts scripts/check-source-provenance.test.ts. Expected: negative fixtures reject sw core/uibase and Sfx imports of browser adapters, and malformed or convenience-only filename divergences fail. 2. Run npm run check:dependencies && npm run check:source-provenance && npm run inventory:parity. Expected: runtime ownership, exhaustive provenance, and existing inventory semantics pass. 3. Run npm run verify. Expected: all formatting, lint, typecheck, unit, inventory, e2e, static, documentation, size, source-tree, provenance, invariant, and parity gates pass. 4. Run node .agentplane/policy/check-routing.mjs && ap doctor. Expected: routing and repository health pass without new task-scoped warnings. 5. Inspect git diff and git status --short --untracked-files=all. Expected: only approved implementation, tests, provenance manifest, and Agentplane task artifacts are changed."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the implementation commit and task close commit; this restores the prior ownership/provenance validators and schema without touching Writer runtime behavior."
  Findings: "Initial review proved current gates pass but do not reject cross-module browser imports from Writer/Sfx upstream-mechanism layers; filename-divergence validation relies on a phrase heuristic rather than structured necessity evidence."
id_source: "generated"
---
## Summary

Close the two P2-2 enforcement gaps found during review: browser/Sfx ownership coverage and auditable filename-divergence stack necessity.

## Scope

Update scripts/check-module-boundaries.mjs and its tests to classify browser directories across runtime modules, enforce upstream-mechanism/core-to-browser prohibitions, and cover Sfx responsibility edges. Update the source-provenance filename-divergence contract, manifest records, and tests with structured stack-necessity evidence. Do not change Writer product behavior or broaden parity claims.

## Plan

1. Generalize runtime ownership classification and add negative cases for cross-module browser imports plus Sfx boundaries. 2. Replace the phrase heuristic for filename divergences with structured necessity evidence and migrate every manifest divergence. 3. Run focused tests and static checks, then full npm run verify, routing check, and ap doctor. 4. Review the final diff, commit only task files, record verification, and close the direct task.

## Verify Steps

1. Run npx vitest run scripts/check-module-boundaries.test.ts scripts/check-source-provenance.test.ts. Expected: negative fixtures reject sw core/uibase and Sfx imports of browser adapters, and malformed or convenience-only filename divergences fail. 2. Run npm run check:dependencies && npm run check:source-provenance && npm run inventory:parity. Expected: runtime ownership, exhaustive provenance, and existing inventory semantics pass. 3. Run npm run verify. Expected: all formatting, lint, typecheck, unit, inventory, e2e, static, documentation, size, source-tree, provenance, invariant, and parity gates pass. 4. Run node .agentplane/policy/check-routing.mjs && ap doctor. Expected: routing and repository health pass without new task-scoped warnings. 5. Inspect git diff and git status --short --untracked-files=all. Expected: only approved implementation, tests, provenance manifest, and Agentplane task artifacts are changed.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the implementation commit and task close commit; this restores the prior ownership/provenance validators and schema without touching Writer runtime behavior.

## Findings

Initial review proved current gates pass but do not reject cross-module browser imports from Writer/Sfx upstream-mechanism layers; filename-divergence validation relies on a phrase heuristic rather than structured necessity evidence.
