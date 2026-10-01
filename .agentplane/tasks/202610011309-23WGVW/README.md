---
id: "202610011309-23WGVW"
title: "Restore native Writer numbering classification and layout-update predicates"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 14
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-01T13:12:36.448Z"
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
    body: "Start: implement the approved single iteration45 native Writer classification/raw-layout predicate task under the persistent user goal authorization; preserve registered I/O/recovery deviations and unchanged source/coverage gates."
events:
  -
    type: "status"
    at: "2026-10-01T13:12:36.882Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the approved single iteration45 native Writer classification/raw-layout predicate task under the persistent user goal authorization; preserve registered I/O/recovery deviations and unchanged source/coverage gates."
doc_version: 3
doc_updated_at: "2026-10-01T13:28:42.710Z"
doc_updated_by: "CODER"
description: "Iteration45 of the active parity audit: restore source-owned SwNumFormat.IsItemize/IsEnumeration and actual SwTextNode HasNumber/HasBullet reads, including NONE enumeration and scalar bitmap classification. Restore the distinct raw-owned HasNumberingWhichNeedsLayoutUpdate contract, without equating it to enumeration. Validate actual SwNodeNum counting and DocumentListItemsManager filtering against complete unchanged pinned native bodies and real local graphs. Preserve existing UI/ODT/Worker contracts, registered I/O/recovery deviations and the native malformed-NONE browser guard; broader bitmap graphics/layout/redline/native lifetimes remain unverified."
sections:
  Summary: "Iteration45 restores native Writer numbering classification and the distinct layout-update predicate for the existing implementation. Previous iteration44 is verified progress (CODE2827ce1e51f6954632f121a382fd22f0cf8a40cd, clean preflight main78353b0aebea3f9bb56dfcdba270210c07960411). Native NONE is enumeration; current HasNumber incorrectly accepts only ARABIC. The layout-update helper also wrongly uses effective Get rather than optional owned GetNumFormat. The parent and unlimited goal remain active."
  Scope: "Owner CODER, direct current checkout. Implementation: sw/source/core/doc/number.ts, sw/source/core/txtnode/ndtxt.ts, sw/source/core/txtnode/ndtxt-attribute-handlers.ts. Add one focused classification/integration test and literal pinned native JSON fixture; update only relevant source-provenance/runtime-inventory evidence, with existing test corrections only if unchanged pinned source proves their expectations wrong. Preserve source-owned IsItemize (CHAR_SPECIAL/BITMAP) and IsEnumeration (!IsItemize); use effective bounded format for HasNumber/HasBullet, optional owned format for HasNumberingWhichNeedsLayoutUpdate with NONE/CHAR_SPECIAL/BITMAP suppressed. Prove actual SwNodeNum.IsCountedForNumbering and DocumentListItemsManager.getNumItems dependent paths. Scalar bitmap classification is represented; bitmap graphics/UI/ODT rendering, additional formatter families, native full layout/redline variants and font/style/service/global lifetimes remain unverified. No new bitmap feature, network/outside-repo access, subagents, policy/dependency/coverage changes or registered save/open/recovery changes. Preserve iteration43 native malformed-NONE browser guard. All source files stay below unchanged1000-line limit."
  Plan: |-
    1. ORCHESTRATOR read-only preflight/source inspection under the persistent user goal approval; PLANNER creates this single executable CODER leaf and complete acceptance docs.
    2. Capture fresh local classification/raw-format behavior; extract complete unchanged pinned predicate, bound-level, node, counting and registry bodies with exact constants and named platform/null-layout/record adapters. Reuse verified native source-shaped rule getters/defaults where useful and record exact source hashes. Compare absent record, record without rule, shared versus owned levels, varying actual/attribute levels, copies/type changes, counted/uncounted/phantom/root and registry profiles.
    3. Restore native SwNumFormat predicates, refactor the existing text-node read helper to return the effective const format, and restore the separate raw-owned layout-update predicate. Add differential actual-graph regression tests including sparse levels, NONE enumeration, actual tree counting/registry filtering, Worker transfer and original UI/ODT expectations. Record native unsupported-layout and bitmap-rendering boundaries; no whole-module promotion.
    4. Run focused red/green comparisons and full original npm run verify, doctor, routing and diff checks. Persist failures and apply routine in-scope fixes without changing verification criteria. Commit reviewed actual CODE, canonical verification and separate EVALUATOR quality-role phase; close only this leaf cleanly and append parent progress. Keep goal active until full requirement audit passes.
  Verify Steps: |-
    1. Fresh actual baseline and literal native differential results prove complete unchanged pinned SwNumFormat.IsEnumeration/IsItemize, SwTextNode.HasNumber/HasBullet, lcl_BoundListLevel, HasNumberingWhichNeedsLayoutUpdate, SwNodeNum.IsCountedForNumbering and DocumentListItemsManager.getNumItems responsibilities under ASan/UBSan. Source hashes and pinned numeric4/5/6/8 constants are exact; platform/null-layout/record/font/rule adapters and unverified full native layout/redline/graphics/service lifetimes are explicit.
    2. Match default/copy/type-change predicates, absent record/rule, real attached nodes, bounded actual levels, attribute versus actual level selection, raw-owned versus effective/shared formats, NONE enumeration but no layout-update, scalar bitmap itemize but no rendering claim, counted/uncounted/root/phantom and registry inclusion. Differential fixture uses actual native emitted results, not generated JS expectations. Exercise dependent real SwNodeNum and DocumentListItemsManager paths and Worker16 transfer. Preserve original native40 base/19 ownership/16 valid NONE/165 standalone states, actual UNO copied-field regression and genuine browser/ODT/restart assertions.
    3. Run focused red/green tests then unchanged full npm run verify with original100% thresholds in both suites; format/lint/type/dependency/resource/unit/inventory/browser/build/static/JSDoc/file-size/source-tree/provenance/invariant/parity gates pass. Run ap doctor, node .agentplane/policy/check-routing.mjs and git diff --check. No coverage exclusions or gate weakening.
    4. Record actual CODE SHA separately from artifact/quality/close commits, canonical verification, separate EVALUATOR quality phase and clean final tracked/untracked state. Close only this leaf; parent/full goal remain active with the next measured mismatch recorded.
  Verification: "Pending: no implementation or completed verification is claimed. All acceptance checks must be run and source/profile limits documented before closure."
  Rollback Plan: "If this task needs rollback, create a new executable follow-up task to revert its reviewed CODE changes locally and rerun the same verification; do not rewrite history or mutate immutable DONE tasks. Preserve native differential sources/outputs and failure evidence, and retain the parent/full objective and registered I/O exceptions."
  Findings: |-
    Read-only preflight confirms direct main78353b0aebea, clean tracked/untracked state, only parent202609240501-C9TN6M active, approvals required and no network authorization. Four matched policy modules are loaded; no user-instructions file exists. Native IsEnumeration is explicitly !IsItemize, so NUMBER_NONE is enumeration. Native SwNodeNum counting uses HasNumber||HasBullet and numbered registry filtering uses HasNumber. Native layout-update helper instead reads GetNumFormat, rejects absent owned format and suppresses NONE/CHAR_SPECIAL/BITMAP; its semantics must not be conflated with enumeration. Existing local helper uses effective Get and only ARABIC. Prior measured native4/5/6/8 classifications are [[4,true,false],[5,true,false],[6,false,true],[8,false,true]] versus actual local [[4,true,false],[5,false,false],[6,false,true],[8,false,false]]. No full project or module equivalence is claimed.

    - Observation: Fresh baseline reproduces NONE classification/counting/registry loss and sparse effective-format repaint mismatch. Native ASan/UBSan harness emits1032 cases (4 format,1008 node,4 root,16 registry) without diagnostics. Initial regression-before confirms missing native predicates and raw-layout mismatch; its registry fixture also applies a default-counted list after setting the counted input, overwriting that supplied input.
      Impact: Implementation errors are measured, but the fixture must supply counted policy after list assembly so native/local profile inputs match.
      Resolution: Preserve regression-before.log. Correct only fixture counted-input timing; restore source-owned native format predicates/effective const read and distinct raw-owned layout helper. Keep original expected native output and all existing tests/gates.

    - Observation: Focused22 tests pass; initial typecheck rejects test-only PolicyRoot phantom field colliding with inherited private state.
      Impact: The diagnostic adapter must remain type-safe without weakening production contracts.
      Resolution: Rename the adapter field to profilePhantom; retain the initial failure log and rerun typecheck in the full canonical suite.

    - Observation: Initial full verify passes formatting but rejects five forbidden test-only non-null assertions.
      Impact: The regression fixture must comply with the unchanged strict lint gate.
      Resolution: Use an explicit required-member guard that fails on a missing real graph owner/record; rerun the full suite without changing lint or coverage criteria.
