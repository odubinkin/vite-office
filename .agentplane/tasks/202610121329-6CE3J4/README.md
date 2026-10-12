---
id: "202610121329-6CE3J4"
title: "Implement shared formula opcode and parameter contracts"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
  - "shared"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-12T13:30:04.496Z"
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
    body: "Start: Implement genuine shared opcode/parameter header contracts required by original formula tokens, following approved source-shaped boundaries and scoped raw100 checks."
events:
  -
    type: "status"
    at: "2026-10-12T13:30:06.383Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement genuine shared opcode/parameter header contracts required by original formula tokens, following approved source-shaped boundaries and scoped raw100 checks."
doc_version: 3
doc_updated_at: "2026-10-12T13:30:06.383Z"
doc_updated_by: "CODER"
description: "Task74: Complete original OpCode enum/diagnostic helper and ParamClass enum required by genuine FormulaToken; original numeric aliases/range sentinels/defaults and release unknown diagnostic behavior. Reuse formula shared namespace, no token/cell/document placeholders. Exact normal-only whole-header native evidence, full Calc and whole affected shared raw100, source-absent build/Calc profile, inventory/provenance and local gates. Header enum declaration shard only if authored file budget requires it; map explicit filename divergence. Work only calc; next full81."
sections:
  Summary: |-
    Implement shared formula opcode and parameter contracts

    Task74: Complete original OpCode enum/diagnostic helper and ParamClass enum required by genuine FormulaToken; original numeric aliases/range sentinels/defaults and release unknown diagnostic behavior. Reuse formula shared namespace, no token/cell/document placeholders. Exact normal-only whole-header native evidence, full Calc and whole affected shared raw100, source-absent build/Calc profile, inventory/provenance and local gates. Header enum declaration shard only if authored file budget requires it; map explicit filename divergence. Work only calc; next full81.
  Scope: "Complete original include/formula/opcode.hxx and include/formula/paramclass.hxx. Shared apps/office/src/formula/inc/opcode.ts, enum-only opcode.enum.ts if physical line budget requires, paramclass.ts; complete tests/native fixture and scripts/formula-opcode-native-probe.mjs. Exact shared capability/runtime/provenance records and docs/program/calc-core.md. Explicit release diagnostic profile: original debug assert is not silently claimed as browser process termination; compare original debug assertion with a normal caller if needed and preserve unexpected confirmed cases in Calc journal. No synthetic token/cell/document owner, no SAL library/Writer/runtime duplicate, no thresholds/test profiles/timeouts/cycle gate changes. Task docs and ignored local evidence, branch calc only."
  Plan: "1. Implement complete original OpCode declarations and diagnostic switch plus ParamClass at shared formula/inc boundaries, using a source-mapped enum-only shard if file limit requires it and no dependency cycle. 2. Compile whole genuine pinned headers normal-only and compare every named enum/range alias and all65536 UInt16 diagnostics in release; record native debug assertion separately where relevant without sanitizers or false parity. 3. Register exact capability/runtime/provenance for each real owner and docs with all broad parity flags unverified. 4. Full Calc and complete directly affected formula shared owner raw100/source-absent tests plus build/Calc browser profile; scoped tooling and all local gates, exact same-agent EVALUATOR/verify/clean closure. No Writer repairs; next full81."
  Verify Steps: "1. node scripts/formula-opcode-native-probe.mjs --write then --check: whole pinned OpCode/ParamClass headers and all native actual header/config hashes; normal-only release capture named enum/alias stream and every65536 UInt16 helper output. Debug assertion distinction recorded without sanitizer or fabricated fallback. 2. node output/playwright/task74-checks/portable.mjs: full Calc and entire affected formula shared owners/tests, raw S/B/F/L100 with every raw S/F/B counter positive, all original source links absent and restored. Static/build and actual Calc browser profile pass, report real0scenarios if no UI. 3. node output/playwright/task74-checks/gates.mjs: actual format/lint/type/docs/size/dependencies/resources/tree/provenance/registry/routing/doctor/diff and complete directly related tooling suites pass; no threshold/profile weakening. 4. Native/source/coverage/current-commit hash audit; explicit declaration shard maps only original enum under file budget and has no cycle/new engine. Exact source-bound same-agent separate EVALUATOR, ap verify and clean DONE. Full formula/token/cell/document/input/UI/native debug termination/ABI limits remain explicit; next full81."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only task74 implementation and traceability commits; restore exact original3source symlinks after any portable check. Preserve native/first failure evidence and unrelated active tasks/user-owned merges. Recheck scoped owners after rollback."
  Findings: "Previous turn is concrete progress: task73 DONE8d809aac040d, actual FormulaResultValue and shared reuse verified, clean calc. Original formula/token.hxx directly needs opcode.hxx/paramclass.hxx; these shared owners are absent. Original opcode.hxx has1078lines before TS formatting; source-mapped enum declaration shard is approved only to retain exact complete responsibility within authored1000line limit, without runtime import cycle. Original helper default asserts(false) then returns???; unreachable numeric tail is not substituted as a plausible fallback. Release behavior and debug termination are distinct observation scopes, no browser debug termination parity claim. Existing actual formula error owner remains reused. Goal authorizes current safe local core work; no network required; last full71,next full81."
