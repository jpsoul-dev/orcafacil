import { QuotePageContent } from '../../components/quote-page-content'

export default async function EditQuotePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <QuotePageContent id={id} mode="edit" />
}
