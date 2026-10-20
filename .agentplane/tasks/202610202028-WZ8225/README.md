---
id: "202610202028-WZ8225"
title: "Implement native configuration property values and XML value parsing"
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
  updated_at: "2026-10-20T20:29:23.787Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-20T20:46:56.501Z"
  updated_by: "CODER"
  note: "140 related tests in 18 files and 50 boundary cases pass; 50 parser cases replay after owner-method alignment pass. Build/static/source/registry checks pass. Source/portable scope only; configuration services/UI stay open."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-20T20:47:47.087Z"
  updated_by: "EVALUATOR"
  note: "At e974ffe99982 the approved configuration property/value parsing family is source-shaped and verified over actual shared owners."
  evaluated_sha: "e974ffe99982adace45bc66974d4a8645d047f0e"
  blueprint_digest: "a74ebee1ab3c419a040d16b53cebb7cba30952817f7c5255a19f13a5d349c5cd"
  evidence_refs:
    - ".agentplane/tasks/202610202028-WZ8225/README.md"
    - ".agentplane/tasks/202610202028-WZ8225/quality/20261020-204747087-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610202028-WZ8225/quality/20261020-204747087-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610202028-WZ8225/quality/20261020-204747087-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610202028-WZ8225/blueprint/resolved-snapshot.json"
    - "output/playwright/writer-config-values/tests-final.log"
    - "output/playwright/writer-config-values/tests-owner-final.log"
    - "output/playwright/writer-config-values/tooling-final.log"
    - "output/playwright/writer-config-values/build-final.log"
  findings:
    - "Reviewed ordinary property metadata/clone/lazy external transitions, scalar/list conversions, ValueParser XML states and SAL/o3tl signedness bindings against the pinned source. Existing Any/Sequence/XMLReader are reused; Components is only the original borrowed receiver contract, with no service/default provider substitute."
    - "140 cases across 18 related files pass, including old numeric/XML/configuration fixtures; final ValueParser replay passes 50 cases and exact boundary tooling passes 50 cases. Build, style, source registries, docs and policy checks pass. Dependency changes are only precise original import data, and fidelity statuses remain unverified."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement approved ordinary property and complete XML value parser family using genuine shared values and original byte lexical specializations."
events:
  -
    type: "status"
    at: "2026-10-20T20:29:30.328Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved ordinary property and complete XML value parser family using genuine shared values and original byte lexical specializations."
  -
    type: "verify"
    at: "2026-10-20T20:46:56.501Z"
    author: "CODER"
    state: "ok"
    note: "140 related tests in 18 files and 50 boundary cases pass; 50 parser cases replay after owner-method alignment pass. Build/static/source/registry checks pass. Source/portable scope only; configuration services/UI stay open."
