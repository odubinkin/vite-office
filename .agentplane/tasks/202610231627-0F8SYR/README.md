---
id: "202610231627-0F8SYR"
title: "Port Writer API attachment points consumed by DomainMapper"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "writer"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-23T16:27:38.359Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-23T17:32:02.208Z"
  updated_by: "CODER"
  note: "Verified affected modules: 211 Writer tests in 15 files, 2 shared contract tests, 48 boundary tooling tests. Application typecheck, changed-file ESLint/Prettier, source-tree/provenance, docs, size, dependency and Writer/shared registry checks pass. Full suites omitted per user request; exact commands and limits recorded in Findings."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-23T17:32:46.599Z"
  updated_by: "EVALUATOR"
  note: "Bounded Writer import API matches documented pinned-source responsibilities and targeted acceptance. No broad Writer/UNO parity promotion."
  evaluated_sha: "98a2b67e2d4dc7988f815a0e3aed36890025da7b"
  blueprint_digest: "ba4690f395b76ada0f5a455f9efb8540a477507034cb6ba66a035148358b4f52"
  evidence_refs:
    - ".agentplane/tasks/202610231627-0F8SYR/README.md"
    - ".agentplane/tasks/202610231627-0F8SYR/quality/20261023-173246599-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610231627-0F8SYR/quality/20261023-173246599-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610231627-0F8SYR/quality/20261023-173246599-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610231627-0F8SYR/blueprint/resolved-snapshot.json"
    - "apps/office/src/sw/source/core/unocore/native-text-import-api.test.ts"
    - "apps/office/src/svl/source/items/itemprop.test.ts"
    - "vendor/libreoffice-reference/sw/source/core/unocore/unoobj.cxx"
    - "vendor/libreoffice-reference/sw/source/core/unocore/unotext.cxx"
  findings:
    - "Canonical SwDoc/nodes/items remain authoritative; live range marks, property staging/types/errors, paragraph rollback, styles, numbering Any sequences and table conversion are exercised by 211 affected Writer tests and 2 shared tests. Boundary configuration adds only the native sw -> cppuhelper edge, with 48 tooling tests and source dependency evidence."
    - "Application typecheck, changed-file lint/formatting, dependency graph, docs/size, source-tree/provenance and Writer/shared registry checks pass. Exact commands and results are recorded in task Findings. Full suites were excluded by the user."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement user-approved pinned Writer API attachment points for DomainMapper within the existing canonical model; targeted tests only."
events:
  -
    type: "status"
    at: "2026-10-23T16:27:38.789Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement user-approved pinned Writer API attachment points for DomainMapper within the existing canonical model; targeted tests only."
  -
    type: "verify"
    at: "2026-10-23T17:32:02.208Z"
    author: "CODER"
    state: "ok"
    note: "Verified affected modules: 211 Writer tests in 15 files, 2 shared contract tests, 48 boundary tooling tests. Application typecheck, changed-file ESLint/Prettier, source-tree/provenance, docs, size, dependency and Writer/shared registry checks pass. Full suites omitted per user request; exact commands and limits recorded in Findings."
