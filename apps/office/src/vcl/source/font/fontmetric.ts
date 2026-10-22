/** @fileoverview Consumed horizontal FontMetricData::ImplInitTextLineSize fallback arithmetic from fontmetric.cxx; native HarfBuzz/device ownership remains outside this browser metric profile. */
/** Original horizontal fallback metrics, including native truncation and96dpi double-line minimum distance. @param ascent - Device font ascent. @param descent - Device font descent. @param leading - Internal leading. @returns Source rectangle offsets and sizes. */
export function getStrikeoutFallbackMetrics(ascent: number, descent: number, leading: number) {
  if (descent <= 0) descent = Math.trunc(ascent / 10) || 1;
  if (3 * descent > ascent) descent = Math.trunc(ascent / 3);
  const size = Math.trunc((descent * 25 + 50) / 100) || 1;
  const half = Math.trunc(size / 2) || 1;
  let bold = Math.trunc((descent * 50 + 50) / 100);
  if (bold === size) bold++;
  const boldHalf = Math.trunc(bold / 2) || 1;
  const double = Math.trunc((descent * 16 + 50) / 100) || 1;
  const distance = Math.max(double, 1 + Math.trunc(96 / 150));
  const doubleHalf = Math.trunc(distance / 2) || 1;
  const offset = -Math.trunc((ascent - leading) / 3);
  const first = offset - doubleHalf - double;
  return {
    size,
    offset: offset - half,
    bold,
    boldOffset: offset - boldHalf,
    double,
    first,
    second: first + distance + double,
  };
}
