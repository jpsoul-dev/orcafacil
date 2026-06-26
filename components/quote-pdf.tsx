import React from 'react'
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import Html from 'react-pdf-html'
import { Quote } from '@/types/quote'

interface QuotePDFProps {
  quote: Quote
}

const fmt = (valor: number) => {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const fmtData = (iso: string) => {
  if (!iso) return ''
  try {
    const date = new Date(iso)
    if (isNaN(date.getTime())) return iso
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
    borderBottomColor: '#cbd5e1',
    marginVertical: 10,
  },
  // Seção 1 — Cabeçalho da Empresa
  companyHeader: {
    marginBottom: 6,
    textAlign: 'left',
  },
  companyName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 18,
    color: '#18181b',
    marginBottom: 4,
  },
  companyContact: {
    fontSize: 8,
    color: '#4b5563',
    marginBottom: 2,
    lineHeight: 1.2,
  },
  // Seção 2 — Identificação do Orçamento
  quoteIdent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginVertical: 8,
  },
  quoteTitleBox: {
    flex: 1,
  },
  quoteTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 24,
    color: '#18181b',
  },
  quoteDescription: {
    fontSize: 9,
    fontFamily: 'Helvetica-Oblique',
    color: '#4b5563',
    marginTop: 4,
    lineHeight: 1.2,
  },
  quoteNumberBox: {
    alignItems: 'flex-end',
  },
  quoteNumber: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 16,
    color: '#18181b',
  },
  quoteValidity: {
    fontSize: 8,
    color: '#4b5563',
    marginTop: 6,
  },
  quoteValidityBold: {
    fontFamily: 'Helvetica-Bold',
    color: '#18181b',
  },
  // Seção 3 — Dados do Cliente
  clientSection: {
    marginVertical: 10,
  },
  clientLine: {
    fontSize: 8.5,
    marginBottom: 4,
    color: '#1e293b',
    lineHeight: 1.2,
  },
  clientLabel: {
    fontFamily: 'Helvetica-Bold',
    color: '#18181b',
  },
  clientValue: {
    color: '#374151',
  },
  // Seção 4 — Tabela de Itens (Estilo Premium sem bordas verticais)
  table: {
    marginVertical: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#18181b',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 2,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 4,
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
  tableCellSub: {
    fontSize: 7,
    color: '#9ca3af',
    marginTop: 2,
  },
  colDesc: { flex: 4 },
  colPrice: { flex: 2, textAlign: 'right', paddingRight: 8 },
  colQty: { flex: 1, textAlign: 'center' },
  colTotal: { flex: 2, textAlign: 'right' },
  // Contador
  itemCount: {
    fontSize: 8,
    color: '#6b7280',
    textAlign: 'right',
    marginTop: 4,
    marginBottom: 8,
  },
  itemCountBold: {
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
  },
  // Seção 5 — Pagamento e Totais
  totalsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginVertical: 8,
  },
  termsColumn: {
    flex: 1,
    marginRight: 24,
  },
  termsBlock: {
    marginBottom: 10,
  },
  termsLabel: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  termsValue: {
    fontSize: 8,
    color: '#4b5563',
    lineHeight: 1.2,
  },
  totalsColumn: {
    width: 220,
    borderWidth: 1,
    borderColor: '#18181b',
    padding: 10,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    marginBottom: 4,
  },
  totalsLabel: {
    color: '#6b7280',
  },
  totalsValue: {
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
  },
  discountLabel: {
    color: '#16a34a',
    fontFamily: 'Helvetica-Bold',
  },
  discountValue: {
    color: '#16a34a',
    fontFamily: 'Helvetica-Bold',
  },
  totalsFinalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 10,
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#18181b',
  },
  totalsFinalLabel: {
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
  },
  totalsFinalValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    color: '#111827',
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
  // Seção 7 — Rodapé Fixo
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