doc_version: 3
doc_updated_at: "2026-10-23T17:32:02.261Z"
doc_updated_by: "CODER"
description: "User-approved port of Writer text/document/range/cursor/property/style/numbering/table API attachment points required by upstream DomainMapper within the current canonical Writer core. Preserve pinned upstream ownership, contracts, behavior and error handling. Do not implement DOCX parsing/export or expand unsupported model features. Run only affected module tests and targeted checks."
sections:
  Summary: |-
    Port Writer API attachment points consumed by DomainMapper

    User-approved port of Writer text/document/range/cursor/property/style/numbering/table API attachment points required by upstream DomainMapper within the current canonical Writer core. Preserve pinned upstream ownership, contracts, behavior and error handling. Do not implement DOCX parsing/export or expand unsupported model features. Run only affected module tests and targeted checks.
  Scope: "Writer import-facing unocore API and required existing core connections; shared exception/property contracts where required; focused tests and exact per-module provenance/runtime registry entries. Include the native sw -> cppuhelper dependency declared by sw/Library_sw.mk and sw/inc/unosett.hxx, with boundary regression coverage. Registry files are required companions of the implementation modules, correcting the initial file-count estimate without adding product behavior. No UI, Calc implementation, DOCX parser, OOXML package engine or export feature changes; the existing ODF caller only migrates to the explicit numbering record projection."
  Plan: "Implement pinned upstream Writer import attachment contracts within current core: SwXTextDocument service/style suppliers; SwXTextRange and SwXTextCursor with registered SwPaM ownership; SwXText append/insert/finish paragraph and properties; supported style/numbering/table API routes. Preserve native property types, units, exceptions, range ownership and mutation ordering, with no duplicate document state. Include source provenance/runtime records and targeted regression tests. Exclude DOCX parser/export and unimplemented core features. Verify only affected Writer/shared modules plus typecheck and targeted structural/provenance checks; no complete test suites."
  Verify Steps: "Run targeted Vitest files for new unocore API, adjacent text/range/style/table/numbering core modules touched by implementation, and affected source/provenance tooling when changed. Run application TypeScript checking, ESLint/Prettier on changed authored files, source-tree and source-provenance checks. Assert upstream-derived text append/finish selection semantics, typed property conversion and errors, style inheritance, live ranges, foreign ranges, table conversion, numbering and disposal. Do not run full suites as requested by user. Record exact commands/results. Run ap task verify-show before checks and record ap verify result."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-23T17:32:02.208Z — VERIFY — ok

    By: CODER

    Note: Verified affected modules: 211 Writer tests in 15 files, 2 shared contract tests, 48 boundary tooling tests. Application typecheck, changed-file ESLint/Prettier, source-tree/provenance, docs, size, dependency and Writer/shared registry checks pass. Full suites omitted per user request; exact commands and limits recorded in Findings.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-23T17:32:01.690Z, excerpt_hash=sha256:379ea1bf2470e1913e9fd644a4369736f82a4e89d51d9daa03be09f013653cc7

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610231627-0F8SYR/blueprint/resolved-snapshot.json
    - old_digest: ba4690f395b76ada0f5a455f9efb8540a477507034cb6ba66a035148358b4f52
    - current_digest: ba4690f395b76ada0f5a455f9efb8540a477507034cb6ba66a035148358b4f52
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610231627-0F8SYR

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610231627-0F8SYR
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only the task implementation commit and task-owned registry entries; preserve all unrelated work."
  Findings: |-
    Pinned source: vendor/libreoffice-reference at 9bc445578031fecf56086729d8e4940c77e14d65 (libreoffice-26.8.0.2). Work remained in vite-office; no network access, sibling checkout mutation, UI or Calc implementation changes.

    Implemented SwXTextDocument supplier through stable SwDocShell.GetModel; SwXText/SwXTextRange/SwXTextCursor/SwXParagraph; internal document-owned UnoMark ranges distinct from visible bookmarks; supported bookmark descriptor attachment; original typed property map/introspection/state/reset; style families/descriptors over canonical paragraph/page/numbering owners; typed numbering PropertyValue sequence/index interfaces; table conversion wrapping original text nodes, row/cell properties and native property failure isolation. All data remains in existing SwDoc/nodes/items. Existing ODF numbering publication consumes the explicit legacy record projection while getByIndex exposes the native Any sequence.

    Native contract checks include CR-only paragraph splitting with LF preservation, live endpoint correction, NOHINTEXPAND/direct equal-to-inherited attributes, finish insertion before previous-paragraph properties, style side effects before staged Which items, cursor WrappedTargetException, different insert/finish exception rollback, signed byte paragraph line counts, MM100 conversion, rejected foreign/disposed ranges, node-preserving full/partial text-to-table and native denylists. The sw -> cppuhelper edge is backed by Library_sw.mk and unosett.hxx; no reverse edge or guard algorithm was relaxed.

    No whole-module parity promotion. DomainMapper and OOXML package/parser/export are not implemented by this task. Full generic UNO runtime metadata/listeners, complete native ABI, interactive undo/action integration, Unicode/layout navigation, unsupported style/section families and expanded user bookmarks remain outside the represented API/core slice. Registry semantic statuses remain unverified; focused source-derived regression evidence is not presented as a native differential/full Writer conformance result. Broader numbering temporary-service destruction and full native service lifetimes remain unverified.

    Verification (final passing runs):

    - Command: `npm run test:writer -- src/sw/source/core/unocore/native-text-import-api.test.ts src/sw/source/core/unocore/unosett.test.ts src/sw/source/core/unocore/native-numbering-publication.test.ts src/sw/source/core/edit/edfcol.test.ts src/sw/source/core/edit/edfcol-modifier.test.ts src/sw/source/core/edit/edfcol-reset.test.ts src/sw/source/core/txtnode/ndhints.test.ts src/sw/source/core/txtnode/ndtxt.test.ts src/sw/source/core/crsr/pam-selection.test.ts src/sw/source/core/undo/native-bookmark-replace-history.test.ts src/sw/source/core/docnode/native-table-border-owner.test.ts src/sw/source/core/docnode/native-table-border-common-state.test.ts src/sw/source/uibase/app/docsh.test.ts src/sw/source/filter/xml/odt-list-label-alignment-roundtrip.test.ts src/sw/source/filter/xml/odt-list-marker-roundtrip.test.ts`
      Result: pass. Evidence/Scope: 15 files, 211 tests; affected Writer API, formatting, text/hints, ranges/bookmarks, tables, shell and ODT numbering.
    - Command: `npm run test:shared -- src/svl/source/items/itemprop.test.ts`
      Result: pass. Evidence/Scope: 1 file, 2 tests; actual Property/UnknownPropertyException Any copies and property-info ownership.
    - Command: `npx vitest run scripts/check-module-boundaries.test.ts`
      Result: pass. Evidence/Scope: 1 file, 48 tests; Writer helper edge, reverse isolation and existing module boundaries.
    - Command: `npm run typecheck --workspace @vite-office/office`
      Result: pass. Evidence/Scope: Application TypeScript check.
    - Command: `npx eslint apps/office/src/sw/source/core/doc/doc.ts apps/office/src/sw/source/core/doc/docbm.ts apps/office/src/sw/source/core/doc/docfmt.ts apps/office/src/sw/source/core/doc/docnum.ts apps/office/src/sw/source/core/docnode/ndtbl.ts apps/office/src/sw/source/core/docnode/node.ts apps/office/src/sw/source/core/docnode/nodes.ts apps/office/src/sw/source/core/txtnode/ndhints-font.ts apps/office/src/sw/source/core/unocore/native-numbering-publication.test.ts apps/office/src/sw/source/core/unocore/unosett.ts apps/office/src/sw/source/filter/xml/xmlexp.ts apps/office/src/sw/source/uibase/app/docsh.ts apps/office/src/cppu/inc/com/sun/star/beans/UnknownPropertyException.ts apps/office/src/svl/source/items/itemprop.ts apps/office/src/sw/source/core/crsr/bookmark.ts apps/office/src/sw/source/core/unocore/native-text-import-api.test.ts apps/office/src/sw/source/core/unocore/unobkm.ts apps/office/src/sw/source/core/unocore/unocrsrhelper.ts apps/office/src/sw/source/core/unocore/unomap.ts apps/office/src/sw/source/core/unocore/unoobj.ts apps/office/src/sw/source/core/unocore/unoobj2.ts apps/office/src/sw/source/core/unocore/unoparagraph.ts apps/office/src/sw/source/core/unocore/unosett-properties.ts apps/office/src/sw/source/core/unocore/unostyle.ts apps/office/src/sw/source/core/unocore/unotbl.ts apps/office/src/sw/source/core/unocore/unotext.ts apps/office/src/sw/source/uibase/uno/unotxdoc.ts apps/office/src/udkapi/com/sun/star/beans/Property.ts apps/office/src/svl/source/items/itemprop.test.ts scripts/check-module-boundaries.mjs scripts/check-module-boundaries.test.ts --max-warnings 0`
      Result: pass. Evidence/Scope: All changed source and tool files.
    - Command: `npx prettier --check apps/office/src/sw/source/core/doc/doc.ts apps/office/src/sw/source/core/doc/docbm.ts apps/office/src/sw/source/core/doc/docfmt.ts apps/office/src/sw/source/core/doc/docnum.ts apps/office/src/sw/source/core/docnode/ndtbl.ts apps/office/src/sw/source/core/docnode/node.ts apps/office/src/sw/source/core/docnode/nodes.ts apps/office/src/sw/source/core/txtnode/ndhints-font.ts apps/office/src/sw/source/core/unocore/native-numbering-publication.test.ts apps/office/src/sw/source/core/unocore/unosett.ts apps/office/src/sw/source/filter/xml/xmlexp.ts apps/office/src/sw/source/uibase/app/docsh.ts docs/program/registry/writer/provenance/sw/source/core/doc/doc.ts.json docs/program/registry/writer/provenance/sw/source/core/doc/docbm.ts.json docs/program/registry/writer/provenance/sw/source/core/doc/docfmt.ts.json docs/program/registry/writer/provenance/sw/source/core/doc/docnum.ts.json docs/program/registry/writer/provenance/sw/source/core/docnode/ndtbl.ts.json docs/program/registry/writer/provenance/sw/source/core/docnode/node.ts.json docs/program/registry/writer/provenance/sw/source/core/docnode/nodes.ts.json docs/program/registry/writer/provenance/sw/source/core/txtnode/ndhints-font.ts.json docs/program/registry/writer/provenance/sw/source/core/unocore/unosett.ts.json docs/program/registry/writer/provenance/sw/source/filter/xml/xmlexp.ts.json docs/program/registry/writer/provenance/sw/source/uibase/app/docsh.ts.json docs/program/registry/writer/runtime/sw/source/core/doc/doc.ts.json docs/program/registry/writer/runtime/sw/source/core/doc/docbm.ts.json docs/program/registry/writer/runtime/sw/source/core/doc/docfmt.ts.json docs/program/registry/writer/runtime/sw/source/core/doc/docnum.ts.json docs/program/registry/writer/runtime/sw/source/core/docnode/ndtbl.ts.json docs/program/registry/writer/runtime/sw/source/core/docnode/node.ts.json docs/program/registry/writer/runtime/sw/source/core/docnode/nodes.ts.json docs/program/registry/writer/runtime/sw/source/core/txtnode/ndhints-font.ts.json docs/program/registry/writer/runtime/sw/source/core/unocore/unosett.ts.json docs/program/registry/writer/runtime/sw/source/filter/xml/xmlexp.ts.json docs/program/registry/writer/runtime/sw/source/uibase/app/docsh.ts.json scripts/check-module-boundaries.mjs scripts/check-module-boundaries.test.ts apps/office/src/cppu/inc/com/sun/star/beans/UnknownPropertyException.ts apps/office/src/svl/source/items/itemprop.test.ts apps/office/src/svl/source/items/itemprop.ts apps/office/src/sw/source/core/crsr/bookmark.ts apps/office/src/sw/source/core/unocore/native-text-import-api.test.ts apps/office/src/sw/source/core/unocore/unobkm.ts apps/office/src/sw/source/core/unocore/unocrsrhelper.ts apps/office/src/sw/source/core/unocore/unomap.ts apps/office/src/sw/source/core/unocore/unoobj.ts apps/office/src/sw/source/core/unocore/unoobj2.ts apps/office/src/sw/source/core/unocore/unoparagraph.ts apps/office/src/sw/source/core/unocore/unosett-properties.ts apps/office/src/sw/source/core/unocore/unostyle.ts apps/office/src/sw/source/core/unocore/unotbl.ts apps/office/src/sw/source/core/unocore/unotext.ts apps/office/src/sw/source/uibase/uno/unotxdoc.ts apps/office/src/udkapi/com/sun/star/beans/Property.ts docs/program/registry/shared/provenance/cppu/inc/com/sun/star/beans/UnknownPropertyException.ts.json docs/program/registry/shared/provenance/svl/source/items/itemprop.ts.json docs/program/registry/shared/provenance/udkapi/com/sun/star/beans/Property.ts.json docs/program/registry/shared/runtime/cppu/inc/com/sun/star/beans/UnknownPropertyException.ts.json docs/program/registry/shared/runtime/svl/source/items/itemprop.ts.json docs/program/registry/shared/runtime/udkapi/com/sun/star/beans/Property.ts.json docs/program/registry/writer/provenance/sw/source/core/crsr/bookmark.ts.json docs/program/registry/writer/provenance/sw/source/core/unocore/unobkm.ts.json docs/program/registry/writer/provenance/sw/source/core/unocore/unocrsrhelper.ts.json docs/program/registry/writer/provenance/sw/source/core/unocore/unomap.ts.json docs/program/registry/writer/provenance/sw/source/core/unocore/unoobj.ts.json docs/program/registry/writer/provenance/sw/source/core/unocore/unoobj2.ts.json docs/program/registry/writer/provenance/sw/source/core/unocore/unoparagraph.ts.json docs/program/registry/writer/provenance/sw/source/core/unocore/unosett-properties.ts.json docs/program/registry/writer/provenance/sw/source/core/unocore/unostyle.ts.json docs/program/registry/writer/provenance/sw/source/core/unocore/unotbl.ts.json docs/program/registry/writer/provenance/sw/source/core/unocore/unotext.ts.json docs/program/registry/writer/provenance/sw/source/uibase/uno/unotxdoc.ts.json docs/program/registry/writer/runtime/sw/source/core/crsr/bookmark.ts.json docs/program/registry/writer/runtime/sw/source/core/unocore/unobkm.ts.json docs/program/registry/writer/runtime/sw/source/core/unocore/unocrsrhelper.ts.json docs/program/registry/writer/runtime/sw/source/core/unocore/unomap.ts.json docs/program/registry/writer/runtime/sw/source/core/unocore/unoobj.ts.json docs/program/registry/writer/runtime/sw/source/core/unocore/unoobj2.ts.json docs/program/registry/writer/runtime/sw/source/core/unocore/unoparagraph.ts.json docs/program/registry/writer/runtime/sw/source/core/unocore/unosett-properties.ts.json docs/program/registry/writer/runtime/sw/source/core/unocore/unostyle.ts.json docs/program/registry/writer/runtime/sw/source/core/unocore/unotbl.ts.json docs/program/registry/writer/runtime/sw/source/core/unocore/unotext.ts.json docs/program/registry/writer/runtime/sw/source/uibase/uno/unotxdoc.ts.json`
      Result: pass. Evidence/Scope: All changed authored source, tooling and registry records.
    - Command: `npm run check:dependencies`
      Result: pass. Evidence/Scope: 1196 runtime sources, 5985 imports, 170 allowed edges.
    - Command: `npm run check:docs`
      Result: pass. Evidence/Scope: 2947 authored source files.
    - Command: `npm run check:file-size`
      Result: pass. Evidence/Scope: No authored file reaches 1000 lines; existing warnings remain.
    - Command: `npm run check:source-tree`
      Result: pass. Evidence/Scope: 115 required paths and 32 retired roots.
    - Command: `npm run check:source-provenance`
      Result: pass. Evidence/Scope: 1197 modules: 1021 mapped, 153 adaptations, 23 infrastructure.
    - Command: `npm run inventory:parity:writer`
      Result: pass. Evidence/Scope: Registry validation; semanticViolationCount=0; broad parityReady remains false.
    - Command: `npm run inventory:parity:shared`
      Result: pass. Evidence/Scope: Registry validation; semanticViolationCount=0.
    - Command: `git diff --check`
      Result: pass. Evidence/Scope: No whitespace errors.

    Skipped: npm test, npm run verify, complete Writer/shared/Calc and browser suites.
    Reason: The user explicitly requested affected-module tests only.
    Risk: Broader application and interactive/browser regressions are not established by this task.
    Approval: User request in this conversation.

    Development checks caught and corrected primitive item QueryValue signature differences, native exception Any address transport, batch exception wrapping, and paragraph-style rollback. A temporary inspection-only TypeScript checker process exhausted its default heap; the prescribed application TypeScript CLI completed successfully. No source guard was disabled, no native-source runtime dependency was added and no baseline parity flags were promoted.
