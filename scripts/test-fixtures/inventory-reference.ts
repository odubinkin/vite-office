/** @fileoverview Supplies authored inventory CLI inputs without reading the pinned upstream checkout. */

import { execFile } from "node:child_process";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import type {
  BaselineCorpus,
  BaselineManifest,
  CoreTestKind,
} from "../libreoffice-inventory/contracts";
import type { GitExecutor } from "../libreoffice-inventory/git";

const executeFile = promisify(execFile);
const tag = "inventory-fixture-tag";
const kinds: readonly CoreTestKind[] = ["CppunitTest", "JunitTest", "PythonTest", "UITest"];
const counts = { CppunitTest: 415, JunitTest: 58, PythonTest: 13, UITest: 79 };

/** Builds marker-only owned evidence for CLI composition tests, without copying source bodies. @param manifest - Local mapping declarations. @returns Authored path-to-marker fixture text. */
export function createMarkerEvidenceFixture(manifest: unknown): ReadonlyMap<string, string> {
  const result = new Map<string, string>();
  /** Collects declared markers recursively. @param value - Candidate declaration. @returns Nothing after collecting references. */
  function visit(value: unknown): void {
    if (Array.isArray(value)) {
      for (const entry of value) visit(entry);
    } else if (value !== null && typeof value === "object") {
      const record = value as Record<string, unknown>;
      if (typeof record.path === "string" && typeof record.marker === "string") {
        result.set(record.path, `${result.get(record.path) ?? ""}\n${record.marker}`);
      }
      for (const entry of Object.values(record)) visit(entry);
    }
  }
  visit(manifest);
  return result;
}

/** Describes test-owned files and an explicit deterministic Git boundary. */
export interface InventoryCliFixture {
  /** Temporary repository-local directory removed by its caller. */
  readonly directory: string;
  /** Test-owned reference root. */
  readonly referenceRoot: string;
  /** Test-owned baseline manifest path. */
  readonly baselinePath: string;
  /** Constructor linkage input path. */
  readonly constructorsPath: string;
  /** Physical source-target linkage input path. */
  readonly sourceTargetsPath: string;
  /** Explicit Git fixture; omitted by the real-Git adapter test. */
  readonly git: GitExecutor;
}

/** Creates unique repository-local scratch storage. @returns A temporary directory owned by one test. */
async function createDirectory(): Promise<string> {
  const scratch = path.resolve(".agentplane/tmp/inventory-test-fixtures");
  await mkdir(scratch, { recursive: true });
  return mkdtemp(path.join(scratch, "case-"));
}

/** Creates sequential synthetic paths. @param count - Number of paths. @param prefix - Path prefix. @param suffix - Path suffix. @returns Unique ordered paths. */
function sequence(count: number, prefix: string, suffix = ""): string[] {
  const result: string[] = [];
  for (let index = 0; index < count; index += 1) result.push(`${prefix}${index}${suffix}`);
  return result;
}

/** Writes an owned UTF-8 fixture with its parent directories. @param file - Destination. @param text - Authored contents. @returns A promise resolving after writing. */
async function writeFixture(file: string, text: string): Promise<void> {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, text, "utf8");
}

/** Creates a corpus declaration for a synthetic reference. @param id - Corpus identity. @returns A manifest corpus with a one-file acquisition floor. */
function corpus(id: BaselineCorpus["id"]): BaselineCorpus {
  return {
    id,
    commit: `fixture-${id}-commit`,
    repository: `https://example.invalid/inventory/${id}.git`,
    referencePath: id === "core" ? "reference/" : `reference/${id}/`,
    tagObject: `fixture-${id}-tag`,
    trackedFiles: 1,
  };
}

/** Creates a synthetic baseline with all four required corpus contracts. @returns A strict version-two baseline. */
function baseline(): BaselineManifest {
  const core = corpus("core");
  return {
    schemaVersion: 2,
    commit: core.commit,
    repository: core.repository,
    referencePath: core.referencePath,
    tagObject: core.tagObject,
    tag,
    corpora: [core, corpus("dictionaries"), corpus("helpcontent2"), corpus("translations")],
  };
}