id_source: "generated"
---
## Summary

Iteration45 restores native Writer numbering classification and the distinct layout-update predicate for the existing implementation. Previous iteration44 is verified progress (CODE2827ce1e51f6954632f121a382fd22f0cf8a40cd, clean preflight main78353b0aebea3f9bb56dfcdba270210c07960411). Native NONE is enumeration; current HasNumber incorrectly accepts only ARABIC. The layout-update helper also wrongly uses effective Get rather than optional owned GetNumFormat. The parent and unlimited goal remain active.

## Scope

Owner CODER, direct current checkout. Implementation: sw/source/core/doc/number.ts, sw/source/core/txtnode/ndtxt.ts, sw/source/core/txtnode/ndtxt-attribute-handlers.ts. Add one focused classification/integration test and literal pinned native JSON fixture; update only relevant source-provenance/runtime-inventory evidence, with existing test corrections only if unchanged pinned source proves their expectations wrong. Preserve source-owned IsItemize (CHAR_SPECIAL/BITMAP) and IsEnumeration (!IsItemize); use effective bounded format for HasNumber/HasBullet, optional owned format for HasNumberingWhichNeedsLayoutUpdate with NONE/CHAR_SPECIAL/BITMAP suppressed. Prove actual SwNodeNum.IsCountedForNumbering and DocumentListItemsManager.getNumItems dependent paths. Scalar bitmap classification is represented; bitmap graphics/UI/ODT rendering, additional formatter families, native full layout/redline variants and font/style/service/global lifetimes remain unverified. No new bitmap feature, network/outside-repo access, subagents, policy/dependency/coverage changes or registered save/open/recovery changes. Preserve iteration43 native malformed-NONE browser guard. All source files stay below unchanged1000-line limit.