id_source: "generated"
---
## Summary

Port Writer API attachment points consumed by DomainMapper

User-approved port of Writer text/document/range/cursor/property/style/numbering/table API attachment points required by upstream DomainMapper within the current canonical Writer core. Preserve pinned upstream ownership, contracts, behavior and error handling. Do not implement DOCX parsing/export or expand unsupported model features. Run only affected module tests and targeted checks.

## Scope

Writer import-facing unocore API and required existing core connections; shared exception/property contracts where required; focused tests and exact per-module provenance/runtime registry entries. Include the native sw -> cppuhelper dependency declared by sw/Library_sw.mk and sw/inc/unosett.hxx, with boundary regression coverage. Registry files are required companions of the implementation modules, correcting the initial file-count estimate without adding product behavior. No UI, Calc implementation, DOCX parser, OOXML package engine or export feature changes; the existing ODF caller only migrates to the explicit numbering record projection.

## Plan

Implement pinned upstream Writer import attachment contracts within current core: SwXTextDocument service/style suppliers; SwXTextRange and SwXTextCursor with registered SwPaM ownership; SwXText append/insert/finish paragraph and properties; supported style/numbering/table API routes. Preserve native property types, units, exceptions, range ownership and mutation ordering, with no duplicate document state. Include source provenance/runtime records and targeted regression tests. Exclude DOCX parser/export and unimplemented core features. Verify only affected Writer/shared modules plus typecheck and targeted structural/provenance checks; no complete test suites.

