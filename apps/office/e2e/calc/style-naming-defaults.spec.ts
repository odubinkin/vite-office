/** @fileoverview Actual native Calc style-name conversion and static pool defaults in Chromium and a DOM-free Worker. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "../shared/kernel-fixture";
const nativeExports = [
  { module: "src/sc/source/core/data/docpool.ts", names: ["ScDocumentPool"] },
  { module: "src/sc/inc/attrib.ts", names: ["ScPageHFItem"] },
  { module: "src/svx/inc/pageitem.ts", names: ["SvxSetItem"] },
  { module: "src/editeng/inc/editobj.ts", names: ["EditTextObjectImpl", "TextRotation"] },
  { module: "src/tools/inc/mapunit.ts", names: ["MapUnit"] },
  { module: "src/svl/inc/languageoptions.ts", names: ["SvtScriptType"] },
  { module: "src/sc/inc/stylehelper.ts", names: ["ScStyleNameConversion"] },
  { module: "src/svl/inc/style-values.ts", names: ["SfxStyleFamily"] },
  { module: "src/i18nlangtag/source/isolang/isolang.tables.ts", names: ["unicode", "text"] },
] as const;
/** Actual source exports in both realms. */
type Runtime = typeof import("../../src/sc/source/core/data/docpool") &
  typeof import("../../src/sc/inc/attrib") &
  typeof import("../../src/svx/inc/pageitem") &
  typeof import("../../src/editeng/inc/editobj") &
  typeof import("../../src/tools/inc/mapunit") &
  typeof import("../../src/svl/inc/languageoptions") &
  typeof import("../../src/sc/inc/stylehelper") &
  typeof import("../../src/svl/inc/style-values") &
  typeof import("../../src/i18nlangtag/source/isolang/isolang.tables");
