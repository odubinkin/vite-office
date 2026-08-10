---
id: "202608100753-FYEAQ6"
title: "Acquire and pin LibreOffice 26.8.0.2 reference baseline"
status: "DOING"
priority: "high"
owner: "CURATOR"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "baseline"
  - "docs"
  - "libreoffice"
task_kind: "docs"
mutation_scope: "docs"
risk_flags:
  - "network"
blueprint_request: "docs.change"
verify:
  - "ap doctor"
  - "git check-ignore -q vendor/libreoffice-reference/"
  - "node -e \"JSON.parse(require('node:fs').readFileSync('docs/program/libreoffice-baseline.json','utf8'))\""
  - "node .agentplane/policy/check-routing.mjs"
  - "test \"$(git -C vendor/libreoffice-reference rev-parse HEAD)\" = 9bc445578031fecf56086729d8e4940c77e14d65"
plan_approval:
  state: "approved"
  updated_at: "2026-08-10T07:54:50.358Z"
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
    author: "CURATOR"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-08-10T07:55:08.032Z"
    author: "CURATOR"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-08-10T07:55:08.032Z"
doc_updated_by: "CURATOR"
description: "Clone the official LibreOffice GitHub mirror at the approved immutable release baseline into the ignored vendor reference path, record provenance and licensing boundaries, and document reproducible acquisition for later source, test, and documentation inventories."
sections:
  Summary: "Acquire the official LibreOffice GitHub mirror at the user-approved immutable baseline `libreoffice-26.8.0.2`, verify its peeled commit `9bc445578031fecf56086729d8e4940c77e14d65`, and make the reference reproducible for later source, test, and documentation inventories. The checkout is research-only and remains ignored; this task does not claim any LibreOffice feature, test, or documentation parity."
  Scope: |-
    In scope:
    - Shallow, single-tag checkout of `https://github.com/LibreOffice/core.git` at `vendor/libreoffice-reference/`.
    - Provenance, immutable tag/commit identity, acquisition date, clone mode, local path, licensing boundaries, and reproducible commands.
    - New `docs/program/libreoffice-baseline.md` and `docs/program/libreoffice-baseline.json`.
    - Consistency updates to `docs/program/README.md`, `docs/program/roadmap.md`, `docs/program/test-strategy.md`, and root `README.md`.

    Out of scope:
    - Copying upstream source, assets, documentation, translations, samples, or fixtures into tracked project paths.
    - Upstream source/test/help inventory generation (Task 0.4).
    - Product implementation or parity status upgrades.
    - Full Git history, submodules, alternate LibreOffice releases, or baseline upgrade policy changes.
    - Any managed runner.

    Authority and stop rules:
    - Network access to GitHub and this exact plan/tag were explicitly approved by the user.
    - Stop for re-approval if the tag peels to a different commit, the clone requires more than the available safe disk budget, licensing evidence is absent/ambiguous, or tracked changes expand beyond the listed paths plus AgentPlane task metadata.
  Plan: |-
    1. Confirm the official tag object and peeled commit through GitHub/Git, the ignored target path, available disk, and clean tracked state.
    2. Clone only `libreoffice-26.8.0.2` from the official mirror into `vendor/libreoffice-reference/` with shallow single-branch history; verify origin, exact tag, peeled commit, shallow state, and clean checkout.
    3. Inspect upstream top-level licensing and contributor/readme evidence without copying it into tracked paths.
    4. Add a human-readable baseline specification and machine-readable manifest, then update the approved documentation paths so all statements distinguish a pinned baseline from the still-pending inventory/parity work.
    5. Run every Verify Step, inspect the diff and final tracked/untracked state, commit the scoped artifacts, record verification, perform the quality gate, and finish the task through AgentPlane.
  Verify Steps: |-
    1. `test "$(git -C vendor/libreoffice-reference rev-parse HEAD)" = "9bc445578031fecf56086729d8e4940c77e14d65" && test "$(git -C vendor/libreoffice-reference describe --tags --exact-match)" = "libreoffice-26.8.0.2"` — exact checkout identity matches the approved peeled commit and release tag.
    2. `test "$(git -C vendor/libreoffice-reference remote get-url origin)" = "https://github.com/LibreOffice/core.git" && test "$(git -C vendor/libreoffice-reference rev-parse --is-shallow-repository)" = "true" && test -z "$(git -C vendor/libreoffice-reference status --short)"` — provenance, bounded history, and clean reference state are proven.
    3. `git check-ignore -q vendor/libreoffice-reference/ && test -z "$(git ls-files vendor/libreoffice-reference)"` — the reference is ignored and no upstream file is tracked.
    4. `node -e "const fs=require(\"node:fs\");const p=\"docs/program/libreoffice-baseline.json\";const x=JSON.parse(fs.readFileSync(p,\"utf8\"));if(x.repository!==\"https://github.com/LibreOffice/core.git\"||x.tag!==\"libreoffice-26.8.0.2\"||x.commit!==\"9bc445578031fecf56086729d8e4940c77e14d65\"||x.referencePath!==\"vendor/libreoffice-reference/\")process.exit(1)"` — manifest parses and contains the approved immutable identity.
    5. `rg -n "libreoffice-26\\.8\\.0\\.2|9bc445578031fecf56086729d8e4940c77e14d65" README.md docs/program` — public program docs expose the baseline without claiming completed inventory or parity.
    6. `npm run format:check && node .agentplane/policy/check-routing.mjs && ap doctor` — formatting, policy routing, and AgentPlane health pass.
    7. `git diff --check && git status --short --untracked-files=all` — no whitespace errors or unintended tracked/untracked artifacts remain; only task-scoped tracked changes are present before commit and the ignored checkout is absent from status.
  Verification: "Pending implementation. Record each exact command, pass/fail result, concise evidence, covered scope, and relevant links after execution."
  Rollback Plan: "Before task closure, remove only the explicitly resolved ignored directory `vendor/libreoffice-reference/` if acquisition must be abandoned, and restore only this task’s scoped documentation changes. After commits exist, use a normal traceable revert rather than rewriting shared history. Re-acquisition is reproducible from the documented official repository, tag, and peeled commit."
  Findings: "Initial process observation: the gateway command `ap task advance <task-id> --agent-json` is not implemented by installed AgentPlane 0.6.26. The CLI returned `E_USAGE` and explicitly routed recovery to command help and `task next-action --explain`; this task therefore uses the supported direct lifecycle and no managed runner. No baseline-content findings yet."
