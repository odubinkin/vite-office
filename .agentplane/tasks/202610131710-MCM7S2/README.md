---
id: "202610131710-MCM7S2"
title: "Implement shared formula grammar operations for Calc and ODS"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 12
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-13T17:10:40.158Z"
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
    body: "Start: original shared formula grammar/static masks and FormulaLanguage owner for actual Calc default/storage grammars, portable JS bitops and no compiler/document substitute."
events:
  -
    type: "status"
    at: "2026-10-13T17:10:48.231Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: original shared formula grammar/static masks and FormulaLanguage owner for actual Calc default/storage grammars, portable JS bitops and no compiler/document substitute."
doc_version: 3
doc_updated_at: "2026-10-13T17:28:17.528Z"
doc_updated_by: "CODER"
description: "Task93 completes original shared FormulaGrammar static value/mapping/mask/convention operations and actual FormulaLanguage IDL constants needed by real Calc formula cells/UI and ODF import/export; no substitute parser or model."
sections:
  Summary: "Task93 original shared formula grammar for actual Calc UI/document and ODS dependencies."
  Scope: "Complete original FormulaGrammar static constants/Grammar values, API mapping, support classification, signed32bit language/convention extraction, English-bit updates, grammar merge, ODF1.1/OpenFormula/OOXML/Excel predicates and actual shared offapi FormulaLanguage IDL constants. Preserve original header/core ownership and existing address enum API with static namespace object, original release NDEBUG behavior using native JS bitops without flags/library/parser/memory engine. Existing Writer owners reused, not modified except actual shared grammar owner extension. New core grammar.ts, FormulaLanguage.ts, native helper/state fixture, extend existing shared grammar tests, actual runtime/provenance/capability records and Calc checkpoint/suspected cases. Compile full unchanged original grammar header and grammar.cxx in normal release mode using genuine generated FormulaLanguage/header configurations, no fake peers, network or sanitizer. Actual compiler/document/UI/ODS remain pending. Stop goal after full101 and bounded Calc/shared repairs as requested; Writer-only coverage untouched."
  Plan: "Actual shared FormulaGrammar and FormulaLanguage static values/mapping for Calc UI and ODS, whole original normal release value observations, scoped raw100,16gates/exact review; no parser/document substitute. Goal pauses after full101 and relevant repairs."
  Verify Steps: |-
    1. node scripts/formula-grammar-native-probe.mjs --write then --check compiles full unchanged pinned include/formula/grammar.hxx and formula/source/core/api/grammar.cxx with genuine generated FormulaLanguage and verified configurations; normal release only. Whole constant/API/query/setEnglishBit/merge streams for all original named grammars and initialized packed valid enum values/address conventions match portable tests; no memory/native invalid enum/assertion-process claim.
    2. Source-absence whole npm run test:coverage:calc and complete affected shared grammar/FormulaLanguage owner coverage with all existing grammar tests; raw unmodified S/B/F/L100 every counter positive, four exact source links restored. Static build and actual Calc profile0UI. No Writer-only repairs/full run before scheduled101.
    3. Existing whole16format/lint/type/docs/size/dependency/resources/tooling/tree/provenance/registry/invariants/inventory/routing/doctor/diff gates, original caps/owners preserved and explicit classB assertion boundary. Record failures before correction; no private-state/exclusion/threshold tricks.
    4. Exact current/committed non-task hashes, separate same-agent EVALUATOR (not independent reviewer), canonical DONE and clean git status --short --untracked-files=all on calc. Goal active until scheduled full101/repairs, then explicit user pause. No compiler/document/UI/ODS or whole original QA completion claim.
  Verification: |-
    Command: node scripts/formula-grammar-native-probe.mjs --write and --check
    Result: pass.
    Evidence: full unchanged original grammar.hxx/grammar.cxx, genuine generated FormulaLanguage headers and verified original configuration,9whole source hashes, two normal release commands,13349-byte381-line complete stream.
    Scope:21Grammar values/aliases,7IDL constants, flags, all four API mappings, original static queries/English setters and convention merge histories for initialized enum-domain states. Negative convention-dependent native fields excluded, not fabricated or certified; original JS signed arithmetic retained. No sanitizer/library/parser/ABI/assertion-process claim.

    Command: node output/playwright/task93-checks/portable.mjs
    Result: pass.
    Evidence: whole Calc133tests44files and full affected shared2tests1file, raw every counter positive S/B/F/L100. Calc26owners3623S2412B669F3221L unchanged; shared2executable owners34S36B12F30L. Four original links absent/restored, static/Calc browser profile exit0, still0UI scenarios.
    Scope: actual shared grammar/core/FormulaLanguage and Calc consumers; existing grammar address witness retained. Final post-profile changes only generated JSON formatting/native helper formatting, source-backed module-boundary allowlist and docs/metadata, runtime/test/capture values unchanged. No Writer-only repair.

    Command: node output/playwright/task93-checks/gates.mjs
    Result: pass; all16required terminal gates exit0, final metadata rechecks retained.
    Scope: whole format/lint/type/docs/size/dependencies/resources/tooling/tree/provenance/registry/invariants/inventory/routing/doctor/diff. Final changed provenance JSON passes targeted Prettier after the passed whole formatter scan. Exact commit/current hashes and same-agent separate EVALUATOR required before closure; not independent review.16intentional non-task paths, no unrelated Writer changes, goal active until full101/repairs then user pause.
  Rollback Plan: "Revert only intentional task93 files through followup task; restore all reference links, no merge/history rewrite or unrelated tasks."
  Findings: |-
    Task93 completes original shared FormulaGrammar static value/mapping/query family and actual FormulaLanguage IDL owner required by real Calc grammar defaults, UI and ODS storage. Uses JS signed32bit ops directly, no flags library/parser/alternate model. Existing original address enum witness unchanged. Production NDEBUG semantics omit debug support assert; no invented rejection of unsupported packed merge results. Native invalid enum/ABI/full original QA not certified, original QA anchors remain unexecuted caller context. Compiler/document/storage/editing/input/view/UI/ODS still pending real owners; first-UI/shared-backed-ODS priority retained.

    Initial native observer queried convention-dependent functions on negative grammar, whose original cast computes-259outside AddressConvention enum range. Preliminary capture retained separately but is not acceptance evidence; final genuine original observer explicitly marks excluded native fields, unchanged production definitions. CALC-082 documents source expression and caller-precondition risk without claiming consumer damage; JS original signed arithmetic preserved. Initial helper stale copied error-probe counts corrected to actual byte/line counts before acceptance. Whole formatter found new generated state JSON lacked formatting; native writer now uses existing Prettier formatting, final write/check same value stream. Dependency checker lacked newly instantiated genuine formula->offapi edge; original grammar.hxx includes FormulaLanguage.hpp. Only that source-backed allowlist edge added; cycles enforcement unchanged and dependency check passes52allowed edges. No numeric constant duplication or arbitrary exception. Supporting checker file is one bounded additional path.

    Scoped raw100 and static/Calc profile pass with links restored; whole16gates and exact-source same-agent EVALUATOR required before closure.16intentional non-task paths, existing Writer runtime unchanged, existing shared grammar header extended with genuine new core/IDL owners. No new network, sanitizer, merge, memory management or fake peers. Stop after next scheduled full101 and relevant Calc/shared repairs at user request; Writer-only coverage untouched; unrelated DOING tasks untouched.

    Initial source provenance/registry/invariants and inventory122/123failed on basename-only FormulaLanguage evidence. Actual seven IDL declarations added to local/upstream symbol provenance, strict validation unchanged; same underlying issue, no assertion migration. Final whole format passed, followed by targeted Prettier pass on the only changed JSON record; native/core/test bytes unchanged. Affected metadata gates rerun only, no redundant full application replay.