## Verify Steps

Run targeted Vitest files for new unocore API, adjacent text/range/style/table/numbering core modules touched by implementation, and affected source/provenance tooling when changed. Run application TypeScript checking, ESLint/Prettier on changed authored files, source-tree and source-provenance checks. Assert upstream-derived text append/finish selection semantics, typed property conversion and errors, style inheritance, live ranges, foreign ranges, table conversion, numbering and disposal. Do not run full suites as requested by user. Record exact commands/results. Run ap task verify-show before checks and record ap verify result.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-23T17:32:02.208Z — VERIFY — ok

By: CODER

Note: Verified affected modules: 211 Writer tests in 15 files, 2 shared contract tests, 48 boundary tooling tests. Application typecheck, changed-file ESLint/Prettier, source-tree/provenance, docs, size, dependency and Writer/shared registry checks pass. Full suites omitted per user request; exact commands and limits recorded in Findings.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-23T17:32:01.690Z, excerpt_hash=sha256:379ea1bf2470e1913e9fd644a4369736f82a4e89d51d9daa03be09f013653cc7

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610231627-0F8SYR/blueprint/resolved-snapshot.json
- old_digest: ba4690f395b76ada0f5a455f9efb8540a477507034cb6ba66a035148358b4f52
- current_digest: ba4690f395b76ada0f5a455f9efb8540a477507034cb6ba66a035148358b4f52
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610231627-0F8SYR

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610231627-0F8SYR
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only the task implementation commit and task-owned registry entries; preserve all unrelated work.

