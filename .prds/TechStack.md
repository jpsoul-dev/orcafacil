## Stack Tecnológica

O projeto foi construído utilizando tecnologias modernas de nível empresarial, garantindo escalabilidade, segurança e excelente experiência do desenvolvedor:

### **Frontend & Core**
*   **React 19** – A versão estável mais recente, aproveitando os novos recursos de concorrência e hooks avançados.
*   **Next.js 16 (App Router)** – Framework React com renderização híbrida (SSR, SSG, ISR), roteamento otimizado baseado em arquivos e Server Components por padrão.
*   **TypeScript** – Tipagem estática rigorosa para prevenção de bugs em tempo de compilação.

### **Estilização & Design System**
*   **Tailwind CSS v4** – Otimizado para performance extrema, usando a nova engine CSS do Tailwind e variáveis de tema nativas, sem valores arbitrários soltos (*anti-magic values*).
*   **shadcn/ui** – Componentes de interface primitivos e acessíveis, totalmente customizáveis e estilizados via classes utilitárias do Tailwind.
*   **Lucide React** – Conjunto rico de ícones modernos e minimalistas.
*   **Recharts** – Criação de painéis visuais e gráficos responsivos para análise financeira e métricas de conversão.

### **Formulários & Validação**
*   **React Hook Form** – Gerenciamento de estado de formulários performático com renderizações mínimas.
*   **Zod** – Validação de esquemas e inferência de tipos robusta, garantindo a integridade dos dados tanto no cliente quanto no servidor.
*   **@hookform/resolvers** – Integração transparente entre Zod e React Hook Form.
* **datefns** – Manipulação de datas.

### **Backend, Banco de Dados & Infraestrutura (BaaS)**
*   **Supabase** – Backend-as-a-Service (BaaS) alimentado por **PostgreSQL**.
    *   **Supabase Auth & SSR** – Autenticação segura por cookies implementada via `@supabase/ssr`.
    *   **Row Level Security (RLS)** – Regras de segurança no banco de dados para isolamento absoluto de dados entre tenants.
    *   **Supabase Client/Server Clients** – Conexão otimizada no lado do cliente e em Server Components.
*   **Stripe** – Gateway de pagamentos integrado para gerenciamento de assinaturas, planos recorrentes e faturamento de clientes.


---

## Arquitetura de Software

O projeto segue rigorosos princípios de **Clean Code**, **SOLID** e as melhores convenções de desenvolvimento do ecossistema Next.js/React.

### 1. Separação de Responsabilidades (SRP)
*   **Componentes de UI vs Lógica de Negócio**: Componentes visuais mantêm o foco estrito na renderização. Toda e qualquer regra de negócio complexa é delegada para serviços puros.
*   **Camada de Serviços (Services Pattern)**: Localizada em `lib/services/`, é a única responsável pelas regras de negócio e persistência no banco de dados (ex: `UserService`).

### 2. Next.js 16 Server Components & Server Actions
*   **Server Components por Padrão**: Toda página (`page.tsx`) e layout (`layout.tsx`) é tratada como Server Component para maximizar a performance de carregamento inicial e otimizar o SEO. A marcação `"use client"` é restrita exclusivamente aos nós da árvore onde a interatividade (estados locais, efeitos colaterais) é indispensável.
*   **Server Actions Seguras**: Mutações de dados são executadas diretamente via Server Actions de forma extremamente segura. Cada Action é tratada como um endpoint de API tradicional: executa validação da sessão do usuário no servidor e valida a entrada de dados contra um esquema Zod antes de qualquer execução.

### 3. Segurança Multi-Tenant de Ponta a Ponta (*Security-First*)
*   **Row Level Security (RLS)**: Todas as tabelas do banco de dados no Supabase possuem políticas RLS ativas. O acesso direto às linhas é validado pelo token JWT do usuário, prevenindo vazamentos acidentais.
*   **Validação de Data Ownership**: O backend nunca confia cegamente nos IDs enviados pelo cliente. Antes de atualizar ou deletar qualquer registro, o sistema valida rigorosamente se o usuário autenticado é o real proprietário (owner) ou possui permissão de escrita para o `tenant_id` correspondente (*Fail-Safe Defaults*).
*   **Gestão de Segredos**: Ausência completa de chaves privadas ou credenciais no código-fonte (*hardcoded*). Todas as integrações (Supabase Admin, Stripe Secret Keys) usam variáveis de ambiente gerenciadas de forma segura.

### 4. Padrões de Código e Legibilidade
*   **TypeScript Estrito**: Uso estrito do compilador do TypeScript, proibindo expressamente a utilização do tipo `any` para evitar fragilidades na tipagem do código.
*   **Convenção de Nomenclatura**: Todo o código fonte (variáveis, classes, funções e comentários de arquitetura) está em **Inglês**.
    *   Booleans utilizam prefixos autoexplicativos como `is`, `has`, `should` ou `can` (ex: `isActive`, `hasPermission`).
    *   Funções sempre começam com verbos de ação claros (ex: `calculateTotals`, `fetchUserProfile`).
*   **Fail Fast e Early Returns**: Funções tratam erros e desvios rapidamente no início de sua execução, reduzindo o aninhamento desnecessário de ifs (*Callback Hell* ou estruturas piramidais).