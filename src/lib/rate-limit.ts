// Rate limiter simple in-memory
// Para produccion usar @upstash/ratelimit o similar con Redis

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Configuracion
const WINDOW_MS = 60 * 1000; // 1 minuto
const MAX_REQUESTS = 5; // 5 requests por minuto por IP

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  // Limpiar entradas expiradas periodicamente
  if (rateLimitMap.size > 1000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }

  if (!entry || now > entry.resetTime) {
    // Nueva ventana
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + WINDOW_MS,
    });
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetIn: WINDOW_MS };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { 
      allowed: false, 
      remaining: 0, 
      resetIn: entry.resetTime - now 
    };
  }

  // Incrementar contador
  entry.count++;
  return { 
    allowed: true, 
    remaining: MAX_REQUESTS - entry.count, 
    resetIn: entry.resetTime - now 
  };
}
