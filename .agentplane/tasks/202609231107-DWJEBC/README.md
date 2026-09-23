---
id: "202609231107-DWJEBC"
title: "Match Writer ODT vertical layout and list geometry to LibreOffice"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-23T11:50:31.840Z"
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
    body: "Start: implement approved ODT paragraph and list geometry parity in the direct checkout with focused regression coverage."
events:
  -
    type: "status"
    at: "2026-09-23T11:08:30.301Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved ODT paragraph and list geometry parity in the direct checkout with focused regression coverage."
doc_version: 3
doc_updated_at: "2026-09-23T11:50:26.532Z"
doc_updated_by: "CODER"
description: "Import supported paragraph and list layout properties and correct browser presentation so line spacing and list markers follow pinned LibreOffice behavior."
sections:
  Summary: |-
    Match Writer ODT vertical layout and list geometry to LibreOffice

    Import supported paragraph and list layout properties and correct browser presentation so line spacing and list markers follow pinned LibreOffice behavior.
  Scope: "In scope: xmloff ODT paragraph/default-style and list-level layout import/export, corresponding Writer model fields, browser line and list rendering, page spacing/pagination, focused tests and necessary documentation. Out of scope: full LibreOffice shaping engine, unrelated ODT feature families, network or outside-repository access."
  Plan: "Match LibreOffice Writer ODT vertical flow and list geometry using upstream-compatible default paragraph styles, proportional line leading, paragraph spacing, and list-level alignment. Extend scope, as explicitly requested by the user on 2026-09-23, to bring the entire office app coverage gate to 100% for statements, branches, functions, and lines with meaningful tests or narrowly justified exclusions for unreachable code. Preserve ODT round trips and complete full npm run verify."
  Verify Steps: "1. Run focused Vitest suites for ODT paragraph styles, lists, Writer projection, and page layout; confirm round trips and marker placement. 2. Run npm run test:coverage; require 100% statements, branches, functions, and lines across the office app. 3. Run npm run verify; require all repository gates to pass. 4. Inspect git diff and git status --short --untracked-files=all; require only intentional task changes and clean final tracked state."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: |-
    Command: npx vitest run (apps/office)
    Result: pass
    Evidence: 79 files, 322 tests passed.
    Scope: Writer model, ODT filter, browser presentation.

    Command: npx vitest run --config scripts/libreoffice-inventory/vitest.config.ts
    Result: pass
    Evidence: 34 files, 96 tests passed, including all six pinned upstream ODT fixtures.
    Scope: Upstream fixture import, export, and inventory.

    Command: npm run test:inventory:coverage
    Result: pass
    Evidence: 100% statements, branches, functions, and lines.
    Scope: Inventory tooling.

    Command: npm run test:e2e
    Result: pass
    Evidence: 11 browser scenarios passed, including lists, ODT, and hyperlinks.
    Scope: User-visible Writer flows.

    Command: npm run typecheck; npm run lint; npm run format:check; npm run check:docs; npm run check:source-provenance; npm run check:dependencies; npm run test:static; npm run inventory:invariants
    Result: pass
    Evidence: All named checks exited zero.
    Scope: Type safety, formatting, documentation, provenance, boundaries, build, and invariants.

    Command: npm run verify; npm run test:coverage
    Result: fail
    Evidence: All 322 app tests pass, but global 100% coverage threshold fails at 98.51% lines and 96.52% branches. The report includes untouched modules with uncovered lines, including WriterLinkDialog at 0%.
    Scope: Repository-wide app coverage gate. User decision on accepting this existing global gate gap is pending.

    Residual risk: Browser text shaping and paragraph splitting are still bounded approximations; no user-specific ODT was supplied for pixel comparison.
id_source: "generated"
---
## Summary

Match Writer ODT vertical layout and list geometry to LibreOffice

Import supported paragraph and list layout properties and correct browser presentation so line spacing and list markers follow pinned LibreOffice behavior.

## Scope

In scope: xmloff ODT paragraph/default-style and list-level layout import/export, corresponding Writer model fields, browser line and list rendering, page spacing/pagination, focused tests and necessary documentation. Out of scope: full LibreOffice shaping engine, unrelated ODT feature families, network or outside-repository access.

## Plan

Match LibreOffice Writer ODT vertical flow and list geometry using upstream-compatible default paragraph styles, proportional line leading, paragraph spacing, and list-level alignment. Extend scope, as explicitly requested by the user on 2026-09-23, to bring the entire office app coverage gate to 100% for statements, branches, functions, and lines with meaningful tests or narrowly justified exclusions for unreachable code. Preserve ODT round trips and complete full npm run verify.

## Verify Steps

1. Run focused Vitest suites for ODT paragraph styles, lists, Writer projection, and page layout; confirm round trips and marker placement. 2. Run npm run test:coverage; require 100% statements, branches, functions, and lines across the office app. 3. Run npm run verify; require all repository gates to pass. 4. Inspect git diff and git status --short --untracked-files=all; require only intentional task changes and clean final tracked state.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

Command: npx vitest run (apps/office)
Result: pass
Evidence: 79 files, 322 tests passed.
Scope: Writer model, ODT filter, browser presentation.

Command: npx vitest run --config scripts/libreoffice-inventory/vitest.config.ts
Result: pass
Evidence: 34 files, 96 tests passed, including all six pinned upstream ODT fixtures.
Scope: Upstream fixture import, export, and inventory.

Command: npm run test:inventory:coverage
Result: pass
Evidence: 100% statements, branches, functions, and lines.
Scope: Inventory tooling.

Command: npm run test:e2e
Result: pass
Evidence: 11 browser scenarios passed, including lists, ODT, and hyperlinks.
Scope: User-visible Writer flows.

Command: npm run typecheck; npm run lint; npm run format:check; npm run check:docs; npm run check:source-provenance; npm run check:dependencies; npm run test:static; npm run inventory:invariants
Result: pass
Evidence: All named checks exited zero.
Scope: Type safety, formatting, documentation, provenance, boundaries, build, and invariants.

Command: npm run verify; npm run test:coverage
Result: fail
Evidence: All 322 app tests pass, but global 100% coverage threshold fails at 98.51% lines and 96.52% branches. The report includes untouched modules with uncovered lines, including WriterLinkDialog at 0%.
Scope: Repository-wide app coverage gate. User decision on accepting this existing global gate gap is pending.

Residual risk: Browser text shaping and paragraph splitting are still bounded approximations; no user-specific ODT was supplied for pixel comparison.
