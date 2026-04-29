'use client'

import { DataTable } from '@/components/ui/data-table'
import { columns as quoteColumns } from '../../quotes/columns'
import { FileText } from 'lucide-react'

export function CustomerQuotesClient({ quotes }: { quotes: any[] }) {
  // Filtrar colunas para não mostrar o cliente (já estamos na ficha dele)
  const filteredColumns = quoteColumns.filter(col => 
    (col as any).accessorKey !== 'customer'
  )

  if (!quotes || quotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
          <FileText className="h-6 w-6" />
        </div>
        <h4 className="font-medium text-slate-900">Nenhum orçamento encontrado</h4>
        <p className="text-sm text-slate-500 mt-1 max-w-[250px]">
          Este cliente ainda não possui orçamentos registrados.
        </p>
      </div>
    )
  }

  return (
    <DataTable 
      columns={filteredColumns as any} 
      data={quotes} 
    />
  )
}
