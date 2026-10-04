---
id: "202610042319-Y8NHP2"
title: "Preserve native hyperlink style identities through Worker records"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
task_kind: "code"
mutation_scope: "code"
verify:
  - "ap doctor"
  - "node .agentplane/policy/check-routing.mjs"
  - "npm exec -- playwright test --config apps/office/playwright.config.ts"
  - "npm exec -- tsx scripts/generate-writer-ui-resources.ts --check"
  - "npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts"
  - "npm run check:dependencies"
  - "npm run check:docs"
  - "npm run check:file-size"
  - "npm run check:source-provenance"
  - "npm run check:source-tree"
  - "npm run format:check"
  - "npm run inventory:invariants"
  - "npm run inventory:parity"
  - "npm run lint"
  - "npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure"
  - "npm run test:inventory:coverage -- --coverage.reportOnFailure"
  - "npm run test:static"
  - "npm run typecheck"
plan_approval:
  state: "approved"
  updated_at: "2026-10-04T23:19:34.068Z"
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
  updated_at: "2026-10-04T23:32:05.037Z"
  updated_by: "EVALUATOR"
  note: "Same-actor read-only exact-SHA review de0c2aa18c9716de68e8cdae5d6007d41edcfc9d passes native internet style-ID retention through existing browser item and Worker16 graph records;no independent-agent or whole parity claim."
  evaluated_sha: "de0c2aa18c9716de68e8cdae5d6007d41edcfc9d"
  blueprint_digest: "fdd5bc693ebc698ce86cc77cf595c0c04fefc415454edcc58df24a0ed406cecd"
  evidence_refs:
    - ".agentplane/tasks/202610042319-Y8NHP2/README.md"
    - ".agentplane/tasks/202610042319-Y8NHP2/quality/20261004-233205037-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610042319-Y8NHP2/quality/20261004-233205037-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610042319-Y8NHP2/quality/20261004-233205037-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610042319-Y8NHP2/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610042319-Y8NHP2/evidence/scope-and-native-hashes.json"
    - ".agentplane/tasks/202610042319-Y8NHP2/evidence/absent-profile.json"
    - ".agentplane/tasks/202610042319-Y8NHP2/evidence/restored-source-audits.json"
    - "Exact semantic SHA de0c2aa18c9716de68e8cdae5d6007d41edcfc9d"
  findings:
    - "All six committed semantic paths match approved scope and checkout. Browser-owned record codec is reused by both serialization paths;native paired setters restore independent IDs/names without copying backlink. Zero omissions retain previous records,provided unsigned16 IDs validate strictly. Independent16IDpairs/malformedfields/actualnodecopies/retainedundotext/structured-clone Worker16 prove bounded retention. All352 prior test files unchanged;238states/defaults/exceptions and allothermanifestfields unchanged except two responsibility appendices. Six static/five absent full/five restored source gates pass first attempts:build1,app2716/inventory109/scripts5/Chromium99,coverage100%,notestreplays;semantic0;five native hashes;AP3853files/0forbidden;doctor0errors2unchangedwarnings/routingpass."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: preserve native internet style IDs through one browser-owned record codec reused by pooled snapshots and Worker16 graph."
events:
  -
    type: "status"
    at: "2026-10-04T23:19:34.505Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: preserve native internet style IDs through one browser-owned record codec reused by pooled snapshots and Worker16 graph."
