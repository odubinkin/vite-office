---
id: "202610210319-37V8XQ"
title: "Implement Unicode diacritic and Japanese ignore module contracts"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on:
  - "202610210234-Q6QPPB"
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-21T03:19:54.018Z"
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
    body: "Start: Implement approved Unicode diacritic and Japanese ignore module prerequisite with native JavaScript memory and equivalent normalization, preserving original UTF16 offset contracts."
events:
  -
    type: "status"
    at: "2026-10-21T03:19:57.599Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement approved Unicode diacritic and Japanese ignore module prerequisite with native JavaScript memory and equivalent normalization, preserving original UTF16 offset contracts."
doc_version: 3
doc_updated_at: "2026-10-21T03:19:57.599Z"
doc_updated_by: "CODER"
description: "Continue approved Writer search dependency plan with native ignoreDiacritics_CTL scalar/string/offset behavior, actual rtl/OUString codepoint iteration and six source Japanese ignore modules. Use native JS normalization only with ICU78.3 conformance evidence; preserve source quirks and JavaScript memory/lifetime behavior."
sections:
  Summary: "Implement source-shaped diacritic and Japanese ignore modules as the next coherent Writer search prerequisite. Preserve the native scalar, string, UTF16 offset and range behavior while using native JavaScript memory/lifetime and equivalent Unicode normalization."
  Scope: "Only writer checkout/branch. At most 46 non-task paths: ignoreDiacritics_CTL and SeZe/TiJi/ZiZu/MiddleDot/MinusSign/Separator modules; rtl_uString_iterateCodePoints declaration/implementation and OUString forwarding; related tests/browser conformance data; exact dependency data and conservative runtime/provenance records; suspected-issues doc if required. No aggregate service registration, search flag/default activation, provider, UI, network, outside-repo writes or new memory/refcount framework. Authorized local ICU source is read-only."
  Plan: "Execute the coherent Unicode diacritic and six Japanese module scope described in Plan, with maximum46 non-task paths and original range/UTF16-offset behavior. Use JavaScript memory/lifetime; native normalization requires source and browser conformance evidence. Preserve parent scope, conservative metadata, cadence and stop after next full checkpoint."
  Verify Steps: "Run related transliteration/Unicode/SAL/o3tl/search/classification/Writer cursor tests with strict scoped coverage of changed logical algorithms. Replay ICU78.3 Unicode17 NFD/NFC conformance and all Unicode category marks in Node and installed Chromium, including actual module folding and UTF16 offsets. Run application/tools types, production build/static checks, scoped lint/format, dependency/source-provenance/tree/docs/file-size, writer/shared inventories, boundary tooling, doctor/routing and diff/status. Preserve failed evidence and do not weaken tests or gates. No full run is required for this fourth completed leaf since9BAAAC; after the NEXT full checkpoint and necessary repairs/coverage/active-task closure pause the goal per user instruction."
  Verification: "Pending implementation and declared targeted validation."
  Rollback Plan: "Revert only this leaf's intentional source/test/metadata commits in writer; preserve completed prerequisite tasks and existing user deviations. Do not merge or mutate other worktrees."
  Findings: "Preflight: clean writer checkout; direct parent6B984M is active. Previous goal turn recorded the user stop condition, which is authoritative progress. User explicitly authorizes local ICU reading and necessary text mechanisms only where native JS is not equivalent; memory/lifetime stays native JS. Parent remains incomplete. No subagents."
id_source: "generated"
---
## Summary

Implement source-shaped diacritic and Japanese ignore modules as the next coherent Writer search prerequisite. Preserve the native scalar, string, UTF16 offset and range behavior while using native JavaScript memory/lifetime and equivalent Unicode normalization.

## Scope

Only writer checkout/branch. At most 46 non-task paths: ignoreDiacritics_CTL and SeZe/TiJi/ZiZu/MiddleDot/MinusSign/Separator modules; rtl_uString_iterateCodePoints declaration/implementation and OUString forwarding; related tests/browser conformance data; exact dependency data and conservative runtime/provenance records; suspected-issues doc if required. No aggregate service registration, search flag/default activation, provider, UI, network, outside-repo writes or new memory/refcount framework. Authorized local ICU source is read-only.

## Plan

Execute the coherent Unicode diacritic and six Japanese module scope described in Plan, with maximum46 non-task paths and original range/UTF16-offset behavior. Use JavaScript memory/lifetime; native normalization requires source and browser conformance evidence. Preserve parent scope, conservative metadata, cadence and stop after next full checkpoint.

## Verify Steps

Run related transliteration/Unicode/SAL/o3tl/search/classification/Writer cursor tests with strict scoped coverage of changed logical algorithms. Replay ICU78.3 Unicode17 NFD/NFC conformance and all Unicode category marks in Node and installed Chromium, including actual module folding and UTF16 offsets. Run application/tools types, production build/static checks, scoped lint/format, dependency/source-provenance/tree/docs/file-size, writer/shared inventories, boundary tooling, doctor/routing and diff/status. Preserve failed evidence and do not weaken tests or gates. No full run is required for this fourth completed leaf since9BAAAC; after the NEXT full checkpoint and necessary repairs/coverage/active-task closure pause the goal per user instruction.

## Verification

Pending implementation and declared targeted validation.

## Rollback Plan

Revert only this leaf's intentional source/test/metadata commits in writer; preserve completed prerequisite tasks and existing user deviations. Do not merge or mutate other worktrees.

## Findings

Preflight: clean writer checkout; direct parent6B984M is active. Previous goal turn recorded the user stop condition, which is authoritative progress. User explicitly authorizes local ICU reading and necessary text mechanisms only where native JS is not equivalent; memory/lifetime stays native JS. Parent remains incomplete. No subagents.
