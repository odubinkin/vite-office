---
id: "202610042239-XZQJ21"
title: "Restore native empty hyperlink item values"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on:
  - "202610042214-JKRYVR"
tags:
  - "code"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-04T22:40:12.534Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-04T22:49:40.417Z"
  updated_by: "EVALUATOR"
  note: "Same-actor read-only exact-head review of 1fd61a1d0f8e71136ac83895a071b36debc6ea2f passes native empty/default/copy/string equality scope;full upstream parity remains unverified."
  evaluated_sha: "1fd61a1d0f8e71136ac83895a071b36debc6ea2f"
  blueprint_digest: "c7b8816c9db6f651d4e6ccd29d0391c2a48fc1442c5d597ae28b54396b63dc5d"
  evidence_refs:
    - ".agentplane/tasks/202610042239-XZQJ21/README.md"
    - ".agentplane/tasks/202610042239-XZQJ21/quality/20261004-224940417-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610042239-XZQJ21/quality/20261004-224940417-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610042239-XZQJ21/quality/20261004-224940417-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610042239-XZQJ21/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610042239-XZQJ21/evidence/scope-and-native-hashes.json"
    - ".agentplane/tasks/202610042239-XZQJ21/evidence/static-gates.json"
    - ".agentplane/tasks/202610042239-XZQJ21/evidence/absent-profile.json"
    - ".agentplane/tasks/202610042239-XZQJ21/evidence/restored-source-audits.json"
  findings:
    - "Six committed paths match reviewed checkout.24new literal cases;349prior files accounted with347byte-identical/two declared native corrections. Canonical strings are separately owned,empty strings compare identically,zero/default construction accepts empty URL,copy/Clone clears backlink and name mutation does not alias retained copies."
    - "All six static gates,five absent suites and five restored source audits pass first attempts. One build,app2673,inventory109,scripts5,Chromium99;app/inventory all four coverage metrics100%;no failed cases or replays.237runtime states/defaults/exceptions preserved,one responsibility appendix;four pinned hashes,AP3833files/0forbidden,doctor0errors/two unchanged warnings,routingpass,cleanhead."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Restore native empty string and default/copy item semantics with one absent-reference verification profile under the standing iterative goal."
events:
  -
    type: "status"
    at: "2026-10-04T22:40:12.976Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Restore native empty string and default/copy item semantics with one absent-reference verification profile under the standing iterative goal."
