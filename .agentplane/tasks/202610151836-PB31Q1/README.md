---
id: "202610151836-PB31Q1"
title: "Port native shared font search names and token operations"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 13
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-15T18:36:20.656Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-15T18:45:07.063Z"
  updated_by: "CODER"
  note: "PASS:58 related and187 Calc tests, exact2 shared/33 Calc owners raw100,13 gates/43 boundary tests;5 pinned blobs/all155 rows/10 direct QA cases audited. CALC143-145 preserved; refs restored. No full native container or UI/ODS parity promotion."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-15T18:45:41.281Z"
  updated_by: "EVALUATOR"
  note: "Shared font name normalization and independent list/script/symbol operations preserve pinned rules and dictionary evidence, with direct native QA and explicit ambiguity boundaries."
  evaluated_sha: "f36ec9f87db29a04c9181a6a0c6d7b5d2c58b477"
  blueprint_digest: "ea01721bf1960a971e71449f3056ad63edefbb6b082e9ac05132686d9784058d"
  evidence_refs:
    - ".agentplane/tasks/202610151836-PB31Q1/README.md"
    - ".agentplane/tasks/202610151836-PB31Q1/quality/20261015-184541281-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610151836-PB31Q1/quality/20261015-184541281-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610151836-PB31Q1/quality/20261015-184541281-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610151836-PB31Q1/blueprint/resolved-snapshot.json"
    - "output/playwright/task164-checks/final-verification.json"
    - "apps/office/src/unotools/source/misc/native-font-names.test.ts"
    - "docs/program/calc-upstream-suspected-issues.md"
  findings:
    - "Same-agent review, not independent.5 complete pinned blobs/all155 literal dictionary rows/10 unchanged native QA cases audited.58 related and187 Calc tests pass; exact2 shared/33 Calc owners raw100 with every counter positive; all13 gates/43 boundary tests pass. Full65536-unit test includes literal one-unit aliases. Source parser body and prior journal prefix unchanged. Conflicting duplicate keys use documented sequential unique insertion with no cross-standard-library guarantee; unreachable keys/IPAex spelling preserved and CALC143-145 documented. No physical/default-device or UI/ODS readiness claim."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: port actual shared font search-name rules/dictionary and direct native QA, maintaining suspicious source mappings and original token contracts."
events:
  -
    type: "status"
    at: "2026-10-15T18:36:25.608Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port actual shared font search-name rules/dictionary and direct native QA, maintaining suspicious source mappings and original token contracts."
  -
    type: "verify"
    at: "2026-10-15T18:45:07.063Z"
    author: "CODER"
    state: "ok"
    note: "PASS:58 related and187 Calc tests, exact2 shared/33 Calc owners raw100,13 gates/43 boundary tests;5 pinned blobs/all155 rows/10 direct QA cases audited. CALC143-145 preserved; refs restored. No full native container or UI/ODS parity promotion."
