---
id: "202609302319-9KTM99"
title: "Restore native numbering marker ownership and ListFormat semantics"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 18
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "numbering"
  - "parity"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-30T23:19:48.526Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-30T23:35:27.809Z"
  updated_by: "CODER"
  note: "Native marker setters and Writer formatting match 188 compiled states/labels and 83 cloned labels; final 629 app, 109 inventory, 19 browser tests and both 100% coverage suites pass with all mandatory gates."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Restore native marker ownership and ListFormat under the continuing parity goal."
events:
  -
    type: "status"
    at: "2026-09-30T23:19:57.183Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Restore native marker ownership and ListFormat under the continuing parity goal."
  -
    type: "verify"
    at: "2026-09-30T23:35:27.809Z"
    author: "CODER"
    state: "ok"
    note: "Native marker setters and Writer formatting match 188 compiled states/labels and 83 cloned labels; final 629 app, 109 inventory, 19 browser tests and both 100% coverage suites pass with all mandatory gates."
doc_version: 3
doc_updated_at: "2026-09-30T23:35:27.861Z"
doc_updated_by: "CODER"
description: "Move implemented numbering marker state to SvxNumberFormat, reproduce pinned ListFormat setters and Writer decimal pattern substitution/defaults, and preserve state through clone and Worker transfer."
sections:
  Summary: "Restore native shared numbering marker state and ListFormat behavior for the existing Arabic/bullet subset."
  Scope: "editeng/source/items/numitem.ts/tests, sw/source/core/doc/number.ts/tests, bounded UNO suffix application adjustment, Worker writer-document-codec.ts and affected transfer tests/current schema, existing caller fixtures requiring an explicit decimal suffix, runtime inventory/provenance and task-local primary-source differential evidence. No XML marker import/export expansion in this leaf, native numbering family expansion, policy/gate weakening, network/outside access or registered save/open/recovery changes."
  Plan: "Move prefix/suffix/start/include-upper state to native SvxNumberFormat alongside position state. Implement both SetListFormat contracts, prefix/suffix invalidation and derived compatibility fields, including native unsigned widths and literal unusual pattern behavior. Correct standalone format defaults to native empty suffix and initialize Writer base rules with their level-specific native ListFormat. Replace decimal join shortcut with pinned pattern scanning and native legacy fallback within the currently implemented Arabic/character-special subset. Preserve raw state, including a changed include-upper count independent of ListFormat, in clone and the current Worker graph schema. Keep visible bullet glyph projection separately bounded. Verify using unmodified extracted native setter bodies and bounded Writer formatter probes, focused core/UNO/transfer tests and full unchanged verification."
  Verify Steps: "Compare primary-source SetPrefix/SetSuffix and both SetListFormat bodies for absent/empty/literal formats, percent-delimited patterns, noncontiguous/repeated/%10%/future references, unusual percent affixes and generated clamped levels. Assert native empty standalone suffix, level-specific Writer base patterns, setters invalidation, raw independent field copy, representable start/include ranges, zero counters and mixed Arabic/character-special ancestor handling in decimal format/fallback. Verify document-owned node visible labels, clone isolation and current Worker encode/decode/rejection of malformed list formats without introducing saved-document compatibility. Run npm run verify unchanged (both 100% coverage suites, browser/resources/ODT/type/source/provenance gates), ap doctor, routing and git diff --check. Retain broader module unverified status and record real code commit."
  Verification: |-
    Command: npm run verify. Result: pass, exit 0 observed at terminal completion of session 54578. Evidence: 629 application tests /134 files; 109 inventory tests /36 files; 19 browser scenarios. Application coverage 100% statements 9793, branches 7367, functions 2711, lines 9014; inventory coverage 100% statements 1523, branches 1080, functions 384, lines 1464. Format/lint/types/module boundaries/resources/static/JSDoc/file-size/source-tree/provenance/invariants/parity pass unchanged. SemanticViolationCount=0 proves metadata consistency only. Scope: native shared marker ownership/setters, standalone/default-rule contracts, Arabic/character-special formatting, copies and Worker graph v16 plus required regressions. Command: python3 .agentplane/tasks/202609302319-9KTM99/native-oracle.py; npx tsx .agentplane/tasks/202609302319-9KTM99/compare-native.mts. Result: pass, 188 native states/labels and all 83 label cases after owned clone. Evidence: unmodified extracted SetPrefix/SetSuffix/SetListFormat/GetListFormat and SwNumRule::MakeNumString bodies with bounded ASCII/Arabic/dependency shims; not a native full build or wider formatter claim. Command: initial correctly rooted focus. Result: pass 26 existing tests; final full run includes all six new cases and final corrections. Command: ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check. Result: doctor zero errors /same two prior warnings, routing pass, diff checked again after normalizing terminal log whitespace. XML marker/ListFormat attribute transport and wider numbering/layout remain unverified; registered save/open/recovery behavior untouched. Real code hash and final clean state recorded at closure and in parent progress.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-30T23:35:27.809Z — VERIFY — ok

    By: CODER

    Note: Native marker setters and Writer formatting match 188 compiled states/labels and 83 cloned labels; final 629 app, 109 inventory, 19 browser tests and both 100% coverage suites pass with all mandatory gates.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-30T23:35:27.407Z, excerpt_hash=sha256:9ad82309124daafadcc1a1565c1ea5ca5657597aadb46a5369531e44dfc04a9d

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609302319-9KTM99/blueprint/resolved-snapshot.json
    - old_digest: 20cdf865e68f93be3aa3b0f392fabededfbcf2657ef036f3b841c60dece9d687
    - current_digest: 20cdf865e68f93be3aa3b0f392fabededfbcf2657ef036f3b841c60dece9d687
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609302319-9KTM99

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609302319-9KTM99
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the scoped code commit after checking subsequent numbering changes; retain task evidence."
  Findings: |-
    Iteration25 completed; clean main/direct and parent 202609240501-C9TN6M remains active. Persistent user goal authorizes this safe local leaf. Pinned libreoffice-26.8.0.2 /9bc445578031fecf56086729d8e4940c77e14d65: editeng numitem.cxx owns scalar marker fields and SetListFormat derivation/invalidation; SwNumFormat default constructor only delegates to SvxNumberFormat(ARABIC), with empty suffix. SwNumRule modern base constructors assign %level%. patterns. Local SwNumFormat instead owns readonly marker fields, defaults numeric suffix to a dot and lacks pattern state, while MakeNumString joins counters without native per-level type substitution. Native format parser can derive compatibility fields imperfectly; reproduce observed bodies rather than normalizing. XML marker properties, extended ListFormat import/export, fonts, continuous/outline/NONE/bitmap numbering, hidden-nonnumerical and include-strings formatter variants remain later audit obligations.

    - Observation: Initial focus command referenced a nonexistent Vitest config and exited before executing tests; several read-only guesses for test/probe paths were absent.
      Impact: No semantic test evidence was produced and no runtime regression is inferred.
      Resolution: Discover actual repository config and task probe filenames before rerunning; keep verification scope unchanged.

    - Observation: Compiled 161 native states/labels and 56 clone labels match. Focus passes 27 assertions but two new fixtures fail: percent scanning of %0% derives prefix %0, and the existing node API is GetListLabel.
      Impact: The test expectation and guessed method need correction; extracted source differential confirms current implementation for the unusual percent case.
      Resolution: Use the source-observed compatibility prefix and existing node method; rerun focus and full gates unchanged.

    - Observation: An evidence metadata script assumed the wrong top-level JSON collection key and failed before writing either file.
      Impact: Runtime metadata remains unchanged; source and differential checks still pass.
      Resolution: Inspect actual JSON keys and apply bounded evidence entries without changing status or validators.

    - Observation: Initial full verify stopped at lint. Evidence metadata also needs separate handling of browser responsibilities versus upstream preservedResponsibilities; the inventory write completed, provenance write did not.
      Impact: No final verification pass is claimed; runtime and browser metadata record types must be handled explicitly.
      Resolution: Apply the reported lint correction and source-provenance updates with actual record shapes, then rerun unchanged full verification.

    - Observation: Full verify now passes format/lint but typecheck rejects explicitly assigning undefined to the optional ListFormat graph field.
      Impact: The decoder must omit an absent optional field under exactOptionalPropertyTypes.
      Resolution: Conditionally include ListFormat, preserve native copy-then-SetSuffix ordering in UNO application, and rerun mandatory verification without changing compiler rules.
