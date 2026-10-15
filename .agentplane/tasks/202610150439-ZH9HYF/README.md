---
id: "202610150439-ZH9HYF"
title: "Implement canonical shared XML namespace map for ODF attributes"
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
  updated_at: "2026-10-15T04:41:00.390Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-15T04:56:38.917Z"
  updated_by: "CODER"
  note: "Namespace map verified:36unique related/5files (28main+8actual SAX fallback),182Calc/72files,38boundaries;2shared raw S282B144F36L246 and33Calc S4172B2731F821L3720 everycounterpositive100.92IDs/4sentinels/15token results source-audited. Portable build/13gates/639records zero violations,14paths/3836hashes/8pins/four links. CALC-121-123 preserved, no native container/memory engine. Full attribute container/document/UIODS pending; same-agent quality not independent."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-15T04:55:46.204Z"
  updated_by: "EVALUATOR"
  note: "Canonical initialized shared XML namespace-map behavior meets task142 scope; same-agent review is not independent."
  evaluated_sha: "05d4ccdd9e1add6f034d8ad1fbdb772b0f1ac047"
  blueprint_digest: "8f767a7878263b742e1fe516e4a7545d29f01ecf8526f4572cb1dc0476dc2eb6"
  evidence_refs:
    - ".agentplane/tasks/202610150439-ZH9HYF/README.md"
    - ".agentplane/tasks/202610150439-ZH9HYF/quality/20261015-045546204-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610150439-ZH9HYF/quality/20261015-045546204-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610150439-ZH9HYF/quality/20261015-045546204-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610150439-ZH9HYF/blueprint/resolved-snapshot.json"
    - "output/playwright/task142-checks/verification.json"
    - "output/playwright/task142-checks/source-gates.json"
    - "output/playwright/task142-checks/namespace-source-audit.json"
  findings:
    - "Actual lookups/aliases/copy/assignment/QName cache and output modes/deprecated APIs/URI normalization retain source behavior through JS Maps/strings/cells. No C++ hash/bucket/allocator layout or native string lifetime engine. CALC-121/122/123 document concerns without fixes or confirmed-defect claims."
    - "28related cases plus8additional actual SAX cases give36unique related tests/5files;182Calc/72files and38boundaries pass.2complete shared owners and33Calc owners every raw counter positive100. Missing token-test filter is recorded, only the actual SAX fallback file ran additionally, no passing tests replayed for selection correction."
    - "All92namespace declarations/4sentinels/15literal token results source-audited. Portable build and13source gates pass,639records zero violations,14intentional paths/3836source hashes/8pins/four restored links. Native broader QName regression and actual sheetdata alias consumer evidence are explicit; full XML attribute container/document/UI/ODS remain pending."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement original namespace-map values, keys, QName caches and URI normalization for shared ODF/Calc attribute dependencies; preserve source quirks using native JS Map/strings without container or memory engines."
events:
  -
    type: "status"
    at: "2026-10-15T04:41:06.159Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement original namespace-map values, keys, QName caches and URI normalization for shared ODF/Calc attribute dependencies; preserve source quirks using native JS Map/strings without container or memory engines."
  -
    type: "verify"
    at: "2026-10-15T04:56:38.917Z"
    author: "CODER"
    state: "ok"
    note: "Namespace map verified:36unique related/5files (28main+8actual SAX fallback),182Calc/72files,38boundaries;2shared raw S282B144F36L246 and33Calc S4172B2731F821L3720 everycounterpositive100.92IDs/4sentinels/15token results source-audited. Portable build/13gates/639records zero violations,14paths/3836hashes/8pins/four links. CALC-121-123 preserved, no native container/memory engine. Full attribute container/document/UIODS pending; same-agent quality not independent."