doc_version: 3
doc_updated_at: "2026-10-15T18:45:07.117Z"
doc_updated_by: "CODER"
description: "Task164: complete source-backed font name normalization/dictionary, script suffix stripping, raw token append and symbol recognition in existing shared fontdefs owner needed by default-font physical matching; port direct native QA and record IPAex mapping suspicion without correcting upstream."
sections:
  Summary: "Task164: implement shared native font search-name normalization and remaining independent fontdefs operations required by physical font matching, preserving source quirks."
  Scope: "Existing unotools/source/misc/fontdefs.ts and inc/fontdefs.ts, complete source dictionary JSON, one new source-derived/direct-native test file, existing shared runtime/provenance/capability records and Calc core/readiness/suspected-issues docs (up to14 non-task files). No physical font/service stub, font substitution config implementation, native probe/compiler, browser consumer changes or unrelated Writer repair."
  Plan: "Port complete GetEnglishSearchFontName with original ASCII/fullwidth rules and all native localized-name dictionary entries; StripScriptFromName repeatedly strips only original suffixes; AddTokenFontName uses existing exact native token parser and actual OUString mutation; IsOpenSymbol checks first token with ASCII case rules. Preserve original source/header responsibilities, UTF16 views and shared values without a buffer/memory engine. Port actual native testGetEnglishSearchName cases plus exhaustive UTF16 scalar normalization, dictionary and alias/copy/boundary cases. Record suspicious IPAex output unchanged as CALC-143. Strict raw100 for changed shared owners and all Calc, related shared/Writer tests,13 source gates; no browser/build replay without consumer changes. Actual physical/default-device selection remains pending."
  Verify Steps: "Audit pinned fontdefs source/header and direct native QA; verify complete dictionary extraction and original suffix/fullwidth/token/symbol scopes without native compiler. Port all direct testSingleElement cases; test all dictionary pairs and65536 UTF16 units, controls/fullwidth/unmapped Unicode/surrogates; repeated script suffixes, unchanged OUString identity, exact raw token de-duplication including empty/trailing/comma/space/case and alias views; ASCII-only first-token symbol recognition. Run related shared/Writer tests and full Calc with4 source symlinks absent/restored, exact measured sets and raw S/B/F/L100/all counters positive for changed shared and Calc. Run13 established source gates incl inventory/provenance and43 boundary cases. Preserve source typo in code and journal, do not claim complete physical/config/device or UI/ODS readiness. No full all-app run until minimum UI/ODS milestone."
  Verification: |-
    Command: node output/playwright/task164-checks/portable.mjs. Result: PASS after correcting two fixture assumptions to source semantics;58 related tests/5 files and187 Calc tests/76 files. Scope: exact2 shared owners raw S106/B56/F11/L94 and exact33 Calc owners S4179/B2731/F821/L3727 all100 with every raw counter positive. Four reference symlinks absent during execution/restored afterward. Command: node output/playwright/task164-checks/source-gates.mjs. Result: all13 gates PASS including43 boundary tests, authoritative provenance/inventory, doctor OK with existing warning. Source audit verifies5 complete pinned blobs, all155 dictionary rows/153 unique keys,10 unchanged direct native testSingleElement cases,2 conflicting duplicate keys and2 unreachable hyphenated keys. Exhaustive65536-unit test includes two one-unit source aliases. Original GetNextFontToken body and full pre-task journal prefix unchanged. Evidence: output/playwright/task164-checks/final-verification.json and native-audit.json; failed initial log retained. No browser consumer mutation, native compiler/probe, full all-app suite or UI/ODS readiness claim.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-15T18:45:07.063Z — VERIFY — ok

    By: CODER

    Note: PASS:58 related and187 Calc tests, exact2 shared/33 Calc owners raw100,13 gates/43 boundary tests;5 pinned blobs/all155 rows/10 direct QA cases audited. CALC143-145 preserved; refs restored. No full native container or UI/ODS parity promotion.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-15T18:45:06.603Z, excerpt_hash=sha256:efc199ea28a98c96252a6e9c0cb63ebecdea5f7e0080463fd13ce468353397c3

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610151836-PB31Q1/blueprint/resolved-snapshot.json
    - old_digest: ea01721bf1960a971e71449f3056ad63edefbb6b082e9ac05132686d9784058d
    - current_digest: ea01721bf1960a971e71449f3056ad63edefbb6b082e9ac05132686d9784058d
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610151836-PB31Q1

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610151836-PB31Q1
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task implementation/test/data/registry/docs commit. No existing browser consumer or document serialization is migrated; prior task163 candidate/token APIs remain available."
  Findings: |-
    - Observation: Dictionary extraction rejected the assumption of unique literal keys:155 native rows contain153 unique keys. 方正黑体 and 方正楷体 each have two different English values.
      Impact: Collapsing into a JSON object or using last-write-wins would silently erase native initializer evidence and select a different alias.
      Resolution: Preserve all155 literal pairs, use sequential unique-key insertion in the browser binding, record first-insertion semantics and the unverified platform-container ambiguity in CALC-144. Do not correct either alias or claim cross-standard-library duplicate-selection proof; direct native QA does not cover these two conflicts.

    - Observation: Initial related run:56 pass,2 fixture failures. Dictionary input hg正楷書体-pro is normalized to hg正楷書体pro before lookup, so its literal hyphenated entry is unreachable. Exhaustive scalar expectations also omitted two actual one-unit dictionary aliases.
      Impact: Normalizing dictionary keys or ignoring those two aliases would change upstream behavior. The implementation returned the source-derived results correctly.
      Resolution: Keep raw dictionary keys, add unreachable-entry source evidence/journal, and make expected dictionary queries account for native preprocessing. Include the two literal one-unit aliases in the exhaustive expected results. Preserve failed log; rerun focused shared/Calc coverage.
id_source: "generated"
---
## Summary

Task164: implement shared native font search-name normalization and remaining independent fontdefs operations required by physical font matching, preserving source quirks.

## Scope

Existing unotools/source/misc/fontdefs.ts and inc/fontdefs.ts, complete source dictionary JSON, one new source-derived/direct-native test file, existing shared runtime/provenance/capability records and Calc core/readiness/suspected-issues docs (up to14 non-task files). No physical font/service stub, font substitution config implementation, native probe/compiler, browser consumer changes or unrelated Writer repair.

## Plan