## Findings

Pinned source: vendor/libreoffice-reference at 9bc445578031fecf56086729d8e4940c77e14d65 (libreoffice-26.8.0.2). Work remained in vite-office; no network access, sibling checkout mutation, UI or Calc implementation changes.

Implemented SwXTextDocument supplier through stable SwDocShell.GetModel; SwXText/SwXTextRange/SwXTextCursor/SwXParagraph; internal document-owned UnoMark ranges distinct from visible bookmarks; supported bookmark descriptor attachment; original typed property map/introspection/state/reset; style families/descriptors over canonical paragraph/page/numbering owners; typed numbering PropertyValue sequence/index interfaces; table conversion wrapping original text nodes, row/cell properties and native property failure isolation. All data remains in existing SwDoc/nodes/items. Existing ODF numbering publication consumes the explicit legacy record projection while getByIndex exposes the native Any sequence.

Native contract checks include CR-only paragraph splitting with LF preservation, live endpoint correction, NOHINTEXPAND/direct equal-to-inherited attributes, finish insertion before previous-paragraph properties, style side effects before staged Which items, cursor WrappedTargetException, different insert/finish exception rollback, signed byte paragraph line counts, MM100 conversion, rejected foreign/disposed ranges, node-preserving full/partial text-to-table and native denylists. The sw -> cppuhelper edge is backed by Library_sw.mk and unosett.hxx; no reverse edge or guard algorithm was relaxed.

