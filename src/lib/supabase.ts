import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Tipo para la tabla leads
export interface Lead {
  id?: number;
  nombre: string;
  telefono: string;
  localidad: string;
  ip: string;
  created_at?: string;
}