id_source: "generated"
---
## Summary

Restore native shared numbering marker state and ListFormat behavior for the existing Arabic/bullet subset.

## Scope

editeng/source/items/numitem.ts/tests, sw/source/core/doc/number.ts/tests, bounded UNO suffix application adjustment, Worker writer-document-codec.ts and affected transfer tests/current schema, existing caller fixtures requiring an explicit decimal suffix, runtime inventory/provenance and task-local primary-source differential evidence. No XML marker import/export expansion in this leaf, native numbering family expansion, policy/gate weakening, network/outside access or registered save/open/recovery changes.

## Plan

Move prefix/suffix/start/include-upper state to native SvxNumberFormat alongside position state. Implement both SetListFormat contracts, prefix/suffix invalidation and derived compatibility fields, including native unsigned widths and literal unusual pattern behavior. Correct standalone format defaults to native empty suffix and initialize Writer base rules with their level-specific native ListFormat. Replace decimal join shortcut with pinned pattern scanning and native legacy fallback within the currently implemented Arabic/character-special subset. Preserve raw state, including a changed include-upper count independent of ListFormat, in clone and the current Worker graph schema. Keep visible bullet glyph projection separately bounded. Verify using unmodified extracted native setter bodies and bounded Writer formatter probes, focused core/UNO/transfer tests and full unchanged verification.

