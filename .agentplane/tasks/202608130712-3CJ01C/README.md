---
id: "202608130712-3CJ01C"
title: "Export nested Writer lists through the browser clipboard"
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
  updated_at: "2026-08-13T07:12:22.354Z"
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
    body: "Start: Extending the pinned Writer transfer and format-writer boundaries for bounded nested-list clipboard export."
events:
  -
    type: "status"
    at: "2026-08-13T07:12:29.774Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Extending the pinned Writer transfer and format-writer boundaries for bounded nested-list clipboard export."
doc_version: 3
doc_updated_at: "2026-08-13T07:12:29.774Z"
doc_updated_by: "CODER"
description: "Extend the pinned Writer transfer-document and HTML/ASCII format writers so contiguous active Writer list paragraphs with bounded levels copy as nested semantic HTML lists and level-indented plain text, while preserving current partial-selection and list-boundary behavior."
sections:
  Summary: |-
    Export nested Writer lists through the browser clipboard

    Extend the pinned Writer transfer-document and HTML/ASCII format writers so contiguous active Writer list paragraphs with bounded levels copy as nested semantic HTML lists and level-indented plain text, while preserving current partial-selection and list-boundary behavior.
  Scope: |-
    - In scope: Extend the pinned Writer transfer-document and HTML/ASCII format writers so contiguous active Writer list paragraphs with bounded levels copy as nested semantic HTML lists and level-indented plain text, while preserving current partial-selection and list-boundary behavior.
    - Out of scope: unrelated refactors not required for "Export nested Writer lists through the browser clipboard".
  Plan: "1. Map level-aware Writer Copy behavior to the pinned transfer handler and HTML/ASCII list writers, upstream tests, and Help; retain explicit non-goals for Paste, RTF, ODT/DOCX, custom styles, and arbitrary selection ranges. 2. Extend the transfer record with the existing bounded list level without leaking accessibility marker text. 3. Serialize adjacent complete list items as balanced nested ul/ol/li HTML with correct same-kind and mixed-kind transitions, and serialize level-aware four-space plain-text indentation. 4. Add focused writer tests and a Chromium clipboard test that exercises a demoted item and validates nested semantics. 5. Add parity, source-tree, and user documentation evidence. 6. Run fast coverage, focused Writer clipboard E2E, parity inventory, source-provenance, and static gates; defer full suite under the approved ten-task cadence."
  Verify Steps: "1. Run npm run test:coverage. Expected: fast application tests remain 100 percent covered with nested Writer clipboard serializer cases. 2. Run npm run test:e2e -- --grep Writer list clipboard. Expected: Chromium copies a demoted list item using semantic nested HTML and readable level-indented plain text. 3. Run npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference. Expected: the new level-aware copy record resolves all local and pinned upstream evidence. 4. Run npm run check:source-provenance && npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && npm run check:source-tree && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs. Expected: all pass. 5. Defer npm run verify, static smoke, inventory coverage, and full browser matrix under the user-approved ten-task cadence; record residual risk."
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

Export nested Writer lists through the browser clipboard

Extend the pinned Writer transfer-document and HTML/ASCII format writers so contiguous active Writer list paragraphs with bounded levels copy as nested semantic HTML lists and level-indented plain text, while preserving current partial-selection and list-boundary behavior.

## Scope

- In scope: Extend the pinned Writer transfer-document and HTML/ASCII format writers so contiguous active Writer list paragraphs with bounded levels copy as nested semantic HTML lists and level-indented plain text, while preserving current partial-selection and list-boundary behavior.
- Out of scope: unrelated refactors not required for "Export nested Writer lists through the browser clipboard".

## Plan

1. Map level-aware Writer Copy behavior to the pinned transfer handler and HTML/ASCII list writers, upstream tests, and Help; retain explicit non-goals for Paste, RTF, ODT/DOCX, custom styles, and arbitrary selection ranges. 2. Extend the transfer record with the existing bounded list level without leaking accessibility marker text. 3. Serialize adjacent complete list items as balanced nested ul/ol/li HTML with correct same-kind and mixed-kind transitions, and serialize level-aware four-space plain-text indentation. 4. Add focused writer tests and a Chromium clipboard test that exercises a demoted item and validates nested semantics. 5. Add parity, source-tree, and user documentation evidence. 6. Run fast coverage, focused Writer clipboard E2E, parity inventory, source-provenance, and static gates; defer full suite under the approved ten-task cadence.

## Verify Steps

1. Run npm run test:coverage. Expected: fast application tests remain 100 percent covered with nested Writer clipboard serializer cases. 2. Run npm run test:e2e -- --grep Writer list clipboard. Expected: Chromium copies a demoted list item using semantic nested HTML and readable level-indented plain text. 3. Run npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference. Expected: the new level-aware copy record resolves all local and pinned upstream evidence. 4. Run npm run check:source-provenance && npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && npm run check:source-tree && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs. Expected: all pass. 5. Defer npm run verify, static smoke, inventory coverage, and full browser matrix under the user-approved ten-task cadence; record residual risk.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
