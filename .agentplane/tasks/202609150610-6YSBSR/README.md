---
id: "202609150610-6YSBSR"
title: "Accept LibreOffice default page layout in ODT import"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 20
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-15T06:22:12.234Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-15T06:23:35.612Z"
  updated_by: "CODER"
  note: "verified-202609150610-6YSBSR"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-15T06:23:27.640Z"
  updated_by: "EVALUATOR"
  note: "ODF importer behavior matches the pinned upstream boundaries requested by the task."
  evaluated_sha: "aa8595254152abda6427fd65e274ec2d396eeffa"
  blueprint_digest: "51d7c29e5c0d998b6362882ade0d5833cc1c374d01c27178447562c64a6b9ee8"
  evidence_refs:
    - ".agentplane/tasks/202609150610-6YSBSR/README.md"
    - ".agentplane/tasks/202609150610-6YSBSR/quality/20260915-062327640-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609150610-6YSBSR/quality/20260915-062327640-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609150610-6YSBSR/quality/20260915-062327640-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609150610-6YSBSR/blueprint/resolved-snapshot.json"
    - "npm run verify"
  findings:
    - "default-page-layout is tokenized and accepted; unknown foreign child subtrees are diagnosed and ignored; unknown roots and known unsupported ODF elements remain strict."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: align default-page-layout token and styles dispatch with pinned LibreOffice, add the approved ODT import regression, then hand off verification."
events:
  -
    type: "status"
    at: "2026-09-15T06:11:32.406Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: align default-page-layout token and styles dispatch with pinned LibreOffice, add the approved ODT import regression, then hand off verification."
  -
    type: "verify"
    at: "2026-09-15T06:23:19.317Z"
    author: "TESTER"
    state: "ok"
    note: "Focused parser/ODT tests and full repository verification pass; unknown foreign child subtrees are warned and ignored, unknown roots and known unsupported ODF semantics remain rejected."
  -
    type: "verify"
    at: "2026-09-15T06:23:35.612Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609150610-6YSBSR"