## Plan

1. ORCHESTRATOR read-only preflight/source inspection under the persistent user goal approval; PLANNER creates this single executable CODER leaf and complete acceptance docs.
2. Capture fresh local classification/raw-format behavior; extract complete unchanged pinned predicate, bound-level, node, counting and registry bodies with exact constants and named platform/null-layout/record adapters. Reuse verified native source-shaped rule getters/defaults where useful and record exact source hashes. Compare absent record, record without rule, shared versus owned levels, varying actual/attribute levels, copies/type changes, counted/uncounted/phantom/root and registry profiles.
3. Restore native SwNumFormat predicates, refactor the existing text-node read helper to return the effective const format, and restore the separate raw-owned layout-update predicate. Add differential actual-graph regression tests including sparse levels, NONE enumeration, actual tree counting/registry filtering, Worker transfer and original UI/ODT expectations. Record native unsupported-layout and bitmap-rendering boundaries; no whole-module promotion.
4. Run focused red/green comparisons and full original npm run verify, doctor, routing and diff checks. Persist failures and apply routine in-scope fixes without changing verification criteria. Commit reviewed actual CODE, canonical verification and separate EVALUATOR quality-role phase; close only this leaf cleanly and append parent progress. Keep goal active until full requirement audit passes.

## Verify Steps