/** Creates authored CLI inputs satisfying unchanged count guards. @returns Owned files and a deterministic Git adapter, without upstream reads. */
export async function createInventoryCliFixture(): Promise<InventoryCliFixture> {
  const directory = await createDirectory();
  const referenceRoot = path.join(directory, "reference");
  const manifest = baseline();
  const baselinePath = path.join(directory, "baseline.json");
  const constructorsPath = path.join(directory, "constructors.json");
  const sourceTargetsPath = path.join(directory, "source-targets.json");
  const files = new Map<string, string>();
  const records = [];
  const grep = new Map<string, string>();
  for (const kind of kinds) {
    const referencePath = `fixture/${kind}_fixture.mk`;
    const lines: string[] = [];
    const matches: string[] = [];
    for (let index = 0; index < counts[kind]; index += 1) {
      const testName = `fixture_${index}`;
      const line = index + 1;
      const source = `$(eval $(call gb_${kind}_${kind},${testName}))`;
      lines.push(source);
      matches.push(`${referencePath}:${line}:${source}`);
      records.push({
        commit: manifest.commit,
        corpusId: "core",
        kind,
        line,
        testName,
        referencePath,
        id: `LO-CORE-TEST:${kind}:${referencePath}:${line}`,
        mappingStatus: "unmapped",
      });
    }
    files.set(referencePath, `${lines.join("\n")}\n`);
    grep.set(kind, `${matches.join("\n")}\n`);
  }
  const cpp = sequence(684, "fixture/source_", ".cxx");
  const java = sequence(156, "fixture/java_", ".java");
  const python = sequence(59, "fixture/python/module_", ".py");
  const ui = sequence(649, "fixture/ui/modules/test_", ".py");
  files.set(
    "fixture/CppunitTest_fixture.mk",
    `${files.get("fixture/CppunitTest_fixture.mk")}$(eval $(call gb_CppunitTest_add_exception_objects,fixture_0,${sequence(684, "fixture/source_").join(" ")} $(if $(FLAG_0),fixture/optional0) $(if $(FLAG_1),fixture/optional1)))\n`,
  );
  files.set(
    "fixture/JunitTest_fixture.mk",
    `${files.get("fixture/JunitTest_fixture.mk")}$(eval $(call gb_JunitTest_add_sourcefiles,fixture_0,${sequence(160, "fixture/java_").join(" ")}))\n`,
  );
  files.set(
    "fixture/PythonTest_fixture.mk",
    `${files.get("fixture/PythonTest_fixture.mk")}$(eval $(call gb_PythonTest_add_modules,fixture_0,$(SRCDIR)/fixture/python,${sequence(59, "module_").join(" ")}))\n`,
  );
  files.set(
    "fixture/UITest_fixture.mk",
    `${files.get("fixture/UITest_fixture.mk")}$(eval $(call gb_UITest_add_modules,fixture_0,$(SRCDIR)/fixture/ui,modules))\n`,
  );
  files.set(
    "fixture/source_0.cxx",
    `${sequence(3508, "CPPUNIT_TEST(test_", ");").join("\n")}\n${sequence(4564, "CPPUNIT_TEST_FIXTURE(Fixture, fixture_", ") {}").join("\n")}\n`,
  );
  for (const [file, text] of files) await writeFixture(path.join(referenceRoot, file), text);
  const tracked = new Map<string, readonly string[]>([
    ["core", [...files.keys(), ...cpp.slice(1), ...java, ...python, ...ui]],
    [
      "dictionaries",
      [
        ...sequence(98, "fixture/dictionary_", ".aff"),
        ...sequence(147, "fixture/dictionary_", ".dic"),
      ],
    ],
  ]);
  const help: string[] = [];
  const areas = {
    sbasic: 433,
    scalc: 513,
    schart: 58,
    sdatabase: 88,
    sdraw: 42,
    shared: 931,
    simpress: 182,
    smath: 76,
    swriter: 423,
  };
  for (const [area, count] of Object.entries(areas))
    help.push(...sequence(count, `source/text/${area}/fixture_`, ".xhp"));
  tracked.set("helpcontent2", help);
  const catalogs: string[] = [];
  for (let index = 0; index < 25_699; index += 1)
    catalogs.push(`source/locale-${index % 131}/domain/fixture_${index}.po`);
  tracked.set("translations", catalogs);
  await writeFixture(baselinePath, JSON.stringify(manifest));
  await writeFixture(
    constructorsPath,
    JSON.stringify({
      coreCommit: manifest.commit,
      corpusId: "core",
      generatedBy: "inventory:tests",
      records,
      schemaVersion: 1,
      summary: counts,
    }),
  );
  await writeFixture(
    sourceTargetsPath,
    JSON.stringify({
      coreCommit: manifest.commit,
      corpusId: "core",
      generatedBy: "inventory:test-source-targets",
      schemaVersion: 1,
      summary: { expression: 2, tracked: 684 },
      records: [
        {
          commit: manifest.commit,
          constructorId: records[0]?.id,
          corpusId: "core",
          declarationPath: "fixture/CppunitTest_fixture.mk",
          declaredTarget: "fixture/source_0",
          id: "fixture-source-0",
          mappingStatus: "unmapped",
          sourcePath: "fixture/source_0.cxx",
          targetStatus: "tracked",
        },
      ],
    }),
  );
  return {
    directory,
    referenceRoot,
    baselinePath,
    constructorsPath,
    sourceTargetsPath,
    git: {
      /** Answers only declared fixture Git operations. @param repositoryPath - Selected fixture corpus. @param argumentsList - Read-only command. @returns Synthetic Git stdout. */
      async run(repositoryPath: string, argumentsList: readonly string[]): Promise<string> {
        const id =
          path.basename(repositoryPath) === "reference" ? "core" : path.basename(repositoryPath);
        const declaration = manifest.corpora.find(
          /** Selects the requested corpus. @param entry - Declared corpus. @returns Whether its identity matches. */
          (entry) => entry.id === id,
        );
        if (
          declaration === undefined ||
          path.resolve(repositoryPath) !== path.resolve(referenceRoot, id === "core" ? "" : id)
        )
          throw new Error(`Unexpected fixture root: ${repositoryPath}`);
        const command = argumentsList.join(" ");
        if (command === "rev-parse HEAD") return `${declaration.commit}\n`;
        if (command === "remote get-url origin") return `${declaration.repository}\n`;
        if (command === `rev-parse refs/tags/${tag}^{tag}`) return `${declaration.tagObject}\n`;
        if (command === "rev-parse --is-shallow-repository") return "true\n";
        if (command === "status --short") return "";
        if (command === "ls-files -z") return `${tracked.get(id)?.join("\0")}\0`;
        if (id === "core" && argumentsList[0] === "grep") {
          for (const kind of kinds)
            if (argumentsList[2] === `gb_${kind}_${kind}`) return grep.get(kind) as string;
        }
        throw new Error(`Unexpected fixture Git command: ${command}`);
      },
    },
  };
}

