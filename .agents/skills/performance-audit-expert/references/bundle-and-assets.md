# Referência: Bundle, Code Splitting, Imagens, Fontes e Scripts de Terceiros

## Medir antes de adivinhar

Sempre que possível, prefira dados reais a suposição. O Next.js 16.1+ inclui um Bundle Analyzer interativo (`next build` com o analyzer habilitado) que mostra um treemap dos módulos que compõem cada bundle — use-o para confirmar que um achado de "biblioteca pesada" realmente pesa o que parece pesar antes de reportar como Alto/Crítico. Se não houver build disponível para rodar, trate achados de bundle como heurísticos (baseados em conhecimento do pacote) e diga isso claramente no relatório.

## Barrel imports e imports de biblioteca inteira

```typescript
// 🟠 ALTO: importa a biblioteca inteira no bundle client, mesmo usando 1 função
import _ from 'lodash'
const total = _.sumBy(items, 'price')

// ✅ CORRETO: importa só a função usada
import sumBy from 'lodash/sumBy'
const total = sumBy(items, 'price')

// 🟡 MÉDIO: import com * costuma impedir tree-shaking efetivo
import * as Icons from 'lucide-react'
<Icons.Trash />

// ✅ CORRETO: import nomeado, tree-shakeable
import { Trash } from 'lucide-react'
```

O `next.config.ts` tem `experimental.optimizePackageImports`, que faz essa otimização automaticamente para pacotes conhecidos (inclusive `lucide-react` e a maioria das bibliotecas de ícones populares já vêm cobertas por padrão). Verifique se está habilitado para bibliotecas grandes usadas no projeto antes de marcar todo `import *` como achado — pode já estar mitigado pelo compilador.

## Dependências pesadas com alternativa mais leve

Ao ler `package.json`, esteja atento a pacotes conhecidos por seu peso relativo, especialmente se usados em componentes client:

| Pacote pesado | Alternativa mais leve (quando o caso de uso permite) |
|---|---|
| `moment` | `date-fns` (tree-shakeable) ou `Intl.DateTimeFormat` nativo |
| `lodash` (import completo) | `lodash-es` com imports pontuais, ou funções nativas de array/objeto |
| `jquery` | Praticamente nunca necessário num app Next.js/React moderno |
| `chart.js`/bibliotecas de gráfico completas | Carregar via `dynamic()` se o gráfico não é crítico para o LCP |

Isso não é uma condenação automática — se a biblioteca é usada extensivamente e a troca teria alto custo de refatoração, classifique como 🔵 Baixo/hardening em vez de bloquear o relatório nisso. O que importa é o peso **no bundle client**; a mesma biblioteca usada só em Server Components/Server Actions não afeta o que é baixado pelo navegador.

## Code splitting com `dynamic()`

Componentes pesados que não são necessários no carregamento inicial (modais, editores ricos, gráficos abaixo da dobra, funcionalidades atrás de um clique) deveriam ser carregados sob demanda:

```typescript
// 🟡 MÉDIO: editor de texto rico pesado carregado no bundle inicial,
// mesmo só aparecendo quando o usuário clica em "editar descrição"
import RichTextEditor from '@/components/rich-text-editor'

// ✅ CORRETO: só baixa o código do editor quando ele é de fato renderizado
import dynamic from 'next/dynamic'
const RichTextEditor = dynamic(() => import('@/components/rich-text-editor'), {
  loading: () => <EditorSkeleton />,
})
```

## Imagens — `next/image` é quase sempre a resposta certa

```tsx
// 🟠 ALTO: <img> nativo não otimiza formato/tamanho nem evita CLS
<img src="/hero.jpg" alt="Produto" />

// ✅ CORRETO
import Image from 'next/image'
<Image
  src="/hero.jpg"
  alt="Produto"
  width={1200}
  height={630}
  priority // se esta imagem é o elemento de LCP da página
  sizes="(max-width: 768px) 100vw, 50vw" // se responsiva
/>
```

Pontos a verificar:
- **`priority`** na imagem que define o LCP (geralmente o hero/banner principal, acima da dobra). Sem isso, o Next.js aplica lazy loading até nela, atrasando o LCP.
- **`width`/`height`** (ou `fill` com container dimensionado) sempre presentes — sem isso o navegador não reserva espaço e causa CLS quando a imagem carrega.
- **`images.remotePatterns`/`domains`** em `next.config.ts` cobrindo os domínios usados — se ausente, imagens remotas caem no modo não otimizado.
- **`images.unoptimized: true`** no `next.config.ts` desliga a otimização de imagem do Next inteira — confirme se isso é intencional (ex: export estático) antes de reportar, mas se não for, é 🟠 Alto.

## Fontes — `next/font` evita requisição bloqueante e layout shift

```tsx
// 🟠 ALTO: fonte do Google carregada via <link>, é uma requisição de rede
// externa que bloqueia a renderização e pode causar FOUT/FOIT
<link href="https://fonts.googleapis.com/css2?family=Inter" rel="stylesheet" />

// ✅ CORRETO: next/font faz self-host da fonte no build, sem requisição externa
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'], display: 'swap' })
```

## Scripts de terceiros — nem tudo precisa bloquear o carregamento

```tsx
// 🟠 ALTO: script de terceiro (analytics, chat, pixel) via <script> puro no <head>,
// bloqueia o parsing/renderização inicial
<script src="https://widget.exemplo.com/embed.js" />

// ✅ CORRETO: next/script com estratégia adequada ao caso de uso
import Script from 'next/script'
<Script src="https://widget.exemplo.com/embed.js" strategy="afterInteractive" />
// ou strategy="lazyOnload" para algo ainda menos crítico (chat widget, por exemplo)
```

`beforeInteractive` só deve ser usado para scripts realmente necessários antes de qualquer interação (ex: polyfill crítico) — é a estratégia menos performática e deve ser exceção, não padrão.

## Checklist rápido
- [ ] Nenhum `import` de biblioteca inteira quando só uma função/componente é usado
- [ ] Componentes pesados fora do caminho crítico usam `dynamic()`
- [ ] Toda imagem usa `next/image`; a imagem do LCP tem `priority`
- [ ] Toda imagem tem `width`/`height` ou `fill` com container dimensionado
- [ ] Fontes usam `next/font`, não `<link>` externo
- [ ] Scripts de terceiros usam `next/script` com estratégia adequada (raramente `beforeInteractive`)
