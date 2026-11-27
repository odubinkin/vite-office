---
id: "202611271020-2CQ5A9"
title: "Preserve native Writer text sections through ODT and Worker transport"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "writer"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T10:20:46.330Z"
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
    at: "2026-11-27T10:20:53.473Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-11-27T10:20:53.473Z"
doc_updated_by: "CODER"
description: "Port the represented ordinary Writer text-section owner, body and cell hierarchy, ODF section property import/export and Worker graph transport against pinned LibreOffice. Preserve the existing editing projection and compatible legacy graph decode."
sections:
  Summary: |-
    Preserve native Writer text sections through ODT and Worker transport

    Port the represented ordinary Writer text-section owner, body and cell hierarchy, ODF section property import/export and Worker graph transport against pinned LibreOffice. Preserve the existing editing projection and compatible legacy graph decode.
  Scope: |-
    - In scope: Port the represented ordinary Writer text-section owner, body and cell hierarchy, ODF section property import/export and Worker graph transport against pinned LibreOffice. Preserve the existing editing projection and compatible legacy graph decode.
    - Out of scope: unrelated refactors not required for "Preserve native Writer text sections through ODT and Worker transport".
  Plan: "1. Map SwSectionData, SwSectionFormat, SwSectionNode and SwXTextSection to the implemented Writer node and UNO slice. 2. Port the shared ODF section contexts and Writer adapters for body and cells, preserving native property defaults and nesting. 3. Transport actual section nodes in the Writer graph with legacy decoding, and verify the pinned protection-key scenario and existing affected suites."
  Verify Steps: |-
    1. Load the pinned Writer protection-key fixture and run its native key assertions across export and reimport.
    2. Exercise ordered nested body and cell section ownership through ODT and Worker graph transport.
    3. Run affected Writer node, text-filter and Worker tests plus Office typecheck, format, dependency, provenance and Writer inventory checks. Record the exact supported behavior and results.
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

Preserve native Writer text sections through ODT and Worker transport

Port the represented ordinary Writer text-section owner, body and cell hierarchy, ODF section property import/export and Worker graph transport against pinned LibreOffice. Preserve the existing editing projection and compatible legacy graph decode.

## Scope

- In scope: Port the represented ordinary Writer text-section owner, body and cell hierarchy, ODF section property import/export and Worker graph transport against pinned LibreOffice. Preserve the existing editing projection and compatible legacy graph decode.
- Out of scope: unrelated refactors not required for "Preserve native Writer text sections through ODT and Worker transport".

## Plan

1. Map SwSectionData, SwSectionFormat, SwSectionNode and SwXTextSection to the implemented Writer node and UNO slice. 2. Port the shared ODF section contexts and Writer adapters for body and cells, preserving native property defaults and nesting. 3. Transport actual section nodes in the Writer graph with legacy decoding, and verify the pinned protection-key scenario and existing affected suites.

## Verify Steps

1. Load the pinned Writer protection-key fixture and run its native key assertions across export and reimport.
2. Exercise ordered nested body and cell section ownership through ODT and Worker graph transport.
3. Run affected Writer node, text-filter and Worker tests plus Office typecheck, format, dependency, provenance and Writer inventory checks. Record the exact supported behavior and results.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