/** Runs fixture-local Git without consulting user Git configuration or contacting a remote. @param repository - Owned repository path. @param args - Git arguments. @returns Command stdout. */
async function runFixtureGit(repository: string, args: readonly string[]): Promise<string> {
  const result = await executeFile(
    "git",
    [
      "-c",
      "user.name=Inventory Fixture",
      "-c",
      "user.email=fixture@example.invalid",
      "-c",
      "core.hooksPath=/dev/null",
      "-C",
      repository,
      ...args,
    ],
    {
      env: {
        ...process.env,
        GIT_CONFIG_NOSYSTEM: "1",
        GIT_CONFIG_GLOBAL: "/dev/null",
        GIT_AUTHOR_DATE: "2026-01-01T00:00:00Z",
        GIT_COMMITTER_DATE: "2026-01-01T00:00:00Z",
      },
    },
  );
  return result.stdout.trim();
}

/** Creates four small repositories for the default production Git executor test. @returns Actual owned Git identities and a baseline file. */
export async function createGitReferenceFixture(): Promise<
  Pick<InventoryCliFixture, "directory" | "referenceRoot" | "baselinePath">
> {
  const directory = await createDirectory();
  const referenceRoot = path.join(directory, "reference");
  const initial = baseline();
  const corpora: BaselineCorpus[] = [];
  for (const entry of initial.corpora) {
    const repository = path.join(referenceRoot, entry.id === "core" ? "" : entry.id);
    await mkdir(repository, { recursive: true });
    await runFixtureGit(repository, ["init", "--template=", "--initial-branch=fixture"]);
    await writeFixture(
      path.join(repository, ".gitignore"),
      "/dictionaries/\n/helpcontent2/\n/translations/\n",
    );
    await writeFixture(path.join(repository, "fixture.txt"), `Owned ${entry.id} fixture\n`);
    await runFixtureGit(repository, ["add", "."]);
    await runFixtureGit(repository, ["commit", "-m", "Create owned fixture"]);
    await runFixtureGit(repository, ["tag", "-a", tag, "-m", "Owned annotated fixture tag"]);
    await runFixtureGit(repository, ["remote", "add", "origin", entry.repository]);
    const commit = await runFixtureGit(repository, ["rev-parse", "HEAD"]);
    await writeFixture(path.join(repository, ".git/shallow"), `${commit}\n`);
    corpora.push({
      ...entry,
      commit,
      tagObject: await runFixtureGit(repository, ["rev-parse", `refs/tags/${tag}^{tag}`]),
    });
  }
  const core = corpora[0] as BaselineCorpus;
  const baselinePath = path.join(directory, "baseline.json");
  await writeFixture(
    baselinePath,
    JSON.stringify({ ...initial, commit: core.commit, tagObject: core.tagObject, corpora }),
  );
  return { directory, referenceRoot, baselinePath };
}
