import { httpClient } from "@/shared/lib/http/httpClient";
import type {
  EmpleadoBajaDto,
  EmpleadoDto,
  EmpleadoEstadoResponseDto,
  EmpleadoFilterParams,
  EmpleadoResponseDto,
  EmpleadoResumenResponseDto,
  EmpleadoUpdateDto,
  ReactivarLegajoRequestDto,
  SpringPage,
} from "../types/legajo.types";

// Datasets mock para desarrollo y fallback local
const MOCK_EMPLEADOS_DETALLE: EmpleadoResponseDto[] = [
  {
    id: 1,
    apellido: "Álvarez",
    nombre: "Carlos Eduardo",
    cuil: "20-32145678-9",
    dni: "32145678",
    numeroIeric: "IER-987654",
    fechaNacimiento: "1987-04-15",
    fechaIngreso: "2019-03-15",
    email: "carlos.alvarez@email.com",
    grupoSanguineo: "O+",
    nacionalidad: "Argentina",
    domicilio: "Av. Belgrano 1420, CABA",
    numeroCelular: "+54 9 11 4567-8901",
    nombreContactoEmergencia: "María Marta Álvarez",
    celularContactoEmergencia: "+54 9 11 9876-5432",
    genero: "MASCULINO",
    fotoPerfilKey: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
    estadoActual: "EN_OBRA",
    categoriaActual: "OFICIAL_ESPECIALIZADO",
  },
  {
    id: 2,
    apellido: "Benítez",
    nombre: "Roberto Martín",
    cuil: "20-35987123-4",
    dni: "35987123",
    numeroIeric: "IER-123456",
    fechaNacimiento: "1991-08-22",
    fechaIngreso: "2020-11-01",
    email: "roberto.benitez@email.com",
    grupoSanguineo: "A+",
    nacionalidad: "Argentina",
    domicilio: "Mitre 850, Avellaneda, Buenos Aires",
    numeroCelular: "+54 9 11 3322-1100",
    nombreContactoEmergencia: "Jorge Benítez",
    celularContactoEmergencia: "+54 9 11 5544-3322",
    genero: "MASCULINO",
    fotoPerfilKey: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250",
    estadoActual: "ACTIVO",
    categoriaActual: "OFICIAL",
  },
  {
    id: 3,
    apellido: "Castro",
    nombre: "Marcelo Hugo",
    cuil: "20-29456123-2",
    dni: "29456123",
    numeroIeric: "IER-456789",
    fechaNacimiento: "1983-12-05",
    fechaIngreso: "2021-05-20",
    email: "marcelo.castro@email.com",
    grupoSanguineo: "B+",
    nacionalidad: "Argentina",
    domicilio: "Calle 14 N° 340, La Plata",
    numeroCelular: "+54 9 11 6789-0123",
    nombreContactoEmergencia: "Patricia Castro",
    celularContactoEmergencia: "+54 9 221 456-7890",
    genero: "MASCULINO",
    fotoPerfilKey: "",
    estadoActual: "EN_OBRA",
    categoriaActual: "MEDIO_OFICIAL",
  },
  {
    id: 4,
    apellido: "Domínguez",
    nombre: "Facundo Germán",
    cuil: "20-40123789-5",
    dni: "40123789",
    numeroIeric: "IER-332211",
    fechaNacimiento: "1997-09-18",
    fechaIngreso: "2023-01-15",
    email: "facundo.dominguez@email.com",
    grupoSanguineo: "AB+",
    nacionalidad: "Argentina",
    domicilio: "San Martín 512, San Isidro",
    numeroCelular: "+54 9 11 2233-4455",
    nombreContactoEmergencia: "Laura Domínguez",
    celularContactoEmergencia: "+54 9 11 6677-8899",
    genero: "MASCULINO",
    fotoPerfilKey: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
    estadoActual: "ACTIVO",
    categoriaActual: "AYUDANTE",
  },
  {
    id: 5,
    apellido: "Fernández",
    nombre: "Esteban Luis",
    cuil: "20-37890123-1",
    dni: "37890123",
    numeroIeric: "IER-778899",
    fechaNacimiento: "1993-02-28",
    fechaIngreso: "2022-07-10",
    email: "esteban.fernandez@email.com",
    grupoSanguineo: "O-",
    nacionalidad: "Argentina",
    domicilio: "Colón 120, Quilmes",
    numeroCelular: "+54 9 11 9988-7766",
    nombreContactoEmergencia: "Carlos Fernández",
    celularContactoEmergencia: "+54 9 11 4433-2211",
    genero: "MASCULINO",
    fotoPerfilKey: "",
    estadoActual: "SUSPENDIDO",
    categoriaActual: "PEON",
  },
  {
    id: 6,
    apellido: "Giménez",
    nombre: "Gonzalo Javier",
    cuil: "20-31234567-8",
    dni: "31234567",
    numeroIeric: "IER-990011",
    fechaNacimiento: "1985-06-12",
    fechaIngreso: "2018-02-01",
    email: "gonzalo.gimenez@email.com",
    grupoSanguineo: "A-",
    nacionalidad: "Argentina",
    domicilio: "Rivadavia 3400, CABA",
    numeroCelular: "+54 9 11 8877-6655",
    nombreContactoEmergencia: "Verónica Giménez",
    celularContactoEmergencia: "+54 9 11 1122-3344",
    genero: "MASCULINO",
    fotoPerfilKey: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=250",
    estadoActual: "INACTIVO",
    categoriaActual: "OFICIAL",
  },
];

