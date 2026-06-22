# Quickstart & Verification Guide: Refatoração de Layout Estático

**Feature**: [spec.md](file:///c:/DEV/orcafacil/specs/003-static-layout-refactoring/spec.md)
**Date**: 2026-06-22

---

## Como Rodar Localmente

1. Certifique-se de instalar as dependências do projeto:
   ```bash
   npm install
   ```

2. Inicialize o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

3. Abra o navegador em `http://localhost:3000` e realize o login.

---

## Verificação de Design System e Cores

1. Acesse o painel logado da aplicação (`http://localhost:3000/app`).
2. Confirme que o background da aplicação é `#F8FAFC` no modo claro.
3. Teste o alternador de temas no cabeçalho e confirme que a classe `.dark` é injetada no elemento raiz e as cores do layout mudam para a paleta escura semântica.
4. Verifique visualmente que todos os textos principais usam a fonte **Sora**.

---

## Verificação de Responsividade

### Teste de Desktop (Largura >= 1024px)
*   A Sidebar deve estar totalmente visível e expandida no canto esquerdo (largura de 260px).
*   A Tab Bar mobile inferior não deve ser renderizada na tela.

### Teste de Tablet (Largura entre 768px e 1023px)
*   A Sidebar deve estar visível, porém colapsada (exibindo apenas ícones) se a janela do navegador for diminuída.
*   A Tab Bar mobile inferior não deve ser renderizada na tela.

### Teste de Mobile (Largura < 768px)
*   A Sidebar desktop deve sumir completamente.
*   A Tab Bar inferior fixa deve ser exibida na base da tela com as 4 opções.
*   O avatar do usuário deve ser renderizado no item "Conta" da Tab Bar inferior.
