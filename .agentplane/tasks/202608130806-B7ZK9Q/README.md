---
id: "202608130806-B7ZK9Q"
title: "Document intentional mapped filename divergences"
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
  updated_at: "2026-08-13T08:06:23.840Z"
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
    body: "Start: make every intentional mapped filename divergence explicit and validator-enforced."
events:
  -
    type: "status"
    at: "2026-08-13T08:06:24.545Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: make every intentional mapped filename divergence explicit and validator-enforced."
doc_version: 3
doc_updated_at: "2026-08-13T08:06:24.545Z"
doc_updated_by: "CODER"
description: "Make the remaining intentional local-to-upstream filename differences explicit and reviewable in the LibreOffice source-tree documentation, including one-to-many configuration and browser-adapter ownership boundaries. Add a structural validation gate that rejects undocumented mapped filename divergences while preserving the current exhaustive source-provenance contract."
sections:
  Summary: |-
    Document intentional mapped filename divergences

    Make the remaining intentional local-to-upstream filename differences explicit and reviewable in the LibreOffice source-tree documentation, including one-to-many configuration and browser-adapter ownership boundaries. Add a structural validation gate that rejects undocumented mapped filename divergences while preserving the current exhaustive source-provenance contract.
  Scope: |-
    - In scope: Make the remaining intentional local-to-upstream filename differences explicit and reviewable in the LibreOffice source-tree documentation, including one-to-many configuration and browser-adapter ownership boundaries. Add a structural validation gate that rejects undocumented mapped filename divergences while preserving the current exhaustive source-provenance contract.
    - Out of scope: unrelated refactors not required for "Document intentional mapped filename divergences".
  Plan: "1. Add a concise, complete filename-divergence table to source-tree.md for the six currently mapped local modules whose stem intentionally differs from the pinned upstream source. 2. Extend check-source-provenance.ts to compute mapped basename divergences and require each one to have one exact reviewed exception entry in a machine-readable field within source-provenance.json; preserve strict parsing and exhaustive mapping. 3. Add tests for accepted documented divergences and rejection of missing/stale/duplicate divergence records. 4. Run focused provenance tests, fast app coverage, tooling coverage, all structural/documentation/static gates, and diff checks. Scope excludes changing module paths, feature behavior, baseline, or browser-only exceptions."
  Verify Steps: "1. Run npm run test:source-provenance and npm run test:inventory:coverage; expected: the strict provenance validator accepts exactly documented mapped filename divergences and tooling coverage remains 100%. 2. Run npm run test:coverage, npm run format:check, npm run lint, npm run typecheck, npm run check:docs, npm run check:source-provenance, npm run check:source-tree, and npm run check:file-size; expected: all pass and every retained mapped filename difference is visible. 3. Run git diff --check and inspect the source-tree divergence table against the manifest; expected: six exact intentional entries, no stale/duplicate omission, and only task-scoped files/artifacts."
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

Document intentional mapped filename divergences

Make the remaining intentional local-to-upstream filename differences explicit and reviewable in the LibreOffice source-tree documentation, including one-to-many configuration and browser-adapter ownership boundaries. Add a structural validation gate that rejects undocumented mapped filename divergences while preserving the current exhaustive source-provenance contract.

## Scope

- In scope: Make the remaining intentional local-to-upstream filename differences explicit and reviewable in the LibreOffice source-tree documentation, including one-to-many configuration and browser-adapter ownership boundaries. Add a structural validation gate that rejects undocumented mapped filename divergences while preserving the current exhaustive source-provenance contract.
- Out of scope: unrelated refactors not required for "Document intentional mapped filename divergences".

## Plan

1. Add a concise, complete filename-divergence table to source-tree.md for the six currently mapped local modules whose stem intentionally differs from the pinned upstream source. 2. Extend check-source-provenance.ts to compute mapped basename divergences and require each one to have one exact reviewed exception entry in a machine-readable field within source-provenance.json; preserve strict parsing and exhaustive mapping. 3. Add tests for accepted documented divergences and rejection of missing/stale/duplicate divergence records. 4. Run focused provenance tests, fast app coverage, tooling coverage, all structural/documentation/static gates, and diff checks. Scope excludes changing module paths, feature behavior, baseline, or browser-only exceptions.

## Verify Steps

1. Run npm run test:source-provenance and npm run test:inventory:coverage; expected: the strict provenance validator accepts exactly documented mapped filename divergences and tooling coverage remains 100%. 2. Run npm run test:coverage, npm run format:check, npm run lint, npm run typecheck, npm run check:docs, npm run check:source-provenance, npm run check:source-tree, and npm run check:file-size; expected: all pass and every retained mapped filename difference is visible. 3. Run git diff --check and inspect the source-tree divergence table against the manifest; expected: six exact intentional entries, no stale/duplicate omission, and only task-scoped files/artifacts.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
