import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Monitor, RefreshCw } from "lucide-react";
import { terminalPublicApi } from "../api/terminalApi";
import { QrDisplay } from "../components/QrDisplay";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { Alert, Button, Card, Input, Label, Spinner } from "@/shared/ui";

const actualKey = ["terminal-publica", "actual"];
const qrKey = ["terminal-publica", "qr"];
export default function TerminalPage() {
  const client = useQueryClient();
  const [codigo, setCodigo] = useState("");
  const [reingresar, setReingresar] = useState(false);
  const actual = useQuery({ queryKey: actualKey, queryFn: terminalPublicApi.actual, retry: false, refetchInterval: 15_000, refetchOnWindowFocus: true });
  const status = normalizeApiError(actual.error).status;
  const qr = useQuery({
    queryKey: qrKey, queryFn: terminalPublicApi.qr,
    enabled: Boolean(actual.data) && status !== 401 && status !== 403,
    retry: false, staleTime: 0, refetchInterval: query => {
      if (query.state.error || !query.state.data) return 5000;
      return Math.max(1000, Date.parse(query.state.data.venceEn) - Date.now() - 15_000);
    }, refetchIntervalInBackground: true, refetchOnWindowFocus: true,
  });
  // El estado se consulta por separado para detectar revocaciones sin cambiar el QR continuamente.
  const qrStatus = normalizeApiError(qr.error).status;
  const accesoStatus = status === 401 || status === 403 ? status : qrStatus;
  const vincular = useMutation({ mutationFn: terminalPublicApi.vincular, onSuccess: async () => {
    setCodigo(""); setReingresar(false);
    client.removeQueries({ queryKey: qrKey });
    await client.invalidateQueries({ queryKey: actualKey });
  } });
  const submit = (e: FormEvent) => { e.preventDefault(); vincular.mutate(codigo); };
  if (actual.isPending) return <main className="flex min-h-screen items-center justify-center bg-page"><Spinner /> <span className="ml-3">Comprobando vinculación…</span></main>;
  const noVinculada = accesoStatus === 401;
  const bloqueada = accesoStatus === 403;
  if (actual.data && !noVinculada && !bloqueada && !reingresar) {
    return <QrDisplay nombre={actual.data.nombre} qr={qr.data} onRetry={() => { void actual.refetch(); void qr.refetch(); }}
      error={qr.error ? normalizeApiError(qr.error).message : actual.error ? normalizeApiError(actual.error).message : undefined} />;
  }
  const accesoError = actual.error ?? qr.error;
  return <main className="flex h-dvh items-start justify-center overflow-y-auto bg-page p-5">
    <Card className="my-auto w-full max-w-md space-y-5 p-7">
      <Monitor className="size-10 text-primary" /><h1 className="text-2xl font-bold">Terminal de asistencia</h1>
      <p className="text-foreground-muted">Pedile al administrador el código desde Más acciones → Terminales de la obra. No necesitás iniciar sesión.</p>
      {accesoError && <Alert variant={bloqueada ? "warning" : "info"}>{normalizeApiError(accesoError).message}</Alert>}
      {bloqueada && !reingresar ? <Button variant="outline" onClick={() => setReingresar(true)}>Vincular con otro código</Button> : (noVinculada || reingresar) ?
        <form onSubmit={submit} className="space-y-4">
          <Label htmlFor="codigo-terminal">Código de vinculación</Label>
          <Input id="codigo-terminal" inputMode="numeric" autoComplete="off" value={codigo} maxLength={8} onChange={e => setCodigo(e.target.value.replace(/\D/g, ""))} placeholder="8 dígitos" />
          {vincular.error && <Alert variant="error">{normalizeApiError(vincular.error).message}</Alert>}
          <Button className="w-full" type="submit" disabled={codigo.length !== 8 || vincular.isPending}>{vincular.isPending ? "Vinculando…" : "Vincular dispositivo"}</Button>
        </form> : <p>No se pudo comprobar la vinculación. Reintentaremos automáticamente.</p>}
      <Button variant="outline" onClick={() => void actual.refetch()}><RefreshCw /> Reintentar conexión</Button>
    </Card>
  </main>;
}