doc_version: 3
doc_updated_at: "2026-10-04T23:33:01.100Z"
doc_updated_by: "CODER"
description: "Preserve both native internet style pool IDs through the existing browser item snapshot and canonical Worker16 graph. Add one browser-owned internet value-record type and encode/decode pair in existing item-codec.ts;reuse it from JSON item encoding and graph hint encoding/restoration,leaving core QueryValue and GetHyperlink browser metadata projection unchanged. Encode optional native inetFormatId/visitedFormatId when nonzero;absence in existing current-schema records restores ZERO without changing350+existing assumptions. Validate provided IDs as integer unsigned16 before invoking native paired name/ID setters;reject malformed IDs,retain existing blank-active-link snapshot rejection and default-only pool54 generic restore boundary. Native Clone/MakeTextAttr/node copying already preserve IDs and must remain authoritative;no duplicate core persistence class. Add two source-independent literal test files:16literal ID pairs/zero/built-in/custom/sentinel item snapshots,current-schema omitted IDs,all invalid-ID boundary branches,actual node/copy/fragment/history/undo and structured-clone Worker envelope ownership/restoration. All352 prior test files byte-identical. Append bounded responsibility notes only to two existing manifest rows;all238 runtime states/defaults/exceptions and I/O deviations preserved,no new module or promotion. Six static gates then one sequential five-suite absent-reference profile with finally restoration;only failed cases/gates repeat;five restored source audits afterward. Exact committed scope/native hashes/ignored-inclusive artifact audit,same-actor readonly EVALUATOR,doctor/routing,recorded verification and canonical finish with concrete result. Native active DTO constructor/style identity ingestion,ODF UI/programmatic name conversion/localization/custom style copying/visited clients/UNO/macros/broadcaster/lifetime/full core/UI parity remain separate unverified obligations."
sections:
  Summary: "Preserve native hyperlink style identities through existing item and Worker records."
  Scope: |-
    - apps/office/src/sw/browser/filter/xml/item-codec.ts
    - apps/office/src/sw/browser/filter/xml/writer-document-codec.ts
    - apps/office/src/sw/source/core/txtnode/internet-style-id-transport.test.ts
    - apps/office/src/sw/source/filter/xml/hyperlink-item-codec.test.ts
    - docs/program/source-provenance.json
    - docs/program/parity/runtime-inventory.json
  Plan: "Preserve both native internet style pool IDs through the existing browser item snapshot and canonical Worker16 graph. Add one browser-owned internet value-record type and encode/decode pair in existing item-codec.ts;reuse it from JSON item encoding and graph hint encoding/restoration,leaving core QueryValue and GetHyperlink browser metadata projection unchanged. Encode optional native inetFormatId/visitedFormatId when nonzero;absence in existing current-schema records restores ZERO without changing350+existing assumptions. Validate provided IDs as integer unsigned16 before invoking native paired name/ID setters;reject malformed IDs,retain existing blank-active-link snapshot rejection and default-only pool54 generic restore boundary. Native Clone/MakeTextAttr/node copying already preserve IDs and must remain authoritative;no duplicate core persistence class. Add two source-independent literal test files:16literal ID pairs/zero/built-in/custom/sentinel item snapshots,current-schema omitted IDs,all invalid-ID boundary branches,actual node/copy/fragment/history/undo and structured-clone Worker envelope ownership/restoration. All352 prior test files byte-identical. Append bounded responsibility notes only to two existing manifest rows;all238 runtime states/defaults/exceptions and I/O deviations preserved,no new module or promotion. Six static gates then one sequential five-suite absent-reference profile with finally restoration;only failed cases/gates repeat;five restored source audits afterward. Exact committed scope/native hashes/ignored-inclusive artifact audit,same-actor readonly EVALUATOR,doctor/routing,recorded verification and canonical finish with concrete result. Native active DTO constructor/style identity ingestion,ODF UI/programmatic name conversion/localization/custom style copying/visited clients/UNO/macros/broadcaster/lifetime/full core/UI parity remain separate unverified obligations."
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

    Static gates precede one sequential absent-reference profile;repeat only failed cases/gates. Audit all352prior test files unchanged,all238existing runtime states/defaults/exceptions and native hashes. No network/upstream execution/saved source/helper artifacts.
  Verification: |-
    Command: six static gates listed in Verify Steps. Result: pass. Evidence: six first-attempt exits0. Scope: six approved semantic paths and unchanged static contracts.

    Command: five sequential absent-reference gates listed in Verify Steps. Result: pass. Evidence: one build;app2716/271files;inventory109/36files;scripts5/2files;Chromium99;app/inventory lines/statements/functions/branches100%;all first attempts,no failures or replays. Scope: real native item records,node/copy/history/Worker/browser/filter paths with reference absent. Vendor restored in finally before source audits.

    Command: five restored source audits listed in Verify Steps. Result: pass. Evidence: resources/source-tree/provenance/invariants/parity exits0;semantic violations0. Scope: pinned references audited after profile completion.

    Command: scope-and-native-hashes,git diff --check,ignored-inclusive artifact audit. Result: pass. Evidence: six semantic paths,36new literal cases;all352prior test files byte-identical;all238runtime states/defaults/exceptions and other manifest fields unchanged except two responsibility appendices;five native hashes;3853APfiles/0forbidden. Scope: exact independent unsigned16 internet IDs/names preserved through shared browser codec,JSON item snapshot,actual canonical Worker16 graph ownership and retained text undo. Core QueryValue/GetHyperlink and existing zero-omission DTO contract unchanged;no saved source/helpers/raw diagnostics.

    Command: same-actor read-only EVALUATOR exact semantic SHA de0c2aa18c9716de68e8cdae5d6007d41edcfc9d;ap doctor;node .agentplane/policy/check-routing.mjs;git status --short --untracked-files=all. Result: pass. Evidence: committed six paths equal reviewed checkout;quality report .agentplane/tasks/202610042319-Y8NHP2/quality/20261004-233205037-recovery-context/quality-report.json;doctor0errors/two unchanged legacy warnings;routingOK;cleanmain before quality persistence. Scope: bounded identity-retention slice,no independent-agent claim or full parity promotion. Native active styled constructor routing/DTO style identity resolution/ODF programmatic-UI conversion/all localized/custom style families/visited clients/UNO/macros/broadcaster/refcounts/lifetimes/global pool architecture/full core/UI remain unverified. Registered save/open/recovery deviations preserved;goal active.
  Rollback Plan: "Revert the semantic leaf commit without history rewriting."
  Findings: |-
    Pinned LibreOffice26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. fmtinfmt.hxx owns mnINetFormatId/mnVisitedFormatId;fmtatr2.cxx native copy and operator== retain both IDs. Local core Clone/MakeTextAttr preserve them after iteration126. item-codec currently serializes only five string QueryValue fields and decode normalizes into a DTO constructor,losing IDs. writer-document-codec independently stores GetHyperlink strings and restores same DTO,also losing IDs. Actual Worker envelope uses this canonical graph. This task repairs both serialization boundaries through one browser-owned value record,without claiming browser DTO creation/ODF style conversion/native client resolution complete. Standing goal authorizes safe local leaf work;tests once absent;no saved source/helper artifacts/network/global reads/native test invocation.

    Iteration127 preserves native normal/visited style IDs through a single browser-owned internet record codec reused by pooled JSON snapshots and canonical Worker16 graph hints. Optional nonzero IDs retain exact unsigned16 values;omitted fields restore ZERO under the existing portable DTO contract. Native item name/ID paired setters restore owned fields without a text backlink;MakeTextAttr attaches actual graph hints normally. Core QueryValue/GetHyperlink projection and default-only pool54 generic decode boundary remain unchanged. All existing runtime states/defaults/exceptions and registered save/open/recovery deviations preserved. Native active styled constructor routing,DTO style identity lookup,ODF programmatic/UI conversion,full localized/custom style families/clients/visited behavior/UNO/macros/broadcaster/lifetimes/global pools/full core/UI remain unverified;no module or goal promotion.

    Verified evidence: six semantic paths;36new independent literal cases;all352prior test files byte-identical. Six static gates first-attempt pass. One absent full profile first-attempt pass:build1,app2716/271files,inventory109/36files,scripts5/2files,Chromium99;app/inventory100%allfourcoverage,no failures/replays/passing suite repeats. Vendor restored in finally;five restored source audits pass,semantic0. All238runtime states/defaults/exceptions and all other manifest fields preserved except two bounded codec responsibility appendices. Five native hashes;ignored-inclusive AP3853files/zero forbidden;git diff --check pass. Real node copies/retained text undo keep65000/65535 and actual backlinks;graph/Worker restores preserve exact independent IDs/names/ranges/ownership. Core QueryValue/GetHyperlink unchanged;no persistence helpers added to core. Optional missing IDs restore0 under existing portable DTO contract;new active native styled-constructor routing and name-to-pool-ID lookup remain unverified. ODF name mapping/custom/localized styles/visited clients/UNO/macros/broadcaster/lifetime/global pools/full core/UI remain unverified. No registered I/O/recovery changes/network/global access/native invocation/saved sources/helpers/raw diagnostics.