id_source: "generated"
---
## Summary

Task93 original shared formula grammar for actual Calc UI/document and ODS dependencies.

## Scope

Complete original FormulaGrammar static constants/Grammar values, API mapping, support classification, signed32bit language/convention extraction, English-bit updates, grammar merge, ODF1.1/OpenFormula/OOXML/Excel predicates and actual shared offapi FormulaLanguage IDL constants. Preserve original header/core ownership and existing address enum API with static namespace object, original release NDEBUG behavior using native JS bitops without flags/library/parser/memory engine. Existing Writer owners reused, not modified except actual shared grammar owner extension. New core grammar.ts, FormulaLanguage.ts, native helper/state fixture, extend existing shared grammar tests, actual runtime/provenance/capability records and Calc checkpoint/suspected cases. Compile full unchanged original grammar header and grammar.cxx in normal release mode using genuine generated FormulaLanguage/header configurations, no fake peers, network or sanitizer. Actual compiler/document/UI/ODS remain pending. Stop goal after full101 and bounded Calc/shared repairs as requested; Writer-only coverage untouched.

## Plan

Actual shared FormulaGrammar and FormulaLanguage static values/mapping for Calc UI and ODS, whole original normal release value observations, scoped raw100,16gates/exact review; no parser/document substitute. Goal pauses after full101 and relevant repairs.

## Verify Steps

