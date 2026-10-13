/** @fileoverview Builds the complete original desktop exception/environment/mapping bridge without alternate library providers. */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { prepareCaseNative } from "./casefolding-native-build.mjs";
import { hash, loadUnicodeOriginal, upstream } from "./rtl-ustring-native-sources.mjs";
import { originalDependency } from "./casefolding-native-libraries.mjs";
/** Genuine original build inputs and desktop library loader layout. @param target - Owned ignored build directory. @returns Original build and source provenance. */
export function prepareExceptionNative(target) {
  const native = prepareCaseNative(target);
  rmSync(`${target}/idl`, { recursive: true, force: true });
  rmSync(`${target}/generated`, { recursive: true, force: true });
  const configure = loadUnicodeOriginal(native.sources, "configure.ac");
  const start = configure.indexOf(
    "AC_MSG_CHECKING([whether $CXX_BASE defines __base_class_type_info",
  );
  if (start < 0) throw Error("Missing original cxxabi configure probes");
  const scope = configure.slice(start, configure.indexOf("AC_SUBST(HAVE_GCC_AVX)", start));
  let configuration = loadUnicodeOriginal(native.sources, "config_host/config_cxxabi.h.in");
  const probes = [
    ...scope.matchAll(
      /AC_COMPILE_IFELSE\(\[AC_LANG_SOURCE\(\[([\s\S]*?)\]\)\], \[\s*AC_DEFINE\(\[(HAVE_CXXABI_H_[A-Z_]+)\],\[1\]\)/g,
    ),
  ];
  if (probes.length !== 10) throw Error("Changed original cxxabi probe set");
  native.manifest.featureProbes = [];
  mkdirSync(`${target}/headers`, { recursive: true });
  for (const [, source, name] of probes) {
    const path = `${target}/${name}.cpp`;
    writeFileSync(path, source);
    const argv = [...native.flags, "-fsyntax-only", path];
    const result = spawnSync("clang++", argv, { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
    writeFileSync(path + ".stdout", result.stdout ?? "");
    writeFileSync(path + ".stderr", result.stderr ?? "");
    native.manifest.featureProbes.push({
      name,
      tool: "clang++",
      argv,
      sourceHash: hash(source),
      exitCode: result.status,
      signal: result.signal,
      stdoutHash: hash(result.stdout ?? ""),
      stderrHash: hash(result.stderr ?? ""),
    });
    if (result.signal !== null || ![0, 1].includes(result.status))
      throw Error("Original cxxabi detection failed " + name);
    if (result.status === 0)
      configuration = configuration.replace(`#define ${name} 0`, `#define ${name} 1`);
  }
  writeFileSync(`${target}/headers/config_cxxabi.h`, configuration);
  native.manifest.configurations["config_cxxabi.h"] = hash(configuration);
  native.save();

  // Original configure.ac enables the usable UNIX dlsym API on this platform.
  const loaderProbe =
    '#include <dlfcn.h>\nint main(){return dlsym(RTLD_DEFAULT, "dladdr")==nullptr;}\n';
  writeFileSync(`${target}/loader-probe.cpp`, loaderProbe);
  native.run(
    "clang++",
    ["-std=c++20", `${target}/loader-probe.cpp`, "-o", `${target}/loader-probe`],
    "native-unix-dlapi-link",
  );
  native.run(`${target}/loader-probe`, [], "native-unix-dlapi-observed");
  const originalGlobal = readFileSync(
    "output/playwright/task39-native-types/headers/config_global.h",
    "utf8",
  );
  const configuredGlobal = originalGlobal
    .replace("#define HAVE_DLAPI 0", "#define HAVE_DLAPI 1")
    .replace("#define HAVE_UNIX_DLAPI 0", "#define HAVE_UNIX_DLAPI 1");
  if (configuredGlobal === originalGlobal)
    throw Error("Changed native loader feature configuration");
  writeFileSync(`${target}/headers/config_global.h`, configuredGlobal);
  native.manifest.configurations["config_global.h"] = hash(configuredGlobal);
  native.manifest.loaderProbe = {
    sourceHash: hash(loaderProbe),
    originalGlobalHash: hash(originalGlobal),
    configuredGlobalHash: hash(configuredGlobal),
    rule: "configure.ac AC_SEARCH_LIBS dlsym and HAVE_DLAPI/HAVE_UNIX_DLAPI",
  };
  native.save();
  const roots = ["udkapi", "offapi", "cppuhelper/unotypes"];
  const selected = [
    "com.sun.star.lang.DisposedException",
    "com.sun.star.lang.IllegalArgumentException",
    "com.sun.star.ucb.InteractiveAugmentedIOException",
    "com.sun.star.ucb.NameClashException",
    "cppuhelper.detail.XExceptionThrower",
  ];
  const seen = new Set(),
    loaded = new Set();
  /** Copies complete original IDL dependencies into the genuine parser input directory. @param name - Fully qualified IDL declaration. @returns Nothing. */
  function idl(name) {
    if (seen.has(name)) return;
    seen.add(name);
    const relative = name.replaceAll(".", "/") + ".idl";
    const root = roots.find(
      /** Finds the real original declaration path. @param r - Original IDL root. @returns Whether declaration exists. */ (
        r,
      ) => existsSync(`${upstream}/${r}/${relative}`),
    );
    if (root === undefined) return;
    loaded.add(name);
    const source = loadUnicodeOriginal(native.sources, `${root}/${relative}`);
    const destination = `${target}/idl/${relative}`;
    mkdirSync(destination.slice(0, destination.lastIndexOf("/")), { recursive: true });
    writeFileSync(destination, source);
    for (const match of source
      .replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, "")
      .matchAll(/(?:com|cppuhelper)(?:::[A-Za-z_][A-Za-z_0-9]*)+/g))
      idl(match[0].replaceAll("::", "."));
  }
  for (const name of [...selected, "com.sun.star.uno.TypeClass"]) idl(name);
  native.run(
    "output/playwright/task39-native-types/cppumaker",
    [
      "-C",
      "-nD",
      "-T",
      [...loaded].sort().join(";"),
      "-O",
      resolve(`${target}/generated`),
      pathToFileURL(resolve(`${target}/idl`)).href,
    ],
    "original-desktop-exception-types",
  );
  /** Hashes every genuine generated file, including dependent declarations if emitted. @param dir - Generated directory. @returns Nothing. */
  function generated(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const p = dir + "/" + entry.name;
      if (entry.isDirectory()) generated(p);
      else native.manifest.generatedHashes[p] = hash(readFileSync(p));
    }
  }
  generated(`${target}/generated`);
  loadUnicodeOriginal(native.sources, "bridges/Library_cpp_uno.mk");
  loadUnicodeOriginal(native.sources, "cppu/Library_cppu.mk");
  loadUnicodeOriginal(native.sources, "cppuhelper/Library_cppuhelper.mk");
  const cppu = [
    "any",
    "data",
    "sequence",
    "cascade_mapping",
    "check",
    "EnvDcp",
    "EnvStack",
    "IdentityMapping",
    "lbenv",
    "lbmap",
    "loadmodule",
  ].map(
    /** Selects complete original CPPU units. @param name - Original unit. @returns Original path. */ (
      name,
    ) => `cppu/source/uno/${name}.cxx`,
  );
  const bridge = [
    ...[
      "bridge",
      "component",
      "types",
      "unointerfaceproxy",
      "vtablefactory",
      "vtables",
      "cppinterfaceproxy",
    ].map(
      /** Selects complete original shared bridge units. @param name - Unit. @returns Original path. */ (
        name,
      ) => `bridges/source/cpp_uno/shared/${name}.cxx`,
    ),
    ...["abi", "cpp2uno", "uno2cpp", "callvirtualfunction"].map(
      /** Original macOS AARCH64 platform selected by Library_cpp_uno.mk. @param name - Unit. @returns Original path. */ (
        name,
      ) => `bridges/source/cpp_uno/gcc3_linux_aarch64/${name}.cxx`,
    ),
    "bridges/source/cpp_uno/gcc3_linux_aarch64/vtableslotcall.s",
  ];
  /** Builds whole unchanged sources with full matching instrumentation and actual loader paths. @param sanitized - Original dependency instrumentation. @returns Genuine native library paths. */
  function build(sanitized) {
    const label = sanitized ? "asan" : "normal",
      dir = `${target}/${label}`;
    mkdirSync(dir, { recursive: true });
    const instrument = sanitized
      ? ["-fsanitize=address,undefined", "-fno-omit-frame-pointer", "-g"]
      : [];
    const flags = [
      `-I${target}/headers`,
      ...native.flags,
      ...instrument,
      "-DCPPU_ENV=gcc3",
      `-I${target}/generated`,
      "-Ivendor/libreoffice-reference/bridges/inc",
      "-Ivendor/libreoffice-reference/bridges/source/cpp_uno/shared",
      "-Ivendor/libreoffice-reference/cppu/source/uno",
      "-Ivendor/libreoffice-reference/sal/inc",
      "-Ivendor/libreoffice-reference/sal/osl/unx",
    ];
    /** Compiles one complete original unit and records all included source blobs. @param relative - Original source. @returns Genuine compiled object. */
    function compile(relative) {
      loadUnicodeOriginal(native.sources, relative);
      const object = `${dir}/${relative.replaceAll("/", "_")}.o`,
        dependency = object + ".d";
      native.run(
        relative.endsWith(".c") ? "clang" : "clang++",
        [
          ...(relative.endsWith(".c")
            ? flags.map(
                /** Original C translation units retain their native language. @param flag - Compiler option. @returns C-compatible option. */ (
                  flag,
                ) => (flag === "-std=c++20" ? "-std=gnu11" : flag),
              )
            : flags),
          "-DCPPU_DLLIMPLEMENTATION",
          ...(relative.endsWith(".s") ? ["-x", "assembler-with-cpp"] : []),
          "-MMD",
          "-MF",
          dependency,
          "-c",
          `${upstream}/${relative}`,
          "-o",
          object,
        ],
        label + "-" + relative.replaceAll("/", "_"),
      );
      for (const file of readFileSync(dependency, "utf8").replaceAll("\\\n", " ").split(/\s+/))
        if (file.startsWith(`${upstream}/`))
          loadUnicodeOriginal(native.sources, originalDependency(file));
      return object;
    }
    const objects = native.libraries(sanitized);
    for (const unit of [
      "sal/osl/unx/conditn.cxx",
      "sal/osl/unx/module.cxx",
      "sal/osl/unx/backtraceapi.cxx",
      "sal/osl/unx/backtrace.c",
      "sal/rtl/uuid.cxx",
      "sal/rtl/random.cxx",
      "sal/osl/unx/random.cxx",
      "sal/rtl/digest.cxx",
    ])
      objects.push(compile(unit));
    for (const unit of cppu) objects.push(compile(unit));
    const framework = [
      "-framework",
      "CoreFoundation",
      "-framework",
      "Foundation",
      "-pthread",
      "-lz",
    ];
    native.run(
      "clang++",
      [
        ...instrument,
        "-dynamiclib",
        ...objects,
        ...framework,
        "-Wl,-install_name,@rpath/libcppu-sal.dylib",
        "-o",
        `${dir}/libcppu-sal.dylib`,
      ],
      label + "-link-original-cppu-sal",
    );
    const bridgeObjects = bridge.map(compile);
    native.run(
      "clang++",
      [
        ...instrument,
        "-dynamiclib",
        ...bridgeObjects,
        `-L${dir}`,
        "-lcppu-sal",
        ...framework,
        "-Wl,-rpath,@loader_path",
        "-Wl,-install_name,@rpath/libgcc3_uno.dylib",
        "-o",
        `${dir}/libgcc3_uno.dylib`,
      ],
      label + "-link-original-desktop-bridge",
    );
    const exception = compile("cppuhelper/source/exc_thrower.cxx");
    const dependency = `${dir}/caller.d`;
    native.run(
      "clang++",
      [
        ...flags,
        "-MMD",
        "-MF",
        dependency,
        `${target}/driver.cpp`,
        exception,
        `-L${dir}`,
        "-lcppu-sal",
        ...framework,
        "-Wl,-rpath,@executable_path",
        "-o",
        `${dir}/caller`,
      ],
      label + "-link-original-exception-caller",
    );
    for (const file of readFileSync(dependency, "utf8").replaceAll("\\\n", " ").split(/\s+/))
      if (file.startsWith(`${upstream}/`))
        loadUnicodeOriginal(native.sources, originalDependency(file));
    return `${dir}/caller`;
  }
  return { ...native, build };
}
