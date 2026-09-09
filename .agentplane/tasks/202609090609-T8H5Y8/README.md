---
id: "202609090609-T8H5Y8"
title: "Serve suite routes through nginx SPA fallback"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 12
origin:
  system: "manual"
depends_on: []
tags:
  - "ops"
verify:
  - "docker build --tag vite-office:spa-fallback-verify ."
  - "docker run --rm --detach --name vite-office-spa-fallback-verify --publish 127.0.0.1:4180:80 vite-office:spa-fallback-verify"
  - "curl --fail --silent --show-error http://127.0.0.1:4180/ http://127.0.0.1:4180/writer http://127.0.0.1:4180/calc --output /dev/null"
  - "docker stop vite-office-spa-fallback-verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-09T06:10:48.682Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-09T06:18:55.985Z"
  updated_by: "CODER"
  note: "Command: docker build --tag vite-office:spa-fallback-verify .; Result: pass after Docker daemon restart; production image built successfully. Command: docker run --rm --detach --name vite-office-spa-fallback-verify --publish 127.0.0.1:4180:80 vite-office:spa-fallback-verify; Result: pass. Command: curl probes for /, /writer, and /calc; Result: pass with 200 text/html and identical index.html SHA-256. Asset probes: emitted JavaScript returned 200 application/javascript; /assets/missing.js returned 404. Command: docker exec nginx -t; Result: configuration syntax successful. Command: docker stop; Result: temporary container stopped and removed. Command: git diff --check and git status; Result: pass with only Dockerfile, nginx/default.conf, and task artifacts changed. Unit and E2E tests were intentionally not run per approved verification scope."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Add the approved nginx SPA fallback and verify it through a locally built Docker image and HTTP probes."
  -
    author: "CODER"
    body: "Blocked: Docker CLI is installed, but the local Docker daemon is not running; container build verification cannot proceed."
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-09-09T06:10:57.891Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Add the approved nginx SPA fallback and verify it through a locally built Docker image and HTTP probes."
  -
    type: "status"
    at: "2026-09-09T06:12:05.298Z"
    author: "CODER"
    from: "DOING"
    to: "BLOCKED"
    note: "Blocked: Docker CLI is installed, but the local Docker daemon is not running; container build verification cannot proceed."
  -
    type: "status"
    at: "2026-09-09T06:13:21.498Z"
    author: "CODER"
    from: "BLOCKED"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-09-09T06:18:55.985Z"
    author: "CODER"
    state: "ok"
    note: "Command: docker build --tag vite-office:spa-fallback-verify .; Result: pass after Docker daemon restart; production image built successfully. Command: docker run --rm --detach --name vite-office-spa-fallback-verify --publish 127.0.0.1:4180:80 vite-office:spa-fallback-verify; Result: pass. Command: curl probes for /, /writer, and /calc; Result: pass with 200 text/html and identical index.html SHA-256. Asset probes: emitted JavaScript returned 200 application/javascript; /assets/missing.js returned 404. Command: docker exec nginx -t; Result: configuration syntax successful. Command: docker stop; Result: temporary container stopped and removed. Command: git diff --check and git status; Result: pass with only Dockerfile, nginx/default.conf, and task artifacts changed. Unit and E2E tests were intentionally not run per approved verification scope."
doc_version: 3
doc_updated_at: "2026-09-09T06:18:56.074Z"
doc_updated_by: "CODER"
description: "Configure the production nginx image so direct requests to /writer, /calc, and other client-side suite routes serve index.html instead of returning 404, while missing static assets still return 404."
sections:
  Summary: |-
    Serve suite routes through nginx SPA fallback

    Configure the production nginx image so direct requests to /writer, /calc, and other client-side suite routes serve index.html instead of returning 404, while missing static assets still return 404.
  Scope: |-
    - In scope: nginx SPA fallback configuration, Dockerfile wiring, and verification against a locally built/running production container.
    - Out of scope: React source changes, unit tests, Playwright E2E tests, live-server deployment, and reverse-proxy changes outside this repository.
    - Network use is approved only for pulling Docker build dependencies required by the local image build.
  Plan: "Add and wire a minimal nginx SPA fallback for application paths, preserve true 404 responses under /assets, and validate only through a real Docker build plus HTTP probes of the running container as explicitly requested."
  Verify Steps: |-
    1. Run `docker build --tag vite-office:spa-fallback-verify .`. Expected: the production image builds successfully using the new nginx configuration.
    2. Run `docker run --rm --detach --name vite-office-spa-fallback-verify --publish 127.0.0.1:4180:80 vite-office:spa-fallback-verify`. Expected: the container starts and publishes nginx locally.
    3. Run `curl --fail --silent --show-error http://127.0.0.1:4180/ http://127.0.0.1:4180/writer http://127.0.0.1:4180/calc --output /dev/null`. Expected: all three application paths return successful responses.
    4. Extract the emitted JavaScript asset path from `/`, request it, and request `/assets/missing.js`. Expected: the real asset returns 200 and the missing asset returns 404 rather than index.html.
    5. Run `docker stop vite-office-spa-fallback-verify`. Expected: the temporary `--rm` container stops and is removed.
    6. Run `git diff --check` and `git status --short --untracked-files=all`. Expected: no whitespace errors or unintended artifacts; only Dockerfile, the nginx configuration, and task artifacts are changed.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-09T06:18:55.985Z — VERIFY — ok

    By: CODER

    Note: Command: docker build --tag vite-office:spa-fallback-verify .; Result: pass after Docker daemon restart; production image built successfully. Command: docker run --rm --detach --name vite-office-spa-fallback-verify --publish 127.0.0.1:4180:80 vite-office:spa-fallback-verify; Result: pass. Command: curl probes for /, /writer, and /calc; Result: pass with 200 text/html and identical index.html SHA-256. Asset probes: emitted JavaScript returned 200 application/javascript; /assets/missing.js returned 404. Command: docker exec nginx -t; Result: configuration syntax successful. Command: docker stop; Result: temporary container stopped and removed. Command: git diff --check and git status; Result: pass with only Dockerfile, nginx/default.conf, and task artifacts changed. Unit and E2E tests were intentionally not run per approved verification scope.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-09T06:13:21.498Z, excerpt_hash=sha256:4a13c878f444b182a9ea8fb332949b1b37769781c2bf779132aeddb928e50181

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609090609-T8H5Y8/blueprint/resolved-snapshot.json
    - old_digest: c8dbfbf3ea833c32938391c974049404ca392bb93988b0f5b91f76d5806f88b0
    - current_digest: c8dbfbf3ea833c32938391c974049404ca392bb93988b0f5b91f76d5806f88b0
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609090609-T8H5Y8

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609090609-T8H5Y8
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task commit that adds the nginx configuration and Dockerfile copy instruction, rebuild the prior image, and redeploy it. Stop and remove any temporary local verification container."
  Findings: |-
    - Observation: The approved docker build could not connect to unix:///Users/odubinkin/.docker/run/docker.sock.
      Impact: The nginx image and route behavior cannot be verified until the local Docker daemon is running.
      Resolution: Start Docker Desktop or another local Docker daemon, then resume the task and rerun the declared Docker build and HTTP probes.
