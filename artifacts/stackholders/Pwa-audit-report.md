# Relatório de Auditoria PWA
**Projeto:** Orça Fácil  
**Data:** 23 de Junho de 2026  
**Auditado por:** PWA Expert  
**Stack:** React 19, Next.js 16 (App Router), Tailwind CSS v4, Supabase (Auth/Client), Zod, React Hook Form, Vaul

---

## Resumo Executivo

Este relatório apresenta uma auditoria detalhada da experiência mobile e capacidade PWA (Progressive Web App) do formulário de criação/edição de orçamentos localizado na rota `/app/quotes/new` (e arquivos associados). Embora a aplicação possua um design limpo e responsivo na web desktop, sob o ponto de vista de PWA instalável em smartphones (iOS e Android), ela apresenta pontos críticos que **quebram a ilusão de um aplicativo nativo**.

O principal impedimento para a ilusão nativa é o **acúmulo de elementos fixados na tela em mobile**. A interface concilia um cabeçalho global do layout, uma AppBar superior própria do formulário e uma barra inferior de ações contendo três botões empilhados verticalmente. Em um dispositivo móvel típico com o teclado virtual aberto, a área utilizável de preenchimento do formulário é reduzida a praticamente zero, inviabilizando a digitação fluida.

Além disso, problemas clássicos de instalabilidade (assets ausentes ou incorretos) e a ausência de um **Service Worker** para controle de cache e suporte offline impedem que o app atinja os requisitos mínimos para instalação automática no Android e resiliência offline em campo. Ao implementar as modificações recomendadas, a empresa ganhará um app fluido, com usabilidade idêntica à de um aplicativo da App Store/Play Store, permitindo o preenchimento rápido de orçamentos mesmo em locais de baixa conectividade.

### Score por Dimensão

| Dimensão | Score | Status |
|---|---|---|
| 1. Instalabilidade | 4/10 | 🔴 Crítico |
| 2. Service Worker & Cache | 2/10 | 🔴 Crítico |
| 3. App Shell Architecture | 6/10 | 🟡 Parcial |
| 4. Mobile UX Nativa | 5/10 | 🔴 Crítico |
| 5. Performance Mobile | 8/10 | 🟢 OK |
| 6. Funcionalidades Nativas | 4/10 | 🟡 Parcial |
| 7. iOS Quirks | 5/10 | 🟡 Parcial |
| **TOTAL** | **34/70** | **Experiência PWA Comprometida** |

**Diagnóstico geral:** Aplicação responsiva, moderna e visualmente limpa no desktop, porém com barreiras severas de instalabilidade, falta de suporte offline e conflitos de layout fixo que comprometem a usabilidade em dispositivos móveis.

---

## O que já está bem ✅

