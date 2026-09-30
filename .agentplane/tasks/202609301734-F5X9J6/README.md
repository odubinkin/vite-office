---
id: "202609301734-F5X9J6"
title: "Restore native tab measure conversion pipeline"
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
  updated_at: "2026-09-30T17:35:38.303Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-30T17:58:02.413Z"
  updated_by: "CODER"
  note: "Native tab metric pipeline passes 95 compiled-native differential cases, 20 literal ODT sequences, focused tests and full verify 583/109/19 at 100% coverage; source/provenance, doctor, routing and diff checks pass."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: restore source-owned native tab measure pipeline and verify parser and package contracts."
events:
  -
    type: "status"
    at: "2026-09-30T17:35:38.764Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore source-owned native tab measure pipeline and verify parser and package contracts."
  -
    type: "verify"
    at: "2026-09-30T17:58:02.413Z"
    author: "CODER"
    state: "ok"
    note: "Native tab metric pipeline passes 95 compiled-native differential cases, 20 literal ODT sequences, focused tests and full verify 583/109/19 at 100% coverage; source/provenance, doctor, routing and diff checks pass."
doc_version: 3
doc_updated_at: "2026-09-30T17:58:02.468Z"
doc_updated_by: "CODER"
description: "Child of C9TN6M: source-backed SAX measure parsing and XML unit converter delegation, MM100 tab import values, signed integer conversion to Writer twips, and failure retaining zero. Preserve deliberate save/open/recovery deviations."
sections:
  Summary: |-
    Restore native tab measure conversion pipeline

    Child of C9TN6M: source-backed SAX measure parsing and XML unit converter delegation, MM100 tab import values, signed integer conversion to Writer twips, and failure retaining zero. Preserve deliberate save/open/recovery deviations.
  Scope: "sax/source/tools/converter.ts and focused test; xmloff/core/xmluconv.ts and focused test; style/xmltabi.ts, style/xmlstyle.ts, text/XMLTextPropertySetContext.ts, text/txtparai.ts import contracts; sw/filter/xml/xmlimp.ts and odt-property-roundtrip.test.ts; runtime inventory/provenance data and task evidence. Implement native parsing for existing Twip and tab MM100 targets, with nullable failure and min/max saturation. MM100 import data stays separate from twip export data. Other helper callers retain their existing syntax/error policy until audited; numeric conversion delegates to native owner. No validator/schema/tooling changes or deliberate browser-deviation changes."
  Plan: "Introduce source-owned SAX Converter measure parser and SvXMLUnitConverter delegation. Remove duplicated helper arithmetic while retaining unaudited callers syntax/error policy. Import tab positions in MM100 with failure retaining zero and convert at Writer item application using native signed integer ratio. Name import-only contracts to distinguish their unit from export. Add source-derived parser and literal ODT integration evidence, update mapping data, run full checks, review and close leaf."
  Verify Steps: "1. Compare parsing, supported target units, signed rounding and bounds with sax converter.cxx; compare XML delegation, tab MM100 factory and failure fallback; compare o3tl MulDiv and SvxTabStopItem::PutValue. 2. Source-derived tests cover native whitespace, unitless/empty input, decimals, negative half rounding, unit case/boundaries, pica, MM100 pixel acceptance/Twip rejection, unsupported units, range saturation and configurable limits. 3. Literal tab XML direct/inherited import/export/reimport assertions cover malformed fallback, two-stage quantization, unitless/MM100 input, signed ties and saturation; unchanged Default/alignment/leader tests pass. 4. Run npm run verify, ap doctor, routing and diff checks. Review only bounded evidence; broader contracts stay unverified."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-30T17:58:02.413Z — VERIFY — ok

    By: CODER

    Note: Native tab metric pipeline passes 95 compiled-native differential cases, 20 literal ODT sequences, focused tests and full verify 583/109/19 at 100% coverage; source/provenance, doctor, routing and diff checks pass.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-30T17:58:02.033Z, excerpt_hash=sha256:17017b904dfcfe188d83d6dfa4c2b8e966230266df6e35bff3cdbe69cede5a0c

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609301734-F5X9J6/blueprint/resolved-snapshot.json
    - old_digest: 0436cf25d79dca7fbf62cd40b37012668802320d6bbb4e6da6294b28cbec5a45
    - current_digest: 0436cf25d79dca7fbf62cd40b37012668802320d6bbb4e6da6294b28cbec5a45
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609301734-F5X9J6

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609301734-F5X9J6
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert task implementation commit if native-conversion integration regressions are demonstrated; retain unrelated completed fixes."
  Findings: "Command: focused Vitest six files. Result: pass, 29 tests. Evidence: focused.log; source-derived SAX and XML converter assertions plus 20 literal ODT direct/inherited import/export/reimport cases verify MM100 intermediate properties, signed integer Writer conversion, native units/grammar/rounding/clamping and failed-position zero fallback. Command: native-oracle.py and compare-native.mjs. Result: pass, 95 cases. Evidence: native.log, native-results.json and unmodified extracted pinned C++ functions in native-measure-oracle.cxx. Harness supplies platform aliases and native o3tl ratios for two implemented targets. Initial differential detected UTF-8 signed-char whitespace behavior (fastattribs.hxx toView is std::string_view), now reproduced; native-before-utf8.log retains diagnostics. Command: npm run verify. Result: pass, exit 0, 583 app, 109 inventory, 19 browser tests, all required coverage 100%, semanticViolationCount=0. Evidence: verify.log. First attempts exposed only static-only class lint and missing test JSDoc; source-owned Converter is expressed as a static namespace object with unchanged API, and callbacks are documented; diagnostics retained. Command: ap doctor, routing, diff check. Result: pass; two pre-existing doctor warnings. Scope: twelve approved code/test/metadata files, import-only MM100 contract named separately from twip export projection, source ownership retained without schema/validator edits or broad parity promotion. Residual: strict legacy helper callers await individual native grammar/failure audit; other native conversion APIs/targets and UTF-16 overload are unimplemented/unverified. Inline tab leaf parsing still differs from native SvxXMLTabStopContext_Impl ownership and is the next bounded refactor. Registered save/open/recovery deviations are untouched."
