# PRD OrçaFacil

**Produto:** OrçaFácil (SaaS Web)
**Objetivo:** MVP para Validação de Geração de Orçamentos(Produtos + Serviços)

## 1. Visão Geral do Produto

O OrçaFácil é uma aplicação web  voltada para MEIs e microempresas. O MVP permitirá que o usuário cadastre sua empresa, registre rapidamente clientes, adicione produtos e serviços (com quantidades e preços) em um orçamento, e gere um link para compartilhamento.

## 2. Personas

1. **Marcos (Dono de oficina mecânica):** Trabalha o dia todo com as mãos sujas, usa o celular para tudo. Precisa enviar orçamentos que incluam peças (produtos com quantidade, ex: 4 litros de óleo) e mão de obra (serviços com valor fixo). Não tem tempo para sistemas complexos.
2. **João (Dono de Ferragista):** Vende apenas produtos físicos. Precisa de agilidade para colocar dezenas de itens no orçamento com unidades de medida diferentes (kg, metros, unidades) e enviar para o mestre de obras aprovar.
3. **Carlos (Cliente Final):** Recebe o orçamento pelo WhatsApp. Quer clicar em um link ou abrir um PDF, ver os dados da empresa (logo, contato), os itens detalhados de forma clara e o valor total em uma interface limpa, preferencialmente pelo próprio celular.

## 3. Requisitos Funcionais

### Épico 1: Onboarding e Configurações

**US01 – Cadastro e Login Simples**
**História:**  Como J**oão (Dono de Ferragista)** eu quero a opção de me cadastrar e fazer login usando meu e-mail e uma senha, ou utilizando login social do google, para que eu tenha um ambiente seguro e isolado para meus dados.

**Critérios de Aceite:**

1. O sistema deve exigir e-mail válido e senha com no mínimo 6 caracteres (somente para login com e-mail e senha).
2. Para login com email e senha deve ser feita confirmação no email para ter acesso liberado.
3. O sistema deve manter o usuário logado (persistência de sessão).
4. Opção de fazer logout para sair da aplicação e poder entrar com outra conta.

**US02 – Configuração do Perfil da Empresa**
**História:**  Como J**oão (Dono de Ferragista)**, eu quero configurar os dados da minha empresa (Logo, Nome, Telefone/WhatsApp, Endereço), para que o cliente veja essas informações no cabeçalho do orçamento.

**Critérios de Aceite:**

1. O usuário deve poder fazer upload de uma imagem (logo) de até 2MB (formatos JPG, PNG).
2. Os campos Nome e Telefone devem ser obrigatórios.

### Épico 2: Cadastros Básicos (Catálogo e Clientes)

**US03a– Manter Cliente**

**História:** Como João (dono de ferragista), eu quero manter o cadastro completo dos meus clientes, para que eu tenha uma base de dados rica para relacionamento e ações de marketing futuras.

**Critérios de Aceite:**

1. O formulário de cadastro/edição deve conter: Nome/Razão Social, CPF/ CNPJ, Gênero (Masculino, Feminino, Não Informado), Data de Nascimento, E-mail (deve ser um e-mail válido), contato, whatsapp.
2. **Integração de Endereço:** Deve conter um campo CEP. Ao digitar um CEP válido, o sistema deve consultar a API do ViaCEP e preencher automaticamente os campos Logradouro, Bairro, Cidade e Estado, deixando apenas Número e Complemento para preenchimento manual.

**US04 – Cadastro de Item no Catálogo (Produto ou Serviço)**
**História:** Como João (dono de ferragista), eu quero poder adicionar itens ao meu catálogo definindo se é Produto ou Serviço, para que eu possa reaproveitá-los em futuros orçamentos.

**Critérios de Aceite:**

1. No formulário deve ser possível selecionar: "Produto" ou "Serviço".
2. Se "Produto": Deve exibir campos de Nome, Valor Unitário, e Unidade de Medida (Un, Kg, L, M, Cx).
3. Se "Serviço": Deve exibir campos de Nome e Valor.
4. O campo Nome deve ser obrigatório para ambos.

