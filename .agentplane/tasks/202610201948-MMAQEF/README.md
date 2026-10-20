---
id: "202610201948-MMAQEF"
title: "Implement native search option value and service contracts"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 15
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-20T19:49:43.960Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-20T20:05:14.117Z"
  updated_by: "CODER"
  note: "122 search tests and 48 boundary tests pass; build, scoped style, source registries and policy checks pass. Native source/value evidence only; parent item/configuration/UI and ICU remain open."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-20T20:05:36.954Z"
  updated_by: "EVALUATOR"
  note: "Native search value and legacy/new service bridge meets approved source-shaped leaf scope at cd07a2ca9954."
  evaluated_sha: "cd07a2ca9954b1c1694d8cc6ce187f307896ec67"
  blueprint_digest: "db7a744af6c74b2e0f14890a2c435e3bb4708f272268729a608d45f5139fa256"
  evidence_refs:
    - ".agentplane/tasks/202610201948-MMAQEF/README.md"
    - ".agentplane/tasks/202610201948-MMAQEF/quality/20261020-200536954-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610201948-MMAQEF/quality/20261020-200536954-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610201948-MMAQEF/quality/20261020-200536954-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610201948-MMAQEF/blueprint/resolved-snapshot.json"
    - "output/playwright/writer-search-values-checks/tooling-final.log"
    - "output/playwright/writer-search-values-checks/provenance-final.log"
    - "output/playwright/writer-search-values-checks/check-2.log"
  findings:
    - "Inspected value owners, inherited full constructors, typed assignment/conversion and legacy forwarding; exact enum/field mappings and boundary exceptions preserve native contracts without promoting broader service/UI fidelity."
    - "122 focused search tests and 48 boundary-tooling cases pass; build and required static/registry checks pass. WRITER-017 is explicitly source-only; unimplemented item/configuration and ICU remain outside this leaf."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement the approved independent native search value/service contract leaf on writer, using only the authorized LibreOffice reference."
events:
  -
    type: "status"
    at: "2026-10-20T19:51:57.921Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the approved independent native search value/service contract leaf on writer, using only the authorized LibreOffice reference."
  -
    type: "verify"
    at: "2026-10-20T20:05:14.117Z"
    author: "CODER"
    state: "ok"
    note: "122 search tests and 48 boundary tests pass; build, scoped style, source registries and policy checks pass. Native source/value evidence only; parent item/configuration/UI and ICU remain open."