const MOCK_HISTORIAL_ESTADOS: Record<number, EmpleadoEstadoResponseDto[]> = {
  1: [
    {
      id: 101,
      nombreEstado: "EN_OBRA",
      fechaDesde: "2023-02-01",
      fechaHasta: null,
      motivo: "Asignación a obra Torre Puerto Madero",
    },
    {
      id: 102,
      nombreEstado: "ACTIVO",
      fechaDesde: "2019-03-15",
      fechaHasta: "2023-01-31",
      motivo: "Alta inicial de legajo en el sistema",
    },
  ],
  2: [
    {
      id: 103,
      nombreEstado: "ACTIVO",
      fechaDesde: "2020-11-01",
      fechaHasta: null,
      motivo: "Alta de empleado en nómina",
    },
  ],
  3: [
    {
      id: 104,
      nombreEstado: "EN_OBRA",
      fechaDesde: "2022-03-01",
      fechaHasta: null,
      motivo: "Asignación a frente de instalaciones sanitarias",
    },
    {
      id: 105,
      nombreEstado: "ACTIVO",
      fechaDesde: "2021-05-20",
      fechaHasta: "2022-02-28",
      motivo: "Alta de legajo",
    },
  ],
};

function filterAndPaginateMock(
  params: EmpleadoFilterParams,
): SpringPage<EmpleadoResumenResponseDto> {
  let result = MOCK_EMPLEADOS_DETALLE.map((item) => ({
    id: item.id,
    apellido: item.apellido,
    nombre: item.nombre,
    dni: item.dni,
    cuil: item.cuil,
    numeroIeric: item.numeroIeric,
    email: item.email,
    numeroCelular: item.numeroCelular,
    categoriaActual: item.categoriaActual,
    estadoActual: item.estadoActual,
    fotoPerfilKey: item.fotoPerfilKey,
    fechaIngreso: item.fechaIngreso,
  }));

  // 1. Filtro por búsqueda de texto plano
  if (params.buscar && params.buscar.trim() !== "") {
    const q = params.buscar.trim().toLowerCase();
    result = result.filter(
      (item) =>
        item.dni.toLowerCase().includes(q) ||
        item.nombre.toLowerCase().includes(q) ||
        item.apellido.toLowerCase().includes(q) ||
        `${item.nombre} ${item.apellido}`.toLowerCase().includes(q) ||
        `${item.apellido} ${item.nombre}`.toLowerCase().includes(q) ||
        item.cuil.toLowerCase().includes(q) ||
        item.numeroIeric.toLowerCase().includes(q),
    );
  }

  // 2. Filtro por categoría
  if (params.categoria && params.categoria !== "") {
    result = result.filter((item) => item.categoriaActual === params.categoria);
  }

  // 3. Filtro por estado
  if (params.estado && params.estado !== "") {
    result = result.filter((item) => item.estadoActual === params.estado);
  } else {
    // Filtro implícito por defecto: ACTIVO o EN_OBRA
    result = result.filter(
      (item) => item.estadoActual === "ACTIVO" || item.estadoActual === "EN_OBRA",
    );
  }

  // 4. Ordenamiento alfabético por Apellido
  result.sort((a, b) =>
    a.apellido.localeCompare(b.apellido, "es", { sensitivity: "base" }),
  );

  // 5. Paginación
  const page = (params.page ?? 0) < 0 ? 0 : (params.page ?? 0);
  const size = (params.size ?? 10) <= 0 ? 10 : (params.size ?? 10);
  const totalElements = result.length;
  const totalPages = Math.ceil(totalElements / size) || 1;
  const startIndex = page * size;
  const pageContent = result.slice(startIndex, startIndex + size);

  return {
    content: pageContent,
    totalElements,
    totalPages,
    size,
    number: page,
  };
}

