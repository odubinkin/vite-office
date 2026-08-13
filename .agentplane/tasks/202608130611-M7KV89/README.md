---
id: "202608130611-M7KV89"
title: "Normalize existing Writer module identities to LibreOffice files"
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
  updated_at: "2026-08-13T06:11:41.064Z"
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
    body: "Start: normalize existing Writer modules to audited concrete LibreOffice file identities."
events:
  -
    type: "status"
    at: "2026-08-13T06:11:41.655Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: normalize existing Writer modules to audited concrete LibreOffice file identities."
doc_version: 3
doc_updated_at: "2026-08-13T06:11:41.655Z"
doc_updated_by: "CODER"
description: "Rename and relocate existing Writer browser modules from generic local names to concrete pinned LibreOffice-derived module names, update imports/tests/docs/source-tree gate, and preserve behavior."
sections:
  Summary: |-
    Normalize existing Writer module identities to LibreOffice files

    Rename and relocate existing Writer browser modules from generic local names to concrete pinned LibreOffice-derived module names, update imports/tests/docs/source-tree gate, and preserve behavior.
  Scope: |-
    - In scope: Rename and relocate existing Writer browser modules from generic local names to concrete pinned LibreOffice-derived module names, update imports/tests/docs/source-tree gate, and preserve behavior.
    - Out of scope: unrelated refactors not required for "Normalize existing Writer module identities to LibreOffice files".
  Plan: "1. Build an audited one-to-one map from each existing Writer browser module to the narrowest concrete file in pinned LibreOffice 26.8.0.2, retaining browser-only supporting leaf names only where no upstream analogue exists. 2. Rename/move existing Writer view, document-view, formatting-bar, sidebar, shell, and utility modules and their colocated tests to that map; update all imports without behavior changes. 3. Update the source-tree documentation and automated source-tree gate so required module identities are concrete files, not only broad directories. 4. Add/adjust targeted module-identity tests and documentation evidence. 5. Run fast coverage, type/lint/format/JSDoc/source-tree checks and import/build validation; defer full browser matrix under the approved ten-task cadence."
  Verify Steps: |-
    1. Run npm run test:coverage. Expected: all unit and component tests pass at 100 percent coverage after renamed module imports.
    2. Run npm run build && npm run check:source-tree. Expected: production bundle compiles and every required concrete LibreOffice-derived module identity exists.
    3. Run npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs. Expected: all pass.
    4. Defer npm run verify, static smoke, inventory coverage, and the full browser matrix under the user-approved ten-task cadence; record residual risk.
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

Normalize existing Writer module identities to LibreOffice files

Rename and relocate existing Writer browser modules from generic local names to concrete pinned LibreOffice-derived module names, update imports/tests/docs/source-tree gate, and preserve behavior.

## Scope

- In scope: Rename and relocate existing Writer browser modules from generic local names to concrete pinned LibreOffice-derived module names, update imports/tests/docs/source-tree gate, and preserve behavior.
- Out of scope: unrelated refactors not required for "Normalize existing Writer module identities to LibreOffice files".

## Plan

1. Build an audited one-to-one map from each existing Writer browser module to the narrowest concrete file in pinned LibreOffice 26.8.0.2, retaining browser-only supporting leaf names only where no upstream analogue exists. 2. Rename/move existing Writer view, document-view, formatting-bar, sidebar, shell, and utility modules and their colocated tests to that map; update all imports without behavior changes. 3. Update the source-tree documentation and automated source-tree gate so required module identities are concrete files, not only broad directories. 4. Add/adjust targeted module-identity tests and documentation evidence. 5. Run fast coverage, type/lint/format/JSDoc/source-tree checks and import/build validation; defer full browser matrix under the approved ten-task cadence.

## Verify Steps

1. Run npm run test:coverage. Expected: all unit and component tests pass at 100 percent coverage after renamed module imports.
2. Run npm run build && npm run check:source-tree. Expected: production bundle compiles and every required concrete LibreOffice-derived module identity exists.
3. Run npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs. Expected: all pass.
4. Defer npm run verify, static smoke, inventory coverage, and the full browser matrix under the user-approved ten-task cadence; record residual risk.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