test("retains native style-name aliases and static page defaults in the DOM-free Worker", /** Executes actual source classes without a replacement model. @param fixtures - Browser page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/calc");
  await installKernelFixture(page, "CalcStyleDefaultsFixture", nativeExports);
  const results = await page.evaluate(
    /** Executes identical real native operations in both environments. @returns Source observations. */ async () => {
      /** Reads actual source names and static defaults. @returns Initialized source results. */ function run() {
        const n = (globalThis as unknown as { CalcStyleDefaultsFixture: Runtime })
            .CalcStyleDefaultsFixture,
          pool = new n.ScDocumentPool(),
          other = new n.ScDocumentPool(),
          input = n.unicode("Heading1"),
          encoded = n.ScStyleNameConversion.DisplayToProgrammaticName(input, n.SfxStyleFamily.Para),
          decoded = n.ScStyleNameConversion.ProgrammaticToDisplayName(input, n.SfxStyleFamily.Para);
        const item = (pool.GetPoolDefaultItem(177) as InstanceType<typeof n.ScPageHFItem>).Clone(),
          owner = new n.EditTextObjectImpl(
            null,
            n.MapUnit.Map100thMM,
            false,
            n.TextRotation.NONE,
            n.SvtScriptType.LATIN,
          ),
          value = n.unicode("Header 😀"),
          base = pool.Clone();
        owner.CreateAndInsertContent().SetText(value);
        item.SetLeftArea(owner);
        const clone = item.Clone(other),
          area = clone.GetLeftArea();
        if (!area) throw Error("Missing native owned text");
        const output = area.GetText();
        item.SetLeftArea(item.GetLeftArea() as NonNullable<ReturnType<typeof item.GetLeftArea>>);
        try {
          return {
            header: {
              nullDefaults: [177, 178, 179, 180, 181, 182].every(
                /** Reads each original null default. @param id - Which. @returns Null areas. */ (
                  id,
                ) => {
                  const entry = pool.GetPoolDefaultItem(id) as InstanceType<typeof n.ScPageHFItem>;
                  return (
                    entry.GetLeftArea() === null &&
                    entry.GetCenterArea() === null &&
                    entry.GetRightArea() === null
                  );
                },
              ),
              independent: area !== owner && area !== item.GetLeftArea(),
              retainedPool: area.GetPool() === owner.GetPool(),
              equal: clone.equals(item),
              text: n.text(output),
            },
            dynamic: [183, 184].map(
              /** Reads genuine per-pool nested defaults and copied owners. @param id - Which. @returns Native observations. */ (
                id,
              ) => {
                const set = (
                    pool.GetPoolDefaultItem(id) as InstanceType<typeof n.SvxSetItem>
                  ).GetItemSet(),
                  copied = (
                    base.GetPoolDefaultItem(id) as InstanceType<typeof n.SvxSetItem>
                  ).GetItemSet();
                return {
                  slot: pool.GetSlotId(id),
                  count: set.Count(),
                  ranges: set.GetRanges(),
                  owned: set.GetPool() === pool,
                  copied: copied.GetPool() === base,
                };
              },
            ),
            baseClone: !(base instanceof n.ScDocumentPool),
            names: [n.text(encoded), n.text(decoded)],
            range: [pool.GetFirstWhich(), pool.GetLastWhich()],
            shared: pool.GetPoolDefaultItem(176) === other.GetPoolDefaultItem(176),
            scale: [174, 175, 176].map(
              /** Reads actual unsigned defaults. @param id - Which. @returns Native value. */ (
                id,
              ) => pool.GetPoolDefaultItem(id).QueryValue(),
            ),
            tray: pool.GetPoolDefaultItem(159).QueryValue(),
            paper: pool.GetPoolDefaultItem(160).QueryValue(),
            richHeadersAvailable: pool.IsInRange(177),
          };
        } finally {
          item.dispose();
          clone.dispose();
          owner.dispose();
          value.dispose();
          output.dispose();
          input.dispose();
          encoded.dispose();
          decoded.dispose();
        }
      }
      const script = Array.from(document.scripts).find(
        /** Finds the actual installed source bundle. @param node - Script. @returns Kernel match. */ (
          node,
        ) => node.textContent?.includes(';globalThis["CalcStyleDefaultsFixture"]='),
      )?.textContent;
      if (!script) throw Error("Missing source bundle");
      const url = URL.createObjectURL(
          new Blob(
            [
              script,
              "\nonmessage=()=>postMessage({result:(",
              run.toString(),
              ")(),dom:typeof document});",
            ],
            { type: "text/javascript" },
          ),
        ),
        worker = new Worker(url);
      try {
        const other = new Promise(
          /** Observes genuine Worker output and failures. @param resolve - Completion. @param reject - Failure. @returns Nothing. */ (
            resolve,
            reject,
          ) => {
            worker.onmessage =
              /** Publishes source observations. @param event - Worker message. @returns Nothing. */ (
                event,
              ) => {
                resolve(event.data);
              };
            worker.onerror =
              /** Propagates actual failures. @param event - Error event. @returns Nothing. */ (
                event,
              ) => {
                reject(Error(event.message));
              };
          },
        );
        worker.postMessage(null);
        return { main: run(), other: await other };
      } finally {
        worker.terminate();
        URL.revokeObjectURL(url);
      }
    },
  );
  const expected = {
    header: {
      nullDefaults: true,
      independent: true,
      retainedPool: true,
      equal: true,
      text: "Header 😀",
    },
    dynamic: [10057, 10058].map(
      /** Native header/footer set contract. @param slot - Original slot. @returns Expected source observations. */ (
        slot,
      ) => ({
        slot,
        count: 0,
        ranges: [
          [148, 148],
          [150, 152],
          [156, 157],
          [160, 160],
          [161, 166],
        ],
        owned: true,
        copied: true,
      }),
    ),
    baseClone: true,
    names: ["Heading1 (user)", "Heading 1"],
    range: [100, 188],
    shared: true,
    scale: [100, 1, 1],
    // Native SfxByteItem QueryValue transmits the signed8-bit representation of raw255.
    tray: -1,
    paper: { Width: 0, Height: 0 },
    richHeadersAvailable: true,
  };
  expect(results).toEqual({ main: expected, other: { result: expected, dom: "undefined" } });
});
