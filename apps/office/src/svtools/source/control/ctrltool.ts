/** @fileoverview Original FontList scalable-size resource from ctrltool.cxx; device/font enumeration remains in its browser port. */
const aStdSizeAry = Object.freeze([
  60, 70, 80, 90, 100, 105, 110, 120, 130, 140, 150, 160, 180, 200, 210, 220, 240, 260, 280, 320,
  360, 400, 420, 440, 480, 540, 600, 660, 720, 800, 880, 960, 0,
]);
/** Consumed original static FontList resource; no output device or font service is supplied here. */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- Preserve the original static FontList resource boundary without fabricating its device service.
export class FontList {
  /** Original zero-terminated scalable sizes in tenths of a point. @returns Borrowed immutable resource. */
  static GetStdSizeAry(): readonly number[] {
    return aStdSizeAry;
  }
}
