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
               "_office_xmlXPathNodeSetItem", "_office_xmlParserInstallCallbacks", "_office_xmlXPathSetGenericError",
               "_office_xmlFastParserCallbacks"]
    exports.extend("_office_" + field + "_" + op for field in fields for op in ["get", "set"])
    exports.extend("_" + name for name in ["osl_createMutex", "osl_destroyMutex", "osl_acquireMutex",
                                         "osl_tryToAcquireMutex", "osl_releaseMutex", "osl_getGlobalMutex"])
    exports.extend("_office_std_mutex_" + operation for operation in ["create", "destroy", "lock", "unlock"])
    exports.extend("_" + name for name in ["getenv", "setenv", "unsetenv",
                                         "office_locale_codeset", "office_process_locale_lock",
                                         "office_process_locale_unlock"])
    exports.extend("_" + name for name in ["realpath", "abort", "close", "office_file_path_max",
                                         "office_file_errno", "office_file_open", "office_file_lock", "office_file_set_overflow"])
    exports.extend("_" + name for name in ["osl_getCurrentSecurity", "osl_freeSecurityHandle", "office_security_home", "geteuid"])
    exports.append("_office_local_hostname")
    exports.extend("_" + name for name in ["office_file_status_size", "office_file_access", "office_file_lstat", "office_file_dtype_type"])
    exports.extend("_" + name for name in ["office_file_stat", "office_file_copy_open", "office_file_set_errno", "rename", "unlink", "readlink", "symlink", "write", "mkdir", "rmdir", "getpid"])
    exports.extend("_" + name for name in ["opendir", "closedir", "readdir", "office_directory_name", "office_directory_type"])
    c_binding = build / "office-binding.o"
    cpp_binding = build / "office-std-mutex.o"
    run([emcc, "-c", PACKAGE / "binding.c", "-I" + str(build / "include"),
         "-I" + str(source / "include"), "-O2", "-flto", "-Werror", "-o", c_binding],
        cwd=build, env=env)
    run([tools / "em++", "-c", PACKAGE / "std-mutex.cxx", "-std=c++17",
         "-O2", "-flto", "-Werror", "-o", cpp_binding], cwd=build, env=env)
    run([tools / "em++", c_binding, cpp_binding, build / ".libs/libxml2.a", "--no-entry", "-O2", "-flto", "-Werror",
         "-sEXPORT_ES6=1", "-sMODULARIZE=1", "-sSINGLE_FILE=1", "-sALLOW_MEMORY_GROWTH=1",
         "-sALLOW_TABLE_GROWTH=1", "-sENVIRONMENT=web,worker,node",
         "-sEXPORTED_FUNCTIONS=" + json.dumps(exports),
         '-sEXPORTED_RUNTIME_METHODS=["FS","HEAPU8","HEAP32","UTF8ToString","stringToUTF8","lengthBytesUTF8","getValue","setValue","addFunction","removeFunction"]',
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
                def constant_expression(expression):
                    """Find Clang's evaluated constant through implicit casts (e.g. sizeof)."""
                    if expression.get("kind") == "ConstantExpr" and "value" in expression:
                        return expression
                    for child in expression.get("inner", []):
                        result = constant_expression(child)
                        if result is not None:
                            return result
                    return None

                explicit = constant_expression(member)
                if explicit is not None:
                    current = int(explicit["value"])
                name = member["name"]
                if name.startswith(("XML_", "XPATH_")) or name in manifest["headerEnumAnchors"]:
                    constants[name] = current
                current += 1
        for child in node.get("inner", []):
            collect(child)

    collect(ast)
    banner = "/** @fileoverview Generated selected native header enum values from Clang AST; do not edit. */\n"
    (PACKAGE / "constants.mjs").write_text(banner + "".join(
        f"export const {name} = {value};\n" for name, value in sorted(constants.items())))
    (PACKAGE / "constants.d.ts").write_text(banner + "".join(
        f"export declare const {name}: number;\n" for name in sorted(constants)))
    signatures = []
    types = ['/** @fileoverview Generated from the pinned C headers and binding AST by scripts/build-libxml2-wasm.py; do not edit. */',
             'export interface LibXml2 {', '  FS: EmscriptenFS;', '  HEAPU8: Uint8Array;', '  HEAP32: Int32Array;']
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
        '/** Actual public Emscripten4.0.19 FS API subset; opaque stream handles are returned by the runtime, never manufactured. */',
        'export interface EmscriptenFSStream { readonly fd: number; readonly path: string; readonly position: number; readonly stream_ops: { fsync?: (stream: EmscriptenFSStream) => number }; }',
        'export interface EmscriptenFSStat { readonly size: number; readonly mode: number; }',
        'export interface EmscriptenFS {',
        '  open(path: string, flags: string | number, mode?: number): EmscriptenFSStream;',
        '  close(stream: EmscriptenFSStream): void;',
        '  read(stream: EmscriptenFSStream, buffer: Uint8Array, offset: number, length: number, position?: number): number;',
        '  write(stream: EmscriptenFSStream, buffer: Uint8Array, offset: number, length: number, position?: number): number;',
        '  llseek(stream: EmscriptenFSStream, offset: number, whence: number): number;',
        '  getStreamChecked(fd: number): EmscriptenFSStream;',
        '  fstat(fd: number): EmscriptenFSStat;',
        '  stat(path: string): EmscriptenFSStat;',
        '  lstat(path: string): EmscriptenFSStat;',
        '  chmod(path: string, mode: number): void;',
        '  readlink(path: string): string;',
        '  ftruncate(fd: number, length: number): void;',
        '  mkdir(path: string, mode?: number): void;',
        '  unlink(path: string): void;',
        '  rmdir(path: string): void;',
        '  symlink(oldpath: string, newpath: string): void;',
        '  readdir(path: string): string[];',
        '}',
        'export default function createLibXml2(options?: Record<string, unknown>): Promise<LibXml2>;',

        '',
    ])
    (PACKAGE / "index.d.ts").write_text("\n".join(types))
    (PACKAGE / "generated-api.json").write_text(json.dumps(signatures, indent=2) + "\n")
    artifact = PACKAGE / "libxml2.mjs"
    result = {"sourceSha256": manifest["sha256"],
                      "fileBindingSha256": hashlib.sha256((PACKAGE / "osl-file.c").read_bytes()).hexdigest(),
                      "fileStatBindingSha256": hashlib.sha256((PACKAGE / "osl-file-stat.c").read_bytes()).hexdigest(),
                      "localeBindingSha256": hashlib.sha256((PACKAGE / "osl-locale.c").read_bytes()).hexdigest(),
                      "securityBindingSha256": hashlib.sha256((PACKAGE / "osl-security.c").read_bytes()).hexdigest(),
                      "socketBindingSha256": hashlib.sha256((PACKAGE / "osl-socket.c").read_bytes()).hexdigest(),
                      "cppBindingSha256": hashlib.sha256((PACKAGE / "std-mutex.cxx").read_bytes()).hexdigest(),
                      "emsdkCommit": sdk_commit,
                      "compiler": version.splitlines()[0],
                      "exportCount": len(exports), "enumConstantCount": len(constants), "artifact": str(artifact.relative_to(ROOT)),
                      "artifactSha256": hashlib.sha256(artifact.read_bytes()).hexdigest()}
    (PACKAGE / "artifact.json").write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps(result))


if __name__ == "__main__":
    main()