1. Fresh actual baseline and literal native differential results prove complete unchanged pinned SwNumFormat.IsEnumeration/IsItemize, SwTextNode.HasNumber/HasBullet, lcl_BoundListLevel, HasNumberingWhichNeedsLayoutUpdate, SwNodeNum.IsCountedForNumbering and DocumentListItemsManager.getNumItems responsibilities under ASan/UBSan. Source hashes and pinned numeric4/5/6/8 constants are exact; platform/null-layout/record/font/rule adapters and unverified full native layout/redline/graphics/service lifetimes are explicit.
2. Match default/copy/type-change predicates, absent record/rule, real attached nodes, bounded actual levels, attribute versus actual level selection, raw-owned versus effective/shared formats, NONE enumeration but no layout-update, scalar bitmap itemize but no rendering claim, counted/uncounted/root/phantom and registry inclusion. Differential fixture uses actual native emitted results, not generated JS expectations. Exercise dependent real SwNodeNum and DocumentListItemsManager paths and Worker16 transfer. Preserve original native40 base/19 ownership/16 valid NONE/165 standalone states, actual UNO copied-field regression and genuine browser/ODT/restart assertions.
3. Run focused red/green tests then unchanged full npm run verify with original100% thresholds in both suites; format/lint/type/dependency/resource/unit/inventory/browser/build/static/JSDoc/file-size/source-tree/provenance/invariant/parity gates pass. Run ap doctor, node .agentplane/policy/check-routing.mjs and git diff --check. No coverage exclusions or gate weakening.
4. Record actual CODE SHA separately from artifact/quality/close commits, canonical verification, separate EVALUATOR quality phase and clean final tracked/untracked state. Close only this leaf; parent/full goal remain active with the next measured mismatch recorded.

## Verification

Pending: no implementation or completed verification is claimed. All acceptance checks must be run and source/profile limits documented before closure.

## Rollback Plan

If this task needs rollback, create a new executable follow-up task to revert its reviewed CODE changes locally and rerun the same verification; do not rewrite history or mutate immutable DONE tasks. Preserve native differential sources/outputs and failure evidence, and retain the parent/full objective and registered I/O exceptions.

## Findings

Read-only preflight confirms direct main78353b0aebea, clean tracked/untracked state, only parent202609240501-C9TN6M active, approvals required and no network authorization. Four matched policy modules are loaded; no user-instructions file exists. Native IsEnumeration is explicitly !IsItemize, so NUMBER_NONE is enumeration. Native SwNodeNum counting uses HasNumber||HasBullet and numbered registry filtering uses HasNumber. Native layout-update helper instead reads GetNumFormat, rejects absent owned format and suppresses NONE/CHAR_SPECIAL/BITMAP; its semantics must not be conflated with enumeration. Existing local helper uses effective Get and only ARABIC. Prior measured native4/5/6/8 classifications are [[4,true,false],[5,true,false],[6,false,true],[8,false,true]] versus actual local [[4,true,false],[5,false,false],[6,false,true],[8,false,false]]. No full project or module equivalence is claimed.

- Observation: Fresh baseline reproduces NONE classification/counting/registry loss and sparse effective-format repaint mismatch. Native ASan/UBSan harness emits1032 cases (4 format,1008 node,4 root,16 registry) without diagnostics. Initial regression-before confirms missing native predicates and raw-layout mismatch; its registry fixture also applies a default-counted list after setting the counted input, overwriting that supplied input.
  Impact: Implementation errors are measured, but the fixture must supply counted policy after list assembly so native/local profile inputs match.
  Resolution: Preserve regression-before.log. Correct only fixture counted-input timing; restore source-owned native format predicates/effective const read and distinct raw-owned layout helper. Keep original expected native output and all existing tests/gates.

- Observation: Focused22 tests pass; initial typecheck rejects test-only PolicyRoot phantom field colliding with inherited private state.
  Impact: The diagnostic adapter must remain type-safe without weakening production contracts.
  Resolution: Rename the adapter field to profilePhantom; retain the initial failure log and rerun typecheck in the full canonical suite.

- Observation: Initial full verify passes formatting but rejects five forbidden test-only non-null assertions.
  Impact: The regression fixture must comply with the unchanged strict lint gate.
  Resolution: Use an explicit required-member guard that fails on a missing real graph owner/record; rerun the full suite without changing lint or coverage criteria.
