/** @fileoverview Original o3tl integer-key scalar hash-combine families using native JS arithmetic; generic stdlib/binary hash parity remains outside this specialization. */
/** Erases native seed-width/template selection into number or BigInt; no general std::hash provider, pointer/count overload or memory engine is introduced. @param seed - Valid initialized unsigned seed. @param value - Valid signed32 or unsigned32 scalar with the explicit identity-hash binding; signed keys are interpreted modulo the unsigned seed width. @returns Nothing. */
export function hash_combine(seed: [number] | [bigint], value: number): void {
  if (typeof seed[0] === "number") {
    const n = seed[0];
    seed[0] = (n ^ (value + 0x9e3779b9 + (n << 6) + (n >>> 2))) >>> 0;
  } else {
    const n = seed[0];
    seed[0] = BigInt.asUintN(
      64,
      n ^ (BigInt(value) + 0x9e3779b97f4a7c15n + (n << 12n) + (n >> 4n)),
    );
  }
}
