---
id: "202608100753-FYEAQ6"
title: "Acquire and pin LibreOffice 26.8.0.2 reference baseline"
status: "DOING"
priority: "high"
owner: "CURATOR"
revision: 13
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
doc_updated_at: "2026-08-10T08:02:21.577Z"
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
  Verification: |-
    1. Command: `test "$(git -C vendor/libreoffice-reference rev-parse HEAD)" = "9bc445578031fecf56086729d8e4940c77e14d65"` plus exact tag-object, peeled-tag, and `describe --exact-match` comparisons.
       Result: pass.
       Evidence: annotated tag object `eb55fbaf423db60b82b7fc8613c290b4849b6ba8` peels to commit `9bc445578031fecf56086729d8e4940c77e14d65`; exact tag is `libreoffice-26.8.0.2`.
       Scope: ignored LibreOffice checkout identity.
       Links: `docs/program/libreoffice-baseline.md`, `docs/program/libreoffice-baseline.json`.
    2. Command: `test "$(git -C vendor/libreoffice-reference remote get-url origin)" = "https://github.com/LibreOffice/core.git" && test "$(git -C vendor/libreoffice-reference rev-parse --is-shallow-repository)" = "true" && test -z "$(git -C vendor/libreoffice-reference status --short)"`.
       Result: pass.
       Evidence: official origin, shallow repository, detached exact-tag checkout, and clean upstream worktree; observed size 1.8 GiB and 149,172 upstream tracked files.
       Scope: acquisition provenance and bounded local footprint.
       Links: `docs/program/libreoffice-baseline.md`.
    3. Command: `git check-ignore -q vendor/libreoffice-reference/ && test -z "$(git ls-files vendor/libreoffice-reference)"`.
       Result: pass.
       Evidence: root `.gitignore` owns the match and the parent repository tracks zero reference files.
       Scope: repository boundary.
       Links: `.gitignore`, `docs/program/libreoffice-baseline.md`.
    4. Command: Node JSON parse/identity/license-evidence assertion against `docs/program/libreoffice-baseline.json`.
       Result: pass.
       Evidence: schema version 1; approved repository/tag/tag object/commit/path; `inventoryStatus=pending`; `parityClaim=false`; all four upstream evidence paths exist.
       Scope: machine-readable baseline artifact.
       Links: `docs/program/libreoffice-baseline.json`.
    5. Command: Node local Markdown-link existence check, baseline/stale-claim `rg` checks, and `curl` validation of the four tag-pinned GitHub evidence links.
       Result: pass.
       Evidence: 28 local links resolved; stale pre-acquisition claims absent; README, COPYING, COPYING.LGPL, and COPYING.MPL links each returned HTTP 200.
       Scope: `README.md` and changed `docs/program/**` documents.
       Links: `README.md`, `docs/program/README.md`, `docs/program/roadmap.md`, `docs/program/test-strategy.md`, `docs/program/libreoffice-baseline.md`.
    6. Command: `npm run format:check && node .agentplane/policy/check-routing.mjs && ap doctor`.
       Result: pass.
       Evidence: all files match Prettier; policy routing OK; doctor OK with zero errors, zero warnings, and two informational fallback/blueprint notices.
       Scope: changed documentation plus repository policy/AgentPlane health.
       Links: `docs/program/libreoffice-baseline.md`, `docs/program/libreoffice-baseline.json`.
    7. Command: `git diff --check && git status --short --untracked-files=all`.
       Result: pass.
       Evidence: no whitespace errors; pre-commit status contains only the six approved documentation paths and task metadata, while the ignored checkout is absent.
       Scope: full task diff and repository cleanliness boundary.
       Links: all task-scoped paths.
  Rollback Plan: "Before task closure, remove only the explicitly resolved ignored directory `vendor/libreoffice-reference/` if acquisition must be abandoned, and restore only this task’s scoped documentation changes. After commits exist, use a normal traceable revert rather than rewriting shared history. Re-acquisition is reproducible from the documented official repository, tag, and peeled commit."
  Findings: |-
    Baseline findings:
    - The official annotated tag object is `eb55fbaf423db60b82b7fc8613c290b4849b6ba8`; it peels to the user-approved commit `9bc445578031fecf56086729d8e4940c77e14d65`.
    - The shallow checkout contains 149,172 upstream tracked files and uses about 1.8 GiB locally, leaving about 25 GiB available after acquisition.
    - Top-level upstream evidence includes README.md plus GPLv3, LGPLv3, and MPL 2.0 license texts. That mix does not prove one uniform license for every source, third-party component, document, font, media file, or fixture, so all tracked reuse requires per-file provenance and license review.
    - No upstream material was copied into tracked Vite Office paths. Inventory and every parity claim remain pending Task 0.4.

    Process findings:
    - The gateway command `ap task advance <task-id> --agent-json` is not implemented by installed AgentPlane 0.6.26. The CLI returned `E_USAGE` and routed recovery to command help plus `task next-action --explain`.
    - After `start-ready`, the route oracle unconditionally offered the configured managed runner even though the approved task and user instruction explicitly forbid runners. No runner run exists or was launched; execution followed the supported direct-workflow lifecycle manually.
    - One pre-clone shell assertion used an unbraced zsh variable adjacent to `[[:space:]]`, which zsh parsed as a subscript. It failed before directory creation or cloning; the bounded retry used field-based comparison and succeeded without scope change.
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

