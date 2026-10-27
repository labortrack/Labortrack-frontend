import { describe, expect, it } from "vitest";
import type { ChatMessage } from "../types/ragChat.types";
import {
  ID_BIENVENIDA,
  UMBRAL_FINAL_PX,
  avatarDeBurbuja,
  esConversacionVacia,
  estaAlFinal,
} from "./trackyChatVista";

const bienvenida: ChatMessage = { id: ID_BIENVENIDA, sender: "bot", content: "¡Hola!" };
const pregunta: ChatMessage = { id: "user-1", sender: "user", content: "¿Qué EPP es obligatorio en obra?" };

describe("esConversacionVacia", () => {
  it("con solo la bienvenida está vacía", () => {
    expect(esConversacionVacia([bienvenida])).toBe(true);
  });

  it("sin mensajes está vacía", () => {
    expect(esConversacionVacia([])).toBe(true);
  });

  it("con una pregunta del usuario deja de estar vacía", () => {
    expect(esConversacionVacia([bienvenida, pregunta])).toBe(false);
  });
});

describe("avatarDeBurbuja", () => {
  it("la respuesta en curso lleva el avatar grande escribiendo", () => {
    expect(avatarDeBurbuja({ enCurso: true, enVuelo: false })).toEqual({
      tamano: "grande",
      estado: "escribiendo",
      animado: true,
    });
  });

  it("una respuesta ya escrita lleva el avatar chico en reposo", () => {
    expect(avatarDeBurbuja({ enCurso: false, enVuelo: false })).toEqual({
      tamano: "chico",
      estado: "inactivo",
      animado: false,
    });
  });

  it("si sale otra consulta durante el tipeo, cede el protagonismo", () => {
    expect(avatarDeBurbuja({ enCurso: true, enVuelo: true })).toEqual({
      tamano: "chico",
      estado: "inactivo",
      animado: false,
    });
  });

  it("las respuestas anteriores siguen en reposo con una consulta en vuelo", () => {
    expect(avatarDeBurbuja({ enCurso: false, enVuelo: true }).animado).toBe(false);
  });
});

describe("estaAlFinal", () => {
  // Contenido de 1000px en una ventana de 400px: el final está en scrollTop = 600.
  const medidas = { clientHeight: 400, scrollHeight: 1000 };

  it("justo en el final está al final", () => {
    expect(estaAlFinal({ ...medidas, scrollTop: 600 })).toBe(true);
  });

  it("dentro del umbral sigue contando como al final", () => {
    expect(estaAlFinal({ ...medidas, scrollTop: 600 - UMBRAL_FINAL_PX })).toBe(true);
  });

  it("fuera del umbral no está al final", () => {
    expect(estaAlFinal({ ...medidas, scrollTop: 600 - UMBRAL_FINAL_PX - 1 })).toBe(false);
  });

  it("arriba de todo, con contenido largo, no está al final", () => {
    expect(estaAlFinal({ ...medidas, scrollTop: 0 })).toBe(false);
  });

  it("sin scroll (el contenido entra entero) cuenta como al final", () => {
    expect(estaAlFinal({ scrollTop: 0, clientHeight: 400, scrollHeight: 300 })).toBe(true);
  });

  it("acepta un umbral propio", () => {
    expect(estaAlFinal({ ...medidas, scrollTop: 590, umbral: 5 })).toBe(false);
  });
});