No whole-module parity promotion. DomainMapper and OOXML package/parser/export are not implemented by this task. Full generic UNO runtime metadata/listeners, complete native ABI, interactive undo/action integration, Unicode/layout navigation, unsupported style/section families and expanded user bookmarks remain outside the represented API/core slice. Registry semantic statuses remain unverified; focused source-derived regression evidence is not presented as a native differential/full Writer conformance result. Broader numbering temporary-service destruction and full native service lifetimes remain unverified.

Verification (final passing runs):

- Command: `npm run test:writer -- src/sw/source/core/unocore/native-text-import-api.test.ts src/sw/source/core/unocore/unosett.test.ts src/sw/source/core/unocore/native-numbering-publication.test.ts src/sw/source/core/edit/edfcol.test.ts src/sw/source/core/edit/edfcol-modifier.test.ts src/sw/source/core/edit/edfcol-reset.test.ts src/sw/source/core/txtnode/ndhints.test.ts src/sw/source/core/txtnode/ndtxt.test.ts src/sw/source/core/crsr/pam-selection.test.ts src/sw/source/core/undo/native-bookmark-replace-history.test.ts src/sw/source/core/docnode/native-table-border-owner.test.ts src/sw/source/core/docnode/native-table-border-common-state.test.ts src/sw/source/uibase/app/docsh.test.ts src/sw/source/filter/xml/odt-list-label-alignment-roundtrip.test.ts src/sw/source/filter/xml/odt-list-marker-roundtrip.test.ts`
  Result: pass. Evidence/Scope: 15 files, 211 tests; affected Writer API, formatting, text/hints, ranges/bookmarks, tables, shell and ODT numbering.
- Command: `npm run test:shared -- src/svl/source/items/itemprop.test.ts`
  Result: pass. Evidence/Scope: 1 file, 2 tests; actual Property/UnknownPropertyException Any copies and property-info ownership.
- Command: `npx vitest run scripts/check-module-boundaries.test.ts`
  Result: pass. Evidence/Scope: 1 file, 48 tests; Writer helper edge, reverse isolation and existing module boundaries.
- Command: `npm run typecheck --workspace @vite-office/office`
  Result: pass. Evidence/Scope: Application TypeScript check.
