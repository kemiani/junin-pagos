import { NextRequest, NextResponse } from "next/server";
import { contactFormSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/rate-limit";
import { supabase } from "@/lib/supabase";

// Obtener IP del request
function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);

  // 1. Rate Limiting
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intenta en unos minutos." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(rateLimit.resetIn / 1000)),
          "Retry-After": String(Math.ceil(rateLimit.resetIn / 1000)),
        },
      }
    );
  }

  // 2. CSRF Protection - Verificar header custom
  const requestedWith = request.headers.get("x-requested-with");
  if (requestedWith !== "XMLHttpRequest") {
    return NextResponse.json(
      { error: "Solicitud no valida" },
      { status: 403 }
    );
  }

  // 3. Validar Content-Type
  const contentType = request.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    return NextResponse.json(
      { error: "Content-Type debe ser application/json" },
      { status: 415 }
    );
  }

  // 4. Parsear JSON
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      { error: "JSON invalido en el cuerpo de la solicitud" },
      { status: 400 }
    );
  }

  // 5. Validar con Zod
  const validationResult = contactFormSchema.safeParse(rawBody);
  if (!validationResult.success) {
    const errors = validationResult.error.issues.map((e) => e.message).join(", ");
    return NextResponse.json(
      { error: errors },
      { status: 400 }
    );
  }

  const formData = validationResult.data;

  // 6. Guardar en Supabase
  try {
    const { error } = await supabase.from("leads").insert({
      nombre: formData.nombre,
      telefono: formData.telefono,
      localidad: formData.localidad || "",
      ip: ip,
    });

    if (error) {
      console.error("[SUPABASE ERROR]", error);
      return NextResponse.json(
        { error: "Error guardando los datos" },
        { status: 500 }
      );
    }

    console.log(`[LEAD] Nuevo contacto: ${formData.nombre} - ${formData.telefono}`);

    return NextResponse.json(
      { success: true, message: "Consulta recibida correctamente" },
      {
        status: 200,
        headers: {
          "X-RateLimit-Remaining": String(rateLimit.remaining),
        },
      }
    );
  } catch (error) {
    console.error("[API ERROR] Error guardando lead:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// Solo permitir POST
export async function GET() {
  return NextResponse.json(
    { error: "Metodo no permitido" },
    { status: 405 }
  );
}
