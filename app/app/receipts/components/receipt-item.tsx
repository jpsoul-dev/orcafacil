'use client'

import React from 'react'
import type { ReceiptRow } from '@/types/receipt'
import { Badge } from '@/components/ui/badge'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface ReceiptItemProps {
  receipt: ReceiptRow
}

export function ReceiptItem({ receipt }: ReceiptItemProps) {
  // Formatando a data de emissão de forma a evitar distorções de fuso horário
  const formattedDate = React.useMemo(() => {
    if (!receipt.issued_at) return ''
    try {
      const [year, month, day] = receipt.issued_at.split('-').map(Number)
      return new Date(year, month - 1, day).toLocaleDateString('pt-BR')
    } catch {
      return ''
    }
  }, [receipt.issued_at])

  // Formatando o valor recebido
  const formattedAmount = React.useMemo(() => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(receipt.amount || 0)
  }, [receipt.amount])

  return (
    <Link
      href={`/app/receipts/${receipt.id}`}
      className="group block transition-colors duration-ds-fast hover:bg-muted/40"
    >
      {/* Container Responsivo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
        {/* Lado Esquerdo: Metadados do Recibo (Número + Data) e Título/Cliente */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 flex-1 min-w-0">
          {/* Número e Data de Emissão */}
          <div className="flex items-baseline sm:flex-col sm:justify-center shrink-0 min-w-[80px]">
            <span className="text-xs font-semibold text-foreground tracking-tight">
              {receipt.receipt_number}
            </span>
            <span className="text-[11px] text-muted-foreground ml-2 sm:ml-0 font-medium">
              {formattedDate}
            </span>
          </div>

          {/* Título / Descrição e Nome do Cliente */}
          <div className="min-w-0 flex-1">
            <h3 className="text-ds-body-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {receipt.title || 'Sem título'}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 truncate font-medium">
              {receipt.customer_name || 'Cliente não associado'}
            </p>
          </div>
        </div>

        {/* Lado Direito: Valor Total, Tipo Badge e Chevron */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 mt-1 sm:mt-0">
          <span className="text-ds-body-sm font-bold text-foreground sm:text-right min-w-[90px] tabular-nums">
            {formattedAmount}
          </span>
          <div className="flex items-center justify-end min-w-[90px]">
            <Badge
              variant={receipt.receipt_type === 'standalone' ? 'outline' : 'secondary'}
              className="rounded-sm font-semibold text-[10px] uppercase shadow-none border border-border"
            >
              {receipt.receipt_type === 'standalone' ? 'Avulso' : `Orc. #${receipt.quote_number}`}
            </Badge>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
        </div>
      </div>
    </Link>
  )
}
