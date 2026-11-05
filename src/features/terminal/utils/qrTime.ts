export function segundosRestantes(venceEn: string, now: number) {
  return Math.max(0, Math.ceil((Date.parse(venceEn) - now) / 1000)) || 0;
}