doc_version: 3
doc_updated_at: "2026-10-04T22:48:40.049Z"
doc_updated_by: "CODER"
description: "Replace canonical hyperlink DTO storage with the five native owned strings, restore zero-valued default/copy construction and native empty-string equality, and retain UI normalization at its existing boundary. Correct only prior tests that assert non-native empty rejection, optional-empty inequality or caller JSON property order. Validate the existing ownership/history/browser paths once with upstream absent; preserve registered IO deviations and unverified residual native style IDs/UNO/macros/clients."
sections:
  Summary: "Restore native empty hyperlink item values and string ownership."
  Scope: |-
    - apps/office/src/sw/source/core/txtnode/fmtatr2.ts
    - apps/office/src/sw/source/core/txtnode/internet-item-defaults.test.ts
    - apps/office/src/sw/source/core/txtnode/hyperlink-metadata-ownership.test.ts
    - apps/office/src/sw/source/core/doc/writer-model.test.ts
    - docs/program/source-provenance.json
    - docs/program/parity/runtime-inventory.json
  Plan: "Within six listed paths, refactor canonical SwFormatINetFormat storage to native msURL/msTargetFrame/msINetFormatName/msVisitedFormatName/msHyperlinkName strings. Restore zero default and copy construction,CreateDefault,GetName/SetName/GetTargetFrame/GetINetFormat/GetVisitedFormat;empty URLs remain valid core values,and absent/explicit-empty optional fields compare identically. Clone copies values and starts with no text-attribute backlink. Portable DTO ingestion/projection remains an explicit adapter;GetHyperlink omits empty optional strings and emits deterministic value order rather than caller JSON order. Existing normalizeWriterHyperlink/browser validation still rejects blank user destinations. Add independent literal empty/default/equality/copy/input ownership and actual map/node/filter/history tests. Correct only prior metadata and writer-model cases expecting native-invalid empty rejection,optional empty inequality or caller key order;other347prior files remain unchanged. Append bounded responsibility evidence only,all237existing runtime statuses/defaults/exceptions preserved,no status promotion. Run six static gates then one sequential five-suite absent-reference profile with finally restoration;only failed cases/gates may repeat. Five source audits occur after restoration. Review exact semantic SHA as same-actor EVALUATOR,doctor/routing,ignored-inclusive no-source/helper artifact audit,record verification and close via finish with concrete body/result. Native URL/target styled constructor,style pool IDs/locale names,UNO member QueryValue/PutValue,macros/broadcaster/clients/destruction/full core/UI parity remain unverified and are not silently claimed implemented."
  Verify Steps: |-
    - `npm run format:check`
    - `npm run lint`
    - `npm run typecheck`
    - `npm run check:dependencies`
    - `npm run check:docs`
    - `npm run check:file-size`
    - `npm run test:static`
    - `npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure`
    - `npm run test:inventory:coverage -- --coverage.reportOnFailure`
    - `npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts`
    - `npm exec -- playwright test --config apps/office/playwright.config.ts`
    - `npm exec -- tsx scripts/generate-writer-ui-resources.ts --check`
    - `npm run check:source-tree`
    - `npm run check:source-provenance`
    - `npm run inventory:invariants`
    - `npm run inventory:parity`
    - `ap doctor`
    - `node .agentplane/policy/check-routing.mjs`

    Static gates precede one absent-reference profile. Repeat only failed cases/gates. Audit exact committed scope,349prior test files with only two declared native corrections,237existing runtime states,manual pinned file hashes,and ignored-inclusive forbidden artifact absence. No network/upstream invocation/executable helper artifacts.
  Verification: |-
    Command: six static gates listed in Verify Steps. Result: pass. Evidence: six first-attempt exits0. Scope: approved six paths and repository static contracts.

    Command: five sequential upstream-absent gates listed in Verify Steps. Result: pass. Evidence: one build;app2673/267files;inventory109/36files;scripts5/2files;Chromium99;app/inventory lines/statements/functions/branches100%;all first attempts,no replays. Scope: actual existing model,copy/history,UI and filter paths while pinned reference directory unavailable. Vendor restored in finally.

    Command: five restored source audits listed in Verify Steps. Result: pass. Evidence: resources/source-tree/provenance/invariants/parity exits0,semantic violations0. Scope: pinned source references read after test-profile completion.

    Command: scope-and-native-hashes,git diff --check,ignored-inclusive artifact audit. Result: pass. Evidence: six paths;349prior tests accounted,347unchanged/two native corrections;24newcases;237runtime states/defaults/exceptions preserved,one bounded responsibility appendix;four native hashes;3833APfiles/0forbidden. Scope: native string/default/copy/equality slice. Native styled URL/target pool defaults and complete style IDs/UNO/macros/broadcaster/clients/destruction/full core/UI parity remain unverified.

    Exact semantic SHA EVALUATOR review,doctor/routing and final clean-state evidence pending commit.
  Rollback Plan: "Revert the leaf semantic commit if required;do not rewrite history."
  Findings: |-
    Pinned LibreOffice26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. fmtinfmt.hxx declares five owned strings. fmtatr2.cxx zero constructor initializes all five empty and null backlink;CreateDefault returns that constructor;copy constructor copies strings but not backlink;operator== compares string values. Current local model stores optional DTO fields,throws for empty URL and distinguishes missing from empty. Existing nonempty normalization and browser dialog validation are separate and remain active. Native pool default in init.cxx uses the styled URL/target constructor,distinct from type-info/CreateDefault zero constructor;do not falsely claim the native pool-style defaults restored. Native style IDs/styled constructor/UNO/macros/clients require a later separate ownership audit. Standing user authorizes iterative local leaves,prohibits saved source/helpers,and requires tests once absent.

    Iteration125 replaces canonical hyperlink DTO storage with five native owned string fields and restores zero default/copy construction,CreateDefault and existing-string getters/name setter. Core empty URLs are valid;missing and explicitly empty optional strings both store native empty strings and compare equally. Clone starts without an item-to-text backlink. Existing portable GetHyperlink/JSON projection emits only nonempty optional fields in deterministic value order;caller key order and optional-presence distinctions are not canonical item semantics. UI/filter normalization still rejects blank active links. This supersedes iteration121 claims retaining core empty-URL rejection/empty optional inequality/caller JSON ordering. Native styled URL/target constructor,pool style IDs/locale mapping,UNO members/macros/broadcaster/client/destruction and broader model/UI parity remain unverified. All existing semantic statuses/defaults/exceptions and registered save/open/recovery deviations remain unchanged;no module or goal promotion.

    Verified evidence: six semantic paths;24 new literal cases. All349prior test files accounted:347byte-identical,only metadata ownership and writer-model native expectation corrections. Optional-empty equality,coredestination emptiness and canonical JSON order expectations corrected;normalization rejection and all nonempty value/caller ownership checks retained. Six static gates passed first attempts. One sequential absent-reference profile passed buildonce,application2673/267files,inventory109/36files,scripts5/2files,Chromium99;app/inventory coverage100%all four metrics. No failed cases or replays. Five restored audits passed,semantic violations0. All237runtime statuses/defaults/exceptions and every manifest field retained except one fmtatr2 responsibility appendix. Four pinned native hashes. Ignored-inclusive Agentplane scan3833files/0forbidden;git diff --check pass. No external writes/network/global reads/native execution/raw source/helper artifacts/registered I/O deviation changes. Full styled URL/target constructor/style IDs/default pool registration,UNO QueryValue/PutValue/macros/broadcaster/clients and physical lifetime remain unverified;goal is active.
