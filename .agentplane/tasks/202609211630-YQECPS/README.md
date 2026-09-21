---
id: "202609211630-YQECPS"
title: "Fix reviewed Writer P1 parity gaps"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 12
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-21T16:31:12.786Z"
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
    body: "Start: implement the approved Writer P1 corrections with atomic lifecycle replacement, ODF restart round trips, ownership decomposition, and truthful parity evidence."
events:
  -
    type: "status"
    at: "2026-09-21T16:31:20.219Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the approved Writer P1 corrections with atomic lifecycle replacement, ODF restart round trips, ownership decomposition, and truthful parity evidence."
doc_version: 3
doc_updated_at: "2026-09-21T17:08:21.750Z"
doc_updated_by: "CODER"
description: "Fix the four reviewed P1 discrepancies: atomic document replacement rollback, implemented ODF list restart import/export, completion of Writer shell/text-run responsibility separation, and truthful atomic ODT inventory metadata."
sections:
  Summary: "Correct the independently reviewed Writer P1 gaps while preserving the current bounded browser feature set and pinned LibreOffice ownership model."
  Scope: "In scope: atomic SwDocShell document replacement and rollback tests; ODF text:start-value import/export and list restart round trips; removal of browser run DTO conversion/projection ownership from canonical SwTextNode and reduction of SwWrtShell catch-all responsibilities; atomic and truthful ODT parity/inventory records including meta.xml semantics; relevant architecture checks and documentation. Out of scope: new Writer features, legacy storage migrations, networking, publication, unrelated UI changes."
  Plan: "1. Validate replacement inputs before disposing the active Writer graph and cover invalid lifecycle/medium rollback. 2. Map ODF text:start-value to Writer restart state on import and emit it on export, with model/filter/worker/storage round-trip tests. 3. Move run DTO conversion and paste-specific orchestration to boundary helpers/shell responsibility files without behavior changes. 4. Split or correct ODT capability and runtime inventory claims. 5. Run focused tests and the complete repository verification contract."
  Verify Steps: |-
    - npx vitest run apps/office/src/sw/source/uibase/app/docsh.test.ts apps/office/src/sw/source/filter/xml/odt-roundtrip.test.ts apps/office/src/xmloff/source/text/txtpara.test.ts apps/office/src/sw/source/core/doc/number.test.ts apps/office/src/sw/source/uibase/wrtsh/wrtsh.test.ts
    - npm run check:dependencies
    - npm run inventory:parity
    - npm run verify
    - ap doctor
    - node .agentplane/policy/check-routing.mjs
  Verification: |-
    Command: `npx vitest run apps/office/src/sw/source/uibase/app/docsh.test.ts apps/office/src/sw/source/filter/xml/odt-roundtrip.test.ts apps/office/src/xmloff/source/text/txtpara.test.ts apps/office/src/sw/source/core/doc/number.test.ts apps/office/src/sw/source/uibase/wrtsh/wrtsh.test.ts`
    Result: pass.
    Evidence: 5 files, 49 tests passed.
    Scope: atomic replacement, ODF restart import/export, numbering, paste/shell behavior.

    Command: `npm run check:dependencies`
    Result: pass.
    Evidence: 147 runtime sources and 530 relative imports validated.
    Scope: module ownership boundaries.

    Command: `npm run inventory:parity`
    Result: pass.
    Evidence: 45 implemented records, 0 exceptions; parityReady remains false for 14 declared upstream-evidence gaps.
    Scope: capability and runtime inventory consistency.

    Command: `npm run verify`
    Result: pass.
    Evidence: 354 unit tests and 96 inventory tests at 100% coverage, 11 e2e tests, build/static/docs/provenance/invariant checks passed.
    Scope: complete repository verification contract.

    Command: `ap doctor`
    Result: pass.
    Evidence: doctor OK; one pre-existing DONE-task commit warning and informational hook fallback only.
    Scope: Agentplane workspace health.

    Command: `node .agentplane/policy/check-routing.mjs`
    Result: pass.
    Evidence: policy routing OK.
    Scope: repository policy graph.
  Rollback Plan: "Revert only commits attributed to task 202609211630-YQECPS; storage/worker schema versions are unchanged unless implementation proves a version bump is required."
  Findings: "Initial review identified four repo-fixable gaps: non-atomic replacement, missing ODF restart serialization, incomplete shell/text-run responsibility separation, and contradictory ODT inventory claims."
