/**
 * Utilitário de log que respeita o ambiente (NODE_ENV).
 * Evita o vazamento de dados sensíveis em produção.
 */

const isProd = process.env.NODE_ENV === 'production'

export const logger = {
  info: (message: string, ...args: unknown[]) => {
    if (!isProd) {
      console.log(`[INFO] ${message}`, ...args)
    }
  },
  
  warn: (message: string, ...args: unknown[]) => {
    if (!isProd) {
      console.warn(`[WARN] ${message}`, ...args)
    }
  },

  error: (message: string, error?: unknown, ...args: unknown[]) => {
    // Em produção, ainda queremos logar erros para monitoramento, 
    // mas devemos ter cuidado para não incluir dados sensíveis nos args.
    if (isProd) {
      console.error(`[ERROR] ${message}`, error instanceof Error ? error.message : error)
    } else {
      console.error(`[ERROR] ${message}`, error, ...args)
    }
  },

  debug: (message: string, ...args: unknown[]) => {
    if (!isProd) {
      console.debug(`[DEBUG] ${message}`, ...args)
    }
  },
}
