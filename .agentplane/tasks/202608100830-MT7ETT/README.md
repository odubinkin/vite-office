---
id: "202608100830-MT7ETT"
title: "Create deterministic LibreOffice inventory contracts and baseline validator"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on:
  - "202608100814-2TT1YA"
tags:
  - "inventory"
  - "libreoffice"
  - "typescript"
task_kind: "code"
mutation_scope: "code"
risk_flags:
  - "network"
blueprint_request: "code.direct"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-08-10T08:31:53.224Z"
  updated_by: "USER"
  note: "Standing user authorization: future in-scope roadmap task plans are pre-approved."
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
    body: "Start: implement the approved typed inventory contract with deterministic validation evidence, without runners or upstream copying."
events:
  -
    type: "status"
    at: "2026-08-10T08:32:02.231Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the approved typed inventory contract with deterministic validation evidence, without runners or upstream copying."
doc_version: 3
doc_updated_at: "2026-08-10T08:49:25.990Z"
doc_updated_by: "CODER"
description: "Implement a typed, documented, fully covered Node-side inventory foundation that reads the pinned baseline manifest, validates the four local Git corpora and acquisition floors, emits deterministic JSON, and establishes the next atomic inventory tasks without claiming parity."
sections:
  Summary: |-
    Create deterministic LibreOffice inventory contracts and baseline validator

    Implement a typed, documented, fully covered Node-side inventory foundation that reads the pinned baseline manifest, validates the four local Git corpora and acquisition floors, emits deterministic JSON, and establishes the next atomic inventory tasks without claiming parity.
  Scope: |-
    In scope:
    - Add a Node-side TypeScript inventory package under scripts/libreoffice-inventory with strict manifest parsing, a Git adapter, exact identity and acquisition-floor validation, deterministic JSON reporting, and a documented CLI.
    - Add 100% covered unit tests for all new executable branches, plus a live validation of the ignored pinned checkout.
    - Integrate targeted inventory commands into the repository quality scripts and extend JSDoc enforcement to every new TypeScript file.
    - Document the inventory contract and update the program roadmap without advancing any LibreOffice parity status.

    Out of scope:
    - Generating the complete source/test/help/translation/dictionary item inventory; that follows in bounded atomic inventory tasks.
    - Copying, adapting, licensing, or redistributing any upstream corpus file.
    - Implementing an end-user office feature, changing the static browser application, or claiming coverage/parity completion.
  Plan: |-
    1. Specify the versioned baseline-contract types, validation errors, deterministic report shape, and CLI boundary.
    2. Implement the small TypeScript modules, 100%-coverage unit tests, typed toolchain command, and documentation enforcement integration.
    3. Validate against both controlled test doubles and the four live ignored LibreOffice repositories; write the contract documentation and roadmap handoff.
    4. Run targeted and full quality gates, persist evidence, obtain an evaluator review, and close with traceable commits.
  Verify Steps: |-
    1. npm run typecheck:tools && npm run lint && npm run check:docs && npm run check:file-size — all new TypeScript modules, JSDoc enforcement, linting, and size policy pass.
    2. npm run test:inventory:coverage — unit tests cover every branch, function, line, and statement in scripts/libreoffice-inventory at 100%.
    3. npm run --silent inventory:validate -- --baseline docs/program/libreoffice-baseline.json --reference-root vendor/libreoffice-reference — validates every live core/dictionaries/helpcontent2/translations origin, annotated tag object, commit, shallow/clean state, exact tracked-file acquisition floor, 2,746 XHP topics, 25,699 PO catalogs, and 131 locales; stdout parses as deterministic JSON.
    4. Run the command in step 3 twice and byte-compare canonical output — the inventory report is stable for unchanged input.
    5. npm run verify — the existing static-app build, unit/E2E/accessibility, docs, and size gates remain green with the inventory checks included.
    6. Resolve every changed local Markdown link; inspect git diff --check, git status --short --untracked-files=all, and git ls-files vendor/libreoffice-reference — documentation is linked, no whitespace defects or generated corpus content is tracked.
    7. Inspect the contract documentation and report guards — schema validation rejects unknown/missing fields, inventory output identifies all inputs by corpus and pinned commit, and docs make no source/test/docs/coverage parity claim.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only the task commits that add the inventory tool, its command wiring, tests, and contract documentation. The ignored pinned checkout is read-only research material and is never deleted or altered by this task. Re-run the foundation verification commands after a rollback."
  Findings: ""
id_source: "generated"
---
## Summary

Create deterministic LibreOffice inventory contracts and baseline validator

Implement a typed, documented, fully covered Node-side inventory foundation that reads the pinned baseline manifest, validates the four local Git corpora and acquisition floors, emits deterministic JSON, and establishes the next atomic inventory tasks without claiming parity.

## Scope

In scope:
- Add a Node-side TypeScript inventory package under scripts/libreoffice-inventory with strict manifest parsing, a Git adapter, exact identity and acquisition-floor validation, deterministic JSON reporting, and a documented CLI.
- Add 100% covered unit tests for all new executable branches, plus a live validation of the ignored pinned checkout.
- Integrate targeted inventory commands into the repository quality scripts and extend JSDoc enforcement to every new TypeScript file.
- Document the inventory contract and update the program roadmap without advancing any LibreOffice parity status.

Out of scope:
- Generating the complete source/test/help/translation/dictionary item inventory; that follows in bounded atomic inventory tasks.
- Copying, adapting, licensing, or redistributing any upstream corpus file.
- Implementing an end-user office feature, changing the static browser application, or claiming coverage/parity completion.

## Plan

1. Specify the versioned baseline-contract types, validation errors, deterministic report shape, and CLI boundary.
2. Implement the small TypeScript modules, 100%-coverage unit tests, typed toolchain command, and documentation enforcement integration.
3. Validate against both controlled test doubles and the four live ignored LibreOffice repositories; write the contract documentation and roadmap handoff.
4. Run targeted and full quality gates, persist evidence, obtain an evaluator review, and close with traceable commits.

## Verify Steps

1. npm run typecheck:tools && npm run lint && npm run check:docs && npm run check:file-size — all new TypeScript modules, JSDoc enforcement, linting, and size policy pass.
2. npm run test:inventory:coverage — unit tests cover every branch, function, line, and statement in scripts/libreoffice-inventory at 100%.
3. npm run --silent inventory:validate -- --baseline docs/program/libreoffice-baseline.json --reference-root vendor/libreoffice-reference — validates every live core/dictionaries/helpcontent2/translations origin, annotated tag object, commit, shallow/clean state, exact tracked-file acquisition floor, 2,746 XHP topics, 25,699 PO catalogs, and 131 locales; stdout parses as deterministic JSON.
4. Run the command in step 3 twice and byte-compare canonical output — the inventory report is stable for unchanged input.
5. npm run verify — the existing static-app build, unit/E2E/accessibility, docs, and size gates remain green with the inventory checks included.
6. Resolve every changed local Markdown link; inspect git diff --check, git status --short --untracked-files=all, and git ls-files vendor/libreoffice-reference — documentation is linked, no whitespace defects or generated corpus content is tracked.
7. Inspect the contract documentation and report guards — schema validation rejects unknown/missing fields, inventory output identifies all inputs by corpus and pinned commit, and docs make no source/test/docs/coverage parity claim.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only the task commits that add the inventory tool, its command wiring, tests, and contract documentation. The ignored pinned checkout is read-only research material and is never deleted or altered by this task. Re-run the foundation verification commands after a rollback.

## Findings
