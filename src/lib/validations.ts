import { z } from "zod";

// Schema de validacion para el formulario de contacto
export const contactFormSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres")
    .transform((val) => val.trim()),
  telefono: z
    .string()
    .min(8, "El telefono debe tener al menos 8 digitos")
    .max(20, "El telefono no puede exceder 20 caracteres")
    .regex(/^[\d\s\-\+\(\)]+$/, "Formato de telefono invalido")
    .transform((val) => val.trim()),
  localidad: z
    .string()
    .max(100, "La localidad no puede exceder 100 caracteres")
    .optional()
    .transform((val) => val?.trim() || ""),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

// Schema para el lead completo (con metadata)
export const contactLeadSchema = contactFormSchema.extend({
  fecha: z.string(),
  ip: z.string(),
});

export type ContactLead = z.infer<typeof contactLeadSchema>;