doc_version: 3
doc_updated_at: "2026-10-15T04:56:38.997Z"
doc_updated_by: "CODER"
description: "Task142 ports actual SvXMLNamespaceMap keys/prefix aliases/QName caches/URI normalization and complete native namespace-id declarations as the missing shared XML attribute-container dependency for Calc/ODS. Use native JS Maps/immutable strings and out cells; no generic C++ hash containers, string ownership or memory engine. Retain source cache quirks and unspecified unordered iteration contract."
sections:
  Summary: "Task142 implements the original shared SvXMLNamespaceMap as the missing namespace dependency of the XML attribute container needed by Calc and ODF filters. User continuation authorizes this core/ODS critical path in calc."
  Scope: "At most35intentional source/doc/inventory paths: xmloff namespacemap source/canonical header, full actual xmlnamespace identifier declarations, focused shared tests and Calc namespace-alias persistence witness, bounded source-backed registry/capability, calc-core and calc-upstream-suspected-issues. Reuse existing shared ODF_NAMESPACES URI strings where applicable. Native JS strings/Maps and output cells represent original values/lookup/reference arguments; no C++ hash/container/string ownership engine or ABI iteration order. Original XML token numeric provider is not fabricated; required resolved literal spellings are explicitly source-audited bindings. No fake XmlAttrContainer/ScDocument or ODS filter is claimed."
  Plan: "Port actual complete initialized SvXMLNamespaceMap behavior and full namespace ID declarations using JS Map/strings/out cells, native lookup/QName/deprecated APIs/URI normalization and preserved cache quirks. Reuse existing URI owner, audit required literal token bindings/all IDs, no C++ container/allocator/hash implementation or fabricated filters. Bound35paths, raw100whole shared/Calc, related Writer XML tests, portable build/source gates/pins/hashes and clean calc."
  Verify Steps: "Native constants/sentinels and actual initialized entry equality; all xmlnamespace.hxx identifiers/aliases source-audited. Empty/default/copy/assignment/self assignment and independent value entries, borrowed all-entries map identity, original assignment retaining destination caches and new copies starting empty caches. All Add/AddIfKnown/AddAtIndex existing/new/alias/unknown/NONE cases, first-free0x8000 key allocation/collision and single bounded32k explicit-key fixture exercising reserved NONE allocation and release fallback without full-key exhaustion/native probes. Key/name/prefix/index lookups, empty/missing/reserved QName generation, cached/uncached and empty-result caching, aliases and arbitrary valid iteration order with missing-next precondition host error. QName parsing cached-name/value modes, first-colon value parsing, invalid multi-colon name fallback/output untouched, default namespace and xmlns/unknown cases, exact optional output writes and cold/hot namespace-output differences. All normalization branches: legacy SVG/FO/SMIL, OASIS TC/subid/version checks and source permissive1.x behavior, W3 prefix/suffix-only acceptance and unchanged failures. Calc witness retains multiple prefixes for one key through GetAllEntries as native sheetdata.cxx requires; no actual sheetdata port claim. Complete changed shared executable owners and whole Calc every raw S/B/F/L counter positive100, relevant existing Writer SAX/ODT tests,4source links absent/restored during portable tests/build. Scoped prettier/eslint/typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff/boundaries and production build; exact35paths/native pins/source hashes/clean calc. Writer-only gaps exempt, no full-suite checkpoint before real minimum UI+ODS readiness then repair/pause."
  Verification: |-
    - Command: `node output/playwright/task142-checks/portable.mjs` and bounded fallback `node output/playwright/task142-checks/extra-portable.mjs`.
    - Result: pass.
    - Evidence:28related cases/4actual selected files plus8additional actual SAX cases/1file,36unique related cases/5files total.2complete new shared executable owners strict raw S282/B144/F36/L246 at100, every counter positive. WholeCalc182cases/72files,33owners raw S4172/B2731/F821/L3720 at100, every counter positive.4source links absent/restored finally during all runs. No Writer runtime owner changed/instrumented or coverage-only repair; no repository coverage threshold/exclusion/map modifications.
    - Scope: all initialized namespace lookup/copy/assignment/alias/QName cache/output/normalization/deprecated APIs, real bounded32k key identity fixture and Calc all-prefix-alias witness. The initial nonexistent xmltoken.test.ts filter was ignored by Vitest; actual output/manifests support28cases/4files only. The helper selection was corrected/admitted and only the actual missing related SAX consumer file ran as a fallback; four passing files were not replayed. Original requested argv and logs remain retained. Relevant Writer XML/ODT and SAX consumers pass unchanged; no full UI/filter QA claim.

    - Command: `npx tsx output/playwright/task142-checks/audit-namespace.ts`.
    - Result: pass.
    - Evidence:all92actual exported namespace identifiers/aliases,4sentinels and15resolved native token strings match pinned headers/table and actual runtime normalization/QName results. Unit witnesses are independent and do not mirror the92row source table. Evidence: namespace-source-audit.json.
    - Scope: original declarations and resolved string binding; no fabricated global native token provider, C++generation/compilation/native memory or unordered hash/bucket/ABI iteration claim.

    - Command: `node output/playwright/task142-checks/build-portable.mjs`.
    - Result: pass.
    - Evidence:production build with4source links absent/restored finally. Existing chunk-size advisory unchanged.
    - Scope: application compilation/bundling; no frontend code change or browser-flow run required.

    - Command: scoped prettier/eslint, npm run typecheck, npm run check:docs, npm run check:file-size, npm run check:dependencies, npm run check:source-tree, npm run check:source-provenance, npm run inventory:parity, node .agentplane/policy/check-routing.mjs, ap doctor, git diff --check, npx vitest run scripts/check-module-boundaries.test.ts.
    - Result: pass.
    - Evidence:1898authored JSDoc files,638runtime dependency sources/2845relative imports/94allowed edges,114required tree paths/33retired roots,639runtime/provenance records/zero semantic violations,38boundaries.13source gates pass.14intentional paths within35approved,3runtime/provenance pairs and bounded capability.3824to3836non-agent source hashes,2existing doc changes/12new/3822unchanged;8native source pins/original native HEAD/4restored links/calc branch. Existing managed hook-shim warning remains. Evidence: verification.json/source-gates.json/raw maps/native/source hashes and retained logs. Same-agent evaluator is not independent.

    CALC-121/122/123 retain observed cache/output, existing-prefix return and reserved-key allocation behavior as source-level concerns, not confirmed bug claims. Native JS strings/Maps provide logical values/lookup; native unordered order/hash/allocator and memory lifetime are not recreated. Required GetXMLToken literal results use source-audited strings and existing shared URI values, not a replacement numeric token enum/service. Actual XML attribute collection/data/item/UNO transport, complete Calc pool/document/UI/ODS remain pending, so human full-suite/pause readiness checkpoint is not reached.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-15T04:56:38.917Z — VERIFY — ok

    By: CODER

    Note: Namespace map verified:36unique related/5files (28main+8actual SAX fallback),182Calc/72files,38boundaries;2shared raw S282B144F36L246 and33Calc S4172B2731F821L3720 everycounterpositive100.92IDs/4sentinels/15token results source-audited. Portable build/13gates/639records zero violations,14paths/3836hashes/8pins/four links. CALC-121-123 preserved, no native container/memory engine. Full attribute container/document/UIODS pending; same-agent quality not independent.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-15T04:53:56.335Z, excerpt_hash=sha256:c60bc1a10064c9e00080d059c0439ec64feac318110b05d9dc41160c34564a94

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610150439-ZH9HYF/blueprint/resolved-snapshot.json
    - old_digest: 8f767a7878263b742e1fe516e4a7545d29f01ecf8526f4572cb1dc0476dc2eb6
    - current_digest: 8f767a7878263b742e1fe516e4a7545d29f01ecf8526f4572cb1dc0476dc2eb6
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610150439-ZH9HYF

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610150439-ZH9HYF -m 🧩 ZH9HYF task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only intentional task changes through a subsequent authorized task; no reset, merge or publication."
  Findings: |-
    Use JS built-ins for logical unordered maps and immutable UTF16 strings. Source nonsemantic hash/bucket/allocator layout and invalid exhausted-key infinite loops are not recreated or probed; valid traversal membership is retained without claiming native unordered iteration order. Original ordinary runtime QName caches are part of observable behavior, so assignment/Add invalidation quirks must be preserved, not corrected. No native C++ generator/compiler or memory manager. Same-agent evaluation is not independent.

    - Observation: Requested XML token test filter has no actual file; Vitest ignored that filter while four real selected files passed28cases and both changed shared owners achieved strict raw100.
      Impact: The28case/4file evidence is valid but does not prove the missing requested test filter ran.
      Resolution: Locate the actual existing SAX namespace/token consumer test and run only that additional file portably, retaining initial manifest/log and avoiding replay of the four passing files. Add file-existence admission to the ignored helper selection.
