---
id: "202609241135-JV2933"
title: "F4 Place SAX parser and platform adaptations at correct boundaries"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on:
  - "202609241135-RF2T8B"
tags:
  - "code"
  - "parity"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-24T12:17:26.165Z"
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
    body: "Start: correct F4 SAX and framework platform ownership against pinned modules while retaining xmloff contexts."
events:
  -
    type: "status"
    at: "2026-09-24T12:17:27.077Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: correct F4 SAX and framework platform ownership against pinned modules while retaining xmloff contexts."
doc_version: 3
doc_updated_at: "2026-09-24T12:17:27.077Z"
doc_updated_by: "CODER"
description: "Implement F4: move shared SAX engine to sax/source/fastparser and DOM locale Worker adapters to browser directories."
sections:
  Summary: |-
    F4 Place SAX parser and platform adaptations at correct boundaries

    Implement F4: move shared SAX engine to sax/source/fastparser and DOM locale Worker adapters to browser directories.
  Scope: |-
    - In scope: Implement F4: move shared SAX engine to sax/source/fastparser and DOM locale Worker adapters to browser directories.
    - Out of scope: unrelated refactors not required for "F4 Place SAX parser and platform adaptations at correct boundaries".
  Plan: |-
    1. Compare F4 files with pinned sax fastparser and framework accelerator/service owners, identifying platform-only code.
    2. Split and move only actual parser engine or browser adaptation; update imports and remove stale modules.
    3. Update existing provenance/inventory/source-tree data and run focused plus full verification.
  Verify Steps: |-
    1. General SAX parser and parser tests resolve under sax/source/fastparser; xmloff import contexts stay in xmloff. DOM keyboard, Intl fallback and Worker protocol resolve under framework/browser without upstream model imports from browser.
    2. Existing parser, keyboard, localization and Worker tests pass; provenance, source-tree and runtime inventory data reference active exact owners.
    3. npm run verify and git diff --check pass.
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

F4 Place SAX parser and platform adaptations at correct boundaries

Implement F4: move shared SAX engine to sax/source/fastparser and DOM locale Worker adapters to browser directories.

## Scope

- In scope: Implement F4: move shared SAX engine to sax/source/fastparser and DOM locale Worker adapters to browser directories.
- Out of scope: unrelated refactors not required for "F4 Place SAX parser and platform adaptations at correct boundaries".

## Plan

1. Compare F4 files with pinned sax fastparser and framework accelerator/service owners, identifying platform-only code.
2. Split and move only actual parser engine or browser adaptation; update imports and remove stale modules.
3. Update existing provenance/inventory/source-tree data and run focused plus full verification.

## Verify Steps

1. General SAX parser and parser tests resolve under sax/source/fastparser; xmloff import contexts stay in xmloff. DOM keyboard, Intl fallback and Worker protocol resolve under framework/browser without upstream model imports from browser.
2. Existing parser, keyboard, localization and Worker tests pass; provenance, source-tree and runtime inventory data reference active exact owners.
3. npm run verify and git diff --check pass.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
