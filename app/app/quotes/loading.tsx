import { SkeletonLoader } from './components/skeleton-loader'

export default function QuotesLoading() {
  return (
    <div className="animate-in fade-in duration-500">
      <SkeletonLoader />
    </div>
  )
}