1. Command: `test "$(git -C vendor/libreoffice-reference rev-parse HEAD)" = "9bc445578031fecf56086729d8e4940c77e14d65"` plus exact tag-object, peeled-tag, and `describe --exact-match` comparisons.
   Result: pass.
   Evidence: annotated tag object `eb55fbaf423db60b82b7fc8613c290b4849b6ba8` peels to commit `9bc445578031fecf56086729d8e4940c77e14d65`; exact tag is `libreoffice-26.8.0.2`.
   Scope: ignored LibreOffice checkout identity.
   Links: `docs/program/libreoffice-baseline.md`, `docs/program/libreoffice-baseline.json`.
2. Command: `test "$(git -C vendor/libreoffice-reference remote get-url origin)" = "https://github.com/LibreOffice/core.git" && test "$(git -C vendor/libreoffice-reference rev-parse --is-shallow-repository)" = "true" && test -z "$(git -C vendor/libreoffice-reference status --short)"`.
   Result: pass.
   Evidence: official origin, shallow repository, detached exact-tag checkout, and clean upstream worktree; observed size 1.8 GiB and 149,172 upstream tracked files.
   Scope: acquisition provenance and bounded local footprint.
   Links: `docs/program/libreoffice-baseline.md`.
3. Command: `git check-ignore -q vendor/libreoffice-reference/ && test -z "$(git ls-files vendor/libreoffice-reference)"`.
   Result: pass.
   Evidence: root `.gitignore` owns the match and the parent repository tracks zero reference files.
   Scope: repository boundary.
   Links: `.gitignore`, `docs/program/libreoffice-baseline.md`.
4. Command: Node JSON parse/identity/license-evidence assertion against `docs/program/libreoffice-baseline.json`.
   Result: pass.
   Evidence: schema version 1; approved repository/tag/tag object/commit/path; `inventoryStatus=pending`; `parityClaim=false`; all four upstream evidence paths exist.
   Scope: machine-readable baseline artifact.
   Links: `docs/program/libreoffice-baseline.json`.
5. Command: Node local Markdown-link existence check, baseline/stale-claim `rg` checks, and `curl` validation of the four tag-pinned GitHub evidence links.
   Result: pass.
   Evidence: 28 local links resolved; stale pre-acquisition claims absent; README, COPYING, COPYING.LGPL, and COPYING.MPL links each returned HTTP 200.
   Scope: `README.md` and changed `docs/program/**` documents.
   Links: `README.md`, `docs/program/README.md`, `docs/program/roadmap.md`, `docs/program/test-strategy.md`, `docs/program/libreoffice-baseline.md`.
6. Command: `npm run format:check && node .agentplane/policy/check-routing.mjs && ap doctor`.
   Result: pass.
   Evidence: all files match Prettier; policy routing OK; doctor OK with zero errors, zero warnings, and two informational fallback/blueprint notices.
   Scope: changed documentation plus repository policy/AgentPlane health.
   Links: `docs/program/libreoffice-baseline.md`, `docs/program/libreoffice-baseline.json`.
7. Command: `git diff --check && git status --short --untracked-files=all`.
   Result: pass.
   Evidence: no whitespace errors; pre-commit status contains only the six approved documentation paths and task metadata, while the ignored checkout is absent.
   Scope: full task diff and repository cleanliness boundary.
   Links: all task-scoped paths.

## Rollback Plan

Before task closure, remove only the explicitly resolved ignored directory `vendor/libreoffice-reference/` if acquisition must be abandoned, and restore only this task’s scoped documentation changes. After commits exist, use a normal traceable revert rather than rewriting shared history. Re-acquisition is reproducible from the documented official repository, tag, and peeled commit.

## Findings

Baseline findings:
- The official annotated tag object is `eb55fbaf423db60b82b7fc8613c290b4849b6ba8`; it peels to the user-approved commit `9bc445578031fecf56086729d8e4940c77e14d65`.
- The shallow checkout contains 149,172 upstream tracked files and uses about 1.8 GiB locally, leaving about 25 GiB available after acquisition.
- Top-level upstream evidence includes README.md plus GPLv3, LGPLv3, and MPL 2.0 license texts. That mix does not prove one uniform license for every source, third-party component, document, font, media file, or fixture, so all tracked reuse requires per-file provenance and license review.
- No upstream material was copied into tracked Vite Office paths. Inventory and every parity claim remain pending Task 0.4.

Process findings:
- The gateway command `ap task advance <task-id> --agent-json` is not implemented by installed AgentPlane 0.6.26. The CLI returned `E_USAGE` and routed recovery to command help plus `task next-action --explain`.
- After `start-ready`, the route oracle unconditionally offered the configured managed runner even though the approved task and user instruction explicitly forbid runners. No runner run exists or was launched; execution followed the supported direct-workflow lifecycle manually.
- One pre-clone shell assertion used an unbraced zsh variable adjacent to `[[:space:]]`, which zsh parsed as a subscript. It failed before directory creation or cloning; the bounded retry used field-based comparison and succeeded without scope change.
