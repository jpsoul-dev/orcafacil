import React from 'react'
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import { Receipt, ReceiptQuote } from '@/types/receipt'

interface ReceiptPDFProps {
  receipt: Receipt
  quote: ReceiptQuote
  isStandalone?: boolean
}

const fmt = (valor: number) => {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const fmtData = (iso: string) => {
  if (!iso) return ''
  try {
    const [year, month, day] = iso.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  } catch (e) {
    return iso
  }
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#1e293b',
    backgroundColor: '#ffffff',
    paddingTop: 32,
    paddingLeft: 36,
    paddingRight: 36,
    paddingBottom: 80,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    marginVertical: 10,
  },
  // Seção 1 — Topo (Cabeçalho do Recibo)
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  title: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 32,
    color: '#18181b',
  },
  subTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#4b5563',
    marginTop: 4,
  },
  dateText: {
    fontSize: 9,
    color: '#6b7280',
    marginTop: 8,
  },
  // Seção 2 — Dados do Cliente
  clientSection: {
    marginVertical: 10,
  },
  clientLine: {
    fontSize: 9,
    marginBottom: 4,
    color: '#1f2937',
    lineHeight: 1.2,
  },
  clientLabel: {
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
  },
  clientValue: {
    color: '#374151',
  },
  // Seção 3 — Tabela de Itens (Sem bordas verticais)
  table: {
    marginVertical: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#404040', // neutral-700
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 2,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  tableRowZebra: {
    backgroundColor: '#f9fafb',
  },
  tableCell: {
    fontSize: 8,
    color: '#1f2937',
    lineHeight: 1.2,
  },
  tableCellBold: {
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
  },
  colDesc: { flex: 4.5 },
  colPrice: { flex: 2, textAlign: 'center' },
  colQty: { flex: 1.5, textAlign: 'center' },
  colTotal: { flex: 2, textAlign: 'center' },
  // Seção 4 — Rodapé da Tabela e Valores
  tableSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  paymentMethodText: {
    fontSize: 8,
    color: '#111827',
  },
  paymentMethodLabel: {
    fontFamily: 'Helvetica-Bold',
  },
  paymentMethodValue: {
    textTransform: 'uppercase',
  },
  totalBox: {
    backgroundColor: '#404040',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 2,
  },
  totalText: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
  },
  // Seção 5 — Mensagem de Confirmação
  servicesDescription: {
    marginTop: 20,
    fontSize: 8.5,
    color: '#4b5563',
    lineHeight: 1.4,
  },
  // Seção 6 — Assinatura da Empresa
  signatureSection: {
    position: 'absolute',
    bottom: 40,
    left: 36,
    right: 36,
    alignItems: 'center',
  },
  signatureName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: '#18181b',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  signatureCnpj: {
    fontSize: 8,
    color: '#6b7280',
    marginTop: 3,
  },
  // Seção 7 — Rodapé Fixo do Sistema
  footer: {
    position: 'absolute',
    bottom: 16,
    left: 36,
    right: 36,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 7,
    color: '#a2a7b1ff',
  },
})

export function ReceiptPDF({ receipt, quote, isStandalone = false }: ReceiptPDFProps) {
  // Endereço do cliente formatado
  const customerAddress = [
    quote.customer?.address_street &&
    `${quote.customer.address_street}${quote.customer.address_number ? `, N. ${quote.customer.address_number}` : ''}`,
    quote.customer?.address_neighborhood,
    quote.customer?.address_city &&
    `${quote.customer.address_city}${quote.customer.address_state ? `/${quote.customer.address_state}` : ''}`,
    quote.customer?.address_zip && `CEP: ${quote.customer.address_zip}`,
  ]
    .filter(Boolean)
    .join(', ')

  const customerDocumentLabel = quote.customer?.document?.replace(/\D/g, '').length > 11 ? 'CNPJ' : 'CPF'

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Seção 1 — Topo (Cabeçalho do Recibo) */}
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.title}>Recibo</Text>
            {quote.title ? <Text style={styles.subTitle}>{quote.title}</Text> : null}
          </View>
          <Text style={styles.dateText}>{fmtData(receipt.issued_at)}</Text>
        </View>

        <View style={styles.divider} />

        {/* Seção 2 — Dados do Cliente */}
        <View style={styles.clientSection}>
          <Text style={styles.clientLine}>
            <Text style={styles.clientLabel}>Recebido de: </Text>
            <Text style={styles.clientValue}>{quote.customer?.name}</Text>
          </Text>
          {quote.customer?.document ? (
            <Text style={styles.clientLine}>
              <Text style={styles.clientLabel}>{customerDocumentLabel}: </Text>
              <Text style={styles.clientValue}>{quote.customer.document}</Text>
            </Text>
          ) : null}
          {customerAddress ? (
            <Text style={styles.clientLine}>
              <Text style={styles.clientLabel}>Endereço: </Text>
              <Text style={styles.clientValue}>{customerAddress}</Text>
            </Text>
          ) : null}
        </View>

        {/* Seção 3 — Tabela de Itens */}
        {quote.items && quote.items.length > 0 ? (
          <View style={styles.table}>
            {/* Cabeçalho */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colDesc]}>Descrição</Text>
              <Text style={[styles.tableHeaderCell, styles.colPrice]}>Valor</Text>
              <Text style={[styles.tableHeaderCell, styles.colQty]}>Qtd.</Text>
              <Text style={[styles.tableHeaderCell, styles.colTotal]}>Total</Text>
            </View>

            {/* Linhas */}
            {quote.items.map((item, idx) => {
              const isZebra = idx % 2 !== 0
              return (
                <View
                  key={idx}
                  style={isZebra ? [styles.tableRow, styles.tableRowZebra] : styles.tableRow}
                  wrap={false}
                >
                  <Text style={[styles.tableCell, styles.colDesc]}>{item.item_name}</Text>
                  <Text style={[styles.tableCell, styles.colPrice]}>{fmt(item.unit_price)}</Text>
                  <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
                  <Text style={[styles.tableCell, styles.tableCellBold, styles.colTotal]}>
                    {fmt(item.subtotal)}
                  </Text>
                </View>
              )
            })}
          </View>
        ) : null}

        {/* Seção 4 — Rodapé da Tabela e Valores */}
        <View style={styles.tableSummaryRow} wrap={false}>
          <Text style={styles.paymentMethodText}>
            <Text style={styles.paymentMethodLabel}>Forma de Pagamento: </Text>
            <Text style={styles.paymentMethodValue}>{receipt.payment_method}</Text>
          </Text>
          <View style={styles.totalBox}>
            <Text style={styles.totalText}>Total: {fmt(receipt.amount)}</Text>
          </View>
        </View>

        {/* Seção 5 — Mensagem de Confirmação */}
        {receipt.services_description ? (
          <Text style={styles.servicesDescription} wrap={false}>
            {receipt.services_description}
          </Text>
        ) : null}

        {/* Seção 6 — Assinatura da Empresa */}
        <View style={styles.signatureSection} wrap={false}>
          <Text style={styles.signatureName}>{quote.company?.name || 'Sua Empresa'}</Text>
          {quote.company?.cnpj ? (
            <Text style={styles.signatureCnpj}>CNPJ: {quote.company.cnpj}</Text>
          ) : null}
        </View>

        {/* Seção 7 — Rodapé Fixo do Sistema */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Emitido com orcafacil.com.br</Text>
          <Text style={styles.footerText}>
            {isStandalone ? 'Recibo' : `Orçamento Ref: ${quote.title}`}
          </Text>
        </View>
      </Page>
    </Document>
  )
}
