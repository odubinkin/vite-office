---
id: "202611201111-9W5KBQ"
title: "Preserve native Calc named cell styles through ODS"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify:
  - "git diff --check; ap doctor; node .agentplane/policy/check-routing.mjs"
  - "npm run test:calc -- src/sc/source/filter/xml src/sc/browser/filter/xml --maxWorkers 4"
  - "npm run typecheck --workspace @vite-office/office"
plan_approval:
  state: "approved"
  updated_at: "2026-11-20T11:12:13.495Z"
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
    at: "2026-11-20T11:19:30.197Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-11-20T11:19:30.197Z"
doc_updated_by: "CODER"
description: "Import and export named Calc cell styles, parent links, and number format references through native owners and preserve identity through the existing Calc browser worker boundary."
sections:
  Summary: |-
    Preserve native Calc named cell styles through ODS

    Import and export named Calc cell styles, parent links, and number format references through native owners and preserve identity through the existing Calc browser worker boundary.
  Scope: "Calc ODS style SAX and export owners, native Calc stylesheet and pattern ownership, Calc document worker codec and targeted tests, corresponding evidence and source provenance."
  Plan: "Match LibreOffice named style creation and parent linking, native pattern ownership, number format references and automatic style parent emission. Reuse filter semantics at the worker boundary and port relevant assertions."
  Verify Steps: |-
    1. npm run test:calc -- src/sc/source/filter/xml src/sc/browser/filter/xml --maxWorkers 4. Cover canonical style parent links, named and automatic cells, data-style inheritance and Worker round trip.
    2. npm run typecheck --workspace @vite-office/office. Check all style and Worker boundaries.
    3. Run git diff --check, ap doctor, and node .agentplane/policy/check-routing.mjs.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the named-style changes to Calc source owners and Worker transfer together with scoped regression cases."
  Findings: ""
id_source: "generated"
---
## Summary

Preserve native Calc named cell styles through ODS

Import and export named Calc cell styles, parent links, and number format references through native owners and preserve identity through the existing Calc browser worker boundary.

## Scope

Calc ODS style SAX and export owners, native Calc stylesheet and pattern ownership, Calc document worker codec and targeted tests, corresponding evidence and source provenance.

## Plan

Match LibreOffice named style creation and parent linking, native pattern ownership, number format references and automatic style parent emission. Reuse filter semantics at the worker boundary and port relevant assertions.

## Verify Steps

1. npm run test:calc -- src/sc/source/filter/xml src/sc/browser/filter/xml --maxWorkers 4. Cover canonical style parent links, named and automatic cells, data-style inheritance and Worker round trip.
2. npm run typecheck --workspace @vite-office/office. Check all style and Worker boundaries.
3. Run git diff --check, ap doctor, and node .agentplane/policy/check-routing.mjs.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the named-style changes to Calc source owners and Worker transfer together with scoped regression cases.

## Findings
