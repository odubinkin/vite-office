#!/usr/bin/env python3
"""Build and smoke-test the ICU regex ABI using only local pinned build inputs."""

import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import tarfile
import tempfile

ROOT = Path(__file__).resolve().parents[1]
PACKAGE = ROOT / "third_party/icu-search-wasm"
OUTPUT = ROOT / "output/playwright/icu-regex-wasm"

SMOKE = """
import assert from "node:assert/strict";
import createModule from "./icu-search.mjs";

const module = await createModule();

function units(value) {
  return Array.from({ length: value.length }, (_, index) => value.charCodeAt(index));
}

function withText(text, action) {
  const pointer = module._malloc(Math.max(2, text.length * 2));
  assert.notEqual(pointer, 0);
  try {
    module.HEAPU16.set(units(text), pointer / 2);
    return action(pointer);
  } finally {
    module._free(pointer);
  }
}

const handle = withText("(?<=x)(😀)(z)?", (pointer) =>
  module._lo_regex_create(pointer, "(?<=x)(😀)(z)?".length, 0),
);
assert.notEqual(handle, 0);
try {
  withText("x😀!", (pointer) => {
    for (const [start, end, backward, expected] of [
      [1, 3, 0, [1, 3, 1, 3, -1, -1]],
      [3, 1, 1, [3, 1, 3, 1, -1, -1]],
    ]) {
      const groups = module._lo_regex_search(handle, pointer, 4, start, end, backward);
      assert.equal(groups, 3);
      const offset = module._lo_regex_offsets(handle) / 4;
      assert.deepEqual(Array.from(module.HEAP32.slice(offset, offset + groups * 2)), expected);
    }
  });
} finally {
  module._lo_regex_destroy(handle);
}
assert.equal(withText("(", (pointer) => module._lo_regex_create(pointer, 1, 0)), 0);
"""


def local_path(value):
    """Restrict SDK and host tools to this repository."""
    path = Path(value).resolve()
    if not path.is_relative_to(ROOT):
        raise argparse.ArgumentTypeError("Use a directory inside this repository.")
    return path


def check_pin(path, expected):
    """Verify a pinned native input before using it."""
    with path.open("rb") as stream:
        actual = hashlib.file_digest(stream, "sha256").hexdigest()
    if actual != expected:
        raise RuntimeError(f"Unexpected content hash for {path.name}.")


def run(args, cwd, env):
    """Execute one checked build step with structured arguments."""
    subprocess.run([str(arg) for arg in args], cwd=cwd, env=env, check=True)


def verify_inputs(pin, host):
    """Read the local source archive and verify the configured host ICU build."""
    archive = ROOT / f"vendor/.source-archives/icu4c-{pin['icuVersion']}-sources.tgz"
    check_pin(archive, pin["icuSourceSha256"])
    cross = (host / "config/icucross.mk").read_text()
    if not re.search(rf"^CROSS_ICU_VERSION={re.escape(pin['icuVersion'])}$", cross, re.MULTILINE):
        raise RuntimeError("Host ICU version differs from the source pin.")
    with tarfile.open(archive) as source:
        section = source.extractfile("icu/source/data/in/icudt78l.dat")
        if section is None or hashlib.file_digest(section, "sha256").hexdigest() != pin["icuDataSha256"]:
            raise RuntimeError("Archive ICU data differs from the source pin.")
    if not (host / "bin/pkgdata").is_file():
        raise RuntimeError("Host ICU build does not provide pkgdata.")
    return archive