doc_version: 3
doc_updated_at: "2026-10-20T20:46:56.587Z"
doc_updated_by: "CODER"
description: "Unblock original Writer search configuration by porting ordinary PropertyNode and complete ValueParser scalar/list/XML state contracts over actual shared XMLReader, Any and Sequence owners, including required byte integer conversion specializations."
sections:
  Summary: "Implement ordinary configuration PropertyNode and complete XML ValueParser value responsibility family needed for native Writer search options, with real existing Node/Any/Sequence/XMLReader owners."
  Scope: "Only vite-office-writer on writer; up to 45 non-task paths. PropertyNode; full ValueParser scalar/list/XML automaton and source-local conversion split if needed; required SAL byte signed/unsigned64 parsing and o3tl byte numeric overloads; actual namespace constants; focused tests, source/runtime records, precise source-backed dependency data and suspected-issue docs. Borrowed Components external-value receiver is a type-only projection of its real source forward declaration, not an invented production provider. Local OString separator/suffix syntax may be erased to owned byte arrays as existing XMLReader Pad does, preserving copying/termination/lexical contracts; do not invent an OString class or configuration service defaults. No ICU/network reads, global configuration provider/service-manager substitute or browser search UI claim."
  Plan: "1. Inspect pinned PropertyNode/ValueParser, namespace constants and SAL/o3tl byte lexical contracts. 2. Reuse and generalize actual shared numeric template specializations rather than a JS numeric parser. Implement property metadata/value/pointer/copy/external-resolution transitions with the exact borrowed receiver contract. 3. Implement all scalar and list conversions using actual UNO types/Any/Sequence, then full XML text/it/unicode state machine and ordinary/localized value mutation order. 4. Add source-derived lexical, failure/output, clone/lazy-external, XML integration/state and real schema-default value tests. Preserve suspicious upstream quirks and document them. 5. Run targeted checks, exact edge tooling if needed and required static/source registries; record review and commit/finish leaf while leaving service/configuration/UI parent open."
  Verify Steps: "Run new config property/value parser tests and related configmgr tree/type/localized-node tests, XMLReader tests, SAL numeric conversion tests and o3tl numeric/string-view tests. Include scalar/list types, unsigned hexadecimal wrapping, invalid lexical permissiveness, empty/consecutive separators, strict UTF8, nil/modified state, external resolution retry/clear, duplicate localized updates, unicode scalar whitelist and parser error timing. Run build, changed-file Prettier/ESLint, check:dependencies, source-provenance/source-tree/docs/file-size, inventory:parity:writer/shared, doctor, policy routing, diff check and final status. Run boundary tests if precise dependency data changes. Source/portable evidence only, no compiled complete service/ABI/UI parity. Eight completed tasks since full checkpoint 6a7dd8660; this is ninth, full suite is due after the next completed task."
  Verification: |-
    Command: npx vitest run src/configmgr/source/propertynode.test.ts src/configmgr/source/valueparser.test.ts src/sal/rtl/byte-integer.test.ts src/configmgr/source/configuration-tree.test.ts src/configmgr/source/data-tree.test.ts src/configmgr/source/data-paths.test.ts src/configmgr/source/type.test.ts src/configmgr/source/localizednodes.test.ts src/xmlreader/source src/sal/rtl/native-terminated-int64.test.ts src/sal/rtl/strtmpl.math.test.ts src/sal/rtl/math.test.ts src/o3tl/inc/string_view.test.ts src/o3tl/inc/string_view-views.test.ts src/o3tl/inc/string_view-codepoints.test.ts --root apps/office
    Result: pass, 140 tests across 18 files. After retaining convertItems as the original private ValueParser operation, its 50 focused cases pass again (overlapping replay).
    Evidence: output/playwright/writer-config-values/tests-final.log, tests-owner-final.log.
    Scope: source-derived typed scalar/list/state/property/external-receiver histories, real XMLReader and native value owners; unchanged related configuration tree, numeric/string-view and native fixture replay. Schema lexical defaults are fixture literals from pinned Common.xcs, not a defaults provider.

    Command: npx vitest run scripts/native-config-value-boundary.test.ts scripts/check-module-boundaries.test.ts scripts/native-search-boundary.test.ts --environment node
    Result: pass, 50 tests in three files.
    Evidence: output/playwright/writer-config-values/tooling-final.log.
    Scope: exact native XMLReader/Span/Pad and byte numeric import witnesses; neighbor/browser/general module and cycle restrictions remain intact.

    Command: npm run build; changed-file npx prettier --check and npx eslint --max-warnings 0; npm run check:dependencies; npm run check:source-provenance; npm run check:source-tree; npm run check:docs; npm run check:file-size; npm run inventory:parity:writer; npm run inventory:parity:shared; ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check.
    Result: pass after bounded in-scope type/fixture/metadata/dependency data corrections. Build has existing chunk-size warning; doctor has zero errors and pre-existing hook-shim warning. Provenance covers 984 runtime modules, classifications/statuses unchanged.
    Evidence: output/playwright/writer-config-values/check-*.log, build-final.log, format-owner-final.log, lint-owner-final.log, docs-final.log, provenance-final.log, writer-owner-final.log, shared-owner-final.log.
    Scope: authored changes and required complete static/source inventories. Source/portable checks and existing related native captures only: no fresh complete native ValueParser/service compilation, ABI, dangling-pointer or full application/UI certification. This is ninth task completion since 6a7dd8660; next completed task triggers the full run.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-20T20:46:56.501Z — VERIFY — ok

    By: CODER

    Note: 140 related tests in 18 files and 50 boundary cases pass; 50 parser cases replay after owner-method alignment pass. Build/static/source/registry checks pass. Source/portable scope only; configuration services/UI stay open.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-20T20:46:55.672Z, excerpt_hash=sha256:cdbcab58e632466f18af9ec3c09ad46a512dbc9d16e1b5c008f11e530b604ba7

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610202028-WZ8225/blueprint/resolved-snapshot.json
    - old_digest: a74ebee1ab3c419a040d16b53cebb7cba30952817f7c5255a19f13a5d349c5cd
    - current_digest: a74ebee1ab3c419a040d16b53cebb7cba30952817f7c5255a19f13a5d349c5cd
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610202028-WZ8225

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610202028-WZ8225
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this configuration value parsing leaf and its source/test/metadata changes; preserve prior search value refactors and active parent scope."
  Findings: |-
    Implemented the ordinary PropertyNode state/value/clone/metadata family, borrowed Components external receiver contract and retry/clear/type-permissive external transitions. No Components service implementation/provider/default state is fabricated. Actual Any and OUString owners are reused. The external Optional<Any> return field is an owning original temporary; its actual Any lifetime ends after copying/resolving it.

    Implemented complete ValueParser scalar/list conversions and text/it/unicode state machine on real XMLReader/Span/Pad, configuration nodes, Any and Sequence. Metadata/user-modification updates and localized child insertion occur before lexical parsing; failures preserve original old values and partial metadata. Explicit byte separator copying retains OString lexical semantics, as local syntax erasure rather than a replacement OString class. Anonymous conversion helpers and private convertItems responsibility remain together in the original valueparser.ts path (initial optional helper shard was merged before commit). ParseManager file contains only the original namespace enum constants, with no orchestration stub. SAL byte C conversion functions and o3tl overloads reuse the same native template body and explicit integral signedness, not another JS parser.

    WRITER-020 records permissive numeric lexical success/zero and hexadecimal signed conversion, including invalid unicode scalar text becoming NUL. WRITER-021 records source Pad.add borrowing a block-local control byte; preserve add rather than substitute addEphemeral, while realm GC retains the byte array and no undefined native memory/lifetime outcome is certified.

    Bounded initial corrections: unsigned DivMod parameter annotation and RuntimeException empty Context binding; erase native getTextMode fallthrough into an equivalent common predicate rather than change compiler enforcement. Correct new test's NBSP expectation to native non-whitespace zero and its NUL escape spelling. Bind Any string extraction to the actual OUString owner/borrowed writable sequence-element view instead of passing a pointer cell to its concrete optimized overload. Existing core Any/Sequence behavior was unchanged. Header runtime metadata claims declarations rather than functions merely re-exported there; corrected only its local symbol list. Added only precise source-backed XML-value imports and SAL/o3tl named-import data; existing forbidden edges and cycle algorithm remain unchanged and tested. All failed checks pass after these in-scope repairs.

    Eight earlier completions since full 6a7dd8660, so this is ninth; full run follows the next completion. Authorized local LibreOffice source reads suffice; no ICU/network or other outside-repository access was used. XCS/XCU parser orchestration, configuration services, actual search item/default integration, advanced search backend and browser UI remain open under the parent. Changes stay on writer in vite-office-writer; no merge/publication or policy changes.
