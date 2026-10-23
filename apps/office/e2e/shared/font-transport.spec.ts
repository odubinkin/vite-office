/** @fileoverview Actual Writer model Font state survives a real dedicated Worker through the shared primitive codec. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "./kernel-fixture";
test("preserves shared Font values in Chromium and a DOM-free Worker document round trip", /** Uses actual model and transport owners. @param fixtures - Browser fixtures. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/");
  await installKernelFixture(page, "OfficeFontTransportFixture", [
    { module: "src/sw/source/core/doc/doc.ts", names: ["createWriterDocument"] },
    { module: "src/sw/source/core/doc/number.ts", names: ["SwNumFormat", "SwNumRule"] },
    {
      module: "src/sw/browser/filter/xml/writer-document-codec.ts",
      names: ["encodeWriterDocument", "decodeWriterDocument"],
    },
    { module: "src/vcl/source/font/font.ts", names: ["Font"] },
    { module: "src/tools/inc/color.ts", names: ["Color", "ColorTransparency"] },
    { module: "src/tools/inc/gen.ts", names: ["Size"] },
  ]);
  const result = await page.evaluate(
    /** Sends the actual encoded model to a true Worker. @returns Compared data. */ async () => {
      const n = Reflect.get(globalThis, "OfficeFontTransportFixture"),
        font = new n.Font();
      font.SetFamilyName("Transport");
      font.SetStyleName("Native");
      font.SetColor(new n.Color(n.ColorTransparency, 0x80123456, "ColorTransparencyTag"));
      font.SetFillColor(new n.Color(0xabcdef));
      font.SetTransparent(false);
      font.SetAlignment(2);
      font.SetFontSize(new n.Size(-12, 1234));
      font.SetOutline(true);
      font.SetShadow(true);
      font.SetUnderline(11);
      font.SetOverline(12);
      font.SetStrikeout(6);
      font.SetRelief(2);
      font.SetEmphasisMark(8195);
      const format = new n.SwNumFormat();
      format.SetBulletFont(font);
      const doc = n.createWriterDocument(),
        rule = new n.SwNumRule("workerfont", "label-alignment");
      rule.Set(0, format);
      doc.AddNumRule(rule);
      const record = n.encodeWriterDocument(doc);
      const script = Array.from(document.scripts).find(
        /** Finds actual installed source bundle. @param s - Script. @returns Match. */ (s) =>
          s.textContent?.includes(';globalThis["OfficeFontTransportFixture"]='),
      )?.textContent;
      if (!script) throw Error("Missing source bundle");
      const read =
        /** Restores actual native value owners from primitive transport. @param data - Encoded document. @returns Stored font values. */ (
          data: unknown,
        ) => {
          const n = Reflect.get(globalThis, "OfficeFontTransportFixture"),
            decoded = n.decodeWriterDocument(data),
            font = decoded.FindNumRulePtr("workerfont").Get(0).GetBulletFont();
          return [
            font.GetFamilyName(),
            font.GetStyleName(),
            font.GetColor().toUInt32(),
            font.GetFillColor().toUInt32(),
            font.IsTransparent(),
            font.GetAlignment(),
            font.GetAverageFontWidth(),
            font.GetFontHeight(),
            font.IsOutline(),
            font.IsShadow(),
            font.GetUnderline(),
            font.GetOverline(),
            font.GetStrikeout(),
            font.GetRelief(),
            font.GetEmphasisMark(),
          ];
        };
      const url = URL.createObjectURL(
          new Blob(
            [
              script,
              "\nself.onmessage=e=>postMessage({value:(",
              read.toString(),
              ")(e.data),dom:typeof document});",
            ],
            { type: "text/javascript" },
          ),
        ),
        worker = new Worker(url);
      try {
        const other = await new Promise<{ value: unknown; dom: string }>(
          /** Waits for actual Worker output. @param resolve - Completion. @param reject - Failure. @returns Nothing. */ (
            resolve,
            reject,
          ) => {
            worker.onmessage =
              /** Receives real cloned data. @param event - Message. @returns Nothing. */ (event) =>
                resolve(event.data);
            worker.onerror =
              /** Reports Worker exception. @param event - Failure. @returns Nothing. */ (event) =>
                reject(Error(event.message));
            worker.postMessage(record);
          },
        );
        return { main: read(structuredClone(record)), other };
      } finally {
        worker.terminate();
        URL.revokeObjectURL(url);
      }
    },
  );
  const expected = [
    "Transport",
    "Native",
    0x80123456,
    0xabcdef,
    false,
    2,
    -12,
    1234,
    true,
    true,
    11,
    12,
    6,
    2,
    8195,
  ];
  expect(result).toEqual({ main: expected, other: { value: expected, dom: "undefined" } });
});
