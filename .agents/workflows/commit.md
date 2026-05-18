---
description: Gerencia o versionamento de código local aplicando Conventional Commits de forma atômica. Inclui trava de segurança que impede o git push automático sem a aprovação prévia do usuário e confirmação da branch de destino.
---

# Fluxo de Controle de Versão

Você é o responsável por gerenciar o versionamento de código deste projeto. Toda vez que o usuário solicitar que você "salve", "comite" ou "registre" as alterações, você deve seguir estritamente o fluxo de 5 etapas abaixo.

REGRAS

NUNCA faça push par repositório remoto sem aprovação do usuário e confirmação da branch.

FLUXO

1. BOAS-VINDAS
   E aí! Sou o commit workflow. Irei analizar as alterações do projeto.

2. 🔍 Alterações identificadas

- Execute o comando `git status` e identifique arquivos modificados, deletados e untracked.
  Apresente:
  x modificados: [lista de arquivos]
  x deletados: [lista de arquivos]
  x novos: [lista novos arquivos]
- Execute o comando `git diff` e `git diff --staged` (se houver algo no stage) para entender o contexto exato do que foi alterado.
  Apresente:
  contexto(s) identificado(s): [poucas palavras descreve os contextos]

  3.🛡️ Agrupamento Lógico (Commits Atômicos)

- **Não coloque tudo no mesmo commit se houver propostas diferentes.**
- Avalie as mudanças e divida-as em blocos lógicos.
- Utilize o padrão **Conventional Commits**:
  - `feat:` para novas funcionalidades (ex: `feat(api): create webhook implementation`).
  - `fix:` para correções de bugs (ex: `fix(auth): resolve session timeout issue`).
  - `refactor:` para refatoração de código que não adiciona feature nem corrige bug.
  - `style:` para formatação, ponto e vírgula, etc.
  - `chore:` para atualizações de dependências, configurações do Next.js, etc.

    4.🛡️ Execução do Stage e Commit

- Realize o `git add <arquivos específicos>` para o primeiro grupo lógico.
- Realize o `git commit -m "tipo(escopo): descrição concisa"` em português.
- Repita este processo (add + commit) até que **todas** as alterações relevantes apontadas no `git status` estejam devidamente "comitadas".

  5.❓ Confirmação de Push

- **REGRA CRÍTICA:** Após finalizar os commits, você está **PROIBIDO** de executar `git push` imediatamente.
- Informar ao usuário quais commits foram criados.
  Apresente:

  > \_"Os commits foram criados:
  > [lista de commits]
  > Fazer push na branch [mostrar banch atual]?

- Aguarde a confirmação explícita do usuário.

  5.🚀 Finalização

- Após a aprovação do usuário e a confrimação da branch de destino:
  1. Fazer push na branch confirmada pelo usuário.
  2. (Opcional, mas recomendado) Verifique se há necessidade de um `git pull` para evitar rejeições.
  3. Execute o `git push` (ou `git push -u origin <nome-da-branch>` se for o primeiro push da branch).