## Verify Steps

Compare primary-source SetPrefix/SetSuffix and both SetListFormat bodies for absent/empty/literal formats, percent-delimited patterns, noncontiguous/repeated/%10%/future references, unusual percent affixes and generated clamped levels. Assert native empty standalone suffix, level-specific Writer base patterns, setters invalidation, raw independent field copy, representable start/include ranges, zero counters and mixed Arabic/character-special ancestor handling in decimal format/fallback. Verify document-owned node visible labels, clone isolation and current Worker encode/decode/rejection of malformed list formats without introducing saved-document compatibility. Run npm run verify unchanged (both 100% coverage suites, browser/resources/ODT/type/source/provenance gates), ap doctor, routing and git diff --check. Retain broader module unverified status and record real code commit.

## Verification

Command: npm run verify. Result: pass, exit 0 observed at terminal completion of session 54578. Evidence: 629 application tests /134 files; 109 inventory tests /36 files; 19 browser scenarios. Application coverage 100% statements 9793, branches 7367, functions 2711, lines 9014; inventory coverage 100% statements 1523, branches 1080, functions 384, lines 1464. Format/lint/types/module boundaries/resources/static/JSDoc/file-size/source-tree/provenance/invariants/parity pass unchanged. SemanticViolationCount=0 proves metadata consistency only. Scope: native shared marker ownership/setters, standalone/default-rule contracts, Arabic/character-special formatting, copies and Worker graph v16 plus required regressions. Command: python3 .agentplane/tasks/202609302319-9KTM99/native-oracle.py; npx tsx .agentplane/tasks/202609302319-9KTM99/compare-native.mts. Result: pass, 188 native states/labels and all 83 label cases after owned clone. Evidence: unmodified extracted SetPrefix/SetSuffix/SetListFormat/GetListFormat and SwNumRule::MakeNumString bodies with bounded ASCII/Arabic/dependency shims; not a native full build or wider formatter claim. Command: initial correctly rooted focus. Result: pass 26 existing tests; final full run includes all six new cases and final corrections. Command: ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check. Result: doctor zero errors /same two prior warnings, routing pass, diff checked again after normalizing terminal log whitespace. XML marker/ListFormat attribute transport and wider numbering/layout remain unverified; registered save/open/recovery behavior untouched. Real code hash and final clean state recorded at closure and in parent progress.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-30T23:35:27.809Z — VERIFY — ok

