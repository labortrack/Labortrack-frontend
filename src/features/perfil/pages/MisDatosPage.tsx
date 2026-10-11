import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FileUser, ShieldCheck, UserRound } from "lucide-react";
import { PageHeader } from "@/shared/components";
import { Spinner, Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui";
import { useSessionStore } from "@/features/auth/store/sessionStore";
import { useEmpresa } from "@/features/empresa/hooks/useEmpresa";
import { useMiLegajo } from "@/features/legajos/hooks/useLegajos";
import { MisDatosBanner } from "../components/MisDatosBanner";
import { CuentaTab } from "../components/CuentaTab";
import { MiLegajoTab } from "../components/MiLegajoTab";
import { PoliticaPrivacidad } from "../components/PoliticaPrivacidad";
import { esErrorSinLegajo } from "../utils/legajoError";

export default function MisDatosPage() {
  const user = useSessionStore((state) => state.user)!;
  const [searchParams, setSearchParams] = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);

  const { data: empresa } = useEmpresa();
  const {
    data: legajo,
    isLoading: isLoadingLegajo,
    isError: isErrorLegajo,
    error: errorLegajo,
    refetch: refetchLegajo,
  } = useMiLegajo();

  const nombreEmpresa = empresa?.nombreEmpresa || empresa?.razonSocial;
  const tieneLegajo = Boolean(legajo);
  const esSinLegajo = isErrorLegajo && esErrorSinLegajo(errorLegajo);
  const puedeMostrarTabLegajo = !esSinLegajo && (tieneLegajo || isErrorLegajo);

  const rawTab = searchParams.get("tab");
  const tabEsValido =
    rawTab === "cuenta" ||
    rawTab === "terminos" ||
    (rawTab === "legajo" && (isLoadingLegajo || puedeMostrarTabLegajo));

  const activeTab = tabEsValido ? (rawTab as string) : "cuenta";

  useEffect(() => {
    if (isLoadingLegajo) return;
    if (
      rawTab &&
      rawTab !== "cuenta" &&
      rawTab !== "terminos" &&
      (rawTab !== "legajo" || !puedeMostrarTabLegajo)
    ) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set("tab", "cuenta");
          return next;
        },
        { replace: true },
      );
    }
  }, [rawTab, isLoadingLegajo, puedeMostrarTabLegajo, setSearchParams]);

  const handleTabChange = (nextTab: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("tab", nextTab);
        return next;
      },
      { replace: true },
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mis Datos"
        description="Tu cuenta, tu información laboral y cómo se tratan tus datos personales."
      />

      {/* ── Banner fijo de perfil ────────────────────────────── */}
      <MisDatosBanner
        user={user}
        legajo={legajo}
        nombreEmpresa={nombreEmpresa}
      />

      {/* ── Pestañas de Mis Datos ────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="w-full justify-start overflow-x-auto border-b border-border">
          <TabsTrigger value="cuenta" className="gap-1.5">
            <UserRound className="size-4" />
            Cuenta
          </TabsTrigger>

          {isLoadingLegajo ? (
            <div className="flex items-center gap-1.5 px-3 pb-3 text-xs text-foreground-muted animate-pulse">
              <Spinner className="size-3.5" />
              <span>Verificando legajo...</span>
            </div>
          ) : puedeMostrarTabLegajo ? (
            <TabsTrigger value="legajo" className="gap-1.5">
              <FileUser className="size-4" />
              Mi Legajo
            </TabsTrigger>
          ) : null}

          <TabsTrigger value="terminos" className="gap-1.5">
            <ShieldCheck className="size-4" />
            Términos y condiciones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cuenta">
          <CuentaTab
            user={user}
            legajo={legajo}
            isLoadingLegajo={isLoadingLegajo}
          />
        </TabsContent>

        {puedeMostrarTabLegajo ? (
          <TabsContent
            value="legajo"
            forceMount={isEditing ? true : undefined}
            className={isEditing && activeTab !== "legajo" ? "hidden" : undefined}
          >
            <MiLegajoTab
              legajo={legajo}
              isLoading={isLoadingLegajo}
              isError={isErrorLegajo}
              error={errorLegajo}
              onRetry={() => void refetchLegajo()}
              isEditing={isEditing}
              onStartEditing={() => setIsEditing(true)}
              onCancelEditing={() => setIsEditing(false)}
              onSaveSuccess={() => setIsEditing(false)}
            />
          </TabsContent>
        ) : null}

        <TabsContent value="terminos">
          <PoliticaPrivacidad />
        </TabsContent>
      </Tabs>
    </div>
  );
}
