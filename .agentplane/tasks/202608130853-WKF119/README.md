---
id: "202608130853-WKF119"
title: "Implement Writer Cut and Paste clipboard baseline"
status: "DOING"
priority: "med"
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
  updated_at: "2026-08-13T08:53:48.797Z"
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
    body: "Start: implement bounded Writer Cut and Paste with the pinned Writer clipboard command placement and explicit format limits."
events:
  -
    type: "status"
    at: "2026-08-13T08:53:49.384Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement bounded Writer Cut and Paste with the pinned Writer clipboard command placement and explicit format limits."
doc_version: 3
doc_updated_at: "2026-08-13T09:30:15.462Z"
doc_updated_by: "CODER"
description: "Implement LO-WRITER-0110: Writer Cut and Paste in their pinned Edit and standard-toolbar placements. Support one same-paragraph or whole-document browser selection, plain text and the bounded Writer semantic HTML emitted by Copy; preserve supported direct character formatting for safe HTML. Record unsupported clipboard formats, multi-range behavior, and full Writer filter semantics explicitly."
sections:
  Summary: |-
    Implement Writer Cut and Paste clipboard baseline

    Implement LO-WRITER-0110: Writer Cut and Paste in their pinned Edit and standard-toolbar placements. Support one same-paragraph browser selection or collapsed caret, plain text, and the bounded Writer semantic HTML emitted by Copy; preserve supported direct character formatting for safe HTML. Record unsupported clipboard formats, cross-paragraph behavior, and full Writer filter semantics explicitly.
  Scope: |-
    - In scope: Implement LO-WRITER-0110: Writer Cut and Paste in their pinned Edit and standard-toolbar placements. Support one same-paragraph browser selection or collapsed caret, plain text, and the bounded Writer semantic HTML emitted by Copy; preserve supported direct character formatting for safe HTML. Record unsupported clipboard formats, cross-paragraph behavior, and full Writer filter semantics explicitly.
    - Out of scope: Cross-paragraph, multi-range, table, object, RTF, ODT/DOCX, and Paste Special transfer; unrelated refactors not required for this clipboard baseline.
  Plan: "1. Add pure Writer selection replacement and deletion transitions that preserve paragraph ordering, list state, and direct text runs. 2. Add browser clipboard readers and bounded HTML/plain-text parser at sw/source/uibase/dochdl/swdtflvr.ts ownership; permit only Writer-produced strong/em/single-underline semantics and reject unsafe markup. 3. Wire native paste/cut events, Edit menu, standard toolbar, Ctrl/Meta X/V, immutable history, focused caret, and deterministic feedback through the Writer text shell/view. 4. Add tests for domain transitions, parser safety, menu/toolbar/shortcuts/history, native ClipboardEvent handling, and one targeted Chromium E2E. 5. Record LO-WRITER-0110, upstream implementation/UI/test/help evidence, explicit gaps, docs, source provenance when new modules are added, and file-size review. 6. Run npm run test:coverage, targeted E2E, lint/typecheck/docs/source-tree/provenance/static checks; full all-suite cadence remains deferred until the tenth completed task."
  Verify Steps: "1. Run npm run test:coverage; expected: all Writer fast suites pass with 100% coverage. 2. Run npm run test:e2e -- --grep \"Writer Cut and Paste\"; expected: Chromium verifies Edit/menu/toolbar/shortcut Cut and safe HTML/plain-text Paste with undo/redo. 3. Run npm run format:check, npm run lint, npm run typecheck, npm run check:docs, npm run check:source-provenance, npm run check:source-tree, npm run check:file-size, npm run test:static, npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference, and git diff --check; expected: all pass. 4. Inspect LO-WRITER-0110 parity record; expected: it retains swdtflvr/UI/test/help sources and explicit unsupported formats/selection limits."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: |-
    - The initial broad phrase about whole-document browser selection was narrowed to same-paragraph Cut/Paste so this atomic baseline preserves the existing direct-run and paragraph model; the explicit limitation is recorded in LO-WRITER-0110 and writer-clipboard.md.
    - Command: npm run test:coverage. Result: pass — 101 tests, 100% statements, branches, functions, and lines. Scope: fast Writer and browser adapter suites.
    - Command: npm run test:e2e -- --grep "Writer Cut and Paste". Result: pass — 1 Chromium test. Scope: production native Cut/Paste, semantic direct-format transfer, history, and menu placement.
    - Command: npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:source-provenance && npm run check:source-tree && npm run check:file-size && npm run test:static. Result: pass. Scope: static production build, quality gates, JSDoc, and mapped source tree.
    - Command: npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference. Result: pass — baseline 9bc445..., 20 documented gaps, zero evidence exceptions. Scope: local/upstream implementation, test, and documentation marker resolution.
    - Command: ap doctor && node .agentplane/policy/check-routing.mjs && git diff --check. Result: pass; doctor reported only its non-blocking installed pre-push fallback information.
    - File-size review: writer.ts (670 lines) and view.tsx (702 lines) remain decomposition candidates; neither reaches the mandatory 1000-line limit. The newly added DocumentContentOperationsManager module keeps text-range ownership out of the already large Writer aggregate.