id_source: "generated"
---
## Summary

Serve suite routes through nginx SPA fallback

Configure the production nginx image so direct requests to /writer, /calc, and other client-side suite routes serve index.html instead of returning 404, while missing static assets still return 404.

## Scope

- In scope: nginx SPA fallback configuration, Dockerfile wiring, and verification against a locally built/running production container.
- Out of scope: React source changes, unit tests, Playwright E2E tests, live-server deployment, and reverse-proxy changes outside this repository.
- Network use is approved only for pulling Docker build dependencies required by the local image build.

## Plan

Add and wire a minimal nginx SPA fallback for application paths, preserve true 404 responses under /assets, and validate only through a real Docker build plus HTTP probes of the running container as explicitly requested.

## Verify Steps

1. Run `docker build --tag vite-office:spa-fallback-verify .`. Expected: the production image builds successfully using the new nginx configuration.
2. Run `docker run --rm --detach --name vite-office-spa-fallback-verify --publish 127.0.0.1:4180:80 vite-office:spa-fallback-verify`. Expected: the container starts and publishes nginx locally.
3. Run `curl --fail --silent --show-error http://127.0.0.1:4180/ http://127.0.0.1:4180/writer http://127.0.0.1:4180/calc --output /dev/null`. Expected: all three application paths return successful responses.
4. Extract the emitted JavaScript asset path from `/`, request it, and request `/assets/missing.js`. Expected: the real asset returns 200 and the missing asset returns 404 rather than index.html.
5. Run `docker stop vite-office-spa-fallback-verify`. Expected: the temporary `--rm` container stops and is removed.
6. Run `git diff --check` and `git status --short --untracked-files=all`. Expected: no whitespace errors or unintended artifacts; only Dockerfile, the nginx configuration, and task artifacts are changed.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-09T06:18:55.985Z — VERIFY — ok

By: CODER

Note: Command: docker build --tag vite-office:spa-fallback-verify .; Result: pass after Docker daemon restart; production image built successfully. Command: docker run --rm --detach --name vite-office-spa-fallback-verify --publish 127.0.0.1:4180:80 vite-office:spa-fallback-verify; Result: pass. Command: curl probes for /, /writer, and /calc; Result: pass with 200 text/html and identical index.html SHA-256. Asset probes: emitted JavaScript returned 200 application/javascript; /assets/missing.js returned 404. Command: docker exec nginx -t; Result: configuration syntax successful. Command: docker stop; Result: temporary container stopped and removed. Command: git diff --check and git status; Result: pass with only Dockerfile, nginx/default.conf, and task artifacts changed. Unit and E2E tests were intentionally not run per approved verification scope.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-09T06:13:21.498Z, excerpt_hash=sha256:4a13c878f444b182a9ea8fb332949b1b37769781c2bf779132aeddb928e50181

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609090609-T8H5Y8/blueprint/resolved-snapshot.json
- old_digest: c8dbfbf3ea833c32938391c974049404ca392bb93988b0f5b91f76d5806f88b0
- current_digest: c8dbfbf3ea833c32938391c974049404ca392bb93988b0f5b91f76d5806f88b0
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609090609-T8H5Y8

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609090609-T8H5Y8
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task commit that adds the nginx configuration and Dockerfile copy instruction, rebuild the prior image, and redeploy it. Stop and remove any temporary local verification container.

## Findings

- Observation: The approved docker build could not connect to unix:///Users/odubinkin/.docker/run/docker.sock.
  Impact: The nginx image and route behavior cannot be verified until the local Docker daemon is running.
  Resolution: Start Docker Desktop or another local Docker daemon, then resume the task and rerun the declared Docker build and HTTP probes.