id_source: "generated"
---
## Summary

Implement ordinary configuration PropertyNode and complete XML ValueParser value responsibility family needed for native Writer search options, with real existing Node/Any/Sequence/XMLReader owners.

## Scope

Only vite-office-writer on writer; up to 45 non-task paths. PropertyNode; full ValueParser scalar/list/XML automaton and source-local conversion split if needed; required SAL byte signed/unsigned64 parsing and o3tl byte numeric overloads; actual namespace constants; focused tests, source/runtime records, precise source-backed dependency data and suspected-issue docs. Borrowed Components external-value receiver is a type-only projection of its real source forward declaration, not an invented production provider. Local OString separator/suffix syntax may be erased to owned byte arrays as existing XMLReader Pad does, preserving copying/termination/lexical contracts; do not invent an OString class or configuration service defaults. No ICU/network reads, global configuration provider/service-manager substitute or browser search UI claim.

## Plan

1. Inspect pinned PropertyNode/ValueParser, namespace constants and SAL/o3tl byte lexical contracts. 2. Reuse and generalize actual shared numeric template specializations rather than a JS numeric parser. Implement property metadata/value/pointer/copy/external-resolution transitions with the exact borrowed receiver contract. 3. Implement all scalar and list conversions using actual UNO types/Any/Sequence, then full XML text/it/unicode state machine and ordinary/localized value mutation order. 4. Add source-derived lexical, failure/output, clone/lazy-external, XML integration/state and real schema-default value tests. Preserve suspicious upstream quirks and document them. 5. Run targeted checks, exact edge tooling if needed and required static/source registries; record review and commit/finish leaf while leaving service/configuration/UI parent open.

