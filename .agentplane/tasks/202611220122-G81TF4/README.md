---
id: "202611220122-G81TF4"
title: "Preserve Writer ODT casing and character text flags"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 4
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "odt"
  - "writer"
task_kind: "code"
mutation_scope: "code"
verify:
  - "Run focused Writer ODT style, Worker and UNO property suites and the affected shared xmloff handlers."
  - "npm run check:dependencies && npm run check:source-provenance"
plan_approval:
  state: "approved"
  updated_at: "2026-11-22T01:22:38.548Z"
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
    body: "Start: preserve Writer casing and character flags through the pinned ODT property and generator rules."
events:
  -
    type: "status"
    at: "2026-11-22T01:22:43.410Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: preserve Writer casing and character flags through the pinned ODT property and generator rules."
doc_version: 3
doc_updated_at: "2026-11-22T01:22:43.410Z"
doc_updated_by: "CODER"
description: "Port the represented Writer case-map, blinking, hidden and no-hyphenation items through native ODT property mapping, Worker records and UNO metadata, including the source legacy generator handling for visibility."
sections:
  Summary: "Preserve the represented Writer case mapping, blinking, hidden and no-hyphenation character values through ODT and the existing Worker record. Follow the pinned xmloff and Writer member contracts, including generator-based normalization for legacy hidden text."
  Scope: |-
    - Shared ODF handlers and Writer style contexts for the four existing character item types.
    - Native item conversion, UNO property metadata and Worker restoration, plus consumed document generator classification needed by the text display import context.
    - Package and handler regression verification, applicable original fixtures, and source registry evidence.
  Plan: |-
    1. Trace the original ODF casing and variant maps, the text display special import branch and the independent blinking and hyphenation flags. Use Graphify to locate existing item, context and document metadata owners.
    2. Implement the consumed source handlers and generator classification in the matching shared modules. Keep cases, defaults and direct-versus-inherited behavior native and adopt the actual pooled item types through existing UNO paths.
    3. Carry the same values through Writer styles, Worker transfer and ODT reopen. Cover applicable pinned documents and focused modern, legacy and explicit reset cases. Document suspect source rules while retaining their behavior.
    4. Verify the affected owner suites and refresh Graphify during closeout.
  Verify Steps: |-
    - Run focused Writer suites for the new character flag cases, existing native ODT character values and style round trips, Worker transport, UNO metadata and affected editeng items.
    - Run affected shared xmloff cases for native token handling, merge order and legacy generator classification.
    - Run scoped ESLint and Prettier, Office typecheck, module boundaries, source provenance, Writer registry invariants, routing validation, AgentPlane doctor and git diff checks.
    - Record the task-scoped checkout and refresh the graph. The next complete regression follows the ten-task cadence.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the scoped implementation and source witnesses as committed. Existing packages remain readable through their previous import paths."
  Findings: "This is the fourth implementation task after CMXMAC. The native item pool already defines the four defaults, while the current Writer properties and ODT paths do not transport them. The existing XML metadata reader recognizes and ignores meta:generator, and the pinned text display handler uses its version classification."
id_source: "generated"
---
## Summary

Preserve the represented Writer case mapping, blinking, hidden and no-hyphenation character values through ODT and the existing Worker record. Follow the pinned xmloff and Writer member contracts, including generator-based normalization for legacy hidden text.

## Scope

- Shared ODF handlers and Writer style contexts for the four existing character item types.
- Native item conversion, UNO property metadata and Worker restoration, plus consumed document generator classification needed by the text display import context.
- Package and handler regression verification, applicable original fixtures, and source registry evidence.

## Plan

1. Trace the original ODF casing and variant maps, the text display special import branch and the independent blinking and hyphenation flags. Use Graphify to locate existing item, context and document metadata owners.
2. Implement the consumed source handlers and generator classification in the matching shared modules. Keep cases, defaults and direct-versus-inherited behavior native and adopt the actual pooled item types through existing UNO paths.
3. Carry the same values through Writer styles, Worker transfer and ODT reopen. Cover applicable pinned documents and focused modern, legacy and explicit reset cases. Document suspect source rules while retaining their behavior.
4. Verify the affected owner suites and refresh Graphify during closeout.

## Verify Steps

- Run focused Writer suites for the new character flag cases, existing native ODT character values and style round trips, Worker transport, UNO metadata and affected editeng items.
- Run affected shared xmloff cases for native token handling, merge order and legacy generator classification.
- Run scoped ESLint and Prettier, Office typecheck, module boundaries, source provenance, Writer registry invariants, routing validation, AgentPlane doctor and git diff checks.
- Record the task-scoped checkout and refresh the graph. The next complete regression follows the ten-task cadence.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the scoped implementation and source witnesses as committed. Existing packages remain readable through their previous import paths.

## Findings

This is the fourth implementation task after CMXMAC. The native item pool already defines the four defaults, while the current Writer properties and ODT paths do not transport them. The existing XML metadata reader recognizes and ignores meta:generator, and the pinned text display handler uses its version classification.