id_source: "generated"
---
## Summary

Preserve native hyperlink style identities through existing item and Worker records.

## Scope

- apps/office/src/sw/browser/filter/xml/item-codec.ts
- apps/office/src/sw/browser/filter/xml/writer-document-codec.ts
- apps/office/src/sw/source/core/txtnode/internet-style-id-transport.test.ts
- apps/office/src/sw/source/filter/xml/hyperlink-item-codec.test.ts
- docs/program/source-provenance.json
- docs/program/parity/runtime-inventory.json

## Plan

Preserve both native internet style pool IDs through the existing browser item snapshot and canonical Worker16 graph. Add one browser-owned internet value-record type and encode/decode pair in existing item-codec.ts;reuse it from JSON item encoding and graph hint encoding/restoration,leaving core QueryValue and GetHyperlink browser metadata projection unchanged. Encode optional native inetFormatId/visitedFormatId when nonzero;absence in existing current-schema records restores ZERO without changing350+existing assumptions. Validate provided IDs as integer unsigned16 before invoking native paired name/ID setters;reject malformed IDs,retain existing blank-active-link snapshot rejection and default-only pool54 generic restore boundary. Native Clone/MakeTextAttr/node copying already preserve IDs and must remain authoritative;no duplicate core persistence class. Add two source-independent literal test files:16literal ID pairs/zero/built-in/custom/sentinel item snapshots,current-schema omitted IDs,all invalid-ID boundary branches,actual node/copy/fragment/history/undo and structured-clone Worker envelope ownership/restoration. All352 prior test files byte-identical. Append bounded responsibility notes only to two existing manifest rows;all238 runtime states/defaults/exceptions and I/O deviations preserved,no new module or promotion. Six static gates then one sequential five-suite absent-reference profile with finally restoration;only failed cases/gates repeat;five restored source audits afterward. Exact committed scope/native hashes/ignored-inclusive artifact audit,same-actor readonly EVALUATOR,doctor/routing,recorded verification and canonical finish with concrete result. Native active DTO constructor/style identity ingestion,ODF UI/programmatic name conversion/localization/custom style copying/visited clients/UNO/macros/broadcaster/lifetime/full core/UI parity remain separate unverified obligations.

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

