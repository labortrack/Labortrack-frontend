import { httpClient } from "@/shared/lib/http/httpClient";
import type {
  EmpresaDto,
  EmpresaModificacionDto,
  EmpresaResponseDto,
} from "../types/empresa.types";

const BASE_URL = "/labortrack/empresa";

// httpClient fuerza "Content-Type: application/json" por defecto en la
// instancia; si se lo dejamos así, axios convierte el FormData en un JSON
// stringificado antes de enviarlo (ver transformRequest de axios), en vez de
// mandarlo como multipart. Lo sobreescribimos acá: el navegador arma el
// boundary real de todas formas apenas detecta un body FormData.
async function enviarFormularioEmpresa(
  method: "post" | "put",
  dto: EmpresaDto | EmpresaModificacionDto,
  logotipo?: File | null,
) {
  const formData = new FormData();
  formData.append(
    "dto",
    new Blob([JSON.stringify(dto)], { type: "application/json" }),
  );
  if (logotipo) formData.append("logotipo", logotipo);

  return (
    await httpClient[method]<EmpresaResponseDto>(BASE_URL, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  ).data;
}

export const empresaApi = {
  obtener: async () =>
    (await httpClient.get<EmpresaResponseDto>(BASE_URL)).data,

  inicializada: async () =>
    (await httpClient.get<boolean>(`${BASE_URL}/inicializada`)).data,

  inicializar: (dto: EmpresaDto, logotipo?: File | null) =>
    enviarFormularioEmpresa("post", dto, logotipo),

  modificar: (dto: EmpresaModificacionDto, logotipo?: File | null) =>
    enviarFormularioEmpresa("put", dto, logotipo),
};
