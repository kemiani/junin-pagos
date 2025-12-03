import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Clave simple para proteger el endpoint (en produccion usar auth real)
const ADMIN_KEY = process.env.ADMIN_KEY || "admin123";

export async function GET(request: NextRequest) {
  // Verificar clave de admin
  const authHeader = request.headers.get("authorization");
  const key = authHeader?.replace("Bearer ", "");

  if (key !== ADMIN_KEY) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401 }
    );
  }

  try {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[SUPABASE ERROR]", error);
      return NextResponse.json(
        { error: "Error obteniendo leads" },
        { status: 500 }
      );
    }

    return NextResponse.json({ leads: data });
  } catch (error) {
    console.error("[API ERROR]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
