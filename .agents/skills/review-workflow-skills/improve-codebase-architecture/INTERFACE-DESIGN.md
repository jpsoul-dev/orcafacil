# Interface Design

Quando o usuário quiser explorar interfaces alternativas para um candidato de aprofundamento escolhido, use este padrão de sub-agentes paralelos. Princípio: desenhe duas vezes — sua primeira ideia raramente é a melhor.

Usa o vocabulário de [LANGUAGE.md](LANGUAGE.md) — **module**, **interface**, **seam**, **adapter**, **leverage**.

## Processo

### 1. Enquadrar o espaço do problema

Antes de criar sub-agentes, escreva uma explicação voltada ao usuário sobre o espaço do problema para o candidato escolhido:

- As restrições que qualquer nova interface precisaria satisfazer
- As dependências das quais ela dependeria, e em qual categoria elas se enquadram (veja [DEEPENING.md](DEEPENING.md))
- Um esboço de código ilustrativo aproximado para tornar as restrições concretas — não uma proposta, apenas uma forma de materializar as restrições

Mostre isso ao usuário e prossiga imediatamente para o Passo 2. O usuário lê e pensa enquanto os sub-agentes trabalham em paralelo.

### 2. Criar sub-agentes

Crie 3+ sub-agentes em paralelo usando a ferramenta Agent. Cada um deve produzir uma interface **radicalmente diferente** para o module aprofundado.

Dê a cada sub-agente um brief técnico separado (caminhos de arquivos, detalhes de acoplamento, categoria de dependência de [DEEPENING.md](DEEPENING.md), o que fica por trás do seam). O brief é independente da explicação do espaço do problema voltada ao usuário do Passo 1. Dê a cada agente uma restrição de design diferente:

- Agente 1: "Minimize a interface — mire em 1–3 pontos de entrada no máximo. Maximize leverage por ponto de entrada."
- Agente 2: "Maximize a flexibilidade — suporte muitos casos de uso e extensão."
- Agente 3: "Otimize para o chamador mais comum — torne o caso padrão trivial."
- Agente 4 (se aplicável): "Projete em torno de ports & adapters para dependências cross-seam."

Inclua tanto o vocabulário de [LANGUAGE.md](LANGUAGE.md) quanto o vocabulário do CONTEXT.md no brief para que cada sub-agente nomeie as coisas de forma consistente com a linguagem arquitetural e a linguagem de domínio do projeto.

Cada sub-agente produz:

1. Interface (tipos, métodos, parâmetros — mais invariantes, ordenação, modos de erro)
2. Exemplo de uso mostrando como os chamadores a utilizam
3. O que a implementação esconde por trás do seam
4. Estratégia de dependência e adapters (veja [DEEPENING.md](DEEPENING.md))
5. Trade-offs — onde leverage é alta, onde é fraca

### 3. Apresentar e comparar

Apresente os designs sequencialmente para que o usuário possa absorver cada um, depois compare-os em prosa. Contraste por **depth** (leverage na interface), **locality** (onde a mudança se concentra) e **posicionamento do seam**.

Após comparar, dê sua própria recomendação: qual design você acha mais forte e por quê. Se elementos de designs diferentes se combinariam bem, proponha um híbrido. Seja opinativo — o usuário quer uma leitura forte, não um cardápio.