id_source: "generated"
---
## Summary

Restore native empty hyperlink item values and string ownership.

## Scope

- apps/office/src/sw/source/core/txtnode/fmtatr2.ts
- apps/office/src/sw/source/core/txtnode/internet-item-defaults.test.ts
- apps/office/src/sw/source/core/txtnode/hyperlink-metadata-ownership.test.ts
- apps/office/src/sw/source/core/doc/writer-model.test.ts
- docs/program/source-provenance.json
- docs/program/parity/runtime-inventory.json

## Plan

Within six listed paths, refactor canonical SwFormatINetFormat storage to native msURL/msTargetFrame/msINetFormatName/msVisitedFormatName/msHyperlinkName strings. Restore zero default and copy construction,CreateDefault,GetName/SetName/GetTargetFrame/GetINetFormat/GetVisitedFormat;empty URLs remain valid core values,and absent/explicit-empty optional fields compare identically. Clone copies values and starts with no text-attribute backlink. Portable DTO ingestion/projection remains an explicit adapter;GetHyperlink omits empty optional strings and emits deterministic value order rather than caller JSON order. Existing normalizeWriterHyperlink/browser validation still rejects blank user destinations. Add independent literal empty/default/equality/copy/input ownership and actual map/node/filter/history tests. Correct only prior metadata and writer-model cases expecting native-invalid empty rejection,optional empty inequality or caller key order;other347prior files remain unchanged. Append bounded responsibility evidence only,all237existing runtime statuses/defaults/exceptions preserved,no status promotion. Run six static gates then one sequential five-suite absent-reference profile with finally restoration;only failed cases/gates may repeat. Five source audits occur after restoration. Review exact semantic SHA as same-actor EVALUATOR,doctor/routing,ignored-inclusive no-source/helper artifact audit,record verification and close via finish with concrete body/result. Native URL/target styled constructor,style pool IDs/locale names,UNO member QueryValue/PutValue,macros/broadcaster/clients/destruction/full core/UI parity remain unverified and are not silently claimed implemented.

## Verify Steps

- `npm run format:check`
- `npm run lint`
- `npm run typecheck`
- `npm run check:dependencies`
- `npm run check:docs`
- `npm run check:file-size`
- `npm run test:static`
- `npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure`
- `npm run test:inventory:coverage -- --coverage.reportOnFailure`
- `npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts`
- `npm exec -- playwright test --config apps/office/playwright.config.ts`
- `npm exec -- tsx scripts/generate-writer-ui-resources.ts --check`
- `npm run check:source-tree`
- `npm run check:source-provenance`
- `npm run inventory:invariants`
- `npm run inventory:parity`
- `ap doctor`
- `node .agentplane/policy/check-routing.mjs`