id_source: "generated"
---
## Summary

Acquire the official LibreOffice GitHub mirror at the user-approved immutable baseline `libreoffice-26.8.0.2`, verify its peeled commit `9bc445578031fecf56086729d8e4940c77e14d65`, and make the reference reproducible for later source, test, and documentation inventories. The checkout is research-only and remains ignored; this task does not claim any LibreOffice feature, test, or documentation parity.

## Scope

In scope:
- Shallow, single-tag checkout of `https://github.com/LibreOffice/core.git` at `vendor/libreoffice-reference/`.
- Provenance, immutable tag/commit identity, acquisition date, clone mode, local path, licensing boundaries, and reproducible commands.
- New `docs/program/libreoffice-baseline.md` and `docs/program/libreoffice-baseline.json`.
- Consistency updates to `docs/program/README.md`, `docs/program/roadmap.md`, `docs/program/test-strategy.md`, and root `README.md`.

Out of scope:
- Copying upstream source, assets, documentation, translations, samples, or fixtures into tracked project paths.
- Upstream source/test/help inventory generation (Task 0.4).
- Product implementation or parity status upgrades.
- Full Git history, submodules, alternate LibreOffice releases, or baseline upgrade policy changes.
- Any managed runner.

Authority and stop rules:
- Network access to GitHub and this exact plan/tag were explicitly approved by the user.
- Stop for re-approval if the tag peels to a different commit, the clone requires more than the available safe disk budget, licensing evidence is absent/ambiguous, or tracked changes expand beyond the listed paths plus AgentPlane task metadata.

## Plan

1. Confirm the official tag object and peeled commit through GitHub/Git, the ignored target path, available disk, and clean tracked state.
2. Clone only `libreoffice-26.8.0.2` from the official mirror into `vendor/libreoffice-reference/` with shallow single-branch history; verify origin, exact tag, peeled commit, shallow state, and clean checkout.
3. Inspect upstream top-level licensing and contributor/readme evidence without copying it into tracked paths.
4. Add a human-readable baseline specification and machine-readable manifest, then update the approved documentation paths so all statements distinguish a pinned baseline from the still-pending inventory/parity work.
5. Run every Verify Step, inspect the diff and final tracked/untracked state, commit the scoped artifacts, record verification, perform the quality gate, and finish the task through AgentPlane.

## Verify Steps

1. `test "$(git -C vendor/libreoffice-reference rev-parse HEAD)" = "9bc445578031fecf56086729d8e4940c77e14d65" && test "$(git -C vendor/libreoffice-reference describe --tags --exact-match)" = "libreoffice-26.8.0.2"` — exact checkout identity matches the approved peeled commit and release tag.
2. `test "$(git -C vendor/libreoffice-reference remote get-url origin)" = "https://github.com/LibreOffice/core.git" && test "$(git -C vendor/libreoffice-reference rev-parse --is-shallow-repository)" = "true" && test -z "$(git -C vendor/libreoffice-reference status --short)"` — provenance, bounded history, and clean reference state are proven.
3. `git check-ignore -q vendor/libreoffice-reference/ && test -z "$(git ls-files vendor/libreoffice-reference)"` — the reference is ignored and no upstream file is tracked.
4. `node -e "const fs=require(\"node:fs\");const p=\"docs/program/libreoffice-baseline.json\";const x=JSON.parse(fs.readFileSync(p,\"utf8\"));if(x.repository!==\"https://github.com/LibreOffice/core.git\"||x.tag!==\"libreoffice-26.8.0.2\"||x.commit!==\"9bc445578031fecf56086729d8e4940c77e14d65\"||x.referencePath!==\"vendor/libreoffice-reference/\")process.exit(1)"` — manifest parses and contains the approved immutable identity.
5. `rg -n "libreoffice-26\\.8\\.0\\.2|9bc445578031fecf56086729d8e4940c77e14d65" README.md docs/program` — public program docs expose the baseline without claiming completed inventory or parity.
6. `npm run format:check && node .agentplane/policy/check-routing.mjs && ap doctor` — formatting, policy routing, and AgentPlane health pass.
7. `git diff --check && git status --short --untracked-files=all` — no whitespace errors or unintended tracked/untracked artifacts remain; only task-scoped tracked changes are present before commit and the ignored checkout is absent from status.

## Verification

Pending implementation. Record each exact command, pass/fail result, concise evidence, covered scope, and relevant links after execution.

## Rollback Plan

Before task closure, remove only the explicitly resolved ignored directory `vendor/libreoffice-reference/` if acquisition must be abandoned, and restore only this task’s scoped documentation changes. After commits exist, use a normal traceable revert rather than rewriting shared history. Re-acquisition is reproducible from the documented official repository, tag, and peeled commit.

## Findings

Initial process observation: the gateway command `ap task advance <task-id> --agent-json` is not implemented by installed AgentPlane 0.6.26. The CLI returned `E_USAGE` and explicitly routed recovery to command help and `task next-action --explain`; this task therefore uses the supported direct lifecycle and no managed runner. No baseline-content findings yet.
