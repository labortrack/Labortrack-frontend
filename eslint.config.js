import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist"]), // Ignora la carpeta generada por Vite durante la compilación.

  {
    files: ["**/*.{ts,tsx}"], // Analiza archivos TypeScript y componentes React TSX.

    extends: [
      js.configs.recommended, // Activa las reglas recomendadas para JavaScript.
      tseslint.configs.recommended, // Activa las reglas recomendadas para TypeScript.
      reactHooks.configs.flat.recommended, // Detecta usos incorrectos de React Hooks.
      reactRefresh.configs.vite, // Comprueba la compatibilidad con React Fast Refresh y Vite.
    ],

    languageOptions: {
      globals: globals.browser, // Habilita variables del navegador como window y document.
    },
  },
]);