doc_version: 3
doc_updated_at: "2026-09-15T06:23:35.688Z"
doc_updated_by: "CODER"
description: "Align the bounded Writer ODF importer with pinned LibreOffice handling of style:default-page-layout and add a package-level regression test."
sections:
  Summary: "Accept LibreOffice-produced ODT files containing style:default-page-layout by aligning the bounded token and styles-context dispatch with pinned upstream LibreOffice."
  Scope: "Modify apps/office/src/xmloff/source/core/xmltoken.ts, apps/office/src/xmloff/source/core/xml-parser.ts, apps/office/src/xmloff/source/core/xml-parser.test.ts, apps/office/src/xmloff/source/style/xmlstylei.ts, and apps/office/src/sw/source/filter/xml/odt-roundtrip.test.ts. Align default-page-layout handling and unknown child-element tolerance with pinned upstream. Preserve fatal unknown-root handling, existing known-element semantic rejection, resource limits, and the bounded importer architecture."
  Plan: "1. Add the upstream XML_DEFAULT_PAGE_LAYOUT equivalent and dispatch it beside STYLE_PAGE_LAYOUT through the bounded ignored page-layout policy. 2. Match upstream unknown-element tolerance by warning on an unhandled unknown child and substituting an ignore context for its complete subtree, while preserving root and known semantic failures. 3. Add fast-parser and package-level ODT regressions. 4. Run targeted and repository verification, record evidence, and finish the direct-mode task."
  Verify Steps: |-
    1. Run: npm exec vitest run --workspace @vite-office/office -- src/xmloff/source/core/xml-parser.test.ts src/sw/source/filter/xml/odt-roundtrip.test.ts. Expected: default-page-layout and unknown-child regressions plus existing parser/filter tests pass.
    2. Run: npm run verify. Expected: formatting, lint, typechecking, dependency boundaries, coverage, browser E2E/static checks, documentation, source tree/provenance, and parity checks all pass.
    3. Run: ap doctor. Expected: Agentplane repository health checks pass.
    4. Run: node .agentplane/policy/check-routing.mjs. Expected: policy routing and size budgets pass.
  Verification: |-
    Command: npm exec vitest run --workspace @vite-office/office -- src/xmloff/source/core/xml-parser.test.ts src/xmloff/source/text/txtpara.test.ts src/sw/source/filter/xml/odt-roundtrip.test.ts
    Result: pass.
    Evidence: 3 test files and 24 tests passed, covering default-page-layout, unknown foreign child subtrees, and strict handling of known upstream ODF elements.
    Scope: focused SAX and Writer ODT import behavior.

    Command: npm run verify
    Result: pass.
    Evidence: 59 unit files / 285 tests and 32 inventory files / 84 tests passed with 100% coverage; 9 Playwright E2E tests passed; build, formatting, lint, typecheck, dependency, static, documentation, source-tree, provenance, and parity checks passed.
    Scope: complete repository verification.

    Command: ap doctor
    Result: pass.
    Evidence: doctor OK; one pre-existing DONE-task warning and informational fallback-hook notes only.
    Scope: Agentplane workspace health.

    Command: node .agentplane/policy/check-routing.mjs
    Result: pass.
    Evidence: policy routing OK.
    Scope: gateway policy routing and size budgets.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-15T06:23:19.317Z — VERIFY — ok

    By: TESTER

    Note: Focused parser/ODT tests and full repository verification pass; unknown foreign child subtrees are warned and ignored, unknown roots and known unsupported ODF semantics remain rejected.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T06:23:18.765Z, excerpt_hash=sha256:2f08925171e2706bc5c8c6d98b3446438720358e2f8f970350a9bf8410b1f8de

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150610-6YSBSR/blueprint/resolved-snapshot.json
    - old_digest: 51d7c29e5c0d998b6362882ade0d5833cc1c374d01c27178447562c64a6b9ee8
    - current_digest: 51d7c29e5c0d998b6362882ade0d5833cc1c374d01c27178447562c64a6b9ee8
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609150610-6YSBSR

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609150610-6YSBSR
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-15T06:23:35.612Z — VERIFY — ok

    By: CODER

    Note: verified-202609150610-6YSBSR
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T06:23:19.390Z, excerpt_hash=sha256:2f08925171e2706bc5c8c6d98b3446438720358e2f8f970350a9bf8410b1f8de

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150610-6YSBSR/blueprint/resolved-snapshot.json
    - old_digest: 51d7c29e5c0d998b6362882ade0d5833cc1c374d01c27178447562c64a6b9ee8
    - current_digest: 51d7c29e5c0d998b6362882ade0d5833cc1c374d01c27178447562c64a6b9ee8
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609150610-6YSBSR

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609150610-6YSBSR --result verified-202609150610-6YSBSR --commit aa8595254152abda6427fd65e274ec2d396eeffa
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only the token entry, style-context dispatch entry, and regression test introduced by this task; no data migration or external state is involved."
  Findings: "Pinned LibreOffice 9bc445578031fecf56086729d8e4940c77e14d65 tokenizes default-page-layout and handles it beside page-layout in SvXMLStylesContext::CreateStyleChildContext. Its fast parser and SvXMLImport semantic layer do not abort on an unhandled unknown child: the missing context causes the subtree to be skipped, with SvXMLImport::startUnknownElement emitting a diagnostic; an unknown root is still recorded as a severe import error. The local parser currently throws for every null context, so the approved correction distinguishes unknown children from roots and known semantic rejections."
id_source: "generated"
---
## Summary

Accept LibreOffice-produced ODT files containing style:default-page-layout by aligning the bounded token and styles-context dispatch with pinned upstream LibreOffice.

## Scope

Modify apps/office/src/xmloff/source/core/xmltoken.ts, apps/office/src/xmloff/source/core/xml-parser.ts, apps/office/src/xmloff/source/core/xml-parser.test.ts, apps/office/src/xmloff/source/style/xmlstylei.ts, and apps/office/src/sw/source/filter/xml/odt-roundtrip.test.ts. Align default-page-layout handling and unknown child-element tolerance with pinned upstream. Preserve fatal unknown-root handling, existing known-element semantic rejection, resource limits, and the bounded importer architecture.

## Plan

