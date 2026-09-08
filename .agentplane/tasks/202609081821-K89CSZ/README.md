---
id: "202609081821-K89CSZ"
title: "Reimplement Writer ODT package and XML filters"
result_summary: "verified-202609081821-K89CSZ"
status: "DONE"
priority: "high"
owner: "CODER"
revision: 9
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
  state: "ok"
  updated_at: "2026-09-08T19:18:11.868Z"
  updated_by: "CODER"
  note: "verified-202609081821-K89CSZ"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-08T19:17:37.758Z"
  updated_by: "EVALUATOR"
  note: "Source-guided bounded Writer ODT package/XML slice meets its approved direct-mode acceptance contract."
  evaluated_sha: "f81a8409524699fbae9b7dc5cfb05747a36e9555"
  blueprint_digest: "a1a1ccfc3cee1376ec0dc1e930ab7586a4782b3b7adf60a60c042009e08d5d23"
  evidence_refs:
    - ".agentplane/tasks/202609081821-K89CSZ/README.md"
    - ".agentplane/tasks/202609081821-K89CSZ/quality/20260908-191737758-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609081821-K89CSZ/quality/20260908-191737758-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609081821-K89CSZ/quality/20260908-191737758-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609081821-K89CSZ/blueprint/resolved-snapshot.json"
    - "f81a84095246"
    - "apps/office/src/sw/source/filter/xml/odt-roundtrip.test.ts"
    - "apps/office/src/package/source/zipapi/ZipFile.test.ts"
    - "docs/program/writer-odt-format.md"
  findings:
    - "No unresolved task-scope findings: package paths are validated safely, mandatory streams and manifests are checked, XML import/export uses canonical SwDoc structures, and unsupported semantics fail explicitly."
commit:
  hash: "eac4cdeba367f830b9e745eb6ef21a90f42bc4c5"
  message: "🧪 K89CSZ task: record Writer ODT verification"
comments:
  -
    author: "CODER"
    body: "Start: implement the source-guided ZIP package layer and bounded ODF 1.3 Writer import and export against the canonical SwDoc graph."
  -
    author: "CODER"
    body: "Verified: verified-202609081821-K89CSZ. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
events:
  -
    type: "status"
    at: "2026-09-08T18:22:41.135Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the source-guided ZIP package layer and bounded ODF 1.3 Writer import and export against the canonical SwDoc graph."
  -
    type: "verify"
    at: "2026-09-08T19:17:17.178Z"
    author: "CODER"
    state: "ok"
    note: "Implementation f81a84095246 verified: npm run verify passed (146 office and 74 inventory tests at 100% coverage, 7 Chromium E2E, production/static build); source provenance 69/69, source-tree 59 required/10 retired, Writer parity 26 gaps/0 exceptions, JSDoc/file-size/diff/routing checks passed. Pinned feature_text ODT packages also exposed and now cover safe trailing-slash ZIP directory entries; unsupported style properties remain explicitly rejected rather than silently lost."
  -
    type: "verify"
    at: "2026-09-08T19:18:11.868Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609081821-K89CSZ"
  -
    type: "status"
    at: "2026-09-08T19:18:12.001Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: verified-202609081821-K89CSZ. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
