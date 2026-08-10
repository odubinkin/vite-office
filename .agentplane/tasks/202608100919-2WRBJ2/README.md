---
id: "202608100919-2WRBJ2"
title: "Inventory pinned LibreOffice XHP help topics into atomic records"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on:
  - "202608100905-Q9AWEJ"
tags:
  - "documentation"
  - "inventory"
  - "libreoffice"
task_kind: "code"
mutation_scope: "code"
blueprint_request: "code.direct"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-08-10T09:19:32.853Z"
  updated_by: "USER"
  note: "Standing user authorization: future in-scope roadmap task plans are pre-approved."
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
    body: "Start: extract every pinned XHP help topic into deterministic provenance-only unmapped records."
events:
  -
    type: "status"
    at: "2026-08-10T09:19:33.445Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: extract every pinned XHP help topic into deterministic provenance-only unmapped records."
doc_version: 3
doc_updated_at: "2026-08-10T09:19:33.445Z"
doc_updated_by: "CODER"
description: "Extend deterministic inventory tooling to extract every pinned LibreOffice help XHP topic into canonical provenance-complete unmapped documentation records with exact corpus and topic counts, without copying help content or claiming documentation parity."
sections:
  Summary: |-
    Inventory pinned LibreOffice XHP help topics into atomic records

    Extend deterministic inventory tooling to extract every pinned LibreOffice help XHP topic into canonical provenance-complete unmapped documentation records with exact corpus and topic counts, without copying help content or claiming documentation parity.
  Scope: |-
    - In scope: Extend deterministic inventory tooling to extract every pinned LibreOffice help XHP topic into canonical provenance-complete unmapped documentation records with exact corpus and topic counts, without copying help content or claiming documentation parity.
    - Out of scope: unrelated refactors not required for "Inventory pinned LibreOffice XHP help topics into atomic records".
  Plan: |-
    1. Define a provenance-only XHP topic record and exact 2,746-topic discovery contract.
    2. Implement a read-only deterministic extractor, command, tests, and generated JSON.
    3. Document the inventory handoff without copying help content or claiming documentation parity.
    4. Run full quality gates, record evidence and evaluator review, then close.
  Verify Steps: |-
    1. Strict tooling, lint, JSDoc, and file-size checks pass.
    2. Inventory test coverage remains 100% across executable modules.
    3. Regenerated help inventory has exactly 2,746 unique XHP topic records with helpcontent2 corpus and pinned help commit provenance.
    4. Output is byte-stable and exactly matches live Git XHP paths; no help content is copied.
    5. npm run verify passes and documentation links/ignore boundaries remain valid.
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

Inventory pinned LibreOffice XHP help topics into atomic records

Extend deterministic inventory tooling to extract every pinned LibreOffice help XHP topic into canonical provenance-complete unmapped documentation records with exact corpus and topic counts, without copying help content or claiming documentation parity.

## Scope

- In scope: Extend deterministic inventory tooling to extract every pinned LibreOffice help XHP topic into canonical provenance-complete unmapped documentation records with exact corpus and topic counts, without copying help content or claiming documentation parity.
- Out of scope: unrelated refactors not required for "Inventory pinned LibreOffice XHP help topics into atomic records".

## Plan

1. Define a provenance-only XHP topic record and exact 2,746-topic discovery contract.
2. Implement a read-only deterministic extractor, command, tests, and generated JSON.
3. Document the inventory handoff without copying help content or claiming documentation parity.
4. Run full quality gates, record evidence and evaluator review, then close.

## Verify Steps

1. Strict tooling, lint, JSDoc, and file-size checks pass.
2. Inventory test coverage remains 100% across executable modules.
3. Regenerated help inventory has exactly 2,746 unique XHP topic records with helpcontent2 corpus and pinned help commit provenance.
4. Output is byte-stable and exactly matches live Git XHP paths; no help content is copied.
5. npm run verify passes and documentation links/ignore boundaries remain valid.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
