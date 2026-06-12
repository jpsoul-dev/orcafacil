# PRD — Server-Side PDF Generation for Quotes

**Escopo:** Geração de PDF no servidor para orçamentos.

---

## 1. Contexto e Problema

Atualmente, a tela de visualização de orçamentos (`/app/quotes/[id]`) possui botões para imprimir e baixar PDF. Esse fluxo é executado inteiramente no lado do cliente (client-side) acionando o `window.print()` do navegador, com algumas regras de CSS (`@media print`) para ocultar elementos da interface.

Esse fluxo apresenta os seguintes problemas críticos:
*   **Inconsistência de Quebra de Página:** Tabelas e textos longos são cortados no meio da página de forma imprevisível, dependendo do conteúdo do orçamento e do navegador do usuário.
*   **Rodapés Desalinhados:** Elementos de rodapé fixos são inconsistentes e quebram o layout em diferentes browsers (Chrome, Safari, Firefox).
*   **Resultado Não Determinístico:** A visualização e impressão dependem das configurações locais do dispositivo do cliente, impedindo a consistência visual do documento final gerado pela plataforma.
*   **Botões Redundantes:** O botão "Baixar PDF" faz a mesma ação que "Imprimir" (chama o print do browser), em vez de realizar um download direto e limpo do arquivo PDF.

---

## 2. Solução Proposta

Substituir a abordagem client-side pela **geração de PDF no servidor** (server-side) usando a biblioteca `@react-pdf/renderer` integrada ao Next.js (App Router).

### Fluxo de Trabalho do Usuário:
1.  Na tela de visualização do orçamento (`/app/quotes/[id]`), o usuário clica em "Imprimir" ou "Baixar PDF".
2.  O navegador abre uma nova aba apontando para a API Route `/api/quotes/[id]/pdf` (com query param opcional para download direto).
3.  A API Route valida a autenticação do usuário, obtém as informações completas do orçamento no banco de dados via RPC existente, renderiza o componente PDF e retorna o buffer binário com o `Content-Type: application/pdf`.
4.  O usuário visualiza o PDF final padronizado com paginação correta, controle de quebras e rodapés fixos em qualquer dispositivo ou navegador.

---

## 3. Restrições e Padrões Técnicos

*   **Stack Principal:** Next.js 16 (App Router), React 19, Supabase, Vercel.
*   **Bibliotecas Permitidas:** `@react-pdf/renderer`. Puppeteer, Playwright ou ferramentas baseadas em browser headless são proibidas devido a limitações de tamanho de bundle e tempo de execução na Vercel (limite de 50MB de Serverless Functions).
*   **Execução Serverless:** O PDF deve ser gerado na API Route usando `renderToBuffer` do `@react-pdf/renderer` para retornar uma resposta síncrona de buffer como Response do Next.js.
*   **Isolamento de Código:** O arquivo `route.ts` da API não deve conter JSX diretamente. A renderização do componente React de PDF deve ocorrer por meio de `React.createElement`.

---

## 4. Instalação de Dependências

Instalar no projeto as seguintes dependências com suporte a React 19 (usar `--legacy-peer-deps` se houver restrições de peer dependencies da biblioteca com React 19):

*   `@react-pdf/renderer` (produção)
*   `@types/react-pdf` (desenvolvimento)

---

## 5. Estrutura de Arquivos

Seguindo a arquitetura padrão do projeto (onde as pastas `app`, `components`, `types` e `lib` estão diretamente na raiz, sem a pasta `src/`), a feature deve ser organizada da seguinte forma:

```text
├── types/
│   └── quote.ts              ← [NEW] Tipos estruturados de Orçamentos (extraídos do quote-viewer.tsx)
├── lib/
│   └── services/
│       └── quote-service.ts  ← [NEW] Serviço para encapsular buscas e lógica de banco de dados de orçamentos
├── components/
│   └── quote-pdf.tsx         ← [NEW] Componente React-PDF do orçamento
└── app/
    └── api/
        └── quotes/
            └── [id]/
                └── pdf/
                    └── route.ts ← [NEW] API Route que autentica, busca dados e serve o PDF
```

---

## 6. Modelo e Tipos de Dados