doc_version: 3
doc_updated_at: "2026-09-08T19:18:12.002Z"
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
  Verification: |-
    Pending implementation.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-08T19:17:17.178Z — VERIFY — ok

    By: CODER

    Note: Implementation f81a84095246 verified: npm run verify passed (146 office and 74 inventory tests at 100% coverage, 7 Chromium E2E, production/static build); source provenance 69/69, source-tree 59 required/10 retired, Writer parity 26 gaps/0 exceptions, JSDoc/file-size/diff/routing checks passed. Pinned feature_text ODT packages also exposed and now cover safe trailing-slash ZIP directory entries; unsupported style properties remain explicitly rejected rather than silently lost.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-08T18:22:41.135Z, excerpt_hash=sha256:bb9dc6ccd2bf7d27c26145a765fb6c33b072dade21cf54097756b3dbf4b7bbd7

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609081821-K89CSZ/blueprint/resolved-snapshot.json
    - old_digest: a1a1ccfc3cee1376ec0dc1e930ab7586a4782b3b7adf60a60c042009e08d5d23
    - current_digest: a1a1ccfc3cee1376ec0dc1e930ab7586a4782b3b7adf60a60c042009e08d5d23
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609081821-K89CSZ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609081821-K89CSZ
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-08T19:18:11.868Z — VERIFY — ok

    By: CODER

    Note: verified-202609081821-K89CSZ
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-08T19:17:17.234Z, excerpt_hash=sha256:bb9dc6ccd2bf7d27c26145a765fb6c33b072dade21cf54097756b3dbf4b7bbd7

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609081821-K89CSZ/blueprint/resolved-snapshot.json
    - old_digest: a1a1ccfc3cee1376ec0dc1e930ab7586a4782b3b7adf60a60c042009e08d5d23
    - current_digest: a1a1ccfc3cee1376ec0dc1e930ab7586a4782b3b7adf60a60c042009e08d5d23
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609081821-K89CSZ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609081821-K89CSZ --result verified-202609081821-K89CSZ --commit eac4cdeba367f830b9e745eb6ef21a90f42bc4c5
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the implementation and task-close commits. Remove only the new package, xmloff, and Writer XML filter modules and their provenance records; retain the existing SwDoc snapshot and browser-local storage path. Re-run full verification and source-tree checks."
  Findings: "Audit finding: the project has HTML and plain-text clipboard serializers plus JSON browser persistence, but no ODT package reader or writer. The pinned Writer flow reads styles.xml before content.xml and writes styles.xml and content.xml through the package storage boundary. A correct browser implementation therefore needs both a real ZIP container layer and source-shaped XML import and export orchestration; exporting DOM or JSON under an ODT extension would be misaligned."
extensions:
  implementation_commit:
    hash: "f81a8409524699fbae9b7dc5cfb05747a36e9555"
    message: "🧩 K89CSZ code: implement Writer ODT package filters"
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

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-08T19:17:17.178Z — VERIFY — ok

By: CODER

Note: Implementation f81a84095246 verified: npm run verify passed (146 office and 74 inventory tests at 100% coverage, 7 Chromium E2E, production/static build); source provenance 69/69, source-tree 59 required/10 retired, Writer parity 26 gaps/0 exceptions, JSDoc/file-size/diff/routing checks passed. Pinned feature_text ODT packages also exposed and now cover safe trailing-slash ZIP directory entries; unsupported style properties remain explicitly rejected rather than silently lost.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-08T18:22:41.135Z, excerpt_hash=sha256:bb9dc6ccd2bf7d27c26145a765fb6c33b072dade21cf54097756b3dbf4b7bbd7

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609081821-K89CSZ/blueprint/resolved-snapshot.json
- old_digest: a1a1ccfc3cee1376ec0dc1e930ab7586a4782b3b7adf60a60c042009e08d5d23
- current_digest: a1a1ccfc3cee1376ec0dc1e930ab7586a4782b3b7adf60a60c042009e08d5d23
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609081821-K89CSZ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609081821-K89CSZ
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-08T19:18:11.868Z — VERIFY — ok

By: CODER

Note: verified-202609081821-K89CSZ
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-08T19:17:17.234Z, excerpt_hash=sha256:bb9dc6ccd2bf7d27c26145a765fb6c33b072dade21cf54097756b3dbf4b7bbd7

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609081821-K89CSZ/blueprint/resolved-snapshot.json
- old_digest: a1a1ccfc3cee1376ec0dc1e930ab7586a4782b3b7adf60a60c042009e08d5d23
- current_digest: a1a1ccfc3cee1376ec0dc1e930ab7586a4782b3b7adf60a60c042009e08d5d23
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609081821-K89CSZ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609081821-K89CSZ --result verified-202609081821-K89CSZ --commit eac4cdeba367f830b9e745eb6ef21a90f42bc4c5
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the implementation and task-close commits. Remove only the new package, xmloff, and Writer XML filter modules and their provenance records; retain the existing SwDoc snapshot and browser-local storage path. Re-run full verification and source-tree checks.

## Findings

Audit finding: the project has HTML and plain-text clipboard serializers plus JSON browser persistence, but no ODT package reader or writer. The pinned Writer flow reads styles.xml before content.xml and writes styles.xml and content.xml through the package storage boundary. A correct browser implementation therefore needs both a real ZIP container layer and source-shaped XML import and export orchestration; exporting DOM or JSON under an ODT extension would be misaligned.