1. node scripts/formula-grammar-native-probe.mjs --write then --check compiles full unchanged pinned include/formula/grammar.hxx and formula/source/core/api/grammar.cxx with genuine generated FormulaLanguage and verified configurations; normal release only. Whole constant/API/query/setEnglishBit/merge streams for all original named grammars and initialized packed valid enum values/address conventions match portable tests; no memory/native invalid enum/assertion-process claim.
2. Source-absence whole npm run test:coverage:calc and complete affected shared grammar/FormulaLanguage owner coverage with all existing grammar tests; raw unmodified S/B/F/L100 every counter positive, four exact source links restored. Static build and actual Calc profile0UI. No Writer-only repairs/full run before scheduled101.
3. Existing whole16format/lint/type/docs/size/dependency/resources/tooling/tree/provenance/registry/invariants/inventory/routing/doctor/diff gates, original caps/owners preserved and explicit classB assertion boundary. Record failures before correction; no private-state/exclusion/threshold tricks.
4. Exact current/committed non-task hashes, separate same-agent EVALUATOR (not independent reviewer), canonical DONE and clean git status --short --untracked-files=all on calc. Goal active until scheduled full101/repairs, then explicit user pause. No compiler/document/UI/ODS or whole original QA completion claim.

## Verification

Command: node scripts/formula-grammar-native-probe.mjs --write and --check
Result: pass.
Evidence: full unchanged original grammar.hxx/grammar.cxx, genuine generated FormulaLanguage headers and verified original configuration,9whole source hashes, two normal release commands,13349-byte381-line complete stream.
Scope:21Grammar values/aliases,7IDL constants, flags, all four API mappings, original static queries/English setters and convention merge histories for initialized enum-domain states. Negative convention-dependent native fields excluded, not fabricated or certified; original JS signed arithmetic retained. No sanitizer/library/parser/ABI/assertion-process claim.

Command: node output/playwright/task93-checks/portable.mjs
Result: pass.
Evidence: whole Calc133tests44files and full affected shared2tests1file, raw every counter positive S/B/F/L100. Calc26owners3623S2412B669F3221L unchanged; shared2executable owners34S36B12F30L. Four original links absent/restored, static/Calc browser profile exit0, still0UI scenarios.
Scope: actual shared grammar/core/FormulaLanguage and Calc consumers; existing grammar address witness retained. Final post-profile changes only generated JSON formatting/native helper formatting, source-backed module-boundary allowlist and docs/metadata, runtime/test/capture values unchanged. No Writer-only repair.

Command: node output/playwright/task93-checks/gates.mjs
Result: pass; all16required terminal gates exit0, final metadata rechecks retained.
Scope: whole format/lint/type/docs/size/dependencies/resources/tooling/tree/provenance/registry/invariants/inventory/routing/doctor/diff. Final changed provenance JSON passes targeted Prettier after the passed whole formatter scan. Exact commit/current hashes and same-agent separate EVALUATOR required before closure; not independent review.16intentional non-task paths, no unrelated Writer changes, goal active until full101/repairs then user pause.

## Rollback Plan

Revert only intentional task93 files through followup task; restore all reference links, no merge/history rewrite or unrelated tasks.

## Findings

Task93 completes original shared FormulaGrammar static value/mapping/query family and actual FormulaLanguage IDL owner required by real Calc grammar defaults, UI and ODS storage. Uses JS signed32bit ops directly, no flags library/parser/alternate model. Existing original address enum witness unchanged. Production NDEBUG semantics omit debug support assert; no invented rejection of unsupported packed merge results. Native invalid enum/ABI/full original QA not certified, original QA anchors remain unexecuted caller context. Compiler/document/storage/editing/input/view/UI/ODS still pending real owners; first-UI/shared-backed-ODS priority retained.

Initial native observer queried convention-dependent functions on negative grammar, whose original cast computes-259outside AddressConvention enum range. Preliminary capture retained separately but is not acceptance evidence; final genuine original observer explicitly marks excluded native fields, unchanged production definitions. CALC-082 documents source expression and caller-precondition risk without claiming consumer damage; JS original signed arithmetic preserved. Initial helper stale copied error-probe counts corrected to actual byte/line counts before acceptance. Whole formatter found new generated state JSON lacked formatting; native writer now uses existing Prettier formatting, final write/check same value stream. Dependency checker lacked newly instantiated genuine formula->offapi edge; original grammar.hxx includes FormulaLanguage.hpp. Only that source-backed allowlist edge added; cycles enforcement unchanged and dependency check passes52allowed edges. No numeric constant duplication or arbitrary exception. Supporting checker file is one bounded additional path.

Scoped raw100 and static/Calc profile pass with links restored; whole16gates and exact-source same-agent EVALUATOR required before closure.16intentional non-task paths, existing Writer runtime unchanged, existing shared grammar header extended with genuine new core/IDL owners. No new network, sanitizer, merge, memory management or fake peers. Stop after next scheduled full101 and relevant Calc/shared repairs at user request; Writer-only coverage untouched; unrelated DOING tasks untouched.

Initial source provenance/registry/invariants and inventory122/123failed on basename-only FormulaLanguage evidence. Actual seven IDL declarations added to local/upstream symbol provenance, strict validation unchanged; same underlying issue, no assertion migration. Final whole format passed, followed by targeted Prettier pass on the only changed JSON record; native/core/test bytes unchanged. Affected metadata gates rerun only, no redundant full application replay.
