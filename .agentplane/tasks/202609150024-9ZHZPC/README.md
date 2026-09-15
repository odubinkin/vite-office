---
id: "202609150024-9ZHZPC"
title: "Tolerate unknown ODF attributes during ODT import"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "backend"
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-15T00:24:45.378Z"
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
    body: "Start: align ODT unknown-attribute handling with pinned LibreOffice and add focused regression coverage."
events:
  -
    type: "status"
    at: "2026-09-15T00:24:51.797Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: align ODT unknown-attribute handling with pinned LibreOffice and add focused regression coverage."
doc_version: 3
doc_updated_at: "2026-09-15T00:24:51.797Z"
doc_updated_by: "CODER"
description: "Align ODT attribute import with pinned LibreOffice behavior: log and ignore unknown or unsupported attributes so style:default-outline-level does not prevent opening LibreOffice-created files, while retaining structural, security-limit, required-field, and supported-value validation."
sections:
  Summary: "Make ODT import tolerant of unknown and context-unsupported attributes, matching the pinned LibreOffice fast-parser behavior: emit a console warning and continue importing instead of failing the entire document."
  Scope: |-
    - In scope: FastAttributeList unsupported-attribute policy, focused parser/ODT regression tests, and source-provenance metadata only if required by repository validation.
    - Acceptance: LibreOffice style:default-outline-level and arbitrary unknown attributes are warned about and ignored; the document still imports.
    - Preserve: malformed XML rejection, parser resource ceilings, cancellation, duplicate attributes, missing required fields, invalid supported values, current xmloff/sw ownership, and source-shaped file layout.
    - Out of scope: unrelated ODF feature support or broad importer refactoring.
  Plan: |-
    1. Change the existing FastAttributeList policy at the xmloff parser boundary so unsupported attributes are reported with console.warn and omitted from semantic access, following pinned LibreOffice fastparser/fastattribs behavior.
    2. Update focused parser and Writer ODT tests to assert warnings and successful import for style:default-outline-level and an arbitrary unknown property, while retaining strict failure tests for structural and supported-value errors.
    3. Run the declared targeted tests, typecheck/lint/provenance checks, Agentplane route validation, and the broader repository verification if feasible; record exact evidence.
    4. Review the final diff and finish the direct-mode task with traceable commit metadata.
  Verify Steps: |-
    1. Run `npm exec vitest run apps/office/src/xmloff/source/core/xml-parser.test.ts apps/office/src/sw/source/filter/xml/odt-roundtrip.test.ts`. Expected: unknown/unsupported attributes warn and do not abort parsing or ODT import; existing strict parser/import cases pass.
    2. Run `npm run typecheck && npm run lint`. Expected: no TypeScript or ESLint errors.
    3. Run `npm run check:source-provenance && npm run inventory:parity`. Expected: pinned upstream mappings and evidence remain valid.
    4. Run `node .agentplane/policy/check-routing.mjs && ap doctor`. Expected: routing and repository workflow checks pass.
    5. Run `npm run verify`. Expected: the full repository verification passes; if an infrastructure-only blocker occurs, record the exact command, failure, residual risk, and obtain approval before any skip.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert the task implementation/close commit(s).
    - Re-run the focused ODF parser and round-trip tests to confirm the prior strict behavior is restored without unrelated changes.
  Findings: ""
id_source: "generated"
---
## Summary

Make ODT import tolerant of unknown and context-unsupported attributes, matching the pinned LibreOffice fast-parser behavior: emit a console warning and continue importing instead of failing the entire document.

## Scope

- In scope: FastAttributeList unsupported-attribute policy, focused parser/ODT regression tests, and source-provenance metadata only if required by repository validation.
- Acceptance: LibreOffice style:default-outline-level and arbitrary unknown attributes are warned about and ignored; the document still imports.
- Preserve: malformed XML rejection, parser resource ceilings, cancellation, duplicate attributes, missing required fields, invalid supported values, current xmloff/sw ownership, and source-shaped file layout.
- Out of scope: unrelated ODF feature support or broad importer refactoring.

## Plan

1. Change the existing FastAttributeList policy at the xmloff parser boundary so unsupported attributes are reported with console.warn and omitted from semantic access, following pinned LibreOffice fastparser/fastattribs behavior.
2. Update focused parser and Writer ODT tests to assert warnings and successful import for style:default-outline-level and an arbitrary unknown property, while retaining strict failure tests for structural and supported-value errors.
3. Run the declared targeted tests, typecheck/lint/provenance checks, Agentplane route validation, and the broader repository verification if feasible; record exact evidence.
4. Review the final diff and finish the direct-mode task with traceable commit metadata.

## Verify Steps

1. Run `npm exec vitest run apps/office/src/xmloff/source/core/xml-parser.test.ts apps/office/src/sw/source/filter/xml/odt-roundtrip.test.ts`. Expected: unknown/unsupported attributes warn and do not abort parsing or ODT import; existing strict parser/import cases pass.
2. Run `npm run typecheck && npm run lint`. Expected: no TypeScript or ESLint errors.
3. Run `npm run check:source-provenance && npm run inventory:parity`. Expected: pinned upstream mappings and evidence remain valid.
4. Run `node .agentplane/policy/check-routing.mjs && ap doctor`. Expected: routing and repository workflow checks pass.
5. Run `npm run verify`. Expected: the full repository verification passes; if an infrastructure-only blocker occurs, record the exact command, failure, residual risk, and obtain approval before any skip.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert the task implementation/close commit(s).
- Re-run the focused ODF parser and round-trip tests to confirm the prior strict behavior is restored without unrelated changes.

## Findings