- Command: `npx eslint apps/office/src/sw/source/core/doc/doc.ts apps/office/src/sw/source/core/doc/docbm.ts apps/office/src/sw/source/core/doc/docfmt.ts apps/office/src/sw/source/core/doc/docnum.ts apps/office/src/sw/source/core/docnode/ndtbl.ts apps/office/src/sw/source/core/docnode/node.ts apps/office/src/sw/source/core/docnode/nodes.ts apps/office/src/sw/source/core/txtnode/ndhints-font.ts apps/office/src/sw/source/core/unocore/native-numbering-publication.test.ts apps/office/src/sw/source/core/unocore/unosett.ts apps/office/src/sw/source/filter/xml/xmlexp.ts apps/office/src/sw/source/uibase/app/docsh.ts apps/office/src/cppu/inc/com/sun/star/beans/UnknownPropertyException.ts apps/office/src/svl/source/items/itemprop.ts apps/office/src/sw/source/core/crsr/bookmark.ts apps/office/src/sw/source/core/unocore/native-text-import-api.test.ts apps/office/src/sw/source/core/unocore/unobkm.ts apps/office/src/sw/source/core/unocore/unocrsrhelper.ts apps/office/src/sw/source/core/unocore/unomap.ts apps/office/src/sw/source/core/unocore/unoobj.ts apps/office/src/sw/source/core/unocore/unoobj2.ts apps/office/src/sw/source/core/unocore/unoparagraph.ts apps/office/src/sw/source/core/unocore/unosett-properties.ts apps/office/src/sw/source/core/unocore/unostyle.ts apps/office/src/sw/source/core/unocore/unotbl.ts apps/office/src/sw/source/core/unocore/unotext.ts apps/office/src/sw/source/uibase/uno/unotxdoc.ts apps/office/src/udkapi/com/sun/star/beans/Property.ts apps/office/src/svl/source/items/itemprop.test.ts scripts/check-module-boundaries.mjs scripts/check-module-boundaries.test.ts --max-warnings 0`
  Result: pass. Evidence/Scope: All changed source and tool files.
- Command: `npx prettier --check apps/office/src/sw/source/core/doc/doc.ts apps/office/src/sw/source/core/doc/docbm.ts apps/office/src/sw/source/core/doc/docfmt.ts apps/office/src/sw/source/core/doc/docnum.ts apps/office/src/sw/source/core/docnode/ndtbl.ts apps/office/src/sw/source/core/docnode/node.ts apps/office/src/sw/source/core/docnode/nodes.ts apps/office/src/sw/source/core/txtnode/ndhints-font.ts apps/office/src/sw/source/core/unocore/native-numbering-publication.test.ts apps/office/src/sw/source/core/unocore/unosett.ts apps/office/src/sw/source/filter/xml/xmlexp.ts apps/office/src/sw/source/uibase/app/docsh.ts docs/program/registry/writer/provenance/sw/source/core/doc/doc.ts.json docs/program/registry/writer/provenance/sw/source/core/doc/docbm.ts.json docs/program/registry/writer/provenance/sw/source/core/doc/docfmt.ts.json docs/program/registry/writer/provenance/sw/source/core/doc/docnum.ts.json docs/program/registry/writer/provenance/sw/source/core/docnode/ndtbl.ts.json docs/program/registry/writer/provenance/sw/source/core/docnode/node.ts.json docs/program/registry/writer/provenance/sw/source/core/docnode/nodes.ts.json docs/program/registry/writer/provenance/sw/source/core/txtnode/ndhints-font.ts.json docs/program/registry/writer/provenance/sw/source/core/unocore/unosett.ts.json docs/program/registry/writer/provenance/sw/source/filter/xml/xmlexp.ts.json docs/program/registry/writer/provenance/sw/source/uibase/app/docsh.ts.json docs/program/registry/writer/runtime/sw/source/core/doc/doc.ts.json docs/program/registry/writer/runtime/sw/source/core/doc/docbm.ts.json docs/program/registry/writer/runtime/sw/source/core/doc/docfmt.ts.json docs/program/registry/writer/runtime/sw/source/core/doc/docnum.ts.json docs/program/registry/writer/runtime/sw/source/core/docnode/ndtbl.ts.json docs/program/registry/writer/runtime/sw/source/core/docnode/node.ts.json docs/program/registry/writer/runtime/sw/source/core/docnode/nodes.ts.json docs/program/registry/writer/runtime/sw/source/core/txtnode/ndhints-font.ts.json docs/program/registry/writer/runtime/sw/source/core/unocore/unosett.ts.json docs/program/registry/writer/runtime/sw/source/filter/xml/xmlexp.ts.json docs/program/registry/writer/runtime/sw/source/uibase/app/docsh.ts.json scripts/check-module-boundaries.mjs scripts/check-module-boundaries.test.ts apps/office/src/cppu/inc/com/sun/star/beans/UnknownPropertyException.ts apps/office/src/svl/source/items/itemprop.test.ts apps/office/src/svl/source/items/itemprop.ts apps/office/src/sw/source/core/crsr/bookmark.ts apps/office/src/sw/source/core/unocore/native-text-import-api.test.ts apps/office/src/sw/source/core/unocore/unobkm.ts apps/office/src/sw/source/core/unocore/unocrsrhelper.ts apps/office/src/sw/source/core/unocore/unomap.ts apps/office/src/sw/source/core/unocore/unoobj.ts apps/office/src/sw/source/core/unocore/unoobj2.ts apps/office/src/sw/source/core/unocore/unoparagraph.ts apps/office/src/sw/source/core/unocore/unosett-properties.ts apps/office/src/sw/source/core/unocore/unostyle.ts apps/office/src/sw/source/core/unocore/unotbl.ts apps/office/src/sw/source/core/unocore/unotext.ts apps/office/src/sw/source/uibase/uno/unotxdoc.ts apps/office/src/udkapi/com/sun/star/beans/Property.ts docs/program/registry/shared/provenance/cppu/inc/com/sun/star/beans/UnknownPropertyException.ts.json docs/program/registry/shared/provenance/svl/source/items/itemprop.ts.json docs/program/registry/shared/provenance/udkapi/com/sun/star/beans/Property.ts.json docs/program/registry/shared/runtime/cppu/inc/com/sun/star/beans/UnknownPropertyException.ts.json docs/program/registry/shared/runtime/svl/source/items/itemprop.ts.json docs/program/registry/shared/runtime/udkapi/com/sun/star/beans/Property.ts.json docs/program/registry/writer/provenance/sw/source/core/crsr/bookmark.ts.json docs/program/registry/writer/provenance/sw/source/core/unocore/unobkm.ts.json docs/program/registry/writer/provenance/sw/source/core/unocore/unocrsrhelper.ts.json docs/program/registry/writer/provenance/sw/source/core/unocore/unomap.ts.json docs/program/registry/writer/provenance/sw/source/core/unocore/unoobj.ts.json docs/program/registry/writer/provenance/sw/source/core/unocore/unoobj2.ts.json docs/program/registry/writer/provenance/sw/source/core/unocore/unoparagraph.ts.json docs/program/registry/writer/provenance/sw/source/core/unocore/unosett-properties.ts.json docs/program/registry/writer/provenance/sw/source/core/unocore/unostyle.ts.json docs/program/registry/writer/provenance/sw/source/core/unocore/unotbl.ts.json docs/program/registry/writer/provenance/sw/source/core/unocore/unotext.ts.json docs/program/registry/writer/provenance/sw/source/uibase/uno/unotxdoc.ts.json docs/program/registry/writer/runtime/sw/source/core/crsr/bookmark.ts.json docs/program/registry/writer/runtime/sw/source/core/unocore/unobkm.ts.json docs/program/registry/writer/runtime/sw/source/core/unocore/unocrsrhelper.ts.json docs/program/registry/writer/runtime/sw/source/core/unocore/unomap.ts.json docs/program/registry/writer/runtime/sw/source/core/unocore/unoobj.ts.json docs/program/registry/writer/runtime/sw/source/core/unocore/unoobj2.ts.json docs/program/registry/writer/runtime/sw/source/core/unocore/unoparagraph.ts.json docs/program/registry/writer/runtime/sw/source/core/unocore/unosett-properties.ts.json docs/program/registry/writer/runtime/sw/source/core/unocore/unostyle.ts.json docs/program/registry/writer/runtime/sw/source/core/unocore/unotbl.ts.json docs/program/registry/writer/runtime/sw/source/core/unocore/unotext.ts.json docs/program/registry/writer/runtime/sw/source/uibase/uno/unotxdoc.ts.json`
  Result: pass. Evidence/Scope: All changed authored source, tooling and registry records.