By: CODER

Note: Native marker setters and Writer formatting match 188 compiled states/labels and 83 cloned labels; final 629 app, 109 inventory, 19 browser tests and both 100% coverage suites pass with all mandatory gates.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-30T23:35:27.407Z, excerpt_hash=sha256:9ad82309124daafadcc1a1565c1ea5ca5657597aadb46a5369531e44dfc04a9d

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609302319-9KTM99/blueprint/resolved-snapshot.json
- old_digest: 20cdf865e68f93be3aa3b0f392fabededfbcf2657ef036f3b841c60dece9d687
- current_digest: 20cdf865e68f93be3aa3b0f392fabededfbcf2657ef036f3b841c60dece9d687
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609302319-9KTM99

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609302319-9KTM99
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the scoped code commit after checking subsequent numbering changes; retain task evidence.

## Findings

Iteration25 completed; clean main/direct and parent 202609240501-C9TN6M remains active. Persistent user goal authorizes this safe local leaf. Pinned libreoffice-26.8.0.2 /9bc445578031fecf56086729d8e4940c77e14d65: editeng numitem.cxx owns scalar marker fields and SetListFormat derivation/invalidation; SwNumFormat default constructor only delegates to SvxNumberFormat(ARABIC), with empty suffix. SwNumRule modern base constructors assign %level%. patterns. Local SwNumFormat instead owns readonly marker fields, defaults numeric suffix to a dot and lacks pattern state, while MakeNumString joins counters without native per-level type substitution. Native format parser can derive compatibility fields imperfectly; reproduce observed bodies rather than normalizing. XML marker properties, extended ListFormat import/export, fonts, continuous/outline/NONE/bitmap numbering, hidden-nonnumerical and include-strings formatter variants remain later audit obligations.

- Observation: Initial focus command referenced a nonexistent Vitest config and exited before executing tests; several read-only guesses for test/probe paths were absent.
  Impact: No semantic test evidence was produced and no runtime regression is inferred.
  Resolution: Discover actual repository config and task probe filenames before rerunning; keep verification scope unchanged.

- Observation: Compiled 161 native states/labels and 56 clone labels match. Focus passes 27 assertions but two new fixtures fail: percent scanning of %0% derives prefix %0, and the existing node API is GetListLabel.
  Impact: The test expectation and guessed method need correction; extracted source differential confirms current implementation for the unusual percent case.
  Resolution: Use the source-observed compatibility prefix and existing node method; rerun focus and full gates unchanged.

- Observation: An evidence metadata script assumed the wrong top-level JSON collection key and failed before writing either file.
  Impact: Runtime metadata remains unchanged; source and differential checks still pass.
  Resolution: Inspect actual JSON keys and apply bounded evidence entries without changing status or validators.

- Observation: Initial full verify stopped at lint. Evidence metadata also needs separate handling of browser responsibilities versus upstream preservedResponsibilities; the inventory write completed, provenance write did not.
  Impact: No final verification pass is claimed; runtime and browser metadata record types must be handled explicitly.
  Resolution: Apply the reported lint correction and source-provenance updates with actual record shapes, then rerun unchanged full verification.

- Observation: Full verify now passes format/lint but typecheck rejects explicitly assigning undefined to the optional ListFormat graph field.
  Impact: The decoder must omit an absent optional field under exactOptionalPropertyTypes.
  Resolution: Conditionally include ListFormat, preserve native copy-then-SetSuffix ordering in UNO application, and rerun mandatory verification without changing compiler rules.
