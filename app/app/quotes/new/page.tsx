import { QuotePageContent } from '../components/quote-page-content'

export default async function NewQuotePage({
  searchParams,
}: {
  searchParams: Promise<{ clone?: string }>
}) {
  const { clone: cloneId } = await searchParams

  return (
    <QuotePageContent
      cloneId={cloneId}
      mode={cloneId ? 'clone' : 'new'}
    />
  )
}