id_source: "generated"
---
## Summary

Implement Writer Cut and Paste clipboard baseline

Implement LO-WRITER-0110: Writer Cut and Paste in their pinned Edit and standard-toolbar placements. Support one same-paragraph browser selection or collapsed caret, plain text, and the bounded Writer semantic HTML emitted by Copy; preserve supported direct character formatting for safe HTML. Record unsupported clipboard formats, cross-paragraph behavior, and full Writer filter semantics explicitly.

## Scope

- In scope: Implement LO-WRITER-0110: Writer Cut and Paste in their pinned Edit and standard-toolbar placements. Support one same-paragraph browser selection or collapsed caret, plain text, and the bounded Writer semantic HTML emitted by Copy; preserve supported direct character formatting for safe HTML. Record unsupported clipboard formats, cross-paragraph behavior, and full Writer filter semantics explicitly.
- Out of scope: Cross-paragraph, multi-range, table, object, RTF, ODT/DOCX, and Paste Special transfer; unrelated refactors not required for this clipboard baseline.

## Plan

1. Add pure Writer selection replacement and deletion transitions that preserve paragraph ordering, list state, and direct text runs. 2. Add browser clipboard readers and bounded HTML/plain-text parser at sw/source/uibase/dochdl/swdtflvr.ts ownership; permit only Writer-produced strong/em/single-underline semantics and reject unsafe markup. 3. Wire native paste/cut events, Edit menu, standard toolbar, Ctrl/Meta X/V, immutable history, focused caret, and deterministic feedback through the Writer text shell/view. 4. Add tests for domain transitions, parser safety, menu/toolbar/shortcuts/history, native ClipboardEvent handling, and one targeted Chromium E2E. 5. Record LO-WRITER-0110, upstream implementation/UI/test/help evidence, explicit gaps, docs, source provenance when new modules are added, and file-size review. 6. Run npm run test:coverage, targeted E2E, lint/typecheck/docs/source-tree/provenance/static checks; full all-suite cadence remains deferred until the tenth completed task.

## Verify Steps

1. Run npm run test:coverage; expected: all Writer fast suites pass with 100% coverage. 2. Run npm run test:e2e -- --grep "Writer Cut and Paste"; expected: Chromium verifies Edit/menu/toolbar/shortcut Cut and safe HTML/plain-text Paste with undo/redo. 3. Run npm run format:check, npm run lint, npm run typecheck, npm run check:docs, npm run check:source-provenance, npm run check:source-tree, npm run check:file-size, npm run test:static, npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference, and git diff --check; expected: all pass. 4. Inspect LO-WRITER-0110 parity record; expected: it retains swdtflvr/UI/test/help sources and explicit unsupported formats/selection limits.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

- The initial broad phrase about whole-document browser selection was narrowed to same-paragraph Cut/Paste so this atomic baseline preserves the existing direct-run and paragraph model; the explicit limitation is recorded in LO-WRITER-0110 and writer-clipboard.md.
- Command: npm run test:coverage. Result: pass — 101 tests, 100% statements, branches, functions, and lines. Scope: fast Writer and browser adapter suites.
- Command: npm run test:e2e -- --grep "Writer Cut and Paste". Result: pass — 1 Chromium test. Scope: production native Cut/Paste, semantic direct-format transfer, history, and menu placement.
- Command: npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:source-provenance && npm run check:source-tree && npm run check:file-size && npm run test:static. Result: pass. Scope: static production build, quality gates, JSDoc, and mapped source tree.
- Command: npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference. Result: pass — baseline 9bc445..., 20 documented gaps, zero evidence exceptions. Scope: local/upstream implementation, test, and documentation marker resolution.
- Command: ap doctor && node .agentplane/policy/check-routing.mjs && git diff --check. Result: pass; doctor reported only its non-blocking installed pre-push fallback information.
- File-size review: writer.ts (670 lines) and view.tsx (702 lines) remain decomposition candidates; neither reaches the mandatory 1000-line limit. The newly added DocumentContentOperationsManager module keeps text-range ownership out of the already large Writer aggregate.