id_source: "generated"
---
## Summary

Correct the independently reviewed Writer P1 gaps while preserving the current bounded browser feature set and pinned LibreOffice ownership model.

## Scope

In scope: atomic SwDocShell document replacement and rollback tests; ODF text:start-value import/export and list restart round trips; removal of browser run DTO conversion/projection ownership from canonical SwTextNode and reduction of SwWrtShell catch-all responsibilities; atomic and truthful ODT parity/inventory records including meta.xml semantics; relevant architecture checks and documentation. Out of scope: new Writer features, legacy storage migrations, networking, publication, unrelated UI changes.

## Plan

1. Validate replacement inputs before disposing the active Writer graph and cover invalid lifecycle/medium rollback. 2. Map ODF text:start-value to Writer restart state on import and emit it on export, with model/filter/worker/storage round-trip tests. 3. Move run DTO conversion and paste-specific orchestration to boundary helpers/shell responsibility files without behavior changes. 4. Split or correct ODT capability and runtime inventory claims. 5. Run focused tests and the complete repository verification contract.

## Verify Steps

- npx vitest run apps/office/src/sw/source/uibase/app/docsh.test.ts apps/office/src/sw/source/filter/xml/odt-roundtrip.test.ts apps/office/src/xmloff/source/text/txtpara.test.ts apps/office/src/sw/source/core/doc/number.test.ts apps/office/src/sw/source/uibase/wrtsh/wrtsh.test.ts
- npm run check:dependencies
- npm run inventory:parity
- npm run verify
- ap doctor
- node .agentplane/policy/check-routing.mjs

## Verification

Command: `npx vitest run apps/office/src/sw/source/uibase/app/docsh.test.ts apps/office/src/sw/source/filter/xml/odt-roundtrip.test.ts apps/office/src/xmloff/source/text/txtpara.test.ts apps/office/src/sw/source/core/doc/number.test.ts apps/office/src/sw/source/uibase/wrtsh/wrtsh.test.ts`
Result: pass.
Evidence: 5 files, 49 tests passed.
Scope: atomic replacement, ODF restart import/export, numbering, paste/shell behavior.

Command: `npm run check:dependencies`
Result: pass.
Evidence: 147 runtime sources and 530 relative imports validated.
Scope: module ownership boundaries.

Command: `npm run inventory:parity`
Result: pass.
Evidence: 45 implemented records, 0 exceptions; parityReady remains false for 14 declared upstream-evidence gaps.
Scope: capability and runtime inventory consistency.

Command: `npm run verify`
Result: pass.
Evidence: 354 unit tests and 96 inventory tests at 100% coverage, 11 e2e tests, build/static/docs/provenance/invariant checks passed.
Scope: complete repository verification contract.

Command: `ap doctor`
Result: pass.
Evidence: doctor OK; one pre-existing DONE-task commit warning and informational hook fallback only.
Scope: Agentplane workspace health.

Command: `node .agentplane/policy/check-routing.mjs`
Result: pass.
Evidence: policy routing OK.
Scope: repository policy graph.

## Rollback Plan

Revert only commits attributed to task 202609211630-YQECPS; storage/worker schema versions are unchanged unless implementation proves a version bump is required.

## Findings

Initial review identified four repo-fixable gaps: non-atomic replacement, missing ODF restart serialization, incomplete shell/text-run responsibility separation, and contradictory ODT inventory claims.
