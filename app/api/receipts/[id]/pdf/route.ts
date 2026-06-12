import { NextRequest, NextResponse } from 'next/server'
import React from 'react'
import { renderToBuffer, DocumentProps } from '@react-pdf/renderer'
import { createClient } from '@/lib/supabase/server'
import { getReceiptDetails } from '@/lib/services/receipt-service'
import { ReceiptPDF } from '@/components/receipt-pdf'
import { logger } from '@/lib/logger'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'id_required', message: 'O ID do recibo é obrigatório.' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'Usuário não autenticado.' },
        { status: 401 }
      )
    }

    // Busca o recibo e dados consolidados
    const details = await getReceiptDetails(id, user.id)

    if (!details) {
      return NextResponse.json(
        { error: 'not_found', message: 'Recibo não encontrado ou acesso não autorizado.' },
        { status: 404 }
      )
    }

    const { receipt, quote } = details
    const isStandalone = quote.quote_number === 0

    // Renderiza o PDF
    const element = React.createElement(ReceiptPDF, {
      receipt,
      quote,
      isStandalone,
    }) as unknown as React.ReactElement<DocumentProps>

    const buffer = await renderToBuffer(element)

    // Configuração de download ou inline
    const { searchParams } = new URL(request.url)
    const download = searchParams.get('download') === 'true'
    const dispositionType = download ? 'attachment' : 'inline'

    const filename = `recibo-${receipt.receipt_number}.pdf`

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${dispositionType}; filename="${filename}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    })
  } catch (error) {
    logger.error('API [RECEIPT-PDF]: Erro crítico ao gerar PDF do recibo:', error)
    return NextResponse.json(
      { error: 'internal_error', message: 'Ocorreu um erro interno ao gerar o PDF.' },
      { status: 500 }
    )
  }
}
