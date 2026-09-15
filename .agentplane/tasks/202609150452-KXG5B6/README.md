---
id: "202609150452-KXG5B6"
title: "Preserve LibreOffice ODF bullet characters"
status: "DOING"
priority: "med"
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
  updated_at: "2026-09-15T04:52:40.002Z"
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
    at: "2026-09-15T04:52:50.026Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-09-15T04:52:50.026Z"
doc_updated_by: "CODER"
description: "Align Writer ODT list-style import and round-trip behavior with pinned LibreOffice upstream so documents using U+25CF and other valid bullet characters open without rejection."
sections:
  Summary: "Make ODT list-style bullet import accept and preserve valid Unicode bullet characters in parity with the pinned LibreOffice importer, fixing LibreOffice-produced documents that use U+25CF BLACK CIRCLE."
  Scope: "Update the bounded Writer numbering format model plus its ODF import/export projections and focused tests. Preserve existing list-kind behavior, public architecture, and file organization; do not broaden support for unrelated numbering attributes or list image styles."
  Plan: "1. Extend the per-level SwNumFormat state with the upstream-equivalent bullet character while retaining bullet/numbered kind semantics and compatible defaults. 2. Parse the first Unicode code point from text:bullet-char without restricting it to U+2022, propagate it through XMLTextListRule into SwNumFormat, and export the stored value. 3. Add regression coverage for LibreOffice U+25CF import and ODT round-trip, plus model persistence/conflict behavior as needed. 4. Run targeted tests and the repository verification contract, record evidence, and finish the direct-mode task."
  Verify Steps: |-
    - npm run test:coverage --workspace @vite-office/office -- --run apps/office/src/sw/source/core/doc/number.test.ts apps/office/src/sw/source/filter/xml/odt-roundtrip.test.ts apps/office/src/xmloff/source/text/txtpara.test.ts
    - npm run format:check
    - npm run lint
    - npm run typecheck
    - npm run check:dependencies
    - npm run check:docs
    - npm run check:file-size
    - node .agentplane/policy/check-routing.mjs
    - git status --short --untracked-files=all
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task implementation commit and Agentplane close commit; no data migration or external state is involved."
  Findings: ""
id_source: "generated"
---
## Summary

Make ODT list-style bullet import accept and preserve valid Unicode bullet characters in parity with the pinned LibreOffice importer, fixing LibreOffice-produced documents that use U+25CF BLACK CIRCLE.

## Scope

Update the bounded Writer numbering format model plus its ODF import/export projections and focused tests. Preserve existing list-kind behavior, public architecture, and file organization; do not broaden support for unrelated numbering attributes or list image styles.

## Plan

1. Extend the per-level SwNumFormat state with the upstream-equivalent bullet character while retaining bullet/numbered kind semantics and compatible defaults. 2. Parse the first Unicode code point from text:bullet-char without restricting it to U+2022, propagate it through XMLTextListRule into SwNumFormat, and export the stored value. 3. Add regression coverage for LibreOffice U+25CF import and ODT round-trip, plus model persistence/conflict behavior as needed. 4. Run targeted tests and the repository verification contract, record evidence, and finish the direct-mode task.

## Verify Steps

- npm run test:coverage --workspace @vite-office/office -- --run apps/office/src/sw/source/core/doc/number.test.ts apps/office/src/sw/source/filter/xml/odt-roundtrip.test.ts apps/office/src/xmloff/source/text/txtpara.test.ts
- npm run format:check
- npm run lint
- npm run typecheck
- npm run check:dependencies
- npm run check:docs
- npm run check:file-size
- node .agentplane/policy/check-routing.mjs
- git status --short --untracked-files=all

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task implementation commit and Agentplane close commit; no data migration or external state is involved.

## Findings