## Verify Steps

Run new config property/value parser tests and related configmgr tree/type/localized-node tests, XMLReader tests, SAL numeric conversion tests and o3tl numeric/string-view tests. Include scalar/list types, unsigned hexadecimal wrapping, invalid lexical permissiveness, empty/consecutive separators, strict UTF8, nil/modified state, external resolution retry/clear, duplicate localized updates, unicode scalar whitelist and parser error timing. Run build, changed-file Prettier/ESLint, check:dependencies, source-provenance/source-tree/docs/file-size, inventory:parity:writer/shared, doctor, policy routing, diff check and final status. Run boundary tests if precise dependency data changes. Source/portable evidence only, no compiled complete service/ABI/UI parity. Eight completed tasks since full checkpoint 6a7dd8660; this is ninth, full suite is due after the next completed task.

## Verification

Command: npx vitest run src/configmgr/source/propertynode.test.ts src/configmgr/source/valueparser.test.ts src/sal/rtl/byte-integer.test.ts src/configmgr/source/configuration-tree.test.ts src/configmgr/source/data-tree.test.ts src/configmgr/source/data-paths.test.ts src/configmgr/source/type.test.ts src/configmgr/source/localizednodes.test.ts src/xmlreader/source src/sal/rtl/native-terminated-int64.test.ts src/sal/rtl/strtmpl.math.test.ts src/sal/rtl/math.test.ts src/o3tl/inc/string_view.test.ts src/o3tl/inc/string_view-views.test.ts src/o3tl/inc/string_view-codepoints.test.ts --root apps/office
Result: pass, 140 tests across 18 files. After retaining convertItems as the original private ValueParser operation, its 50 focused cases pass again (overlapping replay).
Evidence: output/playwright/writer-config-values/tests-final.log, tests-owner-final.log.
Scope: source-derived typed scalar/list/state/property/external-receiver histories, real XMLReader and native value owners; unchanged related configuration tree, numeric/string-view and native fixture replay. Schema lexical defaults are fixture literals from pinned Common.xcs, not a defaults provider.

Command: npx vitest run scripts/native-config-value-boundary.test.ts scripts/check-module-boundaries.test.ts scripts/native-search-boundary.test.ts --environment node
Result: pass, 50 tests in three files.
Evidence: output/playwright/writer-config-values/tooling-final.log.
Scope: exact native XMLReader/Span/Pad and byte numeric import witnesses; neighbor/browser/general module and cycle restrictions remain intact.

