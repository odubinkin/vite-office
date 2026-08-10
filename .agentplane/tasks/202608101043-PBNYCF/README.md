---
id: "202608101043-PBNYCF"
title: "Extract pinned LibreOffice PythonTest module targets into atomic records"
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
  updated_at: "2026-08-10T10:44:15.223Z"
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
    body: "Start: extract deterministic linked Python module path provenance from pinned PythonTest declarations."
events:
  -
    type: "status"
    at: "2026-08-10T10:44:20.032Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: extract deterministic linked Python module path provenance from pinned PythonTest declarations."
doc_version: 3
doc_updated_at: "2026-08-10T10:44:20.032Z"
doc_updated_by: "CODER"
description: "Parse pinned gb_PythonTest_add_modules declarations into deterministic provenance-only Python module path records linked to existing PythonTest constructor IDs without copying test content or claiming parity."
sections:
  Summary: |-
    Extract pinned LibreOffice PythonTest module targets into atomic records

    Parse pinned gb_PythonTest_add_modules declarations into deterministic provenance-only Python module path records linked to existing PythonTest constructor IDs without copying test content or claiming parity.
  Scope: "In scope: deterministic provenance-only extraction of Python module paths declared through pinned gb_PythonTest_add_modules macros, resolving only the exact $(SRCDIR)/ directory argument and linking records to existing PythonTest constructor IDs. Out of scope: copying Python source, evaluating arbitrary Make expressions, fixture extraction, modifying prior inventories, or claiming test parity."
  Plan: "1. Identify stable gb_PythonTest_add_modules declaration forms and validate their source-directory argument. 2. Extract exact module-level .py paths and link them to pinned PythonTest constructor IDs. 3. Classify literal paths against the pinned Git path set and guard exact observed counts. 4. Cover parser and corpus generation at 100%, generate canonical JSON and program documentation. 5. Prove deterministic regeneration and run full verification."
  Verify Steps: "1. Run strict TypeScript, lint, JSDoc, and size checks. 2. Run inventory coverage at 100%. 3. Prove deterministic byte-identical regeneration. 4. Compare every generated Python path with the pinned core Git path set and existing PythonTest constructor evidence. 5. Run npm run verify, agentplane doctor, and policy routing."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task commits and rerun npm run verify; no ignored reference content is modified."
  Findings: ""
id_source: "generated"
---
## Summary

Extract pinned LibreOffice PythonTest module targets into atomic records

Parse pinned gb_PythonTest_add_modules declarations into deterministic provenance-only Python module path records linked to existing PythonTest constructor IDs without copying test content or claiming parity.

## Scope

In scope: deterministic provenance-only extraction of Python module paths declared through pinned gb_PythonTest_add_modules macros, resolving only the exact $(SRCDIR)/ directory argument and linking records to existing PythonTest constructor IDs. Out of scope: copying Python source, evaluating arbitrary Make expressions, fixture extraction, modifying prior inventories, or claiming test parity.

## Plan

1. Identify stable gb_PythonTest_add_modules declaration forms and validate their source-directory argument. 2. Extract exact module-level .py paths and link them to pinned PythonTest constructor IDs. 3. Classify literal paths against the pinned Git path set and guard exact observed counts. 4. Cover parser and corpus generation at 100%, generate canonical JSON and program documentation. 5. Prove deterministic regeneration and run full verification.

## Verify Steps

1. Run strict TypeScript, lint, JSDoc, and size checks. 2. Run inventory coverage at 100%. 3. Prove deterministic byte-identical regeneration. 4. Compare every generated Python path with the pinned core Git path set and existing PythonTest constructor evidence. 5. Run npm run verify, agentplane doctor, and policy routing.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task commits and rerun npm run verify; no ignored reference content is modified.

## Findings
