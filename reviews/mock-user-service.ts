// @ts-nocheck
// mock-user-service.ts
// Este arquivo é uma simulação contendo falhas graves de arquitetura, TypeScript e segurança
// para fins de teste da skill de code-review.

import { createClient } from '@supabase/supabase-js';

// Declaração local de process para resolver limitações de escopo do compilador TS no editor
declare const process: {
  env: {
    NEXT_PUBLIC_SUPABASE_URL?: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
  };
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// VIOLAÇÃO 1: Uso de 'any' para tipagem de parâmetros e retornos
// VIOLAÇÃO 2: Nome de função abreviado e pouco descritivo (getUsr)
export async function getUsr(id: any): Promise<any> {
  // VIOLAÇÃO 3: Falta de tratamento de erro (try/catch ausente)
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  return data;
}

// VIOLAÇÃO 4: Booleanos sem prefixo adequado ('is', 'has', etc.) e nome abreviado (usrAtivo)
export let usrAtivo = false;

// VIOLAÇÃO 5: Falta de validação de propriedade de dados (Multi-Tenant Leak / RLS bypass em nível de aplicação)
// Atualiza os dados de faturamento sem checar se o usuário de fato é o dono da conta ou pertence ao tenant correto!
export async function updateBilling(id: string, payload: any) {
  try {
    // VIOLAÇÃO 6: Mais de 3 níveis de aninhamento (sem Early Returns)
    if (id) {
      if (payload) {
        if (payload.amount > 0) {
          if (payload.currency === 'BRL') {
            const { data, error } = await supabase
              .from('billing_records')
              .update({ amount: payload.amount, currency: payload.currency })
              .eq('id', id); // Perigo! Só filtra por id do registro, permitindo que outro tenant altere dados se adivinhar o ID!
            
            if (error) {
              console.error(error);
            }
            return data;
          }
        }
      }
    }
  } catch (error: any) {
    // VIOLAÇÃO 7: Catch engolindo erro sem tratamento ou log estruturado
    console.log("Erro");
  }
}

// VIOLAÇÃO 8: Valores arbitrários de CSS e falta de responsividade (Tailwind CSS v4 anti-patterns)
// UI misturada na camada de serviço (Violação de SRP)
export function UserBadge({ active }: { active: boolean }) {
  // VIOLAÇÃO 9: h-[47px] bg-[#f3a123] p-[13px] são valores arbitrários
  return `
    <div class="h-[47px] w-[230px] bg-[#f3a123] p-[13px] rounded-lg">
      Status: ${active ? 'Active' : 'Inactive'}
    </div>
  `;
}