Port complete GetEnglishSearchFontName with original ASCII/fullwidth rules and all native localized-name dictionary entries; StripScriptFromName repeatedly strips only original suffixes; AddTokenFontName uses existing exact native token parser and actual OUString mutation; IsOpenSymbol checks first token with ASCII case rules. Preserve original source/header responsibilities, UTF16 views and shared values without a buffer/memory engine. Port actual native testGetEnglishSearchName cases plus exhaustive UTF16 scalar normalization, dictionary and alias/copy/boundary cases. Record suspicious IPAex output unchanged as CALC-143. Strict raw100 for changed shared owners and all Calc, related shared/Writer tests,13 source gates; no browser/build replay without consumer changes. Actual physical/default-device selection remains pending.

## Verify Steps

Audit pinned fontdefs source/header and direct native QA; verify complete dictionary extraction and original suffix/fullwidth/token/symbol scopes without native compiler. Port all direct testSingleElement cases; test all dictionary pairs and65536 UTF16 units, controls/fullwidth/unmapped Unicode/surrogates; repeated script suffixes, unchanged OUString identity, exact raw token de-duplication including empty/trailing/comma/space/case and alias views; ASCII-only first-token symbol recognition. Run related shared/Writer tests and full Calc with4 source symlinks absent/restored, exact measured sets and raw S/B/F/L100/all counters positive for changed shared and Calc. Run13 established source gates incl inventory/provenance and43 boundary cases. Preserve source typo in code and journal, do not claim complete physical/config/device or UI/ODS readiness. No full all-app run until minimum UI/ODS milestone.

## Verification

Command: node output/playwright/task164-checks/portable.mjs. Result: PASS after correcting two fixture assumptions to source semantics;58 related tests/5 files and187 Calc tests/76 files. Scope: exact2 shared owners raw S106/B56/F11/L94 and exact33 Calc owners S4179/B2731/F821/L3727 all100 with every raw counter positive. Four reference symlinks absent during execution/restored afterward. Command: node output/playwright/task164-checks/source-gates.mjs. Result: all13 gates PASS including43 boundary tests, authoritative provenance/inventory, doctor OK with existing warning. Source audit verifies5 complete pinned blobs, all155 dictionary rows/153 unique keys,10 unchanged direct native testSingleElement cases,2 conflicting duplicate keys and2 unreachable hyphenated keys. Exhaustive65536-unit test includes two one-unit source aliases. Original GetNextFontToken body and full pre-task journal prefix unchanged. Evidence: output/playwright/task164-checks/final-verification.json and native-audit.json; failed initial log retained. No browser consumer mutation, native compiler/probe, full all-app suite or UI/ODS readiness claim.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-15T18:45:07.063Z — VERIFY — ok

By: CODER

Note: PASS:58 related and187 Calc tests, exact2 shared/33 Calc owners raw100,13 gates/43 boundary tests;5 pinned blobs/all155 rows/10 direct QA cases audited. CALC143-145 preserved; refs restored. No full native container or UI/ODS parity promotion.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-15T18:45:06.603Z, excerpt_hash=sha256:efc199ea28a98c96252a6e9c0cb63ebecdea5f7e0080463fd13ce468353397c3

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610151836-PB31Q1/blueprint/resolved-snapshot.json
- old_digest: ea01721bf1960a971e71449f3056ad63edefbb6b082e9ac05132686d9784058d
- current_digest: ea01721bf1960a971e71449f3056ad63edefbb6b082e9ac05132686d9784058d
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610151836-PB31Q1

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610151836-PB31Q1
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task implementation/test/data/registry/docs commit. No existing browser consumer or document serialization is migrated; prior task163 candidate/token APIs remain available.

## Findings

- Observation: Dictionary extraction rejected the assumption of unique literal keys:155 native rows contain153 unique keys. 方正黑体 and 方正楷体 each have two different English values.
  Impact: Collapsing into a JSON object or using last-write-wins would silently erase native initializer evidence and select a different alias.
  Resolution: Preserve all155 literal pairs, use sequential unique-key insertion in the browser binding, record first-insertion semantics and the unverified platform-container ambiguity in CALC-144. Do not correct either alias or claim cross-standard-library duplicate-selection proof; direct native QA does not cover these two conflicts.

- Observation: Initial related run:56 pass,2 fixture failures. Dictionary input hg正楷書体-pro is normalized to hg正楷書体pro before lookup, so its literal hyphenated entry is unreachable. Exhaustive scalar expectations also omitted two actual one-unit dictionary aliases.
  Impact: Normalizing dictionary keys or ignoring those two aliases would change upstream behavior. The implementation returned the source-derived results correctly.
  Resolution: Keep raw dictionary keys, add unreachable-entry source evidence/journal, and make expected dictionary queries account for native preprocessing. Include the two literal one-unit aliases in the exhaustive expected results. Preserve failed log; rerun focused shared/Calc coverage.
