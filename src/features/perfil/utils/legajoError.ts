export function esErrorSinLegajo(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const anyErr = error as {
    status?: number;
    response?: {
      status?: number;
      data?: {
        message?: string;
        error?: string;
      };
    };
    message?: string;
  };

  const status = anyErr.response?.status ?? anyErr.status;
  if (status === 404) return true;

  const msg = (
    anyErr.response?.data?.message ??
    anyErr.response?.data?.error ??
    anyErr.message ??
    ""
  ).toLowerCase();

  return (
    msg.includes("no tiene un legajo asociado") ||
    msg.includes("sin legajo") ||
    msg.includes("resourcenotfound")
  );
}