Static gates precede one absent-reference profile. Repeat only failed cases/gates. Audit exact committed scope,349prior test files with only two declared native corrections,237existing runtime states,manual pinned file hashes,and ignored-inclusive forbidden artifact absence. No network/upstream invocation/executable helper artifacts.

## Verification

Command: six static gates listed in Verify Steps. Result: pass. Evidence: six first-attempt exits0. Scope: approved six paths and repository static contracts.

Command: five sequential upstream-absent gates listed in Verify Steps. Result: pass. Evidence: one build;app2673/267files;inventory109/36files;scripts5/2files;Chromium99;app/inventory lines/statements/functions/branches100%;all first attempts,no replays. Scope: actual existing model,copy/history,UI and filter paths while pinned reference directory unavailable. Vendor restored in finally.

Command: five restored source audits listed in Verify Steps. Result: pass. Evidence: resources/source-tree/provenance/invariants/parity exits0,semantic violations0. Scope: pinned source references read after test-profile completion.

Command: scope-and-native-hashes,git diff --check,ignored-inclusive artifact audit. Result: pass. Evidence: six paths;349prior tests accounted,347unchanged/two native corrections;24newcases;237runtime states/defaults/exceptions preserved,one bounded responsibility appendix;four native hashes;3833APfiles/0forbidden. Scope: native string/default/copy/equality slice. Native styled URL/target pool defaults and complete style IDs/UNO/macros/broadcaster/clients/destruction/full core/UI parity remain unverified.

Exact semantic SHA EVALUATOR review,doctor/routing and final clean-state evidence pending commit.

## Rollback Plan

Revert the leaf semantic commit if required;do not rewrite history.

## Findings

Pinned LibreOffice26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. fmtinfmt.hxx declares five owned strings. fmtatr2.cxx zero constructor initializes all five empty and null backlink;CreateDefault returns that constructor;copy constructor copies strings but not backlink;operator== compares string values. Current local model stores optional DTO fields,throws for empty URL and distinguishes missing from empty. Existing nonempty normalization and browser dialog validation are separate and remain active. Native pool default in init.cxx uses the styled URL/target constructor,distinct from type-info/CreateDefault zero constructor;do not falsely claim the native pool-style defaults restored. Native style IDs/styled constructor/UNO/macros/clients require a later separate ownership audit. Standing user authorizes iterative local leaves,prohibits saved source/helpers,and requires tests once absent.

Iteration125 replaces canonical hyperlink DTO storage with five native owned string fields and restores zero default/copy construction,CreateDefault and existing-string getters/name setter. Core empty URLs are valid;missing and explicitly empty optional strings both store native empty strings and compare equally. Clone starts without an item-to-text backlink. Existing portable GetHyperlink/JSON projection emits only nonempty optional fields in deterministic value order;caller key order and optional-presence distinctions are not canonical item semantics. UI/filter normalization still rejects blank active links. This supersedes iteration121 claims retaining core empty-URL rejection/empty optional inequality/caller JSON ordering. Native styled URL/target constructor,pool style IDs/locale mapping,UNO members/macros/broadcaster/client/destruction and broader model/UI parity remain unverified. All existing semantic statuses/defaults/exceptions and registered save/open/recovery deviations remain unchanged;no module or goal promotion.

Verified evidence: six semantic paths;24 new literal cases. All349prior test files accounted:347byte-identical,only metadata ownership and writer-model native expectation corrections. Optional-empty equality,coredestination emptiness and canonical JSON order expectations corrected;normalization rejection and all nonempty value/caller ownership checks retained. Six static gates passed first attempts. One sequential absent-reference profile passed buildonce,application2673/267files,inventory109/36files,scripts5/2files,Chromium99;app/inventory coverage100%all four metrics. No failed cases or replays. Five restored audits passed,semantic violations0. All237runtime statuses/defaults/exceptions and every manifest field retained except one fmtatr2 responsibility appendix. Four pinned native hashes. Ignored-inclusive Agentplane scan3833files/0forbidden;git diff --check pass. No external writes/network/global reads/native execution/raw source/helper artifacts/registered I/O deviation changes. Full styled URL/target constructor/style IDs/default pool registration,UNO QueryValue/PutValue/macros/broadcaster/clients and physical lifetime remain unverified;goal is active.