id_source: "generated"
---
## Summary

Task142 implements the original shared SvXMLNamespaceMap as the missing namespace dependency of the XML attribute container needed by Calc and ODF filters. User continuation authorizes this core/ODS critical path in calc.

## Scope

At most35intentional source/doc/inventory paths: xmloff namespacemap source/canonical header, full actual xmlnamespace identifier declarations, focused shared tests and Calc namespace-alias persistence witness, bounded source-backed registry/capability, calc-core and calc-upstream-suspected-issues. Reuse existing shared ODF_NAMESPACES URI strings where applicable. Native JS strings/Maps and output cells represent original values/lookup/reference arguments; no C++ hash/container/string ownership engine or ABI iteration order. Original XML token numeric provider is not fabricated; required resolved literal spellings are explicitly source-audited bindings. No fake XmlAttrContainer/ScDocument or ODS filter is claimed.

## Plan

Port actual complete initialized SvXMLNamespaceMap behavior and full namespace ID declarations using JS Map/strings/out cells, native lookup/QName/deprecated APIs/URI normalization and preserved cache quirks. Reuse existing URI owner, audit required literal token bindings/all IDs, no C++ container/allocator/hash implementation or fabricated filters. Bound35paths, raw100whole shared/Calc, related Writer XML tests, portable build/source gates/pins/hashes and clean calc.