id_source: "generated"
---
## Summary

Restore native tab measure conversion pipeline

Child of C9TN6M: source-backed SAX measure parsing and XML unit converter delegation, MM100 tab import values, signed integer conversion to Writer twips, and failure retaining zero. Preserve deliberate save/open/recovery deviations.

## Scope

sax/source/tools/converter.ts and focused test; xmloff/core/xmluconv.ts and focused test; style/xmltabi.ts, style/xmlstyle.ts, text/XMLTextPropertySetContext.ts, text/txtparai.ts import contracts; sw/filter/xml/xmlimp.ts and odt-property-roundtrip.test.ts; runtime inventory/provenance data and task evidence. Implement native parsing for existing Twip and tab MM100 targets, with nullable failure and min/max saturation. MM100 import data stays separate from twip export data. Other helper callers retain their existing syntax/error policy until audited; numeric conversion delegates to native owner. No validator/schema/tooling changes or deliberate browser-deviation changes.

## Plan

Introduce source-owned SAX Converter measure parser and SvXMLUnitConverter delegation. Remove duplicated helper arithmetic while retaining unaudited callers syntax/error policy. Import tab positions in MM100 with failure retaining zero and convert at Writer item application using native signed integer ratio. Name import-only contracts to distinguish their unit from export. Add source-derived parser and literal ODT integration evidence, update mapping data, run full checks, review and close leaf.

## Verify Steps

1. Compare parsing, supported target units, signed rounding and bounds with sax converter.cxx; compare XML delegation, tab MM100 factory and failure fallback; compare o3tl MulDiv and SvxTabStopItem::PutValue. 2. Source-derived tests cover native whitespace, unitless/empty input, decimals, negative half rounding, unit case/boundaries, pica, MM100 pixel acceptance/Twip rejection, unsupported units, range saturation and configurable limits. 3. Literal tab XML direct/inherited import/export/reimport assertions cover malformed fallback, two-stage quantization, unitless/MM100 input, signed ties and saturation; unchanged Default/alignment/leader tests pass. 4. Run npm run verify, ap doctor, routing and diff checks. Review only bounded evidence; broader contracts stay unverified.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-30T17:58:02.413Z — VERIFY — ok

By: CODER

Note: Native tab metric pipeline passes 95 compiled-native differential cases, 20 literal ODT sequences, focused tests and full verify 583/109/19 at 100% coverage; source/provenance, doctor, routing and diff checks pass.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-30T17:58:02.033Z, excerpt_hash=sha256:17017b904dfcfe188d83d6dfa4c2b8e966230266df6e35bff3cdbe69cede5a0c

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609301734-F5X9J6/blueprint/resolved-snapshot.json
- old_digest: 0436cf25d79dca7fbf62cd40b37012668802320d6bbb4e6da6294b28cbec5a45
- current_digest: 0436cf25d79dca7fbf62cd40b37012668802320d6bbb4e6da6294b28cbec5a45
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609301734-F5X9J6

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609301734-F5X9J6
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert task implementation commit if native-conversion integration regressions are demonstrated; retain unrelated completed fixes.

## Findings

Command: focused Vitest six files. Result: pass, 29 tests. Evidence: focused.log; source-derived SAX and XML converter assertions plus 20 literal ODT direct/inherited import/export/reimport cases verify MM100 intermediate properties, signed integer Writer conversion, native units/grammar/rounding/clamping and failed-position zero fallback. Command: native-oracle.py and compare-native.mjs. Result: pass, 95 cases. Evidence: native.log, native-results.json and unmodified extracted pinned C++ functions in native-measure-oracle.cxx. Harness supplies platform aliases and native o3tl ratios for two implemented targets. Initial differential detected UTF-8 signed-char whitespace behavior (fastattribs.hxx toView is std::string_view), now reproduced; native-before-utf8.log retains diagnostics. Command: npm run verify. Result: pass, exit 0, 583 app, 109 inventory, 19 browser tests, all required coverage 100%, semanticViolationCount=0. Evidence: verify.log. First attempts exposed only static-only class lint and missing test JSDoc; source-owned Converter is expressed as a static namespace object with unchanged API, and callbacks are documented; diagnostics retained. Command: ap doctor, routing, diff check. Result: pass; two pre-existing doctor warnings. Scope: twelve approved code/test/metadata files, import-only MM100 contract named separately from twip export projection, source ownership retained without schema/validator edits or broad parity promotion. Residual: strict legacy helper callers await individual native grammar/failure audit; other native conversion APIs/targets and UTF-16 overload are unimplemented/unverified. Inline tab leaf parsing still differs from native SvxXMLTabStopContext_Impl ownership and is the next bounded refactor. Registered save/open/recovery deviations are untouched.
