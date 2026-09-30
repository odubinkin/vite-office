---
id: "202609301706-8FPY82"
title: "Restore native XML tab and unit conversion module ownership"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-30T17:07:29.190Z"
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
    body: "Start: separate existing tab-import and length-conversion bodies into the pinned style/core owners and update direct consumers without behavior changes."
events:
  -
    type: "status"
    at: "2026-09-30T17:07:30.060Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: separate existing tab-import and length-conversion bodies into the pinned style/core owners and update direct consumers without behavior changes."
doc_version: 3
doc_updated_at: "2026-09-30T17:07:30.060Z"
doc_updated_by: "CODER"
description: "One architecture refactor under the approved iterative parity goal: separate native tab-import and shared unit-conversion responsibilities from XMLTextPropertySetContext into their pinned source owners, preserving implementation behavior and updating direct consumers and provenance."
sections:
  Summary: |-
    Restore native XML tab and unit conversion module ownership

    One architecture refactor under the approved iterative parity goal: separate native tab-import and shared unit-conversion responsibilities from XMLTextPropertySetContext into their pinned source owners, preserving implementation behavior and updating direct consumers and provenance.
  Scope: "apps/office/src/xmloff/source/text/XMLTextPropertySetContext.ts; new apps/office/src/xmloff/source/style/xmltabi.ts and core/xmluconv.ts; direct consumers style/xmlstyle.ts, table/XMLTableImport.ts and text/XMLLineNumberingImportContext.ts; docs/program/parity/runtime-inventory.json and docs/program/source-provenance.json; canonical task artifacts. Move existing tab/context and conversion bodies unchanged, use the pinned tab context name, update direct imports and owner evidence, and remove old helper exports/embedded classes. No parser/default/domain changes, compatibility re-exports, tests mirroring implementation, validators/schemas/generators, unsupported APIs or deliberate product deviations."
  Plan: "CODER performs one native source-owner architecture refactor. Extract existing XMLTabStopsContext from text/XMLTextPropertySetContext.ts into style/xmltabi.ts, export it as SvxXMLTabStopImportContext, and keep all member logic unchanged. Move the complete importOdfLength function into core/xmluconv.ts unchanged. Keep the text module as the element-property dispatcher; update its context construction and all direct conversion imports in xmlstyle.ts, XMLTableImport.ts and XMLLineNumberingImportContext.ts, with no old re-exports or static cycle. Update runtime inventory and provenance for the two new source owners and narrowed dispatcher evidence; keep broader contracts unverified. Use AST body equality and existing focused source-backed ODT/consumer tests, then full npm run verify at 100%, doctor/routing and scoped review. Record verification and quality evidence, implementation commit and clean close. Work is local direct mode; no network, behavior/default changes, unsupported APIs, validators/schema/generators or conscious product-policy changes."
  Verify Steps: "1. TypeScript AST comparison against pre-refactor HEAD proves tab context member implementations and complete conversion function body are unchanged; only native class naming/export and module imports change. 2. Inspect dispatch and all length imports: XMLTextPropertySetContext exports only its dispatcher, creates the native-named context in style/xmltabi, and every direct length consumer imports core/xmluconv without compatibility aliases. 3. Existing focused mapped ODT, signed paragraph, line-number/table and native tab tests pass unchanged, covering signed values, Default source order, empty sequences and shared conversion consumers. 4. npm run verify passes every required gate at 100% coverage; ap doctor and node .agentplane/policy/check-routing.mjs pass. New runtime/provenance entries map each implemented responsibility to its pinned owner without semantic promotion. 5. Review scoped diff and finish with clean tracked/untracked git status."
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

Restore native XML tab and unit conversion module ownership

One architecture refactor under the approved iterative parity goal: separate native tab-import and shared unit-conversion responsibilities from XMLTextPropertySetContext into their pinned source owners, preserving implementation behavior and updating direct consumers and provenance.

## Scope

apps/office/src/xmloff/source/text/XMLTextPropertySetContext.ts; new apps/office/src/xmloff/source/style/xmltabi.ts and core/xmluconv.ts; direct consumers style/xmlstyle.ts, table/XMLTableImport.ts and text/XMLLineNumberingImportContext.ts; docs/program/parity/runtime-inventory.json and docs/program/source-provenance.json; canonical task artifacts. Move existing tab/context and conversion bodies unchanged, use the pinned tab context name, update direct imports and owner evidence, and remove old helper exports/embedded classes. No parser/default/domain changes, compatibility re-exports, tests mirroring implementation, validators/schemas/generators, unsupported APIs or deliberate product deviations.

## Plan

CODER performs one native source-owner architecture refactor. Extract existing XMLTabStopsContext from text/XMLTextPropertySetContext.ts into style/xmltabi.ts, export it as SvxXMLTabStopImportContext, and keep all member logic unchanged. Move the complete importOdfLength function into core/xmluconv.ts unchanged. Keep the text module as the element-property dispatcher; update its context construction and all direct conversion imports in xmlstyle.ts, XMLTableImport.ts and XMLLineNumberingImportContext.ts, with no old re-exports or static cycle. Update runtime inventory and provenance for the two new source owners and narrowed dispatcher evidence; keep broader contracts unverified. Use AST body equality and existing focused source-backed ODT/consumer tests, then full npm run verify at 100%, doctor/routing and scoped review. Record verification and quality evidence, implementation commit and clean close. Work is local direct mode; no network, behavior/default changes, unsupported APIs, validators/schema/generators or conscious product-policy changes.

## Verify Steps

1. TypeScript AST comparison against pre-refactor HEAD proves tab context member implementations and complete conversion function body are unchanged; only native class naming/export and module imports change. 2. Inspect dispatch and all length imports: XMLTextPropertySetContext exports only its dispatcher, creates the native-named context in style/xmltabi, and every direct length consumer imports core/xmluconv without compatibility aliases. 3. Existing focused mapped ODT, signed paragraph, line-number/table and native tab tests pass unchanged, covering signed values, Default source order, empty sequences and shared conversion consumers. 4. npm run verify passes every required gate at 100% coverage; ap doctor and node .agentplane/policy/check-routing.mjs pass. New runtime/provenance entries map each implemented responsibility to its pinned owner without semantic promotion. 5. Review scoped diff and finish with clean tracked/untracked git status.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