- **Comportamento Standalone Declarado:** O arquivo [manifest.ts](file:///c:/DEV/orcafacil/app/manifest.ts) está configurado com `display: 'standalone'` e possui cores de tema e fundo adequadas, bem como a rota inicial `/app`.
- **Suporte Parcial a WebApp iOS:** O [layout.tsx](file:///c:/DEV/orcafacil/app/layout.tsx) global declara corretamente a diretiva `appleWebApp: { capable: true }`, o que habilita a ocultação do navegador Safari ao adicionar o app à tela inicial.
- **Feedback Háptico Inicial:** Há uso explícito da API `navigator.vibrate` com tratamento de segurança contra erros em interações fundamentais de [quote-form.tsx](file:///c:/DEV/orcafacil/app/app/quotes/components/quote-form.tsx) (como adicionar/remover itens e salvar/dar erro de validação).
- **Barra de Navegação Inferior:** O arquivo [layout.tsx](file:///c:/DEV/orcafacil/app/app/layout.tsx) do dashboard possui um componente `MobileTabBar` para emular a navegação inferior clássica de apps móveis.
- **Animações de entrada:** O formulário possui animações CSS leves de entrada para suavizar a renderização de componentes dinâmicos.

---

## Diagnóstico por Dimensão

### 1. Instalabilidade — 4/10

**Status atual:**
O manifesto PWA é gerado dinamicamente via Next.js no arquivo [manifest.ts](file:///c:/DEV/orcafacil/app/manifest.ts). O layout global aponta para o favicon SVG.

**Problemas identificados:**
- ❌ **Ícone ausente no PWA:** O [manifest.ts](file:///c:/DEV/orcafacil/app/manifest.ts) declara um ícone na rota `/icon.svg` com `purpose: 'maskable'`. No entanto, **não existe** nenhum arquivo com o nome `icon.svg` na pasta `public`. Isso gera falha crítica ao baixar os assets do manifesto.
- ❌ **Falta de ícones PNG para Android/Chrome:** Navegadores Chromium exigem imagens PNG explícitas de tamanhos `192x192` e `512x512` para habilitar a instalação automática na tela inicial.
- ❌ **Falta de Apple Touch Icon:** O layout global [layout.tsx](file:///c:/DEV/orcafacil/app/layout.tsx) não define um `<link rel="apple-touch-icon">` com uma imagem PNG opaca (fundo sólido). Sem isso, o iOS exibe uma miniatura (screenshot) desconfigurada da tela inicial da aplicação como ícone do app instalado.

**Impacto na experiência nativa:**
O usuário não recebe o prompt nativo de instalação ("Adicionar à tela de início") em navegadores Android/Chrome, e a instalação manual no iOS gera um ícone genérico com fundo preto ou cinza.

---

### 2. Service Worker & Cache — 2/10

**Status atual:**
A aplicação não registra nenhum Service Worker nem possui configurações de caching local para o App Shell.

**Problemas identificados:**
- ❌ **Sem Service Worker registrado:** Não há carregamento ou registro de Service Worker na raiz ou no layout do Next.js.
- ❌ **Sem fallback offline:** Se o dispositivo perder a conexão de rede ou estiver sem internet em um cliente, a página exibirá o dinossauro ou a tela de erro de conexão nativa do navegador, quebrando imediatamente a ilusão de um app nativo.

**Impacto na experiência nativa:**
O app é inoperável offline. Um usuário na rua que precise preencher um orçamento rápido e perca o sinal de celular terá todo o progresso perdido e o app parará de funcionar.

---

### 3. App Shell Architecture — 6/10

**Status atual:**
A arquitetura do Next.js 16 estruturada com Server Components e Client Components em subdiretórios permite uma carga inicial rápida.

**Problemas identificados:**
- ⚠️ **Ausência de Skeletons no formulário:** Ao abrir a rota `/new` ou `/edit`, a página principal renderiza de forma assíncrona os dados dos clientes e do catálogo de produtos vindos do Supabase. A ausência de Skeletons específicos enquanto os dados carregam causa um pequeno deslocamento de layout (Layout Shift) no mobile.

**Impacto na experiência nativa:**
Sensação de carregamento lento "estilo web" ao invés de uma transição suave e instantânea.

---

### 4. Mobile UX Nativa — 5/10

**Status atual:**
O formulário de orçamentos utiliza estilizações flexíveis baseadas no Tailwind CSS v4 para se adequar ao tamanho de tela.

**Problemas identificados:**
- ❌ **Cabeçalho Duplo (Concorrência de Headers):** No mobile, o app renderiza simultaneamente a barra superior global do layout (`sticky top-0 h-16` em [layout.tsx](file:///c:/DEV/orcafacil/app/app/layout.tsx)) contendo breadcrumbs e ícones de notificação, **e** a AppBar mobile interna do formulário (`sticky top-0 h-14` em [quote-form.tsx](file:///c:/DEV/orcafacil/app/app/quotes/components/quote-form.tsx)) com o botão de voltar. Isso consome **120px fixos** no topo da tela do celular.
- ❌ **Barra de Ações Gigante no Rodapé:** A barra de ações inferior fica fixa no mobile (`max-sm:fixed max-sm:bottom-0`) com os três botões de ação empilhados em coluna (`Cancelar`, `Salvar Rascunho`, `Gerar Orçamento`). Isso gera uma barra com cerca de **180px de altura fixa** no rodapé do celular.
- ❌ **Área Útil do Viewport Comprometida:** Somando os 120px do topo e os 180px do rodapé, sobram menos de 370px para o formulário em uma tela mobile típica. Quando o teclado do celular abre (~280px de altura), a área livre para digitação cai para quase zero, impossibilitando a visualização dos campos digitados.
- ❌ **Touch Targets abaixo do mínimo (Apple/Android guidelines):**
  - O botão de exclusão de item individual (`Trash2`) tem classe `h-9 w-9` (36px). O ideal é no mínimo 44px de área de toque.
  - O popover de ajuda de desconto individual possui um botão com padding de apenas `p-0.5` contendo um ícone `h-4 w-4`, impossível de acertar sem errar o toque.
  - O botão de editar desconto global tem a classe `h-6 w-6` (24px de área de toque), o que gera frustração ao tentar clicar.
- ❌ **Falta de teclado numérico nativo (Preço e Desconto):**
  - O input de preço unitário e desconto monetário em [quote-form.tsx](file:///c:/DEV/orcafacil/app/app/quotes/components/quote-form.tsx) e [discount-input.tsx](file:///c:/DEV/orcafacil/components/ui/discount-input.tsx) são do tipo `text` sem atributo `inputmode`. Isso faz com que o teclado alfabético de texto se abra por padrão, exigindo que o usuário alterne manualmente para a aba de números.
- ⚠️ **Catálogo como Dialog Centralizado:** A busca por itens do catálogo abre um modal centralizado clássico de web. Em aplicativos nativos, modais de seleção mobile usam deslizamentos inferiores (Bottom Sheets / Drawers).

**Impacto na experiência nativa:**
O preenchimento do formulário no celular torna-se extremamente irritante devido à poluição visual fixa na tela, botões minúsculos e o teclado abrindo no formato errado.

---

### 5. Performance Mobile — 8/10

**Status atual:**
O app é rápido graças ao Next.js e Tailwind v4. Não há problemas severos de performance na renderização.

**Problemas identificados:**
- ⚠️ **Componente de Formulário Monolítico:** O arquivo [quote-form.tsx](file:///c:/DEV/orcafacil/app/app/quotes/components/quote-form.tsx) tem mais de 1000 linhas de código misturando a lógica de validação de formulário com estados de modais de busca, botões de exclusão de array, inputs customizados e tabelas. Embora não trave o celular, dificulta a hidratação pontual e refatorações no futuro.

---

### 6. Funcionalidades Nativas — 4/10

**Status atual:**
Vibrações táticas implementadas via API do navegador para feedbacks de cliques.

**Problemas identificados:**
- ❌ **Preenchimento sem compartilhamento nativo:** Ao concluir o orçamento, o usuário precisa fazer download do PDF e enviá-lo por fora. Não há suporte para a **Web Share API** nativa, que permitiria enviar o orçamento diretamente pelo seletor de contatos do sistema operacional (WhatsApp, Telegram, etc.) com um clique.

---

### 7. iOS Quirks — 5/10

**Status atual:**
As safe-areas inferiores estão configuradas para o indicador de tela inicial do iOS.

**Problemas identificados:**
- ❌ **Zoom automático ao focar inputs:** Os inputs de formulário utilizam `text-sm` (14px) por padrão. O Safari do iOS dá zoom automático em qualquer caixa de texto com font-size menor que 16px. Isso faz a tela "pular" e cortar as laterais toda vez que o usuário clica em um input.
- ❌ **Teclado sem Viewport-Fit Cover adaptado:** O cabeçalho global não aproveita a área atrás da barra de status (safe-area notch) no iOS PWA standalone.

---

## Plano de Implementação

Priorizado por **impacto na ilusão nativa** × **esforço de implementação**.

### 🔴 Prioridade 1 — Crítico (Faça agora)

Esses itens removem os bloqueios de instalabilidade e de usabilidade imediata que impedem a digitação em dispositivos móveis.

#### Ação 1.1: Eliminar Concorrência de Headers e Reduzir Barra de Ações do Rodapé
**Problema:** Cabeçalhos acumulados no topo e três botões verticais no rodapé tomam 300px fixos da tela, deixando o formulário inutilizável no mobile.  
**Solução:**
1. Ocultar o cabeçalho global do `AppLayout` na rota `/app/quotes/new` e `/app/quotes/[id]/edit` em resoluções móveis.
2. Em telas pequenas (`max-sm`), remover a barra inferior fixa de ações.
3. Posicionar os botões de ação na barra superior (AppBar mobile) — exatamente como aplicativos nativos de iOS e Android (padrão de ter o botão "Salvar" ou "Gerar" no canto superior direito e "Voltar" ou "Cancelar" no canto superior esquerdo).

*Delta de Código para aplicar em [quote-form.tsx](file:///c:/DEV/orcafacil/app/app/quotes/components/quote-form.tsx):*
```diff
       {/* Header Mobile Nativo (AppBar) */}
-      <div className="sm:hidden flex items-center justify-between h-14 bg-background border-b border-border sticky top-0 z-40 px-4 -mx-4 -mt-4 mb-4">
+      <div className="sm:hidden flex items-center justify-between h-14 bg-card border-b border-border sticky top-0 z-40 px-4 -mx-4 -mt-4 mb-4 backdrop-blur-md bg-card/90">
         <button
           type="button"
           onClick={() => {
             triggerVibration(15)
             router.back()
           }}
-          className="flex items-center justify-center h-10 w-10 -ml-2 text-foreground active:opacity-60 cursor-pointer rounded-full"
+          className="flex items-center justify-center h-11 w-11 -ml-2 text-foreground active:opacity-60 cursor-pointer rounded-full"
           aria-label="Voltar"
         >
           <ChevronLeft className="h-6 w-6" />
         </button>
         <h1 className="text-ds-body-md font-bold text-foreground">
           {pageTitle}
         </h1>
-        <div className="w-10"></div> {/* Espaçador para centralizar título */}
+        {/* Botão de Salvar/Gerar diretamente no cabeçalho superior mobile para poupar espaço */}
+        <button
+          type="button"
+          disabled={loading}
+          onClick={() => handleSave('pending')}
+          className="text-ds-body-sm font-bold text-primary active:opacity-60 cursor-pointer disabled:opacity-40"
+        >
+          {loading ? '...' : mode === 'edit' ? 'Salvar' : 'Gerar'}
+        </button>
       </div>
```

E no rodapé de [quote-form.tsx](file:///c:/DEV/orcafacil/app/app/quotes/components/quote-form.tsx):
```diff
-      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-6 border-t border-border w-full
-        max-sm:fixed max-sm:bottom-0 max-sm:left-0 max-sm:right-0 max-sm:bg-background/80 max-sm:backdrop-blur-md max-sm:border-t max-sm:border-border max-sm:p-4 max-sm:z-50 max-sm:pb-[calc(1rem+env(safe-area-inset-bottom,0px))]"
-      >
+      {/* Botões do rodapé agora aparecem no fluxo normal da página em mobile, e fixos apenas em desktop */}
+      <div className="flex flex-row items-center justify-end gap-3 pt-6 border-t border-border w-full max-sm:py-4">
+        {/* Em mobile, deixamos apenas um botão discreto de Rascunho no rodapé ou ocultamos porque a ação principal está na AppBar */}
+        <Button
+          type="button"
+          disabled={loading}
+          variant="ghost"
+          onClick={() => router.back()}
+          className="h-10 px-6 font-semibold text-muted-foreground transition-all duration-ds-fast cursor-pointer max-sm:hidden"
+        >
+          Cancelar
+        </Button>
         <Button
           type="button"
           disabled={loading}
           variant="outline"
           onClick={() => handleSave('draft')}
-          className="h-11 sm:h-10 px-6 w-full sm:w-auto font-semibold transition-all duration-ds-fast cursor-pointer"
+          className="h-10 px-6 w-full sm:w-auto font-semibold transition-all duration-ds-fast cursor-pointer"
         >
           Salvar Rascunho
         </Button>
         <Button
           type="button"
           disabled={loading}
           onClick={() => handleSave('pending')}
-          className="h-11 sm:h-10 px-6 w-full sm:w-auto font-semibold bg-primary text-primary-foreground transition-all duration-ds-fast cursor-pointer shadow-sm"
+          className="h-10 px-6 w-full sm:w-auto font-semibold bg-primary text-primary-foreground transition-all duration-ds-fast cursor-pointer shadow-sm max-sm:hidden"
         >
           {loading
             ? 'Processando...'
             : mode === 'edit'
               ? 'Salvar Alterações'
               : 'Gerar Orçamento'}
         </Button>
       </div>
```

E no cabeçalho global em [app/app/layout.tsx](file:///c:/DEV/orcafacil/app/app/layout.tsx), adicionar uma classe utilitária no mobile para ocultar a barra de navegação global em rotas de formulário (criação/edição):
```html
<!-- Exemplo de como ocultar o header global em telas pequenas especificamente para formulários de criação/edição -->
<header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card/95 backdrop-blur-sm px-4 print:hidden max-sm:has-[~div_.sticky-appbar-new-quote]:hidden">
```
*(Nota: Uma alternativa limpa é verificar no layout se a rota atual condiz com `/new` ou `/edit` e omitir a renderização do header em mobile, ou utilizar classes CSS que detectam a presença do cabeçalho de criação).*

---

#### Ação 1.2: Corrigir Ícones no Manifest e Tag Apple Touch Icon
**Problema:** Os assets do PWA declarados no manifest não existem, e falta tag de ícone nativo para iOS.  
**Solução:**
1. Gerar e mover os ícones PNG para o diretório `/public` com resoluções de `192x192` e `512x512` usando a logo opaca (sem transparência).
2. Adicionar o link do `apple-touch-icon` no `<head>` do arquivo [layout.tsx](file:///c:/DEV/orcafacil/app/layout.tsx).
3. Atualizar o `manifest.ts` para refletir os ícones reais existentes.

*Delta de Código para aplicar em [app/manifest.ts](file:///c:/DEV/orcafacil/app/manifest.ts):*
```typescript
// app/manifest.ts
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Orça Fácil',
    short_name: 'Orça Fácil',
    description: 'Sistema profissional de geração e gerenciamento de orçamentos rápidos e recibos.',
    start_url: '/app?source=pwa',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#0f172a',
    icons: [
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
```

*Delta de Código para aplicar em [app/layout.tsx](file:///c:/DEV/orcafacil/app/layout.tsx) (Adicionar suporte a ícone iOS e ajustar viewport fit):*
```typescript
// app/layout.tsx
export const metadata: Metadata = {
  title: 'OrçaFácil',
  description: 'Orçamentos profissionais',
  applicationName: 'Orça Fácil',
  icons: {
    icon: [
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: [
      {
        url: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      }
    ]
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent', // Permite que a barra de status se mescle com a cor de fundo do app shell
    title: 'Orça Fácil',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Evita zoom manual acidental que quebra o layout standalone
  viewportFit: 'cover', // Aproveita a área inteira da tela no iOS ( notches )
}
```

---

### 🟡 Prioridade 2 — Alto impacto (Esta sprint)

Esses itens melhoram drasticamente a experiência de digitação e navegação móvel do formulário.

#### Ação 2.1: Prevenir Zoom Automático e Habilitar Teclado Numérico Adequado
**Problema:** Fontes de inputs menores que 16px causam zoom incômodo no iOS e campos de valores decimais abrem teclado de texto alfabético.  
**Solução:**
1. Configurar os inputs do formulário com font-size de no mínimo `text-base` (16px) em telas mobile, escalando para `sm:text-sm` (14px) no desktop.
2. Adicionar `inputmode="decimal"` nos campos numéricos de preço unitário e desconto monetário.

*Delta de Código para aplicar nos campos de Preço Unitário de [quote-form.tsx](file:///c:/DEV/orcafacil/app/app/quotes/components/quote-form.tsx):*
```diff
                           <div className="flex h-10 border border-input rounded-sm overflow-hidden bg-card transition-[border-color,box-shadow] duration-ds-fast focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20 outline-none">
                             <Controller
                               name={`items.${index}.unit_price` as const}
                               control={form.control}
                               render={({ field }) => (
                                 <Input
-                                  type="text"
+                                  type="text"
+                                  inputMode="decimal"
                                   placeholder="0,00"
                                   value={
                                     field.value
                                       ? maskCurrency(Math.round(field.value * 100).toString())
                                       : ''
                                   }
                                   onChange={(e) => {
                                     const masked = maskCurrency(e.target.value)
                                     const raw = parseFloat(masked.replace(/\./g, '').replace(',', '.')) || 0
                                     field.onChange(raw)
                                     handleRecalculate(index, undefined, raw)
                                   }}
-                                  className="h-full border-0 rounded-none focus-visible:ring-0 text-right bg-card text-ds-body-md tabular-nums w-full px-2"
+                                  className="h-full border-0 rounded-none focus-visible:ring-0 text-right bg-card text-base sm:text-sm tabular-nums w-full px-2"
                                 />
                               )}
                             />
                           </div>
```

*Delta de Código para aplicar nos Inputs de Valor de [discount-input.tsx](file:///c:/DEV/orcafacil/components/ui/discount-input.tsx):*
```diff
       {/* Input de Valor */}
       <input
         type="text"
-        inputMode={activeType === "R$" ? "text" : "numeric"}
+        inputMode="decimal"
         disabled={disabled}
         placeholder={activeType === "R$" ? "0,00" : "0"}
         value={inputValue}
         onChange={handleInputChange}
         onBlur={handleBlur}
-        className="h-full w-full min-w-0 border-0 rounded-none bg-transparent px-3 text-right text-sm text-foreground tabular-nums outline-none focus:ring-0 focus:outline-none"
+        className="h-full w-full min-w-0 border-0 rounded-none bg-transparent px-3 text-right text-base sm:text-sm text-foreground tabular-nums outline-none focus:ring-0 focus:outline-none"
       />
```

---

#### Ação 2.2: Aumentar Áreas de Toque (Touch Targets ≥ 44px)
**Problema:** Botões pequenos (ajuda, exclusão, edição) causam erros de toque em telas sensíveis ao toque.  
**Solução:**
Aumentar a área interna ou tamanho total dos elementos clicáveis em mobile.

1. **Botão de Exclusão de Item:** Mudar de `h-9 w-9` para `h-11 w-11`.
2. **Botão de Ajuda de Desconto:** Aumentar o preenchimento de `p-0.5` para `p-2` (aumentando a área invisível de clique sem alterar tanto o tamanho visual).
3. **Botão de Editar Desconto Global:** Mudar de `h-6 w-6` para `h-10 w-10` ou usar um link tátil "Editar Desconto" ao lado do valor.

*Delta de Código para o Botão de Remover Item de [quote-form.tsx](file:///c:/DEV/orcafacil/app/app/quotes/components/quote-form.tsx):*
```diff
                     {/* Cabeçalho do Card do Item */}
                     <div className="flex items-center justify-between">
                       ...
                       <Button
                         type="button"
                         variant="ghost"
                         size="icon"
-                        className="h-9 w-9 text-slate-400 hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/20 border border-input rounded-sm transition-colors duration-ds-fast cursor-pointer"
+                        className="h-11 w-11 text-slate-400 hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/20 border border-input rounded-sm transition-colors duration-ds-fast cursor-pointer"
                         onClick={() => {
                           triggerVibration(15)
                           remove(index)
                         }}
                       >
                         <Trash2 className="h-4 w-4" />
                       </Button>
```

---

### 🟢 Prioridade 3 — Refinamentos (Próximas sprints)

Polimento final de PWA para levar o app ao nível premium indistinguível de nativo.

#### Ação 3.1: Trocar Dialog do Catálogo por Drawer (Bottom Sheet) em Mobile
**Problema:** Modal clássico centralizado quebra o fluxo e a ergonomia de dedão no celular.  
**Solução:**
Usar o componente `Drawer` da biblioteca `vaul` (já instalada) para deslizar o catálogo de produtos de baixo para cima apenas quando a tela for mobile.

```typescript
// Exemplo de código condicional para catálogo
import { useMediaQuery } from "@/hooks/use-media-query" // Criar ou usar se houver
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"

const isMobile = useMediaQuery("(max-width: 640px)")

if (isMobile) {
  return (
    <Drawer open={openCatalogModal} onOpenChange={setOpenCatalogModal}>
      <DrawerContent className="p-4 bg-card border-t border-border">
         {/* Conteúdo de Busca do Catálogo */}
      </DrawerContent>
    </Drawer>
  )
}
```

#### Ação 3.2: Registrar um Service Worker Básico para Operação Offline e Pre-caching
**Problema:** Sem Service Worker, a tela de erro offline do browser é exibida quando a conexão é perdida.  
**Solução:**
Criar um arquivo `public/sw.js` com estratégias de cache simples e registrá-lo na inicialização do aplicativo em um componente cliente de carregamento global.

---

## Checklist de Validação

Use este checklist após implementar as alterações para garantir que todos os problemas foram solucionados:

### Instalação e Layout iOS/Android
- [ ] No Chrome DevTools (Application -> Manifest), não há erros de assets ausentes e o PWA exibe a logo em todos os tamanhos.
- [ ] Testada a opção "Adicionar à Tela de Início" em aparelho iOS real. O ícone aparece opaco e com visual da marca correto (não screenshot).
- [ ] O app instalado no iOS/Android inicia sem barras de navegação do browser (estilo standalone).
- [ ] Ao focar nos campos de preço unitário e desconto, o teclado numérico com suporte a decimais se abre imediatamente.
- [ ] Ao focar em qualquer input no iOS Safari, a tela não realiza zoom automático (o font-size de 16px previne o zoom).

### Ergonomia e Área Útil
- [ ] O cabeçalho global não concorre com a AppBar do formulário no celular (apenas a AppBar de criação fica visível).
- [ ] Os botões de salvar/cancelar não estão ocupando área fixa gigante no rodapé mobile, liberando área de visualização sobre o teclado.
- [ ] O botão de exclusão de item individual (`Trash2`) é facilmente acionado sem toques falsos.
- [ ] O modal de catálogo abre como uma gaveta (Bottom Sheet) que desliza de baixo para cima no celular.

---

## Ferramentas Recomendadas

| Ferramenta | Para que serve |
|---|---|
| Chrome DevTools -> Application | Validar o `manifest.json` e o `Service Worker` localmente |
| Lighthouse (aba Mobile) | Avaliar métricas de performance e boas práticas PWA |
| PWABuilder (pwabuilder.com) | Validar o manifesto gerado e empacotar para Play Store/App Store |
| Workbox (workboxjs.org) | Facilitar a escrita de estratégias de cache offline no Service Worker |

---

## Próximos Passos

1. **Implementar a Ação 1.2 (Correção de ícones):** Copiar a logo opaca do brandbook `.DOCS/PNG/logo.png`, recortá-la em resoluções de `192x192`, `512x512` e `180x180` (para iOS) e colocá-las em `/public` apontando no [manifest.ts](file:///c:/DEV/orcafacil/app/manifest.ts) e [layout.tsx](file:///c:/DEV/orcafacil/app/layout.tsx).
2. **Implementar a Ação 1.1 (AppBar Superior):** Mover as ações principais de salvar para a AppBar superior mobile no arquivo [quote-form.tsx](file:///c:/DEV/orcafacil/app/app/quotes/components/quote-form.tsx) e ocultar o rodapé gigante fixed.
3. **Implementar a Ação 2.1 (Ajuste de inputs):** Configurar `inputMode="decimal"` e font-size de 16px (`text-base md:text-sm`) para blindar o formulário contra zooms automáticos do Safari iOS.

---
*Relatório gerado pelo PWA Expert — Em caso de dúvidas sobre a implementação técnica detalhada de cada bloco acima, sinta-se à vontade para perguntar.*
