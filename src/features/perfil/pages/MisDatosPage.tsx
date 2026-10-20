import { useEffect, useState } from "react";
import { useBlocker, useSearchParams } from "react-router-dom";
import { CircleHelp, FileUser, ShieldCheck, UserRound } from "lucide-react";
import { ConfirmDialog, PageHeader } from "@/shared/components";
import { Spinner, Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui";
import { useSessionStore } from "@/features/auth/store/sessionStore";
import { useEmpresa } from "@/features/empresa/hooks/useEmpresa";
import { useMiLegajo } from "@/features/legajos/hooks/useLegajos";
import { MisDatosBanner } from "../components/MisDatosBanner";
import { CuentaTab } from "../components/CuentaTab";
import { MiLegajoTab } from "../components/MiLegajoTab";
import { PoliticaPrivacidad } from "../components/PoliticaPrivacidad";
import { PreguntasFrecuentes } from "../components/PreguntasFrecuentes";
import { esErrorSinLegajo } from "../utils/legajoError";

const TABS_SIEMPRE_VISIBLES = ["cuenta", "terminos", "faq"];

export default function MisDatosPage() {
  const user = useSessionStore((state) => state.user)!;
  const [searchParams, setSearchParams] = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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
    (rawTab !== null && TABS_SIEMPRE_VISIBLES.includes(rawTab)) ||
    (rawTab === "legajo" && (isLoadingLegajo || puedeMostrarTabLegajo));

  const activeTab = tabEsValido ? (rawTab as string) : "cuenta";

  const shouldBlock = isEditing && hasUnsavedChanges;

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      shouldBlock && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (!shouldBlock) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [shouldBlock]);

  useEffect(() => {
    if (isLoadingLegajo) return;
    if (
      rawTab &&
      !TABS_SIEMPRE_VISIBLES.includes(rawTab) &&
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

  const handleSaveSuccess = () => {
    setHasUnsavedChanges(false);
    setIsEditing(false);
  };

  const handleCancelEditing = () => {
    setHasUnsavedChanges(false);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mis Datos"
        description="Tu cuenta, tu información laboral, cómo se tratan tus datos personales y respuestas a dudas frecuentes."
      />

      {/* ── Banner fijo de perfil ────────────────────────────── */}
      <MisDatosBanner
        user={user}
        legajo={legajo}
        isLoadingLegajo={isLoadingLegajo}
        nombreEmpresa={nombreEmpresa}
      />

      {/* ── Pestañas de Mis Datos ────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <div className="sticky top-0 z-10 -mx-4 px-4 sm:-mx-8 sm:px-8 bg-page pt-[max(0.5rem,env(safe-area-inset-top))] pb-1 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] transition-all">
          <TabsList
            aria-label="Secciones de Mis Datos"
            className="w-full justify-start"
          >
            <TabsTrigger value="cuenta" className="gap-1.5 shrink-0 whitespace-nowrap">
              <UserRound className="size-4" />
              Mi cuenta
            </TabsTrigger>

            {isLoadingLegajo ? (
              <div className="flex items-center gap-1.5 px-3 pb-3 text-xs text-foreground-muted animate-pulse shrink-0 whitespace-nowrap">
                <Spinner className="size-3.5" />
                <span>Verificando legajo...</span>
              </div>
            ) : puedeMostrarTabLegajo ? (
              <TabsTrigger value="legajo" className="gap-1.5 shrink-0 whitespace-nowrap">
                <FileUser className="size-4" />
                Mi Legajo
              </TabsTrigger>
            ) : null}

            <TabsTrigger value="terminos" className="gap-1.5 shrink-0 whitespace-nowrap">
              <ShieldCheck className="size-4" />
              Términos y condiciones
            </TabsTrigger>

            <TabsTrigger value="faq" className="gap-1.5 shrink-0 whitespace-nowrap">
              <CircleHelp className="size-4" />
              Preguntas frecuentes
            </TabsTrigger>
          </TabsList>
        </div>

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
              onCancelEditing={handleCancelEditing}
              onSaveSuccess={handleSaveSuccess}
              onDirtyChange={setHasUnsavedChanges}
            />
          </TabsContent>
        ) : null}

        <TabsContent value="terminos">
          <PoliticaPrivacidad />
        </TabsContent>

        <TabsContent value="faq">
          <PreguntasFrecuentes />
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={blocker.state === "blocked"}
        title="Cambios sin guardar"
        description="Tenés modificaciones sin guardar en tu legajo. Si salís ahora, perderás todos los cambios realizados."
        confirmLabel="Salir sin guardar"
        destructive
        onOpenChange={(open) => {
          if (!open && blocker.state === "blocked") {
            blocker.reset?.();
          }
        }}
        onConfirm={() => {
          setHasUnsavedChanges(false);
          blocker.proceed?.();
        }}
      />
    </div>
  );
}

