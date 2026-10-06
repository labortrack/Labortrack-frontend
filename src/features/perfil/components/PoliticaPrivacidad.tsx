import type { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/shared/ui";
import { useEmpresa } from "@/features/empresa/hooks/useEmpresa";

function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="space-y-1.5">
      <h3 className="text-sm font-bold text-foreground">{titulo}</h3>
      <div className="space-y-1.5 text-sm leading-6 text-foreground-muted">
        {children}
      </div>
    </section>
  );
}

// Resume cómo LaborTrack trata los datos personales. Al ingresar a la plataforma el
// usuario acepta los Términos y Condiciones (RF166), por eso no se pide aceptación aquí.
export function PoliticaPrivacidad() {
  const { data: empresa } = useEmpresa();
  const responsable = empresa
    ? `${empresa.razonSocial} (CUIT ${empresa.cuit})`
    : "la empresa empleadora";

  return (
    <Card>
      <CardHeader className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <ShieldCheck className="size-5" />
        </span>
        <div>
          <h2 className="text-base font-bold text-foreground">
            Privacidad y Términos de uso
          </h2>
          <p className="text-xs text-foreground-muted">
            Cómo se tratan tus datos personales dentro de LaborTrack.
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <Seccion titulo="Responsable de los datos">
          <p>
            El responsable del tratamiento es {responsable}
            {empresa?.emailEmpresa ? (
              <>
                , con quien podés comunicarte en{" "}
                <a
                  href={`mailto:${empresa.emailEmpresa}`}
                  className="font-semibold text-primary hover:underline"
                >
                  {empresa.emailEmpresa}
                </a>
              </>
            ) : null}
            . LaborTrack es la plataforma que la empresa utiliza para gestionar
            esa información.
          </p>
        </Seccion>

        <Seccion titulo="Qué datos se registran">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Datos de identificación y contacto: nombre, DNI, CUIL, domicilio,
              teléfono y contacto de emergencia.
            </li>
            <li>
              Datos laborales: categoría UOCRA, número de IERIC, grupo de
              actividad, obra y cuadrilla asignadas.
            </li>
            <li>
              Asistencia: ingresos y egresos registrados escaneando el QR de la
              obra, con fecha y hora. No se registra tu ubicación por GPS.
            </li>
            <li>
              Ausencias y licencias, con la documentación que las respalda.
            </li>
            <li>
              Recibos de sueldo, documentación del legajo y elementos de
              protección personal entregados.
            </li>
          </ul>
        </Seccion>

        <Seccion titulo="Para qué se usan">
          <p>
            Para administrar la relación laboral: planificación de obras y
            cuadrillas, control de asistencia, liquidación de haberes, gestión de
            licencias y cumplimiento de las normas de higiene y seguridad.
          </p>
        </Seccion>

        <Seccion titulo="Quién puede verlos">
          <p>
            Cada persona accede a sus propios datos. Recursos Humanos y la
            administración acceden según su función. El capataz y el líder de
            cuadrilla solo ven la información operativa de su obra o cuadrilla.
          </p>
          <p>
            La documentación del legajo es privada: solo la ven vos y Recursos
            Humanos, y los archivos se abren mediante enlaces temporales que el
            sistema genera tras verificar tu identidad.
          </p>
        </Seccion>

        <Seccion titulo="Tus derechos">
          <p>
            Según la Ley 25.326 de Protección de Datos Personales, podés acceder
            a tus datos y pedir que se rectifiquen, actualicen o supriman cuando
            corresponda. Tus datos de contacto los podés actualizar desde esta
            misma sección; para el resto, comunicate con Recursos Humanos.
          </p>
        </Seccion>

        <Seccion titulo="Aceptación">
          <p>
            Al ingresar y operar en LaborTrack aceptás sus Términos y
            Condiciones de uso, incluida esta política de privacidad.
          </p>
        </Seccion>
      </CardContent>
    </Card>
  );
}
