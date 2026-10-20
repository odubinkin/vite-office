/** @fileoverview Original inline OpenType four-char tag packing from vcl/font/Feature.hxx;other feature services are unported. */
/** Packs the original four native signed-char units into an unsigned32 tag. @param feature - At least four native char units. @returns Original tag. */
export function featureCode(feature: Int8Array): number {
  return (
    (((feature[0] as number) << 24) |
      ((feature[1] as number) << 16) |
      ((feature[2] as number) << 8) |
      (feature[3] as number)) >>>
    0
  );
}