Para evitar duplicação de definições de tipos (violação do princípio DRY), as definições de tipos devem ser movidas de `components/quote-viewer.tsx` para um arquivo central de tipos `types/quote.ts`. O componente de PDF e a API Route devem consumir estas mesmas definições.

### 6.1 Mapeamento de Tipos (`types/quote.ts`):

```typescript
export type QuoteStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'completed'
  | 'expired'

export interface QuoteItem {
  item_name: string
  quantity: number
  unit_price: number
  subtotal: number
  unit_measure?: string
  discount_type?: 'none' | 'percentage' | 'fixed' | null
  discount_value?: number | null
}

export interface Customer {
  name: string
  document: string
  phone: string
  address_street: string
  address_number?: string
  address_neighborhood: string
  address_city: string
  address_state: string
  address_zip: string
  address_complement?: string
  email?: string
  whatsapp?: string
}

export interface Company {
  name: string
  logo_url?: string
  phone?: string
  whatsapp?: string
  cnpj?: string
  email?: string
  address_street?: string
  address_number?: string
  address_neighborhood?: string
  address_city?: string
  address_state?: string
  address_zip?: string
  address_complement?: string
}

export interface Quote {
  id: string
  quote_number: number
  public_uuid: string
  status: QuoteStatus
  title: string
  created_at: string
  valid_until?: string | null
  subtotal: number
  discount_value: number
  discount_type: 'percentage' | 'fixed'
  total: number
  notes?: string
  payment_method?: string | string[] | null
  customer_id: string
  customer: Customer
  company: Company
  items: QuoteItem[]
  cancellation_reason?: string | null
  show_quote_number: boolean
}
```

---

## 7. Componente de Geração do PDF (`components/quote-pdf.tsx`)

### 7.1 Requisitos de Design e Estrutura

O componente `QuotePDF` deve aceitar a propriedade `{ quote: Quote }` e retornar um elemento `<Document>` do `@react-pdf/renderer`. Os estilos devem ser declarados com `StyleSheet.create` da própria biblioteca. Não utilizar CSS ou Tailwind CSS.

### 7.2 Configurações do Documento:
*   **Página:** Tamanho A4 (`size="A4"`), orientação Retrato (`portrait`).
*   **Margens:** Margem superior de 32pt, laterais de 36pt, margem inferior de 60pt (para reservar espaço para o rodapé fixo sem sobreposição).
*   **Tipografia:** Utilizar fontes built-in como `Helvetica` e `Helvetica-Bold` para evitar overhead de rede.
*   **Cores do Projeto:**
    *   `Dark Gray` (`#1e293b`): Cabeçalhos, títulos principais, textos principais.
    *   `Medium Gray` (`#64748b`): Rótulos, metadados, textos secundários.
    *   `Light Gray` (`#e2e8f0`): Bordas e divisores horizontais.
    *   `Green` (`#16a34a`): Valor de desconto.
    *   `White` (`#ffffff`): Fundo e textos sobre fundo escuro.

### 7.3 Seções do Layout (Ordem de Renderização):

1.  **Cabeçalho da Empresa:**
    *   Nome da empresa em destaque (18pt, `Helvetica-Bold`, `#1e293b`).
    *   Informações de contato (Telefone, WhatsApp, E-mail) em linha única com tamanho 8pt, separadas por ` | `. Omitir campos nulos ou ausentes.
    *   Endereço da empresa em linha dedicada, formato 8pt.
    *   Divisor horizontal em `#e2e8f0`.

2.  **Identificação do Orçamento:**
    *   Título "Orçamento" (20pt, negrito).
    *   Número sequencial do orçamento ("N° X") no canto superior direito em 14pt negrito (renderizar apenas se `quote.show_quote_number` for verdadeiro).
    *   Descrição/Título específico do orçamento em itálico 9pt, se preenchido.
    *   Data de validade formatada em formato extenso em português (ex: "Válido até: 24 de junho de 2026") alinhado à direita.

3.  **Dados do Cliente:**
    *   Bloco com rótulos em negrito (`Helvetica-Bold`) e valores em fonte regular:
        *   "Orçamento para:" + `customer.name`.
        *   "CPF/CNPJ:" + `customer.document` (se disponível).
        *   "Contatos:" + telefones e e-mail do cliente concatenados por ` | ` (filtrando valores nulos).

