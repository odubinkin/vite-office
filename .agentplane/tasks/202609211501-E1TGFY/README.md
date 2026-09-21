---
id: "202609211501-E1TGFY"
title: "Close Writer P1 upstream parity gaps"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-21T15:02:19.616Z"
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
    body: "Start: implement the approved Writer P1 gap remediation in the current direct-mode checkout with upstream ownership and canonical mutation boundaries."
events:
  -
    type: "status"
    at: "2026-09-21T15:02:26.586Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the approved Writer P1 gap remediation in the current direct-mode checkout with upstream ownership and canonical mutation boundaries."
doc_version: 3
doc_updated_at: "2026-09-21T15:02:26.586Z"
doc_updated_by: "CODER"
description: "Correct the reviewed P1-1, P1-2, P1-5, and P1-6 gaps: document-bound canonical mutations and import, upstream-responsibility shell decomposition, independent storage and worker DTOs, and atomic ODT parity evidence."
sections:
  Summary: "Close the independently reviewed Writer P1 parity gaps while preserving the bounded browser feature set and pinned LibreOffice ownership model."
  Scope: "Bind IDocumentContentOperations to its owning SwDoc; route supported content/attribute/import reconstruction through canonical operations; split Writer text/view/list command registration and shell responsibilities; separate durable storage records from worker-transfer DTOs; replace broad ODT parity claims with atomic stream/property records and executable evidence. No new Writer feature families, network access, or persisted-schema backward compatibility."
  Plan: "1. Add document ownership and upstream-shaped content/attribute/import methods with cross-document guards and tests. 2. Move text and view command registries out of writercommands and extract shell operation helpers by upstream responsibility. 3. Define independent durable and worker DTOs and reconstruct through canonical operations. 4. Atomize ODT capability records and add contradiction/evidence tests. 5. Run targeted tests, full verification, policy routing, and doctor."
  Verify Steps: "1. Run targeted Vitest suites for DocumentContentOperationsManager, Writer shell registries, storage/worker codecs, ODT round trips, and parity mappings. 2. Run npm run verify. 3. Run node .agentplane/policy/check-routing.mjs. 4. Run ap doctor. 5. Confirm git status --short --untracked-files=all contains only intentional task artifacts and implementation changes."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only commits attributed to task 202609211501-E1TGFY; this restores the prior P1 implementation and its schema/evidence records together."
  Findings: ""
id_source: "generated"
---
## Summary

Close the independently reviewed Writer P1 parity gaps while preserving the bounded browser feature set and pinned LibreOffice ownership model.

## Scope

Bind IDocumentContentOperations to its owning SwDoc; route supported content/attribute/import reconstruction through canonical operations; split Writer text/view/list command registration and shell responsibilities; separate durable storage records from worker-transfer DTOs; replace broad ODT parity claims with atomic stream/property records and executable evidence. No new Writer feature families, network access, or persisted-schema backward compatibility.

## Plan

1. Add document ownership and upstream-shaped content/attribute/import methods with cross-document guards and tests. 2. Move text and view command registries out of writercommands and extract shell operation helpers by upstream responsibility. 3. Define independent durable and worker DTOs and reconstruct through canonical operations. 4. Atomize ODT capability records and add contradiction/evidence tests. 5. Run targeted tests, full verification, policy routing, and doctor.

## Verify Steps

1. Run targeted Vitest suites for DocumentContentOperationsManager, Writer shell registries, storage/worker codecs, ODT round trips, and parity mappings. 2. Run npm run verify. 3. Run node .agentplane/policy/check-routing.mjs. 4. Run ap doctor. 5. Confirm git status --short --untracked-files=all contains only intentional task artifacts and implementation changes.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only commits attributed to task 202609211501-E1TGFY; this restores the prior P1 implementation and its schema/evidence records together.

## Findings
