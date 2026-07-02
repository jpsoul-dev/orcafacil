# Referência: Headers de Segurança, CORS, Dependências e Infraestrutura

## Headers de segurança HTTP

Verifique `next.config.js`/`.ts` por um bloco `headers()`. A ausência total não costuma ser Crítico isolado, mas soma risco e reduz a defesa em profundidade contra XSS/clickjacking:

```typescript
// next.config.ts
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' }, // previne clickjacking via iframe
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // Content-Security-Policy é o mais impactante e o mais trabalhoso de configurar
  // corretamente numa app real (precisa listar todos os domínios de script/estilo
  // usados: Stripe.js, fonts, analytics) — vale a pena mesmo que incremental
]

module.exports = {
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}
```

Classifique como 🔵 Baixo (hardening) a ausência isolada de headers — mas se combinado com XSS explorável (ver `client-side.md`), a falta de CSP eleva o impacto real daquele XSS, o que pode justificar subir a severidade do achado de XSS, não necessariamente criar um achado separado de Crítico só pela falta do header.

## CORS

Rotas de API que fazem `Access-Control-Allow-Origin: *` combinado com `Access-Control-Allow-Credentials: true` são uma combinação inválida/perigosa (navegadores modernos bloqueiam isso, mas configurações manuais às vezes tentam forçar). Se a API precisa ser chamada por outros domínios (ex: um app mobile ou parceiro), a origem deveria ser uma allowlist explícita, não wildcard, especialmente em rotas que retornam dados autenticados.

Na maioria dos apps Next.js full-stack (frontend e API no mesmo domínio), CORS customizado nem deveria existir — sua ausência é o estado seguro. Se você encontrar configuração de CORS aberta sem necessidade de negócio clara, sinalize.

## Dependências

- Rode (ou peça ao usuário para rodar, se não tiver acesso ao ambiente) `npm audit` / `pnpm audit` e reporte vulnerabilidades de severidade alta/crítica com CVE conhecido.
- Verifique `package.json` por dependências claramente desatualizadas (major version muito antiga) em pacotes críticos de segurança: `next`, `@supabase/*`, `stripe`, bibliotecas de auth.
- Pacotes com poucos downloads/manutenção abandonada usados para funções sensíveis (parsing, auth, crypto) merecem menção — prefira sempre a biblioteca oficial/mantida.

## Configuração de deploy Vercel

- `vercel.json` — redirects e rewrites não deveriam expor rotas administrativas ou de debug (`/api/debug`, `/api/admin` sem proteção).
- Rotas de debug/seed de banco de dados (comuns durante desenvolvimento, ex: `/api/seed`, `/api/reset-db`) esquecidas no código e acessíveis em produção são um achado clássico — procure especificamente por elas.
- `robots.txt`/metadata não deveria ser a única proteção de uma rota sensível — isso impede indexação por buscadores, não acesso direto.

## Logging e monitoramento

- Erros críticos (falha de pagamento, falha de autenticação repetida, erro 500 em rota sensível) são logados em algum lugar monitorável (Vercel logs, Sentry, etc.), ou desaparecem silenciosamente? Isso não é uma vulnerabilidade em si, mas afeta a capacidade de perceber um ataque em andamento — vale nota em Baixo/Informativo.

## Checklist rápido
- [ ] Headers de segurança básicos configurados (`X-Frame-Options`, `X-Content-Type-Options`, HSTS)
- [ ] CSP presente ou ao menos planejada, especialmente se há qualquer HTML dinâmico
- [ ] Nenhuma configuração de CORS wildcard combinada com credentials em rota autenticada
- [ ] Sem rotas de debug/seed/admin esquecidas e acessíveis sem autenticação
- [ ] `npm audit` sem vulnerabilidades altas/críticas não tratadas
- [ ] Erros sensíveis logados em ferramenta monitorável, não apenas no console
