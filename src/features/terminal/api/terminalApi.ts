import axios from "axios";
import { env } from "@/app/config/env";
import { httpClient } from "@/shared/lib/http/httpClient";
import type { QrObraResponseDto } from "@/features/obra/types/obra.types";

export interface Terminal {
  id: number;
  obraId: number;
  nombreObra: string;
  nombre: string;
  habilitada: boolean;
  vinculada: boolean;
  vinculadaEn: string | null;
}
export interface CodigoTerminal { codigo: string; venceEn: string }
export interface GuardarTerminal { nombre: string; habilitada: boolean }
const base = (obraId: number) => `/api/obras/${obraId}/terminales`;

export const terminalAdminApi = {
  listar: async (obraId: number) => (await httpClient.get<Terminal[]>(base(obraId))).data,
  crear: async (obraId: number, data: GuardarTerminal) => (await httpClient.post<Terminal>(base(obraId), data)).data,
  editar: async (obraId: number, id: number, data: GuardarTerminal) => (await httpClient.put<Terminal>(`${base(obraId)}/${id}`, data)).data,
  codigo: async (obraId: number, id: number) => (await httpClient.post<CodigoTerminal>(`${base(obraId)}/${id}/codigo`)).data,
  desvincular: async (obraId: number, id: number) => { await httpClient.post(`${base(obraId)}/${id}/desvincular`); },
};

// Cliente aislado: una terminal nunca recibe el JWT ni dispara refresh/logout de usuarios.
const terminalClient = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
  headers: { "Content-Type": "application/json", "X-Requested-With": "LaborTrack" },
});
export const terminalPublicApi = {
  actual: async () => (await terminalClient.get<Terminal>("/api/terminales/actual")).data,
  vincular: async (codigo: string) => (await terminalClient.post<Terminal>("/api/terminales/vincular", { codigo })).data,
  qr: async () => (await terminalClient.get<QrObraResponseDto>("/api/terminales/actual/qr")).data,
};