doc_version: 3
doc_updated_at: "2026-10-20T20:05:14.208Z"
doc_updated_by: "CODER"
description: "Implementation leaf of approved Writer search/replace plan 202610201742-6B984M. Port SearchAlgorithms and legacy/new UNO SearchOptions value fields/constructors, complete i18nutil SearchOptions2 conversion/assignment contracts, actual i18npool legacy setOptions and new-wire setOptions2 handling, and native search command/member identities for the future shared command item. Preserve native defaults and algorithm precedence, independent string/Locale values and unsupported modes. No configuration provider stub or UI parity claim; existing local LibreOffice reading authorized, no ICU external read without the pending explicit approval, network or document storage changes."
sections:
  Summary: "Implement the native search option value/algorithm/member bridge required by approved parent Writer search/replace plan 202610201742-6B984M. This leaf closes the represented data/service boundary, not configuration/item/view/UI or full search parity."
  Scope: "Only /Users/odubinkin/Projects/vite-office-writer on writer. Up to 50 non-task paths across offapi util SearchAlgorithms/SearchOptions/SearchOptions2, existing i18nutil SearchOptions2 value owner, actual i18npool TextSearch service entrypoints, native Svl search command/member identities, relevant tests and provenance/runtime/dependency evidence. Preserve pinned native defaults, field order/ownership and algorithm conversion/precedence, UTF16 and Locale values; unsupported algorithms remain explicit. No fake preference/configuration provider or UNO service initialization, no new UI claim, document storage/recovery/autosave change, network, merge or unrelated Calc work. Existing local LibreOffice reference reading is approved. Physical ICU reference source/archive reading remains approval-gated and is not required by this independent leaf."
  Plan: "Implement the approved native search option wire/value/algorithm service boundary and shared command/member identities, with independent value ownership and source-backed verification. Configuration/item/view/UI and ICU-dependent algorithms remain parent work."
  Verify Steps: |-
    - Run focused new value/service tests for default and full/copy constructors, field order, independent strings/Locale, Unicode/empty/isolated UTF16 values, native upgrade/downgrade including wildcard/unknown values, new-versus-old algorithm precedence and legacy zero-escape adaptation.
    - Run affected existing shared normal/wildcard search, wrappers/option cache and Writer Find_Text/replacement tests. Confirm regex/approximate/other unported transliterations still reject truthfully and old default AlgorithmType2=0 remains unchanged.
    - Run npm run build; scoped ESLint --max-warnings 0 and Prettier --check on all changed/new authored files; npm run check:dependencies, check:source-provenance, check:source-tree, check:docs, check:file-size and inventory:parity:writer/shared with verbose JSON redirected to ignored logs. If actual new dependency data is needed, add only source-backed edges and run affected dependency tooling tests.
    - Run ap doctor, node .agentplane/policy/check-routing.mjs, git diff --check and git status --short --untracked-files=all. Inspect original i18nutil/searchopt.hxx, offapi SearchOptions/Algorithms IDL, i18npool setOptions branches, svl/srchitem.hxx and memberid.h. Distinguish source/portable checks from compiled native execution, record any suspected source issue while preserving it.
    - Keep parent configuration/item/view/UI, ICU normalization/word/regex dependencies and full Writer goal open. Cadence is five completed tasks since last full run 202610182155-98VCB0/6a7dd8660, including V6W22V closure 62ae980f9d26 whose generated subject uses task rather than close. This leaf would be the sixth, so no full run is due.
  Verification: |-
    PASS: 122 focused tests in seven files (new value/service tests plus existing normal/wildcard search, wrapper engine, Writer Find_Text and native replacement). PASS: 48 boundary-tooling tests in two files. PASS: office typecheck and npm run build. PASS: changed-file Prettier and ESLint --max-warnings 0; check:dependencies; check:source-provenance (980 runtime modules); check:source-tree; check:docs; check:file-size; inventory:parity:writer and shared; policy routing and git diff --check. Doctor: zero errors, pre-existing managed-hook readiness warning. Build retains existing chunk-size warning. Logs: output/playwright/writer-search-values-checks (ignored). No full suite due: this is the sixth completion since full checkpoint 6a7dd8660. Evidence is source inspection and portable tests, not compiled native UNO/component or UI parity.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-20T20:05:14.117Z — VERIFY — ok

    By: CODER

    Note: 122 search tests and 48 boundary tests pass; build, scoped style, source registries and policy checks pass. Native source/value evidence only; parent item/configuration/UI and ICU remain open.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-20T20:05:13.321Z, excerpt_hash=sha256:f2c3a3652dce5923fd5814937137d540f11a8a2cca7414bc794c2772268e58d9

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610201948-MMAQEF/blueprint/resolved-snapshot.json
    - old_digest: db7a744af6c74b2e0f14890a2c435e3bb4708f272268729a608d45f5139fa256
    - current_digest: db7a744af6c74b2e0f14890a2c435e3bb4708f272268729a608d45f5139fa256
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610201948-MMAQEF

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610201948-MMAQEF
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only intentional implementation/task commits for this leaf. Preserve parent/source history, pending user approval, vendor references and user work. No reset, merge, destructive cleanup or outside-repository writes."
  Findings: |-
    Implemented legacy SearchAlgorithms and inherited UNO SearchOptions/SearchOptions2 owners, typed i18nutil construction/assignment/conversion, old TextSearch.setOptions forwarding, new wire acceptance, actual search command enums and all 23 MID_SEARCH identities. Preserved zero defaults, different old/new algorithm identities, unknown downgrade/upgrade fallback, zero legacy wildcard escape, independent raw Locale/string values and new API AlgorithmType2 precedence. Existing unsupported algorithms/transliterations continue to reject before mutation.

    Initial boundary check identified four precise native value dependencies. Added source-backed exact-import data only and tested neighbor/browser rejection; global forbidden module edges are unchanged. Initial provenance check required field/constant symbols beyond a matching basename; added exact original symbols, with no enforcement changes or fidelity promotion.

    WRITER-017 records source-only SvxSearchItem constructor versus Notify case-flag asymmetry; the item/configuration owner remains pending and no constructor behavior has been fabricated here. Broader parent view dispatch, toolbar/dialog, configuration and ICU normalization/backend work remain open.

    Scope discovery: vendor/icu-reference physically points into the separate Calc repository. A limited normalization header read occurred before the repository boundary was confirmed; further ICU reads were stopped and the user was informed. Explicit approval for reading that ICU source/archive is pending. No additional outside-repository ICU reads, network access or writes were used for this independent leaf. Local LibreOffice source reading was already authorized.
id_source: "generated"
---
## Summary

Implement the native search option value/algorithm/member bridge required by approved parent Writer search/replace plan 202610201742-6B984M. This leaf closes the represented data/service boundary, not configuration/item/view/UI or full search parity.

## Scope

Only /Users/odubinkin/Projects/vite-office-writer on writer. Up to 50 non-task paths across offapi util SearchAlgorithms/SearchOptions/SearchOptions2, existing i18nutil SearchOptions2 value owner, actual i18npool TextSearch service entrypoints, native Svl search command/member identities, relevant tests and provenance/runtime/dependency evidence. Preserve pinned native defaults, field order/ownership and algorithm conversion/precedence, UTF16 and Locale values; unsupported algorithms remain explicit. No fake preference/configuration provider or UNO service initialization, no new UI claim, document storage/recovery/autosave change, network, merge or unrelated Calc work. Existing local LibreOffice reference reading is approved. Physical ICU reference source/archive reading remains approval-gated and is not required by this independent leaf.