- Command: `npm run check:dependencies`
  Result: pass. Evidence/Scope: 1196 runtime sources, 5985 imports, 170 allowed edges.
- Command: `npm run check:docs`
  Result: pass. Evidence/Scope: 2947 authored source files.
- Command: `npm run check:file-size`
  Result: pass. Evidence/Scope: No authored file reaches 1000 lines; existing warnings remain.
- Command: `npm run check:source-tree`
  Result: pass. Evidence/Scope: 115 required paths and 32 retired roots.
- Command: `npm run check:source-provenance`
  Result: pass. Evidence/Scope: 1197 modules: 1021 mapped, 153 adaptations, 23 infrastructure.
- Command: `npm run inventory:parity:writer`
  Result: pass. Evidence/Scope: Registry validation; semanticViolationCount=0; broad parityReady remains false.
- Command: `npm run inventory:parity:shared`
  Result: pass. Evidence/Scope: Registry validation; semanticViolationCount=0.
- Command: `git diff --check`
  Result: pass. Evidence/Scope: No whitespace errors.

Skipped: npm test, npm run verify, complete Writer/shared/Calc and browser suites.
Reason: The user explicitly requested affected-module tests only.
Risk: Broader application and interactive/browser regressions are not established by this task.
Approval: User request in this conversation.

Development checks caught and corrected primitive item QueryValue signature differences, native exception Any address transport, batch exception wrapping, and paragraph-style rollback. A temporary inspection-only TypeScript checker process exhausted its default heap; the prescribed application TypeScript CLI completed successfully. No source guard was disabled, no native-source runtime dependency was added and no baseline parity flags were promoted.
