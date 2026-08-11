---
id: "202608111424-ZP0KP8"
title: "Record browser-runtime parity exceptions"
status: "DOING"
priority: "med"
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
  updated_at: "2026-08-11T14:25:09.180Z"
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
    body: "Start: make browser-runtime feature and test exceptions explicit, validated, and visibly reported."
events:
  -
    type: "status"
    at: "2026-08-11T14:25:09.617Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: make browser-runtime feature and test exceptions explicit, validated, and visibly reported."
doc_version: 3
doc_updated_at: "2026-08-11T14:25:19.417Z"
doc_updated_by: "CODER"
description: "Allow feature and test parity records to be explicitly excepted when browser capabilities supersede or make an upstream LibreOffice behavior inapplicable, with mandatory rationale, classification, approval, documentation, and manifest validation."
sections:
  Summary: |-
    Record browser-runtime parity exceptions

    Allow feature and test parity records to be explicitly excepted when browser capabilities supersede or make an upstream LibreOffice behavior inapplicable, with mandatory rationale, classification, approval, documentation, and manifest validation.
  Scope: |-
    - In scope: Allow feature and test parity records to be explicitly excepted when browser capabilities supersede or make an upstream LibreOffice behavior inapplicable, with mandatory rationale, classification, approval, documentation, and manifest validation.
    - Out of scope: unrelated refactors not required for "Record browser-runtime parity exceptions".
  Plan: |-
    1. Extend the parity-manifest contract so capability-level and per-test exceptions carry an explicit non-implementable disposition, browser-runtime reason classification, rationale, and approval reference.
    2. Include separately countable exception evidence in the deterministic parity report so exceptions cannot be mistaken for implemented or verified coverage.
    3. Add parser and resolution tests for valid feature and upstream-test exceptions plus invalid incomplete or misplaced exception metadata.
    4. Document the feature/test exception format and decision rules without marking existing mapped Writer capabilities as exceptions.
    5. Run tools coverage, parity inventory validation, documentation/type/lint/size checks, and targeted static checks; defer aggregate full verification to the user-approved ten-task cadence.
  Verify Steps: |-
    1. Run `npm run test:inventory:coverage`. Expected: parser and CLI coverage stay at 100 percent while valid feature-level and upstream-test-level non-implementable exceptions are accepted and malformed exceptions are rejected.
    2. Run `npm run inventory:parity -- --baseline docs/program/reference/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference`. Expected: current Writer mappings remain valid and the deterministic report separately shows zero approved exceptions.
    3. Run `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm run check:docs`, `npm run check:file-size`, `git diff --check`, `ap doctor`, and `node .agentplane/policy/check-routing.mjs`. Expected: all pass; no new file reaches the mandatory decomposition threshold.
    4. Defer `npm run verify`, static smoke, and full browser matrix under the user-approved ten-task cadence; record the residual risk.
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

Record browser-runtime parity exceptions

Allow feature and test parity records to be explicitly excepted when browser capabilities supersede or make an upstream LibreOffice behavior inapplicable, with mandatory rationale, classification, approval, documentation, and manifest validation.

## Scope

- In scope: Allow feature and test parity records to be explicitly excepted when browser capabilities supersede or make an upstream LibreOffice behavior inapplicable, with mandatory rationale, classification, approval, documentation, and manifest validation.
- Out of scope: unrelated refactors not required for "Record browser-runtime parity exceptions".

## Plan

1. Extend the parity-manifest contract so capability-level and per-test exceptions carry an explicit non-implementable disposition, browser-runtime reason classification, rationale, and approval reference.
2. Include separately countable exception evidence in the deterministic parity report so exceptions cannot be mistaken for implemented or verified coverage.
3. Add parser and resolution tests for valid feature and upstream-test exceptions plus invalid incomplete or misplaced exception metadata.
4. Document the feature/test exception format and decision rules without marking existing mapped Writer capabilities as exceptions.
5. Run tools coverage, parity inventory validation, documentation/type/lint/size checks, and targeted static checks; defer aggregate full verification to the user-approved ten-task cadence.

## Verify Steps

1. Run `npm run test:inventory:coverage`. Expected: parser and CLI coverage stay at 100 percent while valid feature-level and upstream-test-level non-implementable exceptions are accepted and malformed exceptions are rejected.
2. Run `npm run inventory:parity -- --baseline docs/program/reference/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference`. Expected: current Writer mappings remain valid and the deterministic report separately shows zero approved exceptions.
3. Run `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm run check:docs`, `npm run check:file-size`, `git diff --check`, `ap doctor`, and `node .agentplane/policy/check-routing.mjs`. Expected: all pass; no new file reaches the mandatory decomposition threshold.
4. Defer `npm run verify`, static smoke, and full browser matrix under the user-approved ten-task cadence; record the residual risk.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