## Plan

Implement the approved native search option wire/value/algorithm service boundary and shared command/member identities, with independent value ownership and source-backed verification. Configuration/item/view/UI and ICU-dependent algorithms remain parent work.

## Verify Steps

- Run focused new value/service tests for default and full/copy constructors, field order, independent strings/Locale, Unicode/empty/isolated UTF16 values, native upgrade/downgrade including wildcard/unknown values, new-versus-old algorithm precedence and legacy zero-escape adaptation.
- Run affected existing shared normal/wildcard search, wrappers/option cache and Writer Find_Text/replacement tests. Confirm regex/approximate/other unported transliterations still reject truthfully and old default AlgorithmType2=0 remains unchanged.
- Run npm run build; scoped ESLint --max-warnings 0 and Prettier --check on all changed/new authored files; npm run check:dependencies, check:source-provenance, check:source-tree, check:docs, check:file-size and inventory:parity:writer/shared with verbose JSON redirected to ignored logs. If actual new dependency data is needed, add only source-backed edges and run affected dependency tooling tests.
- Run ap doctor, node .agentplane/policy/check-routing.mjs, git diff --check and git status --short --untracked-files=all. Inspect original i18nutil/searchopt.hxx, offapi SearchOptions/Algorithms IDL, i18npool setOptions branches, svl/srchitem.hxx and memberid.h. Distinguish source/portable checks from compiled native execution, record any suspected source issue while preserving it.
- Keep parent configuration/item/view/UI, ICU normalization/word/regex dependencies and full Writer goal open. Cadence is five completed tasks since last full run 202610182155-98VCB0/6a7dd8660, including V6W22V closure 62ae980f9d26 whose generated subject uses task rather than close. This leaf would be the sixth, so no full run is due.

## Verification

PASS: 122 focused tests in seven files (new value/service tests plus existing normal/wildcard search, wrapper engine, Writer Find_Text and native replacement). PASS: 48 boundary-tooling tests in two files. PASS: office typecheck and npm run build. PASS: changed-file Prettier and ESLint --max-warnings 0; check:dependencies; check:source-provenance (980 runtime modules); check:source-tree; check:docs; check:file-size; inventory:parity:writer and shared; policy routing and git diff --check. Doctor: zero errors, pre-existing managed-hook readiness warning. Build retains existing chunk-size warning. Logs: output/playwright/writer-search-values-checks (ignored). No full suite due: this is the sixth completion since full checkpoint 6a7dd8660. Evidence is source inspection and portable tests, not compiled native UNO/component or UI parity.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-20T20:05:14.117Z — VERIFY — ok

By: CODER

Note: 122 search tests and 48 boundary tests pass; build, scoped style, source registries and policy checks pass. Native source/value evidence only; parent item/configuration/UI and ICU remain open.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-20T20:05:13.321Z, excerpt_hash=sha256:f2c3a3652dce5923fd5814937137d540f11a8a2cca7414bc794c2772268e58d9

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610201948-MMAQEF/blueprint/resolved-snapshot.json
- old_digest: db7a744af6c74b2e0f14890a2c435e3bb4708f272268729a608d45f5139fa256
- current_digest: db7a744af6c74b2e0f14890a2c435e3bb4708f272268729a608d45f5139fa256
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610201948-MMAQEF

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610201948-MMAQEF
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only intentional implementation/task commits for this leaf. Preserve parent/source history, pending user approval, vendor references and user work. No reset, merge, destructive cleanup or outside-repository writes.

## Findings

Implemented legacy SearchAlgorithms and inherited UNO SearchOptions/SearchOptions2 owners, typed i18nutil construction/assignment/conversion, old TextSearch.setOptions forwarding, new wire acceptance, actual search command enums and all 23 MID_SEARCH identities. Preserved zero defaults, different old/new algorithm identities, unknown downgrade/upgrade fallback, zero legacy wildcard escape, independent raw Locale/string values and new API AlgorithmType2 precedence. Existing unsupported algorithms/transliterations continue to reject before mutation.

Initial boundary check identified four precise native value dependencies. Added source-backed exact-import data only and tested neighbor/browser rejection; global forbidden module edges are unchanged. Initial provenance check required field/constant symbols beyond a matching basename; added exact original symbols, with no enforcement changes or fidelity promotion.

WRITER-017 records source-only SvxSearchItem constructor versus Notify case-flag asymmetry; the item/configuration owner remains pending and no constructor behavior has been fabricated here. Broader parent view dispatch, toolbar/dialog, configuration and ICU normalization/backend work remain open.

Scope discovery: vendor/icu-reference physically points into the separate Calc repository. A limited normalization header read occurred before the repository boundary was confirmed; further ICU reads were stopped and the user was informed. Explicit approval for reading that ICU source/archive is pending. No additional outside-repository ICU reads, network access or writes were used for this independent leaf. Local LibreOffice source reading was already authorized.
