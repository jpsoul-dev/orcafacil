# Language

Vocabulário compartilhado para cada sugestão que esta skill faz. Use estes termos exatamente — não substitua por "componente," "serviço," "API," ou "boundary." Linguagem consistente é o ponto central.

## Termos

**Module**
Qualquer coisa com uma interface e uma implementação. Deliberadamente sem escala definida — aplica-se igualmente a uma função, classe, pacote ou slice que atravessa camadas.
_Evite_: unit, componente, serviço.

**Interface**
Tudo que um chamador precisa saber para usar o module corretamente. Inclui a assinatura de tipos, mas também invariantes, restrições de ordenação, modos de erro, configuração obrigatória e características de performance.
_Evite_: API, assinatura (muito estreito — refere-se apenas à superfície de tipos).

**Implementation**
O que está dentro de um module — seu corpo de código. Distinto de **Adapter**: algo pode ser um adapter pequeno com uma implementação grande (um repositório Postgres) ou um adapter grande com uma implementação pequena (um fake em memória). Use "adapter" quando o seam é o tema; "implementation" nos outros casos.

**Depth**
Leverage na interface — a quantidade de comportamento que um chamador (ou teste) pode exercitar por unidade de interface que precisa aprender. Um module é **deep** quando uma grande quantidade de comportamento fica por trás de uma interface pequena. Um module é **shallow** quando a interface é quase tão complexa quanto a implementação.

**Seam**
Um lugar onde você pode alterar o comportamento sem editar naquele lugar. A *localização* em que a interface de um module existe. Escolher onde colocar o seam é uma decisão de design por si só, distinta do que vai por trás dele.
_Evite_: boundary (sobrecarregado com o bounded context do DDD).

**Adapter**
Uma coisa concreta que satisfaz uma interface em um seam. Descreve o *papel* (qual slot preenche), não a substância (o que está dentro).

**Leverage**
O que os chamadores ganham com depth. Mais capacidade por unidade de interface que precisam aprender. Uma implementação se paga em N call sites e M testes.

**Locality**
O que os mantenedores ganham com depth. Mudança, bugs, conhecimento e verificação se concentram em um lugar em vez de se espalharem pelos chamadores. Corrija uma vez, corrija em todos os lugares.

## Princípios

- **Depth é uma propriedade da interface, não da implementação.** Um deep module pode ser internamente composto de partes pequenas, mockáveis e substituíveis — elas simplesmente não fazem parte da interface. Um module pode ter **seams internos** (privados à sua implementação, usados pelos seus próprios testes) além do **seam externo** na sua interface.
- **O deletion test.** Imagine deletar o module. Se a complexidade desaparece, o module não estava escondendo nada (era um pass-through). Se a complexidade reaparece em N chamadores, o module estava cumprindo seu papel.
- **A interface é a superfície de teste.** Chamadores e testes cruzam o mesmo seam. Se você quer testar *além* da interface, o module provavelmente tem a forma errada.
- **Um adapter significa um seam hipotético. Dois adapters significa um seam real.** Não introduza um seam a menos que algo varie de fato através dele.

## Relacionamentos

- Um **Module** tem exatamente uma **Interface** (a superfície que apresenta a chamadores e testes).
- **Depth** é uma propriedade de um **Module**, medida em relação à sua **Interface**.
- Um **Seam** é onde a **Interface** de um **Module** existe.
- Um **Adapter** fica em um **Seam** e satisfaz a **Interface**.
- **Depth** produz **Leverage** para chamadores e **Locality** para mantenedores.

## Enquadramentos rejeitados

- **Depth como razão entre linhas de implementação e linhas de interface**: recompensa encher a implementação de código. Usamos depth-como-leverage em vez disso.
- **"Interface" como a keyword `interface` do TypeScript ou os métodos públicos de uma classe**: muito estreito — interface aqui inclui todo fato que um chamador precisa saber.
- **"Boundary"**: sobrecarregado com o bounded context do DDD. Diga **seam** ou **interface**.
