# Referência: Segurança Client-Side

## XSS (Cross-Site Scripting)

React escapa conteúdo por padrão — a maioria das apps Next.js já está protegida contra XSS refletido/armazenado simples só por usar JSX normalmente. As exceções são onde o dev sai desse caminho seguro deliberadamente:

```tsx
// 🔴 CRÍTICO se o conteúdo vem de input de usuário (nome, descrição, bio, comentário)
<div dangerouslySetInnerHTML={{ __html: orcamento.observacoes }} />

// ✅ Se precisa renderizar HTML de fato (ex: editor rich text), sanitize antes:
import DOMPurify from 'isomorphic-dompurify'
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(orcamento.observacoes) }} />
```

Outros vetores menos óbvios a checar:
- `href={userProvidedUrl}` sem validar o protocolo — um `javascript:` URI em um link controlado pelo usuário executa código. Valide que a URL começa com `http://` ou `https://` antes de usar em `href`/`src`.
- `<iframe src={...}>` ou `<script>` montado dinamicamente a partir de dado do usuário.
- Bibliotecas de markdown/rich-text renderizando HTML embutido sem sanitização (`react-markdown` sem `rehype-sanitize`, por exemplo).
- Nome de arquivo de upload exibido sem escape em algum contexto que renderiza HTML bruto (raro em React puro, mas vale checar em qualquer `innerHTML` manual via `ref`).

## Dados sensíveis no `localStorage`/`sessionStorage`

```typescript
// 🟠 ALTO: token de sessão, dados de pagamento, ou PII sensível em localStorage
// fica acessível a qualquer script rodando na página (inclusive de uma dependência
// npm comprometida) e sobrevive a fechamento do navegador
localStorage.setItem('auth_token', token)

// O cliente Supabase (@supabase/ssr) já gerencia sessão via cookies httpOnly
// corretamente por padrão — o risco aqui normalmente vem de código customizado
// que decide "cachear" algo sensível manualmente por conveniência.
```

Cookies de sessão devem ser `httpOnly` (inacessíveis a JS, o padrão do `@supabase/ssr`), `secure` (só HTTPS) e `sameSite` apropriado. Se o projeto usa cookies customizados além dos gerenciados pelo Supabase, confira essas três flags.

## Client Components fazendo o que deveria ser Server

Verifique se lógica de decisão (ex: "este usuário é admin, mostrar botão de deletar") é feita apenas escondendo o botão no client, sem o servidor recusar a ação de qualquer forma. Esconder um botão não é controle de acesso — é só limpar a UI para o caso feliz. A checagem real tem que existir na Server Action/API que o botão chama.

```tsx
// 🟡 Isso é só UX, não segurança — o botão sumir não impede a Server Action
// de ser chamada diretamente se ela mesma não checar admin
{user.role === 'admin' && <button onClick={deletarTudo}>Deletar</button>}
```

## Postmessage e integrações com iframes/widgets externos

Se o app embute ou é embutido em iframes (ex: widget de chat, checkout embutido), verifique se handlers de `window.addEventListener('message', ...)` validam `event.origin` antes de confiar no conteúdo da mensagem — sem isso, qualquer página pode enviar mensagens forjadas.

## Checklist rápido
- [ ] Nenhum `dangerouslySetInnerHTML` com conteúdo de usuário sem sanitização (DOMPurify ou similar)
- [ ] URLs controladas por usuário validadas contra protocolo `javascript:` antes de usar em `href`/`src`
- [ ] Nenhum token de autenticação ou dado sensível salvo manualmente em `localStorage`/`sessionStorage`
- [ ] Decisões de UI (esconder botão) sempre respaldadas por checagem real no server
- [ ] Handlers de `postMessage` validam `event.origin`
