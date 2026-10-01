import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { documentacionApi } from "../api/documentacionApi";
import { documentacionKeys } from "./useDocumentacion";
import type { DocumentoRespuestaDto } from "../types/documentacion.types";

interface PollingJob {
  documentoId: number;
  nombreDocumento?: string;
  toastId: string | number;
  startTime: number;
}

/**
 * Hook para gestionar el ciclo de vida asíncrono y polling de vectorización (RAG)
 * de documentos subidos.
 *
 * Fase A: Cierra el modal y lanza Toast informativo persistente (Azul primario) con spinner.
 * Fase B: Inicia un setInterval cada 5s para consultar el estado del documento por ID/listado.
 * Fase C:
 *   - Si esIndexadoRag === true -> Destruye el Toast azul y muestra Toast de éxito (Verde).
 *   - Si pasa > 1 minuto o falla -> Destruye el Toast azul y muestra Toast de error (Rojo).
 *
 * Consideraciones técnicas:
 *   - Limpia correctamente los intervalos (clearInterval) al desmontarse para evitar fugas de memoria.
 */
export function useRagIndexingPolling() {
  const queryClient = useQueryClient();
  const [jobs, setJobs] = useState<PollingJob[]>([]);
  const jobsRef = useRef<PollingJob[]>([]);
  useEffect(() => {
    jobsRef.current = jobs;
  }, [jobs]);

  const iniciarPolling = useCallback((doc: DocumentoRespuestaDto) => {
    // Fase A: Toast de Información (Color Azul primario de design.md con spinner animado)
    // Este Toast NO debe desaparecer automáticamente (duration: Infinity).
    const toastId = toast.info(
      "Vectorizando documento con Inteligencia Artificial...",
      {
        duration: Infinity,
        icon: <Loader2 className="size-4 animate-spin text-primary" />,
        style: {
          borderColor: "var(--lt-action-primary, #0036a4)",
        },
      },
    );

    const newJob: PollingJob = {
      documentoId: doc.idDocumento,
      nombreDocumento: doc.nombreDocumento,
      toastId,
      startTime: Date.now(),
    };

    setJobs((prev) => [...prev, newJob]);
  }, []);

  useEffect(() => {
    if (jobs.length === 0) return;

    // Fase B: Polling cada 5 segundos
    const intervalId = setInterval(async () => {
      const currentJobs = jobsRef.current;
      if (currentJobs.length === 0) return;

      const remainingJobs: PollingJob[] = [];

      for (const job of currentJobs) {
        const elapsed = Date.now() - job.startTime;

        // Timeout: más de 1 minuto (60.000 ms) sin respuesta
        if (elapsed > 60000) {
          toast.dismiss(job.toastId);
          toast.error(
            "No se pudo indexar el archivo con IA. Intente reactivarlo más tarde.",
          );
          continue;
        }

        try {
          // Consultar el estado del documento específico usando endpoint o listado
          let docActual: DocumentoRespuestaDto | null = null;
          try {
            const resVisualizar = await documentacionApi.visualizarDocumento(
              job.documentoId,
            );
            if (
              resVisualizar &&
              (typeof resVisualizar.esIndexadoRag === "boolean" ||
                resVisualizar.indexadoEnRag)
            ) {
              docActual = resVisualizar;
            }
          } catch {
            // Si el endpoint específico falla o solo devuelve URL, intentamos listado
          }

          if (!docActual) {
            try {
              const listado = await documentacionApi.listarDocumentos(
                {},
                { page: 0, size: 30, sort: "fechaSubida,desc" },
              );
              docActual =
                listado.content.find(
                  (d) => d.idDocumento === job.documentoId,
                ) ?? null;
            } catch {
              // Error transitorio de red
            }
          }

          // Fase C (Resolución):
          // 1. Éxito: documento indexado en IA
          if (
            docActual &&
            (docActual.esIndexadoRag === true ||
              docActual.indexadoEnRag === "COMPLETADO")
          ) {
            toast.dismiss(job.toastId);
            toast.success(
              "Documento analizado e indexado correctamente en Tracky.",
            );
            void queryClient.invalidateQueries({
              queryKey: documentacionKeys.documentosAll,
            });
            continue;
          }

          // 2. Error reportado por backend
          if (
            docActual &&
            (docActual.indexadoEnRag === "FALLIDO" ||
              docActual.indexadoEnRag === "ERROR" ||
              docActual.estadoRag === "FALLIDO")
          ) {
            toast.dismiss(job.toastId);
            toast.error(
              "No se pudo indexar el archivo con IA. Intente reactivarlo más tarde.",
            );
            void queryClient.invalidateQueries({
              queryKey: documentacionKeys.documentosAll,
            });
            continue;
          }

          // Sigue pendiente y dentro del límite de 1 minuto: mantener en cola
          remainingJobs.push(job);
        } catch {
          // Mantener en el polling para el próximo intento
          remainingJobs.push(job);
        }
      }

      setJobs(remainingJobs);
    }, 5000);

    // Limpieza de intervalos y toasts si el usuario cambia de pantalla
    return () => {
      clearInterval(intervalId);
      jobsRef.current.forEach((job) => toast.dismiss(job.toastId));
    };
  }, [jobs.length > 0, queryClient]);

  return { iniciarPolling };
}
