import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { documentacionApi } from "../api/documentacionApi";
import { documentacionKeys } from "./useDocumentacion";
import type { DocumentoRespuestaDto } from "../types/documentacion.types";

export const POLLING_INTERVAL_MS = 4000;
export const TIEMPO_MAXIMO_INDEXANDO_MS = 60000;
export const MAX_CONSULTAS_SIN_INDEXAR = 2;
export const MAX_ERRORES_RED = 3;

interface PollingJob {
  documentoId: number;
  nombreDocumento?: string;
  toastId: string | number;
  startTime: number;
  sinIndexarCount: number;
  erroresRedCount: number;
}

/**
 * Hook para gestionar el ciclo de vida asíncrono y polling de vectorización (RAG)
 * de documentos mediante el endpoint dedicado GET /api/v1/documentos/{id}/estado-rag.
 */
export function useRagIndexingPolling() {
  const queryClient = useQueryClient();
  const [jobs, setJobs] = useState<PollingJob[]>([]);
  const jobsRef = useRef<PollingJob[]>([]);

  useEffect(() => {
    jobsRef.current = jobs;
  }, [jobs]);

  // Limpieza de toasts pendientes únicamente al desmontar el componente
  useEffect(() => {
    return () => {
      jobsRef.current.forEach((job) => toast.dismiss(job.toastId));
    };
  }, []);

  const iniciarPolling = useCallback((doc: DocumentoRespuestaDto) => {
    const documentoId =
      doc.idDocumento ??
      (doc as unknown as { documentoId?: number }).documentoId;

    if (!documentoId) return;

    // Un solo polling por documento
    if (jobsRef.current.some((j) => j.documentoId === documentoId)) {
      return;
    }

    const nombreDocumento =
      doc.nombreDocumento ??
      (doc as unknown as { archivoOriginal?: string }).archivoOriginal;

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
      documentoId,
      nombreDocumento,
      toastId,
      startTime: Date.now(),
      sinIndexarCount: 0,
      erroresRedCount: 0,
    };

    setJobs((prev) => [...prev, newJob]);
  }, []);

  const hasJobs = jobs.length > 0;

  useEffect(() => {
    if (!hasJobs) return;

    const intervalId = setInterval(async () => {
      const currentJobs = jobsRef.current;
      if (currentJobs.length === 0) return;

      const remainingJobs: PollingJob[] = [];

      for (const job of currentJobs) {
        const elapsed = Date.now() - job.startTime;

        try {
          const { estadoRag } = await documentacionApi.obtenerEstadoRag(
            job.documentoId,
          );
          job.erroresRedCount = 0;

          if (estadoRag === "INDEXADO") {
            toast.dismiss(job.toastId);
            toast.success(
              "Documento analizado e indexado correctamente en Tracky.",
            );
            void queryClient.invalidateQueries({
              queryKey: documentacionKeys.documentosAll,
            });
            continue;
          }

          if (estadoRag === "SIN_INDEXAR") {
            job.sinIndexarCount++;
            if (job.sinIndexarCount >= MAX_CONSULTAS_SIN_INDEXAR) {
              toast.dismiss(job.toastId);
              toast.error(
                "No se pudo indexar el archivo con IA. Podés reintentarlo con el botón 'Indexar para la IA'.",
              );
              void queryClient.invalidateQueries({
                queryKey: documentacionKeys.documentosAll,
              });
              continue;
            }
            remainingJobs.push(job);
            continue;
          }

          if (estadoRag === "INDEXANDO") {
            job.sinIndexarCount = 0;
            if (elapsed > TIEMPO_MAXIMO_INDEXANDO_MS) {
              toast.dismiss(job.toastId);
              toast.info("Sigue procesando; revisalo en unos minutos");
              void queryClient.invalidateQueries({
                queryKey: documentacionKeys.documentosAll,
              });
              continue;
            }
            remainingJobs.push(job);
            continue;
          }

          if (estadoRag === "NO_APLICA") {
            toast.dismiss(job.toastId);
            toast.info("Este documento no requiere procesamiento con IA.");
            void queryClient.invalidateQueries({
              queryKey: documentacionKeys.documentosAll,
            });
            continue;
          }

          // Cualquier otro estado desconocido
          remainingJobs.push(job);
        } catch (error) {
          const is404 =
            axios.isAxiosError(error) && error.response?.status === 404;

          if (is404) {
            toast.dismiss(job.toastId);
            toast.error(
              "No se pudo indexar y el documento fue descartado",
            );
            void queryClient.invalidateQueries({
              queryKey: documentacionKeys.documentosAll,
            });
            continue;
          }

          job.erroresRedCount++;
          if (job.erroresRedCount >= MAX_ERRORES_RED) {
            toast.dismiss(job.toastId);
            toast.error(
              "Error de conexión al verificar el estado de la indexación.",
            );
            void queryClient.invalidateQueries({
              queryKey: documentacionKeys.documentosAll,
            });
            continue;
          }

          remainingJobs.push(job);
        }
      }

      setJobs(remainingJobs);
    }, POLLING_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [hasJobs, queryClient]);

  return { iniciarPolling };
}