Static gates precede one sequential absent-reference profile;repeat only failed cases/gates. Audit all352prior test files unchanged,all238existing runtime states/defaults/exceptions and native hashes. No network/upstream execution/saved source/helper artifacts.

## Verification

Command: six static gates listed in Verify Steps. Result: pass. Evidence: six first-attempt exits0. Scope: six approved semantic paths and unchanged static contracts.

Command: five sequential absent-reference gates listed in Verify Steps. Result: pass. Evidence: one build;app2716/271files;inventory109/36files;scripts5/2files;Chromium99;app/inventory lines/statements/functions/branches100%;all first attempts,no failures or replays. Scope: real native item records,node/copy/history/Worker/browser/filter paths with reference absent. Vendor restored in finally before source audits.

Command: five restored source audits listed in Verify Steps. Result: pass. Evidence: resources/source-tree/provenance/invariants/parity exits0;semantic violations0. Scope: pinned references audited after profile completion.

Command: scope-and-native-hashes,git diff --check,ignored-inclusive artifact audit. Result: pass. Evidence: six semantic paths,36new literal cases;all352prior test files byte-identical;all238runtime states/defaults/exceptions and other manifest fields unchanged except two responsibility appendices;five native hashes;3853APfiles/0forbidden. Scope: exact independent unsigned16 internet IDs/names preserved through shared browser codec,JSON item snapshot,actual canonical Worker16 graph ownership and retained text undo. Core QueryValue/GetHyperlink and existing zero-omission DTO contract unchanged;no saved source/helpers/raw diagnostics.

