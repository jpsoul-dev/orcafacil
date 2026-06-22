# UI Component Contracts: Layout & Navegação Global

**Feature**: [spec.md](file:///c:/DEV/orcafacil/specs/003-static-layout-refactoring/spec.md)
**Date**: 2026-06-22

---

## Contrato de Componente: `AppSidebar` (Desktop / Tablet)

O componente `<AppSidebar />` gerencia a barra lateral de navegação no desktop. Ele consome os metadados do usuário logado e exibe o avatar e dados cadastrais na seção `SidebarFooter`.

### Props Interface

```typescript
interface AppSidebarProps {
  user: {
    name: string;
    email: string;
    avatar?: string; // URL da foto de perfil (opcional)
  };
  isAdmin?: boolean;
  hasPassword: boolean;
  subscriptionStatus: string | null;
  cancelAt: string | null;
  trialEndsAt: string | null;
  isExpired?: boolean;
}
```

---

## Contrato de Componente: `MobileTabBar` (Mobile < 768px) [NOVO]

O componente `<MobileTabBar />` renderiza a barra de navegação inferior fixa para dispositivos móveis, garantindo ergonomia de clique rápido com uma só mão.

### Props Interface

```typescript
interface MobileTabBarProps {
  user: {
    name: string;
    email: string;
    avatar?: string; // URL da foto de perfil (opcional)
  };
  isExpired?: boolean;
}
```

### Estrutura de Rotas e Ícones

A Tab Bar mobile possui 4 posições fixas mapeadas conforme abaixo:

| Destino | Rota | Ícone Utilizado | Label Exibido |
|---|---|---|---|
| Painel Principal | `/app` | `LayoutDashboard` | Painel |
| Listagem de Orçamentos | `/app/quotes` | `FileText` | Orçamentos |
| Listagem de Recibos | `/app/receipts` | `Receipt` | Recibos |
| Menu de Configurações / Conta | `/app/settings` | `Avatar` / `User` | Conta |
