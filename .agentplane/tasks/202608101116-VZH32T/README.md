---
id: "202608101116-VZH32T"
title: "Extract pinned LibreOffice Cppunit test registrations into atomic records"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-08-10T11:16:52.806Z"
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
    body: "Start: extract exact pinned Cppunit test registrations with source-target and constructor provenance inside the approved scope."
events:
  -
    type: "status"
    at: "2026-08-10T11:17:02.474Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: extract exact pinned Cppunit test registrations with source-target and constructor provenance inside the approved scope."
doc_version: 3
doc_updated_at: "2026-08-10T11:24:49.003Z"
doc_updated_by: "CODER"
description: "Parse pinned Cppunit registration macro invocations, link each registered test name to existing Cppunit source-target and constructor provenance, and generate deterministic atomic records without copying test bodies."
sections:
  Summary: |-
    Extract pinned LibreOffice Cppunit test registrations into atomic records

    Parse pinned Cppunit registration macro invocations, link each registered test name to existing Cppunit source-target and constructor provenance, and generate deterministic atomic records without copying test bodies.
  Scope: |-
    - In scope: deterministic provenance-only extraction of exact CPPUNIT_TEST and CPPUNIT_TEST_FIXTURE registration macro invocations in pinned C++ source targets; source line evidence; linkage to existing Cppunit source-target and constructor IDs; canonical JSON, documentation, and tests.
    - Out of scope: copying or parsing test bodies, assertion/fixture extraction, evaluating arbitrary C++ syntax, modifying previous inventories, local behavior implementation, or parity claims.
  Plan: "1. Validate stable Cppunit registration macro forms in pinned C++ source targets without parsing test bodies. 2. Extract exact registration names and source lines, linking each record through existing Cppunit source-target and constructor IDs. 3. Classify unsupported or orphan registration forms explicitly and guard observed counts. 4. Add strict parser, linkage, and production CLI tests at 100% inventory coverage; generate canonical JSON and program documentation. 5. Prove byte-identical regeneration and run full repository verification before independent review and closure."
  Verify Steps: |-
    1. Run strict TypeScript, lint, JSDoc, and file-size checks.
    2. Run inventory tests with 100% statement, branch, function, and line coverage.
    3. Prove byte-identical regeneration of the canonical Cppunit registration inventory.
    4. Check every generated record has pinned Cppunit source-target and constructor provenance plus an exact registration line.
    5. Run npm run verify, agentplane doctor, and policy routing.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: |-
    - Observation: `scripts/libreoffice-inventory/contracts.ts` is 536 lines and reported as a decomposition review candidate.
    - Impact: it remains below the mandatory 1,000-line decomposition threshold.
    - Resolution: retain it as the central serializable inventory-schema registry in this task; splitting only the newly added Cppunit contracts would create cross-module churn without reducing a cohesive contract responsibility. Reassess on the next contract-family addition or before 1,000 lines.
id_source: "generated"
---
## Summary

Extract pinned LibreOffice Cppunit test registrations into atomic records

Parse pinned Cppunit registration macro invocations, link each registered test name to existing Cppunit source-target and constructor provenance, and generate deterministic atomic records without copying test bodies.

## Scope

- In scope: deterministic provenance-only extraction of exact CPPUNIT_TEST and CPPUNIT_TEST_FIXTURE registration macro invocations in pinned C++ source targets; source line evidence; linkage to existing Cppunit source-target and constructor IDs; canonical JSON, documentation, and tests.
- Out of scope: copying or parsing test bodies, assertion/fixture extraction, evaluating arbitrary C++ syntax, modifying previous inventories, local behavior implementation, or parity claims.

## Plan

1. Validate stable Cppunit registration macro forms in pinned C++ source targets without parsing test bodies. 2. Extract exact registration names and source lines, linking each record through existing Cppunit source-target and constructor IDs. 3. Classify unsupported or orphan registration forms explicitly and guard observed counts. 4. Add strict parser, linkage, and production CLI tests at 100% inventory coverage; generate canonical JSON and program documentation. 5. Prove byte-identical regeneration and run full repository verification before independent review and closure.

## Verify Steps

1. Run strict TypeScript, lint, JSDoc, and file-size checks.
2. Run inventory tests with 100% statement, branch, function, and line coverage.
3. Prove byte-identical regeneration of the canonical Cppunit registration inventory.
4. Check every generated record has pinned Cppunit source-target and constructor provenance plus an exact registration line.
5. Run npm run verify, agentplane doctor, and policy routing.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

- Observation: `scripts/libreoffice-inventory/contracts.ts` is 536 lines and reported as a decomposition review candidate.
- Impact: it remains below the mandatory 1,000-line decomposition threshold.
- Resolution: retain it as the central serializable inventory-schema registry in this task; splitting only the newly added Cppunit contracts would create cross-module churn without reducing a cohesive contract responsibility. Reassess on the next contract-family addition or before 1,000 lines.