Command: same-actor read-only EVALUATOR exact semantic SHA de0c2aa18c9716de68e8cdae5d6007d41edcfc9d;ap doctor;node .agentplane/policy/check-routing.mjs;git status --short --untracked-files=all. Result: pass. Evidence: committed six paths equal reviewed checkout;quality report .agentplane/tasks/202610042319-Y8NHP2/quality/20261004-233205037-recovery-context/quality-report.json;doctor0errors/two unchanged legacy warnings;routingOK;cleanmain before quality persistence. Scope: bounded identity-retention slice,no independent-agent claim or full parity promotion. Native active styled constructor routing/DTO style identity resolution/ODF programmatic-UI conversion/all localized/custom style families/visited clients/UNO/macros/broadcaster/refcounts/lifetimes/global pool architecture/full core/UI remain unverified. Registered save/open/recovery deviations preserved;goal active.

## Rollback Plan

Revert the semantic leaf commit without history rewriting.

## Findings

Pinned LibreOffice26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. fmtinfmt.hxx owns mnINetFormatId/mnVisitedFormatId;fmtatr2.cxx native copy and operator== retain both IDs. Local core Clone/MakeTextAttr preserve them after iteration126. item-codec currently serializes only five string QueryValue fields and decode normalizes into a DTO constructor,losing IDs. writer-document-codec independently stores GetHyperlink strings and restores same DTO,also losing IDs. Actual Worker envelope uses this canonical graph. This task repairs both serialization boundaries through one browser-owned value record,without claiming browser DTO creation/ODF style conversion/native client resolution complete. Standing goal authorizes safe local leaf work;tests once absent;no saved source/helper artifacts/network/global reads/native test invocation.

Iteration127 preserves native normal/visited style IDs through a single browser-owned internet record codec reused by pooled JSON snapshots and canonical Worker16 graph hints. Optional nonzero IDs retain exact unsigned16 values;omitted fields restore ZERO under the existing portable DTO contract. Native item name/ID paired setters restore owned fields without a text backlink;MakeTextAttr attaches actual graph hints normally. Core QueryValue/GetHyperlink projection and default-only pool54 generic decode boundary remain unchanged. All existing runtime states/defaults/exceptions and registered save/open/recovery deviations preserved. Native active styled constructor routing,DTO style identity lookup,ODF programmatic/UI conversion,full localized/custom style families/clients/visited behavior/UNO/macros/broadcaster/lifetimes/global pools/full core/UI remain unverified;no module or goal promotion.

Verified evidence: six semantic paths;36new independent literal cases;all352prior test files byte-identical. Six static gates first-attempt pass. One absent full profile first-attempt pass:build1,app2716/271files,inventory109/36files,scripts5/2files,Chromium99;app/inventory100%allfourcoverage,no failures/replays/passing suite repeats. Vendor restored in finally;five restored source audits pass,semantic0. All238runtime states/defaults/exceptions and all other manifest fields preserved except two bounded codec responsibility appendices. Five native hashes;ignored-inclusive AP3853files/zero forbidden;git diff --check pass. Real node copies/retained text undo keep65000/65535 and actual backlinks;graph/Worker restores preserve exact independent IDs/names/ranges/ownership. Core QueryValue/GetHyperlink unchanged;no persistence helpers added to core. Optional missing IDs restore0 under existing portable DTO contract;new active native styled-constructor routing and name-to-pool-ID lookup remain unverified. ODF name mapping/custom/localized styles/visited clients/UNO/macros/broadcaster/lifetime/global pools/full core/UI remain unverified. No registered I/O/recovery changes/network/global access/native invocation/saved sources/helpers/raw diagnostics.
