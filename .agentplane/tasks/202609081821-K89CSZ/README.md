---
id: "202609081821-K89CSZ"
title: "Reimplement Writer ODT package and XML filters"
status: "DOING"
priority: "high"
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
  updated_at: "2026-09-08T18:22:32.798Z"
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
    body: "Start: implement the source-guided ZIP package layer and bounded ODF 1.3 Writer import and export against the canonical SwDoc graph."
events:
  -
    type: "status"
    at: "2026-09-08T18:22:41.135Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the source-guided ZIP package layer and bounded ODF 1.3 Writer import and export against the canonical SwDoc graph."
doc_version: 3
doc_updated_at: "2026-09-08T18:22:41.135Z"
doc_updated_by: "CODER"
description: "Add a source-guided ZIP package layer and bounded ODF 1.3 Writer import/export that maps the canonical SwDoc graph without silently dropping unsupported state."
sections:
  Summary: |-
    Reimplement Writer ODT package and XML filters

    Create a source-guided OpenDocument Text package and XML filter path that reads and writes real ODT bytes against the canonical SwDoc graph, instead of serializing browser view state.
  Scope: |-
    In scope:
    - Add package/source/zipapi counterparts for CRC32, ZIP central-directory parsing, STORE and DEFLATE input, deterministic STORE output, safe entry names, CRC validation, and bounded resource limits.
    - Add package/source/manifest export for the required ODF package manifest.
    - Add xmloff text conversion for paragraphs, headings, significant spaces, tabs, line breaks, and bounded direct Bold, Italic, and single Underline spans.
    - Add sw/source/filter/xml import and export orchestration for ODF 1.3 mimetype, manifest.xml, styles.xml, content.xml, and meta.xml.
    - Map Default Paragraph Style, Heading 1, style inheritance, and direct paragraph alignment between ODF XML and SwDoc items.
    - Reject unsupported current model state rather than silently dropping it, including Writer lists until their ODF list-style task.
    - Add focused corruption, security-limit, XML, import, export, and round-trip tests.
    - Update architecture, format documentation, source provenance/tree, and Writer parity evidence.
    Expected paths: apps/office/src/package/source, apps/office/src/xmloff/source, apps/office/src/sw/source/filter/xml, focused SwDoc accessors if required, docs/program, source provenance/tree checks, and parity inventory tests.
    Out of scope: browser File Open/Save UI, ODT lists, tables, images, fields, tracked changes, page styles, embedded objects, encryption, signatures, macros, RDF, DOCX, and unrelated suites.
  Plan: "1. Implement bounded secure ZIP package primitives. 2. Implement ODF manifest and XML text conversion. 3. Map Writer styles, alignment, text, and direct character hints to and from SwDoc. 4. Add import and export orchestration with explicit rejection of unsupported state. 5. Add complete tests, provenance, parity documentation, and full verification."
  Verify Steps: |-
    1. Inspect dependencies and implementation. Expected: no new package dependency or network access; ZIP and XML logic resides under package, xmloff, and sw filter ownership, and operates on SwDoc rather than React projections.
    2. Run focused Vitest coverage for CRC32, ZIP reader/writer, ODF XML import/export, round-trip, malformed package/XML, resource limits, whitespace, character formatting, styles, alignment, and explicit unsupported-state rejection. Expected: all focused tests pass and every new branch is exercised.
    3. Run npm run check:source-provenance and npm run check:source-tree. Expected: every new runtime file maps to an existing pinned LibreOffice source and the exhaustive runtime manifest is current.
    4. Run the Writer parity validator against the pinned vendor checkout. Expected: the new ODT record resolves implementation, test, and documentation markers with zero exceptions.
    5. Run npm run verify. Expected: formatting, lint, TypeScript, office and inventory coverage, all Chromium E2E tests, static build, JSDoc, and file-size gates pass.
    6. Run ap doctor, the policy routing check, git diff check, and full git status. Expected: workflow checks pass and only task-scoped artifacts exist before commit; final tracked and untracked state is clean.
  Verification: "Pending implementation."
  Rollback Plan: "Revert the implementation and task-close commits. Remove only the new package, xmloff, and Writer XML filter modules and their provenance records; retain the existing SwDoc snapshot and browser-local storage path. Re-run full verification and source-tree checks."
  Findings: "Audit finding: the project has HTML and plain-text clipboard serializers plus JSON browser persistence, but no ODT package reader or writer. The pinned Writer flow reads styles.xml before content.xml and writes styles.xml and content.xml through the package storage boundary. A correct browser implementation therefore needs both a real ZIP container layer and source-shaped XML import and export orchestration; exporting DOM or JSON under an ODT extension would be misaligned."