1. Add the upstream XML_DEFAULT_PAGE_LAYOUT equivalent and dispatch it beside STYLE_PAGE_LAYOUT through the bounded ignored page-layout policy. 2. Match upstream unknown-element tolerance by warning on an unhandled unknown child and substituting an ignore context for its complete subtree, while preserving root and known semantic failures. 3. Add fast-parser and package-level ODT regressions. 4. Run targeted and repository verification, record evidence, and finish the direct-mode task.

## Verify Steps

1. Run: npm exec vitest run --workspace @vite-office/office -- src/xmloff/source/core/xml-parser.test.ts src/sw/source/filter/xml/odt-roundtrip.test.ts. Expected: default-page-layout and unknown-child regressions plus existing parser/filter tests pass.
2. Run: npm run verify. Expected: formatting, lint, typechecking, dependency boundaries, coverage, browser E2E/static checks, documentation, source tree/provenance, and parity checks all pass.
3. Run: ap doctor. Expected: Agentplane repository health checks pass.
4. Run: node .agentplane/policy/check-routing.mjs. Expected: policy routing and size budgets pass.

## Verification

Command: npm exec vitest run --workspace @vite-office/office -- src/xmloff/source/core/xml-parser.test.ts src/xmloff/source/text/txtpara.test.ts src/sw/source/filter/xml/odt-roundtrip.test.ts
Result: pass.
Evidence: 3 test files and 24 tests passed, covering default-page-layout, unknown foreign child subtrees, and strict handling of known upstream ODF elements.
Scope: focused SAX and Writer ODT import behavior.

Command: npm run verify
Result: pass.
Evidence: 59 unit files / 285 tests and 32 inventory files / 84 tests passed with 100% coverage; 9 Playwright E2E tests passed; build, formatting, lint, typecheck, dependency, static, documentation, source-tree, provenance, and parity checks passed.
Scope: complete repository verification.

Command: ap doctor
Result: pass.
Evidence: doctor OK; one pre-existing DONE-task warning and informational fallback-hook notes only.
Scope: Agentplane workspace health.

Command: node .agentplane/policy/check-routing.mjs
Result: pass.
Evidence: policy routing OK.
Scope: gateway policy routing and size budgets.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-15T06:23:19.317Z — VERIFY — ok

By: TESTER

Note: Focused parser/ODT tests and full repository verification pass; unknown foreign child subtrees are warned and ignored, unknown roots and known unsupported ODF semantics remain rejected.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T06:23:18.765Z, excerpt_hash=sha256:2f08925171e2706bc5c8c6d98b3446438720358e2f8f970350a9bf8410b1f8de

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150610-6YSBSR/blueprint/resolved-snapshot.json
- old_digest: 51d7c29e5c0d998b6362882ade0d5833cc1c374d01c27178447562c64a6b9ee8
- current_digest: 51d7c29e5c0d998b6362882ade0d5833cc1c374d01c27178447562c64a6b9ee8
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609150610-6YSBSR

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609150610-6YSBSR
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-15T06:23:35.612Z — VERIFY — ok

By: CODER

Note: verified-202609150610-6YSBSR
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T06:23:19.390Z, excerpt_hash=sha256:2f08925171e2706bc5c8c6d98b3446438720358e2f8f970350a9bf8410b1f8de

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150610-6YSBSR/blueprint/resolved-snapshot.json
- old_digest: 51d7c29e5c0d998b6362882ade0d5833cc1c374d01c27178447562c64a6b9ee8
- current_digest: 51d7c29e5c0d998b6362882ade0d5833cc1c374d01c27178447562c64a6b9ee8
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609150610-6YSBSR

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609150610-6YSBSR --result verified-202609150610-6YSBSR --commit aa8595254152abda6427fd65e274ec2d396eeffa
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only the token entry, style-context dispatch entry, and regression test introduced by this task; no data migration or external state is involved.

## Findings

Pinned LibreOffice 9bc445578031fecf56086729d8e4940c77e14d65 tokenizes default-page-layout and handles it beside page-layout in SvXMLStylesContext::CreateStyleChildContext. Its fast parser and SvXMLImport semantic layer do not abort on an unhandled unknown child: the missing context causes the subtree to be skipped, with SvXMLImport::startUnknownElement emitting a diagnostic; an unknown root is still recorded as a severe import error. The local parser currently throws for every null context, so the approved correction distinguishes unknown children from roots and known semantic rejections.
