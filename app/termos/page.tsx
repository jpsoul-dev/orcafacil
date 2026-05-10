import Link from 'next/link'
import { ArrowLeft, FileText, Shield, Scale, CreditCard, Lock, Zap } from 'lucide-react'

export default function TermosPage() {
  const lastUpdated = "10 de Maio de 2026"

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* Background Decorativo Sutil */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,var(--primary-muted)_0%,transparent_100%)] opacity-20" />
      
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-24 space-y-12">
        {/* Navegação e Cabeçalho */}
        <header className="space-y-6">
          <Link 
            href="/register" 
            className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <div className="p-1 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </div>
            Voltar para o cadastro
          </Link>
          
          <div className="space-y-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
                <Zap className="h-6 w-6 text-white" fill="white" strokeWidth={0} />
              </div>
              <span className="font-bold text-xl tracking-tighter text-primary">OrçaFácil</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Termos de Uso</h1>
            <p className="text-muted-foreground font-medium">Última atualização: {lastUpdated}</p>
          </div>
        </header>

        {/* Conteúdo Legal */}
        <main className="space-y-12">
          {/* Introdução */}
          <section className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-lg leading-relaxed text-muted-foreground">
              Bem-vindo ao OrçaFácil. Estes Termos de Uso regem o seu acesso e utilização da nossa plataforma. Ao utilizar o serviço, você concorda integralmente com as condições aqui estabelecidas.
            </p>
          </section>

          {/* Seções */}
          <div className="grid gap-12">
            <Section 
              icon={<Shield className="h-5 w-5" />} 
              title="1. Aceitação e Elegibilidade"
            >
              <p>
                Para utilizar o OrçaFácil, você deve ser maior de 18 anos ou possuir capacidade legal para contratar em nome de uma pessoa jurídica. O uso da plataforma implica a aceitação irrevogável destes termos.
              </p>
            </Section>

            <Section 
              icon={<FileText className="h-5 w-5" />} 
              title="2. Descrição do Serviço"
            >
              <p>
                O OrçaFácil é um software como serviço (SaaS) que permite a criação, personalização, gestão e envio de orçamentos comerciais. Nós fornecemos as ferramentas técnicas, mas não intervimos nas negociações comerciais entre você e seus clientes.
              </p>
            </Section>

            <Section 
              icon={<Scale className="h-5 w-5" />} 
              title="3. Responsabilidades do Usuário"
            >
              <ul className="list-disc pl-5 space-y-2">
                <li>Você é o único responsável pela veracidade das informações inseridas nos orçamentos.</li>
                <li>Você deve garantir que possui os direitos de uso de marcas e logos carregados na plataforma.</li>
                <li>É proibido o uso da plataforma para fins ilícitos, fraudulentos ou para o envio de spam.</li>
                <li>A segurança da sua senha é de sua exclusiva responsabilidade.</li>
              </ul>
            </Section>

            <Section 
              icon={<Lock className="h-5 w-5" />} 
              title="4. Privacidade e Proteção de Dados (LGPD)"
            >
              <p>
                Tratamos seus dados conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018). 
                Seus dados e os dados de seus clientes são armazenados de forma segura e utilizados estritamente para a prestação do serviço contratado. Não vendemos informações a terceiros.
              </p>
            </Section>

            <Section 
              icon={<CreditCard className="h-5 w-5" />} 
              title="5. Assinaturas e Pagamentos"
            >
              <p>
                O OrçaFácil utiliza modelos de assinatura. Os pagamentos são processados via Stripe. 
                Em caso de atraso, o acesso às funcionalidades premium poderá ser suspenso. Cancelamentos podem ser feitos a qualquer momento pelo painel do usuário, respeitando o ciclo de faturamento atual.
              </p>
            </Section>

            <Section 
              icon={<Shield className="h-5 w-5" />} 
              title="6. Limitação de Responsabilidade"
            >
              <p>
                O OrçaFácil não se responsabiliza por eventuais prejuízos decorrentes de falhas na internet, erros de digitação nos orçamentos ou descumprimento de acordos comerciais entre o usuário e seus clientes finais.
              </p>
            </Section>

            <Section 
              icon={<Scale className="h-5 w-5" />} 
              title="7. Foro e Legislação"
            >
              <p>
                Estes termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca do usuário para dirimir quaisquer controvérsias, respeitando-se as garantias do Código de Defesa do Consumidor (CDC).
              </p>
            </Section>
          </div>
        </main>

        {/* Rodapé da Página de Termos */}
        <footer className="border-t pt-8 text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Dúvidas sobre os termos? Entre em contato pelo e-mail suporte@orcafacil.com
          </p>
          <div className="flex justify-center gap-6 text-xs font-medium text-muted-foreground/60">
            <span>© 2025 OrçaFácil</span>
            <Link href="/privacy" className="hover:text-primary transition-colors">Política de Privacidade</Link>
          </div>
        </footer>
      </div>
    </div>
  )
}

function Section({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3 text-primary">
        <div className="p-2 bg-primary/10 rounded-lg">
          {icon}
        </div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">{title}</h2>
      </div>
      <div className="text-muted-foreground leading-relaxed pl-1">
        {children}
      </div>
    </section>
  )
}