def build(pin, sdk, host, archive, jobs):
    """Cross-build ICU and the binding, then publish only a smoke-tested artifact."""
    if not (sdk / "upstream/emscripten/em++").is_file() or not (sdk / ".emscripten").is_file():
        raise RuntimeError("Emscripten must already be installed and activated in the local SDK.")
    commit = subprocess.check_output(["git", "-C", str(sdk), "rev-parse", "HEAD"], text=True).strip()
    if commit != pin["emsdkCommit"]:
        raise RuntimeError("Unexpected local emsdk source commit.")
    tools = sdk / "upstream/emscripten"
    OUTPUT.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(dir=OUTPUT, prefix="build-") as temporary:
        work = Path(temporary)
        env = dict(os.environ, EM_CONFIG=str(sdk / ".emscripten"),
                   EM_CACHE=str(sdk / "upstream/emscripten/cache"), TMPDIR=temporary)
        version = subprocess.check_output([str(tools / "em++"), "--version"], env=env, text=True)
        if not re.search(rf"(?<![0-9.]){re.escape(pin['emscriptenVersion'])}(?![0-9.])",
                         version.splitlines()[0]):
            raise RuntimeError("Unexpected Emscripten compiler version.")

        with tarfile.open(archive) as packed:
            packed.extractall(work, filter="data")
        source = work / "icu/source"
        target = work / "target"
        target.mkdir()

        # Use the generic ELF make rules for static object assembly, then tell
        # pkgdata to emit C data instead of host-specific assembler.
        run(
            [
                tools / "emconfigure", source / "configure", "--host=wasm32-unknown-emscripten",
                f"--with-cross-build={host}", "--with-data-packaging=static",
                "--disable-shared", "--enable-static", "--disable-dyload", "--disable-tools",
                "--disable-extras", "--disable-tests", "--disable-samples", "--disable-strict",
                "icu_cv_host_frag=mh-linux", "ac_cv_c_bigendian=no",
                f"AR={tools / 'emar'}", f"RANLIB={tools / 'emranlib'}",
                "CFLAGS=-O2", "CXXFLAGS=-O2",
            ],
            target,
            env,
        )
        run(["make", f"-j{jobs}", "DATASUBDIR=data",
             f"PKGDATA_OPTS=-O {target / 'data/icupkg.inc'} -w"], target, env)

        exports = ["_malloc", "_free", *["_" + entry for entry in pin["abi"]]]
        run(
            [
                tools / "em++", PACKAGE / "regex-search.cxx", "--no-entry",
                "-std=c++17", "-O2", "-I", source / "common", "-I", source / "i18n",
                target / "lib/libicui18n.a", target / "lib/libicuuc.a",
                target / "lib/libicudata.a", "-sMODULARIZE=1", "-sEXPORT_ES6=1",
                "-sENVIRONMENT=web,worker,node", "-sALLOW_MEMORY_GROWTH=1",
                "-sEXPORTED_FUNCTIONS=" + json.dumps(exports),
                '-sEXPORTED_RUNTIME_METHODS=["HEAPU16","HEAP32"]',
                "-o", work / "icu-search.mjs",
            ],
            work,
            env,
        )
        smoke = work / "smoke.mjs"
        smoke.write_text(SMOKE)
        run(["node", smoke], work, env)
        for name in ["icu-search.mjs", "icu-search.wasm"]:
            shutil.copyfile(work / name, OUTPUT / name)


def main():
    """Parse repository-local inputs and optionally verify them without an SDK."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--host-icu", required=True, type=local_path)
    parser.add_argument("--emsdk", type=local_path, default=ROOT / "node_modules/.cache/emsdk")
    parser.add_argument("--jobs", type=int, default=4)
    parser.add_argument("--verify-inputs", action="store_true")
    args = parser.parse_args()
    if args.jobs < 1:
        parser.error("--jobs must be positive.")
    pin = json.loads((PACKAGE / "source.json").read_text())
    archive = verify_inputs(pin, args.host_icu)
    if args.verify_inputs:
        print(f"Verified ICU {pin['icuVersion']} source, data and local host tools.")
        return
    build(pin, args.emsdk, args.host_icu, archive, args.jobs)
    print(f"Built and tested the native ICU regex module in {OUTPUT.relative_to(ROOT)}.")


if __name__ == "__main__":
    main()