### Épico 3: Motor de Orçamentos

**US05– Criação do Cabeçalho do Orçamento**
**História:** Como João (dono de ferragista), eu quero iniciar um novo orçamento selecionando um cliente da minha base e definindo uma data de validade, para que o documento tenha um contexto formal.

**Critérios de Aceite:**

1. O sistema deve gerar um número sequencial único para o orçamento (Ex: ORC-0001).
2. O sistema deve exibir um campo de busca/autocomplete para selecionar um cliente já cadastrado.
3. O campo "Validade do Orçamento" deve vir preenchido por padrão com a data atual + 15 dias, permitindo edição.

**US06 – Adição de Itens ao Orçamento** 
**História:** Como  João (dono de ferragista), eu quero buscar itens do meu catálogo e adicioná-los ao orçamento definindo a quantidade, para que o sistema calcule o subtotal de cada item automaticamente.

**Critérios de Aceite:**

1. O usuário deve poder buscar itens do catálogo digitando o nome.
2. Ao selecionar um item, o usuário deve poder alterar a quantidade,  e o valor unitário pode ser editado pontualmente sem alterar o cadastro original do catálogo.
3. O sistema deve multiplicar Quantidade * Valor Unitário e exibir o Subtotal do item na linha.
- Deve ser possível aplicar um desconto no item % (porcentagem) ou R$ (valor fixo)
- O sistema deve calcular o Total (a soma dos subtotais) do orçamento em tempo real conforme novos itens são adicionados ou removidos.
- Também deve ser possível preencher manualmente um item sem buscar no catálogo

**US07 – Descontos e Observações e forma de pagamento**
**História:** Como João (dono de ferragista), eu quero aplicar um desconto no valor final, selecionar a forma de pagamento e adicionar uma observação (ex: prazo de entrega), para que o orçamento fique alinhado com o que combinei com o cliente.

**Critérios de Aceite:**

1. O sistema deve permitir aplicar desconto em % (porcentagem) ou R$ (valor fixo) sobre o valor Total.
2. O sistema deve exibir um campo de texto livre para "Observações do Orçamento".
3. Permitir selecionar a forma de pagamento acordada (Pix, Dinheiro, Crédito, Débito, Boleto, Cheque)

### Épico 4: Compartilhamento e Visualização

**US08 – Geração de Link Compartilhável**
**História:** Como João (dono de ferragista), eu quero gerar um link público do orçamento recém-criado, para que eu possa enviar ao meu cliente e não precise baixar o orçamento.

**Critérios de Aceite:**

1. O sistema deve gerar uma URL única e não adivinhável (ex: UUID) para visualização pública.
2. O acesso a esse link não deve exigir login do cliente final.
3. A página pública deve ser responsiva e exibir dados do orçamento como informações da empresa, dados do cliente, lista de itens, totais, descontos e observações, validade, número do orçamento.

**US09 – Impressão do orçamento**

**História:** Como Carlos (cliente final) desejo ter a opção de imprimir o orçamento ao abrir pelo link que me foi enviado para que eu posso guardar.

**Critérios de Aceite:**

1. Ter um botão de impressão ao final do orçamento
2. Deve ser preparado para impressão em tamanho A4

## 4. Requisitos Não Funcionais

1. **Responsividade:** O sistema administrativo (área do usuário logado) deve ser responsivo para utilização em telas mobile.
2. **Armazenamento:** As imagens de logotipo devem ser salvas em um storage.
3. **Multi-tenant Seguro:** Isolamento completo de dados entre os diferentes salões (inquilinos) do SaaS.

## 5. Notas de Desenvolvimento e UX

- Desing padrão de SaaS moderno(com sidebar e menus), com técnica de App Shell
- Sempre que desejável utilize a técnica de debounce em campos de busca para otimização de performance.
- Sempre que desejável utilize mascaras de dados para exibir ou incluir dados em formulários (exemplo: cpf, telefone)