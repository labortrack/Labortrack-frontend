export function extraerTokenQr(valorLeido: string): string {
  const valor = valorLeido.trim();
  if (!valor) return "";

  try {
    const url = new URL(valor);
    return (
      url.searchParams.get("token") ??
      url.searchParams.get("tokenQr") ??
      valor
    ).trim();
  } catch {
    return valor;
  }
}
