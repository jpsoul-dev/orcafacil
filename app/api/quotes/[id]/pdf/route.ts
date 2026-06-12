import { NextRequest, NextResponse } from 'next/server'
import React from 'react'
import { renderToBuffer, DocumentProps } from '@react-pdf/renderer'
import { getQuoteDetails } from '@/lib/services/quote-service'
import { QuotePDF } from '@/components/quote-pdf'
import { logger } from '@/lib/logger'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'id_required', message: 'O ID do orçamento é obrigatório.' },
        { status: 400 }
      )
    }

    // Busca o orçamento de forma segura (utilizando RLS do Supabase integrado)
    const quote = await getQuoteDetails(id)

    if (!quote) {
      return NextResponse.json(
        { error: 'not_found', message: 'Orçamento não encontrado ou acesso não autorizado.' },
        { status: 404 }
      )
    }

    // Renderiza o componente PDF para buffer
    const element = React.createElement(QuotePDF, { quote }) as unknown as React.ReactElement<DocumentProps>
    const buffer = await renderToBuffer(element)

    // Verifica se é para forçar o download
    const { searchParams } = new URL(request.url)
    const download = searchParams.get('download') === 'true'
    const dispositionType = download ? 'attachment' : 'inline'

    // Formata o nome do arquivo
    const filename = `orcamento-${quote.quote_number}.pdf`

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${dispositionType}; filename="${filename}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    })
  } catch (error) {
    logger.error('API [PDF]: Erro crítico ao gerar PDF do orçamento:', error)
    return NextResponse.json(
      { error: 'internal_error', message: 'Ocorreu um erro interno ao gerar o PDF.' },
      { status: 500 }
    )
  }
}
