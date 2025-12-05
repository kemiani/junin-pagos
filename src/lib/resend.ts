import { Resend } from 'resend';

// Singleton del cliente Resend
let resendClient: Resend | null = null;

export function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY no está configurada');
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

// Configuración de email por defecto
export const emailConfig = {
  fromEmail: process.env.EMAIL_FROM_ADDRESS || 'noreply@juninpagos.net',
  fromName: process.env.EMAIL_FROM_NAME || 'Junín Pagos',
  replyTo: process.env.EMAIL_REPLY_TO || 'info@juninpagos.net',
};

// Helper para obtener el "from" formateado
export function getFromAddress(customName?: string): string {
  const name = customName || emailConfig.fromName;
  return `${name} <${emailConfig.fromEmail}>`;
}

// Función para reemplazar variables en templates
export function replaceTemplateVariables(
  content: string,
  variables: Record<string, string>
): string {
  let result = content;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  }
  return result;
}

// Tipos de respuesta de Resend
export interface ResendSendResponse {
  id: string;
}

export interface ResendError {
  statusCode: number;
  message: string;
  name: string;
}