id_source: "generated"
---
## Summary

Reimplement Writer ODT package and XML filters

Create a source-guided OpenDocument Text package and XML filter path that reads and writes real ODT bytes against the canonical SwDoc graph, instead of serializing browser view state.

## Scope

In scope:
- Add package/source/zipapi counterparts for CRC32, ZIP central-directory parsing, STORE and DEFLATE input, deterministic STORE output, safe entry names, CRC validation, and bounded resource limits.
- Add package/source/manifest export for the required ODF package manifest.
- Add xmloff text conversion for paragraphs, headings, significant spaces, tabs, line breaks, and bounded direct Bold, Italic, and single Underline spans.
- Add sw/source/filter/xml import and export orchestration for ODF 1.3 mimetype, manifest.xml, styles.xml, content.xml, and meta.xml.
- Map Default Paragraph Style, Heading 1, style inheritance, and direct paragraph alignment between ODF XML and SwDoc items.
- Reject unsupported current model state rather than silently dropping it, including Writer lists until their ODF list-style task.
- Add focused corruption, security-limit, XML, import, export, and round-trip tests.
- Update architecture, format documentation, source provenance/tree, and Writer parity evidence.
Expected paths: apps/office/src/package/source, apps/office/src/xmloff/source, apps/office/src/sw/source/filter/xml, focused SwDoc accessors if required, docs/program, source provenance/tree checks, and parity inventory tests.
Out of scope: browser File Open/Save UI, ODT lists, tables, images, fields, tracked changes, page styles, embedded objects, encryption, signatures, macros, RDF, DOCX, and unrelated suites.

## Plan

1. Implement bounded secure ZIP package primitives. 2. Implement ODF manifest and XML text conversion. 3. Map Writer styles, alignment, text, and direct character hints to and from SwDoc. 4. Add import and export orchestration with explicit rejection of unsupported state. 5. Add complete tests, provenance, parity documentation, and full verification.

## Verify Steps

1. Inspect dependencies and implementation. Expected: no new package dependency or network access; ZIP and XML logic resides under package, xmloff, and sw filter ownership, and operates on SwDoc rather than React projections.
2. Run focused Vitest coverage for CRC32, ZIP reader/writer, ODF XML import/export, round-trip, malformed package/XML, resource limits, whitespace, character formatting, styles, alignment, and explicit unsupported-state rejection. Expected: all focused tests pass and every new branch is exercised.
3. Run npm run check:source-provenance and npm run check:source-tree. Expected: every new runtime file maps to an existing pinned LibreOffice source and the exhaustive runtime manifest is current.
4. Run the Writer parity validator against the pinned vendor checkout. Expected: the new ODT record resolves implementation, test, and documentation markers with zero exceptions.
5. Run npm run verify. Expected: formatting, lint, TypeScript, office and inventory coverage, all Chromium E2E tests, static build, JSDoc, and file-size gates pass.
6. Run ap doctor, the policy routing check, git diff check, and full git status. Expected: workflow checks pass and only task-scoped artifacts exist before commit; final tracked and untracked state is clean.

## Verification

Pending implementation.

## Rollback Plan

Revert the implementation and task-close commits. Remove only the new package, xmloff, and Writer XML filter modules and their provenance records; retain the existing SwDoc snapshot and browser-local storage path. Re-run full verification and source-tree checks.

## Findings

Audit finding: the project has HTML and plain-text clipboard serializers plus JSON browser persistence, but no ODT package reader or writer. The pinned Writer flow reads styles.xml before content.xml and writes styles.xml and content.xml through the package storage boundary. A correct browser implementation therefore needs both a real ZIP container layer and source-shaped XML import and export orchestration; exporting DOM or JSON under an ODT extension would be misaligned.
