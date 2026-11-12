#!/usr/bin/env python3
"""Build the pinned upstream libxml2 DOM with the native APIs consumed by unoxml."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import tarfile

ROOT = Path(__file__).resolve().parent.parent
PACKAGE = ROOT / "third_party/libxml2-wasm"


def run(argv, *, cwd, env):
    """Run a checked build step without shell interpolation."""
    subprocess.run([str(arg) for arg in argv], cwd=cwd, env=env, check=True)


def main():
    """Verify source input, compile C and generate the exact consumed Emscripten API."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--emsdk", type=Path, default=ROOT / "node_modules/.cache/emsdk")
    args = parser.parse_args()
    sdk = args.emsdk.resolve()
    if not sdk.is_relative_to(ROOT):
        parser.error("The SDK must be inside this repository.")
    manifest = json.loads((PACKAGE / "source.json").read_text())
    sdk_commit = subprocess.check_output(["git", "-C", str(sdk), "rev-parse", "HEAD"], text=True).strip()
    if sdk_commit != manifest["emsdkCommit"]:
        raise RuntimeError("Unexpected emsdk source commit")
    archive = ROOT / "vendor/libxml2-reference" / f"libxml2-{manifest['version']}.tar.xz"
    if hashlib.sha256(archive.read_bytes()).hexdigest() != manifest["sha256"]:
        raise RuntimeError("Pinned libxml2 source SHA-256 mismatch")
    cache = ROOT / "node_modules/.cache/libxml2-wasm"
    cache.mkdir(parents=True, exist_ok=True)
    tmp = cache / "tmp"
    tmp.mkdir(exist_ok=True)
    env = dict(os.environ, EM_CONFIG=str(sdk / ".emscripten"),
               EM_CACHE=str(sdk / "upstream/emscripten/cache"), TMPDIR=str(tmp))
    run([sdk / "emsdk", "activate", manifest["emscriptenVersion"]], cwd=ROOT, env=env)
    tools = sdk / "upstream/emscripten"
    emcc = tools / "emcc"
    version = subprocess.check_output([str(emcc), "--version"], env=env, text=True)
    if manifest["emscriptenVersion"] not in version.splitlines()[0]:
        raise RuntimeError("Unexpected Emscripten compiler version")
    source = cache / f"libxml2-{manifest['version']}"
    if not source.exists():
        with tarfile.open(archive) as source_archive:
            source_archive.extractall(cache, filter="data")
    build = cache / "build"
    build.mkdir(exist_ok=True)
    if not (build / "Makefile").exists():
        run([tools / "emconfigure", source / "configure", "--without-iconv", "--without-python",
             "--without-zlib", "--without-lzma", "--with-sax1", "--without-threads",
             "--without-modules", "--disable-shared", "--enable-static", "CFLAGS=-O2 -flto"],
            cwd=build, env=env)
    run(["make", "-j4", "libxml2.la"], cwd=build, env=env)
    binding = (PACKAGE / "binding.c").read_text()
    fields = re.findall(r"^FIELD\([^,]+,\s*(\w+),", binding, re.MULTILINE)
    exports = ["_malloc", "_free", *["_" + f for f in manifest["nativeFunctions"]],
               "_office_xmlVersion", "_office_xmlFree", "_office_xmlXPathNodeSetGetLength",
               "_office_xmlXPathNodeSetItem", "_office_xmlParserInstallCallbacks"]
    exports.extend("_office_" + field + "_" + op for field in fields for op in ["get", "set"])
    run([emcc, PACKAGE / "binding.c", "-I" + str(build / "include"),
         "-I" + str(source / "include"), build / ".libs/libxml2.a", "--no-entry", "-O2", "-flto", "-Werror",
         "-sEXPORT_ES6=1", "-sMODULARIZE=1", "-sSINGLE_FILE=1", "-sALLOW_MEMORY_GROWTH=1",
         "-sALLOW_TABLE_GROWTH=1", "-sENVIRONMENT=web,worker,node",
         "-sEXPORTED_FUNCTIONS=" + json.dumps(exports),
         '-sEXPORTED_RUNTIME_METHODS=["HEAPU8","HEAP32","UTF8ToString","stringToUTF8","lengthBytesUTF8","getValue","setValue","addFunction","removeFunction"]',
         "-o", PACKAGE / "libxml2.mjs"], cwd=build, env=env)
    ast = json.loads(subprocess.check_output(
        [str(emcc), str(PACKAGE / "binding.c"), "-I" + str(build / "include"),
         "-I" + str(source / "include"), "-fsyntax-only", "-Xclang", "-ast-dump=json"],
        cwd=build, env=env, text=True))
    declarations = {}
    constants = {}

    def collect(node):
        """Collect genuine C function types, including macro-expanded struct accessors."""
        if node.get("kind") == "FunctionDecl":
            declarations["_" + node["name"]] = node
        enum_members = [member for member in node.get("inner", [])
                        if member.get("kind") == "EnumConstantDecl"]
        if node.get("kind") == "EnumDecl" and any(
                member["name"] in manifest["headerEnumAnchors"] for member in enum_members):
            current = 0
            for member in enum_members:
                if member.get("kind") != "EnumConstantDecl":
                    continue
                explicit = next((child for child in member.get("inner", [])
                                 if child.get("kind") == "ConstantExpr"), None)
                if explicit is not None:
                    current = int(explicit["value"])
                name = member["name"]
                if name.startswith(("XML_", "XPATH_")):
                    constants[name] = current
                current += 1
        for child in node.get("inner", []):
            collect(child)

    collect(ast)
    banner = "/** @fileoverview Generated native libxml2 header enum values from Clang AST; do not edit. */\n"
    (PACKAGE / "constants.mjs").write_text(banner + "".join(
        f"export const {name} = {value};\n" for name, value in sorted(constants.items())))
    (PACKAGE / "constants.d.ts").write_text(banner + "".join(
        f"export declare const {name}: number;\n" for name in sorted(constants)))
    signatures = []
    types = ['/** @fileoverview Generated from the pinned C headers and binding AST by scripts/build-libxml2-wasm.py; do not edit. */',
             'export interface LibXml2 {', '  HEAPU8: Uint8Array;', '  HEAP32: Int32Array;']
    for name in exports:
        declaration = declarations[name]
        c_type = declaration["type"]["qualType"]
        parameters = [n for n in declaration.get("inner", []) if n.get("kind") == "ParmVarDecl"]
        arguments = [f"{parameter.get('name', 'arg' + str(i))}: number"
                     for i, parameter in enumerate(parameters)]
        if declaration.get("variadic"):
            arguments.append("...args: number[]")
        result = "void" if c_type.startswith("void (") else "number"
        types.append(f"  {name}({', '.join(arguments)}): {result};")
        signatures.append({"name": name, "cType": c_type})
    types.extend([
        '  UTF8ToString(pointer: number, maxBytesToRead?: number): string;',
        '  lengthBytesUTF8(value: string): number;',
        '  stringToUTF8(value: string, pointer: number, maxBytes: number): void;',
        '  getValue(pointer: number, type: string): number;',
        '  setValue(pointer: number, value: number, type: string): void;',
        '  addFunction(callback: (...args: number[]) => number | void, signature: string): number;',
        '  removeFunction(pointer: number): void;',
        '}',
        'export default function createLibXml2(options?: Record<string, unknown>): Promise<LibXml2>;',
        '',
    ])
    (PACKAGE / "index.d.ts").write_text("\n".join(types))
    (PACKAGE / "generated-api.json").write_text(json.dumps(signatures, indent=2) + "\n")
    artifact = PACKAGE / "libxml2.mjs"
    result = {"sourceSha256": manifest["sha256"], "compiler": version.splitlines()[0],
                      "exportCount": len(exports), "enumConstantCount": len(constants), "artifact": str(artifact.relative_to(ROOT)),
                      "artifactSha256": hashlib.sha256(artifact.read_bytes()).hexdigest()}
    (PACKAGE / "artifact.json").write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps(result))


if __name__ == "__main__":
    main()
