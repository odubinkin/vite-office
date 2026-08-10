---
id: "202608101237-HS24PK"
title: "Implement browser locale message catalog contract"
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
  updated_at: "2026-08-10T12:37:39.475Z"
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
    body: "Start: implement approved browser locale message catalog contract."
events:
  -
    type: "status"
    at: "2026-08-10T12:37:40.115Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved browser locale message catalog contract."
doc_version: 3
doc_updated_at: "2026-08-10T12:37:40.115Z"
doc_updated_by: "CODER"
description: "Add browser-independent locale normalization, message catalog fallback, and interpolation contract with focused tests and documentation; exclude importing LibreOffice translations, locale-selection UI, plural-rule breadth, date/number formatting, and RTL rendering."
sections:
  Summary: |-
    Implement browser locale message catalog contract

    Add browser-independent locale normalization, message catalog fallback, and interpolation contract with focused tests and documentation; exclude importing LibreOffice translations, locale-selection UI, plural-rule breadth, date/number formatting, and RTL rendering.
  Scope: |-
    - In scope: Add browser-independent locale normalization, message catalog fallback, and interpolation contract with focused tests and documentation; exclude importing LibreOffice translations, locale-selection UI, plural-rule breadth, date/number formatting, and RTL rendering.
    - Out of scope: unrelated refactors not required for "Implement browser locale message catalog contract".
  Plan: "1. Define serializable locale and message catalog contracts with exact default fallback semantics. 2. Implement pure locale normalization, catalog lookup, and placeholder interpolation without browser APIs. 3. Add tests for regional fallback, unknown-message fallback, repeated placeholders, immutable inputs, and invalid locale/message data. 4. Document scope and deferred translation/UI/pluralization work. 5. Run full verification, review, evaluator, and close."
  Verify Steps: |-
    1. Run strict TypeScript, ESLint, JSDoc, Prettier, and authored-file-size checks.
    2. Require 100% application coverage and unchanged 100% inventory coverage.
    3. Unit-test locale normalization, regional and default fallback, interpolation, invalid values, and immutable catalog behavior.
    4. Run npm run verify, agentplane doctor, and node .agentplane/policy/check-routing.mjs.
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

Implement browser locale message catalog contract

Add browser-independent locale normalization, message catalog fallback, and interpolation contract with focused tests and documentation; exclude importing LibreOffice translations, locale-selection UI, plural-rule breadth, date/number formatting, and RTL rendering.

## Scope

- In scope: Add browser-independent locale normalization, message catalog fallback, and interpolation contract with focused tests and documentation; exclude importing LibreOffice translations, locale-selection UI, plural-rule breadth, date/number formatting, and RTL rendering.
- Out of scope: unrelated refactors not required for "Implement browser locale message catalog contract".

## Plan

1. Define serializable locale and message catalog contracts with exact default fallback semantics. 2. Implement pure locale normalization, catalog lookup, and placeholder interpolation without browser APIs. 3. Add tests for regional fallback, unknown-message fallback, repeated placeholders, immutable inputs, and invalid locale/message data. 4. Document scope and deferred translation/UI/pluralization work. 5. Run full verification, review, evaluator, and close.

## Verify Steps

1. Run strict TypeScript, ESLint, JSDoc, Prettier, and authored-file-size checks.
2. Require 100% application coverage and unchanged 100% inventory coverage.
3. Unit-test locale normalization, regional and default fallback, interpolation, invalid values, and immutable catalog behavior.
4. Run npm run verify, agentplane doctor, and node .agentplane/policy/check-routing.mjs.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
