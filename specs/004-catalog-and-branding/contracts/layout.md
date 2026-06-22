# UI Component & Asset Contracts: Identidade Visual e Módulo de Catálogo

Este documento descreve os contratos de componentes estruturais e formatos de payloads de integração afetados na Fase 2.

---

## Contrato de Logotipos e Favicon (Sidebar & Browser)

### Ativos de Imagem Estáticos (SVGs)

As imagens oficiais de marca copiadas para a pasta `public/` obedecem aos seguintes contratos de nomenclatura e dimensão de carregamento:

| Ativo Estático | Origem do Brandbook | Uso Recomendado | Elemento e Classes HTML |
|---|---|---|---|
| `/logo-horizontal-claro.svg` | `horizontal-fundo-claro.svg` | Topo da Sidebar (Tema Claro) | `<img src="/logo-horizontal-claro.svg" className="dark:hidden block h-6 w-auto" />` |
| `/logo-horizontal-escuro.svg` | `horizontal-fundo-escuro.svg` | Topo da Sidebar (Tema Escuro) | `<img src="/logo-horizontal-escuro.svg" className="hidden dark:block h-6 w-auto" />` |
| `/logo-simbolo-claro.svg` | `logo-fundo-claro.svg` | Sidebar Colapsada (Tema Claro) | `<img src="/logo-simbolo-claro.svg" className="dark:hidden block h-6 w-6" />` |
| `/logo-simbolo-escuro.svg` | `logo-fundo-escuro.svg` | Sidebar Colapsada (Tema Escuro) | `<img src="/logo-simbolo-escuro.svg" className="hidden dark:block h-6 w-6" />` |
| `/favicon.svg` | `favicon-fundo-escuro.svg` | Favicon do Navegador (Global) | Definido no objeto `icons` de metadata do Next.js. |

---

## Contrato de Componente: `CatalogForm`

O componente `<CatalogForm />` é um Client Component interativo responsável por renderizar o modal de cadastro ou edição de itens do catálogo.

### Props Interface

```typescript
interface CatalogItem {
  id: string;
  type: 'product' | 'service';
  name: string;
  unit_price: number;
  unit_measure?: string | null;
}

interface CatalogFormProps {
  initialData?: CatalogItem; // Se fornecido, o modal atua em modo de EDIÇÃO. Se ausente, atua em modo de CADASTRO.
  asMenuItem?: boolean;      // Define se o gatilho visual do modal é um botão de ícone de lápis ou se é o botão padrão "+ Novo item".
  trigger?: React.ReactElement; // Gatilho visual totalmente customizado fornecido por componentes pais.
}
```

---

## Contrato de Componente: `DeleteItemDialog`

O componente `<DeleteItemDialog />` renderiza um Alert Dialog de confirmação visual para exclusão segura de itens.

### Props Interface

```typescript
interface DeleteItemDialogProps {
  id: string;   // ID exclusivo UUID do item de catálogo a ser excluído.
  name: string; // Nome descritivo do item para exibição de segurança no texto do diálogo.
}
```
