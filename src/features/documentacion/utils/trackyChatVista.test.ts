import { describe, expect, it } from "vitest";
import type { ChatMessage } from "../types/ragChat.types";
import {
  ID_BIENVENIDA,
  avatarDeBurbuja,
  esConversacionVacia,
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