## Verify Steps

Native constants/sentinels and actual initialized entry equality; all xmlnamespace.hxx identifiers/aliases source-audited. Empty/default/copy/assignment/self assignment and independent value entries, borrowed all-entries map identity, original assignment retaining destination caches and new copies starting empty caches. All Add/AddIfKnown/AddAtIndex existing/new/alias/unknown/NONE cases, first-free0x8000 key allocation/collision and single bounded32k explicit-key fixture exercising reserved NONE allocation and release fallback without full-key exhaustion/native probes. Key/name/prefix/index lookups, empty/missing/reserved QName generation, cached/uncached and empty-result caching, aliases and arbitrary valid iteration order with missing-next precondition host error. QName parsing cached-name/value modes, first-colon value parsing, invalid multi-colon name fallback/output untouched, default namespace and xmlns/unknown cases, exact optional output writes and cold/hot namespace-output differences. All normalization branches: legacy SVG/FO/SMIL, OASIS TC/subid/version checks and source permissive1.x behavior, W3 prefix/suffix-only acceptance and unchanged failures. Calc witness retains multiple prefixes for one key through GetAllEntries as native sheetdata.cxx requires; no actual sheetdata port claim. Complete changed shared executable owners and whole Calc every raw S/B/F/L counter positive100, relevant existing Writer SAX/ODT tests,4source links absent/restored during portable tests/build. Scoped prettier/eslint/typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff/boundaries and production build; exact35paths/native pins/source hashes/clean calc. Writer-only gaps exempt, no full-suite checkpoint before real minimum UI+ODS readiness then repair/pause.

## Verification

- Command: `node output/playwright/task142-checks/portable.mjs` and bounded fallback `node output/playwright/task142-checks/extra-portable.mjs`.
- Result: pass.
- Evidence:28related cases/4actual selected files plus8additional actual SAX cases/1file,36unique related cases/5files total.2complete new shared executable owners strict raw S282/B144/F36/L246 at100, every counter positive. WholeCalc182cases/72files,33owners raw S4172/B2731/F821/L3720 at100, every counter positive.4source links absent/restored finally during all runs. No Writer runtime owner changed/instrumented or coverage-only repair; no repository coverage threshold/exclusion/map modifications.
- Scope: all initialized namespace lookup/copy/assignment/alias/QName cache/output/normalization/deprecated APIs, real bounded32k key identity fixture and Calc all-prefix-alias witness. The initial nonexistent xmltoken.test.ts filter was ignored by Vitest; actual output/manifests support28cases/4files only. The helper selection was corrected/admitted and only the actual missing related SAX consumer file ran as a fallback; four passing files were not replayed. Original requested argv and logs remain retained. Relevant Writer XML/ODT and SAX consumers pass unchanged; no full UI/filter QA claim.