4.  **Tabela de Itens (Foco em Quebra de Páginas):**
    *   **Header:** Fundo `#1e293b`, texto branco em maiúsculo (8pt, `Helvetica-Bold`). Colunas: Descrição (flex: 4), Valor Unitário (flex: 2, alinhado à direita), Qtd. (flex: 1, alinhado ao centro), Total (flex: 2, alinhado à direita).
    *   **Body:** Iterar sobre `quote.items`. Cada linha da tabela deve conter `wrap={false}` para instruir a biblioteca a evitar quebras de página no meio de um item. Linhas ímpares devem ter fundo `#f8fafc` (estilo zebra).
    *   **Contador:** Texto "Total de itens: X" abaixo da tabela, alinhado à direita.

5.  **Termos, Pagamentos e Resumo Financeiro:**
    *   Layout em duas colunas (Flexbox horizontal):
        *   **Coluna Esquerda (Termos e Condições):** Seções para "FORMAS DE PAGAMENTO" (texto vindo de `quote.payment_method`, aceitando array ou string) e "TERMOS E CONDIÇÕES" (`quote.notes`), exibidas apenas se preenchidas.
        *   **Coluna Direita (Totais):** Caixa estruturada com borda `#e2e8f0` e padding interno de 8pt. Exibir:
            *   "Valor itens" -> `quote.subtotal`
            *   "Desconto" -> `quote.discount_value` formatado com prefixo `- ` em verde (exibido apenas se maior que zero).
            *   Divisor e "Valor final" -> `quote.total` (negrito 10pt).

6.  **Assinatura e CNPJ (Rodapé da Folha):**
    *   Linha de assinatura centralizada com o nome da empresa e o respectivo CNPJ/CPF em 8pt cinza médio. Exibir com `wrap={false}` para evitar órfãos.

7.  **Rodapé do Sistema (Fixo em todas as páginas):**
    *   Elemento posicionado de forma absoluta (`position: 'absolute'`, `bottom: 16`, `left: 36`, `right: 36`) com a prop `fixed` ativada.
    *   Conteúdo: "Criado por Orca Fácil" à esquerda, "Emitido em [data formatada]" à direita, no tamanho 7pt cinza médio.

---

## 8. Serviço de Dados (`lib/services/quote-service.ts`)

Encapsular o acesso ao banco de dados no serviço `quote-service.ts` para buscar as informações detalhadas do orçamento utilizando o cliente do Supabase do lado do servidor.

```typescript
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { Quote } from '@/types/quote'

export async function getQuoteDetails(quoteId: string): Promise<Quote | null> {
  try {
    const supabase = await createClient()

    // 1. Busca metadados do orçamento para verificar existência e obter o ID UUID real
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(quoteId)
    let query = supabase.from('vw_quotes').select('id')

    if (isUuid) {
      query = query.eq('id', quoteId)
    } else {
      const isNumeric = /^\d+$/.test(quoteId)
      if (isNumeric) {
        query = query.eq('quote_number', parseInt(quoteId, 10))
      } else {
        return null
      }
    }

    const { data: quoteMeta, error: metaError } = await query.single()

    if (metaError || !quoteMeta) {
      logger.error('Orçamento não encontrado:', metaError)
      return null
    }

    // 2. Chama a RPC get_quote_details que herda as políticas de RLS baseadas no auth.uid() do usuário atual
    const { data: quote, error } = await supabase.rpc('get_quote_details', {
      p_quote_id: quoteMeta.id,
    })

    if (error || !quote) {
      logger.error('Erro ao chamar get_quote_details:', error)
      return null
    }

    return quote as Quote
  } catch (error) {
    logger.error('Erro crítico no quote-service.getQuoteDetails:', error)
    return null
  }
}
```

---

## 9. API Route (`app/api/quotes/[id]/pdf/route.ts`)

A API Route é responsável por processar a requisição de geração do PDF de forma segura e performática.

### Fluxo de Execução da Rota:
1.  **Validação de Parâmetros:** Extrair o parâmetro `id` de `params` (aceitando UUID ou número sequencial).
2.  **Autenticação e RLS:** Chamar `getQuoteDetails` do serviço `quote-service.ts`. Por herdar o cliente do Supabase com cookies de sessão, o banco de dados irá validar automaticamente se o usuário logado possui direito de leitura sobre aquele registro.
3.  **Tratamento de Permissões/Inexistência:** Se o orçamento for nulo ou ocorrer erro na consulta, retornar `NextResponse.json` com status 404 ("Orçamento não encontrado ou acesso não autorizado").
4.  **Processamento do PDF:**
    *   Importar `QuotePDF` e renderizá-lo usando `React.createElement(QuotePDF, { quote })`.
    *   Chamar `renderToBuffer` do `@react-pdf/renderer` de forma assíncrona.
