---
id: "202608101030-KVFYSK"
title: "Extract pinned LibreOffice JunitTest source targets into atomic records"
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
  updated_at: "2026-08-10T10:30:33.755Z"
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
    body: "Start: extract deterministic linked Java source-target provenance from pinned JunitTest declarations."
events:
  -
    type: "status"
    at: "2026-08-10T10:30:41.771Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: extract deterministic linked Java source-target provenance from pinned JunitTest declarations."
doc_version: 3
doc_updated_at: "2026-08-10T10:30:41.771Z"
doc_updated_by: "CODER"
description: "Parse pinned gb_JunitTest_add_sourcefiles declarations into deterministic provenance-only Java source-target records linked to existing JunitTest constructor IDs without copying source content or claiming test parity."
sections:
  Summary: |-
    Extract pinned LibreOffice JunitTest source targets into atomic records

    Parse pinned gb_JunitTest_add_sourcefiles declarations into deterministic provenance-only Java source-target records linked to existing JunitTest constructor IDs without copying source content or claiming test parity.
  Scope: "In scope: deterministic provenance-only extraction of exact physical Java paths declared through pinned gb_JunitTest_add_sourcefiles macros, linked only to existing JunitTest constructor IDs. Out of scope: copying Java source, evaluating Make expressions, modifying prior Cppunit inventory, or claiming test parity."
  Plan: "1. Identify stable gb_JunitTest_add_sourcefiles declaration forms and Make-expression boundaries. 2. Extract exact Java source path records and link them to pinned JunitTest constructor IDs. 3. Reject untracked paths and incomplete pinned counts with 100% parser and corpus coverage. 4. Generate canonical JSON and program documentation. 5. Prove deterministic regeneration and run full verification."
  Verify Steps: "1. Run strict TypeScript, lint, JSDoc, and size checks. 2. Run inventory coverage at 100%. 3. Prove deterministic byte-identical regeneration. 4. Compare every generated Java source path with the pinned core Git path set and existing Junit constructor evidence. 5. Run npm run verify, agentplane doctor, and policy routing."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task commits and rerun npm run verify; no ignored reference content is modified."
  Findings: ""
id_source: "generated"
---
## Summary

Extract pinned LibreOffice JunitTest source targets into atomic records

Parse pinned gb_JunitTest_add_sourcefiles declarations into deterministic provenance-only Java source-target records linked to existing JunitTest constructor IDs without copying source content or claiming test parity.

## Scope

In scope: deterministic provenance-only extraction of exact physical Java paths declared through pinned gb_JunitTest_add_sourcefiles macros, linked only to existing JunitTest constructor IDs. Out of scope: copying Java source, evaluating Make expressions, modifying prior Cppunit inventory, or claiming test parity.

## Plan

1. Identify stable gb_JunitTest_add_sourcefiles declaration forms and Make-expression boundaries. 2. Extract exact Java source path records and link them to pinned JunitTest constructor IDs. 3. Reject untracked paths and incomplete pinned counts with 100% parser and corpus coverage. 4. Generate canonical JSON and program documentation. 5. Prove deterministic regeneration and run full verification.

## Verify Steps

1. Run strict TypeScript, lint, JSDoc, and size checks. 2. Run inventory coverage at 100%. 3. Prove deterministic byte-identical regeneration. 4. Compare every generated Java source path with the pinned core Git path set and existing Junit constructor evidence. 5. Run npm run verify, agentplane doctor, and policy routing.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task commits and rerun npm run verify; no ignored reference content is modified.

## Findings