- Command: `npx tsx output/playwright/task142-checks/audit-namespace.ts`.
- Result: pass.
- Evidence:all92actual exported namespace identifiers/aliases,4sentinels and15resolved native token strings match pinned headers/table and actual runtime normalization/QName results. Unit witnesses are independent and do not mirror the92row source table. Evidence: namespace-source-audit.json.
- Scope: original declarations and resolved string binding; no fabricated global native token provider, C++generation/compilation/native memory or unordered hash/bucket/ABI iteration claim.

- Command: `node output/playwright/task142-checks/build-portable.mjs`.
- Result: pass.
- Evidence:production build with4source links absent/restored finally. Existing chunk-size advisory unchanged.
- Scope: application compilation/bundling; no frontend code change or browser-flow run required.

- Command: scoped prettier/eslint, npm run typecheck, npm run check:docs, npm run check:file-size, npm run check:dependencies, npm run check:source-tree, npm run check:source-provenance, npm run inventory:parity, node .agentplane/policy/check-routing.mjs, ap doctor, git diff --check, npx vitest run scripts/check-module-boundaries.test.ts.
- Result: pass.
- Evidence:1898authored JSDoc files,638runtime dependency sources/2845relative imports/94allowed edges,114required tree paths/33retired roots,639runtime/provenance records/zero semantic violations,38boundaries.13source gates pass.14intentional paths within35approved,3runtime/provenance pairs and bounded capability.3824to3836non-agent source hashes,2existing doc changes/12new/3822unchanged;8native source pins/original native HEAD/4restored links/calc branch. Existing managed hook-shim warning remains. Evidence: verification.json/source-gates.json/raw maps/native/source hashes and retained logs. Same-agent evaluator is not independent.

CALC-121/122/123 retain observed cache/output, existing-prefix return and reserved-key allocation behavior as source-level concerns, not confirmed bug claims. Native JS strings/Maps provide logical values/lookup; native unordered order/hash/allocator and memory lifetime are not recreated. Required GetXMLToken literal results use source-audited strings and existing shared URI values, not a replacement numeric token enum/service. Actual XML attribute collection/data/item/UNO transport, complete Calc pool/document/UI/ODS remain pending, so human full-suite/pause readiness checkpoint is not reached.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-15T04:56:38.917Z — VERIFY — ok

By: CODER

Note: Namespace map verified:36unique related/5files (28main+8actual SAX fallback),182Calc/72files,38boundaries;2shared raw S282B144F36L246 and33Calc S4172B2731F821L3720 everycounterpositive100.92IDs/4sentinels/15token results source-audited. Portable build/13gates/639records zero violations,14paths/3836hashes/8pins/four links. CALC-121-123 preserved, no native container/memory engine. Full attribute container/document/UIODS pending; same-agent quality not independent.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-15T04:53:56.335Z, excerpt_hash=sha256:c60bc1a10064c9e00080d059c0439ec64feac318110b05d9dc41160c34564a94

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610150439-ZH9HYF/blueprint/resolved-snapshot.json
- old_digest: 8f767a7878263b742e1fe516e4a7545d29f01ecf8526f4572cb1dc0476dc2eb6
- current_digest: 8f767a7878263b742e1fe516e4a7545d29f01ecf8526f4572cb1dc0476dc2eb6
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610150439-ZH9HYF

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610150439-ZH9HYF -m 🧩 ZH9HYF task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only intentional task changes through a subsequent authorized task; no reset, merge or publication.

## Findings

Use JS built-ins for logical unordered maps and immutable UTF16 strings. Source nonsemantic hash/bucket/allocator layout and invalid exhausted-key infinite loops are not recreated or probed; valid traversal membership is retained without claiming native unordered iteration order. Original ordinary runtime QName caches are part of observable behavior, so assignment/Add invalidation quirks must be preserved, not corrected. No native C++ generator/compiler or memory manager. Same-agent evaluation is not independent.

- Observation: Requested XML token test filter has no actual file; Vitest ignored that filter while four real selected files passed28cases and both changed shared owners achieved strict raw100.
  Impact: The28case/4file evidence is valid but does not prove the missing requested test filter ran.
  Resolution: Locate the actual existing SAX namespace/token consumer test and run only that additional file portably, retaining initial manifest/log and avoiding replay of the four passing files. Add file-existence admission to the ignored helper selection.
