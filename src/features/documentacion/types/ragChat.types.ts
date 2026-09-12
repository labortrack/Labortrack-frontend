export interface RagFuenteCitada {
  id?: string | number;
  titulo: string;
  seccion?: string;
  pagina?: number | string;
  tipoDocumento?: string;
  url?: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  content: string;
  timestamp?: string | Date;
  fuentes?: RagFuenteCitada[];
  isStreaming?: boolean;
  isError?: boolean;
}

export interface ConsultarChatRequestDto {
  pregunta: string;
}

export interface ConsultarChatResponseDto {
  respuesta: string;
  fuentes?: RagFuenteCitada[];
}

