---
id: "202610201948-MMAQEF"
title: "Implement native search option value and service contracts"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
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
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
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
doc_version: 3
doc_updated_at: "2026-10-20T19:51:57.921Z"
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
  Verification: "Pending implementation. Checkout was clean on writer at preflight. Parent source checkpoints and both replacement/history leaves are committed. No full feature/UI verification or skip is claimed."
  Rollback Plan: "Revert only intentional implementation/task commits for this leaf. Preserve parent/source history, pending user approval, vendor references and user work. No reset, merge, destructive cleanup or outside-repository writes."
  Findings: "The original i18nutil wrapper default AlgorithmType2 is zero, while legacy SearchAlgorithms::ABSOLUTE is zero and newer ABSOLUTE is one. upgradeSearchAlgorithms defaults unknown legacy values to newer ABSOLUTE; downgradeSearchAlgorithms2 defaults unknown and wildcard to legacy ABSOLUTE. Assignment from newer UNO options ignores obsolete algorithmType and retains AlgorithmType2. Original i18npool legacy setOptions constructs newer wire options with escape zero, then calls setOptions2. ICU reference alias was found to resolve inside a separate Calc repository, so further reads are gated by an explicit pending user question; this leaf uses only already approved LibreOffice sources and actual existing repo modules."
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

Pending implementation. Checkout was clean on writer at preflight. Parent source checkpoints and both replacement/history leaves are committed. No full feature/UI verification or skip is claimed.

## Rollback Plan

Revert only intentional implementation/task commits for this leaf. Preserve parent/source history, pending user approval, vendor references and user work. No reset, merge, destructive cleanup or outside-repository writes.

## Findings

The original i18nutil wrapper default AlgorithmType2 is zero, while legacy SearchAlgorithms::ABSOLUTE is zero and newer ABSOLUTE is one. upgradeSearchAlgorithms defaults unknown legacy values to newer ABSOLUTE; downgradeSearchAlgorithms2 defaults unknown and wildcard to legacy ABSOLUTE. Assignment from newer UNO options ignores obsolete algorithmType and retains AlgorithmType2. Original i18npool legacy setOptions constructs newer wire options with escape zero, then calls setOptions2. ICU reference alias was found to resolve inside a separate Calc repository, so further reads are gated by an explicit pending user question; this leaf uses only already approved LibreOffice sources and actual existing repo modules.