id_source: "generated"
---
## Summary

Implement shared formula opcode and parameter contracts

Task74: Complete original OpCode enum/diagnostic helper and ParamClass enum required by genuine FormulaToken; original numeric aliases/range sentinels/defaults and release unknown diagnostic behavior. Reuse formula shared namespace, no token/cell/document placeholders. Exact normal-only whole-header native evidence, full Calc and whole affected shared raw100, source-absent build/Calc profile, inventory/provenance and local gates. Header enum declaration shard only if authored file budget requires it; map explicit filename divergence. Work only calc; next full81.

## Scope

Complete original include/formula/opcode.hxx and include/formula/paramclass.hxx. Shared apps/office/src/formula/inc/opcode.ts, enum-only opcode.enum.ts if physical line budget requires, paramclass.ts; complete tests/native fixture and scripts/formula-opcode-native-probe.mjs. Exact shared capability/runtime/provenance records and docs/program/calc-core.md. Explicit release diagnostic profile: original debug assert is not silently claimed as browser process termination; compare original debug assertion with a normal caller if needed and preserve unexpected confirmed cases in Calc journal. No synthetic token/cell/document owner, no SAL library/Writer/runtime duplicate, no thresholds/test profiles/timeouts/cycle gate changes. Task docs and ignored local evidence, branch calc only.

## Plan

1. Implement complete original OpCode declarations and diagnostic switch plus ParamClass at shared formula/inc boundaries, using a source-mapped enum-only shard if file limit requires it and no dependency cycle. 2. Compile whole genuine pinned headers normal-only and compare every named enum/range alias and all65536 UInt16 diagnostics in release; record native debug assertion separately where relevant without sanitizers or false parity. 3. Register exact capability/runtime/provenance for each real owner and docs with all broad parity flags unverified. 4. Full Calc and complete directly affected formula shared owner raw100/source-absent tests plus build/Calc browser profile; scoped tooling and all local gates, exact same-agent EVALUATOR/verify/clean closure. No Writer repairs; next full81.

## Verify Steps

1. node scripts/formula-opcode-native-probe.mjs --write then --check: whole pinned OpCode/ParamClass headers and all native actual header/config hashes; normal-only release capture named enum/alias stream and every65536 UInt16 helper output. Debug assertion distinction recorded without sanitizer or fabricated fallback. 2. node output/playwright/task74-checks/portable.mjs: full Calc and entire affected formula shared owners/tests, raw S/B/F/L100 with every raw S/F/B counter positive, all original source links absent and restored. Static/build and actual Calc browser profile pass, report real0scenarios if no UI. 3. node output/playwright/task74-checks/gates.mjs: actual format/lint/type/docs/size/dependencies/resources/tree/provenance/registry/routing/doctor/diff and complete directly related tooling suites pass; no threshold/profile weakening. 4. Native/source/coverage/current-commit hash audit; explicit declaration shard maps only original enum under file budget and has no cycle/new engine. Exact source-bound same-agent separate EVALUATOR, ap verify and clean DONE. Full formula/token/cell/document/input/UI/native debug termination/ABI limits remain explicit; next full81.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only task74 implementation and traceability commits; restore exact original3source symlinks after any portable check. Preserve native/first failure evidence and unrelated active tasks/user-owned merges. Recheck scoped owners after rollback.

## Findings

Previous turn is concrete progress: task73 DONE8d809aac040d, actual FormulaResultValue and shared reuse verified, clean calc. Original formula/token.hxx directly needs opcode.hxx/paramclass.hxx; these shared owners are absent. Original opcode.hxx has1078lines before TS formatting; source-mapped enum declaration shard is approved only to retain exact complete responsibility within authored1000line limit, without runtime import cycle. Original helper default asserts(false) then returns???; unreachable numeric tail is not substituted as a plausible fallback. Release behavior and debug termination are distinct observation scopes, no browser debug termination parity claim. Existing actual formula error owner remains reused. Goal authorizes current safe local core work; no network required; last full71,next full81.