Command: npm run build; changed-file npx prettier --check and npx eslint --max-warnings 0; npm run check:dependencies; npm run check:source-provenance; npm run check:source-tree; npm run check:docs; npm run check:file-size; npm run inventory:parity:writer; npm run inventory:parity:shared; ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check.
Result: pass after bounded in-scope type/fixture/metadata/dependency data corrections. Build has existing chunk-size warning; doctor has zero errors and pre-existing hook-shim warning. Provenance covers 984 runtime modules, classifications/statuses unchanged.
Evidence: output/playwright/writer-config-values/check-*.log, build-final.log, format-owner-final.log, lint-owner-final.log, docs-final.log, provenance-final.log, writer-owner-final.log, shared-owner-final.log.
Scope: authored changes and required complete static/source inventories. Source/portable checks and existing related native captures only: no fresh complete native ValueParser/service compilation, ABI, dangling-pointer or full application/UI certification. This is ninth task completion since 6a7dd8660; next completed task triggers the full run.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-20T20:46:56.501Z — VERIFY — ok

By: CODER

Note: 140 related tests in 18 files and 50 boundary cases pass; 50 parser cases replay after owner-method alignment pass. Build/static/source/registry checks pass. Source/portable scope only; configuration services/UI stay open.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-20T20:46:55.672Z, excerpt_hash=sha256:cdbcab58e632466f18af9ec3c09ad46a512dbc9d16e1b5c008f11e530b604ba7

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610202028-WZ8225/blueprint/resolved-snapshot.json
- old_digest: a74ebee1ab3c419a040d16b53cebb7cba30952817f7c5255a19f13a5d349c5cd
- current_digest: a74ebee1ab3c419a040d16b53cebb7cba30952817f7c5255a19f13a5d349c5cd
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610202028-WZ8225

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610202028-WZ8225
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this configuration value parsing leaf and its source/test/metadata changes; preserve prior search value refactors and active parent scope.

## Findings

Implemented the ordinary PropertyNode state/value/clone/metadata family, borrowed Components external receiver contract and retry/clear/type-permissive external transitions. No Components service implementation/provider/default state is fabricated. Actual Any and OUString owners are reused. The external Optional<Any> return field is an owning original temporary; its actual Any lifetime ends after copying/resolving it.

Implemented complete ValueParser scalar/list conversions and text/it/unicode state machine on real XMLReader/Span/Pad, configuration nodes, Any and Sequence. Metadata/user-modification updates and localized child insertion occur before lexical parsing; failures preserve original old values and partial metadata. Explicit byte separator copying retains OString lexical semantics, as local syntax erasure rather than a replacement OString class. Anonymous conversion helpers and private convertItems responsibility remain together in the original valueparser.ts path (initial optional helper shard was merged before commit). ParseManager file contains only the original namespace enum constants, with no orchestration stub. SAL byte C conversion functions and o3tl overloads reuse the same native template body and explicit integral signedness, not another JS parser.

WRITER-020 records permissive numeric lexical success/zero and hexadecimal signed conversion, including invalid unicode scalar text becoming NUL. WRITER-021 records source Pad.add borrowing a block-local control byte; preserve add rather than substitute addEphemeral, while realm GC retains the byte array and no undefined native memory/lifetime outcome is certified.

Bounded initial corrections: unsigned DivMod parameter annotation and RuntimeException empty Context binding; erase native getTextMode fallthrough into an equivalent common predicate rather than change compiler enforcement. Correct new test's NBSP expectation to native non-whitespace zero and its NUL escape spelling. Bind Any string extraction to the actual OUString owner/borrowed writable sequence-element view instead of passing a pointer cell to its concrete optimized overload. Existing core Any/Sequence behavior was unchanged. Header runtime metadata claims declarations rather than functions merely re-exported there; corrected only its local symbol list. Added only precise source-backed XML-value imports and SAL/o3tl named-import data; existing forbidden edges and cycle algorithm remain unchanged and tested. All failed checks pass after these in-scope repairs.

Eight earlier completions since full 6a7dd8660, so this is ninth; full run follows the next completion. Authorized local LibreOffice source reads suffice; no ICU/network or other outside-repository access was used. XCS/XCU parser orchestration, configuration services, actual search item/default integration, advanced search backend and browser UI remain open under the parent. Changes stay on writer in vite-office-writer; no merge/publication or policy changes.