export const legajosApi = {
  // GET /EmpleadosPaginados?buscar={buscar}&estado={estado}&page={page}&size={size}&sort=usuario.apellido,asc
  getPaginados: async (
    params: EmpleadoFilterParams,
  ): Promise<SpringPage<EmpleadoResumenResponseDto>> => {
    try {
      const queryParams: Record<string, unknown> = {
        page: params.page ?? 0,
        size: params.size ?? 10,
        sort: params.sort || "usuario.apellido,asc",
      };

      if (params.buscar?.trim()) queryParams.buscar = params.buscar.trim();
      if (params.estado) queryParams.estado = params.estado;
      if (params.categoria) queryParams.categoria = params.categoria;

      const response = await httpClient.get<SpringPage<EmpleadoResumenResponseDto>>(
        "/EmpleadosPaginados",
        { params: queryParams },
      );
      return response.data;
    } catch {
      return filterAndPaginateMock(params);
    }
  },

  // GET /ObtenerEmpleado/{id}
  getDetalle: async (id: number): Promise<EmpleadoResponseDto> => {
    try {
      const response = await httpClient.get<EmpleadoResponseDto>(
        `/ObtenerEmpleado/${id}`,
      );
      return response.data;
    } catch {
      const found = MOCK_EMPLEADOS_DETALLE.find((e) => e.id === id);
      if (found) return found;
      throw new Error(`Empleado con ID ${id} no encontrado.`);
    }
  },

  // POST /altaEmpleado (multipart/form-data)
  alta: async (datos: EmpleadoDto, foto?: File): Promise<EmpleadoResponseDto> => {
    const formData = new FormData();
    const jsonBlob = new Blob([JSON.stringify(datos)], {
      type: "application/json",
    });
    formData.append("datos", jsonBlob);
    if (foto) {
      formData.append("foto", foto);
    }

    const response = await httpClient.post<EmpleadoResponseDto>(
      "/altaEmpleado",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },

  // PUT /ModificarEmpleado/{id}
  modificar: async (
    id: number,
    payload: EmpleadoUpdateDto,
  ): Promise<EmpleadoResponseDto> => {
    const response = await httpClient.put<EmpleadoResponseDto>(
      `/ModificarEmpleado/${id}`,
      payload,
    );
    return response.data;
  },

  // PUT /{id}/foto (multipart/form-data)
  actualizarFoto: async (id: number, foto: File): Promise<EmpleadoResponseDto> => {
    const formData = new FormData();
    formData.append("foto", foto);

    const response = await httpClient.put<EmpleadoResponseDto>(
      `/${id}/foto`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },

  // DELETE /BajaEmpleado/{id}
  baja: async (
    id: number,
    payload: EmpleadoBajaDto,
  ): Promise<EmpleadoResponseDto> => {
    const response = await httpClient.delete<EmpleadoResponseDto>(
      `/BajaEmpleado/${id}`,
      { data: payload },
    );
    return response.data;
  },

  // PATCH /reactivarLegajo/{id}
  reactivar: async (
    id: number,
    payload: ReactivarLegajoRequestDto,
  ): Promise<EmpleadoResponseDto> => {
    const response = await httpClient.patch<EmpleadoResponseDto>(
      `/reactivarLegajo/${id}`,
      payload,
    );
    return response.data;
  },

  // GET /historial-estados/{id}
  getHistorialEstados: async (
    id: number,
  ): Promise<EmpleadoEstadoResponseDto[]> => {
    try {
      const response = await httpClient.get<EmpleadoEstadoResponseDto[]>(
        `/historial-estados/${id}`,
      );
      return response.data;
    } catch {
      return MOCK_HISTORIAL_ESTADOS[id] || [];
    }
  },
};