5.  **Headers de Resposta:**
    *   `Content-Type`: `application/pdf`
    *   `Cache-Control`: `no-store, no-cache, must-revalidate` (para garantir que alterações no orçamento apareçam imediatamente no PDF)
    *   `Content-Disposition`: `inline; filename="orcamento-${quote.quote_number}.pdf"` por padrão. Caso o query param `download=true` seja passado na URL, retornar como `attachment; filename="orcamento-${quote.quote_number}.pdf"` para forçar o download direto no navegador.
6.  **Tratamento de Erros:** Envolver todo o processo em `try/catch`. Em caso de erro, efetuar o log no servidor usando `logger.error` e retornar erro 500 sem expor detalhes internos do runtime para o cliente.

---

## 10. Integração com a Interface de Visualização (`components/quote-viewer.tsx`)

Na sidebar de ações à direita em `components/quote-viewer.tsx`:

1.  **Refatoração do Botão "Imprimir" (Ação: Visualizar PDF em nova aba):**
    *   Substituir o elemento `<Button onClick={handlePrint} ...>` por um elemento `<a>` estilizado com as classes de botão (`buttonVariants({ variant: 'outline' })`), apontando o `href` para `/api/quotes/${quote.id}/pdf`.
    *   Adicionar as propriedades `target="_blank"` e `rel="noopener noreferrer"`.
    *   Remover a função local `handlePrint` e os event listeners de `@media print` no `useEffect`, limpando os trechos redundantes de código do frontend.

2.  **Refatoração do Botão "Baixar PDF" (Ação: Download direto do PDF):**
    *   Substituir o botão "Baixar PDF" por um link `<a>` estilizado apontando o `href` para `/api/quotes/${quote.id}/pdf?download=true`.
    *   Adicionar as propriedades `target="_blank"` e `rel="noopener noreferrer"`.

> [!NOTE]
> **Por que usar a tag `<a>` nativa e não o `Link` do Next.js?**
> A rota de destino é um endpoint de API (`/api/...`) que retorna um binário (PDF) e não uma página React do Next.js. O uso de `Link` (`next/link`) faria o Next.js tentar realizar transições client-side de SPA e disparar o comportamento padrão de *prefetching* em segundo plano ao entrar na viewport. Isso resultaria na geração pesada de PDFs no servidor desnecessariamente sempre que a tela de orçamento fosse carregada, consumindo CPU e memória de forma indevida.


---

## 11. Critérios de Aceitação

*   [ ] Ao clicar em "Imprimir" na visualização do orçamento, o PDF gerado pelo servidor deve ser aberto em uma nova aba do navegador com carregamento limpo.
*   [ ] Ao clicar em "Baixar PDF", o arquivo PDF com nomenclatura formatada (ex: `orcamento-123.pdf`) deve ser baixado diretamente pelo navegador.
*   [ ] O layout e estilização do PDF gerado no servidor devem seguir estritamente o layout do orçamento original na web, utilizando fontes consistentes (Helvetica) e com o rodapé do sistema ("Criado por Orca Fácil") visível em todas as páginas.
*   [ ] Orçamentos extensos (com dezenas de itens) devem ser paginados automaticamente, garantindo que nenhuma linha de item seja cortada ao meio (aplicação correta de `wrap={false}`).
*   [ ] Tentativas de acesso não autenticado ou a IDs de orçamentos de outros tenants (usuários diferentes) através do endpoint `/api/quotes/[id]/pdf` devem retornar status 404 por restrição de segurança do RLS.
*   [ ] Campos opcionais vazios ou nulos (como desconto zerado, observações vazias, endereço ausente) não devem renderizar placeholders, textos nulos ou gerar espaços em branco anormais no documento.
*   [ ] A compilação do Next.js e o build de produção (`npm run build`) devem ser concluídos com sucesso sem erros de tipagem no componente de PDF ou na API Route.