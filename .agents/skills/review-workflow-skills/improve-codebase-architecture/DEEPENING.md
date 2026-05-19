# Deepening

Como aprofundar um cluster de módulos shallow com segurança, dadas suas dependências. Assume o vocabulário em [LANGUAGE.md](LANGUAGE.md) — **module**, **interface**, **seam**, **adapter**.

## Categorias de dependência

Ao avaliar um candidato para aprofundamento, classifique suas dependências. A categoria determina como o module aprofundado é testado através do seu seam.

### 1. In-process

Computação pura, estado em memória, sem I/O. Sempre passível de aprofundamento — mescle os módulos e teste através da nova interface diretamente. Nenhum adapter necessário.

### 2. Local-substituível

Dependências que possuem substitutos locais para testes (PGLite para Postgres, sistema de arquivos em memória). Passível de aprofundamento se o substituto existir. O module aprofundado é testado com o substituto rodando no conjunto de testes. O seam é interno; nenhuma porta na interface externa do module.

### 3. Remoto mas próprio (Ports & Adapters)

Seus próprios serviços através de uma fronteira de rede (microsserviços, APIs internas). Defina uma **porta** (interface) no seam. O deep module possui a lógica; o transporte é injetado como um **adapter**. Os testes usam um adapter em memória. Produção usa um adapter HTTP/gRPC/fila.

Forma da recomendação: *"Defina uma porta no seam, implemente um adapter HTTP para produção e um adapter em memória para testes, de modo que a lógica fique em um deep module mesmo sendo implantada através de uma rede."*

### 4. Verdadeiramente externo (Mock)

Serviços de terceiros (Stripe, Twilio, etc.) que você não controla. O module aprofundado recebe a dependência externa como uma porta injetada; os testes fornecem um adapter mock.

## Disciplina de seam

- **Um adapter significa um seam hipotético. Dois adapters significa um seam real.** Não introduza uma porta a menos que pelo menos dois adapters sejam justificados (tipicamente produção + teste). Um seam de adapter único é apenas indireção.
- **Seams internos vs seams externos.** Um deep module pode ter seams internos (privados à sua implementação, usados pelos seus próprios testes) além do seam externo na sua interface. Não exponha seams internos pela interface só porque os testes os usam.

## Estratégia de teste: substituir, não empilhar

- Os antigos testes unitários em módulos shallow tornam-se desperdício assim que existem testes na interface do module aprofundado — delete-os.
- Escreva novos testes na interface do module aprofundado. A **interface é a superfície de teste**.
- Os testes afirmam sobre resultados observáveis através da interface, não sobre estado interno.
- Os testes devem sobreviver a refatorações internas — eles descrevem comportamento, não implementação. Se um teste precisa mudar quando a implementação muda, ele está testando além da interface.
