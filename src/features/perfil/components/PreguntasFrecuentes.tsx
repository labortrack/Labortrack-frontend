import type { ReactNode } from "react";
import { ChevronDown, CircleHelp } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/shared/ui";

interface Pregunta {
  pregunta: string;
  respuesta: ReactNode;
}

interface Categoria {
  titulo: string;
  preguntas: Pregunta[];
}

const CATEGORIAS: Categoria[] = [
  {
    titulo: "Cuenta y acceso",
    preguntas: [
      {
        pregunta: "¿Cómo cambio mi contraseña?",
        respuesta: (
          <p>
            Desde el menú de tu perfil, entrá a <strong>Mi cuenta</strong> y usá
            el botón <strong>Cambiar contraseña</strong>. Vas a tener que
            ingresar tu contraseña actual y repetir la nueva.
          </p>
        ),
      },
      {
        pregunta: "Olvidé mi contraseña, ¿qué hago?",
        respuesta: (
          <p>
            En la pantalla de inicio de sesión elegí{" "}
            <strong>¿Olvidaste tu contraseña?</strong> e ingresá tu correo. Si
            está registrado, vas a recibir las instrucciones para crear una
            nueva.
          </p>
        ),
      },
      {
        pregunta: "Ingreso con Google, ¿por qué no puedo cambiar la contraseña?",
        respuesta: (
          <p>
            Si ingresás con Google no tenés una contraseña local en LaborTrack.
            Si querés crear una, usá la opción de recuperar contraseña desde la
            pantalla de inicio.
          </p>
        ),
      },
    ],
  },
  {
    titulo: "Mi legajo y datos personales",
    preguntas: [
      {
        pregunta: "¿Qué es mi legajo?",
        respuesta: (
          <p>
            Es tu ficha laboral: datos personales, de contacto y la información
            de tu puesto dentro de la empresa. Lo consultás desde{" "}
            <strong>Mi Legajo</strong> en el menú de tu perfil.
          </p>
        ),
      },
      {
        pregunta: "No veo la opción Mi Legajo, ¿por qué?",
        respuesta: (
          <p>
            Tu usuario todavía no tiene un legajo asociado. Comunicate con
            Recursos Humanos para que lo den de alta y lo vinculen a tu cuenta.
          </p>
        ),
      },
      {
        pregunta: "¿Puedo modificar mis datos?",
        respuesta: (
          <p>
            Sí, los datos habilitados para edición los podés actualizar desde
            Mi Legajo. Si salís con cambios sin guardar, el sistema te avisa
            antes de descartarlos. Los datos laborales los gestiona Recursos
            Humanos.
          </p>
        ),
      },
      {
        pregunta: "¿Quién puede ver mis datos?",
        respuesta: (
          <p>
            Recursos Humanos y la administración acceden según su función. El
            capataz y el líder de cuadrilla solo ven la información operativa de
            su obra o cuadrilla. En <strong>Términos y condiciones</strong> tenés
            el detalle de cómo se tratan tus datos personales.
          </p>
        ),
      },
    ],
  },
  {
    titulo: "Asistencias, ausencias y equipamiento",
    preguntas: [
      {
        pregunta: "¿Dónde veo mis asistencias?",
        respuesta: (
          <p>
            En <strong>Mis asistencias</strong> ves la asistencia del día y el
            historial de tus jornadas anteriores, filtrado por mes y año.
          </p>
        ),
      },
      {
        pregunta: "¿Cómo solicito una ausencia?",
        respuesta: (
          <p>
            Desde <strong>Mis Ausencias</strong> creás la solicitud, elegís el
            tipo y las fechas. Recursos Humanos la evalúa y podés seguir su
            estado desde la misma sección.
          </p>
        ),
      },
      {
        pregunta: "¿Qué archivos puedo adjuntar a una solicitud de ausencia?",
        respuesta: (
          <p>
            Archivos PDF, JPG o PNG, de hasta 10 MB cada uno y 19 MB en total.
            Algunos tipos de ausencia exigen adjuntar al menos un documento,
            por ejemplo un certificado.
          </p>
        ),
      },
      {
        pregunta: "¿Dónde veo los elementos de protección que me entregaron?",
        respuesta: (
          <p>
            En <strong>Mi Equipo</strong> figuran los EPP (casco, botas,
            guantes, etc.) que te asignó la empresa.
          </p>
        ),
      },
    ],
  },
  {
    titulo: "Documentación",
    preguntas: [
      {
        pregunta: "¿Dónde encuentro mi documentación?",
        respuesta: (
          <p>
            En la sección <strong>Documentación</strong> del menú lateral ves
            los documentos que la empresa cargó y que tenés habilitados.
          </p>
        ),
      },
      {
        pregunta: "¿Por qué algunos documentos tienen que ser PDF?",
        respuesta: (
          <p>
            Los documentos que alimentan al Asistente Virtual se procesan con
            IA, y para eso deben estar en formato PDF. El resto de los
            documentos acepta otros formatos, como Word, Excel o imágenes.
          </p>
        ),
      },
    ],
  },
  {
    titulo: "Asistente Virtual (IA)",
    preguntas: [
      {
        pregunta: "¿Qué es Tracky?",
        respuesta: (
          <p>
            Es el Asistente Virtual de LaborTrack. Responde consultas sobre
            convenios colectivos, normativas internas y documentación de
            Recursos Humanos.
          </p>
        ),
      },
      {
        pregunta: "¿De dónde saca la información?",
        respuesta: (
          <p>
            De los documentos que la empresa cargó y habilitó para la IA. Cada
            respuesta cita las fuentes que usó, así podés abrir el documento
            original y verificarlo.
          </p>
        ),
      },
      {
        pregunta: "¿Puedo confiar en todas sus respuestas?",
        respuesta: (
          <p>
            Tracky es una IA y puede cometer errores. Verificá la información
            importante en las fuentes citadas y, ante cualquier duda, consultá
            con Recursos Humanos.
          </p>
        ),
      },
      {
        pregunta: "Tracky no encuentra lo que busco, ¿qué hago?",
        respuesta: (
          <p>
            Reformulá la pregunta con palabras más concretas, por ejemplo el
            nombre del convenio o del tema. Si el documento no fue cargado,
            Tracky no va a poder responder sobre él: pedile a Recursos Humanos
            que lo incorpore.
          </p>
        ),
      },
    ],
  },
];

export function PreguntasFrecuentes() {
  return (
    <Card>
      <CardHeader className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <CircleHelp className="size-5" />
        </span>
        <div>
          <h2 className="text-base font-bold text-foreground">
            Preguntas frecuentes
          </h2>
          <p className="text-xs text-foreground-muted">
            Respuestas rápidas sobre el uso de LaborTrack.
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {CATEGORIAS.map((categoria) => (
          <section key={categoria.titulo} className="space-y-2">
            <h3 className="text-sm font-bold text-foreground">
              {categoria.titulo}
            </h3>
            <div className="divide-y divide-border rounded-lg border border-border">
              {categoria.preguntas.map(({ pregunta, respuesta }) => (
                <details key={pregunta} className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted [&::-webkit-details-marker]:hidden">
                    {pregunta}
                    <ChevronDown className="size-4 shrink-0 text-foreground-muted transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="px-4 pb-4 text-sm leading-6 text-foreground-muted">
                    {respuesta}
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}
      </CardContent>
    </Card>
  );
}