export function QuotePDF({ quote }: QuotePDFProps) {
  // Processamento de contatos da empresa
  const companyContacts = [
    quote.company?.phone && `Tel: ${quote.company.phone}`,
    quote.company?.whatsapp && `Whats: ${quote.company.whatsapp}`,
    quote.company?.email && `Email: ${quote.company.email}`,
  ].filter(Boolean).join(' | ')

  // Processamento de endereço da empresa
  const addressParts = [
    quote.company?.address_street && `${quote.company.address_street}${quote.company.address_number ? `, N. ${quote.company.address_number}` : ''}${quote.company.address_complement ? ` - ${quote.company.address_complement}` : ''}`,
    quote.company?.address_neighborhood,
    quote.company?.address_city && `${quote.company.address_city}${quote.company.address_state ? `/${quote.company.address_state}` : ''}`,
    quote.company?.address_zip && `CEP: ${quote.company.address_zip}`,
  ].filter(Boolean).join(', ')

  // Processamento de contatos do cliente
  const customerContacts = [
    quote.customer?.phone && quote.customer.phone,
    quote.customer?.whatsapp && quote.customer.whatsapp,
    quote.customer?.email,
  ].filter(Boolean).join(' | ')

  // Processamento de formas de pagamento
  const paymentMethodsString = (() => {
    if (!quote.payment_method) return ''
    if (Array.isArray(quote.payment_method)) {
      return quote.payment_method.filter(Boolean).join(' | ')
    }
    return quote.payment_method
  })()

  // Contador total de itens
  const totalItemsCount = quote.items?.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0) || 0

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Seção 1 — Cabeçalho da Empresa */}
        <View style={styles.companyHeader}>
          <Text style={styles.companyName}>{quote.company?.name || 'Sua Empresa'}</Text>
          {companyContacts ? <Text style={styles.companyContact}>{companyContacts}</Text> : null}
          {addressParts ? <Text style={styles.companyContact}>Endereço: {addressParts}</Text> : null}
        </View>

        <View style={styles.divider} />

        {/* Seção 2 — Identificação do Orçamento */}
        <View style={styles.quoteIdent}>
          <View style={styles.quoteTitleBox}>
            <Text style={styles.quoteTitle}>Orçamento</Text>
            {quote.title ? <Text style={styles.quoteDescription}>{quote.title}</Text> : null}
          </View>
          <View style={styles.quoteNumberBox}>
            {quote.show_quote_number ? (
              <Text style={styles.quoteNumber}>N° {quote.quote_number}</Text>
            ) : null}
            <Text style={styles.quoteValidity}>
              Válido até:{' '}
              <Text style={styles.quoteValidityBold}>
                {quote.valid_until ? fmtData(quote.valid_until) : 'A combinar'}
              </Text>
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Seção 3 — Dados do Cliente */}
        <View style={styles.clientSection}>
          <Text style={styles.clientLine}>
            <Text style={styles.clientLabel}>Orçamento para: </Text>
            <Text style={styles.clientValue}>{quote.customer?.name || '---'}</Text>
          </Text>
          {quote.customer?.document ? (
            <Text style={styles.clientLine}>
              <Text style={styles.clientLabel}>CPF/CNPJ: </Text>
              <Text style={styles.clientValue}>{quote.customer.document}</Text>
            </Text>
          ) : null}
          {customerContacts ? (
            <Text style={styles.clientLine}>
              <Text style={styles.clientLabel}>Contatos: </Text>
              <Text style={styles.clientValue}>{customerContacts}</Text>
            </Text>
          ) : null}
        </View>

        {/* Seção 4 — Tabela de Itens */}
        <View style={styles.table}>
          {/* Cabeçalho */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colDesc]}>Descrição</Text>
            <Text style={[styles.tableHeaderCell, styles.colPrice]}>Valor</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Qtd.</Text>
            <Text style={[styles.tableHeaderCell, styles.colTotal]}>Total</Text>
          </View>

          {/* Linhas */}
          {quote.items?.map((item, idx) => {
            const isZebra = idx % 2 !== 0
            const discountInMoney = item.discount_value && Number(item.discount_value) > 0
              ? (item.discount_type === 'percentage'
                ? (item.quantity * item.unit_price) * ((item.discount_value || 0) / 100)
                : (item.discount_value || 0))
              : 0

            return (
              <View
                key={idx}
                style={isZebra ? [styles.tableRow, styles.tableRowZebra] : styles.tableRow}
                wrap={false}
              >
                <Text style={[styles.tableCell, styles.colDesc]}>{item.item_name}</Text>
                <Text style={[styles.tableCell, styles.colPrice]}>{fmt(item.unit_price)}</Text>
                <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
                <View style={[styles.colTotal]}>
                  <Text style={[styles.tableCell, styles.tableCellBold]}>{fmt(item.subtotal)}</Text>
                  {discountInMoney > 0 ? (
                    <Text style={styles.tableCellSub}>(- {fmt(discountInMoney)})</Text>
                  ) : null}
                </View>
              </View>
            )
          })}
        </View>

        {/* Contador de Itens */}
        <Text style={styles.itemCount}>
          Total de itens: <Text style={styles.itemCountBold}>{totalItemsCount}</Text>
        </Text>

        {/* Seção 5 — Pagamento e Totais */}
        <View style={styles.totalsSection} wrap={false}>
          {/* Coluna Esquerda: Formas de Pagamento e Notas */}
          <View style={styles.termsColumn}>
            {paymentMethodsString ? (
              <View style={styles.termsBlock}>
                <Text style={styles.termsLabel}>Formas de Pagamento</Text>
                <Text style={styles.termsValue}>{paymentMethodsString}</Text>
              </View>
            ) : null}
            {quote.notes ? (
              <View style={styles.termsBlock}>
                <Text style={styles.termsLabel}>Termos e Condições</Text>
                <Html 
                  stylesheet={{
                    p: { fontSize: 8, color: '#4b5563', lineHeight: 1.2, margin: 0, padding: 0 },
                    strong: { fontWeight: 'bold' },
                    em: { fontStyle: 'italic' },
                    ul: { paddingLeft: 10, margin: 0, padding: 0 },
                    ol: { paddingLeft: 10, margin: 0, padding: 0 },
                    li: { fontSize: 8, color: '#4b5563', lineHeight: 1.2, margin: 0, padding: 0 },
                  }}
                >
                  {quote.notes}
                </Html>
              </View>
            ) : null}
          </View>

          {/* Coluna Direita: Caixa de Totais */}
          <View style={styles.totalsColumn}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Valor itens</Text>
              <Text style={styles.totalsValue}>{fmt(quote.subtotal)}</Text>
            </View>

            {quote.discount_value > 0 ? (
              <View style={styles.totalsRow}>
                <Text style={styles.discountLabel}>Desconto</Text>
                <Text style={styles.discountValue}>
                  - {fmt(
                    quote.discount_type === 'percentage'
                      ? quote.subtotal * (quote.discount_value / 100)
                      : quote.discount_value
                  )}
                </Text>
              </View>
            ) : null}

            <View style={styles.totalsFinalRow}>
              <Text style={styles.totalsFinalLabel}>Valor final</Text>
              <Text style={styles.totalsFinalValue}>{fmt(quote.total)}</Text>
            </View>
          </View>
        </View>

        {/* Seção 6 — Assinatura da Empresa */}
        <View style={styles.signatureSection} wrap={false}>
          <Text style={styles.signatureName}>{quote.company?.name || 'Sua Empresa'}</Text>
          {quote.company?.cnpj ? (
            <Text style={styles.signatureCnpj}>CNPJ/CPF: {quote.company.cnpj}</Text>
          ) : null}
        </View>

        {/* Seção 7 — Rodapé Fixo do Sistema */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Criado por Orca Fácil</Text>
          <Text style={styles.footerText}>
            Emitido em {new Date(quote.created_at).toLocaleDateString('pt-BR')}
          </Text>
        </View>
      </Page>
    </Document>
  )
}
